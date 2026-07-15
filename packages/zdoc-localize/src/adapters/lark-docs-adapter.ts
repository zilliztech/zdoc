import {LocalizeError} from '../domain/errors.js';
import {larkMachineEnv, runJsonCommand, type ProcessRunner} from './process-runner.js';

export interface FetchedDocument {
  documentId: string;
  revisionId: number;
  content: string;
}

export interface WriteInput {
  doc: string;
  revisionId: number;
}

export interface WriteResult {
  revisionId?: number;
  updatedBlocksCount: number;
  warnings: string[];
}

type LarkWriteData = {
  document?: {revision_id?: number; document_id?: string; url?: string; document_url?: string};
  result?: string;
  updated_blocks_count?: number;
  warnings?: string[];
};

export class LarkDocsAdapter {
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

  async replaceBlock(input: WriteInput & {blockId: string; xml: string}): Promise<WriteResult> {
    return this.update('block_replace', input, ['--block-id', input.blockId], input.xml);
  }

  async insertAfter(input: WriteInput & {blockId: string; xml: string}): Promise<WriteResult> {
    return this.update('block_insert_after', input, ['--block-id', input.blockId], input.xml);
  }

  async deleteBlocks(input: WriteInput & {blockIds: string[]}): Promise<WriteResult> {
    return this.update('block_delete', input, ['--block-id', input.blockIds.join(',')]);
  }

  async createDocument(input: {title: string; parentToken?: string; xml: string}): Promise<{documentId: string; documentUrl?: string; revisionId?: number}> {
    const data = await runJsonCommand<LarkWriteData>(this.runner, {
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

  private async update(
    command: string,
    input: WriteInput,
    commandArgs: string[],
    xml?: string,
  ): Promise<WriteResult> {
    const data = await runJsonCommand<LarkWriteData>(this.runner, {
      executable: 'lark-cli',
      args: [
        'docs', '+update', '--doc', input.doc, '--command', command, ...commandArgs,
        '--revision-id', String(input.revisionId), '--doc-format', 'xml',
        ...(xml === undefined ? [] : ['--content', '-']),
        '--format', 'json', '--as', 'user',
      ],
      env: larkMachineEnv,
      ...(xml === undefined ? {} : {stdin: xml}),
    });
    if (data.result === 'partial_success') {
      throw new LocalizeError({
        type: 'partial_write',
        subtype: 'lark_partial_success',
        message: 'Feishu applied only part of the requested document update.',
        details: data,
      });
    }
    if (data.result && data.result !== 'success') {
      throw new LocalizeError({
        type: 'upstream',
        subtype: 'lark_write_failed',
        message: 'Feishu rejected the document update.',
        details: data,
      });
    }
    return {
      ...(data.document?.revision_id === undefined ? {} : {revisionId: data.document.revision_id}),
      updatedBlocksCount: data.updated_blocks_count ?? 0,
      warnings: data.warnings ?? [],
    };
  }
}
