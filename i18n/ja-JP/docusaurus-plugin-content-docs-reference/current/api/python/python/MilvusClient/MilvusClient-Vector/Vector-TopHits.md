---
title: "TopHits | Python | MilvusClient"
slug: /python/python/Vector-TopHits
sidebar_label: "TopHits"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "A `TopHits` インスタンスは、search aggregation の各 bucket から返される代表的なヒットを定義します。bucket ごとに返すヒット数と、必要に応じて各 bucket 内でのヒットの並べ替え方法を指定します。 | Python | MilvusClient"
type: docx
token: EgeGdZL4LoCuv2xVUfFc9eDAnkd
sidebar_position: 12
keywords: 
  - milvus open source
  - milvus の仕組み
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - TopHits
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# TopHits

`TopHits` インスタンスは、search aggregation の各 bucket から返される代表的なヒットを定義します。bucket ごとに返すヒット数と、必要に応じて各 bucket 内でのヒットの並べ替え方法を指定します。

このドラフトは Search Aggregation API の設計入力に基づいています。公開前に、最終的なコンストラクタのシグネチャ、インポートパス、バリデーションルール、およびプロパティ名を PyMilvus のソースと照合して確認してください。

```python
class pymilvus.TopHits
```

## Constructor\{#constructor}

`GroupBy` オブジェクトで使用するための `TopHits` オブジェクトを構築します。

```python
TopHits(
    size: int,
    sort: list[dict[str, str]] | None = None,
)
```

**PARAMETERS:**

- **size** (*int*) -

    **[REQUIRED]**

    各 bucket から返す代表的なヒット数。

    たとえば、`TopHits(size=3)` は各 bucket から最大 3 件のヒットを返します。

- **sort** (*list[dict[str, str]] | None*) -

    ヒットレベルの並べ替えルールのリスト。

    各項目はフィールドと並び順の方向を定義します。

    ```python
    sort=[{"field": "rating", "order": "desc"}]
    ```

    `field` の値はドキュメントレベルのフィールドまたは `_score` である必要があります。`order` の値は `asc` または `desc` である必要があります。

    `sort` は bucket 内でのヒットの順序のみを制御します。どの bucket が返されるか、bucket がどのように並べられるか、または bucket ごとのメトリクスがどのように計算されるかには影響しません。

    `sort` を省略した場合、ヒットは vector 類似度スコアによって並べられます。

**RETURN TYPE:**

*TopHits*

**RETURNS:**

`TopHits` オブジェクト。

**EXCEPTIONS:**

- **ParamError**

    `TopHits` の指定が無効な場合、この例外が発生することがあります。たとえば、正でない `size`、サポートされていない並び順、サポートされていない並べ替えフィールド、または `sort` における bucket レベルのメトリクスエイリアスの使用などが該当します。

    最終的な例外タイプは SDK の確認待ちです。

## Examples\{#examples}

```python
from pymilvus import GroupBy, TopHits

# Return the top 3 hits from each bucket by vector similarity score.
group_by = GroupBy(
    fields=["brand"],
    size=10,
    top_hits=TopHits(size=3),
)

# Return the 3 highest-rated hits from each bucket.
group_by = GroupBy(
    fields=["brand"],
    size=10,
    top_hits=TopHits(
        size=3,
        sort=[{"field": "rating", "order": "desc"}],
    ),
)

# Return only bucket keys and metrics by omitting TopHits.
group_by = GroupBy(
    fields=["brand"],
    size=10,
    metrics={
        "item_count": {"count": "*"},
        "avg_price": {"avg": "price"},
    },
    order=[{"avg_price": "desc"}],
)
```
