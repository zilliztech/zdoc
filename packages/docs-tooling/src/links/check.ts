import {existsSync, lstatSync, readFileSync, readdirSync, realpathSync} from 'node:fs';
import path from 'node:path';

import {XMLParser} from 'fast-xml-parser';
import {resolveSiteProfile} from '@zilliz/site-config';

import {assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath} from '../validation/ownership.ts';
import {assertSafeAtomicWriteTargets, writeAtomicRepositoryFiles} from '../validation/atomicFiles.ts';

type Site = 'en' | 'zh-CN';
type LinkEntry = {url: string; page?: string; pages?: string[]; status?: number; error?: string};
type FetchResponse = {ok: boolean; status: number; text(): Promise<string>};
type FetchLike = (url: string | URL, init?: {method?: string; headers?: Record<string, string>}) => Promise<FetchResponse>;

const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

function normalizeUrl(value: string): string {
  return value.replace(/\/+$/u, '') + '/';
}

function assertSite(site: string): asserts site is Site {
  if (site !== 'en' && site !== 'zh-CN') throw new Error('site must be en or zh-CN');
}

function assertNoSymlinks(repositoryRoot: string, target: string, label: string): void {
  const unresolvedRoot = path.resolve(repositoryRoot);
  const relative = path.relative(unresolvedRoot, path.resolve(target));
  if (relative === '' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`${label} escapes the repository root`);
  }
  const root = realpathSync(repositoryRoot);
  let current = root;
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    if (!existsSync(current)) break;
    if (lstatSync(current).isSymbolicLink()) throw new Error(`${label} must not use symlinks`);
  }
}

function resolveOutput(repositoryRoot: string, output: string): string {
  assertSafeRepositoryRelativePath(output, 'Link-check report output');
  if (!output.endsWith('.md')) throw new Error('Link-check report output must end in .md');
  const target = resolveOwnedRepositoryPath(repositoryRoot, output, 'Link-check report output');
  assertNoSymlinks(repositoryRoot, target, 'Link-check report output');
  if (existsSync(target) && (!lstatSync(target).isFile() || lstatSync(target).isSymbolicLink())) {
    throw new Error('Link-check report output must be a regular non-symlink file');
  }
  return target;
}

async function fetchTextWithRetries(url: string, fetcher: FetchLike, retries = 3): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetcher(url, {headers: {'Accept-Encoding': 'identity'}});
      if (!response.ok) throw new Error(`Request failed with HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < retries) await sleep(attempt * 1000);
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

function sitemapUrls(xml: string): string[] {
  const parsed = new XMLParser().parse(xml);
  const entries = parsed?.urlset?.url;
  if (!entries) return [];
  return (Array.isArray(entries) ? entries : [entries])
    .map(entry => entry?.loc)
    .filter((value): value is string => typeof value === 'string')
    .map(value => new URL(value).href);
}

async function listUrls(source: string, repositoryRoot: string, fetcher: FetchLike): Promise<string[]> {
  if (/^https?:\/\//u.test(source)) {
    const sitemapUrl = source.endsWith('.xml') ? source : `${normalizeUrl(source)}sitemap.xml`;
    return sitemapUrls(await fetchTextWithRetries(sitemapUrl, fetcher));
  }
  assertSafeRepositoryRelativePath(source, 'Local sitemap');
  const target = resolveOwnedRepositoryPath(repositoryRoot, source, 'Local sitemap');
  assertNoSymlinks(repositoryRoot, target, 'Local sitemap');
  if (!existsSync(target) || !lstatSync(target).isFile()) throw new Error(`Local sitemap does not exist: ${source}`);
  return sitemapUrls(readFileSync(target, 'utf8'));
}

function htmlPagesUnder(repositoryRoot: string, directory: string): string[] {
  const absolute = resolveOwnedRepositoryPath(repositoryRoot, directory, 'Site build directory');
  if (!existsSync(absolute)) return [];
  assertNoSymlinks(repositoryRoot, absolute, 'Site build directory');
  const pages: string[] = [];
  const visit = (current: string): void => {
    for (const entry of readdirSync(current, {withFileTypes: true})) {
      const target = path.join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Site build input must not use symlinks');
      if (entry.isDirectory()) visit(target);
      else if (entry.isFile() && entry.name.endsWith('.html')) pages.push(path.relative(repositoryRoot, target));
    }
  };
  visit(absolute);
  return pages;
}

function collectExternalLinkEntries(repositoryRoot: string, outputDir: string): LinkEntry[] {
  const pages = [
    ...htmlPagesUnder(repositoryRoot, `${outputDir}/docs`),
    ...htmlPagesUnder(repositoryRoot, `${outputDir}/reference`),
  ];
  const entries: LinkEntry[] = [];
  for (const page of pages) {
    const content = readFileSync(path.join(repositoryRoot, page), 'utf8');
    for (const match of content.matchAll(/<a .* href="([^"]+)"/gu)) {
      if (match[1].startsWith('http')) entries.push({url: match[1], page: path.relative(outputDir, page)});
    }
  }
  return entries;
}

function uniqueLinkEntries(entries: LinkEntry[]): LinkEntry[] {
  const byUrl = new Map<string, LinkEntry>();
  for (const entry of entries) {
    const existing = byUrl.get(entry.url) ?? {url: entry.url, pages: []};
    if (entry.page && !existing.pages?.includes(entry.page)) existing.pages?.push(entry.page);
    byUrl.set(entry.url, existing);
  }
  return [...byUrl.values()];
}

function groupBrokenExternalLinks(externalLinks: LinkEntry[]) {
  const byUrl = new Map<string, {url: string; status: number | null; error: string | null; pages: string[]}>();
  for (const item of externalLinks) {
    const entry = byUrl.get(item.url) ?? {url: item.url, status: item.status ?? null, error: item.error ?? null, pages: []};
    if (!entry.status && item.status) entry.status = item.status;
    if (!entry.error && item.error) entry.error = item.error;
    for (const page of item.pages ?? (item.page ? [item.page] : [])) if (!entry.pages.includes(page)) entry.pages.push(page);
    byUrl.set(item.url, entry);
  }
  return [...byUrl.values()].sort((left, right) => left.url.localeCompare(right.url));
}

export function resolveWorkflowRunUrl(environment: Record<string, string | undefined> = process.env): string | null {
  if (environment.GITHUB_RUN_URL) return environment.GITHUB_RUN_URL;
  if (!environment.GITHUB_REPOSITORY || !environment.GITHUB_RUN_ID) return null;
  return `${environment.GITHUB_SERVER_URL || 'https://github.com'}/${environment.GITHUB_REPOSITORY}/actions/runs/${environment.GITHUB_RUN_ID}`;
}

export function buildLinkCheckReport({generatedAt = new Date().toISOString(), remoteSitemapSource, localSitemapSource, remoteUrls, localUrls, externalLinks, checkedExternalLinks = externalLinks, workflowRunUrl = resolveWorkflowRunUrl()}: any) {
  const deleted = remoteUrls.filter((url: string) => !localUrls.includes(url));
  const added = localUrls.filter((url: string) => !remoteUrls.includes(url));
  const brokenExternalLinks = groupBrokenExternalLinks(externalLinks);
  return {
    generated_at: generatedAt,
    workflow_run_url: workflowRunUrl,
    remote_sitemap_source: remoteSitemapSource,
    local_sitemap_source: localSitemapSource,
    summary: {
      deleted_links: deleted.length,
      added_links: added.length,
      external_links: new Set(checkedExternalLinks.map((item: LinkEntry) => item.url)).size,
      broken_external_links: brokenExternalLinks.length,
    },
    deleted,
    added,
    broken_external_links: brokenExternalLinks,
  };
}

function listItems(items: any[], renderItem: (item: any) => string, limit = 10): string {
  if (!items.length) return '- None';
  const visible = items.slice(0, limit).map(renderItem);
  if (items.length > visible.length) visible.push(`- ...and ${items.length - visible.length} more`);
  return visible.join('\n');
}

export function renderLinkCheckMarkdown(report: any): string {
  const lines = ['# Link Checks', '', `Generated: ${report.generated_at}`];
  if (report.workflow_run_url) lines.push(`Workflow run: ${report.workflow_run_url}`);
  lines.push(`Remote sitemap: ${report.remote_sitemap_source}`, `Local sitemap: ${report.local_sitemap_source}`, '', '## Summary', '');
  lines.push(`- Deleted routes: ${report.summary.deleted_links}`, `- Added routes: ${report.summary.added_links}`, `- External URLs checked: ${report.summary.external_links}`, `- Broken external URLs: ${report.summary.broken_external_links}`, '');
  lines.push('## Deleted Routes', '', listItems(report.deleted, url => `- ${url}`), '', '## Added Routes', '', listItems(report.added, url => `- ${url}`), '', '## Broken External URLs', '');
  lines.push(listItems(report.broken_external_links, item => {
    const status = item.status ? `HTTP ${item.status}` : item.error;
    const pages = item.pages.slice(0, 3).join(', ');
    const suffix = item.pages.length > 3 ? `, ...and ${item.pages.length - 3} more` : '';
    return `- ${item.url} (${status}) on ${pages}${suffix}`;
  }));
  return lines.join('\n');
}

export async function checkLinks(options: {repositoryRoot: string; site: string; output: string}, dependencies: {fetch?: FetchLike; now?: () => Date; write?: (message: string) => void; environment?: Record<string, string | undefined>} = {}): Promise<any> {
  assertSite(options.site);
  const profile = resolveSiteProfile(options.site);
  const output = resolveOutput(options.repositoryRoot, options.output);
  const now = (dependencies.now ?? (() => new Date()))();
  const outputDirectory = path.posix.dirname(options.output);
  const jsonOutput = options.output.replace(/\.md$/u, '.json');
  const stamp = now.getTime();
  const timestampedMarkdown = path.posix.join(outputDirectory, `report_${stamp}.md`);
  const timestampedJson = path.posix.join(outputDirectory, `report_${stamp}.json`);
  const reportOutputs = [options.output, jsonOutput, timestampedMarkdown, timestampedJson];
  assertSafeAtomicWriteTargets(options.repositoryRoot, reportOutputs, 'Link-check report output');
  const environment = dependencies.environment ?? process.env;
  const fetcher = dependencies.fetch ?? (globalThis.fetch as unknown as FetchLike);
  const write = dependencies.write ?? (message => process.stdout.write(`${message}\n`));
  const remoteSource = environment.LINK_CHECKS_REMOTE_SITEMAP || normalizeUrl(environment.LINK_CHECKS_REMOTE_BASE_URL || profile.url);
  const localSource = environment.LINK_CHECKS_LOCAL_SITEMAP || `${profile.outputDir}/sitemap.xml`;
  const remote = await listUrls(remoteSource, options.repositoryRoot, fetcher);
  const local = await listUrls(localSource, options.repositoryRoot, fetcher);
  const externalLinks = uniqueLinkEntries(collectExternalLinkEntries(options.repositoryRoot, profile.outputDir));
  const broken: LinkEntry[] = [];
  await Promise.all(externalLinks.map(async link => {
    try {
      const response = await fetcher(link.url.split('|')[0], {method: 'HEAD'});
      if (response.status >= 400) broken.push({...link, status: response.status});
    } catch (error) {
      broken.push({...link, error: error instanceof Error ? error.message : String(error)});
    }
  }));
  const report = buildLinkCheckReport({
    generatedAt: now.toISOString(),
    remoteSitemapSource: remoteSource,
    localSitemapSource: localSource,
    remoteUrls: remote,
    localUrls: local,
    checkedExternalLinks: externalLinks,
    externalLinks: broken,
    workflowRunUrl: resolveWorkflowRunUrl(environment),
  });
  const markdown = renderLinkCheckMarkdown(report);
  const json = JSON.stringify(report, null, 2);
  writeAtomicRepositoryFiles(options.repositoryRoot, [
    {path: options.output, contents: markdown},
    {path: jsonOutput, contents: json},
    {path: timestampedMarkdown, contents: markdown},
    {path: timestampedJson, contents: json},
  ], 'Link-check report output');
  write(`Deleted links: ${report.summary.deleted_links}`);
  write(`Added links: ${report.summary.added_links}`);
  write(`Total external links: ${report.summary.external_links}`);
  write(`Broken links: ${report.summary.broken_external_links}`);
  write(`Link-check report written to ${path.relative(options.repositoryRoot, output)}`);
  return report;
}
