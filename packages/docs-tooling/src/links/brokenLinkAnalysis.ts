import {createRequire} from 'node:module';
import {readFileSync, writeFileSync} from 'node:fs';

import {z} from 'zod';

import type {BrokenLinksReport} from './brokenLinks.ts';
import {parseBrokenLinksReport} from './brokenLinks.ts';
import {resolveManualPublication} from '../manuals/registry.ts';

const requireFromDocsTooling = createRequire(import.meta.url);

type Group = 'saas' | 'paas' | 'reference' | 'agents' | 'other';

export type PathInfo = {kind: 'docs' | 'reference' | 'agents' | 'other'; slug: string; group: Group};

/** Derive the route kind, group, and slug from a site pathname (anchor-stripped). */
export function pathInfo(pathname: string): PathInfo {
  const cleaned = pathname.split('#')[0].replace(/\/+$/u, '') || '/';
  const slug = cleaned.split('/').filter(Boolean).pop() || '';
  if (cleaned.startsWith('/reference/')) return {kind: 'reference', slug, group: 'reference'};
  if (cleaned.startsWith('/docs/byoc/')) return {kind: 'docs', slug, group: 'paas'};
  if (cleaned.startsWith('/docs/agents/')) return {kind: 'agents', slug, group: 'agents'};
  if (cleaned.startsWith('/docs/')) return {kind: 'docs', slug, group: 'saas'};
  return {kind: 'other', slug, group: 'other'};
}

/** A normalized Feishu source-inventory record, as consumed by the pure analysis. */
export type SourceRecord = {
  recordId: string;
  slug: string;
  title: string;
  docLink: string;
  targets: readonly string[];
  publishable: boolean;
};

export const TargetSummarySchema = z.object({
  path: z.string().min(1),
  slug: z.string(),
  group: z.enum(['saas', 'paas', 'reference', 'agents', 'other']),
  title: z.string().nullable(),
  docLink: z.string().nullable(),
});

export const BrokenLinkAnalysisSchema = z.object({
  category: z.enum(['target-missing-group', 'target-missing', 'reference', 'anchor', 'resolved']),
  source: TargetSummarySchema,
  target: TargetSummarySchema,
  reason: z.string(),
}).strict();

export type TargetSummary = {
  path: string;
  slug: string;
  group: 'saas' | 'paas' | 'reference' | 'agents' | 'other';
  title: string | null;
  docLink: string | null;
};

export type BrokenLinkAnalysis = {
  category: 'target-missing-group' | 'target-missing' | 'reference' | 'anchor' | 'resolved';
  source: TargetSummary;
  target: TargetSummary;
  reason: string;
};

export const BrokenLinkAnalysisReportSchema = z.object({
  schema_version: z.literal(1),
  generated_at: z.string().datetime(),
  site: z.enum(['en', 'zh-CN']),
  summary: z.object({
    broken_links: z.number().int().nonnegative(),
    broken_anchors: z.number().int().nonnegative(),
    target_missing_group: z.number().int().nonnegative(),
    target_missing: z.number().int().nonnegative(),
    reference: z.number().int().nonnegative(),
  }).strict(),
  items: z.array(BrokenLinkAnalysisSchema),
}).strict();

export type BrokenLinkAnalysisReport = {
  schema_version: 1;
  generated_at: string;
  site: 'en' | 'zh-CN';
  summary: {
    broken_links: number;
    broken_anchors: number;
    target_missing_group: number;
    target_missing: number;
    reference: number;
  };
  items: BrokenLinkAnalysis[];
};

export function parseBrokenLinkAnalysisReport(data: unknown): BrokenLinkAnalysisReport {
  return BrokenLinkAnalysisReportSchema.parse(data) as unknown as BrokenLinkAnalysisReport;
}

const GROUP_TO_TARGET: Record<'saas' | 'paas', string> = {saas: 'zilliz.saas', paas: 'zilliz.paas'};

function classify(
  link: {link: string; resolvedLink: string; path: string},
  slugIndex: ReadonlyMap<string, SourceRecord>,
): BrokenLinkAnalysis {
  const source = pathInfo(link.path);
  const target = pathInfo(link.resolvedLink);
  const sourceRecord = slugIndex.get(source.slug);
  const sourceSummary = {
    path: link.path,
    slug: source.slug,
    group: source.group,
    title: sourceRecord?.title ?? null,
    docLink: sourceRecord?.docLink ?? null,
  };

  if (target.group === 'reference' || target.group === 'agents' || target.group === 'other') {
    return {
      category: 'reference',
      source: sourceSummary,
      target: {path: link.resolvedLink, slug: target.slug, group: target.group, title: null, docLink: null},
      reason: `目标为 ${target.group}（自动生成，不在文档清单）`,
    };
  }

  const record = slugIndex.get(target.slug);
  if (!record) {
    return {
      category: 'target-missing',
      source: sourceSummary,
      target: {path: link.resolvedLink, slug: target.slug, group: target.group, title: null, docLink: null},
      reason: '目标 slug 不在源清单中',
    };
  }

  const targetSummary = {path: link.resolvedLink, slug: target.slug, group: target.group, title: record.title || null, docLink: record.docLink || null};
  if (!record.publishable) {
    return {
      category: 'target-missing',
      source: sourceSummary,
      target: targetSummary,
      reason: '目标在清单中但未发布（进度非 Draft 或非 canonical 节点）',
    };
  }

  const want = GROUP_TO_TARGET[source.group as 'saas' | 'paas'];
  if (want && !record.targets.includes(want)) {
    return {
      category: 'target-missing-group',
      source: sourceSummary,
      target: targetSummary,
      reason: `目标 Targets=${JSON.stringify(record.targets)}，不含源发布组 ${want}`,
    };
  }

  return {
    category: 'resolved',
    source: sourceSummary,
    target: targetSummary,
    reason: '目标存在且组正确（构建判定异常，需复核）',
  };
}

/** Pure classification of a broken-links report against normalized source records. */
export function analyzeBrokenLinks(report: BrokenLinksReport, records: readonly SourceRecord[]): BrokenLinkAnalysisReport {
  const slugIndex = new Map<string, SourceRecord>();
  for (const record of records) {
    if (record.slug && !slugIndex.has(record.slug)) slugIndex.set(record.slug, record);
  }

  const items: BrokenLinkAnalysis[] = [];
  for (const link of report.broken_links) {
    items.push(classify(link, slugIndex));
  }
  for (const anchor of report.broken_anchors) {
    const base = pathInfo(anchor.path);
    const sourceRecord = slugIndex.get(base.slug);
    items.push({
      category: 'anchor',
      source: {path: anchor.path, slug: base.slug, group: base.group, title: sourceRecord?.title ?? null, docLink: sourceRecord?.docLink ?? null},
      target: {path: anchor.resolvedLink, slug: pathInfo(anchor.resolvedLink).slug, group: pathInfo(anchor.resolvedLink).group, title: null, docLink: null},
      reason: '目标页存在但锚点缺失',
    });
  }

  const count = (category: BrokenLinkAnalysis['category']): number => items.filter(item => item.category === category).length;

  return parseBrokenLinkAnalysisReport({
    schema_version: 1,
    generated_at: report.generated_at,
    site: report.site,
    summary: {
      broken_links: report.broken_links.length,
      broken_anchors: report.broken_anchors.length,
      target_missing_group: count('target-missing-group'),
      target_missing: count('target-missing'),
      reference: count('reference'),
    },
    items,
  });
}

/** Normalize raw Feishu Base records into SourceRecord[] using the canonical semantics helpers. */
export function normalizeSourceRecords(records: readonly unknown[]): SourceRecord[] {
  const {guidesRecordPublishTargets, guidesCanonicalIsPublishable} = requireFromDocsTooling('../lark/guidesBaseRecordSemantics.js') as {
    guidesRecordPublishTargets: (record: unknown) => string[];
    guidesCanonicalIsPublishable: (record: unknown) => boolean;
  };
  const {plainValue, docField, docLink, docTitle} = requireFromDocsTooling('../lark/canonicalLinkAuditor.js') as {
    plainValue: (value: unknown) => string | null;
    docField: (fields: unknown) => unknown;
    docLink: (doc: unknown) => string | null;
    docTitle: (doc: unknown) => string | null;
  };

  const normalized: SourceRecord[] = [];
  for (const raw of records) {
    const record = raw as {record_id?: string; fields?: Record<string, unknown>};
    const fields = record.fields ?? {};
    const doc = docField(fields);
    const docLinkUrl = docLink(doc);
    const slug = plainValue(fields.Slug) ?? '';
    if (!slug || !docLinkUrl) continue;
    normalized.push({
      recordId: record.record_id ?? '',
      slug,
      title: docTitle(doc) ?? '',
      docLink: docLinkUrl,
      targets: guidesRecordPublishTargets(record),
      publishable: guidesCanonicalIsPublishable(record),
    });
  }
  return normalized;
}

export function readBrokenLinksReport(reportPath: string): BrokenLinksReport {
  const raw = readFileSync(reportPath, 'utf8');
  return parseBrokenLinksReport(JSON.parse(raw));
}

type ScraperLike = {
  __base: () => Promise<void>;
  records: unknown[];
};

/** Read the live Feishu source-inventory records for a site via the scraper. */
export async function readLiveGuidesRecords(site: 'en' | 'zh-CN'): Promise<unknown[]> {
  const {source} = resolveManualPublication('guides', site);
  if (!source.root || !source.base || !source.sourceType || !source.sourceDir) {
    throw new Error(`Guides source identity is incomplete for ${site}`);
  }
  const LarkDocScraper = requireFromDocsTooling('../lark/larkDocScraper.js') as new (
    root: string, base: string, targetType: string, sourceDir: string,
  ) => ScraperLike;
  const scraper = new LarkDocScraper(source.root, source.base, source.sourceType, source.sourceDir);
  await scraper.__base();
  return scraper.records;
}

/** Full command: read a broken-links report, read live records, classify, and write the analysis. */
export async function analyzeBrokenLinksCommand(
  options: {repositoryRoot: string; site: string; reportPath: string; output: string},
  dependencies: {records?: readonly unknown[]; write?: (message: string) => void} = {},
): Promise<BrokenLinkAnalysisReport> {
  const report = readBrokenLinksReport(options.reportPath);
  const rawRecords = dependencies.records ?? await readLiveGuidesRecords(options.site as 'en' | 'zh-CN');
  const analysis = analyzeBrokenLinks(report, normalizeSourceRecords(rawRecords));
  const jsonOutput = options.output.replace(/\.md$/u, '.json');
  writeFileSync(jsonOutput, JSON.stringify(analysis, null, 2));
  const write = dependencies.write ?? (message => process.stdout.write(`${message}\n`));
  write(`Broken links categorized: ${analysis.summary.broken_links + analysis.summary.broken_anchors}`);
  write(`  target-missing-group: ${analysis.summary.target_missing_group}`);
  write(`  target-missing: ${analysis.summary.target_missing}`);
  write(`  reference: ${analysis.summary.reference}`);
  write(`Analysis written to ${jsonOutput}`);
  return analysis;
}
