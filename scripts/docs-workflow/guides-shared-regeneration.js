'use strict'

// Source-stage replay I/O. Checkpoint consumers only validate its bounded proof.
const fs = require('node:fs')
const path = require('node:path')
const yaml = require('js-yaml')
const {loadTypeScript} = require('../lib/load-typescript')
const {digest, git, gitInventory, regularBytes, snapshotPath} = require('../../packages/docs-tooling/src/lark/sharedPageFetch')
const {validateSharedReceipt} = require('../../packages/docs-tooling/src/lark/sharedPageRouting')
const {validateImageBaseUrl} = require('../../packages/docs-tooling/src/lark/sharedImageUploader')
const {runBuild} = loadTypeScript(path.resolve(__dirname, '../../packages/docs-tooling/src/shared-docs/commands/build.ts'))
const {collectReferences} = loadTypeScript(path.resolve(__dirname, '../../packages/docs-tooling/src/shared-docs/core/links/references.ts'))
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const outputKey = row => `${row.manual}:${row.path}`
const sorted = rows => [...rows].sort((a, b) => outputKey(a).localeCompare(outputKey(b)))
const projected = rows => sorted(rows).map(({manual, path, sha256}) => ({manual, path, sha256}))
const devRoots = ['content/en/guides', 'content/en/byoc', snapshotPath, 'generated/en/manifests/shared-pages/guides']
function mismatch(page, file, expected, actual, manual = null, message = 'Receipt regeneration differs') {
  const detail = [{page, manual, file, expected, actual, configuration: `shared-docs/guides/pages/${page}/page.yaml`}]
  return Object.assign(new Error(`[PUBLISH_REGEN_MISMATCH] ${page}: ${message}: ${file}; expected ${expected}; actual ${actual}`), {code: 'PUBLISH_REGEN_MISMATCH', detail})
}
function requireEqual(a, b, receipt, file, message) { if (!equal(a, b)) throw mismatch(receipt.page, file, digest(JSON.stringify(a)), digest(JSON.stringify(b)), null, message) }
function draftInputs(receipt) {
  const inputs = structuredClone(receipt.inputs)
  if (typeof inputs.fetch.navigation !== 'string') inputs.fetch.navigation = digest(JSON.stringify(inputs.fetch.navigation))
  return inputs
}
function rewriteImageDestinations(markdown, images, base) {
  validateImageBaseUrl(base)
  const objects = new Set(images.map(image => image.object)), edits = new Map()
  for (const reference of collectReferences(markdown).images) if (objects.has(reference.url)) edits.set(reference.start, {...reference, value: `${base}/${reference.url}`})
  for (const edit of [...edits.values()].sort((a, b) => b.start - a.start)) markdown = markdown.slice(0, edit.start) + edit.value + markdown.slice(edit.end)
  return markdown
}
function installedMd2md() {
  let root = path.dirname(require.resolve('@zilliz/mdtomd/blocks.js', {paths: [path.resolve(__dirname, '../../packages/docs-tooling')]}))
  while (!fs.existsSync(path.join(root, 'package.json'))) root = path.dirname(root)
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json')))
  if (pkg.name !== '@zilliz/mdtomd') throw Error('Unexpected md2md package identity')
  return pkg.version
}
// The root override isolates synthetic tooling fixtures; production uses this executing checkout.
function assertToolIdentity(tools, {root = path.resolve(__dirname, '../..')} = {}) {
  if (git(root, ['rev-parse', 'HEAD']).toString().trim() !== tools.zdoc || installedMd2md() !== tools.md2md) throw Error('Executing tooling identity does not match receipt')
  // Generated dev state is deliberately excluded; executable source/config may not drift.
  const roots = ['scripts', 'packages/docs-tooling/src/shared-docs', 'packages/docs-tooling/src/manuals',
    'packages/docs-ui/src/shared/utils/docHeadingTags.ts', 'packages/docs-tooling/package.json', 'package.json', 'pnpm-lock.yaml']
  const inventory = gitInventory(root, tools.zdoc, roots)
  for (const file of inventory) if (digest(regularBytes(root, file.path)) !== file.sha256) throw Error(`Executing tooling drift: ${file.path}`)
  for (const [file] of Object.entries(require.cache)) if (file.startsWith(`${root}/packages/docs-tooling/src/lark/`) && !file.includes('/meta/')) {
    const relative = path.relative(root, file)
    if (!git(root, ['show', `${tools.zdoc}:${relative}`]).equals(fs.readFileSync(file))) throw Error(`Executing tooling drift: ${relative}`)
  }
}
function verifyInventory(repository, commit, roots, expected, receipt) {
  const actual = gitInventory(repository, commit, roots).map(({path, sha256}) => ({path, sha256}))
  const map = new Map(actual.map(row => [row.path, row.sha256]))
  for (const file of expected) if (map.get(file.path) !== file.sha256) throw mismatch(receipt.page, file.path, file.sha256, map.get(file.path) || null, null, 'Pinned Git input differs')
  const ordered = files => [...files].sort((a, b) => a.path.localeCompare(b.path))
  requireEqual(ordered(actual), ordered(expected), receipt, roots.join(','), 'Pinned input inventory is incomplete')
}
function hydrate(repository, commit, inventory, destination, receipt) {
  fs.mkdirSync(destination, {recursive: true})
  for (const file of inventory) {
    const bytes = git(repository, ['show', `${commit}:${file.path}`])
    if (digest(bytes) !== file.sha256) throw mismatch(receipt.page, file.path, file.sha256, digest(bytes))
    const target = path.join(destination, file.path)
    fs.mkdirSync(path.dirname(target), {recursive: true}); fs.writeFileSync(target, bytes, {flag: 'wx'})
  }
}
function compareOutputs(receipt, candidate, rebuilt) {
  const expected = new Map(receipt.outputs.map(row => [outputKey(row), row]))
  const before = new Map(candidate.map(row => [outputKey(row), row])), after = new Map(rebuilt.map(row => [outputKey(row), row]))
  const errors = []
  for (const key of new Set([...expected.keys(), ...before.keys(), ...after.keys()])) {
    const target = expected.get(key), first = before.get(key), second = after.get(key), row = target || first || second
    const actual = second ? digest(second.bytes) : null, firstHash = first ? digest(first.bytes) : null
    if (!target || !first || !second || actual !== target.sha256 || firstHash !== target.sha256 || !Buffer.from(first.bytes).equals(Buffer.from(second.bytes))) {
      errors.push({...mismatch(receipt.page, row.path, target?.sha256 || null, actual, row.manual).detail[0], candidate: firstHash})
    }
  }
  if (before.size !== candidate.length || after.size !== rebuilt.length) errors.push(mismatch(receipt.page, 'outputs', 'unique outputs', 'duplicates').detail[0])
  if (errors.length) throw Object.assign(new Error(`[PUBLISH_REGEN_MISMATCH] ${receipt.page}: ${errors.map(row => `${row.manual}:${row.file} expected=${row.expected} actual=${row.actual} candidate=${row.candidate}`).join('; ')}`), {code: 'PUBLISH_REGEN_MISMATCH', detail: errors})
}
function validateRegenerationEvidence(proof, receipt, outputs) {
  const expected = {schema_version: 1, page: receipt.page, inputs_sha256: digest(JSON.stringify(draftInputs(receipt))),
    channel: receipt.channel, tools: receipt.inputs.tools, outputs: projected(receipt.outputs)}
  if (!receipt.inputs.fetch.render_targets || !equal(proof, expected)) throw mismatch(receipt.page, 'regeneration.json', digest(JSON.stringify(expected)), proof ? digest(JSON.stringify(proof)) : null, null, 'Unbound replay evidence')
  if (outputs) compareOutputs(receipt, outputs, outputs)
  return proof
}
async function regenerateReceipt(options, dependencies = {}) {
  const {receipt, navigation, repositoryRoot, baselineRoot, repo, scratch, outputs, readAcceptedImage} = options
  let fresh
  try {
    validateSharedReceipt(receipt, {group: 'guides', page: receipt.page})
    if (!receipt.inputs.fetch.render_targets) throw Error('Legacy receipt is upgrade-comparison-only; no live replay proof')
    const inputs = receipt.inputs, base = validateImageBaseUrl(inputs.fetch.image_base_url)
    requireEqual(draftInputs(receipt).fetch.navigation, digest(JSON.stringify(navigation)), receipt, 'navigation', 'Navigation digest mismatch')
    await (dependencies.assertToolIdentity || assertToolIdentity)(inputs.tools)
    verifyInventory(repositoryRoot, inputs.zdoc.commit, ['shared-docs/guides'], inputs.zdoc.files, receipt)
    verifyInventory(baselineRoot, inputs.dev.commit, devRoots, inputs.dev.files, receipt)
    for (const version of ['current', 'next']) verifyInventory(repo, inputs.milvus_docs[version], ['site/en'],
      inputs.milvus_docs.files.filter(file => file[version]).map(file => ({path: file.path, sha256: file[version]})), receipt)
    fs.mkdirSync(scratch, {recursive: true}); fresh = fs.mkdtempSync(path.join(scratch, 'receipt-replay-'))
    const master = path.join(fresh, 'master'), dev = path.join(fresh, 'dev'), upstream = path.join(fresh, 'upstream')
    hydrate(repositoryRoot, inputs.zdoc.commit, inputs.zdoc.files, master, receipt)
    hydrate(baselineRoot, inputs.dev.commit, inputs.dev.files, dev, receipt)
    for (const manual of ['guides', 'byoc']) fs.mkdirSync(path.join(dev, 'content/en', manual), {recursive: true})
    // A local object-only clone supplies ancestry without reading a mutable checkout or branch head.
    git(fresh, ['clone', '--quiet', '--shared', '--no-checkout', '--', path.resolve(repo), upstream])
    const source = yaml.load(fs.readFileSync(path.join(master, 'shared-docs/guides/source.yaml'), 'utf8'))
    git(upstream, ['update-ref', `refs/heads/${source.track}`, inputs.milvus_docs.next])
    const configFile = `shared-docs/guides/pages/${receipt.page}/page.yaml`
    const config = yaml.load(fs.readFileSync(path.join(master, configFile), 'utf8'))
    const lock = yaml.load(fs.readFileSync(path.join(master, `shared-docs/guides/pages/${receipt.page}/lock.yaml`), 'utf8'))
    for (const version of ['current', 'next']) requireEqual(inputs.milvus_docs[version], lock[version], receipt, configFile, 'Lock identity differs')
    const targets = structuredClone(inputs.fetch.render_targets.targets)
    const row = navigation.navigationRecords.filter(row => row.source_kind === 'shared-page' && row.shared_page?.page === receipt.page)
    if (row.length !== 1) throw Error('Missing unique authenticated render record')
    const previous = inputs.dev.files.some(file => file.path === snapshotPath) ? JSON.parse(fs.readFileSync(path.join(dev, snapshotPath))).records.find(record => record.record_id === row[0].record_id) : null
    for (const target of targets) {
      if (!config.publish.some(item => item.manual === target.manual && item.path === target.path)) throw mismatch(receipt.page, configFile, 'configured target', JSON.stringify(target), target.manual)
      const root = `content/en/${target.manual === 'guides' ? 'guides' : 'byoc'}`
      const old = (previous?.output_paths || []).filter(file => file.startsWith(`${root}/`) && /\.mdx?$/.test(file))
      const existing = ['.md', '.mdx'].filter(ext => fs.existsSync(path.join(dev, root, target.path + ext)))
      const extension = old.length ? path.extname(old[0]) : existing[0] || '.mdx'
      requireEqual(target.extension, extension, receipt, configFile, 'Retained extension differs')
      requireEqual(target.navigation.sidebar_label, row[0].labels || row[0].title, receipt, configFile, 'Frozen label differs')
    }
    const accepted = new Map()
    for (const image of inputs.images) {
      const bytes = Buffer.from(await readAcceptedImage(image.source, image.sha256))
      if (digest(bytes) !== image.sha256) throw mismatch(receipt.page, image.object, image.sha256, digest(bytes))
      accepted.set(image.source, bytes)
    }
    const fetchContext = {page: receipt.page, targets, recordedImages: new Map(inputs.images.map(image => [image.source, image.sha256])),
      records: navigation.navigationRecords.map(row => ({record_id: row.record_id, slug: row.slug, placement_type: row.placement_type, publish_targets: row.targets, output_paths: {}}))}
    let built, log = ''
    const code = await runBuild({sharedDocs: path.join(master, 'shared-docs/guides'), repo: upstream, dev, out: path.join(fresh, 'built'), page: receipt.page},
      text => {log += text}, {repositoryRoot: master, fetchContext, fetcher: {async fetch(source) {if (!accepted.has(source)) throw Error(`Unrecorded image: ${source}`); return Uint8Array.from(accepted.get(source))}},
        readAcceptedImage: async source => {if (!accepted.has(source)) throw Error(`Missing accepted image: ${source}`); return Uint8Array.from(accepted.get(source))}, onBuilt: pages => {built = pages}})
    if (code || !built) throw Error(`Independent build failed: ${log}`)
    const replayImages = new Map()
    for (const output of built) for (const image of output.images) replayImages.set(image.original, {source: image.original, sha256: image.sha256, object: image.address})
    requireEqual([...replayImages.values()].sort((a, b) => a.source.localeCompare(b.source)), [...inputs.images].sort((a, b) => a.source.localeCompare(b.source)), receipt, 'images', 'Image manifest differs')
    const rebuilt = built.map(output => ({manual: output.manual, path: `content/en/${output.manual === 'guides' ? 'guides' : 'byoc'}/${output.path}${output.extension}`,
      bytes: Buffer.from(rewriteImageDestinations(output.mdx, inputs.images, base))}))
    compareOutputs(receipt, outputs, rebuilt)
    return validateRegenerationEvidence({schema_version: 1, page: receipt.page, inputs_sha256: digest(JSON.stringify(draftInputs(receipt))),
      channel: receipt.channel, tools: structuredClone(inputs.tools), outputs: projected(receipt.outputs)}, receipt, rebuilt)
  } catch (error) {
    if (error.code === 'PUBLISH_REGEN_MISMATCH') throw error
    throw mismatch(receipt.page, `shared-docs/guides/pages/${receipt.page}/page.yaml`, 'verified receipt replay', error.message)
  } finally { if (fresh) fs.rmSync(fresh, {recursive: true, force: true}) }
}
module.exports = {regenerateReceipt, validateRegenerationEvidence, rewriteImageDestinations, assertToolIdentity}
