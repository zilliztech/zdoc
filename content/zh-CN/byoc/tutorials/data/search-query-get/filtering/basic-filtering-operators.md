---
title: "基本操作符 | BYOC"
slug: /basic-filtering-operators
sidebar_label: "基本操作符"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供了一套丰富的基本操作符，可帮助您高效地过滤和查询数据。通过这些操作符，您可以根据标量字段、数字计算、逻辑条件等细化搜索条件。了解如何使用这些操作符对于建立精确查询和最大限度地提高搜索效率至关重要。 | BYOC"
type: origin
token: OEw6wSUvXiKQKpkOLIAcYk6unbc
sidebar_position: 2
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
  - 基本操作符
  - basic operators

---

import Admonition from '@theme/Admonition';


# 基本操作符

Zilliz Cloud 提供了一套丰富的基本操作符，可帮助您高效地过滤和查询数据。通过这些操作符，您可以根据标量字段、数字计算、逻辑条件等细化搜索条件。了解如何使用这些操作符对于建立精确查询和最大限度地提高搜索效率至关重要。

## 比较操作符\{#comparison-operators}

比较运算符用于根据相等、不等或大小过滤数据。它们适用于数字和文本字段。

### 支持的比较操作符\{#supported-comparison-operators}

- `==`（等于）

- `!=`（不等于）

- `>`（大于）

- `<`（小于）

- `>=`（大于等于）

- `<=`（小于等于）

### 示例1：使用等于（`==`）操作符过滤\{#example-1-filtering-with-equal-to}

假设有名为 `status` 的字段，需要过滤出 `status` 字段值为 `active` 的所有 Entity，可以使用如下过滤表达式：

```python
filter = 'status == "active"'
```

### 示例2：使用不等于（`!=`）操作符过滤\{#example-2-filtering-with-not-equal-to}

如果需要过滤出 `status` 字段值不为 `active` 的所有 Entity，可以使用如下过滤表达式：

```python
filter = 'status != "inactive"'
```

### 示例3：使用大于（`>`）操作符过滤\{#example-3-filtering-with-greater-than-greater}

如果需要过滤出 `age` 字段值大于 `30` 的所有 Entity，可以使用如下过滤表达式：

```python
filter = 'age > 30'
```

### 示例4：使用小于（`\<`）操作符过滤\{#example-4-filtering-with-less-than}

如果需要过滤出 `price` 字段小于 `100` 的所有 Entity，可以使用如下过滤表达式：

```python
filter = 'price < 100'
```

### 示例5：使用大于等于（`>=`）操作符过滤\{#example-5-filtering-with-greater-than-or-equal-to-greater}

如果需要过滤出 `rating` 字段大于等于 `4` 的所有 Entity，可以使用如下过滤表达式：

```python
filter = 'rating >= 4'
```

### 示例6：使用小于等于（`\<=`）操作符过滤\{#example-6-filtering-with-less-than-or-equal-to}

如果需要过滤出 `discount` 字段小于等于 `10%` 的所有 Entity，可以使用如下过滤表达式：

```python
filter = 'discount <= 10'
```

## 范围操作符\{#range-operators}

范围操作符可以根据特定的数值集或数值范围过滤数据。

### 支持的范围操作符\{#supported-range-operators}

- `IN`：用于过滤出某字段的值在指定范围内的所有 Entity。

- `LIKE`：用于过滤出某字段的值匹配指定模式的所有 Entity。

### 示例1：使用 `IN`操作符匹配多个指定值\{#example-1-using-in-to-match-multiple-values}

如果需要过滤出 `color` 字段中包含了 `red`、`green` 或 `blue` 的所有 Entity，可以使用如下表达式：

```python
filter = 'color in ["red", "green", "blue"]'
```

这对于希望检查某参数值是否在某个指定范围来说十分有用。

### 示例2：使用 `LIKE` 操作符进行模式匹配\{#example-2-using-like-for-pattern-matching}

对于文本字段来说，可以使用 `LIKE` 操作符对其进行模式匹配。具体来说，您可以检查某个文本字段的值是否在前缀、后缀或中缀等指定位置上包含某个子字符串。在 `LIKE` 操作符中，您可以使用 `%` 作为通配符，用于匹配零个或多个字符。

### 前缀匹配\{#prefix-match-starts-with}

如果需要进行前缀匹配，可以将 `%` 通配符放在需要匹配的子字符串的后面。如下面的例子所示，如果需要找出 `name` 字段值以 `Prod` 开头的所有 Entity，可以使用如下过滤表达式。

```python
filter = 'name LIKE "Prod%"'
```

This will match any product whose name starts with "Prod", such as "Product A", "Product B", etc.

该过滤表达式将匹配 `name` 字段值为 `ProductA`、`ProductB` 等以 `Prod` 开头的所有 Entity。

### 后缀匹配\{#suffix-match-ends-with}

对于后缀匹配来说，可以将 `%` 通配符放在需要匹配的子字符串的前面。例如，需要找出 `name` 字段以 `XYZ` 结尾的所有 Entity，可以使用如下过滤表达式。

```python
filter = 'name LIKE "%XYZ"'
```

该过滤表达式将匹配 `name` 字段值为 `ProductXYZ`、`SampleXYZ` 等以 `XYZ` 结尾的所有 Entity。

### 中缀匹配\{#infix-match-contains}

进行中缀匹配，也就是匹配那些包含指定模式文本的字段值，可以在模式文本前后都加上一个 `%` 通配符。例如，需要找出 `name` 字段包含了 `Pro` 字样的所有 Entity，可以使用如下过滤表达式：

```python
filter = 'name LIKE "%Pro%"'
```

该过滤表达式将匹配 `name` 字段值为 `Product`、`ProLine` 或 `SuperPro` 等包含了 `Pro` 字符串的所有 Entity。

## 算术操作符\{#arithmetic-operators}

您可以使用算术操作符根据涉及数值字段的算术计算式创建过滤条件。

### 支持的算术操作符\{#supported-arithmetic-operators}

- `+`（加）

- `-`（减）

- `*`（乘）

- `/`（除）

- `%`（余）

- `**`（幂）

### 示例 1：使用余（`%`）操作符\{#example-5-using-modulus-percent}

可以使用如下过滤表达式找出 `id` 字段值为偶数的所有 Entity。

```python
filter = 'id % 2 == 0'
```

### 示例 2：使用幂（`**`）操作符\{#example-6-using-exponentiation}

可以使用如下过滤表达式找出所有 `price` 字段值的平方大于 1000 的所有 Entity。

```python
filter = 'price ** 2 > 1000'
```

## 逻辑操作符\{#logical-operators}

逻辑操作符通常用来连接多个过滤条件以实现复杂的过滤条件，包括 `AND`、`OR` 和 `NOT`。

### 支持的逻辑操作符\{#supported-logical-operators}

- `AND`：连接多个过滤条件，每个条件都为真时为真。

- `OR`：连接多个过滤条件，其中一个条件为真时为真。

- `NOT`：后接一个过滤条件，当该条件为假时为真。

### 示例 1：使用 `AND` 操作符连接多个条件\{#example-1-using-and-to-combine-conditions}

可以使用如下过滤表达式找出 `price` 字段值大于 `100` 且 `stock` 字段值大于 `50` 的所有 Entity。

```python
filter = 'price > 100 AND stock > 50'
```

### 示例 2：使用 `OR` 操作符连接多个条件\{#example-2-using-or-to-combine-conditions}

可以使用如下过滤表达式找出 `color` 字段值为 `red` 或 `blue` 的所有 Entity。

```python
filter = 'color == "red" OR color == "blue"'
```

### 示例 3：使用 `NOT` 操作符排除某个条件\{#example-3-using-not-to-exclude-a-condition}

可以使用如下过滤表达式找出所有 `color` 字段值不为 `green` 的所有 Entity。

```python
filter = 'NOT color == "green"'
```

## IS NULL 和 IS NOT NULL 操作符\{#is-null-and-is-not-null-operators}

`IS NULL` 和 `IS NOT NULL` 操作符用来根据某个 Entity 指定字段的取值是否为 `null` （即值为空）进行过滤。

- `IS NULL` 判断 Entity 中指定字段的取值是否为 `null`，即为空或未定义。

- `IS NOT NULL` 判断 Entity 中指定字段的取值不为空，即 Entity 在该字段上的值为一个合法的值。

<Admonition type="info" icon="📘" title="说明">

<p>此操作符大小写不敏感。因此，<code>IS NULL</code>、<code>is null</code>、<code>IS NOT NULL</code>、<code>is not null</code> 均合法。</p>

</Admonition>

### 普通标量字段中的 Null 值\{#regular-scalar-fields-with-null-values}

Zilliz Cloud 支持针对普通标量字段是否为空进行过滤。这些字段类型包括字段串或数值类型等。

<Admonition type="info" icon="📘" title="说明">

<p>在 <code>VARCHAR</code> 类型的字段中，Zilliz Cloud 不会将 <code>""</code> 识别为 <code>nulll</code> 值。</p>

</Admonition>

如下过滤表达式可以过滤出 `description` 字段为空的 Entity。

```python
filter = 'description IS NULL'
```

如下过滤表达式可以过滤出 `description` 字段不为空的 Entity。

```python
filter = 'description IS NOT NULL'
```

如下过滤表达式可以过滤出 `description` 字段为空且 `price` 字段大于 `10` 的 Entity。

```python
filter = 'description IS NOT NULL AND price > 10'
```

### JSON 字段中的 Null 值\{#json-fields-with-null-values}

Zilliz Cloud 支持针对 JSON 字段是否为空进行过滤，并将符合如下条件的 JSON 字段判定为 `null`：

- JSON 字段的值显式定义为 `None`，如 `{"metadata": None}`。

- Entity 中未包含该 JSON 字段。

<Admonition type="info" icon="📘" title="说明">

<p>如果 JSON 字段值中某些元素（例如，某些键值）为 <code>null</code>，该字段的值仍为非空。例如，某 Entity 的 JSON 字段的取值为 <code>\{"metadata": \{"category": None, "price": 99.99}}</code> 中。虽然 <code>category</code> 的值为 <code>None</code>，但该 JSON 字段的取值不会被当作 <code>null</code>。</p>

</Admonition>

为了更好地演示 Zilliz Cloud 如何处理允许为空的 JSON 字段，我们将使用如下数据结合相关示例进行说明：

```python
data = [
  {
      "metadata": {"category": "electronics", "price": 99.99, "brand": "BrandA"},
      "pk": 1,
      "embedding": [0.12, 0.34, 0.56]
  },
  {
      "metadata": None, # Entire JSON object is null
      "pk": 2,
      "embedding": [0.56, 0.78, 0.90]
  },
  {  # JSON field `metadata` is completely missing
      "pk": 3,
      "embedding": [0.91, 0.18, 0.23]
  },
  {
      "metadata": {"category": None, "price": 99.99, "brand": "BrandA"}, # Individual key value is null
      "pk": 4,
      "embedding": [0.56, 0.38, 0.21]
  }
]
```

**示例 1： 获取 metadata 为空的 Entity**

只有当不存在 `metadata` 字段或该字段显式设置为 `None` 时，才会被认定为 `null`。

```python
filter = 'metadata IS NULL'

# Example output:
# data: [
#     "{'metadata': None, 'pk': 2}",
#     "{'metadata': None, 'pk': 3}"
# ]
```

**示例 2：获取 metadata 为非空的 Entity**

```python
filter = 'metadata IS NOT NULL'

# Example output:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

### ARRAY 字段中的 Null 值\{#array-fields-with-null-values}

Zilliz Cloud 支持针对 ARRAY 字段是否为空进行过滤，并将符合如下条件的 ARRAY 字段判定为 `null`：

- ARRAY 字段的值显式定义为 `None`，如 `{"metadata": None}`。

- Entity 中未包含该 JSON 字段。

<Admonition type="info" icon="📘" title="说明">

<p>由于 ARRAY 字段中各元素的数值类型需要保持一致，因此 ARRAY 字段不支持部分元素值为 <code>null</code>。具体可参考<a href="./use-array-fields">Array 类型</a>。</p>

</Admonition>

为了更好地演示 Zilliz Cloud 如何处理允许为空的 ARRAY 字段，我们将使用如下数据结合相关示例进行说明：

```python
data = [
  {
      "tags": ["pop", "rock", "classic"],
      "ratings": [5, 4, 3],
      "pk": 1,
      "embedding": [0.12, 0.34, 0.56]
  },
  {
      "tags": None,  # Entire ARRAY is null
      "ratings": [4, 5],
      "pk": 2,
      "embedding": [0.78, 0.91, 0.23]
  },
  {  # The tags field is completely missing
      "ratings": [9, 5],
      "pk": 3,
      "embedding": [0.18, 0.11, 0.23]
  }
]
```

**示例 1： 获取 tags 为空的 Entity**

只有当不存在 `tags` 字段或该字段显式设置为 `None` 时，才会被认定为 `null`。

```python
filter = 'tags IS NULL'

# Example output:
# data: [
#     "{'tags': None, 'ratings': [4, 5], 'embedding': [0.78, 0.91, 0.23], 'pk': 2}",
#     "{'tags': None, 'ratings': [9, 5], 'embedding': [0.18, 0.11, 0.23], 'pk': 3}"
# ]
```

**示例 2：获取 tags 为非空的 Entity**

```python
filter = 'tags IS NOT NULL'

# Example output:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

## 在针对 JSON 和 ARRAY 类型的字段进行过滤时使用基本操作符需要注意的问题\{#tips-on-using-basic-operators-with-json-and-array-fields}

Zilliz Cloud 集群中的基本运算符用途广泛，可用于标量字段，但它们也可有效地用于 JSON 和 ARRAY 字段中的键和索引。

假设 `product` 字段中有多个键，其键名分别为 `price`、`model` 和 `tags`，您可以使用这些键名构建过滤条件表达式来实现针对这些键值的过滤。如下示例可以找出 `product` 字段中 `price` 键值大于 `1000` 的所有 Entity。

```python
filter = 'product["price"] > 1000'
```

您还可以使用如下过滤表达式找出 `history_temperatures` 中第一个记录大于 `30` 的所有 Entity。

```python
filter = 'history_temperatures[0] > 30'
```

## 小结\{#conclusion}

Zilliz Cloud 提供了一系列基本运算符，可让您灵活地过滤和查询数据。通过结合比较、范围、算术和逻辑运算符，您可以创建功能强大的过滤表达式，以缩小搜索结果的范围并高效检索所需数据。

## 常见问题\{#faq}

**过滤条件中（例如 filter='color in ["red", "green", "blue"]'）匹配值列表长度是否有限制？列表过长时我该怎么办？**

Zilliz Cloud 对过滤条件中的匹配值列表没有长度限制。但是过长的列表会大幅影响查询性能。因此，当您的过滤条件中匹配值列表较长或过滤表达式较为复杂且包含众多元素时，推荐使用[过滤表达式模板](./filtering-templating)以提升查询性能。