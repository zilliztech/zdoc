---
title: "SearchAggregation | Python | MilvusClient"
slug: /python/python/Vector-SearchAggregation
sidebar_label: "SearchAggregation"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "SearchAggregation 实例定义向量搜索的一级桶聚合。 | Python | MilvusClient"
type: docx
token: Ccr8dU36Lo7Wz9xhDozcrtGenAd
sidebar_position: 14
keywords: 
  - ANNS
  - 向量搜索
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - 云
  - SearchAggregation
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# SearchAggregation

SearchAggregation 实例定义向量搜索的一级桶聚合。

## 请求语法\{#request-syntax}

```python
__init__(
    fields: List[str],
    size: int,
    metrics: Optional[Dict[str, Dict[str, str]]] = None,
    order: Optional[List[Dict[str, str]]] = None,
    top_hits: Optional[TopHits] = None,
    sub_aggregation: Optional[SearchAggregation] = None
)
```

**参数：**

- **fields**（*list[str]*）-

    **[必需]**

    形成桶键的非空标量字段名列表。多个字段按列表顺序形成复合键。不接受 `meta["region"]` 等 JSON 路径。

- **size**（*int*）-

    **[必需]**

    此聚合级别返回的最大桶数。该值必须为正整数。

- **metrics**（*dict[str, dict[str, str]] | None*）-

    每个桶的指标定义。每个键是一个指标别名，每个值是一个单键字典，格式为 \{operation: field}。支持的操作包括 count、sum、avg、min 和 max。

- **order**（*list[dict[str, str]] | None*）-

    桶排序规则，按列表顺序计算。每个项必须包含一个指标别名、_count 或 _key，并映射到 "asc" 或 "desc"。

- **top_hits**（*TopHits | None*）-

    配置从每个桶返回的代表性 Entity。

- **sub_aggregation**（*SearchAggregation | None*）-

    当前级别下每个桶的嵌套桶级别。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时引发。请检查服务器错误消息以获取确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import MilvusClient, SearchAggregation, TopHits

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
agg = SearchAggregation(
    fields=["category"],
    size=10,
    top_hits=TopHits(size=3),
)
results = client.search(
    collection_name="docs",
    data=[[0.1, 0.2]],
    limit=100,
    search_aggregation=agg,
)
```
