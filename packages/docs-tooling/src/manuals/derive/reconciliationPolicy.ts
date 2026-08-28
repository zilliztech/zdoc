import {manualRegistry} from '../registry.ts';

type PolicyRule = Readonly<{
  mode: 'automatic' | 'review_required';
  automaticKinds: readonly string[];
  maxOperations: number;
  maxPercent: number;
  requiresCompletenessEvidence: boolean;
  preservedRoots: readonly string[];
}>;

function referenceManuals() {
  return manualRegistry
    .filter((manual) => manual.kind === 'reference' && manual.presentation !== undefined)
    .sort((left, right) => left.presentation!.groupOrder - right.presentation!.groupOrder);
}

// The REST manual has no preserved landing root (its Chinese reference is
// spec-generated), so it contributes an empty preservedRoots list.
function enLandingPath(manual: ReturnType<typeof referenceManuals>[number]): string | null {
  if (manual.presentation!.referenceKind === 'restful') return null;
  const basename = manual.presentation!.landingPage.split('/').at(-1);
  return `content/en/reference/${manual.presentation!.documentIdPrefix}/${basename}`;
}

function automaticRule(preservedRoots: readonly string[]): PolicyRule {
  return Object.freeze({
    mode: 'automatic',
    automaticKinds: ['delete_target', 'remove_navigation_only', 'replace_path'],
    maxOperations: 1000,
    maxPercent: 100,
    requiresCompletenessEvidence: false,
    preservedRoots: Object.freeze([...preservedRoots].sort()),
  });
}

const REST_REVIEW_RULE: PolicyRule = Object.freeze({
  mode: 'review_required',
  automaticKinds: Object.freeze([]),
  maxOperations: 25,
  maxPercent: 10,
  requiresCompletenessEvidence: true,
  preservedRoots: Object.freeze([]),
});

function landingsReviewRule(preservedRoots: readonly string[]): PolicyRule {
  return Object.freeze({
    mode: 'review_required',
    automaticKinds: Object.freeze([]),
    maxOperations: 5,
    maxPercent: 20,
    requiresCompletenessEvidence: false,
    preservedRoots: Object.freeze([...preservedRoots].sort()),
  });
}

export function generateReconciliationPolicyJson(): string {
  const manuals = referenceManuals();
  const jaJp: Record<string, PolicyRule> = {
    guides: automaticRule([]),
  };
  const zhCnReference: Record<string, PolicyRule> = {};
  const landingRoots: string[] = [];
  for (const manual of manuals) {
    const root = enLandingPath(manual);
    jaJp[manual.id] = manual.presentation!.referenceKind === 'restful' ? REST_REVIEW_RULE : automaticRule(root ? [root] : []);
    if (manual.presentation!.referenceKind === 'restful') {
      zhCnReference[manual.id] = REST_REVIEW_RULE;
    } else {
      zhCnReference[manual.id] = automaticRule(root ? [root] : []);
      if (root) landingRoots.push(root);
    }
  }
  zhCnReference['reference-landings'] = landingsReviewRule(landingRoots);

  const policy = {
    schemaVersion: 1,
    policyId: 'translation-reconciliation-2026-08-15-v1',
    targets: {
      'ja-JP': jaJp,
      'zh-CN-reference': zhCnReference,
    },
  };
  return `${JSON.stringify(policy, null, 2)}\n`;
}

