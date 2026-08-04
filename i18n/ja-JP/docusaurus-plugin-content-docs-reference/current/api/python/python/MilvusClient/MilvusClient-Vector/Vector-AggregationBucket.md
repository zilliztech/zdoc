---
title: "AggregationBucket | Python | MilvusClient"
slug: /python/python/Vector-AggregationBucket
sidebar_label: "AggregationBucket"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`AggregationBucket` は Search Aggregation によって返される 1 つのバケットを表します。PyMilvus はサーバー応答からこれらのオブジェクトを作成し、アプリケーションが直接構築することはありません。 | Python | MilvusClient"
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

`AggregationBucket` は Search Aggregation によって返される 1 つのバケットを表します。PyMilvus はサーバー応答からこれらのオブジェクトを作成し、アプリケーションが直接構築することはありません。

```python
class pymilvus.AggregationBucket
```

## Properties\{#properties}

- **key** (*list[dict[str, Any]]*) -

    バケットキーの構成要素です。各項目には `field_name`、`field_id`、および `value` が含まれます。

- **count** (*int*) -

    バケットに割り当てられた、ANN によって取得された entity の数です。

- **metrics** (*dict[str, Any]*) -

    `SearchAggregation.metrics` で定義されたエイリアスをキーとするメトリック値です。

- **hits** (*list[AggregationHit]*) -

    `TopHits` によって選択された代表 entity です。このレベルで `top_hits` が設定されていない場合、リストは空になります。

- **sub_groups** (*list[AggregationBucket]*) -

    `sub_aggregation` によって生成されるネストされたバケットです。リーフレベルではリストは空です。

collection 値のプロパティはコピーを返すため、返されたリストや辞書を変更しても bucket オブジェクト自体は変更されません。

## Example\{#example}

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
