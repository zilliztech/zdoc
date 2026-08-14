import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = path.join(root, 'packages/docs-tooling/src/reference/rest/meta/fragment-migration.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const legacyRoot = path.join(root, inventory.legacyRoot);
const httpMethods = new Set(['get', 'put', 'post', 'delete', 'patch', 'options', 'head', 'trace']);

assert.equal(inventory.schemaVersion, '1.0');
assert.ok(Array.isArray(inventory.fragments) && inventory.fragments.length > 0);

const actualFiles = fs.readdirSync(legacyRoot).filter(file => file.endsWith('.json')).sort();
const declaredFiles = inventory.fragments.map(entry => entry.file).sort();
assert.deepEqual(declaredFiles, actualFiles, 'fragment migration inventory must cover the legacy directory exactly');

const services = new Set();
const counts = {'data-plane': 0, 'control-plane': 0};
for (const entry of inventory.fragments) {
  assert.match(entry.service, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(!services.has(entry.service), `duplicate migration service: ${entry.service}`);
  services.add(entry.service);
  assert.ok(Object.hasOwn(counts, entry.apiSurface), `invalid apiSurface for ${entry.file}`);
  assert.ok(inventory.allowedStates.includes(entry.migrationState), `invalid migrationState for ${entry.file}`);

  const spec = JSON.parse(fs.readFileSync(path.join(legacyRoot, entry.file), 'utf8'));
  let operationCount = 0;
  for (const pathItem of Object.values(spec.paths || {})) {
    for (const method of Object.keys(pathItem || {})) {
      if (httpMethods.has(method.toLowerCase())) operationCount++;
    }
  }
  assert.equal(operationCount, entry.operationCount, `operation count drift for ${entry.file}`);

  const identity = spec['x-zdoc-fragment'];
  if (entry.migrationState === 'canonical') {
    assert.deepEqual(identity, {schemaVersion: '1.0', apiSurface: entry.apiSurface, service: entry.service});
  } else {
    assert.equal(identity, undefined, `${entry.file} has canonical identity but migrationState is ${entry.migrationState}`);
  }
  counts[entry.apiSurface]++;
}

console.log(`Verified ${inventory.fragments.length} legacy REST fragments: ${counts['data-plane']} data-plane, ${counts['control-plane']} control-plane.`);
