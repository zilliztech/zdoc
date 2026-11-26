// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { stripEnShell } from '../core/strip-en.ts'
import { DELETE_ENTITIES_EN_MDX, GET_AND_SCALAR_QUERY_EN_MDX } from './fixtures/en-samples.ts'

describe('stripEnShell', () => {
  it('strips generated front matter and top-level imports from delete-entities EN MDX while keeping body, <NextChannel>, <UI>, and fenced code intact', () => {
    const res = stripEnShell(DELETE_ENTITIES_EN_MDX)
    expect('errors' in res).toBe(false)
    if ('errors' in res) return

    expect(res.title).toBe('Delete Entities')
    expect(res.rawTitle).toBe('Delete Entities | Cloud')
    expect(res.description).toBe(
      'You can delete the entities that are no longer needed by filtering conditions or their primary keys.',
    )
    expect(res.rawDescription).toBe(
      'You can delete the entities that are no longer needed by filtering conditions or their primary keys. | Cloud',
    )
    expect(res.strippedFrontMatterKeys).toEqual([
      'slug',
      'sidebar_label',
      'beta',
      'added_since',
      'last_modified',
      'deprecate_since',
      'notebook',
      'type',
      'token',
      'sidebar_position',
      'displayed_sidebar',
      'custom_edit_url',
    ])
    expect(res.strippedImports).toEqual([
      "import Admonition from '@theme/Admonition';",
      "import Tabs from '@theme/Tabs';",
      "import TabItem from '@theme/TabItem';",
    ])
    expect(res.body.startsWith('# Delete Entities\n')).toBe(true)
    expect(res.body).toContain('<UI>Delete</UI>')
    expect(res.body).toContain('<NextChannel action="include">')
    expect(res.body).toContain('<UI>Query Explorer</UI>')
    expect(res.body).toContain('## Delete Entities by Filtering Conditions\\{#delete-entities-by-filtering-conditions}')
    expect(res.body).toContain('# next-channel-next-line')
    expect(res.body).toContain('import io.milvus.v2.client.ConnectConfig;')
    expect(res.sha256).toMatch(/^[a-f0-9]{64}$/)

    // Deterministic output on repeated calls and CRLF input
    const crlf = stripEnShell('\uFEFF' + DELETE_ENTITIES_EN_MDX.replace(/\n/g, '\r\n'))
    expect('errors' in crlf).toBe(false)
    if (!('errors' in crlf)) {
      expect(crlf.sha256).toBe(res.sha256)
      expect(crlf.body).toBe(res.body)
    }
  })

  it('strips BYOC suffix, channel/sidebar_custom_props, and preserves tables and fenced import examples in get-and-scalar-query EN MDX', () => {
    const res = stripEnShell(GET_AND_SCALAR_QUERY_EN_MDX)
    expect('errors' in res).toBe(false)
    if ('errors' in res) return

    expect(res.title).toBe('Query')
    expect(res.rawTitle).toBe('Query | Cloud')
    expect(res.description).toBe(
      'In addition to ANN searches, Zilliz Cloud also supports metadata filtering through queries.',
    )
    expect(res.rawDescription).toBe(
      'In addition to ANN searches, Zilliz Cloud also supports metadata filtering through queries. | BYOC',
    )
    expect(res.strippedFrontMatterKeys).toContain('channel')
    expect(res.strippedFrontMatterKeys).toContain('sidebar_custom_props')
    expect(res.strippedImports).toContain("import Supademo from '@site/src/components/Supademo';")
    expect(res.body).toContain('<table>')
    expect(res.body).toContain("import Tabs from '@theme/Tabs';\n// Example import inside a fenced code block")
  })

  it('returns EN_SHELL_INVALID on unclosed YAML front matter', () => {
    const res = stripEnShell('---\ntitle: "Broken"\n# Missing closing delimiter\n')
    expect('errors' in res).toBe(true)
    if ('errors' in res) {
      expect(res.errors[0].code).toBe('EN_SHELL_INVALID')
    }
  })

  it('strips multiline and trailing-comment Docusaurus imports without touching fenced or body imports', () => {
    const mdx = `---
title: "Multiline Imports | Cloud"
---

import {
  Something,
  Other as Alias,
} from '@site/src/components/Something'; // trailing line comment

import Foo, {
  Bar /* inline comment */
} from '@theme/Foo' /* trailing block comment */

# Test

import Tabs from '@theme/Tabs';

\`\`\`tsx
import {
  FencedThing
} from '@site/src/components/FencedThing';
\`\`\`
`
    const res = stripEnShell(mdx)
    expect('errors' in res).toBe(false)
    if ('errors' in res) return

    expect(res.strippedImports).toHaveLength(2)
    expect(res.strippedImports[0]).toContain("from '@site/src/components/Something'")
    expect(res.strippedImports[1]).toContain("from '@theme/Foo'")
    expect(res.body.startsWith('# Test\n')).toBe(true)
    expect(res.body).toContain("import Tabs from '@theme/Tabs';")
    expect(res.body).toContain("from '@site/src/components/FencedThing';")
  })

  it('does not strip a leading fenced code block containing a Docusaurus import', () => {
    const mdx = `---
title: "Fence First | Cloud"
---

\`\`\`tsx
import {
  Tabs
} from '@theme/Tabs';
\`\`\`

# Heading
`
    const res = stripEnShell(mdx)
    expect('errors' in res).toBe(false)
    if ('errors' in res) return

    expect(res.strippedImports).toEqual([])
    expect(res.body.startsWith('```tsx\n')).toBe(true)
    expect(res.body).toContain("from '@theme/Tabs';")
  })

  it('strips ES2022 string-literal specifiers, blank-line-separated from clauses, and multiple imports on one line while preserving 4-space indented code blocks', () => {
    const sameLineMultiple = stripEnShell(
      "---\ntitle: \"T\"\n---\n\nimport A from '@theme/Tabs'; import B from '@theme/Admonition';\n\n# T\n",
    )
    expect('errors' in sameLineMultiple).toBe(false)
    if (!('errors' in sameLineMultiple)) {
      expect(sameLineMultiple.strippedImports).toEqual([
        "import A from '@theme/Tabs';",
        "import B from '@theme/Admonition';",
      ])
      expect(sameLineMultiple.body).toBe('# T\n')
    }

    const es2022AndBlankLine = stripEnShell(
      "---\ntitle: \"T\"\n---\n\nimport { \"a}b\" as Foo } from '@theme/Tabs';\nimport TabItem\n\nfrom '@theme/TabItem';\n\n# T\n",
    )
    expect('errors' in es2022AndBlankLine).toBe(false)
    if (!('errors' in es2022AndBlankLine)) {
      expect(es2022AndBlankLine.strippedImports).toEqual([
        "import { \"a}b\" as Foo } from '@theme/Tabs';",
        "import TabItem\n\nfrom '@theme/TabItem';",
      ])
      expect(es2022AndBlankLine.body).toBe('# T\n')
    }

    const indentedCodeBlock = stripEnShell("---\ntitle: \"T\"\n---\n\n    import X from '@site/x';\n")
    expect('errors' in indentedCodeBlock).toBe(false)
    if (!('errors' in indentedCodeBlock)) {
      expect(indentedCodeBlock.strippedImports).toEqual([])
      expect(indentedCodeBlock.body).toBe("    import X from '@site/x';\n")
    }

    const tabIndentedCodeBlock = stripEnShell("---\ntitle: \"T\"\n---\n\n\timport X from '@site/x';\n")
    expect('errors' in tabIndentedCodeBlock).toBe(false)
    if (!('errors' in tabIndentedCodeBlock)) {
      expect(tabIndentedCodeBlock.strippedImports).toEqual([])
      expect(tabIndentedCodeBlock.body).toBe("\timport X from '@site/x';\n")
    }

    const commentBetweenSameLineImports = stripEnShell(
      "---\ntitle: \"T\"\n---\n\nimport A from '@theme/Tabs'; /* c */ import B from '@theme/Admonition';\n\n# T\n",
    )
    expect('errors' in commentBetweenSameLineImports).toBe(false)
    if (!('errors' in commentBetweenSameLineImports)) {
      expect(commentBetweenSameLineImports.strippedImports).toEqual([
        "import A from '@theme/Tabs';",
        "import B from '@theme/Admonition';",
      ])
      expect(commentBetweenSameLineImports.body).toBe('# T\n')
    }

    const leadingBlockCommentNotImport = stripEnShell(
      "---\ntitle: \"T\"\n---\n\n/* c */ import X from '@theme/Tabs';\n\n# T\n",
    )
    expect('errors' in leadingBlockCommentNotImport).toBe(false)
    if (!('errors' in leadingBlockCommentNotImport)) {
      expect(leadingBlockCommentNotImport.strippedImports).toEqual([])
      expect(leadingBlockCommentNotImport.body).toBe("/* c */ import X from '@theme/Tabs';\n\n# T\n")
    }
  })
})
