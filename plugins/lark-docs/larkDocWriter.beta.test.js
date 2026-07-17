const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const LarkDocScraper = require('./larkDocScraper')
const LarkDocWriter = require('./larkDocWriter')
const LarkSourceIndex = require('./larkSourceIndex')

async function withTempDir(callback) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lark-doc-writer-beta-'))
    try {
        await callback(dir)
    } finally {
        fs.rmSync(dir, { recursive: true, force: true })
    }
}

async function testBaseSourceMetaPreservesBeta() {
    await withTempDir(async dir => {
        fs.writeFileSync(path.join(dir, 'source.json'), JSON.stringify({
            title: 'Connect for On-Demand Search',
            name: 'Connect for On-Demand Search',
            slug: 'connect-for-on-demand-search',
            base_record_id: 'recvlURuqRVAAw',
            base_placement_type: 'canonical',
            base_targets: ['Zilliz.SaaS'],
            base_status: 'Draft',
            base_beta: ['PUBLIC'],
        }, null, 2))

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
            const meta = await writer.__is_to_publish(
                'Connect for On-Demand Search',
                'connect-for-on-demand-search',
            )

            assert.equal(meta.publish, true)
            assert.equal(meta.beta, 'PUBLIC')

            const frontMatter = writer.__front_matters(
                meta.title,
                'Cloud',
                meta.slug,
                meta.beta,
                null,
                'origin',
                'BTrNwoEfYii1e9kf0BScWDpcnA2',
            )
            assert.match(frontMatter, /^beta: PUBLIC$/m)
        } finally {
            writer.destroy()
        }
    })
}

async function testGuidesCanonicalDoesNotPublishWithoutProgress() {
    await withTempDir(async dir => {
        fs.writeFileSync(path.join(dir, 'source.json'), JSON.stringify({
            title: 'Marketplace Subscription',
            name: 'Marketplace Subscription',
            slug: 'marketplace-subscription',
            node_token: 'marketplace-token',
            base_record_id: 'recMarketplace',
            base_placement_type: 'canonical',
            base_targets: [],
            base_status: null,
        }, null, 2))

        const writer = new LarkDocWriter('root', 'base:*', 'default', dir, path.join(dir, 'images'), 'zilliz.saas', true, false)
        try {
            const meta = await writer.__is_to_publish('Marketplace Subscription', 'marketplace-subscription', 'marketplace-token')
            assert.equal(meta.publish, false)
        } finally {
            writer.destroy()
        }
    })
}

async function testSdkSourceKeepsLegacyProgressFiltering() {
    await withTempDir(async dir => {
        fs.writeFileSync(path.join(dir, 'source.json'), JSON.stringify({
            title: 'SDK Function',
            name: 'SDK Function',
            slug: 'sdk-function',
            node_token: 'sdk-token',
            base_record_id: 'recSdk',
            base_targets: ['Zilliz'],
            base_status: 'WIP',
        }, null, 2))

        const writer = new LarkDocWriter('root', 'base-token', 'pythonSidebar', dir, path.join(dir, 'images'), 'zilliz', true, false)
        try {
            const meta = await writer.__is_to_publish('SDK Function', 'sdk-function', 'sdk-token')
            assert.equal(meta.publish, false)
        } finally {
            writer.destroy()
        }
    })
}

function testScraperCopiesBetaToBaseSourceMeta() {
    const scraper = new LarkDocScraper('root', 'base:*', 'wiki', 'unused')
    const source = scraper.__source_base_meta({}, {
        record_id: 'recvlURuqRVAAw',
        base_table_id: 'tblWv7PjNDsexddH',
        base_table_name: 'Development',
        base_record_index: 1,
        fields: {
            Docs: '[Connect for On-Demand Search](https://zilliverse.feishu.cn/wiki/BTrNwoEfYii1e9kf0BScWDpcnA2)',
            Slug: 'connect-for-on-demand-search',
            Targets: ['Zilliz.SaaS'],
            Progress: 'Draft',
            Beta: ['PRIVATE'],
        },
    })

    assert.deepEqual(source.base_beta, ['PRIVATE'])
}

function testScraperOmitsPublishMetaForSections() {
    const scraper = new LarkDocScraper('root', 'base:*', 'wiki', 'unused')
    const source = scraper.__source_base_meta({}, {
        record_id: 'recSection',
        base_table_id: 'tblManagement',
        base_table_name: 'Management',
        base_record_index: 2,
        fields: {
            Docs: '[Scale Cluster](http://Scale Cluster)',
            'Placement Type': 'section',
            Progress: 'Deprecated',
            Targets: ['Zilliz.SaaS'],
            Beta: ['PUBLIC'],
        },
    })

    assert.equal(source.base_placement_type, 'section')
    assert.equal(Object.prototype.hasOwnProperty.call(source, 'base_status'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(source, 'base_targets'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(source, 'base_beta'), false)
}

function testScraperInfersSdkFeishuDocsAsCanonicalWithoutSlug() {
    const scraper = new LarkDocScraper('root', 'base', 'drive', 'unused')
    const source = scraper.__source_base_meta({}, {
        record_id: 'recSdkDoc',
        base_table_id: 'tblSdk',
        base_table_name: 'SDK',
        base_record_index: 1,
        fields: {
            Docs: { text: 'Create collection', link: 'https://example.feishu.cn/docx/sdk-doc-token' },
        },
    })

    assert.equal(source.base_placement_type, 'canonical')
    assert.equal(scraper.__is_structural_record({
        fields: {
            Docs: { text: 'Create collection', link: 'https://example.feishu.cn/docx/sdk-doc-token' },
        },
    }), false)
}

async function testScraperKeepsRecordsHiddenBySelectedView() {
    const scraper = new LarkDocScraper('root', 'base:*', 'wiki', 'unused')
    scraper.base_app_token = 'baseToken'
    scraper.__base_view_id = async () => 'viewA'

    scraper.__base_record_page = async (_token, _table, viewId = null) => {
        const items = viewId
            ? [{ record_id: 'recCanonical', fields: { Docs: 'Canonical' } }]
            : [
                { record_id: 'recCanonical', fields: { Docs: 'Canonical' } },
                { record_id: 'recSection', fields: { Docs: 'Section', 'Placement Type': 'section' } },
            ]
        return items.map((record, index) => ({
            ...record,
            base_table_id: 'tblManagement',
            base_table_name: 'Management',
            base_table_index: 0,
            base_record_index: index,
        }))
    }

    const records = await scraper.__base_records('token', {
        table_id: 'tblManagement',
        name: 'Management',
        index: 0,
    })

    assert.deepEqual(records.map(record => record.record_id), ['recCanonical', 'recSection'])
    assert.equal(records[0].base_record_index, 0)
    assert.equal(records[1].base_record_index, 1)
}

async function testSectionSourceWinsOverDeprecatedCanonicalWithSameSlug() {
    await withTempDir(async dir => {
        fs.writeFileSync(path.join(dir, 'canonical.json'), JSON.stringify({
            title: 'Scale Cluster',
            name: 'Scale Cluster',
            slug: 'scale-cluster',
            node_token: 'canonical-token',
            base_record_id: 'recCanonical',
            base_targets: ['Zilliz.SaaS'],
            base_status: 'Deprecated',
        }, null, 2))
        fs.writeFileSync(path.join(dir, 'section.json'), JSON.stringify({
            title: 'Scale Cluster',
            name: 'Scale Cluster',
            slug: 'scale-cluster',
            node_token: 'base:tblManagement:recSection',
            origin_node_token: 'base:tblManagement:recSection',
            base_record_id: 'recSection',
            base_placement_type: 'section',
            has_child: true,
        }, null, 2))

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
            const meta = await writer.__is_to_publish(
                'Scale Cluster',
                'scale-cluster',
                'base:tblManagement:recSection',
            )

            assert.equal(meta.publish, true)
            assert.equal(meta.title, 'Scale Cluster')
        } finally {
            writer.destroy()
        }
    })
}

async function testSidebarSkipsRefToTargetFilteredOutForCurrentTarget() {
    await withTempDir(async dir => {
        fs.writeFileSync(path.join(dir, 'root.json'), JSON.stringify({
            title: 'Root',
            slug: 'root',
            node_token: 'root',
            has_child: true,
            children: [
                {
                    title: 'Connect for On-Demand Search',
                    slug: 'connect-for-on-demand-search',
                    node_token: 'ref-token',
                    has_child: false,
                },
            ],
        }, null, 2))
        fs.writeFileSync(path.join(dir, 'ref.json'), JSON.stringify({
            title: 'Connect for On-Demand Search',
            name: 'Connect for On-Demand Search',
            slug: 'connect-for-on-demand-search',
            node_token: 'ref-token',
            base_record_id: 'recRef',
            base_nav_ref: true,
            base_nav_ref_target_token: 'target-token',
            base_targets: ['Zilliz.PaaS'],
            base_status: 'Draft',
        }, null, 2))
        fs.writeFileSync(path.join(dir, 'target.json'), JSON.stringify({
            title: 'Connect for On-Demand Search',
            name: 'Connect for On-Demand Search',
            slug: 'connect-for-on-demand-search',
            node_token: 'target-token',
            base_record_id: 'recTarget',
            base_targets: ['Zilliz.SaaS'],
            base_status: 'Draft',
            blocks: {
                items: [
                    { block_type: 1, page: {}, children: ['text-block'] },
                    { block_id: 'text-block', block_type: 2, text: { elements: [{ text_run: { content: 'body' } }] } },
                ],
            },
        }, null, 2))

        const writer = new LarkDocWriter(
            'root',
            'base:*',
            'default',
            dir,
            path.join(dir, 'images'),
            'zilliz.paas',
            true,
            false,
        )

        try {
            const items = await writer.generate_sidebar('docs-byoc/tutorials', 'docs-byoc')
            assert.deepEqual(items, [])
        } finally {
            writer.destroy()
        }
    })
}

async function testSidebarEmitsRefAsExistingDocItem() {
    await withTempDir(async dir => {
        fs.writeFileSync(path.join(dir, 'root.json'), JSON.stringify({
            title: 'Root',
            slug: 'root',
            node_token: 'root',
            has_child: true,
            children: [
                {
                    title: 'Canonical Page',
                    slug: 'canonical-page',
                    node_token: 'target-token',
                    has_child: false,
                },
                {
                    title: 'Reused Page',
                    slug: 'reused-page',
                    node_token: 'ref-token',
                    has_child: false,
                },
            ],
        }, null, 2))
        fs.writeFileSync(path.join(dir, 'target.json'), JSON.stringify({
            title: 'Canonical Page',
            name: 'Canonical Page',
            slug: 'canonical-page',
            node_token: 'target-token',
            parent_node_token: 'root',
            base_record_id: 'recTarget',
            base_placement_type: 'canonical',
            base_targets: ['Zilliz.SaaS'],
            base_status: 'Draft',
            blocks: {
                items: [
                    { block_type: 1, page: {}, children: ['text-block'] },
                    { block_id: 'text-block', block_type: 2, text: { elements: [{ text_run: { content: 'body' } }] } },
                ],
            },
        }, null, 2))
        fs.writeFileSync(path.join(dir, 'ref.json'), JSON.stringify({
            title: 'Reused Page',
            name: 'Reused Page',
            slug: 'reused-page',
            node_token: 'ref-token',
            parent_node_token: 'root',
            base_record_id: 'recRef',
            base_placement_type: 'ref',
            base_nav_ref: true,
            base_nav_ref_target_token: 'target-token',
            base_targets: ['Zilliz.SaaS'],
            base_status: 'Draft',
        }, null, 2))

        const writer = new LarkDocWriter(
            'root', 'base:*', 'default', dir, path.join(dir, 'images'),
            'zilliz.saas', true, false,
        )

        try {
            assert.deepEqual(await writer.generate_sidebar('docs/tutorials', 'docs'), [
                {
                    type: 'doc',
                    id: 'tutorials/canonical-page',
                    label: 'Canonical Page',
                    key: 'doc:tutorials/canonical-page',
                },
                {
                    type: 'doc',
                    id: 'tutorials/canonical-page',
                    label: 'Reused Page',
                    key: 'ref:tutorials/reused-page',
                },
            ])
        } finally {
            writer.destroy()
        }
    })
}

async function testSidebarKeepsEmptySectionAsCategory() {
    await withTempDir(async dir => {
        fs.writeFileSync(path.join(dir, 'root.json'), JSON.stringify({
            title: 'Root',
            slug: 'root',
            node_token: 'root',
            has_child: true,
            children: [{
                title: 'SCIM Provisioning',
                slug: 'scim-provisioning',
                node_token: 'section-token',
                has_child: false,
            }],
        }, null, 2))
        fs.writeFileSync(path.join(dir, 'section.json'), JSON.stringify({
            title: 'SCIM Provisioning',
            name: 'SCIM Provisioning',
            slug: 'scim-provisioning',
            node_token: 'section-token',
            base_placement_type: 'section',
            base_nav_virtual: true,
            has_child: false,
        }, null, 2))

        const writer = new LarkDocWriter(
            'root', 'base:*', 'default', dir, path.join(dir, 'images'),
            'zilliz.saas', true, false,
        )

        try {
            assert.deepEqual(await writer.generate_sidebar('docs/tutorials', 'docs'), [{
                type: 'category',
                label: 'SCIM Provisioning',
                key: 'category:tutorials/scim-provisioning',
                items: [],
            }])
        } finally {
            writer.destroy()
        }
    })
}

async function testBaseCanonicalWithChildrenKeepsLandingPage() {
    await withTempDir(async dir => {
        fs.writeFileSync(path.join(dir, 'root.json'), JSON.stringify({
            title: 'Root',
            slug: 'root',
            node_token: 'root',
            has_child: true,
            children: [{
                title: 'Best Practices',
                slug: 'best-practices',
                node_token: 'canonical-token',
                has_child: true,
            }],
        }, null, 2))
        fs.writeFileSync(path.join(dir, 'canonical.json'), JSON.stringify({
            title: 'Best Practices',
            name: 'Best Practices',
            slug: 'best-practices',
            node_token: 'canonical-token',
            parent_node_token: 'root',
            base_record_id: 'recCanonical',
            base_placement_type: 'canonical',
            base_targets: ['Zilliz.SaaS'],
            base_status: 'Draft',
            has_child: true,
            children: [{ title: 'Child', slug: 'child', node_token: 'child-token', has_child: false }],
            blocks: {
                items: [
                    { block_type: 1, page: {}, children: ['text-block'] },
                    { block_id: 'text-block', block_type: 2, text: { elements: [{ text_run: { content: 'short body' } }] } },
                ],
            },
        }, null, 2))
        fs.writeFileSync(path.join(dir, 'child.json'), JSON.stringify({
            title: 'Child',
            name: 'Child',
            slug: 'child',
            node_token: 'child-token',
            parent_node_token: 'canonical-token',
            base_record_id: 'recChild',
            base_placement_type: 'canonical',
            base_targets: ['Zilliz.SaaS'],
            base_status: 'Draft',
            has_child: false,
            blocks: {
                items: [
                    { block_type: 1, page: {}, children: ['text-block'] },
                    { block_id: 'text-block', block_type: 2, text: { elements: [{ text_run: { content: 'child body' } }] } },
                ],
            },
        }, null, 2))

        const writer = new LarkDocWriter(
            'root', 'base:*', 'default', dir, path.join(dir, 'images'),
            'zilliz.saas', true, false,
        )

        try {
            assert.deepEqual(await writer.generate_sidebar('docs/tutorials', 'docs'), [{
                type: 'category',
                label: 'Best Practices',
                key: 'category:tutorials/best-practices',
                link: { type: 'doc', id: 'tutorials/best-practices/best-practices' },
                items: [{
                    type: 'doc',
                    id: 'tutorials/best-practices/child',
                    label: 'Child',
                    key: 'doc:tutorials/best-practices/child',
                }],
            }])
        } finally {
            writer.destroy()
        }
    })
}

async function testFaqsExpandIntoCategoryWithoutLandingPage() {
    await withTempDir(async dir => {
        const sourceDir = path.join(dir, 'sources')
        const outputDir = path.join(dir, 'docs', 'tutorials')
        const faqDir = path.join(outputDir, 'faqs')
        fs.mkdirSync(sourceDir, { recursive: true })
        fs.mkdirSync(faqDir, { recursive: true })
        fs.writeFileSync(path.join(faqDir, 'faqs.md'), 'stale landing')
        fs.writeFileSync(path.join(sourceDir, 'root.json'), JSON.stringify({
            title: 'Root',
            slug: 'root',
            node_token: 'root',
            has_child: true,
            children: [{ title: 'FAQs', slug: 'faqs', node_token: 'faq-token', has_child: false }],
        }, null, 2))
        fs.writeFileSync(path.join(sourceDir, 'faqs.json'), JSON.stringify({
            title: 'FAQs',
            name: 'FAQs',
            slug: 'faqs',
            node_token: 'faq-token',
            parent_node_token: 'root',
            base_record_id: 'recFaqs',
            base_placement_type: 'canonical',
            base_targets: ['Zilliz.SaaS'],
            base_status: 'Draft',
            has_child: false,
            blocks: {
                items: [
                    { block_type: 1, page: {}, children: ['text-block'] },
                    { block_id: 'text-block', block_type: 2, text: { elements: [{ text_run: { content: 'body' } }] } },
                ],
            },
        }, null, 2))

        const writer = new LarkDocWriter(
            'root', 'base:*', 'default', sourceDir, path.join(dir, 'images'),
            'zilliz.saas', true, false,
        )

        try {
            writer.__markdown = async () => '## Account Questions{/faq-account}\nAccount summary\n\n**How?**\nAnswer.'
            await writer.write_faqs(faqDir)
            assert.equal(fs.existsSync(path.join(faqDir, 'faqs.md')), false)
            assert.equal(fs.existsSync(path.join(faqDir, 'faq-account.md')), true)
            assert.deepEqual(await writer.generate_sidebar(outputDir, path.join(dir, 'docs')), [{
                type: 'category',
                label: 'FAQs',
                key: 'category:tutorials/faqs',
                items: [{
                    type: 'doc',
                    id: 'tutorials/faqs/faq-account',
                    label: 'Account Questions',
                    key: 'doc:tutorials/faqs/faq-account',
                }],
            }])
        } finally {
            writer.destroy()
        }
    })
}

async function testIndexedSidebarDelegatesRefsParentsSectionsAndSlugLookups() {
    await withTempDir(async dir => {
        const pageBlocks = {
            items: [
                { block_type: 1, page: {}, children: ['text-block'] },
                { block_id: 'text-block', block_type: 2, text: { elements: [{ text_run: { content: 'body' } }] } },
            ],
        }
        const sources = [
            {
                title: 'Root', slug: 'root', node_token: 'root', has_child: true,
                children: [
                    { title: 'Section', slug: 'section', node_token: 'section-token', has_child: false },
                    { title: 'Category', slug: 'category', node_token: 'category-token', has_child: true },
                    { title: 'Reused Target', slug: 'reused-target', node_token: 'ref-token', has_child: false },
                ],
            },
            {
                title: 'Section', slug: 'section', node_token: 'section-token',
                base_placement_type: 'section', base_nav_virtual: true, has_child: false,
            },
            {
                title: 'Other Section', slug: 'other-section', node_token: 'section-token',
                base_placement_type: 'section', base_nav_virtual: true, has_child: false,
            },
            {
                title: 'Category', slug: 'category', node_token: 'category-token', parent_node_token: 'root',
                base_record_id: 'rec-category', base_placement_type: 'canonical',
                base_targets: ['Zilliz.SaaS'], base_status: 'Draft', has_child: true,
                children: [{ title: 'Target', slug: 'target', node_token: 'target-token', has_child: false }],
                blocks: pageBlocks,
            },
            {
                title: 'Target', slug: 'target', node_token: 'target-token', parent_node_token: 'category-token',
                origin_node_token: 'target-origin-token',
                base_record_id: 'rec-target', base_placement_type: 'canonical',
                base_targets: ['Zilliz.SaaS'], base_status: 'Draft', has_child: false,
                blocks: pageBlocks,
            },
            {
                title: 'Reused Target', slug: 'reused-target', node_token: 'ref-token', parent_node_token: 'root',
                base_record_id: 'rec-ref', base_placement_type: 'ref', base_nav_ref: true,
                base_nav_ref_target_token: 'target-origin-token', base_targets: ['Zilliz.SaaS'], base_status: 'Draft',
                has_child: false,
            },
        ]
        sources.forEach((source, index) => {
            fs.writeFileSync(path.join(dir, `${index}.json`), JSON.stringify(source, null, 2))
        })
        const loadedIndex = LarkSourceIndex.load(dir)
        const calls = []
        const sourceIndex = {
            find(typeOrTypes, value, options = {}) {
                calls.push({ method: 'find', typeOrTypes, value, options })
                return loadedIndex.find(typeOrTypes, value, options)
            },
            findAnyToken(token) {
                calls.push({ method: 'findAnyToken', token })
                return loadedIndex.findAnyToken(token)
            },
            findBaseSourceMeta(options) {
                calls.push({ method: 'findBaseSourceMeta', ...options })
                return loadedIndex.findBaseSourceMeta(options)
            },
        }
        for (let index = 0; index < sources.length; index += 1) {
            fs.writeFileSync(path.join(dir, `${index}.json`), 'corrupt after index construction')
        }
        const writer = new LarkDocWriter(
            'root', 'base:*', 'default', dir, path.join(dir, 'images'),
            'zilliz.saas', true, false, null, null, sourceIndex,
        )
        const readdirSync = fs.readdirSync
        let enumerations = 0
        fs.readdirSync = function countedReaddir(...args) {
            enumerations += 1
            return readdirSync.apply(this, args)
        }

        try {
            assert.deepEqual(await writer.generate_sidebar('docs/tutorials', 'docs'), [
                {
                    type: 'category',
                    label: 'Section',
                    key: 'category:tutorials/section',
                    items: [],
                },
                {
                    type: 'category',
                    label: 'Category',
                    key: 'category:tutorials/category',
                    link: { type: 'doc', id: 'tutorials/category/category' },
                    items: [{
                        type: 'doc',
                        id: 'tutorials/category/target',
                        label: 'Target',
                        key: 'doc:tutorials/category/target',
                    }],
                },
                {
                    type: 'doc',
                    id: 'tutorials/category/target',
                    label: 'Reused Target',
                    key: 'ref:tutorials/reused-target',
                },
            ])
        } finally {
            fs.readdirSync = readdirSync
            writer.destroy()
        }

        assert.equal(enumerations, 0)
        assert.ok(calls.some(call => call.method === 'find' &&
            call.value === 'section-token' && call.options.slug === 'section'))
        assert.ok(calls.some(call => call.method === 'findAnyToken' && call.token === 'target-origin-token'))
        assert.ok(calls.some(call => call.method === 'find' &&
            call.value === 'category-token' && call.options.slug === ''))
        assert.ok(calls.some(call => call.method === 'findBaseSourceMeta' &&
            call.title === 'Category' && call.slug === 'category' && call.token === 'category-token'))
    })
}

async function testRemoveStaleTokenFilesKeepsCurrentDestination() {
    await withTempDir(async dir => {
        const outputDir = path.join(dir, 'docs', 'tutorials')
        const oldDir = path.join(outputDir, 'old')
        const newDir = path.join(outputDir, 'new')
        fs.mkdirSync(oldDir, { recursive: true })
        fs.mkdirSync(newDir, { recursive: true })

        const oldPath = path.join(oldDir, 'moved.md')
        const newPath = path.join(newDir, 'moved.md')
        const otherPath = path.join(outputDir, 'other.md')

        fs.writeFileSync(oldPath, '---\ntoken: moved-token\n---\n# Old\n')
        fs.writeFileSync(newPath, '---\ntoken: moved-token\n---\n# New\n')
        fs.writeFileSync(otherPath, '---\ntoken: other-token\n---\n# Other\n')

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
            writer.outputRoot = outputDir
            writer.__remove_stale_token_files('moved-token', newPath)

            assert.equal(fs.existsSync(oldPath), false)
            assert.equal(fs.existsSync(newPath), true)
            assert.equal(fs.existsSync(otherPath), true)
        } finally {
            writer.destroy()
        }
    })
}

async function run() {
    testScraperCopiesBetaToBaseSourceMeta()
    testScraperOmitsPublishMetaForSections()
    testScraperInfersSdkFeishuDocsAsCanonicalWithoutSlug()
    await testScraperKeepsRecordsHiddenBySelectedView()
    await testSectionSourceWinsOverDeprecatedCanonicalWithSameSlug()
    await testSidebarSkipsRefToTargetFilteredOutForCurrentTarget()
    await testSidebarEmitsRefAsExistingDocItem()
    await testSidebarKeepsEmptySectionAsCategory()
    await testBaseCanonicalWithChildrenKeepsLandingPage()
    await testFaqsExpandIntoCategoryWithoutLandingPage()
    await testIndexedSidebarDelegatesRefsParentsSectionsAndSlugLookups()
    await testRemoveStaleTokenFilesKeepsCurrentDestination()
    await testBaseSourceMetaPreservesBeta()
    await testGuidesCanonicalDoesNotPublishWithoutProgress()
    await testSdkSourceKeepsLegacyProgressFiltering()
    console.log('larkDocWriter beta tests passed')
}

run().catch(error => {
    console.error(error)
    process.exit(1)
})
