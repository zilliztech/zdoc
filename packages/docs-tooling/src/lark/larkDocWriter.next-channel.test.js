const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const LarkDocWriter = require('./larkDocWriter')

async function withTempDir(callback) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-doc-writer-next-channel-'))
    try {
        await callback(dir)
    } finally {
        fs.rmSync(dir, { recursive: true, force: true })
    }
}

async function withWriter(callback) {
    await withTempDir(async dir => {
        const writer = new LarkDocWriter(
            'root',
            'base:*',
            'default',
            dir,
            path.join(dir, 'images'),
            'zilliz.saas',
            true,
            false,
        )
        try {
            await callback(writer)
        } finally {
            writer.destroy()
        }
    })
}

async function testFilterContentPassesNextChannelTagsThrough() {
    await withWriter(async writer => {
        const markdown = [
            '# Title',
            '',
            '<NextChannel action="include">staged for next</NextChannel>',
            '',
            '<NextChannel action="exclude">replaced once next ships</NextChannel>',
            '',
            '<include target="paas">byoc-only prose</include>',
            '',
            'always visible',
        ].join('\n')

        const filtered = writer.__filter_content(markdown, 'zilliz.saas')

        // Channel tags must survive scraping untouched: the runtime gate
        // resolves them after the shared build, so stripping here would drop
        // the staged blocks from every deployment.
        assert.ok(filtered.includes('<NextChannel action="include">staged for next</NextChannel>'))
        assert.ok(filtered.includes('<NextChannel action="exclude">replaced once next ships</NextChannel>'))
        // The product axis keeps its scrape-time behavior for this target.
        assert.ok(!filtered.includes('byoc-only prose'))
        assert.ok(filtered.includes('always visible'))
    })
}

async function testFilterContentRejectsReservedChannelTargets() {
    await withWriter(async writer => {
        assert.throws(
            () => writer.__filter_content('<include target="next">staged</include>', 'zilliz.saas'),
            /Reserved release-channel target "next" on <include>.*<NextChannel/,
        )
        assert.throws(
            () => writer.__filter_content('<exclude target="CURRENT">old</exclude>', 'zilliz.saas'),
            /Reserved release-channel target "CURRENT" on <exclude>/,
        )
    })
}

async function testValidateNextChannelTagsAcceptsWellFormedTags() {
    await withWriter(async writer => {
        const markdown = [
            '# Title',
            '',
            '<NextChannel action="include">staged</NextChannel>',
            '',
            '<NextChannel action="exclude">replaced</NextChannel><NextChannel action="include">replacement</NextChannel>',
        ].join('\n')

        writer.__validate_next_channel_tags(markdown, 'current')
        writer.__validate_next_channel_tags('# Untagged\n\nbody only', 'current')
        writer.__validate_next_channel_tags('# Untagged\n\nbody only', 'next')
    })
}

async function testValidateNextChannelTagsRejectsStructuralErrors() {
    await withWriter(async writer => {
        assert.throws(
            () => writer.__validate_next_channel_tags('<NextChannel action="include">staged', 'current'),
            /Unbalanced <NextChannel> tags: 1 opening vs 0 closing/,
        )
        assert.throws(
            () => writer.__validate_next_channel_tags('<NextChannel action="show">staged</NextChannel>', 'current'),
            /action attribute must be exactly "include" or "exclude"/,
        )
        assert.throws(
            () => writer.__validate_next_channel_tags('<NextChannel>staged</NextChannel>', 'current'),
            /action attribute must be exactly "include" or "exclude"/,
        )
        assert.throws(
            () => writer.__validate_next_channel_tags(
                '<NextChannel action="include">outer <NextChannel action="include">inner</NextChannel></NextChannel>',
                'current',
            ),
            /Nested <NextChannel> tags are not supported/,
        )
    })
}

async function testValidateNextChannelTagsRejectsNextChannelPages() {
    await withWriter(async writer => {
        assert.throws(
            () => writer.__validate_next_channel_tags('<NextChannel action="include">staged</NextChannel>', 'next'),
            /Block-level <NextChannel> tags on a NEXT-channel page never render/,
        )
    })
}

async function testExtractDescriptionResolvesCurrentView() {
    await withWriter(async writer => {
        const inline = [
            '# Title',
            '',
            'Use clusters <NextChannel action="include">with serverless</NextChannel> to scale.',
        ].join('\n')
        assert.equal(writer.__extract_description(inline), 'Use clusters to scale.')

        const replaced = [
            '# Title',
            '',
            'Pricing is <NextChannel action="exclude">old</NextChannel><NextChannel action="include">new</NextChannel>.',
        ].join('\n')
        assert.equal(writer.__extract_description(replaced), 'Pricing is old.')

        // A paragraph that is entirely staged has no CURRENT-view description;
        // extraction falls through to the next paragraph.
        const stagedOnly = [
            '# Title',
            '',
            '<NextChannel action="include">staged only</NextChannel>',
            '',
            'Next paragraph.',
        ].join('\n')
        assert.equal(writer.__extract_description(stagedOnly), 'Next paragraph.')
    })
}

async function testValidateChannelCodeDirectivesAcceptsWellFormedFences() {
    await withWriter(async writer => {
        const valid = [
            '# Title',
            '',
            '```python',
            'client.setup()',
            '# current-channel-start',
            'client.legacy()',
            '# current-channel-end',
            '# next-channel-start',
            'client.serverless()',
            '# next-channel-end',
            '# next-channel-next-line',
            'client.flush()',
            '```',
            '',
            '```js',
            '// current-channel-next-line',
            'legacyCall()',
            '/* next-channel-start */',
            'modernCall()',
            '/* next-channel-end */',
            '```',
        ].join('\n')

        writer.__validate_channel_code_directives(valid)
        writer.__validate_channel_code_directives('# Untagged\n\n```python\nplain()\n```')
    })
}

async function testValidateChannelCodeDirectivesRejectsStructuralErrors() {
    await withWriter(async writer => {
        const fence = body => ['# Title', '', '```python', ...body, '```'].join('\n')
        assert.throws(
            () => writer.__validate_channel_code_directives(fence(['# next-channel-start', 'a()', '# next-channel-start', 'b()', '# next-channel-end'])),
            /Nested channel code regions are not supported/,
        )
        assert.throws(
            () => writer.__validate_channel_code_directives(fence(['# next-channel-end'])),
            /Channel code end directive without a matching start/,
        )
        assert.throws(
            () => writer.__validate_channel_code_directives(fence(['# next-channel-start', 'a()', '# current-channel-end'])),
            /Channel code end directive mismatched: region "next" closed by "current"/,
        )
        assert.throws(
            () => writer.__validate_channel_code_directives(fence(['# next-channel-start', 'a()'])),
            /Unclosed channel code region "next"/,
        )
        assert.throws(
            () => writer.__validate_channel_code_directives(fence(['# next-channel-next-line', '# current-channel-start'])),
            /next-line directive must be followed by a code line/,
        )
    })
}

async function run() {
    await testFilterContentPassesNextChannelTagsThrough()
    await testFilterContentRejectsReservedChannelTargets()
    await testValidateNextChannelTagsAcceptsWellFormedTags()
    await testValidateNextChannelTagsRejectsStructuralErrors()
    await testValidateNextChannelTagsRejectsNextChannelPages()
    await testExtractDescriptionResolvesCurrentView()
    await testValidateChannelCodeDirectivesAcceptsWellFormedFences()
    await testValidateChannelCodeDirectivesRejectsStructuralErrors()
    console.log('larkDocWriter next-channel tests passed')
}

run().catch(error => {
    console.error(error)
    process.exit(1)
})
