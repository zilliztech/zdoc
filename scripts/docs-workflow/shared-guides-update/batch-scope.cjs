'use strict'

const {resolve} = require('node:path')
const {Console} = require('node:console')
const {loadTypeScript} = require('../../lib/load-typescript.js')
const base = resolve(__dirname, '../../../packages/docs-tooling/src/shared-docs')
const argsError = 'Usage: node batch-scope.cjs --zdoc-repo DIR --source-repo DIR --master SHA --dev SHA --source SHA --pulls NUMBER[,NUMBER...] [--verify-page ID | --verify-pages ID,ID,...]'

function parseArgs(argv) {
  const names = ['--zdoc-repo', '--source-repo', '--master', '--dev', '--source', '--pulls']
  const options = new Map()
  for (let i = 0; i < argv.length; i += 2) {
    const name = argv[i], value = argv[i + 1]
    if (!(names.includes(name) || name === '--verify-page' || name === '--verify-pages') || options.has(name) || !value || value.startsWith('-') || /[\0\r\n]/.test(value)) throw Error(argsError)
    options.set(name, value)
  }
  if (!names.every(name => options.has(name))) throw Error(argsError)
  const verifyPage = options.get('--verify-page')
  const verifyPages = options.get('--verify-pages')?.split(',')
  const pageId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (verifyPage !== undefined && (!pageId.test(verifyPage) || verifyPages !== undefined)) throw Error(argsError)
  if (verifyPages && (verifyPages.length < 2 || !verifyPages.every(id => pageId.test(id)) ||
    new Set(verifyPages).size !== verifyPages.length)) throw Error(argsError)
  const pins = Object.fromEntries(['master', 'dev', 'source'].map(key => [key, options.get('--' + key)]))
  if (!Object.values(pins).every(sha => /^[a-f0-9]{40}$/.test(sha))) throw Error(argsError)
  const pulls = options.get('--pulls').split(',').map(value => {
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw Error(argsError)
    return Number(value)
  })
  if (new Set(pulls).size !== pulls.length) throw Error(argsError)
  return {pins, verifyPage, verifyPages, pulls: pulls.sort((a, b) => a - b),
    zdocRepository: resolve(options.get('--zdoc-repo')), sourceRepository: resolve(options.get('--source-repo'))}
}

async function collect(options) {
  const {batchBudget} = loadTypeScript(resolve(base, 'adapters/updates/batch-source.ts'))
  const {createBatchGitHub} = loadTypeScript(resolve(base, 'adapters/updates/batch-github.ts'))
  const {collectBatchScopeEvidence} = loadTypeScript(resolve(base, 'adapters/updates/batch-scope-evidence.ts'))
  const {observeBatchScopeSourceReads} = loadTypeScript(resolve(base, 'adapters/updates/batch-scope-source-reads.ts'))

  const github = createBatchGitHub(batchBudget())
  const pulls = []
  try {
    for (const number of options.pulls) pulls.push(await github.mergedSeed(number))
  } finally { github.close() }
  const {pins, zdocRepository, sourceRepository} = options
  const facts = await collectBatchScopeEvidence({pins, zdocRepository, sourceRepository})
  const history = new Map(facts.history.map(row => [row.oid, row]))
  const seeds = pulls.map(pr => {
    const merge = history.get(pr.mergeCommit)
    if (!merge?.parents[0]) throw Error('PR_INTRODUCTION_NOT_IN_TARGET_HISTORY')
    return {number: pr.number, head: pr.head, mergeCommit: pr.mergeCommit, firstParent: merge.parents[0], commitCount: pr.commits}
  })
  const screening = await observeBatchScopeSourceReads({zdocRepository, sourceRepository, input: {...facts, seeds}})
  let {report} = screening
  const selectedPageIds = report.pages.filter(page => page.sourceObligations === 'hit').map(page => page.pageId)
  const {collectBatchPublishedDependencies} = loadTypeScript(resolve(base, 'adapters/updates/batch-scope-published-dependencies.ts'))
  const publishedDependencies = await collectBatchPublishedDependencies({zdocRepository, pins, pages: facts.pages, selectedPageIds})
  const verify = options.verifyPages ?? (options.verifyPage ? [options.verifyPage] : [])
  const pages = verify.map(id => {
    const page = facts.pages.find(row => row.pageId === id)
    if (!page) throw Error('SCOPE_PAGE_NOT_REGISTERED')
    return page
  })
  const memberships = []
  if (pages.length) {
    const {inspectBatchScopePage, applyPageMembershipWitness} = loadTypeScript(resolve(base, 'adapters/updates/batch-scope-membership.ts'))
    for (const page of pages) {
      const witness = await inspectBatchScopePage({pins, zdocRepository, sourceRepository, pageId: page.pageId, verifyHistory: true})
      const decision = await applyPageMembershipWitness(report, page, facts.publications, witness)
      report = decision.report
      memberships.push({decision: decision.membership, witness})
    }
  }
  return {...report, sourceReads: screening.sourceReads, publishedDependencies,
    ...(options.verifyPage ? {membership: memberships[0]} : options.verifyPages ? {memberships} : {}),
    pullEvidence: pulls, masterTree: facts.masterTree, devTree: facts.devTree,
    publications: facts.publications, publicationReasons: facts.publicationReasons}
}

if (require.main === module) {
  let options
  try { options = parseArgs(process.argv.slice(2)) } catch {
    process.stderr.write(argsError + '\n')
    process.exitCode = 2
  }
  if (options?.verifyPage || options?.verifyPages) global.console = new Console(process.stderr, process.stderr)
  if (options) collect(options).then(report => {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n')
  }).catch(error => {
    const reason = /^[A-Z][A-Z0-9_]+$/.test(error.message) ? error.message : 'SCOPE_COLLECTION_FAILED'
    process.stderr.write(reason + '\n')
    process.exitCode = 1
  })
}

module.exports = {parseArgs}
