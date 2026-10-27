import React from 'react';
import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {renderToString} from 'react-dom/server';

const docusaurusContext = vi.hoisted(() => ({
  // typed loosely: tests swap the whole context between locales
  current: {
    siteConfig: {
      customFields: {
        site: 'en',
        integrations: {cloudData: {cmsBaseUrl: 'https://cms.example.test'}},
      },
    },
  } as any,
}));

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => docusaurusContext.current,
  useDocusaurusContext: () => docusaurusContext.current,
}));

import CloudRegions from '../components/CloudRegions';
import CloudFeatures from '../components/CloudFeatures';
import RegionIps from '../components/RegionIps';
import renderModule from './render.js';

const {renderFragment} = renderModule;
import en from './snapshots/en.json';

const model = (en as unknown as {model: any}).model;

const EN_CONTEXT = {
  siteConfig: {
    customFields: {
      site: 'en',
      integrations: {cloudData: {cmsBaseUrl: 'https://cms.example.test'}},
    },
  },
};

const ZH_CONTEXT = {siteConfig: {customFields: {site: 'zh-CN'}}};

function normalizeCell(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // markdown links -> label
    .replace(/<[^>]*>/g, ' ') // stray tags and React comment separators
    .replace(/`/g, '')
    .replace(/\\([|{}<>])/g, '$1') // markdown escapes
    .replace(/(^|\s)- /g, '$1') // GFM list bullets (JSX renders <li> instead)
    .replace(/\s+,/g, ',') // text/element boundary before the CIDR comma
    .replace(/\s+/g, ' ')
    .trim();
}

function cellsFromHtml(html: string): string[] {
  return html
    .split(/<(?:td|th)[^>]*>/)
    .slice(1)
    .map((cell) => normalizeCell(cell));
}

function cellsFromGfm(fragment: string): string[] {
  return fragment
    .split('\n')
    .filter((line) => line.startsWith('|'))
    .filter((line) => !line.split('|').every((cell) => cell.trim() === '' || /^:?-+:?$/.test(cell.trim())))
    .flatMap((line) => line.split('|').slice(1, -1).map((cell) => normalizeCell(cell)));
}

// The `.md` fragment may repeat row labels per GFM line where the React table
// uses rowspan; empty cells (GFM padding) and consecutive duplicates therefore
// compare equal.
function collapseCells(values: string[]): string[] {
  const nonEmpty = values.filter((value) => value !== '');
  return nonEmpty.filter((value, index) => index === 0 || value !== nonEmpty[index - 1]);
}

function fragmentCells(fragment: string): string[] {
  return fragment.startsWith('|') ? cellsFromGfm(fragment) : cellsFromHtml(fragment);
}

// The React table and the `.md` fragment must present the same values in the
// same order — this is the HTML-page / `.md`-route parity guarantee.
function expectParity(element: React.JSX.Element, request: {section: string; provider?: string}) {
  const fragment = renderFragment(model, request);
  expect(collapseCells(cellsFromHtml(renderToString(element))))
    .toEqual(collapseCells(fragmentCells(fragment)));
}

describe('cloud-data components (SSR, snapshot first frame)', () => {
  it('<CloudRegions provider="aws" /> renders the en region table with continent rowspans', () => {
    expectParity(<CloudRegions provider="aws" />, {section: 'regions', provider: 'aws'});
    render(<CloudRegions provider="aws" />);
    expect(screen.getAllByText('us-west-2').length).toBeGreaterThan(0);
    expect(screen.getByText('North America')).toBeDefined();
  });

  it('<CloudFeatures matrix="features" /> renders provider columns and text cells', () => {
    expectParity(<CloudFeatures matrix="features" />, {section: 'features'});
    render(<CloudFeatures matrix="features" />);
    expect(screen.getByText('External Volume')).toBeDefined();
  });

  it('<RegionIps scope="service" /> renders the service IP row', () => {
    expectParity(<RegionIps scope="service" />, {section: 'service-ips'});
    render(<RegionIps scope="service" />);
    expect(screen.getByText('54.200.111.111')).toBeDefined();
  });

  it('<RegionIps provider="azure" /> renders that provider only', () => {
    expectParity(<RegionIps provider="azure" />, {section: 'region-ips', provider: 'azure'});
  });

  it('fails closed on an unknown provider', () => {
    expect(() => renderToString(<CloudRegions provider="nope" />)).toThrow('Unknown provider');
  });

  it('switches to the zh-CN snapshot with the site custom field', () => {
    docusaurusContext.current = ZH_CONTEXT;
    try {
      const {container} = render(<CloudRegions provider="alibaba" />);
      expect(container.textContent).toContain('华东1（杭州）');
    } finally {
      docusaurusContext.current = EN_CONTEXT;
    }
  });
});
