// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  isAllowedLocalizedGuidesOutputPath,
  localizedActiveStatePath,
  localizedReceiptPath,
  parseLocalizedReceipt,
  validateLocalizedReceipt,
  type LocalizedReceipt,
} from '../../core/handoff/receipt.ts'

const COMMIT_A = 'a'.repeat(40)
const COMMIT_B = 'b'.repeat(40)
const SHA_1 = '1'.repeat(64)
const SHA_2 = '2'.repeat(64)
const SHA_3 = '3'.repeat(64)
const SHA_4 = '4'.repeat(64)
const SHA_5 = '5'.repeat(64)
const SHA_6 = '6'.repeat(64)

function makeValidReceipt(overrides: Partial<LocalizedReceipt> = {}): LocalizedReceipt {
  return {
    schema_version: 1,
    locale: 'zh-CN',
    group: 'guides',
    page: 'delete-entities',
    page_url: 'tutorials/development/insert-and-delete/delete-entities',
    inputs: {
      master_commit: COMMIT_A,
      dev_commit: COMMIT_B,
      source_files: [
        { path: 'localized-docs/zh-CN/guides/pages/delete-entities/source.md', sha256: SHA_1 },
        { path: 'localized-docs/zh-CN/guides/pages/delete-entities/page.yaml', sha256: SHA_2 },
        { path: 'localized-docs/zh-CN/guides/Variables.json', sha256: SHA_3 },
        { path: 'localized-docs/zh-CN/guides/fragments/cn-tip.md', sha256: SHA_4 },
      ],
      md2md_version: '1.3.0',
      navigation_digest: SHA_5,
      image_base_url: 'https://assets.zilliz.com.cn/docs',
      images: [
        {
          source: 'assets/delete-diagram.png',
          published_url: 'https://assets.zilliz.com.cn/docs/localized/delete-diagram.png',
          sha256: SHA_6,
        },
      ],
    },
    output: {
      path: 'content/zh-CN/guides/tutorials/development/insert-and-delete/delete-entities.md',
      sha256: SHA_1,
    },
    channel: null,
    fetch_run_id: '192837465',
    reference_record_id: 'recOptionalRefOnly',
    ...overrides,
  }
}

describe('localized-docs handoff receipt & path isolation', () => {
  it('computes independent dev manifest paths and rejects reserved or unsafe page IDs', () => {
    expect(localizedActiveStatePath('zh-CN', 'guides')).toBe(
      'generated/zh-CN/manifests/localized-pages/guides/active.json',
    )
    expect(localizedReceiptPath('zh-CN', 'guides', 'delete-entities')).toBe(
      'generated/zh-CN/manifests/localized-pages/guides/delete-entities.json',
    )

    expect(() => localizedReceiptPath('zh-CN', 'guides', 'active')).toThrow(/reserved/i)
    expect(() => localizedReceiptPath('zh-CN', 'guides', '../escape')).toThrow()
    expect(() => localizedReceiptPath('zh-CN', 'guides', 'UpperCase')).toThrow()
    expect(() => localizedReceiptPath('en' as any, 'guides', 'delete-entities')).toThrow()
    expect(() => localizedActiveStatePath('zh-CN', 'reference' as any)).toThrow()
  })

  it('enforces strict zh-CN Guides output path isolation', () => {
    expect(
      isAllowedLocalizedGuidesOutputPath(
        'content/zh-CN/guides/tutorials/development/insert-and-delete/delete-entities.md',
      ),
    ).toBe(true)
    expect(
      isAllowedLocalizedGuidesOutputPath('content/zh-CN/guides/tutorials/overview.mdx'),
    ).toBe(true)

    const forbiddenOutputs = [
      // Cross-site / cross-manual outputs
      'content/en/guides/tutorials/delete-entities.md',
      'content/zh-CN/reference/restful/delete-entities.md',
      'content/zh-CN/byoc/tutorials/delete-entities.md',
      'i18n/ja-JP/docusaurus-plugin-content-docs/current/guides/delete-entities.md',
      // Guides home page exclusions
      'content/zh-CN/guides/home.md',
      'content/zh-CN/guides/home.mdx',
      'content/zh-CN/guides/index.md',
      'content/zh-CN/guides/index.mdx',
      'content/zh-CN/guides/guides.md',
      'content/zh-CN/guides/guides.mdx',
      // Tools directory exclusion (prevents conflict with zh-CN-reference)
      'content/zh-CN/guides/tutorials/tools/cli.md',
      'content/zh-CN/guides/tutorials/tools/nested/tool.mdx',
      // Unsafe / non-markdown paths
      'content/zh-CN/guides/tutorials/delete-entities.json',
      'content/zh-CN/guides/../en/guides/delete-entities.md',
      '/content/zh-CN/guides/tutorials/delete-entities.md',
      'content/zh-CN/guides/tutorials\\delete-entities.md',
    ]

    for (const badPath of forbiddenOutputs) {
      expect(isAllowedLocalizedGuidesOutputPath(badPath), badPath).toBe(false)
      const mutated = makeValidReceipt({ output: { path: badPath, sha256: SHA_1 } })
      expect(() => validateLocalizedReceipt(mutated), badPath).toThrow(/isolation/i)
    }
  })

  it('validates a complete receipt with optional reference_record_id and expected bindings', () => {
    const valid = makeValidReceipt()
    expect(
      validateLocalizedReceipt(valid, {
        locale: 'zh-CN',
        group: 'guides',
        page: 'delete-entities',
        page_url: '/tutorials/development/insert-and-delete/delete-entities.md',
      }),
    ).toBe(valid)
    expect(parseLocalizedReceipt(JSON.stringify(valid), { page: 'delete-entities' })).toEqual(valid)

    // reference_record_id may be omitted or null, and channel may be 'next' or 'retire-in-next'
    const minimal = makeValidReceipt({ channel: 'next' })
    delete minimal.reference_record_id
    expect(validateLocalizedReceipt(minimal)).toBe(minimal)
    expect(
      validateLocalizedReceipt(makeValidReceipt({ channel: 'retire-in-next', reference_record_id: null })),
    ).toBeTruthy()
  })

  it('rejects missing required source_files, bad digests, non-HTTPS URLs, unknown fields, and expectation mismatches', () => {
    const mutations: Array<[string, (r: any) => void]> = [
      ['wrong schema_version', r => { r.schema_version = 2 }],
      ['unknown root field', r => { r.extra = true }],
      ['non-canonical page_url', r => { r.page_url = '/tutorials/delete-entities.md' }],
      ['reserved page active', r => { r.page = 'active' }],
      ['bad master_commit', r => { r.inputs.master_commit = 'main' }],
      ['bad dev_commit', r => { r.inputs.dev_commit = '1234' }],
      ['empty source_files', r => { r.inputs.source_files = [] }],
      ['missing source.md', r => { r.inputs.source_files = r.inputs.source_files.slice(1) }],
      ['missing page.yaml', r => { r.inputs.source_files.splice(1, 1) }],
      ['missing Variables.json', r => { r.inputs.source_files.splice(2, 1) }],
      ['duplicate source_files path', r => { r.inputs.source_files.push({ ...r.inputs.source_files[0] }) }],
      ['traversal in source_files', r => { r.inputs.source_files.push({ path: '../secret.md', sha256: SHA_1 }) }],
      ['bad source file sha256', r => { r.inputs.source_files[0].sha256 = 'not-a-sha' }],
      ['empty md2md_version', r => { r.inputs.md2md_version = '' }],
      ['bad navigation_digest', r => { r.inputs.navigation_digest = 'deadbeef' }],
      ['http image_base_url', r => { r.inputs.image_base_url = 'http://assets.zilliz.com.cn/docs' }],
      ['credentialed image_base_url', r => { r.inputs.image_base_url = 'https://user:pass@assets.zilliz.com.cn' }],
      ['duplicate image source', r => { r.inputs.images.push({ ...r.inputs.images[0] }) }],
      ['http image published_url', r => { r.inputs.images[0].published_url = 'http://assets.zilliz.com.cn/a.png' }],
      ['bad image sha256', r => { r.inputs.images[0].sha256 = 'bad' }],
      ['bad output sha256', r => { r.output.sha256 = 'short' }],
      ['invalid channel', r => { r.channel = 'current' }],
      ['empty fetch_run_id', r => { r.fetch_run_id = '' }],
      ['whitespace fetch_run_id', r => { r.fetch_run_id = 'run 123' }],
      ['control char reference_record_id', r => { r.reference_record_id = 'rec\n1' }],
    ]

    for (const [label, mutate] of mutations) {
      const candidate = makeValidReceipt()
      mutate(candidate)
      expect(() => validateLocalizedReceipt(candidate), label).toThrow()
    }

    // Expectation mismatches
    expect(() => validateLocalizedReceipt(makeValidReceipt(), { page: 'other-page' })).toThrow(/page mismatch/)
    expect(() =>
      validateLocalizedReceipt(makeValidReceipt(), { page_url: 'tutorials/other-page' }),
    ).toThrow(/page_url mismatch/)
    expect(() => parseLocalizedReceipt('{invalid')).toThrow(/Malformed/)
  })
})
