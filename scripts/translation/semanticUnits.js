'use strict'

const {protectTranslationInput, reprotectTranslationInput, restoreProtectedContent, validateProtectedContent} = require('./protectedContent')
const {applyDeterministicLocaleRepairs, validateLocaleContractDraft} = require('./localeContract')

let mdxProcessorPromise

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

function lineRecords(content, offset = 0) {
  const records = []
  const pattern = /.*?(?:\r\n|\n|$)/g
  let match
  while ((match = pattern.exec(content)) && match[0]) {
    const ending = match[0].endsWith('\r\n') ? '\r\n' : match[0].endsWith('\n') ? '\n' : ''
    records.push({
      start: offset + match.index,
      end: offset + match.index + match[0].length,
      bodyEnd: offset + match.index + match[0].length - ending.length,
      text: match[0],
      body: ending ? match[0].slice(0, -ending.length) : match[0],
    })
  }
  return records
}

function frontmatterBoundary(source) {
  if (!source.startsWith('---\n') && !source.startsWith('---\r\n')) return null
  const match = source.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/)
  return match ? {start: 0, end: match[0].length, text: match[0]} : null
}

function trimmedScalarRange(source, start, end) {
  while (start < end && /[\t ]/.test(source[start])) start += 1
  while (end > start && /[\t ]/.test(source[end - 1])) end -= 1
  if (end - start >= 2 && ((source[start] === '"' && source[end - 1] === '"') || (source[start] === "'" && source[end - 1] === "'"))) {
    start += 1
    end -= 1
  }
  return end > start ? {start, end, source: source.slice(start, end)} : null
}

function collectFrontmatterUnits(source, boundary, idPrefix) {
  if (!boundary) return []
  const units = []
  const lines = lineRecords(boundary.text)
  let keywordsIndent = null
  let keywordIndex = 0
  for (let index = 1; index < lines.length - 1; index += 1) {
    const line = lines[index]
    const indentation = line.body.match(/^[\t ]*/)?.[0].length || 0
    if (keywordsIndent !== null && indentation > keywordsIndent) {
      const item = line.body.match(/^[\t ]*-[\t ]+(.*)$/)
      if (item) {
        const rawStart = line.start + line.body.length - item[1].length
        const range = trimmedScalarRange(source, rawStart, line.bodyEnd)
        if (range) units.push({
          id: `${idPrefix}.frontmatter.keywords.${String(++keywordIndex).padStart(4, '0')}`,
          kind: 'frontmatter-scalar',
          ...range,
        })
        continue
      }
    }
    keywordsIndent = null
    const match = line.body.match(/^([\t ]*)(title|sidebar_label|description|keywords)([\t ]*:[\t ]*)(.*)$/)
    if (!match) continue
    const key = match[2]
    const value = match[4]
    const rawStart = line.start + match[1].length + key.length + match[3].length
    if (key === 'keywords' && !value.trim()) {
      keywordsIndent = match[1].length
      continue
    }
    const range = trimmedScalarRange(source, rawStart, line.bodyEnd)
    if (!range) continue
    units.push({
      id: `${idPrefix}.frontmatter.${key}`,
      kind: 'frontmatter-scalar',
      ...range,
    })
  }
  return units
}

function tableCellRanges(line) {
  const text = line.body
  const separators = []
  let codeTicks = 0
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '`') {
      let end = index + 1
      while (text[end] === '`') end += 1
      const ticks = end - index
      if (codeTicks === 0) codeTicks = ticks
      else if (codeTicks === ticks) codeTicks = 0
      index = end - 1
      continue
    }
    if (text[index] === '|' && codeTicks === 0 && text[index - 1] !== '\\') separators.push(index)
  }
  if (!separators.length) return []
  const segments = []
  let segmentStart = 0
  for (const separator of separators) {
    segments.push([segmentStart, separator])
    segmentStart = separator + 1
  }
  segments.push([segmentStart, text.length])
  while (segments.length && !text.slice(segments[0][0], segments[0][1]).trim()) segments.shift()
  while (segments.length && !text.slice(segments.at(-1)[0], segments.at(-1)[1]).trim()) segments.pop()
  return segments.map(([relativeStart, relativeEnd]) => {
    let start = line.start + relativeStart
    let end = line.start + relativeEnd
    while (start < end && /[\t ]/.test(sourceCharacter(line, start))) start += 1
    while (end > start && /[\t ]/.test(sourceCharacter(line, end - 1))) end -= 1
    return {start, end}
  }).filter(range => range.end > range.start)
}

function sourceCharacter(line, absoluteIndex) {
  return line.body[absoluteIndex - line.start] || ''
}

function collectTableUnits(source, bodyOffset, idPrefix) {
  const lines = lineRecords(source.slice(bodyOffset), bodyOffset)
  const units = []
  const blocks = []
  let tableIndex = 0
  for (let index = 0; index + 1 < lines.length; index += 1) {
    const headerCells = tableCellRanges(lines[index])
    const delimiterCells = tableCellRanges(lines[index + 1])
    if (headerCells.length < 2 || delimiterCells.length !== headerCells.length) continue
    if (!delimiterCells.every(range => /^:?-{3,}:?$/.test(source.slice(range.start, range.end).trim()))) continue
    const tableNumber = ++tableIndex
    const rows = [{line: lines[index], cells: headerCells}]
    let cursor = index + 2
    while (cursor < lines.length) {
      const cells = tableCellRanges(lines[cursor])
      if (cells.length < 2) break
      rows.push({line: lines[cursor], cells})
      cursor += 1
    }
    rows.forEach((row, rowIndex) => row.cells.forEach((range, cellIndex) => units.push({
      id: `${idPrefix}.table.${String(tableNumber).padStart(4, '0')}.row.${String(rowIndex + 1).padStart(4, '0')}.cell.${String(cellIndex + 1).padStart(4, '0')}`,
      kind: 'table-cell',
      ...range,
      source: source.slice(range.start, range.end),
    })))
    blocks.push({start: lines[index].start, end: lines[Math.max(index + 1, cursor - 1)].end})
    index = Math.max(index + 1, cursor - 1)
  }
  return {units, blocks}
}

function overlaps(left, right) {
  return left.start < right.end && right.start < left.end
}

function headingTextRange(source, start, end) {
  const raw = source.slice(start, end)
  const match = raw.match(/^ {0,3}#{1,6}[\t ]+([\s\S]*?)(?:[\t ]*\\?\{#[A-Za-z0-9][\w.-]*\})?[\t ]*$/)
  if (!match) return {start, end, source: raw}
  const relative = raw.indexOf(match[1])
  return {start: start + relative, end: start + relative + match[1].length, source: match[1]}
}

function visit(node, callback) {
  callback(node)
  for (const child of node.children || []) visit(child, callback)
}

async function mdxProcessor() {
  if (!mdxProcessorPromise) mdxProcessorPromise = import('@mdx-js/mdx').then(({createProcessor}) => createProcessor({format: 'mdx'}))
  return mdxProcessorPromise
}

async function collectSemanticUnits(sourceContent, {idPrefix = 'document'} = {}) {
  const source = String(sourceContent)
  if (typeof idPrefix !== 'string' || !idPrefix.trim()) throw new Error('Semantic unit idPrefix must be a non-empty string')
  const boundary = frontmatterBoundary(source)
  const bodyOffset = boundary?.end || 0
  const units = collectFrontmatterUnits(source, boundary, idPrefix)
  const tables = collectTableUnits(source, bodyOffset, idPrefix)
  const tree = (await mdxProcessor()).parse(source.slice(bodyOffset))
  let headingIndex = 0
  let paragraphIndex = 0
  visit(tree, node => {
    if (node.type !== 'heading' && node.type !== 'paragraph') return
    const localStart = node.position?.start?.offset
    const localEnd = node.position?.end?.offset
    if (!Number.isInteger(localStart) || !Number.isInteger(localEnd)) return
    const absolute = {start: bodyOffset + localStart, end: bodyOffset + localEnd}
    if (tables.blocks.some(block => overlaps(block, absolute))) return
    if (node.type === 'heading') {
      units.push({
        id: `${idPrefix}.heading.${String(++headingIndex).padStart(4, '0')}`,
        kind: 'heading',
        ...headingTextRange(source, absolute.start, absolute.end),
      })
      return
    }
    units.push({
      id: `${idPrefix}.paragraph.${String(++paragraphIndex).padStart(4, '0')}`,
      kind: 'paragraph',
      ...absolute,
      source: source.slice(absolute.start, absolute.end),
    })
  })
  units.push(...tables.units)
  units.sort((left, right) => left.start - right.start || left.end - right.end || left.id.localeCompare(right.id))
  for (let index = 1; index < units.length; index += 1) {
    if (overlaps(units[index - 1], units[index])) throw new Error(`Semantic units overlap: ${units[index - 1].id} and ${units[index].id}`)
  }
  return deepFreeze(units)
}

function protectSemanticUnits(units, textForUnit = unit => unit.source) {
  if (!Array.isArray(units)) throw new Error('Semantic units must be an array')
  return deepFreeze(units.map(unit => {
    const text = textForUnit(unit)
    if (typeof text !== 'string') throw new Error(`Semantic unit ${unit.id} text must be a string`)
    return {
      ...unit,
      protectedText: text,
      protection: protectTranslationInput(text, {reorderWithin: unit.id}),
    }
  }))
}

function reprotectSemanticUnits(sourceUnits, translatedUnits) {
  const translatedById = new Map(translatedUnits.map(unit => [unit.id, unit]))
  if (translatedById.size !== sourceUnits.length) throw new Error('Semantic reprotection unit count mismatch')
  return deepFreeze(sourceUnits.map(sourceUnit => {
    const translated = translatedById.get(sourceUnit.id)
    if (!translated || typeof translated.translation !== 'string') throw new Error(`Missing translated semantic unit ${sourceUnit.id}`)
    return {
      ...sourceUnit,
      protectedText: translated.translation,
      protection: reprotectTranslationInput(translated.translation, sourceUnit.protection.manifest),
    }
  }))
}

function stripOuterJsonFence(text) {
  return String(text || '').trim().replace(/^```(?:json)?[\t ]*\r?\n/i, '').replace(/\r?\n```$/, '').trim()
}

function exactObjectKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object with an exact schema`)
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) throw new Error(`${label} must use the exact schema fields`)
}

function parseSemanticUnitResponse(modelText, {field, expectedUnits}) {
  if (typeof field !== 'string' || !field) throw new Error('Semantic unit response field is required')
  let parsed
  try {
    parsed = JSON.parse(stripOuterJsonFence(modelText))
  } catch (error) {
    throw new Error(`Semantic unit response must be valid JSON: ${error.message}`)
  }
  exactObjectKeys(parsed, [field], 'Semantic unit response')
  const entries = parsed[field]
  if (!Array.isArray(entries) || entries.length !== expectedUnits.length) throw new Error('Semantic unit response entry count mismatch')
  const byId = new Map()
  for (const entry of entries) {
    exactObjectKeys(entry, ['id', 'text'], 'Semantic unit response entry')
    if (typeof entry.id !== 'string' || typeof entry.text !== 'string' || byId.has(entry.id)) {
      throw new Error('Semantic unit response entries must use unique string id and text fields')
    }
    byId.set(entry.id, entry.text)
  }
  const expectedIds = new Set(expectedUnits.map(unit => unit.id))
  const unknown = [...byId.keys()].filter(id => !expectedIds.has(id))
  if (unknown.length) throw new Error(`Unknown semantic unit ID(s): ${unknown.join(', ')}`)
  return expectedUnits.map(unit => {
    if (!byId.has(unit.id)) throw new Error(`Missing semantic unit ID ${unit.id}`)
    return Object.freeze({id: unit.id, text: byId.get(unit.id)})
  })
}

function protectedContentError(message, cause) {
  const error = new Error(message, cause ? {cause} : undefined)
  error.failureCategory = 'protected_content_failed'
  error.code = 'PROTECTED_CONTENT_FAILED'
  return error
}

function restoreSemanticUnitResponse(modelText, {field, protectedUnits, localeContract}) {
  const parsed = parseSemanticUnitResponse(modelText, {field, expectedUnits: protectedUnits})
  const byId = new Map(parsed.map(entry => [entry.id, entry.text]))
  return deepFreeze(protectedUnits.map(unit => {
    const modelTranslation = localeContract
      ? applyDeterministicLocaleRepairs(unit.protection.content, byId.get(unit.id), localeContract)
      : byId.get(unit.id)
    let translation
    try {
      translation = restoreProtectedContent(modelTranslation, unit.protection.manifest)
    } catch (error) {
      throw protectedContentError(`Semantic unit ${unit.id} failed protected marker validation: ${error.message}`, error)
    }
    const errors = validateProtectedContent(unit.protectedText, translation)
    if (errors.length) throw protectedContentError(`Semantic unit ${unit.id} changed protected content: ${errors.join('; ')}`)
    const {protection, protectedText, ...restoredUnit} = unit
    return {...restoredUnit, translation}
  }))
}

function patchSemanticUnits(sourceContent, units, translatedUnits) {
  const source = String(sourceContent)
  if (!Array.isArray(units) || !Array.isArray(translatedUnits)) throw new Error('Semantic unit patch inputs must be arrays')
  const unitById = new Map(units.map(unit => [unit.id, unit]))
  const seen = new Set()
  const patches = translatedUnits.map(item => {
    if (!item || typeof item.id !== 'string' || typeof item.translation !== 'string') {
      throw new Error('Semantic unit patches must contain string id and translation fields')
    }
    if (seen.has(item.id)) throw new Error(`Duplicate semantic unit patch ${item.id}`)
    seen.add(item.id)
    const unit = unitById.get(item.id)
    if (!unit) throw new Error(`Unknown semantic unit patch ${item.id}`)
    return {...unit, translation: item.translation}
  }).sort((left, right) => right.start - left.start || right.end - left.end)
  let output = source
  for (const patch of patches) output = `${output.slice(0, patch.start)}${patch.translation}${output.slice(patch.end)}`
  return output
}

function bindSemanticReviewEvidence(evidence, sourceUnits, draftUnits) {
  const draftById = new Map(draftUnits.map(unit => [unit.id, unit]))
  const validatedIssues = []
  const issueUnits = []
  const unsupportedIssues = [...(evidence.unsupportedIssues || [])]
  for (const issue of evidence.validatedIssues || []) {
    const matchingUnit = sourceUnits.find(unit => {
      const draft = draftById.get(unit.id)
      return (issue.location === unit.id || issue.location.startsWith(`${unit.id};`))
        && unit.protection.content.includes(issue.source_quote)
        && draft?.protection.content.includes(issue.draft_quote)
    })
    if (matchingUnit) {
      validatedIssues.push(issue)
      issueUnits.push(Object.freeze({unitId: matchingUnit.id, issue}))
    } else {
      unsupportedIssues.push(Object.freeze({
        issue,
        reason: 'Reviewer evidence must identify source and draft quotes from the same semantic unit ID',
      }))
    }
  }
  return {
    ...evidence,
    effectivePass: !evidence.fatal && validatedIssues.length === 0,
    correctionAuthorized: validatedIssues.length > 0,
    validatedIssues: Object.freeze(validatedIssues),
    unsupportedIssues: Object.freeze(unsupportedIssues),
    issueUnits: Object.freeze(issueUnits),
  }
}

function deterministicSemanticIssues(sourceUnits, draftUnits, localeContract) {
  const draftById = new Map(draftUnits.map(unit => [unit.id, unit]))
  const issues = []
  const issueUnits = []
  for (const sourceUnit of sourceUnits) {
    const draftUnit = draftById.get(sourceUnit.id)
    if (!draftUnit) throw new Error(`Missing draft semantic unit ${sourceUnit.id}`)
    for (const issue of validateLocaleContractDraft(
      sourceUnit.protection.content,
      draftUnit.protection.content,
      localeContract,
    )) {
      const scoped = Object.freeze({...issue, location: `${sourceUnit.id}; ${issue.location}`})
      issues.push(scoped)
      issueUnits.push(Object.freeze({unitId: sourceUnit.id, issue: scoped}))
    }
  }
  return Object.freeze({issues: Object.freeze(issues), issueUnits: Object.freeze(issueUnits)})
}

module.exports = {
  bindSemanticReviewEvidence,
  collectSemanticUnits,
  deterministicSemanticIssues,
  parseSemanticUnitResponse,
  patchSemanticUnits,
  protectSemanticUnits,
  reprotectSemanticUnits,
  restoreSemanticUnitResponse,
}
