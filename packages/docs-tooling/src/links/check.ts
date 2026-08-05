import {existsSync, lstatSync, readFileSync, readdirSync, realpathSync} from 'node:fs';
import path from 'node:path';

import {load} from 'cheerio';
import {XMLParser} from 'fast-xml-parser';
import {resolveSiteProfile} from '@zilliz/site-config';
import {z} from 'zod';

import {assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath} from '../validation/ownership.ts';
import {assertSafeAtomicWriteTargets, writeAtomicRepositoryFiles} from '../validation/atomicFiles.ts';

type Site = 'en' | 'zh-CN';
type LinkEntry = {url: string; page?: string; pages?: string[]; status?: number; error?: string};
type FetchResponse = {ok: boolean; status: number; text(): Promise<string>};
type FetchLike = (url: string | URL, init?: {method?: string; headers?: Record<string, string>; redirect?: 'follow'; signal?: AbortSignal}) => Promise<FetchResponse>;

export type ExternalClassification = 'healthy' | 'expired' | 'blocked' | 'transient' | 'other';

const ExternalObservationSchema = z.object({
  url: z.string().url(),
  classification: z.enum(['healthy', 'expired', 'blocked', 'transient', 'other']),
  status: z.number().int().min(100).max(599).nullable(),
  error: z.string().min(1).max(240).nullable(),
  pages: z.array(z.string().min(1).max(240)).max(5),
  page_count: z.number().int().nonnegative(),
}).strict().superRefine((observation, context) => {
  if (observation.status === null && observation.error === null) {
    context.addIssue({code: z.ZodIssueCode.custom, message: 'External observations require a status or error'});
  }
  if (observation.page_count < observation.pages.length) {
    context.addIssue({code: z.ZodIssueCode.custom, message: 'External observation page_count must include retained pages'});
  }
});

export type ExternalObservation = z.infer<typeof ExternalObservationSchema>;

const SummarySchema = z.object({
  deleted_routes: z.number().int().nonnegative(),
  added_routes: z.number().int().nonnegative(),
  checked_external_links: z.number().int().nonnegative(),
  healthy_external_links: z.number().int().nonnegative(),
  expired_external_links: z.number().int().nonnegative(),
  blocked_external_links: z.number().int().nonnegative(),
  transient_external_links: z.number().int().nonnegative(),
  other_external_links: z.number().int().nonnegative(),
}).strict();

const canonicalDateTime = z.string().datetime().refine(value => new Date(value).toISOString() === value, {
  message: 'generated_at must be a canonical UTC datetime',
});
const nullableSha = z.string().regex(/^[0-9a-f]{40}$/u).nullable();
const observationBucket = (classification: Exclude<ExternalClassification, 'healthy'>) => ExternalObservationSchema.refine(
  observation => observation.classification === classification,
  {message: `Observation must be classified as ${classification}`},
);

export const LinkCheckReportSchema = z.object({
  schema_version: z.literal(2),
  generated_at: canonicalDateTime,
  tooling_sha: nullableSha,
  content_sha: nullableSha,
  workflow_run_url: z.string().url().nullable(),
  remote_sitemap_source: z.string().min(1).max(2048),
  local_sitemap_source: z.string().min(1).max(2048),
  summary: SummarySchema,
  deleted_routes: z.array(z.string().url()),
  added_routes: z.array(z.string().url()),
  expired_external_links: z.array(observationBucket('expired')),
  blocked_external_links: z.array(observationBucket('blocked')),
  transient_external_links: z.array(observationBucket('transient')),
  other_external_links: z.array(observationBucket('other')),
}).strict().superRefine((report, context) => {
  if ((report.tooling_sha === null) !== (report.content_sha === null)) {
    context.addIssue({code: z.ZodIssueCode.custom, message: 'tooling_sha and content_sha must both be null or both be valid'});
  }
});

export type LinkCheckReport = z.infer<typeof LinkCheckReportSchema>;

type ExternalResult = {
  url: string;
  page?: string;
  pages?: readonly string[];
  status: number | null;
  error: string | null;
  page_count?: number;
};

type ProbedExternalObservation = ExternalResult & {
  classification: ExternalClassification;
  pages: readonly string[];
  page_count: number;
};

type BuildLinkCheckReportInput = {
  generatedAt?: string;
  toolingSha: string | null;
  contentSha: string | null;
  remoteSitemapSource: string;
  localSitemapSource: string;
  remoteUrls: readonly string[];
  localUrls: readonly string[];
  checkedExternalLinks: readonly {url: string}[];
  observations: readonly ExternalResult[];
  workflowRunUrl?: string | null;
};

const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));
const FALLBACK_STATUSES = new Set([401, 403, 405, 501]);
const RETRYABLE_STATUSES = new Set([408, 425, 429]);

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

export function contentRouteRoots(routeBasePaths: readonly string[]): string[] {
  const normalized = [...new Set(routeBasePaths.map(routeBasePath => {
    const trimmed = routeBasePath.replace(/^\/+|\/+$/gu, '');
    return trimmed === '.' ? '' : trimmed;
  }))];
  return normalized.filter(candidate => !normalized.some(ancestor => (
    ancestor !== candidate && (ancestor === '' || candidate.startsWith(`${ancestor}/`))
  )));
}

function collectExternalLinkEntries(repositoryRoot: string, outputDir: string, pages: readonly string[]): LinkEntry[] {
  const entries: LinkEntry[] = [];
  for (const page of pages) {
    const content = readFileSync(path.join(repositoryRoot, page), 'utf8');
    const $ = load(content);
    $('a[href]').each((_index, element) => {
      const url = $(element).attr('href');
      if (url?.startsWith('http')) entries.push({url, page: path.relative(outputDir, page)});
    });
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

async function forEachConcurrent<T>(items: readonly T[], concurrency: number, visit: (item: T) => Promise<void>): Promise<void> {
  let nextIndex = 0;
  const worker = async (): Promise<void> => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      await visit(items[index]);
    }
  };
  await Promise.all(Array.from({length: Math.min(concurrency, items.length)}, worker));
}

async function requestExternalLink(url: string, method: 'HEAD' | 'GET', fetcher: FetchLike, timeoutMs: number): Promise<FetchResponse> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    return await fetcher(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: method === 'GET'
        ? {'Accept-Encoding': 'identity', Range: 'bytes=0-0'}
        : {'Accept-Encoding': 'identity'},
    });
  } catch (error) {
    if (timedOut) throw new Error(`request timed out after ${timeoutMs}ms`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function sanitizeExternalError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const sanitized = message
    .replace(/[\u0000-\u001f\u007f-\u009f]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
  return (sanitized || 'External link request failed').slice(0, 240);
}

function isRetryableStatus(status: number): boolean {
  return RETRYABLE_STATUSES.has(status) || status >= 500;
}

async function probeExternalLink(url: string, fetcher: FetchLike, timeoutMs: number, attempts: number): Promise<{status: number | null; error: string | null}> {
  new URL(url);
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 3) {
    throw new Error('External link attempts must be an integer between 1 and 3');
  }

  let result: {status: number | null; error: string | null} = {status: null, error: 'External link request failed'};
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      let response = await requestExternalLink(url, 'HEAD', fetcher, timeoutMs);
      if (FALLBACK_STATUSES.has(response.status)) {
        response = await requestExternalLink(url, 'GET', fetcher, timeoutMs);
      }
      result = {status: response.status, error: null};
      if (!isRetryableStatus(response.status)) return result;
    } catch (error) {
      result = {status: null, error: sanitizeExternalError(error)};
    }
  }
  return result;
}

export function classifyExternalResult(result: {status: number | null; error: string | null}): ExternalClassification {
  if (result.error !== null) return 'transient';
  const status = result.status;
  if (status !== null && status >= 200 && status < 400) return 'healthy';
  if (status === 404 || status === 410) return 'expired';
  if (status === 401 || status === 403) return 'blocked';
  if (status !== null && ([408, 425, 429].includes(status) || status >= 500)) return 'transient';
  return 'other';
}

function groupExternalObservations(observations: readonly ExternalResult[]): ExternalObservation[] {
  const byUrl = new Map<string, {url: string; status: number | null; error: string | null; pages: Set<string>; pageCount: number}>();
  for (const item of observations) {
    const itemPages = item.pages ?? (item.page ? [item.page] : []);
    const entry = byUrl.get(item.url) ?? {url: item.url, status: item.status, error: item.error, pages: new Set<string>(), pageCount: 0};
    if (entry.status === null && item.status !== null) entry.status = item.status;
    if (entry.error === null && item.error !== null) entry.error = item.error;
    for (const page of itemPages) entry.pages.add(page);
    entry.pageCount = Math.max(entry.pageCount, item.page_count ?? itemPages.length);
    byUrl.set(item.url, entry);
  }
  return [...byUrl.values()].map(item => {
    const pages = [...item.pages].sort((left, right) => left.localeCompare(right));
    return {
      url: item.url,
      classification: classifyExternalResult(item),
      status: item.status,
      error: item.error,
      pages: pages.slice(0, 5),
      page_count: Math.max(item.pageCount, pages.length),
    };
  }).sort((left, right) => left.url.localeCompare(right.url));
}

export function resolveWorkflowRunUrl(environment: Record<string, string | undefined> = process.env): string | null {
  if (environment.GITHUB_RUN_URL) return environment.GITHUB_RUN_URL;
  if (!environment.GITHUB_REPOSITORY || !environment.GITHUB_RUN_ID) return null;
  return `${environment.GITHUB_SERVER_URL || 'https://github.com'}/${environment.GITHUB_REPOSITORY}/actions/runs/${environment.GITHUB_RUN_ID}`;
}

function resolveReportIdentity(environment: Record<string, string | undefined>): {toolingSha: string | null; contentSha: string | null} {
  const toolingSha = environment.LINK_CHECKS_TOOLING_SHA;
  const contentSha = environment.LINK_CHECKS_CONTENT_SHA;
  if (toolingSha === undefined && contentSha === undefined) return {toolingSha: null, contentSha: null};
  if (!toolingSha || !contentSha || !/^[0-9a-f]{40}$/u.test(toolingSha) || !/^[0-9a-f]{40}$/u.test(contentSha)) {
    throw new Error('LINK_CHECKS_TOOLING_SHA and LINK_CHECKS_CONTENT_SHA must both be valid 40-character lowercase SHAs');
  }
  return {toolingSha, contentSha};
}

export function buildLinkCheckReport({
  generatedAt = new Date().toISOString(),
  toolingSha,
  contentSha,
  remoteSitemapSource,
  localSitemapSource,
  remoteUrls,
  localUrls,
  checkedExternalLinks,
  observations,
  workflowRunUrl = resolveWorkflowRunUrl(),
}: BuildLinkCheckReportInput): LinkCheckReport {
  const deletedRoutes = remoteUrls.filter(url => !localUrls.includes(url)).sort((left, right) => left.localeCompare(right));
  const addedRoutes = localUrls.filter(url => !remoteUrls.includes(url)).sort((left, right) => left.localeCompare(right));
  const grouped = groupExternalObservations(observations);
  const expiredExternalLinks = grouped.filter(item => item.classification === 'expired');
  const blockedExternalLinks = grouped.filter(item => item.classification === 'blocked');
  const transientExternalLinks = grouped.filter(item => item.classification === 'transient');
  const otherExternalLinks = grouped.filter(item => item.classification === 'other');
  const nonHealthyUrls = new Set([...expiredExternalLinks, ...blockedExternalLinks, ...transientExternalLinks, ...otherExternalLinks].map(item => item.url));
  const checkedUrls = new Set(checkedExternalLinks.map(item => item.url));
  const healthyExternalLinks = [...checkedUrls].filter(url => !nonHealthyUrls.has(url)).length;
  return LinkCheckReportSchema.parse({
    schema_version: 2,
    generated_at: generatedAt,
    tooling_sha: toolingSha,
    content_sha: contentSha,
    workflow_run_url: workflowRunUrl,
    remote_sitemap_source: remoteSitemapSource,
    local_sitemap_source: localSitemapSource,
    summary: {
      deleted_routes: deletedRoutes.length,
      added_routes: addedRoutes.length,
      checked_external_links: checkedUrls.size,
      healthy_external_links: healthyExternalLinks,
      expired_external_links: expiredExternalLinks.length,
      blocked_external_links: blockedExternalLinks.length,
      transient_external_links: transientExternalLinks.length,
      other_external_links: otherExternalLinks.length,
    },
    deleted_routes: deletedRoutes,
    added_routes: addedRoutes,
    expired_external_links: expiredExternalLinks,
    blocked_external_links: blockedExternalLinks,
    transient_external_links: transientExternalLinks,
    other_external_links: otherExternalLinks,
  });
}

const SECTION_EXPLANATIONS = {
  expired: 'These URLs returned HTTP 404 or 410. They are likely removed or permanently unavailable and should be corrected, replaced, or removed.',
  blocked: 'These URLs returned HTTP 401 or 403. The scanner was denied access, so this does not prove the links are broken; review them only if users also cannot open them.',
  transient: 'These URLs failed because of network errors, timeouts, or retryable HTTP responses such as 408, 425, 429, or 5xx. They are not confirmed broken and should be checked again in a later run.',
  other: 'These URLs returned non-success responses that are not classified as expired, blocked, or transient. Review them manually to determine whether the response is expected.',
  deleted: 'These routes exist in the production sitemap but are absent from the current `dev` build. They may represent intended removals or renames, or unexpected content loss.',
  added: 'These routes exist in the current `dev` build but not in the production sitemap. They are expected to become public after deployment, unless they represent unintended new routes.',
} as const;

function renderItems<T>(items: readonly T[], renderItem: (item: T) => string): string {
  return items.length === 0 ? '- None' : items.map(renderItem).join('\n');
}

export function renderLinkCheckMarkdown(report: LinkCheckReport): string {
  const renderExternalItem = (item: ExternalObservation): string => {
    const result = item.status === null ? `Error: ${item.error}` : `HTTP ${item.status}`;
    return [
      `- ${item.url}`,
      `  - Result: ${result}`,
      `  - Referring pages: ${item.pages.length === 0 ? 'None' : item.pages.join(', ')}`,
      `  - Pages shown: ${item.pages.length} of ${item.page_count}`,
    ].join('\n');
  };
  const section = <T>(title: string, explanation: string, items: readonly T[], renderItem: (item: T) => string): string[] => [
    `## ${title}`,
    '',
    `> ${explanation}`,
    '',
    renderItems(items, renderItem),
  ];
  const lines = [
    '# Documentation Site Change & Link Health Report',
    '',
    `Generated: ${report.generated_at}`,
    `Workflow run: ${report.workflow_run_url ?? 'None'}`,
    `Tooling SHA: ${report.tooling_sha ?? 'None'}`,
    `Content SHA: ${report.content_sha ?? 'None'}`,
    `Remote sitemap: ${report.remote_sitemap_source}`,
    `Local sitemap: ${report.local_sitemap_source}`,
    '',
    '## Summary',
    '',
    `- Deleted routes: ${report.summary.deleted_routes}`,
    `- Added routes: ${report.summary.added_routes}`,
    `- External URLs checked: ${report.summary.checked_external_links}`,
    `- Healthy external URLs: ${report.summary.healthy_external_links}`,
    `- Confirmed expired external URLs: ${report.summary.expired_external_links}`,
    `- Blocked external URLs: ${report.summary.blocked_external_links}`,
    `- Transient external URLs: ${report.summary.transient_external_links}`,
    `- Other external URL responses: ${report.summary.other_external_links}`,
    '',
    ...section('Confirmed Expired External URLs', SECTION_EXPLANATIONS.expired, report.expired_external_links, renderExternalItem),
    '',
    ...section('Blocked External URLs', SECTION_EXPLANATIONS.blocked, report.blocked_external_links, renderExternalItem),
    '',
    ...section('Transient External URLs', SECTION_EXPLANATIONS.transient, report.transient_external_links, renderExternalItem),
    '',
    ...section('Other External URL Responses', SECTION_EXPLANATIONS.other, report.other_external_links, renderExternalItem),
    '',
    ...section('Deleted Routes', SECTION_EXPLANATIONS.deleted, report.deleted_routes, url => `- ${url}`),
    '',
    ...section('Added Routes', SECTION_EXPLANATIONS.added, report.added_routes, url => `- ${url}`),
  ];
  return lines.join('\n');
}

export async function checkLinks(options: {repositoryRoot: string; site: string; output: string}, dependencies: {fetch?: FetchLike; now?: () => Date; write?: (message: string) => void; environment?: Record<string, string | undefined>; externalLinkConcurrency?: number; externalLinkTimeoutMs?: number; externalLinkAttempts?: number} = {}): Promise<LinkCheckReport> {
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
  const identity = resolveReportIdentity(environment);
  const fetcher = dependencies.fetch ?? (globalThis.fetch as unknown as FetchLike);
  const write = dependencies.write ?? (message => process.stdout.write(`${message}\n`));
  const remoteSource = environment.LINK_CHECKS_REMOTE_SITEMAP || normalizeUrl(environment.LINK_CHECKS_REMOTE_BASE_URL || profile.url);
  const localSource = environment.LINK_CHECKS_LOCAL_SITEMAP || `${profile.outputDir}/sitemap.xml`;
  const remote = await listUrls(remoteSource, options.repositoryRoot, fetcher);
  const local = await listUrls(localSource, options.repositoryRoot, fetcher);
  if (local.length === 0) throw new Error('Local sitemap contains no documentation routes');
  const routeRoots = contentRouteRoots(profile.content.map(item => item.routeBasePath));
  const renderedPages = routeRoots.flatMap(routeRoot => htmlPagesUnder(options.repositoryRoot, path.posix.join(profile.outputDir, routeRoot)));
  if (renderedPages.length === 0) throw new Error('No rendered HTML pages exist below the configured content route roots');
  const externalLinks = uniqueLinkEntries(collectExternalLinkEntries(options.repositoryRoot, profile.outputDir, renderedPages));
  const observations: ProbedExternalObservation[] = [];
  const concurrency = dependencies.externalLinkConcurrency ?? 8;
  const timeoutMs = dependencies.externalLinkTimeoutMs ?? 15_000;
  const attempts = dependencies.externalLinkAttempts ?? 2;
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error('External link concurrency must be a positive integer');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('External link timeout must be positive');
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 3) throw new Error('External link attempts must be an integer between 1 and 3');
  await forEachConcurrent(externalLinks, concurrency, async link => {
    const result = await probeExternalLink(link.url, fetcher, timeoutMs, attempts);
    const pages = [...(link.pages ?? (link.page ? [link.page] : []))].sort((left, right) => left.localeCompare(right));
    observations.push({
      url: link.url,
      classification: classifyExternalResult(result),
      status: result.status,
      error: result.error,
      pages: pages.slice(0, 5),
      page_count: pages.length,
    });
  });
  const report = buildLinkCheckReport({
    generatedAt: now.toISOString(),
    toolingSha: identity.toolingSha,
    contentSha: identity.contentSha,
    remoteSitemapSource: remoteSource,
    localSitemapSource: localSource,
    remoteUrls: remote,
    localUrls: local,
    checkedExternalLinks: externalLinks,
    observations,
    workflowRunUrl: resolveWorkflowRunUrl(environment),
  });
  const validatedReport = LinkCheckReportSchema.parse(report);
  const markdown = renderLinkCheckMarkdown(validatedReport);
  const json = JSON.stringify(validatedReport, null, 2);
  writeAtomicRepositoryFiles(options.repositoryRoot, [
    {path: options.output, contents: markdown},
    {path: jsonOutput, contents: json},
    {path: timestampedMarkdown, contents: markdown},
    {path: timestampedJson, contents: json},
  ], 'Link-check report output');
  write(`Deleted links: ${validatedReport.summary.deleted_routes}`);
  write(`Added links: ${validatedReport.summary.added_routes}`);
  write(`Total external links: ${validatedReport.summary.checked_external_links}`);
  write(`Broken links: ${validatedReport.summary.expired_external_links + validatedReport.summary.blocked_external_links + validatedReport.summary.transient_external_links + validatedReport.summary.other_external_links}`);
  write(`Link-check report written to ${path.relative(options.repositoryRoot, output)}`);
  return validatedReport;
}
