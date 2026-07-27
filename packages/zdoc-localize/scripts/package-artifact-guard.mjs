import {execFileSync} from 'node:child_process';
import {mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distAdapters = join(packageDir, 'dist', 'adapters');
const sentinel = join(distAdapters, 'retired-writer-sentinel.js');
const temp = mkdtempSync(join(tmpdir(), 'zdoc-localize-artifact-'));

try {
  mkdirSync(distAdapters, {recursive: true});
  writeFileSync(sentinel, "const retired = ['docs', '+update', 'block_insert_after', 'feishu-md-sync'];\n");
  execFileSync('pnpm', ['pack', '--pack-destination', temp], {cwd: packageDir, stdio: 'inherit'});
  const archiveName = readdirSync(temp).find((name) => name.endsWith('.tgz'));
  if (!archiveName) throw new Error('pnpm pack did not produce a tarball.');
  const archive = join(temp, archiveName);
  const entries = execFileSync('tar', ['-tf', archive], {encoding: 'utf8'}).trim().split('\n').filter(Boolean);
  const required = [
    'package/dist/cli/index.js',
    'package/dist/adapters/lark-document-creation-adapter.js',
    'package/dist/adapters/lark-legacy-document-reader.js',
    'package/dist/adapters/lark-whiteboard-reader.js',
  ];
  const retired = [
    'package/dist/adapters/feishu-md-sync-adapter.js',
    'package/dist/adapters/lark-docs-adapter.js',
    'package/dist/adapters/lark-whiteboard-adapter.js',
    'package/dist/adapters/retired-writer-sentinel.js',
  ];
  for (const file of required) if (!entries.includes(file)) throw new Error(`Packed artifact is missing ${file}.`);
  for (const file of retired) if (entries.includes(file)) throw new Error(`Packed artifact retained ${file}.`);

  const forbidden = [
    /(['"])docs\1\s*,\s*(['"])[+]update\2/,
    /block_replace/,
    /block_insert_after/,
    /block_delete/,
    /(['"])whiteboard\1\s*,\s*(['"])[+]update\2/,
    /feishu-md-sync/,
    /\.replaceBlock\s*\(/,
    /\.insertAfter\s*\(/,
    /\.deleteBlocks\s*\(/,
    /\.overwriteRaw\s*\(/,
  ];
  for (const entry of entries.filter((name) => name.endsWith('.js'))) {
    const source = execFileSync('tar', ['-xOf', archive, entry], {encoding: 'utf8'});
    const matched = forbidden.find((pattern) => pattern.test(source));
    if (matched) throw new Error(`Packed artifact ${entry} contains retired writer pattern ${matched}.`);
  }
  process.stdout.write(`${JSON.stringify({ok: true, archive: archiveName, entries: entries.length})}\n`);
} finally {
  rmSync(sentinel, {force: true});
  rmSync(temp, {recursive: true, force: true});
}
