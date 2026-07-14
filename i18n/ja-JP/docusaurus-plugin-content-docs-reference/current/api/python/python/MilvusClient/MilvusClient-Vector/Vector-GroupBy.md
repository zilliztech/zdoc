---
title: "GroupBy | Python | MilvusClient"
slug: /python/python/Vector-GroupBy
sidebar_label: "GroupBy"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`GroupBy` インスタンスは、検索集計における 1 つのバケットレベルを定義します。どのフィールドがバケットキーを構成するか、返すバケット数、各バケットで計算するメトリクス、バケットの並び順、代表ヒットを返すかどうか、およびネストされた子バケットを作成するかどうかを指定します。 | Python | MilvusClient"
type: docx
token: CFS4dOq2LowXPSxB124cBwQsn0c
sidebar_position: 10
keywords: 
  - 検索拡張生成
  - 大規模言語モデル
  - ベクトル化
  - k 最近傍アルゴリズム
  - zilliz
  - zilliz cloud
  - クラウド
  - GroupBy
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# GroupBy

`GroupBy` インスタンスは、検索集計における 1 つのバケットレベルを定義します。どのフィールドがバケットキーを構成するか、返すバケット数、各バケットで計算するメトリクス、バケットの並び順、代表ヒットを返すかどうか、およびネストされた子バケットを作成するかどうかを指定します。

このドラフトは Search Aggregation API の設計入力に基づいています。公開前に、最終的なコンストラクタシグネチャ、インポートパス、バリデーションルール、およびプロパティ名を PyMilvus ソースと照合して確認してください。

```python
class pymilvus.GroupBy
```

## Constructor\{#constructor}

`MilvusClient.search(group_by=...)` で使用する `GroupBy` オブジェクトを構築します。

```python
GroupBy(
    fields: list[str],
    size: int,
    metrics: dict[str, dict] | None = None,
    order: list[dict[str, str]] | None = None,
    top_hits: TopHits | None = None,
    sub_group: GroupBy | None = None,
)
```

**PARAMETERS:**

- **fields** (*list[str]*) -

    **[REQUIRED]**

    この集計レベルのバケットキーを構成するフィールド名のリストです。

    単一フィールドの場合、各フィールド値ごとに 1 つのバケットが作成されます。複数フィールドの場合、複合バケットキーが作成されます。たとえば、`fields=["brand", "color"]` は各 `(brand, color)` の組み合わせごとに 1 つのバケットを作成します。

- **size** (*int*) -

    **[REQUIRED]**

    この集計レベルで返されるバケットの最大数です。

    ルート `GroupBy` では、この値はトップレベルバケットの数を制御します。ネストされた `GroupBy` では、この値は各親バケットの下で返される子バケットの数を制御します。

- **metrics** (*dict[str, dict] | None*) -

    バケットごとのメトリクスを定義する辞書です。

    辞書のキーはメトリクスのエイリアスです。辞書の値は 1 つのメトリクス操作とその入力フィールドを定義します。

    ```python
    metrics={
        "item_count": {"count": "*"},
        "avg_price": {"avg": "price"},
        "best_score": {"max": "_score"},
    }
    ```

    Phase 1 でサポートされる操作は次のとおりです。

    - `count`

    - `sum`

    - `avg`

    - `min`

    - `max`

    特別なフィールド `_score` はベクトル類似度スコアを参照します。現在の設計では、`_score` は `avg`、`sum`、`min`、`max` とともに使用できます。

- **order** (*list[dict[str, str]] | None*) -

    バケットの並び順ルールのリストです。

    各項目には、1 つの並び順キーと 1 つの方向が含まれます。方向は `asc` または `desc` でなければなりません。

    ```python
    order=[{"avg_price": "desc"}, {"_count": "desc"}]
    ```

    有効な並び順キーは次のとおりです。

    - 同じ `GroupBy` レベルの `metrics` で定義されたメトリクスエイリアス。

    - `_count`。これはバケット内の ANN によって取得された entity 数でバケットを並べ替えます。

    - `_key`。これはバケットキーの値でバケットを並べ替えます。

    バケットの並び順は、トップ `size` の結果にどのバケットが含まれるかと、それらのバケットがどの順序で返されるかの両方を制御します。

    以前の設計入力では、`order` に `dict[str, str]` が使用されていました。現在の作業上の想定は、明示的な複数条件の並び順を維持するために `list[dict[str, str]]` です。これについては最終 SDK と照合して確認してください。

- **top_hits** (*[TopHits](https://TopHits.md) | None*) -

    このレベルの各バケットから返す代表ヒットを定義する `TopHits` オブジェクトです。

    このパラメータを省略すると、このレベルではバケットキー、メトリクス、およびサブグループのみが返されます。`top_hits` を省略することは、純粋な集計レベルに有用です。

- **sub_group** (*GroupBy | None*) -

    このレベルの各バケットの下でネストされたグループ化を定義する子 `GroupBy` オブジェクトです。

    各ネストレベルは、それぞれ独自の `fields`、`size`、`metrics`、`order`、および `top_hits` を持ちます。

**RETURN TYPE:**

*GroupBy*

**RETURNS:**

`GroupBy` オブジェクトです。

**EXCEPTIONS:**

- **ParamError**

    `GroupBy` の仕様が無効な場合に、この例外が発生する可能性があります。例としては、必須フィールドの欠落、正でない `size`、メトリクスエイリアスまたは予約キーを参照していない `order` キー、サポートされていないメトリクス操作、サポートされていないフィールド型、または過剰なネスト深度が含まれます。

    最終的な例外型は SDK の確認待ちです。

## Examples\{#examples}

```python
from pymilvus import GroupBy, TopHits

# Group by a single field and return representative hits.
group_by = GroupBy(
    fields=["brand"],
    size=10,
    top_hits=TopHits(size=3),
)

# Group by a composite key, compute metrics, and order buckets by a metric.
group_by = GroupBy(
    fields=["brand", "color"],
    size=10,
    metrics={
        "item_count": {"count": "*"},
        "avg_price": {"avg": "price"},
    },
    order=[{"avg_price": "desc"}, {"_count": "desc"}],
    top_hits=TopHits(
        size=3,
        sort=[{"field": "rating", "order": "desc"}],
    ),
)

# Create nested buckets.
group_by = GroupBy(
    fields=["category"],
    size=5,
    metrics={"total_revenue": {"sum": "price"}},
    order=[{"total_revenue": "desc"}],
    sub_group=GroupBy(
        fields=["brand"],
        size=3,
        metrics={"avg_rating": {"avg": "rating"}},
        order=[{"avg_rating": "desc"}],
        top_hits=TopHits(size=3),
    ),
)
```
