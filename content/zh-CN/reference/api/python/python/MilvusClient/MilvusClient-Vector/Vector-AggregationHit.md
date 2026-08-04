---
title: "AggregationHit | Python | MilvusClient"
slug: /python/python/Vector-AggregationHit
sidebar_label: "AggregationHit"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`AggregationHit` 表示作为 `AggregationBucket` 中代表性命中的一个返回实体。PyMilvus 会根据服务器响应创建这些对象；应用程序不会直接构造它们。 | Python | MilvusClient"
type: docx
token: SSsbdMWqsoapZ8xQSRtcOXdInAh
sidebar_position: 12
keywords: 
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - zilliz
  - zilliz cloud
  - cloud
  - AggregationHit
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# AggregationHit

`AggregationHit` 表示作为 `AggregationBucket` 中代表性命中的一个返回实体。PyMilvus 会根据服务器响应创建这些对象；应用程序不会直接构造它们。

```python
class pymilvus.AggregationHit
```

## 属性和方法\{#properties-and-methods}

- **pk** (*int | str | None*) -

    实体的主键。

- **score** (*float*) -

    为该实体返回的向量相似度分数或距离。

- **fields** (*dict[str, Any]*) -

    以字段名为键的已请求输出字段。

- **field_ids()** (*dict[str, int]*) -

    返回一个映射，将每个返回字段名映射到其对应的数字 schema 字段 ID。

`fields` 和 `field_ids()` 映射都是副本。修改它们不会改变 hit 对象。

## 示例\{#example}

```python
bucket = result.agg_buckets[0][0]

for hit in bucket.hits:
    print(hit.pk)
    print(hit.score)
    print(hit.fields)
    print(hit.field_ids())
```
