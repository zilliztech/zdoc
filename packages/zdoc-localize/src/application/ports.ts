import type {FeishuDocxEngine} from 'feishu-docx-engine';

import type {GlossaryEntry} from '../domain/glossary.js';
import type {DocumentPair, RunRecord} from '../domain/model.js';
import type {StoredCorrespondence} from '../domain/native-sync.js';

export interface FetchedDocument {
  documentId: string;
  revisionId: number;
  content: string;
}

export interface DocumentReadGateway {
  fetch(doc: string, revisionId?: number): Promise<FetchedDocument>;
}

export type LocalizationDocxEngine = Pick<
  FeishuDocxEngine,
  'snapshot' | 'prepare' | 'apply' | 'assessRecovery'
>;

export interface DocumentCreationGateway {
  createDocument(input: {title: string; parentToken?: string; xml: string}): Promise<{
    documentId: string;
    documentUrl?: string;
    revisionId?: number;
  }>;
}

export interface WhiteboardReadGateway {
  queryRaw(token: string): Promise<unknown>;
}

export interface LocalizationReceipt {
  pairId: string;
  sourceRevision: number;
  sourceHash: string;
  sourceSnapshotRef: SnapshotReference;
  targetRevision: number;
  targetHash: string;
  runId: string;
  completedAt: string;
  correspondences: StoredCorrespondence[];
}

export interface RegistryStore {
  savePair(pair: DocumentPair): Promise<void>;
  getPair(pairId: string): Promise<DocumentPair | undefined>;
  listPairs(): Promise<DocumentPair[]>;
  saveRun(run: RunRecord): Promise<void>;
  getRun(runId: string): Promise<RunRecord | undefined>;
  listGlossary(): Promise<GlossaryEntry[]>;
  saveGlossary(entries: GlossaryEntry[]): Promise<void>;
  getReceipt(pairId: string): Promise<LocalizationReceipt | undefined>;
  saveReceipt(receipt: LocalizationReceipt): Promise<void>;
}

export interface SnapshotBundle {
  runId: string;
  files: Record<string, string>;
}

export interface SnapshotReference {
  kind: 'local' | 'drive';
  path: string;
  hash: string;
  token?: string;
}

export interface SnapshotStore {
  putBundle(bundle: SnapshotBundle): Promise<SnapshotReference>;
  getBundle(reference: SnapshotReference): Promise<SnapshotBundle>;
}

export interface TranslationMemoryEntry {
  sourceHash: string;
  targetLocale: string;
  glossaryHash: string;
  headingPath: string[];
  sourceText: string;
  targetText: string;
  pairId: string;
  runId: string;
  verifiedRunId: string;
  approvedAt: string;
}

export interface TranslationMemoryQuery {
  sourceHash: string;
  targetLocale: string;
  glossaryHash: string;
  headingPath: string[];
}

export interface TranslationMemory {
  recordApproved(entry: TranslationMemoryEntry): Promise<void>;
  findExact(query: TranslationMemoryQuery): Promise<TranslationMemoryEntry | undefined>;
  close(): Promise<void>;
}

export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  next(): string;
}
