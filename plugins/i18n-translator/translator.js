import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const {
    MODEL_API_BASE_URL = 'https://openrouter.ai/api/v1',
    MODEL_API_KEY,
    MODEL_ID = 'google/gemma-3-27b-it:free'
} = process.env;

const openai = new OpenAI({
    baseURL: MODEL_API_BASE_URL,
    apiKey: MODEL_API_KEY,
});

export default class Translator {
    async translate(text, sourceLang, targetLang, specialTerms = []) {
        if (!text || !text.trim()) {
            return '';
        }
        if (!MODEL_API_KEY) {
            console.warn('Warning: MODEL_API_KEY environment variable not set. Skipping translation.');
            return text; // Return original text if no key
        }

        let prompt = `You are a professional technical document translator. Translate the following text from ${sourceLang} to ${targetLang}.

Rules:
1. Translate ONLY the provided text
2. Return ONLY the translated text - no explanations, apologies, or additional content
3. Do NOT add quotation marks, brackets, or any other formatting unless they are in the original text
4. Provide accurate, natural-sounding translation
5. For sidebar labels and UI elements, translate the content without adding any quotation marks`;

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

        prompt += `\nOriginal Text:
"${text}"

Translated Text:`;

        try {
            const completion = await openai.chat.completions.create({
                model: MODEL_ID,
                messages: [{ role: 'user', content: prompt }],
            });

            const translatedText = completion.choices[0]?.message?.content;

            if (translatedText) {
                return translatedText.trim();
            }
            else {
                console.warn('Warning: Translation API returned no text. Using original text.', JSON.stringify(completion, null, 2));
                return text;
            }
        } catch (error) {
            console.error('Error during translation:', error);
            return text; // Fallback to original text
        }
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
4. Do NOT add any quotation marks, brackets, or other formatting unless they are present in the original content`;

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
            const completion = await openai.chat.completions.create({
                model: MODEL_ID,
                messages: [{ role: 'user', content: prompt }],
            });

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
            console.warn('Error during rewriting, using original translation:', error.message);
            return translatedContent;
        }
    }
}