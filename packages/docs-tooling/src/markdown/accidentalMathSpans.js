'use strict'

// remark-math pairs `$` delimiters across MDX JSX text, so two inline-code
// chips whose text starts with `$` swallow the surrounding tags into a single
// math node ("meta</code> ... <code>"). The KaTeX stage then renders that as
// broken pseudo-math; strict=warn only fires for non-ASCII, which is why
// English pages reached production silently while Japanese pages surfaced the
// unicodeTextInMathMode warnings. This module is the one shared definition of
// "an accidental math span" so writer gates and tests detect the same damage.

const CJK_CHARS = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef\u3000-\u303f]/
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

// Fast signals. CJK never belongs in an equation, and a swallowed JSX tag can
// only come from damaged inline content. KaTeX renders both kinds "fine", so
// they need dedicated checks.
function looksAccidentalMathValue(value) {
    return JSX_TAG_REMNANT.test(value) || CJK_CHARS.test(value);
}

// Authoritative signal: the site renders each span through KaTeX, and any
// parse failure (unbalanced braces, an unknown macro) shows up there as
// visible red error output. A span the site engine cannot parse is therefore
// accidental by definition, while legitimate equations — including ones with
// undefined-looking commands like \R, which KaTeX ships — parse cleanly.
function looksLikeBrokenMathValue(value, katex, displayMode) {
    if (!katex) return false;
    try {
        katex.renderToString(value, {strict: 'ignore', displayMode});
        return false;
    } catch {
        return true;
    }
}

// Cheap prefilter: pages without a raw dollar cannot grow a math span, so the
// MDX parse only runs for candidates.
function mightContainMathDelimiters(markdown) {
    return ANY_DOLLAR.test(String(markdown ?? ''));
}

// Returns {spans, compileError}. `spans` lists accidental math nodes; a
// compileError means the markdown itself is not valid MDX (a separate class of
// failure surfaced by downstream MDX validation) and is reported, not thrown.
async function findAccidentalMathSpans(markdown) {
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
                        typeof node.value === 'string' &&
                        (looksAccidentalMathValue(node.value) || looksLikeBrokenMathValue(node.value, katex, node.type === 'math'))
                    ) {
                        spans.push({
                            type: node.type,
                            value: node.value,
                            position: node.position ? {
                                start: node.position.start?.offset,
                                end: node.position.end?.offset,
                            } : null,
                        });
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

// Delimiter character offsets covered by one span, from the mdast position.
// Positions cover the delimiters themselves: an inlineMath starts at its
// opening `$` and ends one past its closing `$`; a display `math` node wraps
// the `$$` pairs on both ends.
function spanDelimiterOffsets(span) {
    if (!span.position || span.position.start == null || span.position.end == null) return [];
    if (span.type === 'math') {
        return [span.position.start, span.position.start + 1, span.position.end - 2, span.position.end - 1];
    }
    return [span.position.start, span.position.end - 1];
}

// Escape the delimiters of every accidental span so the `$` characters render
// literally and the swallowed JSX tags resolve again. Escaping only removes
// pairing ability, so each round eliminates at least the detected spans and
// the pass converges. The repair restores exactly what the author wrote: a
// chip `$meta` that is escaped shows as a literal `$meta` again.
async function repairAccidentalMathSpans(markdown, maxRounds = 5) {
    let text = String(markdown ?? '');
    const repaired = [];
    let remaining = [];
    for (let round = 0; round < maxRounds; round += 1) {
        const {spans} = await findAccidentalMathSpans(text);
        if (spans.length === 0) return {markdown: text, repaired, remaining: []};
        const offsets = [...new Set(spans.flatMap(spanDelimiterOffsets))].filter(offset => text[offset] === '$');
        if (offsets.length === 0) return {markdown: text, repaired, remaining: spans};
        for (const offset of offsets.sort((a, b) => b - a)) {
            text = text.slice(0, offset) + '\\$' + text.slice(offset + 1);
        }
        repaired.push(...spans.map(span => span.value));
    }
    const final = await findAccidentalMathSpans(text);
    return {markdown: text, repaired, remaining: final.spans};
}

module.exports = {
    looksAccidentalMathValue,
    mightContainMathDelimiters,
    findAccidentalMathSpans,
    repairAccidentalMathSpans,
};
