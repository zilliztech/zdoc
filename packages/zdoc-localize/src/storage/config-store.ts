import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';

export interface WorkspaceConfig {
  mode: 'local' | 'feishu';
  registryUrl?: string;
  stateFolderUrl?: string;
  registryTableIds?: {
    documentPairs: string;
    glossary: string;
    localizationRuns: string;
  };
}

export class ConfigStore {
  readonly path: string;

  constructor(cwd: string) {
    this.path = join(cwd, '.zdoc-localize', 'config.json');
  }

  async read(): Promise<WorkspaceConfig | undefined> {
    try {
      return JSON.parse(await readFile(this.path, 'utf8')) as WorkspaceConfig;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
      throw error;
    }
  }

  async write(config: WorkspaceConfig): Promise<void> {
    await mkdir(dirname(this.path), {recursive: true});
    await writeFile(this.path, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  }
}
