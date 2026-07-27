---
title: "AggregationHit | Python | MilvusClient"
slug: /python/python/Vector-AggregationHit
sidebar_label: "AggregationHit"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`AggregationHit` は、`AggregationBucket` 内の代表的なヒットとして返される 1 つのエンティティを表します。PyMilvus はサーバー応答からこれらのオブジェクトを作成し、アプリケーションが直接構築することはありません。 | Python | MilvusClient"
type: docx
token: SSsbdMWqsoapZ8xQSRtcOXdInAh
sidebar_position: 12
keywords: 
  - llm のハルシネーション
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
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

`AggregationHit` は、`AggregationBucket` 内の代表的なヒットとして返される 1 つのエンティティを表します。PyMilvus はサーバー応答からこれらのオブジェクトを作成し、アプリケーションが直接構築することはありません。

```python
class pymilvus.AggregationHit
```

## プロパティとメソッド\{#properties-and-methods}

- **pk** (*int | str | None*) -

    エンティティの主キー。

- **score** (*float*) -

    エンティティに対して返されるベクトル類似度スコアまたは距離。

- **fields** (*dict[str, Any]*) -

    フィールド名をキーとする、要求された出力フィールド。

- **field_ids()** (*dict[str, int]*) -

    返された各フィールド名から、その数値のスキーマフィールド ID へのマッピングを返します。

`fields` と `field_ids()` のマッピングはコピーです。これらを変更しても hit オブジェクトは変更されません。

## 例\{#example}

```python
bucket = result.agg_buckets[0][0]

for hit in bucket.hits:
    print(hit.pk)
    print(hit.score)
    print(hit.fields)
    print(hit.field_ids())
```
