/**
 * MDX Patching Module
 * Contains the MDX patching logic extracted from larkDocWriter.js __mdx_patches method
 */

// Known JSX block components that must never be backslash-escaped.
const KNOWN_JSX_TAGS = new Set([
    'Admonition', 'Tabs', 'TabItem', 'DocCard', 'DocCardList',
    'Details', 'CodeBlock', 'ThemedImage', 'TOCInline', 'Highlight',
    'Banner', 'Bars', 'Blocks', 'Cards', 'Grid', 'Hero', 'Procedures',
    'RestSpecs', 'Stories', 'Supademo', 'FeatureNote', 'FeatureCardGrid', 'FeatureCard',
]);

function createFenceTracker() {
    return {
        inCodeBlock: false,
        markerChar: null,
        markerLength: 0,
        update(line) {
            if (!this.inCodeBlock) {
                const open = line.match(/^[ \t]*(`{3,}|~{3,})(.*)$/);
                if (!open) return false;
                this.inCodeBlock = true;
                this.markerChar = open[1][0];
                this.markerLength = open[1].length;
                return true;
            }

            const close = line.match(/^[ \t]*(`{3,}|~{3,})[ \t]*$/);
            if (close && close[1][0] === this.markerChar && close[1].length >= this.markerLength) {
                this.inCodeBlock = false;
                this.markerChar = null;
                this.markerLength = 0;
                return true;
            }

            return false;
        },
    };
}

function isMdxEsmLine(line) {
    return /^(?:import|export)\b/.test(line.trim());
}

function getFencedCodeRanges(content) {
    const ranges = [];
    const tracker = createFenceTracker();
    const lines = content.split('\n');
    let offset = 0;
    let start = null;

    for (const line of lines) {
        const before = tracker.inCodeBlock;
        const changed = tracker.update(line);
        const after = tracker.inCodeBlock;

        if (changed && !before && after) {
            start = offset;
        } else if (changed && before && !after && start !== null) {
            ranges.push({ start, end: offset + line.length });
            start = null;
        }

        offset += line.length + 1;
    }

    return ranges;
}

function selectCodeFence(content, markerChar = '`') {
    const escaped = markerChar === '`' ? '`' : '\\~';
    const regex = new RegExp(`${escaped}{3,}`, 'g');
    let maxLength = 2;
    let match;

    while ((match = regex.exec(content)) !== null) {
        maxLength = Math.max(maxLength, match[0].length);
    }

    return markerChar.repeat(Math.max(3, maxLength + 1));
}

function createFencedCodeBlock(content, lang = '', indent = 0) {
    const normalized = String(content ?? '').replace(/^\n|\n$/g, '');
    const fence = selectCodeFence(normalized, '`');
    const pad = ' '.repeat(indent);
    const body = normalized
        .split('\n')
        .map(line => pad + line)
        .join('\n');

    return `${pad}${fence}${lang || ''}\n${body}\n${pad}${fence}\n`;
}

function transformOutsideFencedCodeBlocks(content, transform) {
    const lines = content.split('\n');
    const result = [];
    let pending = [];
    const fence = createFenceTracker();

    const flushPending = () => {
        if (pending.length > 0) {
            const transformed = [];
            let prose = [];
            const flushProse = () => {
                if (prose.length > 0) {
                    transformed.push(transform(prose.join('\n')));
                    prose = [];
                }
            };

            for (const line of pending) {
                if (isMdxEsmLine(line)) {
                    flushProse();
                    transformed.push(line);
                } else {
                    prose.push(line);
                }
            }

            flushProse();
            result.push(...transformed);
            pending = [];
        }
    };

    for (const line of lines) {
        const before = fence.inCodeBlock;
        const changed = fence.update(line);
        const after = fence.inCodeBlock;

        if (changed && !before && after) {
            flushPending();
            result.push(line);
            continue;
        }

        if (changed && before && !after) {
            result.push(line);
            continue;
        }

        if (fence.inCodeBlock) {
            result.push(line);
        } else {
            pending.push(line);
        }
    }

    flushPending();
    return result.join('\n');
}

/**
 * Prompt docs sometimes store an entire prompt in a plaintext code block, and the
 * prompt itself contains Markdown examples with ``` fences. A three-backtick
 * outer fence is then closed by the first inner example, leaving Python f-strings
 * such as {i} as live MDX expressions. For these generated prompt blocks, widen
 * the outer fence so inner three-backtick fences remain literal code content.
 */
function normalizeNestedPlaintextFences(content) {
    const lines = content.split('\n');
    let changed = false;

    for (let i = 0; i < lines.length; i++) {
        const open = lines[i].match(/^([ \t]{0,3})(`{3,}|~{3,})([ \t]*)([A-Za-z0-9_-]+)[ \t]*$/);
        if (!open) continue;

        const info = open[4].toLowerCase();
        if (info !== 'plaintext' && info !== 'text') continue;

        const markerChar = open[2][0];
        const closingIndexes = [];
        let lastNonEmpty = i;

        for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].trim() !== '') lastNonEmpty = j;
            const close = lines[j].match(/^([ \t]{0,3})(`{3,}|~{3,})[ \t]*$/);
            if (close && close[2][0] === markerChar && close[2].length >= open[2].length) {
                closingIndexes.push({ index: j, indent: close[1], marker: close[2] });
            }
        }

        if (closingIndexes.length < 2) continue;

        const sameIndentClose = closingIndexes.find(close => close.indent === open[1]);
        const closeIndex = closingIndexes[closingIndexes.length - 1].index;
        if (!sameIndentClose || sameIndentClose.index !== closeIndex) continue;

        // Conservative: only auto-widen generated prompt blocks that close at EOF.
        if (closeIndex !== lastNonEmpty) continue;

        const nestedContent = lines.slice(i + 1, closeIndex).join('\n');
        const widened = selectCodeFence(nestedContent, markerChar);
        if (widened.length <= open[2].length) continue;

        lines[i] = `${open[1]}${widened}${open[3]}${open[4]}`;
        lines[closeIndex] = `${open[1]}${widened}`;
        changed = true;
        i = closeIndex;
    }

    return changed ? lines.join('\n') : content;
}

/**
 * Pre-processing: remove hallucinated prose inserted between </TabItem> and the
 * next <TabItem> or </Tabs>. LLMs sometimes fabricate content in those gaps,
 * which MDX compiles fine but Docusaurus's Tabs component rejects at SSG render
 * time with "Bad <Tabs> child <p>".
 */
function removeTabsHallucinations(content) {
    const lines = content.split('\n');
    const result = [];
    let tabsDepth = 0;
    let afterTabItemClose = false;
    const fence = createFenceTracker();

    for (const line of lines) {
        const trimmed = line.trim();
        fence.update(line);

        if (!fence.inCodeBlock && !isMdxEsmLine(line)) {
            if (/^<Tabs[\s>]/.test(trimmed)) tabsDepth++;
            if (/^<\/Tabs>/.test(trimmed)) tabsDepth = Math.max(0, tabsDepth - 1);

            if (tabsDepth > 0) {
                if (trimmed === '</TabItem>') {
                    afterTabItemClose = true;
                    result.push(line);
                    continue;
                }
                if (afterTabItemClose) {
                    if (/^<TabItem[\s>]/.test(trimmed) || /^<\/Tabs>/.test(trimmed)) {
                        afterTabItemClose = false;
                    } else if (trimmed !== '') {
                        // Non-empty, non-TabItem content — hallucinated prose, discard it
                        continue;
                    }
                    // Empty lines between TabItems are harmless, keep them
                }
            } else {
                afterTabItemClose = false;
            }
        }

        result.push(line);
    }

    return result.join('\n');
}

/**
 * Pre-processing: unescape known JSX block components that were incorrectly
 * backslash-escaped (e.g. \<Tabs> → <Tabs>, \<TabItem> → <TabItem>).
 * These artifacts may exist in files translated before the end-tag-mismatch
 * fallback was removed. \<Tabs> is valid MDX syntax but causes React to treat
 * the remaining values={[...]} expression as children, crashing SSG.
 */
function unescapeKnownJsxTags(content) {
    const names = [...KNOWN_JSX_TAGS].join('|');
    const pattern = new RegExp(`\\\\<(/?(?:${names})\\b)`, 'g');
    return content.replace(pattern, '<$1');
}

/**
 * Pre-processing: replace currency $<digit> with &#36;<digit> outside fenced code
 * blocks and inline code spans, to prevent remark-math/KaTeX from treating them as
 * math delimiters (which causes unicodeTextInMathMode warnings and broken rendering).
 */
function escapeCurrencyDollars(content) {
    const lines = content.split('\n');
    const fence = createFenceTracker();
    const result = [];

    for (let line of lines) {
        fence.update(line);

        if (!fence.inCodeBlock && !isMdxEsmLine(line)) {
            // Split by inline code spans; odd-indexed segments are inside backticks
            const parts = line.split(/(`+[^`]+`+)/);
            line = parts.map((part, i) => {
                if (i % 2 === 0) {
                    // Outside inline code — replace $<digit> with HTML entity
                    return part.replace(/\$(?=\d)/g, '&#36;');
                }
                return part; // Inside inline code — leave unchanged
            }).join('');
        }

        result.push(line);
    }

    return result.join('\n');
}

/**
 * Pre-processing: escape unescaped { and } inside math blocks ($...$ and $$...$$)
 * so MDX does not try to parse them as JSX expressions.
 *
 * The remarkMathFix remark plugin (in docusaurus.config.ts) later converts \{ → {
 * and \} → } inside math AST nodes, restoring the original LaTeX for KaTeX.
 *
 * Only escapes braces that are NOT already preceded by a backslash.
 */
function escapeMathBraces(content) {
    const lines = content.split('\n');
    const result = [];
    const fence = createFenceTracker();
    let inDisplayMath = false;

    for (let line of lines) {
        const stripped = line.trim();

        // Track fenced code blocks
        fence.update(line);

        if (fence.inCodeBlock) {
            result.push(line);
            continue;
        }

        if (isMdxEsmLine(line)) {
            result.push(line);
            continue;
        }

        // Track display math blocks ($$...$$)
        if (stripped === '$$') {
            inDisplayMath = !inDisplayMath;
            result.push(line);
            continue;
        }

        if (inDisplayMath) {
            // Escape unescaped braces inside display math
            line = line.replace(/(?<!\\)([{}])/g, '\\$1');
            result.push(line);
            continue;
        }

        // Handle inline math ($...$) — escape braces inside $ delimiters
        // Split by inline code spans first (odd-indexed segments are inside backticks)
        const codeParts = line.split(/(`+[^`]+`+)/);
        line = codeParts.map((part, i) => {
            if (i % 2 !== 0) return part; // Inside inline code — leave unchanged

            // Find inline math spans: $...$ (not $$, not inside code)
            return part.replace(/(?<!\$)\$(?!\$)((?:[^$\\]|\\.)+)\$/g, (match, mathContent) => {
                const escaped = mathContent.replace(/(?<!\\)([{}])/g, '\\$1');
                return '$' + escaped + '$';
            });
        }).join('');

        result.push(line);
    }

    return result.join('\n');
}

function stripTagsFromCodeContent(inner) {
    return inner.replace(/<\/?[A-Za-z][^>]*>/g, '');
}

function escapeCodeContentBraces(inner) {
    return inner.replace(/(?<!\\)([{}])/g, '\\$1');
}

function normalizeSingleCodeTag(_match, attrs = '', inner) {
    const stripped = stripTagsFromCodeContent(inner);
    const escaped = escapeCodeContentBraces(stripped);
    return `<code${attrs}>${escaped}</code>`;
}

function normalizeCodeTagContent(content) {
    return transformOutsideFencedCodeBlocks(content, segment => {
        return segment.replace(/<code(\s[^>]*)?>([\s\S]*?)<\/code>/g, normalizeSingleCodeTag);
    });
}

function htmlCommentToMdxComment(_match, inner) {
    const safeInner = inner.replace(/\*\//g, '* /');
    return `{/*${safeInner}*/}`;
}

function convertHtmlCommentsToMdx(content) {
    return transformOutsideFencedCodeBlocks(content, segment => {
        return segment.replace(/<!--([\s\S]*?)-->/g, htmlCommentToMdxComment);
    });
}

function findUnnormalizedCodeTags(content) {
    const findings = [];

    transformOutsideFencedCodeBlocks(content, segment => {
        segment.replace(/<code(\s[^>]*)?>([\s\S]*?)<\/code>/g, (match, _attrs = '', inner) => {
            const stripped = stripTagsFromCodeContent(inner);
            const hasNestedTags = stripped !== inner;
            const hasUnescapedBraces = /(?<!\\)[{}]/.test(stripped);

            if (hasNestedTags || hasUnescapedBraces) {
                findings.push({
                    snippet: match.replace(/\s+/g, ' ').slice(0, 120),
                    hasNestedTags,
                    hasUnescapedBraces,
                });
            }

            return match;
        });

        return segment;
    });

    return findings;
}

function findMalformedProceduresBlocks(content) {
    const findings = [];

    transformOutsideFencedCodeBlocks(content, segment => {
        const blockPattern = /<Procedures(?:\s[^>]*)?>\s*\n([\s\S]*?)\n\s*<\/Procedures>/g;
        let match;
        while ((match = blockPattern.exec(segment)) !== null) {
            const body = match[1];
            const firstContentLine = body.split('\n').find(line => line.trim() !== '');
            if (!firstContentLine || !/^\s*1\.\s+/.test(firstContentLine)) {
                findings.push({
                    snippet: body.trim().split('\n').slice(0, 3).join(' ').slice(0, 120),
                });
            }
        }

        return segment;
    });

    return findings;
}

function escapeBackslashedAngleText(part) {
    // Markdown-style escapes such as List\<QueryResp.QueryResult\> can still be
    // parsed as MDX JSX by Docusaurus. Convert Java/C# type-looking spans to
    // entities before MDX sees them.
    return part.replace(/\\<([^<>\n`]*?(?:[.,]|[A-Z][A-Za-z0-9]*\.)[^<>\n`]*?)\\>/g, (_match, inner) => {
        return `&lt;${inner}&gt;`;
    });
}

function escapeTypeScriptGenericText(part) {
    // Type references such as Array<number | string> and
    // Promise<SearchResults&lt;T&gt;> are prose, but MDX sees the raw outer
    // angle brackets as JSX. Escape only identifier-prefixed spans; real JSX
    // components start at the opening bracket and are handled below.
    let out = '';
    let index = 0;
    const identStart = /[A-Z]/;
    const identChar = /[A-Za-z0-9_$.]/;
    const htmlTagAfterAngle = /^(?:a|abbr|b|br|code|div|em|i|li|p|span|strong|table|tbody|td|th|thead|tr|u|ul)(?:\s|\/?>)/;

    while (index < part.length) {
        const prev = index > 0 ? part[index - 1] : '';
        if (
            identStart.test(part[index]) &&
            !/[A-Za-z0-9_$]/.test(prev)
        ) {
            let nameEnd = index + 1;
            while (nameEnd < part.length && identChar.test(part[nameEnd])) nameEnd++;

            if (
                part[nameEnd] === '<' &&
                part[nameEnd + 1] !== '/' &&
                !htmlTagAfterAngle.test(part.slice(nameEnd + 1))
            ) {
                let depth = 0;
                let cursor = nameEnd;
                while (cursor < part.length) {
                    if (part[cursor] === '<') depth++;
                    if (part[cursor] === '>') {
                        depth--;
                        if (depth === 0) break;
                    }
                    if (part[cursor] === '\n' || part[cursor] === '`') break;
                    cursor++;
                }

                if (depth === 0 && cursor < part.length) {
                    out += part.slice(index, cursor + 1)
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    index = cursor + 1;
                    continue;
                }
            }
        }

        out += part[index];
        index++;
    }

    return out;
}

/**
 * Pre-processing: escape any lowercase tag whose name is not a known HTML element or
 * content-filter tag, outside fenced code blocks and inline code spans.
 * Such tags are URL/API placeholder patterns (e.g. <bucket_name>, <region-code>,
 * <container>, <blob>) that MDX would otherwise parse as JSX elements.
 * Both opening and closing forms are escaped.
 * PascalCase JSX components (Tabs, TabItem, Admonition…) are never matched because
 * the regex anchors on a leading lowercase letter.
 */
function escapeNonHtmlTags(content) {
    const KNOWN_TAGS = new Set([
        // Standard HTML elements
        'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio',
        'b', 'base', 'bdi', 'bdo', 'blockquote', 'br', 'button',
        'canvas', 'caption', 'cite', 'code', 'col', 'colgroup',
        'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt',
        'em', 'embed',
        'fieldset', 'figcaption', 'figure', 'footer', 'form',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html',
        'i', 'iframe', 'img', 'input', 'ins',
        'kbd',
        'label', 'legend', 'li', 'link',
        'main', 'map', 'mark', 'menu', 'meta', 'meter',
        'nav', 'noscript',
        'object', 'ol', 'optgroup', 'option', 'output',
        'p', 'picture', 'pre', 'progress',
        'q',
        'rp', 'rt', 'ruby',
        's', 'samp', 'script', 'section', 'select', 'slot', 'small', 'source', 'span',
        'strong', 'style', 'sub', 'summary', 'sup',
        'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead',
        'time', 'title', 'tr', 'track',
        'u', 'ul',
        'var', 'video',
        'wbr',
        // Content-filter tags used by larkDocWriter (processed before MDX patching)
        'include', 'exclude',
    ]);

    // Structural pre-scan: build set of safe uppercase/PascalCase tag names.
    // A tag is safe if it appears with a close tag, self-closing form, or attributes
    // anywhere in the document. Combined with a KNOWN_JSX fallback whitelist as a
    // safety net for legitimate components that may be orphaned in edge cases.
    const safeUppercaseTags = new Set([
        // Docusaurus built-in theme components
        'Admonition', 'Tabs', 'TabItem', 'DocCard', 'DocCardList',
        'Details', 'CodeBlock', 'ThemedImage', 'TOCInline', 'Highlight',
        // Custom site components
        'Banner', 'Bars', 'Blocks', 'Cards', 'Grid', 'Hero', 'Procedures', 'RestSpecs', 'Stories', 'Supademo', 'FeatureNote', 'FeatureCardGrid', 'FeatureCard',
    ]);
    const upperScanRegex = /[<]([A-Z][A-Za-z0-9]*)/g;
    let upperMatch;
    while ((upperMatch = upperScanRegex.exec(content)) !== null) {
        const tn = upperMatch[1];
        if (safeUppercaseTags.has(tn)) continue;
        if (new RegExp(`<\\/${tn}>`).test(content) ||
            new RegExp(`<${tn}\\s*\\/>`).test(content) ||
            new RegExp(`<${tn}\\s+`).test(content)) {
            safeUppercaseTags.add(tn);
        }
    }

    const lines = content.split('\n');
    const fence = createFenceTracker();
    const result = [];

    for (let line of lines) {
        fence.update(line);

        if (!fence.inCodeBlock && !isMdxEsmLine(line)) {
            // Split by inline code spans; odd-indexed segments are inside backticks
            const parts = line.split(/(`+[^`]+`+)/);
            line = parts.map((part, i) => {
                if (i % 2 === 0) {
                    part = escapeBackslashedAngleText(part);
                    part = escapeTypeScriptGenericText(part);
                    // Escape non-HTML lowercase placeholder tags (e.g. <bucket_name>, <region-code>).
                    // Tags with attributes won't match because the regex only allows \s*\/?>
                    part = part.replace(/(?<!\\)<\/?([a-z][a-z0-9]*(?:[_-][a-z0-9]+)*)\s*\/?>/g, (match, tagName) => {
                        if (KNOWN_TAGS.has(tagName)) return match;
                        return match.replace(/^\\/, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    });
                    // Escape uppercase/PascalCase tags not identified as real JSX components.
                    // Uses HTML entities so the angle brackets render correctly in the output.
                    part = part.replace(/(?<!\\)<\/?([A-Z][A-Za-z0-9]*)\s*\/?>/g, (match, tagName) => {
                        if (safeUppercaseTags.has(tagName)) return match;
                        return match.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    });
                    // Escape dotted-name PascalCase tags (e.g. <CreateCollectionReq.FieldSchema>),
                    // which are Java/C# type references that MDX misparses as JSX member expressions.
                    // Backslash escaping does not suppress MDX JSX parsing for dotted names, so
                    // always convert to HTML entities, stripping any preceding backslash first.
                    part = part.replace(/\\?<\/?([A-Z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)+)\s*\/?>/g, (match) => {
                        return match.replace(/^\\/, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    });
                    return part;
                }
                return part; // Inside inline code — leave unchanged
            }).join('');
        }

        result.push(line);
    }

    return result.join('\n');
}

/**
 * Pre-processing: escape unescaped { and } inside safe HTML elements
 * (e.g. <code>, <p>, <span>, <td>, <li>) so MDX does not evaluate them
 * as JSX expressions at SSG render time.
 *
 * Placeholder text like {project-id} or {API_KEY} inside <code> is common
 * in docs sourced from Lark. MDX compile() accepts it silently because it
 * is syntactically valid JSX, but React crashes at render with
 * "ReferenceError: project is not defined".
 *
 * Skips:
 *   - fenced code blocks
 *   - inline backtick spans
 *   - content that contains nested JSX components (to avoid breaking
 *     legitimate expressions like className={foo} inside wrapper tags)
 */
function escapeHtmlElementBraces(content) {
    const SAFE_HTML_TAGS = [
        // Leaf / inline tags most likely to contain literal braces
        'code', 'span', 'strong', 'em', 'i', 'b', 'u', 'kbd', 'mark',
        'samp', 'var', 'abbr', 'cite', 'dfn',
        // Other common HTML tags that may wrap text with placeholders
        'a', 'label', 'figcaption', 'caption', 'dt', 'dd', 'li', 'td', 'th',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'div', 'pre', 'blockquote', 'details', 'summary',
    ];

    // If inner content contains a PascalCase JSX component, skip escaping
    // to avoid breaking legitimate JSX expressions in attributes/children.
    const JSX_COMPONENT_PATTERN = /<[A-Z][A-Za-z0-9]*\b/;

    const lines = content.split('\n');
    const fence = createFenceTracker();
    const result = [];

    for (let line of lines) {
        fence.update(line);

        if (!fence.inCodeBlock && !isMdxEsmLine(line)) {
            // Split by inline code spans; odd-indexed segments are inside backticks
            const codeParts = line.split(/(`+[^`]+`+)/);
            line = codeParts.map((part, i) => {
                if (i % 2 !== 0) return part; // Inside inline code — leave unchanged

                let processed = part;
                for (const tag of SAFE_HTML_TAGS) {
                    const regex = new RegExp(`<${tag}\\b[^>]*>([^]*?)</${tag}>`, 'g');
                    processed = processed.replace(regex, (match, inner) => {
                        // Don't process if inner contains a nested opening of the same tag
                        if (new RegExp(`<${tag}\\b[^>]*>`).test(inner)) {
                            return match;
                        }
                        // Don't process if inner contains JSX components
                        if (JSX_COMPONENT_PATTERN.test(inner)) {
                            return match;
                        }
                        // Escape unescaped braces
                        const escaped = inner.replace(/(?<!\\)([{}])/g, '\\$1');
                        return `<${tag}${match.slice(tag.length + 1, match.indexOf('>'))}>${escaped}</${tag}>`;
                    });
                }
                return processed;
            }).join('');
        }

        result.push(line);
    }

    return result.join('\n');
}

/**
 * Structural validator for translated MDX files.
 * Catches React render-time errors that @mdx-js/mdx compile() misses:
 *   1. Prose inserted between </TabItem> and <TabItem>/<\/Tabs> (LLM hallucination)
 *   2. Unbalanced <Tabs>/<\/Tabs> or <TabItem>/<\/TabItem> tags (LLM dropped closing tags)
 *   3. Backslash-escaped known JSX tags (e.g. \<Tabs> → compile succeeds but SSG crashes)
 *   4. <Procedures> blocks whose first real child is not an ordered list
 *
 * @param {string} content
 * @returns {string[]} array of error descriptions; empty array = structurally valid
 */
function validateMdxStructure(content) {
    const errors = [];

    // Check 0: generated prompt blocks with nested ``` fences need a wider outer fence.
    if (normalizeNestedPlaintextFences(content) !== content) {
        errors.push('nested code fences found inside a plaintext prompt fence');
    }

    // Check 1: prose between TabItems
    if (removeTabsHallucinations(content) !== content) {
        errors.push('prose found between </TabItem> and next <TabItem>/<\\/Tabs> (LLM hallucination)');
    }

    // Check 2: escaped known JSX tags
    if (unescapeKnownJsxTags(content) !== content) {
        errors.push('backslash-escaped known JSX tags found (e.g. \\<Tabs>)');
    }

    // Check 3: unrestored translation placeholders (XTAG\d+X or LLM-mangled X\d+X)
    // If these appear in the output the placeholder/restore cycle broke, and the
    // rendered page will contain raw placeholder text like "XTAG39X" or "X39X".
    if (/\bXTAG\d+X\b/.test(content)) {
        errors.push('unrestored XTAG translation placeholders found (placeholder restore failed)');
    }

    // Check 4: JSX <code> spans must render literal code text.
    // MDX treats {placeholder} inside JSX children as JavaScript expressions,
    // and nested formatting tags like <i> split code text into JSX children.
    const unnormalizedCodeTags = findUnnormalizedCodeTags(content);
    if (unnormalizedCodeTags.length > 0) {
        errors.push(`unnormalized JSX <code> tag(s) found (${unnormalizedCodeTags.length} span(s) with nested tags or unescaped braces)`);
    }

    // Check 5: <Procedures> must wrap an ordered list. The React component can
    // tolerate MDX whitespace wrappers, but prose before the list still breaks
    // the intended procedure layout and should be retranslated/repaired.
    const malformedProceduresBlocks = findMalformedProceduresBlocks(content);
    if (malformedProceduresBlocks.length > 0) {
        errors.push(`<Procedures> block(s) without a leading ordered list found (${malformedProceduresBlocks.length} block(s))`);
    }

    // Check 6: tag balance for <Tabs> and <TabItem> (outside code blocks)
    const lines = content.split('\n');
    const fence = createFenceTracker();
    const delta = { Tabs: 0, TabItem: 0 };
    for (const line of lines) {
        const trimmed = line.trim();
        fence.update(line);
        if (fence.inCodeBlock) {
            continue;
        }
        for (const tag of ['Tabs', 'TabItem']) {
            const opens = (trimmed.match(new RegExp(`<${tag}[\\s>/]`, 'g')) || []).length;
            const closes = (trimmed.match(new RegExp(`<\\/${tag}>`, 'g')) || []).length;
            delta[tag] += opens - closes;
        }
    }
    for (const [tag, d] of Object.entries(delta)) {
        if (d > 0) errors.push(`${d} unclosed <${tag}> tag(s)`);
        if (d < 0) errors.push(`${Math.abs(d)} extra </${tag}> closing tag(s)`);
    }

    return errors;
}

// Function to apply MDX patches as per the larkDocWriter.js implementation
async function applyMdxPatches(content) {
    try {
        // Dynamically import the MDX compile function due to ES module restrictions
        const { compile } = await import('@mdx-js/mdx');
        const remarkMath = (await import('remark-math')).default;

        // Pre-process: fix hallucination patterns, then escape problem characters
        let patchedContent = normalizeNestedPlaintextFences(content);
        patchedContent = removeTabsHallucinations(patchedContent);
        patchedContent = unescapeKnownJsxTags(patchedContent);
        patchedContent = normalizeCodeTagContent(patchedContent);
        patchedContent = convertHtmlCommentsToMdx(patchedContent);
        patchedContent = escapeCurrencyDollars(patchedContent);
        patchedContent = escapeNonHtmlTags(patchedContent);
        patchedContent = escapeMathBraces(patchedContent);
        patchedContent = escapeHtmlElementBraces(patchedContent);
        let maxIterations = 50; // Prevent infinite loops
        let iteration = 0;
        const seenHashes = new Set();

        while (iteration < maxIterations) {
            // Cycle detection: stop if we've visited this exact content state before
            let h = 5381;
            for (let i = 0; i < patchedContent.length; i++) {
                h = Math.imul(h, 33) ^ patchedContent.charCodeAt(i);
            }
            if (seenHashes.has(h)) {
                console.warn('Cycle detected in MDX patch loop, stopping to prevent infinite iteration');
                break;
            }
            seenHashes.add(h);

            try {
                // Try to compile the current content
                await compile(patchedContent, { development: false, remarkPlugins: [remarkMath] });
                console.log(`MDX compilation succeeded after ${iteration} fixes`);
                return patchedContent; // If compilation succeeds, return the fixed content
            } catch (error) {
                console.log(`MDX compilation error detected (iteration ${iteration + 1}): ${error.message}`);

                // Identify problematic characters based on the error
                let madeChanges = false;
                let offset;
                switch (error.ruleId) {
                    case 'acorn':
                        offset = error.place.offset;

                        if (
                            error.place?.line &&
                            isMdxEsmLine(patchedContent.split('\n')[error.place.line - 1] || '')
                        ) {
                            break;
                        }

                        if (offset !== undefined && offset > 0 && offset < patchedContent.length) {
                            for (let i = offset - 1; i >= 0; i--) {
                                if (patchedContent[i] === '{') {
                                    patchedContent = patchedContent.slice(0, i) + '\\' + patchedContent.slice(i);
                                    madeChanges = true;
                                    break;
                                }
                            }
                        }
                        break;

                    case 'end-tag-mismatch':
                        // Tag mismatches in translated content indicate a structural LLM error
                        // (dropped closing tags, wrong nesting) that cannot be safely auto-repaired.
                        // Leave madeChanges = false so the loop breaks, and validate-and-revert
                        // will revert the file for retranslation.
                        break;

                    case 'unexpected-closing-slash': {
                        // "Unexpected closing slash `/` in tag, expected an open tag first"
                        // The error offset points to the `/` inside the orphaned closing tag.
                        // Strategy: walk back to find `<`, forward to find `>`, then remove the entire tag.
                        const slashOffset = error.place?.offset;

                        if (slashOffset !== undefined) {
                            let tagStart = slashOffset - 1;
                            while (tagStart > 0 && patchedContent[tagStart] !== '<') tagStart--;
                            let tagEnd = slashOffset;
                            while (tagEnd < patchedContent.length && patchedContent[tagEnd] !== '>') tagEnd++;

                            if (patchedContent[tagStart] === '<' && tagEnd < patchedContent.length) {
                                // Remove the orphaned closing tag (and any immediately trailing newline)
                                const before = patchedContent.slice(0, tagStart);
                                let after = patchedContent.slice(tagEnd + 1);
                                if (after.startsWith('\n')) after = after.slice(1);
                                patchedContent = before + after;
                                madeChanges = true;
                            }
                        }

                        if (!madeChanges) {
                            // Fallback: remove erroneous closing tags via regex
                            const originalContent = patchedContent;
                            patchedContent = patchedContent.replace(/<\/(?:content|[\w\d]+)>\s*$/, '');
                            if (originalContent !== patchedContent) {
                                madeChanges = true;
                            } else {
                                patchedContent = patchedContent.replace(/<[/](\w+)>/g, (match, tagName) => {
                                    const openingTagCount = (patchedContent.match(new RegExp(`<${tagName}(?:\\s|>|/>)`, 'g')) || []).length;
                                    const closingTagCount = (patchedContent.match(new RegExp(`<\\/${tagName}>`, 'g')) || []).length;
                                    if (closingTagCount > openingTagCount) {
                                        return '';
                                    }
                                    return match;
                                });
                                if (originalContent !== patchedContent) {
                                    madeChanges = true;
                                }
                            }
                        }
                        break;
                    }

                    case 'unexpected-character':
                        offset = error.place?.offset;

                        if (
                            (error.message.includes('U+003D') || /U\+003[0-9]/.test(error.message)) &&
                            offset !== undefined && offset > 0
                        ) {
                            // `=` sign or a digit (0–9) unexpected — typically from `<=` or `<10` where
                            // `<` was parsed as a JSX tag opener but the following char is not a valid name start.
                            // Walk backward to find `<` (within a short window) and replace it with `&lt;`.
                            for (let i = offset - 1; i >= Math.max(0, offset - 10); i--) {
                                if (patchedContent[i] === '<') {
                                    patchedContent = patchedContent.slice(0, i) + '&lt;' + patchedContent.slice(i + 1);
                                    madeChanges = true;
                                    break;
                                }
                            }
                        } else if (
                            (error.message.includes('U+002C') || error.message.includes('U+002A') || error.message.includes('U+3001')) &&
                            offset !== undefined && offset > 0 && offset < patchedContent.length
                        ) {
                            // Comma, asterisk, or ideographic comma — escape the nearest preceding `<`
                            for (let i = offset - 1; i >= 0; i--) {
                                if (patchedContent[i] === '<') {
                                    patchedContent = patchedContent.slice(0, i) + '\\' + patchedContent.slice(i);
                                    madeChanges = true;
                                    break;
                                }
                            }
                        }
                        break;

                    default:
                        madeChanges = false;
                        break;
                }

                if (!madeChanges) {
                    console.warn('No changes made to content, breaking loop to prevent infinite iteration');
                    break;
                }
            }

            iteration++;
        }

        if (iteration >= maxIterations) {
            console.warn(`Maximum MDX patch iterations (${maxIterations}) reached, returning last attempt`);
        }

        return patchedContent;
    } catch (error) {
        console.error('Failed to apply MDX patches:', error.message);
        return content; // Return original content if patching fails
    }
}

module.exports = {
    applyMdxPatches,
    validateMdxStructure,
    normalizeNestedPlaintextFences,
    createFenceTracker,
    getFencedCodeRanges,
    createFencedCodeBlock,
    selectCodeFence,
    removeTabsHallucinations,
    unescapeKnownJsxTags,
    normalizeCodeTagContent,
    convertHtmlCommentsToMdx,
    findUnnormalizedCodeTags,
    findMalformedProceduresBlocks,
    escapeMathBraces,
    escapeHtmlElementBraces,
    escapeNonHtmlTags,
};
