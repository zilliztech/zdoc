import type {DocumentGateway, FetchedDocument, LocalizationReceipt} from './ports.js';
import type {DocumentPair} from '../domain/model.js';
import {isStrictlyEmptyTarget} from '../domain/initialization.js';
import {parseFeishuDocument} from '../domain/xml-parser.js';

export type InitializationDisposition =
  | {kind: 'incremental'}
  | {kind: 'create_target'}
  | {kind: 'initialize_empty_target'; source: FetchedDocument; target: FetchedDocument}
  | {kind: 'adopt_existing_target'; source: FetchedDocument; target: FetchedDocument};

export class InitializationInspector {
  constructor(private readonly docs: DocumentGateway) {}

  async inspect(pair: DocumentPair, receipt?: LocalizationReceipt): Promise<InitializationDisposition> {
    if (receipt) return {kind: 'incremental'};
    const targetSelector = pair.targetDocUrl ?? pair.targetDocToken;
    if (!targetSelector) return {kind: 'create_target'};
    const [source, target] = await Promise.all([
      this.docs.fetch(pair.sourceDocUrl),
      this.docs.fetch(targetSelector),
    ]);
    const parsedTarget = parseFeishuDocument(target.content, {
      documentId: target.documentId,
      revisionId: target.revisionId,
    });
    return isStrictlyEmptyTarget(parsedTarget)
      ? {kind: 'initialize_empty_target', source, target}
      : {kind: 'adopt_existing_target', source, target};
  }
}
