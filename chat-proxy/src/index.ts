import {randomUUID} from 'crypto';
import {Hono, type Context, type MiddlewareHandler} from 'hono';
import {cors} from 'hono/cors';
import {streamText, stepCountIs, type Tool} from 'ai';
import type {ChatRequest} from './types.js';
import {resolveModel, createModelInstance} from './runtime-config.js';
import {getOrCreateSession, appendAndWindow, clearSessionMessages, shouldInjectPageContext} from './sessions.js';
import {checkGuard} from './guard.js';
import {searchDocs, getIndexStatus, getTitleByUrl, type SearchResult} from './rag.js';
import {isDemotedSource} from './demotion.js';
import {groundAtomically} from './grounding-agent.js';
import {computeGrounding} from './grounding.js';
import {routeIntent, clearSessionRoute} from './router.js';
import {getAgent} from './agents/index.js';
import {getToolsForAgent, type ToolName} from './tools/index.js';
import {logDebugFlow, logEvent, saveConversation, summarizeForDebugLog, updateUserProfile} from './logger.js';
import {adminApp} from './admin.js';
import {makeTelemetry} from './telemetry.js';
import {incCounter, renderMetrics, observeHistogram} from './metrics.js';
import type {FeedbackRequest} from './types.js';
import {recordFeedback, getStats} from './feedback.js';
import {inferSection} from './sources.js';
import {getRules, evaluatePrePrompt, evaluatePostResponse} from './hooks/index.js';
import type {AgentType} from './types.js';
import {computeConfidence} from './confidence.js';
import {loadPrompts, getBasePrompt, getTopicPrompt} from './prompts.js';
import {
  semanticCacheLookup,
  semanticCacheWrite,
  computeEmbedding,
  getSemanticCacheConfig,
  isSemanticCacheEnabled,
} from './semantic-cache.js';
import type {SemanticCacheHit} from './semantic-cache.js';
import type {TokenUsage} from './types.js';
import {saveTokenUsage, isDbReady} from './db.js';
import {startedAt, llmHealth, recordLlmSuccess, recordLlmError, recordLlmDisconnect} from './health.js';
import {handlePostAction} from './post-action-handler.js';
import type {ResolvedModel} from './runtime-config.js';
import {bedrockAiSdkMaxRetries} from './bedrock-guard.js';
import {createDeferred, LruTtlCache, normalizeQuery, stableHash} from './cache.js';

// Load topic prompts from disk at startup
loadPrompts();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MAX_FALLBACK_SOURCES = 5;  // Max sources to show when grounding returns empty
const TOOL_COLLECTION_MAX_STEPS = 2;
const TOOL_COLLECTION_TIMEOUT_MS = 30000;
const FINAL_SYNTHESIS_TIMEOUT_MS = 30000;
const FINAL_SYNTHESIS_MAX_OUTPUT_TOKENS = 1600;
const EMBEDDING_BUDGET_MS = Number(process.env.EMBEDDING_BUDGET_MS || '') || 1500;
const SEMANTIC_CACHE_LOOKUP_BUDGET_MS = Number(process.env.SEMANTIC_CACHE_LOOKUP_BUDGET_MS || '') || 250;
const QUERY_EMBEDDING_ENABLED = process.env.QUERY_EMBEDDING_ENABLED !== 'false';
const TOOL_EMBEDDING_BUDGET_MS = Number(process.env.TOOL_EMBEDDING_BUDGET_MS || '') || 75;
const PAGE_CONTEXT_MAX_CHARS = Number(process.env.PAGE_CONTEXT_MAX_CHARS || '') || 3000;
const TOOL_CONTEXT_MAX_CHARS = Number(process.env.TOOL_CONTEXT_MAX_CHARS || '') || 2500;
const TOOL_MODEL_OUTPUT_MAX_CHARS = Number(process.env.TOOL_MODEL_OUTPUT_MAX_CHARS || '') || 1200;
const FAST_PATH_ENABLED = process.env.FAST_PATH_ENABLED !== 'false';
const FAST_PATH_MAX_TOOL_ROUNDS = Number(process.env.FAST_PATH_MAX_TOOL_ROUNDS || '') || 2;
const FAST_PATH_CODE_MAX_TOOL_ROUNDS = Number(process.env.FAST_PATH_CODE_MAX_TOOL_ROUNDS || '') || 1;
const FAST_PATH_MAX_OUTPUT_TOKENS = Number(process.env.FAST_PATH_MAX_OUTPUT_TOKENS || '') || 1200;
const FAST_PATH_TIMEOUT_MS = Number(process.env.FAST_PATH_TIMEOUT_MS || '') || 30000;
const TOOLLESS_RAG_ENABLED = process.env.TOOLLESS_RAG_ENABLED !== 'false';
const TOOLLESS_RAG_AGENTS = new Set((process.env.TOOLLESS_RAG_AGENTS || 'code,general,schema')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean));
const TOOLLESS_RAG_TOP_K = Number(process.env.TOOLLESS_RAG_TOP_K || '') || 6;
const TOOLLESS_RAG_MIN_RESULTS = Number(process.env.TOOLLESS_RAG_MIN_RESULTS || '') || 1;
const TOOLLESS_RAG_CONTEXT_MAX_CHARS = Number(process.env.TOOLLESS_RAG_CONTEXT_MAX_CHARS || '') || 7000;
const SERVER_RAG_MAX_QUERIES = Number(process.env.SERVER_RAG_MAX_QUERIES || '') || 4;
const SERVER_RAG_PER_QUERY_TOP_K = Number(process.env.SERVER_RAG_PER_QUERY_TOP_K || '') || Math.max(4, TOOLLESS_RAG_TOP_K);
const TOOLLESS_RAG_TIMEOUT_MS = Number(process.env.TOOLLESS_RAG_TIMEOUT_MS || '') || 30000;
const TOOLLESS_RAG_MAX_OUTPUT_TOKENS = Number(process.env.TOOLLESS_RAG_MAX_OUTPUT_TOKENS || '') || 1100;
const GROUNDING_LLM_ENABLED = process.env.GROUNDING_LLM_ENABLED !== 'false';
const GROUNDING_LLM_MIN_SOURCES = Number(process.env.GROUNDING_LLM_MIN_SOURCES || '') || 8;
const GROUNDING_LLM_MIN_TEXT_CHARS = Number(process.env.GROUNDING_LLM_MIN_TEXT_CHARS || '') || 400;
const RESPONSE_CACHE_TTL_MS = Number(process.env.RESPONSE_CACHE_TTL_MS || '') || 10 * 60 * 1000;
const RESPONSE_CACHE_MAX = Number(process.env.RESPONSE_CACHE_MAX || '') || 1000;
const ANSWER_EXACT_CACHE_ENABLED = process.env.ANSWER_EXACT_CACHE_ENABLED !== 'false';
const ANSWER_EXACT_CACHE_TTL_MS = Number(process.env.ANSWER_EXACT_CACHE_TTL_MS || '') || 30 * 60 * 1000;
const ANSWER_EXACT_CACHE_MAX = Number(process.env.ANSWER_EXACT_CACHE_MAX || '') || 2000;
const ANSWER_EXACT_CACHE_MAX_EVENT_BYTES = Number(process.env.ANSWER_EXACT_CACHE_MAX_EVENT_BYTES || '') || 128 * 1024;
const ANSWER_INFLIGHT_ENABLED = process.env.ANSWER_INFLIGHT_ENABLED !== 'false';
const ANSWER_INFLIGHT_WAIT_MS = Number(process.env.ANSWER_INFLIGHT_WAIT_MS || '') || 30000;
const CACHE_REPLAY_STREAM_ENABLED = process.env.CACHE_REPLAY_STREAM_ENABLED !== 'false';
const CACHE_REPLAY_INITIAL_DELAY_MS = Number(process.env.CACHE_REPLAY_INITIAL_DELAY_MS || '') || 120;
const CACHE_REPLAY_DELTA_DELAY_MS = Number(process.env.CACHE_REPLAY_DELTA_DELAY_MS || '') || 12;
const CACHE_REPLAY_MAX_TOTAL_DELAY_MS = Number(process.env.CACHE_REPLAY_MAX_TOTAL_DELAY_MS || '') || 2500;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>(resolve => {
    timeout = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
}

function truncateText(text: string, maxChars: number): string {
  if (!text || text.length <= maxChars) return text;
  return text.slice(0, maxChars).trimEnd() + '\n... [truncated]';
}

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shouldUseFastPath(agentType: AgentType): boolean {
  return FAST_PATH_ENABLED && agentType !== 'schema';
}

function shouldUseToollessRag(agentType: AgentType): boolean {
  return TOOLLESS_RAG_ENABLED && TOOLLESS_RAG_AGENTS.has(agentType);
}

function getFastPathMaxToolRounds(agentType: AgentType): number {
  if (agentType === 'code') return Math.max(1, FAST_PATH_CODE_MAX_TOOL_ROUNDS);
  return Math.max(1, FAST_PATH_MAX_TOOL_ROUNDS);
}

function shouldUseLlmGrounding(agentType: AgentType, candidateCount: number, textLength: number): boolean {
  // Code answers often include snippets that deterministic grounding handles well.
  // Avoid a post-answer LLM attribution call on the latency-sensitive code path.
  if (agentType === 'code') return false;
  return GROUNDING_LLM_ENABLED && candidateCount >= GROUNDING_LLM_MIN_SOURCES && textLength >= GROUNDING_LLM_MIN_TEXT_CHARS;
}

function compactToolResultForModel(toolResult: Record<string, any> | undefined): Record<string, any> | undefined {
  if (!toolResult || typeof toolResult !== 'object') return toolResult;
  const compact: Record<string, any> = {...toolResult};

  if (Array.isArray(toolResult.results)) {
    compact.results = toolResult.results.slice(0, 3).map((r: any) => ({
      id: r.id,
      title: r.title || r.doc_title || '',
      url: r.url || r.doc_url || '',
      section: r.section,
      content: r.content ? truncateText(String(r.content), TOOL_MODEL_OUTPUT_MAX_CHARS) : undefined,
      score: r.score,
    }));
    compact.totalResults = toolResult.totalResults ?? toolResult.results.length;
  }

  if (Array.isArray(toolResult.examples)) {
    compact.examples = toolResult.examples.slice(0, 2).map((e: any) => ({
      title: e.title || 'Example',
      url: e.url,
      code: e.code ? truncateText(String(e.code), TOOL_MODEL_OUTPUT_MAX_CHARS) : undefined,
    }));
  }

  if (Array.isArray(toolResult.relatedDocs)) {
    compact.relatedDocs = toolResult.relatedDocs.slice(0, 4).map((r: any) => ({
      title: r.title || 'Untitled',
      url: r.url,
    }));
  }

  if (Array.isArray(toolResult.pages)) {
    compact.pages = toolResult.pages.slice(0, 5).map((p: any) => ({
      title: p.title || 'Untitled',
      url: p.url,
      section: p.section,
    }));
    compact.totalResults = toolResult.totalResults ?? toolResult.pages.length;
  }

  if (toolResult.content) {
    compact.content = truncateText(String(toolResult.content), TOOL_CONTEXT_MAX_CHARS);
  }

  return compact;
}

function createCompactToolsForModel(agentTools: Record<string, Tool>): Record<string, Tool> {
  const compactTools: Record<string, Tool> = {};
  for (const [name, toolDef] of Object.entries(agentTools)) {
    compactTools[name] = {
      ...toolDef,
      toModelOutput: async (options: {toolCallId: string; input: unknown; output: unknown}) => {
        const existing = (toolDef as any).toModelOutput;
        const modelOutput = existing
          ? await existing(options)
          : {type: 'json' as const, value: options.output};

        if (modelOutput?.type === 'json' && modelOutput.value && typeof modelOutput.value === 'object' && !Array.isArray(modelOutput.value)) {
          return {
            ...modelOutput,
            value: compactToolResultForModel(modelOutput.value as Record<string, any>),
          };
        }

        if (modelOutput?.type === 'text' && typeof modelOutput.value === 'string') {
          return {
            ...modelOutput,
            value: truncateText(modelOutput.value, TOOL_CONTEXT_MAX_CHARS),
          };
        }

        return modelOutput;
      },
    };
  }
  return compactTools;
}

function buildActiveToolsForStep(agentType: AgentType, stepNumber: number, allToolNames: ToolName[]): ToolName[] {
  if (agentType === 'code' && stepNumber === 0 && allToolNames.includes('searchDocs')) {
    return ['searchDocs'];
  }

  if (agentType === 'general' && stepNumber === 0) {
    return allToolNames.filter(name => name !== 'getPageContent');
  }

  return allToolNames;
}

function buildToolChoiceForStep(agentType: AgentType, stepNumber: number, activeToolNames: ToolName[]) {
  if (agentType === 'code' && stepNumber === 0 && activeToolNames.includes('searchDocs')) {
    return {type: 'tool' as const, toolName: 'searchDocs' as const};
  }

  if (stepNumber === 0 && activeToolNames.length > 0) {
    return 'required' as const;
  }

  return 'auto' as const;
}

type ToolChunk = {id?: string; doc_url: string; doc_title: string; section: string; content: string};

function ingestToolResult(
  toolName: string,
  rawToolResult: Record<string, any> | undefined,
  toolSources: {title: string; url: string; score?: number; section?: string}[],
  toolChunks: ToolChunk[],
  toolResultSummaries: string[],
  addSummary = true,
): Record<string, any> | undefined {
  const toolResult = compactToolResultForModel(rawToolResult) as Record<string, any> | undefined;
  if (addSummary) toolResultSummaries.push(formatToolResultForSynthesis(toolName, toolResult));

  if (toolResult?.results) {
    for (const r of toolResult.results) {
      if (r.url) {
        toolSources.push({title: r.title || '', url: r.url, score: r.score, section: r.section});
        if (r.content) toolChunks.push({
          id: r.id,
          doc_url: r.url,
          doc_title: r.title || '',
          section: r.section || '',
          content: r.content,
        });
      }
    }
  }

  if (toolResult?.relatedDocs) {
    for (const r of toolResult.relatedDocs) {
      if (r.url) toolSources.push({title: r.title || '', url: r.url});
    }
  }

  return toolResult;
}

function formatToolResultForSynthesis(toolName: string, toolResult: Record<string, any> | undefined): string {
  if (!toolResult) return `Tool: ${toolName}\nNo result returned.`;
  const lines = [`Tool: ${toolName}`];

  if (Array.isArray(toolResult.results)) {
    lines.push('Search results:');
    for (const r of toolResult.results.slice(0, 3)) {
      lines.push(`- ${r.title || r.doc_title || 'Untitled'} (${r.url || r.doc_url || 'no-url'})${r.section ? ` [${r.section}]` : ''}`);
      if (r.content) lines.push(truncateText(String(r.content), TOOL_MODEL_OUTPUT_MAX_CHARS));
    }
    if (toolResult.results.length === 0) lines.push('- No search results.');
  }

  if (Array.isArray(toolResult.examples)) {
    lines.push('Code examples:');
    for (const e of toolResult.examples.slice(0, 2)) {
      lines.push(`- ${e.title || 'Example'} (${e.url || 'no-url'})`);
      if (e.code) lines.push('```\n' + truncateText(String(e.code), TOOL_MODEL_OUTPUT_MAX_CHARS) + '\n```');
    }
    if (toolResult.examples.length === 0) lines.push('- No code examples.');
  }

  if (Array.isArray(toolResult.relatedDocs) && toolResult.relatedDocs.length > 0) {
    lines.push('Related docs:');
    for (const r of toolResult.relatedDocs.slice(0, 4)) {
      lines.push(`- ${r.title || 'Untitled'} (${r.url || 'no-url'})`);
    }
  }

  if (Array.isArray(toolResult.pages)) {
    lines.push('Pages:');
    for (const p of toolResult.pages.slice(0, 5)) {
      lines.push(`- ${p.title || 'Untitled'} (${p.url || 'no-url'})${p.section ? ` [${p.section}]` : ''}`);
    }
    if (toolResult.pages.length === 0) lines.push('- No pages found.');
  }

  if (toolResult.url && toolResult.success) {
    lines.push(`Page content: ${toolResult.title || toolResult.url} (${toolResult.url})`);
    if (toolResult.content) lines.push(truncateText(String(toolResult.content), TOOL_CONTEXT_MAX_CHARS));
  }

  if (lines.length === 1) {
    lines.push(truncateText(JSON.stringify(toolResult), TOOL_CONTEXT_MAX_CHARS));
  }

  return truncateText(lines.join('\n'), TOOL_CONTEXT_MAX_CHARS);
}

function buildToollessRagContext(
  toolChunks: ToolChunk[],
  toolResultSummaries: string[],
): string {
  const parts = toolChunks.slice(0, TOOLLESS_RAG_TOP_K).map((chunk, i) => {
    const title = chunk.doc_title || chunk.doc_url || `Source ${i + 1}`;
    const section = chunk.section ? ` [${chunk.section}]` : '';
    return `Source ${i + 1}: ${title}${section}
URL: ${chunk.doc_url}
${truncateText(chunk.content, Math.floor(TOOLLESS_RAG_CONTEXT_MAX_CHARS / Math.max(1, Math.min(toolChunks.length, TOOLLESS_RAG_TOP_K))))}`;
  });

  const context = parts.join('\n\n---\n\n') || toolResultSummaries.join('\n\n---\n\n');
  return truncateText(context, TOOLLESS_RAG_CONTEXT_MAX_CHARS);
}

function normalizeSearchText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9_+#.\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function isProbablyMisspelledSupportedRegexQuestion(query: string): boolean {
  const lower = query.toLowerCase();
  return /\b(regex|regexp|regular expression|regular expressions|svntax|syntax)\b/.test(lower) &&
    /\b(supported|support|supoorted|suported|syntax|svntax)\b/.test(lower);
}

function expandQueryForSearch(query: string, agentType: AgentType, topics: string[] = []): string[] {
  const normalized = normalizeSearchText(query);
  const queries: string[] = [];
  const add = (q: string) => {
    const cleaned = normalizeSearchText(q);
    if (cleaned && !queries.includes(cleaned)) queries.push(cleaned);
  };

  add(normalized || query);

  if (isProbablyMisspelledSupportedRegexQuestion(query)) {
    add('regex regular expression syntax supported filter expression pattern match wildcard full text search text_match');
    add('filter expression string operators like match text_match regex wildcard supported syntax');
    add('full text search text_match analyzer BM25 regex wildcard support');
  }

  if (/\bgrep\b/i.test(query)) {
    add('grep exact string match full text search text_match scalar filter hybrid search');
  }

  if (/\b(TEXT_MATCH|text match|full[-\s]?text|bm25|analyzer)\b/i.test(query)) {
    add('TEXT_MATCH full text search analyzer BM25 VARCHAR sparse vector function');
  }

  if (/\b(filter|expr|expression|where|metadata|scalar)\b/i.test(query)) {
    add('filter expression scalar filtering operators string varchar json array supported syntax');
  }

  if (/\b(regex|regexp|wildcard|fuzzy)\b/i.test(query)) {
    add('regex wildcard fuzzy matching support filter expression full text search limitations');
  }

  if (agentType === 'schema' || topics.includes('schema-design')) {
    add(`${normalized} schema field types index collection limits`);
  }

  if (agentType === 'code' || /\b(code|example|sdk|python|node|java|go|curl|rest)\b/i.test(query)) {
    add(`${normalized} code example sdk MilvusClient`);
  }

  if (topics.includes('search')) {
    add(`${normalized} vector search filtered search hybrid search full text search`);
  }

  return queries.slice(0, SERVER_RAG_MAX_QUERIES);
}

function scoreServerRagResult(result: SearchResult, query: string, rank: number): number {
  const q = normalizeSearchText(query);
  const title = normalizeSearchText(result.doc_title || '');
  const url = normalizeSearchText(result.doc_url || '');
  const content = normalizeSearchText(result.content || '');
  const terms = q.split(' ').filter(t => t.length > 2);

  let score = Number(result.score || 0);
  score += 1 / (rank + 1);

  if (title && q && title.includes(q)) score += 2.0;
  if (url && q && url.includes(q.replace(/\s+/g, '-'))) score += 1.2;

  const exactTerms = ['regex', 'regexp', 'regular', 'expression', 'syntax', 'supported', 'support', 'wildcard', 'fuzzy', 'text_match', 'bm25', 'filter'];
  for (const term of exactTerms) {
    if (q.includes(term)) {
      if (title.includes(term)) score += 0.8;
      if (url.includes(term)) score += 0.5;
      if (content.includes(term)) score += 0.25;
    }
  }

  const matched = terms.filter(t => title.includes(t) || url.includes(t) || content.includes(t)).length;
  if (terms.length > 0) score += matched / terms.length;

  if (isDemotedSource(result.doc_title, result.doc_url)) score *= 0.35;
  return score;
}

function mergeServerRagResults(resultSets: SearchResult[][], query: string, topK: number): SearchResult[] {
  const merged = new Map<string, {result: SearchResult; score: number}>();

  for (const results of resultSets) {
    results.forEach((result, rank) => {
      const key = result.id || `${result.doc_url}#${rank}`;
      const score = scoreServerRagResult(result, query, rank);
      const existing = merged.get(key);
      if (!existing || score > existing.score) {
        merged.set(key, {result: {...result, score}, score});
      }
    });
  }

  return [...merged.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({result}) => result);
}

async function searchDocsServerRag(
  query: string,
  agentType: AgentType,
  topics: string[],
  topK: number,
  sectionFilter?: string,
  queryEmbedding?: number[] | null,
): Promise<{results: SearchResult[]; queries: string[]}> {
  const queries = expandQueryForSearch(query, agentType, topics);
  const perQueryTopK = Math.max(topK, SERVER_RAG_PER_QUERY_TOP_K);
  const resultSets = await Promise.all(queries.map((q, i) =>
    searchDocs(q, perQueryTopK, sectionFilter, undefined, undefined, i === 0 ? queryEmbedding : null),
  ));
  return {results: mergeServerRagResults(resultSets, query, topK), queries};
}

function buildToollessRagPrompt(query: string, context: string): string {
  return `User question:
${query}

Retrieved documentation context:
${context || 'No documentation context was retrieved.'}

Answer the user now using the retrieved context as your primary source. Keep the answer concise. Include code only when useful or requested. If the context is weak or incomplete, say what to verify instead of guessing. For questions about regex, wildcard, fuzzy matching, or exact string matching, do not claim support unless the retrieved context explicitly says it is supported; otherwise explain the documented alternatives such as scalar filters, TEXT_MATCH/full-text search, or hybrid search.`;
}

function detectRequestedCodeLanguage(query: string): 'python' | 'node' | 'java' | 'go' | 'rest' | null {
  const lower = query.toLowerCase();
  if (/\bpython\b|pymilvus/.test(lower)) return 'python';
  if (/\b(node|node\.js|javascript|typescript|js|ts)\b/.test(lower)) return 'node';
  if (/\bjava\b/.test(lower)) return 'java';
  if (/\bgo(lang)?\b/.test(lower)) return 'go';
  if (/\b(rest|curl|http)\b/.test(lower)) return 'rest';
  return null;
}

function extractCodeTopic(query: string): string {
  return query
    .replace(/give\s+(me\s+)?(a\s+)?concise\s+example/ig, '')
    .replace(/with\s+(python|node\.js|node|javascript|typescript|java|go|golang|rest|curl|http)/ig, '')
    .replace(/\b(how\s+do\s+i|how\s+to|can\s+you|please|example|code|using|in)\b/ig, ' ')
    .replace(/[^a-zA-Z0-9_\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || query.slice(0, 120);
}

async function runCodeExampleLookup(
  query: string,
  sectionFilter: string | undefined,
  toolSources: {title: string; url: string; score?: number; section?: string}[],
  toolChunks: ToolChunk[],
  toolResultSummaries: string[],
): Promise<boolean> {
  const language = detectRequestedCodeLanguage(query);
  if (!language || !/\b(example|code|snippet|python|node|java|go|rest|curl|sdk)\b/i.test(query)) return false;

  try {
    const toolDef = getToolsForAgent(['getCodeExample'], {sectionFilter}).getCodeExample as any;
    const rawResult = await toolDef.execute({topic: extractCodeTopic(query), language});
    const toolResult = ingestToolResult('getCodeExample', rawResult, toolSources, toolChunks, toolResultSummaries);
    if (Array.isArray(toolResult?.examples)) {
      for (const example of toolResult.examples) {
        if (example.url && example.code) {
          toolChunks.push({
            doc_url: example.url,
            doc_title: example.title || 'Code example',
            section: 'code-example',
            content: `\`\`\`${language === 'node' ? 'typescript' : language}\n${example.code}\n\`\`\``,
          });
        }
      }
    }
    return true;
  } catch (err) {
    console.warn('[ToollessRAG] code example lookup failed', JSON.stringify({error: summarizeForDebugLog(err instanceof Error ? err.message : String(err), 'error')}));
    return false;
  }
}

function buildNoResponseFallback(
  query: string,
  toolChunks: ToolChunk[],
  toolSources: {title: string; url: string; score?: number; section?: string}[] = [],
): string {
  const sourceLines = toolChunks.length > 0
    ? toolChunks.slice(0, 3).map((chunk, i) => `${i + 1}. ${chunk.doc_title || chunk.doc_url}${chunk.doc_url ? ` — ${chunk.doc_url}` : ''}`)
    : toolSources.slice(0, 5).map((source, i) => `${i + 1}. ${source.title || source.url} — ${source.url}`);

  if (sourceLines.length > 0) {
    return `I found relevant documentation for your question, but couldn't generate a complete answer. Please try again or rephrase your question.\n\nRelevant docs found:\n${sourceLines.join('\n')}`;
  }

  return `I couldn't generate a complete answer for this request. Please try again or rephrase your question. (${query ? 'Question received.' : 'No question text was available.'})`;
}

// ---------------------------------------------------------------------------
// Reasoning-model workaround: DeepSeek reasoning models require
// reasoning_content to be passed back on follow-up calls, which AI SDK v6
// doesn't handle automatically during tool loops. Map them to the chat
// variant for the streaming chat endpoint only.
// ---------------------------------------------------------------------------

function getChatModelForStream(resolved: ResolvedModel): ResolvedModel {
  const m = resolved.model.toLowerCase();
  if (!m.includes('deepseek')) return resolved;
  // Known safe chat models that support tool loops
  const safeChatModels = new Set([
    'deepseek-chat',
    'deepseek-v3',
    'deepseek/deepseek-chat',
    'deepseek/deepseek-v3',
  ]);
  if (safeChatModels.has(m)) return resolved;
  // Everything else (reasoner, r1, v4-pro, etc.) is treated as a reasoning
  // model that AI SDK v6 can't loop with. Map to the chat variant.
  const chatModel = m.includes('/') ? 'deepseek/deepseek-chat' : 'deepseek-chat';
  return {...resolved, model: chatModel};
}

// ---------------------------------------------------------------------------
// Deflection detection: suppress sources when the agent deflects off-topic
// ---------------------------------------------------------------------------

const DEFLECTION_PATTERNS = [
  /outside\s+(my|of\s+my)\s+(area\s+of\s+)?expertise/i,
  /i('m|\s+am)\s+(here\s+to\s+help\s+)?(specifically\s+)?with\s+questions\s+about/i,
  /i\s+can('t|\s+only)\s+help\s+with/i,
  /not\s+the\s+right\s+resource/i,
  /beyond\s+(my|the)\s+scope/i,
  /i('m|\s+am)\s+the\s+zilliz.*documentation\s+assistant/i,
];

function isDeflection(text: string): boolean {
  return DEFLECTION_PATTERNS.some(p => p.test(text));
}

// ---------------------------------------------------------------------------
// Self-description detection: suppress sources on capability/meta responses
// ---------------------------------------------------------------------------

const SELF_DESCRIPTION_PATTERNS = [
  /what\s+would\s+you\s+like\s+me\s+to\s+code/i,
  /i\s+can\s+(help|assist)\s+(you\s+)?(with|generate|write|create)\s+(code|examples)/i,
  /just\s+tell\s+me\s+what\s+you\s+need/i,
  /here('s|\s+are)\s+(what|some\s+things)\s+i\s+can/i,
  /i('m|\s+am)\s+(a\s+)?(code|coding|sdk)\s+(assistant|expert|specialist)/i,
  /for\s+example[,:]\s*\n/i,
];

function isSelfDescription(text: string): boolean {
  // Must match at least 2 patterns — a single match could be coincidental
  let matches = 0;
  for (const p of SELF_DESCRIPTION_PATTERNS) {
    if (p.test(text)) matches++;
    if (matches >= 2) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Section filter: exclude the opposite product's docs based on current page
// ---------------------------------------------------------------------------

function deriveSectionFilter(pageUrl?: string): string | undefined {
  if (!pageUrl) return undefined;
  if (pageUrl.startsWith('/docs/byoc')) return 'section != "cloud-guides"';
  if (pageUrl.startsWith('/reference')) return undefined; // reference sees all
  if (pageUrl.startsWith('/docs')) return 'section != "byoc-guides"';
  return undefined;
}

// ---------------------------------------------------------------------------
// Response cache: skip routing + LLM for identical repeated queries
// ---------------------------------------------------------------------------

type SseEventRecord = {event: string; data: string};

const responseCache = new LruTtlCache<SseEventRecord[]>({
  name: 'response_session',
  maxEntries: RESPONSE_CACHE_MAX,
  ttlMs: RESPONSE_CACHE_TTL_MS,
});
const exactAnswerCache = new LruTtlCache<SseEventRecord[]>({
  name: 'answer_exact',
  maxEntries: ANSWER_EXACT_CACHE_MAX,
  ttlMs: ANSWER_EXACT_CACHE_TTL_MS,
});
const answerInflight = new Map<string, ReturnType<typeof createDeferred<SseEventRecord[]>>>();
const sessionResponseCacheKeys = new Map<string, Set<string>>();

function responseCacheGet(key: string): SseEventRecord[] | null {
  return responseCache.get(key) ?? null;
}

/** Clear the response cache (exposed for testing) */
export function clearResponseCache(): void {
  responseCache.clear();
  exactAnswerCache.clear();
  answerInflight.clear();
  sessionResponseCacheKeys.clear();
}

function responseCacheSetForSession(sessionId: string, key: string, events: SseEventRecord[]): void {
  responseCache.set(key, events);
  let keys = sessionResponseCacheKeys.get(sessionId);
  if (!keys) {
    keys = new Set<string>();
    sessionResponseCacheKeys.set(sessionId, keys);
  }
  keys.add(key);
}

function clearSessionResponseCache(sessionId: string): number {
  const keys = sessionResponseCacheKeys.get(sessionId);
  if (!keys || keys.size === 0) return 0;
  let cleared = 0;
  for (const key of keys) {
    if (responseCache.delete(key)) {
      cleared++;
    }
  }
  sessionResponseCacheKeys.delete(sessionId);
  return cleared;
}

function getRequestLanguage(c: Context): string {
  return c.req.header('accept-language')?.split(',', 1)[0]?.trim().toLowerCase().slice(0, 32) || '';
}

function buildSessionResponseCacheKey(sessionId: string, query: string, sectionFilter: string | undefined, pageUrl: string | undefined, pageContext: string | undefined, language: string): string {
  return stableHash({
    sessionId,
    query: normalizeQuery(query),
    sectionFilter: sectionFilter || '',
    pagePath: pagePathForLog(pageUrl) || '',
    pageContextHash: pageContext ? stableHash(pageContext.slice(0, PAGE_CONTEXT_MAX_CHARS)) : '',
    language,
  });
}

function buildExactAnswerCacheKey(query: string, sectionFilter: string | undefined, pageUrl: string | undefined, pageContext: string | undefined, language: string): string {
  return stableHash({
    query: normalizeQuery(query),
    sectionFilter: sectionFilter || '',
    pagePath: pagePathForLog(pageUrl) || '',
    pageContextHash: pageContext ? stableHash(pageContext.slice(0, PAGE_CONTEXT_MAX_CHARS)) : '',
    language,
  });
}

function eventsByteLength(events: SseEventRecord[]): number {
  return events.reduce((sum, evt) => sum + Buffer.byteLength(evt.event, 'utf8') + Buffer.byteLength(evt.data, 'utf8'), 0);
}

function replayableEvents(events: SseEventRecord[]): SseEventRecord[] {
  // Usage/timing/status/tool-call are request-specific or pre-answer progress UI.
  return events.filter(evt => evt.event !== 'usage' && evt.event !== 'timing' && evt.event !== 'status' && evt.event !== 'tool-call');
}

function isLikelyUserSpecificQuery(query: string): boolean {
  return /\b(my|our|me|i)\b.*\b(account|bill|billing|invoice|project|cluster|organization|org|credit|usage|token|api key|password|secret)\b/i.test(query) ||
    /\b(api[_ -]?key|password|secret|token|bearer|private key|connection string)\b/i.test(query);
}

function isPublicDocsPage(pageUrl?: string): boolean {
  const path = pagePathForLog(pageUrl) || '';
  return path.startsWith('/docs') || path.startsWith('/reference');
}

function isCacheablePublicAnswer(input: {
  rawQuery: string;
  ragQuery: string;
  messages: ChatRequest['messages'];
  pageContext?: string;
  pageUrl?: string;
  confidence: string;
  deflected: boolean;
  selfDescribed: boolean;
  fullText: string;
  eventBytes: number;
}): boolean {
  if (!ANSWER_EXACT_CACHE_ENABLED) return false;
  if (input.confidence === 'low') return false;
  if (input.deflected || input.selfDescribed) return false;
  if (!input.fullText.trim()) return false;
  if (input.pageContext && input.pageContext.trim().length > 0 && !isPublicDocsPage(input.pageUrl)) return false;
  if (input.eventBytes > ANSWER_EXACT_CACHE_MAX_EVENT_BYTES) return false;
  if (isLikelyUserSpecificQuery(input.rawQuery) || isLikelyUserSpecificQuery(input.ragQuery)) return false;
  if (input.messages.length > 1 && input.rawQuery.trim().length < 80) return false;
  if (normalizeQuery(input.ragQuery).length < 8) return false;
  return true;
}

export const app = new Hono();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PORT = Number(process.env.PORT) || 8787;
const ALLOWED_ORIGINS = [
  ...(process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(s => s.trim()),
  ...(process.env.DEV_SERVER ? [process.env.DEV_SERVER.trim()] : []),
].filter((v, i, a) => a.indexOf(v) === i); // deduplicate
// Hono's cors middleware treats the string "*" as a wildcard, but an array
// containing "*" does NOT match every origin (it checks includes()). Pass the
// string wildcard through so CORS works as expected when configured broadly.
const CORS_ORIGIN = ALLOWED_ORIGINS.length === 1 && ALLOWED_ORIGINS[0] === '*' ? '*' : ALLOWED_ORIGINS;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const REQUEST_ID_RE = /^[a-zA-Z0-9._:-]{1,128}$/;

function getRequestId(c: Context): string {
  const raw = c.req.header('x-request-id')?.trim();
  return raw && REQUEST_ID_RE.test(raw) ? raw : randomUUID();
}

function requestIdHeaders(requestId: string): Record<string, string> {
  return {'X-Request-ID': requestId};
}

function pagePathForLog(pageUrl?: string): string | undefined {
  if (!pageUrl) return undefined;
  try {
    const url = new URL(pageUrl, 'http://local');
    return url.pathname;
  } catch {
    return pageUrl.split(/[?#]/, 1)[0]?.slice(0, 200);
  }
}

// ---------------------------------------------------------------------------
// Rate limiter (in-memory, per IP)
// ---------------------------------------------------------------------------

const rateLimitMap = new Map<string, {count: number; resetAt: number}>();

// ---------------------------------------------------------------------------
// Traffic source attribution (X-Traffic-Source header)
// ---------------------------------------------------------------------------

const SOURCE_RE = /^[a-z0-9-]{1,32}$/i;

function parseSource(c: Context): string {
  const raw = c.req.header('x-traffic-source')?.trim();
  return raw && SOURCE_RE.test(raw) ? raw.toLowerCase() : 'docs';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, {count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS});
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function isPrivateIp(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length === 4) {
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 127) return true;
  }
  return ip === '::1' || ip.startsWith('fc00:') || ip.startsWith('fe80:');
}

export function getClientIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map(s => s.trim()).filter(Boolean);
    for (const ip of ips) {
      if (!isPrivateIp(ip)) {
        return ip;
      }
    }
    return ips[0] || 'unknown';
  }
  return c.req.header('x-real-ip') || 'unknown';
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now >= entry.resetAt) rateLimitMap.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS);

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

app.use(
  '/search',
  cors({
    origin: CORS_ORIGIN,
    allowMethods: ['GET', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
);

app.use(
  '/chat',
  cors({
    origin: CORS_ORIGIN,
    allowMethods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Request-ID', 'X-Traffic-Source'],
    exposeHeaders: ['X-Request-ID'],
  }),
);

app.use(
  '/feedback',
  cors({
    origin: CORS_ORIGIN,
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
);

app.use(
  '/admin/*',
  cors({
    origin: CORS_ORIGIN,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(
  '/health/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'OPTIONS'],
  }),
);

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get('/health', async c => {
  const now = Date.now();
  const index = await getIndexStatus();
  const dbOk = isDbReady();

  // LLM is considered "ready" if we've had at least one successful call
  // and no errors in the last 5 minutes
  const llmReady = llmHealth.lastSuccessAt !== null &&
    (llmHealth.lastErrorAt === null || new Date(llmHealth.lastSuccessAt) > new Date(llmHealth.lastErrorAt));

  // Index freshness
  const indexAgeMs = index.lastRefreshed ? now - new Date(index.lastRefreshed).getTime() : null;

  return c.json({
    ok: dbOk && (index.ready || index.chunks === 0), // ok if DB is up; index may still be loading
    startedAt,
    uptime: Math.round((now - new Date(startedAt).getTime()) / 1000),
    db: {ready: dbOk},
    llm: {ready: llmReady},
    index: {
      ready: index.ready,
      chunks: index.chunks,
      lastRefreshed: index.lastRefreshed,
      ageMs: indexAgeMs,
      ageHuman: indexAgeMs !== null ? `${Math.round(indexAgeMs / 60000)}m` : null,
    },
  });
});

// ---------------------------------------------------------------------------
// Body size limit for /chat
// ---------------------------------------------------------------------------

const MAX_BODY_SIZE_BYTES = 1024 * 1024; // 1 MB

function bodySizeLimit(): MiddlewareHandler {
  return async (c, next) => {
    const requestId = getRequestId(c);
    const source = parseSource(c);
    const rejectLargeBody = (size?: number) => {
      logDebugFlow('chat.request.rejected', {requestId, source}, {
        status: 413,
        reason: 'body_too_large',
        size,
        maxSize: MAX_BODY_SIZE_BYTES,
      });
      return c.json({error: 'Request body too large'}, 413, requestIdHeaders(requestId));
    };
    const contentLength = c.req.header('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE_BYTES) {
      return rejectLargeBody(parseInt(contentLength, 10));
    }
    const cloned = c.req.raw.clone();
    const blob = await cloned.blob();
    if (blob.size > MAX_BODY_SIZE_BYTES) {
      return rejectLargeBody(blob.size);
    }
    return next();
  };
}

app.use('/chat', bodySizeLimit());

// ---------------------------------------------------------------------------
// GET /search — lightweight BM25 search for the search bar (no LLM)
// ---------------------------------------------------------------------------

app.get('/search', async c => {
  const q = c.req.query('q');
  if (!q || q.length < 2) return c.json({results: []});
  const section = c.req.query('section') || undefined;

  try {
    const results = await searchDocs(q, 8, section);
    return c.json({
      results: results.map(r => ({
        title: r.doc_title,
        url: r.doc_url,
        section: r.section,
        snippet: r.content.slice(0, 150).replace(/\n/g, ' '),
        score: r.score,
      })),
    });
  } catch {
    return c.json({results: []});
  }
});

// ---------------------------------------------------------------------------
// POST /chat — streaming SSE with agent routing
// ---------------------------------------------------------------------------

app.post('/chat', async c => {
  const requestId = getRequestId(c);
  const source = parseSource(c);
  let debugSessionId: string | undefined;
  let debugAgent: string | undefined;
  let debugModel: string | undefined;
  const debug = (event: string, data: Record<string, unknown> = {}) => {
    logDebugFlow(event, {requestId, sessionId: debugSessionId, source, agent: debugAgent, model: debugModel}, data);
  };
  debug('chat.request.received', {
    method: 'POST',
    path: '/chat',
    hasRequestIdHeader: Boolean(c.req.header('x-request-id')),
  });

  // Rate limit
  const ip = getClientIp(c);
  if (!checkRateLimit(ip)) {
    debug('chat.request.rejected', {status: 429, reason: 'rate_limit'});
    return c.json({error: 'Rate limit exceeded. Please try again in a minute.'}, 429, requestIdHeaders(requestId));
  }

  // Parse body
  let body: ChatRequest;
  try {
    body = await c.req.json<ChatRequest>();
  } catch {
    debug('chat.request.rejected', {status: 400, reason: 'invalid_json'});
    return c.json({error: 'Invalid JSON body'}, 400, requestIdHeaders(requestId));
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    debug('chat.request.rejected', {status: 400, reason: 'missing_messages'});
    return c.json({error: 'messages array is required and must not be empty'}, 400, requestIdHeaders(requestId));
  }

  const userId = body.userId || 'anonymous';

  // Extract user metadata for observability
  const userMeta: Record<string, unknown> = {};
  const ua = c.req.header('user-agent');
  if (ua) userMeta.user_agent = ua;
  if (ip && ip !== 'unknown') {
    userMeta.ip = ip;
    try {
      const { lookupGeo } = await import('./geoip.js');
      const geo = await lookupGeo(ip);
      if (geo) { userMeta.country = geo.country; userMeta.city = geo.city; }
    } catch {}
  }
  const referer = c.req.header('referer');
  if (referer) userMeta.referer = pagePathForLog(referer);
  const acceptLanguage = c.req.header('accept-language');
  if (acceptLanguage) userMeta.language = acceptLanguage;
  if (body.screenResolution) userMeta.screen_resolution = body.screenResolution;

  // Session management
  const {session, isNew} = getOrCreateSession(body.sessionId);
  debugSessionId = session.id;
  const windowedMessages = appendAndWindow(session, body.messages);

  // Relevance guard
  const lastUserMessage = [...body.messages].reverse().find(m => m.role === 'user');
  debug('chat.request.accepted', {
    messageCount: body.messages.length,
    hasClientSessionId: Boolean(body.sessionId),
    pagePath: pagePathForLog(body.pageUrl),
    pageContextChars: body.pageContext?.length ?? 0,
    lastUserMessage: lastUserMessage?.content,
  });
  debug('chat.session.resolved', {
    sessionId: session.id,
    isNew,
    windowedMessageCount: windowedMessages.length,
  });
  if (lastUserMessage) {
    const guardResult = checkGuard(lastUserMessage.content);
    debug('chat.guard.checked', {allowed: guardResult.allowed, reason: guardResult.reason});
    if (!guardResult.allowed) {
      console.log('[Guard] Blocked', JSON.stringify({reason: guardResult.reason, message: summarizeForDebugLog(lastUserMessage.content, 'message')}));
      incCounter('chat_proxy_requests_total', {agent: 'guard', model: 'none', status: guardResult.reason === 'injection' ? 'blocked_injection' : 'blocked_greeting'});
      logEvent(session.id, userId, 'message', 'guard', {
        requestId,
        blocked: true,
        reason: guardResult.reason,
        messageSummary: summarizeForDebugLog(lastUserMessage.content, 'message'),
      }, userMeta, source);

      return c.newResponse(
        new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            const send = (event: string, data: string) => {
              debug('chat.sse.event.sent', {sseEvent: event, payloadBytes: Buffer.byteLength(data, 'utf8')});
              controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
            };
            debug('chat.sse.opened', {guard: true});
            send('session', JSON.stringify({sessionId: session.id, requestId}));
            send('delta', JSON.stringify({text: guardResult.deflection}));
            send('done', JSON.stringify({stop_reason: 'guard'}));
            debug('chat.response.completed', {status: 'guard', stopReason: 'guard'});
            controller.close();
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            ...requestIdHeaders(requestId),
          },
        },
      );
    }
  }

  // Stream response via SSE — open the connection immediately so the
  // client sees activity while routing + RAG run in the background.
  const rawQuery = lastUserMessage?.content || '';
  // Enrich short follow-up queries with recent conversation context
  const isFollowUp = rawQuery.length < 40 && windowedMessages.length > 2;
  const ragQuery = isFollowUp
    ? windowedMessages.slice(-3).filter(m => m.role === 'user').map(m => m.content).join(' ')
    : rawQuery;

  const clientSignal = c.req.raw.signal;

  return c.newResponse(
    new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (event: string, data: string) => {
          debug('chat.sse.event.sent', {sseEvent: event, payloadBytes: Buffer.byteLength(data, 'utf8')});
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
        };
        const replayCachedEvents = async (events: SseEventRecord[], cacheType: string) => {
          const doneEvent = [...events].reverse().find(evt => evt.event === 'done');
          let simulatedDelayMs = 0;
          let firstDeltaSent = false;
          const shouldStream = CACHE_REPLAY_STREAM_ENABLED && !clientSignal?.aborted;

          for (const evt of events) {
            if (evt.event === 'done' || evt.event === 'timing' || evt.event === 'usage' || evt.event === 'status' || evt.event === 'tool-call') continue;

            if (shouldStream && evt.event === 'delta') {
              const delay = firstDeltaSent ? CACHE_REPLAY_DELTA_DELAY_MS : CACHE_REPLAY_INITIAL_DELAY_MS;
              const remainingDelay = CACHE_REPLAY_MAX_TOTAL_DELAY_MS - simulatedDelayMs;
              const appliedDelay = Math.max(0, Math.min(delay, remainingDelay));
              if (appliedDelay > 0) {
                await sleep(appliedDelay);
                simulatedDelayMs += appliedDelay;
              }
              firstDeltaSent = true;
            }

            if (clientSignal?.aborted) return;
            send(evt.event, evt.data);
          }
          send('timing', JSON.stringify({cache: cacheType, replay: shouldStream ? 'stream' : 'instant', simulatedDelayMs, total: Date.now() - tChatStart}));
          send(doneEvent?.event || 'done', doneEvent?.data || JSON.stringify({stop_reason: 'cache'}));
        };

        debug('chat.sse.opened');
        // Emit session ID immediately so the client knows the connection is live
        send('session', JSON.stringify({sessionId: session.id, requestId}));
        send('status', JSON.stringify({phase: 'analyzing'}));

        // Check response cache for identical repeated queries
        const tChatStart = Date.now();
        const sectionFilter = deriveSectionFilter(body.pageUrl);
        const requestLanguage = getRequestLanguage(c);
        const responseCacheKey = buildSessionResponseCacheKey(session.id, ragQuery, sectionFilter, body.pageUrl, body.pageContext, requestLanguage);
        const exactAnswerCacheKey = buildExactAnswerCacheKey(ragQuery, sectionFilter, body.pageUrl, body.pageContext, requestLanguage);
        const cachedEvents = responseCacheGet(responseCacheKey);
        debug('chat.cache.checked', {layer: 'response_session', hit: Boolean(cachedEvents), eventCount: cachedEvents?.length ?? 0});
        if (cachedEvents) {
          console.log('[Cache] Response cache hit', JSON.stringify({requestId, query: summarizeForDebugLog(ragQuery, 'query')}));
          logEvent(session.id, userId, 'cache', 'response', {
            requestId,
            cacheType: 'response_session',
            eventCount: cachedEvents.length,
            questionSummary: summarizeForDebugLog(ragQuery, 'question'),
          }, userMeta, source);
          incCounter('chat_proxy_cache_hits_total', {type: 'response_session'});
          send('cache', JSON.stringify({type: 'session'}));
          await replayCachedEvents(cachedEvents, 'session');
          debug('chat.response.completed', {status: 'response_cache_hit', totalDurationMs: Date.now() - tChatStart});
          controller.close();
          return;
        }
        incCounter('chat_proxy_cache_misses_total', {type: 'response_session'});

        const exactCachedEvents = ANSWER_EXACT_CACHE_ENABLED ? exactAnswerCache.get(exactAnswerCacheKey) : undefined;
        debug('chat.cache.checked', {layer: 'answer_exact', enabled: ANSWER_EXACT_CACHE_ENABLED, hit: Boolean(exactCachedEvents), eventCount: exactCachedEvents?.length ?? 0});
        if (exactCachedEvents) {
          console.log('[Cache] Exact answer cache hit', JSON.stringify({requestId, query: summarizeForDebugLog(ragQuery, 'query')}));
          logEvent(session.id, userId, 'cache', 'answer_exact', {
            requestId,
            cacheType: 'answer_exact',
            eventCount: exactCachedEvents.length,
            questionSummary: summarizeForDebugLog(ragQuery, 'question'),
          }, userMeta, source);
          incCounter('chat_proxy_cache_hits_total', {type: 'answer_exact'});
          send('cache', JSON.stringify({type: 'exact'}));
          await replayCachedEvents(exactCachedEvents, 'exact');
          responseCacheSetForSession(session.id, responseCacheKey, exactCachedEvents);
          debug('chat.response.completed', {status: 'answer_exact_cache_hit', totalDurationMs: Date.now() - tChatStart});
          controller.close();
          return;
        }
        incCounter('chat_proxy_cache_misses_total', {type: 'answer_exact'});

        let inflightEntry: ReturnType<typeof createDeferred<SseEventRecord[]>> | undefined;
        let ownsInflight = false;
        const allowAnswerInflight = ANSWER_INFLIGHT_ENABLED && ANSWER_EXACT_CACHE_ENABLED && !body.pageContext && !isLikelyUserSpecificQuery(rawQuery) && !isLikelyUserSpecificQuery(ragQuery);
        const resolveOwnedInflight = (events: SseEventRecord[]) => {
          if (!ownsInflight || !inflightEntry) return;
          inflightEntry.resolve(events);
          if (answerInflight.get(exactAnswerCacheKey) === inflightEntry) {
            answerInflight.delete(exactAnswerCacheKey);
          }
        };
        if (allowAnswerInflight) {
          inflightEntry = answerInflight.get(exactAnswerCacheKey);
          if (inflightEntry) {
            incCounter('chat_proxy_cache_hits_total', {type: 'answer_inflight'});
            debug('chat.cache.checked', {layer: 'answer_inflight', hit: true});
            try {
              const events = await withTimeout(inflightEntry.promise, ANSWER_INFLIGHT_WAIT_MS, []);
              if (events.length > 0) {
                send('cache', JSON.stringify({type: 'inflight'}));
                await replayCachedEvents(events, 'inflight');
                responseCacheSetForSession(session.id, responseCacheKey, events);
                debug('chat.response.completed', {status: 'answer_inflight_replay', totalDurationMs: Date.now() - tChatStart});
                controller.close();
                return;
              }
              debug('chat.cache.checked', {layer: 'answer_inflight', hit: false, reason: 'empty_or_timeout'});
            } catch { /* fall through to normal generation */ }
            inflightEntry = createDeferred<SseEventRecord[]>();
            answerInflight.set(exactAnswerCacheKey, inflightEntry);
            ownsInflight = true;
          } else {
            incCounter('chat_proxy_cache_misses_total', {type: 'answer_inflight'});
            inflightEntry = createDeferred<SseEventRecord[]>();
            answerInflight.set(exactAnswerCacheKey, inflightEntry);
            ownsInflight = true;
          }
        }

        // Kick off embedding and routing concurrently. We only block on the
        // embedding for semantic-cache lookup; RAG tools consume it opportunistically
        // and fall back to FTS-only if it is not ready within their small budget.
        const tEmbedStart = Date.now();
        const semanticCacheEnabled = isSemanticCacheEnabled();
        const embeddingEnabled = semanticCacheEnabled || QUERY_EMBEDDING_ENABLED;
        const embeddingPromise = embeddingEnabled
          ? computeEmbedding(ragQuery).catch((err: Error) => {
            console.warn('[Embedding] Failed to compute query embedding', JSON.stringify({requestId, error: summarizeForDebugLog(err.message, 'error')}));
            return null;
          })
          : Promise.resolve(null);

        const routePromise = routeIntent(ragQuery, body.messages, session.id, requestId).catch(() =>
          ({agent: 'general' as const, topics: [] as string[], reasoning: 'Router fallback'}),
        );

        // Check semantic cache for similar queries across sessions. Keep this
        // best-effort so cache lookup never blocks routing/model generation.
        let semanticHit: SemanticCacheHit | null = null;
        let queryEmbedding: number[] | null = null;
        let tEmbed = 0;
        if (semanticCacheEnabled) {
          const maybeEmbedding = await withTimeout(embeddingPromise, EMBEDDING_BUDGET_MS, null);
          tEmbed = Date.now() - tEmbedStart;
          if (maybeEmbedding) {
            queryEmbedding = maybeEmbedding;
            const lookupStart = Date.now();
            semanticHit = await withTimeout(
              semanticCacheLookup(ragQuery, sectionFilter, queryEmbedding, requestId).catch((err) => {
                console.warn('[SemanticCache] Lookup failed', JSON.stringify({requestId, error: summarizeForDebugLog(err instanceof Error ? err.message : String(err), 'error')}));
                return null;
              }),
              SEMANTIC_CACHE_LOOKUP_BUDGET_MS,
              null,
            );
            debug('chat.cache.lookup.completed', {layer: 'semantic', durationMs: Date.now() - lookupStart, hit: Boolean(semanticHit)});
          }
        } else {
          tEmbed = 0;
        }
        debug('chat.embedding.completed', {durationMs: tEmbed, enabled: embeddingEnabled, waitedForCache: semanticCacheEnabled, hasEmbedding: Boolean(queryEmbedding), timedOut: semanticCacheEnabled && !queryEmbedding && tEmbed >= EMBEDDING_BUDGET_MS});
        debug('chat.cache.checked', {layer: 'semantic', enabled: semanticCacheEnabled, hit: Boolean(semanticHit), similarity: semanticHit?.similarity});
        if (semanticHit) {
          const semanticEvents = JSON.parse(semanticHit.entry.sse_events) as SseEventRecord[];
          console.log('[SemanticCache] Replay cached response', JSON.stringify({requestId, query: summarizeForDebugLog(ragQuery, 'query')}));
          logEvent(session.id, userId, 'cache', 'semantic', {
            requestId,
            cacheType: 'semantic',
            similarity: semanticHit.similarity,
            questionSummary: summarizeForDebugLog(ragQuery, 'question'),
          }, userMeta, source);
          incCounter('chat_proxy_cache_hits_total', {type: 'semantic'});
          send('cache', JSON.stringify({type: 'semantic', similarity: semanticHit.similarity}));
          await replayCachedEvents(semanticEvents, 'semantic');
          responseCacheSetForSession(session.id, responseCacheKey, semanticEvents);
          resolveOwnedInflight(semanticEvents);
          debug('chat.response.completed', {status: 'semantic_cache_hit', similarity: semanticHit.similarity, totalDurationMs: Date.now() - tChatStart});
          controller.close();
          return;
        }
        incCounter('chat_proxy_cache_misses_total', {type: 'semantic'});
        send('status', JSON.stringify({phase: 'routing'}));

        // Track events for caching on successful response
        const recordedEvents: SseEventRecord[] = [];
        const sendAndRecord = (event: string, data: string) => {
          send(event, data);
          recordedEvents.push({event, data});
        };

        let currentAgent = 'unknown';
        let currentModel = 'unknown';

        try {
          console.log(`[Section] pageUrl=${pagePathForLog(body.pageUrl) || 'none'} filter=${sectionFilter || 'none'}`);
          const tRouteStart = Date.now();
          const routeResult = await routePromise;
          const tRoute = Date.now() - tRouteStart;
          debug('chat.router.completed', {
            durationMs: tRoute,
            agent: routeResult.agent,
            topicCount: routeResult.topics?.length ?? 0,
            reasoning: routeResult.reasoning,
          });

          sendAndRecord('status', JSON.stringify({phase: 'retrieving'}));
          const agentConfig = getAgent(routeResult.agent as any);
          currentAgent = agentConfig.type;
          debugAgent = agentConfig.type;
          const agentTools = createCompactToolsForModel(getToolsForAgent(agentConfig.toolNames, {
            sectionFilter,
            queryEmbedding,
            queryEmbeddingPromise: embeddingEnabled ? embeddingPromise : undefined,
            queryEmbeddingBudgetMs: TOOL_EMBEDDING_BUDGET_MS,
          }));

          // Resolve model from runtime config (DB override → env var → default)
          const resolvedModel = await resolveModel(`agent:${agentConfig.type}`);
          const chatModelResolved = getChatModelForStream(resolvedModel);
          const activeModel = chatModelResolved.model;
          currentModel = activeModel;
          debugModel = activeModel;
          debug('chat.model.resolved', {
            provider: chatModelResolved.provider,
            model: activeModel,
            mappedFrom: resolvedModel.model,
            mappedTo: chatModelResolved.model,
          });
          if (chatModelResolved.model !== resolvedModel.model) {
            console.log(`[Model] Mapped reasoning model ${resolvedModel.model} → ${chatModelResolved.model} for streaming`);
          }

          logEvent(session.id, userId, 'routing', routeResult.agent, {
            requestId,
            reasoningSummary: summarizeForDebugLog(routeResult.reasoning, 'reasoning'),
            topics: routeResult.topics,
            model: activeModel,
            messageSummary: summarizeForDebugLog(rawQuery, 'message'),
          }, userMeta, source);

          // Log the user message for session reconstruction
          if (lastUserMessage) {
            logEvent(session.id, userId, 'message', agentConfig.type, {
              requestId,
              role: 'user',
              rawContent: lastUserMessage.content,
              contentSummary: summarizeForDebugLog(lastUserMessage.content, 'content'),
              questionSummary: summarizeForDebugLog(ragQuery, 'question'),
            }, userMeta, source);
          }

          // Emit agent info (including model for observability)
          sendAndRecord('agent', JSON.stringify({
            type: agentConfig.type,
            name: agentConfig.name,
            model: activeModel,
          }));

          // Build system prompt: base + agent role + topic prompts + RAG context
          let systemPrompt = getBasePrompt() + '\n\n' + agentConfig.systemPrompt;

          // Inject topic-specific prompts (max 2 to stay within context limits)
          const topics = routeResult.topics || [];
          for (const topic of topics.slice(0, 2)) {
            const topicContent = getTopicPrompt(topic);
            if (topicContent) {
              systemPrompt += `\n\n## Topic Reference: ${topic}\n${topicContent}`;
            }
          }

          const pageContextIncluded = Boolean(body.pageContext && shouldInjectPageContext(session, body.pageUrl));
          if (pageContextIncluded) {
            systemPrompt += `\n\n## Current Page Content (HIGHEST PRIORITY)\nThe user is currently viewing the page below. When their question relates to this page, answer from this content FIRST before using other sources.\n\n${body.pageContext!.slice(0, PAGE_CONTEXT_MAX_CHARS)}`;
          }

          // Evaluate pre-prompt hooks (confidence not yet known)
          const preCtx = {message: ragQuery, agentType: routeResult.agent as AgentType};
          const injections = evaluatePrePrompt(getRules(), preCtx);
          if (injections.length > 0) {
            systemPrompt += '\n\n## Additional Instructions\n' + injections.join('\n\n');
          }
          debug('chat.prompt.built', {
            systemPrompt: systemPrompt,
            topicPromptCount: topics.slice(0, 2).length,
            pageContextIncluded,
            preHookCount: injections.length,
            toolNames: agentConfig.toolNames,
          });

          const tLlmStart = Date.now();
          const modelInstance = await createModelInstance(chatModelResolved);
          const toolsCalled: string[] = [];
          const toolSources: {title: string; url: string; score?: number; section?: string}[] = [];
          const toolChunks: ToolChunk[] = [];
          const toolResultSummaries: string[] = [];
          let draftText = '';
          let fullText = '';
          let groundedSourceCount = 0;
          let deltaCount = 0;
          type StreamTextCallResult = ReturnType<typeof streamText>;
          let result: StreamTextCallResult | null = null;
          const finalResultRef: {current: StreamTextCallResult | null} = {current: null};
          let finalSynthesisFailed = false;

          const runFinalSynthesis = async () => {
            try {
              const contextParts = toolResultSummaries.length > 0
                ? toolResultSummaries
                : toolChunks.map((tc, i) => `Source ${i + 1} — ${tc.doc_title}${tc.section ? ' (' + tc.section + ')' : ''}:\n${tc.content.slice(0, 4000)}`);
              const context = contextParts.join('\n\n---\n\n') || 'No tool results were returned. Use the agent instructions, page context, and general Zilliz Cloud documentation knowledge; be explicit if the collected context is weak.';
              const draft = draftText ? `\n\nDraft text from tool collection phase (may be incomplete):\n${truncateText(draftText, 3000)}` : '';
              debug('chat.final_synthesis.started', {
                toolCount: toolsCalled.length,
                toolSummaryCount: toolResultSummaries.length,
                chunkCount: toolChunks.length,
                hadDraftText: Boolean(draftText),
                timeoutMs: FINAL_SYNTHESIS_TIMEOUT_MS,
              });
              finalResultRef.current = streamText({
                model: modelInstance,
                maxRetries: bedrockAiSdkMaxRetries(chatModelResolved.provider),
                system: `${systemPrompt}\n\n## Final synthesis mode\nYou are in the final answer phase. Tool use is disabled. You MUST answer the user directly using the provided collected context, current page context, and agent instructions. If the context is weak, still provide the best safe answer and mention what to verify. Be concise by default.`,
                messages: [
                  {role: 'user', content: `User question:\n${ragQuery}\n\nCollected context from tools:\n${context}${draft}\n\nWrite the final answer now. Include concise steps and code if relevant. Keep the answer under 700 words unless the user explicitly asks for more detail.`},
                ],
                maxOutputTokens: FINAL_SYNTHESIS_MAX_OUTPUT_TOKENS,
                temperature: 0.2,
                abortSignal: AbortSignal.timeout(FINAL_SYNTHESIS_TIMEOUT_MS),
                experimental_telemetry: makeTelemetry('chat-final-synthesis', {
                  agentType: agentConfig.type,
                  sessionId: session.id,
                  requestId,
                  model: activeModel,
                }),
              });
              for await (const part of finalResultRef.current.fullStream) {
                if (part.type === 'error') {
                  finalSynthesisFailed = true;
                  throw new Error((part as any).error || 'Final synthesis stream error');
                }
                if (part.type === 'text-delta') {
                  fullText += part.text;
                  deltaCount++;
                  sendAndRecord('delta', JSON.stringify({text: part.text}));
                } else if (process.env.DEBUG_STREAM === 'true') {
                  console.log('[final-stream] unhandled part', JSON.stringify({type: (part as any).type, part: summarizeForDebugLog(part)}));
                }
              }
              console.log(`[FinalSynthesis] streamed ${fullText.length} chars from ${toolResultSummaries.length} tool summaries and ${toolChunks.length} chunks`);
            } catch (err) {
              finalSynthesisFailed = true;
              console.error('[FinalSynthesis] streamText failed', JSON.stringify({requestId, error: summarizeForDebugLog(err instanceof Error ? err.message : String(err), 'error')}));
            }
          };

          const toollessRag = shouldUseToollessRag(agentConfig.type);
          let toollessRagAttempted = toollessRag;
          let fastPath = !toollessRag && shouldUseFastPath(agentConfig.type);
          const fastPathMaxToolRounds = getFastPathMaxToolRounds(agentConfig.type);

          if (toollessRag) {
            const tRagStart = Date.now();
            toolsCalled.push('searchDocs');
            incCounter('chat_proxy_tool_calls_total', {tool: 'searchDocs', mode: 'server_rag'});
            debug('chat.server_rag.started', {
              agent: agentConfig.type,
              topK: TOOLLESS_RAG_TOP_K,
              hasEmbedding: Boolean(queryEmbedding),
              timeoutMs: TOOLLESS_RAG_TIMEOUT_MS,
            });

            const maybeEmbedding = queryEmbedding ?? await withTimeout(embeddingEnabled ? embeddingPromise : Promise.resolve(null), TOOL_EMBEDDING_BUDGET_MS, null);
            const {results: ragResults, queries: ragQueries} = await searchDocsServerRag(
              ragQuery,
              agentConfig.type as AgentType,
              topics,
              TOOLLESS_RAG_TOP_K,
              sectionFilter,
              maybeEmbedding,
            );
            for (const r of ragResults) {
              toolSources.push({title: r.doc_title || '', url: r.doc_url, score: r.score, section: r.section});
              toolChunks.push({
                id: r.id,
                doc_url: r.doc_url,
                doc_title: r.doc_title || '',
                section: r.section || '',
                content: truncateText(r.content, TOOL_MODEL_OUTPUT_MAX_CHARS),
              });
            }
            toolResultSummaries.push(formatToolResultForSynthesis('searchDocs', {
              results: ragResults.map(r => ({
                id: r.id,
                title: r.doc_title,
                url: r.doc_url,
                section: r.section,
                content: truncateText(r.content, TOOL_MODEL_OUTPUT_MAX_CHARS),
                score: r.score,
              })),
              totalResults: ragResults.length,
            }));

            let codeExampleLookup = false;
            if (agentConfig.type === 'code') {
              codeExampleLookup = await runCodeExampleLookup(ragQuery, sectionFilter, toolSources, toolChunks, toolResultSummaries);
              if (codeExampleLookup) toolsCalled.push('getCodeExample');
            }

            if (ragResults.length >= TOOLLESS_RAG_MIN_RESULTS || toolChunks.length > 0) {
              sendAndRecord('status', JSON.stringify({phase: 'generating'}));
              debug('chat.server_rag.completed', {
                durationMs: Date.now() - tRagStart,
                resultCount: ragResults.length,
                sourceCount: toolSources.length,
                queryCount: ragQueries.length,
                queries: ragQueries,
                codeExampleLookup,
              });
              debug('chat.provider.stream.started', {
                phase: 'toolless_rag',
                agent: agentConfig.type,
                model: activeModel,
                contextChars: buildToollessRagContext(toolChunks, toolResultSummaries).length,
                maxOutputTokens: TOOLLESS_RAG_MAX_OUTPUT_TOKENS,
                timeoutMs: TOOLLESS_RAG_TIMEOUT_MS,
              });
              result = streamText({
                model: modelInstance,
                maxRetries: bedrockAiSdkMaxRetries(chatModelResolved.provider),
                maxOutputTokens: TOOLLESS_RAG_MAX_OUTPUT_TOKENS,
                temperature: 0.2,
                system: `${systemPrompt}\n\n## Server-side RAG mode\nThe server already retrieved relevant documentation and this satisfies any mandatory searchDocs/search-first instruction. Do not mention tool calls. Use only the provided retrieved context plus current page context. Cite source titles/URLs naturally only when helpful; the server will attach source metadata separately.`,
                messages: [
                  ...windowedMessages.slice(0, -1).map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                  })),
                  {role: 'user' as const, content: buildToollessRagPrompt(ragQuery, buildToollessRagContext(toolChunks, toolResultSummaries))},
                ],
                abortSignal: AbortSignal.timeout(TOOLLESS_RAG_TIMEOUT_MS),
                experimental_telemetry: makeTelemetry('chat-toolless-rag', {
                  agentType: agentConfig.type,
                  sessionId: session.id,
                  requestId,
                  model: activeModel,
                }),
              });

              for await (const part of result.fullStream) {
                if (part.type === 'error') {
                  throw new Error((part as any).error || 'LLM stream error');
                }
                if (part.type === 'text-delta') {
                  fullText += part.text;
                  deltaCount++;
                  sendAndRecord('delta', JSON.stringify({text: part.text}));
                } else if (process.env.DEBUG_STREAM === 'true') {
                  console.log('[toolless-rag-stream] unhandled part', JSON.stringify({type: (part as any).type, part: summarizeForDebugLog(part)}));
                }
              }
            } else {
              toolsCalled.pop();
              toolResultSummaries.length = 0;
              toollessRagAttempted = false;
              fastPath = shouldUseFastPath(agentConfig.type);
              debug('chat.server_rag.fallback', {reason: 'insufficient_results', resultCount: ragResults.length});
            }
          }

          if (!fullText && fastPath) {
            sendAndRecord('status', JSON.stringify({phase: 'generating'}));
            debug('chat.provider.stream.started', {
              phase: 'direct',
              agent: agentConfig.type,
              model: activeModel,
              toolCount: Object.keys(agentTools).length,
              maxOutputTokens: FAST_PATH_MAX_OUTPUT_TOKENS,
              maxToolRounds: fastPathMaxToolRounds,
              timeoutMs: FAST_PATH_TIMEOUT_MS,
            });
            result = streamText({
              model: modelInstance,
              maxRetries: bedrockAiSdkMaxRetries(chatModelResolved.provider),
              maxOutputTokens: FAST_PATH_MAX_OUTPUT_TOKENS,
              temperature: 0.2,
              tools: agentTools,
              toolChoice: buildToolChoiceForStep(agentConfig.type, 0, agentConfig.toolNames),
              activeTools: buildActiveToolsForStep(agentConfig.type, 0, agentConfig.toolNames),
              stopWhen: stepCountIs(fastPathMaxToolRounds + 1),
              abortSignal: AbortSignal.timeout(FAST_PATH_TIMEOUT_MS),
              prepareStep: ({stepNumber}) => {
                if (stepNumber >= fastPathMaxToolRounds) {
                  return {
                    activeTools: [],
                    toolChoice: 'none' as const,
                  };
                }
                const activeTools = buildActiveToolsForStep(agentConfig.type, stepNumber, agentConfig.toolNames);
                return {
                  activeTools,
                  toolChoice: buildToolChoiceForStep(agentConfig.type, stepNumber, activeTools),
                };
              },
              system: `${systemPrompt}\n\n## Answering mode\nUse the required documentation tool call(s) first, then answer the user directly in this same response. Prefer one searchDocs call. Do not call getPageContent unless snippets are clearly insufficient. Keep the answer concise and grounded in the collected tool context.`,
              messages: windowedMessages.map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
              })),
              experimental_telemetry: makeTelemetry('chat-direct', {
                agentType: agentConfig.type,
                sessionId: session.id,
                requestId,
                model: activeModel,
              }),
            });

            for await (const part of result.fullStream) {
              if (part.type === 'error') {
                throw new Error((part as any).error || 'LLM stream error');
              }
              if (part.type === 'text-delta') {
                fullText += part.text;
                deltaCount++;
                sendAndRecord('delta', JSON.stringify({text: part.text}));
              } else if (part.type === 'tool-call') {
                toolsCalled.push(part.toolName);
                const toolArgs = (part as any).input ?? (part as any).args;
                debug('chat.tool.call', {
                  tool: part.toolName,
                  callIndex: toolsCalled.length,
                  argKeys: toolArgs && typeof toolArgs === 'object' ? Object.keys(toolArgs) : [],
                  args: toolArgs,
                });
                incCounter('chat_proxy_tool_calls_total', {tool: part.toolName});
                sendAndRecord('tool-call', JSON.stringify({tool: part.toolName, count: toolsCalled.length}));
                logEvent(session.id, userId, 'tool_call', agentConfig.type, {
                  requestId,
                  tool: part.toolName,
                  argsSummary: summarizeForDebugLog(toolArgs),
                }, userMeta, source);
              } else if ((part as any).type === 'tool-result') {
                const rawToolResult = (part as any).output as Record<string, any>;
                const toolResult = ingestToolResult((part as any).toolName || toolsCalled[toolsCalled.length - 1] || 'unknown', rawToolResult, toolSources, toolChunks, toolResultSummaries, false);
                if (toolResult?.url && toolResult?.success) {
                  const titleFromIndex = await getTitleByUrl(toolResult.url);
                  const pageTitle = toolResult.title || titleFromIndex || toolResult.url;
                  toolSources.push({title: pageTitle, url: toolResult.url});
                  if (toolResult.content) toolChunks.push({
                    doc_url: toolResult.url,
                    doc_title: pageTitle,
                    section: '',
                    content: toolResult.content,
                  });
                }
                debug('chat.tool.result', {
                  resultCount: Array.isArray(toolResult?.results) ? toolResult.results.length : undefined,
                  sourceCount: toolSources.length,
                  content: toolResult,
                });
              } else if (process.env.DEBUG_STREAM === 'true') {
                console.log('[stream] unhandled part', JSON.stringify({type: (part as any).type, part: summarizeForDebugLog(part)}));
              }
            }

            if (!fullText) {
              await runFinalSynthesis();
            }
          }

          if (!fullText && !toollessRagAttempted && !fastPath) {
          debug('chat.provider.stream.started', {
            phase: 'tool_collection',
            agent: agentConfig.type,
            model: activeModel,
            toolCount: Object.keys(agentTools).length,
            maxOutputTokens: 1024,
            maxSteps: TOOL_COLLECTION_MAX_STEPS,
            timeoutMs: TOOL_COLLECTION_TIMEOUT_MS,
          });
          result = streamText({
            model: modelInstance,
            maxRetries: bedrockAiSdkMaxRetries(chatModelResolved.provider),
            maxOutputTokens: 1024,
            temperature: 0.2,
            tools: agentTools,
            toolChoice: buildToolChoiceForStep(agentConfig.type, 0, agentConfig.toolNames),
            activeTools: buildActiveToolsForStep(agentConfig.type, 0, agentConfig.toolNames),
            stopWhen: stepCountIs(TOOL_COLLECTION_MAX_STEPS),
            abortSignal: AbortSignal.timeout(TOOL_COLLECTION_TIMEOUT_MS),
            prepareStep: ({stepNumber}) => {
              const activeTools = buildActiveToolsForStep(agentConfig.type, stepNumber, agentConfig.toolNames);
              return {
                activeTools,
                toolChoice: buildToolChoiceForStep(agentConfig.type, stepNumber, activeTools),
              };
            },
            system: `${systemPrompt}\n\n## Tool collection phase\nUse tools only to collect the minimum documentation needed. Do not try to provide the final answer in this phase; the server will run a separate final synthesis phase without tools. Prefer at most one searchDocs call and one content/code lookup.`,
            messages: windowedMessages.map(m => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
            experimental_telemetry: makeTelemetry('chat-tool-collection', {
              agentType: agentConfig.type,
              sessionId: session.id,
              requestId,
              model: activeModel,
            }),
          });

          for await (const part of result.fullStream) {
            if (part.type === 'error') {
              throw new Error((part as any).error || 'LLM stream error');
            }
            if (part.type === 'text-delta') {
              // Tool collection is not the user-visible final answer. Keep any
              // provider text as draft context only; final synthesis streams the
              // actual assistant answer.
              draftText += part.text;
            } else if (part.type === 'tool-call') {
              toolsCalled.push(part.toolName);
              const toolArgs = (part as any).input ?? (part as any).args;
              debug('chat.tool.call', {
                tool: part.toolName,
                callIndex: toolsCalled.length,
                argKeys: toolArgs && typeof toolArgs === 'object' ? Object.keys(toolArgs) : [],
                args: toolArgs,
              });
              incCounter('chat_proxy_tool_calls_total', {tool: part.toolName});
              sendAndRecord('tool-call', JSON.stringify({tool: part.toolName, count: toolsCalled.length}));
              logEvent(session.id, userId, 'tool_call', agentConfig.type, {
                requestId,
                tool: part.toolName,
                argsSummary: summarizeForDebugLog(toolArgs),
              }, userMeta, source);
            } else if ((part as any).type === 'tool-result') {
              // Extract sources from any tool that returns doc URLs
              // AI SDK v6 fullStream uses .output for tool-result events
              const rawToolResult = (part as any).output as Record<string, any>;
              const toolResult = ingestToolResult((part as any).toolName || toolsCalled[toolsCalled.length - 1] || 'unknown', rawToolResult, toolSources, toolChunks, toolResultSummaries, false);
              if (toolResult?.url && toolResult?.success) {
                // getPageContent returns { url, success, content } — look up real title from index
                const titleFromIndex = await getTitleByUrl(toolResult.url);
                const pageTitle = toolResult.title || titleFromIndex || toolResult.url;
                toolSources.push({title: pageTitle, url: toolResult.url});
                if (toolResult.content) toolChunks.push({
                  doc_url: toolResult.url,
                  doc_title: pageTitle,
                  section: '',
                  content: toolResult.content,
                });
              }
              debug('chat.tool.result', {
                resultCount: Array.isArray(toolResult?.results) ? toolResult.results.length : undefined,
                sourceCount: toolSources.length,
                content: toolResult,
              });
            } else if (process.env.DEBUG_STREAM === 'true') {
              console.log('[stream] unhandled part', JSON.stringify({type: (part as any).type, part: summarizeForDebugLog(part)}));
            }
          }

            sendAndRecord('status', JSON.stringify({phase: 'generating'}));
            await runFinalSynthesis();
          }

          if (finalSynthesisFailed && fullText) {
            throw new Error('Final synthesis failed after partial output');
          }

          if (!fullText) {
            fullText = buildNoResponseFallback(ragQuery, toolChunks, toolSources);
            deltaCount++;
            sendAndRecord('delta', JSON.stringify({text: fullText}));
            console.warn('[Fallback] emitted deterministic no-response fallback', JSON.stringify({requestId, toolsCalled: toolsCalled.length, toolChunks: toolChunks.length}));
          }

          // Stream completed successfully — mark LLM health as good
          recordLlmSuccess();

          // Capture total token usage across all LLM steps (important with tool calls)
          let tokenUsage: TokenUsage | null = null;
          try {
            const toolUsage = result ? await Promise.resolve(result.totalUsage).catch(() => null) : null;
            const finalUsage = finalResultRef.current ? await Promise.resolve(finalResultRef.current.totalUsage).catch(() => null) : null;
            const inputTokens = (toolUsage?.inputTokens ?? 0) + (finalUsage?.inputTokens ?? 0);
            const outputTokens = (toolUsage?.outputTokens ?? 0) + (finalUsage?.outputTokens ?? 0);
            const totalTokens = (toolUsage?.totalTokens ?? ((toolUsage?.inputTokens ?? 0) + (toolUsage?.outputTokens ?? 0))) +
              (finalUsage?.totalTokens ?? ((finalUsage?.inputTokens ?? 0) + (finalUsage?.outputTokens ?? 0)));
            const cachedInputTokens = (toolUsage?.cachedInputTokens ?? 0) + (finalUsage?.cachedInputTokens ?? 0);
            if (inputTokens > 0 || outputTokens > 0) {
              tokenUsage = {
                inputTokens,
                outputTokens,
                totalTokens,
                cachedInputTokens,
                model: activeModel,
                agentType: agentConfig.type,
              };
              incCounter('chat_proxy_token_usage_total', {model: activeModel, agent: agentConfig.type, type: 'input'}, inputTokens);
              incCounter('chat_proxy_token_usage_total', {model: activeModel, agent: agentConfig.type, type: 'output'}, outputTokens);
              incCounter('chat_proxy_token_usage_total', {model: activeModel, agent: agentConfig.type, type: 'total'}, totalTokens);
            }
          } catch (err) {
            console.warn('[Usage] Failed to read totalUsage', JSON.stringify({requestId, error: summarizeForDebugLog(err instanceof Error ? err.message : String(err), 'error')}));
          }
          debug('chat.provider.stream.completed', {
            durationMs: Date.now() - tLlmStart,
            deltaCount,
            assistantText: fullText,
            toolsCalled,
            tokenUsage,
          });

          // Deduplicate tool sources by URL
          const seenUrls = new Set<string>();
          const allSources: {title: string; url: string; score?: number; section?: string}[] = [];
          for (const src of toolSources) {
            if (!seenUrls.has(src.url)) {
              seenUrls.add(src.url);
              allSources.push({...src, section: inferSection(src.section, src.url)});
            }
          }

          const tLlm = Date.now() - tLlmStart;

          // Compute confidence (agentic mode — tool-based signals only)
          const confidenceResult = computeConfidence({
            toolsCalled,
            toolSources,
            fullText,
            pageContext: body.pageContext,
            pageUrl: pagePathForLog(body.pageUrl),
          });
          const confidence = confidenceResult.level;

          console.log(`[Confidence] score=${confidenceResult.score.toFixed(3)} level=${confidence}`,
            JSON.stringify(confidenceResult.breakdown));

          // Emit confidence
          sendAndRecord('confidence', JSON.stringify({
            level: confidence,
            retrieval_score: 0,
          }));

          // Atomic source attribution: IDF pre-filter → LLM re-rank
          const tGroundStart = Date.now();
          // Suppress sources on deflected/off-topic or self-description responses
          const deflected = isDeflection(fullText);
          const selfDescribed = isSelfDescription(fullText);
          if (deflected || selfDescribed) {
            console.log(`[Sources] Suppressed — ${deflected ? 'deflection' : 'self-description'} detected`);
          } else {
            // Build grounding chunks from tool results
            const allChunks = toolChunks.map(tc => ({
              id: '', doc_url: tc.doc_url, doc_url_md: tc.doc_url,
              doc_title: tc.doc_title, section: tc.section, content: tc.content,
              score: 0, weight: 1.0, contextScore: 0,
            }));

            // Pre-LLM section filter: exclude sources the LLM shouldn't even consider
            let filteredCandidates = allSources;
            if (sectionFilter) {
              const excludeMatch = sectionFilter.match(/section\s*!=\s*"([^"]+)"/);
              if (excludeMatch) {
                const excluded = excludeMatch[1];
                filteredCandidates = allSources.filter(s =>
                  inferSection(s.section, s.url) !== excluded
                );
              }
            }

            const grounding = shouldUseLlmGrounding(agentConfig.type, filteredCandidates.length, fullText.length)
              ? await groundAtomically(fullText, filteredCandidates, allChunks, requestId)
              : computeGrounding(fullText, allChunks, filteredCandidates);

            console.log(
              `[Sources] method=${grounding.method} Tools: ${toolSources.length}, Deduped: ${allSources.length}, Filtered: ${filteredCandidates.length}, Grounded: ${grounding.sources.length}`,
            );

            if (process.env.DEBUG_GROUNDING === 'true') {
              sendAndRecord('attribution_debug', JSON.stringify({
                method: grounding.method,
                candidateCount: filteredCandidates.length,
                selectedCount: grounding.sources.length,
              }));
            }

            // Always send sources - prefer over-attribution to under-attribution (industry standard)
            if (grounding.sources.length > 0) {
              groundedSourceCount = grounding.sources.length;
              // Grounding succeeded — send with paragraph-level citations
              sendAndRecord('sources', JSON.stringify({sources: grounding.sources}));
              sendAndRecord('grounding', JSON.stringify({citations: grounding.citations}));
            } else if (allSources.length > 0) {
              // Grounding found no matches, but tools retrieved relevant docs - show them as fallback
              console.log(`[Sources] Grounding returned empty, showing ${allSources.length} tool sources as fallback`);
              sendAndRecord('sources', JSON.stringify({
                sources: allSources.slice(0, MAX_FALLBACK_SOURCES),
              }));
            }
          }
          debug('chat.grounding.completed', {
            durationMs: Date.now() - tGroundStart,
            candidateCount: allSources.length,
            selectedCount: groundedSourceCount,
            deflected,
            selfDescribed,
          });

          // Evaluate post-response hooks (confidence now known)
          const postCtx = {message: ragQuery, agentType: agentConfig.type as AgentType, confidence};
          const appends = evaluatePostResponse(getRules(), postCtx);
          for (const text of appends) {
            sendAndRecord('hook-append', JSON.stringify({text: '\n\n' + text.trim()}));
          }

          // Emit token usage event before terminal done.
          if (tokenUsage) {
            sendAndRecord('usage', JSON.stringify({
              inputTokens: tokenUsage.inputTokens,
              outputTokens: tokenUsage.outputTokens,
              totalTokens: tokenUsage.totalTokens,
              cachedInputTokens: tokenUsage.cachedInputTokens,
              model: tokenUsage.model,
            }));
          }

          // Emit structured timing event so clients can observe per-request breakdown.
          const tGround = Date.now() - tGroundStart;
          const tTotal = Date.now() - tChatStart;
          sendAndRecord('timing', JSON.stringify({
            embed: tEmbed,
            route: tRoute,
            llm: tLlm,
            ground: tGround,
            total: tTotal,
            tools: toolsCalled.length,
            sources: allSources.length,
          }));

          sendAndRecord('done', JSON.stringify({stop_reason: 'end_turn'}));

          const answerReplayEvents = replayableEvents(recordedEvents);
          const answerEventBytes = eventsByteLength(answerReplayEvents);

          // Cache the successful response for replay (session-scoped exact match)
          responseCacheSetForSession(session.id, responseCacheKey, answerReplayEvents);

          if (isCacheablePublicAnswer({
            rawQuery,
            ragQuery,
            messages: body.messages,
            pageContext: body.pageContext,
            pageUrl: body.pageUrl,
            confidence,
            deflected,
            selfDescribed,
            fullText,
            eventBytes: answerEventBytes,
          })) {
            exactAnswerCache.set(exactAnswerCacheKey, answerReplayEvents);
            debug('chat.cache.write', {layer: 'answer_exact', eventCount: answerReplayEvents.length, bytes: answerEventBytes});
          }
          resolveOwnedInflight(answerReplayEvents);

          // Store in semantic cache (cross-session, similarity-based) — fire-and-forget
          // Reuse the pre-computed embedding from the beginning of the request
          if (queryEmbedding) {
            const sourceChunkHashes = toolChunks.map(tc => tc.id).filter((id): id is string => Boolean(id));
            if (sourceChunkHashes.length > 0) {
              const sourceEntries = allSources.map(s => ({url: s.url}));
              const confidenceJson = JSON.stringify({level: confidence, score: 0});

              semanticCacheWrite({
                queryText: ragQuery,
                queryEmbedding,
                agent: agentConfig.type,
                sectionFilter,
                sseEvents: answerReplayEvents,
                sources: sourceEntries,
                chunkHashes: sourceChunkHashes.slice(0, 20),
                confidence: confidenceJson,
              }).catch(() => {});
            }
          }

          // Log the message (fire-and-forget)
          logEvent(session.id, userId, 'message', agentConfig.type, {
            requestId,
            role: 'assistant',
            rawContent: fullText,
            contentSummary: summarizeForDebugLog(fullText, 'content'),
            questionSummary: summarizeForDebugLog(ragQuery, 'question'),
            model: activeModel,
            confidence,
            toolsCalled,
            sourceCount: allSources.length,
            sources: allSources.map(s => ({ title: s.title, url: s.url, section: s.section })),
            pageUrl: pagePathForLog(body.pageUrl),
            inputTokens: tokenUsage?.inputTokens,
            outputTokens: tokenUsage?.outputTokens,
            totalTokens: tokenUsage?.totalTokens,
            cachedInputTokens: tokenUsage?.cachedInputTokens,
          }, userMeta, source);

          console.log(`[timing] embed=${tEmbed}ms route=${tRoute}ms llm=${tLlm}ms ground=${tGround}ms total=${tTotal}ms tools=${toolsCalled.length} sources=${allSources.length}`);
          debug('chat.response.completed', {
            status: 'success',
            totalDurationMs: tTotal,
            sourceCount: allSources.length,
            confidence,
            cacheWritten: true,
          });

          // Record per-step duration histograms
          observeHistogram('chat_proxy_step_duration_ms', {step: 'embed', agent: agentConfig.type}, tEmbed);
          observeHistogram('chat_proxy_step_duration_ms', {step: 'route', agent: agentConfig.type}, tRoute);
          observeHistogram('chat_proxy_step_duration_ms', {step: 'llm', agent: agentConfig.type}, tLlm);
          observeHistogram('chat_proxy_step_duration_ms', {step: 'ground', agent: agentConfig.type}, tGround);
          observeHistogram('chat_proxy_step_duration_ms', {step: 'total', agent: agentConfig.type}, tTotal);

          // Save conversation (fire-and-forget)
          saveConversation({
            id: session.id,
            requestId,
            userId,
            sessionId: session.id,
            messages: windowedMessages.map(m => ({role: m.role, content: m.content})),
            agentTypesUsed: [agentConfig.type],
            toolsCalled,
            sourcesReturned: allSources.map(s => s.url),
            confidenceLevels: [confidence],
            pageUrls: body.pageUrl ? [pagePathForLog(body.pageUrl) || ''] : [],
            feedbackSummary: {up: 0, down: 0},
            tokenUsage: tokenUsage ?? undefined,
          });

          // Persist token usage to PostgreSQL (fire-and-forget)
          if (tokenUsage) {
            saveTokenUsage({
              sessionId: session.id,
              userId,
              model: tokenUsage.model,
              agentType: tokenUsage.agentType,
              inputTokens: tokenUsage.inputTokens,
              outputTokens: tokenUsage.outputTokens,
              totalTokens: tokenUsage.totalTokens,
              cachedInputTokens: tokenUsage.cachedInputTokens,
            }).catch(() => {});
          }

          // Update user profile (fire-and-forget)
          updateUserProfile(userId, {
            requestId,
            agentsUsed: {[agentConfig.type]: 1},
            topicsDiscussed: routeResult.topics?.slice(0, 2) ?? [],
            pagesVisited: body.pageUrl ? [pagePathForLog(body.pageUrl) || ''] : [],
          });

          // Post-action handler: diagnose and act on low-confidence/error responses (fire-and-forget)
          handlePostAction({
            requestId,
            confidenceLevel: confidence,
            confidenceBreakdown: confidenceResult.breakdown,
            toolsCalled,
            sourceCount: allSources.length,
            groundedSourceCount,
            fullText,
            query: ragQuery,
            agentType: agentConfig.type,
            model: activeModel,
            sectionFilter,
            sessionId: session.id,
            isDeflected: deflected,
            isSelfDescribed: selfDescribed,
          });
          incCounter('chat_proxy_requests_total', {agent: currentAgent, model: currentModel, status: 'success'});
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Internal server error';

          // Detect client disconnects — don't count them as LLM health failures
          const isClientDisconnect = clientSignal?.aborted ||
            message.includes('Controller is already closed');

          if (isClientDisconnect) {
            debug('chat.response.error', {errorKind: 'client_disconnect', error: message, clientDisconnected: true});
            console.log('[Chat] Client disconnected', JSON.stringify({requestId, error: summarizeForDebugLog(message, 'error')}));
            resolveOwnedInflight([]);
            recordLlmDisconnect();
            return; // Let finally block close the controller
          }

          debug('chat.response.error', {errorKind: 'stream_error', error: message, clientDisconnected: false});
          console.error('[Chat] Stream error', JSON.stringify({requestId, error: summarizeForDebugLog(message, 'error')}));
          try {
            send('error', JSON.stringify({error: 'Internal server error', requestId}));
            send('done', JSON.stringify({stop_reason: 'error'}));
          } catch {
            // Controller may already be closed; ignore secondary send errors
          }
          // Allow the error event to flush before the finally block closes the controller
          await new Promise(r => setTimeout(r, 100));
          logEvent(session.id, userId, 'error', 'unknown', {requestId, errorSummary: summarizeForDebugLog(message, 'message')}, userMeta, source);
          resolveOwnedInflight([]);
          recordLlmError(`Internal server error; requestId=${requestId}`);
          incCounter('chat_proxy_requests_total', {agent: currentAgent, model: currentModel, status: 'error'});

          // Post-action for hard errors
          handlePostAction({
            requestId,
            confidenceLevel: 'low',
            toolsCalled: [],
            sourceCount: 0,
            groundedSourceCount: 0,
            fullText: '',
            query: ragQuery,
            agentType: 'unknown',
            model: '',
            sectionFilter,
            sessionId: session.id,
            isDeflected: false,
            isSelfDescribed: false,
            error: 'Internal server error',
          });
        } finally {
          controller.close();
        }
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        ...requestIdHeaders(requestId),
      },
    },
  );
});

// ---------------------------------------------------------------------------
// POST /clear — clear session conversation context
// ---------------------------------------------------------------------------

app.post('/clear', async c => {
  let body: {sessionId?: string};
  try {
    body = await c.req.json<{sessionId?: string}>();
  } catch {
    return c.json({error: 'Invalid JSON body'}, 400);
  }

  if (!body.sessionId || typeof body.sessionId !== 'string') {
    return c.json({error: 'sessionId is required'}, 400);
  }

  clearSessionMessages(body.sessionId);
  clearSessionRoute(body.sessionId);
  const sessionResponseCache = clearSessionResponseCache(body.sessionId);

  return c.json({
    ok: true,
    sessionId: body.sessionId,
    cleared: {
      messages: true,
      stickyRoute: true,
      sessionResponseCache,
    },
  });
});

// ---------------------------------------------------------------------------
// POST /feedback — record thumbs up/down
// ---------------------------------------------------------------------------

app.post('/feedback', async c => {
  let body: FeedbackRequest;
  try {
    body = await c.req.json<FeedbackRequest>();
  } catch {
    return c.json({error: 'Invalid JSON body'}, 400);
  }

  if (!body.sessionId || body.messageIndex == null || !['up', 'down'].includes(body.rating)) {
    return c.json({error: 'sessionId, messageIndex, and rating (up|down) are required'}, 400);
  }

  recordFeedback(body.sessionId, body.messageIndex, body.rating, pagePathForLog(body.pageUrl));

  const source = parseSource(c);

  // Log feedback event
  logEvent(body.sessionId, body.userId || 'anonymous', 'feedback', '', {
    rating: body.rating,
    messageIndex: body.messageIndex,
    pageUrl: pagePathForLog(body.pageUrl),
  }, undefined, source);

  return c.json({ok: true});
});

// GET /feedback/stats — public feedback statistics
app.get('/feedback/stats', c => {
  return c.json(getStats());
});

// ---------------------------------------------------------------------------
// Metrics endpoint (Prometheus-style)
// ---------------------------------------------------------------------------

app.get('/metrics', c => {
  return c.text(renderMetrics(), 200, {'Content-Type': 'text/plain; charset=utf-8'});
});

// ---------------------------------------------------------------------------
// Admin routes
// ---------------------------------------------------------------------------

app.route('/admin', adminApp);
