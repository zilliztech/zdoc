---
title: "SearchAggregation | Python | MilvusClient"
slug: /python/python/Vector-SearchAggregation
sidebar_label: "SearchAggregation"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`SearchAggregation` インスタンスは、vector search のためのバケット集計の1レベルを定義します。バケットキー、バケット上限、バケットごとのメトリクス、バケットの順序、代表ヒット、およびオプションのネストされた集計を制御します。 | Python | MilvusClient"
type: docx
token: Ccr8dU36Lo7Wz9xhDozcrtGenAd
sidebar_position: 13
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - SearchAggregation
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# SearchAggregation

`SearchAggregation` インスタンスは、vector search のためのバケット集計の1レベルを定義します。バケットキー、バケット上限、バケットごとのメトリクス、バケットの順序、代表ヒット、およびオプションのネストされた集計を制御します。

```python
class pymilvus.SearchAggregation
```

## Constructor\{#constructor}

```python
SearchAggregation(
    fields: list[str],
    size: int,
    metrics: dict[str, dict[str, str]] | None = None,
    order: list[dict[str, str]] | None = None,
    top_hits: TopHits | None = None,
    sub_aggregation: SearchAggregation | None = None,
)
```

**PARAMETERS:**

- **fields** (*list[str]*) **[REQUIRED]** -

    バケットキーを構成する、空でない scalar フィールド名のリストです。複数のフィールドは、リスト順で複合キーを形成します。`meta["region"]` のような JSON パスは受け付けられません。

- **size** (*int*) **[REQUIRED]** -

    この集計レベルで返されるバケットの最大数です。値は正の整数でなければなりません。

- **metrics** (*dict[str, dict[str, str]] | None*) -

    バケットごとのメトリクス定義です。各キーはメトリクスのエイリアスで、各値は `{operation: field}` 形式の単一キー辞書です。サポートされる操作は `count`、`sum`、`avg`、`min`、`max` です。`count` のみ `"*"` を受け付けます。その他の操作では、フィールド名または `_score` が必要です。

- **order** (*list[dict[str, str]] | None*) -

    リスト順に評価されるバケットの並び順ルールです。各項目には、1つのメトリクスエイリアス、`_count`、または `_key` が含まれており、`"asc"` または `"desc"` にマッピングされている必要があります。

- **top_hits** (*TopHits | None*) -

    各バケットから返される代表エンティティを設定します。

- **sub_aggregation** (*SearchAggregation | None*) -

    現在のレベルの各バケットの下にネストされたバケットレベルを定義します。

**RETURN TYPE:**

*SearchAggregation*

**EXCEPTIONS:**

- **ParamError** - 空または無効な fields、正でない size、サポートされていないメトリクス定義、無効な並び順キーまたは方向、または型が誤っているオブジェクトに対して発生します。

## Example\{#example}

```python
from pymilvus import SearchAggregation, TopHits

aggregation = SearchAggregation(
    fields=["category"],
    size=5,
    metrics={
        "product_count": {"count": "*"},
        "avg_price": {"avg": "price"},
    },
    order=[{"product_count": "desc"}, {"_key": "asc"}],
    sub_aggregation=SearchAggregation(
        fields=["brand"],
        size=3,
        top_hits=TopHits(
            size=2,
            sort=[{"rating": "desc"}, {"_score": "desc"}],
        ),
    ),
)
```
