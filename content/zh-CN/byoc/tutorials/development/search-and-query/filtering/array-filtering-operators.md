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
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# ARRAY 操作符

Zilliz Cloud 为查询 ARRAY 字段提供了强大的操作符，使您可以根据 ARRAY 字段内容过滤和查询 Entity。

<Admonition type="info" icon="📘" title="说明">

ARRAY 字段中的所有元素必须是相同的类型，ARRAY 中的嵌套结构将被视为纯字符串。因此，在使用 ARRAY 字段时，建议避免过深的嵌套，并确保数据结构尽可能扁平，以获得最佳性能。

</Admonition>

## 支持的 ARRAY 操作符\{#available-array-operators}

ARRAY 操作符允许 Zilliz Cloud clusters中的 ARRAY 类型的字段进行精细查询。这些操作符包括：

| **操作符** | **使用场景** | **描述** |
| --- | --- | --- |
| [ARRAY_CONTAINS(identifier, expr)](./array-filtering-operators#arraycontains) | 过滤表达式 | 检查 ARRAY 字段中是否存在指定元素。 |
| [ARRAY_CONTAINS_ALL(identifier, expr)](./array-filtering-operators#arraycontainsall) | 过滤表达式 | 检查 ARRAY 字段中是否包含指定列表中的所有元素。 |
| [ARRAY_CONTAINS_ANY(identifier, expr)](./array-filtering-operators#arraycontainsany) | 过滤表达式 | 检查 ARRAY 字段中是否包含指定列表中的任一元素。 |
| [ARRAY_LENGTH(identifier)](./array-filtering-operators#arraylength) | 过滤表达式 | 返回 ARRAY 字段中的元素个数，可与比较运算符组合用于过滤。 |
| [ARRAY_APPEND](./array-filtering-operators#array-append) | 搭配 field_ops 的 upsert | 将请求负载中的元素追加到已有的 ARRAY 字段中。 |
| [ARRAY_REMOVE](./array-filtering-operators#array-remove) | 搭配 field_ops 的 upsert | 从已有的 ARRAY 字段中移除所有与请求负载中给定值相匹配的元素。 |

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

## ARRAY_APPEND\{#array-append}

ARRAY_APPEND 操作符会在一次 upsert 请求中，将负载中的元素追加到已有的 ARRAY 字段上。它不是过滤表达式。当你想向数组中追加新值、且不想先查询当前数组内容时，可以使用该操作符。

下面示例会将 `"premium"` 追加到主键为 1 的实体的 `tags` ARRAY 字段中：

```python
from pymilvus import FieldOp

client.upsert(
    collection_name="users",
    data=[{"pk": 1, "tags": ["premium"]}],
    field_ops={"tags": FieldOp.array_append()},
)
```

将 ARRAY_APPEND 附加到某个字段的 `field_ops` 中，可以为该字段启用部分更新语义。有关完整的工作流程、支持的元素类型以及相关限制，请参见[在合并模式下 upsert ARRAY 字段](./upsert-entities#upsert-entities-in-merge-mode)。

## ARRAY_REMOVE\{#array-remove}

ARRAY_REMOVE 操作符会在一次 upsert 请求中，从已有的 ARRAY 字段中移除所有与请求负载中给定值相匹配的元素。它不是过滤表达式。当你想从数组中移除匹配的值、且不想先查询当前数组内容时，可以使用该操作符。

下面示例会将 `"trial"` 从主键为 1 的实体的 `tags` ARRAY 字段中移除：

```python
from pymilvus import FieldOp

client.upsert(
    collection_name="users",
    data=[{"pk": 1, "tags": ["trial"]}],
    field_ops={"tags": FieldOp.array_remove()},
)
```

将 ARRAY_REMOVE 附加到某个字段的 `field_ops` 中，可以为该字段启用部分更新语义。有关完整的工作流程、支持的元素类型以及相关限制，请参见[在合并模式下 upsert ARRAY 字段](./upsert-entities#upsert-entities-in-merge-mode)。