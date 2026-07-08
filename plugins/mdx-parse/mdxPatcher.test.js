const assert = require('node:assert/strict');
const {
    applyMdxPatches,
    validateMdxStructure,
    normalizeNestedPlaintextFences,
    normalizeCodeTagContent,
    convertHtmlCommentsToMdx,
    findMalformedProceduresBlocks,
} = require('./mdxPatcher');
const LarkDocWriter = require('../lark-docs/larkDocWriter');

const failingCodeSpan = '<p><code><i>http</i>s://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com</code></p>';
const normalizedCodeSpan = '<p><code>https://\\{cluster-id\\}.serverless.\\{region\\}.vectordb.zillizcloud.com</code></p>';
const backslashedJavaTypes = '- **getResults** (*List\\<QueryResp.QueryResult\\>*)\n\n- **fields** (*Map\\<String,Object\\>*)';
const typescriptGenerics = [
    '- **file_resource_ids** (*Array<number | string>*) -',
    '',
    '**RETURNS** *Promise<SearchResults<T>>*',
].join('\n');
const faqHeading = '### Can I leave my organization?{#can-i-leave-my-organization}';
const sdkMetadataComment = '<!-- category: Authentication; action: CREATE; addedSince: v3.0.x -->';
const featureNote = [
    '<FeatureNote variant="plan" titleHref="/docs/pricing">',
    '',
    'Available on paid plans.',
    '',
    '</FeatureNote>',
].join('\n');
const featureCardGrid = [
    '<FeatureCardGrid columns={2}>',
    '<FeatureCard icon="AlertTriangle" title="Problem">',
    '',
    '- Each row may contain many vectors.',
    '',
    '</FeatureCard>',
    '</FeatureCardGrid>',
].join('\n');
const htmlTableWithUppercaseTextAndNestedTags = [
    '<table>',
    '   <tr>',
    '     <th><p>Field</p></th>',
    '     <th><p>Type</p></th>',
    '     <th><p>Description</p></th>',
    '   </tr>',
    '   <tr>',
    '     <td><p><code>status</code></p></td>',
    '     <td><p>String</p></td>',
    '     <td><p>The status (e.g., <code>Receive</code>, <code>Success</code>, <code>Failed</code>).</p></td>',
    '   </tr>',
    '</table>',
].join('\n');
const markdownTableWithHtmlBreakAfterUppercaseText = [
    '| Plan | Limit |',
    '| --- | --- |',
    '| On-demand cluster | Every 8 CU enables searches.<br/>Up to 256 MB/s at most. |',
].join('\n');
const restSpecsExportWithHtmlAndTemplateBraces = [
    'import RestSpecs from \'@site/src/components/RestSpecs\';',
    'export const specs = {"example":"Bearer {{TOKEN}}","prompt":"<p><code>https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com</code></p>"}',
    'export const endpoint = "/v2/example"',
].join('\n');
const invalidMdxEsmExport = 'export const specs = {"schema":\\{"type":"string"}}';
const indentedFencedJavaCode = [
    '<TabItem value="java">',
    '',
    '    ```java',
    '    Map<String, Object> analyzerParams = new HashMap<>();',
    '    ```',
    '',
    '</TabItem>',
].join('\n');
const consecutivePlaintextSdkBlocks = [
    '```plaintext',
    'from pymilvus import MilvusClient',
    '```',
    '',
    '```plaintext',
    'import io.milvus.v2.client.MilvusClientV2;',
    '```',
    '',
    '```plaintext',
    'collections = client.list_collections()',
    'print(collections)',
    '```',
].join('\n');

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

async function testConvertHtmlCommentsToMdx() {
    assert.equal(
        convertHtmlCommentsToMdx(sdkMetadataComment),
        '{/* category: Authentication; action: CREATE; addedSince: v3.0.x */}',
    );
}

async function testConvertHtmlCommentsPreservesFencedCodeBlocks() {
    const fenced = [
        '```html',
        sdkMetadataComment,
        '```',
    ].join('\n');

    assert.equal(convertHtmlCommentsToMdx(fenced), fenced);
}

async function testApplyMdxPatchesConvertsSdkMetadataComments() {
    const patched = await applyMdxPatches(sdkMetadataComment);
    assert.equal(patched, '{/* category: Authentication; action: CREATE; addedSince: v3.0.x */}');
    await compileToString(patched);
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

async function testLarkDocWriterConvertsSdkMetadataComments() {
    const writer = new LarkDocWriter('', '', 'javaSidebar');
    const patched = await writer.__mdx_patches(sdkMetadataComment);
    assert.equal(patched, '{/* category: Authentication; action: CREATE; addedSince: v3.0.x */}');
    await compileToString(patched);
}

async function testApplyMdxPatchesConvertsBackslashedJavaTypesToEntities() {
    const patched = await applyMdxPatches(backslashedJavaTypes);
    assert.ok(patched.includes('List&lt;QueryResp.QueryResult&gt;'));
    assert.ok(patched.includes('Map&lt;String,Object&gt;'));
    assert.ok(!patched.includes('\\<QueryResp.QueryResult\\>'));
    assert.ok(!patched.includes('\\<String,Object\\>'));
}

async function testApplyMdxPatchesConvertsTypescriptGenericsToEntities() {
    const patched = await applyMdxPatches(typescriptGenerics);
    assert.ok(patched.includes('Array&lt;number | string&gt;'));
    assert.ok(patched.includes('Promise&lt;SearchResults&lt;T&gt;&gt;'));
    assert.ok(!patched.includes('Array<number | string>'));
    assert.ok(!patched.includes('Promise<SearchResults<T>>'));
    assert.ok(!patched.includes('Promise<SearchResults&lt;T&gt;>'));
    await compileToString(patched);
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

async function testFeatureNoteIsPreservedAsGlobalMdxComponent() {
    const patched = await applyMdxPatches(featureNote);
    assert.equal(patched, featureNote);
    await compileToString(patched);
}

async function testFeatureCardGridIsPreservedAsGlobalMdxComponent() {
    const patched = await applyMdxPatches(featureCardGrid);
    assert.equal(patched, featureCardGrid);
    await compileToString(patched);
}

async function testHtmlTableClosingTagsAfterUppercaseTextArePreserved() {
    const patched = await applyMdxPatches(htmlTableWithUppercaseTextAndNestedTags);
    assert.equal(patched, htmlTableWithUppercaseTextAndNestedTags);
    assert.ok(!patched.includes('Field&lt;/p&gt;'));
    assert.ok(!patched.includes('Receive&lt;/code&gt;'));
    await compileToString(patched);
}

async function testHtmlBreakAfterUppercaseTextIsPreserved() {
    const patched = await applyMdxPatches(markdownTableWithHtmlBreakAfterUppercaseText);
    assert.equal(patched, markdownTableWithHtmlBreakAfterUppercaseText);
    assert.ok(!patched.includes('CU&lt;br/&gt;'));
    await compileToString(patched);
}

async function testMdxEsmExportsArePreserved() {
    const patched = await applyMdxPatches(restSpecsExportWithHtmlAndTemplateBraces);
    assert.equal(patched, restSpecsExportWithHtmlAndTemplateBraces);
    assert.ok(!patched.includes('schema":\\{'));
    assert.ok(!patched.includes('Bearer {\\{TOKEN}}'));
    await compileToString(patched);
}

async function testInvalidMdxEsmExportIsNotMutated() {
    const patched = await applyMdxPatches(invalidMdxEsmExport);
    assert.equal(patched, invalidMdxEsmExport);
}

async function testIndentedFencedCodeIsPreserved() {
    const patched = await applyMdxPatches(indentedFencedJavaCode);
    assert.equal(patched, indentedFencedJavaCode);
    await compileToString(patched);
}

async function testConsecutivePlaintextFencesAreNotWidened() {
    const patched = normalizeNestedPlaintextFences(consecutivePlaintextSdkBlocks);
    assert.equal(patched, consecutivePlaintextSdkBlocks);
    assert.ok(!patched.includes('````plaintext'));
}

async function run() {
    await testNormalizeCodeTagContent();
    await testNormalizationPreservesFencedCodeBlocks();
    await testApplyMdxPatchesAvoidsRuntimeExpressions();
    await testConvertHtmlCommentsToMdx();
    await testConvertHtmlCommentsPreservesFencedCodeBlocks();
    await testApplyMdxPatchesConvertsSdkMetadataComments();
    await testValidationGuardFlagsUnnormalizedCodeTags();
    await testValidationGuardFlagsMalformedProceduresBlocks();
    await testLarkDocWriterUsesSharedNormalization();
    await testLarkDocWriterConvertsSdkMetadataComments();
    await testApplyMdxPatchesConvertsBackslashedJavaTypesToEntities();
    await testApplyMdxPatchesConvertsTypescriptGenericsToEntities();
    await testLarkDocWriterConvertsBackslashedJavaTypesToEntities();
    await testFaqHeadingsArePatchable();
    await testFeatureNoteIsPreservedAsGlobalMdxComponent();
    await testFeatureCardGridIsPreservedAsGlobalMdxComponent();
    await testHtmlTableClosingTagsAfterUppercaseTextArePreserved();
    await testHtmlBreakAfterUppercaseTextIsPreserved();
    await testMdxEsmExportsArePreserved();
    await testInvalidMdxEsmExportIsNotMutated();
    await testIndentedFencedCodeIsPreserved();
    await testConsecutivePlaintextFencesAreNotWidened();
    console.log('mdxPatcher regression tests passed');
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
