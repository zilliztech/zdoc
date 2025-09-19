import yaml from 'js-yaml';
import Translator from './translator.js';

export default class Restorer {
    constructor(templates, translatedItems, frontmatter, slugs, sourceLang = 'English', targetLang, options = {}) {
        this.templates = templates;
        this.translatedItems = translatedItems;
        this.frontmatter = frontmatter;
        this.slugs = slugs;
        this.sourceLang = sourceLang;
        this.targetLang = targetLang;
        this.forceRewriting = options.forceRewriting || false;
        this.rewriteCache = options.rewriteCache || null;
        this.translator = new Translator();
    }

    async restore() {
        const frontmatterObject = { ...this.frontmatter };
        const translationMap = new Map();

        // Create a map of placeholder -> translated text
        for (const item of this.translatedItems) {
            if (item.isFrontmatter) {
                if (frontmatterObject[item.key]) {
                    let translatedText = item.translatedText;
                    frontmatterObject[item.key] = translatedText;
                }
            } else if (item.isBody) {
                translationMap.set(item.placeholder, item.translatedText);
            }
        }

        // Apply frontmatter optimization rules
        this.optimizeFrontmatter(frontmatterObject, translationMap);

        const bodyParts = [];
        const complexStyleBlocks = this.templates.filter(t => t.hasComplexStyle && this.targetLang);
        let rewritingProgress = 0;
        
        for (const template of this.templates) {
            let restoredBlock = template.template;
            for (const text of template.texts) {
                if (translationMap.has(text.placeholder)) {
                    // Use regex with word boundaries to ensure exact match replacement
                    const placeholderRegex = new RegExp(text.placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                    let translatedText = translationMap.get(text.placeholder);
                    
                    // Apply glossary replacements if this text has special terms
                    if (text.specialTerms && Array.isArray(text.specialTerms) && text.specialTerms.length > 0) {
                        translatedText = this.applySpecialTerms(translatedText, text.specialTerms);
                    }
                    
                    restoredBlock = restoredBlock.replace(placeholderRegex, translatedText);
                } else {
                    // If for some reason a translation is missing, put back the original text
                    const placeholderRegex = new RegExp(text.placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                    restoredBlock = restoredBlock.replace(placeholderRegex, text.original);
                }
            }
            
            // For complex style blocks, add rewriting phase
            if (template.hasComplexStyle && this.targetLang) {
                if (complexStyleBlocks.length > 0) {
                    rewritingProgress++;
                    const percentage = Math.round((rewritingProgress / complexStyleBlocks.length) * 100);
                    process.stdout.write(`Rewriting complex blocks: ${rewritingProgress}/${complexStyleBlocks.length} (${percentage}%) done.\r`);
                }
                restoredBlock = await this.rewriteComplexBlock(template, restoredBlock);
            }
            
            bodyParts.push(restoredBlock);
        }
        
        // Clear the rewriting progress line
        if (complexStyleBlocks.length > 0) {
            process.stdout.write('\n');
        }

        const frontmatterMarkdown = '---\n' + yaml.dump(frontmatterObject) + '---\n';
        let bodyMarkdown = bodyParts.join('\n\n');

        // Restore slugs
        for (const placeholder in this.slugs) {
            bodyMarkdown = bodyMarkdown.replace(placeholder, this.slugs[placeholder]);
        }

        // Apply post-translation cleanup for formatting issues
        bodyMarkdown = this.cleanupFormatting(bodyMarkdown);

        return frontmatterMarkdown + bodyMarkdown;
    }
    
    applySpecialTerms(text, specialTerms) {
        if (!text || !specialTerms || !Array.isArray(specialTerms)) {
            return text;
        }
        
        let processedText = text;
        
        // Apply glossary terms and untranslatables
        for (const term of specialTerms) {
            if (!term || !term.type) continue;
            
            if (term.type === 'glossary' && term.source && term.replacement) {
                // Replace source term with target translation
                const sourceRegex = new RegExp(term.source.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                processedText = processedText.replace(sourceRegex, term.replacement);
            } else if (term.type === 'untranslatable' && term.original) {
                // Ensure untranslatable terms remain unchanged
                const originalRegex = new RegExp(term.original.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                processedText = processedText.replace(originalRegex, term.original);
            }
        }
        
        return processedText;
    }
    
    optimizeFrontmatter(frontmatterObject, translationMap) {
        // Rule 1: Use title from translated body as frontmatter title
        const translatedTitle = this.extractTitleFromTranslatedBody(translationMap);
        if (translatedTitle && this.frontmatter.title) {
            // Preserve | suffix if present
            const titleSuffix = this.extractPipeSuffix(this.frontmatter.title);
            frontmatterObject.title = translatedTitle + titleSuffix;
        }
        
        // Rule 2: Use first paragraph of translated body as description
        const translatedFirstParagraph = this.extractFirstParagraphFromTranslatedBody(translationMap);
        if (translatedFirstParagraph && this.frontmatter.description) {
            // Preserve | suffix if present
            const descriptionSuffix = this.extractPipeSuffix(this.frontmatter.description);
            frontmatterObject.description = translatedFirstParagraph + descriptionSuffix;
        }
        
        // Rule 3: If sidebar_label is same as source title (ignoring common suffixes), use translated title
        if (this.frontmatter.sidebar_label && this.frontmatter.title) {
            // Helper function to normalize title by removing common suffixes
            const normalizeTitle = (title) => {
                if (!title) return title;
                // Remove common suffixes like " | Cloud", " | BYOC" and quotes
                return title.replace(/^["']|["']$/g, '').replace(/\s+\|\s*(Cloud|BYOC)$/, '').trim();
            };

            const normalizedTitle = normalizeTitle(this.frontmatter.title);
            const normalizedSidebarLabel = normalizeTitle(this.frontmatter.sidebar_label);

            if (normalizedSidebarLabel === normalizedTitle) {
                // Use translated title but remove the suffix if original sidebar_label didn't have it
                const originalSidebarHadSuffix = this.frontmatter.sidebar_label && this.frontmatter.sidebar_label.match(/\s+\|\s*(Cloud|BYOC)$/);
                if (originalSidebarHadSuffix) {
                    frontmatterObject.sidebar_label = frontmatterObject.title;
                } else {
                    // Remove suffix from translated title for sidebar_label
                    const translatedTitleWithoutSuffix = frontmatterObject.title.replace(/\s+\|\s*(Cloud|BYOC)$/, '').trim();
                    frontmatterObject.sidebar_label = translatedTitleWithoutSuffix;
                }
            }
        }
    }
    
    extractTitleFromTranslatedBody(translationMap) {
        // Find the first heading text (without the # marker) in the translated content
        for (const [placeholder, translatedText] of translationMap) {
            // The title is typically the first entry (%%TEXT0%%) and should be just the text without #
            if (placeholder === '%%TEXT0%%' && translatedText.trim().length > 2) {
                return translatedText.trim();
            }
        }
        return null;
    }
    
    extractFirstParagraphFromTranslatedBody(translationMap) {
        // Find the first paragraph (non-heading text block)
        for (const [placeholder, translatedText] of translationMap) {
            const trimmed = translatedText.trim();
            // Skip headings, empty lines, very short text, and HTML-like content
            if (!trimmed.startsWith('#') &&
                !trimmed.startsWith('##') &&
                !trimmed.startsWith('###') &&
                !trimmed.startsWith('####') &&
                trimmed.length > 20 &&
                !trimmed.includes('<') &&
                !trimmed.includes('import') &&
                !trimmed.startsWith('```') &&
                placeholder.startsWith('%%TEXT')) {

                // This should be the first actual paragraph content
                // Clean up markdown formatting but preserve meaning
                let cleaned = trimmed
                    .replace(/\*\*/g, '') // Remove **bold**
                    .replace(/\*/g, '') // Remove *italic*
                    .replace(/`([^`]+)`/g, '$1') // Remove `code`
                    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove [text](url) links, keep just text

                // Return first sentence or truncate at reasonable length for description
                // Handle both English and Japanese periods
                const firstSentence = cleaned.split(/[.。]/)[0];
                if (firstSentence.length > 0) {
                    let result = firstSentence.length > 200 ? firstSentence.substring(0, 200) + '...' : firstSentence;

                    // Add appropriate punctuation only if not already present
                    const lastChar = result.trim().slice(-1);
                    if (!lastChar.match(/[.。!?？!]/)) {
                        result += '.';
                    }

                    return result;
                }
            }
        }
        return null;
    }
    
    extractPipeSuffix(text) {
        const pipeIndex = text.lastIndexOf('|');
        if (pipeIndex !== -1) {
            return ' ' + text.substring(pipeIndex).trim();
        }
        return '';
    }
    
    cleanupFormatting(markdown) {
        let cleaned = markdown;

        // Fix 1: Remove backslash escaping from underscores in image alt text
        // Replace escaped underscores in image references: ![](image\_name.png) -> ![](image_name.png)
        cleaned = cleaned.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, altText, imageUrl) => {
            // Remove backslash escaping from underscores in both alt text and image URL
            const cleanAltText = altText.replace(/\\_/g, '_');
            const cleanImageUrl = imageUrl.replace(/\\_/g, '_');
            return `![${cleanAltText}](${cleanImageUrl})`;
        });

        // Fix 2: Fix table formatting while preserving original indentation
        cleaned = cleaned.replace(/(\s*)(<table\b[^>]*>[\s\S]*?<\/table>)/gi, (match, leadingWhitespace, tableContent) => {
            return '\n' + this.formatTableWithIndentation(leadingWhitespace + tableContent);
        });

        // Fix 3: Clean up excessive empty lines that might result from table formatting
        cleaned = cleaned.replace(/\n\s*\n\s*\n\s*\n/g, '\n\n');

        return cleaned;
    }

    formatTableWithIndentation(tableHtml) {
        // Extract the base indentation (indentation of the <table> tag)
        const tableStartMatch = tableHtml.match(/^(\s*)<table\b/);
        const baseIndentation = tableStartMatch ? tableStartMatch[1] : '';

        // Remove all existing indentation and line breaks within the table
        let normalizedTable = tableHtml
            .replace(/^\s+/, '') // Remove leading whitespace from the entire table
            .replace(/\s+/g, ' ') // Replace all whitespace sequences with single spaces
            .replace(/>\s*</g, '><') // Remove spaces between tags
            .trim();

        // Rebuild the table with proper structure while preserving base indentation
        const formattedTable = normalizedTable
            .replace(/<table([^>]*)>/gi, `${baseIndentation}<table$1>`)
            .replace(/<\/table>/gi, `${baseIndentation}</table>`)
            .replace(/<tr([^>]*)>/gi, `\n${baseIndentation}  <tr$1>`)
            .replace(/<\/tr>/gi, `\n${baseIndentation}  </tr>`)
            .replace(/<th([^>]*)>/gi, `\n${baseIndentation}    <th$1>`)
            .replace(/<\/th>/gi, `</th>`)
            .replace(/<td([^>]*)>/gi, `\n${baseIndentation}    <td$1>`)
            .replace(/<\/td>/gi, `</td>`)
            .replace(/\n\s*\n/g, '\n'); // Clean up excessive blank lines

        return formattedTable;
    }

    async rewriteComplexBlock(template, restoredBlock) {
        try {
            // Reconstruct the original source text from template for LLM reference and cache key
            let originalSourceText = template.template;
            for (const text of template.texts) {
                const placeholderRegex = new RegExp(text.placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                originalSourceText = originalSourceText.replace(placeholderRegex, text.original);
            }

            // Check cache first (unless force rewriting is enabled)
            if (!this.forceRewriting && this.rewriteCache) {
                const cached = await this.rewriteCache.get(template.template, restoredBlock, originalSourceText, this.targetLang);
                if (cached) {
                    // Log cache hit for debugging
                    if (process.env.DEBUG_CACHE) {
                        console.log('🎯 Rewrite cache HIT!');
                    }
                    return cached;
                } else {
                    // Log cache miss for debugging
                    if (process.env.DEBUG_CACHE) {
                        console.log('❌ Rewrite cache MISS - proceeding with AI rewrite');
                    }
                }
            }

            const rewritten = await this.translator.rewriteComplexBlock(
                template.template,
                restoredBlock,
                originalSourceText,
                this.sourceLang,
                this.targetLang,
                template.specialTerms || []
            );

            // Cache the result
            if (this.rewriteCache) {
                await this.rewriteCache.set(template.template, restoredBlock, originalSourceText, this.targetLang, rewritten);
                if (process.env.DEBUG_CACHE) {
                    console.log('💾 Rewrite cache entry stored');
                }
            }

            return rewritten;
        } catch (error) {
            console.warn('Error rewriting complex block, using original:', error.message);
            return restoredBlock;
        }
    }
}