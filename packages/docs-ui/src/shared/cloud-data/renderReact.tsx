import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Admonition from '@theme/Admonition';
import stringsModule from './strings.js';
import renderModule from './render.js';

const stringsFor = stringsModule.stringsFor;
const renderFragmentHtml = renderModule.renderFragment;

// React twin of render.js: same normalized model, same table grammar, rendered
// as JSX instead of markdown strings. The `.md` route renders render.js output
// (baked stub + njs live fragment) while the HTML page renders this module —
// golden tests keep both layouts identical on the same model, so the HTML page
// and the `.md` route cannot drift apart.
//
// Free-text CMS cells carry markdown (links, lists); react-markdown renders
// them, mirroring how MDX parses markdown inside HTML table cells on the live
// pages today.

type CloudCell = {
  kind: 'all' | 'none' | 'contact' | 'partial' | 'text';
  regions?: string[];
  extra?: string;
  note?: string;
  text?: string;
};

type CloudRow = {label?: string; labelHtml?: string; href?: string; cells: Record<string, CloudCell>};
type CloudMatrix = {key: string; rowHeader: string; rows: CloudRow[]};
type CloudProvider = {key: string; name: string; anchor: string; regions: Array<{continent: string; name: string; location?: string}>; ipRows: Array<{region: string; location: string; cidrs: string[]}>};
export type CloudDataModel = {
  site: string;
  locale: string;
  updatedAt: string;
  providers: CloudProvider[];
  serviceIps: Array<{region: string; location: string; cidrs: string[]}>;
  matrices: Record<string, CloudMatrix>;
};

export type CloudDataRequest = {section: string; provider?: string};

function MarkdownCell({text}: {text: string}) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>;
}

function NoteBlock({note}: {note: string}) {
  return (
    <Admonition type="info" icon="📘" title="Note">
      <MarkdownCell text={note} />
    </Admonition>
  );
}

function PlainCell({children}: {children: React.ReactNode}) {
  return <p>{children}</p>;
}

function AvailabilityCell({cell, strings}: {cell: CloudCell; strings: ReturnType<typeof stringsFor>}) {
  switch (cell.kind) {
    case 'all':
      return (
        <>
          <PlainCell>{strings.all}</PlainCell>
          {cell.extra ? <PlainCell>{strings.plus(cell.extra)}</PlainCell> : null}
          {cell.note ? <NoteBlock note={cell.note} /> : null}
        </>
      );
    case 'none':
    case 'contact':
      return (
        <>
          <PlainCell>{cell.kind === 'none' ? strings.none : strings.contact}</PlainCell>
          {cell.note ? <NoteBlock note={cell.note} /> : null}
        </>
      );
    case 'partial':
      if (!cell.regions || cell.regions.length === 0) {
        throw new Error('[cloud-data] partial availability requires a non-empty regions list');
      }
      return (
        <>
          <PlainCell>{strings.partial}</PlainCell>
          <ul>
            {cell.regions.map((region) => (
              <li key={region}>{region}</li>
            ))}
          </ul>
          {cell.note ? <NoteBlock note={cell.note} /> : null}
        </>
      );
    case 'text':
      return (
        <>
          <MarkdownCell text={cell.text ?? ''} />
          {cell.note ? <NoteBlock note={cell.note} /> : null}
        </>
      );
    default:
      throw new Error('[cloud-data] Unknown availability kind: ' + (cell as {kind?: string}).kind);
  }
}

function rowLabel(row: CloudRow) {
  if (row.href) {
    return <a href={row.href}>{row.label}</a>;
  }
  return row.label;
}

function findProvider(model: CloudDataModel, key: string | undefined): CloudProvider {
  for (const provider of model.providers) {
    if (provider.key === key) return provider;
  }
  throw new Error('[cloud-data] Unknown provider "' + key + '"');
}

function RegionsTable({model, provider}: {model: CloudDataModel; provider?: string}) {
  const found = findProvider(model, provider);
  if (found.regions.length === 0) {
    throw new Error('[cloud-data] Provider ' + found.key + ' has no regions');
  }
  // The merged regions table has no markdown content, so the component serves
  // the exact fragment the `.md` route serves (render.js) — same bytes, same
  // live-page styling. zd-table-scroll is the build-time table wrapper's class.
  return (
    <div
      className="zd-table-scroll"
      dangerouslySetInnerHTML={{__html: renderFragmentHtml(model, {section: 'regions', provider})}}
    />
  );
}

function MatrixTable({model, section}: {model: CloudDataModel; section: string}) {
  const strings = stringsFor(model.locale);
  const matrix = model.matrices[section];
  if (!matrix) throw new Error('[cloud-data] Model has no matrix ' + section);
  if (matrix.rows.length === 0) throw new Error('[cloud-data] Matrix ' + matrix.key + ' has no rows');
  return (
    <div className="zd-table-scroll">
      <table>
        <thead>
          <tr>
            <th><p><strong>{matrix.rowHeader}</strong></p></th>
          {model.providers.map((provider) => (
            <th key={provider.key}><p><strong>{provider.name}</strong></p></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {matrix.rows.map((row, index) => (
          <tr key={row.label ?? index}>
            <td>
              <p>{row.labelHtml ? <span dangerouslySetInnerHTML={{__html: row.labelHtml}} /> : rowLabel(row)}</p>
            </td>
            {model.providers.map((provider) => {
              const cell = row.cells[provider.key];
              if (!cell) {
                throw new Error('[cloud-data] Row "' + (row.label ?? row.labelHtml) + '" has no availability for provider ' + provider.key);
              }
              return (
                <td key={provider.key}>
                  <AvailabilityCell cell={cell} strings={strings} />
                </td>
              );
            })}
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

function IpTable({rows, strings}: {rows: CloudProvider['ipRows']; strings: ReturnType<typeof stringsFor>}) {
  if (rows.length === 0) throw new Error('[cloud-data] IP table has no rows');
  return (
    <div className="zd-table-scroll">
      <table>
      <thead>
        <tr>
          {strings.ipColumns.map((header: string) => (
            <th key={header}><p><strong>{header}</strong></p></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.region ?? index}>
            <td><p>{row.region}</p></td>
            <td><p>{row.location}</p></td>
            <td>
              <p>
                {row.cidrs.map((cidr, cidrIndex) => (
                  <React.Fragment key={cidr}>
                    {cidrIndex > 0 ? ', ' : null}
                    <code>{cidr}</code>
                  </React.Fragment>
                ))}
              </p>
            </td>
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );
}

// Entry point: same request contract as render.js renderFragment.
export function renderFragmentToJsx(model: CloudDataModel, request: CloudDataRequest): React.JSX.Element {
  const strings = stringsFor(model.locale);
  switch (request.section) {
    case 'regions':
      return <RegionsTable model={model} provider={request.provider} />;
    case 'compute-types':
    case 'deployment-options':
    case 'features':
      return <MatrixTable model={model} section={request.section} />;
    case 'service-ips':
      return <IpTable rows={model.serviceIps} strings={strings} />;
    case 'region-ips':
      return <IpTable rows={findProvider(model, request.provider).ipRows} strings={strings} />;
    default:
      throw new Error('[cloud-data] Unknown section: ' + request.section);
  }
}
