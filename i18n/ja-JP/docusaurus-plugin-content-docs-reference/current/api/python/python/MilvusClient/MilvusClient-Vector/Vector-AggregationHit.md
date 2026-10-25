---
title: "AggregationHit | Python | MilvusClient"
slug: /python/python/Vector-AggregationHit
sidebar_label: "AggregationHit"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Hit インスタンスは、集計バケット内の 1 つのドキュメントであり、プライマリキー、類似度スコア、出力フィールドを保持します。 | Python | MilvusClient"
type: docx
token: SSsbdMWqsoapZ8xQSRtcOXdInAh
sidebar_position: 12
keywords: 
  - hallucinations llm
  - Multimodal search
  - ベクトル search algorithms
  - Question answering system
  - zilliz
  - zilliz cloud
  - cloud
  - AggregationHit
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# AggregationHit

Hit インスタンスは、集計バケット内の 1 つのドキュメントであり、プライマリキー、類似度スコア、出力フィールドを保持します。

**メソッド:**

- `pk`

    このドキュメントのプライマリキーで、コレクションのプライマリフィールド型に応じて int または string になります。

- `score`

    このドキュメントの、バケット内での類似度スコアです。

- `fields`

    このドキュメントの出力フィールド値です。field_name をキーとし、値はサーバーによって設定されます。

- `field_ids()`

    存在するフィールドについて、field_name から field_id へのマップとして、この hit の数値 ID を表したものです。

## 例\{#examples}

```python
for hit in bucket["hits"]:
    print(
        hit["pk"],
        hit["score"],
        hit["fields"],
    )
```
