---
title: "GroupBy | Python | MilvusClient"
slug: /python/python/Vector-GroupBy
sidebar_label: "GroupBy"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`GroupBy` 实例定义了搜索聚合中的一个分桶层级。它指定哪些字段构成桶键、返回多少个桶、为每个桶计算哪些指标、如何对桶排序、是否返回代表性命中，以及是否创建嵌套的子桶。 | Python | MilvusClient"
type: docx
token: CFS4dOq2LowXPSxB124cBwQsn0c
sidebar_position: 10
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - GroupBy
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# GroupBy

`GroupBy` 实例定义了搜索聚合中的一个分桶层级。它指定哪些字段构成桶键、返回多少个桶、为每个桶计算哪些指标、如何对桶排序、是否返回代表性命中，以及是否创建嵌套的子桶。

本草稿基于 Search Aggregation API 设计输入编写。在发布前，请根据 PyMilvus 源码核实最终的构造函数签名、导入路径、校验规则和属性名称。

```python
class pymilvus.GroupBy
```

## Constructor\{#constructor}

构造一个 `GroupBy` 对象，以便在 `MilvusClient.search(group_by=...)` 中使用。

```python
GroupBy(
    fields: list[str],
    size: int,
    metrics: dict[str, dict] | None = None,
    order: list[dict[str, str]] | None = None,
    top_hits: TopHits | None = None,
    sub_group: GroupBy | None = None,
)
```

**PARAMETERS:**

- **fields** (*list[str]*) -

    **[REQUIRED]**

    构成此聚合层级桶键的字段名称列表。

    单个字段会为每个字段值创建一个桶。多个字段会创建复合桶键。例如，`fields=["brand", "color"]` 会为每个 `(brand, color)` 组合创建一个桶。

- **size** (*int*) -

    **[REQUIRED]**

    此聚合层级返回的桶的最大数量。

    对于根 `GroupBy`，该值控制顶层桶的数量。对于嵌套的 `GroupBy`，该值控制每个父桶下返回的子桶数量。

- **metrics** (*dict[str, dict] | None*) -

    定义每个桶指标的字典。

    字典键是指标别名。字典值定义一个指标操作及其输入字段。

    ```python
    metrics={
        "item_count": {"count": "*"},
        "avg_price": {"avg": "price"},
        "best_score": {"max": "_score"},
    }
    ```

    Phase 1 支持的操作包括：

    - `count`

    - `sum`

    - `avg`

    - `min`

    - `max`

    特殊字段 `_score` 表示向量相似度分数。在当前设计中，`_score` 可与 `avg`、`sum`、`min` 和 `max` 搭配使用。

- **order** (*list[dict[str, str]] | None*) -

    桶排序规则列表。

    每个条目包含一个排序键和一个排序方向。方向必须为 `asc` 或 `desc`。

    ```python
    order=[{"avg_price": "desc"}, {"_count": "desc"}]
    ```

    有效的排序键包括：

    - 在同一 `GroupBy` 层级的 `metrics` 中定义的指标别名。

    - `_count`，按桶中由 ANN 检索到的实体数量对桶进行排序。

    - `_key`，按桶键值对桶进行排序。

    桶排序既控制哪些桶会出现在前 `size` 个结果中，也控制这些桶的返回顺序。

    早期设计输入对 `order` 使用的是 `dict[str, str]`。当前工作假设为 `list[dict[str, str]]`，以保留显式的多条件排序。请根据最终 SDK 核实这一点。

- **top_hits** (*[TopHits](https://TopHits.md) | None*) -

    `TopHits` 对象，用于定义在此层级中从每个桶返回的代表性命中。

    如果省略此参数，则此层级仅返回桶键、指标和子分组。对于纯聚合层级，省略 `top_hits` 很有用。

- **sub_group** (*GroupBy | None*) -

    子 `GroupBy` 对象，用于定义此层级中每个桶下的嵌套分组。

    每个嵌套层级都有自己的 `fields`、`size`、`metrics`、`order` 和 `top_hits`。

**RETURN TYPE:**

*GroupBy*

**RETURNS:**

一个 `GroupBy` 对象。

**EXCEPTIONS:**

- **ParamError**

    当 `GroupBy` 规范无效时，可能会引发此异常。示例包括缺少必需字段、`size` 非正数、`order` 键未引用指标别名或保留键、不支持的指标操作、不支持的字段类型，或嵌套深度过大。

    最终异常类型仍待 SDK 确认。

## Examples\{#examples}

```python
from pymilvus import GroupBy, TopHits

# Group by a single field and return representative hits.
group_by = GroupBy(
    fields=["brand"],
    size=10,
    top_hits=TopHits(size=3),
)

# Group by a composite key, compute metrics, and order buckets by a metric.
group_by = GroupBy(
    fields=["brand", "color"],
    size=10,
    metrics={
        "item_count": {"count": "*"},
        "avg_price": {"avg": "price"},
    },
    order=[{"avg_price": "desc"}, {"_count": "desc"}],
    top_hits=TopHits(
        size=3,
        sort=[{"field": "rating", "order": "desc"}],
    ),
)

# Create nested buckets.
group_by = GroupBy(
    fields=["category"],
    size=5,
    metrics={"total_revenue": {"sum": "price"}},
    order=[{"total_revenue": "desc"}],
    sub_group=GroupBy(
        fields=["brand"],
        size=3,
        metrics={"avg_rating": {"avg": "rating"}},
        order=[{"avg_rating": "desc"}],
        top_hits=TopHits(size=3),
    ),
)
```
