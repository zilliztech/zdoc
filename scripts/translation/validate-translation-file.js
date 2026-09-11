'use strict'

// Deterministic single-file translation validator used as the agentic
// provider's verification tool. It applies the same gates as the unit
// pipeline after full-document assembly: protected content, do-not-translate
// counts, mandatory terminology, heading parity, YAML frontmatter, MDX
// compile, and structure checks.

const fs = require('node:fs')
const path = require('node:path')
const {protectedSpans, validateProtectedContent} = require('./protectedContent')
const {loadLocaleContract, applyDeterministicLocaleRepairs} = require('./localeContract')
const {stabilizeBareUrlFormatting, validateTranslatedContent} = require('./agentRunner')

function headingCount(content) {
  const withoutFences = String(content).replace(/```[\s\S]*?```/g, '')
  return (withoutFences.match(/^ {0,3}#{1,6}[\t ]+\S/gm) || []).length
}

function overlapsProtectedSpan(protectedRanges, start, end) {
  return protectedRanges.some(range => start < range.end && end > range.start)
}

// Protected bytes cannot be localized, so a mandatory term that only appears
// inside them (e.g. a `{#cluster-level-isolation}` anchor or a
// `./manage-cluster` link destination) is never a translation obligation.
function countUnprotectedMatches(content, pattern, protectedRanges) {
  let count = 0
  for (const match of String(content).matchAll(pattern)) {
    if (overlapsProtectedSpan(protectedRanges, match.index, match.index + match[0].length)) continue
    count += 1
  }
  return count
}

function countUnprotectedLiteral(content, literal, protectedRanges) {
  const text = String(content)
  let count = 0
  for (let index = text.indexOf(literal); index !== -1; index = text.indexOf(literal, index + literal.length)) {
    if (overlapsProtectedSpan(protectedRanges, index, index + literal.length)) continue
    count += 1
  }
  return count
}

function validateTranslationFile({sourceContent, draftContent, relPath, target}) {
  if (typeof sourceContent !== 'string' || typeof draftContent !== 'string') {
    throw new Error('validateTranslationFile requires string source and draft content')
  }
  const contract = loadLocaleContract(target)
  const repaired = applyDeterministicLocaleRepairs(sourceContent, stabilizeBareUrlFormatting(draftContent), contract)
  const errors = [...validateProtectedContent(sourceContent, repaired, {sourcePath: relPath})]
  for (const token of contract.doNotTranslate || []) {
    const inSource = sourceContent.split(token).length - 1
    if (!inSource) continue
    const inDraft = repaired.split(token).length - 1
    if (inDraft < inSource) errors.push(`do-not-translate token "${token}" appears ${inSource}x in source but ${inDraft}x in draft`)
  }
  const sourceProtected = protectedSpans(sourceContent, {literalTokens: contract.doNotTranslate})
  const draftProtected = protectedSpans(repaired, {literalTokens: contract.doNotTranslate})
  for (const term of contract.mandatoryTerms || []) {
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(term.source)) continue
    const inSource = countUnprotectedMatches(sourceContent, new RegExp(`(?<![A-Za-z0-9_])${term.source}(?![A-Za-z0-9_])`, 'gi'), sourceProtected)
    if (!inSource) continue
    const inDraft = countUnprotectedLiteral(repaired, term.target, draftProtected)
    if (inDraft < inSource) errors.push(`locale contract ${contract.contractId} requires ${term.source} to use ${term.target} (source ${inSource}x, draft ${inDraft}x)`)
  }
  if (headingCount(sourceContent) !== headingCount(repaired)) {
    errors.push(`heading count mismatch: source ${headingCount(sourceContent)}, draft ${headingCount(repaired)}`)
  }
  return {repaired, errors}
}

async function validateWithRuntimeChecks({sourceContent, draftContent, relPath, target, validate = validateTranslatedContent}) {
  const {repaired, errors} = validateTranslationFile({sourceContent, draftContent, relPath, target})
  errors.push(...await validate(repaired))
  return {repaired, errors}
}

function usage() {
  return 'Usage: node scripts/translation/validate-translation-file.js --site-dir <absolute-dir> --target <ja-JP|zh-CN-reference> --source <site-relative-path> --draft <site-relative-path> [--write-back]'
}

function parseCliArgs(argv) {
  if (argv.length % 2 !== 0) throw new Error(usage())
  const args = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    if (!flag?.startsWith('--')) throw new Error(usage())
    const key = flag.slice(2)
    if (args.has(key)) throw new Error(`Duplicate argument: ${flag}`)
    args.set(key, argv[index + 1])
  }
  for (const required of ['site-dir', 'target', 'source', 'draft']) {
    if (!args.has(required)) throw new Error(usage())
  }
  if (args.has('write-back') && args.get('write-back') !== 'true' && args.get('write-back') !== 'false') {
    throw new Error('--write-back must be true or false')
  }
  return {siteDir: args.get('site-dir'), target: args.get('target'), source: args.get('source'), draft: args.get('draft'), writeBack: args.get('write-back') === 'true'}
}

async function main() {
  const options = parseCliArgs(process.argv.slice(2))
  const siteDir = path.resolve(options.siteDir)
  if (!path.isAbsolute(options.siteDir) || siteDir !== options.siteDir) {
    throw new Error('--site-dir must be an absolute normalized path')
  }
  const sourcePath = path.join(siteDir, options.source)
  const draftPath = path.join(siteDir, options.draft)
  const sourceContent = fs.readFileSync(sourcePath, 'utf8')
  const draftContent = fs.readFileSync(draftPath, 'utf8')
  const {repaired, errors} = await validateWithRuntimeChecks({
    sourceContent,
    draftContent,
    relPath: options.source,
    target: options.target,
  })
  if (options.writeBack && repaired !== draftContent) fs.writeFileSync(draftPath, repaired)
  if (errors.length) {
    console.log(`VIOLATIONS ${errors.length}`)
    for (const error of errors) console.log(`- ${String(error).slice(0, 400)}`)
    process.exitCode = 1
    return
  }
  console.log('OK')
}

module.exports = {headingCount, parseCliArgs, usage, validateTranslationFile, validateWithRuntimeChecks}

if (require.main === module) {
  main().catch(error => {
    console.error(String(error?.message || error))
    process.exitCode = 1
  })
}
