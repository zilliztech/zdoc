import {createRequire} from 'node:module';

import {z} from 'zod';

import type {BrokenLinkAnalysisReport} from './brokenLinkAnalysis.ts';
import {resolveManualPublication} from '../manuals/registry.ts';

const requireFromDocsTooling = createRequire(import.meta.url);

const SITE_LABEL: Record<'en' | 'zh-CN', string> = {en: '英文站', 'zh-CN': '中文站'};

export function categoryLabel(category: BrokenLinkAnalysisReport['items'][number]['category']): string {
  switch (category) {
    case 'target-missing-group': return '分类一：目标在当前发布组不存在';
    case 'target-missing': return '分类二：目标文档不存在';
    case 'reference': return '自动生成 reference/agents';
    case 'anchor': return '断锚（锚点缺失）';
    case 'resolved': return '已解决（复核）';
  }
}

export type ReportRow = {
  断链源文档: string;
  站点: string;
  分类: string;
  源页面路径: string;
  源文档链接: string;
  '断链 block': string;
  断链目标路径: string;
  目标文档: string;
  目标文档链接: string;
  目标状态说明: string;
  扫描时间: string;
};

export const ReportRowSchema = z.object({
  断链源文档: z.string(),
  站点: z.string(),
  分类: z.string(),
  源页面路径: z.string(),
  源文档链接: z.string(),
  '断链 block': z.string(),
  断链目标路径: z.string(),
  目标文档: z.string(),
  目标文档链接: z.string(),
  目标状态说明: z.string(),
  扫描时间: z.string(),
}).strict();

/** Map an analysis report to table rows, attaching `#block_id` jump links where located. */
export function buildReportRows(
  analysis: BrokenLinkAnalysisReport,
  blockIds: ReadonlyMap<string, string>,
  scannedAt: string,
): ReportRow[] {
  const siteLabel = SITE_LABEL[analysis.site];
  return analysis.items.map(item => {
    const blockId = blockIds.get(item.source.path);
    const sourceLink = item.source.docLink
      ? (blockId ? `${item.source.docLink}#${blockId}` : item.source.docLink)
      : '';
    return ReportRowSchema.parse({
      断链源文档: item.source.title || item.source.slug || item.source.path,
      站点: siteLabel,
      分类: categoryLabel(item.category),
      源页面路径: item.source.path,
      源文档链接: sourceLink,
      '断链 block': item.target.slug,
      断链目标路径: item.target.path,
      目标文档: item.target.title || item.target.slug || '',
      目标文档链接: item.target.docLink ?? '',
      目标状态说明: item.reason,
      扫描时间: scannedAt,
    }) as unknown as ReportRow;
  });
}

function docTokenFromLink(docLink: string | null): string | null {
  if (!docLink) return null;
  try {
    return new URL(docLink).pathname.split('/').filter(Boolean).pop() ?? null;
  } catch {
    return null;
  }
}

type ScraperLike = {
  __base: () => Promise<void>;
  records: unknown[];
  fetch_wiki_node: (token: string) => Promise<{obj_token?: string; node_token?: string; blocks?: {items?: Array<{block_id?: string}>}}>;
  __fetch_blocks: (node: unknown) => Promise<void>;
};

type ExtractContentLinks = (source: unknown) => Array<{block_id: string | null; token: string | null}>;

function createScraper(site: 'en' | 'zh-CN'): ScraperLike {
  const {source} = resolveManualPublication('guides', site);
  if (!source.root || !source.base || !source.sourceType || !source.sourceDir) {
    throw new Error(`Guides source identity is incomplete for ${site}`);
  }
  const LarkDocScraper = requireFromDocsTooling('../lark/larkDocScraper.js') as new (
    root: string, base: string, targetType: string, sourceDir: string,
  ) => ScraperLike;
  return new LarkDocScraper(source.root, source.base, source.sourceType, source.sourceDir);
}

/** Locate, per source page, the block id that contains the link to the target doc. */
export async function locateBlockIds(
  analysis: BrokenLinkAnalysisReport,
  dependencies: {scraper?: ScraperLike} = {},
): Promise<Map<string, string>> {
  const scraper = dependencies.scraper ?? createScraper(analysis.site);
  const {extractContentLinks} = requireFromDocsTooling('../lark/canonicalLinkAuditor.js') as {
    extractContentLinks: ExtractContentLinks;
  };
  const blockIds = new Map<string, string>();
  for (const item of analysis.items) {
    if (item.category === 'reference' || item.category === 'anchor' || item.category === 'resolved') continue;
    const sourceToken = docTokenFromLink(item.source.docLink);
    const targetToken = docTokenFromLink(item.target.docLink);
    if (!sourceToken || !targetToken) continue;
    try {
      const node = await scraper.fetch_wiki_node(sourceToken);
      await scraper.__fetch_blocks(node);
      const links = extractContentLinks(node);
      const hit = links.find(link => link.token === targetToken && link.block_id);
      if (hit?.block_id) blockIds.set(item.source.path, hit.block_id);
    } catch {
      // Block location is best-effort; missing block ids leave the bare doc link.
    }
  }
  return blockIds;
}

type FeishuFetch = (url: string, options: Record<string, unknown>, label: string) => Promise<unknown>;

type WriteDeps = {
  appToken: string;
  tableId: string;
  token: string;
  fetchFeishu: FeishuFetch;
  host: string;
};

async function listRecordIds(deps: WriteDeps): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;
  do {
    const expr = pageToken ? `&page_token=${pageToken}` : '';
    const res = await deps.fetchFeishu(`${deps.host}/open-apis/bitable/v1/apps/${deps.appToken}/tables/${deps.tableId}/records?page_size=500${expr}`, {method: 'get'}, 'list report table records') as {
      data?: {items?: Array<{record_id: string}>; has_more?: boolean; page_token?: string};
    };
    for (const item of res.data?.items ?? []) ids.push(item.record_id);
    pageToken = res.data?.has_more ? res.data.page_token : undefined;
  } while (pageToken);
  return ids;
}

/** Clear + refill the report table with the given rows (snapshot semantics). */
export async function writeBrokenLinksTable(rows: readonly ReportRow[], deps: WriteDeps): Promise<void> {
  const ids = await listRecordIds(deps);
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    await deps.fetchFeishu(`${deps.host}/open-apis/bitable/v1/apps/${deps.appToken}/tables/${deps.tableId}/records/batch_delete`, {
      method: 'post',
      body: JSON.stringify({records: chunk}),
      headers: {Authorization: `Bearer ${deps.token}`},
    }, 'delete report table records');
  }
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100).map(row => ({fields: row}));
    await deps.fetchFeishu(`${deps.host}/open-apis/bitable/v1/apps/${deps.appToken}/tables/${deps.tableId}/records/batch_create`, {
      method: 'post',
      body: JSON.stringify({records: chunk}),
      headers: {Authorization: `Bearer ${deps.token}`},
    }, 'create report table records');
  }
}

/** Render a Feishu card note summarizing the analysis and linking to the report table. */
export function renderBrokenLinksNote(analysis: BrokenLinkAnalysisReport, tableUrl: string): string {
  const s = analysis.summary;
  return [
    '## 内部断链检查',
    '',
    `- 站点：${SITE_LABEL[analysis.site]}`,
    `- 断链（页面级）：${s.broken_links}`,
    `- 断锚（锚点级）：${s.broken_anchors}`,
    `- 目标在当前发布组不存在：${s.target_missing_group}`,
    `- 目标文档不存在：${s.target_missing}`,
    `- 自动生成（reference/agents）：${s.reference}`,
    '',
    `完整明细与跳转链接见 [断链分析表](${tableUrl})`,
  ].join('\n');
}

export function reportTableUrl(appToken: string, tableId: string, host: string): string {
  const base = host.replace(/\/+$/u, '');
  return `${base}/base/${appToken}?table=${tableId}`;
}

export async function reportBrokenLinksCommand(
  options: {analysisPaths: string[]; notePath: string},
  dependencies: {appToken?: string; tableId?: string; now?: () => Date; write?: (message: string) => void; environment?: Record<string, string | undefined>} = {},
): Promise<void> {
  const {parseBrokenLinkAnalysisReport} = await import('./brokenLinkAnalysis.ts');
  const {readFileSync, writeFileSync} = await import('node:fs');
  const environment = dependencies.environment ?? process.env;
  const write = dependencies.write ?? (message => process.stdout.write(`${message}\n`));
  if (options.analysisPaths.length === 0) throw new Error('At least one analysis path is required');
  const analyses = options.analysisPaths.map(p => parseBrokenLinkAnalysisReport(JSON.parse(readFileSync(p, 'utf8'))));

  const appToken = dependencies.appToken ?? environment.BROKEN_LINKS_REPORT_BASE_TOKEN;
  const tableId = dependencies.tableId ?? environment.BROKEN_LINKS_REPORT_TABLE_ID;
  if (!appToken || !tableId) {
    throw new Error('BROKEN_LINKS_REPORT_BASE_TOKEN and BROKEN_LINKS_REPORT_TABLE_ID are required');
  }

  const scannedAt = (dependencies.now ?? (() => new Date()))().toISOString();
  const blockIds = new Map<string, string>();
  for (const analysis of analyses) {
    for (const [key, value] of await locateBlockIds(analysis)) blockIds.set(key, value);
  }
  const rows = analyses.flatMap(analysis => buildReportRows(analysis, blockIds, scannedAt));

  const {fetchFeishuJsonWithRetry} = requireFromDocsTooling('../lark/feishuFetch.js') as {fetchFeishuJsonWithRetry: FeishuFetch};
  const LarkTokenFetcher = requireFromDocsTooling('../lark/larkTokenFetcher.js') as new () => {fetchToken: () => Promise<void>; token: () => Promise<string>};
  const tokenFetcher = new LarkTokenFetcher();
  await tokenFetcher.fetchToken();
  const token = await tokenFetcher.token();
  const host = environment.FEISHU_HOST;
  if (!host) throw new Error('FEISHU_HOST is required');

  await writeBrokenLinksTable(rows, {appToken, tableId, token, fetchFeishu: fetchFeishuJsonWithRetry, host});
  const tableUrl = reportTableUrl(appToken, tableId, host);
  const note = renderCombinedNote(analyses, tableUrl);
  writeFileSync(options.notePath, note);
  write(`Report table refreshed: ${rows.length} row(s) at ${scannedAt}`);
  write(`Card note written to ${options.notePath}`);
}

function renderCombinedNote(analyses: readonly BrokenLinkAnalysisReport[], tableUrl: string): string {
  const lines: string[] = ['## 内部断链检查', ''];
  for (const analysis of analyses) {
    const s = analysis.summary;
    lines.push(`- ${SITE_LABEL[analysis.site]}：断链 ${s.broken_links}，断锚 ${s.broken_anchors}，组缺失 ${s.target_missing_group}，目标缺失 ${s.target_missing}，自动生成 ${s.reference}`);
  }
  lines.push('', `完整明细与跳转链接见 [断链分析表](${tableUrl})`);
  return lines.join('\n');
}
