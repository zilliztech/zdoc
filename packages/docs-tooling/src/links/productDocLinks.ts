import { readFileSync } from 'node:fs';

import ts from 'typescript';

import { assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath } from '../validation/ownership.ts';

/**
 * The cloud console source lives in a private repository, so the default
 * source is the GitHub API contents endpoint: it serves raw file contents
 * with the raw media type and accepts a bearer token. Anonymous reads only
 * work if the repository ever becomes public.
 */
export const DEFAULT_PRODUCT_DOC_LINK_SOURCE = 'https://api.github.com/repos/zilliztech/zilliz-cloud-client/contents/packages/cloud/src/consts/Link.ts';

/**
 * Docs hosts the documentation team owns. Any other `docs.*` host under the
 * zilliz domains is extracted as `unknown-docs-domain` so that product links
 * pointed at non-production docs deployments (for example a UAT host) surface
 * in every report until the host is promoted here or fixed in the product.
 */
export const PRODUCT_DOC_HOSTS = ['docs.zilliz.com', 'docs.zilliz.com.cn'] as const;

export type ProductDocLinkScope = 'primary' | 'unknown-docs-domain';

export type ProductDocLinkEntry = {
  url: string;
  scope: ProductDocLinkScope;
  constants: string[];
};

/**
 * Deployment shapes the cloud console is built in. `isEnglishLocale` follows
 * the console language toggle; `docBaseUrl` follows the console build's
 * VITE_DOC_URL, which the zh-CN deployment points at the cn docs host. Every
 * URL below is one the product can emit in some real build, so all four
 * combinations are kept in the inventory.
 */
const DEPLOYMENT_SHAPES = [
  {isEnglishLocale: true, docBaseUrl: 'https://docs.zilliz.com'},
  {isEnglishLocale: true, docBaseUrl: 'https://docs.zilliz.com.cn'},
  {isEnglishLocale: false, docBaseUrl: 'https://docs.zilliz.com'},
  {isEnglishLocale: false, docBaseUrl: 'https://docs.zilliz.com.cn'},
] as const;

const STUB_IMPORTS: Record<string, Record<string, string>> = {
  // `common-components` re-exports non-docs marketplace links; empty strings
  // keep them out of the docs-URL filter instead of hardcoding third-party URLs.
  'common-components': {AWS_MARKETPLACE_LINK: '', GCP_MARKETPLACE_LINK: ''},
};

function stubProductTypeModule(isEnglishLocale: boolean): Record<string, unknown> {
  return {IS_CLOUD_LANGUAGE_EN: isEnglishLocale};
}

function evaluateLinkModule(transpiled: string, isEnglishLocale: boolean, docBaseUrl: string): Record<string, unknown> {
  const module = {exports: {} as Record<string, unknown>};
  const stubRequire = (id: string): Record<string, unknown> => {
    if (id.endsWith('ProductType')) return stubProductTypeModule(isEnglishLocale);
    const stub = STUB_IMPORTS[id];
    if (stub) return stub;
    throw new Error(`Product link source imports unexpected module: ${id}`);
  };
  // `import.meta` is only legal inside a module, so it cannot survive into the
  // Function body; swap it for the injected `__importMeta` parameter instead.
  const executable = transpiled.replace(/import\.meta/gu, '__importMeta');
  if (executable.includes('import.meta')) {
    throw new Error('Product link source still references import.meta after transpile');
  }
  const evaluate = new Function('require', 'module', 'exports', '__importMeta', executable);
  evaluate(stubRequire, module, module.exports, {env: {VITE_DOC_URL: docBaseUrl}});
  return module.exports;
}

export function productDocLinkScope(url: string): ProductDocLinkScope {
  const host = new URL(url).host;
  return (PRODUCT_DOC_HOSTS as readonly string[]).includes(host) ? 'primary' : 'unknown-docs-domain';
}

function isDocsHostUrl(value: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:') return false;
  return parsed.host.startsWith('docs.') && /(^|\.)zilliz\.com$|(^|\.)zilliz\.com\.cn$/u.test(parsed.host);
}

/**
 * Extracts every docs URL the cloud console product UI can reference, by
 * transpiling the console's Link.ts and evaluating it once per deployment
 * shape with stubbed imports. Regex extraction is not reliable here: the file
 * mixes multi-line template literals, locale ternaries, and a build-time
 * VITE_DOC_URL override.
 */
export function extractProductDocLinks(source: string): ProductDocLinkEntry[] {
  if (!source.includes('docs.zilliz')) {
    throw new Error('Product link source does not reference the zilliz docs hosts; refusing to evaluate');
  }
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const byUrl = new Map<string, Set<string>>();
  for (const shape of DEPLOYMENT_SHAPES) {
    const exports = evaluateLinkModule(transpiled, shape.isEnglishLocale, shape.docBaseUrl);
    for (const [name, value] of Object.entries(exports)) {
      if (typeof value !== 'string' || !isDocsHostUrl(value)) continue;
      const constants = byUrl.get(value) ?? new Set<string>();
      constants.add(name);
      byUrl.set(value, constants);
    }
  }
  if (byUrl.size === 0) {
    throw new Error('Product link source evaluation produced no docs URLs; extraction is broken');
  }
  return [...byUrl.entries()]
    .map(([url, constants]) => ({
      url,
      scope: productDocLinkScope(url),
      constants: [...constants].sort((left, right) => left.localeCompare(right)),
    }))
    .sort((left, right) => left.url.localeCompare(right.url));
}

export type SourceFetch = (url: string, init?: {headers?: Record<string, string>}) => Promise<{ok: boolean; status: number; text(): Promise<string>}>;

export function isGitHubApiContentsUrl(source: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(source);
  } catch {
    return false;
  }
  return parsed.host === 'api.github.com' && parsed.pathname.startsWith('/repos/') && parsed.pathname.includes('/contents/');
}

export function resolveProductDocLinkGitHubToken(environment: Record<string, string | undefined> = process.env): string | null {
  return environment.PRODUCT_DOC_LINKS_GITHUB_TOKEN || environment.GITHUB_TOKEN || environment.GH_TOKEN || null;
}

/**
 * Reads the product link source from an https URL or a repository-relative
 * file path. GitHub API contents URLs are read with the raw media type and an
 * optional bearer token, because the upstream repository is private.
 */
export async function readProductDocLinkSource(source: string, repositoryRoot: string, fetcher: SourceFetch, options: {githubToken?: string | null} = {}): Promise<string> {
  if (/^https:\/\//u.test(source)) {
    const headers: Record<string, string> = {};
    if (isGitHubApiContentsUrl(source)) {
      headers['Accept'] = 'application/vnd.github.raw+json';
      if (options.githubToken) headers['Authorization'] = `Bearer ${options.githubToken}`;
    }
    const response = await fetcher(source, {headers});
    if (!response.ok) {
      const missingTokenHint = isGitHubApiContentsUrl(source) && !options.githubToken
        ? '; the source repository is private, so provide a token via PRODUCT_DOC_LINKS_GITHUB_TOKEN, GITHUB_TOKEN, or GH_TOKEN'
        : '';
      throw new Error(`Failed to read product link source ${source}: HTTP ${response.status}${missingTokenHint}`);
    }
    return await response.text();
  }
  assertSafeRepositoryRelativePath(source, 'Product link source');
  const target = resolveOwnedRepositoryPath(repositoryRoot, source, 'Product link source');
  return readFileSync(target, 'utf8');
}
