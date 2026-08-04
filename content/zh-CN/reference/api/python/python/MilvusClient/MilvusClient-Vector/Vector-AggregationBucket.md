---
title: "AggregationBucket | Python | MilvusClient"
slug: /python/python/Vector-AggregationBucket
sidebar_label: "AggregationBucket"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`AggregationBucket` 表示 Search Aggregation 返回的一个桶。PyMilvus 从服务器响应中创建这些对象；应用程序不会直接构造它们。 | Python | MilvusClient"
type: docx
token: PK8NdNMMnonB66xrVDbcTYdZnah
sidebar_position: 11
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - AggregationBucket
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# AggregationBucket

`AggregationBucket` 表示 Search Aggregation 返回的一个桶。PyMilvus 从服务器响应中创建这些对象；应用程序不会直接构造它们。

```python
class pymilvus.AggregationBucket
```

## 属性\{#properties}

- **key** (*list[dict[str, Any]]*) -

    桶键组件。每一项都包含 `field_name`、`field_id` 和 `value`。

- **count** (*int*) -

    分配到该桶中的、通过 ANN 检索到的实体数量。

- **metrics** (*dict[str, Any]*) -

    以 `SearchAggregation.metrics` 中定义的别名为键的指标值。

- **hits** (*list[AggregationHit]*) -

    由 `TopHits` 选出的代表性实体。当未在此级别配置 `top_hits` 时，该列表为空。

- **sub_groups** (*list[AggregationBucket]*) -

    由 `sub_aggregation` 生成的嵌套桶。在叶子级别，该列表为空。

集合类型属性返回的是副本，因此修改返回的列表或字典不会更改 bucket 对象本身。

## 示例\{#example}

```python
result = client.search(
    collection_name="products",
    data=[query_vector],
    anns_field="embedding",
    search_aggregation=aggregation,
)

for bucket in result.agg_buckets[0]:
    print(bucket.key, bucket.count, bucket.metrics)
    for hit in bucket.hits:
        print(hit.pk, hit.score, hit.fields)
```
