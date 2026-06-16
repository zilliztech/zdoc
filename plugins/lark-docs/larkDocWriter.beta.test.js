const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const LarkDocScraper = require('./larkDocScraper')
const LarkDocWriter = require('./larkDocWriter')

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

async function run() {
    testScraperCopiesBetaToBaseSourceMeta()
    await testBaseSourceMetaPreservesBeta()
    console.log('larkDocWriter beta tests passed')
}

run().catch(error => {
    console.error(error)
    process.exit(1)
})
