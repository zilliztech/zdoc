import {createHash} from 'node:crypto';
import {readFileSync, readdirSync} from 'node:fs';
import {relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

export function hashSkillTree(directory) {
  const root = resolve(directory);
  const files = walk(root).sort();
  if (files.length === 0) throw new Error(`Skill directory is empty: ${root}`);
  const hash = createHash('sha256');
  for (const path of files) {
    const relativePath = relative(root, path).split(sep).join('/');
    const content = readFileSync(path);
    hash.update(`${Buffer.byteLength(relativePath)}:`);
    hash.update(relativePath);
    hash.update(`${content.length}:`);
    hash.update(content);
  }
  return hash.digest('hex');
}

function walk(directory) {
  return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Skill tree must not contain symlinks: ${path}`);
    if (entry.isDirectory()) return walk(path);
    if (!entry.isFile()) throw new Error(`Skill tree contains a non-file entry: ${path}`);
    return [path];
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3) throw new Error('Usage: node scripts/hash-skill-tree.mjs <skill-directory>');
  process.stdout.write(`${hashSkillTree(process.argv[2])}\n`);
}
