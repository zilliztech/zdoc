import type {DocumentReadGateway, FetchedDocument} from '../application/ports.js';
import {larkMachineEnv, runJsonCommand, type ProcessRunner} from './process-runner.js';

export class LarkLegacyDocumentReader implements DocumentReadGateway {
  constructor(private readonly runner: ProcessRunner) {}

  async fetch(doc: string, revisionId = -1): Promise<FetchedDocument> {
    const data = await runJsonCommand<{document: {document_id: string; revision_id: number; content: string}}>(
      this.runner,
      {
        executable: 'lark-cli',
        args: [
          'docs', '+fetch', '--doc', doc, '--detail', 'full', '--doc-format', 'xml',
          ...(revisionId === -1 ? [] : ['--revision-id', String(revisionId)]),
          '--format', 'json', '--as', 'user',
        ],
        env: larkMachineEnv,
      },
    );
    return {
      documentId: data.document.document_id,
      revisionId: data.document.revision_id,
      content: data.document.content,
    };
  }
}
