const fs = require('fs')
const path = require('path')
const slugify = require('slugify')
const Scraper = require('../plugins/lark-docs/larkDocScraper.js')

const reportPath = process.argv[2] || './plugins/lark-docs/meta/reports/guides-broken-content-links.json'
const sourceDir = process.argv[3] || './plugins/lark-docs/meta/sources/guides'
const outJson = process.argv[4] || './plugins/lark-docs/meta/reports/guides-link-replacement-candidates.json'
const outMd = process.argv[5] || './plugins/lark-docs/meta/reports/guides-link-replacement-candidates.md'
const outShim = process.argv[6] || './plugins/lark-docs/meta/reports/guides-link-replacement-shim.draft.json'

const norm = value => String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/node\.js/g, 'nodejs')
    .replace(/c\+\+/g, 'cpp')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')

const tokens = value => norm(value).split(' ').filter(word => word && word.length > 1)

function jaccard(a, b) {
    const left = new Set(tokens(a))
    const right = new Set(tokens(b))
    if (!left.size || !right.size) return 0
    let intersection = 0
    for (const item of left) {
        if (right.has(item)) intersection++
    }
    return intersection / (left.size + right.size - intersection)
}

function levenshteinRatio(a, b) {
    a = norm(a)
    b = norm(b)
    if (!a || !b) return 0
    const rows = a.length
    const cols = b.length
    const dp = Array.from({ length: rows + 1 }, () => Array(cols + 1))
    for (let i = 0; i <= rows; i++) dp[i][0] = i
    for (let j = 0; j <= cols; j++) dp[0][j] = j
    for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= cols; j++) {
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            )
        }
    }
    return 1 - dp[rows][cols] / Math.max(rows, cols)
}

function bestScore(queries, candidate) {
    let best = { score: 0, priority: 0, reason: '', query: '' }
    const fields = [
        ['title', candidate.title, 4],
        ['slug', candidate.slug, 3],
        ['label', candidate.labels, 2],
    ]

    for (const querySpec of queries.filter(query => query.value)) {
        const query = querySpec.value
        const normalizedQuery = norm(query)
        const querySlug = slugify(query, { lower: true, strict: true })
        for (const [field, value, fieldPriority] of fields) {
            const normalizedValue = norm(value)
            if (!normalizedValue) continue

            let score
            let reason
            if (normalizedValue === normalizedQuery) {
                score = 100
                reason = `exact ${field}`
            } else if (field === 'slug' && String(value || '') === querySlug) {
                score = 96
                reason = 'slug exact'
            } else if (
                normalizedQuery.length >= 4 &&
                (normalizedValue.includes(normalizedQuery) || normalizedQuery.includes(normalizedValue))
            ) {
                score = 86
                reason = `substring ${field}`
            } else {
                const overlap = jaccard(query, value)
                const similarity = levenshteinRatio(query, value)
                score = Math.round(Math.max(overlap * 82, similarity * 70))
                reason = overlap * 82 >= similarity * 70 ? `word overlap ${field}` : `similar ${field}`
            }

            const priority = querySpec.priority + fieldPriority
            if (score > best.score || (score === best.score && priority > best.priority)) {
                best = { score, priority, reason, query }
            }
        }
    }
    return best
}

function sourceByToken() {
    const map = new Map()
    if (!fs.existsSync(sourceDir)) return map
    for (const file of fs.readdirSync(sourceDir).filter(file => file.endsWith('.json'))) {
        const source = JSON.parse(fs.readFileSync(path.join(sourceDir, file), 'utf8'))
        for (const token of [source.node_token, source.origin_node_token, source.obj_token, source.token].filter(Boolean)) {
            map.set(token, {
                file,
                title: source.title || source.name || '',
                slug: source.slug || '',
            })
        }
    }
    return map
}

function markdownEscape(value) {
    return String(value || '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

async function main() {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
    const scraper = new Scraper(
        'Tg6mwbRGDitPQ3kLUQzc44I7nth',
        'Ac7xbs2k1ad7bjsCXr0ccHe9nMh:*',
        'wiki',
        sourceDir
    )
    await scraper.__base()

    const sources = sourceByToken()
    const canonicalRecords = scraper.records
        .filter(record => scraper.__placement_type(record) === 'canonical')
        .map(record => {
            const docField = scraper.__doc_field(record.fields)
            const docToken = scraper.__doc_token(docField)
            return {
                record_id: record.record_id,
                table_id: record.base_table_id,
                table_name: record.base_table_name,
                title: scraper.__record_title(record),
                labels: scraper.__plain_value(record.fields.Labels) || '',
                slug: scraper.__record_slug(record),
                doc_token: docToken,
                doc_link: scraper.__doc_link(docField) || '',
            }
        })
        .filter(record => record.doc_token)

    const groups = new Map()
    for (const broken of report.broken_content_links) {
        const group = groups.get(broken.token) || {
            target_token: broken.token,
            target_url: broken.raw_url || broken.url,
            texts: new Map(),
            occurrences: [],
            target_source: sources.get(broken.token) || null,
        }
        group.texts.set(broken.link_text || '', (group.texts.get(broken.link_text || '') || 0) + 1)
        group.occurrences.push({
            source_title: broken.source_title,
            source_token: broken.source_token,
            source_slug: broken.source_slug,
            source_file: broken.source_file,
            source_type: broken.source_type,
            block_id: broken.block_id,
            link_text: broken.link_text,
            raw_url: broken.raw_url,
            anchor: broken.anchor,
        })
        groups.set(broken.token, group)
    }

    const items = [...groups.values()].map(group => {
        const textEntries = [...group.texts.entries()].sort((a, b) => b[1] - a[1])
        const queries = [
            { value: group.target_source?.title, priority: 40 },
            { value: group.target_source?.slug, priority: 30 },
            ...textEntries.map(([text, count]) => ({
                value: text,
                priority: Math.min(20 + count, 28),
            })),
        ].filter(Boolean)

        const candidates = canonicalRecords
            .map(candidate => ({ ...candidate, ...bestScore(queries, candidate) }))
            .filter(candidate => candidate.score >= 45)
            .sort((a, b) =>
                b.score - a.score ||
                b.priority - a.priority ||
                a.title.localeCompare(b.title)
            )
            .slice(0, 8)

        const top = candidates[0]
        const confidence = top?.score >= 95 && /^(exact title|slug exact)$/.test(top.reason) ? 'exact'
            : top?.score >= 80 ? 'strong'
            : top?.score >= 60 ? 'possible'
            : top ? 'weak'
            : 'none'

        return {
            target_token: group.target_token,
            target_url: group.target_url,
            target_source: group.target_source,
            occurrence_count: group.occurrences.length,
            link_texts: textEntries.map(([text, count]) => ({ text, count })),
            confidence,
            candidates,
            occurrences: group.occurrences.slice(0, 10),
        }
    }).sort((a, b) =>
        b.occurrence_count - a.occurrence_count ||
        (b.candidates[0]?.score || 0) - (a.candidates[0]?.score || 0)
    )

    const summary = {
        generated_at: new Date().toISOString(),
        broken_target_tokens: items.length,
        broken_occurrences: report.summary.broken_content_links,
        canonical_records: canonicalRecords.length,
        confidence_counts: items.reduce((acc, item) => {
            acc[item.confidence] = (acc[item.confidence] || 0) + 1
            return acc
        }, {}),
    }

    const output = { summary, items }
    fs.mkdirSync(path.dirname(outJson), { recursive: true })
    fs.writeFileSync(outJson, JSON.stringify(output, null, 2))

    const shim = {
        schema_version: 1,
        generated_at: summary.generated_at,
        source_report: reportPath,
        source_candidates: outJson,
        note: 'Draft only. Set approved=true, enabled=true, or status="approved" on a replacement before using it during export.',
        replacements: items
            .filter(item => item.candidates.length > 0)
            .map(item => {
                const candidate = item.candidates[0]
                return {
                    approved: false,
                    source_token: item.target_token,
                    source_url: item.target_url,
                    replacement_token: candidate.doc_token,
                    replacement_url: candidate.doc_link,
                    replacement_title: candidate.title,
                    replacement_slug: candidate.slug,
                    replacement_record_id: candidate.record_id,
                    replacement_table: candidate.table_name,
                    confidence: item.confidence,
                    score: candidate.score,
                    reason: candidate.reason,
                    query: candidate.query,
                    preserve_anchor: false,
                    occurrence_count: item.occurrence_count,
                    link_texts: item.link_texts,
                }
            }),
    }
    fs.writeFileSync(outShim, JSON.stringify(shim, null, 2))

    const lines = []
    lines.push('# Guides Broken Link Replacement Candidates', '')
    lines.push(`Generated: ${summary.generated_at}`)
    lines.push(`Broken target tokens: ${summary.broken_target_tokens}`)
    lines.push(`Broken occurrences: ${summary.broken_occurrences}`)
    lines.push(`Canonical records searched: ${summary.canonical_records}`)
    lines.push(`Confidence: ${JSON.stringify(summary.confidence_counts)}`, '')

    for (const item of items) {
        lines.push(`## ${item.link_texts[0]?.text || item.target_source?.title || item.target_token}`)
        lines.push(`- Target token: \`${item.target_token}\``)
        lines.push(`- Target URL: ${item.target_url || '(missing)'}`)
        if (item.target_source) {
            lines.push(`- Old source title: ${item.target_source.title} (${item.target_source.slug || 'no slug'})`)
        }
        lines.push(`- Occurrences: ${item.occurrence_count}`)
        lines.push(`- Link text variants: ${item.link_texts.slice(0, 6).map(entry => `${entry.text || '(empty)'} (${entry.count})`).join(', ')}`)
        lines.push(`- Confidence: ${item.confidence}`)

        if (item.candidates.length) {
            lines.push('', '| Score | Candidate | Table | Slug | Record | Doc | Reason |')
            lines.push('| ---: | --- | --- | --- | --- | --- | --- |')
            for (const candidate of item.candidates.slice(0, 5)) {
                lines.push(`| ${candidate.score} | ${markdownEscape(candidate.title)} | ${markdownEscape(candidate.table_name)} | \`${candidate.slug}\` | \`${candidate.record_id}\` | [open](${candidate.doc_link}) | ${markdownEscape(candidate.reason)}; query: ${markdownEscape(candidate.query)} |`)
            }
        } else {
            lines.push('- No candidate above threshold.')
        }

        lines.push('', '<details><summary>Sample occurrences</summary>', '')
        for (const occurrence of item.occurrences.slice(0, 5)) {
            lines.push(`- ${markdownEscape(occurrence.source_title)} / block \`${occurrence.block_id}\` / ${occurrence.source_type} / text: ${markdownEscape(occurrence.link_text)}`)
        }
        lines.push('', '</details>', '')
    }

    fs.writeFileSync(outMd, lines.join('\n'))

    console.log(JSON.stringify({
        summary,
        json: outJson,
        markdown: outMd,
        shim: outShim,
        top: items.slice(0, 10).map(item => ({
            text: item.link_texts[0]?.text,
            occurrences: item.occurrence_count,
            confidence: item.confidence,
            top: item.candidates[0] && {
                score: item.candidates[0].score,
                title: item.candidates[0].title,
                table: item.candidates[0].table_name,
                reason: item.candidates[0].reason,
            },
        })),
    }, null, 2))
}

main().catch(error => {
    console.error(error)
    process.exit(1)
})
