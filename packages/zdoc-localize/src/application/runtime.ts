import {randomUUID} from 'node:crypto';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';

import {createFeishuDocxEngine, LarkCliTransport} from 'feishu-docx-engine';

import {LarkBaseRegistry} from '../adapters/lark-base-registry.js';
import {LarkDocumentCreationAdapter} from '../adapters/lark-document-creation-adapter.js';
import {LarkDriveSnapshotStore} from '../adapters/lark-drive-snapshots.js';
import {LarkLegacyDocumentReader} from '../adapters/lark-legacy-document-reader.js';
import {LarkWhiteboardReader} from '../adapters/lark-whiteboard-reader.js';
import {NodeProcessRunner} from '../adapters/process-runner.js';
import {LocalizeError} from '../domain/errors.js';
import {ConfigStore} from '../storage/config-store.js';
import {LocalRegistryStore} from '../storage/local-registry-store.js';
import {LocalSnapshotStore} from '../storage/local-snapshot-store.js';
import {SqliteTranslationMemory} from '../storage/sqlite-translation-memory.js';
import type {
  DocumentCreationGateway,
  LocalizationDocxEngine,
  RegistryStore,
  SnapshotStore,
} from './ports.js';
import {LocalizationWorkflows} from './workflows.js';

export interface Runtime {
  registry: RegistryStore;
  snapshots: SnapshotStore;
  engine: LocalizationDocxEngine;
  documentCreation: DocumentCreationGateway;
  workflows: LocalizationWorkflows;
  close(): Promise<void>;
}

export async function createRuntime(cwd: string): Promise<Runtime> {
  const config = await new ConfigStore(cwd).read();
  const runner = new NodeProcessRunner();
  const documents = new LarkLegacyDocumentReader(runner);
  const documentCreation = new LarkDocumentCreationAdapter(runner);
  const engine = createFeishuDocxEngine({
    transport: new LarkCliTransport({identity: 'user'}),
  });
  const whiteboards = new LarkWhiteboardReader(runner);
  let registry: RegistryStore;
  let snapshots: SnapshotStore;

  if (config?.mode === 'feishu') {
    if (!config.registryBaseToken || !config.stateFolderToken || !config.registryTableIds) {
      throw new LocalizeError({
        type: 'configuration',
        subtype: 'feishu_registry_incomplete',
        message: 'Feishu mode requires resolved Base, table, and Drive folder tokens.',
        hint: 'Run zdoc-localize init with resolved registry and state-folder configuration.',
      });
    }
    registry = new LarkBaseRegistry(runner, {
      baseToken: config.registryBaseToken,
      documentPairsTableId: config.registryTableIds.documentPairs,
      glossaryTableId: config.registryTableIds.glossary,
      runsTableId: config.registryTableIds.localizationRuns,
    });
    snapshots = new LarkDriveSnapshotStore(runner, {cwd, folderToken: config.stateFolderToken});
  } else {
    registry = new LocalRegistryStore(cwd);
    snapshots = new LocalSnapshotStore(cwd);
  }

  await mkdir(join(cwd, '.zdoc-localize'), {recursive: true});
  const memory = new SqliteTranslationMemory(join(cwd, '.zdoc-localize', 'translation-memory.db'));
  const workflows = new LocalizationWorkflows({
    cwd,
    registry,
    snapshots,
    memory,
    engine,
    docs: documents,
    documentCreation,
    whiteboards,
    clock: {now: () => new Date()},
    ids: {next: () => randomUUID()},
  });

  return {
    registry,
    snapshots,
    engine,
    documentCreation,
    workflows,
    close: () => memory.close(),
  };
}
