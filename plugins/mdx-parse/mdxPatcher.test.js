const assert = require('node:assert/strict');
const {
    applyMdxPatches,
    validateMdxStructure,
    normalizeCodeTagContent,
} = require('./mdxPatcher');
const LarkDocWriter = require('../lark-docs/larkDocWriter');

const failingCodeSpan = '<p><code><i>http</i>s://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com</code></p>';
const normalizedCodeSpan = '<p><code>https://\\{cluster-id\\}.serverless.\\{region\\}.vectordb.zillizcloud.com</code></p>';
const placeholderUrl = 'https://<bucket-name>.oss-cn-hangzhou.aliyuncs.com/milvus-data';

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

async function testLarkDocWriterUsesSharedNormalization() {
    const writer = new LarkDocWriter('', '', 'pythonSidebar');
    const patched = await writer.__mdx_patches(failingCodeSpan);
    assert.equal(patched, normalizedCodeSpan);
}

async function testLarkDocWriterKeepsExampleUrlsUndecorated() {
    const writer = new LarkDocWriter('', '', 'pythonSidebar');
    const input = `download from ${placeholderUrl}`;
    const output = writer.__example_http_urls(input);

    assert.equal(output, input);
    assert.doesNotMatch(output, /<i>http<\/i>/);
}

async function testLarkDocWriterDoesNotTouchFencedCodeUrls() {
    const writer = new LarkDocWriter('', '', 'pythonSidebar');
    const input = ['```bash', `curl ${placeholderUrl}`, '```'].join('\n');
    const output = writer.__example_http_urls(input);

    assert.equal(output, input);
}

async function run() {
    await testNormalizeCodeTagContent();
    await testNormalizationPreservesFencedCodeBlocks();
    await testApplyMdxPatchesAvoidsRuntimeExpressions();
    await testValidationGuardFlagsUnnormalizedCodeTags();
    await testLarkDocWriterUsesSharedNormalization();
    await testLarkDocWriterKeepsExampleUrlsUndecorated();
    await testLarkDocWriterDoesNotTouchFencedCodeUrls();
    console.log('mdxPatcher regression tests passed');
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
