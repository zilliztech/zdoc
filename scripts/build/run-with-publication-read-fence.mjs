#!/usr/bin/env node
import {spawn} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  manualRegistry,
  publicationEntries,
  publicationOwnedTargets,
  withAtomicPublicationReads,
} from '../../packages/docs-tooling/src/index.ts';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function publicationSetsForSite(site) {
  if (site !== 'en' && site !== 'zh-CN') throw new Error(`Unsupported documentation site: ${site}`);
  return publicationEntries(manualRegistry)
    .filter(entry => entry.site === site && entry.publication.enabled)
    .map(entry => publicationOwnedTargets(site, entry.publication));
}

export async function withSitePublicationReadFence(root, site, reader) {
  return await withAtomicPublicationReads(root, publicationSetsForSite(site), reader);
}

export async function runBuildWithPublicationReadFence({root = repositoryRoot, site, command, args = [], cwd = process.cwd(), env = process.env, spawnProcess = spawn}) {
  if (typeof command !== 'string' || command.length === 0) throw new Error('A build command is required after --');
  return await withSitePublicationReadFence(root, site, async () => await new Promise((resolve, reject) => {
    const child = spawnProcess(command, args, {
      cwd,
      env: {...env, ZDOC_SITE: site},
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal) reject(new Error(`Build command terminated by ${signal}`));
      else if (code !== 0) reject(new Error(`Build command exited with status ${code}`));
      else resolve();
    });
  }));
}

function parseArgs(argv) {
  const separator = argv.indexOf('--');
  if (separator !== 2 || argv[0] !== '--site' || !argv[1] || separator === argv.length - 1) {
    throw new Error('Usage: run-with-publication-read-fence.mjs --site <en|zh-CN> -- <command> [args...]');
  }
  return {site: argv[1], command: argv[separator + 1], args: argv.slice(separator + 2)};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await runBuildWithPublicationReadFence(parseArgs(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
