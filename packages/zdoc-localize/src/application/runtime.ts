import {randomUUID} from 'node:crypto';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';

import {LarkBaseRegistry} from '../adapters/lark-base-registry.js';
import {LarkDocsAdapter} from '../adapters/lark-docs-adapter.js';
import {LarkDriveSnapshotStore} from '../adapters/lark-drive-snapshots.js';
import {NodeProcessRunner} from '../adapters/process-runner.js';
import {LocalizeError} from '../domain/errors.js';
import {ConfigStore} from '../storage/config-store.js';
import {LocalRegistryStore} from '../storage/local-registry-store.js';
import {LocalSnapshotStore} from '../storage/local-snapshot-store.js';
import {SqliteTranslationMemory} from '../storage/sqlite-translation-memory.js';
import type {RegistryStore, SnapshotStore} from './ports.js';
import {LocalizationWorkflows} from './workflows.js';

export interface Runtime {
  registry: RegistryStore;
  snapshots: SnapshotStore;
  docs: LarkDocsAdapter;
  workflows: LocalizationWorkflows;
  close(): Promise<void>;
}

export async function createRuntime(cwd: string): Promise<Runtime> {
  const config = await new ConfigStore(cwd).read();
  const runner = new NodeProcessRunner();
  const docs = new LarkDocsAdapter(runner);
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
    docs,
    clock: {now: () => new Date()},
    ids: {next: () => randomUUID()},
  });

  return {
    registry,
    snapshots,
    docs,
    workflows,
    close: () => memory.close(),
  };
}
