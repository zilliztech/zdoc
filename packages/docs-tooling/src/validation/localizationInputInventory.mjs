import path from 'node:path';

export function compareBinary(left, right) {
  return Buffer.compare(Buffer.from(left), Buffer.from(right));
}

export function pathInRoot(relativePath, root) {
  return relativePath === root || relativePath.startsWith(`${root}/`);
}

export function releaseInputDefinition(site) {
  if (site === 'en') {
    return {
      roots: ['generated/en/sidebars', 'i18n/ja-JP'],
      required: ['.translation-cache/ja-JP.json'],
    };
  }
  return {
    roots: [],
    required: ['generated/zh-CN/sidebars/tools.sidebar.js'],
  };
}

export function isInputPath(relativePath, definition) {
  return definition.required.includes(relativePath)
    || definition.roots.some(root => pathInRoot(relativePath, root));
}

export function assertNoInputPathCollisions(relativePaths) {
  const canonicalPaths = new Map();
  for (const relativePath of relativePaths) {
    const canonicalKey = relativePath.normalize('NFC').toLocaleLowerCase('en-US');
    const existing = canonicalPaths.get(canonicalKey);
    if (existing && existing !== relativePath) {
      throw new Error(`Localization input canonical path collision: ${existing} and ${relativePath}`);
    }
    canonicalPaths.set(canonicalKey, relativePath);
  }
}

function assertExactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort(compareBinary);
  const wanted = [...expected].sort(compareBinary);
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    throw new Error(`${label} must contain exactly: ${wanted.join(', ')}`);
  }
}

export function parseLocalizationInputInventory(inventory) {
  assertExactKeys(inventory, ['schemaVersion', 'paths'], 'localization tracked inventory');
  if (inventory.schemaVersion !== 1) throw new Error('Localization tracked inventory schemaVersion must be 1');
  if (!Array.isArray(inventory.paths) || inventory.paths.some(entry => typeof entry !== 'string')) {
    throw new Error('Localization tracked inventory paths must be an array of strings');
  }
  const sorted = [...inventory.paths].sort(compareBinary);
  if (JSON.stringify(sorted) !== JSON.stringify(inventory.paths) || new Set(inventory.paths).size !== inventory.paths.length) {
    throw new Error('Localization tracked inventory paths must be unique and binary sorted');
  }
  const definitions = [releaseInputDefinition('en'), releaseInputDefinition('zh-CN')];
  for (const entry of inventory.paths) {
    const normalized = entry.split(path.sep).join('/');
    if (normalized !== entry || path.isAbsolute(entry) || entry.startsWith('../')
      || !definitions.some(definition => isInputPath(entry, definition))) {
      throw new Error(`Localization tracked inventory contains an out-of-scope path: ${entry}`);
    }
  }
  assertNoInputPathCollisions(inventory.paths);
  return inventory.paths;
}
