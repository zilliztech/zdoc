---
title: "JSON 操作符 | BYOC"
slug: /json-filtering-operators
sidebar_label: "JSON 操作符"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 支持用于查询和过滤 JSON 字段的高级操作符，使其成为管理复杂结构化数据的完美工具。这些操作符可实现对 JSON 文档的高效查询，允许您根据 JSON 字段中的特定元素、值或条件检索实体。本节将指导您在 Zilliz Cloud 中使用特定于 JSON 的操作符，并提供实际示例来说明其功能。 | BYOC"
type: origin
token: CzWlwISZRiHErEkRmEfcqga4nzd
sidebar_position: 4
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
  - JSON 操作符
  - json_contains
  - json_contains_any
  - json_contains_all

---

import Admonition from '@theme/Admonition';


# JSON 操作符

Zilliz Cloud 支持用于查询和过滤 JSON 字段的高级操作符，使其成为管理复杂结构化数据的完美工具。这些操作符可实现对 JSON 文档的高效查询，允许您根据 JSON 字段中的特定元素、值或条件检索实体。本节将指导您在 Zilliz Cloud 中使用特定于 JSON 的操作符，并提供实际示例来说明其功能。

<Admonition type="info" icon="📘" title="说明">

<p>JSON 字段无法处理复杂的嵌套结构，而是将所有嵌套结构视为纯字符串。因此，在使用 JSON 字段时，建议避免过深的嵌套，并确保数据结构尽可能扁平，以获得最佳性能。</p>

</Admonition>

## 支持的 JSON 操作符\{#available-json-operators}

Zilliz Cloud 提供了几个强大的 JSON 操作符，可帮助过滤和查询 JSON 数据，这些操作符包括：

- [`JSON_CONTAINS(identifier, expr)`](./json-filtering-operators#jsoncontains)：用于过滤出在指定 JSON 字段值中包含指定表达式的所有 Entity。

- [`JSON_CONTAINS_ALL(identifier, expr)`](./json-filtering-operators#jsoncontainsall)：用于过滤出在指定 JSON 字段值中包含指定表达式中所有元素的所有 Entity。

- [`JSON_CONTAINS_ANY(identifier, expr)`](./json-filtering-operators#jsoncotainsany)：用于过滤出在指定 JSON 字段值中包含指定表达式中若干元素的所有 Entity。

下面，我们将结合示例来了解如何在实际场景下使用这些操作符。

## JSON_CONTAINS\{#jsoncontains}

该操作符会检查 JSON 字段中是否存在特定元素或子数组。当你想确保一个 JSON 数组或对象包含一个特定值时，就可以使用 JSON_CONTAINS 操作符。

**示例**

假设 JSON 字段 `product` 中有名为 `tags` 的键，可以使用如下过滤表达式找出 `tags` 键包含了 `sale` 的所有 Entity。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains(product["tags"], "sale")'
```

## JSON_CONTAINS_ALL\{#jsoncontainsall}

该操作符可确保目标字段中包含指定 JSON 表达式的所有元素。当需要匹配 JSON 数组中的多个值时，就可以使用 JSON_CONTAINS_ALL 操作符。

**示例**

继续使用上一个示例设定的场景，您可以使用如下过滤表达式找出 `tags` 键同时包含了 `electronics`、`sale` 和 `new` 的所有 Entity。

```python
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter = 'json_contains_all(product["tags"], ["electronics", "sale", "new"])'
```

## JSON_CONTAINS_ANY\{#jsoncotainsany}

该操作符可过滤字段中至少存在一个 JSON 表达式成员的实体。当您想根据多个可能值中的任意一个值来匹配实体时，就可以使用 JSON_CONTAINS_ANY 操作符。

**示例**

Let’s say you want to filter products that have at least one of the tags `"electronics"`, `"sale"`, or `"new"`. You can use the `json_contains_any` operator to achieve this.

假设您需要过滤出 tags 键包含了 `electronics`、`sale` 和 `new` 中任意一个 tag 的所有 Entity，可以使用如下过滤表达式。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains_any(product["tags"], ["electronics", "new", "clearance"])'
```

在这种情况下 Zilliz Cloud 将返回 `tags` 列表中至少包含 `["electronics", "new", "clearance"]` 中任意一个元素的所有 Entity，包括那些 `tags` 键中仅包含了上述三个 tag 中的任意一个的 Entity。