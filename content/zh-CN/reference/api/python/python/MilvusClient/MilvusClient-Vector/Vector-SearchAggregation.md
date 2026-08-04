---
title: "SearchAggregation | Python | MilvusClient"
slug: /python/python/Vector-SearchAggregation
sidebar_label: "SearchAggregation"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`SearchAggregation` 实例为向量搜索定义一个桶聚合层级。它控制桶键、桶数量上限、每个桶的指标、桶排序、代表性命中结果以及可选的嵌套聚合。 | Python | MilvusClient"
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

`SearchAggregation` 实例为向量搜索定义一个桶聚合层级。它控制桶键、桶数量上限、每个桶的指标、桶排序、代表性命中结果以及可选的嵌套聚合。

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

    由标量字段名称组成的非空列表，用于构成桶键。多个字段会按列表顺序组成复合键。不接受 JSON 路径，例如 `meta["region"]`。

- **size** (*int*) **[REQUIRED]** -

    此聚合层级返回的最大桶数。该值必须为正整数。

- **metrics** (*dict[str, dict[str, str]] | None*) -

    每个桶的指标定义。每个键都是指标别名，每个值都是形如 `{operation: field}` 的单键字典。支持的操作包括 `count`、`sum`、`avg`、`min` 和 `max`。只有 `count` 接受 `"*"`；其他操作要求使用字段名或 `_score`。

- **order** (*list[dict[str, str]] | None*) -

    按列表顺序依次评估的桶排序规则。每个项必须包含一个指标别名、`_count` 或 `_key`，并映射到 `"asc"` 或 `"desc"`。

- **top_hits** (*TopHits | None*) -

    配置从每个桶返回的代表性实体。

- **sub_aggregation** (*SearchAggregation | None*) -

    定义当前层级中每个桶下的嵌套桶层级。

**返回类型：**

*SearchAggregation*

**异常：**

- **ParamError** - 在字段为空或无效、`size` 非正、指标定义不受支持、排序键或排序方向无效，或对象类型错误时引发。

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
