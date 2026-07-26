---
title: "过滤表达式概览 | BYOC"
slug: /filtering-overview
sidebar_label: "过滤表达式概览"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud提供了强大的过滤功能，可实现对数据的精确查询。过滤表达式允许您针对特定的标量字段，并通过不同的条件细化搜索结果。本文将介绍如何在 Zilliz Cloud 集群中使用过滤表达式，并提供了侧重于 Query 操作的示例。您还可以在 Search 和 Delete 请求中应用这些过滤表达式。 | BYOC"
type: origin
token: XIhbwrNsoiBfJvkENlFc3H8Xnjb
sidebar_position: 1
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
  - 过滤表达式概览

---

import Admonition from '@theme/Admonition';


# 过滤表达式概览

Zilliz Cloud提供了强大的过滤功能，可实现对数据的精确查询。过滤表达式允许您针对特定的标量字段，并通过不同的条件细化搜索结果。本文将介绍如何在 Zilliz Cloud 集群中使用过滤表达式，并提供了侧重于 Query 操作的示例。您还可以在 Search 和 Delete 请求中应用这些过滤表达式。

## 基本操作符\{#basic-operators}

Zilliz Cloud 支持在数据过滤中使用多种操作符：

- **比较操作符**：`==`、`!=`、`>`、`<`、`>=` 和 `<=` 支持基于数值、文本字段的比较。

- **范围操作符**：`IN` 和 `LIKE` 支持匹配指定取值范围的记录。

- **算术操作符**：`+`、`-`、`*`、`/`、`%` 和 `**` 用来针对数值类型字段的简单算术运算。

- **逻辑操作符**：`AND`、`OR` 和 `NOT` 可以将多个过滤条件组合成复杂的过滤表达式。

### 示例：按颜色过滤\{#example-filtering-by-color}

假设有名为 `color` 的标量字段，需要找出所有在该字段中包含三元色（红、绿、蓝）的 Entity，您可以使用如下过滤表达式。

```python
filter='color in ["red", "green", "blue"]'
```

### 示例：过滤 JSON 字段\{#example-filtering-json-fields}

Zilliz Cloud 支持在过滤表达式中引用 JSON 字段的键名。假设有名为 `product` 的 JSON 字段，其中有 `price` 和 `model` 两个键，需要找出某个型号的产品中价格低于 1,850 的所有记录，您可以使用如下过滤表达式。

```python
filter='product["model"] == "JSN-087" AND product["price"] < 1850'
```

### 示例：过滤 Array 字段\{#example-filtering-array_fields}

假设有名为 `history_temperatures` 的 Array 字段，记录了各地气象台上报的自 2000 年来的历年平均气温信息，需要找出 2009年（第 10 个气温记录）超过 23°C 的所有气象台，可以使用如下过滤表达式。

```python
filter='history_temperatures[10] > 23'
```

关于基本操作符的更多信息，可以参考[基本操作符](./basic-filtering-operators)。

## 针对具体数据类型字段的过滤\{#data-type-specific-operators}

Zilliz Cloud还针对使用了 JSON、ARRAY 或 VARCHAR 等不同数据类型的字段提供了一些高级的操作符。

### 针对 JSON 字段的操作符\{#json-field-specific-operators}

Zilliz Cloud 在针对 JSON 字段的过滤中提供了如下高级操作符，从而在 JSON 字段的复杂结构中进行精准过滤。

**JSON_CONTAINS(identifier, jsonExpr)**：用于确定某个 JSON 字段是否包含指定的表达式。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains(tags, "sale")'
```

**JSON_CONTAINS_ALL(identifier, jsonExpr)**：用于确定某个 JSON 字段是否包含指定表达式中的所有元素。

```python
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter='json_contains_all(tags, ["electronics", "sale", "new"])'
```

**JSON_CONTAINS_ANY(identifier, jsonExpr)**：用于确定某个 JSON 字段是否包含指定表达式中的至少一个元素。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains_any(tags, ["electronics", "new", "clearance"])'
```

关于 JSON 字段操作符的更多内容，可以参考[JSON 操作符](./json-filtering-operators)。

### 针对 ARRAY 字段的操作符\{#array-field-specific-operators}

Zilliz Cloud 在针对 ARRAY 字段的过滤中使用如下高级操作符，包括 `ARRAY_CONTAINS`、`ARRAY_CONTAINS_ALL`、`ARRAY_CONTAINS_ANY` 和 `ARRAY_LENGTH`，为 ARRAY 类型字段提供了更细粒度的过滤能力。

**ARRAY_CONTAINS**：用于确定某个 ARRAY 字段是否包含某个指定的表达式。

```python
filter="ARRAY_CONTAINS(history_temperatures, 23)"
```

**ARRAY_CONTAINS_ALL**：用于确定某个 ARRAY 字段是否包含指定表达式中的所有元素。

```python
filter="ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])"
```

**ARRAY_CONTAINS_ANY**：用于确定某个 ARRAY 字段是否包含指定表达式中的至少一个元素。

```python
filter="ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])"
```

**ARRAY_LENGTH**：用于基于某个 ARRAY 字段的长度进行过滤。

```python
filter="ARRAY_LENGTH(history_temperatures) < 10"
```

关于 ARRAY 字段操作符的更多内容，可以参考 [ARRAY 操作符](./array-filtering-operators)。

### 针对 VARCHAR 字段的操作符\{#varchar-field-specific-operators}

Zilliz Cloud 为针对 VARCHAR 字段进行精确文本检索提供了专门的操作符。

#### `TEXT_MATCH` operator\{#text-match-operator}

TEXT_MATCH 操作符可用于针对指定关键词的精准文本匹配。这对于结合标量过滤和向量搜索的场景来说十分有用。与语义搜索不同的是，TEXT_MATCH 更加关注具体文本的出现频率。

Zilliz Cloud 使用 Tantivy 来支持倒排索引和基于关键词的文本搜索。具体的过程如下：

1. 使用 **Analayzer** 对输入文本进行分词和其它处理。

1. 创建倒排索引为 token 和对应的文档间建立映射关系。

关于更多内容，可以参考 [精确文本匹配](./text-match).

