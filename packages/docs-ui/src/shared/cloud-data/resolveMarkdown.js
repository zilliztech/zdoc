// Cloud-data markers <-> markdown fragments.
//
// Content pages carry one standalone self-closing marker line where a live
// table belongs (all three components are registered globally in MDXComponents,
// same path as FeatureNote):
//
//   <CloudRegions provider="aws" />
//   <CloudFeatures matrix="compute-types" />
//   <RegionIps scope="service" />
//   <RegionIps provider="aws" />
//
// `resolveCloudDataMarkers` replaces each marker with its table:
//   - mode "ssi":     a `<!--# block name=… -->` stub baked from the committed
//     snapshot, followed by the `<!--# include … stub=… -->` directive nginx
//     resolves at request time from the live CMS JSON. The block MUST precede
//     its include (SSI processes directives in order — a stub declared after
//     the include writes `[an error occurred while processing the directive]`
//     into the page, verified in ssi-local-test).
//   - mode "snapshot": the baked table alone (dev middleware, llms.txt).
//
// Pages without markers come back byte-identical. Markers inside fenced code
// blocks are literal examples and are left alone. An unknown component,
// matrix, or provider throws: a marker the renderer cannot satisfy must fail
// the build instead of shipping a bare tag or an empty table.

import renderModule from './render.js';

const renderFragment = renderModule.renderFragment;

const FENCED_SEGMENT = /(```[\s\S]*?```|~~~[\s\S]*?~~~)/g;
const MARKER = /^[ \t]*<(CloudRegions|CloudFeatures|RegionIps)((?:\s+[a-zA-Z]+="[^"]*")*)\s*\/>[ \t]*$/;
const KNOWN_MATRICES = ['compute-types', 'deployment-options', 'features'];

function parseAttributes(text) {
  const attributes = {};
  const pattern = /\s+([a-zA-Z]+)="([^"]*)"/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    attributes[match[1]] = match[2];
  }
  return attributes;
}

// -> {section, provider?} or null when the line is not a cloud-data marker.
export function parseMarker(line) {
  const match = line.match(MARKER);
  if (!match) return null;
  const attributes = parseAttributes(match[2]);
  if (match[1] === 'CloudRegions') {
    if (!attributes.provider) {
      throw new Error('[cloud-data] <CloudRegions /> requires a provider attribute: ' + line.trim());
    }
    return {section: 'regions', provider: attributes.provider};
  }
  if (match[1] === 'CloudFeatures') {
    if (!attributes.matrix || KNOWN_MATRICES.indexOf(attributes.matrix) === -1) {
      throw new Error('[cloud-data] <CloudFeatures /> requires matrix="' + KNOWN_MATRICES.join('"|"') + '": ' + line.trim());
    }
    return {section: attributes.matrix};
  }
  if (attributes.scope === 'service') return {section: 'service-ips'};
  if (attributes.scope) {
    throw new Error('[cloud-data] <RegionIps /> scope must be "service", or use provider="' + attributes.scope + '": ' + line.trim());
  }
  if (!attributes.provider) {
    throw new Error('[cloud-data] <RegionIps /> requires scope="service" or a provider attribute: ' + line.trim());
  }
  return {section: 'region-ips', provider: attributes.provider};
}

function includeUrl(request, site, baseUrl) {
  const params = [['section', request.section]];
  if (request.provider) params.push(['provider', request.provider]);
  if (site) params.push(['site', site]);
  const query = params.map(function (pair) { return pair[0] + '=' + encodeURIComponent(pair[1]); }).join('&');
  return (baseUrl || '/api/cloud-data') + '/fragment.md?' + query;
}

function blockName(request, used) {
  let name = 'clouddata-' + request.section + (request.provider ? '-' + request.provider : '');
  let counter = 2;
  while (used.has(name)) {
    name = 'clouddata-' + request.section + (request.provider ? '-' + request.provider : '') + '-' + counter;
    counter += 1;
  }
  used.add(name);
  return name;
}

// Returns {content, resolved: [...requests]} so callers can report what they
// resolved; `resolved` is empty for pages without markers.
export function resolveCloudDataMarkers(content, model, options) {
  const text = String(content);
  const mode = (options && options.mode) || 'snapshot';
  const fragmentBaseUrl = options && options.fragmentBaseUrl;
  if (text.indexOf('<CloudRegions') === -1
    && text.indexOf('<CloudFeatures') === -1
    && text.indexOf('<RegionIps') === -1) {
    return {content: text, resolved: []};
  }

  const resolved = [];
  const usedNames = new Set();
  const parts = [];
  const segments = text.split(FENCED_SEGMENT);
  for (let index = 0; index < segments.length; index += 1) {
    if (index % 2 === 1) {
      parts.push(segments[index]);
      continue;
    }
    const lines = segments[index].split('\n');
    const output = [];
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const request = parseMarker(lines[lineIndex]);
      if (!request) {
        output.push(lines[lineIndex]);
        continue;
      }
      const fragment = renderFragment(model, request);
      resolved.push(request);
      if (mode === 'ssi') {
        const name = blockName(request, usedNames);
        output.push('<!--# block name="' + name + '" -->');
        output.push(fragment);
        output.push('<!--# endblock -->');
        output.push('<!--# include virtual="' + includeUrl(request, model.site, fragmentBaseUrl) + '" stub="' + name + '" -->');
      } else {
        output.push(fragment);
      }
    }
    parts.push(output.join('\n'));
  }
  return {content: parts.join(''), resolved: resolved};
}
