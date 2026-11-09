'use strict'

// remark-math pairs `$` delimiters across MDX JSX text, so two inline-code
// chips whose text starts with `$` swallow the surrounding tags into a single
// math node ("meta</code> ... <code>"). The KaTeX stage then renders that as
// broken pseudo-math; strict=warn only fires for non-ASCII, which is why
// English pages reached production silently while Japanese pages surfaced the
// unicodeTextInMathMode warnings. This module is the one shared definition of
// "an accidental math span" so writer gates and tests detect the same damage.

const JSX_TAG_REMNANT = /<\/?[a-zA-Z][^<>]*>/
const ANY_DOLLAR = /\$/

let pipelinePromise = null

function loadPipeline() {
    if (!pipelinePromise) {
        // The site builds with @mdx-js/mdx + remark-math + rehype-katex; parse
        // and judge with the same engines so detection matches the build.
        pipelinePromise = Promise.all([
            import('@mdx-js/mdx'),
            import('remark-math'),
            import('katex'),
        ]).then(([{compile}, remarkMath, katex]) => ({
            compile,
            remarkMath: remarkMath.default ?? remarkMath,
            katex: katex.default ?? katex,
        }));
    }
    return pipelinePromise;
}

// The site's markdownPolicy restores escaped braces before KaTeX sees a math
// value (both sites enable the math-brace-fix policy), so the legality check
// must judge the restored form or it misjudges `\begin\{matrix\}` shapes.
function restoreMathBraces(value) {
    return value.replace(/\\\{/g, '{').replace(/\\\}/g, '}');
}

// Authoritative signal: the site renders each span through KaTeX, so a span
// the site engine rejects — a structural parse failure, an unknown macro, or
// content that trips unicodeTextInMathMode (the warning class that exposed the
// incident) — is accidental by definition. Legitimate equations, including
// ones with undefined-looking commands like \R and localized \text{...}
// content, parse cleanly; strict only escalates the exact warning the site
// prints.
function looksLikeBrokenMathValue(value, katex, displayMode) {
    if (!katex) return false;
    try {
        katex.renderToString(restoreMathBraces(value), {
            displayMode,
            strict: errorCode => (errorCode === 'unicodeTextInMathMode' ? 'error' : 'ignore'),
        });
        return false;
    } catch {
        return true;
    }
}

// A swallowed JSX tag can only come from damaged inline content; KaTeX renders
// some damaged shapes (bare `meta</code>: <code>`) without complaint, so this
// signal stays alongside the KaTeX check.
function looksLikeSwallowedJsx(value) {
    return JSX_TAG_REMNANT.test(value);
}

function isAccidentalMathSpan(span, katex) {
    return (
        looksLikeSwallowedJsx(span.value) ||
        looksLikeBrokenMathValue(span.value, katex, span.type === 'math')
    );
}

// Cheap prefilter: pages without a raw dollar cannot grow a math span, so the
// MDX parse only runs for candidates.
function mightContainMathDelimiters(markdown) {
    return ANY_DOLLAR.test(String(markdown ?? ''));
}

// Parse once and classify every math node. Returns {spans, compileError}: spans
// carry {type, value, position, accidental}; a compileError means the markdown
// itself is not valid MDX (a separate class of failure surfaced by downstream
// MDX validation) and is reported, not thrown.
async function collectMathSpans(markdown) {
    const result = {spans: [], compileError: null};
    if (!mightContainMathDelimiters(markdown)) return result;

    const {compile, remarkMath, katex} = await loadPipeline();
    const spans = result.spans;
    try {
        await compile(String(markdown), {
            remarkPlugins: [remarkMath, () => tree => {
                (function walk(node) {
                    if (!node) return;
                    if (
                        (node.type === 'inlineMath' || node.type === 'math') &&
                        typeof node.value === 'string'
                    ) {
                        const span = {
                            type: node.type,
                            value: node.value,
                            position: node.position ? {
                                start: node.position.start?.offset,
                                end: node.position.end?.offset,
                            } : null,
                            accidental: false,
                        };
                        span.accidental = isAccidentalMathSpan(span, katex);
                        spans.push(span);
                    }
                    const children = node.children;
                    if (Array.isArray(children)) {
                        for (const child of children) walk(child);
                    }
                })(tree);
            }],
            outputFormat: 'function-body',
        });
    } catch (error) {
        result.compileError = error;
    }
    return result;
}

// Returns {spans, compileError} where spans lists accidental math nodes only.
async function findAccidentalMathSpans(markdown) {
    const collected = await collectMathSpans(markdown);
    return {
        spans: collected.spans.filter(span => span.accidental),
        compileError: collected.compileError,
    };
}

function isEscapedDollar(text, offset) {
    let backslashes = 0;
    while (offset - 1 - backslashes >= 0 && text[offset - 1 - backslashes] === '\\') backslashes += 1;
    return backslashes % 2 === 1;
}

// Delimiter character offsets covered by one span, from the mdast position.
// Positions cover the delimiters themselves: an inlineMath starts at its
// opening `$` and ends one past its closing `$`; a display `math` node wraps
// the `$$` pairs on both ends. Escaped dollars (`\$`) keep their pairing power
// inside math for KaTeX but are already inert to remark-math, so they are left
// alone — escaping them again would turn `\$` into `\\$`: a literal backslash
// plus a brand-new live delimiter.
function spanDelimiterOffsets(span, text) {
    if (!span.position || span.position.start == null || span.position.end == null) return [];
    const start = span.position.start;
    const end = span.position.end;
    // Opening run: consecutive `$`s from the start (`$$` display fences).
    let openingEnd = start;
    while (openingEnd < end && text[openingEnd] === '$') openingEnd += 1;
    // Closing run: the position may include trailing whitespace after the
    // closing `$$`, which is not part of the fence — walk back over it first.
    let closingEnd = end;
    while (closingEnd > openingEnd && /[ \t\r\n]/.test(text[closingEnd - 1])) closingEnd -= 1;
    let closingStart = closingEnd;
    while (closingStart > openingEnd && text[closingStart - 1] === '$') closingStart -= 1;
    const offsets = [];
    for (let offset = start; offset < openingEnd; offset += 1) offsets.push(offset);
    for (let offset = closingStart; offset < closingEnd; offset += 1) offsets.push(offset);
    return offsets.filter(offset => text[offset] === '$' && !isEscapedDollar(text, offset));
}

// Escape the delimiters of every accidental span so the `$` characters render
// literally and the swallowed JSX tags resolve again. Escaping only removes
// pairing ability for remark-math, so each round eliminates the detected
// spans. The repair must also never create a math node that was not there
// before: after every round the full span set is re-collected and, if a new
// value appeared, the whole repair is rolled back (the caller then warns with
// the surviving spans instead of publishing a mangled page).
async function repairAccidentalMathSpans(markdown, maxRounds = 5) {
    const original = String(markdown ?? '');
    let text = original;
    const repaired = [];
    let baseline = null;
    for (let round = 0; round < maxRounds; round += 1) {
        const collected = await collectMathSpans(text);
        if (!baseline) baseline = new Set(collected.spans.map(span => span.value));
        const accidental = collected.spans.filter(span => span.accidental);
        if (accidental.length === 0) return {markdown: text, repaired, remaining: []};
        const offsets = [...new Set(accidental.flatMap(span => spanDelimiterOffsets(span, text)))].sort((a, b) => b - a);
        if (offsets.length === 0) {
            return {markdown: original, repaired: [], remaining: accidental};
        }
        for (const offset of offsets) {
            text = text.slice(0, offset) + '\\$' + text.slice(offset + 1);
        }
        repaired.push(...accidental);

        // Invariant: a repair may never grow new math. Roll back wholesale if
        // escaping somehow produced one.
        const after = await collectMathSpans(text);
        const grew = after.spans.some(span => !baseline.has(span.value));
        if (grew) {
            return {markdown: original, repaired: [], remaining: accidental};
        }
    }
    const final = await collectMathSpans(text);
    const accidental = final.spans.filter(span => span.accidental);
    if (accidental.length > 0) {
        return {markdown: original, repaired: [], remaining: accidental};
    }
    return {markdown: text, repaired, remaining: []};
}

module.exports = {
    findAccidentalMathSpans,
    repairAccidentalMathSpans,
    collectMathSpans,
};
