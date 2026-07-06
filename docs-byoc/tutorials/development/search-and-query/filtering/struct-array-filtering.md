---
title: "StructArray Operators | BYOC"
slug: /struct-array-filtering
sidebar_label: "StructArray"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Scalar filtering in a StructArray field evaluates predicates on scalar subfields inside a StructArray field. Use this page as a syntax reference for scalar filtering in a StructArray field, as well as `elementfilter` and the `MATCH` operator families. | BYOC"
type: origin
token: VmGMwsTliiGZdFkzzeBckRNlnCh
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray Operators

Scalar filtering in a StructArray field evaluates predicates on scalar subfields inside a StructArray field. Use this page as a syntax reference for scalar filtering in a StructArray field, as well as `element_filter` and the `MATCH_*` operator families.

StructArray supports the following scalar filtering patterns:

| Scalar filtering pattern | Main purpose | Result behavior |
| --- | --- | --- |
| StructArray subfield access | Select entities by whether the values of the specified subfield at the specified index (subscript) satisfy a scalar predicate. | Entity-level filtering. |
| `ARRAY_CONTAINS` | Select entities by whether the specified value exists in a subfield. | Entity-level filtering. |
| `ARRAY_LENGTH` | Select entities by whether the number of elements in the specified subfield matches the expression. | Entity-level filtering. |
| `element_filter` | Match Struct elements that satisfy a scalar predicate. | In element-level search, matched hits can include element offsets. In row-level queries or filtered searches, the result shape depends on the API and output fields. |
| `MATCH_*` | Select entities by how many Struct elements satisfy a scalar predicate. | Entity-level filtering. These operators do not return element offsets on their own. |

Use scalar subfields in StructArray operators. Vector subfields are used by vector search paths and are not scalar predicate inputs.

## When to use which operator\{#when-to-use-which-operator}

| Goal | Use |
| --- | --- |
| Constrain element-level vector search to elements that match scalar conditions. | `element_filter` |
| Match multiple scalar conditions within the same Struct element. | `element_filter` |
| Returns only entities where a struct subfield contains the specified value. | `ARRAY_CONTAINS` |
| Returns only entities where a struct subfield has the specified number of elements. | `ARRAY_LENGTH` |
| Return only entities where the specific Struct element satisfies a predicate. | StructArray index (subscript) access |
| Return only entities where at least one Struct element satisfies a predicate. | `MATCH_ANY` |
| Return only entities where all Struct elements satisfy a predicate. | `MATCH_ALL`,<br/>StructArray subfield access, |
| Return only entities where at least, at most, or exactly `N` Struct elements satisfy a predicate. | `MATCH_LEAST`, `MATCH_MOST`, or `MATCH_EXACT` |

## Example data\{#example-data}

Examples in the following sections use the entities (**Entity A** and **Entity B**) with their `chunks` fields set to the following:

```json
// chunks field in an entity (Entity A)
"chunks": [
    {
        ...,
        "section": "index",
        "quality_score": 0.74,
        "has_code": true
        ...
    },
    {
        ...,
        "section": "index",
        "quality_score": 0.72,
        "has_code": true
        ...
    },
    {
        ...,
        "section": "index",
        "quality_score": 0.83,
        "has_code": true
        ...
    },
    {
        ...,
        "section": "index",
        "quality_score": 0.87,
        "has_code": true
        ...
    }
],

// chunks field in another entity (Entity B)
"chunks": [
    {
        ...,
        "section": "index",
        "quality_score": 0.95,
        "has_code": true
        ...
    },
    {
        ...,
        "section": "index",
        "quality_score": 0.92,
        "has_code": true
        ...
    },
    {
        ...,
        "section": "index",
        "quality_score": 0.97,
        "has_code": true
        ...
    }
],
```

## Subfield access\{#subfield-access}

You can use StructArray subfields in scalar filtering expressions to select entities based on the value of a subfield in all structs or in a specific struct within the array.

Consider the following filtering expressions:

```python
chunks[0][quality_score] > 0.8
```

The filter expression indicates that an entity will match if the value of the `quality_score` subfield in **the first element** of the StructArray field in the entity is above 0.8. 

With the two entities in the [example data](./struct-array-filtering#example-data), this expression matches only **Entity B**.

When you use subfield access in scalar filtering, note that the subfield elements are not accessible.

```python
❌ chunks[quality_score][0] > 0.8
```

## ARRAY operators\{#array-operators}

As a subtype of the Array field, StructArray also supports ARRAY operators, such as `ARRAY_CONTAIN` and `ARRAY_LENGTH`.

Consider the following expressions:

```python
ARRAY_CONTAINS(chunks[quality_score], 0.74)
```

The above expression indicates that an entity will match if any `quality_score` subfield across all elements of the entity has a value of `0.74`.  With the two entities in the [example data](./struct-array-filtering#example-data), this expression matches only **Entity A**.

```python
ARRAY_LENGTH(chunks[quality_score], 3)
```

The above expression indicates that an entity will match if the `quality_score` subfield contains 3 values. With the two entities in the [example data](./struct-array-filtering#example-data), this expression matches only **Entity B**.

## Element filter\{#element-filter}

Use `element_filter(structArrayField, predicate)` to match Struct elements in a StructArray field.

Inside the predicate, use `$[subfield]` to refer to a scalar subfield of the current Struct element.

```plaintext
element_filter(chunks, $[section] == "index")
```

With the two entities in the [example data](./struct-array-filtering#example-data), this expression matches both entities.

When multiple conditions are used inside the predicate, all `$[subfield]` references apply to the same Struct element:

```plaintext
element_filter(chunks, $[section] == "index" && $[quality_score] > 0.9)
```

With the two entities in the [example data](./struct-array-filtering#example-data), this expression matches only **Entity B**.

When you combine an entity-level predicate with `element_filter`, place `element_filter` at the end of the expression:

```plaintext
# Correct
category == "index" && element_filter(chunks, $[quality_score] > 0.9)

# Incorrect
element_filter(chunks, $[quality_score] > 0.9) && category == "index"
```

`element_filter` can appear only once in a filter expression. Do not nest `element_filter` or `MATCH_*` inside another `element_filter`.

## Match family operators\{#match-family-operators}

Use `MATCH_*` operators when an entity should be selected based on how many Struct elements satisfy a predicate.

| Operator | Meaning |
| --- | --- |
| `MATCH_ANY(field, predicate)` | At least one Struct element satisfies the predicate. |
| `MATCH_ALL(field, predicate)` | All Struct elements satisfy the predicate. |
| `MATCH_LEAST(field, predicate, threshold=N)` | At least `N` Struct elements satisfy the predicate. |
| `MATCH_MOST(field, predicate, threshold=N)` | At most `N` Struct elements satisfy the predicate. |
| `MATCH_EXACT(field, predicate, threshold=N)` | Exactly `N` Struct elements satisfy the predicate. |

`MATCH_ANY` and `element_filter` can both express that at least one Struct element satisfies a predicate. Use `MATCH_ANY` when you only need row-level filtering. Use `element_filter` when you need element-level constraints, such as filtering which Struct elements participate in element-level vector search.

### MATCH_ANY\{#matchany}

`MATCH_ANY` evaluates to `true` if at least one element in the StructArray satisfies the predicate.

```plaintext
MATCH_ANY(chunks, $[section] == "index")
```

For an empty StructArray, `MATCH_ANY` returns `false`.

With the two entities in the [example data](./struct-array-filtering#example-data), this expression matches both entities.

### MATCH_ALL\{#matchall}

`MATCH_ALL` evaluates to `true` if every element in the StructArray satisfies the predicate.

```plaintext
MATCH_ALL(chunks, $[has_code] == true)
```

For an empty StructArray, `MATCH_ALL` returns `true`.

With the two entities in the [example data](./struct-array-filtering#example-data), this expression matches both entities.

### MATCH_LEAST\{#matchleast}

`MATCH_LEAST` evaluates to `true` if the number of elements satisfying the predicate is greater than or equal to `threshold`.

```plaintext
MATCH_LEAST(chunks, $[quality_score] > 0.9, threshold=2)
```

For `MATCH_LEAST`, `threshold` must be a positive integer.

With the two entities in the [example data](./struct-array-filtering#example-data), this expression matches only **Entity B**.

### MATCH_MOST\{#matchmost}

`MATCH_MOST` evaluates to `true` if the number of elements satisfying the predicate is less than or equal to `threshold`.

```plaintext
MATCH_MOST(chunks, $[has_code] == true, threshold=1)
```

For `MATCH_MOST`, `threshold` can be zero or a positive integer.

With the two entities in the [example data](./struct-array-filtering#example-data), this expression matches none.

### MATCH_EXACT\{#matchexact}

`MATCH_EXACT` evaluates to `true` if the number of elements satisfying the predicate is exactly equal to `threshold`.

```plaintext
MATCH_EXACT(chunks, $[section] == "filter", threshold=1)
```

For `MATCH_EXACT`, `threshold` can be zero or a positive integer.

With the two entities in the [example data](./struct-array-filtering#example-data), this expression matches none.

## Supported predicates\{#supported-predicates}

The `$[...]` syntax represents the scalar value of the current Struct element. Predicate support depends on the scalar subfield type.

| Subfield type | Element-level predicate support |
| --- | --- |
| `BOOL` | Scalar predicates such as `$[has_code] == true` or `!($[has_code] == true)`. Avoid bare boolean expressions such as `$[has_code]`. |
| `INT8`, `INT16`, `INT32`, `INT64` | Comparison, chained range, `in`, `not in`, arithmetic expressions with `+`, `-`, `*`, `/`, or `%` followed by comparison, and logical combinations. |
| `FLOAT`, `DOUBLE` | Comparison, chained range, `in`, `not in`, arithmetic expressions with `+`, `-`, `*`, or `/` followed by comparison, and logical combinations. The `%` operator is not supported for floating-point subfields. |
| `VARCHAR` | String comparison, chained range, `in`, `not in`, `like`, `=&#126;`, `!&#126;`, and logical combinations. |
| Vector subfields | Not supported as `$[...]` scalar predicate inputs. Use vector subfields through EmbeddingList search or element-level vector search instead. |

Logical operators such as `&&`, `||`, and `!` apply to predicate expressions. For example, write `!($[has_code] == true)` instead of `!$[has_code]`.

## Unsupported predicates\{#unsupported-predicates}

Element-level `$[...]` predicates do not support:

- Text match functions, such as `text_match(field, "...")` or `phrase_match(field, "...")`.

- JSON path syntax, `exists` on JSON paths, or JSON functions such as `json_contains`, `json_contains_all`, or `json_contains_any`.

- Array container functions such as `array_contains`, `array_contains_all`, `array_contains_any`, or `array_length`.

- `$[subfield] is null` or `$[subfield] is not null`.

- Geometry / GIS functions.

- Timestamptz expressions.

- `random_sample(...)`.

- Field-level vector predicates.

- Generic filter function calls unless the specific function signature and execution path explicitly support StructArray element-level predicates.

## Syntax rules\{#syntax-rules}

- `MATCH_*` operator names are case-insensitive.

- Use `$[subfield]` only inside `element_filter` or `MATCH_*` predicates.

- Do not use `$[subfield]` as a JSON path, array container, or vector field reference.

- Do not nest `element_filter` or `MATCH_*` inside another StructArray operator.

- Use named `threshold=N` for `MATCH_LEAST`, `MATCH_MOST`, and `MATCH_EXACT`.

- `MATCH_ANY` on an empty StructArray returns `false`.

- `MATCH_ALL` on an empty StructArray returns `true`.

## See also\{#see-also}

- [Filtered Search with StructArray](./filtered-search-with-struct-arrays)

- [Basic Vector Search with StructArray](./search-with-struct-array)

- [Index StructArray Fields](./index-struct-array)

- [StructArray Limits](./struct-array-limits)

