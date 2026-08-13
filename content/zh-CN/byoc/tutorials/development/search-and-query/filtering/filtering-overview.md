---
title: "过滤表达式概览 | BYOC"
slug: /filtering-overview
sidebar_label: "过滤表达式概览"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供了强大的过滤功能，可帮助您精确查询数据。过滤表达式允许您针对特定的标量字段，并通过不同条件细化搜索结果。本文将介绍如何在 Zilliz Cloud 集群中使用过滤表达式，并提供侧重于查询操作的示例。您还可以在搜索和删除请求中应用这些过滤条件。 | BYOC"
type: origin
token: XIhbwrNsoiBfJvkENlFc3H8Xnjb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 过滤表达式概览

Zilliz Cloud 提供了强大的过滤功能，可帮助您精确查询数据。过滤表达式允许您针对特定的标量字段，并通过不同条件细化搜索结果。本文将介绍如何在 Zilliz Cloud 集群中使用过滤表达式，并提供侧重于查询操作的示例。您还可以在搜索和删除请求中应用这些过滤条件。

## 基本操作符\{#basic-operators}

Zilliz Cloud 支持使用多种基本操作符来过滤数据：

- **比较操作符**：`==`、`!=`、`>`、`<`、`>=` 和 `<=` 支持基于数值或文本字段进行过滤。

- **范围和模式过滤器**：`IN`、`LIKE`、`=~` 和 `!~` 用于匹配值、通配符模式或正则表达式模式。有关字符串模式的详细信息，请参阅[模式匹配](https://milvus.io/docs/pattern-matching.md)。

- **算术操作符**：`+`、`-`、`*`、`/`、`%` 和 `**` 用于针对数值字段进行计算。

- **按位操作符**：在  及更高版本中，`&`、`|` 和 `^` 可用于过滤编码了多个标志（例如权限位或状态位）的整数字段。详细信息请参阅[基本操作符](https://milvus.io/docs/basic-operators.md#Bitwise-operators)。

- **逻辑操作符**：`AND`、`OR` 和 `NOT` 可将多个条件组合成复杂表达式。

- **IS NULL 和 IS NOT NULL 操作符**：`IS NULL` 和 `IS NOT NULL` 操作符用于根据字段是否包含 null 值（即缺少数据）进行过滤。详细信息请参阅[基本操作符](https://milvus.io/docs/basic-operators.md#IS-NULL-and-IS-NOT-NULL-operators)。

### 示例：按颜色过滤\{#example-filtering-by-color}

要查找标量字段 `color` 中包含基色（红、绿或蓝）的实体，请使用以下过滤表达式：

```python
filter='color in ["red", "green", "blue"]'
```

### 示例：按权限位过滤\{#example-filtering-by-permission-bits}

要查找整数字段 `permissions` 中设置了 `SHARE` 位的实体，请使用按位与操作符 `&`：

```python
filter='(permissions & 4) == 4'
```

### 示例：按正则表达式模式过滤\{#example-filtering-by-regex-pattern}

要查找字段 `message` 中包含 `E1001` 等错误代码的实体，请使用正则匹配操作符 `=~`：

```python
filter='message =~ "E[0-9]{4}"'
```

正则过滤器使用子字符串匹配。如果要要求整个字段值都匹配该模式，请添加 `^` 和 `$` 锚点。详细信息请参阅[模式匹配](https://milvus.io/docs/pattern-matching.md)。

### 示例：过滤 JSON 字段\{#example-filtering-json-fields}

Zilliz Cloud 支持引用 JSON 字段中的键。例如，如果有一个包含 `price` 和 `model` 键的 JSON 字段 `product`，并希望查找型号特定且价格低于 1,850 的产品，请使用以下过滤表达式：

```python
filter='product["model"] == "JSN-087" AND product["price"] < 1850'
```

### 示例：过滤 Array 字段\{#example-filtering-array_fields}

如果有一个 Array 字段 `history_temperatures`，其中记录了各地气象台自 2000 年以来上报的历年平均气温，并希望查找 2009 年（第 10 条记录）气温超过 23°C 的气象台，请使用以下表达式：

```python
filter='history_temperatures[10] > 23'
```

有关这些基本操作符的更多信息，请参阅[基本操作符](https://milvus.io/docs/basic-operators.md)。

## 过滤表达式模板\{#filter-expression-templates}

使用 CJK 字符进行过滤时，由于字符集较大且编码方式存在差异，处理过程可能更加复杂。这可能导致性能下降，尤其是在使用 `IN` 操作符时。

Zilliz Cloud 引入了过滤表达式模板，以优化使用 CJK 字符时的性能。通过将动态值与过滤表达式分离，查询引擎可以更高效地处理参数 Insert。

要查找年龄超过 `25` 岁且居住在 `"北京"` 或 `"上海"` 的人员，请使用以下模板表达式：

```python
filter = "age > 25 AND city IN ['北京', '上海']"
```

要提升性能，请使用以下带参数的变体：

```python
filter = "age > {age} AND city in {city}",
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

这种方法可以减少解析开销并提高查询速度。更多信息，请参阅[过滤表达式模板](./filtering-templating)。

## 针对具体数据类型字段的过滤\{#data-type-specific-operators}

Zilliz Cloud 针对 JSON、ARRAY 和 VARCHAR 等特定数据类型的字段提供了高级过滤操作符。

### 针对 JSON 字段的操作符\{#json-field-specific-operators}

Zilliz Cloud 提供了用于查询 JSON 字段的高级操作符，可在复杂 JSON 结构中实现精确过滤：

`JSON_CONTAINS(identifier, jsonExpr)`：检查字段中是否存在 JSON 表达式。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains(tags, "sale")'
```

`JSON_CONTAINS_ALL(identifier, jsonExpr)`：确保 JSON 表达式中的所有元素都存在。

```python
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter='json_contains_all(tags, ["electronics", "sale", "new"])'
```

`JSON_CONTAINS_ANY(identifier, jsonExpr)`：筛选 JSON 表达式中至少有一个元素存在的实体。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains_any(tags, ["electronics", "new", "clearance"])'
```

有关 JSON 操作符的更多详细信息，请参阅 JSON 操作符。

### 针对 ARRAY 字段的操作符\{#array-field-specific-operators}

Zilliz Cloud 提供了用于 ARRAY 字段的高级过滤操作符，例如 `ARRAY_CONTAINS`、`ARRAY_CONTAINS_ALL`、`ARRAY_CONTAINS_ANY` 和 `ARRAY_LENGTH`，可对数组数据进行细粒度控制：

`ARRAY_CONTAINS`：筛选包含指定元素的实体。

```python
filter="ARRAY_CONTAINS(history_temperatures, 23)"
```

`ARRAY_CONTAINS_ALL`：筛选列表中的所有元素都存在的实体。

```python
filter="ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])"
```

`ARRAY_CONTAINS_ANY`：筛选包含列表中任一元素的实体。

```python
filter="ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])"
```

`ARRAY_LENGTH`：根据数组长度进行筛选。

```python
filter="ARRAY_LENGTH(history_temperatures) < 10"
```

有关数组操作符的更多详细信息，请参阅 ARRAY 操作符。

### 针对 VARCHAR 字段的操作符\{#varchar-field-specific-operators}

Zilliz Cloud 提供了专门的操作符，用于对 VARCHAR 字段执行精确的文本搜索：

#### 模式匹配操作符\{#pattern-matching-operators}

`LIKE`、`=~` 和 `!~` 操作符可匹配 `VARCHAR` 字段、JSON 字符串路径和特定 `ARRAY<VARCHAR>` 元素中的字符串模式。对于简单通配符模式，请使用 `LIKE`；对于 RE2 正则表达式，请使用 `=~` 和 `!~`。

详细信息请参阅[模式匹配](./pattern-match)。

#### `TEXT_MATCH` 操作符\{#text-match-operator}

`TEXT_MATCH` 操作符可根据指定的查询词精确检索文档。它特别适用于将标量过滤与向量相似度搜索结合的过滤搜索场景。与语义搜索不同，Text Match 更关注具体词项的出现。

Zilliz Cloud 使用 Tantivy 支持倒排索引和基于词项的文本搜索。具体过程包括：

1. **Analyzer**：对输入文本进行分词和处理。

1. **索引**：创建倒排索引，将唯一 token 映射到文档。

更多详细信息，请参阅[Text Match](./text-match)。

#### `PHRASE_MATCH` 操作符\{#phrase-match-operator}

**PHRASE_MATCH** 操作符可根据精确短语匹配来精确检索文档，同时考虑查询词的顺序和相邻关系。Phrase Match 的匹配会同时考虑查询词的顺序和相邻关系。

更多详细信息，请参阅[Phrase Match](./phrase-match)。