import fs from 'fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkStringify from 'remark-stringify';
import yaml from 'js-yaml';

function visit(node, visitor) {
    visitor(node);
    if (node.children) {
        node.children.forEach(child => visit(child, visitor));
    }
}

const stringifier = unified()
    .use(remarkMdx)
    .use(remarkStringify, {
        bullet: '-',
        fence: '`',
        fences: true,
        incrementListMarker: true,
        rule: '-',
        listItemIndent: 'one',
    });

export default class Extractor {
    constructor(options) {
        const processor = unified().use(remarkParse).use(remarkMdx);
        this.translatables = [];
        this.templates = [];
        this.frontmatter = {};
        this.slugs = {};
        this.glossary = options.glossary || [];
        this.untranslatables = options.untranslatables || [];
        this.targetLang = options.targetLang;

        // 1. Handle Frontmatter
        let content = options.content;
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
        if (frontmatterMatch) {
            const yamlContent = frontmatterMatch[1];
            this.frontmatter = yaml.load(yamlContent);
            content = content.substring(frontmatterMatch[0].length);
            
            // Add title to translatables
            if (this.frontmatter.title) {
                // Remove ALL quotation marks before translation (double quotes, single quotes, Japanese quotes, etc.)
                const cleanTitle = this.frontmatter.title.replace(/^["\'"'"'"']|["\'"'"'"']$/g, '');
                this.translatables.push({
                    text: cleanTitle,
                    isFrontmatter: true,
                    key: 'title',
                    isTitle: true,
                    specialTerms: [{ type: 'title', isTitle: true }] // Add isTitle flag to specialTerms
                });
            }

            // Only translate sidebar_label if it's different from title (ignoring common suffixes)
            if (this.frontmatter.sidebar_label) {
                // Helper function to normalize title by removing common suffixes
                const normalizeTitle = (title) => {
                    if (!title) return title;
                    // Remove common suffixes like " | Cloud", " | BYOC"
                    return title.replace(/\s+\|\s*(Cloud|BYOC)$/, '').trim();
                };

                const normalizedTitle = normalizeTitle(this.frontmatter.title);
                const normalizedSidebarLabel = normalizeTitle(this.frontmatter.sidebar_label);

                if (normalizedSidebarLabel !== normalizedTitle) {
                    // Remove ALL quotation marks before translation (double quotes, single quotes, Japanese quotes, etc.)
                    const cleanSidebarLabel = this.frontmatter.sidebar_label.replace(/^["\'"'"'"']|["\'"'"'"']$/g, '');
                    this.translatables.push({
                        text: cleanSidebarLabel,
                        isFrontmatter: true,
                        key: 'sidebar_label',
                        isTitle: true,
                        specialTerms: [{ type: 'title', isTitle: true }] // Add isTitle flag to specialTerms
                    });
                }
            }
        }

        // 2. Find and store all slugs, then clean the content
        let slugCounter = 0;
        const slugRegex = /(\{#.*?\})/g;
        const cleanedContent = content.replace(slugRegex, (match) => {
            const placeholder = `%%SLUG${slugCounter++}%%`;
            this.slugs[placeholder] = match;
            return placeholder;
        });

        // save the cleaned content for debug
        if (process.env.DEBUG_LEVEL && process.env.DEBUG_LEVEL >= 1) {
            fs.writeFileSync('cleaned-content.md', cleanedContent);
        }

        // 3. Parse the cleaned content
        const root = processor.parse(cleanedContent);

        // 4. For each top-level block, extract text and create a template
        let textCounter = 0;
        root.children.forEach((node) => {
            const blockRoot = { type: 'root', children: [JSON.parse(JSON.stringify(node))] };
            const texts = [];

            // Check if this is a heading block
            const isHeading = node.type === 'heading';

            if (node.type !== 'code') { // Don't extract text from code blocks
                visit(blockRoot, (child) => {
                    // Handle JSX component attributes (like Admonition titles)
                    if (child.type === 'mdxJsxFlowElement' && child.name === 'Admonition') {
                        // Extract title attribute from Admonition component
                        const titleAttr = child.attributes?.find(attr => attr.name === 'title');
                        if (titleAttr && titleAttr.value) {
                            const titleValue = titleAttr.value;
                            const textProcessing = this.processText(titleValue);
                            const placeholder = `%%TEXT${textCounter++}%%`;

                            texts.push({
                                placeholder,
                                original: titleValue,
                                isSpecial: textProcessing.specialTerms.length > 0,
                                specialTerms: textProcessing.specialTerms
                            });

                            // Add isTitle flag to specialTerms for translator
                            const titleSpecialTerms = [...textProcessing.specialTerms];
                            titleSpecialTerms.push({ type: 'title', isTitle: true });

                            this.translatables.push({
                                text: titleValue,
                                isBody: true,
                                isTitle: true,
                                placeholder,
                                specialTerms: titleSpecialTerms
                            });

                            // Replace the title attribute value with placeholder
                            titleAttr.value = placeholder;
                        }
                    }

                    if (child.type === 'text') {
                        const originalValue = child.value;
                        const slugPlaceholderRegex = /%%SLUG\d+%%/g;
                        const hasSlug = slugPlaceholderRegex.test(originalValue);

                        if (hasSlug) {
                            const textPart = originalValue.replace(slugPlaceholderRegex, "").trim();

                            if (textPart) {
                                const textProcessing = this.processText(textPart);
                                const placeholder = `%%TEXT${textCounter++}%%`;

                                texts.push({
                                    placeholder,
                                    original: textPart,
                                    isSpecial: textProcessing.specialTerms.length > 0,
                                    specialTerms: textProcessing.specialTerms
                                });

                                // Add isTitle flag to specialTerms for translator
                                const titleSpecialTerms = [...textProcessing.specialTerms];
                                if (isHeading) {
                                    titleSpecialTerms.push({ type: 'title', isTitle: true });
                                }

                                this.translatables.push({
                                    text: textPart,
                                    isBody: true,
                                    isTitle: isHeading, // Mark heading text as titles
                                    placeholder,
                                    specialTerms: titleSpecialTerms
                                });

                                child.value = originalValue.replace(textPart, placeholder);
                            }
                            // If no text part, do nothing, leave child.value as is (e.g. just a slug placeholder).
                        } else {
                            const textProcessing = this.processText(child.value);

                            // Always add to translatables for translation
                            const placeholder = `%%TEXT${textCounter++}%%`;
                            texts.push({
                                placeholder,
                                original: child.value,
                                isSpecial: textProcessing.specialTerms.length > 0,
                                specialTerms: textProcessing.specialTerms
                            });
                            // Add isTitle flag to specialTerms for translator
                            const titleSpecialTerms = [...textProcessing.specialTerms];
                            if (isHeading) {
                                titleSpecialTerms.push({ type: 'title', isTitle: true });
                            }

                            this.translatables.push({
                                text: child.value,
                                isBody: true,
                                isTitle: isHeading, // Mark heading text as titles
                                placeholder,
                                specialTerms: titleSpecialTerms
                            });
                            child.value = placeholder;
                        }
                    }
                });
            }

            let template = stringifier.stringify(blockRoot).trim();
          
            // Identify complex style blocks
            const hasComplexStyle = this.hasComplexStyle(template);
            const hasSpecialTerms = texts.some(t => t.isSpecial);
            
            this.templates.push({
                template, 
                texts, 
                hasComplexStyle: hasComplexStyle || hasSpecialTerms,
                hasSpecialTerms,
                // Store the original text for later rewriting
                originalText: texts.map(t => t.original).join(' '),
                // Store special terms info for rewriting
                specialTerms: texts.filter(t => t.isSpecial).flatMap(t => t.specialTerms)
            });
        });
    }
    
    // Process text for glossaries and untranslatables
    processText(text) {
        let processedText = text;
        let hasGlossaryTerms = false;
        let hasUntranslatables = false;
        const specialTerms = [];
        
        // First, check for untranslatables
        for (const untranslatable of this.untranslatables) {
            if (processedText.includes(untranslatable)) {
                hasUntranslatables = true;
                specialTerms.push({
                    type: 'untranslatable',
                    original: untranslatable,
                    replacement: untranslatable
                });
            }
        }
        
        // Then, check for glossary terms
        for (const glossaryItem of this.glossary) {
            if (processedText.includes(glossaryItem.source)) {
                hasGlossaryTerms = true;
                specialTerms.push({
                    type: 'glossary',
                    original: glossaryItem.source,
                    replacement: glossaryItem.target
                });
            }
        }
        
        return {
            processedText,
            hasGlossaryTerms,
            hasUntranslatables,
            specialTerms
        };
    }
    
    hasComplexStyle(template) {
        // Check if template has complex markdown formatting
        const boldCount = (template.match(/\*\*/g) || []).length;
        const italicCount = (template.match(/\*/g) || []).length;
        const linkCount = (template.match(/\[.*?\]\(.*?\)/g) || []).length;
        const inlineCodeCount = (template.match(/`.*?`/g) || []).length;
        
        // Count total formatting elements
        const totalFormattingElements = (boldCount > 0 ? 1 : 0) + 
                                       (italicCount > 0 ? 1 : 0) + 
                                       (linkCount > 0 ? 1 : 0) + 
                                       (inlineCodeCount > 0 ? 1 : 0);
        
        // Consider it complex if there are at least 2 different types of formatting
        return totalFormattingElements >= 2;
    }
}
