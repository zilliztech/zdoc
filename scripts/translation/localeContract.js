'use strict'

const fs = require('node:fs')
const path = require('node:path')

const ROOT_KEYS = ['schemaVersion', 'contractId', 'target', 'locale', 'styleRules', 'mandatoryTerms', 'forbiddenTranslations', 'doNotTranslate', 'contextualTerms', 'examples']
const TERM_KEYS = ['source', 'target', 'caseSensitive']
const CONTEXT_EXCLUSION_TERM_KEYS = [...TERM_KEYS, 'excludedSourceContexts']
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
    const keys = Object.keys(term).sort()
    const baseKeys = [...TERM_KEYS].sort()
    const exclusionKeys = [...CONTEXT_EXCLUSION_TERM_KEYS].sort()
    if (JSON.stringify(keys) !== JSON.stringify(baseKeys) && JSON.stringify(keys) !== JSON.stringify(exclusionKeys)) {
      throw new Error(`Locale contract mandatoryTerms[${index}] must use the exact schema; unexpected or missing fields`)
    }
    nonEmptyString(term.source, `Locale contract mandatoryTerms[${index}].source`)
    nonEmptyString(term.target, `Locale contract mandatoryTerms[${index}].target`)
    if (typeof term.caseSensitive !== 'boolean') throw new Error(`Locale contract mandatoryTerms[${index}].caseSensitive must be boolean`)
    if (Object.hasOwn(term, 'excludedSourceContexts')) {
      stringArray(term.excludedSourceContexts, `Locale contract mandatoryTerms[${index}].excludedSourceContexts`)
      for (const context of term.excludedSourceContexts) {
        const haystack = term.caseSensitive ? context : context.toLocaleLowerCase('en-US')
        const needle = term.caseSensitive ? term.source : term.source.toLocaleLowerCase('en-US')
        if (!haystack.includes(needle)) throw new Error(`Locale contract mandatoryTerms[${index}] excludedSourceContexts must contain ${term.source}`)
      }
    }
    const key = `${term.caseSensitive}:${term.source}`
    if (mandatorySources.has(key)) throw new Error(`Locale contract contains duplicate mandatory term ${term.source}`)
    mandatorySources.add(key)
  }
  for (const [index, contextual] of value.contextualTerms.entries()) {
    const mandatory = value.mandatoryTerms.find(term => term.source === contextual.source && term.caseSensitive === contextual.caseSensitive)
    if (!mandatory || mandatory.target === contextual.target) continue
    if (!contextual.sourceContexts.every(context => mandatory.excludedSourceContexts?.includes(context))) {
      throw new Error(`Locale contract contextualTerms[${index}] overrides mandatory term ${contextual.source} without matching excludedSourceContexts`)
    }
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

function contextBoundToken(context, source, target, caseSensitive) {
  const comparableContext = caseSensitive ? context : context.toLocaleLowerCase('en-US')
  const comparableSource = caseSensitive ? source : source.toLocaleLowerCase('en-US')
  const index = comparableContext.indexOf(comparableSource)
  if (index < 0) return target
  const before = context.slice(0, index)
  const after = context.slice(index + source.length)
  for (const wrapper of ['**', '__', '`']) {
    if (before.endsWith(wrapper) && after.startsWith(wrapper)) return `${wrapper}${target}${wrapper}`
  }
  return target
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
  const caseSensitive = term.caseSensitive && !hasForbiddenTranslations
  const occurrences = mandatoryTermOccurrences(content, term.source, caseSensitive)
  if (!term.excludedSourceContexts?.length) return occurrences
  const source = String(content)
  const haystack = caseSensitive ? source : source.toLocaleLowerCase('en-US')
  const excludedRanges = term.excludedSourceContexts.flatMap(context => {
    const needle = caseSensitive ? context : context.toLocaleLowerCase('en-US')
    const ranges = []
    for (let index = haystack.indexOf(needle); index !== -1; index = haystack.indexOf(needle, index + needle.length)) {
      ranges.push({start: index, end: index + needle.length})
    }
    return ranges
  })
  return occurrences.filter(occurrence => !excludedRanges.some(range => occurrence.index >= range.start && occurrence.index < range.end))
}

function contextualDraftSlotRanges(draft, context, source, caseSensitive) {
  const comparableContext = caseSensitive ? context : context.toLocaleLowerCase('en-US')
  const comparableSource = caseSensitive ? source : source.toLocaleLowerCase('en-US')
  const sourceIndex = comparableContext.indexOf(comparableSource)
  if (sourceIndex < 0) return []
  const tokens = [...context.matchAll(/(\*\*|__|`)(.+?)\1/g)].map(match => ({
    start: match.index,
    end: match.index + match[0].length,
    value: match[0],
  }))
  const before = tokens.filter(token => token.end <= sourceIndex).at(-1)?.value
  const after = tokens.find(token => token.start >= sourceIndex + source.length)?.value
  if (!before || !after) return []
  const comparableDraft = caseSensitive ? String(draft) : String(draft).toLocaleLowerCase('en-US')
  const comparableBefore = caseSensitive ? before : before.toLocaleLowerCase('en-US')
  const comparableAfter = caseSensitive ? after : after.toLocaleLowerCase('en-US')
  const ranges = []
  for (let beforeIndex = comparableDraft.indexOf(comparableBefore); beforeIndex !== -1; beforeIndex = comparableDraft.indexOf(comparableBefore, beforeIndex + comparableBefore.length)) {
    const start = beforeIndex + comparableBefore.length
    const afterIndex = comparableDraft.indexOf(comparableAfter, start)
    if (afterIndex === -1) break
    ranges.push({start, end: afterIndex})
  }
  return ranges
}

function mandatoryTargetOccurrences(source, draft, term, contract) {
  const occurrences = mandatoryTermOccurrences(draft, term.target, term.caseSensitive)
  const contextualOverrides = contract.contextualTerms.filter(contextual =>
    contextual.source === term.source &&
    contextual.caseSensitive === term.caseSensitive &&
    contextual.target !== term.target,
  )
  if (!contextualOverrides.length) return occurrences

  const excluded = new Set()
  for (const contextual of contextualOverrides) {
    for (const context of contextual.sourceContexts) {
      const contextCount = countOccurrences(source, context, contextual.caseSensitive)
      if (!contextCount) continue
      const boundTarget = contextBoundToken(context, contextual.source, term.target, contextual.caseSensitive)
      if (boundTarget === term.target) continue
      const slotRanges = contextualDraftSlotRanges(draft, context, contextual.source, contextual.caseSensitive)
      const allBoundOccurrences = mandatoryTermOccurrences(draft, boundTarget, term.caseSensitive)
      const boundOccurrences = slotRanges.length
        ? allBoundOccurrences.filter(occurrence => slotRanges.some(range => occurrence.index >= range.start && occurrence.index < range.end))
        : allBoundOccurrences
      let remaining = contextCount
      for (const occurrence of boundOccurrences) {
        if (!remaining) break
        const matchingTarget = occurrences.find(candidate =>
          !excluded.has(candidate.index) &&
          candidate.index >= occurrence.index &&
          candidate.index + candidate.value.length <= occurrence.index + occurrence.value.length,
        )
        if (!matchingTarget) continue
        excluded.add(matchingTarget.index)
        remaining -= 1
      }
    }
  }
  return occurrences.filter(occurrence => !excluded.has(occurrence.index))
}

function applyDeterministicLocaleRepairs(sourceContent, draftContent, contract) {
  const source = String(sourceContent)
  let draft = String(draftContent)
  for (const term of contract.mandatoryTerms) {
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(term.source)) continue
    const sourceCount = sourceTermOccurrences(source, term, contract).length
    if (!sourceCount) continue
    const targetCount = mandatoryTargetOccurrences(source, draft, term, contract).length
    let deficit = sourceCount - targetCount
    if (deficit <= 0) continue
    const sourceVariants = mandatoryTermVariants(term.source).map(value => value.toLocaleLowerCase('en-US'))
    const targetVariants = mandatoryTermVariants(term.target)
    const repairs = sourceTermOccurrences(draft, term, contract).filter(occurrence => {
      const variant = sourceVariants.indexOf(occurrence.value.toLocaleLowerCase('en-US'))
      if (variant === -1) return false
      return occurrence.value !== (targetVariants[variant] ?? targetVariants[0])
    }).slice(0, deficit)
    for (const repair of repairs.reverse()) {
      const variant = sourceVariants.indexOf(repair.value.toLocaleLowerCase('en-US'))
      draft = `${draft.slice(0, repair.index)}${targetVariants[variant] ?? targetVariants[0]}${draft.slice(repair.index + repair.value.length)}`
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

function exactOccurrences(content, token) {
  const source = String(content)
  const occurrences = []
  for (let index = source.indexOf(token); index !== -1; index = source.indexOf(token, index + token.length)) {
    occurrences.push({index, value: token})
  }
  return occurrences
}

function doNotTranslateIssues(source, draft, contract, token) {
  const sourceLines = source.split(/\r?\n/)
  const draftLines = draft.split(/\r?\n/)
  const sourceOccurrences = exactOccurrences(source, token)
  const sourceLineIndex = sourceOccurrences.length === 1
    ? source.slice(0, sourceOccurrences[0].index).split(/\r?\n/).length - 1
    : -1
  const exactDraftLine = sourceOccurrences.length === 1 && sourceLines.length === draftLines.length
    ? draftLines[sourceLineIndex]?.trim() || ''
    : ''
  const evidenceAvailable = Boolean(exactDraftLine)
  return [Object.freeze({
    severity: 'medium',
    type: 'terminology',
    location: evidenceAvailable ? `line ${sourceLineIndex + 1} containing ${token}` : `text containing ${token}`,
    source_quote: token,
    draft_quote: evidenceAvailable ? exactDraftLine.slice(0, 160) : '',
    evidenceAvailable,
    comment: `Locale contract ${contract.contractId} lists ${token} as a do-not-translate token and requires it to remain byte-identical.`,
  })]
}

function mandatoryTermComment(contract, term, forbidden) {
  const base = `Locale contract ${contract.contractId} requires ${term.source} to use ${term.target}.`
  return forbidden.length
    ? `${base} Forbidden replacements (${forbidden.join(', ')}) do not satisfy this rule.`
    : base
}

function mandatoryTermIssues(source, draft, contract, term, sourceCount, targetCount) {
  const forbidden = contract.forbiddenTranslations.find(item => item.source === term.source)?.targets || []
  const requiredTerm = Object.freeze({source: term.source, target: term.target})
  const comment = mandatoryTermComment(contract, term, forbidden)
  const sourceLines = source.split(/\r?\n/)
  const draftLines = draft.split(/\r?\n/)
  const issues = []
  let remainingDeficit = sourceCount - targetCount

  for (let lineIndex = 0; lineIndex < sourceLines.length && remainingDeficit > 0; lineIndex += 1) {
    const sourceLineOccurrences = sourceTermOccurrences(sourceLines[lineIndex], term, contract)
    const sourceLineCount = sourceLineOccurrences.length
    if (!sourceLineCount) continue
    const draftLine = draftLines[lineIndex] || ''
    const draftLineCount = mandatoryTargetOccurrences(sourceLines[lineIndex], draftLine, term, contract).length
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
      required_term: requiredTerm,
      comment,
    }))
    remainingDeficit -= Math.min(lineDeficit, remainingDeficit)
  }

  if (issues.length || remainingDeficit <= 0) return issues
  const draftQuote = boundedDraftQuote(source, draft, term.source, forbidden)
  if (!draftQuote) {
    issues.push(Object.freeze({
      severity: 'medium',
      type: 'terminology',
      location: `text containing ${term.source}`,
      source_quote: term.source,
      draft_quote: '',
      evidenceAvailable: false,
      required_term: requiredTerm,
      comment,
    }))
    return issues
  }
  issues.push(Object.freeze({
    severity: 'medium',
    type: 'terminology',
    location: `text containing ${term.source}`,
    source_quote: term.source,
    draft_quote: draftQuote,
    required_term: requiredTerm,
    comment,
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
    const targetCount = mandatoryTargetOccurrences(source, draft, term, contract).length
    if (targetCount >= sourceCount) continue
    issues.push(...mandatoryTermIssues(source, draft, contract, term, sourceCount, targetCount))
  }
  for (const token of contract.doNotTranslate) {
    const sourceCount = countOccurrences(source, token, true)
    const draftCount = countOccurrences(draft, token, true)
    if (!sourceCount || draftCount >= sourceCount) continue
    issues.push(...doNotTranslateIssues(source, draft, contract, token))
  }
  const seenContextual = new Set()
  for (const term of contract.contextualTerms) {
    for (const context of term.sourceContexts) {
      const haystack = term.caseSensitive ? source : source.toLocaleLowerCase('en-US')
      const needle = term.caseSensitive ? context : context.toLocaleLowerCase('en-US')
      for (let sourceIndex = haystack.indexOf(needle); sourceIndex !== -1; sourceIndex = haystack.indexOf(needle, sourceIndex + needle.length)) {
        const draftQuote = correspondingDraftLine(source, draft, sourceIndex)
        const boundTarget = contextBoundToken(context, term.source, term.target, term.caseSensitive)
        const sourceLineStart = Math.max(source.lastIndexOf('\n', sourceIndex), source.lastIndexOf('\r', sourceIndex)) + 1
        const requiredBoundCount = countOccurrences(source.slice(sourceLineStart, sourceIndex + context.length), context, term.caseSensitive)
        const slotRanges = contextualDraftSlotRanges(draftQuote, context, term.source, term.caseSensitive)
        const boundOccurrences = mandatoryTermOccurrences(draftQuote, boundTarget, term.caseSensitive)
        const boundCount = slotRanges.length
          ? boundOccurrences.filter(occurrence => slotRanges.some(range => occurrence.index >= range.start && occurrence.index < range.end)).length
          : boundOccurrences.length
        if (draftQuote && boundCount >= requiredBoundCount) continue
        const issueKey = `${term.source}\0${sourceIndex}\0${draftQuote}`
        if (seenContextual.has(issueKey)) continue
        seenContextual.add(issueKey)
        issues.push(Object.freeze({
          severity: 'medium',
          type: 'terminology',
          location: `product context containing ${context}`,
          source_quote: term.source,
          draft_quote: draftQuote,
          evidenceAvailable: Boolean(draftQuote),
          comment: `Locale contract ${contract.contractId} requires ${term.source} to remain ${term.target} in the declared product context ${context}.`,
        }))
      }
    }
  }
  return Object.freeze(issues)
}

function issueConflictsWithLocaleContract(issue, contract, sourceContent = '') {
  for (const item of contract.forbiddenTranslations) {
    if (!issue.source_quote.toLocaleLowerCase('en-US').includes(item.source.toLocaleLowerCase('en-US'))) continue
    const demandsForbidden = item.targets.some(target => issue.comment.includes(target))
    if (demandsForbidden) return true
  }
  const source = String(sourceContent)
  for (const contextual of contract.contextualTerms) {
    const mandatory = contract.mandatoryTerms.find(term => term.source === contextual.source && term.caseSensitive === contextual.caseSensitive)
    if (!mandatory || mandatory.target === contextual.target || !issue.comment.includes(mandatory.target)) continue
    const quote = contextual.caseSensitive ? issue.source_quote : issue.source_quote.toLocaleLowerCase('en-US')
    const draftQuote = contextual.caseSensitive ? issue.draft_quote : issue.draft_quote.toLocaleLowerCase('en-US')
    const comparableSource = contextual.caseSensitive ? source : source.toLocaleLowerCase('en-US')
    const contextualRanges = contextual.sourceContexts.flatMap(context => {
      const comparableContext = contextual.caseSensitive ? context : context.toLocaleLowerCase('en-US')
      const ranges = []
      for (let index = comparableSource.indexOf(comparableContext); index !== -1; index = comparableSource.indexOf(comparableContext, index + comparableContext.length)) {
        ranges.push({start: index, end: index + comparableContext.length})
      }
      return ranges
    })
    if (!contextualRanges.length) continue
    const comparableTerm = contextual.caseSensitive ? contextual.source : contextual.source.toLocaleLowerCase('en-US')
    if (!quote.includes(comparableTerm)) continue
    const quoteRanges = []
    for (let index = comparableSource.indexOf(quote); index !== -1; index = comparableSource.indexOf(quote, index + quote.length)) {
      quoteRanges.push({start: index, end: index + quote.length})
    }
    const contextualQuoteRanges = quoteRanges.filter(quoteRange =>
      contextualRanges.some(contextRange => quoteRange.start < contextRange.end && quoteRange.end > contextRange.start),
    )
    if (!contextualQuoteRanges.length) continue
    if (contextualQuoteRanges.length === quoteRanges.length) return true
    for (const context of contextual.sourceContexts) {
      const boundSource = contextBoundToken(context, contextual.source, contextual.source, contextual.caseSensitive)
      const comparableBoundSource = contextual.caseSensitive ? boundSource : boundSource.toLocaleLowerCase('en-US')
      if (boundSource !== contextual.source && draftQuote.includes(comparableBoundSource)) return true
    }
    if (quote === comparableTerm && draftQuote === comparableTerm) return true
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
