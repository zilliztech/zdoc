'use strict';

const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const plugin = require('./index.js')

function writeDoc(dir, relativePath, frontMatter) {
  const target = path.join(dir, relativePath)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, `---\n${frontMatter}\n---\n\n# Doc\n`)
  return target
}

function lifecycle({outDir, routesPaths, locales = [], defaultLocale = 'en', baseUrl = '/'}) {
  return {
    outDir,
    routesPaths,
    baseUrl,
    siteConfig: {i18n: {locales: ['en', ...locales], defaultLocale}},
  }
}

test('lists only NEXT-channel routes across locales', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'release-channel-routes-'))
  try {
    const content = path.join(root, 'content')
    const outDir = path.join(root, 'build')
    fs.mkdirSync(outDir)
    writeDoc(content, 'docs/stable.md', 'title: Stable\nslug: /stable')
    writeDoc(content, 'docs/pingone-sso.md', 'title: PingOne SSO\nslug: /pingone-sso\nchannel: next')
    writeDoc(content, 'docs/case-variant.md', 'title: Case\nslug: /case-variant\nchannel: NEXT')

    const instance = plugin({}, {sources: [{id: 'default', folder: content, route: 'docs'}]})
    await instance.postBuild(lifecycle({
      outDir,
      routesPaths: [
        '/docs/home',
        '/docs/stable',
        '/docs/pingone-sso',
        '/case-variant',
        '/docs/pingone-sso/',
        '/ja-JP/docs/pingone-sso',
      ],
      locales: ['ja-JP'],
    }))

    assert.equal(
      fs.readFileSync(path.join(outDir, 'release-channel-routes.txt'), 'utf8'),
      '/docs/pingone-sso\n/ja-JP/docs/pingone-sso\n',
    )
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('propagates NEXT channel to localized translations via the shared token', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'release-channel-routes-'))
  try {
    const content = path.join(root, 'content')
    const localized = path.join(root, 'i18n', 'ja-JP', 'docusaurus-plugin-content-docs', 'current')
    fs.mkdirSync(path.join(root, 'build'))
    // English source carries the channel; the stale Japanese translation does
    // not yet, but both share the Feishu document token.
    writeDoc(content, 'docs/pingone-sso.md', 'title: PingOne SSO\nslug: /pingone-sso\nchannel: next\ntoken: tok-1')
    writeDoc(localized, 'docs/pingone-sso.md', 'title: PingOne SSO\nslug: /pingone-sso\ntoken: tok-1')

    const instance = plugin({}, {sources: [{id: 'default', folder: content, route: 'docs'}]})
    await instance.postBuild({
      outDir: path.join(root, 'build'),
      routesPaths: ['/docs/pingone-sso', '/ja-JP/docs/pingone-sso'],
      baseUrl: '/',
      siteConfig: {i18n: {locales: ['en', 'ja-JP'], defaultLocale: 'en'}},
      i18n: {currentLocale: 'en', defaultLocale: 'en', localizationDir: path.join(root, 'i18n')},
    })

    assert.equal(
      fs.readFileSync(path.join(root, 'build', 'release-channel-routes.txt'), 'utf8'),
      '/docs/pingone-sso\n/ja-JP/docs/pingone-sso\n',
    )
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('writes an empty file when no NEXT pages exist', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'release-channel-routes-'))
  try {
    const content = path.join(root, 'content')
    const outDir = path.join(root, 'build')
    fs.mkdirSync(outDir)
    writeDoc(content, 'docs/stable.md', 'title: Stable\nslug: /stable')

    const instance = plugin({}, {sources: [{id: 'default', folder: content, route: 'docs'}]})
    await instance.postBuild(lifecycle({outDir, routesPaths: ['/docs/stable']}))

    assert.equal(fs.readFileSync(path.join(outDir, 'release-channel-routes.txt'), 'utf8'), '')
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('strips the baseUrl prefix when matching localized route passes', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'release-channel-routes-'))
  try {
    const content = path.join(root, 'content')
    const outDir = path.join(root, 'build')
    fs.mkdirSync(outDir)
    writeDoc(content, 'docs/preview.md', 'title: Preview\nslug: /preview\nchannel: next')

    const instance = plugin({}, {sources: [{id: 'default', folder: content, route: 'docs'}]})
    await instance.postBuild(lifecycle({
      outDir,
      baseUrl: '/zh-CN/',
      routesPaths: ['/zh-CN/docs/preview'],
      defaultLocale: 'zh-CN',
    }))

    assert.equal(
      fs.readFileSync(path.join(outDir, 'release-channel-routes.txt'), 'utf8'),
      '/zh-CN/docs/preview\n',
    )
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('rejects unsafe sources and output paths', () => {
  assert.throws(() => plugin({}, {sources: [{id: 'a', folder: 'relative/path', route: 'docs'}]}), /must be absolute/)
  assert.throws(() => plugin({}, {sources: [{id: 'a', folder: '/tmp', route: 'docs'}], outputFile: '../escape.txt'}), /safe relative path/)
  assert.doesNotThrow(() => plugin({}, {sources: []}))
})
