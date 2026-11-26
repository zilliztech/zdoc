// @vitest-environment node
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
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
})
