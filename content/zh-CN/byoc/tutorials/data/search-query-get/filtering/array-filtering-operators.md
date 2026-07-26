---
title: "ARRAY 操作符 | BYOC"
slug: /array-filtering-operators
sidebar_label: "ARRAY 操作符"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 为查询 ARRAY 字段提供了强大的操作符，使您可以根据 ARRAY 字段内容过滤和查询 Entity。 | BYOC"
type: origin
token: Cb49wcNhsimyyCkHPOwcg6dTn0b
sidebar_position: 5
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - query
  - 查询
  - filter
  - 过滤
  - 过滤表达式
  - array 表达式
  - array_contains
  - array_contains_all
  - array_contains_any
  - array_length

---

import Admonition from '@theme/Admonition';


# ARRAY 操作符

Zilliz Cloud 为查询 ARRAY 字段提供了强大的操作符，使您可以根据 ARRAY 字段内容过滤和查询 Entity。

<Admonition type="info" icon="📘" title="说明">

<p>ARRAY 字段中的所有元素必须是相同的类型，ARRAY 中的嵌套结构将被视为纯字符串。因此，在使用 ARRAY 字段时，建议避免过深的嵌套，并确保数据结构尽可能扁平，以获得最佳性能。</p>

</Admonition>

## 支持的 ARRAY 操作符\{#available-array-operators}

ARRAY 操作符允许 Zilliz Cloud clusters中的 ARRAY 类型的字段进行精细查询。这些操作符包括：

- [`ARRAY_CONTAINS(identifier, expr)`](./array-filtering-operators#arraycontains)：用于判断指定 ARRAY 字段值是否包含指定的表达式。

- [`ARRAY_CONTAINS_ALL(identifier, expr)`](./array-filtering-operators#arraycontainsall)：用于判断指定 ARRAY 字段值是否包含指定表达式中的所有元素。

- [`ARRAY_CONTAINS_ANY(identifier, expr)`](./array-filtering-operators#arraycontainsany)：用于判断指定 ARRAY 字段值是否包含指定表达式中的任一元素。

- [`ARRAY_LENGTH(identifier)`](./array-filtering-operators#arraylength)：用于计算指定 ARRAY 字段值的元素个数。

## ARRAY_CONTAINS\{#arraycontains}

该操作符检查 ARRAY 字段中是否存在特定元素。当需要查找 ARRAY 中存在指定元素的 Entity 时，可以使用 ARRAY_CONTAINS 操作符。

**示例**

假设有名为 `history_temperatures` 的字段包含了各地气象站上报的历年最低气温。您可以使用如下过滤表达式找出最低气温列表中包含了 23 度的所有 Entity。

```python
filter = 'ARRAY_CONTAINS(history_temperatures, 23)'
```

## ARRAY_CONTAINS_ALL\{#arraycontainsall}

该操作符可确保指定列表中的所有元素都出现在 ARRAY 字段中。当需要匹配数组中包含多个值的实体时，该操作符非常有用。

**示例**

您可以使用如下过滤表达式找出最低气温列表中同时包含了 23 度和 24 度的所有 Entity。

```python
filter = 'ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])'
```

## ARRAY_CONTAINS_ANY\{#arraycontainsany}

该操作符检查 ARRAY 字段中是否存在指定列表中的任何元素。当需要匹配数组中至少包含一个指定值的 Entity 时，可以使用该操作符。

**示例**

您可以使用如下过滤表达式找出最低气温列表中包含了 23 度或 24 度的所有 Entity。

```python
filter = 'ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])'
```

## ARRAY_LENGTH\{#arraylength}

该操作符允许您根据 ARRAY 字段中的元素个数进行过滤。这对于找出那些包含了特定个数元素的 Entity 来说十分有用。

**示例**

您可以使用如下过滤表达式找出最低气温记录少于 10 个的所有 Entity。

```python
filter = 'ARRAY_LENGTH(history_temperatures) < 10'
```
