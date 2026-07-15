import sqlite3 from 'sqlite3';

import type {
  TranslationMemory,
  TranslationMemoryEntry,
  TranslationMemoryQuery,
} from '../application/ports.js';
import {LocalizeError} from '../domain/errors.js';

type Row = {
  source_hash: string;
  target_locale: string;
  glossary_hash: string;
  heading_path: string;
  source_text: string;
  target_text: string;
  pair_id: string;
  run_id: string;
  approved_at: string;
};

export class SqliteTranslationMemory implements TranslationMemory {
  private readonly db: sqlite3.Database;
  private readonly ready: Promise<void>;

  constructor(path: string) {
    this.db = new sqlite3.Database(path);
    this.ready = this.run(`CREATE TABLE IF NOT EXISTS translation_memory (
      source_hash TEXT NOT NULL,
      target_locale TEXT NOT NULL,
      glossary_hash TEXT NOT NULL,
      heading_path TEXT NOT NULL,
      source_text TEXT NOT NULL,
      target_text TEXT NOT NULL,
      pair_id TEXT NOT NULL,
      run_id TEXT NOT NULL,
      approved_at TEXT NOT NULL,
      PRIMARY KEY (source_hash, target_locale, glossary_hash, heading_path)
    )`).then(() => undefined);
  }

  private run(sql: string, params: unknown[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function callback(error) {
        if (error) reject(error);
        else resolve(this);
      });
    });
  }

  private get(sql: string, params: unknown[]): Promise<Row | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get<Row>(sql, params, (error, row) => {
        if (error) reject(error);
        else resolve(row);
      });
    });
  }

  async recordApproved(entry: TranslationMemoryEntry): Promise<void> {
    await this.ready;
    if (entry.verifiedRunId !== entry.runId) {
      throw new LocalizeError({
        type: 'validation',
        subtype: 'unverified_translation_memory',
        message: 'Only translations from a verified successful run may enter translation memory.',
      });
    }
    await this.run(`INSERT OR REPLACE INTO translation_memory
      (source_hash, target_locale, glossary_hash, heading_path, source_text, target_text, pair_id, run_id, approved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      entry.sourceHash,
      entry.targetLocale,
      entry.glossaryHash,
      JSON.stringify(entry.headingPath),
      entry.sourceText,
      entry.targetText,
      entry.pairId,
      entry.runId,
      entry.approvedAt,
    ]);
  }

  async findExact(query: TranslationMemoryQuery): Promise<TranslationMemoryEntry | undefined> {
    await this.ready;
    const row = await this.get(`SELECT * FROM translation_memory
      WHERE source_hash = ? AND target_locale = ? AND glossary_hash = ? AND heading_path = ?`, [
      query.sourceHash,
      query.targetLocale,
      query.glossaryHash,
      JSON.stringify(query.headingPath),
    ]);
    return row ? {
      sourceHash: row.source_hash,
      targetLocale: row.target_locale,
      glossaryHash: row.glossary_hash,
      headingPath: JSON.parse(row.heading_path) as string[],
      sourceText: row.source_text,
      targetText: row.target_text,
      pairId: row.pair_id,
      runId: row.run_id,
      verifiedRunId: row.run_id,
      approvedAt: row.approved_at,
    } : undefined;
  }

  async close(): Promise<void> {
    await this.ready;
    await new Promise<void>((resolve, reject) => {
      this.db.close((error) => error ? reject(error) : resolve());
    });
  }
}
