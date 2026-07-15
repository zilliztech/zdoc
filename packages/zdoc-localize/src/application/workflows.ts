import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {join, relative, resolve, sep} from 'node:path';

import type {
  Clock,
  IdGenerator,
  RegistryStore,
  SnapshotReference,
  SnapshotStore,
  TranslationMemory,
} from './ports.js';
import type {FetchedDocument} from '../adapters/lark-docs-adapter.js';
import {alignChanges} from '../domain/alignment.js';
import {diffDocuments} from '../domain/diff.js';
import {LocalizeError} from '../domain/errors.js';
import {canonicalHash} from '../domain/hash.js';
import {resolveGlossary, type ResolvedGlossaryTerm} from '../domain/glossary.js';
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
import {
  compileReview,
  parseReview,
  type LocalizationPlan,
  type PlanOperation,
} from '../domain/review.js';

interface DocumentGateway {
  fetch(doc: string, revisionId?: number): Promise<FetchedDocument>;
  replaceBlock(input: {doc: string; blockId: string; revisionId: number; xml: string}): Promise<{revisionId?: number}>;
  insertAfter(input: {doc: string; blockId: string; revisionId: number; xml: string}): Promise<{revisionId?: number}>;
  deleteBlocks(input: {doc: string; blockIds: string[]; revisionId: number}): Promise<{revisionId?: number}>;
}

export interface WorkflowDependencies {
  cwd: string;
  registry: RegistryStore;
  snapshots: SnapshotStore;
  memory: TranslationMemory;
  docs: DocumentGateway;
  clock: Clock;
  ids: IdGenerator;
}

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
  state: 'completed';
  validationPath: string;
}

function blockLabel(node: SemanticNode): string {
  return node.remote.blockId ?? node.nodeId;
}

function bootstrapAlignment(source: SemanticDocument, target: SemanticDocument): BootstrapAudit {
  const correspondences: HistoricalCorrespondence[] = [];
  const matchedTargetIds = new Set<string>();
  const unmatchedSourceNodes: string[] = [];

  for (const sourceNode of source.nodes) {
    const candidates = target.nodes.filter((targetNode) =>
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
  const tokens: PreservedToken[] = [];
  for (const match of node.xml.matchAll(/<code(?:\s[^>]*)?>([\s\S]*?)<\/code>/g)) {
    const value = match[1]?.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    if (value) tokens.push({kind: node.kind === 'code' ? 'code_block' : 'inline_code', value, count: 1});
  }
  for (const match of node.xml.matchAll(/href="([^"]+)"/g)) {
    if (match[1]) tokens.push({kind: 'url', value: match[1], count: 1});
  }
  if (node.remote.token) tokens.push({kind: 'resource_token', value: node.remote.token, count: 1});
  return tokens;
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
    preserved: tokensFrom(aligned.change.after ?? aligned.change.before),
    linkMappings,
    targetNodeKind: currentTarget?.kind ?? sourceNode.kind,
  };
}

export class LocalizationWorkflows {
  constructor(private readonly dependencies: WorkflowDependencies) {}

  async planBootstrap(pairId: string): Promise<BootstrapPlanResult> {
    const pair = await this.requirePair(pairId);
    const targetUrl = this.requireTarget(pair);
    const [sourceFetch, targetFetch] = await Promise.all([
      this.dependencies.docs.fetch(pair.sourceDocUrl),
      this.dependencies.docs.fetch(targetUrl),
    ]);
    const source = parseFeishuDocument(sourceFetch.content, {
      documentId: sourceFetch.documentId,
      revisionId: sourceFetch.revisionId,
    });
    const target = parseFeishuDocument(targetFetch.content, {
      documentId: targetFetch.documentId,
      revisionId: targetFetch.revisionId,
    });
    const audit = bootstrapAlignment(source, target);
    const runId = this.dependencies.ids.next();
    const bundle = {
      runId,
      files: {
        'source.xml': sourceFetch.content,
        'source.semantic.json': JSON.stringify(source, null, 2),
        'target.xml': targetFetch.content,
        'target.semantic.json': JSON.stringify(target, null, 2),
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
    }));
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
    const audit = run.metadata.audit as BootstrapAudit;
    const bundle = await this.dependencies.snapshots.getBundle(snapshotRef);
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
    await this.dependencies.registry.saveReceipt({
      pairId: run.pairId,
      sourceRevision: source.revisionId,
      sourceHash: source.canonicalHash,
      sourceSnapshotRef: snapshotRef,
      targetRevision: target.revisionId,
      targetHash: target.canonicalHash,
      runId,
      completedAt: this.dependencies.clock.now().toISOString(),
      correspondences: audit.correspondences,
    });
    const pair = await this.requirePair(run.pairId);
    await this.dependencies.registry.savePair({...pair, status: 'active'});
    await this.dependencies.registry.saveRun({...run, state: 'completed', updatedAt: this.dependencies.clock.now().toISOString()});
  }

  async createPlan(pairId: string): Promise<PlanningResult> {
    const pair = await this.requirePair(pairId);
    if (pair.mode === 'excluded') {
      throw new LocalizeError({type: 'validation', subtype: 'pair_excluded', message: `Pair ${pairId} is excluded from localization.`});
    }
    const receipt = await this.dependencies.registry.getReceipt(pairId);
    if (!receipt) {
      throw new LocalizeError({type: 'validation', subtype: 'baseline_missing', message: `Pair ${pairId} must be bootstrapped before planning.`});
    }
    const baselineBundle = await this.dependencies.snapshots.getBundle(receipt.sourceSnapshotRef);
    const baselineXml = baselineBundle.files['source.xml'];
    if (!baselineXml) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'source_baseline_missing', message: 'The localization baseline snapshot has no source XML.'});
    }
    const [sourceFetch, targetFetch] = await Promise.all([
      this.dependencies.docs.fetch(pair.sourceDocUrl),
      this.dependencies.docs.fetch(this.requireTarget(pair)),
    ]);
    const baseline = parseFeishuDocument(baselineXml, {documentId: sourceFetch.documentId, revisionId: receipt.sourceRevision});
    const source = parseFeishuDocument(sourceFetch.content, {documentId: sourceFetch.documentId, revisionId: sourceFetch.revisionId});
    const target = parseFeishuDocument(targetFetch.content, {documentId: targetFetch.documentId, revisionId: targetFetch.revisionId});
    const changes = diffDocuments(baseline, source);
    const runId = this.dependencies.ids.next();

    if (changes.length === 0) {
      await this.dependencies.registry.saveRun(this.newRun(runId, pairId, 'completed', {kind: 'localization', noChanges: true}));
      return {runId, state: 'completed', changes, translationRequests: []};
    }
    if (pair.mode === 'independent') {
      await this.dependencies.registry.saveRun(this.newRun(runId, pairId, 'blocked', {kind: 'localization', changes, blocker: 'independent document'}));
      return {runId, state: 'blocked', changes, translationRequests: [], blocker: 'independent documents are report-only'};
    }
    if (pair.mode === 'selective') {
      await this.persistPlanArtifacts(runId, sourceFetch, targetFetch, changes, [], 'classification_required');
      const bundleRef = await this.dependencies.snapshots.putBundle({
        runId,
        files: {
          'source-baseline.xml': baselineXml,
          'source-current.xml': sourceFetch.content,
          'target-current.xml': targetFetch.content,
          'changes.json': JSON.stringify(changes, null, 2),
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
      }));
      return {runId, state: 'classification_required', changes, translationRequests: []};
    }

    const aligned = alignChanges(changes, target, receipt.correspondences);
    const low = aligned.find((item) => item.confidence === 'low');
    if (low) {
      const blocker = low.blocker ?? 'low-confidence alignment';
      await this.dependencies.registry.saveRun(this.newRun(runId, pairId, 'blocked', {kind: 'localization', changes, aligned, blocker}));
      return {runId, state: 'blocked', changes, translationRequests: [], blocker};
    }
    const unsupported = aligned.find((item) => {
      const node = item.change.after ?? item.change.before;
      return node && !node.writable;
    });
    if (unsupported) {
      const blocker = `changed ${unsupported.change.after?.kind ?? unsupported.change.before?.kind} content is report-only`;
      await this.dependencies.registry.saveRun(this.newRun(runId, pairId, 'blocked', {kind: 'localization', changes, aligned, blocker}));
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
      'translation_required',
    );
    const bundleRef = await this.dependencies.snapshots.putBundle({
      runId,
      files: {
        'source-baseline.xml': baselineXml,
        'source-current.xml': sourceFetch.content,
        'target-current.xml': targetFetch.content,
        'changes.json': JSON.stringify(changes, null, 2),
        'alignments.json': JSON.stringify(aligned, null, 2),
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
      glossaryHash: translationInputs.glossaryHash,
    }));
    return {runId, state: 'translation_required', changes, translationRequests, translationRequestsPath};
  }

  async classifyPlan(runId: string, applicableChangeIds: string[]): Promise<PlanningResult> {
    const run = await this.requireRun(runId);
    if (run.state !== 'classification_required' || run.metadata?.kind !== 'localization') {
      throw new LocalizeError({type: 'validation', subtype: 'run_not_classification_required', message: `Run ${runId} is not waiting for applicability classification.`});
    }
    const pair = await this.requirePair(run.pairId);
    const changes = run.metadata.changes as SemanticChange[];
    const known = new Set(changes.map((change) => change.changeId));
    if (applicableChangeIds.some((changeId) => !known.has(changeId))) {
      throw new LocalizeError({type: 'validation', subtype: 'unknown_classification_change', message: 'Classification contains an unknown change ID.'});
    }
    const selectedIds = new Set(applicableChangeIds);
    const selected = changes.filter((change) => selectedIds.has(change.changeId));
    const bundleRef = run.metadata.bundleRef as SnapshotReference;
    const bundle = await this.dependencies.snapshots.getBundle(bundleRef);
    const sourceXml = bundle.files['source-current.xml'];
    const targetXml = bundle.files['target-current.xml'];
    if (!sourceXml || !targetXml) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'classification_bundle_incomplete', message: 'Selective run snapshot is incomplete.'});
    }
    const source = parseFeishuDocument(sourceXml, {documentId: 'source-current', revisionId: Number(run.metadata.sourceRevision)});
    const target = parseFeishuDocument(targetXml, {documentId: 'target-current', revisionId: Number(run.metadata.targetRevision)});
    const receipt = await this.dependencies.registry.getReceipt(run.pairId);
    const aligned = alignChanges(selected, target, receipt?.correspondences ?? []);
    const blocker = aligned.find((item) => item.confidence === 'low')?.blocker;
    if (blocker) {
      await this.markRun(run, 'blocked', {blocker, aligned});
      return {runId, state: 'blocked', changes: selected, translationRequests: [], blocker};
    }
    const unsupported = aligned.find((item) => !(item.change.after ?? item.change.before)?.writable);
    if (unsupported) {
      const reason = `changed ${unsupported.change.after?.kind ?? unsupported.change.before?.kind} content is report-only`;
      await this.markRun(run, 'blocked', {blocker: reason, aligned});
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
    if (run.state !== 'translation_required' || run.metadata?.kind !== 'localization') {
      throw new LocalizeError({
        type: 'validation',
        subtype: 'run_not_translation_required',
        message: `Run ${runId} is not waiting for translations.`,
      });
    }
    const bundleRef = run.metadata.bundleRef as SnapshotReference;
    const bundle = await this.dependencies.snapshots.getBundle(bundleRef);
    const requestJson = bundle.files['translation-requests.json'];
    const targetXml = bundle.files['target-current.xml'];
    if (!requestJson || !targetXml) {
      throw new LocalizeError({type: 'verification_failed', subtype: 'plan_bundle_incomplete', message: 'Planning snapshot is missing translation requests or target XML.'});
    }
    const requests = JSON.parse(requestJson) as TranslationRequest[];
    const validated = validateTranslations(requests, responses);
    const aligned = run.metadata.aligned as AlignedChange[];
    const target = parseFeishuDocument(targetXml, {
      documentId: 'target-plan',
      revisionId: Number(run.metadata.targetRevision),
    });
    const validatedById = new Map(validated.map((item) => [item.operationId, item]));
    const requestById = new Map(requests.map((item) => [item.operationId, item]));
    const operations: PlanOperation[] = aligned.map((item) => {
      const translation = validatedById.get(item.change.changeId)!;
      const request = requestById.get(item.change.changeId)!;
      const targetNode = item.targetNodeId
        ? target.nodes.find((node) => node.nodeId === item.targetNodeId)
        : undefined;
      const anchorNode = item.anchorNodeId
        ? target.nodes.find((node) => node.nodeId === item.anchorNodeId)
        : undefined;
      const sourceNode = item.change.after ?? item.change.before!;
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
          targetNodeHash: targetNode.fingerprint,
        } : {}),
        ...(anchorNode ? {
          anchorNodeId: anchorNode.nodeId,
          anchorBlockId: anchorNode.remote.blockId,
          anchorNodeHash: anchorNode.fingerprint,
        } : {}),
        proposedText: 'decision' in translation ? 'DELETE' : translation.translatedText,
        targetNodeKind: request.targetNodeKind,
        preserved: request.preserved,
      };
    });
    const plan: LocalizationPlan = {
      planVersion: 1,
      runId,
      pairId: run.pairId,
      sourceRevision: Number(run.metadata.sourceRevision),
      targetRevision: Number(run.metadata.targetRevision),
      sourceHash: String(run.metadata.sourceHash),
      targetHash: String(run.metadata.targetHash),
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
    await this.dependencies.registry.saveRun({
      ...run,
      state: 'review_required',
      updatedAt: this.dependencies.clock.now().toISOString(),
      metadata: {...run.metadata, bundleRef: completedBundleRef, plan},
    });
    return {runId, state: 'review_required', planPath, reviewPath};
  }

  async apply(runId: string, reviewPath: string): Promise<ApplyResult> {
    let run = await this.requireRun(runId);
    if (run.state !== 'review_required' || run.metadata?.kind !== 'localization') {
      throw new LocalizeError({type: 'validation', subtype: 'run_not_review_required', message: `Run ${runId} is not ready to apply.`});
    }
    const pair = await this.requirePair(run.pairId);
    const targetUrl = this.requireTarget(pair);
    const plan = run.metadata.plan as LocalizationPlan;
    const approved = parseReview(await readFile(this.resolveWorkspacePath(reviewPath), 'utf8'), plan);
    const [sourceFetch, targetFetch] = await Promise.all([
      this.dependencies.docs.fetch(pair.sourceDocUrl),
      this.dependencies.docs.fetch(targetUrl),
    ]);
    const source = parseFeishuDocument(sourceFetch.content, {documentId: sourceFetch.documentId, revisionId: sourceFetch.revisionId});
    const target = parseFeishuDocument(targetFetch.content, {documentId: targetFetch.documentId, revisionId: targetFetch.revisionId});
    if (source.revisionId !== plan.sourceRevision || source.canonicalHash !== plan.sourceHash) {
      await this.markRun(run, 'stale', {staleReason: 'source_changed'});
      throw new LocalizeError({type: 'stale_plan', subtype: 'source_changed', message: 'The remote English document changed after planning.', hint: 'Regenerate the localization plan.'});
    }
    if (target.revisionId !== plan.targetRevision || target.canonicalHash !== plan.targetHash) {
      await this.markRun(run, 'stale', {staleReason: 'target_changed'});
      throw new LocalizeError({type: 'stale_plan', subtype: 'target_changed', message: 'The remote Chinese document changed after planning.', hint: 'Regenerate the localization plan.'});
    }
    for (const operation of plan.operations) {
      const nodeId = operation.kind === 'insert' ? operation.anchorNodeId : operation.targetNodeId;
      const expectedHash = operation.kind === 'insert' ? operation.anchorNodeHash : operation.targetNodeHash;
      const node = nodeId ? target.nodes.find((candidate) => candidate.nodeId === nodeId) : undefined;
      if (!node || node.fingerprint !== expectedHash) {
        await this.markRun(run, 'stale', {staleReason: 'target_block_changed', operationId: operation.operationId});
        throw new LocalizeError({type: 'stale_plan', subtype: 'target_block_changed', message: `Target block for ${operation.operationId} changed after planning.`});
      }
    }

    const prewriteRef = await this.dependencies.snapshots.putBundle({
      runId,
      files: {'target-prewrite.xml': targetFetch.content, 'plan.json': `${JSON.stringify(plan, null, 2)}\n`},
    });
    run = await this.markRun(run, 'applying', {prewriteRef, appliedOperations: 0});
    let activeTarget = target;
    let activeRevision = target.revisionId;
    let appliedOperations = 0;
    const approvedById = new Map(approved.operations.map((operation) => [operation.operationId, operation]));

    try {
      for (const operation of plan.operations) {
        const reviewOperation = approvedById.get(operation.operationId)!;
        if (operation.kind === 'replace') {
          await this.dependencies.docs.replaceBlock({
            doc: targetUrl,
            blockId: this.requireBlockId(operation.targetBlockId, operation.operationId),
            revisionId: activeRevision,
            xml: xmlForOperation(operation, 'approvedText' in reviewOperation ? reviewOperation.approvedText : ''),
          });
        } else if (operation.kind === 'insert') {
          await this.dependencies.docs.insertAfter({
            doc: targetUrl,
            blockId: this.requireBlockId(operation.anchorBlockId, operation.operationId),
            revisionId: activeRevision,
            xml: xmlForOperation(operation, 'approvedText' in reviewOperation ? reviewOperation.approvedText : ''),
          });
        } else if (operation.kind === 'delete') {
          await this.dependencies.docs.deleteBlocks({
            doc: targetUrl,
            blockIds: [this.requireBlockId(operation.targetBlockId, operation.operationId)],
            revisionId: activeRevision,
          });
        } else {
          throw new LocalizeError({type: 'unsupported_content', subtype: 'move_not_writable', message: 'Move operations are report-only.'});
        }
        appliedOperations += 1;
        const refreshed = await this.dependencies.docs.fetch(targetUrl);
        activeRevision = refreshed.revisionId;
        activeTarget = parseFeishuDocument(refreshed.content, {documentId: refreshed.documentId, revisionId: refreshed.revisionId});
        run = await this.markRun(run, 'applying', {prewriteRef, appliedOperations});
      }
    } catch (error) {
      const localizeError = error instanceof LocalizeError ? error : new LocalizeError({type: 'upstream', message: String(error)});
      const state = appliedOperations > 0 || localizeError.type === 'partial_write' ? 'partial' : 'blocked';
      await this.markRun(run, state, {prewriteRef, appliedOperations, applyError: localizeError.message});
      throw localizeError;
    }

    run = await this.markRun(run, 'verifying', {prewriteRef, appliedOperations});
    const verification = verifyPlan(plan, approved.operations, activeTarget);
    if (!verification.ok) {
      await this.markRun(run, 'blocked', {prewriteRef, appliedOperations, verification});
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'target_readback_mismatch',
        message: 'The updated Chinese document did not match the approved plan.',
        details: verification,
      });
    }

    const sourceSnapshotRef = await this.dependencies.snapshots.putBundle({
      runId,
      files: {'source.xml': sourceFetch.content, 'target.xml': activeTarget.rawXml},
    });
    const previousReceipt = await this.dependencies.registry.getReceipt(run.pairId);
    const correspondences = updateCorrespondences(previousReceipt?.correspondences ?? [], plan, activeTarget, approved.operations);
    const completedAt = this.dependencies.clock.now().toISOString();
    await this.dependencies.registry.saveReceipt({
      pairId: run.pairId,
      sourceRevision: source.revisionId,
      sourceHash: source.canonicalHash,
      sourceSnapshotRef,
      targetRevision: activeTarget.revisionId,
      targetHash: activeTarget.canonicalHash,
      runId,
      completedAt,
      correspondences,
    });
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
    const validationPath = await this.writeRunFile(runId, 'validation-report.json', `${JSON.stringify({ok: true, operations: verification.operations}, null, 2)}\n`);
    await this.markRun(run, 'completed', {prewriteRef, appliedOperations, validationPath});
    return {runId, state: 'completed', validationPath};
  }

  async inspectRecovery(runId: string): Promise<{runId: string; state: RunRecord['state']; appliedOperations: number; prewriteRef?: SnapshotReference}> {
    const run = await this.requireRun(runId);
    return {
      runId,
      state: run.state,
      appliedOperations: Number(run.metadata?.appliedOperations ?? 0),
      ...(run.metadata?.prewriteRef ? {prewriteRef: run.metadata.prewriteRef as SnapshotReference} : {}),
    };
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
    return this.createPlan(run.pairId);
  }

  private async persistPlanArtifacts(
    runId: string,
    source: FetchedDocument,
    target: FetchedDocument,
    changes: SemanticChange[],
    requests: TranslationRequest[],
    _state: string,
  ): Promise<string | undefined> {
    await this.writeRunFile(runId, 'source-current.xml', source.content);
    await this.writeRunFile(runId, 'target-current.xml', target.content);
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
    const linkMappings = (await this.dependencies.registry.listPairs())
      .filter((candidate) => candidate.targetDocUrl)
      .map((candidate) => ({sourceUrl: candidate.sourceDocUrl, targetUrl: candidate.targetDocUrl}));
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

  private newRun(
    runId: string,
    pairId: string,
    state: RunRecord['state'],
    metadata: Record<string, unknown>,
  ): RunRecord {
    const now = this.dependencies.clock.now().toISOString();
    return {runId, pairId, state, createdAt: now, updatedAt: now, metadata};
  }

  private async writeRunFile(runId: string, name: string, content: string): Promise<string> {
    const directory = join(this.dependencies.cwd, '.zdoc-localize', 'runs', runId);
    await mkdir(directory, {recursive: true});
    const path = join(directory, name);
    await writeFile(path, content, 'utf8');
    return relative(this.dependencies.cwd, path);
  }

  private async requirePair(pairId: string): Promise<DocumentPair> {
    const pair = await this.dependencies.registry.getPair(pairId);
    if (!pair) throw new LocalizeError({type: 'not_found', subtype: 'pair_not_found', message: `Document pair ${pairId} was not found.`});
    return pair;
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
  ): Promise<RunRecord> {
    const updated = {
      ...run,
      state,
      updatedAt: this.dependencies.clock.now().toISOString(),
      metadata: {...run.metadata, ...metadata},
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
    if (!pair.targetDocUrl) {
      throw new LocalizeError({type: 'validation', subtype: 'target_document_missing', message: `Pair ${pair.pairId} has no target Chinese document.`});
    }
    return pair.targetDocUrl;
  }
}

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
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

function xmlForOperation(operation: PlanOperation, approvedText: string): string {
  if (operation.targetNodeKind === 'list') {
    const items = approvedText.split('\n').map((line) => line.replace(/^\s*[-*]\s+/, '').trim()).filter(Boolean);
    return `<ul>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`;
  }
  if (operation.targetNodeKind === 'heading') {
    const level = Math.min(9, Math.max(1, operation.sourceHeadingPath?.length ?? 1));
    return `<h${level}>${inlineMarkdown(approvedText)}</h${level}>`;
  }
  if (operation.targetNodeKind === 'quote') return `<blockquote>${inlineMarkdown(approvedText)}</blockquote>`;
  if (operation.targetNodeKind === 'callout') return `<callout><p>${inlineMarkdown(approvedText)}</p></callout>`;
  return `<p>${inlineMarkdown(approvedText)}</p>`;
}

function plainApproved(value: string, kind: PlanOperation['targetNodeKind']): string {
  let result = value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1');
  if (kind === 'list') result = result.split('\n').map((line) => line.replace(/^\s*[-*]\s+/, '').trim()).filter(Boolean).join('\n');
  return result.replace(/\s+/g, ' ').trim();
}

function verifyPlan(
  plan: LocalizationPlan,
  approved: ReturnType<typeof parseReview>['operations'],
  target: SemanticDocument,
): {ok: boolean; operations: Array<{operationId: string; ok: boolean}>} {
  const approvedById = new Map(approved.map((operation) => [operation.operationId, operation]));
  const operations = plan.operations.map((operation) => {
    if (operation.kind === 'delete') {
      return {
        operationId: operation.operationId,
        ok: !target.nodes.some((node) => node.remote.blockId === operation.targetBlockId),
      };
    }
    const reviewOperation = approvedById.get(operation.operationId)!;
    const expected = 'approvedText' in reviewOperation
      ? plainApproved(reviewOperation.approvedText, operation.targetNodeKind)
      : '';
    const candidates = target.nodes.filter((node) => plainApproved(node.text, node.kind) === expected);
    return {operationId: operation.operationId, ok: candidates.length === 1};
  });
  return {ok: operations.every((operation) => operation.ok), operations};
}

function updateCorrespondences(
  previous: HistoricalCorrespondence[],
  plan: LocalizationPlan,
  target: SemanticDocument,
  approved: ReturnType<typeof parseReview>['operations'],
): HistoricalCorrespondence[] {
  const removed = new Set(plan.operations.filter((operation) => operation.kind === 'delete').map((operation) => operation.sourceNodeId));
  const next = previous.filter((item) => !removed.has(item.sourceNodeId));
  const approvedById = new Map(approved.map((operation) => [operation.operationId, operation]));
  for (const operation of plan.operations) {
    if (operation.kind === 'delete' || !operation.sourceNodeId) continue;
    const reviewOperation = approvedById.get(operation.operationId)!;
    if (!('approvedText' in reviewOperation)) continue;
    const expected = plainApproved(reviewOperation.approvedText, operation.targetNodeKind);
    const targetNode = target.nodes.find((node) => plainApproved(node.text, node.kind) === expected);
    if (!targetNode) continue;
    const existingIndex = next.findIndex((item) => item.sourceNodeId === operation.sourceNodeId);
    const item = {sourceNodeId: operation.sourceNodeId, targetNodeId: targetNode.nodeId};
    if (existingIndex >= 0) next[existingIndex] = item;
    else next.push(item);
  }
  return next;
}
