# Code variants in Lark documents

Use comment directives for target-specific content inside code blocks. The directive must occupy its entire physical line and should use the same indentation as the code it controls. The generated code removes the complete directive line.

## One line

```python
params={
    # include-next-line zilliz
    "integration_id": "YOUR_INTEGRATION_ID",
    # include-next-line milvus
    "credential": "YOUR_API_KEY",
}
```

## A region

```javascript
client.search({
    collectionName: 'docs',
    // include-start zilliz
    projectId: 'YOUR_PROJECT_ID',
    regionId: 'YOUR_REGION_ID',
    // include-end
    limit: 10,
})
```

Available directive bodies are `include-next-line TARGET`, `exclude-next-line TARGET`, `include-start TARGET`, `include-end`, `exclude-start TARGET`, and `exclude-end`.

Use `#`, `//`, `/* ... */`, `<!-- ... -->`, or `{/* ... */}` according to the example language. The parser accepts `zilliz`, `saas`, `paas`, and `milvus` through the existing dot-separated target matching rule.

Intentional blank lines remain unchanged. Directive lines and excluded lines are removed completely, so do not add blank spacer lines merely to compensate for a directive.

Existing `<include target="..."></include>` and `<exclude target="..."></exclude>` code variants remain supported for compatibility. Do not add new HTML-like tags inside code blocks; migrate authoritative Lark examples to comment directives when editing them. HTML-like tags remain appropriate for inline filtering in prose.

## Release-channel variants (CURRENT / NEXT)

Code lines can be staged for the NEXT release channel with their own directive
namespace: `next-channel-*` lines render only on next deployments (UAT-style
previews) and `current-channel-*` lines only on current deployments
(production). Directives must occupy their entire physical line and accept the
same five comment styles as the product directives:

```python
client = MilvusClient(url)

# current-channel-start
client.using_legacy_auth()
# current-channel-end
# next-channel-start
client.using_serverless_auth()
# next-channel-end

# next-channel-next-line
client.flush()
```

Available directive bodies are `next-channel-next-line`,
`next-channel-start`, `next-channel-end`, `current-channel-next-line`,
`current-channel-start`, and `current-channel-end`. Unlike the product
directives above, these are **not** resolved at Fetch time: both variants ship
in the shared build and the code renderer filters them per deployment channel
(directive lines never render and never copy). Ungated lines are visible on
both channels. To gate an entire code example, prefer wrapping the whole
fenced block in `<NextChannel action="include">...</NextChannel>` instead of
directives. Product targets and channel directives compose: the product filter
runs at Fetch time, the channel filter at render time. `include`/`exclude`
directives with the reserved targets `next` or `current` are rejected with
repair guidance, as are unbalanced, nested, or mismatched channel directives.
