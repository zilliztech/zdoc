// Pure renderer: normalized cloud-data model -> markdown fragment strings.
// No CMS, no filesystem. The same fragment is used for three consumers:
//   - the build-time snapshot bake inside `.md` artifacts (SSI stub blocks);
//   - the browser React table (renderReact.tsx renders the same model in JSX —
//     golden tests keep both layouts identical);
//   - vitest goldens locked to the live pages.
//
// Table grammar (verified verbatim against the four live pages by the
// 2026-10-26-regionmatrix-markdown-template research): HTML tables when rows
// need rowspan or rich cells, GFM when every cell is plain text.
//
// njs-compatible ESM (see vocab.js): no optional chaining/nullish/Map/for-of.

import stringsModule from './strings.js';
import vocabModule from './vocab.js';

const tableFor = vocabModule.vocabFor;

const stringsFor = stringsModule.stringsFor;

// MDX-safe inline text: a bare `<` opens JSX and `{`/`}` open an expression.
// `&` is left alone on purpose: the pages already contain "Free & Serverless".
function escapeText(value) {
  return String(value)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
}

function escapeAttr(value) {
  return escapeText(value).replace(/"/g, '&quot;');
}

function escapeCell(value) {
  return escapeText(value).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br/>');
}

const p = function (html) { return '<p>' + html + '</p>'; };

function htmlTable(headers, rows, table) {
  const lines = ['<table>', '   <tr>'];
  for (let index = 0; index < headers.length; index += 1) {
    const label = table && table.headerStrong ? '<strong>' + escapeText(headers[index]) + '</strong>' : escapeText(headers[index]);
    lines.push('     <th><p>' + label + '</p></th>');
  }
  lines.push('   </tr>');
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const cells = rows[rowIndex];
    lines.push('   <tr>');
    for (let cellIndex = 0; cellIndex < cells.length; cellIndex += 1) {
      const cell = cells[cellIndex];
      const rowspan = cell.rowspan > 1 ? ' rowspan="' + cell.rowspan + '"' : '';
      lines.push('     <td' + rowspan + '>' + cell.html + '</td>');
    }
    lines.push('   </tr>');
  }
  lines.push('</table>');
  return lines.join('\n');
}

function gfmTable(headers, rows) {
  const line = function (cells) { return '| ' + cells.join(' | ') + ' |'; };
  const separator = headers.map(function () { return '---'; });
  const body = [];
  for (let index = 0; index < rows.length; index += 1) body.push(line(rows[index]));
  return [line(headers), line(separator)].concat(body).join('\n');
}

function groupByContinent(regions) {
  const order = [];
  const groups = {};
  for (let index = 0; index < regions.length; index += 1) {
    const region = regions[index];
    if (!groups[region.continent]) {
      groups[region.continent] = [];
      order.push(region.continent);
    }
    groups[region.continent].push(region);
  }
  const result = [];
  for (let index = 0; index < order.length; index += 1) result.push(groups[order[index]]);
  return result;
}

// The merged regions table (the live pages' grammar, transcribed verbatim):
// three header rows — three label columns, a grouped managed-cloud pair over
// "always-on compute", and BYOC — then one row per region with
// ✅ / not-available cells. BYOC-only regions are regular rows whose managed
// cells read "not available". Always HTML (the grouped header cannot be GFM).
function headerCell(text, table, attributes) {
  const label = table.headerStrong ? '<strong>' + escapeText(text) + '</strong>' : escapeText(text);
  return '     <th' + attributes + '><p>' + label + '</p></th>';
}

function bodyCell(text) {
  return '     <td><p>' + escapeText(text) + '</p></td>';
}

function renderRegionsTable(provider, strings, table) {
  if (!provider.regions || provider.regions.length === 0) {
    throw new Error('Provider ' + provider.key + ' has no regions');
  }
  const strong = function (text) {
    return table.headerStrong ? '<strong>' + escapeText(text) + '</strong>' : escapeText(text);
  };
  const availability = function (list, value) {
    return list.indexOf(value) !== -1 ? table.cellYes : table.cellNo;
  };
  const lines = ['<table>', '   <tr>'];
  lines.push(headerCell(table.labelHeaders[0], table, ' rowspan="3"'));
  lines.push(headerCell(table.labelHeaders[1], table, ' rowspan="3"'));
  lines.push(headerCell(table.labelHeaders[2], table, ' rowspan="3"'));
  lines.push(headerCell(table.managedGroupHeader, table, ' colspan="3"'));
  lines.push(headerCell(table.byocHeader, table, ' rowspan="3"'));
  lines.push('   </tr>');
  lines.push('   <tr>');
  lines.push('     <td colspan="2"><p>' + strong(table.alwaysOnHeader) + '</p></td>');
  lines.push('     <td rowspan="2"><p>' + strong(table.onDemandHeader) + '</p></td>');
  lines.push('   </tr>');
  lines.push('   <tr>');
  lines.push('     <td><p>' + strong(table.freeServerlessHeader) + '</p></td>');
  lines.push('     <td><p>' + strong(table.dedicatedHeader) + '</p></td>');
  lines.push('   </tr>');
  const groups = groupByContinent(provider.regions);
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    const group = groups[groupIndex];
    for (let index = 0; index < group.length; index += 1) {
      const region = group[index];
      lines.push('   <tr>');
      if (index === 0) {
        lines.push(group.length > 1
          ? '     <td rowspan="' + group.length + '"><p>' + escapeText(region.continent) + '</p></td>'
          : bodyCell(region.continent));
      }
      lines.push(bodyCell(region.id));
      lines.push(bodyCell(region.name));
      lines.push(bodyCell(availability(region.deployments, table.freeServerlessHeader)));
      lines.push(bodyCell(availability(region.deployments, table.dedicatedHeader)));
      lines.push(bodyCell(availability(region.computeTypes, table.onDemandHeader)));
      lines.push(bodyCell(availability(region.deployments, table.byocHeader)));
      lines.push('   </tr>');
    }
  }
  lines.push('</table>');
  return lines.join('\n');
}

function rowLabelHtml(row) {
  if (row.labelHtml) return row.labelHtml;
  const label = escapeText(row.label);
  if (!row.href) return label;
  return '<a href="' + escapeAttr(row.href) + '">' + label + '</a>';
}

function rowLabelMarkdown(row) {
  const label = escapeCell(row.label);
  if (!row.href) return label;
  return '[' + label + '](' + row.href + ')';
}

function cellFor(row, provider) {
  const cell = row.cells ? row.cells[provider.key] : null;
  if (!cell) {
    throw new Error('Row "' + (row.label || row.labelHtml) + '" has no availability for provider ' + provider.key);
  }
  return cell;
}

function isPlainAvailability(cell) {
  if (cell.kind === 'none' || cell.kind === 'contact') return true;
  return cell.kind === 'all' && !cell.extra && !cell.note;
}

function availabilityText(cell, strings) {
  switch (cell.kind) {
    case 'all': return strings.all;
    case 'none': return strings.none;
    case 'contact': return strings.contact;
    case 'text': return escapeCell(cell.text);
    default: throw new Error('Unknown availability kind: ' + cell.kind);
  }
}

function availabilityHtml(cell, strings) {
  // The note carries markdown (renderReact renders it through MarkdownCell),
  // so it gets the same cell-grade escaping as free-text cells: markdown
  // syntax survives, raw `<`/`>`/`{`/`}` cannot leak into the MDX artifact.
  const note = cell.note
    ? ' <Admonition type="info" icon="📘" title="' + escapeAttr(strings.noteTitle) + '"> ' + escapeCell(cell.note) + ' </Admonition>'
    : '';
  switch (cell.kind) {
    case 'all':
      return p(strings.all)
        + (cell.extra ? p(escapeText(strings.plus(cell.extra))) : '')
        + note;
    case 'none':
    case 'contact':
      return p(availabilityText(cell, strings)) + note;
    case 'partial': {
      if (!cell.regions || cell.regions.length === 0) {
        throw new Error('partial availability requires a non-empty regions list');
      }
      const items = [];
      for (let index = 0; index < cell.regions.length; index += 1) {
        items.push('<li>' + escapeText(cell.regions[index]) + '</li>');
      }
      return p(strings.partial) + '<ul>' + items.join('') + '</ul>' + note;
    }
    case 'text': {
      // Free-text CMS cells carry markdown. The `.md` consumers want it
      // verbatim (machines read the markdown source), so only the characters
      // that would break out of the cell are escaped.
      return p(escapeCell(cell.text)) + note;
    }
    default:
      throw new Error('Unknown availability kind: ' + cell.kind);
  }
}

function renderMatrixTable(matrix, providers, strings, table) {
  if (!matrix.rows || matrix.rows.length === 0) {
    throw new Error('Matrix ' + matrix.key + ' has no rows');
  }
  const headers = [matrix.rowHeader];
  for (let index = 0; index < providers.length; index += 1) headers.push(providers[index].name);
  let allPlain = true;
  for (let rowIndex = 0; rowIndex < matrix.rows.length; rowIndex += 1) {
    const row = matrix.rows[rowIndex];
    if (row.labelHtml) allPlain = false;
    for (let providerIndex = 0; providerIndex < providers.length; providerIndex += 1) {
      if (!isPlainAvailability(cellFor(row, providers[providerIndex]))) allPlain = false;
    }
  }
  if (allPlain) {
    return gfmTable(headers, matrix.rows.map(function (row) {
      const cells = [rowLabelMarkdown(row)];
      for (let providerIndex = 0; providerIndex < providers.length; providerIndex += 1) {
        cells.push(availabilityText(cellFor(row, providers[providerIndex]), strings));
      }
      return cells;
    }));
  }
  return htmlTable(headers, matrix.rows.map(function (row) {
    const cells = [{html: p(rowLabelHtml(row))}];
    for (let providerIndex = 0; providerIndex < providers.length; providerIndex += 1) {
      cells.push({html: availabilityHtml(cellFor(row, providers[providerIndex]), strings)});
    }
    return cells;
  }), table);
}

function renderIpTable(rows, strings) {
  if (!rows || rows.length === 0) throw new Error('IP table has no rows');
  return gfmTable(strings.ipColumns, rows.map(function (row) {
    const cidrs = [];
    for (let index = 0; index < row.cidrs.length; index += 1) {
      cidrs.push('`' + row.cidrs[index] + '`');
    }
    return [escapeCell(row.region), escapeCell(row.location), cidrs.join(', ')];
  }));
}

// One fragment per cloud-data marker:
//   <CloudRegions provider="aws" />            -> section=regions  provider=aws
//   <CloudFeatures matrix="compute-types" />   -> section=compute-types
//   <RegionIps scope="service" />              -> section=service-ips
//   <RegionIps provider="aws" />               -> section=region-ips provider=aws
function renderFragment(model, request) {
  const strings = stringsFor(model.locale);
  const table = tableFor(model.site).regionsTable;
  const providers = model.providers;
  const findProvider = function () {
    for (let index = 0; index < providers.length; index += 1) {
      if (providers[index].key === request.provider) return providers[index];
    }
    throw new Error('Unknown provider "' + request.provider + '" for section ' + request.section);
  };
  switch (request.section) {
    case 'regions':
      return renderRegionsTable(findProvider(), strings, table);
    case 'compute-types':
    case 'deployment-options':
    case 'features': {
      const matrix = model.matrices ? model.matrices[request.section] : null;
      if (!matrix) throw new Error('Model has no matrix ' + request.section);
      return renderMatrixTable(matrix, providers, strings, table);
    }
    case 'service-ips':
      return renderIpTable(model.serviceIps, strings);
    case 'region-ips':
      return renderIpTable(findProvider().ipRows, strings);
    default:
      throw new Error('Unknown section: ' + request.section);
  }
}

// njs only supports default imports (see vocab.js).
export default {escapeText, renderFragment, renderRegionsTable, renderMatrixTable, renderIpTable};
