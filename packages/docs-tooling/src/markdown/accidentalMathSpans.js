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
        // The site builds with @mdx-js/mdx + remark-math; parse the same way
        // so detection matches what the build will do.
        pipelinePromise = Promise.all([
            import('@mdx-js/mdx'),
            import('remark-math'),
        ]).then(([{compile}, remarkMath]) => ({
            compile,
            remarkMath: remarkMath.default ?? remarkMath,
        }));
    }
    return pipelinePromise;
}

function looksAccidentalMathValue(value) {
    return JSX_TAG_REMNANT.test(value) || CJK_CHARS.test(value);
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

    const {compile, remarkMath} = await loadPipeline();
    const spans = result.spans;
    try {
        await compile(String(markdown), {
            remarkPlugins: [remarkMath, () => tree => {
                (function walk(node) {
                    if (!node) return;
                    if (
                        (node.type === 'inlineMath' || node.type === 'math') &&
                        typeof node.value === 'string' &&
                        looksAccidentalMathValue(node.value)
                    ) {
                        spans.push({type: node.type, value: node.value});
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

module.exports = {
    looksAccidentalMathValue,
    mightContainMathDelimiters,
    findAccidentalMathSpans,
};
