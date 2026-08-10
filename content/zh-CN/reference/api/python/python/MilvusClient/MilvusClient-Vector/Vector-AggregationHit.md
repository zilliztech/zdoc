---
title: "AggregationHit | Python | MilvusClient"
slug: /python/python/Vector-AggregationHit
sidebar_label: "AggregationHit"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`AggregationHit` 表示在 `AggregationBucket` 中作为代表性命中的一个 Entity。PyMilvus 会根据服务器响应创建这些对象；应用程序不会直接构造它们。 | Python | MilvusClient"
type: docx
token: SSsbdMWqsoapZ8xQSRtcOXdInAh
sidebar_position: 12
keywords: 
  - 幻觉 llm
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - zilliz
  - zilliz cloud
  - 云
  - AggregationHit
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# AggregationHit

`AggregationHit` 表示在 `AggregationBucket` 中作为代表性命中的一个 Entity。PyMilvus 会根据服务器响应创建这些对象；应用程序不会直接构造它们。

```python
class pymilvus.AggregationHit
```

## 属性和方法\{#properties-and-methods}

- **pk** (*int | str | None*) -

    Entity 主键。

- **score** (*float*) -

    为该 Entity 返回的向量相似度分数或距离。

- **fields** (*dict[str, Any]*) -

    按字段名称作为键组织的请求输出字段。

- **field_ids()** (*dict[str, int]*) -

    返回一个映射，将每个返回的字段名称映射到其数字 Schema 字段 ID。

`fields` 和 `field_ids()` 映射都是副本。更改它们不会修改该命中对象。

## 示例\{#example}

```python
bucket = result.agg_buckets[0][0]

for hit in bucket.hits:
    print(hit.pk)
    print(hit.score)
    print(hit.fields)
    print(hit.field_ids())
```
