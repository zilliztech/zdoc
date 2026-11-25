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

async function testValidateNextChannelTagsRejectsRetireInNextPages() {
    await withWriter(async writer => {
        assert.throws(
            () => writer.__validate_next_channel_tags('<NextChannel action="include">staged</NextChannel>', 'retire-in-next'),
            /Block-level <NextChannel> tags on a RETIRE-IN-NEXT page never render/,
        )
        assert.throws(
            () => writer.__validate_next_channel_tags('<NextChannel action="exclude">old wording</NextChannel>', 'retire-in-next'),
            /Block-level <NextChannel> tags on a RETIRE-IN-NEXT page never render/,
        )
    })
}

async function testFrontMattersEmitRetireInNextChannel() {
    await withWriter(async writer => {
        const frontMatter = writer.__front_matters(
            'Legacy Monolith',
            'Cloud',
            'legacy-monolith',
            null,
            null,
            'origin',
            'legacy-token',
            undefined,
            '',
            '',
            'default',
            '',
            'retire-in-next',
        )
        assert.match(frontMatter, /^channel: retire-in-next$/m)
        // The runtime sidebar bridge carries the same value so NEXT deployments
        // can hide the entry (the mirror of the NEXT filtering on CURRENT).
        assert.match(frontMatter, /^sidebar_custom_props:\n  channel: retire-in-next$/m)

        const currentFrontMatter = writer.__front_matters(
            'Legacy Monolith',
            'Cloud',
            'legacy-monolith',
            null,
            null,
            'origin',
            'legacy-token',
        )
        assert.doesNotMatch(currentFrontMatter, /^channel:/m)
        assert.doesNotMatch(currentFrontMatter, /^sidebar_custom_props:/m)
    })
}

async function testSidebarMarksRetireInNextDocsViaCustomProps() {
    await withTempDir(async dir => {
        fs.writeFileSync(path.join(dir, 'root.json'), JSON.stringify({
            title: 'Root',
            slug: 'root',
            node_token: 'root',
            has_child: true,
            children: [
                { title: 'Legacy Monolith', slug: 'legacy-monolith', node_token: 'legacy-token', has_child: false },
                { title: 'Split Part A', slug: 'split-part-a', node_token: 'split-token', has_child: false },
            ],
        }, null, 2))
        for (const [file, title, slug, token, channel] of [
            ['legacy', 'Legacy Monolith', 'legacy-monolith', 'legacy-token', 'RETIRE-IN-NEXT'],
            ['split', 'Split Part A', 'split-part-a', 'split-token', null],
        ]) {
            fs.writeFileSync(path.join(dir, `${file}.json`), JSON.stringify({
                title,
                name: title,
                slug,
                node_token: token,
                parent_node_token: 'root',
                base_record_id: `rec-${file}`,
                base_placement_type: 'canonical',
                base_targets: ['Zilliz.SaaS'],
                base_status: 'Draft',
                base_channel: channel,
                blocks: {
                    items: [
                        { block_type: 1, page: {}, children: ['text-block'] },
                        { block_id: 'text-block', block_type: 2, text: { elements: [{ text_run: { content: 'body' } }] } },
                    ],
                },
            }, null, 2))
        }

        const writer = new LarkDocWriter(
            'root', 'base:*', 'default', dir, path.join(dir, 'images'),
            'zilliz.saas', true, false,
        )

        try {
            assert.deepEqual(await writer.generate_sidebar('docs/tutorials', 'docs'), [
                {
                    type: 'doc',
                    id: 'tutorials/legacy-monolith',
                    label: 'Legacy Monolith',
                    key: 'doc:tutorials/legacy-monolith',
                    customProps: { channel: 'retire-in-next' },
                },
                {
                    type: 'doc',
                    id: 'tutorials/split-part-a',
                    label: 'Split Part A',
                    key: 'doc:tutorials/split-part-a',
                },
            ])
        } finally {
            writer.destroy()
        }
    })
}

function writeRefFixture(dir, { refChannel = null, targetChannel = null } = {}) {
    fs.writeFileSync(path.join(dir, 'root.json'), JSON.stringify({
        title: 'Root',
        slug: 'root',
        node_token: 'root',
        has_child: true,
        children: [
            { title: 'Cross Line Entry', slug: 'cross-line-entry', node_token: 'ref-token', has_child: false },
        ],
    }, null, 2))
    fs.writeFileSync(path.join(dir, 'ref.json'), JSON.stringify({
        title: 'Cross Line Entry',
        name: 'Cross Line Entry',
        slug: 'cross-line-entry',
        node_token: 'ref-token',
        parent_node_token: 'root',
        base_record_id: 'recRef',
        base_nav_ref: true,
        base_nav_ref_target_token: 'target-token',
        base_targets: ['Zilliz.SaaS'],
        base_status: 'Draft',
        base_channel: refChannel,
    }, null, 2))
    fs.writeFileSync(path.join(dir, 'target.json'), JSON.stringify({
        title: 'Target Page',
        name: 'Target Page',
        slug: 'target-page',
        node_token: 'target-token',
        parent_node_token: 'root',
        base_record_id: 'recTarget',
        base_targets: ['Zilliz.SaaS'],
        base_status: 'Draft',
        base_channel: targetChannel,
        blocks: {
            items: [
                { block_type: 1, page: {}, children: ['text-block'] },
                { block_id: 'text-block', block_type: 2, text: { elements: [{ text_run: { content: 'body' } }] } },
            ],
        },
    }, null, 2))
}

async function withRefWriter(dir, callback) {
    const writer = new LarkDocWriter(
        'root', 'base:*', 'default', dir, path.join(dir, 'images'),
        'zilliz.saas', true, false,
    )
    try {
        return await callback(writer)
    } finally {
        writer.destroy()
    }
}

function refSharedBundle(releaseChannel) {
    return {
        group: 'guides',
        bundle: {
            outcomes: [{ status: 'fallback', record_id: 'recTarget', baseline: { outputs: [{ path: 'content/en/guides/target-page.mdx' }] } }],
            effective_active: { pages: [] },
            preparation: { previous_snapshot: {
                navigation_records: [{ record_id: 'recTarget' }],
                records: [{ record_id: 'recTarget', release_channel: releaseChannel }],
            } },
        },
    }
}

async function testRefSidebarChannelFollowsTargetByDefault() {
    // Unmarked ref (the default) + NEXT target: the entry keeps the target's
    // channel — the historical "target wins" behavior must stay untouched.
    await withTempDir(async dir => {
        writeRefFixture(dir, { targetChannel: 'NEXT' })
        await withRefWriter(dir, async writer => {
            assert.deepEqual(await writer.generate_sidebar('docs/tutorials', 'docs'), [
                {
                    type: 'link',
                    href: '/docs/target-page',
                    label: 'Cross Line Entry',
                    key: 'ref:tutorials/cross-line-entry',
                    customProps: { channel: 'next' },
                },
            ])
        })
    })
}

async function testRefSidebarExplicitChannelOverridesTarget() {
    await withTempDir(async dir => {
        // A NEXT-marked ref pointing at a CURRENT-live target: the ref mark wins.
        writeRefFixture(dir, { refChannel: 'NEXT' })
        await withRefWriter(dir, async writer => {
            const [item] = await writer.generate_sidebar('docs/tutorials', 'docs')
            assert.equal(item.customProps.channel, 'next')
        })
        // RETIRE-IN-NEXT refs ride the same explicit-override path.
        writeRefFixture(dir, { refChannel: 'RETIRE-IN-NEXT' })
        await withRefWriter(dir, async writer => {
            const [item] = await writer.generate_sidebar('docs/tutorials', 'docs')
            assert.equal(item.customProps.channel, 'retire-in-next')
        })
        // An explicit CURRENT ref must NOT mask a NEXT target (fail-closed: the
        // override whitelist never widens into an unconditional "ref wins").
        writeRefFixture(dir, { refChannel: 'CURRENT', targetChannel: 'NEXT' })
        await withRefWriter(dir, async writer => {
            const [item] = await writer.generate_sidebar('docs/tutorials', 'docs')
            assert.equal(item.customProps.channel, 'next')
        })
    })
}

async function testRefSidebarSharedFallbackChannelIgnoresRefMark() {
    // When the target rides the shared fallback path, its channel comes from
    // the activation gate's previous snapshot — the ref row's own mark is
    // ignored there, even an explicit one. Asserted on __sidebar_items
    // directly: projectFallbackSidebar only decorates the synthetic fallback
    // rows it creates, never existing link entries, so it is out of scope.
    await withTempDir(async dir => {
        writeRefFixture(dir, { refChannel: 'RETIRE-IN-NEXT' })
        await withRefWriter(dir, async writer => {
            writer.sharedBundle = refSharedBundle('next')
            const [item] = await writer.__sidebar_items('docs/tutorials', 'docs', 'root')
            assert.equal(item.customProps.channel, 'next')
        })
        await withRefWriter(dir, async writer => {
            writer.sharedBundle = refSharedBundle('current')
            const [item] = await writer.__sidebar_items('docs/tutorials', 'docs', 'root')
            assert.equal(item.customProps, undefined)
        })
    })
}

async function testRefSidebarEntryIsNavigationOnlyLinkShape() {
    // The emitted entry must stay a plain link: no anchor fragment, no docId.
    // docs-ui exempts docId-less links from the client path gate precisely
    // because of this shape (releaseChannel.ts isNavigationOnlyLinkItem).
    await withTempDir(async dir => {
        writeRefFixture(dir, { refChannel: 'NEXT' })
        await withRefWriter(dir, async writer => {
            const [item] = await writer.generate_sidebar('docs/tutorials', 'docs')
            assert.deepEqual(item, {
                type: 'link',
                href: '/docs/target-page',
                label: 'Cross Line Entry',
                key: 'ref:tutorials/cross-line-entry',
                customProps: { channel: 'next' },
            })
            assert.equal('docId' in item, false)
        })
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
    await testValidateNextChannelTagsRejectsRetireInNextPages()
    await testFrontMattersEmitRetireInNextChannel()
    await testSidebarMarksRetireInNextDocsViaCustomProps()
    await testRefSidebarChannelFollowsTargetByDefault()
    await testRefSidebarExplicitChannelOverridesTarget()
    await testRefSidebarSharedFallbackChannelIgnoresRefMark()
    await testRefSidebarEntryIsNavigationOnlyLinkShape()
    await testExtractDescriptionResolvesCurrentView()
    await testValidateChannelCodeDirectivesAcceptsWellFormedFences()
    await testValidateChannelCodeDirectivesRejectsStructuralErrors()
    console.log('larkDocWriter next-channel tests passed')
}

run().catch(error => {
    console.error(error)
    process.exit(1)
})
