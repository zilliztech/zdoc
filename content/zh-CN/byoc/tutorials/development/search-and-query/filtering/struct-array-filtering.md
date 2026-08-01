---
title: "StructArray 操作符 | BYOC"
slug: /struct-array-filtering
sidebar_label: "StructArray 操作符"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray 操作符通过评估 StructArray Field 内标量子字段上的谓词来过滤 Entity。本页可作为 `elementfilter` 和 `MATCH` 操作符族的语法参考。 | BYOC"
type: origin
token: EjCRwxStKi4e0xkFoo6c82HynMd
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray 操作符

StructArray 操作符通过评估 StructArray Field 内标量子字段上的谓词来过滤 Entity。本页可作为 `element_filter` 和 `MATCH_*` 操作符族的语法参考。

StructArray 过滤包含两个操作符族：

| 操作符族 | 主要用途 | 结果行为 |
| --- | --- | --- |
| `element_filter` | 匹配满足标量谓词的 Struct 元素。 | 在 Element-level Search 中，匹配命中可以包含元素 offset。在 Row-level Query 或过滤搜索中，结果形态取决于 API 和输出字段。 |
| `MATCH_*` | 根据有多少个 Struct 元素满足标量谓词来选择 Entity。 | Row-level 过滤。这些操作符本身不返回元素 offset。 |

StructArray 操作符应使用标量子字段。Vector 子字段由向量搜索路径使用，不能作为标量谓词输入。

## 何时使用哪个操作符\{#when-to-use-which-operator}

| 目标 | 使用方式 |
| --- | --- |
| 将 Element-level Vector Search 限制到满足标量条件的元素。 | `element_filter` |
| 在同一个 Struct 元素内匹配多个标量条件。 | `element_filter` |
| 只返回至少有一个 Struct 元素满足谓词的 Entity。 | `MATCH_ANY` |
| 只返回所有 Struct 元素都满足谓词的 Entity。 | `MATCH_ALL` |
| 只返回至少、至多或恰好有 `N` 个 Struct 元素满足谓词的 Entity。 | `MATCH_LEAST`、`MATCH_MOST` 或 `MATCH_EXACT` |

## Element Filter\{#element-filter}

使用 `element_filter(structArrayField, predicate)` 匹配 StructArray Field 中的 Struct 元素。

在谓词内部，使用 `$[subfield]` 引用当前 Struct 元素的标量子字段。

```python
element_filter(chunks, $[section] == "index")
```

当谓词内部使用多个条件时，所有 `$[subfield]` 引用都作用于同一个 Struct 元素：

```python
element_filter(chunks, $[section] == "index" && $[quality_score] > 0.9)
```

将 Entity-level 谓词与 `element_filter` 组合使用时，请把 `element_filter` 放在表达式末尾：

```python
# Correct
category == "index" && element_filter(chunks, $[quality_score] > 0.9)

# Incorrect
element_filter(chunks, $[quality_score] > 0.9) && category == "index"
```

`element_filter` 在一个过滤表达式中只能出现一次。不要在另一个 `element_filter` 中嵌套 `element_filter` 或 `MATCH_*`。

## Match 系列操作符\{#match-family-operators}

当需要根据有多少个 Struct 元素满足谓词来选择 Entity 时，请使用 `MATCH_*` 操作符。

| 操作符 | 含义 |
| --- | --- |
| `MATCH_ANY(field, predicate)` | 至少一个 Struct 元素满足谓词。 |
| `MATCH_ALL(field, predicate)` | 所有 Struct 元素都满足谓词。 |
| `MATCH_LEAST(field, predicate, threshold=N)` | 至少 `N` 个 Struct 元素满足谓词。 |
| `MATCH_MOST(field, predicate, threshold=N)` | 至多 `N` 个 Struct 元素满足谓词。 |
| `MATCH_EXACT(field, predicate, threshold=N)` | 恰好 `N` 个 Struct 元素满足谓词。 |

`MATCH_ANY` 和 `element_filter` 都可以表达至少一个 Struct 元素满足谓词。只需要 Row-level 过滤时，请使用 `MATCH_ANY`。需要 Element-level 约束时，例如过滤哪些 Struct 元素参与 Element-level Vector Search，请使用 `element_filter`。

### MATCH_ANY\{#match-any}

如果 StructArray 中至少一个元素满足谓词，`MATCH_ANY` 的求值结果为 `true`。

```python
MATCH_ANY(chunks, $[section] == "index")
```

对于空 StructArray，`MATCH_ANY` 返回 `false`。

### MATCH_ALL\{#match-all}

如果 StructArray 中每个元素都满足谓词，`MATCH_ALL` 的求值结果为 `true`。

```python
MATCH_ALL(chunks, $[has_code] == true)
```

对于空 StructArray，`MATCH_ALL` 返回 `true`。

### MATCH_LEAST\{#match-least}

如果满足谓词的元素数量大于或等于 `threshold`，`MATCH_LEAST` 的求值结果为 `true`。

```python
MATCH_LEAST(chunks, $[quality_score] > 0.9, threshold=2)
```

对于 `MATCH_LEAST`，`threshold` 必须为正整数。

### MATCH_MOST\{#match-most}

如果满足谓词的元素数量小于或等于 `threshold`，`MATCH_MOST` 的求值结果为 `true`。

```python
MATCH_MOST(chunks, $[has_code] == true, threshold=1)
```

对于 `MATCH_MOST`，`threshold` 可以为 0 或正整数。

### MATCH_EXACT\{#match-exact}

如果满足谓词的元素数量恰好等于 `threshold`，`MATCH_EXACT` 的求值结果为 `true`。

```python
MATCH_EXACT(chunks, $[section] == "filter", threshold=1)
```

对于 `MATCH_EXACT`，`threshold` 可以为 0 或正整数。

## 支持的谓词\{#supported-predicates}

`$[...]` 语法表示当前 Struct 元素的标量值。谓词支持情况取决于标量子字段类型。

| 子字段类型 | Element-level 谓词支持 |
| --- | --- |
| `BOOL` | 标量谓词，例如 `$[has_code] == true` 或 `!($[has_code] == true)`。避免使用 `$[has_code]` 这样的裸布尔表达式。 |
| `INT8`、`INT16`、`INT32`、`INT64` | 比较、链式范围、`in`、`not in`、后接比较的 `+`、`-`、`*`、`/` 或 `%` 算术表达式，以及逻辑组合。 |
| `FLOAT`、`DOUBLE` | 比较、链式范围、`in`、`not in`、后接比较的 `+`、`-`、`*` 或 `/` 算术表达式，以及逻辑组合。浮点子字段不支持 `%` 操作符。 |
| `VARCHAR` | 字符串比较、链式范围、`in`、`not in`、`like`、`=&#126;`、`!&#126;` 以及逻辑组合。 |
| Vector 子字段 | 不支持作为 `$[...]` 标量谓词输入。请通过 EmbeddingList Search 或 Element-level Vector Search 使用 Vector 子字段。 |

`&&`、`||` 和 `!` 等逻辑操作符适用于谓词表达式。例如，请写成 `!($[has_code] == true)`，而不是 `!$[has_code]`。

## 不支持的谓词\{#unsupported-predicates}

Element-level `$[...]` 谓词不支持：

- 文本匹配函数，例如 `text_match(field, "...")` 或 `phrase_match(field, "...")`。

- JSON path 语法、JSON path 上的 `exists`，或 `json_contains`、`json_contains_all`、`json_contains_any` 等 JSON 函数。

- `array_contains`、`array_contains_all`、`array_contains_any` 或 `array_length` 等数组容器函数。

- `$[subfield] is null` 或 `$[subfield] is not null`。

- Geometry / GIS 函数。

- Timestamptz 表达式。

- `random_sample(...)`。

- Field-level Vector 谓词。

- 通用过滤函数调用，除非特定函数签名和执行路径明确支持 StructArray Element-level 谓词。

## 语法规则\{#syntax-rules}

- `MATCH_*` 操作符名称不区分大小写。

- 只在 `element_filter` 或 `MATCH_*` 谓词内部使用 `$[subfield]`。

- 不要将 `$[subfield]` 用作 JSON path、数组容器或 Vector Field 引用。

- 不要在另一个 StructArray 操作符中嵌套 `element_filter` 或 `MATCH_*`。

- 对 `MATCH_LEAST`、`MATCH_MOST` 和 `MATCH_EXACT` 使用具名参数 `threshold=N`。

- 空 StructArray 上的 `MATCH_ANY` 返回 `false`。

- 空 StructArray 上的 `MATCH_ALL` 返回 `true`。

## 另请参阅\{#see-also}

- [使用 StructArray 进行过滤搜索](./filtered-search-with-struct-arrays)

- [使用 StructArray 进行基础向量搜索](./search-with-struct-array)

- [为 StructArray Field 创建 Index](./index-struct-array)

- [StructArray 限制](./struct-array-limits)

