import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import {hashSkillTree} from './hash-skill-tree.mjs';

const expected = {
  node: 'v24.15.0',
  pnpm: '10.11.0',
  npm: '11.18.0',
  larkCli: 'lark-cli version 1.0.73',
  packageVersion: '0.2.0',
  sha1: 'f6e21188aea88952d0c2c2ae3d36f3b79369e35d',
  sha256: '74d66198476bb69dfcb78398bcabe381e8593b2d46d8f33af2bf915368ff475c',
  integrity: 'sha512-iykpK+U8mKaEE2KXI1myS20Rj6GSb9jCJDwZi8diHXF/ARv9A3JBmn9SkdSK88NF+JAGEOsJdmDoppDnUBMkCg==',
  skillSha256: 'd5d6b46f8eb1fd96a0f2ca515d3760d45079b7d6d6ea9796b02f0ce29c004f53',
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageDir = join(root, 'packages', 'zdoc-localize');
const skillDir = join(root, 'skills', 'zdoc-localization');
const first = mkdtempSync(join(tmpdir(), 'zdoc-localize-release-pack-'));
const second = mkdtempSync(join(tmpdir(), 'zdoc-localize-release-pack-'));

function output(command, args) {
  return execFileSync(command, args, {cwd: root, encoding: 'utf8'}).trim();
}

function digest(algorithm, bytes, encoding = 'hex') {
  return createHash(algorithm).update(bytes).digest(encoding);
}

try {
  const toolchain = {
    node: process.version,
    pnpm: output('pnpm', ['--version']),
    npm: output('npm', ['--version']),
    larkCli: output('lark-cli', ['--version']),
  };
  for (const [key, value] of Object.entries(toolchain)) {
    if (value !== expected[key]) throw new Error(`Release toolchain mismatch for ${key}: expected ${expected[key]}, received ${value}.`);
  }

  execFileSync('pnpm', ['pack', '--pack-destination', first], {cwd: packageDir, stdio: 'pipe'});
  execFileSync('pnpm', ['pack', '--pack-destination', second], {cwd: packageDir, stdio: 'pipe'});
  const archiveName = `zdoc-localize-${expected.packageVersion}.tgz`;
  const firstBytes = readFileSync(join(first, archiveName));
  const secondBytes = readFileSync(join(second, archiveName));
  if (!firstBytes.equals(secondBytes)) throw new Error('Independent release packs are not byte-identical.');

  const actual = {
    sha1: digest('sha1', firstBytes),
    sha256: digest('sha256', firstBytes),
    integrity: `sha512-${digest('sha512', firstBytes, 'base64')}`,
    skillSha256: hashSkillTree(skillDir),
  };
  for (const [key, value] of Object.entries(actual)) {
    if (value !== expected[key]) throw new Error(`Release artifact mismatch for ${key}: expected ${expected[key]}, received ${value}.`);
  }

  process.stdout.write(`${JSON.stringify({ok: true, toolchain, package: {
    version: expected.packageVersion,
    sha1: actual.sha1,
    sha256: actual.sha256,
    integrity: actual.integrity,
  }, skillSha256: actual.skillSha256})}\n`);
} finally {
  rmSync(first, {recursive: true, force: true});
  rmSync(second, {recursive: true, force: true});
}
