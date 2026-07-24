import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const allowedFiles = new Set([
  'apps/docs/docusaurus.config.ts',
  'packages/site-config/src/resolve.ts',
]);

const sourceExtension = /\.(?:js|ts|tsx)$/u;
const profileEnvRead = new RegExp(
  String.raw`process\s*(?:\.\s*env|\[\s*['"]env['"]\s*\])\s*(?:\.\s*ZDOC_SITE|\[\s*['"]ZDOC_SITE['"]\s*\])`,
  'u',
);

export function findProfileEnvViolations(repositoryRoot) {
  const tracked = execFileSync('git', ['ls-files', '-z'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  }).split('\0').filter(Boolean);

  return tracked
    .filter(file => sourceExtension.test(file) && !allowedFiles.has(file))
    .filter(file => profileEnvRead.test(fs.readFileSync(path.join(repositoryRoot, file), 'utf8')))
    .sort();
}

export function checkProfileEnv(repositoryRoot = process.cwd()) {
  const violations = findProfileEnvViolations(repositoryRoot);
  if (violations.length > 0) {
    throw new Error(
      `ZDOC_SITE may only be read by the site-profile bootstrap:\n${violations.map(file => `- ${file}`).join('\n')}`,
    );
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : undefined;
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    checkProfileEnv();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
