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

async function run() {
    await testFilterContentPassesNextChannelTagsThrough()
    await testFilterContentRejectsReservedChannelTargets()
    await testValidateNextChannelTagsAcceptsWellFormedTags()
    await testValidateNextChannelTagsRejectsStructuralErrors()
    await testValidateNextChannelTagsRejectsNextChannelPages()
    console.log('larkDocWriter next-channel tests passed')
}

run().catch(error => {
    console.error(error)
    process.exit(1)
})
