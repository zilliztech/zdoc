---
title: "TopHits | Python | MilvusClient"
slug: /python/python/Vector-TopHits
sidebar_label: "TopHits"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`TopHits` インスタンスは、検索集約の各バケットから返される代表的なヒットを定義します。各バケットごとに返すヒット数と、必要に応じて各バケット内でヒットをどのようにソートするかを指定します。 | Python | MilvusClient"
type: docx
token: EgeGdZL4LoCuv2xVUfFc9eDAnkd
sidebar_position: 11
keywords: 
  - milvus open source
  - how does milvus work
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

`TopHits` インスタンスは、検索集約の各バケットから返される代表的なヒットを定義します。各バケットごとに返すヒット数と、必要に応じて各バケット内でヒットをどのようにソートするかを指定します。

このドラフトは Search Aggregation API の設計入力に基づいています。公開前に、最終的なコンストラクターシグネチャ、import パス、検証ルール、およびプロパティ名を PyMilvus のソースと照らし合わせて確認してください。

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

    各バケットから返す代表ヒットの数です。

    たとえば、`TopHits(size=3)` は各バケットから最大 3 件のヒットを返します。

- **sort** (*list[dict[str, str]] | None*) -

    ヒットレベルのソートルールのリストです。

    各項目はフィールドと並び順の方向を定義します。

    ```python
    sort=[{"field": "rating", "order": "desc"}]
    ```

    `field` の値はドキュメントレベルのフィールドまたは `_score` でなければなりません。`order` の値は `asc` または `desc` でなければなりません。

    `sort` はバケット内のヒットの順序のみを制御します。どのバケットが返されるか、バケットがどのように並べられるか、またはバケットごとのメトリクスがどのように計算されるかには影響しません。

    `sort` を省略した場合、ヒットはベクトル類似度スコアで並べられます。

**RETURN TYPE:**

*TopHits*

**RETURNS:**

`TopHits` オブジェクト。

**EXCEPTIONS:**

- **ParamError**

    `TopHits` の指定が無効な場合に、この例外が発生することがあります。例として、正でない `size`、未対応のソート方向、未対応のソートフィールド、または `sort` でのバケットレベルのメトリクスエイリアスの使用が含まれます。

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
