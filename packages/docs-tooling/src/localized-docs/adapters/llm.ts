import type {
  DraftLlmProvider,
  DraftLlmRequest,
  DraftLlmResponse,
  DraftLlmUnitInput,
} from '../core/draft.ts'

export interface FakeDraftLlmOptions {
  responder?: (unit: DraftLlmUnitInput, request: DraftLlmRequest) => string
  overrides?: Readonly<Record<string, string>>
  modelName?: string
}

export interface OpenAiCompatibleProviderConfig {
  baseUrl: string
  apiKey: string
  model: string
  timeoutMs?: number
  maxTokens?: number
}

function defaultFakeSynthesis(unit: DraftLlmUnitInput): string {
  const tokens = unit.expectedPlaceholders
  const tokenStr = tokens.join(' ')

  if (unit.blockKind === 'heading') {
    const hashMatch = /^(#{1,6})\s+/.exec(unit.maskedEnText)
    const hashes = hashMatch ? hashMatch[1] : '##'
    const anchorToken = tokens.find(t => t.startsWith('[[ZDOC-PROTECTED:'))
    const restTokens = tokens.filter(t => t !== anchorToken)
    const cleanText = unit.maskedEnText
      .replace(/^#{1,6}\s+/, '')
      .replace(/\[\[ZDOC-(?:UI|PROTECTED):[^\]]+\]\]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    const baseHeading = unit.curZhText
      ? unit.curZhText.replace(/^#{1,6}\s+/, '').replace(/\s*(?:\\)?\{#[^}]+\}\s*$/, '').trim()
      : `${cleanText || '小节标题'}（中文）`
    const suffixParts = [...restTokens, ...(anchorToken ? [anchorToken] : [])]
    return `${hashes} ${baseHeading}${suffixParts.length ? ` ${suffixParts.join(' ')}` : ''}`.trim()
  }

  const strippedEnglish = unit.maskedEnText
    .replace(/\[\[ZDOC-(?:UI|PROTECTED):[^\]]+\]\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Keep mandatory terms like Collection / Entity / Schema / Milvus / Zilliz Cloud intact
  const preservedTerms: string[] = []
  for (const term of ['Zilliz Cloud', 'Milvus', 'Collection', 'Entity', 'Schema']) {
    if (strippedEnglish.includes(term)) {
      preservedTerms.push(term)
    }
  }
  const termHint = preservedTerms.length > 0 ? `（涉及 ${preservedTerms.join('、')}）` : ''

  if (unit.curZhText) {
    const cleanZh = unit.curZhText
      .replace(/<\/?UI>/g, '')
      .replace(/<\/?NextChannel[^>]*>/gi, '')
      .replace(/[`~]{3,}/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (tokens.length === 0) {
      return `${cleanZh}（已根据最新英文更新${termHint}）。`
    }
    return `已按最新英文更新${termHint}：${tokenStr}（参考原译：${cleanZh.slice(0, 60)}）。`
  }

  if (tokens.length === 0) {
    return `已按英文起草中文说明${termHint}：${strippedEnglish.slice(0, 80)}。`
  }
  return `已按英文起草中文说明${termHint}：${tokenStr}。`
}

export class FakeDraftLlmProvider implements DraftLlmProvider {
  readonly name = 'fake'
  private readonly options: FakeDraftLlmOptions

  constructor(options: FakeDraftLlmOptions = {}) {
    this.options = options
  }

  async draft(request: DraftLlmRequest): Promise<DraftLlmResponse> {
    const proposals: Record<string, string> = {}
    for (const unit of request.units) {
      if (this.options.overrides && Object.hasOwn(this.options.overrides, unit.blockId)) {
        proposals[unit.blockId] = this.options.overrides[unit.blockId]
      } else if (this.options.responder) {
        proposals[unit.blockId] = this.options.responder(unit, request)
      } else {
        proposals[unit.blockId] = defaultFakeSynthesis(unit)
      }
    }
    return {
      proposals,
      providerName: this.name,
      model: this.options.modelName ?? 'fake-deterministic-v1',
    }
  }
}

export class OpenAiCompatibleDraftLlmProvider implements DraftLlmProvider {
  readonly name = 'openai'
  private readonly config: OpenAiCompatibleProviderConfig

  constructor(config: OpenAiCompatibleProviderConfig) {
    this.config = config
  }

  async draft(request: DraftLlmRequest): Promise<DraftLlmResponse> {
    const baseUrl = this.config.baseUrl.replace(/\/+$/, '')
    const timeoutMs = this.config.timeoutMs ?? 60_000
    const systemPrompt = [
      'You are a bounded Chinese (zh-CN) technical documentation translator for Zilliz Cloud Guides.',
      'Rules:',
      '1. Return ONLY a JSON object of shape { "proposals": { "<blockId>": "<translated Chinese markdown>" } }.',
      '2. Only return keys for the exact blockIds in `units`.',
      '3. NEVER alter, remove, duplicate, or fabricate [[ZDOC-UI:...]] or [[ZDOC-PROTECTED:...]] placeholders.',
      '4. NEVER emit fenced code blocks (``` or ~~~) or <NextChannel> / </NextChannel> tags.',
      '',
      'Locale Contract:',
      request.localeContractFormatted,
      '',
      request.styleGuideExcerpt ? `Style Guide (Ch. 0-1):\n${request.styleGuideExcerpt}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const userPrompt = JSON.stringify({
      pageId: request.pageId,
      manual: request.manual,
      isInitialTranslation: request.isInitialTranslation,
      units: request.units,
    })

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature: 0,
        ...(this.config.maxTokens !== undefined ? { max_tokens: this.config.maxTokens } : {}),
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      throw new Error(`OpenAI-compatible draft request failed (${response.status}): ${errText.slice(0, 300)}`)
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = payload.choices?.[0]?.message?.content
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('OpenAI-compatible draft response missing message content')
    }

    const parsed = JSON.parse(content) as { proposals?: unknown }
    if (!parsed || typeof parsed.proposals !== 'object' || parsed.proposals === null || Array.isArray(parsed.proposals)) {
      throw new Error('OpenAI-compatible draft response must contain a "proposals" object')
    }

    const proposals: Record<string, string> = {}
    for (const [k, v] of Object.entries(parsed.proposals as Record<string, unknown>)) {
      if (typeof v !== 'string') {
        throw new Error(`OpenAI-compatible proposal for "${k}" must be a string`)
      }
      proposals[k] = v
    }

    return {
      proposals,
      providerName: this.name,
      model: this.config.model,
    }
  }
}

export function createDraftLlmProvider(options: {
  provider: string
  fakeOptions?: FakeDraftLlmOptions
  env?: NodeJS.ProcessEnv
}): DraftLlmProvider {
  if (options.provider === 'fake') {
    return new FakeDraftLlmProvider(options.fakeOptions)
  }
  if (options.provider === 'openai') {
    const env = options.env ?? process.env
    const baseUrl = env.ZDOC_DRAFT_LLM_BASE_URL
    const apiKey = env.ZDOC_DRAFT_LLM_API_KEY
    const model = env.ZDOC_DRAFT_LLM_MODEL
    if (!baseUrl || !apiKey || !model) {
      throw new Error(
        'OpenAI-compatible draft provider requires ZDOC_DRAFT_LLM_BASE_URL, ZDOC_DRAFT_LLM_API_KEY, and ZDOC_DRAFT_LLM_MODEL',
      )
    }
    return new OpenAiCompatibleDraftLlmProvider({ baseUrl, apiKey, model })
  }
  throw new Error(`Unsupported draft LLM provider "${options.provider}"; expected "fake" or "openai"`)
}
