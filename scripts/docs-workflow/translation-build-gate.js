'use strict'

// Source-side build gate for the armed translation dispatcher. Translating a
// broken English source ships broken output to every locale while the site
// stays red downstream, so before dispatching, the dispatcher builds the
// current dev tree (build:en covers the en content every locale translates
// plus the existing ja-JP files) and attributes failures to the dispatch
// set. Only SOURCE-side attribution blocks: translated files are never
// hand-edited, so dispatching is itself the repair path for a broken target
// file — blocking on target-side breakage would deadlock the fix. Render
// failures do not cite source paths directly (only route pathnames), so
// routes are matched back to candidate files by their slug segment; an
// ambiguous or path-less failure is treated as unattributed and the cycle
// takes the safe skip instead of dispatching on a red build.

const path = require('node:path')

// build:en renders the en site with the ja-JP locale mounted under docusaurus
// i18n: en pages serve at their bare pathnames while ja-JP pages are prefixed
// (createDocusaurusConfig gives non-default locales a /ja-JP/ base URL). A
// failing pathname therefore splits by prefix: bare routes implicate the
// English SOURCE (blocking evidence), prefixed routes implicate the ja
// TRANSLATION (repair evidence — dispatching regenerates it).
const TARGET_ROUTE_PREFIXES = ['/ja-JP/']

// Path-like tokens as they appear in Docusaurus compile errors — either
// repo-relative ("content/en/foo.md:12:5") or absolutized by the runner
// ("/home/runner/work/zdoc/zdoc/i18n/ja-JP/foo.md:88:9") — so extraction
// matches the token first and then trims back to the repository root.
const FILE_TOKEN_PATTERN = /[^\s"'`():,]+\.(?:md|mdx|json)(?::\d+:\d+)?\b/g
const REPO_ROOT_SEGMENTS = ['content/', 'generated/', 'i18n/']
const ROUTE_PATTERN = /Can't render static file for pathname "([^"]+)"/g

function normalizeRepoPath(token) {
  for (const segment of REPO_ROOT_SEGMENTS) {
    const index = token.indexOf(segment)
    if (index !== -1) return token.slice(index).replace(/:\d+:\d+$/, '')
  }
  return null
}

// Evidence lines must carry error context: a bare substring scan would let
// WARNING output count as failure evidence (Docusaurus runs with
// onBrokenLinks 'warn', and link warnings cite repo paths — fake attribution
// blocking a healthy group, or a red build passing as attributed). The
// positive match also keeps error lines that merely cite a warn-NAMED path
// ('Error: MDX compile failed for .../warn.md'), which a warning-substring
// exclusion would wrongly drop; warning-prefixed lines are excluded even
// when they mention errors. Lines without error context (plain continuations,
// info output) are not evidence — their paths drop out and an unexplained
// failure fails the cycle closed, never blind-dispatches.
const FAILURE_LINE_PATTERN = /error|fail(?:ed|ure)?|can(?:'?t|not)|##\[error\]/i
const WARNING_LINE_PREFIX = /^\s*(?:\[[^\]]*warn[^\]]*\]|warn(?:ing)?\b|##\[warning\])/i

// Extract the failure identity from a captured build log. Both shapes come
// from real incidents: MDX compile errors cite file paths (with :line:col
// position markers and sometimes an absolute runner prefix) and SSG render
// errors cite route pathnames ('Can't render static file for pathname
// "/reference/node/node/X"' with a ReferenceError cause, as in the 2026-10
// node Authentication-alterRole fetch failure).
function parseBuildFailures({logText}) {
  if (typeof logText !== 'string') throw new Error('A build log text is required')
  const failureText = logText.split('\n')
    .filter(line => FAILURE_LINE_PATTERN.test(line) && !WARNING_LINE_PREFIX.test(line))
    .join('\n')
  const filePaths = new Set()
  for (const match of failureText.matchAll(FILE_TOKEN_PATTERN)) {
    const normalized = normalizeRepoPath(match[0])
    if (normalized) filePaths.add(normalized)
  }
  const failingRoutes = []
  for (const match of failureText.matchAll(ROUTE_PATTERN)) failingRoutes.push(match[1])
  return {filePaths: [...filePaths].sort(), failingRoutes}
}

function basenameKey(value) {
  return path.basename(value).toLowerCase()
}

function stripExtension(value) {
  return basenameKey(value).replace(/\.(md|mdx|json)$/u, '')
}

function isTargetRoute(route) {
  return TARGET_ROUTE_PREFIXES.some(prefix => route.startsWith(prefix))
}

// Match dispatch-set files against build failures. Exact path hits are
// authoritative; route hits fall back to the slug segment (the doc id), which
// is the file basename minus extension — source files for bare routes, target
// files for locale-prefixed routes. A route whose slug matches multiple
// distinct files cannot be attributed and stays unexplained instead (the
// caller treats unexplained source-route evidence fail-closed).
function attributeBuildFailures({failures, files}) {
  if (!failures || typeof failures !== 'object') throw new Error('Parsed build failures are required')
  if (!Array.isArray(files)) throw new Error('A dispatch file list is required')
  const sourcePaths = new Set()
  const targetPaths = new Set()
  const filesBySourceSlug = new Map()
  const filesByTargetSlug = new Map()
  for (const file of files) {
    if (typeof file.sourcePath !== 'string' || typeof file.targetPath !== 'string') throw new Error('Dispatch files need sourcePath and targetPath')
    sourcePaths.add(file.sourcePath)
    targetPaths.add(file.targetPath)
    for (const [slug, index] of [[stripExtension(file.sourcePath), filesBySourceSlug], [stripExtension(file.targetPath), filesByTargetSlug]]) {
      if (!index.has(slug)) index.set(slug, [])
      index.get(slug).push(file)
    }
  }
  const sourceHits = []
  const targetHits = []
  const attributedRoutes = []
  for (const filePath of failures.filePaths) {
    if (sourcePaths.has(filePath)) sourceHits.push(filePath)
    if (targetPaths.has(filePath)) targetHits.push(filePath)
  }
  for (const route of failures.failingRoutes) {
    const index = isTargetRoute(route) ? filesByTargetSlug : filesBySourceSlug
    const candidates = index.get(stripExtension(route)) || []
    const distinctPaths = new Set(candidates.map(file => isTargetRoute(route) ? file.targetPath : file.sourcePath))
    if (distinctPaths.size !== 1) continue
    const hit = `${route} -> ${[...distinctPaths][0]}`
    attributedRoutes.push(route)
    if (isTargetRoute(route)) targetHits.push(hit)
    else sourceHits.push(hit)
  }
  return {sourceHits: [...new Set(sourceHits)].sort(), targetHits: [...new Set(targetHits)].sort(), attributedRoutes}
}

module.exports = {parseBuildFailures, attributeBuildFailures}

if (require.main === module) {
  const fs = require('node:fs')
  const args = new Map()
  for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], args[i + 1])
  const logText = args.get('--log') ? fs.readFileSync(args.get('--log'), 'utf8') : fs.readFileSync(0, 'utf8')
  const files = JSON.parse(fs.readFileSync(args.get('--files'), 'utf8'))
  const failures = parseBuildFailures({logText})
  console.log(JSON.stringify({failures, attribution: attributeBuildFailures({failures, files})}, null, 2))
}
