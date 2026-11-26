// @vitest-environment node
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createLocalizedPreprocessAdapter } from '../adapters/md2md.ts'
import { localizedMdxAdapter } from '../adapters/mdx.ts'
import { assembleLocalizedPage, detectImportableComponents, extractFirstParagraph, validateChannelTags, validateSourceShell } from '../core/assemble.ts'
import { parseLocalizedVariables } from '../core/config.ts'
import type { PageConfig } from '../core/types.ts'
import { VALID_GROUP_VARIABLES_JSON } from './fixtures/en-samples.ts'

function tempRoot(prefix = 'localized-docs-assemble-'): string {
  return realpathSync(mkdtempSync(join(tmpdir(), prefix)))
}

const BASE_PAGE_CONFIG: PageConfig = {
  schema_version: 1,
  mode: 'incremental',
  en_source: {
    manual: 'guides',
    shared_page: 'delete-entities',
  },
  variables: {
    example_token: 'PAGE_OVERRIDE_TOKEN',
  },
}

describe('assembleLocalizedPage + md2md + toMdx', () => {
  it('expands Variables.json + page variables + fragments/, omits import UI/NextChannel, and passes toMdx', async () => {
    const root = tempRoot()
    try {
      mkdirSync(join(root, 'fragments'), { recursive: true })
      writeFileSync(
        join(root, 'fragments/tip.md'),
        '<Admonition type="info" title="提示">\n\n操作将应用于 {{var.connection_target}}。\n\n</Admonition>\n',
      )

      const varsParsed = parseLocalizedVariables(VALID_GROUP_VARIABLES_JSON)
      expect('variables' in varsParsed).toBe(true)
      const groupVariables = 'variables' in varsParsed ? varsParsed.variables : {}

      const sourceMd = `# 删除 Entity

您可以在 {{var.product_name}} 中删除 Entity。

{{fragments/tip.md}}

点击控制台中的 <UI>删除</UI> 按钮。

<NextChannel action="include">

提交前请在 <UI>Query Explorer</UI> 中确认条件。

</NextChannel>

<Tabs groupId="code" defaultValue="python" values={[{"label":"Python","value":"python"}]}>
<TabItem value="python">

\`\`\`python
# next-channel-next-line
client = MilvusClient(uri="{{var.example_endpoint}}", token="{{var.example_token}}")
\`\`\`

</TabItem>
</Tabs>
`

      const result = await assembleLocalizedPage({
        pageId: 'delete-entities',
        sourceMd,
        groupVariables,
        pageConfig: BASE_PAGE_CONFIG,
        preprocessAdapter: createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: true }),
        mdxAdapter: localizedMdxAdapter,
      })

      expect('errors' in result).toBe(false)
      if ('errors' in result) return

      expect(result.title).toBe('删除 Entity')
      expect(result.description).toBe('您可以在 Zilliz Cloud 中删除 Entity。')
      expect(result.components).toEqual(['Admonition', 'Tabs', 'TabItem'])
      expect(result.mdx).toContain('title: "删除 Entity | Cloud"')
      expect(result.mdx).toContain("import Admonition from '@theme/Admonition';")
      expect(result.mdx).toContain("import Tabs from '@theme/Tabs';")
      expect(result.mdx).toContain("import TabItem from '@theme/TabItem';")
      expect(result.mdx).not.toContain('import UI')
      expect(result.mdx).not.toContain('import NextChannel')
      expect(result.mdx).toContain('操作将应用于 您的集群。')
      expect(result.mdx).toContain('PAGE_OVERRIDE_TOKEN')
      expect(result.mdx).toContain('<UI>删除</UI>')
      expect(result.mdx).toContain('<NextChannel action="include">')
      expect(result.uiTags.map(t => t.text)).toEqual(['删除', 'Query Explorer'])
      expect(result.dependencies.fragments.map(f => f.path)).toEqual(['fragments/tip.md'])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('uses an isolated empty temp fragmentRoot when fragments/ is absent (succeeds without refs, fails FRAGMENT_NOT_FOUND with refs)', async () => {
    const root = tempRoot()
    try {
      // Even if a stray file existed at parent/fragments in some checkout, absent hasFragmentsDir=false uses empty temp dir
      const preprocessAdapter = createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: false })

      const ok = await assembleLocalizedPage({
        pageId: 'simple-page',
        sourceMd: '---\ntitle: 简单页面\ndescription: 描述文本\n---\n\n# 简单页面\n\n正文使用 {{var.product_name}}。\n',
        groupVariables: { product_name: 'Zilliz Cloud' },
        pageConfig: { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'simple-page' } },
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in ok).toBe(false)

      const missingFrag = await assembleLocalizedPage({
        pageId: 'simple-page',
        sourceMd: '# 简单页面\n\n{{fragments/missing.md}}\n',
        groupVariables: {},
        pageConfig: { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'simple-page' } },
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in missingFrag).toBe(true)
      if ('errors' in missingFrag) {
        expect(missingFrag.errors[0].code).toBe('FRAGMENT_NOT_FOUND')
      }
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('rejects machine-generated front matter and hand-written import shell in source.md while permitting fenced import examples', () => {
    const badFm = validateSourceShell('---\ntitle: 测试\nslug: /delete-entities\ntoken: abc\n---\n\n# 测试\n')
    expect('errors' in badFm).toBe(true)
    if ('errors' in badFm) {
      expect(badFm.errors.every(e => e.code === 'SOURCE_SHELL_FORBIDDEN')).toBe(true)
      expect(badFm.errors.length).toBe(2)
    }

    const badImport = validateSourceShell("# 测试\n\nimport Tabs from '@theme/Tabs';\n\n正文\n")
    expect('errors' in badImport).toBe(true)
    if ('errors' in badImport) {
      expect(badImport.errors[0].code).toBe('SOURCE_SHELL_FORBIDDEN')
      expect(badImport.errors[0].line).toBe(3)
    }

    const fencedImportOk = validateSourceShell(
      "# 测试\n\n```tsx\nimport Tabs from '@theme/Tabs';\n```\n",
    )
    expect('errors' in fencedImportOk).toBe(false)
  })

  it('validates <NextChannel> rules and channel code directives strictly', () => {
    expect(validateChannelTags('<NextChannel variant="next">\nx\n</NextChannel>')[0].code).toBe('CHANNEL_TAG_INVALID')
    expect(validateChannelTags('<NextChannel action="other">\nx\n</NextChannel>')[0].code).toBe('CHANNEL_TAG_INVALID')
    expect(validateChannelTags('<NextChannel action="include" />')[0].code).toBe('CHANNEL_TAG_INVALID')
    expect(validateChannelTags('<NextChannel action="include">\nunclosed')[0].code).toBe('CHANNEL_TAG_UNBALANCED')
    expect(validateChannelTags('stray </NextChannel>')[0].code).toBe('CHANNEL_TAG_UNBALANCED')
    expect(
      validateChannelTags('<NextChannel action="include">\n<NextChannel action="exclude">x</NextChannel>\n</NextChannel>')[0].code,
    ).toBe('CHANNEL_TAG_NESTED')
    expect(validateChannelTags('<NextChannel action="include">\nx\n</NextChannel>', 'next')[0].code).toBe(
      'CHANNEL_TAG_INVALID',
    )
    expect(
      validateChannelTags('```python\n# next-channel-start\nprint(1)\n```\n')[0].code,
    ).toBe('CHANNEL_CODE_DIRECTIVE_INVALID')
    expect(
      validateChannelTags('```python\n# next-channel-start\n# current-channel-end\n```\n')[0].code,
    ).toBe('CHANNEL_CODE_DIRECTIVE_INVALID')

    // Ignored inside code spans and fences
    expect(validateChannelTags('`<NextChannel variant="bad">` and\n```md\n<NextChannel variant="bad">\n```')).toEqual([])
  })

  it('never detects global UI or NextChannel as importable components', () => {
    const components = detectImportableComponents(
      '<UI>按钮</UI>\n<NextChannel action="include"><Supademo id="x" /></NextChannel>\n<Procedures />',
    )
    expect(components).toEqual(['Supademo', 'Procedures'])
  })

  it('rejects malformed <UI> and broken MDX syntax during assembly and respects metadata > source > H1 precedence', async () => {
    const root = tempRoot()
    try {
      const preprocessAdapter = createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: false })

      const badUi = await assembleLocalizedPage({
        pageId: 'bad-ui',
        sourceMd: '# 标题\n\n点击 <UI className="x">按钮</UI>。\n',
        groupVariables: {},
        pageConfig: { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'bad-ui' } },
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in badUi && badUi.errors[0].code).toBe('UI_TAG_MALFORMED')

      const badMdx = await assembleLocalizedPage({
        pageId: 'bad-mdx',
        sourceMd: '# 标题\n\n<Tabs>\n未闭合的 Tabs。\n',
        groupVariables: {},
        pageConfig: { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'bad-mdx' } },
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in badMdx && badMdx.errors[0].code).toBe('ADAPT_MDX_INVALID')

      const overrideTitle = await assembleLocalizedPage({
        pageId: 'override-title',
        sourceMd: '---\ntitle: 源码标题\ndescription: 源码描述\n---\n\n# 正文一级标题\n\n正文内容。\n',
        groupVariables: {},
        pageConfig: { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'override-title' } },
        metadata: { title: '调用方标题', channel: 'next' },
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in overrideTitle).toBe(false)
      if (!('errors' in overrideTitle)) {
        expect(overrideTitle.title).toBe('调用方标题')
        expect(overrideTitle.description).toBe('源码描述')
        expect(overrideTitle.mdx).toContain('channel: next')
      }
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('rejects multiline and trailing-comment import statements with SOURCE_SHELL_FORBIDDEN and 1-based start line while allowing prose and code/comments', () => {
    const multilineNamed = validateSourceShell("# Title\n\nimport {\n  Tabs,\n  TabItem\n} from '@theme/Tabs';\n\nBody.\n")
    expect('errors' in multilineNamed).toBe(true)
    if ('errors' in multilineNamed) {
      expect(multilineNamed.errors).toHaveLength(1)
      expect(multilineNamed.errors[0].code).toBe('SOURCE_SHELL_FORBIDDEN')
      expect(multilineNamed.errors[0].line).toBe(3)
    }

    const mixedDefaultNamed = validateSourceShell(
      "---\ntitle: 测试\n---\n\nimport Foo, {\n  Bar // inline\n} from '@site/src/components/Foo' /* trailing */\n\nBody.\n",
    )
    expect('errors' in mixedDefaultNamed).toBe(true)
    if ('errors' in mixedDefaultNamed) {
      expect(mixedDefaultNamed.errors).toHaveLength(1)
      expect(mixedDefaultNamed.errors[0].code).toBe('SOURCE_SHELL_FORBIDDEN')
      expect(mixedDefaultNamed.errors[0].line).toBe(5)
    }

    const trailingCommentLine = validateSourceShell("# T\n\nimport Tabs from '@theme/Tabs'; // comment\n")
    expect('errors' in trailingCommentLine).toBe(true)
    if ('errors' in trailingCommentLine) {
      expect(trailingCommentLine.errors[0].code).toBe('SOURCE_SHELL_FORBIDDEN')
      expect(trailingCommentLine.errors[0].line).toBe(3)
    }

    const trailingBlockComment = validateSourceShell("# T\n\nimport Tabs from '@theme/Tabs' /* trailing */\n")
    expect('errors' in trailingBlockComment).toBe(true)
    if ('errors' in trailingBlockComment) {
      expect(trailingBlockComment.errors[0].code).toBe('SOURCE_SHELL_FORBIDDEN')
      expect(trailingBlockComment.errors[0].line).toBe(3)
    }

    const allowedProseAndComments = validateSourceShell(
      `# T

Import data from your local machine.

import data from the CSV file into the collection.

\`import Tabs from '@theme/Tabs'; // inline code\`

<!-- import Tabs from '@theme/Tabs'; -->

{/*
import {
  Tabs
} from '@theme/Tabs';
*/}

~~~tsx
import {
  Tabs
} from '@theme/Tabs'; // fenced
~~~
`,
    )
    expect('errors' in allowedProseAndComments).toBe(false)
  })

  it('extracts first paragraph when starting with <UI> or inline <NextChannel> while skipping block JSX containers', async () => {
    expect(
      extractFirstParagraph('# 创建索引\n\n<UI>创建索引</UI> 可以加速向量检索。\n'),
    ).toBe('创建索引 可以加速向量检索。')

    expect(
      extractFirstParagraph('# 说明\n\n<NextChannel action="exclude">旧版控制台</NextChannel> 支持一键操作。\n'),
    ).toBe('旧版控制台 支持一键操作。')

    expect(
      extractFirstParagraph('# 说明\n\n<NextChannel action="include">仅新版</NextChannel> 通用说明文本。\n'),
    ).toBe('通用说明文本。')

    const withBlockContainers = `# 标题

<NextChannel action="include">

仅 Next 版本可见的段落。

</NextChannel>

<Admonition type="info">

提示内容。

</Admonition>

<Tabs>
<TabItem value="a" label="A">

标签页内容。

</TabItem>
</Tabs>

<Supademo id="demo-1" />

<Procedures />

<DocCardList />

</Tabs>

<UI>创建索引</UI> 可以加速向量检索。
`
    expect(extractFirstParagraph(withBlockContainers)).toBe('创建索引 可以加速向量检索。')

    const root = tempRoot()
    try {
      const assembled = await assembleLocalizedPage({
        pageId: 'create-index',
        sourceMd: '# 创建索引\n\n<UI>创建索引</UI> 可以加速向量检索。\n',
        groupVariables: {},
        pageConfig: { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'create-index' } },
        preprocessAdapter: createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: false }),
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in assembled).toBe(false)
      if (!('errors' in assembled)) {
        expect(assembled.description).toBe('创建索引 可以加速向量检索。')
      }
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('escapes YAML special characters and empty strings in metadata.beta and scalar front matter fields', async () => {
    const root = tempRoot()
    try {
      const preprocessAdapter = createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: false })

      const specialBeta = await assembleLocalizedPage({
        pageId: 'yaml-escape',
        sourceMd: '# 标题\n\n正文内容。\n',
        groupVariables: {},
        pageConfig: { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'yaml-escape' } },
        metadata: {
          beta: 'yes: no',
          keywords: ['a: b', 'true', '', '#tag', 'foo #bar', '- item', 'trail:'],
          added_since: '#draft',
        },
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in specialBeta).toBe(false)
      if (!('errors' in specialBeta)) {
        expect(specialBeta.mdx).toContain('beta: "yes: no"')
        expect(specialBeta.mdx).toContain('  - ""')
        expect(specialBeta.mdx).toContain('  - "a: b"')
        expect(specialBeta.mdx).toContain('  - "#tag"')
      }

      const emptyBeta = await assembleLocalizedPage({
        pageId: 'yaml-empty-beta',
        sourceMd: '# 标题\n\n正文内容。\n',
        groupVariables: {},
        pageConfig: { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'yaml-empty-beta' } },
        metadata: {
          beta: '',
        },
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in emptyBeta).toBe(false)
      if (!('errors' in emptyBeta)) {
        expect(emptyBeta.mdx).toContain('beta: ""')
      }
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('rejects invalid keywords front matter in source.md with CONFIG_FIELD_INVALID instead of silently dropping it', () => {
    for (const badYaml of [
      'keywords: "a, b"',
      'keywords: 123',
      'keywords:\n  - valid\n  - ""',
      'keywords:\n  - valid\n  - 42',
    ]) {
      const res = validateSourceShell(`---\ntitle: 测试\n${badYaml}\n---\n\n# 测试\n`)
      expect('errors' in res, badYaml).toBe(true)
      if ('errors' in res) {
        expect(res.errors[0].code).toBe('CONFIG_FIELD_INVALID')
      }
    }

    const ok = validateSourceShell('---\ntitle: 测试\nkeywords:\n  - 索引\n  - 向量检索\n---\n\n# 测试\n')
    expect('errors' in ok).toBe(false)
    if (!('errors' in ok)) {
      expect(ok.sourceKeywords).toEqual(['索引', '向量检索'])
    }
  })

  it('keeps YAML-coercible keywords and string metadata fields as strings while preserving default FALSE flags', async () => {
    const require = createRequire(import.meta.url)
    const { validateFrontmatter } = require('../../mdx/validate.cjs') as {
      validateFrontmatter: (source: string, label?: string) => Record<string, unknown>
    }

    const root = tempRoot()
    try {
      const preprocessAdapter = createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: false })
      const keywords = ['true', 'false', 'null', '~', '123', '2.5', '0b10', '2026-11-26']

      const fromSource = await assembleLocalizedPage({
        pageId: 'yaml-coercion',
        sourceMd: [
          '---',
          'title: 标题',
          'keywords:',
          ...keywords.map(k => `  - ${JSON.stringify(k)}`),
          '---',
          '',
          '# 标题',
          '',
          '正文内容。',
          '',
        ].join('\n'),
        groupVariables: {},
        pageConfig: { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'yaml-coercion' } },
        metadata: {
          slug: '123',
          token: '12345',
          type: 'true',
          displayed_sidebar: 'null',
          added_since: '2.5',
          last_modified: '2026-11-26',
          deprecate_since: '2026-11-26',
        },
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })

      expect('errors' in fromSource).toBe(false)
      if ('errors' in fromSource) return

      const fm = validateFrontmatter(fromSource.mdx, 'yaml-coercion.mdx')
      expect(fm.keywords).toEqual(keywords)
      expect((fm.keywords as unknown[]).every(item => typeof item === 'string')).toBe(true)
      expect(fm.slug).toBe('123')
      expect(fm.token).toBe('12345')
      expect(fm.type).toBe('true')
      expect(fm.displayed_sidebar).toBe('null')
      expect(fm.added_since).toBe('2.5')
      expect(fm.last_modified).toBe('2026-11-26')
      expect(fm.deprecate_since).toBe('2026-11-26')
      expect(fm.beta).toBe(false)
      expect(fromSource.mdx).toContain('beta: FALSE')

      const withBooleanFalseDeprecate = await assembleLocalizedPage({
        pageId: 'deprecate-false',
        sourceMd: '# 标题\n\n正文。\n',
        groupVariables: {},
        pageConfig: { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'deprecate-false' } },
        metadata: { deprecate_since: false },
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in withBooleanFalseDeprecate).toBe(false)
      if (!('errors' in withBooleanFalseDeprecate)) {
        expect(withBooleanFalseDeprecate.mdx).toContain('deprecate_since: false')
        expect(withBooleanFalseDeprecate.mdx).toContain('added_since: FALSE')
      }
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('preserves inline code containing <UI> or <NextChannel> and skips multiline JSX blocks with opening-line text', async () => {
    expect(extractFirstParagraph('# Title\n\nUse `<UI>foo</UI>` in docs.\n')).toBe(
      'Use `<UI>foo</UI>` in docs.',
    )
    expect(
      extractFirstParagraph('# Title\n\nUse `<NextChannel action="include">bar</NextChannel>` in docs.\n'),
    ).toBe('Use `<NextChannel action="include">bar</NextChannel>` in docs.')
    expect(
      extractFirstParagraph('# Title\n\nUse `<UI>foo</UI>` and <UI>bar</UI> in docs.\n'),
    ).toBe('Use `<UI>foo</UI>` and bar in docs.')

    expect(
      extractFirstParagraph('# Title\n\n<NextChannel action="include">Next line 1\nNext line 2\n</NextChannel>\n\nReal paragraph.\n'),
    ).toBe('Real paragraph.')
    expect(
      extractFirstParagraph('# Title\n\n<NextChannel action="include">Next line 1\nNext line 2</NextChannel>\n\nReal paragraph.\n'),
    ).toBe('Real paragraph.')
    expect(
      extractFirstParagraph('# Title\n\n<Admonition type="info">Tip line 1\nTip line 2\n</Admonition>\n\nReal paragraph.\n'),
    ).toBe('Real paragraph.')

    const root = tempRoot()
    try {
      const assembled = await assembleLocalizedPage({
        pageId: 'inline-code-desc',
        sourceMd: '# Title\n\nUse `<UI>foo</UI>` and `<NextChannel action="include">bar</NextChannel>` in docs.\n',
        groupVariables: {},
        pageConfig: { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'inline-code-desc' } },
        preprocessAdapter: createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: false }),
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in assembled).toBe(false)
      if (!('errors' in assembled)) {
        expect(assembled.description).toBe('Use `<UI>foo</UI>` and `<NextChannel action="include">bar</NextChannel>` in docs.')
      }
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('rejects ES2022 string-literal import names with braces and imports with blank lines before from', () => {
    const es2022Import = validateSourceShell('# T\n\nimport { "a}b" as Foo } from \'@theme/Tabs\';\n')
    expect('errors' in es2022Import).toBe(true)
    if ('errors' in es2022Import) {
      expect(es2022Import.errors[0].code).toBe('SOURCE_SHELL_FORBIDDEN')
      expect(es2022Import.errors[0].line).toBe(3)
    }

    const blankLineBeforeFrom = validateSourceShell("# T\n\nimport Tabs\n\nfrom '@theme/Tabs';\n")
    expect('errors' in blankLineBeforeFrom).toBe(true)
    if ('errors' in blankLineBeforeFrom) {
      expect(blankLineBeforeFrom.errors[0].code).toBe('SOURCE_SHELL_FORBIDDEN')
      expect(blankLineBeforeFrom.errors[0].line).toBe(3)
    }

    const proseWithBlankLine = validateSourceShell('# T\n\nimport something\n\nfrom another system.\n')
    expect('errors' in proseWithBlankLine).toBe(false)
  })

  it('skips multiline JSX opening tags, quoted/braced > and /> in attributes, closed-then-multiline tags, and strips multiline mid-line <NextChannel action="include"> (Bugs 2.2a-2.2d)', async () => {
    // Bug 2.2a: multi-line opening tag whose > is on a later line
    expect(
      extractFirstParagraph('# Title\n\n<Admonition\n  type="note">\nsecret\n</Admonition>\n\nReal paragraph.\n'),
    ).toBe('Real paragraph.')

    // Bug 2.2b: > and /> inside quoted strings and {...} JSX expressions in opening tags
    expect(
      extractFirstParagraph('# Title\n\n<Admonition type="note" title="a/>b">\nsecret\n</Admonition>\n\nReal paragraph.\n'),
    ).toBe('Real paragraph.')
    expect(
      extractFirstParagraph(
        '# Title\n\n<Tabs values={[{ label: "a/>b", value: "a" }]} check={1 > 0}>\n<TabItem value="a" label="A">\nTab A\n</TabItem>\n</Tabs>\n\nReal paragraph.\n',
      ),
    ).toBe('Real paragraph.')
    expect(
      extractFirstParagraph(
        '# Title\n\n<Tabs><TabItem value="a" label="A">\nTab A\n</TabItem>\nBetween tabs text\n<TabItem value="b" label="B">\nTab B\n</TabItem>\n</Tabs>\n\nReal paragraph.\n',
      ),
    ).toBe('Real paragraph.')

    // Bug 2.2c: closed inline tag followed by unclosed multi-line tag on the same line
    expect(
      extractFirstParagraph(
        '# Title\n\n<NextChannel action="include">a</NextChannel> <NextChannel action="include">\nHidden line\n</NextChannel>\n\nReal paragraph.\n',
      ),
    ).toBe('Real paragraph.')

    // Bug 2.2d: mid-line multi-line <NextChannel action="include"> while preserving <UI>, <NextChannel action="exclude">, and inline code
    expect(
      extractFirstParagraph(
        '# Title\n\nIntro <NextChannel action="include">next\nline2\n</NextChannel>\n\nReal paragraph.\n',
      ),
    ).toBe('Intro')
    expect(
      extractFirstParagraph(
        '# Title\n\n<UI>控制台</UI> 与 `<NextChannel action="include">code</NextChannel>` <NextChannel action="include">hidden\nline2\n</NextChannel>\n\nReal paragraph.\n',
      ),
    ).toBe('控制台 与 `<NextChannel action="include">code</NextChannel>`')
    expect(
      extractFirstParagraph(
        '# Title\n\n<NextChannel action="exclude">\nIncluded paragraph.\n</NextChannel>\n\nFallback paragraph.\n',
      ),
    ).toBe('Included paragraph.')

    const root = tempRoot()
    try {
      const preprocessAdapter = createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: false })
      const cfg: PageConfig = { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'alpha' } }

      const e2e2a = await assembleLocalizedPage({
        pageId: 'alpha',
        sourceMd: '# T\n\n<Admonition\n  type="note">\nsecret\n</Admonition>\n\nReal paragraph.\n',
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in e2e2a).toBe(false)
      if (!('errors' in e2e2a)) expect(e2e2a.description).toBe('Real paragraph.')

      const e2e2b = await assembleLocalizedPage({
        pageId: 'alpha',
        sourceMd: '# T\n\n<Admonition type="note" title="a/>b">\nsecret\n</Admonition>\n\nReal paragraph.\n',
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in e2e2b).toBe(false)
      if (!('errors' in e2e2b)) expect(e2e2b.description).toBe('Real paragraph.')

      const e2e2d = await assembleLocalizedPage({
        pageId: 'alpha',
        sourceMd: '# T\n\nIntro <NextChannel action="include">next\nline2\n</NextChannel>\n\nReal paragraph.\n',
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in e2e2d).toBe(false)
      if (!('errors' in e2e2d)) expect(e2e2d.description).toBe('Intro')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('quotes signed radix literals (+0x10, +0o7, +0b10) in slug, token, type, and added_since so YAML never coerces them', async () => {
    const require = createRequire(import.meta.url)
    const { validateFrontmatter } = require('../../mdx/validate.cjs') as {
      validateFrontmatter: (source: string, label?: string) => Record<string, unknown>
    }

    const root = tempRoot()
    try {
      const preprocessAdapter = createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: false })
      const cfg: PageConfig = { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'radix' } }

      const assembled = await assembleLocalizedPage({
        pageId: 'radix',
        sourceMd: '---\ntitle: 标题\n---\n\n正文。\n',
        metadata: {
          slug: '+0x10',
          token: '+0o7',
          type: '+0b10',
          added_since: '+0x1_0',
          last_modified: '-0x10',
        },
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })

      expect('errors' in assembled).toBe(false)
      if ('errors' in assembled) return

      const fm = validateFrontmatter(assembled.mdx, 'radix.mdx')
      expect(fm.slug).toBe('+0x10')
      expect(fm.token).toBe('+0o7')
      expect(fm.type).toBe('+0b10')
      expect(fm.added_since).toBe('+0x1_0')
      expect(fm.last_modified).toBe('-0x10')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('does not over-mask past JSX attributes containing {/*, <!--, or backticks and preserves <UI>/<NextChannel>/import detection', async () => {
    const root = tempRoot()
    try {
      const preprocessAdapter = createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: false })
      const cfg: PageConfig = { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'attr-comments' } }

      const withAttrComment = await assembleLocalizedPage({
        pageId: 'attr-comments',
        sourceMd: [
          '# Title',
          '',
          '<Admonition type="note" title={/* c */ "Note"}>',
          'secret',
          '</Admonition>',
          '',
          '<Tabs>',
          '  <TabItem value="a" label="A">',
          '',
          'Tab A',
          '',
          '  </TabItem>',
          '</Tabs>',
          '',
          'Real paragraph.',
          '',
        ].join('\n'),
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in withAttrComment).toBe(false)
      if (!('errors' in withAttrComment)) {
        expect(withAttrComment.description).toBe('Real paragraph.')
        expect(withAttrComment.components).toEqual(['Admonition', 'Tabs', 'TabItem'])
        expect(withAttrComment.mdx).toContain("import Tabs from '@theme/Tabs';")
        expect(withAttrComment.mdx).toContain("import TabItem from '@theme/TabItem';")
      }

      const validationNotBypassed = await assembleLocalizedPage({
        pageId: 'attr-comments',
        sourceMd: [
          '# Title',
          '',
          '<Admonition type="note" title={/* c */ "Note"}>',
          'secret',
          '</Admonition>',
          '',
          '<UI attr-bad />',
          '<NextChannel variant="bad">oops',
        ].join('\n'),
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in validationNotBypassed).toBe(true)
      if ('errors' in validationNotBypassed) {
        const codes = validationNotBypassed.errors.map(e => e.code)
        expect(codes).toContain('UI_TAG_MALFORMED')
        expect(codes).toContain('CHANNEL_TAG_INVALID')
        expect(codes).toContain('CHANNEL_TAG_UNBALANCED')
      }

      for (const attr of ['title="{/*"', 'title="<!--"', 'title="a`b" x={`>`}']) {
        const res = await assembleLocalizedPage({
          pageId: 'attr-comments',
          sourceMd: `# Title\n\n<Admonition type="note" ${attr}>\nsecret\n</Admonition>\n\nReal paragraph.\n`,
          groupVariables: {},
          pageConfig: cfg,
          preprocessAdapter,
          mdxAdapter: localizedMdxAdapter,
        })
        expect('errors' in res, attr).toBe(false)
        if (!('errors' in res)) {
          expect(res.description, attr).toBe('Real paragraph.')
        }
      }
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('preserves 4-space indented JSX inside open JSX containers while still masking top-level 4-space code blocks', async () => {
    const root = tempRoot()
    try {
      const preprocessAdapter = createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: false })
      const cfg: PageConfig = { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'indented-jsx' } }

      const tabs4Space = await assembleLocalizedPage({
        pageId: 'indented-jsx',
        sourceMd: [
          '# Title',
          '',
          '<Tabs groupId="cli-install">',
          '',
          '    <TabItem value="linux" label="Linux">',
          '',
          '    Tab A',
          '',
          '    ```tsx',
          '    import Banner from \'@theme/Banner\';',
          '    <Banner />',
          '    ```',
          '',
          '    </TabItem>',
          '',
          '</Tabs>',
          '',
          'Real paragraph.',
          '',
        ].join('\n'),
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in tabs4Space).toBe(false)
      if (!('errors' in tabs4Space)) {
        expect(tabs4Space.description).toBe('Real paragraph.')
        expect(tabs4Space.components).toEqual(['Tabs', 'TabItem'])
        expect(tabs4Space.mdx).toContain("import Tabs from '@theme/Tabs';")
        expect(tabs4Space.mdx).toContain("import TabItem from '@theme/TabItem';")
        expect(tabs4Space.mdx.split('\n# Title')[0]).not.toContain('import Banner')
      }

      const admonition4SpaceClose = await assembleLocalizedPage({
        pageId: 'indented-jsx',
        sourceMd: '# Title\n\n<Admonition type="note">\n\n    </Admonition>\n\nReal paragraph.\n',
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in admonition4SpaceClose).toBe(false)
      if (!('errors' in admonition4SpaceClose)) {
        expect(admonition4SpaceClose.description).toBe('Real paragraph.')
      }

      // Negative checks: genuine top-level 4-space indented code blocks remain masked
      const topLevelIndentedImport = validateSourceShell("# Title\n\n    import X from '@site/x';\n\nBody.\n")
      expect('errors' in topLevelIndentedImport).toBe(false)

      const indentedAfterClosedTabs = validateSourceShell(
        "# Title\n\n<Tabs>\n\n    <TabItem value=\"a\" label=\"A\">\n\n    Tab\n\n    </TabItem>\n\n</Tabs>\n\n    import X from '@site/x';\n",
      )
      expect('errors' in indentedAfterClosedTabs).toBe(false)
      expect(
        detectImportableComponents(
          "<Tabs>\n\n    <TabItem value=\"a\" label=\"A\">\n\n    Tab\n\n    </TabItem>\n\n</Tabs>\n\n    <Banner />\n",
        ),
      ).toEqual(['Tabs', 'TabItem'])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('strips HTML container/void tags and unwraps inline HTML tags in extractFirstParagraph', async () => {
    const root = tempRoot()
    try {
      const preprocessAdapter = createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: false })
      const cfg: PageConfig = { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'html-tags' } }

      const cases: [string, string][] = [
        ['<details>\n<summary>Click</summary>\nsecret\n</details>\n\nReal paragraph.\n', 'Real paragraph.'],
        ['<table>\n<thead><tr><th>Col</th></tr></thead>\n<tbody><tr><td>Val</td></tr></tbody>\n</table>\n\nReal paragraph.\n', 'Real paragraph.'],
        ['<div>\nsecret\n</div>\n\nReal paragraph.\n', 'Real paragraph.'],
        ['<br />\n\nReal paragraph.\n', 'Real paragraph.'],
        ['<hr />\n\nReal paragraph.\n', 'Real paragraph.'],
        ['<img src="https://example.com/a.png" alt="Diagram" />\n\nReal paragraph.\n', 'Real paragraph.'],
        [
          '<p>Use <strong>Zilliz Cloud</strong> with <a href="./docs">docs</a> and <span className="tag">Beta</span>.</p>\n',
          'Use Zilliz Cloud with docs and Beta.',
        ],
      ]

      for (const [body, expected] of cases) {
        const res = await assembleLocalizedPage({
          pageId: 'html-tags',
          sourceMd: `# Title\n\n${body}`,
          groupVariables: {},
          pageConfig: cfg,
          preprocessAdapter,
          mdxAdapter: localizedMdxAdapter,
        })
        expect('errors' in res, body).toBe(false)
        if (!('errors' in res)) {
          expect(res.description, body).toBe(expected)
        }
      }

      // Unknown lowercase placeholder tags (<region-code>, <bucket_name>) are not HTML tags and stay intact
      expect(extractFirstParagraph('# Title\n\nPass <region-code> and <bucket_name> here.\n')).toBe(
        'Pass <region-code> and <bucket_name> here.',
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('handles JS regex literals, division operators, and nested template ${...} expressions in scanJsxOpenTag', async () => {
    const root = tempRoot()
    try {
      const preprocessAdapter = createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: false })
      const cfg: PageConfig = { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'jsx-exprs' } }

      const exprAttrs = [
        'title={/[}\'"`>]/.test("a") ? "x" : "y"}',
        'title={/^\\d{1,3}\\/[}\'"`>]+$/i.test("1/a") ? "x" : "y"}',
        'title={`a ${`b ${1} >`} c`}',
        'title={`a ${(() => { const x = ">"; return x; })()} b`}',
      ]

      for (const attr of exprAttrs) {
        const res = await assembleLocalizedPage({
          pageId: 'jsx-exprs',
          sourceMd: `# Title\n\n<Admonition type="note" ${attr}>\nsecret\n</Admonition>\n\nReal paragraph.\n`,
          groupVariables: {},
          pageConfig: cfg,
          preprocessAdapter,
          mdxAdapter: localizedMdxAdapter,
        })
        expect('errors' in res, attr).toBe(false)
        if (!('errors' in res)) {
          expect(res.description, attr).toBe('Real paragraph.')
        }
      }

      // Division operators must not enter regex mode and swallow subsequent '>'
      expect(
        extractFirstParagraph('# Title\n\n<Admonition type="note" title={((a + b) / 2) > 1 ? "x" : "y"}>\nsecret\n</Admonition>\n\nReal paragraph.\n'),
      ).toBe('Real paragraph.')
      expect(
        extractFirstParagraph('# Title\n\n<Admonition type="note" title={x.return / 2 > 1 ? "x" : "y"}>\nsecret\n</Admonition>\n\nReal paragraph.\n'),
      ).toBe('Real paragraph.')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('handles prose JS expressions, unclosed backticks before 4-space fences inside TabItem, and JSX inside prop expressions E2E', async () => {
    const root = tempRoot()
    try {
      const preprocessAdapter = createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: false })
      const cfg: PageConfig = { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'iter6-e2e' } }

      // Finding 1: prose JS/MDX expressions containing "<!--", "<UI>", or "`"
      for (const expr of ['{/* c */ "<!--"}', '{"<!--"}', '{/* c */ "`"}']) {
        const res = await assembleLocalizedPage({
          pageId: 'iter6-e2e',
          sourceMd: `# Title\n\n${expr}\n\n<Tabs>\n  <TabItem value="a" label="A">Tab</TabItem>\n</Tabs>\n\nReal paragraph.\n`,
          groupVariables: {},
          pageConfig: cfg,
          preprocessAdapter,
          mdxAdapter: localizedMdxAdapter,
        })
        expect('errors' in res, expr).toBe(false)
        if (!('errors' in res)) {
          expect(res.description, expr).toBe('Real paragraph.')
          expect(res.components, expr).toEqual(['Tabs', 'TabItem'])
          expect(res.mdx, expr).toContain("import Tabs from '@theme/Tabs';")
        }
      }

      const strUi = await assembleLocalizedPage({
        pageId: 'iter6-e2e',
        sourceMd: '# Title\n\n{"<UI>"}\n\nReal paragraph.\n',
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in strUi).toBe(false)
      if (!('errors' in strUi)) {
        expect(strUi.description).toBe('Real paragraph.')
      }

      // Validation must NOT be bypassed after prose {/* c */ "<!--"}
      const shellBypassAttempt = await assembleLocalizedPage({
        pageId: 'iter6-e2e',
        sourceMd: '# Title\n\n{/* c */ "<!--"}\n\nimport Evil from "@site/evil";\n\nReal paragraph.\n',
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in shellBypassAttempt).toBe(true)
      if ('errors' in shellBypassAttempt) {
        expect(shellBypassAttempt.errors[0].code).toBe('SOURCE_SHELL_FORBIDDEN')
      }

      const channelBypassAttempt = await assembleLocalizedPage({
        pageId: 'iter6-e2e',
        sourceMd: '# Title\n\n{/* c */ "<!--"}\n\n<NextChannel variant="bad">oops</NextChannel>\n\nReal paragraph.\n',
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in channelBypassAttempt).toBe(true)
      if ('errors' in channelBypassAttempt) {
        expect(channelBypassAttempt.errors[0].code).toBe('CHANNEL_TAG_INVALID')
      }

      // Finding 2: unclosed prose backtick before 4-space fence inside <TabItem>
      const f2Res = await assembleLocalizedPage({
        pageId: 'iter6-e2e',
        sourceMd: [
          '# Title',
          '',
          '<Tabs>',
          '',
          '    <TabItem value="a" label="A">',
          '',
          '    Use a `backtick',
          '    ```js',
          '    // <UI bad />',
          '    const s = "`";',
          '    ```',
          '',
          '    </TabItem>',
          '',
          '</Tabs>',
          '',
          '<Admonition type="note">After tabs</Admonition>',
          '',
          'Real paragraph.',
          '',
        ].join('\n'),
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in f2Res).toBe(false)
      if (!('errors' in f2Res)) {
        expect(f2Res.description).toBe('Real paragraph.')
        expect(f2Res.components).toEqual(['Admonition', 'Tabs', 'TabItem'])
        expect(f2Res.mdx).toContain("import Admonition from '@theme/Admonition';")
      }

      // Finding 3: JSX component inside non-UI prop expression preserves import & strips container for description
      const f3Res = await assembleLocalizedPage({
        pageId: 'iter6-e2e',
        sourceMd: '# Title\n\n<Details summary={<Admonition type="note">hi</Admonition>}>\nbody\n</Details>\n\nReal paragraph.\n',
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in f3Res).toBe(false)
      if (!('errors' in f3Res)) {
        expect(f3Res.description).toBe('Real paragraph.')
        expect(f3Res.components).toEqual(['Admonition'])
        expect(f3Res.mdx).toContain("import Admonition from '@theme/Admonition';")
      }
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('handles 4-space fenced comments inside TabItem, JSX fragments <>...</>, and nested-brace/template JSX E2E', async () => {
    const root = tempRoot()
    try {
      const preprocessAdapter = createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: false })
      const cfg: PageConfig = { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'iter7-e2e' } }

      // Iter 6 Finding 1: <!-- and {/* inside 4-space fence in <TabItem> preserve downstream <blockquote>/<Wrapper> imports and shell checks
      for (const commentLine of ['    <!-- unclosed html comment in 4-space fence', '    {/* unclosed JSX comment in 4-space fence']) {
        const res = await assembleLocalizedPage({
          pageId: 'iter7-e2e',
          sourceMd: [
            '# T',
            '',
            '<Tabs>',
            '',
            '    <TabItem value="a" label="A">',
            '',
            '    ```html',
            commentLine,
            '    ```',
            '',
            '    </TabItem>',
            '',
            '</Tabs>',
            '',
            '<blockquote>',
            '',
            '    <Admonition type="note">Inside blockquote</Admonition>',
            '',
            '</blockquote>',
            '',
            'Real paragraph.',
            '',
          ].join('\n'),
          groupVariables: {},
          pageConfig: cfg,
          preprocessAdapter,
          mdxAdapter: localizedMdxAdapter,
        })
        expect('errors' in res, commentLine).toBe(false)
        if (!('errors' in res)) {
          expect(res.description, commentLine).toBe('Real paragraph.')
          expect(res.components, commentLine).toEqual(['Admonition', 'Tabs', 'TabItem'])
          expect(res.mdx, commentLine).toContain("import Admonition from '@theme/Admonition';")
        }
      }

      const shellAfterFence = validateSourceShell([
        '# T',
        '',
        '<Tabs>',
        '',
        '    <TabItem value="a" label="A">',
        '',
        '    ```html',
        '    <!-- unclosed',
        '    ```',
        '',
        '    </TabItem>',
        '',
        '</Tabs>',
        '',
        '<Wrapper>',
        '',
        "    import Evil from '@site/evil';",
        '',
        '</Wrapper>',
        '',
      ].join('\n'))
      expect('errors' in shellAfterFence).toBe(true)
      if ('errors' in shellAfterFence) {
        expect(shellAfterFence.errors[0].code).toBe('SOURCE_SHELL_FORBIDDEN')
      }

      // Iter 6 Finding 3: JSX fragments <>...</> and nested-brace / template JSX expressions strip cleanly from description
      const fragmentCases: [string, string, string[]][] = [
        ['<><div>Hidden</div></>\n\nReal paragraph.\n', 'Real paragraph.', []],
        ['<>\n\n<Admonition type="note">Inside fragment</Admonition>\n\n</>\n\nReal paragraph.\n', 'Real paragraph.', ['Admonition']],
        ['<>Inline text</>\n\nSecond paragraph.\n', 'Inline text', []],
        ['{(() => { return <Admonition type="note">hi</Admonition>; })()}\n\nReal paragraph.\n', 'Real paragraph.', ['Admonition']],
        ['{`${<Admonition type="note">hi</Admonition>}`}\n\nReal paragraph.\n', 'Real paragraph.', ['Admonition']],
        ['<Details summary={`prefix ${<Admonition type="note">hi</Admonition>} suffix`}>\nbody\n</Details>\n\nReal paragraph.\n', 'Real paragraph.', ['Admonition']],
      ]

      for (const [body, expectedDesc, expectedComponents] of fragmentCases) {
        const res = await assembleLocalizedPage({
          pageId: 'iter7-e2e',
          sourceMd: `# T\n\n${body}`,
          groupVariables: {},
          pageConfig: cfg,
          preprocessAdapter,
          mdxAdapter: localizedMdxAdapter,
        })
        expect('errors' in res, body).toBe(false)
        if (!('errors' in res)) {
          expect(res.description, body).toBe(expectedDesc)
          expect(res.components, body).toEqual(expectedComponents)
        }
      }
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('masks top-level 4-space indented fences, strips JS/template wrappers in description, rejects empty/commented imports, and strips adjacent fragments (Iter 7 Findings 1-4)', async () => {
    const root = tempRoot()
    try {
      const preprocessAdapter = createLocalizedPreprocessAdapter({ groupRoot: root, hasFragmentsDir: false })
      const cfg: PageConfig = { schema_version: 1, mode: 'incremental', en_source: { manual: 'guides', shared_page: 'iter8-e2e' } }

      // Finding 1: top-level 4-space indented fences (backticks and tildes, <4-space body lines)
      const f1Cases = [
        '# T\n\n    ```jsx\n<UI bad />\n    ```\n\nReal paragraph.\n',
        '# T\n\n    ```js\nimport Foo from "@theme/Tabs";\n    ```\n\nReal paragraph.\n',
        '# T\n\n    ```jsx\n<Admonition type="note">Inside fence</Admonition>\n    ```\n\nReal paragraph.\n',
        '# T\n\n    ~~~jsx\n<UI bad />\nimport Foo from "@theme/Tabs";\n<Admonition type="note">Inside fence</Admonition>\n    ~~~\n\nReal paragraph.\n',
      ]
      for (const sourceMd of f1Cases) {
        const res = await assembleLocalizedPage({
          pageId: 'iter8-e2e',
          sourceMd,
          groupVariables: {},
          pageConfig: cfg,
          preprocessAdapter,
          mdxAdapter: localizedMdxAdapter,
        })
        expect('errors' in res, sourceMd).toBe(false)
        if (!('errors' in res)) {
          expect(res.description, sourceMd).toBe('Real paragraph.')
          expect(res.components, sourceMd).toEqual([])
        }
      }

      // Negative check for Finding 1: unmatched 4-space indented fence in Markdown code block still masks indented lines without hiding prose
      const unmatched4Sp = await assembleLocalizedPage({
        pageId: 'iter8-e2e',
        sourceMd: '# T\n\n    ```bash\n    echo example\n\nReal paragraph with <UI>Keep</UI>.\n',
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in unmatched4Sp).toBe(false)
      if (!('errors' in unmatched4Sp)) {
        expect(unmatched4Sp.description).toBe('Real paragraph with Keep.')
        expect(unmatched4Sp.uiTags.map(t => t.text)).toEqual(['Keep'])
      }

      // Finding 2: extractFirstParagraph strips JS/template wrappers around unwrapped JSX inside {...} while preserving prose inline backticks
      const f2Cases: [string, string, string[]][] = [
        ['{(() => { return <UI>Keep</UI>; })()}\n\nReal paragraph.\n', 'Keep', []],
        ['{(() => { return <span>Keep</span>; })()}\n\nReal paragraph.\n', 'Keep', []],
        ['{[<UI>One</UI>, <Admonition type="note">Two</Admonition>]}\n\nReal paragraph.\n', 'One', ['Admonition']],
        ['{a ? (b ? <UI>1</UI> : <Admonition type="note">2</Admonition>) : <Details summary="s">3</Details>}\n\nReal paragraph.\n', '1', ['Admonition']],
        ['{`prefix ${<UI>Keep</UI>} suffix`}\n\nReal paragraph.\n', 'Keep', []],
        ['{true && <><UI>Keep</UI></>}\n\nReal paragraph.\n', 'Keep', []],
        ['{`a ${<UI>1</UI>} b ${<Admonition type="note">2</Admonition>} c`}\n\nReal paragraph.\n', '1', ['Admonition']],
        ['{<p>{true && <UI>Keep</UI>}</p>}\n\nReal paragraph.\n', 'Keep', []],
        ['Use `<UI>foo</UI>` in docs.\n', 'Use `<UI>foo</UI>` in docs.', []],
      ]
      for (const [body, expectedDesc, expectedComponents] of f2Cases) {
        const res = await assembleLocalizedPage({
          pageId: 'iter8-e2e',
          sourceMd: `# T\n\n${body}`,
          groupVariables: {},
          pageConfig: cfg,
          preprocessAdapter,
          mdxAdapter: localizedMdxAdapter,
        })
        expect('errors' in res, body).toBe(false)
        if (!('errors' in res)) {
          expect(res.description, body).toBe(expectedDesc)
          expect(res.components, body).toEqual(expectedComponents)
        }
      }

      // Finding 3: empty and comment-only named imports are rejected with SOURCE_SHELL_FORBIDDEN, while MDX comments stay allowed
      for (const badImport of [
        '# T\n\nimport {} from "@theme/Tabs";\n\nReal paragraph.\n',
        '# T\n\nimport { /* comment */ } from "@theme/Tabs";\n\nReal paragraph.\n',
        '# T\n\nimport {\n  /* multiline */\n} from "@theme/Tabs";\n\nReal paragraph.\n',
      ]) {
        const res = await assembleLocalizedPage({
          pageId: 'iter8-e2e',
          sourceMd: badImport,
          groupVariables: {},
          pageConfig: cfg,
          preprocessAdapter,
          mdxAdapter: localizedMdxAdapter,
        })
        expect('errors' in res, badImport).toBe(true)
        if ('errors' in res) {
          expect(res.errors[0].code, badImport).toBe('SOURCE_SHELL_FORBIDDEN')
        }
      }

      const mdxCommentWithImport = await assembleLocalizedPage({
        pageId: 'iter8-e2e',
        sourceMd: '# T\n\n{/* import Evil from "@site/evil"; */}\n\nReal paragraph.\n',
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in mdxCommentWithImport).toBe(false)
      if (!('errors' in mdxCommentWithImport)) {
        expect(mdxCommentWithImport.description).toBe('Real paragraph.')
      }

      // Finding 4: adjacent JSX fragments foo<>...</>bar strip both <> and </>
      const adjFrag = await assembleLocalizedPage({
        pageId: 'iter8-e2e',
        sourceMd: '# T\n\nfoo<><div>Hidden</div></>bar\n\nReal paragraph.\n',
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in adjFrag).toBe(false)
      if (!('errors' in adjFrag)) {
        expect(adjFrag.description).toBe('foobar')
      }

      const adjFragUi = await assembleLocalizedPage({
        pageId: 'iter8-e2e',
        sourceMd: '# T\n\nfoo<><UI>Keep</UI></>bar\n\nReal paragraph.\n',
        groupVariables: {},
        pageConfig: cfg,
        preprocessAdapter,
        mdxAdapter: localizedMdxAdapter,
      })
      expect('errors' in adjFragUi).toBe(false)
      if (!('errors' in adjFragUi)) {
        expect(adjFragUi.description).toBe('fooKeepbar')
      }
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
