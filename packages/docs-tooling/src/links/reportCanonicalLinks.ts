import {createRequire} from 'node:module';
import {readFileSync, writeFileSync} from 'node:fs';

import {z} from 'zod';

const requireFromDocsTooling = createRequire(import.meta.url);

const SITE_LANGUAGE: Record<'en' | 'zh-CN', string> = {en: 'English Guides', 'zh-CN': '中文 Guides'};

const CONFIDENCE_LABEL: Record<string, string> = {
  exact: 'Exact',
  strong: 'Strong',
  weak: 'Weak',
  possible: 'Weak',
  none: '无候选',
};

/** A single canonical-link table row, matching the sample table's human-readable fields. */
export type CanonicalLinkRow = {
  源文档: string;
  源文档链接: string;
  源slug: string;
  语言: string;
  引用类型: string;
  链接文字: string;
  当前失效URL: string;
  建议动作: string;
  推荐候选: string;
  推荐候选链接: string;
  置信度: string;
  候选理由: string;
  处理状态: string;
  WorkflowRun: string;
};

type CanonicalReference = {
  source_type: string;
  block_id: string | null;
  link_text: string | null;
  raw_url?: string | null;
  url?: string | null;
  recommended_action: string;
  candidates: Array<{confidence: string; title: string; doc_link: string; reason?: string | null}>;
};

type CanonicalFile = {
  source_title: string | null;
  source_slug: string | null;
  source_doc_url: string;
  broken_references: CanonicalReference[];
};

export type CanonicalLinkReport = {
  generated_at: string;
  summary: {broken_references: number};
  files: CanonicalFile[];
};

/** Parse a canonical-link audit JSON report (loose, read-only). */
export function parseCanonicalLinkReport(data: unknown): CanonicalLinkReport {
  return data as CanonicalLinkReport;
}

/** Map an audit report to table rows, one per broken reference. */
export function mapCanonicalReportToRows(
  report: CanonicalLinkReport,
  site: 'en' | 'zh-CN',
  workflowRunUrl: string,
): CanonicalLinkRow[] {
  const language = SITE_LANGUAGE[site];
  const rows: CanonicalLinkRow[] = [];
  for (const file of report.files) {
    for (const reference of file.broken_references) {
      const top = reference.candidates[0];
      const sourceUrl = reference.block_id ? `${file.source_doc_url}#${reference.block_id}` : file.source_doc_url;
      rows.push({
        源文档: file.source_title || file.source_slug || '',
        源文档链接: sourceUrl,
        源slug: file.source_slug || '',
        语言: language,
        引用类型: reference.source_type,
        链接文字: reference.link_text || '',
        当前失效URL: reference.raw_url || reference.url || '',
        建议动作: reference.recommended_action || '',
        推荐候选: top?.title || '',
        推荐候选链接: top?.doc_link || '',
        置信度: CONFIDENCE_LABEL[top?.confidence || ''] || '无候选',
        候选理由: top?.reason || '',
        处理状态: '待处理',
        WorkflowRun: workflowRunUrl,
      });
    }
  }
  return rows;
}

/** Field schema for the daily canonical-link table (human-readable subset of the sample). */
export const CANONICAL_TABLE_FIELDS: Array<Record<string, unknown>> = [
  {type: 'text', name: '源文档'},
  {type: 'text', name: '源文档链接', style: {type: 'url'}},
  {type: 'text', name: '源slug'},
  {type: 'select', name: '语言', multiple: false, options: [{name: 'English Guides'}, {name: '中文 Guides'}]},
  {type: 'select', name: '引用类型', multiple: false, options: [{name: 'href_link'}, {name: 'mention_doc'}]},
  {type: 'text', name: '链接文字'},
  {type: 'text', name: '当前失效URL', style: {type: 'url'}},
  {type: 'text', name: '建议动作'},
  {type: 'text', name: '推荐候选'},
  {type: 'text', name: '推荐候选链接', style: {type: 'url'}},
  {type: 'select', name: '置信度', multiple: false, options: [{name: 'Exact'}, {name: 'Strong'}, {name: 'Weak'}, {name: '无候选'}]},
  {type: 'text', name: '候选理由'},
  {type: 'select', name: '处理状态', multiple: false, options: [{name: '待处理'}, {name: '已修复'}, {name: '已忽略'}]},
  {type: 'text', name: 'WorkflowRun', style: {type: 'url'}},
];

type FeishuFetch = (url: string, options: Record<string, unknown>, label: string) => Promise<unknown>;

type TableDeps = {
  appToken: string;
  token: string;
  fetchFeishu: FeishuFetch;
  host: string;
  now: () => Date;
};

function dailyTableName(now: Date): string {
  return `Canonical 清理项 ${now.toISOString().slice(0, 10)}`;
}

async function listTables(deps: TableDeps): Promise<Array<{table_id: string; name: string}>> {
  const tables: Array<{table_id: string; name: string}> = [];
  let pageToken: string | undefined;
  do {
    const expr = pageToken ? `&page_token=${pageToken}` : '';
    const res = await deps.fetchFeishu(`${deps.host}/open-apis/bitable/v1/apps/${deps.appToken}/tables?page_size=100${expr}`, {method: 'get'}, 'list canonical report tables') as {
      data?: {items?: Array<{table_id: string; name: string}>; has_more?: boolean; page_token?: string};
    };
    for (const item of res.data?.items ?? []) tables.push(item);
    pageToken = res.data?.has_more ? res.data.page_token : undefined;
  } while (pageToken);
  return tables;
}

async function createTable(deps: TableDeps, name: string): Promise<string> {
  const res = await deps.fetchFeishu(`${deps.host}/open-apis/bitable/v1/apps/${deps.appToken}/tables`, {
    method: 'post',
    body: JSON.stringify({table: {name, fields: CANONICAL_TABLE_FIELDS}}),
    headers: {Authorization: `Bearer ${deps.token}`},
  }, `create canonical report table ${name}`) as {data?: {table_id?: string}};
  const tableId = res.data?.table_id;
  if (!tableId) throw new Error(`Failed to create canonical report table ${name}`);
  return tableId;
}

async function appendRows(deps: TableDeps, tableId: string, rows: CanonicalLinkRow[]): Promise<void> {
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100).map(row => ({fields: row}));
    await deps.fetchFeishu(`${deps.host}/open-apis/bitable/v1/apps/${deps.appToken}/tables/${tableId}/records/batch_create`, {
      method: 'post',
      body: JSON.stringify({records: chunk}),
      headers: {Authorization: `Bearer ${deps.token}`},
    }, 'append canonical report rows');
  }
}

/** Find-or-create today's canonical-link table and return its id + URL. */
async function findOrCreateDailyTable(deps: TableDeps): Promise<{tableId: string; tableUrl: string}> {
  const name = dailyTableName(deps.now());
  const tables = await listTables(deps);
  const existing = tables.find(table => table.name === name);
  const tableId = existing?.table_id ?? await createTable(deps, name);
  const tableUrl = `${deps.host.replace(/\/+$/u, '')}/base/${deps.appToken}?table=${tableId}`;
  return {tableId, tableUrl};
}

export async function reportCanonicalLinksCommand(
  options: {site: string; reportPath: string; tableUrlPath: string},
  dependencies: {now?: () => Date; write?: (message: string) => void; environment?: Record<string, string | undefined>} = {},
): Promise<string> {
  if (options.site !== 'en' && options.site !== 'zh-CN') throw new Error('site must be en or zh-CN');
  const environment = dependencies.environment ?? process.env;
  const write = dependencies.write ?? (message => process.stdout.write(`${message}\n`));
  const now = dependencies.now ?? (() => new Date());

  const appToken = environment.BROKEN_LINKS_REPORT_BASE_TOKEN;
  if (!appToken) throw new Error('BROKEN_LINKS_REPORT_BASE_TOKEN is required');
  const host = environment.FEISHU_HOST;
  if (!host) throw new Error('FEISHU_HOST is required');

  const report = parseCanonicalLinkReport(JSON.parse(readFileSync(options.reportPath, 'utf8')));
  const workflowRunUrl = environment.GITHUB_REPOSITORY && environment.GITHUB_RUN_ID
    ? `${environment.GITHUB_SERVER_URL || 'https://github.com'}/${environment.GITHUB_REPOSITORY}/actions/runs/${environment.GITHUB_RUN_ID}`
    : '';
  const rows = mapCanonicalReportToRows(report, options.site, workflowRunUrl);

  const {fetchFeishuJsonWithRetry} = requireFromDocsTooling('../lark/feishuFetch.js') as {fetchFeishuJsonWithRetry: FeishuFetch};
  const LarkTokenFetcher = requireFromDocsTooling('../lark/larkTokenFetcher.js') as new () => {fetchToken: () => Promise<void>; token: () => Promise<string>};
  const tokenFetcher = new LarkTokenFetcher();
  await tokenFetcher.fetchToken();
  const token = await tokenFetcher.token();

  const deps: TableDeps = {appToken, token, fetchFeishu: fetchFeishuJsonWithRetry, host, now};
  const {tableId, tableUrl} = await findOrCreateDailyTable(deps);
  await appendRows(deps, tableId, rows);

  writeFileSync(options.tableUrlPath, tableUrl);
  write(`Canonical link report: ${rows.length} row(s) written to ${tableUrl}`);
  return tableUrl;
}
