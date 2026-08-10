'use strict'

const crypto = require('node:crypto')

const MARKER_NAMESPACE = 'ZDOC-PROTECTED'
const MARKER_SOURCE = '<!-- ZDOC-PROTECTED:\\d{6}:[0-9a-f]{16} -->'
const HUMAN_FRONTMATTER_FIELDS = new Set(['title', 'sidebar_label', 'description', 'keywords'])

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

function lineRecords(content) {
  const records = []
  const pattern = /.*?(?:\r\n|\n|$)/g
  let match
  while ((match = pattern.exec(content)) && match[0]) {
    records.push({start: match.index, end: match.index + match[0].length, text: match[0]})
  }
  return records
}

function overlaps(left, right) {
  return left.start < right.end && right.start < left.end
}

function addSpan(spans, start, end, category) {
  if (!Number.isInteger(start) || !Number.isInteger(end) || end <= start) return
  const candidate = {start, end, category}
  if (spans.some(span => overlaps(span, candidate))) return
  spans.push(candidate)
}

function addRegexSpans(content, spans, pattern, category, captureIndex = 0) {
  for (const match of content.matchAll(pattern)) {
    const value = match[captureIndex]
    if (!value) continue
    const relative = captureIndex === 0 ? 0 : match[0].indexOf(value)
    addSpan(spans, match.index + relative, match.index + relative + value.length, category)
  }
}

function addFencedCodeSpans(content, spans) {
  const lines = lineRecords(content)
  for (let index = 0; index < lines.length; index++) {
    const opening = lines[index].text.match(/^([ \t]*)(`{3,}|~{3,})[^\r\n]*(?:\r\n|\n|$)/)
    if (!opening) continue
    const openingIndent = opening[1]
    const fence = opening[2]
    let closingIndex = index + 1
    while (closingIndex < lines.length) {
      const closing = lines[closingIndex].text.match(/^([ \t]*)(`{3,}|~{3,})[ \t]*(?:\r\n|\n|$)/)
      const compatibleIndent = closing && (
        (openingIndent.length <= 3 && closing[1].length <= 3)
        || closing[1] === openingIndent
      )
      if (compatibleIndent && closing[2][0] === fence[0] && closing[2].length >= fence.length) break
      closingIndex += 1
    }
    const end = closingIndex < lines.length ? lines[closingIndex].end : content.length
    addSpan(spans, lines[index].start, end, 'fenced_code_block')
    index = closingIndex
  }
}

function addFrontmatterSpans(content, spans) {
  const lines = lineRecords(content)
  if (!lines.length || !/^---(?:\r\n|\n)$/.test(lines[0].text)) return
  const closingIndex = lines.findIndex((line, index) => index > 0 && /^---[ \t]*(?:\r\n|\n|$)$/.test(line.text))
  if (closingIndex === -1) return
  addSpan(spans, lines[0].start, lines[0].end, 'frontmatter_structure')
  addSpan(spans, lines[closingIndex].start, lines[closingIndex].end, 'frontmatter_structure')

  function protectHumanValue(line, valueStart, valueEnd, value, ending) {
    if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
      addSpan(spans, valueStart, valueStart + 1, 'frontmatter_structure')
      addSpan(spans, valueEnd - 1, line.end, 'frontmatter_structure')
    } else if (ending) {
      addSpan(spans, valueEnd, line.end, 'frontmatter_structure')
    }
  }

  let humanBlock = null
  for (let index = 1; index < closingIndex; index++) {
    const line = lines[index]
    const ending = line.text.endsWith('\r\n') ? '\r\n' : line.text.endsWith('\n') ? '\n' : ''
    const body = ending ? line.text.slice(0, -ending.length) : line.text
    if (!body.trim() || body.trimStart().startsWith('#')) {
      addSpan(spans, line.start, line.end, 'frontmatter_structure')
      continue
    }
    const indentation = body.match(/^[ \t]*/)[0].length
    if (humanBlock && indentation > humanBlock.indentation) {
      if (humanBlock.kind === 'keywords') {
        const itemMatch = body.match(/^([ \t]*-[ \t]+)(.*)$/)
        if (itemMatch) {
          const valueStart = line.start + itemMatch[1].length
          const valueEnd = line.start + body.length
          addSpan(spans, line.start, valueStart, 'frontmatter_structure')
          protectHumanValue(line, valueStart, valueEnd, itemMatch[2], ending)
          continue
        }
      }
      addSpan(spans, line.start, line.end, 'frontmatter_structure')
      continue
    }
    humanBlock = null
    const keyMatch = body.match(/^([ \t]*)([A-Za-z0-9_.-]+)([ \t]*:[ \t]*)(.*)$/)
    if (!keyMatch) {
      addSpan(spans, line.start, line.end, 'frontmatter_structure')
      continue
    }
    const prefixLength = keyMatch[1].length + keyMatch[2].length + keyMatch[3].length
    addSpan(spans, line.start, line.start + prefixLength, 'frontmatter_structure')
    const valueStart = line.start + prefixLength
    const valueEnd = line.start + body.length
    if (!HUMAN_FRONTMATTER_FIELDS.has(keyMatch[2])) {
      addSpan(spans, valueStart, line.end, 'frontmatter_value')
      continue
    }
    const value = keyMatch[4]
    if (keyMatch[2] === 'keywords' && !value.trim()) {
      humanBlock = {kind: 'keywords', indentation: keyMatch[1].length}
    } else if (/^[>|][-+]?$/.test(value.trim())) {
      addSpan(spans, valueStart, line.end, 'frontmatter_structure')
      continue
    }
    protectHumanValue(line, valueStart, valueEnd, value, ending)
  }
}

function addJsxSpans(content, spans) {
  for (let start = content.indexOf('<'); start !== -1; start = content.indexOf('<', start + 1)) {
    const prefix = content.slice(start)
    if (!/^(?:<\/?[A-Za-z][A-Za-z0-9_.:-]*(?=[\s/>])|<>|<\/>)/.test(prefix)) continue
    let quote = null
    let braceDepth = 0
    let escaped = false
    for (let index = start + 1; index < content.length; index++) {
      const character = content[index]
      if (quote) {
        if (escaped) escaped = false
        else if (character === '\\') escaped = true
        else if (character === quote) quote = null
        continue
      }
      if (character === '"' || character === "'") {
        quote = character
        continue
      }
      if (character === '{') braceDepth += 1
      else if (character === '}' && braceDepth > 0) braceDepth -= 1
      else if (character === '>' && braceDepth === 0) {
        addSpan(spans, start, index + 1, 'jsx_tag')
        start = index
        break
      }
    }
  }
}

function addEsmSpans(content, spans) {
  const syntax = /^[\t ]*(?:import(?:[\t ]+(?:(?:[A-Za-z_$][\w$]*[\t ]+from\b)|(?:[A-Za-z_$][\w$]*[\t ]*,)|\{|\*[\t ]+as\b|["']))|export[\t ]+(?:default\b|const\b|let\b|var\b|function\b|class\b|\{|\*))/
  const lines = lineRecords(content)
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]
    if (!syntax.test(line.text)) continue
    let braces = 0
    let brackets = 0
    let parentheses = 0
    let quote = null
    let escaped = false
    let end = line.end
    for (let index = line.start; index < content.length; index++) {
      const character = content[index]
      if (quote) {
        if (escaped) escaped = false
        else if (character === '\\') escaped = true
        else if (character === quote) quote = null
        continue
      }
      if (character === '"' || character === "'" || character === '`') {
        quote = character
        continue
      }
      if (character === '{') braces += 1
      else if (character === '}') braces = Math.max(0, braces - 1)
      else if (character === '[') brackets += 1
      else if (character === ']') brackets = Math.max(0, brackets - 1)
      else if (character === '(') parentheses += 1
      else if (character === ')') parentheses = Math.max(0, parentheses - 1)
      const atLineEnd = character === '\n' || index === content.length - 1
      if (!atLineEnd || braces || brackets || parentheses) continue
      end = index + 1
      const statement = content.slice(line.start, end).trim()
      const completeImport = /^import\b/.test(statement) && (/\bfrom\s+["'][^"']+["'];?$/.test(statement) || /^import\s+["'][^"']+["'];?$/.test(statement))
      const completeExport = /^export\b/.test(statement) && (statement.endsWith(';') || !/[=,{[(]$/.test(statement))
      if (completeImport || completeExport) break
    }
    addSpan(spans, line.start, end, 'esm_statement')
    while (lineIndex + 1 < lines.length && lines[lineIndex + 1].end <= end) lineIndex += 1
  }
}

function addInlineCodeSpans(content, spans) {
  const pattern = /`+/g
  let opening
  while ((opening = pattern.exec(content))) {
    const ticks = opening[0]
    const start = opening.index
    const closing = content.indexOf(ticks, start + ticks.length)
    if (closing === -1) continue
    addSpan(spans, start, closing + ticks.length, 'inline_code')
    pattern.lastIndex = closing + ticks.length
  }
}

function addHtmlCodeSpans(content, spans) {
  addRegexSpans(content, spans, /<code(?:\s[^<>]*?)?>[\s\S]*?<\/code>/gi, 'inline_code')
}

function addMdxExpressionSpans(content, spans) {
  for (let start = content.indexOf('{'); start !== -1; start = content.indexOf('{', start + 1)) {
    if (spans.some(span => start >= span.start && start < span.end)) continue
    let depth = 0
    let quote = null
    let escaped = false
    for (let index = start; index < content.length; index++) {
      const character = content[index]
      if (quote) {
        if (escaped) escaped = false
        else if (character === '\\') escaped = true
        else if (character === quote) quote = null
        continue
      }
      if (character === '"' || character === "'" || character === '`') {
        quote = character
        continue
      }
      if (character === '{') depth += 1
      if (character === '}') {
        depth -= 1
        if (depth === 0) {
          addSpan(spans, start, index + 1, 'mdx_expression')
          start = index
          break
        }
      }
    }
  }
}

function protectedSpans(content) {
  const spans = []
  addFencedCodeSpans(content, spans)
  addFrontmatterSpans(content, spans)
  addRegexSpans(content, spans, /<!--[\s\S]*?-->(?:\r\n|\n)?/g, 'html_comment')
  addEsmSpans(content, spans)
  addHtmlCodeSpans(content, spans)
  addJsxSpans(content, spans)
  addInlineCodeSpans(content, spans)
  addRegexSpans(content, spans, /\\?\{#[A-Za-z0-9][\w.-]*\}/g, 'heading_anchor')
  addRegexSpans(content, spans, /\{\{[^{}\r\n]+\}\}|\$\{[^{}\r\n]+\}|%[A-Z][A-Z0-9_]*%/g, 'placeholder')
  addMdxExpressionSpans(content, spans)
  addRegexSpans(content, spans, /!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g, 'markdown_destination', 1)
  addRegexSpans(content, spans, /^\s*\[[^\]]+\]:\s*(\S+)/gm, 'markdown_destination', 1)
  addRegexSpans(content, spans, /https?:\/\/[^\s<>"')\]}]+/g, 'url')
  addRegexSpans(content, spans, /(?:\.\.?\/|\/(?!\/)|(?:content|docs|i18n|scripts|config|packages|apps|generated|tmp|\.github)\/)[A-Za-z0-9._~!$&'()*+,;=:@%/-]+/g, 'repository_path')
  addRegexSpans(content, spans, /(?:^|[^A-Za-z0-9-])(--[A-Za-z0-9][A-Za-z0-9-]*)/gm, 'cli_option', 1)
  return spans.sort((left, right) => left.start - right.start || left.end - right.end)
}

function markerFor(index, category, original) {
  const digest = crypto.createHash('sha256').update(category).update('\0').update(original).digest('hex').slice(0, 16)
  return `<!-- ${MARKER_NAMESPACE}:${String(index).padStart(6, '0')}:${digest} -->`
}

function manifestEntries(source, options = {}) {
  const entries = protectedSpans(source).map((span, index) => {
    const original = source.slice(span.start, span.end)
    const newline = original.endsWith('\r\n') ? '\r\n' : original.endsWith('\n') ? '\n' : ''
    const marker = markerFor(index, span.category, original)
    const lineIndex = source.slice(0, span.start).split('\n').length - 1
    return {...span, marker, transport: `${marker}${newline}`, original, lineIndex}
  })
  const grouped = entries.map((entry, index) => ({
    ...entry,
    orderGroup: `fixed:${index}`,
    reorderPolicy: 'fixed',
  }))
  for (let start = 0; start < grouped.length;) {
    if (grouped[start].category !== 'inline_code') {
      start += 1
      continue
    }
    let end = start + 1
    while (
      end < grouped.length &&
      grouped[end].category === 'inline_code' &&
      grouped[end].lineIndex === grouped[start].lineIndex
    ) end += 1
    if (end - start > 1) {
      for (let index = start; index < end; index++) {
        grouped[index].orderGroup = `inline-line:${grouped[start].lineIndex}:${start}`
        grouped[index].reorderPolicy = 'within_group'
      }
    }
    start = end
  }
  if (options.reorderWithin !== undefined) {
    if (typeof options.reorderWithin !== 'string' || !options.reorderWithin.trim()) {
      throw new Error('Protected marker reorderWithin must be a non-empty string')
    }
    return grouped.map(entry => ({
      ...entry,
      orderGroup: `semantic-unit:${options.reorderWithin}`,
      reorderPolicy: 'within_semantic_unit',
    }))
  }
  return grouped
}

function protectTranslationInput(sourceContent, options = {}) {
  const source = String(sourceContent)
  if (source.includes(MARKER_NAMESPACE)) throw new Error(`Source contains reserved ${MARKER_NAMESPACE} marker namespace`)
  const entries = manifestEntries(source, options)
  let content = ''
  let offset = 0
  for (const entry of entries) {
    content += source.slice(offset, entry.start)
    content += entry.transport
    offset = entry.end
  }
  content += source.slice(offset)
  return deepFreeze({content, manifest: {schemaVersion: 2, entries}})
}

function reprotectTranslationInput(restoredContent, manifest) {
  const restored = String(restoredContent)
  if (restored.includes(MARKER_NAMESPACE)) throw new Error(`Restored content contains reserved ${MARKER_NAMESPACE} marker namespace`)
  const remaining = manifest.entries.map((entry, manifestIndex) => ({entry, manifestIndex}))
  let content = ''
  let offset = 0
  while (remaining.length) {
    const candidates = remaining
      .map((candidate, index) => ({
        ...candidate,
        index,
        start: restored.indexOf(candidate.entry.original, offset),
      }))
      .filter(candidate => candidate.start !== -1)
      .sort((left, right) => left.start - right.start
        || right.entry.original.length - left.entry.original.length
        || left.manifestIndex - right.manifestIndex)
    if (!candidates.length) throw new Error('Restored content is missing protected content required for reprotection')
    const selected = candidates[0]
    content += restored.slice(offset, selected.start)
    content += selected.entry.transport
    offset = selected.start + selected.entry.original.length
    remaining.splice(selected.index, 1)
  }
  content += restored.slice(offset)
  return deepFreeze({content, manifest})
}

function compressed(values) {
  return values.filter((value, index) => index === 0 || value !== values[index - 1])
}

function restoreProtectedContent(modelContent, manifest) {
  let restored = String(modelContent)
  const markerPattern = new RegExp(MARKER_SOURCE, 'g')
  const actualMarkerMatches = [...restored.matchAll(markerPattern)]
  const actualMarkers = actualMarkerMatches.map(match => match[0])
  const expectedMarkers = manifest.entries.map(entry => entry.marker)
  const withoutExactMarkers = restored.replace(new RegExp(MARKER_SOURCE, 'g'), '')
  if (withoutExactMarkers.includes(MARKER_NAMESPACE)) throw new Error('Protected marker was altered or forged during translation')
  const entryByMarker = new Map(manifest.entries.map(entry => [entry.marker, entry]))
  const markerId = marker => marker.match(/ZDOC-PROTECTED:(\d{6})/)?.[1] || marker.slice(0, 80)
  const markerPosition = match => {
    const prefix = restored.slice(0, match.index)
    const line = prefix.split('\n').length
    const lastBreak = prefix.lastIndexOf('\n')
    return {line, column: match.index - lastBreak, offset: match.index}
  }
  const markerLocation = match => {
    const position = markerPosition(match)
    return `${markerId(match[0])} at line ${position.line}, column ${position.column}, offset ${position.offset}`
  }
  const unknown = [...new Map(actualMarkerMatches
    .filter(match => !entryByMarker.has(match[0]))
    .map(match => [match[0], markerLocation(match)])).values()]
  if (unknown.length) throw new Error(`Unknown protected marker(s): ${unknown.join(', ')}`)
  const actualCounts = new Map()
  for (const marker of actualMarkers) actualCounts.set(marker, (actualCounts.get(marker) || 0) + 1)
  const duplicateMarker = expectedMarkers.find(marker => (actualCounts.get(marker) || 0) > 1)
  if (duplicateMarker) {
    const id = markerId(duplicateMarker)
    const occurrences = actualMarkerMatches.filter(match => match[0] === duplicateMarker).map(markerPosition)
    const error = new Error(
      `Duplicate protected marker ${id}: expected=1, actual=${occurrences.length}; occurrences: ${occurrences.map(position => `line ${position.line}, column ${position.column}, offset ${position.offset}`).join('; ')}`,
    )
    error.code = 'DUPLICATE_PROTECTED_MARKER'
    error.markerId = id
    error.expectedCount = 1
    error.actualCount = occurrences.length
    error.occurrences = occurrences
    throw error
  }
  const missing = expectedMarkers.filter(marker => !actualCounts.has(marker)).map(markerId)
  if (missing.length) throw new Error(`Missing protected marker(s): ${missing.join(', ')}`)
  const expectedGroups = compressed(manifest.entries.map(entry => entry.orderGroup || entry.marker))
  const actualGroups = compressed(actualMarkers.map(marker => entryByMarker.get(marker).orderGroup || marker))
  if (JSON.stringify(actualGroups) !== JSON.stringify(expectedGroups)) throw new Error('Protected markers crossed an allowed order group during translation')
  for (const entry of manifest.entries) {
    if (restored.split(entry.transport).length !== 2) throw new Error(`Protected ${entry.category} marker transport was changed during translation`)
    restored = restored.replace(entry.transport, () => entry.original)
  }
  if (restored.includes(MARKER_NAMESPACE)) throw new Error('Unexpected protected marker remained after translation')
  return restored
}

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 12)
}

function entryLocation(content, entry, pathLabel) {
  const prefix = String(content).slice(0, entry.start)
  const line = prefix.split('\n').length
  const lastBreak = prefix.lastIndexOf('\n')
  const column = entry.start - lastBreak
  const token = JSON.stringify(entry.original.length > 160 ? `${entry.original.slice(0, 157)}...` : entry.original)
  return `${pathLabel}: line ${line}, column ${column}, offset ${entry.start}, token ${token}`
}

function protectedEntryKey(entry) {
  return `${entry.category}\0${entry.original}`
}

function unmatchedEntries(entries, oppositeEntries) {
  const available = new Map()
  for (const entry of oppositeEntries) {
    const key = protectedEntryKey(entry)
    available.set(key, (available.get(key) || 0) + 1)
  }
  return entries.filter(entry => {
    const key = protectedEntryKey(entry)
    const count = available.get(key) || 0
    if (!count) return true
    available.set(key, count - 1)
    return false
  })
}

function validateProtectedContent(sourceContent, targetContent, options = {}) {
  const sourceEntries = manifestEntries(String(sourceContent))
  const targetEntries = manifestEntries(String(targetContent))
  const unmatchedSource = unmatchedEntries(sourceEntries, targetEntries)
  const unmatchedTarget = unmatchedEntries(targetEntries, sourceEntries)
  const errors = []
  const categories = [...new Set([
    ...unmatchedSource.map(entry => entry.category),
    ...unmatchedTarget.map(entry => entry.category),
  ])]
  for (const category of categories) {
    const source = unmatchedSource.filter(entry => entry.category === category)
    const target = unmatchedTarget.filter(entry => entry.category === category)
    const paired = Math.min(source.length, target.length)
    for (let index = 0; index < paired; index++) {
      errors.push(`Protected content mismatch for ${category}: source ${entryLocation(sourceContent, source[index], options.sourcePath || '<source>')} sha256 ${digest(source[index].original)}; target ${entryLocation(targetContent, target[index], options.targetPath || options.sourcePath || '<target>')} sha256 ${digest(target[index].original)}`)
    }
    for (const entry of source.slice(paired)) errors.push(`Missing protected ${category}: ${entryLocation(sourceContent, entry, options.sourcePath || '<source>')} sha256 ${digest(entry.original)}`)
    for (const entry of target.slice(paired)) errors.push(`Unexpected protected ${category}: ${entryLocation(targetContent, entry, options.targetPath || options.sourcePath || '<target>')} sha256 ${digest(entry.original)}`)
  }
  return Object.freeze(errors)
}

module.exports = {
  protectTranslationInput,
  reprotectTranslationInput,
  restoreProtectedContent,
  validateProtectedContent,
}
