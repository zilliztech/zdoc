---
title: "TopHits | Python | MilvusClient"
slug: /python/python/Vector-TopHits
sidebar_label: "TopHits"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`TopHits` 实例定义了搜索聚合中从每个分桶返回的代表性命中结果。它指定每个分桶返回多少条命中结果，并可选择指定如何在每个分桶内对命中结果进行排序。 | Python | MilvusClient"
type: docx
token: EgeGdZL4LoCuv2xVUfFc9eDAnkd
sidebar_position: 11
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - TopHits
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# TopHits

`TopHits` 实例定义了搜索聚合中从每个分桶返回的代表性命中结果。它指定每个分桶返回多少条命中结果，并可选择指定如何在每个分桶内对命中结果进行排序。

此草稿基于 Search Aggregation API 设计输入编写。在发布前，请根据 PyMilvus 源码核实最终的构造函数签名、导入路径、校验规则和属性名称。

```python
class pymilvus.TopHits
```

## Constructor\{#constructor}

构造一个可在 `GroupBy` 对象中使用的 `TopHits` 对象。

```python
TopHits(
    size: int,
    sort: list[dict[str, str]] | None = None,
)
```

**PARAMETERS:**

- **size** (*int*) -

    **[REQUIRED]**

    从每个分桶返回的代表性命中结果数量。

    例如，`TopHits(size=3)` 会从每个分桶返回最多 3 条命中结果。

- **sort** (*list[dict[str, str]] | None*) -

    命中级别的排序规则列表。

    每个条目定义一个字段和一个排序方向：

    ```python
    sort=[{"field": "rating", "order": "desc"}]
    ```

    `field` 的值必须是文档级字段或 `_score`。`order` 的值必须是 `asc` 或 `desc`。

    `sort` 仅控制分桶内命中结果的顺序。它不会影响返回哪些分桶、分桶的排序方式，或如何计算每个分桶的指标。

    如果省略 `sort`，命中结果将按向量相似度分数排序。

**RETURN TYPE:**

*TopHits*

**RETURNS:**

一个 `TopHits` 对象。

**EXCEPTIONS:**

- **ParamError**

    当 `TopHits` 规范无效时，可能会引发此异常。例如，`size` 不是正数、排序方向不受支持、排序字段不受支持，或在 `sort` 中使用了分桶级指标别名。

    最终异常类型仍需等待 SDK 确认。

## Examples\{#examples}

```python
from pymilvus import GroupBy, TopHits

# Return the top 3 hits from each bucket by vector similarity score.
group_by = GroupBy(
    fields=["brand"],
    size=10,
    top_hits=TopHits(size=3),
)

# Return the 3 highest-rated hits from each bucket.
group_by = GroupBy(
    fields=["brand"],
    size=10,
    top_hits=TopHits(
        size=3,
        sort=[{"field": "rating", "order": "desc"}],
    ),
)

# Return only bucket keys and metrics by omitting TopHits.
group_by = GroupBy(
    fields=["brand"],
    size=10,
    metrics={
        "item_count": {"count": "*"},
        "avg_price": {"avg": "price"},
    },
    order=[{"avg_price": "desc"}],
)
```
