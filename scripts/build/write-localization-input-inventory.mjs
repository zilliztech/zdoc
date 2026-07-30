import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  localizationInputInventoryFile,
  localizationInputInventoryPaths,
} from './write-provenance.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outputPath = path.join(repositoryRoot, localizationInputInventoryFile);
const bytes = `${JSON.stringify({
  schemaVersion: 1,
  paths: localizationInputInventoryPaths(repositoryRoot),
}, null, 2)}\n`;

if (process.argv.length > 3 || (process.argv[2] && process.argv[2] !== '--check')) {
  throw new Error('Usage: write-localization-input-inventory.mjs [--check]');
}

if (process.argv[2] === '--check') {
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
  if (current !== bytes) {
    throw new Error(`Localization input inventory is stale; run pnpm generate:localization-input-inventory`);
  }
} else {
  fs.writeFileSync(outputPath, bytes);
}
