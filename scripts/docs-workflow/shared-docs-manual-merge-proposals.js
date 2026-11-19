#!/usr/bin/env node
'use strict'

// Deterministic merge of the advisory proposals into the candidate ledger. The lane
// staged `deferred` entries for the pending additions; this step only fills their
// `proposal` field: classification is never touched, an existing proposal is never
// overwritten, and every metadata draft is re-validated through the real manual-config
// parser before it lands. A proposal that fails here is skipped and reported — the
// ledger entry stays a plain deferred row for the human.

const fs = require('node:fs')
const path = require('node:path')

const REPOSITORY_ROOT = path.resolve(__dirname, '..', '..')
const { loadTypeScript } = require(path.join(REPOSITORY_ROOT, 'scripts', 'lib', 'load-typescript'))
const { parseManualConfig } = loadTypeScript(path.join(REPOSITORY_ROOT, 'packages', 'docs-tooling', 'src', 'shared-docs', 'core', 'manual-config.ts'))
const { DOC_HEADING_TAGS } = loadTypeScript(path.join(REPOSITORY_ROOT, 'packages', 'docs-ui', 'src', 'shared', 'utils', 'docHeadingTags.ts'))
const { groupManuals } = loadTypeScript(path.join(REPOSITORY_ROOT, 'packages', 'docs-tooling', 'src', 'shared-docs', 'adapters', 'group-context.ts'))
const { attachProposals, parseManualLedger } = loadTypeScript(path.join(REPOSITORY_ROOT, 'packages', 'docs-tooling', 'src', 'shared-docs', 'core', 'ledger.ts'))
const { validateMetadataDraft } = require('./shared-docs-manual-decide')

function usage() {
    return 'Usage: node scripts/docs-workflow/shared-docs-manual-merge-proposals.js --ledger <candidate-ledger.json> --proposals <proposals.jsonl> --shared-docs <dir> --out <ledger.json>'
}

function fail(message) {
    throw new Error(message)
}

async function mergeProposals({ ledgerPath, proposalsPath, sharedDocsPath, outPath }) {
    if (!ledgerPath || !proposalsPath || !sharedDocsPath || !outPath) fail(usage())
    const ledgerText = fs.readFileSync(ledgerPath, 'utf8')
    const existing = parseManualLedger(ledgerText)
    if ('errors' in existing) fail(`candidate ledger is malformed: ${existing.errors.map(error => error.message).join('; ')}`)
    const manualText = fs.readFileSync(path.join(sharedDocsPath, 'manual.yaml'), 'utf8')
    const group = path.basename(path.resolve(sharedDocsPath))
    const laneManual = parseManualConfig(manualText, { manuals: groupManuals(group), betaValues: DOC_HEADING_TAGS.filter(tag => tag !== 'BYOC') })
    if ('errors' in laneManual) fail(`group manual.yaml does not parse: ${laneManual.errors.map(error => error.message).join('; ')}`)
    const manual = laneManual.config.publish.manual
    const context = { manuals: [manual], betaValues: DOC_HEADING_TAGS.filter(tag => tag !== 'BYOC') }
    const sourceDir = laneManual.config.source.dir

    const ACTIONS = ['adopt', 'exclude', 'defer']
    const proposals = fs.readFileSync(proposalsPath, 'utf8').split('\n').filter(lineText => lineText.trim()).map(lineText => {
        const proposal = JSON.parse(lineText)
        if (typeof proposal.file !== 'string' || !proposal.file.trim()) return { file: '(unreadable)', skipped: true, reason: 'file must be a nonempty string' }
        if (!ACTIONS.includes(proposal.action)) return { file: proposal.file, skipped: true, reason: `action must be one of ${ACTIONS.join(', ')}` }
        if (typeof proposal.reason !== 'string' || !proposal.reason.trim()) return { file: proposal.file, skipped: true, reason: 'reason must be a nonempty string' }
        if (proposal.metadata_draft !== undefined) {
            const draftError = validateMetadataDraft(proposal.file, proposal.metadata_draft, context, sourceDir, manual)
            if (draftError) return { file: proposal.file, skipped: true, reason: draftError }
        }
        return proposal
    })

    const result = attachProposals(existing.ledger, proposals.filter(proposal => !proposal.skipped))
    fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true })
    fs.writeFileSync(outPath, `${JSON.stringify(result.ledger, null, 2)}\n`)
    const summary = { merged: result.merged.length, unmatched: result.unmatched.length, rejected: result.rejected.length }
    console.log(`merged ${summary.merged} proposal(s) into the candidate ledger; ${summary.unmatched} unmatched; ${summary.rejected} rejected -> ${outPath}`)
    return summary
}

async function main() {
    const args = new Map()
    const argv = process.argv.slice(2)
    for (let index = 0; index < argv.length; index += 2) {
        if (!argv[index].startsWith('--') || argv[index + 1] === undefined) fail(usage())
        args.set(argv[index].slice(2), argv[index + 1])
    }
    await mergeProposals({
        ledgerPath: args.get('ledger'),
        proposalsPath: args.get('proposals'),
        sharedDocsPath: args.get('shared-docs'),
        outPath: args.get('out'),
    })
}

if (require.main === module) {
    main().catch(error => {
        console.error(error.message)
        process.exit(1)
    })
}

module.exports = { mergeProposals }
