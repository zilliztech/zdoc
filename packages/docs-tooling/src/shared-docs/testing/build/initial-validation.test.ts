// @vitest-environment node
import {createRequire} from 'node:module'
import {execFileSync} from 'node:child_process'
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, realpathSync, rmSync, unlinkSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join, dirname} from 'node:path'
import {afterEach, expect, it} from 'vitest'
import {normalizeGuidesSnapshot} from '../../adapters/guides-snapshot'
const {prepareInitialValidation} = createRequire(import.meta.url)('../../adapters/initial-validation.cjs')
const roots: string[] = []
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, {recursive: true, force: true}) })
const git = (root: string, ...args: string[]) => execFileSync('git', ['-C', root, ...args], {encoding: 'utf8'}).trim()
const put = (root: string, file: string, text: string) => {mkdirSync(dirname(join(root, file)), {recursive: true}); writeFileSync(join(root, file), text)}
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'initial-validation-')); roots.push(root)
  const repository = join(root, 'config'), dev = join(root, 'dev'), out = join(root, 'fixture')
  for (const dir of [repository, dev]) {mkdirSync(dir); git(dir, 'init', '-q'); git(dir, 'config', 'user.name', 'Fixture'); git(dir, 'config', 'user.email', 'fixture@example.test')}
  put(repository, 'readme', 'base'); git(repository, 'add', '.'); git(repository, 'commit', '-qm', 'base'); const base = git(repository, 'rev-parse', 'HEAD')
  put(repository, 'shared-docs/guides/pages/new-page/page.yaml', 'schema_version: 1\nsource:\n  file: site/en/example.md\npublish:\n  - manual: guides\n    path: tutorials/new-page\n  - manual: guides-byoc\n    path: tutorials/new-page\n')
  put(repository, 'shared-docs/guides/pages/new-page/lock.yaml', `schema_version: 1\ncurrent: ${'a'.repeat(40)}\nnext: ${'a'.repeat(40)}\n`)
  const commit = () => {git(repository, 'add', '.'); git(repository, 'commit', '-qm', 'config'); return git(repository, 'rev-parse', 'HEAD')}
  const head = commit()
  for (const manual of ['guides', 'byoc']) put(dev, `content/en/${manual}/existing.md`, '---\nslug: /existing\n---\nExisting bytes.\n')
  put(dev, 'content/en/reference/node/Client.mdx', 'Unchanged SDK bytes.');
  put(dev, 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json', JSON.stringify({records: [{record_id: 'recExisting', slug: 'existing', placement_type: 'canonical'}]}))
  git(dev, 'add', '.'); git(dev, 'commit', '-qm', 'dev'); const devSha = git(dev, 'rev-parse', 'HEAD')
  return {repository, dev, out, base, head, devSha, commit}
}
it('validates genuinely new paired pages in an explicitly labeled disposable fixture, preserving dev bytes', () => {
  const f = fixture(), before = git(f.dev, 'status', '--porcelain'), result = prepareInitialValidation(f)
  expect(result).toMatchObject({fixture: true, initialPages: ['new-page']})
  expect(git(f.dev, 'status', '--porcelain')).toBe(before)
  expect(existsSync(join(f.dev, 'content/en/guides/tutorials/new-page.mdx'))).toBe(false)
  expect(readFileSync(join(f.out, 'content/en/guides/existing.md'), 'utf8')).toContain('Existing bytes.')
  expect(readFileSync(join(f.out, 'content/en/reference/node/Client.mdx'), 'utf8')).toBe('Unchanged SDK bytes.')
  const records = normalizeGuidesSnapshot(readFileSync(join(f.out, 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'), 'utf8'))
  expect(records.find(r => r.slug === 'new-page')).toMatchObject({release_channel: 'NEXT', output_paths: {guides: 'tutorials/new-page.mdx', 'guides-byoc': 'tutorials/new-page.mdx'}})
  expect(JSON.parse(readFileSync(join(f.out, 'initial-validation.json'), 'utf8'))).toMatchObject({publication: false, head: f.head, devSha: f.devSha})
})
it('does not invent metadata for an existing configuration or write a fixture when none is needed', () => {
  const f = fixture(); expect(prepareInitialValidation({...f, base: f.head})).toMatchObject({fixture: false, dev: realpathSync(f.dev)})
  expect(existsSync(f.out)).toBe(false)
})
it('refuses partial outputs, existing snapshot identities, unequal initial locks and moved checkouts', () => {
  const partial = fixture(); put(partial.dev, 'content/en/guides/tutorials/new-page.md', 'Existing'); expect(() => prepareInitialValidation(partial)).toThrow(/existing or partially/)
  const registered = fixture(); put(registered.dev, 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json', JSON.stringify({records: [{slug: 'new-page'}]})); expect(() => prepareInitialValidation(registered)).toThrow(/existing or partially/)
  const unequal = fixture(); put(unequal.repository, 'shared-docs/guides/pages/new-page/lock.yaml', `schema_version: 1\ncurrent: ${'a'.repeat(40)}\nnext: ${'b'.repeat(40)}\n`); unequal.head = unequal.commit(); expect(() => prepareInitialValidation(unequal)).toThrow(/equal bot-pinned/)
  const moved = fixture(); expect(() => prepareInitialValidation({...moved, head: 'f'.repeat(40)})).toThrow(/identity changed/)
})

it('does not require a Guides snapshot for PRs without newly added Guides configurations', () => {
  const f = fixture(); unlinkSync(join(f.dev, 'packages/docs-tooling/src/lark/meta/snapshots/guides-uat-last-success.json'));
  git(f.dev, 'add', '-u'); git(f.dev, 'commit', '-qm', 'non-guides snapshot');
  expect(prepareInitialValidation({...f, base: f.head, devSha: git(f.dev, 'rev-parse', 'HEAD')})).toMatchObject({fixture: false});
  expect(existsSync(f.out)).toBe(false);
});
