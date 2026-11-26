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
})
