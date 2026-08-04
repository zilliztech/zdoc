---
title: "SearchAggregation | Python | MilvusClient"
slug: /python/python/Vector-SearchAggregation
sidebar_label: "SearchAggregation"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`SearchAggregation` 实例为向量搜索定义一个层级的桶聚合。它控制桶键、桶数量限制、每个桶的指标、桶排序、代表性命中结果以及可选的嵌套聚合。 | Python | MilvusClient"
type: docx
token: Ccr8dU36Lo7Wz9xhDozcrtGenAd
sidebar_position: 13
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - SearchAggregation
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# SearchAggregation

`SearchAggregation` 实例为向量搜索定义一个层级的桶聚合。它控制桶键、桶数量限制、每个桶的指标、桶排序、代表性命中结果以及可选的嵌套聚合。

```python
class pymilvus.SearchAggregation
```

## 构造函数\{#constructor}

```python
SearchAggregation(
    fields: list[str],
    size: int,
    metrics: dict[str, dict[str, str]] | None = None,
    order: list[dict[str, str]] | None = None,
    top_hits: TopHits | None = None,
    sub_aggregation: SearchAggregation | None = None,
)
```

**参数：**

- **fields** (*list[str]*) **[REQUIRED]** -

    由标量字段名称组成的非空列表，用作桶键。多个字段会按照列表顺序组成复合键。不接受诸如 `meta["region"]` 之类的 JSON 路径。

- **size** (*int*) **[REQUIRED]** -

    在此聚合层级返回的最大桶数。该值必须为正整数。

- **metrics** (*dict[str, dict[str, str]] | None*) -

    每个桶的指标定义。每个键都是一个指标别名，每个值都是一个仅包含单个键的字典，格式为 `{operation: field}`。支持的操作有 `count`、`sum`、`avg`、`min` 和 `max`。只有 `count` 接受 `"*"`；其他操作要求使用字段名或 `_score`。

- **order** (*list[dict[str, str]] | None*) -

    按列表顺序求值的桶排序规则。每一项必须包含一个指标别名、`_count` 或 `_key`，并映射到 `"asc"` 或 `"desc"`。

- **top_hits** (*TopHits | None*) -

    配置从每个桶中返回的代表性实体。

- **sub_aggregation** (*SearchAggregation | None*) -

    在当前层级的每个桶下定义一个嵌套桶层级。

**返回类型：**

*SearchAggregation*

**异常：**

- **ParamError** - 在以下情况下引发：`fields` 为空或无效、`size` 非正、指标定义不受支持、排序键或排序方向无效，或对象类型错误。

## 示例\{#example}

```python
from pymilvus import SearchAggregation, TopHits

aggregation = SearchAggregation(
    fields=["category"],
    size=5,
    metrics={
        "product_count": {"count": "*"},
        "avg_price": {"avg": "price"},
    },
    order=[{"product_count": "desc"}, {"_key": "asc"}],
    sub_aggregation=SearchAggregation(
        fields=["brand"],
        size=3,
        top_hits=TopHits(
            size=2,
            sort=[{"rating": "desc"}, {"_score": "desc"}],
        ),
    ),
)
```
