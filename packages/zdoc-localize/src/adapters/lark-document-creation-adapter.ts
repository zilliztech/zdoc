import {LocalizeError} from '../domain/errors.js';
import type {DocumentCreationGateway} from '../application/ports.js';
import {larkMachineEnv, runJsonCommand, type ProcessRunner} from './process-runner.js';

type LarkCreateData = {
  document?: {
    revision_id?: number;
    document_id?: string;
    url?: string;
    document_url?: string;
  };
};

export class LarkDocumentCreationAdapter implements DocumentCreationGateway {
  constructor(private readonly runner: ProcessRunner) {}

  async createDocument(input: {title: string; parentToken?: string; xml: string}): Promise<{
    documentId: string;
    documentUrl?: string;
    revisionId?: number;
  }> {
    const data = await runJsonCommand<LarkCreateData>(this.runner, {
      executable: 'lark-cli',
      args: [
        'docs', '+create', '--title', input.title,
        ...(input.parentToken ? ['--parent-token', input.parentToken] : ['--parent-position', 'my_library']),
        '--doc-format', 'xml', '--content', '-', '--format', 'json', '--as', 'user',
      ],
      env: larkMachineEnv,
      stdin: input.xml,
    });
    const documentId = data.document?.document_id;
    if (!documentId) {
      throw new LocalizeError({
        type: 'verification_failed',
        subtype: 'created_document_missing_id',
        message: 'Feishu created a document but did not return a document ID.',
      });
    }
    const documentUrl = data.document?.url ?? data.document?.document_url;
    return {
      documentId,
      ...(documentUrl ? {documentUrl} : {}),
      ...(data.document?.revision_id === undefined ? {} : {revisionId: data.document.revision_id}),
    };
  }
}
