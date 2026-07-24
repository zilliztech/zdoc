import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {findProfileEnvViolations} from './check-profile-env.mjs';

function fixture(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'profile-env-'));
  execFileSync('git', ['init', '-q'], {cwd: root});
  for (const [name, contents] of Object.entries(files)) {
    const target = path.join(root, name);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, contents);
  }
  execFileSync('git', ['add', '.'], {cwd: root});
  return root;
}

const forbiddenRead = ['process', 'env', 'ZDOC_SITE'].join('.');

test('allows the profile bootstrap and resolver only', () => {
  const root = fixture({
    'apps/docs/docusaurus.config.ts': `export default ${forbiddenRead};\n`,
    'packages/site-config/src/resolve.ts': `export const site = ${forbiddenRead};\n`,
    'src/other.ts': 'export const safe = true;\n',
  });
  assert.deepEqual(findProfileEnvViolations(root), []);
});

test('finds direct and bracketed reads in tracked source without flagging detector text', () => {
  const root = fixture({
    'src/direct.ts': `export const site = ${forbiddenRead};\n`,
    'src/bracket.tsx': `export const site = ${['process', "['env']", "['ZDOC_SITE']"].join('')};\n`,
    'src/ignored.md': forbiddenRead,
    'scripts/migration/check-profile-env.mjs': "const pieces = ['process', 'env'];\n",
  });
  assert.deepEqual(findProfileEnvViolations(root), ['src/bracket.tsx', 'src/direct.ts']);
});

test('finds destructured profile environment reads including aliases and nested patterns', () => {
  const root = fixture({
    'src/destructure.ts': 'const {ZDOC_SITE} = process.env;\n',
    'src/alias.ts': 'const {ZDOC_SITE: site} = process.env;\n',
    'src/bracket-env.ts': "const {ZDOC_SITE: site} = process['env'];\n",
    'src/nested.tsx': 'const {env: {ZDOC_SITE}} = process;\n',
  });
  assert.deepEqual(findProfileEnvViolations(root), [
    'src/alias.ts',
    'src/bracket-env.ts',
    'src/destructure.ts',
    'src/nested.tsx',
  ]);
});

test('ignores profile environment spellings in strings and comments', () => {
  const root = fixture({
    'src/text.ts': [
      "const direct = 'process.env.ZDOC_SITE';",
      "const destructured = 'const {ZDOC_SITE} = process.env';",
      '// process.env.ZDOC_SITE',
      '/* const {env: {ZDOC_SITE}} = process; */',
    ].join('\n'),
  });
  assert.deepEqual(findProfileEnvViolations(root), []);
});
