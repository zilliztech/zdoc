import type {LocalizationReceipt, RegistryStore, SnapshotReference} from '../application/ports.js';
import type {GlossaryEntry} from '../domain/glossary.js';
import type {DocumentPair, RunRecord} from '../domain/model.js';
import {larkMachineEnv, runJsonCommand, type ProcessRunner} from './process-runner.js';

export interface LarkBaseRegistryOptions {
  baseToken: string;
  documentPairsTableId: string;
  glossaryTableId: string;
  runsTableId: string;
}

type BaseRecord = {record_id?: string; recordId?: string; fields?: Record<string, unknown>} & Record<string, unknown>;

function recordsFrom(data: unknown): BaseRecord[] {
  const object = data as {items?: BaseRecord[]; records?: BaseRecord[]; data?: BaseRecord[]} | undefined;
  if (Array.isArray(object?.items)) return object.items;
  if (Array.isArray(object?.records)) return object.records;
  if (Array.isArray(object?.data)) return object.data;
  return [];
}

function pageFrom(data: unknown): {records: BaseRecord[]; hasMore: boolean} {
  const object = data as {has_more?: boolean; hasMore?: boolean} | undefined;
  return {
    records: recordsFrom(data),
    hasMore: object?.has_more === true || object?.hasMore === true,
  };
}

function fieldsOf(record: BaseRecord): Record<string, unknown> {
  return record.fields ?? record;
}

function recordId(record: BaseRecord): string | undefined {
  return record.record_id ?? record.recordId;
}

function compactRun(run: RunRecord): RunRecord {
  if (!run.metadata) return run;
  const {changes: _changes, aligned: _aligned, audit: _audit, plan: _plan, ...metadata} = run.metadata;
  return {...run, metadata};
}

export class LarkBaseRegistry implements RegistryStore {
  constructor(
    private readonly runner: ProcessRunner,
    private readonly options: LarkBaseRegistryOptions,
  ) {}

  private async list(tableId: string, field?: string, value?: string): Promise<BaseRecord[]> {
    const records: BaseRecord[] = [];
    let offset = 0;
    while (true) {
      const data = await runJsonCommand<unknown>(this.runner, {
        executable: 'lark-cli',
        args: [
          'base', '+record-list', '--base-token', this.options.baseToken, '--table-id', tableId,
          ...(field && value ? ['--filter-json', JSON.stringify({logic: 'and', conditions: [[field, '==', value]]})] : []),
          '--limit', '200',
          ...(offset > 0 ? ['--offset', String(offset)] : []),
          '--format', 'json', '--as', 'user',
        ],
        env: larkMachineEnv,
      });
      const page = pageFrom(data);
      records.push(...page.records);
      if (page.records.length === 0 || (!page.hasMore && page.records.length < 200)) break;
      offset += page.records.length;
    }
    return records;
  }

  private async upsert(tableId: string, fields: Record<string, unknown>, existingRecordId?: string): Promise<void> {
    await runJsonCommand(this.runner, {
      executable: 'lark-cli',
      args: [
        'base', '+record-upsert', '--base-token', this.options.baseToken, '--table-id', tableId,
        ...(existingRecordId ? ['--record-id', existingRecordId] : []),
        '--json', JSON.stringify(fields), '--format', 'json', '--as', 'user',
      ],
      env: larkMachineEnv,
    });
  }

  async savePair(pair: DocumentPair): Promise<void> {
    const existing = (await this.list(this.options.documentPairsTableId, 'pair_id', pair.pairId))[0];
    await this.upsert(this.options.documentPairsTableId, {
      pair_id: pair.pairId,
      source_locale: pair.sourceLocale,
      target_locale: pair.targetLocale,
      source_doc_url: pair.sourceDocUrl,
      source_doc_token: pair.sourceDocToken ?? null,
      target_doc_url: pair.targetDocUrl ?? null,
      target_doc_token: pair.targetDocToken ?? null,
      target_parent_url: pair.targetParentUrl ?? null,
      target_parent_token: pair.targetParentToken ?? null,
      mode: pair.mode,
      product_scope: pair.productScope ?? null,
      version_scope: pair.versionScope ?? null,
      environment_scope: pair.environmentScope ?? null,
      status: pair.status,
    }, existing ? recordId(existing) : undefined);
  }

  async getPair(pairId: string): Promise<DocumentPair | undefined> {
    return this.parsePair((await this.list(this.options.documentPairsTableId, 'pair_id', pairId))[0]);
  }

  async listPairs(): Promise<DocumentPair[]> {
    return (await this.list(this.options.documentPairsTableId)).map((record) => this.parsePair(record)).filter(Boolean) as DocumentPair[];
  }

  async saveRun(run: RunRecord): Promise<void> {
    const existing = (await this.list(this.options.runsTableId, 'run_id', run.runId))
      .find((record) => fieldsOf(record).record_type === 'run');
    const compact = compactRun(run);
    await this.upsert(this.options.runsTableId, {
      record_type: 'run',
      run_id: run.runId,
      pair_id: run.pairId,
      state: run.state,
      created_at: run.createdAt,
      updated_at: run.updatedAt,
      payload_json: JSON.stringify(compact),
    }, existing ? recordId(existing) : undefined);
  }

  async getRun(runId: string): Promise<RunRecord | undefined> {
    const record = (await this.list(this.options.runsTableId, 'run_id', runId))
      .find((item) => fieldsOf(item).record_type === 'run');
    const payload = record ? fieldsOf(record).payload_json : undefined;
    return typeof payload === 'string' ? JSON.parse(payload) as RunRecord : undefined;
  }

  async listGlossary(): Promise<GlossaryEntry[]> {
    return (await this.list(this.options.glossaryTableId)).map((record) => fieldsOf(record)).map((fields) => ({
      termId: String(fields.term_id ?? ''),
      sourceTerm: String(fields.source_term ?? ''),
      ...(fields.target_term ? {targetTerm: String(fields.target_term)} : {}),
      disposition: String(fields.disposition) as GlossaryEntry['disposition'],
      scopeType: String(fields.scope_type) as GlossaryEntry['scopeType'],
      ...(fields.scope_value ? {scopeValue: String(fields.scope_value)} : {}),
      prohibitedVariants: typeof fields.prohibited_variants === 'string'
        ? JSON.parse(fields.prohibited_variants) as string[]
        : [],
      status: String(fields.status) as GlossaryEntry['status'],
    }));
  }

  async saveGlossary(entries: GlossaryEntry[]): Promise<void> {
    for (const entry of entries) {
      const existing = (await this.list(this.options.glossaryTableId, 'term_id', entry.termId))[0];
      await this.upsert(this.options.glossaryTableId, {
        term_id: entry.termId,
        source_term: entry.sourceTerm,
        target_term: entry.targetTerm ?? null,
        disposition: entry.disposition,
        scope_type: entry.scopeType,
        scope_value: entry.scopeValue ?? null,
        prohibited_variants: JSON.stringify(entry.prohibitedVariants ?? []),
        status: entry.status,
      }, existing ? recordId(existing) : undefined);
    }
  }

  async getReceipt(pairId: string): Promise<LocalizationReceipt | undefined> {
    const records = await this.list(this.options.runsTableId, 'pair_id', pairId);
    const record = records.find((item) => fieldsOf(item).record_type === 'receipt');
    const payload = record ? fieldsOf(record).payload_json : undefined;
    return typeof payload === 'string' ? JSON.parse(payload) as LocalizationReceipt : undefined;
  }

  async saveReceipt(receipt: LocalizationReceipt): Promise<void> {
    const existingRecords = await this.list(this.options.runsTableId, 'pair_id', receipt.pairId);
    const existing = existingRecords.find((item) => fieldsOf(item).record_type === 'receipt');
    await this.upsert(this.options.runsTableId, {
      record_type: 'receipt',
      run_id: receipt.runId,
      pair_id: receipt.pairId,
      state: 'completed',
      updated_at: receipt.completedAt,
      payload_json: JSON.stringify(receipt),
    }, existing ? recordId(existing) : undefined);
  }

  private parsePair(record: BaseRecord | undefined): DocumentPair | undefined {
    if (!record) return undefined;
    const fields = fieldsOf(record);
    return {
      pairId: String(fields.pair_id),
      sourceLocale: 'en',
      targetLocale: 'zh-CN',
      sourceDocUrl: String(fields.source_doc_url),
      ...(fields.source_doc_token ? {sourceDocToken: String(fields.source_doc_token)} : {}),
      ...(fields.target_doc_url ? {targetDocUrl: String(fields.target_doc_url)} : {}),
      ...(fields.target_doc_token ? {targetDocToken: String(fields.target_doc_token)} : {}),
      ...(fields.target_parent_url ? {targetParentUrl: String(fields.target_parent_url)} : {}),
      ...(fields.target_parent_token ? {targetParentToken: String(fields.target_parent_token)} : {}),
      mode: String(fields.mode) as DocumentPair['mode'],
      ...(fields.product_scope ? {productScope: String(fields.product_scope)} : {}),
      ...(fields.version_scope ? {versionScope: String(fields.version_scope)} : {}),
      ...(fields.environment_scope ? {environmentScope: String(fields.environment_scope)} : {}),
      status: String(fields.status) as DocumentPair['status'],
    };
  }
}

export type {SnapshotReference};
