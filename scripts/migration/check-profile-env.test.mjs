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

test('allows only the profile bootstrap, resolver, and controlled build injection boundary', () => {
  const root = fixture({
    'apps/docs/docusaurus.config.ts': `export default ${forbiddenRead};\n`,
    'packages/site-config/src/resolve.ts': `export const site = ${forbiddenRead};\n`,
    'scripts/build/run-with-publication-read-fence.mjs': `spawn('docusaurus', [], {env: {...process.env, ZDOC_SITE: 'en'}});\n`,
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

test('fails closed on exact static key literals across module formats without dataflow analysis', () => {
  const root = fixture({
    'src/process-alias.mjs': [
      'const proc = globalThis.process;',
      'const procAgain = proc;',
      'const environment = procAgain.env;',
      'const key = "ZDOC_SITE";',
      'const keyAgain = key;',
      'export const site = environment[keyAgain];',
    ].join('\n'),
    'src/env-alias.cjs': [
      'const proc = process;',
      'const env = proc["env"];',
      'module.exports = env.ZDOC_SITE;',
    ].join('\n'),
    'src/optional.js': 'export const site = globalThis.process?.env?.ZDOC_SITE;\n',
  });
  assert.deepEqual(findProfileEnvViolations(root), [
    'src/env-alias.cjs',
    'src/optional.js',
    'src/process-alias.mjs',
  ]);
});

test('fails closed on lexical aliases instead of trying to prove their origin', () => {
  const root = fixture({
    'src/shadowed.ts': [
      'function read(process: {env: Record<string, string>}) {',
      '  const env = process.env;',
      '  return env.ZDOC_SITE;',
      '}',
      'function readEnvironment(env: Record<string, string>) {',
      '  return env.ZDOC_SITE;',
      '}',
    ].join('\n'),
  });
  assert.deepEqual(findProfileEnvViolations(root), ['src/shadowed.ts']);
});

test('fails closed on assignments, destructuring assignments, holders, and returned objects', () => {
  const root = fixture({
    'src/assignment.js': 'let site; site.ZDOC_SITE = "en";\n',
    'src/destructure-assignment.ts': 'let site; ({ZDOC_SITE: site} = loadConfig());\n',
    'src/holder.mjs': 'const holder = getHolder(); export const site = holder.ZDOC_SITE;\n',
    'src/returned.cjs': 'module.exports = getEnvironment().ZDOC_SITE;\n',
    'src/variable.tsx': 'const ZDOC_SITE = "en"; export default ZDOC_SITE;\n',
  });
  assert.deepEqual(findProfileEnvViolations(root), [
    'src/assignment.js',
    'src/destructure-assignment.ts',
    'src/holder.mjs',
    'src/returned.cjs',
    'src/variable.tsx',
  ]);
});

test('evaluates static computed keys but ignores ordinary descriptive strings', () => {
  const root = fixture({
    'src/computed-literal.ts': "export const site = holder['ZDOC_SITE'];\n",
    'src/computed-template.ts': 'export const site = holder[`ZDOC_SITE`];\n',
    'src/computed-concat.ts': "export const site = holder['ZDOC_' + 'SITE'];\n",
    'src/computed-binding.ts': "const {['ZDOC_' + 'SITE']: site} = holder;\n",
    'src/description.ts': [
      "export const description = 'ZDOC_SITE selects a documentation profile';",
      '// ZDOC_SITE is described here, but never executed.',
    ].join('\n'),
    'src/exact-string.ts': "export const key = 'ZDOC_SITE';\n",
    'src/exact-template.ts': 'export const key = `ZDOC_SITE`;\n',
    'src/ignored.test.ts': 'export const site = holder.ZDOC_SITE;\n',
    'scripts/migration/check-profile-env.mjs': 'export const site = holder.ZDOC_SITE;\n',
  });
  assert.deepEqual(findProfileEnvViolations(root), [
    'src/computed-binding.ts',
    'src/computed-concat.ts',
    'src/computed-literal.ts',
    'src/computed-template.ts',
    'src/exact-string.ts',
    'src/exact-template.ts',
  ]);
});
