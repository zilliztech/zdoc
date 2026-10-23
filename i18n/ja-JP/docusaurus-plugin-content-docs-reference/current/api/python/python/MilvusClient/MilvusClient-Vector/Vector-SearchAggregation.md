---
title: "SearchAggregation | Python | MilvusClient"
slug: /python/python/Vector-SearchAggregation
sidebar_label: "SearchAggregation"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "SearchAggregation インスタンスは、ベクトル検索用のバケット集計の 1 レベルを定義します。 | Python | MilvusClient"
type: docx
token: Ccr8dU36Lo7Wz9xhDozcrtGenAd
sidebar_position: 16
keywords: 
  - ANNS
  - ベクトル検索
  - kNN アルゴリズム
  - HNSW
  - zilliz
  - zilliz cloud
  - クラウド
  - SearchAggregation
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# SearchAggregation

SearchAggregation インスタンスは、ベクトル検索用のバケット集計の 1 レベルを定義します。

## リクエスト構文\{#request-syntax}

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

**パラメーター:**

- **fields** (*list[str]*) -

    **[必須]**

    バケットキーを形成する、空でないスカラーフィールド名のリストです。複数のフィールドは、リストの順序で複合キーを形成します。`meta["region"]` などの JSON パスは受け入れられません。

- **size** (*int*) -

    **[必須]**

    この集計レベルで返されるバケットの最大数です。値は正の整数である必要があります。

- **metrics** (*dict[str, dict[str, str]] | None*) -

    バケットごとのメトリクス定義です。各キーはメトリクスのエイリアスで、各値は \{operation: field} 形式の単一キーの辞書です。サポートされるオペレーションは count、sum、avg、min、max です。

- **order** (*list[dict[str, str]] | None*) -

    リストの順序で評価されるバケットの並べ替えルールです。各項目には、1 つのメトリクスエイリアス、_count、または _key を含め、これを "asc" または "desc" にマッピングする必要があります。

- **top_hits** (*TopHits | None*) -

    各バケットから返される代表エンティティを設定します。

- **sub_aggregation** (*SearchAggregation | None*) -

    現在のレベルの各バケットの下にあるネストされたバケットレベルです。

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

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
