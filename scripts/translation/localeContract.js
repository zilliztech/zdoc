'use strict'

const fs = require('node:fs')
const path = require('node:path')

const ROOT_KEYS = ['schemaVersion', 'contractId', 'target', 'locale', 'styleRules', 'mandatoryTerms', 'forbiddenTranslations', 'doNotTranslate', 'examples']
const TERM_KEYS = ['source', 'target', 'caseSensitive']
const FORBIDDEN_KEYS = ['source', 'targets']
const EXAMPLE_KEYS = ['id', 'source', 'bad', 'good', 'explanation']
const CONTRACT_PATHS = Object.freeze({
  'ja-JP': 'config/translation/ja-JP.json',
  'zh-CN-reference': 'config/translation/zh-CN-reference.json',
})

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object with an exact schema`)
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) throw new Error(`${label} must use the exact schema; unexpected or missing fields`)
}

function nonEmptyString(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string`)
}

function stringArray(value, label) {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !item.trim())) throw new Error(`${label} must be an array of non-empty strings`)
  if (new Set(value).size !== value.length) throw new Error(`${label} contains duplicate values`)
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

function validateLocaleContract(value, expectedTarget = value?.target) {
  exactKeys(value, ROOT_KEYS, 'Locale contract')
  if (value.schemaVersion !== 1) throw new Error('Locale contract schemaVersion must be 1')
  nonEmptyString(value.contractId, 'Locale contract contractId')
  nonEmptyString(value.target, 'Locale contract target')
  nonEmptyString(value.locale, 'Locale contract locale')
  if (value.target !== expectedTarget) throw new Error(`Locale contract target must be ${expectedTarget}`)
  stringArray(value.styleRules, 'Locale contract styleRules')
  stringArray(value.doNotTranslate, 'Locale contract doNotTranslate')
  if (!Array.isArray(value.mandatoryTerms) || !value.mandatoryTerms.length) throw new Error('Locale contract mandatoryTerms must be a non-empty array')
  const mandatorySources = new Set()
  for (const [index, term] of value.mandatoryTerms.entries()) {
    exactKeys(term, TERM_KEYS, `Locale contract mandatoryTerms[${index}]`)
    nonEmptyString(term.source, `Locale contract mandatoryTerms[${index}].source`)
    nonEmptyString(term.target, `Locale contract mandatoryTerms[${index}].target`)
    if (typeof term.caseSensitive !== 'boolean') throw new Error(`Locale contract mandatoryTerms[${index}].caseSensitive must be boolean`)
    const key = `${term.caseSensitive}:${term.source}`
    if (mandatorySources.has(key)) throw new Error(`Locale contract contains duplicate mandatory term ${term.source}`)
    mandatorySources.add(key)
  }
  if (!Array.isArray(value.forbiddenTranslations)) throw new Error('Locale contract forbiddenTranslations must be an array')
  const forbiddenSources = new Set()
  for (const [index, item] of value.forbiddenTranslations.entries()) {
    exactKeys(item, FORBIDDEN_KEYS, `Locale contract forbiddenTranslations[${index}]`)
    nonEmptyString(item.source, `Locale contract forbiddenTranslations[${index}].source`)
    stringArray(item.targets, `Locale contract forbiddenTranslations[${index}].targets`)
    if (forbiddenSources.has(item.source)) throw new Error(`Locale contract contains duplicate forbidden translation source ${item.source}`)
    forbiddenSources.add(item.source)
  }
  if (!Array.isArray(value.examples)) throw new Error('Locale contract examples must be an array')
  const exampleIds = new Set()
  for (const [index, example] of value.examples.entries()) {
    exactKeys(example, EXAMPLE_KEYS, `Locale contract examples[${index}]`)
    for (const key of EXAMPLE_KEYS) nonEmptyString(example[key], `Locale contract examples[${index}].${key}`)
    if (exampleIds.has(example.id)) throw new Error(`Locale contract contains duplicate example ${example.id}`)
    exampleIds.add(example.id)
  }
  return deepFreeze(value)
}

function localeContractPathFor(target) {
  const contractPath = CONTRACT_PATHS[target]
  if (!contractPath) throw new Error(`Unsupported translation target: ${target}`)
  return contractPath
}

function loadLocaleContract(target, repositoryRoot = path.resolve(__dirname, '../..')) {
  const contractPath = localeContractPathFor(target)
  const value = JSON.parse(fs.readFileSync(path.join(repositoryRoot, contractPath), 'utf8'))
  return validateLocaleContract(value, target)
}

function formatLocaleContract(contract) {
  return `<locale_contract>\n${JSON.stringify(contract, null, 2)}\n</locale_contract>`
}

function countOccurrences(content, value, caseSensitive) {
  const haystack = caseSensitive ? String(content) : String(content).toLocaleLowerCase('en-US')
  const needle = caseSensitive ? value : value.toLocaleLowerCase('en-US')
  let count = 0
  for (let index = haystack.indexOf(needle); index !== -1; index = haystack.indexOf(needle, index + needle.length)) count += 1
  return count
}

function boundedDraftQuote(draft, forbiddenTargets) {
  for (const target of forbiddenTargets) if (draft.includes(target)) return target
  const trimmed = String(draft).trim()
  return trimmed.slice(0, 160)
}

function validateLocaleContractDraft(sourceContent, draftContent, contract) {
  const source = String(sourceContent)
  const draft = String(draftContent)
  const issues = []
  for (const term of contract.mandatoryTerms) {
    const sourceCount = countOccurrences(source, term.source, term.caseSensitive)
    if (!sourceCount) continue
    const targetCount = countOccurrences(draft, term.target, term.caseSensitive)
    if (targetCount >= sourceCount) continue
    const forbidden = contract.forbiddenTranslations.find(item => item.source === term.source)?.targets || []
    const draftQuote = boundedDraftQuote(draft, forbidden)
    if (!draftQuote) continue
    issues.push(Object.freeze({
      severity: 'medium',
      type: 'terminology',
      location: `text containing ${term.source}`,
      source_quote: term.source,
      draft_quote: draftQuote,
      comment: `Locale contract ${contract.contractId} requires ${term.source} to use ${term.target}; forbidden replacements do not satisfy this product terminology rule.`,
    }))
  }
  for (const token of contract.doNotTranslate) {
    const sourceCount = countOccurrences(source, token, true)
    if (!sourceCount || countOccurrences(draft, token, true) >= sourceCount) continue
    const draftQuote = String(draft).trim().slice(0, 160)
    if (!draftQuote) continue
    issues.push(Object.freeze({
      severity: 'medium',
      type: 'terminology',
      location: `text containing ${token}`,
      source_quote: token,
      draft_quote: draftQuote,
      comment: `Locale contract ${contract.contractId} lists ${token} as a do-not-translate token and requires it to remain byte-identical.`,
    }))
  }
  return Object.freeze(issues)
}

function issueConflictsWithLocaleContract(issue, contract) {
  for (const item of contract.forbiddenTranslations) {
    if (!issue.source_quote.includes(item.source)) continue
    const demandsForbidden = item.targets.some(target => issue.comment.includes(target))
    if (demandsForbidden) return true
  }
  return false
}

module.exports = {
  formatLocaleContract,
  issueConflictsWithLocaleContract,
  loadLocaleContract,
  localeContractPathFor,
  validateLocaleContract,
  validateLocaleContractDraft,
}
