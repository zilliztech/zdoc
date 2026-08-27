import {lstatSync, readFileSync} from 'node:fs';
import path from 'node:path';

import {load} from 'cheerio';
import {resolveSiteProfile} from '@zilliz/site-config';
import {z} from 'zod';

import {assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath} from '../validation/ownership.ts';
import {assertSafeAtomicWriteTargets, writeAtomicRepositoryFiles} from '../validation/atomicFiles.ts';
import {contentRouteRoots, htmlPagesUnder, listUrls} from './check.ts';

type Site = 'en' | 'zh-CN';
type FetchResponse = {ok: boolean; status: number; text(): Promise<string>};
type FetchLike = (url: string | URL, init?: {method?: string; headers?: Record<string, string>; redirect?: 'follow'; signal?: AbortSignal}) => Promise<FetchResponse>;

/** A single broken internal link or anchor, mirroring Docusaurus `BrokenLink`. */
const BrokenLinkSchema = z.object({
  link: z.string().min(1),
  resolvedLink: z.string().min(1),
  anchor: z.boolean(),
  path: z.string().min(1),
}).strict();

// Note: zod 3.25's `z.infer` surfaces `.object()` fields as optional. Define the
// data type explicitly so consumers can rely on required fields after `.parse()`.
export type BrokenLink = {
  link: string;
  resolvedLink: string;
  anchor: boolean;
  path: string;
};

const BrokenLinksSummarySchema = z.object({
  checked_internal_links: z.number().int().nonnegative(),
  broken_links: z.number().int().nonnegative(),
  broken_anchors: z.number().int().nonnegative(),
}).strict();

const canonicalDateTime = z.string().datetime().refine(value => new Date(value).toISOString() === value, {
  message: 'generated_at must be a canonical UTC datetime',
});

export const BrokenLinksReportSchema = z.object({
  schema_version: z.literal(1),
  generated_at: canonicalDateTime,
  site: z.enum(['en', 'zh-CN']),
  workflow_run_url: z.string().url().nullable(),
  local_sitemap_source: z.string().min(1).max(2048),
  summary: BrokenLinksSummarySchema,
  broken_links: z.array(BrokenLinkSchema),
  broken_anchors: z.array(BrokenLinkSchema),
}).strict();

export type BrokenLinksReport = {
  schema_version: 1;
  generated_at: string;
  site: 'en' | 'zh-CN';
  workflow_run_url: string | null;
  local_sitemap_source: string;
  summary: {
    checked_internal_links: number;
    broken_links: number;
    broken_anchors: number;
  };
  broken_links: BrokenLink[];
  broken_anchors: BrokenLink[];
};

/** Parse and validate a broken-links report, typed with required fields. */
export function parseBrokenLinksReport(data: unknown): BrokenLinksReport {
  return BrokenLinksReportSchema.parse(data) as unknown as BrokenLinksReport;
}

type InternalLinkEntry = {
  href: string;
  page: string;
  pagePathname: string;
};

function assertSite(site: string): asserts site is Site {
  if (site !== 'en' && site !== 'zh-CN') throw new Error('site must be en or zh-CN');
}

function resolveOutput(repositoryRoot: string, output: string): string {
  assertSafeRepositoryRelativePath(output, 'Broken-links report output');
  if (!output.endsWith('.md')) throw new Error('Broken-links report output must end in .md');
  const target = resolveOwnedRepositoryPath(repositoryRoot, output, 'Broken-links report output');
  if (lstatSync(target, {throwIfNoEntry: false}) && !lstatSync(target).isFile()) {
    throw new Error('Broken-links report output must be a regular file');
  }
  return target;
}

/**
 * Map an HTML file path relative to the site output dir (e.g. `docs/foo/index.html`)
 * to its route pathname (e.g. `/docs/foo`), matching `trailingSlash: false`.
 */
export function filePathToPathname(pageRelativePath: string): string {
  let normalized = pageRelativePath.replace(/index\.html$/u, '').replace(/\.html$/u, '');
  normalized = normalized.replace(/\/+$/u, '');
  return `/${normalized}`;
}

/** Extract the set of valid route pathnames from absolute sitemap URLs. */
export function sitemapPathnames(urls: readonly string[]): Set<string> {
  const pathnames = new Set<string>();
  for (const url of urls) {
    try {
      const pathname = new URL(url).pathname;
      pathnames.add(pathname.replace(/\/+$/u, '') || '/');
    } catch {
      // Ignore unparseable sitemap entries; they cannot be internal link targets.
    }
  }
  return pathnames;
}

/** Collect anchor ids (heading ids and other non-internal ids) from a page's HTML. */
export function collectPageAnchors(html: string): Set<string> {
  const $ = load(html);
  const anchors = new Set<string>();
  $('[id]').each((_index, element) => {
    const id = $(element).attr('id');
    if (id && !id.startsWith('__')) anchors.add(id);
  });
  return anchors;
}

/**
 * Resolve an internal href against a page pathname the same way Docusaurus does
 * (`parseURLPath`), returning the absolute pathname and optional hash.
 */
export function resolveLinkPath(href: string, pagePathname: string): {pathname: string; hash: string | undefined} {
  const url = new URL(href, `https://docusaurus.invalid${pagePathname}`);
  return {
    pathname: url.pathname.replace(/\/+$/u, '') || '/',
    hash: url.hash ? url.hash.slice(1) : undefined,
  };
}

/**
 * Collect internal `<a href>` entries (non-`http`/`https`, non-protocol links)
 * from rendered HTML pages.
 */
export function collectInternalLinkEntries(
  repositoryRoot: string,
  outputDir: string,
  pages: readonly string[],
): InternalLinkEntry[] {
  const entries: InternalLinkEntry[] = [];
  for (const page of pages) {
    const content = readFileSync(path.join(repositoryRoot, page), 'utf8');
    const pagePathname = filePathToPathname(path.relative(outputDir, page));
    const $ = load(content);
    $('a[href]').each((_index, element) => {
      const href = $(element).attr('href');
      if (!href) return;
      // Skip external links, mailto/tel/javascript links, and pure-hash links
      // (a link that is only a fragment is handled by Docusaurus as a same-page anchor).
      if (/^(https?:)?\/\//u.test(href) || /^(mailto:|tel:|javascript:)/u.test(href)) return;
      entries.push({href, page, pagePathname});
    });
  }
  return entries;
}

/**
 * Detect broken internal links and anchors against a set of valid route pathnames
 * and a per-page anchor set. Mirrors Docusaurus `isPathBrokenLink` / `isAnchorBrokenLink`.
 */
export function detectBrokenLinks(input: {
  pathnames: ReadonlySet<string>;
  anchorsByPathname: ReadonlyMap<string, ReadonlySet<string>>;
  internalLinks: readonly InternalLinkEntry[];
}): {brokenLinks: BrokenLink[]; brokenAnchors: BrokenLink[]; checkedCount: number} {
  const brokenLinks: BrokenLink[] = [];
  const brokenAnchors: BrokenLink[] = [];

  const pathExists = (pathname: string): boolean =>
    input.pathnames.has(pathname) ||
    input.pathnames.has(decodeURI(pathname)) ||
    input.pathnames.has(`${pathname}/`) ||
    input.pathnames.has(`${decodeURI(pathname)}/`);

  const anchorExists = (pathname: string, hash: string): boolean => {
    const anchors = input.anchorsByPathname.get(pathname)
      ?? input.anchorsByPathname.get(`${pathname}/`);
    if (!anchors) return false;
    return anchors.has(hash) || anchors.has(decodeURIComponent(hash));
  };

  for (const entry of input.internalLinks) {
    const {pathname, hash} = resolveLinkPath(entry.href, entry.pagePathname);
    if (hash === undefined && pathname === entry.pagePathname) continue; // self link, no fragment
    if (!pathExists(pathname)) {
      brokenLinks.push({
        link: entry.href,
        resolvedLink: hash === undefined ? pathname : `${pathname}#${hash}`,
        anchor: false,
        path: entry.pagePathname,
      });
    } else if (hash !== undefined && hash !== '' && !anchorExists(pathname, hash)) {
      brokenAnchors.push({
        link: entry.href,
        resolvedLink: `${pathname}#${hash}`,
        anchor: true,
        path: entry.pagePathname,
      });
    }
  }

  return {brokenLinks, brokenAnchors, checkedCount: input.internalLinks.length};
}

export async function checkBrokenLinks(
  options: {repositoryRoot: string; site: string; output: string},
  dependencies: {fetch?: FetchLike; now?: () => Date; write?: (message: string) => void; environment?: Record<string, string | undefined>} = {},
): Promise<BrokenLinksReport> {
  assertSite(options.site);
  const profile = resolveSiteProfile(options.site);
  const output = resolveOutput(options.repositoryRoot, options.output);
  const now = (dependencies.now ?? (() => new Date()))();
  const outputDirectory = path.posix.dirname(options.output);
  const jsonOutput = options.output.replace(/\.md$/u, '.json');
  const reportOutputs = [options.output, jsonOutput];
  assertSafeAtomicWriteTargets(options.repositoryRoot, reportOutputs, 'Broken-links report output');
  const environment = dependencies.environment ?? process.env;
  const fetcher = dependencies.fetch ?? (globalThis.fetch as unknown as FetchLike);
  const write = dependencies.write ?? (message => process.stdout.write(`${message}\n`));

  const localSource = environment.LINK_CHECKS_LOCAL_SITEMAP || `${profile.outputDir}/sitemap.xml`;
  const local = await listUrls(localSource, options.repositoryRoot, fetcher);
  if (local.length === 0) throw new Error('Local sitemap contains no documentation routes');

  const routeRoots = contentRouteRoots(profile.content.map(item => item.routeBasePath));
  const renderedPages = routeRoots.flatMap(routeRoot => htmlPagesUnder(options.repositoryRoot, path.posix.join(profile.outputDir, routeRoot)));
  if (renderedPages.length === 0) throw new Error('No rendered HTML pages exist below the configured content route roots');

  const pathnames = sitemapPathnames(local);
  const anchorsByPathname = new Map<string, ReadonlySet<string>>();
  for (const page of renderedPages) {
    const content = readFileSync(path.join(options.repositoryRoot, page), 'utf8');
    anchorsByPathname.set(filePathToPathname(path.relative(profile.outputDir, page)), collectPageAnchors(content));
  }

  const internalLinks = collectInternalLinkEntries(options.repositoryRoot, profile.outputDir, renderedPages);
  const {brokenLinks, brokenAnchors, checkedCount} = detectBrokenLinks({pathnames, anchorsByPathname, internalLinks});

  const report = parseBrokenLinksReport({
    schema_version: 1,
    generated_at: now.toISOString(),
    site: options.site,
    workflow_run_url: environment.GITHUB_REPOSITORY && environment.GITHUB_RUN_ID
      ? `${environment.GITHUB_SERVER_URL || 'https://github.com'}/${environment.GITHUB_REPOSITORY}/actions/runs/${environment.GITHUB_RUN_ID}`
      : null,
    local_sitemap_source: localSource,
    summary: {
      checked_internal_links: checkedCount,
      broken_links: brokenLinks.length,
      broken_anchors: brokenAnchors.length,
    },
    broken_links: brokenLinks,
    broken_anchors: brokenAnchors,
  });

  writeAtomicRepositoryFiles(options.repositoryRoot, [
    {path: options.output, contents: renderBrokenLinksMarkdown(report)},
    {path: jsonOutput, contents: JSON.stringify(report, null, 2)},
  ], 'Broken-links report output');

  write(`Internal links checked: ${report.summary.checked_internal_links}`);
  write(`Broken links: ${report.summary.broken_links}`);
  write(`Broken anchors: ${report.summary.broken_anchors}`);
  write(`Broken-links report written to ${path.relative(options.repositoryRoot, output)}`);
  return report;
}

export function renderBrokenLinksMarkdown(report: BrokenLinksReport): string {
  const renderItem = (item: BrokenLink): string => `- \`${item.link}\` (resolved as: \`${item.resolvedLink}\`) on \`${item.path}\``;
  return [
    '# Internal Broken Links Report',
    '',
    `Generated: ${report.generated_at}`,
    `Workflow run: ${report.workflow_run_url ?? 'None'}`,
    `Site: ${report.site}`,
    '',
    '## Summary',
    '',
    `- Internal links checked: ${report.summary.checked_internal_links}`,
    `- Broken links: ${report.summary.broken_links}`,
    `- Broken anchors: ${report.summary.broken_anchors}`,
    '',
    '## Broken Links',
    '',
    ...(report.broken_links.length === 0 ? ['- None'] : report.broken_links.map(renderItem)),
    '',
    '## Broken Anchors',
    '',
    ...(report.broken_anchors.length === 0 ? ['- None'] : report.broken_anchors.map(renderItem)),
  ].join('\n');
}
