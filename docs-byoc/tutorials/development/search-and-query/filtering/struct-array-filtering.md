---
title: "StructArray Operators | BYOC"
slug: /struct-array-filtering
sidebar_label: "StructArray"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The Array of Structs, or StructArray, stores an ordered set of Struct elements in each entity. Each Struct in the array shares the same predefined schema, which can include scalar sub-fields and vector sub-fields. | BYOC"
type: origin
token: VmGMwsTliiGZdFkzzeBckRNlnCh
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray Operators

The Array of Structs, or StructArray, stores an ordered set of Struct elements in each entity. Each Struct in the array shares the same predefined schema, which can include scalar sub-fields and vector sub-fields.

Use StructArray operators to filter entities by conditions on scalar sub-fields inside the StructArray.

StructArray filtering has two operator families:

<table>
   <tr>
     <th><p>Operator family</p></th>
     <th><p>Result granularity</p></th>
     <th><p>Use case</p></th>
   </tr>
   <tr>
     <td><p><code>element_filter</code></p></td>
     <td><p>Element-level</p></td>
     <td><p>Return matching Struct elements and their <code>offset</code> values.</p></td>
   </tr>
   <tr>
     <td><p><code>MATCH_&ast;</code></p></td>
     <td><p>Row-level</p></td>
     <td><p>Return entities based on how many Struct elements satisfy a predicate.</p></td>
   </tr>
</table>

When building predicates against `$[subField]`, index the sub-field for large-scale datasets when supported, because these operators evaluate predicates across array elements.

## Element Filter\{#element-filter}

Use `element_filter(structField, predicate)` when you need to match individual Struct elements in a StructArray field.

Inside the predicate, use `$[subField]` to refer to a sub-field of the current Struct element.

```plaintext
element_filter(chunks, $[text] LIKE "Red%")
```

This expression matches Struct elements in `chunks` whose `text` sub-field starts with `Red`.

When multiple conditions are used inside the predicate, all `$[subField]` references apply to the same Struct element:

```plaintext
element_filter(chunks, $[score] > 0.8 && $[text] LIKE "Red%")
```

When you combine an entity-level predicate with `element_filter`, place `element_filter` at the end of the expression:

```plaintext
# Correct
id > 0 && element_filter(chunks, $[score] > 0.8)

# Incorrect
element_filter(chunks, $[score] > 0.8) && id > 0
```

`element_filter` can appear only once in a filter expression. Do not nest `element_filter` or `MATCH_*` inside another `element_filter`.

## Match Family Operators\{#match-family-operators}

Use `MATCH_*` operators when the entity should be selected based on how many Struct elements satisfy a predicate. Match family operators are row-level filters and do not return element `offset` values.

<table>
   <tr>
     <th><p>Operator</p></th>
     <th><p>Meaning</p></th>
   </tr>
   <tr>
     <td><p><code>MATCH_ANY(field, predicate)</code></p></td>
     <td><p>At least one Struct element satisfies the predicate.</p></td>
   </tr>
   <tr>
     <td><p><code>MATCH_ALL(field, predicate)</code></p></td>
     <td><p>All Struct elements satisfy the predicate.</p></td>
   </tr>
   <tr>
     <td><p><code>MATCH_LEAST(field, predicate, threshold=N)</code></p></td>
     <td><p>At least <code>N</code> Struct elements satisfy the predicate.</p></td>
   </tr>
   <tr>
     <td><p><code>MATCH_MOST(field, predicate, threshold=N)</code></p></td>
     <td><p>At most <code>N</code> Struct elements satisfy the predicate.</p></td>
   </tr>
   <tr>
     <td><p><code>MATCH_EXACT(field, predicate, threshold=N)</code></p></td>
     <td><p>Exactly <code>N</code> Struct elements satisfy the predicate.</p></td>
   </tr>
</table>

`MATCH_ANY` and `element_filter` can both express that at least one Struct element satisfies a predicate. Use `MATCH_ANY` when you only need row-level filtering. Use `element_filter` when you need element-level results or need to constrain which Struct elements participate in element-level vector search.

### MATCH_ANY\{#matchany}

`MATCH_ANY` evaluates to `true` if at least one element in the array satisfies the predicate.

```plaintext
MATCH_ANY(chunks, $[text] LIKE "Red%")
```

### MATCH_ALL\{#matchall}

`MATCH_ALL` evaluates to `true` if every element in the array satisfies the predicate.

```plaintext
MATCH_ALL(chunks, $[text] LIKE "Red%")
```

For an empty StructArray, `MATCH_ALL` returns `true`.

### MATCH_LEAST\{#matchleast}

`MATCH_LEAST` evaluates to `true` if the number of elements satisfying the predicate is greater than or equal to `threshold`.

```plaintext
MATCH_LEAST(chunks, $[text] LIKE "Red%", threshold=3)
```

For `MATCH_LEAST`, `threshold` must be a positive integer.

### MATCH_MOST\{#matchmost}

`MATCH_MOST` evaluates to `true` if the number of elements satisfying the predicate is less than or equal to `threshold`.

```plaintext
MATCH_MOST(chunks, $[text] LIKE "Red%", threshold=3)
```

For `MATCH_MOST`, `threshold` can be zero or a positive integer.

### MATCH_EXACT\{#matchexact}

`MATCH_EXACT` evaluates to `true` if the number of elements satisfying the predicate is exactly equal to `threshold`.

```plaintext
MATCH_EXACT(chunks, $[text] LIKE "Red%", threshold=3)
```

For `MATCH_EXACT`, `threshold` can be zero or a positive integer.

## Syntax Rules\{#syntax-rules}

- `MATCH_*` names are case-insensitive.

- `$[subField]` can be used only inside `element_filter` or `MATCH_*` predicates.

- Do not nest `element_filter` or `MATCH_*` inside a `MATCH_*` predicate.

- `MATCH_ALL` on an empty StructArray returns `true`.

- `MATCH_ANY` on an empty StructArray returns `false`.

## See Also\{#see-also}

- [Search with StructArray](./search-with-structarray)

