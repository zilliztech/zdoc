// Strapi v4 CMS JSON -> normalized cloud-data model.
//
// Input is the raw JSON of the two production endpoints, `GET /api/cloud-regions`
// and `GET /api/cloud-features` (Strapi v4 shape: {data: [{attributes}]}). The
// "layout unchanged" rules were verified against the live pages by
// .claude/specs/2026-10-26-cloud-data-components-md-route/cms-vs-live-diff.js —
// this module is that probe, hardened for production:
//   - `ip` is a Strapi string (comma+space separated), not JSON;
//   - feature `links` pointing outside the docs domains are demoted to plain
//     text (the CMS currently stores internal Feishu wiki URLs) and surfaced
//     as warnings instead of leaking internal links to the public sites.
//
// njs-compatible ESM (see vocab.js): no optional chaining/nullish/Map.

import vocabModule from './vocab.js';

const vocabFor = vocabModule.vocabFor;
const serviceIpRegion = vocabModule.serviceIpRegion;

function relationName(relation) {
  const attributes = relation && relation.data && relation.data.attributes;
  return attributes ? attributes.name : null;
}

function relationNames(list) {
  const data = (list && list.data) || [];
  const names = [];
  for (let index = 0; index < data.length; index += 1) {
    const attributes = data[index] && data[index].attributes;
    if (attributes && attributes.name) names.push(attributes.name);
  }
  return names;
}

// `ip` was backfilled as a comma+space separated string (54.200.111.111, …).
function parseIps(value) {
  if (!value || typeof value !== 'string') return [];
  const parts = value.split(',');
  const ips = [];
  for (let index = 0; index < parts.length; index += 1) {
    const ip = parts[index].trim();
    if (ip) ips.push(ip);
  }
  return ips;
}

const DOCS_ORIGINS = ['https://docs.zilliz.com/', 'https://docs.zilliz.com.cn/'];

// Feature `links`/`docs_url` policy: relative docs links pass through, absolute
// links on either docs domain become root-relative, everything else (today:
// internal Feishu wiki URLs) is dropped with a warning.
function normalizeHref(value, context, warnings) {
  if (!value || typeof value !== 'string') return null;
  const href = value.trim();
  if (!href) return null;
  if (href.indexOf('./') === 0) return href;
  for (let index = 0; index < DOCS_ORIGINS.length; index += 1) {
    if (href.indexOf(DOCS_ORIGINS[index]) === 0) {
      return '/' + href.slice(DOCS_ORIGINS[index].length);
    }
  }
  warnings.push({type: 'unpublished-link', context: context, url: href});
  return null;
}

function parseRegionAttributes(attributes, vocab) {
  return {
    id: vocab.regionId(attributes),
    continent: relationName(attributes.continent) || '',
    // Locale-specific table name: en shows the English location name in its
    // Location column, zh the Chinese name in its 地域名称 column.
    name: vocab.regionName(attributes),
    location: attributes.location || null,
    ip: parseIps(attributes.ip),
    deployments: relationNames(attributes.supported_deployments),
    computeTypes: relationNames(attributes.supported_compute_types),
  };
}

// Heuristic stand-in for the missing `listed` flag (§6-1): a region that only
// offers BYOC and no Zilliz-managed compute is a BYOC-only footnote, not a
// listed region. Reproduces the live treatment of ap-east-1.
function isByocOnly(region, byoc) {
  if (region.computeTypes.length > 0) return false;
  if (region.deployments.length === 0) return false;
  for (let index = 0; index < region.deployments.length; index += 1) {
    if (region.deployments[index] !== byoc) return false;
  }
  return true;
}

function availability(regions, has) {
  const listed = [];
  for (let index = 0; index < regions.length; index += 1) {
    if (!regions[index].byocOnly) listed.push(regions[index]);
  }
  const hits = [];
  for (let index = 0; index < listed.length; index += 1) {
    if (has(listed[index])) hits.push(listed[index]);
  }
  if (listed.length > 0 && hits.length === listed.length) return {kind: 'all'};
  if (hits.length === 0) return {kind: 'none'};
  return {kind: 'partial', regions: hits.map(function (region) { return region.name; })};
}

function matrixFrom(rowsDefinition, field, key, rowHeader, providers, byoc) {
  const rows = [];
  for (let index = 0; index < rowsDefinition.length; index += 1) {
    const definition = rowsDefinition[index];
    const row = {label: definition.label, cells: {}};
    if (definition.labelHtml) row.labelHtml = definition.labelHtml;
    if (definition.href) row.href = definition.href;
    for (let providerIndex = 0; providerIndex < providers.length; providerIndex += 1) {
      const provider = providers[providerIndex];
      const cell = availability(provider._all, function (region) {
        return region[field].indexOf(definition.cms) !== -1;
      });
      if (definition.cms === byoc && cell.kind === 'all') {
        const extra = [];
        for (let regionIndex = 0; regionIndex < provider._all.length; regionIndex += 1) {
          const region = provider._all[regionIndex];
          if (region.byocOnly && region.deployments.indexOf(byoc) !== -1) {
            extra.push(region.location ? region.id + ' (' + region.location + ')' : region.id);
          }
        }
        if (extra.length > 0) cell.extra = extra.join(', ');
      }
      row.cells[provider.key] = cell;
    }
    rows.push(row);
  }
  return {key: key, rowHeader: rowHeader, rows: rows};
}

function featureRows(featuresJson, vocab, warnings) {
  const rows = [];
  const data = (featuresJson && featuresJson.data) || [];
  const withIds = [];
  for (let index = 0; index < data.length; index += 1) {
    withIds.push({recordId: typeof data[index].id === 'number' ? data[index].id : 0, attributes: data[index].attributes});
  }
  withIds.sort(function (a, b) { return a.recordId - b.recordId; });
  for (let index = 0; index < withIds.length; index += 1) {
    const attributes = withIds[index].attributes;
    const href = normalizeHref(attributes.links, {feature: attributes.name}, warnings);
    const cells = {};
    const regionAvailability = attributes.region_availability || [];
    for (let cellIndex = 0; cellIndex < regionAvailability.length; cellIndex += 1) {
      const entry = regionAvailability[cellIndex];
      const providerKey = vocab.providerKeys[relationName(entry.cloud_provider)];
      if (!providerKey) {
        throw new Error('unknown feature provider ' + relationName(entry.cloud_provider));
      }
      const text = String(entry.supported_regions == null ? '' : entry.supported_regions).trim();
      let cell;
      if (vocab.cellAll.indexOf(text) !== -1) cell = {kind: 'all'};
      else if (vocab.cellNone.indexOf(text) !== -1) cell = {kind: 'none'};
      else if (new RegExp(vocab.contactPattern).test(text)) cell = {kind: 'contact'};
      else cell = {kind: 'text', text: text};
      cells[providerKey] = cell;
    }
    const row = {label: attributes.name, cells: cells};
    if (href) row.href = href;
    rows.push(row);
  }
  return rows;
}

function latestUpdatedAt(regionsJson, featuresJson) {
  let latest = '';
  const sources = [(regionsJson && regionsJson.data) || [], (featuresJson && featuresJson.data) || []];
  for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex += 1) {
    const data = sources[sourceIndex];
    for (let index = 0; index < data.length; index += 1) {
      const updatedAt = data[index].attributes && data[index].attributes.updatedAt;
      if (typeof updatedAt === 'string' && updatedAt > latest) latest = updatedAt;
    }
  }
  return latest;
}

// Build the normalized model. `regionsJson`/`featuresJson` are the parsed
// response bodies of the two CMS endpoints for `site`.
function buildModel(site, regionsJson, featuresJson) {
  const vocab = vocabFor(site);
  const warnings = [];

  const byProvider = {};
  for (let index = 0; index < vocab.order.length; index += 1) byProvider[vocab.order[index]] = [];
  const regionsData = (regionsJson && regionsJson.data) || [];
  for (let index = 0; index < regionsData.length; index += 1) {
    const row = regionsData[index];
    const attributes = row.attributes;
    const providerKey = vocab.providerKeys[relationName(attributes.provider)];
    if (!providerKey) throw new Error('unknown region provider ' + relationName(attributes.provider));
    const region = parseRegionAttributes(attributes, vocab);
    region.byocOnly = isByocOnly(region, vocab.byoc);
    // Strapi's default response order is not stable — a CMS edit moves the
    // record to the front. Sort by the record id so the tables keep their
    // authored order regardless of edit recency.
    region.recordId = typeof row.id === 'number' ? row.id : 0;
    byProvider[providerKey].push(region);
  }

  const byRecordId = function (a, b) { return a.recordId - b.recordId; };
  const providers = [];
  for (let index = 0; index < vocab.order.length; index += 1) {
    const key = vocab.order[index];
    const all = byProvider[key].slice().sort(byRecordId);
    // The merged regions table lists every region in CMS order — BYOC-only
    // regions are regular rows whose managed columns read "not available".
    const regions = [];
    for (let regionIndex = 0; regionIndex < all.length; regionIndex += 1) {
      const region = all[regionIndex];
      regions.push({
        continent: region.continent,
        id: region.id,
        name: region.name,
        deployments: region.deployments,
        computeTypes: region.computeTypes,
        byocOnly: region.byocOnly,
      });
    }
    const ipRows = [];
    for (let regionIndex = 0; regionIndex < all.length; regionIndex += 1) {
      const region = all[regionIndex];
      if (region.byocOnly || region.ip.length === 0) continue;
      ipRows.push({region: region.id, location: region.location || '', cidrs: region.ip});
    }
    providers.push({
      key: key,
      name: vocab.providerNames[key],
      anchor: vocab.anchors[key],
      regions: regions,
      ipRows: ipRows,
      _all: all,
    });
  }

  const serviceIp = serviceIpRegion(site);
  const serviceIps = [];
  for (let index = 0; index < providers.length; index += 1) {
    const provider = providers[index];
    for (let rowIndex = 0; rowIndex < provider.ipRows.length; rowIndex += 1) {
      if (provider.ipRows[rowIndex].region === serviceIp) serviceIps.push(provider.ipRows[rowIndex]);
    }
  }

  const matrices = {
    'compute-types': matrixFrom(vocab.computeRows, 'computeTypes', 'compute-types', vocab.rowHeaders.compute, providers, vocab.byoc),
    'deployment-options': matrixFrom(vocab.deployRows, 'deployments', 'deployment-options', vocab.rowHeaders.deploy, providers, vocab.byoc),
    'features': {key: 'features', rowHeader: vocab.rowHeaders.feature, rows: featureRows(featuresJson, vocab, warnings)},
  };

  const publicProviders = [];
  for (let index = 0; index < providers.length; index += 1) {
    const provider = providers[index];
    publicProviders.push({
      key: provider.key,
      name: provider.name,
      anchor: provider.anchor,
      regions: provider.regions,
      ipRows: provider.ipRows,
    });
  }

  return {
    site: site,
    locale: site,
    updatedAt: latestUpdatedAt(regionsJson, featuresJson),
    providers: publicProviders,
    serviceIps: serviceIps,
    matrices: matrices,
  };
}

// njs only supports default imports (see vocab.js).
export default {buildModel, parseIps, normalizeHref};
