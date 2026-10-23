---
title: "AggregationBucket | Python | MilvusClient"
slug: /python/python/Vector-AggregationBucket
sidebar_label: "AggregationBucket"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Bucket インスタンスは、SearchAggregation の結果に含まれる 1 つの集約バケットであり、グループ化キー、メトリクスごとの値、件数、ヒット、およびネストされたサブグループを保持します。 | Python | MilvusClient"
type: docx
token: PK8NdNMMnonB66xrVDbcTYdZnah
sidebar_position: 11
keywords: 
  - 字句検索
  - 最近傍探索
  - Agentic RAG
  - RAG LLM アーキテクチャ
  - zilliz
  - zilliz cloud
  - クラウド
  - AggregationBucket
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# AggregationBucket

Bucket インスタンスは、SearchAggregation の結果に含まれる 1 つの集約バケットであり、グループ化キー、メトリクスごとの値、件数、ヒット、およびネストされたサブグループを保持します。

**値:**

- `key`

    このバケットの複合グループ化キーです。辞書のリストであり、各辞書は 1 つのグループ化フィールドの field_name、field_id、および value を保持します。

- `count`

    検索プール内でこのバケットに含まれるドキュメントの総数です。

- `metrics`

    メトリクスのエイリアスをキーとする、このバケットのメトリクス値です。各値は int、float、string、または boolean です。

- `hits`

    このバケットのトップヒットドキュメントのスナップショットは、[AggregationHit](./Vector-AggregationHit) オブジェクトとして表されます。集約レベルに top_hits がない場合、リストは空です。

- `sub_groups`

    次の集約レベルで再帰的にネストされた、このバケットの子バケットです。リーフレベルでは、リストは空です。

## 例\{#examples}

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
