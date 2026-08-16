import {z} from 'zod';

const CommitSha = z.string().regex(/^[a-f0-9]{40}$/u);
const Digest = z.string().regex(/^sha256:[a-f0-9]{64}$/u);
const RepositoryPath = z.string().min(1).refine(value => (
  !value.startsWith('/')
  && !value.includes('\\')
  && value.normalize('NFC') === value
  && value.split('/').every(segment => segment !== '' && segment !== '.' && segment !== '..')
), 'Ledger paths must be safe normalized repository-relative paths');

const LedgerEntrySchema = z.object({
  operationId: Digest,
  planSha256: Digest,
  resultSha256: Digest,
  target: z.literal('zh-CN-reference'),
  group: z.string().regex(/^[a-z][a-z0-9-]*$/u),
  sourceCheckpointSha: CommitSha,
  targetBaselineSha: CommitSha,
  sourcePath: RepositoryPath,
  targetPath: RepositoryPath,
  kind: z.enum(['delete_target', 'replace_path']),
  status: z.enum(['applied', 'already_applied']),
  removedPaths: z.array(RepositoryPath),
  removedStateKeys: z.array(RepositoryPath),
}).strict();

const LedgerSchema = z.object({
  schemaVersion: z.literal(1),
  document: z.literal('reference-reconciliation-ledger'),
  entries: z.array(LedgerEntrySchema),
}).strict().superRefine((ledger, context) => {
  const operationIds = new Set<string>();
  for (const [index, entry] of ledger.entries.entries()) {
    if (operationIds.has(entry.operationId)) {
      context.addIssue({code: z.ZodIssueCode.custom, path: ['entries', index, 'operationId'], message: 'Ledger operation IDs must be unique'});
      return;
    }
    operationIds.add(entry.operationId);
    if (index > 0 && compareEntries(ledger.entries[index - 1], entry) >= 0) {
      context.addIssue({code: z.ZodIssueCode.custom, path: ['entries', index], message: 'Ledger entries must be canonically sorted'});
      return;
    }
  }
});

export type ReferenceReconciliationLedgerEntry = z.infer<typeof LedgerEntrySchema>;
export type ReferenceReconciliationLedger = z.infer<typeof LedgerSchema>;

function compareEntries(left: ReferenceReconciliationLedgerEntry, right: ReferenceReconciliationLedgerEntry): number {
  return left.sourceCheckpointSha.localeCompare(right.sourceCheckpointSha, 'en')
    || left.group.localeCompare(right.group, 'en')
    || left.sourcePath.localeCompare(right.sourcePath, 'en')
    || left.operationId.localeCompare(right.operationId, 'en');
}

export function parseReferenceReconciliationLedger(value: unknown): ReferenceReconciliationLedger {
  return LedgerSchema.parse(value);
}

export function appendReferenceReconciliationLedger(
  current: ReferenceReconciliationLedger | undefined,
  entries: readonly ReferenceReconciliationLedgerEntry[],
): ReferenceReconciliationLedger {
  const existing = current ? parseReferenceReconciliationLedger(current) : {schemaVersion: 1 as const, document: 'reference-reconciliation-ledger' as const, entries: []};
  const byOperation = new Map(existing.entries.map(entry => [entry.operationId, entry]));
  for (const entry of entries) {
    const parsed = LedgerEntrySchema.parse(entry);
    const prior = byOperation.get(parsed.operationId);
    if (prior && JSON.stringify(prior) !== JSON.stringify(parsed)) throw new Error(`Ledger operation identity conflict: ${parsed.operationId}`);
    byOperation.set(parsed.operationId, parsed);
  }
  return parseReferenceReconciliationLedger({...existing, entries: [...byOperation.values()].sort(compareEntries)});
}

export function serializeReferenceReconciliationLedger(value: ReferenceReconciliationLedger): string {
  return `${JSON.stringify(parseReferenceReconciliationLedger(value), null, 2)}\n`;
}
