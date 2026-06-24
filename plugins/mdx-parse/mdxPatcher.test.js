const assert = require('node:assert/strict');
const {
    applyMdxPatches,
    validateMdxStructure,
    normalizeCodeTagContent,
    findMalformedProceduresBlocks,
} = require('./mdxPatcher');
const LarkDocWriter = require('../lark-docs/larkDocWriter');

const failingCodeSpan = '<p><code><i>http</i>s://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com</code></p>';
const normalizedCodeSpan = '<p><code>https://\\{cluster-id\\}.serverless.\\{region\\}.vectordb.zillizcloud.com</code></p>';
const backslashedJavaTypes = '- **getResults** (*List\\<QueryResp.QueryResult\\>*)\n\n- **fields** (*Map\\<String,Object\\>*)';
const faqHeading = '### Can I leave my organization?{#can-i-leave-my-organization}';

async function compileToString(content) {
    const { compile } = await import('@mdx-js/mdx');
    return String(await compile(content, { development: false }));
}

async function testNormalizeCodeTagContent() {
    assert.equal(
        normalizeCodeTagContent(failingCodeSpan),
        normalizedCodeSpan,
    );
}

async function testNormalizationPreservesFencedCodeBlocks() {
    const fenced = [
        '```mdx',
        failingCodeSpan,
        '```',
    ].join('\n');

    assert.equal(normalizeCodeTagContent(fenced), fenced);
}

async function testApplyMdxPatchesAvoidsRuntimeExpressions() {
    const patched = await applyMdxPatches(failingCodeSpan);
    assert.equal(patched, normalizedCodeSpan);

    const compiled = await compileToString(patched);
    assert.ok(!compiled.includes('cluster - id'));
    assert.ok(!compiled.includes(' region,'));
    assert.ok(compiled.includes('https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com'));
}

async function testValidationGuardFlagsUnnormalizedCodeTags() {
    const errors = validateMdxStructure(failingCodeSpan);
    assert.ok(errors.some(error => error.includes('unnormalized JSX <code> tag')));

    const normalizedErrors = validateMdxStructure(normalizedCodeSpan);
    assert.ok(!normalizedErrors.some(error => error.includes('unnormalized JSX <code> tag')));
}

async function testValidationGuardFlagsMalformedProceduresBlocks() {
    const malformed = [
        '<Procedures>',
        '',
        'Intro text that should not be inside Procedures.',
        '',
        '1. Do the thing.',
        '',
        '</Procedures>',
    ].join('\n');
    const valid = [
        '<Procedures>',
        '',
        '1. Do the thing.',
        '',
        '</Procedures>',
    ].join('\n');

    assert.equal(findMalformedProceduresBlocks(malformed).length, 1);
    assert.equal(findMalformedProceduresBlocks(valid).length, 0);
    assert.ok(validateMdxStructure(malformed).some(error => error.includes('<Procedures> block')));
    assert.ok(!validateMdxStructure(valid).some(error => error.includes('<Procedures> block')));
}

async function testLarkDocWriterUsesSharedNormalization() {
    const writer = new LarkDocWriter('', '', 'pythonSidebar');
    const patched = await writer.__mdx_patches(failingCodeSpan);
    assert.equal(patched, normalizedCodeSpan);
}

async function testApplyMdxPatchesConvertsBackslashedJavaTypesToEntities() {
    const patched = await applyMdxPatches(backslashedJavaTypes);
    assert.ok(patched.includes('List&lt;QueryResp.QueryResult&gt;'));
    assert.ok(patched.includes('Map&lt;String,Object&gt;'));
    assert.ok(!patched.includes('\\<QueryResp.QueryResult\\>'));
    assert.ok(!patched.includes('\\<String,Object\\>'));
}

async function testLarkDocWriterConvertsBackslashedJavaTypesToEntities() {
    const writer = new LarkDocWriter('', '', 'javaSidebar');
    const patched = await writer.__mdx_patches(backslashedJavaTypes);
    assert.ok(patched.includes('List&lt;QueryResp.QueryResult&gt;'));
    assert.ok(patched.includes('Map&lt;String,Object&gt;'));
    assert.ok(!patched.includes('\\<QueryResp.QueryResult\\>'));
    assert.ok(!patched.includes('\\<String,Object\\>'));
}

async function testFaqHeadingsArePatchable() {
    const patched = await applyMdxPatches(faqHeading);
    await compileToString(patched);
    assert.equal(patched, '### Can I leave my organization?\\{#can-i-leave-my-organization}');
}

async function run() {
    await testNormalizeCodeTagContent();
    await testNormalizationPreservesFencedCodeBlocks();
    await testApplyMdxPatchesAvoidsRuntimeExpressions();
    await testValidationGuardFlagsUnnormalizedCodeTags();
    await testValidationGuardFlagsMalformedProceduresBlocks();
    await testLarkDocWriterUsesSharedNormalization();
    await testApplyMdxPatchesConvertsBackslashedJavaTypesToEntities();
    await testLarkDocWriterConvertsBackslashedJavaTypesToEntities();
    await testFaqHeadingsArePatchable();
    console.log('mdxPatcher regression tests passed');
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
