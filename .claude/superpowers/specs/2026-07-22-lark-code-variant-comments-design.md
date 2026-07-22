# Lark Code Variant Comments Design

## Summary

The `lark-docs` writer currently applies `<include target="..."></include>` and `<exclude target="..."></exclude>` after code blocks have been converted to fenced Markdown. Removing standalone tag lines leaves their newlines behind, which creates blank or whitespace-only lines inside generated code samples. The prose cleanup that collapses three or more newlines cannot be reused inside code fences because code whitespace is significant and intentional blank lines must remain unchanged.

Add a code-specific variant preprocessor that runs on raw code text before tab construction and fenced-code generation. New code examples should use indented, Docusaurus-style magic comments. Existing HTML-like tags remain supported for compatibility.

## Goals

- Add comment directives for selecting single code lines and code regions by publication target.
- Remove each directive as a complete physical line, including its terminating newline.
- Remove excluded code lines without leaving blank or whitespace-only lines.
- Preserve the original indentation and contents of retained code lines exactly.
- Preserve intentional blank lines that were present in active code.
- Continue supporting existing `<include>` and `<exclude>` tags inside code blocks.
- Leave prose filtering and its final Markdown newline normalization unchanged.
- Fail with actionable diagnostics for malformed new comment directives.

## Non-goals

- Do not change prose `<include>` or `<exclude>` semantics.
- Do not apply general blank-line collapsing inside fenced code.
- Do not modify Docusaurus Prism `magicComments` configuration. The syntax is inspired by Docusaurus, but target selection happens in `lark-docs` before Markdown is written.
- Do not require a bulk migration of existing Lark source snapshots.
- Do not add Boolean target expressions, comma-separated target lists, or `else` directives.

## Preferred authoring syntax

The directive must occupy the whole source line except for indentation and the language-appropriate comment wrapper.

### Next line

```python
params={
    "provider": "openai",
    # include-next-line zilliz
    "integration_id": "YOUR_INTEGRATION_ID",
    # include-next-line milvus
    "credential": "YOUR_API_KEY",
}
```

```javascript
await client.search({
    collectionName: 'docs',
    // exclude-next-line paas
    serverlessOnly: true,
    limit: 10,
})
```

### Region

```python
client.search(
    collection_name="docs",
    # include-start zilliz
    project_id="YOUR_PROJECT_ID",
    region_id="YOUR_REGION_ID",
    # include-end
    limit=10,
)
```

```java
Function.builder()
        .param("provider", "openai")
        // exclude-start milvus
        .param("integration_id", "YOUR_INTEGRATION_ID")
        // exclude-end
        .build();
```

Supported comment wrappers are:

- `# directive` for Python, Bash, Shell, YAML, and similar languages.
- `// directive` for JavaScript, TypeScript, Java, Go, C, C++, C#, and similar languages.
- `/* directive */` for C-style block-comment syntax used on one physical line.
- `<!-- directive -->` for HTML and XML.
- `{/* directive */}` for JSX-style examples.

## Directive semantics

Supported directive bodies are:

- `include-next-line TARGET`
- `exclude-next-line TARGET`
- `include-start TARGET`
- `include-end`
- `exclude-start TARGET`
- `exclude-end`

Targets use the existing matching rule. The active publication target is split on `.`, so `zilliz.saas` matches both `zilliz` and `saas`, and `zilliz.paas` matches both `zilliz` and `paas`.

`next-line` applies to the immediately following physical source line. The directive line itself is always removed. A start directive pushes an active or inactive region onto a stack; its corresponding end directive pops it. Nested regions are supported when end directives match the opening directive type.

Directive indentation is author-facing structure. Authors should indent directives to the same level as the lines they control. The parser removes the entire directive line and does not transfer, normalize, or infer indentation from it.

## Whitespace contract

The preprocessor works line by line before the code is fenced:

- Retained non-directive lines are emitted byte-for-byte except for legacy inline HTML tags that are removed.
- Directive lines are omitted completely, including their newline.
- Lines in inactive regions are omitted completely, including their newline.
- A legacy-tag line that becomes whitespace-only because its selected content was removed is omitted completely.
- An originally blank line in an active region is retained.
- No general `\n{3,}` or whitespace-only-line cleanup is applied to the remaining code.

For example, the Zilliz rendering of:

```python
params={
    "provider": "openai",
    # include-next-line zilliz
    "integration_id": "YOUR_INTEGRATION_ID",
    # include-next-line milvus
    "credential": "YOUR_API_KEY",

    "dim": "1536",
}
```

is:

```python
params={
    "provider": "openai",
    "integration_id": "YOUR_INTEGRATION_ID",

    "dim": "1536",
}
```

The intentional blank line before `dim` remains, while directive and excluded parameter lines leave no gaps.

## Legacy compatibility

Existing code snapshots contain both standalone and inline HTML-like variants. The new preprocessor must continue supporting examples such as:

```python
params={
<include target="zilliz">
    "integration_id": "YOUR_INTEGRATION_ID",
</include>
<include target="milvus">
    "credential": "YOUR_API_KEY",
</include>
}
```

and:

```python
search_params = {
    <include target="zilliz">'params': {'level': 10},</include>
}
```

Standalone legacy tag lines, excluded region lines, and inline lines rendered whitespace-only must be omitted. Mixed inline prose-like fragments inside a code line retain the existing substring behavior.

Legacy support allows current snapshots to render correctly immediately. Authoring guidance should mark comment directives as preferred and HTML-like code tags as compatibility-only. Migration of authoritative Lark documents can happen incrementally.

## Architecture

Create `plugins/lark-docs/codeVariantFilter.js` as a pure module with one public function:

```javascript
filterCodeVariants(content, targets)
```

The module has two internal passes:

1. A comment-directive pass that recognizes whole-line magic comments, applies `next-line` and nested region semantics, and removes directive and inactive lines.
2. A legacy-tag pass that preserves existing `<include>` and `<exclude>` behavior while tracking whether a physical line became empty because of filtering.

`larkDocWriter.__code()` calls the helper after text elements are assembled and the language is determined, but before `__code_block_split()`. This ensures all code-tab and fence paths receive already-filtered code and prevents the later page-level `__filter_content()` call from seeing code-specific directives.

The generic `__filter_content()` remains unchanged for headings, tables, callouts, prose, and final page rendering.

## Diagnostics

New comment directives throw an error with a one-based source line number when:

- `include-start` or `exclude-start` has no target.
- `include-next-line` or `exclude-next-line` has no target.
- An end directive does not match the current region type.
- A start directive reaches the end of the code block without a matching end.
- A next-line directive appears on the final source line.

Text that merely contains directive words is ignored unless it matches a supported comment wrapper and occupies the complete physical line.

Legacy HTML handling should retain its current compatibility posture. Well-formed tags are filtered; malformed legacy tags are not broadened into a new syntax and should continue to surface through existing writer behavior or explicit warnings.

## Testing

Add focused `node:test` coverage for the pure module:

- Indented `#`, `//`, `/* */`, `<!-- -->`, and JSX directive wrappers.
- Included and excluded `next-line` parameters.
- Included and excluded multi-line regions.
- Nested regions and composite target matching.
- Complete removal of directive lines and excluded lines.
- Preservation of intentional blank lines and retained indentation.
- Rejection of malformed or mismatched comment directives.
- Existing standalone legacy HTML tags.
- Existing inline legacy HTML tags, including a whole parameter line that becomes whitespace-only.

Add writer integration coverage proving that filtered code reaches `createFencedCodeBlock()` without extra blank lines and that code tabs still render correctly.

Run the existing lark-docs writer and regression suites after the focused tests.

## Documentation and migration

Add `plugins/lark-docs/CODE_VARIANTS.md` documenting:

- Preferred comment directive syntax.
- Supported comment wrappers.
- Indentation and whole-line requirements.
- Target matching for `zilliz.saas` and `zilliz.paas`.
- Legacy HTML compatibility and the recommendation not to add new HTML-like tags inside code.

Do not mechanically rewrite cached source JSON. Those files reflect authoritative Lark content and can be regenerated. Migrate examples in Lark incrementally, using the 34 standalone parameter-oriented code blocks found during the audit as the initial candidate set.

## Downstream compatibility

`zdoc_cn` contains the same lark-docs filtering path. The implementation should be portable as the new pure module plus the narrow writer import/call-site change. Downstream validation should compare the corresponding plugin files, run the focused tests after synchronization, and spot-check translated/generated code samples to ensure retained intentional blank lines are unchanged.
