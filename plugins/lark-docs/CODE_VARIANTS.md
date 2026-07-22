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
