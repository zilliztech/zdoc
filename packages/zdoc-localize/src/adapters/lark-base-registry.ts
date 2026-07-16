import type {LocalizationReceipt, RegistryStore, SnapshotReference} from '../application/ports.js';
import type {GlossaryEntry} from '../domain/glossary.js';
import type {DocumentPair, RunRecord} from '../domain/model.js';
import {
  readBaseLink,
  readBaseText,
  readProhibitedVariants,
  writeBaseDateTime,
  writeBaseUrl,
  writeProhibitedVariants,
} from './lark-base-cells.js';
import {larkMachineEnv, runJsonCommand, type ProcessRunner} from './process-runner.js';

export interface LarkBaseRegistryOptions {
  baseToken: string;
  documentPairsTableId: string;
  glossaryTableId: string;
  runsTableId: string;
}

type BaseRecord = {record_id?: string; recordId?: string; fields?: Record<string, unknown>} & Record<string, unknown>;

function recordsFrom(data: unknown): BaseRecord[] {
  const object = data as {
    items?: BaseRecord[];
    records?: BaseRecord[];
    data?: BaseRecord[] | unknown[][];
    fields?: string[];
    record_id_list?: string[];
  } | undefined;
  if (Array.isArray(object?.items)) return object.items;
  if (Array.isArray(object?.records)) return object.records;
  if (Array.isArray(object?.data) && Array.isArray(object.fields) && object.data.every(Array.isArray)) {
    return (object.data as unknown[][]).map((row, index) => ({
      ...(object.record_id_list?.[index] ? {record_id: object.record_id_list[index]} : {}),
      fields: Object.fromEntries(object.fields!.map((field, fieldIndex) => [field, row[fieldIndex]])),
    }));
  }
  if (Array.isArray(object?.data)) return object.data as BaseRecord[];
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
      source_doc_url: writeBaseUrl(pair.sourceDocUrl, pair.sourceDocTitle),
      source_doc_token: pair.sourceDocToken ?? null,
      target_doc_url: writeBaseUrl(pair.targetDocUrl, pair.targetDocTitle),
      target_doc_token: pair.targetDocToken ?? null,
      target_parent_url: writeBaseUrl(pair.targetParentUrl),
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
      .find((record) => readBaseText(fieldsOf(record).record_type) === 'run');
    const compact = compactRun(run);
    await this.upsert(this.options.runsTableId, {
      record_type: 'run',
      run_id: run.runId,
      pair_id: run.pairId,
      state: run.state,
      created_at: writeBaseDateTime(run.createdAt),
      updated_at: writeBaseDateTime(run.updatedAt),
      source_from_revision: run.sourceFromRevision ?? null,
      source_to_revision: run.sourceToRevision ?? null,
      target_plan_revision: run.targetPlanRevision ?? null,
      error_type: run.errorType ?? null,
      payload_json: JSON.stringify(compact),
    }, existing ? recordId(existing) : undefined);
  }

  async getRun(runId: string): Promise<RunRecord | undefined> {
    const record = (await this.list(this.options.runsTableId, 'run_id', runId))
      .find((item) => readBaseText(fieldsOf(item).record_type) === 'run');
    const payload = record ? fieldsOf(record).payload_json : undefined;
    const text = readBaseText(payload);
    return text ? JSON.parse(text) as RunRecord : undefined;
  }

  async listGlossary(): Promise<GlossaryEntry[]> {
    return (await this.list(this.options.glossaryTableId)).map((record) => fieldsOf(record)).map((fields) => ({
      termId: readBaseText(fields.term_id),
      sourceTerm: readBaseText(fields.source_term),
      ...(readBaseText(fields.target_term) ? {targetTerm: readBaseText(fields.target_term)} : {}),
      disposition: readBaseText(fields.disposition) as GlossaryEntry['disposition'],
      scopeType: readBaseText(fields.scope_type) as GlossaryEntry['scopeType'],
      ...(readBaseText(fields.scope_value) ? {scopeValue: readBaseText(fields.scope_value)} : {}),
      prohibitedVariants: readProhibitedVariants(fields.prohibited_variants),
      status: readBaseText(fields.status) as GlossaryEntry['status'],
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
        prohibited_variants: writeProhibitedVariants(entry.prohibitedVariants),
        status: entry.status,
      }, existing ? recordId(existing) : undefined);
    }
  }

  async getReceipt(pairId: string): Promise<LocalizationReceipt | undefined> {
    const records = await this.list(this.options.runsTableId, 'pair_id', pairId);
    const record = records.find((item) => readBaseText(fieldsOf(item).record_type) === 'receipt');
    const payload = record ? fieldsOf(record).payload_json : undefined;
    const text = readBaseText(payload);
    return text ? JSON.parse(text) as LocalizationReceipt : undefined;
  }

  async saveReceipt(receipt: LocalizationReceipt): Promise<void> {
    const existingRecords = await this.list(this.options.runsTableId, 'pair_id', receipt.pairId);
    const existing = existingRecords.find((item) => readBaseText(fieldsOf(item).record_type) === 'receipt');
    await this.upsert(this.options.runsTableId, {
      record_type: 'receipt',
      run_id: receipt.runId,
      pair_id: receipt.pairId,
      state: 'completed',
      updated_at: writeBaseDateTime(receipt.completedAt),
      completed_at: writeBaseDateTime(receipt.completedAt),
      source_to_revision: receipt.sourceRevision,
      target_verified_revision: receipt.targetRevision,
      source_hash: receipt.sourceHash,
      target_hash: receipt.targetHash,
      source_snapshot_token: receipt.sourceSnapshotRef.token ?? null,
      payload_json: JSON.stringify(receipt),
    }, existing ? recordId(existing) : undefined);
  }

  private parsePair(record: BaseRecord | undefined): DocumentPair | undefined {
    if (!record) return undefined;
    const fields = fieldsOf(record);
    const sourceDocument = readBaseLink(fields.source_doc_url);
    const targetDocument = readBaseLink(fields.target_doc_url);
    return {
      pairId: readBaseText(fields.pair_id),
      sourceLocale: 'en',
      targetLocale: 'zh-CN',
      sourceDocUrl: sourceDocument.link,
      ...(sourceDocument.text && sourceDocument.text !== sourceDocument.link ? {sourceDocTitle: sourceDocument.text} : {}),
      ...(readBaseText(fields.source_doc_token) ? {sourceDocToken: readBaseText(fields.source_doc_token)} : {}),
      ...(targetDocument.link ? {targetDocUrl: targetDocument.link} : {}),
      ...(targetDocument.text && targetDocument.text !== targetDocument.link ? {targetDocTitle: targetDocument.text} : {}),
      ...(readBaseText(fields.target_doc_token) ? {targetDocToken: readBaseText(fields.target_doc_token)} : {}),
      ...(readBaseText(fields.target_parent_url) ? {targetParentUrl: readBaseText(fields.target_parent_url)} : {}),
      ...(readBaseText(fields.target_parent_token) ? {targetParentToken: readBaseText(fields.target_parent_token)} : {}),
      mode: readBaseText(fields.mode) as DocumentPair['mode'],
      ...(readBaseText(fields.product_scope) ? {productScope: readBaseText(fields.product_scope)} : {}),
      ...(readBaseText(fields.version_scope) ? {versionScope: readBaseText(fields.version_scope)} : {}),
      ...(readBaseText(fields.environment_scope) ? {environmentScope: readBaseText(fields.environment_scope)} : {}),
      status: readBaseText(fields.status) as DocumentPair['status'],
    };
  }
}

export type {SnapshotReference};
