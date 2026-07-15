import {mkdir, writeFile} from 'node:fs/promises';
import {join, relative} from 'node:path';

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
} from '../domain/translation.js';
import {parseFeishuDocument} from '../domain/xml-parser.js';

interface DocumentReader {
  fetch(doc: string, revisionId?: number): Promise<FetchedDocument>;
}

export interface WorkflowDependencies {
  cwd: string;
  registry: RegistryStore;
  snapshots: SnapshotStore;
  memory: TranslationMemory;
  docs: DocumentReader;
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
      await this.dependencies.registry.saveRun(this.newRun(runId, pairId, 'classification_required', {
        kind: 'localization',
        changes,
        sourceRevision: source.revisionId,
        targetRevision: target.revisionId,
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

    const glossary = resolveGlossary(await this.dependencies.registry.listGlossary(), {
      pairId,
      product: pair.productScope,
      environment: pair.environmentScope,
      version: pair.versionScope,
    });
    const translationRequests = aligned.map((item) => buildRequest(item, source, target, glossary));
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
      glossaryHash: canonicalHash([...glossary.values()]),
    }));
    return {runId, state: 'translation_required', changes, translationRequests, translationRequestsPath};
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

  private requireTarget(pair: DocumentPair): string {
    if (!pair.targetDocUrl) {
      throw new LocalizeError({type: 'validation', subtype: 'target_document_missing', message: `Pair ${pair.pairId} has no target Chinese document.`});
    }
    return pair.targetDocUrl;
  }
}
