---
title: "検索集約 | Cloud"
slug: /search-aggregation
sidebar_label: "検索集約"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "買い物客が「日常トレーニング用の黒いランニングシューズ」を検索すると、近似最近傍（ANN）検索は vector 類似度で製品をランク付けし、フラットな Top-K リストを返します。結果は関連性が高くても重複しがちです。以下の例では、最初の6件のうち4件が Brand A 製品で、Brand B と Brand C はそれぞれ1件ずつしか現れません。 | Cloud"
type: origin
token: Fighwx5zFiwaoIkV4q5cAJ1enDg
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 検索集約

買い物客が「日常トレーニング用の黒いランニングシューズ」を検索すると、近似最近傍（ANN）検索は vector 類似度で製品をランク付けし、フラットな Top-K リストを返します。結果は関連性が高くても重複しがちです。以下の例では、最初の6件の結果のうち4件が Brand A 製品で、Brand B と Brand C はそれぞれ1件ずつしか現れません。

フラットなリストでは、バケット指向の要約を直接提供できません。アプリケーションでは、保持された候補数や平均価格でブランドを比較したり、各ブランドから少数の代表製品を確認したり、結果を複数のバケットレベルに整理したりする必要がある場合があります。

検索集約は、選択した scalar フィールドに基づいて、保持された ANN 候補をバケットに整理します。この例では、各ブランドが個別のバケットになります。Zilliz Cloud は各バケットの統計を計算し、バケットを並べ替え、代表製品を付加できます。アプリケーションは `result.agg_buckets` を通じて、このバケット優先のレスポンスを利用します。

![CPHkwKQTRhuEQKbsxdacRZuCnVe](https://zdoc-images.s3.us-west-2.amazonaws.com/CPHkwKQTRhuEQKbsxdacRZuCnVe.png)

検索集約は、完全な collection 全体に対する厳密な集約を実行するわけではありません。バケットの存在、件数、メトリクス、並び順、および代表ヒットは、ANN とグループ化ステージで保持された候補に依存します。

## 仕組み\{#how-it-works}

![Edbbw7oulhszR2baU7BcsjiMntf](https://zdoc-images.s3.us-west-2.amazonaws.com/Edbbw7oulhszR2baU7BcsjiMntf.png)

1. **候補を取得します。** Zilliz Cloud は ANN 検索を実行し、クエリ vector に最も近い entity を見つけます。続いてグループ化ステージが、完全な複合キーごとに上限付きの候補数を保持します。このキーごとの候補予算は、集約ツリー内のどこかにある最大の `TopHits.size`、またはどのレベルでも `top_hits` が設定されていない場合は `1` です。

1. **バケットを構築します。** `SearchAggregation.fields` パラメータがバケットキーを定義します。フィールド値の一意な組み合わせごとに、個別のキーが作成されます。図では、`fields=["brand"]` により `(Brand A)`、`(Brand B)`、`(Brand C)` のバケットキーが作成されます。同じキーを持つ保持済み候補は同じバケットに属し、その `count` に加算されます。`SearchAggregation.size` は、Zilliz Cloud が返すバケット数を制限します。

1. **結果を計算して返します。** 返される各バケットには、そのキーと保持された候補数が含まれます。Zilliz Cloud は、設定されたメトリクスを計算し、バケットを並べ替え、代表 entity を返し、子バケットを構築することもできます。`result.agg_buckets` 内の各 `AggregationBucket` は、`key`、`count`、`metrics`、`hits`、`sub_groups` を公開します。検索集約が有効な場合、通常の検索ヒットリストは空になります。

図では、`TopHits.size=4` がキーごとの候補予算として4を提供するため、保持された4件の Brand A 候補から `count: 4` が生成されます。完成した Brand A カードでは、図を簡潔に保つため、返された4件の代表ヒットのうち2件のみを表示しています。

`sub_aggregation` を使うと、Zilliz Cloud は各親バケット内で手順 2 と 3 を繰り返します。ANN の再現率やキーごとの候補予算が変わると、バケット件数、メトリクス、並び順、ヒット、ネストされた結果も変わる可能性があります。

## 制限\{#limits}

検索集約を使用する前に、以下の制限に注意してください。

- **ネストされた集約:** 1つのリクエストには、1つのルート `SearchAggregation` と最大3つのネストされた `sub_aggregation` レベルを含めることができ、合計で最大4レベルまでです。すべてのレベルを通して、バケットキーの作成に使用できるフィールドは最大10個です。

- **バケットキーの作成に使用するフィールド。** `SearchAggregation.fields` パラメータは、Boolean、integer、`VARCHAR`、`TIMESTAMPTZ` フィールドをサポートします。`FLOAT`、`DOUBLE`、`ARRAY`、`JSON`、`GEOMETRY`、`TEXT`、vector、dynamic フィールドはサポートしません。

- **メトリクスフィールド。** `count` 演算は `"*"` または `JSON` でも dynamic でもない任意のフィールドを受け入れ、フィールドが指定された場合は `NULL` 値をスキップします。`sum` と `avg` は integer フィールドと浮動小数点フィールドを受け入れます。`min` と `max` はこれに加えて string フィールドと `TIMESTAMPTZ` フィールドも受け入れます。

- **Top Hits のソートフィールド。** `TopHits.sort` パラメータは、比較可能な Boolean、integer、浮動小数点、string、`TIMESTAMPTZ` フィールドに加え、`_score` を受け入れます。`ARRAY`、`JSON`、`GEOMETRY`、vector、dynamic フィールドはサポートしません。

- **候補予算:** 集約ツリー内のどこかにある最大の `TopHits.size` は、完全な複合キーごとに保持される候補数でもあります。どのレベルでも `top_hits` が設定されていない場合、Zilliz Cloud はキーごとに1件の候補を保持します。バケットの `count` とメトリクスはこれらの保持候補から計算されるため、`TopHits.size` を変更するとそれらも変わる可能性があります。

- **NULL を含むバケットフィールド:** `NULL` 値はそれ自体で独立したバケットキーを形成します。null バケットを除外するには、検索リクエストに `brand is not null` のような filter を追加します。

- **重複フィールド:** 同じフィールドを複数の `SearchAggregation.fields` リストに含めることはできません。たとえば、ルート集約が `fields=["category"]` を使用している場合、ネストされた `sub_aggregation` でも `fields=["category"]` を使用することはできません。

- **サポートされない組み合わせ:** 検索集約は、0 以外の `offset`、Search Iterators、Hybrid Search、Highlighter、または Grouping Search と組み合わせることはできません。トップレベルの `offset` 値 `0` は、パラメータを省略した場合と同等です。REST v2 プロトコルレベルでは、`searchAggregation` と `ids` を同時に指定できません。

- **返されるエントリ。** 計算上の結果エントリ最大数を 10,000 以下に保ってください。サーバーはこの最大値を、`クエリ vector 数 × 各集約レベルでの実効 search_size の積 × 任意レベルでの最大 TopHits.size` として計算します。 

    どのレベルでも `TopHits` が設定されていない場合、最後の係数には `1` を使用します。たとえば、1つのクエリ vector、10個のルートバケット、各ルートバケットごとに5個の子バケット、各子バケットごとに2件のヒットの場合、計算上の最大値は `1 × 10 × 5 × 2 = 100` になります。

## 検索集約を使用する\{#use-search-aggregation}

実現したい内容に応じて例を選択してください。

| 移動先 | 説明 | 主な設定 |
| --- | --- | --- |
| [バケットを比較して並べ替える](./search-aggregation#compare-and-sort-buckets) | バケットごとの統計を計算して比較し、その後メトリクス、件数、またはキーで返されるバケットを並べ替えます。 | `fields`, `size`, `metrics`, `order` |
| [各バケットの代表結果を表示する](./search-aggregation#show-representative-results-from-each-bucket) | 各バケットから限られた数の entity を返し、それらの entity を scalar フィールドまたは vector score によって個別に並べ替えます。 | `top_hits`, `TopHits.size`, `TopHits.sort` |
| [複数レベルで結果をグループ化する](./search-aggregation#group-results-at-multiple-levels) | 結果を親および子バケットレベルに整理し、複数の次元を順番に分析します。 | `sub_aggregation` |

以下の例では、brand、category、color、price、rating フィールドを持つ製品 collection を使用します。すべてのブランド名、製品名、価格、評価、検索結果は合成されたサンプルデータです。次のセクションを展開して collection を作成し、共有の検索変数を定義してください。

<details>

<summary>サンプル collection をセットアップする</summary>

```python
from pymilvus import DataType, MilvusClient, SearchAggregation, TopHits

client = MilvusClient(
    uri="YOUR_CLUSTER_OR_PROJECT_ENDPOINT",
    token="YOUR_AUTHORIZED_TOKEN",
)

collection_name = "product_search_aggregation"

if client.has_collection(collection_name):
    client.drop_collection(collection_name)

schema = client.create_schema(auto_id=False, enable_dynamic_field=False)
schema.add_field("id", DataType.INT64, is_primary=True)
schema.add_field("embedding", DataType.FLOAT_VECTOR, dim=5)
schema.add_field("name", DataType.VARCHAR, max_length=200)
schema.add_field("brand", DataType.VARCHAR, max_length=100)
schema.add_field("category", DataType.VARCHAR, max_length=100)
schema.add_field("color", DataType.VARCHAR, max_length=50)
schema.add_field("price", DataType.DOUBLE)
schema.add_field("rating", DataType.DOUBLE)
schema.add_field("in_stock", DataType.BOOL)

index_params = client.prepare_index_params()
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_collection(
    collection_name=collection_name,
    schema=schema,
    index_params=index_params,
    # Make preceding writes visible to searches from this client.
    consistency_level="Session",
)

client.insert(
    collection_name=collection_name,
    data=[
        {
            "id": 1,
            "embedding": [0.12, 0.42, 0.18, 0.66, 0.31],
            "name": "Runner A1",
            "brand": "Brand A",
            "category": "running_shoes",
            "color": "black",
            "price": 129.99,
            "rating": 4.7,
            "in_stock": True,
        },
        {
            "id": 2,
            "embedding": [0.10, 0.39, 0.20, 0.61, 0.29],
            "name": "Trail A2",
            "brand": "Brand A",
            "category": "running_shoes",
            "color": "blue",
            "price": 139.99,
            "rating": 4.6,
            "in_stock": True,
        },
        {
            "id": 3,
            "embedding": [0.14, 0.44, 0.19, 0.68, 0.33],
            "name": "Runner B1",
            "brand": "Brand B",
            "category": "running_shoes",
            "color": "white",
            "price": 159.99,
            "rating": 4.8,
            "in_stock": True,
        },
        {
            "id": 4,
            "embedding": [0.16, 0.41, 0.22, 0.62, 0.30],
            "name": "Runner C1",
            "brand": "Brand C",
            "category": "running_shoes",
            "color": "red",
            "price": 119.99,
            "rating": 4.4,
            "in_stock": False,
        },
        {
            "id": 5,
            "embedding": [0.48, 0.20, 0.59, 0.15, 0.71],
            "name": "Jacket A1",
            "brand": "Brand A",
            "category": "jackets",
            "color": "black",
            "price": 99.99,
            "rating": 4.5,
            "in_stock": True,
        },
        {
            "id": 6,
            "embedding": [0.45, 0.18, 0.55, 0.17, 0.69],
            "name": "Jacket B1",
            "brand": "Brand B",
            "category": "jackets",
            "color": "blue",
            "price": 89.99,
            "rating": 4.3,
            "in_stock": True,
        },
        {
            "id": 7,
            "embedding": [0.09, 0.38, 0.17, 0.60, 0.27],
            "name": "Runner A3",
            "brand": "Brand A",
            "category": "running_shoes",
            "color": "black",
            "price": 159.99,
            "rating": 4.8,
            "in_stock": True,
        },
        {
            "id": 8,
            "embedding": [0.13, 0.43, 0.21, 0.65, 0.32],
            "name": "Runner A4",
            "brand": "Brand A",
            "category": "running_shoes",
            "color": "black",
            "price": 149.99,
            "rating": 4.9,
            "in_stock": True,
        },
    ],
)

client.load_collection(collection_name)

query_vector = [0.11, 0.40, 0.19, 0.64, 0.30]
search_params = {
    "metric_type": "COSINE",
    "params": {},
}
```

</details>

上記のセットアップでは、vector index と検索パラメータの両方に `COSINE` を設定しています。そのため、後続の例では `{"_score": "desc"}` を使用して、より高い cosine 類似度を先頭に配置します。`L2` のような距離メトリクスの場合は、`{"_score": "asc"}` を使用してください。

### バケットを比較して並べ替える\{#compare-and-sort-buckets}

取得された entity のグループを計算済み統計で比較し、返されるバケットの順序を制御する必要がある場合は、このパターンを使用します。この例では、Zilliz Cloud は取得された製品を `brand` でグループ化し、各ブランドバケットの価格メトリクスを計算し、平均価格でバケットを並べ替えます。

目的が、単に各フィールド値ごとに1件以上の entity を返して結果の多様性を改善することだけであれば、代わりに Grouping Search を使用してください。

次の設定は、最大3つのブランドバケットを作成し、各バケットのメトリクスを計算し、平均価格でバケットを並べ替えます。

```python
aggregation = SearchAggregation(
    # highlight-start
    # Form one bucket for each distinct brand value.
    fields=["brand"],
    # Return up to three buckets at this aggregation level.
    size=3,
    # Calculate named metrics for every selected bucket.
    metrics={
        "product_count": {"count": "*"},
        "avg_price": {"avg": "price"},
        "min_price": {"min": "price"},
    },
    # Sort buckets by average price, highest first.
    order=[
        {"avg_price": "desc"},
        # If average prices are equal, sort by bucket key in ascending order.
        {"_key": "asc"},
    ],
    # highlight-end
)
```

このオブジェクトを `MilvusClient.search()` の `search_aggregation` パラメータに渡します。

```python
result = client.search(
    collection_name=collection_name,
    data=[query_vector],
    anns_field="embedding",
    search_params=search_params,
    output_fields=[
        "name",
        "brand",
        "category",
        "color",
        "price",
        "rating",
        "in_stock",
    ],
    # highlight-next-line
    search_aggregation=aggregation,
)
```

`search_aggregation` が設定されている場合、PyMilvus は `result[0]` に通常の entity ヒットを返しません。代わりに、バケットレスポンスを `result.agg_buckets[0]` から読み取ってください。`output_fields` パラメータは、返される各 `AggregationHit.fields` マッピングにどの scalar フィールドを含めるかを制御します。Zilliz Cloud は、`output_fields` に含まれていないメトリクス元フィールドやソートフィールドも引き続き使用できます。

<details>

<summary>サンプルのバケット出力を表示する</summary>

次の出力は上記のリクエストから取得したもので、可読性のために JSON としてシリアライズされています。PyMilvus は JSON ではなく `AggregationBucket` オブジェクトを返します。`fields` に1つのフィールドしか含まれていない場合でも、`key` 値は常にキー要素の順序付きリストです。これは複合キーのフィールド順を保持するためです。

```json
[
  {
    "key": [
      {
        "field_id": 103,
        "field_name": "brand",
        "value": "Brand B"
      }
    ],
    "count": 1,
    "metrics": {
      "product_count": 1,
      "avg_price": 159.99,
      "min_price": 159.99
    },
    "hits": [],
    "sub_groups": []
  },
  {
    "key": [
      {
        "field_id": 103,
        "field_name": "brand",
        "value": "Brand A"
      }
    ],
    "count": 1,
    "metrics": {
      "product_count": 1,
      "avg_price": 129.99,
      "min_price": 129.99
    },
    "hits": [],
    "sub_groups": []
  },
  {
    "key": [
      {
        "field_id": 103,
        "field_name": "brand",
        "value": "Brand C"
      }
    ],
    "count": 1,
    "metrics": {
      "product_count": 1,
      "avg_price": 119.99,
      "min_price": 119.99
    },
    "hits": [],
    "sub_groups": []
  }
]
```

</details>

このガイドの単一クエリ vector では、返されたトップレベルのバケットを `result.agg_buckets[0]` から読み取ります。各バケットは、順序付きのキー要素、保持された候補の `count`、計算済みの `metrics`、代表 `hits`、および `sub_groups` 内のネストされたバケットを公開します。

この設定は次のように読み解けます。

| 設定 | 制御する内容 | この例での動作 |
| --- | --- | --- |
| `fields` | Zilliz Cloud がバケットキーを作成する方法 | 異なる `brand` 値ごとに1つのバケットを作成します。 |
| `size` | 返されるバケット数の上限 | 最大3つのブランドバケットを返します。 |
| `metrics` | 各バケットに対して計算される統計 | 製品数、平均価格、最小価格を計算します。 |
| `order` | Zilliz Cloud が返されるバケットを並べ替える方法 | 平均価格で並べ替え、同値の場合はバケットキーを使って順序を決定します。 |

`search_aggregation` が設定されている場合、Zilliz Cloud は `limit` を無視します。トップレベルバケット数を制御するには、ルート `SearchAggregation.size` の値を使用してください。

これらの設定では、Zilliz Cloud は `avg_price` の降順で Brand B、Brand A、Brand C の各バケットを返します。`_key` 条件が適用されるのは、バケットの平均価格が同じ場合のみです。この設定では `top_hits` を定義していないため、すべてのバケットの `hits` リストは空であり、キーごとの候補予算は `1` です。したがって、表示される件数とメトリクスは、ブランドごとに保持された1件の候補を表しています。より広いキーごとのメトリクスウィンドウが必要な場合は、より大きい `TopHits.size` を持つ `top_hits` を設定してください。

<details>

<summary>メトリクスと並び順のルール</summary>

各 `SearchAggregation.metrics` エントリは、ユーザー定義のエイリアスを演算とそのソースにマッピングします。

| ソース | サポートされる演算 | 動作 |
| --- | --- | --- |
| `JSON` でも dynamic でもない任意のフィールド | `count` | ソースフィールドが `NULL` ではない保持候補をカウントします。 |
| integer または浮動小数点フィールド | `sum`, `avg`, `min`, `max` | null ではない保持値に対して計算します。 |
| string または `TIMESTAMPTZ` フィールド | `min`, `max` | null ではない保持値の最小値または最大値を選択します。 |
| `"*"` | `count` | バケット内のすべての保持候補をカウントします。結果は `bucket.count` と一致します。 |
| `_score` | `sum`, `avg`, `min`, `max` | 保持候補に対する ANN 類似度または距離の値を集約します。 |

`SearchAggregation.order` は次のキーを受け入れます。

| 並び順キー | 意味 |
| --- | --- |
| メトリクスのエイリアス | `avg_price` のように、同じ集約レベルの `metrics` で計算された値に基づいて並べ替えます。 |
| `_count` | 各バケット内の保持候補数で並べ替えます。 |
| `_key` | `_key` という名前の collection フィールドではなく、バケットキーで並べ替えます。 |

各 `order` エントリは、キーを `"asc"` または `"desc"` にマッピングします。Zilliz Cloud は複数のエントリを先頭から順に評価します。`order` を省略した場合、Zilliz Cloud は保持候補セットからのバケット検出順を維持します。

vector マッチ品質でバケットを並べ替えるには、まず `_score` からバケットレベルのメトリクスを計算し、その後 `order` でそのメトリクスのエイリアスを使用します。各バケットには複数の entity score を含められるため、`_score` をバケット並び順キーとして直接使用することはできません。たとえば、`COSINE` または `IP` の場合:

```python
aggregation = SearchAggregation(
    fields=["brand"],
    size=3,
    metrics={"max_score": {"max": "_score"}},
    order=[{"max_score": "desc"}],
)
```

`L2` の場合は、最小の `_score` 値を計算し、最も距離が小さいバケットが先頭に来るように、そのメトリクスのエイリアスを昇順で並べ替えます。

</details>

<details>

<summary>複合バケットキーを作成する</summary>

複合バケットキーを作成するには、同じリストに複数のフィールド名を渡します。

```python
aggregation = SearchAggregation(
    # highlight-start
    # Combine brand and color to form a composite bucket key.
    fields=["brand", "color"],
    # highlight-end
    size=6,
)
```

この設定では、`(Brand A, black)`、`(Brand A, blue)`、`(Brand B, white)` のようなキーを生成できます。2つの entity が同じバケットを共有するのは、両方の値が一致する場合のみです。Zilliz Cloud はリスト順を保持するため、`brand` が最初のキー要素、`color` が2番目のキー要素になります。`order` で `_key` を使用する場合、Zilliz Cloud は同じ順序で複合キー要素を比較します。複数の文字列を1つのフラットなリストで渡してください。ネストされたリストはサポートされていません。

`size=6` は、この集約レベルで返される複合バケット数の最大値です。サンプルデータには5つの異なるブランド・カラーの組み合わせが含まれているため、5つすべてを返すことができます。[返されるエントリ数の制限](./search-aggregation#limits)では、このリクエストは `1 query vector × 6 buckets × 1 = 6` 件の構成済み結果エントリに相当します。

1つの `SearchAggregation.fields` リストに複数のフィールドを含めると、その集約レベルで複合バケットキーが作成されます。親子のバケット階層を作成するには、[ネストされた集約](./search-aggregation#group-results-at-multiple-levels) を使用してください。

</details>

以降の例では `aggregation` を再定義します。更新されたオブジェクトを同じ `search_aggregation` パラメータに渡し、検索呼び出しを再実行してください。

### 各バケットから代表的な結果を表示する\{#show-representative-results-from-each-bucket}

アプリケーションで各バケットから実際の製品を表示する必要がある場合は、代表的なエンティティを含めます。この例では、Zilliz Cloud は各ブランドバケットから最大 2 件の製品を返し、`rating`、次に vector score の順で並べます。

`TopHits` は次のように設定します。

```python
aggregation = SearchAggregation(
    fields=["brand"],
    size=3,
    # highlight-start
    # Return and sort representative entities for each selected bucket.
    top_hits=TopHits(
        # Return up to two entities per bucket.
        size=2,
        # Apply sort criteria in list order.
        sort=[
            {"rating": "desc"},
            {"_score": "desc"},
        ],
    ),
    # highlight-end
)
```

<details>

<summary>代表的なヒットを含むバケットを表示</summary>

以下の Brand A バケットは、上記のリクエストから取得し、読みやすさのために JSON としてシリアライズしたものです。

```json
{
  "key": [
    {
      "field_id": 103,
      "field_name": "brand",
      "value": "Brand A"
    }
  ],
  "count": 2,
  "metrics": {},
  "hits": [
    {
      "pk": 1,
      "score": 0.99976646900177,
      "fields": {
        "brand": "Brand A",
        "category": "running_shoes",
        "color": "black",
        "in_stock": true,
        "name": "Runner A1",
        "price": 129.99,
        "rating": 4.7
      }
    },
    {
      "pk": 2,
      "score": 0.9997048377990723,
      "fields": {
        "brand": "Brand A",
        "category": "running_shoes",
        "color": "blue",
        "in_stock": true,
        "name": "Trail A2",
        "price": 139.99,
        "rating": 4.6
      }
    }
  ],
  "sub_groups": []
}
```

</details>

| Parameter | Purpose |
| --- | --- |
| `top_hits` | 任意。この集約レベルにおける代表的なエンティティを設定します。省略した場合、`bucket.hits` は空になり、キーごとの candidate budget のデフォルトは 1 になります。 |
| `TopHits.size` | 選択された各バケットから最大 2 件の代表的なエンティティを返し、集約ツリー全体に対するキーごとの candidate budget を 2 に設定します。 |
| `TopHits.sort` | 各バケット内のエンティティを、リストされた条件を使って並べます。 |

アプリケーションで代表的なエンティティが必要な場合、または count や metrics に対してより広いキーごとの candidate window が必要な場合は、`top_hits` を設定してください。`TopHits.size` を大きくすると、candidate budget と、[Limits](./search-aggregation#limits) における最大返却エントリ数の計算の両方が増加します。

`SearchAggregation.order` はバケットをソートし、`TopHits.sort` は各バケット内で保持されたエンティティをソートします。このソート順は、`count` や metrics のためにどの candidate が保持されたかには影響しません。`TopHits.sort` は、サポートされている比較可能な scalar フィールド名と、組み込みの `_score` フィールドを受け付けます。これは ANN の類似度または距離を表します。Zilliz Cloud は `sort` エントリを先頭から末尾まで評価します。この例では、製品を `rating` の高い順に並べ、2 つの rating が等しい場合にのみ `_score` を使用します。この設定では `COSINE` を使用しているため、`_score` を降順にすると、より類似した製品が先に配置されます。

`metrics` または `TopHits.sort` で使用されるフィールドは、`output_fields` に含まれている必要はありません。Zilliz Cloud はそれらのフィールドを内部的に取得しますが、返される各ヒットの `fields` マッピングに含まれるのは、`output_fields` に明示的に列挙されたフィールドだけです。主キーと vector score は、`AggregationHit.pk` と `AggregationHit.score` を通じて引き続き利用できます。

返される各 `AggregationHit` は、主キーを `pk` に、vector score を `score` に、要求された出力フィールドを `fields` に持ちます。

### 結果を複数レベルでグループ化する\{#group-results-at-multiple-levels}

別のバケットの内側に 1 段階のバケットが必要な場合は、ネストされた集約を使用します。この例では、Zilliz Cloud は最初に category バケットを作成し、その後で各 category 内に brand バケットを作成します。

子集約は、その親バケットに割り当てられたエンティティのみを受け取ります。`fields` は各集約レベルでのバケットキーを制御し、`sub_aggregation` は親子の階層を作成します。

以下の設定では、キー `(running_shoes)` を持つ category バケットを作成します。その親バケット内で、子集約は `(Brand A)`、`(Brand B)`、`(Brand C)` のようなキーを持つ個別の brand バケットを作成します。

```plaintext
Parent bucket key:
(running_shoes)

Child bucket keys:
├── (Brand A)
├── (Brand B)
└── (Brand C)
```

各レベルでは、複数のフィールドを独立して使用できます。たとえば、子集約で `fields=["brand", "color"]` を使用すると、`(Brand A, black)` のような複合子キーが作成されます。

以下の設定でこの階層を実装します。

```python
aggregation = SearchAggregation(
    fields=["category"],
    size=2,
    metrics={
        "product_count": {"count": "*"},
        "avg_price": {"avg": "price"},
    },
    order=[{"product_count": "desc"}],
    # highlight-start
    # For each category bucket, group only its entities by brand.
    sub_aggregation=SearchAggregation(
        fields=["brand"],
        size=3,
        metrics={
            "brand_count": {"count": "*"},
            "avg_rating": {"avg": "rating"},
        },
        order=[{"avg_rating": "desc"}],
        top_hits=TopHits(
            size=2,
            sort=[{"rating": "desc"}],
        ),
    ),
    # highlight-end
)
```

<details>

<summary>ネストされたバケット結果を表示</summary>

以下のシリアライズされた抜粋は、`running_shoes` 親バケットとその Brand B 子バケットを示しています。簡潔さのため、Brand A および Brand C の子バケットは省略しています。

```json
{
  "key": [
    {
      "field_id": 104,
      "field_name": "category",
      "value": "running_shoes"
    }
  ],
  "count": 4,
  "metrics": {
    "avg_price": 137.49,
    "product_count": 4
  },
  "hits": [],
  "sub_groups": [
    {
      "key": [
        {
          "field_id": 103,
          "field_name": "brand",
          "value": "Brand B"
        }
      ],
      "count": 1,
      "metrics": {
        "avg_rating": 4.8,
        "brand_count": 1
      },
      "hits": [
        {
          "pk": 3,
          "score": 0.9994542598724365,
          "fields": {
            "brand": "Brand B",
            "category": "running_shoes",
            "color": "white",
            "in_stock": true,
            "name": "Runner B1",
            "price": 159.99,
            "rating": 4.8
          }
        }
      ],
      "sub_groups": []
    }
  ]
}
```

</details>

表示された結果は、単一の複合バケットキー `(running_shoes, Brand B)` ではなく、バケットパス `(running_shoes) → (Brand B)` を表しています。

Zilliz Cloud はまず、`product_count` の順で最大 2 件の category バケットを選択します。その後、選択された各 category 内で `sub_aggregation` を独立して実行し、`avg_rating` の順で最大 3 件の brand バケットを返します。

上記の出力では:

- ルートの `running_shoes` バケットには、その子の複合キー全体にまたがって 4 件の保持された candidate が含まれています。その `metrics` には、ルートレベルの `avg_price` と `product_count` の値が含まれます。

- ルートバケットの `sub_groups` リストには、子の brand バケットが含まれます。表示されている Brand B バケットには 1 件の保持された candidate と、その独自の `avg_rating` および `brand_count` の値が含まれます。

- ルートバケットの `hits` リストは空です。これは、ルート集約で `top_hits` が設定されていないためです。Brand B の子には、`sub_aggregation` で `top_hits` が設定されているため、代表的なヒットが含まれます。

## FAQ\{#faq}

### バケットの count と metrics はどの程度正確ですか？\{#how-accurate-are-bucket-counts-and-metrics}

Search Aggregation は保持された ANN candidate を要約します。full-collection aggregation は実行しません。

candidate の保持には 2 段階の近似があります。ANN search は関連する collection エンティティを見落とすことがあり、グループ化ステージでは完全な複合キーごとに最大 `TopHits.size` 件の candidate しか保持しません。どのレベルでも `top_hits` が設定されていない場合、このキーごとの上限は 1 です。

たとえば、ある collection に 5,000 件の Brand A 製品が含まれており、その多くが vector query に関連しているとします。集約で `TopHits(size=4)` を使用した場合、Brand A バケットは完全な複合キーに対して最大 4 件の candidate しか保持できません。その `count` と metrics が表すのは、保持された candidate であり、関連するすべての Brand A 製品でも、5,000 件の collection エンティティ全体でもありません。

近似の影響が最も大きいのは、`order` が metric alias を使用する場合です。search recall の変化により metric の値が変わると、その結果 `SearchAggregation.size` に収まるバケットも変わる可能性があります。ネストされた集約では、各子レベルが親バケット内で利用可能なエンティティに対して動作するため、この影響が増幅されることがあります。

一致するすべてのエンティティに対して正確な統計が必要な場合は、Search Aggregation ではなく、正確な query aggregation ワークフローを使用してください。

### Search Aggregation は Grouping Search とどう違いますか？\{#how-does-search-aggregation-differ-from-grouping-search}

アプリケーションで主に必要な結果の形に基づいて選択してください。

| Primary need | Prefer | Response to consume |
| --- | --- | --- |
| グループ化フィールド内の重複値を少なくした標準的なランキング済みエンティティリストを返す | Grouping Search | 各 query vector に対するフラットな search hit |
| キー、count、metrics、順序付け、代表的なヒット、または子バケットを持つバケットとしてグループを調査または比較する | Search Aggregation | `result.agg_buckets` 内の `AggregationBucket` オブジェクト |

Search Aggregation で `top_hits` を設定している場合でも、その主なレスポンスはバケットツリーのままです。アプリケーションがすでに通常の search hit を処理しており、主に結果の多様性を求めている場合には、Grouping Search は引き続き有用です。

これらの API は相互排他的です。PyMilvus は、同じリクエスト内で `search_aggregation` を `group_by_field` または `group_by_fields` と組み合わせると、`ParamError` を発生させます。
