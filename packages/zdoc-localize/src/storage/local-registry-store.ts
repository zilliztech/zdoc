import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';

import type {GlossaryEntry} from '../domain/glossary.js';
import type {DocumentPair, RunRecord} from '../domain/model.js';
import type {LocalizationReceipt, RegistryStore} from '../application/ports.js';

interface RegistryData {
  pairs: Record<string, DocumentPair>;
  runs: Record<string, RunRecord>;
  glossary: GlossaryEntry[];
  receipts: Record<string, LocalizationReceipt>;
}

const emptyRegistry = (): RegistryData => ({pairs: {}, runs: {}, glossary: [], receipts: {}});

export class LocalRegistryStore implements RegistryStore {
  readonly path: string;

  constructor(cwd: string) {
    this.path = join(cwd, '.zdoc-localize', 'registry.json');
  }

  private async read(): Promise<RegistryData> {
    try {
      return JSON.parse(await readFile(this.path, 'utf8')) as RegistryData;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyRegistry();
      throw error;
    }
  }

  private async write(data: RegistryData): Promise<void> {
    await mkdir(dirname(this.path), {recursive: true});
    await writeFile(this.path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }

  async savePair(pair: DocumentPair): Promise<void> {
    const data = await this.read();
    data.pairs[pair.pairId] = pair;
    await this.write(data);
  }

  async getPair(pairId: string): Promise<DocumentPair | undefined> {
    return (await this.read()).pairs[pairId];
  }

  async listPairs(): Promise<DocumentPair[]> {
    return Object.values((await this.read()).pairs).sort((left, right) => left.pairId.localeCompare(right.pairId));
  }

  async saveRun(run: RunRecord): Promise<void> {
    const data = await this.read();
    data.runs[run.runId] = run;
    await this.write(data);
  }

  async getRun(runId: string): Promise<RunRecord | undefined> {
    return (await this.read()).runs[runId];
  }

  async listGlossary(): Promise<GlossaryEntry[]> {
    return (await this.read()).glossary;
  }

  async saveGlossary(entries: GlossaryEntry[]): Promise<void> {
    const data = await this.read();
    data.glossary = entries;
    await this.write(data);
  }

  async getReceipt(pairId: string): Promise<LocalizationReceipt | undefined> {
    return (await this.read()).receipts[pairId];
  }

  async saveReceipt(receipt: LocalizationReceipt): Promise<void> {
    const data = await this.read();
    data.receipts[receipt.pairId] = receipt;
    await this.write(data);
  }
}
