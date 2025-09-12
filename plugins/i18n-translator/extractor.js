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
            
            // Only translate sidebar_label if it's different from title
            if (this.frontmatter.sidebar_label) {
                if (this.frontmatter.sidebar_label !== this.frontmatter.title) {
                    // Remove ALL quotation marks before translation (double quotes, single quotes, Japanese quotes, etc.)
                    const cleanSidebarLabel = this.frontmatter.sidebar_label.replace(/^["\'"'"'"']|["\'"'"'"']$/g, '');
                    this.translatables.push({ text: cleanSidebarLabel, isFrontmatter: true, key: 'sidebar_label' });
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
            
            if (node.type !== 'code') { // Don't extract text from code blocks
                visit(blockRoot, (child) => {
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
                                
                                this.translatables.push({
                                    text: textPart,
                                    isBody: true,
                                    placeholder,
                                    specialTerms: textProcessing.specialTerms
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
                            this.translatables.push({
                                text: child.value, 
                                isBody: true, 
                                placeholder,
                                specialTerms: textProcessing.specialTerms
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
