---
title: "基本操作符 | BYOC"
slug: /basic-filtering-operators
sidebar_label: "基本操作符"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供了丰富的基本操作符，可帮助您高效过滤和查询数据。您可以使用这些操作符，根据标量字段、数值计算、逻辑条件等细化搜索条件。掌握这些操作符的用法，是构建精确查询并提升搜索效率的关键。 | BYOC"
type: origin
token: OEw6wSUvXiKQKpkOLIAcYk6unbc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 基本操作符

Zilliz Cloud 提供了丰富的基本操作符，可帮助您高效过滤和查询数据。您可以使用这些操作符，根据标量字段、数值计算、逻辑条件等细化搜索条件。掌握这些操作符的用法，是构建精确查询并提升搜索效率的关键。

<Admonition type="info" icon="📘" title="说明">

过滤表达式左侧的值既可以是 Collection 字段名称（例如下文示例中的 `status`、`color` 等），也可以是指定元素索引处的 StructArray 子字段名称，例如 `filter = 'struct[0][subfield] > 10'`。

有关 StructArray 字段中标量过滤的详细信息，请参阅 [StructArray 操作符](./struct-array-filtering)。

</Admonition>

## 比较操作符\{#comparison-operators}

比较操作符用于根据相等、不等或大小关系过滤数据，适用于数值字段和文本字段。

### 支持的比较操作符\{#supported-comparison-operators}

- `==`（等于）

- `!=`（不等于）

- `>`（大于）

- `<`（小于）

- `>=`（大于或等于）

- `<=`（小于或等于）

### 示例 1：使用等于（`==`）操作符过滤\{#example-1-filtering-with-equal-to}

假设有一个名为 `status` 的字段，您需要查找 `status` 为 "active" 的所有实体。可以使用等于操作符 `==`：

```python
filter = 'status == "active"'
```

### 示例 2：使用不等于（`!=`）操作符过滤\{#example-2-filtering-with-not-equal-to}

要查找 `status` 不为 "inactive" 的实体：

```python
filter = 'status != "inactive"'
```

### 示例 3：使用大于（`>`）操作符过滤\{#example-3-filtering-with-greater-than-greater}

要查找 `age` 大于 30 的所有实体：

```python
filter = 'age > 30'
```

### 示例 4：使用小于（`<`）操作符过滤\{#example-4-filtering-with-less-than}

要查找 `price` 小于 100 的实体：

```python
filter = 'price < 100'
```

### 示例 5：使用大于或等于（`>=`）操作符过滤\{#example-5-filtering-with-greater-than-or-equal-to-greater}

要查找 `rating` 大于或等于 4 的所有实体：

```python
filter = 'rating >= 4'
```

### 示例 6：使用小于或等于（`<=`）操作符过滤\{#example-6-filtering-with-less-than-or-equal-to}

要查找 `discount` 小于或等于 10% 的实体：

```python
filter = 'discount <= 10'
```

## 范围操作符\{#range-operators}

范围操作符用于根据一组特定值过滤数据。Zilliz Cloud 支持使用 `IN` 检查值是否属于指定集合。

要查找 `color` 为 "red"、"green" 或 "blue" 的所有实体：

```python
filter = 'color in ["red", "green", "blue"]'
```

需要检查某个值是否属于值列表时，这种方法非常有用。

## 模式匹配操作符\{#pattern-matching-operators}

模式匹配操作符用于根据通配符模式或正则表达式过滤字符串值。

- `LIKE`：用于匹配字符串值中的简单通配符模式。例如，`name LIKE "Prod%"` 可以匹配以 `Prod` 开头的值。

- `=~`：使用 RE2 正则表达式匹配字符串值。例如，`code =~ "E[0-9]{4}"` 可以匹配包含 `E1001` 等错误代码的值。

- `!~`：排除与 RE2 正则表达式匹配的字符串值，等同于 `NOT (field =~ "pattern")`。

要查找 `name` 以 `Prod` 开头的实体：

```python
filter = 'name LIKE "Prod%"'
```

要查找 `code` 中包含 `E1001` 等错误代码的实体：

```python
filter = 'code =~ "E[0-9]{4}"'
```

要排除 `message` 以 `DEBUG` 开头的实体：

```python
filter = 'message !~ "^DEBUG"'
```

有关如何选择 `LIKE` 或正则表达式，以及支持的字段类型、正则表达式语法、转义规则和性能等详细信息，请参阅[模式匹配](./pattern-match)。Zilliz Cloud 还支持在 `VARCHAR` 字段或 JSON 字符串路径上构建 `NGRAM` 索引，以加速符合条件的模式匹配过滤。有关详细信息，请参阅 [NGRAM](./ngram-index-type)。

## 算术操作符\{#arithmetic-operators}

算术操作符用于根据数值字段的计算结果构建过滤条件。

### 支持的算术操作符\{#supported-arithmetic-operators}

- `+`（加法）

- `-`（减法）

- `*`（乘法）

- `/`（除法）

- `%`（取模）

- `**`（幂运算）

### 示例 1：使用取模（`%`）操作符\{#example-1-using-modulus-percent}

要查找 `id` 为偶数（即能被 2 整除）的实体：

```python
filter = 'id % 2 == 0'
```

### 示例 2：使用幂运算（`**`）操作符\{#example-2-using-exponentiation}

要查找 `price` 的平方大于 1000 的实体：

```python
filter = 'price ** 2 > 1000'
```

## 按位操作符\{#bitwise-operators}

当整数值用于编码权限、功能开关或状态位等多个标志时，按位操作符非常有用。您可以在过滤表达式中使用这些操作符，检查、组合或比较整数值中的各个位。

对于标量字段，按位操作符适用于 `INT8`、`INT16`、`INT32` 和 `INT64` 等整数字段类型。

### 支持的按位操作符\{#supported-bitwise-operators}

| **操作符** | **名称** | **典型用途** |
| --- | --- | --- |
| `&` | 按位与 | 检查特定位是否已设置。 |
| `\|` | 按位或 | 在比较前组合多个位。 |
| `^` | 按位异或 | 比较两个值之间不同的位。 |

### 示例：按权限位过滤\{#example-filtering-by-permission-bits}

假设有一个名为 `permissions` 的整数字段，其中每一位分别代表一个权限标志：

| **权限标志** | **位值** |
| --- | --- |
| `READ` | `1` |
| `WRITE` | `2` |
| `SHARE` | `4` |
| `ADMIN` | `8` |

例如，`permissions = 5` 表示 `READ` 和 `SHARE` 位已设置，因为 `5 = 1 + 4`。

要查找已设置 `SHARE` 位的实体，请使用按位与（`&`）：

```python
filter = "(permissions & 4) == 4"
```

要查找设置 `WRITE` 位后得到 `READ + WRITE + SHARE` 权限组合的实体，请使用按位或（`|`）：

```python
filter = "(permissions | 2) == 7"
```

要查找权限位与 `READ + WRITE + SHARE` 仅相差 `WRITE` 位的实体，请使用按位异或（`^`）：

```python
filter = "(permissions ^ 7) == 2"
```

注意：在比较结果前，始终需要用括号包裹按位运算，例如 `(permissions & 4) == 4`。

## 逻辑操作符\{#logical-operators}

逻辑操作符用于将多个条件组合成更复杂的过滤表达式，包括 `AND`、`OR` 和 `NOT`。

### 支持的逻辑操作符\{#logical-operators}

- `AND`：组合多个必须全部为真的条件。

- `OR`：组合多个条件，其中至少一个条件必须为真。

- `NOT`：对条件取反。

### 示例 1：使用 `AND` 组合条件\{#example-1-using-and-to-combine-conditions}

要查找 `price` 大于 100 且 `stock` 大于 50 的所有产品：

```python
filter = 'price > 100 AND stock > 50'
```

### 示例 2：使用 `OR` 组合条件\{#example-2-using-or-to-combine-conditions}

要查找 `color` 为 "red" 或 "blue" 的所有产品：

```python
filter = 'color == "red" OR color == "blue"'
```

### 示例 3：使用 `NOT` 排除条件\{#example-3-using-not-to-exclude-a-condition}

要查找 `color` 不为 "green" 的所有产品：

```python
filter = 'NOT color == "green"'
```

## IS NULL 和 IS NOT NULL 操作符\{#is-null-and-is-not-null-operators}

`IS NULL` 和 `IS NOT NULL` 操作符用于根据字段是否包含 null 值（即缺少数据）进行过滤。

- `IS NULL`：查找指定字段包含 null 值（即值缺失或未定义）的实体。

- `IS NOT NULL`：查找指定字段包含 null 以外的任意值（即字段具有有效定义值）的实体。

<Admonition type="info" icon="📘" title="说明">

这些操作符不区分大小写，因此可以使用 `IS NULL` 或 `is null`，也可以使用 `IS NOT NULL` 或 `is not null`。

</Admonition>

### 包含 Null 值的常规标量字段\{#regular-scalar-fields-with-null-values}

Zilliz Cloud 支持对包含 null 值的常规标量字段（例如字符串或数值字段）进行过滤。

<Admonition type="info" icon="📘" title="说明">

空字符串 `""` 不会被视为 `VARCHAR` 字段的 null 值。

</Admonition>

要检索 `description` 字段为 null 的实体：

```python
filter = 'description IS NULL'
```

要检索 `description` 字段不为 null 的实体：

```python
filter = 'description IS NOT NULL'
```

要检索 `description` 字段不为 null 且 `price` 字段大于 10 的实体：

```python
filter = 'description IS NOT NULL AND price > 10'
```

### 包含 Null 值的 JSON 字段\{#json-fields-with-null-values}

Zilliz Cloud 支持对包含 null 值的 JSON 字段进行过滤。在以下情况下，JSON 字段会被视为 null：

- 整个 JSON 对象被显式设置为 None（null），例如 `{"metadata": None}`。

- Entity 中完全缺少该 JSON 字段。

<Admonition type="info" icon="📘" title="说明">

如果 JSON 对象中的部分元素（例如单个键）为 null，该字段仍会被视为非 null。例如，`\{"metadata": \{"category": None, "price": 99.99}}` 不会被视为 null，即使其中的 `category` 键为 null。

</Admonition>

为了进一步说明 Zilliz Cloud 如何处理包含 null 值的 JSON 字段，请考虑以下带有 JSON 字段 `metadata` 的示例数据：

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

**示例 1：检索** `metadata` **为 null 的实体**

要查找 `metadata` 字段缺失或被显式设置为 None 的实体：

```python
filter = 'metadata IS NULL'

# Example output:
# data: [
#     "{'metadata': None, 'pk': 2}",
#     "{'metadata': None, 'pk': 3}"
# ]
```

**示例 2：检索** `metadata` **不为 null 的实体**

要查找 `metadata` 字段不为 null 的实体：

```python
filter = 'metadata IS NOT NULL'

# Example output:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

### 包含 Null 值的 ARRAY 字段\{#array-fields-with-null-values}

Zilliz Cloud 支持对包含 null 值的 ARRAY 字段进行过滤。在以下情况下，ARRAY 字段会被视为 null：

- 整个 ARRAY 字段被显式设置为 None（null），例如 `"tags": None`。

- Entity 中完全缺少该 ARRAY 字段。

<Admonition type="info" icon="📘" title="说明">

ARRAY 字段不能包含部分 null 值，因为 ARRAY 字段中的所有元素必须具有相同的数据类型。有关详细信息，请参阅 [Array 类型](./use-array-fields)。

</Admonition>

为了进一步说明 Zilliz Cloud 如何处理包含 null 值的 ARRAY 字段，请考虑以下带有 ARRAY 字段 `tags` 的示例数据：

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

**示例 1：检索** `tags` **为 null 的实体**

要检索 `tags` 字段缺失或被显式设置为 `None` 的实体：

```python
filter = 'tags IS NULL'

# Example output:
# data: [
#     "{'tags': None, 'ratings': [4, 5], 'embedding': [0.78, 0.91, 0.23], 'pk': 2}",
#     "{'tags': None, 'ratings': [9, 5], 'embedding': [0.18, 0.11, 0.23], 'pk': 3}"
# ]
```

**示例 2：检索** `tags` **不为 null 的实体**

要检索 `tags` 字段不为 null 的实体：

```python
filter = 'tags IS NOT NULL'

# Example output:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

## 在 JSON 和 ARRAY 字段中使用基本操作符的注意事项\{#tips-on-using-basic-operators-with-json-and-array-fields}

Zilliz Cloud 集群 中的基本操作符用途广泛，不仅适用于标量字段，也可以有效应用于 JSON 和 ARRAY 字段中的键和索引。

例如，如果 `product` 字段包含 `price`、`model` 和 `tags` 等多个键，应始终直接引用目标键：

```python
filter = 'product["price"] > 1000'
```

要查找温度记录数组中第一个温度值超过指定数值的记录，可以使用：

```python
filter = 'history_temperatures[0] > 30'
```

## 总结\{#conclusion}

Zilliz Cloud 提供了多种基本操作符，使您可以灵活地过滤和查询数据。通过组合比较、范围、算术和逻辑操作符，您可以构建功能强大的过滤表达式，缩小搜索结果范围并高效检索所需数据。

## 常见问题\{#faq}

**过滤条件中的匹配值列表是否有长度限制（例如** `filter='color in ["red", "green", "blue"]'`**）？列表过长时应该怎么办？**

Zilliz Cloud 不限制过滤条件中匹配值列表的长度。但是，列表过长会显著影响查询性能。
如果过滤条件包含很长的匹配值列表，或包含大量元素的复杂表达式，建议使用[过滤表达式模板](./filtering-templating)来提升查询性能。