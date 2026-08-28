const assert = require('node:assert/strict');
const {
    applyMdxPatches,
    validateMdxStructure,
    normalizeNestedPlaintextFences,
    normalizeCodeTagContent,
    convertHtmlCommentsToMdx,
    findMalformedProceduresBlocks,
    escapeCppNamespaceTypes,
    escapePlainTextBraces,
} = require('./validate.cjs');
const LarkDocWriter = require('../lark/larkDocWriter');

const failingCodeSpan = '<p><code><i>http</i>s://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com</code></p>';
const normalizedCodeSpan = '<p><code>https://\\{cluster-id\\}.serverless.\\{region\\}.vectordb.zillizcloud.com</code></p>';
const backslashedJavaTypes = '- **getResults** (*List\\<QueryResp.QueryResult\\>*)\n\n- **fields** (*Map\\<String,Object\\>*)';
const typescriptGenerics = [
    '- **file_resource_ids** (*Array<number | string>*) -',
    '',
    '**RETURNS** *Promise<SearchResults<T>>*',
].join('\n');
const faqHeading = '### Can I leave my organization?{#can-i-leave-my-organization}';
const lessThanHeading = '### 示例 4：使用小于（`<`）操作符过滤{#example-4-filtering-with-less-than}';
const lessThanOrEqualHeading = '### 示例 6：使用小于或等于（`<=`）操作符过滤{#example-6-filtering-with-less-than-or-equal-to}';
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
const translatedImportProse = 'import jobs の一覧とページネーション情報を含む HTTP レスポンス。';
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

async function testOperatorHeadingsKeepTextAndCustomAnchors() {
    const lessThanPatched = await applyMdxPatches(lessThanHeading);
    const lessThanOrEqualPatched = await applyMdxPatches(lessThanOrEqualHeading);

    assert.equal(
        lessThanPatched,
        '### 示例 4：使用小于（`<`）操作符过滤\\{#example-4-filtering-with-less-than}',
    );
    assert.equal(
        lessThanOrEqualPatched,
        '### 示例 6：使用小于或等于（`<=`）操作符过滤\\{#example-6-filtering-with-less-than-or-equal-to}',
    );
    await compileToString(lessThanPatched);
    await compileToString(lessThanOrEqualPatched);
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

async function testTranslatedImportProseCanBeRepaired() {
    const patched = await applyMdxPatches(translatedImportProse, { repairInvalidMdxEsmProse: true });
    assert.equal(patched, '`import` jobs の一覧とページネーション情報を含む HTTP レスポンス。');
    await compileToString(patched);
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

async function testCppNamespaceTypesAreEscapedToEntities() {
    const cppNamespaceCases = [
        'The <std::string> type',
        'Use <milvus::client::ConnectParam> to connect',
        'Returns <std::vector<std::string>>',
        '<milvus::client::CreateImportJobsRequest>',
        '(*const std::vector<std::string>&*)',
        'vector<std::string>',
    ];
    for (const input of cppNamespaceCases) {
        const patched = await applyMdxPatches(input);
        await compileToString(patched);
        assert.ok(!patched.includes('<std::'), 'expected namespace type to be escaped');
        assert.ok(patched.includes('&lt;'), 'expected entity escaping');
        assert.ok(patched.includes('&gt;'), 'expected entity escaping');
    }
    // Real JSX components must be preserved unchanged.
    const jsxLines = [
        '<Admonition type="note">',
        'Keep this.',
        '</Admonition>',
        '<Tabs>',
        '<TabItem value="a">A</TabItem>',
        '</Tabs>',
    ];
    const jsxInput = jsxLines.join('\n');
    const jsxPatched = await applyMdxPatches(jsxInput);
    assert.ok(jsxPatched.includes('<Admonition'));
    assert.ok(jsxPatched.includes('<Tabs>'));
    await compileToString(jsxPatched);
}

async function testCppNamespaceTypesWithoutClosingAngleAreEscaped() {
    // A namespace-qualified type token may be missing its closing ">" (the
    // author omitted it, often inside italic markdown); the escaper must still
    // entity-escape the leading "<" and any nested "<"/">" up to the next type
    // terminator, rather than leaving the malformed token untouched.
    const cases = [
        ['<std::string', '&lt;std::string'],
        ['<std::string&*', '&lt;std::string&*'],
        ['<milvus::client::ConnectParam', '&lt;milvus::client::ConnectParam'],
        ['Returns <std::vector<std::string> status', 'Returns &lt;std::vector&lt;std::string&gt; status'],
        ['<std::string, then', '&lt;std::string, then'],
        ['<std::string). done', '&lt;std::string). done'],
    ];
    for (const [input, expected] of cases) {
        assert.equal(escapeCppNamespaceTypes(input), expected);
        const patched = await applyMdxPatches(input);
        await compileToString(patched);
        assert.ok(!patched.includes('<std::'), 'expected namespace type to be escaped');
        assert.ok(!patched.includes('<milvus::'), 'expected namespace type to be escaped');
    }
}

async function testPlainTextBracesAreEscaped() {
    // Literal {identifier} placeholders in plain prose (the pattern found in
    // the cpp reference docs, e.g. "placeholders such as {age} or {city}")
    // compile as JSX expressions but crash at SSG render with
    // "ReferenceError: age is not defined". They must be escaped, while JSX
    // attributes/children, heading anchors, inline code, and ESM lines are
    // left untouched.
    const prose = 'Replaces all placeholder values used by the filter expression. Keys correspond to placeholders such as {age} or {city}.';
    const patched = await applyMdxPatches(prose);
    assert.ok(patched.includes('\\{age\\}'), 'expected {age} to be escaped');
    assert.ok(patched.includes('\\{city\\}'), 'expected {city} to be escaped');
    await compileToString(patched);

    // A hyphenated token in a heading (the zh-CN connect-to-serving-cluster
    // regression) must also be escaped through the full patch pipeline.
    const headingPatched = await applyMdxPatches('### 验证连接{verify-the-connection}');
    assert.ok(
        headingPatched.includes('\\{verify-the-connection\\}'),
        'expected {verify-the-connection} to be escaped',
    );

    // Direct unit assertions on the escape function.
    assert.equal(
        escapePlainTextBraces('placeholders such as {age} or {city}'),
        'placeholders such as \\{age\\} or \\{city\\}',
    );

    // Heading anchors are NOT escaped (the '#' is not a valid identifier start).
    assert.equal(
        escapePlainTextBraces('### FAQ{#faq-heading}'),
        '### FAQ{#faq-heading}',
    );

    // JSX attribute expressions are NOT escaped.
    assert.equal(
        escapePlainTextBraces('<FeatureCard columns={2}>'),
        '<FeatureCard columns={2}>',
    );

    // Inline code spans are NOT escaped.
    assert.equal(
        escapePlainTextBraces('`{cluster-id}` stays literal'),
        '`{cluster-id}` stays literal',
    );

    // Object literals are NOT escaped: the identifier class stops at the space,
    // so no '}' immediately follows the identifier.
    assert.equal(
        escapePlainTextBraces('{key: value}'),
        '{key: value}',
    );

    // Hyphenated placeholder/slug tokens MUST be escaped: without '-' in the
    // identifier class they compile as subtraction expressions and crash SSG
    // with "ReferenceError: <token> is not defined" (the zh-CN
    // "connect-to-serving-cluster" heading-anchor regression).
    assert.equal(
        escapePlainTextBraces('### 验证连接{verify-the-connection}'),
        '### 验证连接\\{verify-the-connection\\}',
    );
    assert.equal(
        escapePlainTextBraces('use a placeholder like {cluster-id} here'),
        'use a placeholder like \\{cluster-id\\} here',
    );
}

async function testLarkDocWriterEscapesPlainTextBraces() {
    // larkDocWriter.__mdx_patches is a separate copy of the MDX patch pipeline
    // used by the actual Lark fetch (publish-group --stage fetch). It must
    // apply the same plain-text brace escaping as applyMdxPatches, otherwise the
    // fetched cpp pages crash SSG with "ReferenceError: age is not defined".
    const writer = new LarkDocWriter('', '', 'cppSidebar');
    const patched = await writer.__mdx_patches(
        'Replaces all placeholder values used by the filter expression. Keys correspond to placeholders such as {age} or {city}; values may be boolean, numeric, string, or array data.',
    );
    assert.ok(patched.includes('\\{age\\}'), 'expected larkDocWriter to escape {age}');
    assert.ok(patched.includes('\\{city\\}'), 'expected larkDocWriter to escape {city}');
    await compileToString(patched);
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
    await testOperatorHeadingsKeepTextAndCustomAnchors();
    await testFeatureNoteIsPreservedAsGlobalMdxComponent();
    await testFeatureCardGridIsPreservedAsGlobalMdxComponent();
    await testHtmlTableClosingTagsAfterUppercaseTextArePreserved();
    await testHtmlBreakAfterUppercaseTextIsPreserved();
    await testMdxEsmExportsArePreserved();
    await testInvalidMdxEsmExportIsNotMutated();
    await testTranslatedImportProseCanBeRepaired();
    await testIndentedFencedCodeIsPreserved();
    await testConsecutivePlaintextFencesAreNotWidened();
    await testCppNamespaceTypesAreEscapedToEntities();
    await testCppNamespaceTypesWithoutClosingAngleAreEscaped();
    await testPlainTextBracesAreEscaped();
    await testLarkDocWriterEscapesPlainTextBraces();
    console.log('mdxPatcher regression tests passed');
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
