import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {join, relative, resolve, sep} from 'node:path';

import type {DocumentSelector, DocumentSnapshot} from 'feishu-docx-engine';

import type {
  Clock,
  DocumentCreationGateway,
  DocumentGateway,
  FetchedDocument,
  IdGenerator,
  LocalizationDocxEngine,
  LocalizationReceipt,
  RegistryStore,
  SnapshotReference,
  SnapshotStore,
  TranslationMemory,
  WhiteboardGateway,
} from './ports.js';
import {alignChanges, rebaseCorrespondences} from '../domain/alignment.js';
import {diffDocuments} from '../domain/diff.js';
import {semanticDocumentFromSnapshot} from '../domain/docx-semantic.js';
import {LocalizeError} from '../domain/errors.js';
import {canonicalHash} from '../domain/hash.js';
import {renderDiagnosticMarkdown} from '../domain/markdown-renderer.js';
import {findReverseInsertionAnchor} from '../domain/recovery.js';
import {resolveGlossary, type ResolvedGlossaryTerm} from '../domain/glossary.js';
import {transitionRun} from '../domain/state-machine.js';
import type {
  AlignedChange,
  DocumentPair,
  HistoricalCorrespondence,
  RunRecord,
  SemanticChange,
  SemanticDocument,
  SemanticNode,
} from '../domain/model.js';
import {
  type LinkMapping,
  type PreservedToken,
  type TranslationMemoryExample,
  type TranslationRequest,
  type TranslationResponse,
  validateTranslations,
} from '../domain/translation.js';
import {parseFeishuDocument} from '../domain/xml-parser.js';
import {isStrictlyEmptyTarget} from '../domain/initialization.js';
import {buildInitialPlanInputs} from '../domain/initial-plan.js';
import {InitializationInspector, type InitializationDisposition} from './initialization-inspector.js';
import {
  manualSyncMarker,
  syncedReferencePlaceholder,
  type ManualSyncedReferenceAction,
} from './manual-actions.js';
import {WhiteboardMirror} from './whiteboard-mirror.js';
import {
  normalizeCorrespondences,
  verifyManualSyncedReferences,
  type StoredCorrespondence,
} from '../domain/native-sync.js';
import {
  compileReview,
  parseReview,
  type LocalizationPlan,
  type PlanOperation,
} from '../domain/review.js';

export interface WorkflowDependencies {
  cwd: string;
  registry: RegistryStore;
  snapshots: SnapshotStore;
  memory: TranslationMemory;
  engine?: LocalizationDocxEngine;
  docs: DocumentGateway;
  documentCreation?: DocumentCreationGateway;
  whiteboards?: WhiteboardGateway;
  clock: Clock;
  ids: IdGenerator;
}

interface PlanningDocument {
  fetched: FetchedDocument;
  semantic: SemanticDocument;
}

type InitializationDocument = FetchedDocument | DocumentSnapshot;
type LegacyInitializationDisposition =
  | {kind: 'incremental'}
  | {kind: 'create_target'}
  | {kind: 'initialize_empty_target'; source: FetchedDocument; target: FetchedDocument}
  | {kind: 'adopt_existing_target'; source: FetchedDocument; target: FetchedDocument};

export interface BootstrapAudit {
  correspondences: HistoricalCorrespondence[];
  unmatchedSourceNodes: string[];
  unmatchedTargetNodes: string[];
}

export interface BootstrapPlanResult {
  runId: string;
  state: 'review_required';
  audit: BootstrapAudit;
  auditPath: string;
}

export interface PlanningResult {
  runId: string;
  state: 'classification_required' | 'translation_required' | 'completed' | 'blocked';
  changes: SemanticChange[];
  translationRequests: TranslationRequest[];
  translationRequestsPath?: string;
  blocker?: string;
}

export interface CompletedPlanResult {
  runId: string;
  state: 'review_required';
  planPath: string;
  reviewPath: string;
}

export interface ApplyResult {
  runId: string;
  state: 'completed' | 'manual_action_required';
  validationPath?: string;
  manualActionsPath?: string;
}

export interface ApplyPreviewResult {
  runId: string;
  state: 'confirmation_required';
  approvalToken: string;
  pairId: string;
  sourceRevision: number;
  targetRevision: number;
  sourceHash: string;
  targetHash: string;
  creationDraftXml?: string;
  operations: Array<{
    operationId: string;
    kind: PlanOperation['kind'];
    targetBlockId?: string;
    targetBlockIds?: string[];
    anchorBlockId?: string;
    anchorOperationId?: string;
    approvedText?: string;
    decision?: 'delete' | 'protected';
    compiledXml?: string;
  }>;
}

export interface ReversePreviewResult {
  runId: string;
  state: 'confirmation_required';
  approvalToken: string;
  currentTargetHash: string;
  restoreTargetHash: string;
  operations: Array<{
    operationId: string;
    kind: 'replace' | 'insert' | 'delete' | 'whiteboard_restore';
    blockId?: string;
    blockIds?: string[];
    anchorBlockId?: string;
    xml?: string;
    expectedText?: string;
    targetNodeKind?: PlanOperation['targetNodeKind'];
    targetResourceToken?: string;
    resourceSnapshotRef?: SnapshotReference;
    expectedResourceHash?: string;
  }>;
}

interface ApplyResourceEvidence {
  sourceResourceHash?: string;
  targetResourceToken?: string;
}

interface ApplyLogEntry extends ApplyResourceEvidence {
  operationId: string;
  kind: PlanOperation['kind'];
  policy?: PlanOperation['policy'];
  resolvedBlockId?: string;
  resolvedBlockIds?: string[];
  targetHash: string;
  targetResourcePrewriteRef?: SnapshotReference;
  targetResourcePrewriteHash?: string;
}

function blockLabel(node: SemanticNode): string {
  return node.remote.blockId ?? node.nodeId;
}

function bootstrapAlignment(source: SemanticDocument, target: SemanticDocument): BootstrapAudit {
  const correspondences: HistoricalCorrespondence[] = [];
  const matchedTargetIds = new Set<string>();
  const unmatchedSourceNodes: string[] = [];

  for (const sourceNode of source.nodes) {
    const sourceGroup = source.nodes.filter((candidate) =>
      candidate.kind === sourceNode.kind && candidate.sectionIndex === sourceNode.sectionIndex,
    );
    const targetGroup = target.nodes.filter((candidate) =>
      candidate.kind === sourceNode.kind && candidate.sectionIndex === sourceNode.sectionIndex,
    );
    if (sourceGroup.length !== targetGroup.length) {
      unmatchedSourceNodes.push(blockLabel(sourceNode));
      continue;
    }
    const candidates = targetGroup.filter((targetNode) =>
      targetNode.kind === sourceNode.kind
      && targetNode.sectionIndex === sourceNode.sectionIndex
      && targetNode.siblingIndex === sourceNode.siblingIndex,
    );
    if (candidates.length === 1) {
      correspondences.push({sourceNodeId: sourceNode.nodeId, targetNodeId: candidates[0]!.nodeId});
      matchedTargetIds.add(candidates[0]!.nodeId);
    } else {
      unmatchedSourceNodes.push(blockLabel(sourceNode));
    }
  }

  return {
    correspondences,
    unmatchedSourceNodes,
    unmatchedTargetNodes: target.nodes
      .filter((node) => !matchedTargetIds.has(node.nodeId))
      .map(blockLabel),
  };
}

function tokensFrom(node: SemanticNode | undefined): PreservedToken[] {
  if (!node) return [];
  const tokens = new Map<string, PreservedToken>();
  const add = (kind: PreservedToken['kind'], value: string): void => {
    const key = `${kind}\u0000${value}`;
    const existing = tokens.get(key);
    if (existing) existing.count += 1;
    else tokens.set(key, {kind, value, count: 1});
  };
  for (const match of node.xml.matchAll(/<code(?:\s[^>]*)?>([\s\S]*?)<\/code>/g)) {
    const value = match[1]?.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    if (value) add(node.kind === 'code' ? 'code_block' : 'inline_code', value);
  }
  for (const match of node.xml.matchAll(/<(?:b|strong)(?:\s[^>]*)?>([\s\S]*?)<\/(?:b|strong)>/g)) {
    const value = match[1]?.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    if (value) add('bold_span', '');
  }
  for (const match of node.xml.matchAll(/href="([^"]+)"/g)) {
    if (match[1]) add('url', match[1]);
  }
  if (node.remote.token) add('resource_token', node.remote.token);
  return [...tokens.values()];
}

function relevantGlossary(terms: Map<string, ResolvedGlossaryTerm>, change: SemanticChange): ResolvedGlossaryTerm[] {
  const text = `${change.before?.text ?? ''}\n${change.after?.text ?? ''}`.toLowerCase();
  return [...terms.values()].filter((term) => text.includes(term.source.toLowerCase()));
}

function sectionText(document: SemanticDocument, sectionIndex: number): string {
  return document.nodes.filter((node) => node.sectionIndex === sectionIndex).map((node) => node.text).join('\n\n');
}

function targetNode(aligned: AlignedChange, target: SemanticDocument): SemanticNode | undefined {
  return aligned.targetNodeId
    ? target.nodes.find((node) => node.nodeId === aligned.targetNodeId)
    : undefined;
}

function chainInsertionAnchors(aligned: AlignedChange[]): AlignedChange[] {
  const insertedBySourceNodeId = new Map<string, string>();
  return aligned.map((item) => {
    if (item.change.kind !== 'insert') return item;
    const previousOperationId = item.change.previousSourceNodeId
      ? insertedBySourceNodeId.get(item.change.previousSourceNodeId)
      : undefined;
    const chained = previousOperationId
      ? {...item, anchorOperationId: previousOperationId, confidence: 'high' as const, score: 100, blocker: undefined}
      : item;
    if (item.change.after) insertedBySourceNodeId.set(item.change.after.nodeId, item.change.changeId);
    return chained;
  });
}

function resolveListReplacementAnchors(aligned: AlignedChange[], target: SemanticDocument): AlignedChange[] {
  const deletedBySourceNodeId = new Map(aligned.flatMap((item) =>
    item.change.kind === 'delete' && item.change.before?.kind === 'list' && item.targetNodeId
      ? [[item.change.before.nodeId, item] as const]
      : [],
  ));
  return aligned.map((item) => {
    if (item.change.kind !== 'insert' || item.change.after?.kind !== 'list' || item.confidence !== 'low') return item;
    const deleted = deletedBySourceNodeId.get(item.change.after.nodeId);
    const deletedTargetIndex = deleted?.targetNodeId
      ? target.nodes.findIndex((node) => node.nodeId === deleted.targetNodeId)
      : -1;
    if (deletedTargetIndex <= 0) return item;
    const anchor = target.nodes[deletedTargetIndex - 1];
    if (!anchor?.remote.blockId) return item;
    return {...item, anchorNodeId: anchor.nodeId, confidence: 'high', score: 100, blocker: undefined};
  });
}

function buildRequest(
  aligned: AlignedChange,
  source: SemanticDocument,
  target: SemanticDocument,
  glossary: Map<string, ResolvedGlossaryTerm>,
  memoryExamples: TranslationMemoryExample[] = [],
  linkMappings: LinkMapping[] = [],
): TranslationRequest {
  const sourceNode = aligned.change.after ?? aligned.change.before!;
  const currentTarget = targetNode(aligned, target);
  const preserved = tokensFrom(aligned.change.after ?? aligned.change.before);
  const warnings: string[] = [];
  for (const token of preserved.filter((item) => item.kind === 'url')) {
    const hashIndex = token.value.indexOf('#');
    const baseUrl = hashIndex >= 0 ? token.value.slice(0, hashIndex) : token.value;
    const exactMapping = linkMappings.find((candidate) => candidate.sourceUrl === token.value);
    const baseMapping = linkMappings.find((candidate) => candidate.sourceUrl === baseUrl);
    const mapping = exactMapping ?? baseMapping;
    if (mapping && !mapping.targetUrl) {
      warnings.push(`Internal link ${baseUrl} is missing a Chinese document mapping; preserve the English URL for review.`);
    }
    if (hashIndex >= 0 && baseMapping && !exactMapping?.targetUrl) {
      warnings.push(`Internal link ${token.value} has an unresolved English anchor; do not invent a Chinese anchor.`);
    }
  }
  return {
    operationId: aligned.change.changeId,
    changeKind: aligned.change.kind,
    ...(aligned.change.before ? {sourceBefore: aligned.change.before.text} : {}),
    ...(aligned.change.after ? {sourceAfter: aligned.change.after.text} : {}),
    ...(currentTarget ? {targetCurrent: currentTarget.text} : {}),
    sectionContext: {
      source: sectionText(source, sourceNode.sectionIndex),
      target: sectionText(target, currentTarget?.sectionIndex ?? sourceNode.sectionIndex),
    },
    glossary: relevantGlossary(glossary, aligned.change),
    memoryExamples,
    preserved,
    linkMappings,
    warnings,
    targetNodeKind: currentTarget?.kind ?? sourceNode.kind,
  };
}

function documentArtifacts(name: string, content: string, document: SemanticDocument): Record<string, string> {
  return {
    [`${name}.xml`]: content,
    [`${name}.semantic.json`]: `${JSON.stringify(document, null, 2)}\n`,
    [`${name}.md`]: renderDiagnosticMarkdown(document),
  };
}

function currentDocumentArtifacts(
  source: FetchedDocument,
  target: FetchedDocument,
  semantic?: {source: SemanticDocument; target: SemanticDocument},
): Record<string, string> {
  const sourceDocument = semantic?.source ?? parseFeishuDocument(source.content, {
    documentId: source.documentId,
    revisionId: source.revisionId,
  });
  const targetDocument = semantic?.target ?? parseFeishuDocument(target.content, {
    documentId: target.documentId,
    revisionId: target.revisionId,
  });
  return {
    ...documentArtifacts('source-current', source.content, sourceDocument),
    ...documentArtifacts('target-current', target.content, targetDocument),
  };
}

function engineSelector(value: string): DocumentSelector {
  return /^https?:\/\//.test(value)
    ? {kind: 'url', url: value}
    : {kind: 'docx', token: value};
}

function isDocumentSnapshot(value: InitializationDocument): value is DocumentSnapshot {
  return 'revision' in value && 'nodes' in value;
}

function planningDocumentFromSnapshot(snapshot: DocumentSnapshot): PlanningDocument {
  const semantic = semanticDocumentFromSnapshot(snapshot);
  return {
    semantic,
    fetched: {
      documentId: snapshot.documentId,
      revisionId: semantic.revisionId,
      content: semantic.rawXml,
    },
  };
}

function planningDocumentFromFetch(fetched: FetchedDocument): PlanningDocument {
  return {
    fetched,
    semantic: parseFeishuDocument(fetched.content, {
      documentId: fetched.documentId,
      revisionId: fetched.revisionId,
    }),
  };
}

function runErrorProjection(error: LocalizeError): Pick<RunRecord, 'errorType' | 'errorDetail'> {
  return {
    errorType: error.subtype ?? error.type,
    errorDetail: {
      type: error.type,
      ...(error.subtype ? {subtype: error.subtype} : {}),
      message: error.message,
      ...(error.hint ? {hint: error.hint} : {}),
      retryable: error.retryable,
      ...(error.details === undefined ? {} : {details: error.details}),
    },
  };
}

export class LocalizationWorkflows {
  constructor(private readonly dependencies: WorkflowDependencies) {}

  async planBootstrap(pairId: string): Promise<BootstrapPlanResult> {
    const pair = await this.requirePair(pairId);
    const targetUrl = this.requireTarget(pair);
    const [sourceRead, targetRead] = await Promise.all([
      this.readPlanningDocument(pair.sourceDocUrl),
      this.readPlanningDocument(targetUrl),
    ]);
    const sourceFetch = sourceRead.fetched;
    const targetFetch = targetRead.fetched;
    const source = sourceRead.semantic;
    const target = targetRead.semantic;
    await this.savePairTitles(pair, source.title, target.title);
    const audit = bootstrapAlignment(source, target);
    const runId = this.dependencies.ids.next();
    const bundle = {
      runId,
      files: {
        ...documentArtifacts('source', sourceFetch.content, source),
        ...documentArtifacts('target', targetFetch.content, target),
        'bootstrap-audit.json': JSON.stringify(audit, null, 2),
      },
    };
    const snapshotRef = await this.dependencies.snapshots.putBundle(bundle);
    const auditPath = await this.writeRunFile(runId, 'bootstrap-audit.json', bundle.files['bootstrap-audit.json']);
    await this.dependencies.registry.saveRun(this.newRun(runId, pairId, 'review_required', {
      kind: 'bootstrap',
      snapshotRef,
      audit,
      sourceRevision: source.revisionId,
      sourceHash: source.canonicalHash,
      targetRevision: target.revisionId,
      targetHash: target.canonicalHash,
    }, {sourceToRevision: source.revisionId, targetPlanRevision: target.revisionId}));
    return {runId, state: 'review_required', audit, auditPath};
  }

  async acceptBootstrap(runId: string): Promise<void> {
    const run = await this.requireRun(runId);
    if (run.state !== 'review_required' || run.metadata?.kind !== 'bootstrap') {
      throw new LocalizeError({
        type: 'validation',
        subtype: 'bootstrap_not_reviewable',
        message: `Run ${runId} is not a reviewable bootstrap run.`,
      });
    }
    const snapshotRef = run.metadata.snapshotRef as SnapshotReference;
    const bundle = await this.dependencies.snapshots.getBundle(snapshotRef);
    const audit = run.metadata.audit as BootstrapAudit | undefined
      ?? (bundle.files['bootstrap-audit.json'] ? JSON.parse(bundle.files['bootstrap-audit.json']) as BootstrapAudit : undefined);
    if (!audit) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'bootstrap_audit_missing', message: 'Bootstrap snapshot is missing its reviewed audit.'});
    }
    const sourceXml = bundle.files['source.xml'];
    const targetXml = bundle.files['target.xml'];
    if (!sourceXml || !targetXml) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'bootstrap_snapshot_incomplete', message: 'Bootstrap snapshot is incomplete.'});
    }
    const source = parseFeishuDocument(sourceXml, {
      documentId: 'source-baseline',
      revisionId: Number(run.metadata.sourceRevision),
    });
    const target = parseFeishuDocument(targetXml, {
      documentId: 'target-baseline',
      revisionId: Number(run.metadata.targetRevision),
    });
    const pair = await this.requirePair(run.pairId);
    const [currentSourceRead, currentTargetRead] = await Promise.all([
      this.readPlanningDocument(pair.sourceDocUrl),
      this.readPlanningDocument(this.requireTarget(pair)),
    ]);
    const currentSource = currentSourceRead.semantic;
    const currentTarget = currentTargetRead.semantic;
    if (currentSource.revisionId !== source.revisionId || currentSource.canonicalHash !== source.canonicalHash) {
      const error = new LocalizeError({
        type: 'stale_plan',
        subtype: 'bootstrap_source_changed',
        message: 'The remote English document changed during bootstrap review.',
      });
      await this.markRun(run, 'stale', {staleReason: 'bootstrap_source_changed'}, error);
      throw error;
    }
    if (currentTarget.revisionId !== target.revisionId || currentTarget.canonicalHash !== target.canonicalHash) {
      const error = new LocalizeError({
        type: 'stale_plan',
        subtype: 'bootstrap_target_changed',
        message: 'The remote Chinese document changed during bootstrap review.',
      });
      await this.markRun(run, 'stale', {staleReason: 'bootstrap_target_changed'}, error);
      throw error;
    }
    if (isStrictlyEmptyTarget(currentTarget)) {
      throw new LocalizeError({
        type: 'validation',
        subtype: 'empty_target_requires_initialization',
        message: 'A title-only Chinese target must be initialized through plan create, not accepted as a bootstrap baseline.',
        hint: `Run zdoc-localize plan create --pair ${run.pairId}.`,
      });
    }
    const pendingReceipt: LocalizationReceipt = {
      pairId: run.pairId,
      sourceRevision: source.revisionId,
      sourceHash: source.canonicalHash,
      sourceSnapshotRef: snapshotRef,
      targetRevision: target.revisionId,
      targetHash: target.canonicalHash,
      runId,
      completedAt: this.dependencies.clock.now().toISOString(),
      correspondences: audit.correspondences,
    };
    await this.dependencies.registry.saveReceipt(pendingReceipt);
    await this.dependencies.registry.savePair({...pair, status: 'active'});
    await this.markRun(run, 'completed', {});
  }

  async createPlan(pairId: string): Promise<PlanningResult> {
    let pair = await this.requirePair(pairId);
    if (pair.mode === 'excluded') {
      throw new LocalizeError({type: 'validation', subtype: 'pair_excluded', message: `Pair ${pairId} is excluded from localization.`});
    }
    const receipt = await this.dependencies.registry.getReceipt(pairId);
    const disposition: InitializationDisposition | LegacyInitializationDisposition = this.dependencies.engine
      ? await new InitializationInspector(this.dependencies.engine).inspect(pair, receipt)
      : await this.inspectLegacyInitialization(pair, receipt);
    if (disposition.kind === 'create_target') return this.createDocumentPlan(pair);
    if (disposition.kind === 'initialize_empty_target') {
      return this.createExistingTargetPlan(pair, disposition.source, disposition.target);
    }
    if (disposition.kind === 'adopt_existing_target') {
      throw new LocalizeError({type: 'validation', subtype: 'baseline_missing', message: `Pair ${pairId} must be bootstrapped before planning.`});
    }
    if (!receipt) throw new LocalizeError({type: 'verification_failed', subtype: 'receipt_missing', message: `Pair ${pairId} has no localization receipt.`});
    const baselineBundle = await this.dependencies.snapshots.getBundle(receipt.sourceSnapshotRef);
    const baselineXml = baselineBundle.files['source.xml'];
    if (!baselineXml) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'source_baseline_missing', message: 'The localization baseline snapshot has no source XML.'});
    }
    const [sourceRead, targetRead] = await Promise.all([
      this.readPlanningDocument(pair.sourceDocUrl),
      this.readPlanningDocument(this.requireTarget(pair)),
    ]);
    const sourceFetch = sourceRead.fetched;
    const targetFetch = targetRead.fetched;
    const baseline = parseFeishuDocument(baselineXml, {documentId: sourceFetch.documentId, revisionId: receipt.sourceRevision});
    const source = sourceRead.semantic;
    const target = targetRead.semantic;
    pair = await this.savePairTitles(pair, source.title, target.title);
    const changes = diffDocuments(baseline, source);
    const currentCorrespondences = rebaseCorrespondences(receipt.correspondences, baseline, source);
    const runId = this.dependencies.ids.next();
    const revisions = {
      sourceFromRevision: receipt.sourceRevision,
      sourceToRevision: source.revisionId,
      targetPlanRevision: target.revisionId,
    };

    const resourcePlanning = pair.mode === 'mirror'
      ? await this.createIncrementalResourceOperations(
          changes, source, target, receipt.correspondences, currentCorrespondences,
        )
      : {operations: [] as PlanOperation[], consumedChangeIds: new Set<string>()};
    const contentChanges = changes.filter((change) => !resourcePlanning.consumedChangeIds.has(change.changeId));

    if (contentChanges.length === 0 && resourcePlanning.operations.length === 0) {
      await this.dependencies.registry.saveRun(this.newRun(runId, pairId, 'completed', {kind: 'localization', noChanges: true}, revisions));
      return {runId, state: 'completed', changes, translationRequests: []};
    }
    if (pair.mode === 'independent') {
      const error = new LocalizeError({type: 'unsupported_content', subtype: 'independent_document', message: 'Independent documents are report-only.'});
      await this.dependencies.registry.saveRun(this.newRun(runId, pairId, 'blocked', {kind: 'localization', changes, blocker: 'independent document'}, {...revisions, ...runErrorProjection(error)}));
      return {runId, state: 'blocked', changes, translationRequests: [], blocker: 'independent documents are report-only'};
    }
    if (pair.mode === 'selective') {
      await this.persistPlanArtifacts(runId, sourceFetch, targetFetch, changes, [], {source, target});
      const bundleRef = await this.dependencies.snapshots.putBundle({
        runId,
        files: {
          'source-baseline.xml': baselineXml,
          ...currentDocumentArtifacts(sourceFetch, targetFetch, {source, target}),
          'changes.json': JSON.stringify(changes, null, 2),
          'current-correspondences.json': JSON.stringify(currentCorrespondences, null, 2),
        },
      });
      await this.dependencies.registry.saveRun(this.newRun(runId, pairId, 'classification_required', {
        kind: 'localization',
        bundleRef,
        changes,
        sourceRevision: source.revisionId,
        sourceHash: source.canonicalHash,
        targetRevision: target.revisionId,
        targetHash: target.canonicalHash,
      }, revisions));
      return {runId, state: 'classification_required', changes, translationRequests: []};
    }

    const aligned = chainInsertionAnchors(resolveListReplacementAnchors(
      alignChanges(contentChanges, target, receipt.correspondences, currentCorrespondences),
      target,
    ));
    const low = aligned.find((item) => item.confidence === 'low');
    if (low) {
      const blocker = low.blocker ?? 'low-confidence alignment';
      const error = new LocalizeError({type: 'alignment_blocked', subtype: 'low_confidence_alignment', message: blocker});
      await this.dependencies.registry.saveRun(this.newRun(runId, pairId, 'blocked', {kind: 'localization', changes, aligned, blocker}, {...revisions, ...runErrorProjection(error)}));
      return {runId, state: 'blocked', changes, translationRequests: [], blocker};
    }
    const unsupported = aligned.find((item) => {
      const node = item.change.after ?? item.change.before;
      return node && !node.writable;
    });
    if (unsupported) {
      const blocker = `changed ${unsupported.change.after?.kind ?? unsupported.change.before?.kind} content is report-only`;
      const error = new LocalizeError({type: 'unsupported_content', subtype: 'report_only_content', message: blocker});
      await this.dependencies.registry.saveRun(this.newRun(runId, pairId, 'blocked', {kind: 'localization', changes, aligned, blocker}, {...revisions, ...runErrorProjection(error)}));
      return {runId, state: 'blocked', changes, translationRequests: [], blocker};
    }

    const translationInputs = await this.createTranslationInputs(pair, aligned, source, target);
    const translationRequests = translationInputs.requests;
    const translationRequestsPath = await this.persistPlanArtifacts(
      runId,
      sourceFetch,
      targetFetch,
      changes,
      translationRequests,
      {source, target},
    );
    const bundleRef = await this.dependencies.snapshots.putBundle({
      runId,
      files: {
        'source-baseline.xml': baselineXml,
        ...currentDocumentArtifacts(sourceFetch, targetFetch, {source, target}),
        'changes.json': JSON.stringify(changes, null, 2),
        'alignments.json': JSON.stringify(aligned, null, 2),
        'resource-operations.json': JSON.stringify(resourcePlanning.operations, null, 2),
        'current-correspondences.json': JSON.stringify(currentCorrespondences, null, 2),
        'translation-requests.json': JSON.stringify(translationRequests, null, 2),
      },
    });
    await this.dependencies.registry.saveRun(this.newRun(runId, pairId, 'translation_required', {
      kind: 'localization',
      bundleRef,
      sourceRevision: source.revisionId,
      sourceHash: source.canonicalHash,
      targetRevision: target.revisionId,
      targetHash: target.canonicalHash,
      changes,
      aligned,
      resourceOperations: resourcePlanning.operations,
      glossaryHash: translationInputs.glossaryHash,
    }, revisions));
    return {runId, state: 'translation_required', changes, translationRequests, translationRequestsPath};
  }

  private async createIncrementalResourceOperations(
    changes: SemanticChange[],
    source: SemanticDocument,
    target: SemanticDocument,
    historicalCorrespondences: StoredCorrespondence[],
    currentCorrespondences: StoredCorrespondence[],
  ): Promise<{operations: PlanOperation[]; consumedChangeIds: Set<string>}> {
    const correspondences = normalizeCorrespondences(currentCorrespondences);
    const correspondenceBySource = new Map(correspondences.map((item) => [item.sourceNodeId, item]));
    const historicalBySource = new Map(normalizeCorrespondences(historicalCorrespondences)
      .map((item) => [item.sourceNodeId, item]));
    const targetById = new Map(target.nodes.map((node) => [node.nodeId, node]));
    const operations: PlanOperation[] = [];
    const consumedChangeIds = new Set<string>();

    for (const change of changes) {
      const sourceNode = change.after ?? change.before;
      if (!sourceNode || sourceNode.kind !== 'synced_source') continue;
      const correspondence = (change.after ? correspondenceBySource.get(change.after.nodeId) : undefined)
        ?? (change.before ? historicalBySource.get(change.before.nodeId) : undefined);
      if (!correspondence || correspondence.kind !== 'native_sync') continue;
      const targetNode = targetById.get(correspondence.targetNodeId);
      const currentSourceBlockId = sourceNode.remote.sourceBlockId ?? sourceNode.remote.blockId;
      const currentSourceDocumentId = sourceNode.remote.sourceDocumentId ?? source.documentId;
      if (
        !targetNode
        || targetNode.kind !== 'synced_reference'
        || currentSourceDocumentId !== correspondence.sourceDocumentId
        || currentSourceBlockId !== correspondence.sourceBlockId
      ) continue;
      consumedChangeIds.add(change.changeId);
      operations.push({
        operationId: change.changeId,
        policy: 'verify_synced_reference',
        effect: 'verify_only',
        kind: 'replace',
        confidence: 'high',
        ...(change.before ? {sourceBefore: change.before.text} : {}),
        ...(change.after ? {sourceAfter: change.after.text} : {}),
        sourceNodeId: sourceNode.nodeId,
        sourceNodeHash: sourceNode.fingerprint,
        sourceHeadingPath: sourceNode.headingPath,
        proposedText: '',
        targetNodeKind: 'synced_reference',
        targetNodeId: targetNode.nodeId,
        targetBlockId: targetNode.remote.blockId,
        targetNodeHash: targetNode.fingerprint,
        sourceDocumentId: correspondence.sourceDocumentId,
        sourceBlockId: correspondence.sourceBlockId,
      });
    }

    const copiedBoards = correspondences.filter((item) => item.kind === 'copied_resource' && item.resourceKind === 'whiteboard');
    if (copiedBoards.length > 0 && !this.dependencies.whiteboards) {
      throw new LocalizeError({
        type: 'configuration',
        subtype: 'whiteboard_gateway_missing',
        message: 'Incremental Whiteboard verification requires the configured Whiteboard gateway.',
      });
    }
    for (const correspondence of copiedBoards) {
      if (correspondence.kind !== 'copied_resource') continue;
      const sourceNode = source.nodes.find((node) => node.nodeId === correspondence.sourceNodeId);
      const targetNode = targetById.get(correspondence.targetNodeId);
      if (!sourceNode || sourceNode.kind !== 'whiteboard' || !sourceNode.remote.token || !targetNode || targetNode.kind !== 'whiteboard') continue;
      const sourceBoard = await new WhiteboardMirror(this.dependencies.whiteboards!).snapshot(sourceNode.remote.token);
      if (sourceBoard.hash === correspondence.sourceResourceHash) continue;
      const relatedChange = changes.find((change) =>
        (change.after?.nodeId ?? change.before?.nodeId) === sourceNode.nodeId
        && (change.after?.kind ?? change.before?.kind) === 'whiteboard',
      );
      if (relatedChange) consumedChangeIds.add(relatedChange.changeId);
      operations.push({
        operationId: relatedChange?.changeId ?? canonicalHash({
          kind: 'whiteboard_mirror', sourceNodeId: sourceNode.nodeId, sourceResourceHash: sourceBoard.hash,
        }).slice(0, 16),
        policy: 'whiteboard_mirror',
        effect: 'mirror',
        kind: 'replace',
        confidence: 'high',
        sourceAfter: sourceNode.text,
        sourceNodeId: sourceNode.nodeId,
        sourceNodeHash: sourceNode.fingerprint,
        sourceHeadingPath: sourceNode.headingPath,
        proposedText: '',
        targetNodeKind: 'whiteboard',
        targetNodeId: targetNode.nodeId,
        targetBlockId: targetNode.remote.blockId,
        targetNodeHash: targetNode.fingerprint,
        sourceResourceToken: sourceNode.remote.token,
        sourceResourceHash: sourceBoard.hash,
        targetResourceToken: targetNode.remote.token,
      });
    }
    return {operations, consumedChangeIds};
  }

  private async createDocumentPlan(pair: DocumentPair): Promise<PlanningResult> {
    if (pair.mode !== 'mirror') {
      const runId = this.dependencies.ids.next();
      const blocker = 'Automatic target creation is supported only for mirror document pairs.';
      const error = new LocalizeError({type: 'configuration', subtype: 'automatic_creation_requires_mirror', message: blocker});
      await this.dependencies.registry.saveRun(this.newRun(runId, pair.pairId, 'blocked', {kind: 'creation', blocker}, runErrorProjection(error)));
      return {runId, state: 'blocked', changes: [], translationRequests: [], blocker};
    }
    if (!pair.targetParentToken) {
      throw new LocalizeError({
        type: 'configuration',
        subtype: 'target_parent_token_missing',
        message: `Pair ${pair.pairId} needs a target parent token before a Chinese document can be created.`,
      });
    }
    const sourceRead = await this.readPlanningDocument(pair.sourceDocUrl);
    const sourceFetch = sourceRead.fetched;
    const source = sourceRead.semantic;
    pair = await this.savePairTitles(pair, source.title);
    const runId = this.dependencies.ids.next();
    const reportOnly = source.nodes.filter((node) => !node.writable && node.kind !== 'code');
    if (reportOnly.length > 0) {
      const blocker = `New target creation contains report-only content: ${reportOnly.map((node) => `${node.kind}:${blockLabel(node)}`).join(', ')}`;
      const error = new LocalizeError({type: 'unsupported_content', subtype: 'creation_report_only_content', message: blocker});
      await this.dependencies.registry.saveRun(this.newRun(runId, pair.pairId, 'blocked', {
        kind: 'creation',
        blocker,
        reportOnlyNodes: reportOnly.map((node) => ({kind: node.kind, blockId: node.remote.blockId, text: node.text})),
      }, {sourceToRevision: source.revisionId, targetPlanRevision: 0, ...runErrorProjection(error)}));
      return {runId, state: 'blocked', changes: [], translationRequests: [], blocker};
    }
    const target = parseFeishuDocument('', {documentId: 'new-target', revisionId: 0});
    const changes: SemanticChange[] = source.nodes
      .filter((node) => node.writable)
      .map((node) => ({
        changeId: canonicalHash({kind: 'insert', after: node.fingerprint, nodeId: node.nodeId, documentIndex: node.documentIndex}).slice(0, 16),
        kind: 'insert',
        after: node,
        previousSourceNodeId: source.nodes[node.documentIndex - 1]?.nodeId,
      }));
    const aligned: AlignedChange[] = changes.map((change) => ({change, confidence: 'high', score: 100}));
    const translationInputs = await this.createTranslationInputs(pair, aligned, source, target);
    const translationRequestsPath = await this.persistPlanArtifacts(
      runId,
      sourceFetch,
      {documentId: 'new-target', revisionId: 0, content: ''},
      changes,
      translationInputs.requests,
      {source, target},
    );
    const bundleRef = await this.dependencies.snapshots.putBundle({
      runId,
      files: {
        ...currentDocumentArtifacts(
          sourceFetch,
          {documentId: 'new-target', revisionId: 0, content: ''},
          {source, target},
        ),
        'changes.json': `${JSON.stringify(changes, null, 2)}\n`,
        'alignments.json': `${JSON.stringify(aligned, null, 2)}\n`,
        'translation-requests.json': `${JSON.stringify(translationInputs.requests, null, 2)}\n`,
      },
    });
    await this.dependencies.registry.saveRun(this.newRun(runId, pair.pairId, 'translation_required', {
      kind: 'creation',
      bundleRef,
      sourceRevision: source.revisionId,
      sourceHash: source.canonicalHash,
      targetRevision: 0,
      targetHash: target.canonicalHash,
      changes,
      aligned,
      glossaryHash: translationInputs.glossaryHash,
    }, {sourceToRevision: source.revisionId, targetPlanRevision: 0}));
    return {
      runId,
      state: 'translation_required',
      changes,
      translationRequests: translationInputs.requests,
      translationRequestsPath,
    };
  }

  private async createExistingTargetPlan(
    pair: DocumentPair,
    sourceInput: InitializationDocument,
    targetInput: InitializationDocument,
  ): Promise<PlanningResult> {
    if (pair.mode !== 'mirror') {
      const runId = this.dependencies.ids.next();
      const blocker = 'Existing empty target initialization is supported only for mirror document pairs.';
      const error = new LocalizeError({type: 'configuration', subtype: 'empty_target_initialization_requires_mirror', message: blocker});
      await this.dependencies.registry.saveRun(this.newRun(runId, pair.pairId, 'blocked', {
        kind: 'initialization', blocker,
      }, runErrorProjection(error)));
      return {runId, state: 'blocked', changes: [], translationRequests: [], blocker};
    }
    const sourceRead = isDocumentSnapshot(sourceInput)
      ? planningDocumentFromSnapshot(sourceInput)
      : planningDocumentFromFetch(sourceInput);
    const targetRead = isDocumentSnapshot(targetInput)
      ? planningDocumentFromSnapshot(targetInput)
      : planningDocumentFromFetch(targetInput);
    const sourceFetch = sourceRead.fetched;
    const targetFetch = targetRead.fetched;
    const source = sourceRead.semantic;
    const target = targetRead.semantic;
    pair = await this.savePairTitles(pair, source.title, target.title);
    const runId = this.dependencies.ids.next();
    const initial = buildInitialPlanInputs(source, target);
    if (initial.unsupported.length > 0) {
      const blocker = `Existing empty target initialization contains unsupported content: ${initial.unsupported.map((node) => `${node.kind}:${blockLabel(node)}`).join(', ')}`;
      const error = new LocalizeError({type: 'unsupported_content', subtype: 'initialization_unsupported_content', message: blocker});
      await this.dependencies.registry.saveRun(this.newRun(runId, pair.pairId, 'blocked', {
        kind: 'initialization',
        blocker,
        unsupportedNodes: initial.unsupported.map((node) => ({kind: node.kind, blockId: node.remote.blockId, text: node.text})),
      }, {sourceToRevision: source.revisionId, targetPlanRevision: target.revisionId, ...runErrorProjection(error)}));
      return {runId, state: 'blocked', changes: initial.changes, translationRequests: [], blocker};
    }
    const translationInputs = await this.createTranslationInputs(pair, initial.translatableAligned, source, target);
    const translationRequestsPath = await this.persistPlanArtifacts(
      runId,
      sourceFetch,
      targetFetch,
      initial.changes,
      translationInputs.requests,
      {source, target},
    );
    const initialOperationsText = `${JSON.stringify(initial.operations, null, 2)}\n`;
    const bundleRef = await this.dependencies.snapshots.putBundle({
      runId,
      files: {
        ...currentDocumentArtifacts(sourceFetch, targetFetch, {source, target}),
        'changes.json': `${JSON.stringify(initial.changes, null, 2)}\n`,
        'alignments.json': `${JSON.stringify(initial.translatableAligned, null, 2)}\n`,
        'initial-operations.json': initialOperationsText,
        'translation-requests.json': `${JSON.stringify(translationInputs.requests, null, 2)}\n`,
      },
    });
    await this.dependencies.registry.saveRun(this.newRun(runId, pair.pairId, 'translation_required', {
      kind: 'initialization',
      bundleRef,
      sourceRevision: source.revisionId,
      sourceHash: source.canonicalHash,
      targetRevision: target.revisionId,
      targetHash: target.canonicalHash,
      changes: initial.changes,
      aligned: initial.translatableAligned,
      initialOperations: initial.operations,
      glossaryHash: translationInputs.glossaryHash,
    }, {sourceToRevision: source.revisionId, targetPlanRevision: target.revisionId}));
    return {
      runId,
      state: 'translation_required',
      changes: initial.changes,
      translationRequests: translationInputs.requests,
      translationRequestsPath,
    };
  }

  async classifyPlan(runId: string, applicableChangeIds: string[]): Promise<PlanningResult> {
    const run = await this.requireRun(runId);
    if (run.state !== 'classification_required' || run.metadata?.kind !== 'localization') {
      throw new LocalizeError({type: 'validation', subtype: 'run_not_classification_required', message: `Run ${runId} is not waiting for applicability classification.`});
    }
    const pair = await this.requirePair(run.pairId);
    const bundleRef = run.metadata.bundleRef as SnapshotReference;
    const bundle = await this.dependencies.snapshots.getBundle(bundleRef);
    const changes = run.metadata.changes as SemanticChange[] | undefined
      ?? (bundle.files['changes.json'] ? JSON.parse(bundle.files['changes.json']) as SemanticChange[] : []);
    const known = new Set(changes.map((change) => change.changeId));
    if (applicableChangeIds.some((changeId) => !known.has(changeId))) {
      throw new LocalizeError({type: 'validation', subtype: 'unknown_classification_change', message: 'Classification contains an unknown change ID.'});
    }
    const selectedIds = new Set(applicableChangeIds);
    const selected = changes.filter((change) => selectedIds.has(change.changeId));
    const sourceXml = bundle.files['source-current.xml'];
    const targetXml = bundle.files['target-current.xml'];
    if (!sourceXml || !targetXml) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'classification_bundle_incomplete', message: 'Selective run snapshot is incomplete.'});
    }
    const source = parseFeishuDocument(sourceXml, {documentId: 'source-current', revisionId: Number(run.metadata.sourceRevision)});
    const target = parseFeishuDocument(targetXml, {documentId: 'target-current', revisionId: Number(run.metadata.targetRevision)});
    const receipt = await this.dependencies.registry.getReceipt(run.pairId);
    const currentCorrespondences = bundle.files['current-correspondences.json']
      ? JSON.parse(bundle.files['current-correspondences.json']) as HistoricalCorrespondence[]
      : [];
    const aligned = chainInsertionAnchors(resolveListReplacementAnchors(alignChanges(
      selected,
      target,
      receipt?.correspondences ?? [],
      currentCorrespondences,
    ), target));
    const blocker = aligned.find((item) => item.confidence === 'low')?.blocker;
    if (blocker) {
      const error = new LocalizeError({type: 'alignment_blocked', subtype: 'low_confidence_alignment', message: blocker});
      await this.markRun(run, 'blocked', {blocker, aligned}, error);
      return {runId, state: 'blocked', changes: selected, translationRequests: [], blocker};
    }
    const unsupported = aligned.find((item) => !(item.change.after ?? item.change.before)?.writable);
    if (unsupported) {
      const reason = `changed ${unsupported.change.after?.kind ?? unsupported.change.before?.kind} content is report-only`;
      const error = new LocalizeError({type: 'unsupported_content', subtype: 'report_only_content', message: reason});
      await this.markRun(run, 'blocked', {blocker: reason, aligned}, error);
      return {runId, state: 'blocked', changes: selected, translationRequests: [], blocker: reason};
    }
    const translationInputs = await this.createTranslationInputs(pair, aligned, source, target);
    const requestText = `${JSON.stringify(translationInputs.requests, null, 2)}\n`;
    const translationRequestsPath = await this.writeRunFile(runId, 'translation-requests.json', requestText);
    const completedBundleRef = await this.dependencies.snapshots.putBundle({
      runId,
      files: {
        ...bundle.files,
        'applicability.json': `${JSON.stringify({applicableChangeIds}, null, 2)}\n`,
        'alignments.json': `${JSON.stringify(aligned, null, 2)}\n`,
        'translation-requests.json': requestText,
      },
    });
    await this.markRun(run, 'translation_required', {
      bundleRef: completedBundleRef,
      changes: selected,
      aligned,
      glossaryHash: translationInputs.glossaryHash,
      applicableChangeIds,
    });
    return {
      runId,
      state: 'translation_required',
      changes: selected,
      translationRequests: translationInputs.requests,
      translationRequestsPath,
    };
  }

  async completePlan(runId: string, responses: TranslationResponse[]): Promise<CompletedPlanResult> {
    const run = await this.requireRun(runId);
    if (run.state !== 'translation_required' || !['localization', 'creation', 'initialization'].includes(String(run.metadata?.kind))) {
      throw new LocalizeError({
        type: 'validation',
        subtype: 'run_not_translation_required',
        message: `Run ${runId} is not waiting for translations.`,
      });
    }
    const metadata = run.metadata!;
    const bundleRef = metadata.bundleRef as SnapshotReference;
    const bundle = await this.dependencies.snapshots.getBundle(bundleRef);
    const requestJson = bundle.files['translation-requests.json'];
    const targetXml = bundle.files['target-current.xml'];
    if (!requestJson || targetXml === undefined) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'plan_bundle_incomplete', message: 'Planning snapshot is missing translation requests or target XML.'});
    }
    const requests = JSON.parse(requestJson) as TranslationRequest[];
    const validated = validateTranslations(requests, responses);
    const aligned = metadata.aligned as AlignedChange[] | undefined
      ?? (bundle.files['alignments.json'] ? JSON.parse(bundle.files['alignments.json']) as AlignedChange[] : undefined);
    if (!aligned) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'plan_alignments_missing', message: 'Planning snapshot is missing alignments.'});
    }
    const target = parseFeishuDocument(targetXml, {
      documentId: 'target-plan',
      revisionId: Number(metadata.targetRevision),
    });
    const validatedById = new Map(validated.map((item) => [item.operationId, item]));
    const requestById = new Map(requests.map((item) => [item.operationId, item]));
    const resourceOperations = (metadata.resourceOperations as PlanOperation[] | undefined)
      ?? (bundle.files['resource-operations.json']
        ? JSON.parse(bundle.files['resource-operations.json']) as PlanOperation[]
        : []);
    const operations: PlanOperation[] = run.metadata?.kind === 'initialization'
      ? ((metadata.initialOperations as PlanOperation[] | undefined)
          ?? (bundle.files['initial-operations.json']
            ? JSON.parse(bundle.files['initial-operations.json']) as PlanOperation[]
            : []))
        .map((operation) => {
          if (operation.policy !== 'translation') return operation;
          const translation = validatedById.get(operation.operationId);
          const request = requestById.get(operation.operationId);
          if (!translation || !request || 'decision' in translation) {
            throw new LocalizeError({
              type: 'verification_failed',
              subtype: 'initialization_translation_missing',
              message: `Initialization operation ${operation.operationId} has no validated translation.`,
            });
          }
          return {
            ...operation,
            proposedText: translation.translatedText,
            preserved: request.preserved,
          };
        })
      : [...aligned.map((item) => {
      const translation = validatedById.get(item.change.changeId)!;
      const request = requestById.get(item.change.changeId)!;
      const targetNode = item.targetNodeId
        ? target.nodes.find((node) => node.nodeId === item.targetNodeId)
        : undefined;
      const anchorNode = item.anchorNodeId
        ? target.nodes.find((node) => node.nodeId === item.anchorNodeId)
        : undefined;
      const sourceNode = item.change.after ?? item.change.before!;
      const structuralNode = targetNode ?? sourceNode;
      return {
        operationId: item.change.changeId,
        kind: item.change.kind,
        confidence: item.confidence,
        ...(item.change.before ? {sourceBefore: item.change.before.text} : {}),
        ...(item.change.after ? {sourceAfter: item.change.after.text} : {}),
        sourceNodeId: sourceNode.nodeId,
        sourceNodeHash: sourceNode.fingerprint,
        sourceHeadingPath: sourceNode.headingPath,
        ...(targetNode ? {
          targetCurrent: targetNode.text,
          targetNodeId: targetNode.nodeId,
          targetBlockId: targetNode.remote.blockId,
          ...(targetNode.remote.blockIds?.length ? {targetBlockIds: targetNode.remote.blockIds} : {}),
          targetNodeHash: targetNode.fingerprint,
        } : {}),
        ...(anchorNode ? {
          anchorNodeId: anchorNode.nodeId,
          anchorBlockId: anchorNode.remote.blockIds?.at(-1) ?? anchorNode.remote.blockId,
          anchorNodeHash: anchorNode.fingerprint,
        } : {}),
        ...(item.anchorOperationId ? {anchorOperationId: item.anchorOperationId} : {}),
        proposedText: 'decision' in translation ? 'DELETE' : translation.translatedText,
        targetNodeKind: request.targetNodeKind,
        targetElementName: structuralNode.remote.elementName,
        targetAttributes: structuralNode.remote.attributes,
        preserved: request.preserved,
      };
      }), ...resourceOperations];
    const plan: LocalizationPlan = {
      planVersion: run.metadata?.kind === 'initialization' || resourceOperations.length > 0 ? 2 : 1,
      runId,
      pairId: run.pairId,
      sourceRevision: Number(metadata.sourceRevision),
      targetRevision: Number(metadata.targetRevision),
      sourceHash: String(metadata.sourceHash),
      targetHash: String(metadata.targetHash),
      operations,
    };
    const planText = `${JSON.stringify(plan, null, 2)}\n`;
    const reviewText = compileReview(plan);
    const translationsText = `${JSON.stringify(responses, null, 2)}\n`;
    const [planPath, reviewPath] = await Promise.all([
      this.writeRunFile(runId, 'plan.json', planText),
      this.writeRunFile(runId, 'review.md', reviewText),
      this.writeRunFile(runId, 'translations.json', translationsText),
    ]);
    const completedBundleRef = await this.dependencies.snapshots.putBundle({
      runId,
      files: {...bundle.files, 'plan.json': planText, 'review.md': reviewText, 'translations.json': translationsText},
    });
    await this.markRun(run, 'review_required', {bundleRef: completedBundleRef, plan});
    return {runId, state: 'review_required', planPath, reviewPath};
  }

  async previewApply(runId: string, reviewPath: string): Promise<ApplyPreviewResult> {
    const run = await this.requireRun(runId);
    if (run.state !== 'review_required' || !['localization', 'creation', 'initialization'].includes(String(run.metadata?.kind))) {
      throw new LocalizeError({type: 'validation', subtype: 'run_not_review_required', message: `Run ${runId} is not ready to apply.`});
    }
    const plan = await this.planForRun(run);
    const approved = parseReview(await readFile(this.resolveWorkspacePath(reviewPath), 'utf8'), plan);
    const planBundle = await this.dependencies.snapshots.getBundle(run.metadata!.bundleRef as SnapshotReference);
    const requestJson = planBundle.files['translation-requests.json'];
    if (!requestJson) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'translation_requests_missing', message: 'The approved plan snapshot has no translation requests to validate against.'});
    }
    const requests = JSON.parse(requestJson) as TranslationRequest[];
    const requestById = new Map(requests.map((request) => [request.operationId, request]));
    validateTranslations(requests, approved.operations.flatMap((operation): TranslationResponse[] => {
      if ('decision' in operation) return operation.decision === 'delete'
        ? [{operationId: operation.operationId, decision: 'delete'}]
        : [];
      const request = requestById.get(operation.operationId);
      if (!request) throw new LocalizeError({type: 'verification_failed', subtype: 'translation_request_missing', message: `The approved operation ${operation.operationId} has no translation request.`});
      return [{operationId: operation.operationId, translatedText: operation.approvedText, targetNodeKind: request.targetNodeKind}];
    }));
    const approvedById = new Map(approved.operations.map((operation) => [operation.operationId, operation]));
    let creationDraftXml: string | undefined;
    if (run.metadata!.kind === 'creation') {
      const sourceXml = planBundle.files['source-current.xml'];
      if (!sourceXml) throw new LocalizeError({type: 'verification_failed', subtype: 'creation_source_missing', message: 'Creation preview has no source snapshot.'});
      const source = parseFeishuDocument(sourceXml, {documentId: 'creation-preview', revisionId: plan.sourceRevision});
      const operationBySourceId = new Map(plan.operations.map((operation) => [operation.sourceNodeId, operation]));
      const blocks: string[] = [];
      for (const node of source.nodes) {
        if (!node.writable) {
          blocks.push(node.xml);
          continue;
        }
        const operation = operationBySourceId.get(node.nodeId);
        const reviewOperation = operation ? approvedById.get(operation.operationId) : undefined;
        if (!operation || !reviewOperation || !('approvedText' in reviewOperation)) {
          throw new LocalizeError({type: 'verification_failed', subtype: 'creation_translation_missing', message: `Creation preview is missing reviewed node ${node.nodeId}.`});
        }
        blocks.push(xmlForOperation(operation, reviewOperation.approvedText));
      }
      creationDraftXml = blocks.join('');
    }
    return {
      runId,
      state: 'confirmation_required',
      approvalToken: canonicalHash({runId, planHash: approved.planHash, operations: approved.operations}),
      pairId: plan.pairId,
      sourceRevision: plan.sourceRevision,
      targetRevision: plan.targetRevision,
      sourceHash: plan.sourceHash,
      targetHash: plan.targetHash,
      ...(creationDraftXml ? {creationDraftXml} : {}),
      operations: plan.operations.map((operation) => {
        const reviewOperation = approvedById.get(operation.operationId)!;
        return {
          operationId: operation.operationId,
          kind: operation.kind,
          ...(operation.targetBlockId ? {targetBlockId: operation.targetBlockId} : {}),
          ...(operation.targetBlockIds?.length ? {targetBlockIds: operation.targetBlockIds} : {}),
          ...(operation.anchorBlockId ? {anchorBlockId: operation.anchorBlockId} : {}),
          ...(operation.anchorOperationId ? {anchorOperationId: operation.anchorOperationId} : {}),
          ...('approvedText' in reviewOperation
            ? {
                approvedText: reviewOperation.approvedText,
                compiledXml: xmlForOperation(operation, reviewOperation.approvedText),
              }
            : {decision: reviewOperation.decision}),
        };
      }),
    };
  }

  async apply(runId: string, reviewPath: string, approvalToken?: string): Promise<ApplyResult> {
    const preview = await this.previewApply(runId, reviewPath);
    if (!approvalToken || approvalToken !== preview.approvalToken) {
      throw new LocalizeError({
        type: 'confirmation_required',
        subtype: 'apply_approval_token_required',
        message: 'Applying the reviewed document requires the exact current preview approval token.',
        details: preview,
      });
    }
    let run = await this.requireRun(runId);
    if (run.state !== 'review_required' || !['localization', 'creation', 'initialization'].includes(String(run.metadata?.kind))) {
      throw new LocalizeError({type: 'validation', subtype: 'run_not_review_required', message: `Run ${runId} is not ready to apply.`});
    }
    const pair = await this.requirePair(run.pairId);
    if (run.metadata?.kind === 'creation') {
      return this.applyDocumentCreation(run, pair, reviewPath);
    }
    const targetUrl = this.requireTarget(pair);
    const plan = await this.planForRun(run);
    const approved = parseReview(await readFile(this.resolveWorkspacePath(reviewPath), 'utf8'), plan);
    const planBundle = await this.dependencies.snapshots.getBundle(run.metadata!.bundleRef as SnapshotReference);
    const requestJson = planBundle.files['translation-requests.json'];
    if (!requestJson) {
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'translation_requests_missing',
        message: 'The approved plan snapshot has no translation requests to validate against.',
      });
    }
    const requests = JSON.parse(requestJson) as TranslationRequest[];
    const requestById = new Map(requests.map((request) => [request.operationId, request]));
    validateTranslations(requests, approved.operations.flatMap((operation): TranslationResponse[] => {
      if ('decision' in operation) return operation.decision === 'delete'
        ? [{operationId: operation.operationId, decision: 'delete'}]
        : [];
      const request = requestById.get(operation.operationId);
      if (!request) {
        throw new LocalizeError({
          type: 'verification_failed',
          subtype: 'translation_request_missing',
          message: `The approved operation ${operation.operationId} has no translation request.`,
        });
      }
      return [{
        operationId: operation.operationId,
        translatedText: operation.approvedText,
        targetNodeKind: request.targetNodeKind,
      }];
    }));
    const [sourceFetch, targetFetch] = await Promise.all([
      this.dependencies.docs.fetch(pair.sourceDocUrl),
      this.dependencies.docs.fetch(targetUrl),
    ]);
    const source = parseFeishuDocument(sourceFetch.content, {documentId: sourceFetch.documentId, revisionId: sourceFetch.revisionId});
    const target = parseFeishuDocument(targetFetch.content, {documentId: targetFetch.documentId, revisionId: targetFetch.revisionId});
    if (source.revisionId !== plan.sourceRevision || source.canonicalHash !== plan.sourceHash) {
      const error = new LocalizeError({type: 'stale_plan', subtype: 'source_changed', message: 'The remote English document changed after planning.', hint: 'Regenerate the localization plan.'});
      await this.markRun(run, 'stale', {staleReason: 'source_changed'}, error);
      throw error;
    }
    if (target.revisionId !== plan.targetRevision || target.canonicalHash !== plan.targetHash) {
      const error = new LocalizeError({type: 'stale_plan', subtype: 'target_changed', message: 'The remote Chinese document changed after planning.', hint: 'Regenerate the localization plan.'});
      await this.markRun(run, 'stale', {staleReason: 'target_changed'}, error);
      throw error;
    }
    for (const operation of plan.operations) {
      if (operation.kind === 'insert' && operation.anchorOperationId) continue;
      const nodeId = operation.kind === 'insert' ? operation.anchorNodeId : operation.targetNodeId;
      const expectedHash = operation.kind === 'insert' ? operation.anchorNodeHash : operation.targetNodeHash;
      const expectedBlockId = operation.kind === 'insert' ? operation.anchorBlockId : operation.targetBlockId;
      const node = nodeId ? target.nodes.find((candidate) => candidate.nodeId === nodeId) : undefined;
      const expectedBlockIds = operation.kind === 'insert' ? undefined : operation.targetBlockIds;
      if (
        !node
        || node.fingerprint !== expectedHash
        || node.remote.blockId !== expectedBlockId
        || expectedBlockIds && JSON.stringify(node.remote.blockIds ?? []) !== JSON.stringify(expectedBlockIds)
      ) {
        const error = new LocalizeError({type: 'stale_plan', subtype: 'target_block_changed', message: `Target block for ${operation.operationId} changed after planning.`});
        await this.markRun(run, 'stale', {staleReason: 'target_block_changed', operationId: operation.operationId}, error);
        throw error;
      }
    }

    const prewriteRef = await this.dependencies.snapshots.putBundle({
      runId,
      files: {
        'target-prewrite.xml': targetFetch.content,
        'plan.json': `${JSON.stringify(plan, null, 2)}\n`,
        'approved-review.json': `${JSON.stringify(approved, null, 2)}\n`,
      },
    });
    run = await this.markRun(run, 'applying', {
      prewriteRef,
      appliedOperations: 0,
      lastVerifiedTargetHash: target.canonicalHash,
      applyLog: [],
    });
    let activeTarget = target;
    let activeRevision = target.revisionId;
    let appliedOperations = 0;
    const approvedById = new Map(approved.operations.map((operation) => [operation.operationId, operation]));
    const resolvedTargetBlockIds = new Map<string, string>();
    const applyLog: ApplyLogEntry[] = [];
    const pendingManualActions: Array<Omit<ManualSyncedReferenceAction, 'placeholderBlockId' | 'predecessorBlockId' | 'successorBlockId'>> = [];
    let potentialResourceWrite = false;

    try {
      for (const operation of plan.operations) {
        const reviewOperation = approvedById.get(operation.operationId)!;
        const beforeWrite = activeTarget;
        let effectiveOperation = operation;
        if (operation.kind === 'insert' && operation.anchorOperationId) {
          const resolvedAnchor = resolvedTargetBlockIds.get(operation.anchorOperationId);
          if (!resolvedAnchor) {
            throw new LocalizeError({
              type: 'verification_failed',
              subtype: 'chained_insertion_anchor_missing',
              message: `Insertion ${operation.operationId} depends on unresolved operation ${operation.anchorOperationId}.`,
            });
          }
          effectiveOperation = {...operation, anchorBlockId: resolvedAnchor};
        }
        const policy = effectiveOperation.policy
          ?? (effectiveOperation.kind === 'delete' ? 'delete' : 'translation');
        let writeResult: Awaited<ReturnType<DocumentGateway['insertAfter']>> | undefined;
        let sourceResourceHash: string | undefined;
        let targetResourceToken: string | undefined;
        if (policy === 'verify_synced_reference') {
          const targetNode = effectiveOperation.targetBlockId
            ? activeTarget.nodes.find((node) => node.remote.blockId === effectiveOperation.targetBlockId)
            : undefined;
          const sourceNode = source.nodes.find((node) =>
            node.kind === 'synced_source'
            && (node.remote.sourceDocumentId ?? source.documentId) === effectiveOperation.sourceDocumentId
            && (node.remote.sourceBlockId ?? node.remote.blockId) === effectiveOperation.sourceBlockId,
          );
          if (
            !sourceNode
            || !targetNode
            || targetNode.kind !== 'synced_reference'
            || targetNode.remote.sourceDocumentId !== effectiveOperation.sourceDocumentId
            || targetNode.remote.sourceBlockId !== effectiveOperation.sourceBlockId
          ) {
            throw new LocalizeError({
              type: 'verification_failed',
              subtype: 'native_synced_reference_mismatch',
              message: `Native synced reference ${operation.operationId} no longer points to the planned English source.`,
            });
          }
          const resolvedBlockId = this.requireBlockId(targetNode.remote.blockId, operation.operationId);
          resolvedTargetBlockIds.set(operation.operationId, resolvedBlockId);
          applyLog.push({
            operationId: operation.operationId,
            kind: operation.kind,
            policy,
            resolvedBlockId,
            targetHash: activeTarget.canonicalHash,
          });
          run = await this.markRun(run, 'applying', {
            prewriteRef,
            appliedOperations,
            lastVerifiedTargetHash: activeTarget.canonicalHash,
            applyLog,
          });
          continue;
        } else if (policy === 'whiteboard_mirror' && effectiveOperation.kind === 'replace') {
          const sourceToken = effectiveOperation.sourceResourceToken;
          const plannedSourceHash = effectiveOperation.sourceResourceHash;
          const existingTargetToken = effectiveOperation.targetResourceToken;
          if (!sourceToken || !plannedSourceHash || !existingTargetToken || !this.dependencies.whiteboards) {
            throw new LocalizeError({
              type: 'verification_failed',
              subtype: 'whiteboard_target_missing',
              message: `Whiteboard operation ${operation.operationId} is missing its planned source hash or target token.`,
            });
          }
          const mirror = new WhiteboardMirror(this.dependencies.whiteboards);
          const sourceSnapshot = await mirror.snapshot(sourceToken);
          if (sourceSnapshot.hash !== plannedSourceHash) {
            throw new LocalizeError({
              type: 'stale_plan',
              subtype: 'whiteboard_source_changed',
              message: `Source Whiteboard for ${operation.operationId} changed after planning.`,
              hint: 'Regenerate the localization plan and preview.',
            });
          }
          const targetPrewrite = await mirror.snapshot(existingTargetToken);
          const targetResourcePrewriteRef = await this.dependencies.snapshots.putBundle({
            runId,
            files: {
              [`whiteboard-${operation.operationId}-prewrite.json`]: `${JSON.stringify(targetPrewrite.raw, null, 2)}\n`,
            },
          });
          const provisionalLog: ApplyLogEntry = {
            operationId: operation.operationId,
            kind: operation.kind,
            policy,
            resolvedBlockId: this.requireBlockId(effectiveOperation.targetBlockId, operation.operationId),
            targetHash: activeTarget.canonicalHash,
            sourceResourceHash: sourceSnapshot.hash,
            targetResourceToken: existingTargetToken,
            targetResourcePrewriteRef,
            targetResourcePrewriteHash: targetPrewrite.hash,
          };
          applyLog.push(provisionalLog);
          potentialResourceWrite = true;
          run = await this.markRun(run, 'applying', {
            prewriteRef,
            appliedOperations,
            lastVerifiedTargetHash: activeTarget.canonicalHash,
            applyLog,
          });
          const mirrored = await mirror.mirrorSnapshot(
            sourceSnapshot,
            existingTargetToken,
            `${runId}-${operation.operationId}`,
          );
          sourceResourceHash = mirrored.source.hash;
          targetResourceToken = existingTargetToken;
          const resolvedBlockId = this.requireBlockId(effectiveOperation.targetBlockId, operation.operationId);
          resolvedTargetBlockIds.set(operation.operationId, resolvedBlockId);
          appliedOperations += 1;
          applyLog[applyLog.length - 1] = {
            operationId: operation.operationId,
            kind: operation.kind,
            policy,
            resolvedBlockId,
            targetHash: activeTarget.canonicalHash,
            sourceResourceHash,
            targetResourceToken,
            targetResourcePrewriteRef,
            targetResourcePrewriteHash: targetPrewrite.hash,
          };
          potentialResourceWrite = false;
          run = await this.markRun(run, 'applying', {
            prewriteRef,
            appliedOperations,
            lastVerifiedTargetHash: activeTarget.canonicalHash,
            applyLog,
          });
          continue;
        } else if (effectiveOperation.kind === 'replace' && policy === 'translation') {
          writeResult = await this.dependencies.docs.replaceBlock({
            doc: targetUrl,
            blockId: this.requireBlockId(effectiveOperation.targetBlockId, operation.operationId),
            revisionId: activeRevision,
            xml: xmlForOperation(effectiveOperation, 'approvedText' in reviewOperation ? reviewOperation.approvedText : ''),
          });
        } else if (effectiveOperation.kind === 'insert') {
          let xml: string;
          if (policy === 'translation') {
            xml = xmlForOperation(effectiveOperation, 'approvedText' in reviewOperation ? reviewOperation.approvedText : '');
          } else if (policy === 'verbatim_code') {
            if (!effectiveOperation.sourceXml) {
              throw new LocalizeError({
                type: 'verification_failed',
                subtype: 'verbatim_code_xml_missing',
                message: `Verbatim code operation ${operation.operationId} has no protected source XML.`,
              });
            }
            xml = effectiveOperation.sourceXml;
          } else if (policy === 'whiteboard_mirror') {
            xml = '<whiteboard type="blank"></whiteboard>';
          } else if (policy === 'manual_synced_reference') {
            xml = syncedReferencePlaceholder(effectiveOperation, pair.sourceDocUrl);
          } else {
            throw new LocalizeError({
              type: 'unsupported_content',
              subtype: 'operation_policy_not_writable',
              message: `Operation policy ${policy} is not writable.`,
            });
          }
          writeResult = await this.dependencies.docs.insertAfter({
            doc: targetUrl,
            blockId: this.requireBlockId(effectiveOperation.anchorBlockId, operation.operationId),
            revisionId: activeRevision,
            xml,
          });
          if (policy === 'whiteboard_mirror') {
            const sourceToken = effectiveOperation.sourceResourceToken;
            const targetToken = writeResult.newBlocks?.find((block) => block.blockToken)?.blockToken;
            if (!sourceToken || !targetToken || !this.dependencies.whiteboards) {
              throw new LocalizeError({
                type: 'verification_failed',
                subtype: 'whiteboard_target_missing',
                message: `Whiteboard operation ${operation.operationId} did not return a target Whiteboard token.`,
              });
            }
            const mirrored = await new WhiteboardMirror(this.dependencies.whiteboards).mirror(
              sourceToken,
              targetToken,
              `${runId}-${operation.operationId}`,
            );
            sourceResourceHash = mirrored.source.hash;
            targetResourceToken = targetToken;
            effectiveOperation = {...effectiveOperation, targetResourceToken: targetToken};
          }
        } else if (effectiveOperation.kind === 'delete') {
          writeResult = await this.dependencies.docs.deleteBlocks({
            doc: targetUrl,
            blockIds: effectiveOperation.targetBlockIds?.length
              ? effectiveOperation.targetBlockIds
              : [this.requireBlockId(effectiveOperation.targetBlockId, operation.operationId)],
            revisionId: activeRevision,
          });
        } else {
          throw new LocalizeError({type: 'unsupported_content', subtype: 'move_not_writable', message: 'Move operations are report-only.'});
        }
        appliedOperations += 1;
        const refreshed = await this.dependencies.docs.fetch(targetUrl);
        activeRevision = refreshed.revisionId;
        const refreshedTarget = parseFeishuDocument(refreshed.content, {documentId: refreshed.documentId, revisionId: refreshed.revisionId});
        const progression = policy === 'manual_synced_reference'
          ? verifyManualPlaceholderProgression(effectiveOperation, beforeWrite, refreshedTarget)
          : verifyOperationProgression(
              effectiveOperation,
              policy === 'verbatim_code'
                ? {operationId: operation.operationId, approvedText: operation.proposedText}
                : reviewOperation,
              beforeWrite,
              refreshedTarget,
            );
        if (!progression.ok) {
          throw new LocalizeError({
            type: 'verification_failed',
            subtype: 'operation_progression_mismatch',
            message: `Readback after ${operation.operationId} did not match the exact planned block operation.`,
            details: progression,
          });
        }
        if (progression.resolvedBlockId) resolvedTargetBlockIds.set(operation.operationId, progression.resolvedBlockId);
        if (policy === 'manual_synced_reference' && progression.resolvedBlockId) {
          pendingManualActions.push({
            operationId: operation.operationId,
            marker: manualSyncMarker(operation.operationId),
            sourceDocumentId: this.requireBlockId(operation.sourceDocumentId, operation.operationId),
            sourceBlockId: this.requireBlockId(operation.sourceBlockId, operation.operationId),
            sourceNodeId: this.requireBlockId(operation.sourceNodeId, operation.operationId),
            sourceUrl: `${pair.sourceDocUrl.split('#')[0]}#${operation.sourceBlockId}`,
          });
        }
        activeTarget = refreshedTarget;
        applyLog.push({
          operationId: operation.operationId,
          kind: operation.kind,
          ...(operation.policy ? {policy: operation.policy} : {}),
          ...(progression.resolvedBlockId ? {resolvedBlockId: progression.resolvedBlockId} : {}),
          ...(progression.resolvedBlockIds?.length ? {resolvedBlockIds: progression.resolvedBlockIds} : {}),
          targetHash: activeTarget.canonicalHash,
          ...(sourceResourceHash ? {sourceResourceHash} : {}),
          ...(targetResourceToken ? {targetResourceToken} : {}),
        });
        run = await this.markRun(run, 'applying', {
          prewriteRef,
          appliedOperations,
          lastVerifiedTargetHash: activeTarget.canonicalHash,
          applyLog,
        });
      }
    } catch (error) {
      const localizeError = error instanceof LocalizeError ? error : new LocalizeError({type: 'upstream', message: String(error)});
      const state = appliedOperations > 0 || potentialResourceWrite || localizeError.type === 'partial_write' ? 'partial' : 'blocked';
      await this.markRun(run, state, {prewriteRef, appliedOperations, applyError: localizeError.message}, localizeError);
      throw localizeError;
    }

    if (pendingManualActions.length > 0) {
      const manualActions: ManualSyncedReferenceAction[] = pendingManualActions.map((action) => {
        const placeholderBlockId = this.requireBlockId(
          resolvedTargetBlockIds.get(action.operationId),
          action.operationId,
        );
        const index = activeTarget.nodes.findIndex((node) => node.remote.blockId === placeholderBlockId);
        const predecessorBlockId = index > 0 ? activeTarget.nodes[index - 1]?.remote.blockId : undefined;
        const successorBlockId = index >= 0 ? activeTarget.nodes[index + 1]?.remote.blockId : undefined;
        return {
          ...action,
          placeholderBlockId,
          ...(predecessorBlockId ? {predecessorBlockId} : {}),
          ...(successorBlockId ? {successorBlockId} : {}),
        };
      });
      const manualActionsText = `${JSON.stringify(manualActions, null, 2)}\n`;
      const manualActionsPath = await this.writeRunFile(runId, 'manual-actions.json', manualActionsText);
      const postAutomaticRef = await this.dependencies.snapshots.putBundle({
        runId,
        files: {
          'target-after-automatic-apply.xml': activeTarget.rawXml,
          'manual-actions.json': manualActionsText,
        },
      });
      await this.markRun(run, 'manual_action_required', {
        prewriteRef,
        postAutomaticRef,
        appliedOperations,
        lastVerifiedTargetHash: activeTarget.canonicalHash,
        applyLog,
        manualActions,
        manualActionsPath,
      });
      return {runId, state: 'manual_action_required', manualActionsPath};
    }

    run = await this.markRun(run, 'verifying', {prewriteRef, appliedOperations});
    const resourceEvidence = resourceEvidenceFromApplyLog(applyLog);
    const verification = verifyPlan(
      plan, approved.operations, activeTarget, resolvedTargetBlockIds, resourceEvidence,
    );
    if (!verification.ok) {
      const error = new LocalizeError({
        type: 'verification_failed',
        subtype: 'target_readback_mismatch',
        message: 'The updated Chinese document did not match the approved plan.',
        details: verification,
      });
      await this.markRun(run, 'blocked', {prewriteRef, appliedOperations, verification}, error);
      throw error;
    }

    const sourceSnapshotRef = await this.dependencies.snapshots.putBundle({
      runId,
      files: {
        ...documentArtifacts('source', sourceFetch.content, source),
        ...documentArtifacts('target', activeTarget.rawXml, activeTarget),
      },
    });
    const previousReceipt = await this.dependencies.registry.getReceipt(run.pairId);
    const currentCorrespondences = planBundle.files['current-correspondences.json']
      ? JSON.parse(planBundle.files['current-correspondences.json']) as HistoricalCorrespondence[]
      : previousReceipt?.correspondences ?? [];
    const correspondences = updateCorrespondences(
      currentCorrespondences,
      plan,
      activeTarget,
      approved.operations,
      resolvedTargetBlockIds,
      resourceEvidence,
    );
    const completedAt = this.dependencies.clock.now().toISOString();
    const pendingReceipt: LocalizationReceipt = {
      pairId: run.pairId,
      sourceRevision: source.revisionId,
      sourceHash: source.canonicalHash,
      sourceSnapshotRef,
      targetRevision: activeTarget.revisionId,
      targetHash: activeTarget.canonicalHash,
      runId,
      completedAt,
      correspondences,
    };
    run = await this.markRun(run, 'verifying', {
      prewriteRef,
      appliedOperations,
      pendingReceipt,
      verification,
    });
    await this.dependencies.registry.saveReceipt(pendingReceipt);
    let translationMemoryWarning: string | undefined;
    try {
      for (const operation of plan.operations) {
        if (operation.kind === 'delete' || !operation.sourceAfter) continue;
        const reviewOperation = approvedById.get(operation.operationId)!;
        if (!('approvedText' in reviewOperation)) continue;
        await this.dependencies.memory.recordApproved({
          sourceHash: operation.sourceNodeHash ?? canonicalHash(operation.sourceAfter),
          targetLocale: 'zh-CN',
          glossaryHash: String(run.metadata?.glossaryHash ?? ''),
          headingPath: operation.sourceHeadingPath ?? [],
          sourceText: operation.sourceAfter,
          targetText: reviewOperation.approvedText,
          pairId: run.pairId,
          runId,
          verifiedRunId: runId,
          approvedAt: completedAt,
        });
      }
    } catch (error) {
      translationMemoryWarning = `Verified localization completed, but rebuildable translation memory was not updated: ${String(error)}`;
    }
    const validationPath = await this.writeRunFile(runId, 'validation-report.json', `${JSON.stringify({ok: true, operations: verification.operations}, null, 2)}\n`);
    await this.markRun(run, 'completed', {
      prewriteRef,
      appliedOperations,
      validationPath,
      ...(translationMemoryWarning ? {translationMemoryWarning} : {}),
    });
    return {runId, state: 'completed', validationPath};
  }

  async verifyManualActions(runId: string): Promise<ApplyResult> {
    let run = await this.requireRun(runId);
    if (run.state === 'completed') {
      return {
        runId,
        state: 'completed',
        ...(typeof run.metadata?.validationPath === 'string'
          ? {validationPath: run.metadata.validationPath}
          : {}),
      };
    }
    if (run.state !== 'manual_action_required') {
      throw new LocalizeError({
        type: 'validation',
        subtype: 'run_not_waiting_for_manual_actions',
        message: `Run ${runId} is not waiting for manual localization actions.`,
      });
    }

    const pair = await this.requirePair(run.pairId);
    const targetUrl = this.requireTarget(pair);
    const plan = await this.planForRun(run);
    const planBundle = await this.dependencies.snapshots.getBundle(run.metadata!.bundleRef as SnapshotReference);
    const plannedSourceXml = planBundle.files['source-current.xml'];
    if (!plannedSourceXml) {
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'manual_source_snapshot_missing',
        message: 'The manual-action run has no planned English source snapshot.',
      });
    }
    const postAutomaticRef = run.metadata?.postAutomaticRef as SnapshotReference | undefined;
    if (!postAutomaticRef) {
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'manual_target_snapshot_missing',
        message: 'The manual-action run has no post-automatic target snapshot.',
      });
    }
    const postAutomaticBundle = await this.dependencies.snapshots.getBundle(postAutomaticRef);
    const plannedTargetXml = postAutomaticBundle.files['target-after-automatic-apply.xml'];
    if (!plannedTargetXml) {
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'manual_target_snapshot_missing',
        message: 'The manual-action run has no post-automatic target XML.',
      });
    }
    const actions = (run.metadata?.manualActions as ManualSyncedReferenceAction[] | undefined) ?? [];
    if (actions.length === 0) {
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'manual_actions_missing',
        message: 'The manual-action run contains no immutable manual action records.',
      });
    }
    const prewriteRef = run.metadata?.prewriteRef as SnapshotReference | undefined;
    const prewriteBundle = prewriteRef ? await this.dependencies.snapshots.getBundle(prewriteRef) : undefined;
    const approvedJson = prewriteBundle?.files['approved-review.json'];
    if (!approvedJson) {
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'manual_approved_review_missing',
        message: 'The manual-action run has no immutable approved review snapshot.',
      });
    }
    const approved = JSON.parse(approvedJson) as ReturnType<typeof parseReview>;
    const [sourceFetch, targetFetch] = await Promise.all([
      this.dependencies.docs.fetch(pair.sourceDocUrl),
      this.dependencies.docs.fetch(targetUrl),
    ]);
    const plannedSource = parseFeishuDocument(plannedSourceXml, {
      documentId: sourceFetch.documentId,
      revisionId: plan.sourceRevision,
    });
    const source = parseFeishuDocument(sourceFetch.content, {
      documentId: sourceFetch.documentId,
      revisionId: sourceFetch.revisionId,
    });
    if (!manualSourceChangeIsSafe(plannedSource, source, actions)) {
      throw new LocalizeError({
        type: 'stale_plan',
        subtype: 'manual_source_changed',
        message: 'The English source changed outside the planned native synced blocks while manual action was pending.',
        hint: 'Restore or re-plan before verifying the manual synced references.',
      });
    }
    const plannedTarget = parseFeishuDocument(plannedTargetXml, {
      documentId: targetFetch.documentId,
      revisionId: Number(run.metadata?.targetPlanRevision ?? plan.targetRevision),
    });
    const target = parseFeishuDocument(targetFetch.content, {
      documentId: targetFetch.documentId,
      revisionId: targetFetch.revisionId,
    });
    const manualVerification = verifyManualSyncedReferences(actions, plannedTarget, target);
    const applyLog = (run.metadata?.applyLog as ApplyLogEntry[] | undefined) ?? [];
    const resolvedTargetBlockIds = new Map<string, string>();
    const resourceEvidence = new Map<string, ApplyResourceEvidence>();
    for (const entry of applyLog) {
      if (entry.resolvedBlockId) resolvedTargetBlockIds.set(entry.operationId, entry.resolvedBlockId);
      if (entry.sourceResourceHash || entry.targetResourceToken) {
        resourceEvidence.set(entry.operationId, {
          ...(entry.sourceResourceHash ? {sourceResourceHash: entry.sourceResourceHash} : {}),
          ...(entry.targetResourceToken ? {targetResourceToken: entry.targetResourceToken} : {}),
        });
      }
    }
    for (const [operationId, blockId] of manualVerification.resolvedBlockIds) {
      resolvedTargetBlockIds.set(operationId, blockId);
    }
    const verification = verifyPlan(
      plan,
      approved.operations,
      target,
      resolvedTargetBlockIds,
      resourceEvidence,
    );
    if (!verification.ok) {
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'target_readback_mismatch',
        message: 'The Chinese document does not match the approved automatic and manual localization plan.',
        details: verification,
      });
    }

    const sourceSnapshotRef = await this.dependencies.snapshots.putBundle({
      runId,
      files: {
        ...documentArtifacts('source', sourceFetch.content, source),
        ...documentArtifacts('target', targetFetch.content, target),
      },
    });
    const previousReceipt = await this.dependencies.registry.getReceipt(run.pairId);
    const currentCorrespondences = planBundle.files['current-correspondences.json']
      ? JSON.parse(planBundle.files['current-correspondences.json']) as StoredCorrespondence[]
      : previousReceipt?.correspondences ?? [];
    const correspondences = updateCorrespondences(
      currentCorrespondences,
      plan,
      target,
      approved.operations,
      resolvedTargetBlockIds,
      resourceEvidence,
    );
    const completedAt = this.dependencies.clock.now().toISOString();
    const pendingReceipt: LocalizationReceipt = {
      pairId: run.pairId,
      sourceRevision: source.revisionId,
      sourceHash: source.canonicalHash,
      sourceSnapshotRef,
      targetRevision: target.revisionId,
      targetHash: target.canonicalHash,
      runId,
      completedAt,
      correspondences,
    };
    const pendingPair: DocumentPair = {...pair, status: 'active'};
    run = await this.markRun(run, 'verifying', {
      pendingReceipt,
      pendingPair,
      verification,
      manualVerification: {correspondences: manualVerification.correspondences},
    });
    await this.dependencies.registry.savePair(pendingPair);
    await this.dependencies.registry.saveReceipt(pendingReceipt);

    let translationMemoryWarning: string | undefined;
    const approvedById = new Map(approved.operations.map((operation) => [operation.operationId, operation]));
    try {
      for (const operation of plan.operations) {
        const policy = operation.policy ?? (operation.kind === 'delete' ? 'delete' : 'translation');
        if (policy !== 'translation' || !operation.sourceAfter) continue;
        const reviewOperation = approvedById.get(operation.operationId);
        if (!reviewOperation || !('approvedText' in reviewOperation)) continue;
        await this.dependencies.memory.recordApproved({
          sourceHash: operation.sourceNodeHash ?? canonicalHash(operation.sourceAfter),
          targetLocale: 'zh-CN',
          glossaryHash: String(run.metadata?.glossaryHash ?? ''),
          headingPath: operation.sourceHeadingPath ?? [],
          sourceText: operation.sourceAfter,
          targetText: reviewOperation.approvedText,
          pairId: run.pairId,
          runId,
          verifiedRunId: runId,
          approvedAt: completedAt,
        });
      }
    } catch (error) {
      translationMemoryWarning = `Verified localization completed, but rebuildable translation memory was not updated: ${String(error)}`;
    }
    const validationPath = await this.writeRunFile(
      runId,
      'validation-report.json',
      `${JSON.stringify({ok: true, operations: verification.operations}, null, 2)}\n`,
    );
    await this.markRun(run, 'completed', {
      validationPath,
      ...(translationMemoryWarning ? {translationMemoryWarning} : {}),
    });
    return {runId, state: 'completed', validationPath};
  }

  async finalizeVerified(runId: string): Promise<ApplyResult> {
    let run = await this.requireRun(runId);
    if (run.state !== 'verifying' && !(run.state === 'applying' && run.metadata?.kind === 'creation')) {
      throw new LocalizeError({
        type: 'validation',
        subtype: 'run_not_pending_finalization',
        message: `Run ${runId} has no verified receipt pending finalization.`,
      });
    }
    const reconstructed = run.metadata?.pendingReceipt
      ? {
          receipt: run.metadata.pendingReceipt as LocalizationReceipt,
          ...(run.metadata.pendingPair ? {pair: run.metadata.pendingPair as DocumentPair} : {}),
        }
      : await this.reconstructVerifiedFinalization(run);
    if (run.state === 'applying') {
      run = await this.markRun(run, 'verifying', {
        pendingReceipt: reconstructed.receipt,
        ...(reconstructed.pair ? {pendingPair: reconstructed.pair} : {}),
      });
    }
    if (reconstructed.pair) await this.dependencies.registry.savePair(reconstructed.pair);
    const pendingReceipt = reconstructed.receipt;
    await this.dependencies.registry.saveReceipt(pendingReceipt);
    const validationPath = typeof run.metadata?.validationPath === 'string'
      ? run.metadata.validationPath
      : await this.writeRunFile(runId, 'validation-report.json', `${JSON.stringify({
        ok: true,
        finalizedAfterRetry: true,
        operations: (run.metadata?.verification as {operations?: unknown} | undefined)?.operations ?? [],
      }, null, 2)}\n`);
    await this.markRun(run, 'completed', {
      validationPath,
      finalizedAfterRetry: true,
      translationMemoryWarning: 'Translation memory was not updated during receipt-only finalization and remains rebuildable.',
    });
    return {runId, state: 'completed', validationPath};
  }

  private async reconstructVerifiedFinalization(run: RunRecord): Promise<{receipt: LocalizationReceipt; pair?: DocumentPair}> {
    const pair = await this.requirePair(run.pairId);
    const plan = await this.planForRun(run);
    const bundle = await this.dependencies.snapshots.getBundle(run.metadata!.bundleRef as SnapshotReference);
    const prewriteRef = run.metadata?.prewriteRef as SnapshotReference | undefined;
    const prewriteBundle = prewriteRef ? await this.dependencies.snapshots.getBundle(prewriteRef) : undefined;
    const approvedJson = prewriteBundle?.files['approved-review.json'];
    const reviewText = bundle.files['review.md'];
    if (!approvedJson && !reviewText) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'finalization_review_missing', message: 'Cannot reconstruct finalization without the approved review snapshot.'});
    }
    const approved = approvedJson
      ? JSON.parse(approvedJson) as ReturnType<typeof parseReview>
      : parseReview(reviewText!, plan);
    const sourceXml = bundle.files['source-current.xml'];
    if (!sourceXml) throw new LocalizeError({type: 'verification_failed', subtype: 'finalization_source_missing', message: 'Cannot reconstruct finalization without the planned source snapshot.'});
    const source = parseFeishuDocument(sourceXml, {documentId: 'planned-source', revisionId: plan.sourceRevision});
    if (source.canonicalHash !== plan.sourceHash) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'finalization_source_hash_mismatch', message: 'Planned source snapshot does not match the approved plan.'});
    }

    let createdDocumentId = typeof run.metadata?.createdDocumentId === 'string' ? run.metadata.createdDocumentId : undefined;
    let createdDocumentUrl: string | undefined;
    if (!createdDocumentId && run.metadata?.kind === 'creation') {
      try {
        const journal = JSON.parse(await readFile(
          join(this.dependencies.cwd, '.zdoc-localize', 'runs', run.runId, 'creation-result.json'),
          'utf8',
        )) as {documentId?: string; documentUrl?: string};
        createdDocumentId = journal.documentId;
        createdDocumentUrl = journal.documentUrl;
      } catch {
        // The caller receives the normal pending-finalization error below when no durable ID exists.
      }
    }
    if (run.metadata?.kind === 'creation' && createdDocumentId) {
      const plannedSource = parseFeishuDocument(sourceXml, {documentId: source.documentId, revisionId: source.revisionId});
      const operationBySourceId = new Map(plan.operations.map((operation) => [operation.sourceNodeId, operation]));
      const approvedById = new Map(approved.operations.map((operation) => [operation.operationId, operation]));
      let title = '';
      const body: string[] = [];
      for (const node of plannedSource.nodes) {
        if (!node.writable) {
          if (node.kind !== 'title') body.push(node.xml);
          continue;
        }
        const operation = operationBySourceId.get(node.nodeId);
        const reviewOperation = operation ? approvedById.get(operation.operationId) : undefined;
        if (!operation || !reviewOperation || !('approvedText' in reviewOperation)) {
          throw new LocalizeError({type: 'verification_failed', subtype: 'creation_translation_missing', message: `Cannot reconstruct reviewed creation node ${node.nodeId}.`});
        }
        if (node.kind === 'title') title = plainApproved(reviewOperation.approvedText, 'title');
        else body.push(xmlForOperation(operation, reviewOperation.approvedText));
      }
      const targetFetch = await this.dependencies.docs.fetch(createdDocumentId);
      const target = parseFeishuDocument(targetFetch.content, {documentId: targetFetch.documentId, revisionId: targetFetch.revisionId});
      const expected = parseFeishuDocument(`<title>${escapeXml(title)}</title>${body.join('')}`, {documentId: target.documentId, revisionId: target.revisionId});
      if (target.canonicalHash !== expected.canonicalHash) {
        throw new LocalizeError({type: 'verification_failed', subtype: 'created_document_mismatch', message: 'Created document no longer matches the reviewed draft.'});
      }
      const sourceSnapshotRef = await this.dependencies.snapshots.putBundle({runId: run.runId, files: {'source.xml': sourceXml, 'target.xml': targetFetch.content}});
      const updatedPair: DocumentPair = {
        ...pair,
        ...(createdDocumentUrl ?? inferredDocumentUrl(pair, createdDocumentId)
          ? {targetDocUrl: createdDocumentUrl ?? inferredDocumentUrl(pair, createdDocumentId)}
          : {}),
        targetDocToken: createdDocumentId,
        status: 'active',
      };
      return {
        pair: updatedPair,
        receipt: {
          pairId: run.pairId,
          sourceRevision: source.revisionId,
          sourceHash: source.canonicalHash,
          sourceSnapshotRef,
          targetRevision: target.revisionId,
          targetHash: target.canonicalHash,
          runId: run.runId,
          completedAt: this.dependencies.clock.now().toISOString(),
          correspondences: bootstrapAlignment(plannedSource, target).correspondences,
        },
      };
    }

    const targetUrl = this.requireTarget(pair);
    const targetFetch = await this.dependencies.docs.fetch(targetUrl);
    const target = parseFeishuDocument(targetFetch.content, {documentId: targetFetch.documentId, revisionId: targetFetch.revisionId});
    const lastVerifiedTargetHash = typeof run.metadata?.lastVerifiedTargetHash === 'string'
      ? run.metadata.lastVerifiedTargetHash
      : undefined;
    if (lastVerifiedTargetHash && target.canonicalHash !== lastVerifiedTargetHash) {
      throw new LocalizeError({
        type: 'stale_plan',
        subtype: 'finalization_target_changed',
        message: 'Target changed after write verification and before receipt finalization.',
      });
    }
    const resolvedIds = new Map<string, string>();
    const applyLog = (run.metadata?.applyLog as ApplyLogEntry[] | undefined) ?? [];
    for (const entry of applyLog) {
      if (entry.resolvedBlockId) resolvedIds.set(entry.operationId, entry.resolvedBlockId);
    }
    const resourceEvidence = resourceEvidenceFromApplyLog(applyLog);
    const verification = verifyPlan(plan, approved.operations, target, resolvedIds, resourceEvidence);
    if (!verification.ok) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'target_readback_mismatch', message: 'Current target no longer matches the verified reviewed plan.', details: verification});
    }
    const sourceSnapshotRef = await this.dependencies.snapshots.putBundle({runId: run.runId, files: {'source.xml': sourceXml, 'target.xml': targetFetch.content}});
    const previousReceipt = await this.dependencies.registry.getReceipt(run.pairId);
    const currentCorrespondences = bundle.files['current-correspondences.json']
      ? JSON.parse(bundle.files['current-correspondences.json']) as HistoricalCorrespondence[]
      : previousReceipt?.correspondences ?? [];
    return {
      receipt: {
        pairId: run.pairId,
        sourceRevision: source.revisionId,
        sourceHash: source.canonicalHash,
        sourceSnapshotRef,
        targetRevision: target.revisionId,
        targetHash: target.canonicalHash,
        runId: run.runId,
        completedAt: this.dependencies.clock.now().toISOString(),
        correspondences: updateCorrespondences(
          currentCorrespondences, plan, target, approved.operations, resolvedIds, resourceEvidence,
        ),
      },
    };
  }

  private async applyDocumentCreation(run: RunRecord, pair: DocumentPair, reviewPath: string): Promise<ApplyResult> {
    const plan = await this.planForRun(run);
    const approved = parseReview(await readFile(this.resolveWorkspacePath(reviewPath), 'utf8'), plan);
    const bundle = await this.dependencies.snapshots.getBundle(run.metadata!.bundleRef as SnapshotReference);
    const sourceXml = bundle.files['source-current.xml'];
    if (!sourceXml) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'creation_source_missing', message: 'The creation bundle has no source document.'});
    }
    const sourceFetch = await this.dependencies.docs.fetch(pair.sourceDocUrl);
    const source = parseFeishuDocument(sourceFetch.content, {documentId: sourceFetch.documentId, revisionId: sourceFetch.revisionId});
    if (source.revisionId !== plan.sourceRevision || source.canonicalHash !== plan.sourceHash) {
      const error = new LocalizeError({type: 'stale_plan', subtype: 'source_changed', message: 'The remote English document changed after planning.'});
      await this.markRun(run, 'stale', {staleReason: 'source_changed'}, error);
      throw error;
    }
    const plannedSource = parseFeishuDocument(sourceXml, {documentId: source.documentId, revisionId: source.revisionId});
    const operationBySourceId = new Map(plan.operations.map((operation) => [operation.sourceNodeId, operation]));
    const approvedById = new Map(approved.operations.map((operation) => [operation.operationId, operation]));
    let title = '';
    const body: string[] = [];
    for (const node of plannedSource.nodes) {
      if (!node.writable) {
        if (node.kind !== 'title') body.push(node.xml);
        continue;
      }
      const operation = operationBySourceId.get(node.nodeId);
      if (!operation) {
        throw new LocalizeError({type: 'verification_failed', subtype: 'creation_operation_missing', message: `Writable source node ${node.nodeId} has no reviewed creation operation.`});
      }
      const reviewOperation = approvedById.get(operation.operationId);
      if (!reviewOperation || !('approvedText' in reviewOperation)) {
        throw new LocalizeError({type: 'verification_failed', subtype: 'creation_translation_missing', message: `Creation operation ${operation.operationId} has no approved translation.`});
      }
      if (node.kind === 'title') title = plainApproved(reviewOperation.approvedText, 'title');
      else body.push(xmlForOperation(operation, reviewOperation.approvedText));
    }
    if (!title) {
      throw new LocalizeError({type: 'validation', subtype: 'creation_title_missing', message: 'The new Chinese document needs an approved title.'});
    }
    const creationSnapshot = await this.dependencies.snapshots.putBundle({
      runId: run.runId,
      files: {
        'source-precreate.xml': sourceFetch.content,
        'target-draft.xml': `<title>${escapeXml(title)}</title>${body.join('')}`,
        'approved-review.json': `${JSON.stringify(approved, null, 2)}\n`,
      },
    });
    run = await this.markRun(run, 'applying', {prewriteRef: creationSnapshot, appliedOperations: 0});
    let created: {documentId: string; documentUrl?: string; revisionId?: number};
    try {
      created = await (this.dependencies.documentCreation ?? this.dependencies.docs).createDocument({
        title,
        parentToken: pair.targetParentToken,
        xml: body.join(''),
      });
    } catch (error) {
      const localizeError = error instanceof LocalizeError ? error : new LocalizeError({type: 'upstream', message: String(error)});
      await this.markRun(run, 'blocked', {applyError: localizeError.message}, localizeError);
      throw localizeError;
    }
    const [journalResult, registryResult] = await Promise.allSettled([
      this.writeRunFile(run.runId, 'creation-result.json', `${JSON.stringify(created, null, 2)}\n`),
      this.markRun(run, 'applying', {createdDocumentId: created.documentId, appliedOperations: plan.operations.length}),
    ]);
    if (registryResult.status === 'fulfilled') run = registryResult.value;
    if (journalResult.status === 'rejected' && registryResult.status === 'rejected') {
      throw new LocalizeError({
        type: 'partial_write',
        subtype: 'created_document_id_not_durable',
        message: 'The Chinese document was created, but both local journal and shared run persistence failed.',
        hint: 'Record the returned createdDocumentId manually before retrying any creation.',
        details: {
          createdDocumentId: created.documentId,
          createdDocumentUrl: created.documentUrl,
          journalError: String(journalResult.reason),
          registryError: String(registryResult.reason),
        },
      });
    }
    if (registryResult.status === 'rejected') throw registryResult.reason;
    if (journalResult.status === 'rejected') {
      run = await this.markRun(run, 'applying', {creationJournalWarning: String(journalResult.reason)});
    }
    const targetFetch = await this.dependencies.docs.fetch(created.documentId);
    const target = parseFeishuDocument(targetFetch.content, {documentId: targetFetch.documentId, revisionId: targetFetch.revisionId});
    const expected = parseFeishuDocument(`<title>${escapeXml(title)}</title>${body.join('')}`, {
      documentId: created.documentId,
      revisionId: target.revisionId,
    });
    if (target.canonicalHash !== expected.canonicalHash) {
      const error = new LocalizeError({type: 'verification_failed', subtype: 'created_document_mismatch', message: 'The created Chinese document did not match the approved full-document draft.'});
      await this.markRun(run, 'partial', {createdDocumentId: created.documentId, verification: 'created_document_mismatch'}, error);
      throw error;
    }
    const correspondences = bootstrapAlignment(plannedSource, target).correspondences;
    const sourceSnapshotRef = await this.dependencies.snapshots.putBundle({
      runId: run.runId,
      files: {
        ...documentArtifacts('source', sourceFetch.content, source),
        ...documentArtifacts('target', targetFetch.content, target),
      },
    });
    const completedAt = this.dependencies.clock.now().toISOString();
    const updatedPair: DocumentPair = {
      ...pair,
      ...(created.documentUrl ?? inferredDocumentUrl(pair, created.documentId)
        ? {targetDocUrl: created.documentUrl ?? inferredDocumentUrl(pair, created.documentId)}
        : {}),
      targetDocToken: created.documentId,
      targetDocTitle: title,
      status: 'active',
    };
    const pendingReceipt: LocalizationReceipt = {
      pairId: run.pairId,
      sourceRevision: source.revisionId,
      sourceHash: source.canonicalHash,
      sourceSnapshotRef,
      targetRevision: target.revisionId,
      targetHash: target.canonicalHash,
      runId: run.runId,
      completedAt,
      correspondences,
    };
    run = await this.markRun(run, 'verifying', {
      createdDocumentId: created.documentId,
      pendingPair: updatedPair,
      pendingReceipt,
    });
    await this.dependencies.registry.savePair(updatedPair);
    await this.dependencies.registry.saveReceipt(pendingReceipt);
    let translationMemoryWarning: string | undefined;
    try {
      for (const operation of plan.operations) {
        if (!operation.sourceAfter) continue;
        const reviewOperation = approvedById.get(operation.operationId);
        if (!reviewOperation || !('approvedText' in reviewOperation)) continue;
        await this.dependencies.memory.recordApproved({
          sourceHash: operation.sourceNodeHash ?? canonicalHash(operation.sourceAfter),
          targetLocale: 'zh-CN', glossaryHash: String(run.metadata?.glossaryHash ?? ''),
          headingPath: operation.sourceHeadingPath ?? [], sourceText: operation.sourceAfter,
          targetText: reviewOperation.approvedText, pairId: run.pairId, runId: run.runId,
          verifiedRunId: run.runId, approvedAt: completedAt,
        });
      }
    } catch (error) {
      translationMemoryWarning = `Verified document creation completed, but rebuildable translation memory was not updated: ${String(error)}`;
    }
    const validationPath = await this.writeRunFile(run.runId, 'validation-report.json', `${JSON.stringify({ok: true, createdDocumentId: created.documentId}, null, 2)}\n`);
    await this.markRun(run, 'completed', {
      createdDocumentId: created.documentId,
      validationPath,
      ...(translationMemoryWarning ? {translationMemoryWarning} : {}),
    });
    return {runId: run.runId, state: 'completed', validationPath};
  }

  async inspectRecovery(runId: string): Promise<{
    runId: string;
    state: RunRecord['state'];
    appliedOperations: number;
    prewriteRef?: SnapshotReference;
    currentTargetHash?: string;
    currentTargetHashMatchesLastVerified?: boolean;
    resourceHashesMatch?: boolean;
    manualActionsVerified?: boolean;
    safeToRecover: boolean;
    recoveryToken?: string;
  }> {
    const run = await this.requireRun(runId);
    const pair = await this.requirePair(run.pairId);
    const selector = typeof run.metadata?.createdDocumentId === 'string'
      ? run.metadata.createdDocumentId
      : pair.targetDocUrl;
    let currentTargetHash: string | undefined;
    let currentTarget: SemanticDocument | undefined;
    if (selector) {
      const fetched = await this.dependencies.docs.fetch(selector);
      currentTarget = parseFeishuDocument(fetched.content, {
        documentId: fetched.documentId,
        revisionId: fetched.revisionId,
      });
      currentTargetHash = currentTarget.canonicalHash;
    }
    const lastVerifiedTargetHash = typeof run.metadata?.lastVerifiedTargetHash === 'string'
      ? run.metadata.lastVerifiedTargetHash
      : undefined;
    const currentTargetHashMatchesLastVerified = Boolean(
      currentTargetHash && lastVerifiedTargetHash && currentTargetHash === lastVerifiedTargetHash,
    );
    const applyLog = (run.metadata?.applyLog as ApplyLogEntry[] | undefined) ?? [];
    let resourceHashesMatch = true;
    for (const entry of applyLog) {
      if (!entry.targetResourceToken || !entry.sourceResourceHash) continue;
      if (!this.dependencies.whiteboards) {
        resourceHashesMatch = false;
        break;
      }
      const current = await new WhiteboardMirror(this.dependencies.whiteboards).snapshot(entry.targetResourceToken);
      if (current.hash !== entry.sourceResourceHash && current.hash !== entry.targetResourcePrewriteHash) {
        resourceHashesMatch = false;
        break;
      }
    }
    let manualActionsVerified = false;
    if (run.state === 'manual_action_required' && currentTarget) {
      try {
        const postAutomaticRef = run.metadata?.postAutomaticRef as SnapshotReference | undefined;
        const postAutomaticBundle = postAutomaticRef
          ? await this.dependencies.snapshots.getBundle(postAutomaticRef)
          : undefined;
        const plannedTargetXml = postAutomaticBundle?.files['target-after-automatic-apply.xml'];
        const actions = (run.metadata?.manualActions as ManualSyncedReferenceAction[] | undefined) ?? [];
        if (plannedTargetXml && actions.length > 0) {
          const plannedTarget = parseFeishuDocument(plannedTargetXml, {
            documentId: currentTarget.documentId,
            revisionId: currentTarget.revisionId,
          });
          verifyManualSyncedReferences(actions, plannedTarget, currentTarget);
          manualActionsVerified = true;
        }
      } catch {
        manualActionsVerified = false;
      }
    }
    const safeToRecover = Boolean(run.metadata?.prewriteRef)
      && resourceHashesMatch
      && (
        run.state === 'partial' && currentTargetHashMatchesLastVerified
        || run.state === 'manual_action_required' && manualActionsVerified
      );
    const recoveryToken = safeToRecover && currentTargetHash
      ? canonicalHash({runId, currentTargetHash, appliedOperations: Number(run.metadata?.appliedOperations ?? 0), prewriteRef: run.metadata?.prewriteRef})
      : undefined;
    return {
      runId,
      state: run.state,
      appliedOperations: Number(run.metadata?.appliedOperations ?? 0),
      ...(run.metadata?.prewriteRef ? {prewriteRef: run.metadata.prewriteRef as SnapshotReference} : {}),
      ...(currentTargetHash ? {currentTargetHash} : {}),
      ...(lastVerifiedTargetHash ? {currentTargetHashMatchesLastVerified} : {}),
      ...(applyLog.some((entry) => entry.targetResourceToken) ? {resourceHashesMatch} : {}),
      ...(run.state === 'manual_action_required' ? {manualActionsVerified} : {}),
      safeToRecover,
      ...(recoveryToken ? {recoveryToken} : {}),
    };
  }

  async previewReverse(runId: string): Promise<ReversePreviewResult> {
    const run = await this.requireRun(runId);
    const inspection = await this.inspectRecovery(runId);
    if (!['partial', 'manual_action_required'].includes(run.state) || !inspection.safeToRecover || !inspection.currentTargetHash) {
      throw new LocalizeError({
        type: 'confirmation_required',
        subtype: 'reverse_not_proven_safe',
        message: 'Reverse recovery requires the current target to match the last verified partial-write state.',
        details: inspection,
      });
    }
    const prewriteRef = run.metadata!.prewriteRef as SnapshotReference;
    const prewriteBundle = await this.dependencies.snapshots.getBundle(prewriteRef);
    const targetPrewriteXml = prewriteBundle.files['target-prewrite.xml'];
    if (!targetPrewriteXml) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'prewrite_target_missing', message: 'Recovery snapshot has no pre-write target document.'});
    }
    const prewrite = parseFeishuDocument(targetPrewriteXml, {documentId: 'target-prewrite', revisionId: 0});
    const plan = await this.planForRun(run);
    const planById = new Map(plan.operations.map((operation) => [operation.operationId, operation]));
    const applyLog = [...((run.metadata?.applyLog as ApplyLogEntry[] | undefined) ?? [])];
    if (run.state === 'manual_action_required') {
      const pair = await this.requirePair(run.pairId);
      const fetched = await this.dependencies.docs.fetch(this.requireTarget(pair));
      const currentTarget = parseFeishuDocument(fetched.content, {
        documentId: fetched.documentId,
        revisionId: fetched.revisionId,
      });
      const postAutomaticRef = run.metadata?.postAutomaticRef as SnapshotReference;
      const postAutomaticBundle = await this.dependencies.snapshots.getBundle(postAutomaticRef);
      const plannedTargetXml = postAutomaticBundle.files['target-after-automatic-apply.xml'];
      if (!plannedTargetXml) {
        throw new LocalizeError({type: 'verification_failed', subtype: 'manual_target_snapshot_missing', message: 'Manual recovery has no post-automatic target snapshot.'});
      }
      const plannedTarget = parseFeishuDocument(plannedTargetXml, {
        documentId: fetched.documentId,
        revisionId: fetched.revisionId,
      });
      const manual = verifyManualSyncedReferences(
        (run.metadata?.manualActions as ManualSyncedReferenceAction[] | undefined) ?? [],
        plannedTarget,
        currentTarget,
      );
      for (const entry of applyLog) {
        const resolved = manual.resolvedBlockIds.get(entry.operationId);
        if (resolved) {
          entry.resolvedBlockId = resolved;
          entry.resolvedBlockIds = [resolved];
        }
      }
    }
    const appliedDeletedBlockIds = new Set(applyLog.flatMap((entry) => {
      const operation = planById.get(entry.operationId);
      return operation?.kind === 'delete'
        ? operation.targetBlockIds?.length ? operation.targetBlockIds : operation.targetBlockId ? [operation.targetBlockId] : []
        : [];
    }));
    const operations: ReversePreviewResult['operations'] = [];
    for (const entry of [...applyLog].reverse()) {
      const operation = planById.get(entry.operationId);
      if (!operation) throw new LocalizeError({type: 'verification_failed', subtype: 'recovery_operation_missing', message: `Applied operation ${entry.operationId} is missing from the plan.`});
      if (operation.policy === 'verify_synced_reference') {
        continue;
      } else if (operation.policy === 'whiteboard_mirror' && operation.kind === 'replace') {
        if (!entry.targetResourceToken || !entry.targetResourcePrewriteRef || !entry.targetResourcePrewriteHash) {
          throw new LocalizeError({
            type: 'verification_failed', subtype: 'whiteboard_recovery_snapshot_missing',
            message: `Whiteboard operation ${operation.operationId} has no durable pre-write resource snapshot.`,
          });
        }
        operations.push({
          operationId: operation.operationId,
          kind: 'whiteboard_restore',
          targetResourceToken: entry.targetResourceToken,
          resourceSnapshotRef: entry.targetResourcePrewriteRef,
          expectedResourceHash: entry.targetResourcePrewriteHash,
        });
      } else if (operation.kind === 'replace') {
        const blockId = this.requireBlockId(operation.targetBlockId, operation.operationId);
        const node = prewrite.nodes.find((candidate) => candidate.remote.blockId === blockId);
        if (!node) throw new LocalizeError({type: 'verification_failed', subtype: 'recovery_prewrite_block_missing', message: `Pre-write block ${blockId} is missing.`});
        operations.push({operationId: operation.operationId, kind: 'replace', blockId, xml: node.xml, expectedText: node.text, targetNodeKind: node.kind});
      } else if (operation.kind === 'insert') {
        const blockIds = entry.resolvedBlockIds?.length
          ? entry.resolvedBlockIds
          : entry.resolvedBlockId ? [entry.resolvedBlockId] : [];
        if (blockIds.length === 0) throw new LocalizeError({type: 'verification_failed', subtype: 'recovery_insert_block_missing', message: `Inserted block for ${operation.operationId} was not recorded.`});
        operations.push({operationId: operation.operationId, kind: 'delete', blockId: blockIds[0], blockIds});
      } else if (operation.kind === 'delete') {
        const deletedBlockId = this.requireBlockId(operation.targetBlockId, operation.operationId);
        const index = prewrite.nodes.findIndex((node) => node.remote.blockId === deletedBlockId);
        const node = index >= 0 ? prewrite.nodes[index] : undefined;
        const anchorBlockId = findReverseInsertionAnchor(prewrite, deletedBlockId, appliedDeletedBlockIds);
        if (!node || !anchorBlockId) {
          throw new LocalizeError({type: 'unsupported_content', subtype: 'reverse_delete_without_anchor', message: `Deleted block ${deletedBlockId} cannot be safely reinserted at the document start.`});
        }
        operations.push({operationId: operation.operationId, kind: 'insert', anchorBlockId, xml: node.xml, expectedText: node.text, targetNodeKind: node.kind});
      }
    }
    return {
      runId,
      state: 'confirmation_required',
      currentTargetHash: inspection.currentTargetHash,
      restoreTargetHash: prewrite.canonicalHash,
      operations,
      approvalToken: canonicalHash({runId, currentTargetHash: inspection.currentTargetHash, restoreTargetHash: prewrite.canonicalHash, operations}),
    };
  }

  async reversePartial(runId: string, approvalToken?: string): Promise<{runId: string; state: 'blocked'; restoredTargetHash: string}> {
    let run = await this.requireRun(runId);
    const preview = await this.previewReverse(runId);
    if (!approvalToken || approvalToken !== preview.approvalToken) {
      throw new LocalizeError({type: 'confirmation_required', subtype: 'reverse_approval_token_required', message: 'Reverse recovery requires the exact current reverse preview token.', details: preview});
    }
    const pair = await this.requirePair(run.pairId);
    const targetUrl = this.requireTarget(pair);
    run = await this.markRun(run, 'recovering', {reversePreview: preview, reverseAppliedOperations: 0});
    let fetched = await this.dependencies.docs.fetch(targetUrl);
    let active = parseFeishuDocument(fetched.content, {documentId: fetched.documentId, revisionId: fetched.revisionId});
    let reverseAppliedOperations = 0;
    try {
      for (const reverse of preview.operations) {
        const before = active;
        if (reverse.kind === 'whiteboard_restore') {
          if (!this.dependencies.whiteboards || !reverse.targetResourceToken || !reverse.resourceSnapshotRef || !reverse.expectedResourceHash) {
            throw new LocalizeError({
              type: 'verification_failed', subtype: 'whiteboard_recovery_snapshot_missing',
              message: `Whiteboard reverse operation ${reverse.operationId} is incomplete.`,
            });
          }
          const bundle = await this.dependencies.snapshots.getBundle(reverse.resourceSnapshotRef);
          const rawJson = Object.values(bundle.files)[0];
          if (!rawJson) {
            throw new LocalizeError({
              type: 'verification_failed', subtype: 'whiteboard_recovery_snapshot_missing',
              message: `Whiteboard reverse operation ${reverse.operationId} has no raw snapshot payload.`,
            });
          }
          await this.dependencies.whiteboards.overwriteRaw({
            token: reverse.targetResourceToken,
            raw: JSON.parse(rawJson) as unknown,
            idempotencyToken: `${runId}-${reverse.operationId}-reverse`,
          });
          const restored = await new WhiteboardMirror(this.dependencies.whiteboards).snapshot(reverse.targetResourceToken);
          if (restored.hash !== reverse.expectedResourceHash) {
            throw new LocalizeError({
              type: 'verification_failed', subtype: 'whiteboard_reverse_verification_mismatch',
              message: `Whiteboard reverse operation ${reverse.operationId} did not restore its pre-write hash.`,
            });
          }
          reverseAppliedOperations += 1;
          run = await this.markRun(run, 'recovering', {
            reverseAppliedOperations,
            lastVerifiedTargetHash: active.canonicalHash,
          });
          continue;
        }
        let synthetic: PlanOperation;
        let reviewOperation: ReturnType<typeof parseReview>['operations'][number];
        if (reverse.kind === 'replace') {
          await this.dependencies.docs.replaceBlock({doc: targetUrl, blockId: reverse.blockId!, revisionId: active.revisionId, xml: reverse.xml!});
          synthetic = {operationId: reverse.operationId, kind: 'replace', confidence: 'high', proposedText: reverse.expectedText!, targetNodeKind: reverse.targetNodeKind!, targetBlockId: reverse.blockId};
          reviewOperation = {operationId: reverse.operationId, approvedText: reverse.expectedText!};
        } else if (reverse.kind === 'delete') {
          const blockIds = reverse.blockIds?.length ? reverse.blockIds : [reverse.blockId!];
          await this.dependencies.docs.deleteBlocks({doc: targetUrl, blockIds, revisionId: active.revisionId});
          synthetic = {operationId: reverse.operationId, kind: 'delete', confidence: 'high', proposedText: 'DELETE', targetNodeKind: 'paragraph', targetBlockId: blockIds[0], targetBlockIds: blockIds};
          reviewOperation = {operationId: reverse.operationId, decision: 'delete'};
        } else {
          await this.dependencies.docs.insertAfter({doc: targetUrl, blockId: reverse.anchorBlockId!, revisionId: active.revisionId, xml: reverse.xml!});
          synthetic = {operationId: reverse.operationId, kind: 'insert', confidence: 'high', proposedText: reverse.expectedText!, targetNodeKind: reverse.targetNodeKind!, anchorBlockId: reverse.anchorBlockId};
          reviewOperation = {operationId: reverse.operationId, approvedText: reverse.expectedText!};
        }
        reverseAppliedOperations += 1;
        fetched = await this.dependencies.docs.fetch(targetUrl);
        const after = parseFeishuDocument(fetched.content, {documentId: fetched.documentId, revisionId: fetched.revisionId});
        const progression = verifyOperationProgression(synthetic, reviewOperation, before, after);
        if (!progression.ok) throw new LocalizeError({type: 'verification_failed', subtype: 'reverse_progression_mismatch', message: `Reverse operation ${reverse.operationId} did not match its preview.`, details: progression});
        active = after;
        run = await this.markRun(run, 'recovering', {reverseAppliedOperations, lastVerifiedTargetHash: active.canonicalHash});
      }
    } catch (error) {
      const localizeError = error instanceof LocalizeError ? error : new LocalizeError({type: 'upstream', message: String(error)});
      await this.markRun(run, 'partial', {reverseAppliedOperations, reverseError: localizeError.message}, localizeError);
      throw localizeError;
    }
    if (active.canonicalHash !== preview.restoreTargetHash) {
      const error = new LocalizeError({type: 'verification_failed', subtype: 'reverse_final_hash_mismatch', message: 'Reverse recovery did not restore the exact pre-write target.'});
      await this.markRun(run, 'partial', {reverseAppliedOperations, reverseError: 'final_hash_mismatch'}, error);
      throw error;
    }
    await this.markRun(run, 'blocked', {
      reverseAppliedOperations,
      recoveryCompleted: true,
      restoredTargetHash: active.canonicalHash,
      blocker: 'Partial write was reversed; create a fresh localization plan.',
    });
    return {runId, state: 'blocked', restoredTargetHash: active.canonicalHash};
  }

  async restartFromCurrent(runId: string): Promise<PlanningResult> {
    const run = await this.requireRun(runId);
    if (!['partial', 'stale', 'blocked'].includes(run.state)) {
      throw new LocalizeError({
        type: 'validation',
        subtype: 'run_not_recoverable',
        message: `Run ${runId} is not in a recoverable state.`,
      });
    }
    if (run.state === 'partial') {
      throw new LocalizeError({
        type: 'confirmation_required',
        subtype: 'partial_recovery_required',
        message: 'A partially applied run must be inspected and reconciled before planning from current state.',
        hint: 'Run recover inspect and review the pre-write and last verified target evidence.',
      });
    }
    return this.createPlan(run.pairId);
  }

  private async readPlanningDocument(selector: string): Promise<PlanningDocument> {
    if (this.dependencies.engine) {
      return planningDocumentFromSnapshot(
        await this.dependencies.engine.snapshot(engineSelector(selector)),
      );
    }
    return planningDocumentFromFetch(await this.dependencies.docs.fetch(selector));
  }

  private async inspectLegacyInitialization(
    pair: DocumentPair,
    receipt?: LocalizationReceipt,
  ): Promise<LegacyInitializationDisposition> {
    if (receipt) return {kind: 'incremental'};
    const targetSelector = pair.targetDocUrl ?? pair.targetDocToken;
    if (!targetSelector) return {kind: 'create_target'};
    const [source, target] = await Promise.all([
      this.dependencies.docs.fetch(pair.sourceDocUrl),
      this.dependencies.docs.fetch(targetSelector),
    ]);
    return isStrictlyEmptyTarget(planningDocumentFromFetch(target).semantic)
      ? {kind: 'initialize_empty_target', source, target}
      : {kind: 'adopt_existing_target', source, target};
  }

  private async persistPlanArtifacts(
    runId: string,
    source: FetchedDocument,
    target: FetchedDocument,
    changes: SemanticChange[],
    requests: TranslationRequest[],
    semantic?: {source: SemanticDocument; target: SemanticDocument},
  ): Promise<string | undefined> {
    await Promise.all(Object.entries(currentDocumentArtifacts(source, target, semantic)).map(([name, content]) => (
      this.writeRunFile(runId, name, content)
    )));
    await this.writeRunFile(runId, 'changes.json', `${JSON.stringify(changes, null, 2)}\n`);
    return requests.length > 0
      ? this.writeRunFile(runId, 'translation-requests.json', `${JSON.stringify(requests, null, 2)}\n`)
      : undefined;
  }

  private async createTranslationInputs(
    pair: DocumentPair,
    aligned: AlignedChange[],
    source: SemanticDocument,
    target: SemanticDocument,
  ): Promise<{requests: TranslationRequest[]; glossaryHash: string}> {
    const glossary = resolveGlossary(await this.dependencies.registry.listGlossary(), {
      pairId: pair.pairId,
      product: pair.productScope,
      environment: pair.environmentScope,
      version: pair.versionScope,
    });
    const glossaryHash = canonicalHash([...glossary.values()]);
    const linkMappings = await this.createLinkMappings();
    const requests: TranslationRequest[] = [];
    for (const item of aligned) {
      const sourceNode = item.change.after ?? item.change.before!;
      const exact = await this.dependencies.memory.findExact({
        sourceHash: sourceNode.fingerprint,
        targetLocale: pair.targetLocale,
        glossaryHash,
        headingPath: sourceNode.headingPath,
      });
      const memoryExamples = exact ? [{
        source: exact.sourceText,
        target: exact.targetText,
        headingPath: exact.headingPath,
      }] : [];
      requests.push(buildRequest(item, source, target, glossary, memoryExamples, linkMappings));
    }
    return {requests, glossaryHash};
  }

  private async createLinkMappings(): Promise<LinkMapping[]> {
    const mappings: LinkMapping[] = [];
    const seen = new Set<string>();
    const add = (mapping: LinkMapping): void => {
      const key = `${mapping.sourceUrl}\u0000${mapping.targetUrl ?? ''}`;
      if (seen.has(key)) return;
      seen.add(key);
      mappings.push(mapping);
    };
    for (const candidate of await this.dependencies.registry.listPairs()) {
      add({sourceUrl: candidate.sourceDocUrl, ...(candidate.targetDocUrl ? {targetUrl: candidate.targetDocUrl} : {})});
      if (!candidate.targetDocUrl) continue;
      const receipt = await this.dependencies.registry.getReceipt(candidate.pairId);
      if (!receipt) continue;
      try {
        const bundle = await this.dependencies.snapshots.getBundle(receipt.sourceSnapshotRef);
        const sourceXml = bundle.files['source.xml'];
        const targetXml = bundle.files['target.xml'];
        if (!sourceXml || !targetXml) continue;
        const source = parseFeishuDocument(sourceXml, {documentId: 'link-source', revisionId: receipt.sourceRevision});
        const target = parseFeishuDocument(targetXml, {documentId: 'link-target', revisionId: receipt.targetRevision});
        const targetById = new Map(target.nodes.map((node) => [node.nodeId, node]));
        const sourceById = new Map(source.nodes.map((node) => [node.nodeId, node]));
        for (const correspondence of receipt.correspondences) {
          const sourceNode = sourceById.get(correspondence.sourceNodeId);
          const targetNode = targetById.get(correspondence.targetNodeId);
          const targetBlockId = targetNode?.remote.blockId;
          if (!sourceNode || !targetBlockId) continue;
          const targetUrl = `${candidate.targetDocUrl}#${targetBlockId}`;
          if (sourceNode.remote.blockId) {
            add({sourceUrl: `${candidate.sourceDocUrl}#${sourceNode.remote.blockId}`, targetUrl});
          }
          if (sourceNode.kind === 'heading' && sourceNode.text) {
            add({sourceUrl: `${candidate.sourceDocUrl}#${headingSlug(sourceNode.text)}`, targetUrl});
          }
        }
      } catch {
        // A missing historical snapshot leaves the base document mapping available and the anchor unresolved warning explicit.
      }
    }
    return mappings;
  }

  private newRun(
    runId: string,
    pairId: string,
    state: RunRecord['state'],
    metadata: Record<string, unknown>,
    projections: Pick<RunRecord, 'sourceFromRevision' | 'sourceToRevision' | 'targetPlanRevision' | 'errorType' | 'errorDetail'> = {},
  ): RunRecord {
    const now = this.dependencies.clock.now().toISOString();
    const path: RunRecord['state'][] = state === 'review_required'
      ? ['translation_required', 'review_required']
      : state === 'completed' && metadata.noChanges === true
        ? ['completed']
        : ['classification_required', 'translation_required', 'blocked'].includes(state)
          ? [state]
          : [];
    if (path.length === 0) {
      throw new LocalizeError({
        type: 'validation',
        subtype: 'illegal_initial_state',
        message: `A new localization run cannot start in ${state}.`,
      });
    }
    let current: RunRecord['state'] = 'scanning';
    for (const next of path) {
      current = transitionRun(current, next, metadata.noChanges === true ? 'no_changes' : String(metadata.kind ?? ''));
    }
    return {runId, pairId, state: current, createdAt: now, updatedAt: now, metadata, ...projections};
  }

  private async writeRunFile(runId: string, name: string, content: string): Promise<string> {
    const directory = join(this.dependencies.cwd, '.zdoc-localize', 'runs', runId);
    await mkdir(directory, {recursive: true});
    const path = join(directory, name);
    await writeFile(path, content, 'utf8');
    return relative(this.dependencies.cwd, path);
  }

  private async planForRun(run: RunRecord): Promise<LocalizationPlan> {
    if (run.metadata?.plan) return run.metadata.plan as LocalizationPlan;
    const bundleRef = run.metadata?.bundleRef as SnapshotReference | undefined;
    if (!bundleRef) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'plan_snapshot_missing', message: `Run ${run.runId} has no plan snapshot reference.`});
    }
    const bundle = await this.dependencies.snapshots.getBundle(bundleRef);
    const planJson = bundle.files['plan.json'];
    if (!planJson) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'plan_missing', message: `Run ${run.runId} snapshot has no compiled plan.`});
    }
    return JSON.parse(planJson) as LocalizationPlan;
  }

  private async requirePair(pairId: string): Promise<DocumentPair> {
    const pair = await this.dependencies.registry.getPair(pairId);
    if (!pair) throw new LocalizeError({type: 'not_found', subtype: 'pair_not_found', message: `Document pair ${pairId} was not found.`});
    return pair;
  }

  private async savePairTitles(pair: DocumentPair, sourceDocTitle: string, targetDocTitle?: string): Promise<DocumentPair> {
    const updated = {
      ...pair,
      ...(sourceDocTitle ? {sourceDocTitle} : {}),
      ...(targetDocTitle ? {targetDocTitle} : {}),
    };
    if (updated.sourceDocTitle !== pair.sourceDocTitle || updated.targetDocTitle !== pair.targetDocTitle) {
      await this.dependencies.registry.savePair(updated);
    }
    return updated;
  }

  private async requireRun(runId: string): Promise<RunRecord> {
    const run = await this.dependencies.registry.getRun(runId);
    if (!run) throw new LocalizeError({type: 'not_found', subtype: 'run_not_found', message: `Localization run ${runId} was not found.`});
    return run;
  }

  private async markRun(
    run: RunRecord,
    state: RunRecord['state'],
    metadata: Record<string, unknown>,
    error?: LocalizeError,
  ): Promise<RunRecord> {
    if (state !== run.state) transitionRun(run.state, state, String(run.metadata?.kind ?? ''));
    const updated = {
      ...run,
      state,
      updatedAt: this.dependencies.clock.now().toISOString(),
      metadata: {...run.metadata, ...metadata},
      ...(error ? runErrorProjection(error) : {}),
    };
    await this.dependencies.registry.saveRun(updated);
    return updated;
  }

  private requireBlockId(value: string | undefined, operationId: string): string {
    if (!value) {
      throw new LocalizeError({type: 'validation', subtype: 'target_block_id_missing', message: `Operation ${operationId} has no remote block ID.`});
    }
    return value;
  }

  private resolveWorkspacePath(path: string): string {
    const workspace = resolve(this.dependencies.cwd);
    const absolute = resolve(workspace, path);
    if (absolute !== workspace && !absolute.startsWith(`${workspace}${sep}`)) {
      throw new LocalizeError({
        type: 'validation',
        subtype: 'unsafe_review_path',
        message: 'Review path must stay inside the localization workspace.',
      });
    }
    return absolute;
  }

  private requireTarget(pair: DocumentPair): string {
    const selector = pair.targetDocUrl ?? pair.targetDocToken;
    if (!selector) {
      throw new LocalizeError({type: 'validation', subtype: 'target_document_missing', message: `Pair ${pair.pairId} has no target Chinese document.`});
    }
    return selector;
  }
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function inferredDocumentUrl(pair: DocumentPair, documentId: string): string | undefined {
  for (const candidate of [pair.targetParentUrl, pair.sourceDocUrl]) {
    if (!candidate) continue;
    try {
      return `${new URL(candidate).origin}/docx/${documentId}`;
    } catch {
      // A bare token remains a valid lark-cli selector when no tenant origin is available.
    }
  }
  return undefined;
}

function headingSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function rootAttributes(operation: PlanOperation): string {
  return Object.entries(operation.targetAttributes ?? {})
    .filter(([name]) => name !== 'id')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => ` ${name}="${escapeXml(value)}"`)
    .join('');
}

function inlineMarkdown(value: string): string {
  const pattern = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*)/g;
  let result = '';
  let cursor = 0;
  for (const match of value.matchAll(pattern)) {
    result += escapeXml(value.slice(cursor, match.index));
    const token = match[0];
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
    if (link) result += `<a href="${escapeXml(link[2]!)}">${escapeXml(link[1]!)}</a>`;
    else if (token.startsWith('`')) result += `<code>${escapeXml(token.slice(1, -1))}</code>`;
    else result += `<b>${escapeXml(token.slice(2, -2))}</b>`;
    cursor = (match.index ?? 0) + token.length;
  }
  return result + escapeXml(value.slice(cursor));
}

interface MarkdownList {
  ordered: boolean;
  items: Array<{text: string; children: MarkdownList[]}>;
}

function parseMarkdownList(value: string): MarkdownList | undefined {
  const lines = value.split('\n').filter((line) => line.trim()).map((line) => {
    const match = /^(\s*)(?:(\d+)\.|[-*])\s+(.+)$/.exec(line);
    return match ? {indent: match[1]!.length, ordered: Boolean(match[2]), text: match[3]!} : undefined;
  });
  if (lines.some((line) => !line) || !lines[0]) return undefined;

  const parseAt = (start: number, indent: number, ordered: boolean): {list: MarkdownList; next: number} => {
    const list: MarkdownList = {ordered, items: []};
    let index = start;
    while (index < lines.length) {
      const line = lines[index]!;
      if (line.indent < indent || line.indent === indent && line.ordered !== ordered) break;
      if (line.indent > indent) break;
      const item = {text: line.text, children: [] as MarkdownList[]};
      list.items.push(item);
      index += 1;
      while (index < lines.length && lines[index]!.indent > indent) {
        const child = parseAt(index, lines[index]!.indent, lines[index]!.ordered);
        item.children.push(child.list);
        index = child.next;
      }
    }
    return {list, next: index};
  };

  const parsed = parseAt(0, lines[0].indent, lines[0].ordered);
  return parsed.next === lines.length ? parsed.list : undefined;
}

function markdownListXml(list: MarkdownList, attributes = ''): string {
  const tag = list.ordered ? 'ol' : 'ul';
  const items = list.items.map((item) =>
    `<li>${inlineMarkdown(item.text)}${item.children.map((child) => markdownListXml(child)).join('')}</li>`,
  ).join('');
  return `<${tag}${attributes}>${items}</${tag}>`;
}

function xmlForOperation(operation: PlanOperation, approvedText: string): string {
  if (operation.targetNodeKind === 'title') {
    return `<title${rootAttributes(operation)}>${inlineMarkdown(approvedText)}</title>`;
  }
  if (operation.targetNodeKind === 'list') {
    const list = parseMarkdownList(approvedText);
    if (!list) {
      throw new LocalizeError({
        type: 'validation',
        subtype: 'list_markdown_invalid',
        message: `Operation ${operation.operationId} does not contain a valid list outline.`,
      });
    }
    return markdownListXml(list, rootAttributes(operation));
  }
  if (operation.targetNodeKind === 'heading') {
    const tag = operation.targetElementName && /^h[1-9]$/.test(operation.targetElementName)
      ? operation.targetElementName
      : `h${Math.min(9, Math.max(1, operation.sourceHeadingPath?.length ?? 1))}`;
    return `<${tag}${rootAttributes(operation)}>${inlineMarkdown(approvedText)}</${tag}>`;
  }
  if (operation.targetNodeKind === 'quote') return `<blockquote${rootAttributes(operation)}>${inlineMarkdown(approvedText)}</blockquote>`;
  if (operation.targetNodeKind === 'callout') return `<callout${rootAttributes(operation)}><p>${inlineMarkdown(approvedText)}</p></callout>`;
  return `<p${rootAttributes(operation)}>${inlineMarkdown(approvedText)}</p>`;
}

function plainApproved(value: string, kind: PlanOperation['targetNodeKind']): string {
  let result = value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1');
  if (kind === 'list') result = result.split('\n').map((line) => line.replace(/^\s*[-*]\s+/, '').trim()).filter(Boolean).join('\n');
  return result.replace(/\s+/g, ' ').trim();
}

function nodeSequence(document: SemanticDocument, excludedBlockIds: Set<string> = new Set()): string {
  return JSON.stringify(document.nodes
    .filter((node) => remoteBlockIds(node).every((blockId) => !excludedBlockIds.has(blockId)))
    .map((node) => ({blockId: node.remote.blockId ?? null, kind: node.kind, fingerprint: node.fingerprint})));
}

function remoteBlockIds(node: SemanticNode): string[] {
  return node.remote.blockIds?.length
    ? node.remote.blockIds
    : node.remote.blockId ? [node.remote.blockId] : [];
}

function verifyOperationProgression(
  operation: PlanOperation,
  approved: ReturnType<typeof parseReview>['operations'][number],
  before: SemanticDocument,
  after: SemanticDocument,
): {ok: boolean; reason?: string; resolvedBlockId?: string; resolvedBlockIds?: string[]} {
  const expected = 'approvedText' in approved
    ? plainApproved(approved.approvedText, operation.targetNodeKind)
    : '';
  if (operation.kind === 'replace') {
    const blockId = operation.targetBlockId;
    if (!blockId) return {ok: false, reason: 'planned target block ID is missing'};
    const node = after.nodes.find((candidate) => candidate.remote.blockId === blockId);
    if (!node || node.kind !== operation.targetNodeKind || plainApproved(node.text, node.kind) !== expected) {
      return {ok: false, reason: 'planned target block did not receive the approved content'};
    }
    const excluded = new Set([blockId]);
    if (nodeSequence(before, excluded) !== nodeSequence(after, excluded)) {
      return {ok: false, reason: 'an unplanned block changed during replacement'};
    }
    return {ok: true, resolvedBlockId: blockId};
  }
  if (operation.kind === 'delete') {
    const blockIds = operation.targetBlockIds?.length
      ? operation.targetBlockIds
      : operation.targetBlockId ? [operation.targetBlockId] : [];
    if (blockIds.length === 0) return {ok: false, reason: 'planned delete block ID is missing'};
    const deleted = new Set(blockIds);
    if (after.nodes.some((node) => remoteBlockIds(node).some((blockId) => deleted.has(blockId)))) {
      return {ok: false, reason: 'planned target block still exists after deletion'};
    }
    const excluded = deleted;
    if (nodeSequence(before, excluded) !== nodeSequence(after)) {
      return {ok: false, reason: 'an unplanned block changed during deletion'};
    }
    return {ok: true};
  }
  if (operation.kind === 'insert') {
    const anchorBlockId = operation.anchorBlockId;
    if (!anchorBlockId) return {ok: false, reason: 'planned insertion anchor block ID is missing'};
    const beforeIds = new Set(before.nodes.flatMap((node) => node.remote.blockId ? [node.remote.blockId] : []));
    const inserted = after.nodes.filter((node) => node.remote.blockId && !beforeIds.has(node.remote.blockId));
    if (inserted.length !== 1) return {ok: false, reason: 'insertion did not create exactly one new block'};
    const insertedNode = inserted[0]!;
    if (
      insertedNode.kind !== operation.targetNodeKind
      || plainApproved(insertedNode.text, insertedNode.kind) !== expected
    ) {
      return {ok: false, reason: 'inserted block does not match approved content'};
    }
    const anchorIndex = after.nodes.findIndex((node) => node.remote.blockId === anchorBlockId);
    const insertedIndex = after.nodes.findIndex((node) => node.remote.blockId === insertedNode.remote.blockId);
    if (anchorIndex < 0 || insertedIndex !== anchorIndex + 1) {
      return {ok: false, reason: 'inserted block is not immediately after the planned anchor'};
    }
    const insertedId = insertedNode.remote.blockId!;
    if (nodeSequence(before) !== nodeSequence(after, new Set([insertedId]))) {
      return {ok: false, reason: 'an unplanned block changed during insertion'};
    }
    const insertedIds = remoteBlockIds(insertedNode);
    return {ok: true, resolvedBlockId: insertedId, resolvedBlockIds: insertedIds};
  }
  return {ok: false, reason: 'move operations are not writable'};
}

function verifyManualPlaceholderProgression(
  operation: PlanOperation,
  before: SemanticDocument,
  after: SemanticDocument,
): {ok: boolean; reason?: string; resolvedBlockId?: string; resolvedBlockIds?: string[]} {
  const anchorBlockId = operation.anchorBlockId;
  if (!anchorBlockId) return {ok: false, reason: 'planned placeholder anchor block ID is missing'};
  const beforeIds = new Set(before.nodes.flatMap((node) => node.remote.blockId ? [node.remote.blockId] : []));
  const inserted = after.nodes.filter((node) => node.remote.blockId && !beforeIds.has(node.remote.blockId));
  if (inserted.length !== 1) return {ok: false, reason: 'placeholder insertion did not create exactly one new block'};
  const placeholder = inserted[0]!;
  if (placeholder.kind !== 'callout' || !placeholder.text.includes(manualSyncMarker(operation.operationId))) {
    return {ok: false, reason: 'inserted block is not the protected manual-sync placeholder'};
  }
  const anchorIndex = after.nodes.findIndex((node) => node.remote.blockId === anchorBlockId);
  const placeholderIndex = after.nodes.findIndex((node) => node.remote.blockId === placeholder.remote.blockId);
  if (anchorIndex < 0 || placeholderIndex !== anchorIndex + 1) {
    return {ok: false, reason: 'manual-sync placeholder is not immediately after the planned anchor'};
  }
  const placeholderId = placeholder.remote.blockId!;
  if (nodeSequence(before) !== nodeSequence(after, new Set([placeholderId]))) {
    return {ok: false, reason: 'an unplanned block changed during placeholder insertion'};
  }
  return {ok: true, resolvedBlockId: placeholderId, resolvedBlockIds: remoteBlockIds(placeholder)};
}

function verifyPlan(
  plan: LocalizationPlan,
  approved: ReturnType<typeof parseReview>['operations'],
  target: SemanticDocument,
  resolvedTargetBlockIds: Map<string, string>,
  resourceEvidence: Map<string, ApplyResourceEvidence> = new Map(),
): {ok: boolean; operations: Array<{operationId: string; ok: boolean}>} {
  const approvedById = new Map(approved.map((operation) => [operation.operationId, operation]));
  const operations = plan.operations.map((operation) => {
    if (operation.kind === 'delete') {
      const deleted = new Set(operation.targetBlockIds?.length
        ? operation.targetBlockIds
        : operation.targetBlockId ? [operation.targetBlockId] : []);
      return {
        operationId: operation.operationId,
        ok: deleted.size > 0 && !target.nodes.some((node) => remoteBlockIds(node).some((blockId) => deleted.has(blockId))),
      };
    }
    const policy = operation.policy ?? 'translation';
    const reviewOperation = approvedById.get(operation.operationId)!;
    const blockId = resolvedTargetBlockIds.get(operation.operationId)
      ?? operation.targetBlockId;
    const node = blockId
      ? target.nodes.find((candidate) => candidate.remote.blockId === blockId)
      : undefined;
    if (policy === 'whiteboard_mirror') {
      const expectedToken = resourceEvidence.get(operation.operationId)?.targetResourceToken
        ?? operation.targetResourceToken;
      return {
        operationId: operation.operationId,
        ok: Boolean(node && node.kind === 'whiteboard' && expectedToken && node.remote.token === expectedToken),
      };
    }
    if (policy === 'manual_synced_reference' || policy === 'verify_synced_reference') {
      return {
        operationId: operation.operationId,
        ok: Boolean(
          node
          && node.kind === 'synced_reference'
          && node.remote.sourceDocumentId === operation.sourceDocumentId
          && node.remote.sourceBlockId === operation.sourceBlockId,
        ),
      };
    }
    const expected = policy === 'verbatim_code'
      ? plainApproved(operation.proposedText, operation.targetNodeKind)
      : reviewOperation && 'approvedText' in reviewOperation
        ? plainApproved(reviewOperation.approvedText, operation.targetNodeKind)
        : '';
    return {
      operationId: operation.operationId,
      ok: Boolean(node && node.kind === operation.targetNodeKind && plainApproved(node.text, node.kind) === expected),
    };
  });
  return {ok: operations.every((operation) => operation.ok), operations};
}

function updateCorrespondences(
  previous: StoredCorrespondence[],
  plan: LocalizationPlan,
  target: SemanticDocument,
  approved: ReturnType<typeof parseReview>['operations'],
  resolvedTargetBlockIds: Map<string, string>,
  resourceEvidence: Map<string, ApplyResourceEvidence> = new Map(),
): StoredCorrespondence[] {
  const removed = new Set(plan.operations.filter((operation) => operation.kind === 'delete').map((operation) => operation.sourceNodeId));
  const next = normalizeCorrespondences(previous).filter((item) => !removed.has(item.sourceNodeId));
  const approvedById = new Map(approved.map((operation) => [operation.operationId, operation]));
  for (const operation of plan.operations) {
    if (operation.kind === 'delete' || !operation.sourceNodeId) continue;
    const policy = operation.policy ?? 'translation';
    const reviewOperation = approvedById.get(operation.operationId);
    if (policy === 'translation' && (!reviewOperation || !('approvedText' in reviewOperation))) continue;
    const blockId = resolvedTargetBlockIds.get(operation.operationId) ?? operation.targetBlockId;
    const targetNode = blockId
      ? target.nodes.find((node) => node.remote.blockId === blockId)
      : undefined;
    if (!targetNode) continue;
    const existingIndex = next.findIndex((item) => item.sourceNodeId === operation.sourceNodeId);
    const item: StoredCorrespondence = policy === 'manual_synced_reference' || policy === 'verify_synced_reference'
      ? {
          kind: 'native_sync',
          sourceNodeId: operation.sourceNodeId,
          targetNodeId: targetNode.nodeId,
          sourceDocumentId: operation.sourceDocumentId ?? targetNode.remote.sourceDocumentId ?? '',
          sourceBlockId: operation.sourceBlockId ?? targetNode.remote.sourceBlockId ?? '',
        }
      : policy === 'whiteboard_mirror'
        ? {
            kind: 'copied_resource',
            sourceNodeId: operation.sourceNodeId,
            targetNodeId: targetNode.nodeId,
            resourceKind: 'whiteboard',
            sourceResourceHash: resourceEvidence.get(operation.operationId)?.sourceResourceHash ?? '',
          }
        : {kind: 'content', sourceNodeId: operation.sourceNodeId, targetNodeId: targetNode.nodeId};
    if (existingIndex >= 0) next[existingIndex] = item;
    else next.push(item);
  }
  return next;
}

function manualSourceChangeIsSafe(
  planned: SemanticDocument,
  current: SemanticDocument,
  actions: ManualSyncedReferenceAction[],
): boolean {
  if (planned.canonicalHash === current.canonicalHash) return true;
  const stableSequence = (document: SemanticDocument): string => JSON.stringify(document.nodes
    .filter((node) => node.kind !== 'synced_source')
    .map((node) => ({
      kind: node.kind,
      blockId: node.remote.blockId ?? null,
      fingerprint: node.fingerprint,
    })));
  if (stableSequence(planned) !== stableSequence(current)) return false;
  const syncIdentities = (document: SemanticDocument): string[] => document.nodes
    .filter((node) => node.kind === 'synced_source')
    .map((node) => `${node.remote.sourceDocumentId ?? document.documentId}\u0000${node.remote.sourceBlockId ?? node.remote.blockId ?? ''}`)
    .sort();
  if (JSON.stringify(syncIdentities(planned)) !== JSON.stringify(syncIdentities(current))) return false;
  return actions.every((action) => current.nodes.some((node) =>
    node.kind === 'synced_source'
    && (node.remote.sourceDocumentId ?? current.documentId) === action.sourceDocumentId
    && (node.remote.sourceBlockId ?? node.remote.blockId) === action.sourceBlockId,
  ));
}

function resourceEvidenceFromApplyLog(entries: ApplyLogEntry[]): Map<string, ApplyResourceEvidence> {
  return new Map(entries.flatMap((entry): Array<[string, ApplyResourceEvidence]> =>
    entry.sourceResourceHash || entry.targetResourceToken
      ? [[entry.operationId, {
          ...(entry.sourceResourceHash ? {sourceResourceHash: entry.sourceResourceHash} : {}),
          ...(entry.targetResourceToken ? {targetResourceToken: entry.targetResourceToken} : {}),
        }]]
      : [],
  ));
}
