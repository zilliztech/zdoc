'use strict'
// PR-only validation fixture. Never a Base observation or publication input.
const fs = require('node:fs')
const path = require('node:path')
const {execFileSync} = require('node:child_process')
const {createHash} = require('node:crypto')
const tooling = path.resolve(__dirname, '../../../../..')
const {loadTypeScript} = require(path.join(tooling, 'scripts/lib/load-typescript'))
const {parsePageConfig} = loadTypeScript(path.join(__dirname, '../core/config'))
const {parseLock} = loadTypeScript(path.join(__dirname, '../core/lock'))
const {DOC_HEADING_TAGS} = loadTypeScript(path.join(tooling, 'packages/docs-ui/src/shared/utils/docHeadingTags'))
const snapshotPath = 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'
const git = (root, ...args) => execFileSync('git', ['-C', root, ...args], {encoding: 'utf8'}).trim()
const inside = (a, b) => { const r = path.relative(a, b); return r === '' || (!r.startsWith('..' + path.sep) && r !== '..' && !path.isAbsolute(r)) }
function prepareInitialValidation({repository, dev, base, head, devSha, out}) {
  for (const sha of [base, head, devSha]) if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('Exact Git identities required')
  repository = fs.realpathSync(repository); dev = fs.realpathSync(dev); out = path.resolve(out)
  if (git(repository, 'rev-parse', 'HEAD') !== head || git(dev, 'rev-parse', 'HEAD') !== devSha) throw new Error('Checkout identity changed')
  if (inside(dev, out) || inside(out, dev) || fs.existsSync(out)) throw new Error('Fixture output must be absent and separate from dev')
  const names = execFileSync('git', ['-C', repository, 'diff', '--name-only', '-z', '--diff-filter=A', base, head, '--', 'shared-docs/guides/pages/'], {encoding: 'utf8'}).split('\0').filter(Boolean)
  const snapshot = JSON.parse(fs.readFileSync(path.join(dev, snapshotPath), 'utf8'))
  if (!Array.isArray(snapshot.records)) throw new Error('Invalid dev snapshot')
  const initial = []
  for (const file of names) {
    const match = /^shared-docs\/guides\/pages\/([a-z0-9]+(?:-[a-z0-9]+)*)\/page\.yaml$/.exec(file)
    if (!match) continue
    const page = match[1], text = git(repository, 'show', `${head}:${file}`)
    const parsed = parsePageConfig(page, text, {manuals: ['guides', 'guides-byoc'], betaValues: DOC_HEADING_TAGS.filter(tag => tag !== 'BYOC')})
    if ('errors' in parsed) throw new Error(JSON.stringify(parsed.errors))
    const targets = parsed.config.publish.map(target => ({...target, root: `content/en/${target.manual === 'guides' ? 'guides' : 'byoc'}`}))
    const exists = targets.map(target => ['.md', '.mdx'].some(ext => fs.existsSync(path.join(dev, target.root, target.path + ext))))
    if (exists.every(Boolean)) continue // Ordinary generation validates real existing metadata.
    if (exists.some(Boolean) || snapshot.records.some(record => record.slug === page)) throw new Error(`Cannot fixture an existing or partially present page: ${page}`)
    const lock = parseLock(git(repository, 'show', `${head}:${path.posix.dirname(file)}/lock.yaml`))
    if ('errors' in lock || lock.lock.current !== lock.lock.next) throw new Error(`Initial page requires equal bot-pinned versions: ${page}`)
    initial.push({page, targets, source: parsed.config.source.file, pin: lock.lock.current})
  }
  if (!initial.length) return {dev, fixture: false, initialPages: []}
  fs.mkdirSync(out, {recursive: true})
  for (const manual of ['guides', 'byoc']) fs.cpSync(path.join(dev, 'content/en', manual), path.join(out, 'content/en', manual), {recursive: true})
  for (const item of initial) {
    for (const target of item.targets) {
      const file = path.join(out, target.root, target.path + '.mdx'); fs.mkdirSync(path.dirname(file), {recursive: true})
      fs.writeFileSync(file, `---\nslug: /${item.page}\nsidebar_label: ${JSON.stringify(item.page)}\nsidebar_position: 0\n---\n`)
    }
    snapshot.records.push({record_id: `validation-only-${item.page}`, slug: item.page, placement_type: 'canonical', release_channel: 'NEXT',
      publish_targets: item.targets.map(t => t.manual === 'guides' ? 'Zilliz.SaaS' : 'Zilliz.PaaS'),
      output_paths: item.targets.map(t => `${t.root}/${t.path}.mdx`)})
  }
  fs.mkdirSync(path.dirname(path.join(out, snapshotPath)), {recursive: true})
  fs.writeFileSync(path.join(out, snapshotPath), JSON.stringify(snapshot) + '\n')
  const manifest = {kind: 'shared-docs-initial-validation-fixture', publication: false, base, head, devSha, initialPages: initial,
    retainedSnapshotSha256: createHash('sha256').update(fs.readFileSync(path.join(dev, snapshotPath))).digest('hex')}
  fs.writeFileSync(path.join(out, 'initial-validation.json'), JSON.stringify(manifest, null, 2) + '\n')
  return {dev: out, fixture: true, initialPages: initial.map(item => item.page)}
}
if (require.main === module) {
  const result = prepareInitialValidation({repository: process.cwd(), dev: process.env.DEV_SNAPSHOT, base: process.env.BASE_SHA, head: process.env.SOURCE_SHA, devSha: process.env.DEV_SHA, out: process.env.VALIDATION_FIXTURE})
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `dev=${result.dev}\n`)
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Initial-page generation validation: ${JSON.stringify(result)}. Temporary metadata is not Base/activation evidence.\n`)
}
module.exports = {prepareInitialValidation}
