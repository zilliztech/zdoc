---
title: "ARRAY Operators | Cloud"
slug: /array-filtering-operators
sidebar_key: array-filtering-operators
sidebar_label: "Array"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud provides powerful operators to query array fields, allowing you to filter and retrieve entities based on the contents of arrays. | Cloud"
type: origin
token: MaWywRYCniq6vwkJsT7c2wAyn0f
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - filter
  - filtering expressions
  - filtering
  - array operators

---

import Admonition from '@theme/Admonition';


# ARRAY Operators

Zilliz Cloud provides powerful operators to query array fields, allowing you to filter and retrieve entities based on the contents of arrays. 

<Admonition type="info" icon="📘" title="Notes">

<p>All elements within an array must be the same type, and nested structures within arrays are treated as plain strings. Therefore, when working with ARRAY fields, it is advisable to avoid excessively deep nesting and ensure that your data structures are as flat as possible for optimal performance.</p>

</Admonition>

## Available ARRAY Operators\{#available-array-operators}

The ARRAY operators allow for fine-grained querying of array fields in Zilliz Cloud clusters. These operators are:

- [`ARRAY_CONTAINS(identifier, expr)`](./array-filtering-operators#arraycontains): checks if a specific element exists in an array field.

- [`ARRAY_CONTAINS_ALL(identifier, expr)`](./array-filtering-operators#arraycontainsall): ensures that all elements of the specified list are present in the array field.

- [`ARRAY_CONTAINS_ANY(identifier, expr)`](./array-filtering-operators#arraycontainsany): checks if any of the elements from the specified list are present in the array field.

- [`ARRAY_LENGTH(identifier)`](./array-filtering-operators#arraylength): returns the number of elements in an array field and can be combined with comparison operators for filtering.

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