import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const restMeta = path.join(root, 'packages/docs-tooling/src/reference/rest/meta');
const evidencePath = path.join(restMeta, 'lifecycle-evidence/milvus-2.6.x-bootstrap.json');
const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
const lifecycleKeys = ['x-added-at', 'x-last-modified', 'x-deprecated-since'];

assert.equal(evidence.schemaVersion, 1);
assert.equal(evidence.apiSurface, 'data-plane');
assert.match(evidence.managedFloor, /^\d+\.\d+\.x$/);
assert.match(evidence.source.baseCommit, /^[0-9a-f]{40}$/);
assert.match(evidence.source.headCommit, /^[0-9a-f]{40}$/);

function escapePointer(value) {
  return value.replaceAll('~', '~0').replaceAll('/', '~1');
}

function collect(node, pointer = '') {
  const rows = [];
  if (!node || typeof node !== 'object') return rows;
  if (!Array.isArray(node) && lifecycleKeys.every(key => Object.hasOwn(node, key))) {
    rows.push({jsonPointer: pointer || '/', lifecycle: Object.fromEntries(lifecycleKeys.map(key => [key, node[key]]))});
  }
  for (const [key, child] of Object.entries(node)) {
    if (lifecycleKeys.includes(key)) continue;
    rows.push(...collect(child, `${pointer}/${escapePointer(key)}`));
  }
  return rows;
}

const expected = new Map();
for (const row of evidence.elements) {
  const key = `${row.fragment}:${row.jsonPointer}`;
  assert(!expected.has(key), `duplicate evidence row ${key}`);
  assert(['baseline-floor', 'added', 'modified', 'deprecated'].includes(row.change), `unknown change ${row.change}`);
  if (row.change !== 'baseline-floor') {
    assert.match(row.source.commit, /^[0-9a-f]{40}$/, `${key} requires a source commit`);
    assert(row.source.file && row.source.file !== 'internal/distributed/proxy/httpserver', `${key} requires a specific source file`);
    assert(row.source.symbol, `${key} requires a source symbol`);
  }
  expected.set(key, row.lifecycle);
}

const observed = new Map();
const fragmentNames = [...new Set(evidence.elements.map(row => row.fragment))].sort();
const inventoryHash = crypto.createHash('sha256');
for (const fragment of fragmentNames) {
  const fragmentPath = path.join(restMeta, 'openapi', fragment);
  const bytes = fs.readFileSync(fragmentPath);
  const fileHash = crypto.createHash('sha256').update(bytes).digest('hex');
  inventoryHash.update(`${fileHash}  ${fragmentPath.replace(`${root}/`, '')}\n`);
  const spec = JSON.parse(bytes);
  for (const row of collect(spec)) observed.set(`${fragment}:${row.jsonPointer}`, row.lifecycle);
}
assert.equal(inventoryHash.digest('hex'), evidence.reproducibility.fragmentInventorySha256);

assert.equal(observed.size, evidence.summary.elements);
assert.equal(expected.size, evidence.summary.elements);
for (const [key, lifecycle] of expected) assert.deepEqual(observed.get(key), lifecycle, `lifecycle evidence mismatch at ${key}`);
for (const key of observed.keys()) assert(expected.has(key), `missing lifecycle evidence at ${key}`);

const digest = crypto.createHash('sha256').update(fs.readFileSync(evidencePath)).digest('hex');
console.log(`Verified ${observed.size} lifecycle elements against evidence sha256:${digest}.`);
