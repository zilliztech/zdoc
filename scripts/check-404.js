'use strict'

const fs = require('node:fs')
const path = require('node:path')
const axios = require('axios')

const DEFAULT_DIRECTORIES = ['docs', 'docs-byoc', 'reference']
const USER_AGENT = 'Mozilla/5.0 (compatible; ZillizDocsLinkChecker/1.0; +https://docs.zilliz.com)'

function findMarkdownFiles(directory, fileList = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name)
    if (entry.isDirectory()) findMarkdownFiles(filePath, fileList)
    else if (/\.mdx?$/.test(entry.name)) fileList.push(filePath)
  }
  return fileList
}

function stripMarkdownTitle(destination) {
  const trimmed = destination.trim()
  const titleMatch = trimmed.match(/^(.*?)(?:\s+(?:"[^"]*"|'[^']*'|\([^()]*\)))$/s)
  return (titleMatch ? titleMatch[1] : trimmed).trim().replace(/\\#/g, '#')
}

function isPlaceholderUrl(url) {
  return /[<{][^>}]+[>}]/.test(url) || /\$\{[^}]+\}/.test(url)
}

function extractExternalLinks(content) {
  const links = []
  const lines = content.split(/\r?\n/)
  let fenced = false

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex]
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced
      continue
    }
    if (fenced) continue

    for (let cursor = 0; cursor < line.length; cursor += 1) {
      if (line[cursor] !== '[' || line[cursor - 1] === '!') continue
      const labelEnd = line.indexOf('](', cursor + 1)
      if (labelEnd === -1) continue

      const destinationStart = labelEnd + 2
      let depth = 1
      let destinationEnd = -1
      for (let index = destinationStart; index < line.length; index += 1) {
        if (line[index] === '\\') {
          index += 1
          continue
        }
        if (line[index] === '(') depth += 1
        if (line[index] === ')') depth -= 1
        if (depth === 0) {
          destinationEnd = index
          break
        }
      }
      if (destinationEnd === -1) continue

      const url = stripMarkdownTitle(line.slice(destinationStart, destinationEnd))
      if (/^https?:\/\//i.test(url) && !isPlaceholderUrl(url)) {
        links.push({ url, line: lineIndex + 1 })
      }
      cursor = destinationEnd
    }
  }

  return links
}

function collectExternalLinks(documents) {
  const byUrl = new Map()
  for (const document of documents) {
    for (const link of extractExternalLinks(document.content)) {
      if (!byUrl.has(link.url)) byUrl.set(link.url, [])
      byUrl.get(link.url).push({ file: document.file, line: link.line })
    }
  }
  return [...byUrl.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([url, sources]) => ({ url, sources }))
}

function classifyResult(result) {
  const status = result && result.status
  if (status >= 200 && status < 300) return 'ok'
  if (status >= 300 && status < 400) return 'redirected'
  if (status === 404 || status === 410) return 'broken'
  if (status === 401 || status === 403) return 'blocked'
  if (status === 408 || status === 425 || status === 429 || status >= 500 || !status) return 'transient'
  return 'blocked'
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function checkUrl(url, options = {}) {
  const request = options.request || axios.get
  const retries = options.retries ?? 2
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await request(url, {
        timeout: options.timeout ?? 10000,
        maxRedirects: 8,
        validateStatus: () => true,
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
      })
      const classification = classifyResult(response)
      if (classification !== 'transient' || attempt === retries) {
        return { classification, status: response.status, finalUrl: response.request?.res?.responseUrl || url }
      }
    } catch (error) {
      if (attempt === retries) {
        return { classification: classifyResult(error), code: error.code, message: error.message }
      }
    }
    await delay(250 * (attempt + 1))
  }
  throw new Error('unreachable')
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length)
  let cursor = 0
  async function run() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await worker(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run))
  return results
}

function summarize(results) {
  return results.reduce((summary, result) => {
    summary[result.classification] = (summary[result.classification] || 0) + 1
    return summary
  }, {})
}

function evaluateBaseline(currentBrokenUrls, baselineUrls) {
  const current = new Set(currentBrokenUrls)
  const baseline = new Set(baselineUrls)
  return {
    newBroken: [...current].filter(url => !baseline.has(url)).sort(),
    resolved: [...baseline].filter(url => !current.has(url)).sort(),
  }
}

async function checkExternalLinks(options = {}) {
  const root = options.root || process.cwd()
  const files = (options.directories || DEFAULT_DIRECTORIES)
    .flatMap(directory => {
      const absolute = path.join(root, directory)
      return fs.existsSync(absolute) ? findMarkdownFiles(absolute) : []
    })
  const documents = files.map(file => ({
    file: path.relative(root, file),
    content: fs.readFileSync(file, 'utf8'),
  }))
  const links = collectExternalLinks(documents)
  console.log(`Found ${files.length} markdown files and ${links.length} unique external page links.`)

  const results = await mapWithConcurrency(links, options.concurrency || 8, async (link, index) => {
    const outcome = await checkUrl(link.url, options)
    console.log(`[${index + 1}/${links.length}] ${outcome.classification.toUpperCase()} ${link.url}`)
    return { ...link, ...outcome }
  })
  return { files, links, results, summary: summarize(results) }
}

async function main() {
  const reportPath = process.env.LINK_CHECK_REPORT || path.join('tmp', 'external-link-report.json')
  const baselinePath = process.env.LINK_CHECK_BASELINE || path.join('config', 'link-check-baseline.json')
  const report = await checkExternalLinks()
  const baseline = fs.existsSync(baselinePath) ? JSON.parse(fs.readFileSync(baselinePath, 'utf8')) : []
  const broken = report.results.filter(result => result.classification === 'broken')
  const baselineResult = evaluateBaseline(broken.map(result => result.url), baseline)
  report.baseline = baselineResult
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)

  console.log(`Summary: ${JSON.stringify(report.summary)}`)
  for (const result of broken) {
    const prefix = baseline.includes(result.url) ? 'KNOWN' : 'NEW'
    console.error(`${prefix} BROKEN ${result.status}: ${result.url}`)
    for (const source of result.sources) console.error(`  ${source.file}:${source.line}`)
  }
  for (const url of baselineResult.resolved) console.warn(`BASELINE CAN SHRINK: ${url}`)
  if (baselineResult.newBroken.length) process.exitCode = 1
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error during external link check:', error)
    process.exitCode = 1
  })
}

module.exports = {
  checkExternalLinks,
  checkUrl,
  classifyResult,
  collectExternalLinks,
  evaluateBaseline,
  extractExternalLinks,
  findMarkdownFiles,
  stripMarkdownTitle,
}
