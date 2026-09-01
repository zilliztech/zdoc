import {createRequire} from 'node:module';
import {readFileSync, writeFileSync} from 'node:fs';

import type {ExternalObservation, LinkCheckReport} from './check.ts';
import {LinkCheckReportSchema} from './check.ts';

const requireFromDocsTooling = createRequire(import.meta.url);

const SITE_LABEL: Record<'en' | 'zh-CN', string> = {en: 'English Guides', 'zh-CN': '中文 Guides'};

const CLASSIFICATION_LABEL: Record<Exclude<ExternalObservation['classification'], 'healthy'>, string> = {
  expired: '已确认失效',
  blocked: '疑似被拦截',
  transient: '临时性错误',
  other: '其他异常响应',
};

const EXTERNAL_LINKS_TABLE_NAME = '外链健康检测';

/** A single external-link table row, one per non-healthy observation in the link-check report. */
export type ExternalLinkRow = {
  站点: string;
  URL: string;
  分类: string;
  状态: string;
  引用页面: string;
  引用页面总数: string;
  扫描时间: string;
  WorkflowRun: string;
};

function observationStatusLabel(item: ExternalObservation): string {
  return item.status === null ? `Error: ${item.error}` : `HTTP ${item.status}`;
}

/** Map a link-check report's non-healthy external observations to table rows. */
export function mapLinkCheckReportToRows(report: LinkCheckReport, site: 'en' | 'zh-CN', workflowRunUrl: string): ExternalLinkRow[] {
  const siteLabel = SITE_LABEL[site];
  const buckets: Array<[keyof typeof CLASSIFICATION_LABEL, readonly ExternalObservation[]]> = [
    ['expired', report.expired_external_links],
    ['blocked', report.blocked_external_links],
    ['transient', report.transient_external_links],
    ['other', report.other_external_links],
  ];
  const rows: ExternalLinkRow[] = [];
  for (const [classification, items] of buckets) {
    for (const item of items) {
      rows.push({
        站点: siteLabel,
        URL: item.url,
        分类: CLASSIFICATION_LABEL[classification],
        状态: observationStatusLabel(item),
        引用页面: item.pages.join(', '),
        引用页面总数: String(item.page_count),
        扫描时间: report.generated_at,
        WorkflowRun: workflowRunUrl,
      });
    }
  }
  return rows;
}

/**
 * Field schema for the fixed external-link health table, in the bitable wire format:
 * `field_name` + numeric `type` (1 = text, 3 = single select, 15 = url) with `property.options` for selects.
 */
export const EXTERNAL_LINK_TABLE_FIELDS: Array<Record<string, unknown>> = [
  {field_name: '站点', type: 3, property: {options: [{name: 'English Guides'}, {name: '中文 Guides'}]}},
  {field_name: 'URL', type: 15},
  {field_name: '分类', type: 3, property: {options: [{name: '已确认失效'}, {name: '疑似被拦截'}, {name: '临时性错误'}, {name: '其他异常响应'}]}},
  {field_name: '状态', type: 1},
  {field_name: '引用页面', type: 1},
  {field_name: '引用页面总数', type: 1},
  {field_name: '扫描时间', type: 1},
  {field_name: 'WorkflowRun', type: 15},
];

/** Url-typed fields, whose values must be written as `{link, text}` objects (or omitted when empty). */
const URL_FIELD_NAMES = new Set(['URL', 'WorkflowRun']);

/** Convert a row's Url-typed fields to the `{link, text}` objects bitable requires; drop empty ones. */
function toBitableFields(row: ExternalLinkRow): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(row)) {
    if (URL_FIELD_NAMES.has(name)) {
      if (value) fields[name] = {link: value, text: value};
    } else {
      fields[name] = value;
    }
  }
  return fields;
}

type FeishuFetch = (url: string, options: Record<string, unknown>, label: string) => Promise<unknown>;

type TableDeps = {
  appToken: string;
  token: string;
  fetchFeishu: FeishuFetch;
  host: string;
  webHost: string;
};

type WriteDeps = TableDeps & {tableId: string};

/** Feishu API envelope: non-zero `code` is an error and must abort the command. */
function assertApiResponseOk(res: {code?: number; msg?: string}, label: string): void {
  if (res.code !== undefined && res.code !== 0) {
    throw new Error(`${label} failed: ${res.code} ${res.msg ?? ''}`.trim());
  }
}

async function listExternalLinkTables(deps: TableDeps): Promise<Array<{table_id: string; name: string}>> {
  const tables: Array<{table_id: string; name: string}> = [];
  let pageToken: string | undefined;
  do {
    const expr = pageToken ? `&page_token=${pageToken}` : '';
    const res = await deps.fetchFeishu(`${deps.host}/open-apis/bitable/v1/apps/${deps.appToken}/tables?page_size=100${expr}`, {
      method: 'get',
      headers: {Authorization: `Bearer ${deps.token}`},
    }, 'list external link tables') as {
      code?: number;
      msg?: string;
      data?: {items?: Array<{table_id: string; name: string}>; has_more?: boolean; page_token?: string};
    };
    assertApiResponseOk(res, 'List external link tables');
    for (const item of res.data?.items ?? []) tables.push(item);
    pageToken = res.data?.has_more ? res.data.page_token : undefined;
  } while (pageToken);
  return tables;
}

async function createExternalLinkTable(deps: TableDeps): Promise<string> {
  const res = await deps.fetchFeishu(`${deps.host}/open-apis/bitable/v1/apps/${deps.appToken}/tables`, {
    method: 'post',
    body: JSON.stringify({table: {name: EXTERNAL_LINKS_TABLE_NAME, fields: EXTERNAL_LINK_TABLE_FIELDS}}),
    headers: {Authorization: `Bearer ${deps.token}`},
  }, `create external link table ${EXTERNAL_LINKS_TABLE_NAME}`) as {code?: number; msg?: string; data?: {table_id?: string}};
  assertApiResponseOk(res, `Create external link table ${EXTERNAL_LINKS_TABLE_NAME}`);
  const tableId = res.data?.table_id;
  if (!tableId) throw new Error(`Failed to create external link table ${EXTERNAL_LINKS_TABLE_NAME}`);
  return tableId;
}

/** Find-or-create the fixed external-link health table and return its id + URL. */
export async function findOrCreateExternalLinksTable(deps: TableDeps): Promise<{tableId: string; tableUrl: string}> {
  const tables = await listExternalLinkTables(deps);
  const existing = tables.find(table => table.name === EXTERNAL_LINKS_TABLE_NAME);
  const tableId = existing?.table_id ?? await createExternalLinkTable(deps);
  const tableUrl = `${deps.webHost.replace(/\/+$/u, '')}/base/${deps.appToken}?table=${tableId}`;
  return {tableId, tableUrl};
}

async function listRecordIds(deps: WriteDeps): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;
  do {
    const expr = pageToken ? `&page_token=${pageToken}` : '';
    const res = await deps.fetchFeishu(`${deps.host}/open-apis/bitable/v1/apps/${deps.appToken}/tables/${deps.tableId}/records?page_size=500${expr}`, {
      method: 'get',
      headers: {Authorization: `Bearer ${deps.token}`},
    }, 'list external link table records') as {
      code?: number;
      msg?: string;
      data?: {items?: Array<{record_id: string}>; has_more?: boolean; page_token?: string};
    };
    assertApiResponseOk(res, 'List external link table records');
    for (const item of res.data?.items ?? []) ids.push(item.record_id);
    pageToken = res.data?.has_more ? res.data.page_token : undefined;
  } while (pageToken);
  return ids;
}

/** Clear + refill the external-link table with the given rows (snapshot semantics). */
export async function writeExternalLinksTable(rows: readonly ExternalLinkRow[], deps: WriteDeps): Promise<void> {
  const ids = await listRecordIds(deps);
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    const res = await deps.fetchFeishu(`${deps.host}/open-apis/bitable/v1/apps/${deps.appToken}/tables/${deps.tableId}/records/batch_delete`, {
      method: 'post',
      body: JSON.stringify({records: chunk}),
      headers: {Authorization: `Bearer ${deps.token}`},
    }, 'delete external link table records') as {code?: number; msg?: string};
    assertApiResponseOk(res, 'Delete external link table records');
  }
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100).map(row => ({fields: toBitableFields(row)}));
    const res = await deps.fetchFeishu(`${deps.host}/open-apis/bitable/v1/apps/${deps.appToken}/tables/${deps.tableId}/records/batch_create`, {
      method: 'post',
      body: JSON.stringify({records: chunk}),
      headers: {Authorization: `Bearer ${deps.token}`},
    }, 'create external link table records') as {code?: number; msg?: string};
    assertApiResponseOk(res, 'Create external link table records');
  }
}

export async function reportExternalLinksCommand(
  options: {site: string; reportPath: string; tableUrlPath: string},
  dependencies: {write?: (message: string) => void; environment?: Record<string, string | undefined>} = {},
): Promise<string> {
  if (options.site !== 'en' && options.site !== 'zh-CN') throw new Error('site must be en or zh-CN');
  const environment = dependencies.environment ?? process.env;
  const write = dependencies.write ?? (message => process.stdout.write(`${message}\n`));

  const appToken = environment.BROKEN_LINKS_REPORT_BASE_TOKEN;
  if (!appToken) throw new Error('BROKEN_LINKS_REPORT_BASE_TOKEN is required');
  const host = environment.FEISHU_HOST;
  if (!host) throw new Error('FEISHU_HOST is required');
  const webHost = environment.FEISHU_WEB_HOST;
  if (!webHost) throw new Error('FEISHU_WEB_HOST is required');

  const report = LinkCheckReportSchema.parse(JSON.parse(readFileSync(options.reportPath, 'utf8')));
  const rows = mapLinkCheckReportToRows(report, options.site, report.workflow_run_url ?? '');

  const {fetchFeishuJsonWithRetry} = requireFromDocsTooling('../lark/feishuFetch.js') as {fetchFeishuJsonWithRetry: FeishuFetch};
  const LarkTokenFetcher = requireFromDocsTooling('../lark/larkTokenFetcher.js') as new () => {fetchToken: () => Promise<void>; token: () => Promise<string>};
  const tokenFetcher = new LarkTokenFetcher();
  await tokenFetcher.fetchToken();
  const token = await tokenFetcher.token();

  const tableDeps: TableDeps = {appToken, token, fetchFeishu: fetchFeishuJsonWithRetry, host, webHost};
  const {tableId, tableUrl} = await findOrCreateExternalLinksTable(tableDeps);
  await writeExternalLinksTable(rows, {...tableDeps, tableId});

  writeFileSync(options.tableUrlPath, tableUrl);
  write(`External link report: ${rows.length} row(s) written to ${tableUrl}`);
  return tableUrl;
}
