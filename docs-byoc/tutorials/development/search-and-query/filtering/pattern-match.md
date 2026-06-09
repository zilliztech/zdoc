---
title: "Pattern Matching | BYOC"
slug: /pattern-match
sidebar_label: "Pattern Matching"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In agentic search applications, vector search and grep-style pattern matching often complement each other. Vector search retrieves entities that are semantically relevant, while pattern matching narrows those results by exact string structures, such as error codes, log prefixes, email domains, URL paths, or identifiers. | BYOC"
type: origin
token: PFbNwB7Mli18n6k6VWScGcpWndc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Pattern Matching

In agentic search applications, vector search and grep-style pattern matching often complement each other. Vector search retrieves entities that are semantically relevant, while pattern matching narrows those results by exact string structures, such as error codes, log prefixes, email domains, URL paths, or identifiers.

In Zilliz Cloud, you can express these pattern constraints in scalar filters with `LIKE` for simple wildcard matching, and `=~` or `!~` for [RE2](https://github.com/google/re2/wiki/syntax) regular expressions. You can combine these filters with `query`, `search`, or hybrid search.

Pattern matching expressions are written in the `filter` parameter. For example, the following query matches log messages that contain an error code such as `E1001`:

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

res = client.query(
    collection_name="log_events",
    # highlight-next-line
    filter='message =~ "E[0-9]{4}"',
    output_fields=["message", "severity"],
)
```

The examples on this page focus on the expression assigned to `filter`. You can use the same filter expression syntax in Zilliz Cloud operations that accept a scalar filter, such as `query`, `search`, and hybrid search.

## Supported field types\{#supported-field-types}

Pattern matching is available for string values.

<table>
   <tr>
     <th><p>Target</p></th>
     <th><p><code>LIKE</code></p></th>
     <th><p>Regex <code>=&#126;</code> / <code>!&#126;</code></p></th>
     <th><p>Notes</p></th>
   </tr>
   <tr>
     <td><p><code>VARCHAR</code> field</p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
     <td><p>Typical target for pattern matching on string fields.</p></td>
   </tr>
   <tr>
     <td><p><code>JSON</code> path with <code>VARCHAR</code> cast type</p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
     <td><p>The JSON path value must be a string for positive matches. If you create an index on the JSON path for acceleration, set <code>json_cast_type="varchar"</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>ARRAY&lt;VARCHAR&gt;</code> element</p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
     <td><p>Match a specific element by index, such as <code>tags[0]</code>. Pattern matching does <strong>not</strong> scan all elements; it only applies to the element at the specified index.</p></td>
   </tr>
   <tr>
     <td><p>Numeric, Boolean, vector, <code>TEXT</code>, or other non-<code>VARCHAR</code> targets</p></td>
     <td><p>No</p></td>
     <td><p>No</p></td>
     <td><p>Pattern matching is available only for <code>VARCHAR</code> values, JSON paths that resolve to strings, or indexed <code>ARRAY&lt;VARCHAR&gt;</code> elements.</p></td>
   </tr>
</table>

## Choose LIKE or regex\{#choose-like-or-regex}

Choose the simplest operator that expresses the pattern you need.

If you need an exact string match, we recommend you use `==` instead of pattern matching. Use `LIKE` or regex only when the filter needs to match a pattern.

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Recommended operator</p></th>
     <th><p>Example</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Exact string equality</p></td>
     <td><p><code>==</code></p></td>
     <td><p><code>status == "active"</code></p></td>
     <td><p>Exact match of the string <code>active</code>.</p></td>
   </tr>
   <tr>
     <td><p>Simple prefix match</p></td>
     <td><p><code>LIKE</code></p></td>
     <td><p><code>name LIKE "Prod%"</code></p></td>
     <td><p>Matches strings that start with <code>Prod</code>.</p></td>
   </tr>
   <tr>
     <td><p>Simple suffix match</p></td>
     <td><p><code>LIKE</code></p></td>
     <td><p><code>filename LIKE "%.json"</code></p></td>
     <td><p>Matches strings that end with <code>.json</code>.</p></td>
   </tr>
   <tr>
     <td><p>Simple contains match</p></td>
     <td><p><code>LIKE</code></p></td>
     <td><p><code>description LIKE "%vector database%"</code></p></td>
     <td><p>Matches values that contain <code>vector database</code> anywhere in the string.</p></td>
   </tr>
   <tr>
     <td><p>Match a structured code or fixed-length pattern</p></td>
     <td><p><code>=&#126;</code></p></td>
     <td><p><code>code =&#126; "E[0-9]\{4\}"</code></p></td>
     <td><p>Matches strings that case-sensitively contain <code>E</code> followed by four digits, such as <code>E1001</code>.</p></td>
   </tr>
   <tr>
     <td><p>Case-insensitive pattern matching</p></td>
     <td><p><code>=&#126;</code> with <code>(?i)</code></p></td>
     <td><p><code>message =&#126; "(?i)error"</code></p></td>
     <td><p>Matches <code>error</code>, <code>ERROR</code>, or other case variants.</p></td>
   </tr>
   <tr>
     <td><p>Exclude values that match a regex pattern</p></td>
     <td><p><code>!&#126;</code></p></td>
     <td><p><code>message !&#126; "^DEBUG"</code></p></td>
     <td><p>Excludes strings that start with <code>DEBUG</code>.</p></td>
   </tr>
</table>

Use `LIKE` for simple wildcard matching. Use regex when the pattern needs character classes, repetition, alternation such as `error|failed`, anchors, or case-insensitive matching.

## Use LIKE\{#use-like}

The `LIKE` operator is for simple wildcard matching on string values. It supports only the following wildcards:

<table>
   <tr>
     <th><p>Wildcard</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>%</code></p></td>
     <td><p>Matches zero or more characters.</p></td>
   </tr>
   <tr>
     <td><p><code>_</code></p></td>
     <td><p>Matches exactly one character.</p></td>
   </tr>
</table>

### Common LIKE patterns\{#common-like-patterns}

Use the position of `%` and `_` to control where the fixed text appears in the matched string.

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Pattern</p></th>
     <th><p>Filter example</p></th>
   </tr>
   <tr>
     <td><p>Starts with a prefix</p></td>
     <td><p><code>Prod%</code></p></td>
     <td><p><code>filter = 'name LIKE "Prod%"'</code></p></td>
   </tr>
   <tr>
     <td><p>Ends with a suffix</p></td>
     <td><p><code>%.json</code></p></td>
     <td><p><code>filter = 'filename LIKE "%.json"'</code></p></td>
   </tr>
   <tr>
     <td><p>Contains a substring</p></td>
     <td><p><code>%vector%</code></p></td>
     <td><p><code>filter = 'description LIKE "%vector%"'</code></p></td>
   </tr>
   <tr>
     <td><p>Matches one character at a fixed position</p></td>
     <td><p><code>AB_%</code></p></td>
     <td><p><code>filter = 'code LIKE "AB_%"'</code></p></td>
   </tr>
</table>

### LIKE matching behavior\{#like-matching-behavior}

Use `LIKE` for prefix, suffix, contains, and fixed-position single-character matches. `LIKE` does not support character classes such as `[0-9]`, alternation such as `error|failed`, repeat counts such as `{4}`, anchors such as `^` or `$`, or case-insensitive flags such as `(?i)`. Use regex for those patterns.

Use `==` for exact full-string equality. Use `LIKE` only when the filter needs wildcard matching.

## Use regex\{#use-regex}

Use regex filters when the pattern requires regular expression features such as character classes, repetition, alternation, anchors, or case-insensitive matching. Zilliz Cloud applies an [RE2](https://github.com/google/re2/wiki/syntax) regular expression to a string value.

The right side of `=~` or `!~` must be a string literal.

<table>
   <tr>
     <th><p>Operator</p></th>
     <th><p>Meaning</p></th>
     <th><p>Example</p></th>
   </tr>
   <tr>
     <td><p><code>=&#126;</code></p></td>
     <td><p>Matches values that satisfy the regex pattern.</p></td>
     <td><p><code>filter = 'message =&#126; "E[0-9]\{4\}"'</code></p></td>
   </tr>
   <tr>
     <td><p><code>!&#126;</code></p></td>
     <td><p>Excludes values that satisfy the regex pattern.</p></td>
     <td><p><code>filter = 'message !&#126; "^DEBUG"'</code></p></td>
   </tr>
</table>

### Common regex patterns\{#common-regex-patterns}

The following examples use common RE2 syntax in Zilliz Cloud filter expressions. For complete regex syntax, refer to the [RE2 syntax](https://github.com/google/re2/wiki/syntax) reference.

<table>
   <tr>
     <th><p>Requirement</p></th>
     <th><p>Pattern</p></th>
     <th><p>Filter example</p></th>
   </tr>
   <tr>
     <td><p>Contains literal text</p></td>
     <td><p><code>error</code></p></td>
     <td><p><code>filter = 'message =&#126; "error"'</code></p></td>
   </tr>
   <tr>
     <td><p>Starts with a prefix</p></td>
     <td><p><code>^ERR</code></p></td>
     <td><p><code>filter = 'code =&#126; "^ERR"'</code></p></td>
   </tr>
   <tr>
     <td><p>Ends with a suffix</p></td>
     <td><p><code>\.json$</code></p></td>
     <td><p><code>filter = 'filename =&#126; "\\.json$"'</code></p></td>
   </tr>
   <tr>
     <td><p>Matches a digit sequence</p></td>
     <td><p><code>[0-9]+</code></p></td>
     <td><p><code>filter = 'message =&#126; "[0-9]+"'</code></p></td>
   </tr>
   <tr>
     <td><p>Matches a fixed number of digits</p></td>
     <td><p><code>[0-9]\{4\}</code></p></td>
     <td><p><code>filter = 'code =&#126; "[0-9]\{4\}"'</code></p></td>
   </tr>
   <tr>
     <td><p>Matches an email domain</p></td>
     <td><p><code>@example\.com$</code></p></td>
     <td><p><code>filter = 'email =&#126; "@example\\.com$"'</code></p></td>
   </tr>
   <tr>
     <td><p>Matches case-insensitively</p></td>
     <td><p><code>(?i)error</code></p></td>
     <td><p><code>filter = 'message =&#126; "(?i)error"'</code></p></td>
   </tr>
   <tr>
     <td><p>Matches the full string</p></td>
     <td><p><code>^prod-[0-9]+$</code></p></td>
     <td><p><code>filter = 'name =&#126; "^prod-[0-9]+$"'</code></p></td>
   </tr>
</table>

To match one of several words, use alternation with `|`:

```python
filter = 'message =~ "error|failed|timeout"'
```

When matching regex metacharacters literally, escape them in the regex pattern. For example, to match a literal dot (`\.` in regex), write `\\.` in a Python filter string:

```python
filter = 'email =~ "@gmail\\.com$"'
```

Note: Zilliz Cloud regex filters follow RE2 syntax. If a regex pattern uses syntax that RE2 does not support or is otherwise invalid, Zilliz Cloud rejects the filter expression. For details about regex metacharacters, flags, and matching behavior, refer to the [RE2 syntax](https://github.com/google/re2/wiki/syntax) reference.

### Matching behavior\{#matching-behavior}

**Substring matching**

Zilliz Cloud regex matching uses substring semantics. The pattern does not need to match the entire field value. For example, the following filter matches both `E1001` and `failed with E1001 after retry`:

```python
filter = 'message =~ "E[0-9]{4}"'
```

To match the entire field value, use the `^` and `$` anchors:

```python
# Match only values that are exactly E followed by four digits
filter = 'code =~ "^E[0-9]{4}$"'
```

**Nullable VARCHAR fields**

Regex filters do not match null values. This applies to both `=~` and `!~`. If you want to exclude a regex pattern but keep null values, explicitly add `OR field IS NULL`:

```python
filter = 'message !~ "^DEBUG" OR message IS NULL'
```

**JSON paths**

For JSON paths, regex filters behave differently when the path is missing, null, or resolves to a non-string value:

<table>
   <tr>
     <th><p>Filter</p></th>
     <th><p>Includes missing/null/non-string values?</p></th>
     <th><p>Notes</p></th>
   </tr>
   <tr>
     <td><p><code>json_field["path"] =&#126; "pattern"</code></p></td>
     <td><p>No</p></td>
     <td><p>Matches only string values that satisfy the regex pattern.</p></td>
   </tr>
   <tr>
     <td><p><code>json_field["path"] !&#126; "pattern"</code></p></td>
     <td><p>Yes</p></td>
     <td><p>Returns entities where the path is missing, null, non-string, or a string that does not match the regex pattern.</p></td>
   </tr>
</table>

## Accelerate pattern matching with indexes\{#accelerate-pattern-matching-with-indexes}

Zilliz Cloud supports several index types on string fields that can be used together with `LIKE` and regex filters on `VARCHAR` fields or JSON string paths, such as `NGRAM`, `STL_SORT`, `INVERTED`, and `BITMAP`. Pattern matching can work without an index, but an index can improve performance on large datasets.

Index effectiveness depends on the pattern expression, whether Zilliz Cloud can extract fixed literal substrings, and the cardinality and distribution of the target field. Prefix-style patterns such as `name LIKE "Prod%"` may benefit from different index strategies than infix or suffix patterns such as `description LIKE "%vector%"` or `filename LIKE "%.json"`.

Use the following table as a starting point, then benchmark with your own workload:

<table>
   <tr>
     <th><p>Pattern or data characteristic</p></th>
     <th><p>Index to consider</p></th>
     <th><p>Notes</p></th>
   </tr>
   <tr>
     <td><p>Contains fixed literal substrings, such as <code>message =&#126; "error.&ast;timeout"</code> or <code>message LIKE "%database%"</code></p></td>
     <td><p><code>NGRAM</code></p></td>
     <td><p>Helps when Zilliz Cloud can extract meaningful literal substrings from the pattern. For details, refer to <a href="./ngram-index-type">NGRAM</a>.</p></td>
   </tr>
   <tr>
     <td><p>Prefix, exact, or equality-like string filters, especially on fields with low to moderate cardinality</p></td>
     <td><p><code>STL_SORT</code>, <code>INVERTED</code>, or <code>BITMAP</code></p></td>
     <td><p>May be more effective when the field has repeated values or when the filter is close to exact matching. For details, refer to <a href="./slt-sort-index-type">STL_SORT</a>, <a href="./inverted-index-type">INVERTED</a>, and <a href="./bitmap-index-type">BITMAP</a>.</p></td>
   </tr>
   <tr>
     <td><p>Regex patterns without fixed literals, or patterns dominated by character classes, short tokens, or wildcards</p></td>
     <td><p>Benchmark before relying on index acceleration</p></td>
     <td><p>These patterns may provide limited index selectivity and can fall back to broader scans.</p></td>
   </tr>
</table>
