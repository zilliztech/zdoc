import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const REQUIRED_APPROVAL_FIELDS = ['site', 'capability', 'matcher', 'category', 'reason', 'approvedBy'];
const CATEGORIES = new Set(['intentional-change', 'legacy-defect-fixed', 'nondeterministic']);
const RATIONALE_TYPES = new Set(['addition', 'retirement', 'rename', 'consolidation', 'behavior-change']);
const TYPE_ORDER = new Map([['extra', 0], ['missing', 1], ['changed', 2]]);

function validateInventory(inventory, site, label) {
  if (inventory?.schemaVersion !== 1 || !Array.isArray(inventory.routes)) throw new Error(`${label} route inventory must use schemaVersion 1`);
  if (inventory.site !== site) throw new Error(`${label} route inventory site ${inventory.site} does not match ${site}`);
  const seen = new Set();
  for (const entry of inventory.routes) {
    if (!entry || typeof entry.route !== 'string' || !entry.route.startsWith('/') || !['page', 'redirect'].includes(entry.kind)) {
      throw new Error(`${label} contains an invalid route entry`);
    }
    if (seen.has(entry.route)) throw new Error(`${label} contains duplicate route ${entry.route}`);
    seen.add(entry.route);
  }
}

function validateApprovals(manifest) {
  if (manifest?.schemaVersion !== 1 || !Array.isArray(manifest.differences)) throw new Error('Approved differences must use schemaVersion 1');
  for (const approval of manifest.differences) {
    for (const field of REQUIRED_APPROVAL_FIELDS) {
      if (typeof approval?.[field] !== 'string' || approval[field].trim() === '') throw new Error(`Approved difference requires ${field}`);
    }
    if (!['en', 'zh-CN'].includes(approval.site)) throw new Error(`Unsupported approval site: ${approval.site}`);
    if (!CATEGORIES.has(approval.category)) throw new Error(`Unsupported approval category: ${approval.category}`);
    if (!/^(extra|missing|changed):\/[A-Za-z0-9._~!$&'()*+,;=:@%/-]*$/.test(approval.matcher)) {
      throw new Error(`Approval matcher must be bounded to one exact route difference: ${approval.matcher}`);
    }
    const rationale = approval.rationale;
    if (!rationale || typeof rationale !== 'object' || !RATIONALE_TYPES.has(rationale.type)) {
      throw new Error(`Approved difference requires a structured rationale: ${approval.matcher}`);
    }
    const [differenceType, route] = approval.matcher.split(':', 2);
    if (rationale.type === 'rename' || rationale.type === 'consolidation') {
      if (typeof rationale.from !== 'string' || typeof rationale.to !== 'string'
        || !rationale.from.startsWith('/') || !rationale.to.startsWith('/')) {
        throw new Error(`Paired route rationale requires bounded from/to routes: ${approval.matcher}`);
      }
      if ((differenceType === 'missing' && rationale.from !== route)
        || (differenceType === 'extra' && rationale.to !== route)) {
        throw new Error(`Paired route rationale does not match approval route: ${approval.matcher}`);
      }
    } else if (typeof rationale.detail !== 'string' || !rationale.detail.includes(route)) {
      throw new Error(`Route rationale must explicitly name ${route}: ${approval.matcher}`);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(approval.expiresWhen ?? '') && approval.expiresWhen < new Date().toISOString().slice(0, 10)) {
      throw new Error(`Approved difference expired: ${approval.matcher}`);
    }
  }
  for (const approval of manifest.differences.filter(item => item.rationale?.type === 'rename')) {
    const pair = manifest.differences.filter(item => item.site === approval.site
      && item.rationale?.type === 'rename'
      && item.rationale.from === approval.rationale.from
      && item.rationale.to === approval.rationale.to);
    if (!pair.some(item => item.matcher === `missing:${approval.rationale.from}`)
      || !pair.some(item => item.matcher === `extra:${approval.rationale.to}`)) {
      throw new Error(`Rename rationale requires paired missing and extra approvals: ${approval.matcher}`);
    }
  }
}

function routeMap(inventory) {
  return new Map(inventory.routes.map(entry => [entry.route, entry]));
}

function sameBehavior(left, right) {
  return left.kind === right.kind && left.redirectTo === right.redirectTo && left.canonical === right.canonical;
}

export function compareRouteInventories({legacy, replacement, approved, site, failOnDifferences = false}) {
  if (site !== 'en' && site !== 'zh-CN') throw new Error(`Unsupported site: ${site}`);
  validateInventory(legacy, site, 'Legacy');
  validateInventory(replacement, site, 'Replacement');
  validateApprovals(approved);

  const legacyRoutes = routeMap(legacy);
  const replacementRoutes = routeMap(replacement);
  const differences = [];
  for (const [route, entry] of replacementRoutes) {
    if (!legacyRoutes.has(route)) differences.push({type: 'extra', route, replacement: entry});
  }
  for (const [route, entry] of legacyRoutes) {
    if (!replacementRoutes.has(route)) differences.push({type: 'missing', route, legacy: entry});
    else if (!sameBehavior(entry, replacementRoutes.get(route))) {
      differences.push({type: 'changed', route, legacy: entry, replacement: replacementRoutes.get(route)});
    }
  }
  differences.sort((left, right) => TYPE_ORDER.get(left.type) - TYPE_ORDER.get(right.type) || Buffer.from(left.route).compare(Buffer.from(right.route)));

  const siteApprovals = approved.differences.filter(entry => entry.site === site);
  const byMatcher = new Map(siteApprovals.map(entry => [entry.matcher, entry]));
  if (byMatcher.size !== siteApprovals.length) throw new Error(`Duplicate approved difference matcher for ${site}`);
  const used = new Set();
  const unclassified = [];
  for (const difference of differences) {
    const matcher = `${difference.type}:${difference.route}`;
    if (byMatcher.has(matcher)) used.add(matcher);
    else unclassified.push(difference);
  }
  const unused = siteApprovals.map(entry => entry.matcher).filter(matcher => !used.has(matcher)).sort();
  if (unused.length > 0) throw new Error(`Unused approved differences for ${site}: ${unused.join(', ')}`);

  const result = {schemaVersion: 1, site, legacyCount: legacy.routes.length, replacementCount: replacement.routes.length, differences, unclassified, approvalsUsed: [...used].sort()};
  if (failOnDifferences && unclassified.length > 0) {
    throw new Error(`Unclassified route differences for ${site}: ${unclassified.map(item => `${item.type}:${item.route}`).join(', ')}`);
  }
  return result;
}

function parseArguments(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) throw new Error(`Invalid arguments: ${argv.join(' ')}`);
    values[key.slice(2)] = value;
  }
  for (const required of ['legacy', 'replacement', 'approved', 'site']) if (!values[required]) throw new Error(`Missing --${required}`);
  return values;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArguments(process.argv.slice(2));
  const result = compareRouteInventories({legacy: readJson(args.legacy), replacement: readJson(args.replacement), approved: readJson(args.approved), site: args.site, failOnDifferences: true});
  process.stdout.write(`Compared ${result.legacyCount} legacy and ${result.replacementCount} replacement routes for ${result.site}; ${result.differences.length} approved differences.\n`);
}
