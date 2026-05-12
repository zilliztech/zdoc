import {loadTopicPolicies} from './catalog.js';

const ZILLIZ_CLI_TOPIC = 'zilliz-cli';
const ON_DEMAND_SEARCH_TOPIC = 'on-demand-search';

function normalize(input: string): string {
  return input.toLowerCase().replace(/\s+/g, ' ').trim();
}

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(text));
}

function hasConfiguredTriggerPhrase(text: string, phrases: string[] | undefined): boolean {
  if (!phrases || phrases.length === 0) return false;
  return phrases
    .map(phrase => normalize(phrase))
    .filter(Boolean)
    .some(phrase => text.includes(phrase));
}

function resolveConfiguredIntent(text: string, topics: string[]): string | null {
  for (const topic of topics) {
    const policies = loadTopicPolicies(topic);
    const matched = policies.find(policy => hasConfiguredTriggerPhrase(text, policy.trigger_phrases));
    if (matched) return matched.intent_id;
  }

  return null;
}

export function resolvePolicyIntent(query: string, topics: string[]): string | null {
  const text = normalize(query);
  const configuredIntent = resolveConfiguredIntent(text, topics);
  if (configuredIntent) return configuredIntent;

  if (topics.includes(ON_DEMAND_SEARCH_TOPIC)) {
    if (hasAny(text, [
      /best[- ]fit.*use cases?.*(external data lake|on[- ]demand)/i,
      /ideal use cases?.*(external data lake|on[- ]demand)/i,
    ])) return 'external_data_lake_search_best_fit_use_cases';

    if (hasAny(text, [
      /supported formats?/i,
      /what.*formats?.*(external data lake|on[- ]demand)/i,
      /\b(?:lance|iceberg|parquet|vortex)\b/i,
    ])) return 'external_data_lake_search_supported_formats';

    if (hasAny(text, [
      /how it works/i,
      /how.*(external data lake search|on[- ]demand).*works/i,
      /bring your own bucket/i,
      /external collection/i,
      /zero-copy/i,
    ])) return 'external_data_lake_search_how_it_works';

    if (hasAny(text, [
      /\brefresh\b/i,
      /incremental sync/i,
      /data lake updates?/i,
      /sync data/i,
    ])) return 'external_data_lake_search_sync_updates';
  }

  if (topics.includes(ZILLIZ_CLI_TOPIC)) {
    if (hasAny(text, [
      /get started.*zilliz cli.*minutes?/i,
      /quickstart.*zilliz cli/i,
      /install.*login.*create cluster/i,
    ])) return 'zcli_get_started_in_minutes';

    if (hasAny(text, [
      /enable.*agent.*zilliz.*cli skill/i,
      /official cli skill/i,
      /connect.*coding agent.*zilliz/i,
    ])) return 'zcli_agent_skill_setup';

    if (hasAny(text, [
      /what are others building with.*zilliz cli/i,
      /usage patterns.*zilliz cli/i,
      /real[- ]world.*zilliz cli/i,
    ])) return 'zcli_usage_patterns';

    if (hasAny(text, [
      /(?:zilliz cli.*roadmap|roadmap.*zilliz cli)/i,
      /(?:zilliz cli.*feature requests?|feature requests?.*zilliz cli)/i,
    ])) return 'zcli_roadmap_feedback';
  }

  return null;
}
