#!/usr/bin/env node
'use strict'

// Translation gate for the 2026-10-30 merge model: mirrors and additions
// introduce upstream prose that the fragments never authored, so zh-CN/ja-JP
// must be complete BEFORE anything lands. zh copies the upstream x-i18n when
// the spec carries it (API truth from the API producer); everything else —
// and all Japanese — is translated here on the same gateway the decision
// stage uses. Fail-closed: a value whose prose cannot be completed in BOTH
// languages is dropped from the change set entirely and reported, never
// applied half-translated (an English-only parameter must not appear on the
// Chinese site, and no locale may lag another again — the PR #964 lesson).

const fs = require('node:fs')
const path = require('node:path')

const TOOLING_ROOT = path.join(__dirname, '..', '..', 'packages', 'docs-tooling', 'src', 'reference', 'rest')
const {proseNodes, isTranslationComplete} = require(path.join(TOOLING_ROOT, 'upstreamDiff', 'mirror'))
const {chatCompletionsUrl, parseModelContent, parseArgs} = require('./decide-batches')

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000
const DEFAULT_RETRIES = 3
const TRANSLATABLE_KINDS = new Set(['mirror', 'addition'])

function usage() {
    return 'Usage: node scripts/rest-upstream/translate-additions.js --change-set <path> --out <file> --base-url <url> --api-key-env <NAME> --model <id> [--report <path>] [--timeout-ms 300000] [--retries 3]'
}

function fail(message) {
    throw new Error(message)
}

const missingLanguage = (node, lang) => (node['x-i18n']?.[lang]?.description ?? '').trim() ? false : true

function translationPrompt() {
    return [
        'You translate REST API reference prose. For each item you receive an index and an English description from an OpenAPI schema; you return the Simplified Chinese (zh) and Japanese (ja) translations.',
        'Output strict JSON only: {"translations":[{"i":<index>,"zh":"...","ja":"..."}]} with every input index present exactly once.',
        'Rules:',
        '1. Translate for API documentation: concise, technical, no additions or commentary.',
        '2. Keep markdown links, backticks, field names, enum values, and placeholders (e.g. {CLUSTER_ID}) exactly as written.',
        '3. Keep product terms the docs keep in English (Volume, Cluster, Collection, Partition, Pipeline, Stage, and similar) unless the sentence reads unnaturally without translating them.',
        '4. Never leave an empty string; if the text is pure punctuation or a lone symbol, repeat it.',
    ].join('\n')
}

async function callModel({items, baseUrl, apiKey, model, timeoutMs, fetchImpl}) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
        const response = await fetchImpl(chatCompletionsUrl(baseUrl), {
            method: 'POST',
            headers: {'content-type': 'application/json', authorization: `Bearer ${apiKey}`},
            body: JSON.stringify({
                model,
                temperature: 0,
                response_format: {type: 'json_object'},
                messages: [
                    {role: 'system', content: translationPrompt()},
                    {role: 'user', content: `Translate these ${items.length} API description(s).\n\n${items.map(item => JSON.stringify(item)).join('\n')}`},
                ],
            }),
            signal: controller.signal,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`)
        const body = await response.json()
        return body.choices?.[0]?.message?.content
    } finally {
        clearTimeout(timer)
    }
}

function parseTranslations(content) {
    const parsed = parseModelContent(content)
    if (!parsed || !Array.isArray(parsed.translations)) fail('REST_UPSTREAM_TRANSLATE_RESPONSE_INVALID: response has no translations array')
    const byIndex = new Map()
    for (const line of parsed.translations) {
        if (!line || typeof line !== 'object' || !Number.isInteger(line.i)) continue
        if (typeof line.zh !== 'string' || !line.zh.trim() || typeof line.ja !== 'string' || !line.ja.trim()) continue
        byIndex.set(line.i, {zh: line.zh.trim(), ja: line.ja.trim()})
    }
    return byIndex
}

// Returns {changeSet, report}: the change set with mirror/addition values
// translation-complete, minus any entry whose prose could not be completed
// (those ride the report back to the PR body as human-review items).
async function translateChangeSet({changeSet, baseUrl, apiKeyEnv, model, timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, fetchImpl = globalThis.fetch}) {
    if (!changeSet || !baseUrl || !apiKeyEnv || !model) fail(usage())
    const apiKey = process.env[apiKeyEnv]
    if (!apiKey) fail(`REST_UPSTREAM_TRANSLATE_API_KEY_MISSING: --api-key-env ${apiKeyEnv} is not set`)
    const report = {model, translatedEntries: 0, translatedNodes: 0, degraded: []}
    const translated = []
    for (const entry of changeSet.entries) {
        if (!TRANSLATABLE_KINDS.has(entry.kind) || !entry.value || typeof entry.value !== 'object') {
            translated.push(entry)
            continue
        }
        const nodes = proseNodes(entry.value)
        const pending = []
        nodes.forEach((node, index) => {
            const needZh = missingLanguage(node, 'zh-CN')
            const needJa = missingLanguage(node, 'ja-JP')
            if (needZh || needJa) pending.push({i: index, text: node.description, needZh, needJa})
        })
        if (pending.length === 0) {
            translated.push(entry)
            continue
        }
        let byIndex = null
        let lastError = null
        for (let attempt = 0; attempt < retries && !byIndex; attempt++) {
            try {
                byIndex = parseTranslations(await callModel({items: pending, baseUrl, apiKey, model, timeoutMs, fetchImpl}))
            } catch (error) {
                lastError = error.message
            }
        }
        let complete = Boolean(byIndex)
        if (complete) {
            for (const item of pending) {
                const line = byIndex.get(item.i)
                if (!line) {
                    complete = false
                    break
                }
                const node = nodes[item.i]
                node['x-i18n'] = node['x-i18n'] || {}
                if (item.needZh) node['x-i18n']['zh-CN'] = {...(node['x-i18n']['zh-CN'] || {}), description: line.zh}
                if (item.needJa) node['x-i18n']['ja-JP'] = {...(node['x-i18n']['ja-JP'] || {}), description: line.ja}
            }
        }
        if (!complete) {
            report.degraded.push({diffEntryId: entry.diffEntryId, kind: entry.kind, opPath: entry.opPath ?? null,
                pendingNodes: pending.length, reason: lastError ?? 'model returned incomplete translations'})
            continue
        }
        report.translatedEntries += 1
        report.translatedNodes += pending.length
        translated.push(entry)
    }
    // Post-verify: the landed set must be translation-complete (defense in
    // depth on top of the fill loop).
    for (const entry of translated) {
        if (!TRANSLATABLE_KINDS.has(entry.kind) || !entry.value || typeof entry.value !== 'object') continue
        for (const node of proseNodes(entry.value)) {
            if (missingLanguage(node, 'zh-CN') || missingLanguage(node, 'ja-JP')) {
                fail(`REST_UPSTREAM_TRANSLATE_INCOMPLETE: ${entry.diffEntryId} still carries untranslated prose after the translation stage`)
            }
        }
    }
    // A change set whose translatable entries ALL degraded must fail with its
    // own code, not as an opaque change-set schema error downstream: the
    // gateway is down or systematically misbehaving — inspect the report
    // artifact and re-run. Non-translatable entries (constraints, drafts) may
    // still land; that is the partial-degradation path.
    const translatableCount = changeSet.entries
        .filter(entry => TRANSLATABLE_KINDS.has(entry.kind) && entry.value && typeof entry.value === 'object').length
    if (translatableCount > 0 && report.translatedEntries === 0) {
        fail('REST_UPSTREAM_TRANSLATE_ALL_DEGRADED: every mirror/addition entry failed translation; the translate report artifact lists the pending entries — restore the gateway and re-run')
    }
    return {changeSet: {...changeSet, entries: translated}, report}
}

async function main() {
    const args = parseArgs(process.argv.slice(2))
    if (!args.get('change-set') || !args.get('out') || !args.get('base-url') || !args.get('api-key-env') || !args.get('model')) fail(usage())
    const changeSet = JSON.parse(fs.readFileSync(args.get('change-set'), 'utf8'))
    const {changeSet: translated, report} = await translateChangeSet({
        changeSet,
        baseUrl: args.get('base-url'),
        apiKeyEnv: args.get('api-key-env'),
        model: args.get('model'),
        timeoutMs: args.has('timeout-ms') ? Number(args.get('timeout-ms')) : DEFAULT_TIMEOUT_MS,
        retries: args.has('retries') ? Number(args.get('retries')) : DEFAULT_RETRIES,
    })
    fs.mkdirSync(path.dirname(path.resolve(args.get('out'))), {recursive: true})
    fs.writeFileSync(args.get('out'), `${JSON.stringify(translated, null, 2)}\n`)
    if (args.get('report')) {
        fs.mkdirSync(path.dirname(path.resolve(args.get('report'))), {recursive: true})
        fs.writeFileSync(args.get('report'), `${JSON.stringify(report, null, 2)}\n`)
    }
    console.log(`translate: ${report.translatedEntries} entr(ies) completed (${report.translatedNodes} node(s)); ${report.degraded.length} degraded to human review -> ${args.get('out')}`)
}

if (require.main === module) {
    main().catch(error => {
        console.error(error.message)
        process.exit(1)
    })
}

module.exports = {translateChangeSet, translationPrompt, missingLanguage}
