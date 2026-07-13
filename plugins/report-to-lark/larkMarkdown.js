'use strict'

function splitTableRow(line) {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return trimmed.split(/(?<!\\)\|/).map(cell => cell.trim().replaceAll('\\|', '|'))
}

function isDelimiterRow(line) {
  const cells = splitTableRow(line)
  return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell))
}

function compactTable(headers, rows) {
  return rows.map(cells => {
    const primary = cells[0] || '(unnamed)'
    const details = headers.slice(1).map((header, index) => `${header}: ${cells[index + 1] || ''}`)
    return `- **${primary}**${details.length ? ` · ${details.join(' · ')}` : ''}`
  })
}

function normalizeLarkMarkdown(markdown) {
  const lines = String(markdown || '').split(/\r?\n/)
  const output = []
  for (let index = 0; index < lines.length;) {
    if (index + 1 < lines.length && lines[index].includes('|') && isDelimiterRow(lines[index + 1])) {
      const headers = splitTableRow(lines[index])
      const rows = []
      index += 2
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]))
        index += 1
      }
      output.push(...compactTable(headers, rows))
      continue
    }
    output.push(lines[index])
    index += 1
  }
  return output.join('\n')
}

module.exports = { normalizeLarkMarkdown }
