// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createZdocContentReader } from '../../adapters/zdoc-content'
import { GitLinkInputReader, isMilvusPagePath, milvusPageMetadata, prepareLinkInputs, readMilvusPages } from '../../adapters/links-input'
import { FakeImageFetcher } from '../../adapters/images'
import { runLinksSeed } from '../../commands/links-seed'
import { createRepository, createSeedDemo, git, runSeedDemo } from './demo'

const roots: string[] = []
async function temp() { const path = await mkdtemp(join(tmpdir(), 'links-seed-test-')); roots.push(path); return path }
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))) })
const markdown = (id: string, title: string) => `---\nid: ${id}\ntitle: ${title}\n---\n# ${title}\n`

describe('committed Milvus bulk input', () => {
  it('reads once in bulk at the selected commit and matches WP5 ID lookup', async () => {
    const root = await temp(), repo = join(root, 'repo')
    const commit = await createRepository(repo, {
      'site/en/reference/schema.md': markdown('schema.md', 'Reference é'),
      'site/en/userGuide/schema/schema.md': markdown('schema.md', 'Guide'),
      'site/en/userGuide/other.md': markdown('public.md', 'Other'),
      'site/en/userGuide/deprecated.md': '---\nid: deprecated.md\ndeprecate: true\n---\n',
      'site/en/userGuide/no-meta.md': '[still a body link](public.md)',
      'site/en/fragments/ignored.md': markdown('ignored.md', 'Fragment'),
    })
    await writeFile(join(repo, 'site/en/reference/schema.md'), 'dirty working tree')
    const reader = new GitLinkInputReader(repo)
    const single = vi.spyOn(reader, 'readFile')
    const batch = vi.spyOn(reader, 'readFiles')
    const pages = await readMilvusPages(commit, reader)
    expect(single).not.toHaveBeenCalled()
    expect(batch).toHaveBeenCalledTimes(1)
    expect(pages.map(page => page.id)).toEqual(['schema.md', '', '', 'public.md', 'schema.md'])
    const prepared = await prepareLinkInputs('[s](schema.md) [p](public.md) [d](deprecated.md)', 'site/en/userGuide/other.md',
      commit, reader, new FakeImageFetcher(new Map()))
    expect(prepared.targets.get('schema.md')).toBe(pages[0].markdown)
    expect(prepared.targets.get('public.md')).toContain('title: Other')
    expect(prepared.targets.get('deprecated.md')).toBeNull()
    expect(await reader.readFiles(commit, [])).toEqual(new Map())
    for (const path of ['../bad', 'site/en/missing.md', 'site/en/reference']) {
      await expect(reader.readFiles(commit, [path])).rejects.toThrow()
    }
    await expect(reader.readFiles('HEAD', [])).rejects.toThrow()
    await expect(reader.readFiles('0'.repeat(40), [])).rejects.toThrow()
    expect(git(repo, 'rev-parse', 'HEAD')).toBe(commit)
    expect(await readFile(join(repo, 'site/en/reference/schema.md'), 'utf8')).toBe('dirty working tree')
  })
  it('shares exclusions and invalid metadata behavior without widening WP5', () => {
    for (const path of ['site/en/fragments/x.md', 'site/en/README.md', 'site/en/home/x.md', 'site/zh/x.md']) expect(isMilvusPagePath(path)).toBe(false)
    for (const value of ['no metadata', '---\nid: [bad\n---', '---\nid: ../x.md\n---', '---\nid: x.md\ndeprecate: yes\n---']) {
      expect(milvusPageMetadata('site/en/x.md', value)).toBeUndefined()
    }
  })
  it('rejects committed symlinks instead of reading through them', async () => {
    const root = await temp(), repo = join(root, 'repo')
    await createRepository(repo, { 'site/en/x.md': markdown('x.md', 'X') })
    await symlink('x.md', join(repo, 'site/en/link.md'))
    git(repo, 'add', '.')
    git(repo, '-c', 'user.name=Test', '-c', 'user.email=test@example.test', '-c', 'commit.gpgsign=false', 'commit', '-m', 'Add symlink')
    await expect(new GitLinkInputReader(repo).readFiles(git(repo, 'rev-parse', 'HEAD'), ['site/en/link.md'])).rejects.toThrow('Regular file')
  })
})

describe('manual reader and CLI', () => {
  it('reads only one sparse manual and exposes raw front matter independently', async () => {
    const options = await createSeedDemo(await temp())
    const reader = createZdocContentReader({ checkout: options.dev, manualDirectory: 'content/en/guides/' })
    expect(await reader.getCommit()).toBe(options.devCommit)
    const pages = await reader.listPages()
    expect(pages).toContainEqual({ path: 'title.mdx', slug: 'cloud-title', title: 'Matching Title' })
    expect(await reader.readInternalLinks('source.md')).toEqual([{ text: 'By inference', target: './cloud-inferred' }])
    const meta = await reader.readFrontMatter('title.mdx')
    expect(meta).toMatchObject({ title: 'Matching Title | Cloud', beta: false })
    ;(meta as Record<string, unknown>).title = 'mutated caller copy'
    expect((await reader.readFrontMatter('title.mdx')).title).toBe('Matching Title | Cloud')
    await writeFile(join(options.dev, 'unrelated.txt'), 'unrelated')
    expect(await reader.getCommit()).toBe(options.devCommit)
    await writeFile(join(options.dev, 'content/en/guides/source.md'), 'changed')
    await expect(reader.getCommit()).rejects.toThrow('uncommitted')
    await expect(reader.readFrontMatter('../outside.md')).rejects.toThrow()
  })
  it('handles a second manual without a Guides dependency and strips BYOC suffixes', async () => {
    const root = await temp(), repo = join(root, 'repo')
    await createRepository(repo, { 'manual/nested/page.mdx': '---\nslug: /page\ntitle: Page | BYOC\n---\n[**Body**](./other#heading) [external](https://example.test)\n' })
    const reader = createZdocContentReader({ checkout: repo, manualDirectory: 'manual' })
    expect(await reader.listPages()).toEqual([{ path: 'nested/page.mdx', slug: 'page', title: 'Page' }])
    expect(await reader.readInternalLinks('nested/page.mdx')).toEqual([{ text: 'Body', target: './other#heading' }])
  })
  it('rejects duplicate slugs, malformed metadata, and symlinked pages', async () => {
    const options = await createSeedDemo(await temp())
    const directory = join(options.dev, 'content/en/guides')
    await writeFile(join(directory, 'duplicate.md'), '---\nslug: /source\ntitle: Duplicate\n---')
    const reader = () => createZdocContentReader({ checkout: options.dev, manualDirectory: 'content/en/guides' })
    await expect(reader().listPages()).rejects.toThrow('Duplicate Cloud slug')
    await rm(join(directory, 'duplicate.md'))
    await writeFile(join(directory, 'bad.md'), '---\nslug: [bad\n---')
    await expect(reader().listPages()).rejects.toThrow()
    await rm(join(directory, 'bad.md'))
    await symlink('source.md', join(directory, 'link.md'))
    await expect(reader().listPages()).rejects.toThrow('Symbolic link')
  })
  it('runs the actual CLI on a five-source demo and leaves both inputs unchanged', async () => {
    const result = await runSeedDemo(await temp())
    expect(result.summary.coverage).toEqual({ targets: 5, sameName: 1, sameTitle: 1, inferred: 1, combined: 3, remaining: 2 })
    expect(Object.values(result.summary.sources)).toEqual([1, 1, 1, 1, 1])
    expect(result.yaml).toContain('# "unknown.md": ?')
    expect(result.yaml).toContain('# same-name: 1 (omitted)')
    for (const repo of [result.repo, result.dev]) expect(git(repo, 'status', '--porcelain')).toBe('')
  })
  it('uses source.yaml only without --commit and refuses to overwrite inputs or outputs', async () => {
    const root = await temp(), options = await createSeedDemo(root)
    const write = vi.fn()
    const before = [git(options.repo, 'rev-parse', 'HEAD'), git(options.dev, 'rev-parse', 'HEAD')]
    expect(await runLinksSeed(options, write, root)).toBe(0)
    await expect(runLinksSeed(options, write, root)).rejects.toThrow('EEXIST')
    await expect(runLinksSeed({ ...options, out: join(root, 'default.yaml'), commit: undefined }, write, root)).rejects.toThrow('ENOENT')
    // This is a temporary test repository, never the zdoc checkout's shared-docs directory.
    await mkdir(join(root, 'shared-docs'))
    await writeFile(join(root, 'shared-docs/source.yaml'), 'schema_version: 1\nrepository: example\ntrack: v3.0.x\n')
    expect(await runLinksSeed({ ...options, out: join(root, 'default.yaml'), commit: undefined }, write, root)).toBe(0)
    for (const out of [join(options.repo, 'source.yaml'), join(options.dev, 'x.yaml'), join(root, 'shared-docs/links.yaml')]) {
      await expect(runLinksSeed({ ...options, out }, write, root)).rejects.toThrow('--out')
    }
    await symlink(join(options.repo, 'site/en/userGuide/source.md'), join(root, 'output-link.yaml'))
    await expect(runLinksSeed({ ...options, out: join(root, 'output-link.yaml') }, write, root)).rejects.toThrow('EEXIST')
    expect([git(options.repo, 'rev-parse', 'HEAD'), git(options.dev, 'rev-parse', 'HEAD')]).toEqual(before)
    expect(git(options.repo, 'status', '--porcelain')).toBe('')
    expect(git(options.dev, 'status', '--porcelain')).toBe('')
  })
  it('rejects missing and unknown CLI arguments', () => {
    for (const args of [[], ['--unknown', 'x'], ['--repo', 'x', '--dev', 'y', '--out', 'z', '--commit']]) {
      expect(() => execFileSync(process.execPath, [resolve('scripts/docs-tooling.js'), 'shared-docs', 'links-seed', ...args], { stdio: 'pipe' })).toThrow()
    }
  })
})
