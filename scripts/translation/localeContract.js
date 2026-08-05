'use strict'

const fs = require('node:fs')
const path = require('node:path')

const ROOT_KEYS = ['schemaVersion', 'contractId', 'target', 'locale', 'styleRules', 'mandatoryTerms', 'forbiddenTranslations', 'doNotTranslate', 'contextualTerms', 'examples']
const TERM_KEYS = ['source', 'target', 'caseSensitive']
const CONTEXTUAL_TERM_KEYS = ['source', 'target', 'caseSensitive', 'sourceContexts']
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
  if (!Array.isArray(value.contextualTerms)) throw new Error('Locale contract contextualTerms must be an array')
  const contextualSources = new Set()
  for (const [index, term] of value.contextualTerms.entries()) {
    exactKeys(term, CONTEXTUAL_TERM_KEYS, `Locale contract contextualTerms[${index}]`)
    nonEmptyString(term.source, `Locale contract contextualTerms[${index}].source`)
    nonEmptyString(term.target, `Locale contract contextualTerms[${index}].target`)
    if (typeof term.caseSensitive !== 'boolean') throw new Error(`Locale contract contextualTerms[${index}].caseSensitive must be boolean`)
    stringArray(term.sourceContexts, `Locale contract contextualTerms[${index}].sourceContexts`)
    for (const context of term.sourceContexts) {
      const haystack = term.caseSensitive ? context : context.toLocaleLowerCase('en-US')
      const needle = term.caseSensitive ? term.source : term.source.toLocaleLowerCase('en-US')
      if (!haystack.includes(needle)) throw new Error(`Locale contract contextualTerms[${index}] sourceContexts must contain ${term.source}`)
    }
    const key = `${term.caseSensitive}:${term.source}`
    if (contextualSources.has(key)) throw new Error(`Locale contract contains duplicate contextual term ${term.source}`)
    contextualSources.add(key)
  }
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

function mandatoryTermVariants(value) {
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(value)) return [value]
  let plural
  if (/[^aeiou]y$/i.test(value)) plural = `${value.slice(0, -1)}ies`
  else if (/(?:s|x|z|ch|sh)$/i.test(value)) plural = `${value}es`
  else plural = `${value}s`
  return plural === value ? [value] : [value, plural]
}

function mandatoryTermOccurrences(content, value, caseSensitive) {
  const source = String(content)
  const haystack = caseSensitive ? source : source.toLocaleLowerCase('en-US')
  const variants = mandatoryTermVariants(value)
    .map(item => caseSensitive ? item : item.toLocaleLowerCase('en-US'))
    .sort((left, right) => right.length - left.length)
  const wordLike = /^[A-Za-z][A-Za-z0-9_]*$/.test(value)
  const occurrences = []
  for (let index = 0; index < haystack.length;) {
    const variant = variants.find(item => haystack.startsWith(item, index))
    if (!variant) {
      index += 1
      continue
    }
    const before = index > 0 ? haystack[index - 1] : ''
    const after = haystack[index + variant.length] || ''
    if (wordLike && (/[A-Za-z0-9_]/.test(before) || /[A-Za-z0-9_]/.test(after))) {
      index += 1
      continue
    }
    occurrences.push({index, value: source.slice(index, index + variant.length)})
    index += variant.length
  }
  return occurrences
}

function sourceTermOccurrences(content, term, contract) {
  const hasForbiddenTranslations = contract.forbiddenTranslations.some(item => item.source === term.source)
  return mandatoryTermOccurrences(content, term.source, term.caseSensitive && !hasForbiddenTranslations)
}

function applyDeterministicLocaleRepairs(sourceContent, draftContent, contract) {
  const source = String(sourceContent)
  let draft = String(draftContent)
  for (const term of contract.mandatoryTerms) {
    if (!term.caseSensitive) continue
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(term.source)) continue
    if (term.source.toLocaleLowerCase('en-US') !== term.target.toLocaleLowerCase('en-US')) continue
    const sourceCount = sourceTermOccurrences(source, term, contract).length
    if (!sourceCount) continue
    const targetCount = mandatoryTermOccurrences(draft, term.target, true).length
    let deficit = sourceCount - targetCount
    if (deficit <= 0) continue
    const sourceVariants = mandatoryTermVariants(term.source).map(value => value.toLocaleLowerCase('en-US'))
    const targetVariants = mandatoryTermVariants(term.target)
    const repairs = mandatoryTermOccurrences(draft, term.source, false).filter(occurrence => {
      const variant = sourceVariants.indexOf(occurrence.value.toLocaleLowerCase('en-US'))
      return variant !== -1 && occurrence.value !== targetVariants[variant]
    }).slice(0, deficit)
    for (const repair of repairs.reverse()) {
      const variant = sourceVariants.indexOf(repair.value.toLocaleLowerCase('en-US'))
      draft = `${draft.slice(0, repair.index)}${targetVariants[variant]}${draft.slice(repair.index + repair.value.length)}`
      deficit -= 1
    }
  }
  return draft
}

function correspondingDraftLine(source, draft, sourceIndex) {
  if (sourceIndex < 0) return ''
  const lineIndex = String(source).slice(0, sourceIndex).split(/\r?\n/).length - 1
  const line = String(draft).split(/\r?\n/)[lineIndex]?.trim() || ''
  return line.slice(0, 160)
}

function boundedDraftQuote(source, draft, sourceQuote, forbiddenTargets) {
  for (const target of forbiddenTargets) if (draft.includes(target)) return target
  return correspondingDraftLine(source, draft, String(source).indexOf(sourceQuote))
}

function mandatoryTermIssues(source, draft, contract, term, sourceCount, targetCount) {
  const forbidden = contract.forbiddenTranslations.find(item => item.source === term.source)?.targets || []
  const sourceLines = source.split(/\r?\n/)
  const draftLines = draft.split(/\r?\n/)
  const issues = []
  let remainingDeficit = sourceCount - targetCount

  for (let lineIndex = 0; lineIndex < sourceLines.length && remainingDeficit > 0; lineIndex += 1) {
    const sourceLineOccurrences = sourceTermOccurrences(sourceLines[lineIndex], term, contract)
    const sourceLineCount = sourceLineOccurrences.length
    if (!sourceLineCount) continue
    const draftLine = draftLines[lineIndex] || ''
    const draftLineCount = mandatoryTermOccurrences(draftLine, term.target, term.caseSensitive).length
    const lineDeficit = sourceLineCount - draftLineCount
    if (lineDeficit <= 0) continue
    const sourceQuote = sourceLineOccurrences[Math.min(draftLineCount, sourceLineOccurrences.length - 1)]?.value || term.source
    const draftQuote = boundedDraftQuote(sourceLines[lineIndex], draftLine, sourceQuote, forbidden)
    if (!draftQuote) continue
    issues.push(Object.freeze({
      severity: 'medium',
      type: 'terminology',
      location: `line ${lineIndex + 1} containing ${term.source}`,
      source_quote: sourceQuote,
      draft_quote: draftQuote,
      comment: `Locale contract ${contract.contractId} requires ${term.source} to use ${term.target}; forbidden replacements do not satisfy this product terminology rule.`,
    }))
    remainingDeficit -= Math.min(lineDeficit, remainingDeficit)
  }

  if (issues.length || remainingDeficit <= 0) return issues
  const draftQuote = boundedDraftQuote(source, draft, term.source, forbidden)
  if (!draftQuote) return issues
  issues.push(Object.freeze({
    severity: 'medium',
    type: 'terminology',
    location: `text containing ${term.source}`,
    source_quote: term.source,
    draft_quote: draftQuote,
    comment: `Locale contract ${contract.contractId} requires ${term.source} to use ${term.target}; forbidden replacements do not satisfy this product terminology rule.`,
  }))
  return issues
}

function validateLocaleContractDraft(sourceContent, draftContent, contract) {
  const source = String(sourceContent)
  const draft = String(draftContent)
  const issues = []
  for (const term of contract.mandatoryTerms) {
    const sourceCount = sourceTermOccurrences(source, term, contract).length
    if (!sourceCount) continue
    const targetCount = mandatoryTermOccurrences(draft, term.target, term.caseSensitive).length
    if (targetCount >= sourceCount) continue
    issues.push(...mandatoryTermIssues(source, draft, contract, term, sourceCount, targetCount))
  }
  for (const token of contract.doNotTranslate) {
    const sourceCount = countOccurrences(source, token, true)
    if (!sourceCount || countOccurrences(draft, token, true) >= sourceCount) continue
    const draftQuote = boundedDraftQuote(source, draft, token, [])
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
  const seenContextual = new Set()
  for (const term of contract.contextualTerms) {
    for (const context of term.sourceContexts) {
      const haystack = term.caseSensitive ? source : source.toLocaleLowerCase('en-US')
      const needle = term.caseSensitive ? context : context.toLocaleLowerCase('en-US')
      for (let sourceIndex = haystack.indexOf(needle); sourceIndex !== -1; sourceIndex = haystack.indexOf(needle, sourceIndex + needle.length)) {
        const draftQuote = correspondingDraftLine(source, draft, sourceIndex)
        if (!draftQuote || countOccurrences(draftQuote, term.target, term.caseSensitive) > 0) continue
        const issueKey = `${term.source}\0${sourceIndex}\0${draftQuote}`
        if (seenContextual.has(issueKey)) continue
        seenContextual.add(issueKey)
        issues.push(Object.freeze({
          severity: 'medium',
          type: 'terminology',
          location: `product context containing ${context}`,
          source_quote: term.source,
          draft_quote: draftQuote,
          comment: `Locale contract ${contract.contractId} requires ${term.source} to remain ${term.target} in the declared product context ${context}.`,
        }))
      }
    }
  }
  return Object.freeze(issues)
}

function issueConflictsWithLocaleContract(issue, contract) {
  for (const item of contract.forbiddenTranslations) {
    if (!issue.source_quote.toLocaleLowerCase('en-US').includes(item.source.toLocaleLowerCase('en-US'))) continue
    const demandsForbidden = item.targets.some(target => issue.comment.includes(target))
    if (demandsForbidden) return true
  }
  return false
}

module.exports = {
  applyDeterministicLocaleRepairs,
  formatLocaleContract,
  issueConflictsWithLocaleContract,
  loadLocaleContract,
  localeContractPathFor,
  validateLocaleContract,
  validateLocaleContractDraft,
}
