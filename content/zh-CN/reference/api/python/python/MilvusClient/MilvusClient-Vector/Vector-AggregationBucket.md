---
title: "AggregationBucket | Python | MilvusClient"
slug: /python/python/Vector-AggregationBucket
sidebar_label: "AggregationBucket"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Bucket 实例是 SearchAggregation 结果中的一个聚合桶，包含分组键、各指标值、计数、命中以及嵌套子组。 | Python | MilvusClient"
type: docx
token: PK8NdNMMnonB66xrVDbcTYdZnah
sidebar_position: 11
keywords: 
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - zilliz
  - zilliz cloud
  - 云
  - AggregationBucket
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# AggregationBucket

Bucket 实例是 SearchAggregation 结果中的一个聚合桶，包含分组键、各指标值、计数、命中以及嵌套子组。

**值：**

- `key`

    此桶的复合分组键。它是一个字典列表，其中每个字典包含一个分组字段的 field_name、field_id 和 value。

- `count`

    归入此桶的检索池文档总数。

- `metrics`

    此桶的指标值，以指标别名为键。每个值均为 int、float、string 或 boolean。

- `hits`

    此桶的 top-hits 文档快照，以 [AggregationHit](./Vector-AggregationHit) 对象表示。当聚合层级没有 top_hits 时，该列表为空。

- `sub_groups`

    此桶的子桶，在下一聚合层级递归嵌套。在叶子层级，该列表为空。

## 示例\{#examples}

```python
results = client.search(
    collection_name="docs",
    data=[[0.1, 0.2]],
    search_aggregation=agg,
)
for bucket in results[0][0]["aggregation"]["buckets"]:
    print(
        bucket["key"],
        bucket["count"],
    )
```
