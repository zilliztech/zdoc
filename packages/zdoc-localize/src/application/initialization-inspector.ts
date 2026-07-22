import type {DocumentSelector, DocumentSnapshot} from 'feishu-docx-engine';

import {semanticDocumentFromSnapshot} from '../domain/docx-semantic.js';
import {isStrictlyEmptyTarget} from '../domain/initialization.js';
import type {DocumentPair} from '../domain/model.js';
import type {LocalizationDocxEngine, LocalizationReceipt} from './ports.js';

export type InitializationDisposition =
  | {kind: 'incremental'}
  | {kind: 'create_target'}
  | {kind: 'initialize_empty_target'; source: DocumentSnapshot; target: DocumentSnapshot}
  | {kind: 'adopt_existing_target'; source: DocumentSnapshot; target: DocumentSnapshot};

function documentSelector(value: string): DocumentSelector {
  return /^https?:\/\//.test(value)
    ? {kind: 'url', url: value}
    : {kind: 'docx', token: value};
}

export class InitializationInspector {
  constructor(private readonly engine: LocalizationDocxEngine) {}

  async inspect(pair: DocumentPair, receipt?: LocalizationReceipt): Promise<InitializationDisposition> {
    if (receipt) return {kind: 'incremental'};
    const targetSelector = pair.targetDocUrl ?? pair.targetDocToken;
    if (!targetSelector) return {kind: 'create_target'};
    const [source, target] = await Promise.all([
      this.engine.snapshot(documentSelector(pair.sourceDocUrl)),
      this.engine.snapshot(documentSelector(targetSelector)),
    ]);
    return isStrictlyEmptyTarget(semanticDocumentFromSnapshot(target))
      ? {kind: 'initialize_empty_target', source, target}
      : {kind: 'adopt_existing_target', source, target};
  }
}
