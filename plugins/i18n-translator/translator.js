import dotenv from 'dotenv';
import OpenAI from 'openai';
import Bottleneck from 'bottleneck';

dotenv.config();

// Get model configuration from plugin options or environment variables
function getModelConfig(options = {}) {
    const modelConfig = options.modelConfig || {};

    // Check if this is an Ollama configuration
    const isOllama = modelConfig.baseUrl === 'http://localhost:11434/v1/' ||
                   process.env.MODEL_API_BASE_URL === 'http://localhost:11434/v1/' ||
                   modelConfig.provider === 'ollama';

    return {
        baseUrl: modelConfig.baseUrl || process.env.MODEL_API_BASE_URL || 'https://openrouter.ai/api/v1',
        apiKey: isOllama ? 'ollama' : (modelConfig.apiKey || process.env.MODEL_API_KEY),
        modelId: modelConfig.modelId || process.env.MODEL_ID || 'google/gemma-3-27b-it:free',
        provider: modelConfig.provider || (isOllama ? 'ollama' : 'openai')
    };
}

// Get throttle configuration from plugin options or environment variables
function getThrottleConfig(options = {}) {
    const throttleConfig = options.throttleConfig || {};

    return {
        minTime: throttleConfig.minTime || parseInt(process.env.THROTTLE_MIN_TIME) || 1000,
        maxConcurrent: throttleConfig.maxConcurrent || parseInt(process.env.THROTTLE_MAX_CONCURRENT) || 1
    };
}

export default class Translator {
    constructor(options = {}) {
        const config = getModelConfig(options);
        const throttleConfig = getThrottleConfig(options);

        this.openai = new OpenAI({
            baseURL: config.baseUrl,
            apiKey: config.apiKey,
        });
        this.modelId = config.modelId;
        this.hasApiKey = !!config.apiKey;
        this.provider = config.provider;

        // Configure the rate limiter
        this.limiter = new Bottleneck({
            minTime: throttleConfig.minTime,
            maxConcurrent: throttleConfig.maxConcurrent
        });

        console.log(`Using provider: ${this.provider} with model: ${this.modelId}`);
        console.log(`Throttle configured: ${throttleConfig.minTime}ms min time, ${throttleConfig.maxConcurrent} max concurrent`);
    }

    async translate(text, sourceLang, targetLang, specialTerms = []) {
        if (!text || !text.trim()) {
            return '';
        }
        if (!this.hasApiKey) {
            console.warn('Warning: No API key configured. Skipping translation.');
            return text; // Return original text if no key
        }

        // Check if this is a title translation
        const isTitleTranslation = specialTerms.some(term => term.isTitle);

        let prompt = `You are a professional technical document translator. Translate the following text from ${sourceLang} to ${targetLang}.

Context: ${isTitleTranslation ? 'This is a document title or sidebar label. Translate it as a concise, professional title without any additional formatting or punctuation.' : 'This is regular content. Translate it naturally while preserving meaning and tone.'}

Rules:
1. Translate ONLY the provided text
2. Return ONLY the translated text - no explanations, apologies, or additional content
3. IMPORTANT: Preserve ALL markdown formatting exactly as it appears in the original text, including:
   - Links: Keep [text](url) format intact, translate only the text part
   - Bold: Keep **bold** formatting
   - Italic: Keep *italic* formatting
   - Code: Keep \`code\` formatting
4. Provide accurate, natural-sounding translation
5. ${isTitleTranslation ? 'For titles and labels: be concise and professional but DO NOT ADD PUNCTUATION or FORMATTING' : 'For regular content: translate naturally while preserving meaning'}`;

        if (specialTerms.length > 0) {
            prompt += '\n6. IMPORTANT: Preserve the following terms exactly as specified:\n';
            for (const term of specialTerms) {
                if (term.type === 'untranslatable') {
                    prompt += `   - Keep "${term.original}" unchanged (untranslatable term)\n`;
                } else if (term.type === 'glossary') {
                    prompt += `   - Use "${term.replacement}" for "${term.original}" (glossary term)\n`;
                }
            }
        }

        prompt += `

Original Text:
"${text}"

Translated Text:`;

        try {
            const wrappedTranslate = this.limiter.wrap(async () => {
                return await this.makeRequestWithRetry(() =>
                    this.openai.chat.completions.create({
                        model: this.modelId,
                        messages: [{ role: 'user', content: prompt }],
                    })
                );
            });

            const completion = await wrappedTranslate();
            const translatedText = completion.choices[0]?.message?.content;

            if (translatedText) {
                return translatedText.trim();
            }
            else {
                console.warn('Warning: Translation API returned no text. Using original text.', JSON.stringify(completion, null, 2));
                return text;
            }
        } catch (error) {
            if (this.provider === 'ollama') {
                console.error('Error during Ollama translation. Make sure Ollama is running and the model is pulled:');
                console.error(`  - Ollama status: Check if running at ${this.openai.baseURL}`);
                console.error(`  - Model availability: Run 'ollama pull ${this.modelId}' to download`);
            } else {
                console.error('Error during translation:', error);
            }
            return text; // Fallback to original text
        }
    }

    // Make request with intelligent retry for rate limits
    async makeRequestWithRetry(requestFn, maxRetries = 3) {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error;

                // Check if it's a rate limit error (429)
                if (error.status === 429 && error.headers) {
                    const resetTime = error.headers.get ? error.headers.get('x-ratelimit-reset') : error.headers['x-ratelimit-reset'];
                    const remaining = error.headers.get ? error.headers.get('x-ratelimit-remaining') : error.headers['x-ratelimit-remaining'];

                    if (remaining === '0' && resetTime) {
                        // Handle both millisecond and second timestamps
                        let resetTimestamp = parseInt(resetTime);
                        const currentTime = Date.now();

                        // If reset timestamp is in seconds (Unix timestamp), convert to milliseconds
                        if (resetTimestamp < 1000000000000) {
                            resetTimestamp *= 1000;
                        }

                        const waitTime = resetTimestamp - currentTime;

                        if (waitTime > 0) {
                            const waitSeconds = Math.round(waitTime / 1000);
                            console.log(`Rate limit exceeded. Waiting ${waitSeconds}s until reset at ${new Date(resetTimestamp).toLocaleTimeString()}...`);
                            await new Promise(resolve => setTimeout(resolve, waitTime));
                            continue; // Retry after waiting for exact reset time
                        } else {
                            // Reset time has passed, retry immediately
                            console.log('Rate limit reset time has passed. Retrying immediately...');
                            continue;
                        }
                    }

                    // If no reset time header, fall back to exponential backoff
                    const waitTime = Math.min(5000 * attempt, 30000); // Exponential backoff, max 30s
                    console.log(`Rate limit hit but no reset time (attempt ${attempt}/${maxRetries}). Waiting ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }

                // For other errors, don't retry
                throw error;
            }
        }

        throw lastError;
    }

    // Method for rewriting complex formatted blocks (to be used by restorer)
    async rewriteComplexBlock(originalTemplate, translatedContent, originalSourceText, sourceLang, targetLang, specialTerms = []) {
        let prompt = `You are a professional technical document translator. The following markdown block has been translated from ${sourceLang} to ${targetLang}, but it may have flow or structure issues.

Original source text (for reference and context):
"${originalSourceText}"

Template structure (for markdown formatting reference):
"${originalTemplate}"

Current translated content:
"${translatedContent}"

Please rewrite the translated content to:
1. Ensure it flows naturally in ${targetLang}
2. Maintain the emphasis and structure implied by the original template
3. Use the original source text as context to improve translation accuracy and natural flow
4. IMPORTANT: Preserve ALL markdown formatting exactly as it appears, including:
   - Links: Keep [text](url) format intact, translate only the text part
   - Bold: Keep **bold** formatting
   - Italic: Keep *italic* formatting
   - Code: Keep \`code\` formatting`;

        if (specialTerms.length > 0) {
            prompt += '\n5. IMPORTANT: Preserve the following terms exactly as they appear:\n';
            for (const term of specialTerms) {
                if (term.type === 'untranslatable') {
                    prompt += `   - Keep "${term.original}" unchanged (untranslatable)\n`;
                } else if (term.type === 'glossary') {
                    prompt += `   - Use "${term.replacement}" for "${term.original}" (glossary term)\n`;
                }
            }
        }

        prompt += '\n6. Return ONLY the rewritten content as plain text - no explanations, no JSON, no markdown formatting\n\nRewritten content:';

        // Debug output for rewrite requests
        if (process.env.DEBUG_REWRITE || process.env.DEBUG_LEVEL >= 2) {
            console.log('\n🔄 === REWRITE REQUEST DEBUG ===');
            console.log('📄 Original Source Text:');
            console.log(originalSourceText);
            console.log('\n🏗️  Template Structure:');
            console.log(originalTemplate);
            console.log('\n🔄 Current Translated Content:');
            console.log(translatedContent);
            console.log('\n🔧 Special Terms:');
            console.log(specialTerms);
            console.log('\n💬 Full Prompt Sent to LLM:');
            console.log(prompt);
            console.log('=== END REWRITE DEBUG ===\n');
        }

        try {
            const wrappedRewrite = this.limiter.wrap(async () => {
                return await this.makeRequestWithRetry(() =>
                    this.openai.chat.completions.create({
                        model: this.modelId,
                        messages: [{ role: 'user', content: prompt }],
                    })
                );
            });

            const completion = await wrappedRewrite();
            const rewrittenText = completion.choices[0]?.message?.content;

            if (process.env.DEBUG_REWRITE || process.env.DEBUG_LEVEL >= 2) {
                console.log('\n🤖 === LLM REWRITE RESPONSE DEBUG ===');
                console.log('📝 Raw LLM Response:');
                console.log(rewrittenText);
                console.log('=== END LLM RESPONSE DEBUG ===\n');
            }

            if (rewrittenText && rewrittenText.trim()) {
                // Clean up any potential JSON artifacts or markdown code blocks
                let cleanedText = rewrittenText.trim();

                // Remove markdown code block syntax if present
                if (cleanedText.startsWith('```')) {
                    cleanedText = cleanedText.replace(/^```[\s\S]*?\n/, '').replace(/\n```$/, '');
                }

                // Remove any JSON array/object wrapping
                if (cleanedText.startsWith('[') || cleanedText.startsWith('{')) {
                    try {
                        // Try to parse as JSON in case it's wrapped
                        const parsed = JSON.parse(cleanedText);
                        if (typeof parsed === 'string') {
                            cleanedText = parsed;
                        } else if (parsed.text) {
                            cleanedText = parsed.text;
                        }
                    } catch {
                        // If it's not valid JSON, use as-is
                    }
                }

                if (process.env.DEBUG_REWRITE || process.env.DEBUG_LEVEL >= 2) {
                    console.log('✨ === CLEANED REWRITE RESULT ===');
                    console.log('🧹 Cleaned Text:');
                    console.log(cleanedText);
                    console.log('=== END CLEANED RESULT ===\n');
                }

                return cleanedText;
            }
            return translatedContent; // Fallback to original translation
        } catch (error) {
            if (this.provider === 'ollama') {
                console.error('Error during Ollama rewrite. Make sure Ollama is running and the model is pulled:');
                console.error(`  - Ollama status: Check if running at ${this.openai.baseURL}`);
                console.error(`  - Model availability: Run 'ollama pull ${this.modelId}' to download`);
            } else {
                console.warn('Error during rewriting, using original translation:', error.message);
            }
            return translatedContent;
        }
    }
}