'use strict'

const DEFAULT_TARGET_CHARS = 16000
const DEFAULT_MAX_CHARS = 24000

function splitLinesWithOffsets(source) {
  const lines = []
  let start = 0
  for (const match of source.matchAll(/.*(?:\r?\n|$)/g)) {
    const text = match[0]
    if (!text) continue
    const end = start + text.length
    lines.push({ text, start, end })
    start = end
  }
  return lines
}

function lineBody(line) {
  return line.text.replace(/\r?\n$/, '')
}

function isBlank(line) {
  return /^\s*$/.test(lineBody(line))
}

function isHeading(line) {
  return /^ {0,3}#{1,6}[\t ]+\S/.test(lineBody(line))
}

function fenceOpener(line) {
  const match = lineBody(line).match(/^ {0,3}(`{3,}|~{3,})/)
  return match ? { marker: match[1][0], length: match[1].length } : null
}

function isFenceCloser(line, fence) {
  const pattern = new RegExp(`^ {0,3}${fence.marker === '`' ? '`' : '~'}{${fence.length},}[\\t ]*$`)
  return pattern.test(lineBody(line))
}

function isTableStart(lines, index) {
  if (index + 1 >= lines.length || !lineBody(lines[index]).includes('|')) return false
  return /^ {0,3}\|?(?:[\t ]*:?-{3,}:?[\t ]*\|)+(?:[\t ]*:?-{3,}:?[\t ]*)?\|?[\t ]*$/.test(lineBody(lines[index + 1]))
}

function jsxDepthDelta(text) {
  let delta = 0
  const tags = text.matchAll(/<\/?([A-Za-z][\w.:/-]*)(?:\s[^<>]*?)?\s*\/?>/g)
  for (const match of tags) {
    const token = match[0]
    if (token.startsWith('</')) delta -= 1
    else if (!token.endsWith('/>')) delta += 1
  }
  return delta
}

function isEsmStart(line) {
  return /^\s*(?:import|export)\b/.test(lineBody(line))
}

function consumeFence(lines, index, fence) {
  let cursor = index + 1
  while (cursor < lines.length) {
    if (isFenceCloser(lines[cursor], fence)) return cursor + 1
    cursor += 1
  }
  return lines.length
}

function consumeAdmonition(lines, index) {
  const marker = lineBody(lines[index]).match(/^\s*(:{3,})\S*/)?.[1]
  if (!marker) return index + 1
  let cursor = index + 1
  const close = new RegExp(`^\\s*${marker}\\s*$`)
  while (cursor < lines.length) {
    if (close.test(lineBody(lines[cursor]))) return cursor + 1
    cursor += 1
  }
  return lines.length
}

function consumeJsx(lines, index) {
  let depth = 0
  let fence = null
  let cursor = index
  while (cursor < lines.length) {
    if (fence) {
      if (isFenceCloser(lines[cursor], fence)) fence = null
      cursor += 1
      continue
    }
    const opener = fenceOpener(lines[cursor])
    if (opener) {
      fence = opener
      cursor += 1
      continue
    }
    depth += jsxDepthDelta(lineBody(lines[cursor]))
    cursor += 1
    if (depth <= 0) return cursor
  }
  return lines.length
}

function consumeEsm(lines, index) {
  let braces = 0
  let cursor = index
  while (cursor < lines.length) {
    const body = lineBody(lines[cursor])
    braces += (body.match(/{/g) || []).length - (body.match(/}/g) || []).length
    cursor += 1
    if (braces <= 0 && /;\s*$/.test(body)) return cursor
    if (braces <= 0 && cursor < lines.length && isBlank(lines[cursor])) return cursor
  }
  return cursor
}

function consumeTable(lines, index) {
  let cursor = index + 2
  while (cursor < lines.length && lineBody(lines[cursor]).includes('|') && !isBlank(lines[cursor])) cursor += 1
  return cursor
}

function consumeListOrQuote(lines, index, kind) {
  const matches = kind === 'quote'
    ? body => /^\s*>/.test(body)
    : body => /^\s*(?:[-+*]|\d+[.)])[\t ]+/.test(body) || /^\s{2,}\S/.test(body)
  let cursor = index + 1
  let pendingBlank = false
  while (cursor < lines.length) {
    const body = lineBody(lines[cursor])
    if (matches(body)) {
      pendingBlank = false
      cursor += 1
      continue
    }
    if (/^\s*$/.test(body)) {
      pendingBlank = true
      cursor += 1
      continue
    }
    if (pendingBlank || !/^\s+/.test(body)) break
    cursor += 1
  }
  while (cursor > index + 1 && isBlank(lines[cursor - 1])) cursor -= 1
  return cursor
}

function consumeParagraph(lines, index) {
  let cursor = index + 1
  while (cursor < lines.length && !isBlank(lines[cursor]) && !isHeading(lines[cursor])) cursor += 1
  return cursor
}

function buildBlocks(source) {
  const lines = splitLinesWithOffsets(source)
  const blocks = []
  let index = 0

  function push(type, endIndex) {
    const start = lines[index].start
    const end = endIndex < lines.length ? lines[endIndex].start : source.length
    blocks.push({ type, start, end })
    index = endIndex
  }

  if (lines.length && lineBody(lines[0]) === '---') {
    let endIndex = 1
    while (endIndex < lines.length && lineBody(lines[endIndex]) !== '---') endIndex += 1
    if (endIndex < lines.length) endIndex += 1
    push('frontmatter', endIndex)
  }

  while (index < lines.length) {
    const body = lineBody(lines[index])
    const fence = fenceOpener(lines[index])
    if (isBlank(lines[index])) {
      let endIndex = index + 1
      while (endIndex < lines.length && isBlank(lines[endIndex])) endIndex += 1
      push('blank', endIndex)
    } else if (fence) {
      push('protected', consumeFence(lines, index, fence))
    } else if (/^\s*:{3,}\S*/.test(body)) {
      push('protected', consumeAdmonition(lines, index))
    } else if (isEsmStart(lines[index])) {
      push('protected', consumeEsm(lines, index))
    } else if (/^\s*<[A-Za-z]/.test(body) && jsxDepthDelta(body) > 0) {
      push('protected', consumeJsx(lines, index))
    } else if (isTableStart(lines, index)) {
      push('protected', consumeTable(lines, index))
    } else if (/^\s*>/.test(body)) {
      push('protected', consumeListOrQuote(lines, index, 'quote'))
    } else if (/^\s*(?:[-+*]|\d+[.)])[\t ]+/.test(body)) {
      push('protected', consumeListOrQuote(lines, index, 'list'))
    } else if (isHeading(lines[index])) {
      push('heading', index + 1)
    } else {
      push('paragraph', consumeParagraph(lines, index))
    }
  }
  return blocks
}

function rangesFromHeadings(source, blocks) {
  if (!blocks.length) return []
  const ranges = []
  let start = 0
  let seenHeading = false
  for (const block of blocks) {
    if (block.type !== 'heading') continue
    if (seenHeading) {
      ranges.push({ start, end: block.start })
      start = block.start
    } else {
      seenHeading = true
    }
  }
  ranges.push({ start, end: source.length })
  return ranges.filter(range => range.end > range.start)
}

function packRanges(ranges, targetChars, maxChars) {
  const packed = []
  let current = null
  for (const range of ranges) {
    if (!current) {
      current = { ...range }
      continue
    }
    const combinedLength = range.end - current.start
    const currentLength = current.end - current.start
    if (currentLength < targetChars && combinedLength <= maxChars) {
      current.end = range.end
    } else {
      packed.push(current)
      current = { ...range }
    }
  }
  if (current) packed.push(current)
  return packed
}

function splitOversizedRange(range, blocks, targetChars, maxChars) {
  if (range.end - range.start <= maxChars) return [range]
  const contained = blocks
    .filter(block => block.start >= range.start && block.end <= range.end)
    .map(block => ({ start: block.start, end: block.end }))
  return packRanges(contained, targetChars, maxChars)
}

function makeChunk(source, range, index) {
  const chunkSource = source.slice(range.start, range.end)
  const heading = chunkSource.match(/^ {0,3}#{1,6}[\t ]+(.+)$/m)?.[1]?.trim() || null
  return { index, start: range.start, end: range.end, source: chunkSource, heading }
}

function chunkDocument(source, options = {}) {
  const targetChars = Number(options.targetChars || DEFAULT_TARGET_CHARS)
  const maxChars = Number(options.maxChars || DEFAULT_MAX_CHARS)
  if (!Number.isFinite(targetChars) || targetChars <= 0) throw new Error('targetChars must be a positive number')
  if (!Number.isFinite(maxChars) || maxChars <= 0) throw new Error('maxChars must be a positive number')
  if (maxChars < targetChars) throw new Error('maxChars must be greater than or equal to targetChars')
  if (!source) return []
  if (source.length <= targetChars) return [makeChunk(source, { start: 0, end: source.length }, 0)]

  const blocks = buildBlocks(source)
  const sections = rangesFromHeadings(source, blocks)
  const splitSections = sections.flatMap(range => splitOversizedRange(range, blocks, targetChars, maxChars))
  const ranges = packRanges(splitSections, targetChars, maxChars)
  const chunks = ranges.map((range, index) => makeChunk(source, range, index))
  if (chunks.map(chunk => chunk.source).join('') !== source) throw new Error('Chunking was not lossless')
  return chunks
}

module.exports = {
  DEFAULT_MAX_CHARS,
  DEFAULT_TARGET_CHARS,
  buildBlocks,
  chunkDocument,
  splitLinesWithOffsets,
}
