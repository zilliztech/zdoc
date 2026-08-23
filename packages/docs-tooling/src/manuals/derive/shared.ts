import type {DeepReadonly} from '../registry.ts';
import type {ManualDefinition, ManualSource} from '../schema.ts';

export const LARK_SOURCE_ROOT = 'packages/docs-tooling/src/lark/meta/sources';

export type DerivableSource = DeepReadonly<ManualSource> & {
  /** Source key within its manual (e.g. 'english-v3.0'). */
  key: string;
  /** Manual id (e.g. 'python'). */
  manualId: string;
};

export function activeGeneratorSources(manual: DeepReadonly<ManualDefinition>): DerivableSource[] {
  const order = manual.sourceOrder ?? Object.keys(manual.sources);
  const result: DerivableSource[] = [];
  for (const key of order) {
    const source = manual.sources[key];
    if (!source) continue;
    if (source.lifecycle === 'retired') continue;
    if (source.sourceType === 'local' || source.sourceType === 'rest') continue;
    result.push({...source, key, manualId: manual.id});
  }
  return result;
}

export function generatorManualNames(manual: DeepReadonly<ManualDefinition>): string[] {
  return activeGeneratorSources(manual)
    .map(source => source.generatorManual)
    .filter((name): name is string => Boolean(name));
}

export function sourceDirWithPrefix(source: DerivableSource): string {
  return './' + source.sourceDir;
}

export function fallbackSourceDir(source: DerivableSource, allSources: readonly DerivableSource[]): string | undefined {
  if (!source.fallbackSource) return undefined;
  const fallback = allSources.find(candidate => candidate.key === source.fallbackSource && candidate.manualId === source.manualId);
  if (!fallback) return undefined;
  return sourceDirWithPrefix(fallback);
}

export function configManualName(source: DerivableSource): string {
  return source.generatorManual ?? source.manualId;
}
