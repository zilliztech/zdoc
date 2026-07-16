import {LocalizeError} from './errors.js';

export type GlossaryScopeType = 'global' | 'product' | 'environment' | 'version' | 'document';
export type GlossaryDisposition = 'translate' | 'keep_as_is' | 'deprecated';

export interface GlossaryEntry {
  termId: string;
  sourceTerm: string;
  targetTerm?: string;
  disposition: GlossaryDisposition;
  scopeType: GlossaryScopeType;
  scopeValue?: string;
  prohibitedVariants?: string[];
  status: 'candidate' | 'approved' | 'deprecated';
}

export interface GlossaryContext {
  pairId: string;
  product?: string;
  environment?: string;
  version?: string;
}

export interface ResolvedGlossaryTerm {
  source: string;
  target?: string;
  disposition: GlossaryDisposition;
  scopeType: GlossaryScopeType;
  prohibitedVariants: string[];
}

const priority: Record<GlossaryScopeType, number> = {
  global: 1,
  product: 2,
  environment: 2,
  version: 2,
  document: 3,
};

function applies(entry: GlossaryEntry, context: GlossaryContext): boolean {
  if (entry.scopeType === 'global') return true;
  if (entry.scopeType === 'document') return entry.scopeValue === context.pairId;
  if (entry.scopeType === 'product') return entry.scopeValue === context.product;
  if (entry.scopeType === 'environment') return entry.scopeValue === context.environment;
  return entry.scopeValue === context.version;
}

export function resolveGlossary(
  entries: GlossaryEntry[],
  context: GlossaryContext,
): Map<string, ResolvedGlossaryTerm> {
  const grouped = new Map<string, GlossaryEntry[]>();
  for (const entry of entries) {
    if (entry.status !== 'approved' || !applies(entry, context)) continue;
    const key = entry.sourceTerm.toLowerCase();
    grouped.set(key, [...(grouped.get(key) ?? []), entry]);
  }

  const resolved = new Map<string, ResolvedGlossaryTerm>();
  for (const [key, candidates] of grouped) {
    const highest = Math.max(...candidates.map((entry) => priority[entry.scopeType]));
    const winners = candidates.filter((entry) => priority[entry.scopeType] === highest);
    if (winners.length > 1) {
      throw new LocalizeError({
        type: 'configuration',
        subtype: 'glossary_conflict',
        message: `Conflicting approved glossary entries for "${winners[0]!.sourceTerm}".`,
        hint: 'Keep only one approved translation at the highest applicable scope.',
        details: {termIds: winners.map((entry) => entry.termId)},
      });
    }
    const winner = winners[0]!;
    resolved.set(key, {
      source: winner.sourceTerm,
      ...(winner.targetTerm ? {target: winner.targetTerm} : {}),
      disposition: winner.disposition,
      scopeType: winner.scopeType,
      prohibitedVariants: winner.prohibitedVariants ?? [],
    });
  }
  return resolved;
}
