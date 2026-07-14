const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const larkDocScraper = require('../plugins/lark-docs/larkDocScraper')
const {
  createSourceSnapshot,
  outputPathsByTokenFromDirs,
  writeSnapshot,
} = require('../plugins/lark-docs/sourceSnapshot')
const { outputDirsForTargets } = require('./docs-workflow/lark-snapshot-output-paths')

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i]
    if (!item.startsWith('--')) continue
    const key = item.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase())
    const next = argv[i + 1]
    args[key] = next && !next.startsWith('--') ? argv[++i] : true
  }
  return args
}

function loadLarkDocsConfig(configPath) {
  let source = fs.readFileSync(configPath, 'utf8')
  source = source
    .replace(/^[\s\S]*?\/\/ guides/m, '// guides')
    .replace(/const\s+(\w+)\s*:\s*Manual\s*=/g, 'const $1 =')
    .replace(/const\s+(\w+)\s*:\s*Targets\s*=/g, 'const $1 =')
    .replace(/export\s+default\s+/, 'module.exports = ')
  const sandbox = { module: { exports: {} }, exports: {} }
  vm.runInNewContext(source, sandbox, { filename: configPath })
  return sandbox.module.exports
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.manual) {
    throw new Error('--manual is required')
  }

  const configPath = path.resolve(args.config || 'config/lark-docs.config.ts')
  const manuals = loadLarkDocsConfig(configPath)
  const manual = manuals[args.manual]
  if (!manual) {
    throw new Error(`Unknown manual "${args.manual}". Available manuals: ${Object.keys(manuals).join(', ')}`)
  }

  const buildEnv = args.buildEnv || process.env.DOCS_BUILD_ENV || 'local'
  const targetsBuilt = args.targetsBuilt ? args.targetsBuilt.split(',').map(item => item.trim()).filter(Boolean) : []
  const snapshotPath = args.snapshotPath ||
    path.join('plugins', 'lark-docs', 'meta', 'snapshots', `${args.manual}-${buildEnv}-last-success.json`)
  const scraper = new larkDocScraper(manual.root, manual.base, manual.sourceType, manual.docSourceDir)
  await scraper.__base({ progressLabel: '[snapshot] Base scan' })
  const nodeMetadataByToken = manual.sourceType === 'wiki'
    ? await scraper.fetch_wiki_node_metadata(scraper.records, { progressLabel: '[snapshot] Wiki metadata' })
    : new Map()
  const outputPathsByToken = outputPathsByTokenFromDirs({
    outputDirs: outputDirsForTargets(manual, targetsBuilt),
  })

  const snapshot = createSourceSnapshot({
    manualName: args.manual,
    targetsBuilt,
    buildEnv,
    sourceBranch: args.sourceBranch || process.env.GITHUB_REF_NAME || process.env.REPO_BRANCH || null,
    publishUrl: args.publishUrl || process.env.DOCS_PUBLISH_URL || null,
    linkCheckRemote: args.linkCheckRemote || process.env.LINK_CHECKS_REMOTE_BASE_URL || 'https://docs.zilliz.com',
    docSourceDir: manual.docSourceDir,
    baseAppToken: scraper.base_app_token,
    records: scraper.records,
    nodeMetadataByToken,
    outputPathsByToken,
  })

  writeSnapshot(snapshotPath, snapshot)
  console.log(`[snapshot] Wrote ${snapshotPath}`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
