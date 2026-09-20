import {z} from 'zod';

import {assertSafeAtomicWriteTargets, writeAtomicRepositoryFiles} from '../validation/atomicFiles.ts';
import {DEFAULT_PRODUCT_DOC_LINK_SOURCE, extractProductDocLinks, readProductDocLinkSource, resolveProductDocLinkGitHubToken, type ProductDocLinkEntry, type ProductDocLinkScope} from './productDocLinks.ts';
import {resolveWorkflowRunUrl} from './check.ts';

export type ProductDocLinkHealth = 'direct' | 'redirected' | 'broken' | 'blocked' | 'transient' | 'other';

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const FALLBACK_STATUSES = new Set([401, 403, 405, 501]);
const RETRYABLE_STATUSES = new Set([408, 425, 429]);

export type ProbeResponse = {status: number; headers: (name: string) => string | null};
export type ProbeFetch = (url: string, init?: {method?: 'HEAD' | 'GET'; headers?: Record<string, string>; signal?: AbortSignal; redirect?: 'manual' | 'follow'}) => Promise<ProbeResponse>;

const canonicalDateTime = z.string().datetime().refine(value => new Date(value).toISOString() === value, {
  message: 'generated_at must be a canonical UTC datetime',
});
const nullableSha = z.string().regex(/^[0-9a-f]{40}$/u).nullable();

const ProductDocLinkObservationSchema = z.object({
  url: z.string().url(),
  scope: z.enum(['primary', 'unknown-docs-domain']),
  health: z.enum(['direct', 'redirected', 'broken', 'blocked', 'transient', 'other']),
  status: z.number().int().min(100).max(599).nullable(),
  final_url: z.string().url().nullable(),
  redirect_count: z.number().int().nonnegative(),
  error: z.string().min(1).max(240).nullable(),
  constants: z.array(z.string().min(1)).min(1),
}).strict();

export type ProductDocLinkObservation = z.infer<typeof ProductDocLinkObservationSchema>;

const ProductDocLinkSummarySchema = z.object({
  checked: z.number().int().nonnegative(),
  direct: z.number().int().nonnegative(),
  redirected: z.number().int().nonnegative(),
  broken: z.number().int().nonnegative(),
  blocked: z.number().int().nonnegative(),
  transient: z.number().int().nonnegative(),
  other: z.number().int().nonnegative(),
  unknown_docs_domain: z.number().int().nonnegative(),
}).strict().superRefine((summary, context) => {
  const healthTotal = summary.direct + summary.redirected + summary.broken + summary.blocked + summary.transient + summary.other;
  if (healthTotal !== summary.checked) {
    context.addIssue({code: z.ZodIssueCode.custom, message: 'Health buckets must add up to the checked total'});
  }
});

export const ProductDocLinkReportSchema = z.object({
  schema_version: z.literal(1),
  generated_at: canonicalDateTime,
  source: z.string().min(1).max(2048),
  source_revision: nullableSha,
  workflow_run_url: z.string().url().nullable(),
  summary: ProductDocLinkSummarySchema,
  broken_links: z.array(ProductDocLinkObservationSchema),
  redirected_links: z.array(ProductDocLinkObservationSchema),
  unknown_docs_domain_links: z.array(ProductDocLinkObservationSchema),
  blocked_links: z.array(ProductDocLinkObservationSchema),
  transient_links: z.array(ProductDocLinkObservationSchema),
  other_links: z.array(ProductDocLinkObservationSchema),
}).strict();

export type ProductDocLinkReport = z.infer<typeof ProductDocLinkReportSchema>;

export type ProbeResult = {
  status: number | null;
  finalUrl: string | null;
  redirectCount: number;
  error: string | null;
};

const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

function sanitizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const sanitized = message
    .replace(/[\u0000-\u001f\u007f-\u009f]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
  return (sanitized || 'Product doc link request failed').slice(0, 240);
}

function isRetryableStatus(status: number): boolean {
  return RETRYABLE_STATUSES.has(status) || status >= 500;
}

async function requestOnce(url: string, method: 'HEAD' | 'GET', fetcher: ProbeFetch, timeoutMs: number): Promise<ProbeResponse> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    // `redirect: 'manual'` is what keeps the 3xx hop visible: the default
    // `follow` would silently land on the destination and every
    // redirect-dependent link would be misread as direct.
    const response = await fetcher(url, {
      method,
      redirect: 'manual',
      signal: controller.signal,
      headers: method === 'GET'
        ? {'Accept-Encoding': 'identity', Range: 'bytes=0-0'}
        : {'Accept-Encoding': 'identity'},
    });
    // Injected stubs return a callable header lookup; the global fetch returns
    // a `Headers` instance. Normalize both to one accessor.
    const rawHeaders = (response as {headers: unknown}).headers;
    const headers = typeof rawHeaders === 'function'
      ? (name: string) => (rawHeaders as (n: string) => string | null)(name)
      : (name: string) => (rawHeaders as Headers | undefined)?.get?.(name) ?? null;
    return {status: response.status, headers};
  } catch (error) {
    if (timedOut) throw new Error(`request timed out after ${timeoutMs}ms`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Probes one URL while walking redirects manually: unlike `redirect: 'follow'`,
 * this keeps the redirect count and landing URL, which is what separates the
 * healthy `direct` class from the fragile `redirected` class. Fragments are
 * never sent on the wire.
 */
export async function probeProductDocLink(url: string, fetcher: ProbeFetch, options: {timeoutMs: number; attempts: number; maxRedirects: number}): Promise<ProbeResult> {
  const parsed = new URL(url);
  const wireUrl = `${parsed.origin}${parsed.pathname}${parsed.search}`;
  if (!Number.isInteger(options.attempts) || options.attempts < 1 || options.attempts > 3) {
    throw new Error('Product doc link attempts must be an integer between 1 and 3');
  }
  if (!Number.isInteger(options.maxRedirects) || options.maxRedirects < 0) {
    throw new Error('Product doc link maxRedirects must be a non-negative integer');
  }

  let last: ProbeResult = {status: null, finalUrl: null, redirectCount: 0, error: 'Product doc link request failed'};
  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    let current = wireUrl;
    let redirectCount = 0;
    const visited = new Set<string>([wireUrl]);
    try {
      for (;;) {
        let response = await requestOnce(current, 'HEAD', fetcher, options.timeoutMs);
        if (FALLBACK_STATUSES.has(response.status)) {
          response = await requestOnce(current, 'GET', fetcher, options.timeoutMs);
        }
        if (REDIRECT_STATUSES.has(response.status)) {
          const location = response.headers('location');
          if (!location) {
            last = {status: response.status, finalUrl: null, redirectCount, error: 'redirect response without a location header'};
            break;
          }
          if (redirectCount >= options.maxRedirects) {
            last = {status: response.status, finalUrl: null, redirectCount, error: `more than ${options.maxRedirects} redirects`};
            break;
          }
          const next = new URL(location, current);
          current = `${next.origin}${next.pathname}${next.search}`;
          if (visited.has(current)) {
            last = {status: null, finalUrl: null, redirectCount: redirectCount + 1, error: 'redirect loop detected'};
            break;
          }
          visited.add(current);
          redirectCount += 1;
          continue;
        }
        last = {status: response.status, finalUrl: current, redirectCount, error: null};
        break;
      }
      if (last.error === null && !isRetryableStatus(last.status ?? 0)) return last;
    } catch (error) {
      last = {status: null, finalUrl: null, redirectCount, error: sanitizeError(error)};
    }
    if (attempt < options.attempts) await sleep(attempt * 1000);
  }
  return last;
}

export function classifyProductDocLink(result: ProbeResult): ProductDocLinkHealth {
  if (result.error !== null) return 'transient';
  const status = result.status;
  if (status !== null && status >= 200 && status < 300) return result.redirectCount > 0 ? 'redirected' : 'direct';
  if (status === 404 || status === 410) return 'broken';
  if (status === 401 || status === 403) return 'blocked';
  if (status !== null && (RETRYABLE_STATUSES.has(status) || status >= 500)) return 'transient';
  return 'other';
}

function buildObservation(entry: ProductDocLinkEntry, result: ProbeResult): ProductDocLinkObservation {
  return {
    url: entry.url,
    scope: entry.scope,
    health: classifyProductDocLink(result),
    status: result.status,
    final_url: result.finalUrl,
    redirect_count: result.redirectCount,
    error: result.error,
    constants: entry.constants,
  };
}

const byUrl = (left: ProductDocLinkObservation, right: ProductDocLinkObservation): number => left.url.localeCompare(right.url);

export function buildProductDocLinkReport({
  generatedAt = new Date().toISOString(),
  source,
  sourceRevision,
  entries,
  observations,
  workflowRunUrl = null,
}: {
  generatedAt?: string;
  source: string;
  sourceRevision: string | null;
  entries: readonly ProductDocLinkEntry[];
  observations: readonly ProductDocLinkObservation[];
  workflowRunUrl?: string | null;
}): ProductDocLinkReport {
  const count = (health: ProductDocLinkHealth): number => observations.filter(item => item.health === health).length;
  const summary = {
    checked: entries.length,
    direct: count('direct'),
    redirected: count('redirected'),
    broken: count('broken'),
    blocked: count('blocked'),
    transient: count('transient'),
    other: count('other'),
    unknown_docs_domain: observations.filter(item => item.scope === 'unknown-docs-domain').length,
  };
  return ProductDocLinkReportSchema.parse({
    schema_version: 1,
    generated_at: generatedAt,
    source,
    source_revision: sourceRevision,
    workflow_run_url: workflowRunUrl,
    summary,
    broken_links: observations.filter(item => item.health === 'broken').sort(byUrl),
    redirected_links: observations.filter(item => item.health === 'redirected').sort(byUrl),
    unknown_docs_domain_links: observations.filter(item => item.scope === 'unknown-docs-domain').sort(byUrl),
    blocked_links: observations.filter(item => item.health === 'blocked').sort(byUrl),
    transient_links: observations.filter(item => item.health === 'transient').sort(byUrl),
    other_links: observations.filter(item => item.health === 'other').sort(byUrl),
  });
}

const SECTION_EXPLANATIONS = {
  broken: 'These URLs returned HTTP 404 or 410. Product UI buttons and help entries referencing them fail for users right now; fix the product constant or restore the docs route.',
  redirected: 'These URLs still land on live content, but only through an HTTP redirect. They break the moment the redirect is removed; repoint the product constant or add durable redirect coverage.',
  unknown_docs_domain: 'These URLs target a docs host outside the owned production hosts (docs.zilliz.com, docs.zilliz.com.cn). They may be non-production deployments leaking into the product; fix the constant or add the host to PRODUCT_DOC_HOSTS if it is legitimately owned.',
  blocked: 'These URLs returned HTTP 401 or 403. The probe was denied access, so this does not prove the links are broken; review them only if users also cannot open them.',
  transient: 'These URLs failed because of network errors, timeouts, or retryable HTTP responses. They are not confirmed broken and should be rechecked in the next run.',
  other: 'These URLs returned unexpected non-success responses that fit no other class; review them manually.',
} as const;

function renderObservation(item: ProductDocLinkObservation): string {
  const lines = [
    `- ${item.url}`,
    `  - Constants: ${item.constants.join(', ')}`,
  ];
  if (item.error !== null) lines.push(`  - Result: Error: ${item.error}`);
  else {
    lines.push(`  - Result: HTTP ${item.status}${item.redirect_count > 0 ? ` after ${item.redirect_count} redirect(s)` : ''}`);
    if (item.final_url !== null && item.redirect_count > 0) lines.push(`  - Lands on: ${item.final_url}`);
  }
  return lines.join('\n');
}

function renderSection(title: string, explanation: string, items: readonly ProductDocLinkObservation[]): string[] {
  const body = items.length === 0 ? '- None' : items.map(renderObservation).join('\n');
  return [`## ${title}`, '', `> ${explanation}`, '', body];
}

export function renderProductDocLinkMarkdown(report: ProductDocLinkReport): string {
  return [
    '# Product UI Doc Links Watchdog Report',
    '',
    `Generated: ${report.generated_at}`,
    `Workflow run: ${report.workflow_run_url ?? 'None'}`,
    `Product link source: ${report.source}`,
    `Source revision: ${report.source_revision ?? 'None'}`,
    '',
    '## Summary',
    '',
    `- Checked URLs: ${report.summary.checked}`,
    `- Direct (200, no redirect): ${report.summary.direct}`,
    `- Redirect-dependent: ${report.summary.redirected}`,
    `- Broken: ${report.summary.broken}`,
    `- Blocked: ${report.summary.blocked}`,
    `- Transient: ${report.summary.transient}`,
    `- Other: ${report.summary.other}`,
    `- Non-production docs hosts: ${report.summary.unknown_docs_domain}`,
    '',
    ...renderSection('Broken Links', SECTION_EXPLANATIONS.broken, report.broken_links),
    '',
    ...renderSection('Non-Production Docs Hosts', SECTION_EXPLANATIONS.unknown_docs_domain, report.unknown_docs_domain_links),
    '',
    ...renderSection('Redirect-Dependent Links', SECTION_EXPLANATIONS.redirected, report.redirected_links),
    '',
    ...renderSection('Blocked Links', SECTION_EXPLANATIONS.blocked, report.blocked_links),
    '',
    ...renderSection('Transient Links', SECTION_EXPLANATIONS.transient, report.transient_links),
    '',
    ...renderSection('Other Links', SECTION_EXPLANATIONS.other, report.other_links),
  ].join('\n');
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
  await Promise.all(Array.from({length: Math.max(1, Math.min(concurrency, items.length))}, worker));
}

export async function checkProductDocLinks(options: {repositoryRoot: string; output: string; source?: string; sourceRevision?: string}, dependencies: {fetch?: ProbeFetch; readSource?: typeof readProductDocLinkSource; now?: () => Date; write?: (message: string) => void; environment?: Record<string, string | undefined>; concurrency?: number; timeoutMs?: number; attempts?: number; maxRedirects?: number} = {}): Promise<ProductDocLinkReport> {
  const environment = dependencies.environment ?? process.env;
  const source = options.source ?? environment.PRODUCT_DOC_LINKS_SOURCE ?? DEFAULT_PRODUCT_DOC_LINK_SOURCE;
  const sourceRevision = options.sourceRevision ?? environment.PRODUCT_DOC_LINKS_SOURCE_REVISION ?? null;
  if (sourceRevision !== null && !/^[0-9a-f]{40}$/u.test(sourceRevision)) {
    throw new Error('Product link source revision must be a 40-character lowercase SHA');
  }
  if (!options.output.endsWith('.md')) throw new Error('Product doc link report output must end in .md');
  const jsonOutput = options.output.replace(/\.md$/u, '.json');
  assertSafeAtomicWriteTargets(options.repositoryRoot, [options.output, jsonOutput], 'Product doc link report output');

  const sourceFetcher = async (url: string, init?: {headers?: Record<string, string>}): Promise<{ok: boolean; status: number; text(): Promise<string>}> => {
    const response = await fetch(url, {headers: {'Accept-Encoding': 'identity', ...init?.headers}});
    return {ok: response.ok, status: response.status, text: () => response.text()};
  };
  const githubToken = resolveProductDocLinkGitHubToken(environment);
  const readSource = dependencies.readSource ?? readProductDocLinkSource;
  const sourceContent = await readSource(source, options.repositoryRoot, sourceFetcher, {githubToken});
  const entries = extractProductDocLinks(sourceContent);

  const probeFetcher = dependencies.fetch ?? (globalThis.fetch as unknown as ProbeFetch);
  const concurrency = dependencies.concurrency ?? 8;
  const timeoutMs = dependencies.timeoutMs ?? 15_000;
  const attempts = dependencies.attempts ?? 2;
  const maxRedirects = dependencies.maxRedirects ?? 5;
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error('Product doc link concurrency must be a positive integer');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('Product doc link timeout must be positive');

  const observations: ProductDocLinkObservation[] = [];
  await forEachConcurrent(entries, concurrency, async entry => {
    const result = await probeProductDocLink(entry.url, probeFetcher, {timeoutMs, attempts, maxRedirects});
    observations.push(buildObservation(entry, result));
  });

  const now = (dependencies.now ?? (() => new Date()))();
  const report = buildProductDocLinkReport({
    generatedAt: now.toISOString(),
    source,
    sourceRevision,
    entries,
    observations,
    workflowRunUrl: resolveWorkflowRunUrl(environment),
  });
  const markdown = renderProductDocLinkMarkdown(report);
  writeAtomicRepositoryFiles(options.repositoryRoot, [
    {path: options.output, contents: markdown},
    {path: jsonOutput, contents: JSON.stringify(report, null, 2)},
  ], 'Product doc link report output');

  const write = dependencies.write ?? (message => process.stdout.write(`${message}\n`));
  write(`Checked URLs: ${report.summary.checked}`);
  write(`Direct: ${report.summary.direct}`);
  write(`Redirect-dependent: ${report.summary.redirected}`);
  write(`Broken: ${report.summary.broken}`);
  write(`Blocked: ${report.summary.blocked}`);
  write(`Transient: ${report.summary.transient}`);
  write(`Other: ${report.summary.other}`);
  write(`Non-production docs hosts: ${report.summary.unknown_docs_domain}`);
  write(`Product doc link report written to ${options.output}`);
  return report;
}
