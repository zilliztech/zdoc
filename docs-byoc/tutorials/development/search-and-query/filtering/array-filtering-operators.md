---
title: "ARRAY Operators | BYOC"
slug: /array-filtering-operators
sidebar_label: "Array"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud provides ARRAY operators for filtering ARRAY fields and partially updating ARRAY field values. | BYOC"
type: origin
token: MaWywRYCniq6vwkJsT7c2wAyn0f
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# ARRAY Operators

Zilliz Cloud provides ARRAY operators for filtering ARRAY fields and partially updating ARRAY field values.

Note: All elements within an array must be the same type, and nested structures within arrays are treated as plain strings. Therefore, when working with ARRAY fields, it is advisable to avoid excessively deep nesting and ensure that your data structures are as flat as possible for optimal performance.

ARRAY operators in Zilliz Cloud cover two usage scenarios:

- Filter expressions for query and search.

- Partial updates in `upsert` requests.

## Available ARRAY operators\{#available-array-operators}

The following table lists ARRAY operators available in Zilliz Cloud.

| **Operator** | **Use in** | **Description** |
| --- | --- | --- |
| [ARRAY_CONTAINS(identifier, expr)](./array-filtering-operators#arraycontains) | Filter expression | Checks whether a specific element exists in an ARRAY field. |
| [ARRAY_CONTAINS_ALL(identifier, expr)](./array-filtering-operators#arraycontainsall) | Filter expression | Checks whether all elements in a specified list exist in an ARRAY field. |
| [ARRAY_CONTAINS_ANY(identifier, expr)](./array-filtering-operators#arraycontainsany) | Filter expression | Checks whether any element in a specified list exists in an ARRAY field. |
| [ARRAY_LENGTH(identifier)](./array-filtering-operators#arraylength) | Filter expression | Returns the number of elements in an ARRAY field and can be combined with comparison operators for filtering. |
| [ARRAY_APPEND](./array-filtering-operators#arrayappend) | `upsert` with `field_ops` | Appends payload elements to an existing ARRAY field. Available in Zilliz Cloud v2.6.17 and later. |
| [ARRAY_REMOVE](./array-filtering-operators#arrayremove) | `upsert` with `field_ops` | Removes every element from an existing ARRAY field that matches a value in the request payload. |

## ARRAY_CONTAINS\{#arraycontains}

The `ARRAY_CONTAINS` operator checks if a specific element exists in an array field. It’s useful when you want to find entities where a given element is present in the array.

**Example**

Suppose you have an array field `history_temperatures`, which contains the recorded lowest temperatures for different years. To find all entities where the array contains the value `23`, you can use the following filter expression:

```python
filter = 'ARRAY_CONTAINS(history_temperatures, 23)'
```

This will return all entities where the `history_temperatures` array contains the value `23`.

## ARRAY_CONTAINS_ALL\{#arraycontainsall}

The `ARRAY_CONTAINS_ALL` operator ensures that all elements of the specified list are present in the array field. This operator is useful when you want to match entities that contain multiple values in the array.

**Example**

If you want to find all entities where the `history_temperatures` array contains both `23` and `24`, you can use:

```python
filter = 'ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])'
```

This will return all entities where the `history_temperatures` array contains both of the specified values.

## ARRAY_CONTAINS_ANY\{#arraycontainsany}

The `ARRAY_CONTAINS_ANY` operator checks if any of the elements from the specified list are present in the array field. This is useful when you want to match entities that contain at least one of the specified values in the array.

**Example**

To find all entities where the `history_temperatures` array contains either `23` or `24`, you can use:

```python
filter = 'ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])'
```

This will return all entities where the `history_temperatures` array contains at least one of the values `23` or `24`.

## ARRAY_LENGTH\{#arraylength}

The `ARRAY_LENGTH` returns the length (number of elements) of an array field. It accepts exactly one parameter: the array field identifier.

**Example**

To find all entities where the `history_temperatures` array has fewer than 10 elements:

```python
filter = 'ARRAY_LENGTH(history_temperatures) < 10'
```

This will return all entities where the `history_temperatures` array has fewer than 10 elements.

## ARRAY_APPEND\{#arrayappend}

The `ARRAY_APPEND` operator appends payload elements to an existing ARRAY field during an `upsert` request. It is not a filter expression. Use it when you want to add values to an array without first querying the current array value.

The following Python example appends `"premium"` to the `tags` ARRAY field of the entity whose primary key is `1`:

```python
from pymilvus import FieldOp

client.upsert(
    collection_name="users",
    data=[{"pk": 1, "tags": ["premium"]}],
    field_ops={"tags": FieldOp.array_append()},
)
```

Attaching `ARRAY_APPEND` to a field through `field_ops` enables partial-update semantics for that field. For the full workflow, supported element types, and limits, refer to [Upsert ARRAY fields in merge mode](https://milvus.io/docs/upsert-entities.md#Upsert-ARRAY-fields-in-merge-mode).

## ARRAY_REMOVE\{#arrayremove}

The `ARRAY_REMOVE` operator removes every element from an existing ARRAY field that matches a value in the request payload during an `upsert` request. It is not a filter expression. Use it when you want to remove matching values from an array without first querying the current array value.

The following Python example removes `"trial"` from the `tags` ARRAY field of the entity whose primary key is `1`:

```python
from pymilvus import FieldOp

client.upsert(
    collection_name="users",
    data=[{"pk": 1, "tags": ["trial"]}],
    field_ops={"tags": FieldOp.array_remove()},
)
```

Attaching `ARRAY_REMOVE` to a field through `field_ops` enables partial-update semantics for that field. For the full workflow, supported element types, and limits, refer to [Upsert ARRAY fields in merge mode](https://milvus.io/docs/upsert-entities.md#Upsert-ARRAY-fields-in-merge-mode).