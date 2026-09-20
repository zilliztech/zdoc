import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {
  DEFAULT_PRODUCT_DOC_LINK_SOURCE,
  extractProductDocLinks,
  isGitHubApiContentsUrl,
  productDocLinkScope,
  readProductDocLinkSource,
  resolveProductDocLinkGitHubToken,
} from './productDocLinks.ts';

const FIXTURE_SOURCE = `
import { IS_CLOUD_LANGUAGE_EN } from "@/Utils/ProductType";
export { AWS_MARKETPLACE_LINK, GCP_MARKETPLACE_LINK } from "common-components";

export const ZILLIZ_DOC_BASE_URL =
  import.meta.env.VITE_DOC_URL || \`https://docs.zilliz.com\`;

export const ZILLIZ_WEBSITE_BASE_URL = IS_CLOUD_LANGUAGE_EN
  ? \`https://zilliz.com\`
  : \`https://zilliz.com.cn\`;

// multi-line template literal with a locale ternary in between
const EN_DOC = \`https://docs.zilliz.com/docs\`;
const CN_DOC = \`https://docs.zilliz.com.cn/docs\`;

export const GLOBAL_CLUSTER_DOC_LINK = \`\${EN_DOC}/global-cluster-explained\`;

export const SSO_DOC_OKTA_SAML_LINK = \`https://docs.cloud-uat3.zilliz.com/docs/single-sign-on-with-okta\`;

export const MANAGE_MFA_DOC = IS_CLOUD_LANGUAGE_EN
  ? \`\${ZILLIZ_DOC_BASE_URL}/docs/multi-factor-auth\`
  : \`\${ZILLIZ_DOC_BASE_URL}/docs/mfa\`;

export const MARKETPLACE_GUIDE_LINK = \`\${ZILLIZ_DOC_BASE_URL}/docs/subscribe-on-aws-marketplace#troubleshooting\`;

export const SUPPORT_PORTAL_URL = \`https://support.zilliz.com/hc/en-us\`;
export const PRICING_HREF = \`\${ZILLIZ_WEBSITE_BASE_URL}/pricing\`;
export const DATASET_DOWNLOAD_LINK = 'https://assets.zilliz.com/dataset.json';
`;

function urls(entries: ReturnType<typeof extractProductDocLinks>): string[] {
  return entries.map(entry => entry.url);
}

describe('extractProductDocLinks', () => {
  it('extracts primary docs URLs across deployment shapes and merges constants per URL', () => {
    const entries = extractProductDocLinks(FIXTURE_SOURCE);
    const byUrl = new Map(entries.map(entry => [entry.url, entry]));

    // Same URL emitted by two constants across shapes must merge both names.
    expect(byUrl.get('https://docs.zilliz.com/docs/global-cluster-explained')?.constants).toEqual(['GLOBAL_CLUSTER_DOC_LINK']);
    // ZILLIZ_DOC_BASE_URL resolves to the cn host for the zh deployment shape,
    // so the mfa constants exist on both hosts; the en host also carries the
    // fallback from the shapes with the default VITE_DOC_URL.
    expect(byUrl.get('https://docs.zilliz.com/docs/multi-factor-auth')?.constants).toEqual(['MANAGE_MFA_DOC']);
    expect(byUrl.get('https://docs.zilliz.com.cn/docs/mfa')?.constants).toEqual(['MANAGE_MFA_DOC']);
    // Fragments are preserved in the inventory.
    expect(urls(entries)).toContain('https://docs.zilliz.com/docs/subscribe-on-aws-marketplace#troubleshooting');
    expect(urls(entries)).toContain('https://docs.zilliz.com.cn/docs/subscribe-on-aws-marketplace#troubleshooting');
    // Undefined base constants cannot be resolved; their interpolations stay
    // literal and must never leak into the inventory.
    expect(urls(entries).some(url => url.includes('${'))).toBe(false);
    expect(urls(entries).some(url => url.includes('UNDEFINED_PREFIX'))).toBe(false);
    // Entries are sorted by URL for stable reports.
    expect(urls(entries)).toEqual([...urls(entries)].sort((left, right) => left.localeCompare(right)));
  });

  it('flags non-production docs hosts as unknown-docs-domain', () => {
    const entries = extractProductDocLinks(FIXTURE_SOURCE);
    const anomaly = entries.find(entry => entry.url === 'https://docs.cloud-uat3.zilliz.com/docs/single-sign-on-with-okta');
    expect(anomaly?.scope).toBe('unknown-docs-domain');
    expect(anomaly?.constants).toEqual(['SSO_DOC_OKTA_SAML_LINK']);
    expect(entries.filter(entry => entry.scope === 'unknown-docs-domain')).toHaveLength(1);
  });

  it('ignores non-docs hosts entirely', () => {
    const entries = extractProductDocLinks(FIXTURE_SOURCE);
    expect(urls(entries).some(url => url.startsWith('https://support.zilliz.com'))).toBe(false);
    expect(urls(entries).some(url => url.startsWith('https://zilliz.com/'))).toBe(false);
    expect(urls(entries).some(url => url.startsWith('https://assets.zilliz.com'))).toBe(false);
  });

  it('rejects sources that reference no zilliz docs host', () => {
    expect(() => extractProductDocLinks('export const A = "https://example.com/docs";')).toThrow(/does not reference the zilliz docs hosts/u);
  });

  it('rejects sources whose imports are not stubbed', () => {
    const source = `
// upstream docs live at https://docs.zilliz.com
import { SOMETHING } from "other-package";
export const A = \`\${SOMETHING}/docs/a\`;
`;
    expect(() => extractProductDocLinks(source)).toThrow(/imports unexpected module: other-package/u);
  });

  it('rejects sources that evaluate to no docs URLs', () => {
    const source = `
// upstream docs live at https://docs.zilliz.com
import { IS_CLOUD_LANGUAGE_EN } from "@/Utils/ProductType";
export const A = IS_CLOUD_LANGUAGE_EN ? "yes" : "no";
`;
    expect(() => extractProductDocLinks(source)).toThrow(/produced no docs URLs/u);
  });
});

describe('productDocLinkScope', () => {
  it('classifies the owned docs hosts as primary', () => {
    expect(productDocLinkScope('https://docs.zilliz.com/docs/home')).toBe('primary');
    expect(productDocLinkScope('https://docs.zilliz.com.cn/docs/home')).toBe('primary');
  });

  it('classifies other zilliz docs hosts as unknown-docs-domain', () => {
    expect(productDocLinkScope('https://docs.cloud-uat3.zilliz.com/docs/home')).toBe('unknown-docs-domain');
  });
});

describe('readProductDocLinkSource', () => {
  it('reads GitHub API sources with the raw media type and no token header by default', async () => {
    let receivedInit: {headers?: Record<string, string>} | undefined;
    const fetcher = async (url: string, init?: {headers?: Record<string, string>}) => {
      expect(url).toBe(DEFAULT_PRODUCT_DOC_LINK_SOURCE);
      receivedInit = init;
      return {ok: true, status: 200, text: async () => 'export const A = 1;'};
    };
    await expect(readProductDocLinkSource(DEFAULT_PRODUCT_DOC_LINK_SOURCE, '/tmp', fetcher)).resolves.toBe('export const A = 1;');
    expect(receivedInit?.headers?.['Accept']).toBe('application/vnd.github.raw+json');
    expect(receivedInit?.headers?.['Authorization']).toBeUndefined();
  });

  it('sends the bearer token when one is provided', async () => {
    let receivedInit: {headers?: Record<string, string>} | undefined;
    const fetcher = async (_url: string, init?: {headers?: Record<string, string>}) => {
      receivedInit = init;
      return {ok: true, status: 200, text: async () => 'export const A = 1;'};
    };
    await expect(readProductDocLinkSource(DEFAULT_PRODUCT_DOC_LINK_SOURCE, '/tmp', fetcher, {githubToken: 'token-1'})).resolves.toBe('export const A = 1;');
    expect(receivedInit?.headers?.['Authorization']).toBe('Bearer token-1');
  });

  it('fails loudly on non-ok remote reads', async () => {
    const fetcher = async () => ({ok: false, status: 404, text: async () => 'nope'});
    await expect(readProductDocLinkSource('https://example.com/Link.ts', '/tmp', fetcher)).rejects.toThrow(/HTTP 404/u);
  });

  it('explains the missing token when a private GitHub API read fails', async () => {
    const fetcher = async () => ({ok: false, status: 404, text: async () => 'nope'});
    await expect(readProductDocLinkSource(DEFAULT_PRODUCT_DOC_LINK_SOURCE, '/tmp', fetcher)).rejects.toThrow(/provide a token via PRODUCT_DOC_LINKS_GITHUB_TOKEN/u);
  });

  it('reads repository-relative files', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'docs-tooling-product-links-'));
    const fetcher = async () => {
      throw new Error('must not fetch local sources');
    };
    writeFileSync(path.join(root, 'Link.fixture.ts'), 'export const B = 2;');
    await expect(readProductDocLinkSource('Link.fixture.ts', root, fetcher)).resolves.toBe('export const B = 2;');
  });
});

describe('isGitHubApiContentsUrl', () => {
  it('recognizes GitHub API contents endpoints only', () => {
    expect(isGitHubApiContentsUrl(DEFAULT_PRODUCT_DOC_LINK_SOURCE)).toBe(true);
    expect(isGitHubApiContentsUrl('https://api.github.com/repos/o/r/contents/path?ref=main')).toBe(true);
    expect(isGitHubApiContentsUrl('https://raw.githubusercontent.com/o/r/main/path')).toBe(false);
    expect(isGitHubApiContentsUrl('https://api.github.com/repos/o/r/commits/main')).toBe(false);
    expect(isGitHubApiContentsUrl('not a url')).toBe(false);
  });
});

describe('resolveProductDocLinkGitHubToken', () => {
  it('prefers the dedicated variable over the generic GitHub tokens', () => {
    expect(resolveProductDocLinkGitHubToken({
      PRODUCT_DOC_LINKS_GITHUB_TOKEN: 'dedicated',
      GITHUB_TOKEN: 'actions',
      GH_TOKEN: 'cli',
    })).toBe('dedicated');
    expect(resolveProductDocLinkGitHubToken({GITHUB_TOKEN: 'actions', GH_TOKEN: 'cli'})).toBe('actions');
    expect(resolveProductDocLinkGitHubToken({GH_TOKEN: 'cli'})).toBe('cli');
    expect(resolveProductDocLinkGitHubToken({})).toBeNull();
  });
});
