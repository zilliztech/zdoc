---
title: "Search Aggregation | Cloud"
slug: /search-aggregation
sidebar_label: "Search Aggregation"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "買い物客が「毎日のトレーニング用の黒いランニングシューズ」を検索すると、近似最近傍（ANN）検索はベクトル類似度に基づいて商品をランク付けし、フラットな Top-K リストを返します。結果は関連性が高くても重複しがちです。例えば、最初の 6 件のうち 4 件がブランド A の商品で、ブランド B とブランド C はそれぞれ 1 件ずつしか表示されない場合があります。 | Cloud"
type: origin
token: Fighwx5zFiwaoIkV4q5cAJ1enDg
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Search Aggregation

買い物客が「毎日のトレーニング用の黒いランニングシューズ」を検索すると、近似最近傍（ANN）検索はベクトル類似度に基づいて商品をランク付けし、フラットな Top-K リストを返します。結果は関連性が高くても重複しがちです。例えば、最初の 6 件のうち 4 件がブランド A の商品で、ブランド B とブランド C はそれぞれ 1 件ずつしか表示されない場合があります。

フラットなリストでは、バケット単位のサマリーを直接提供できません。アプリケーションによっては、保持された候補数や平均価格でブランドを比較したり、各ブランドから少数の代表的な商品を確認したり、結果を複数のバケット階層に整理したりする必要が生じることがあります。

Search Aggregation は、保持された ANN 候補を選択したスカラーフィールドに基づいてバケットに整理します。この例では、各ブランドが個別のバケットになります。Zilliz Cloud を使用すると、各バケットの統計計算、バケットの並べ替え、代表的な商品の添付が可能です。アプリケーションは、このバケット優先のレスポンスを `result.agg_buckets` を通じて受け取ります。

![CPHkwKQTRhuEQKbsxdacRZuCnVe](https://zdoc-images.s3.us-west-2.amazonaws.com/CPHkwKQTRhuEQKbsxdacRZuCnVe.png)

Search Aggregation は、コレクション全体に対する厳密な集計を実行するものではありません。バケットの存在、件数、メトリクス、順序、および代表ヒットは、ANN およびグループ化ステージで保持された候補に依存します。

## 仕組み\{#how-it-works}

![Edbbw7oulhszR2baU7BcsjiMntf](https://zdoc-images.s3.us-west-2.amazonaws.com/Edbbw7oulhszR2baU7BcsjiMntf.png)

1. **候補の取得。** Zilliz Cloud は ANN 検索を実行し、クエリベクトルに最も近いエンティティを取得します。その後、グループ化ステージで完全な複合キーごとに一定数の候補を保持します。このキーごとの候補バジェットは、集計ツリー内で最大の `TopHits.size`、またはどのレベルでも `top_hits` が設定されていない場合は `1` となります。

1. **バケットの構築。** `SearchAggregation.fields` パラメーターがバケットキーを定義します。フィールド値の一意の組み合わせごとに個別のキーが作成されます。図では、`fields=["brand"]` によって `(Brand A)`、`(Brand B)`、`(Brand C)` のバケットキーが作成されています。同じキーを持つ保持候補は同一のバケットに属し、その `count` に寄与します。`SearchAggregation.size` は、Zilliz Cloud が返すバケット数を制限します。

1. **計算と結果の返却。** 返される各バケットには、キーと保持された候補数が含まれます。Zilliz Cloud は、設定されたメトリクスの計算、バケットの並べ替え、代表エンティティの返却、子バケットの構築も実行できます。`result.agg_buckets` 内の各 `AggregationBucket` は、`key`、`count`、`metrics`、`hits`、`sub_groups` を公開します。Search Aggregation が有効な場合、通常の検索ヒットリストは空になります。

図では、`TopHits.size=4` がキーごとの候補バジェットとして 4 を指定しているため、保持された 4 件のブランド A 候補から `count: 4` が生成されます。完成したブランド A カードには、図を見やすくするため、返された 4 件の代表ヒットのうち 2 件のみが表示されています。

`sub_aggregation` を使用すると、Zilliz Cloud は各親バケット内でステップ 2 と 3 を繰り返します。ANN の再現率やキーごとの候補バジェットが変化すると、バケット数、メトリクス、順序、ヒット、およびネストされた結果も変わる可能性があります。

## 制限事項\{#limits}

Search Aggregation を使用する前に、以下の制限事項を確認してください。

- **ネストされた集計:** リクエストには、1 つのルート `SearchAggregation` と最大 3 レベルのネストされた `sub_aggregation` を含めることができ、合計で最大 4 レベルまで可能です。全レベルを通じて、バケットキーの作成に使用できるフィールドは最大 10 個です。

- **バケットキーの作成に使用するフィールド。** `SearchAggregation.fields` パラメーターは、Boolean、整数、`VARCHAR`、`TIMESTAMPTZ` フィールドをサポートします。`FLOAT`、`DOUBLE`、`ARRAY`、`JSON`、`GEOMETRY`、`TEXT`、ベクトル、動的フィールドはサポートしません。

- **メトリクスフィールド。** `count` 操作は、`"*"` または非 `JSON` かつ非動的な任意のフィールドを受け入れ、フィールド指定時は `NULL` 値をスキップします。`sum` と `avg` は整数および浮動小数点フィールドを受け入れます。`min` と `max` は、さらに文字列および `TIMESTAMPTZ` フィールドも受け入れます。

- **Top Hits のソートフィールド。** `TopHits.sort` パラメーターは、比較可能な Boolean、整数、浮動小数点、文字列、`TIMESTAMPTZ` フィールドに加えて `_score` を受け入れます。`ARRAY`、`JSON`、`GEOMETRY`、ベクトル、動的フィールドはサポートしません。

- **候補バジェット:** 集計ツリー内で最大の `TopHits.size` が、完全な複合キーごとに保持される候補数となります。どのレベルでも `top_hits` が設定されていない場合、Zilliz Cloud はキーごとに 1 件の候補を保持します。バケットの `count` やメトリクスはこれらの保持された候補から計算されるため、`TopHits.size` を変更すると結果も変わる可能性があります。

- **null 許容バケットフィールド:** `NULL` 値は独自のバケットキーを形成します。null バケットを除外するには、検索リクエストに `brand is not null` などのフィルターを追加してください。

- **フィールドの重複:** 同じフィールドを複数の `SearchAggregation.fields` リストに含めることはできません。例えば、ルート集計で `fields=["category"]` を使用する場合、ネストされた `sub_aggregation` で同じく `fields=["category"]` を使用することはできません。

- **サポートされない組み合わせ:** Search Aggregation は、ゼロ以外の `offset`、Search Iterators、Hybrid Search、Highlighter、Grouping Search と併用できません。トップレベルの `offset` 値が `0` の場合は、パラメーターを省略したときと同じ動作になります。REST v2 プロトコルレベルでは、`searchAggregation` と `ids` を同時に指定することはできません。

- **返されるエントリ数。** 計算される結果エントリの最大数は 10,000 以下に抑えてください。サーバーはこの最大値を `number of query vectors × product of the effective search_size at every aggregation level × largest TopHits.size at any level` として計算します。 

    どのレベルでも `TopHits` が設定されていない場合は、最後の係数として `1` を使用します。例えば、1 つのクエリベクトル、10 個のルートバケット、ルートバケットあたり 5 個の子バケット、子バケットあたり 2 件のヒットがある場合、計算される最大値は `1 × 10 × 5 × 2 = 100` となります。

## Search Aggregation の使用\{#use-search-aggregation}

目的に応じて例を選択してください。

| 項目 | 説明 | 主な設定 |
| --- | --- | --- |
| [バケットの比較と並べ替え](./search-aggregation#compare-and-sort-buckets) | バケットごとの統計を計算して比較し、返されたバケットをメトリクス、件数、またはキーで並べ替えます。 | `fields`、`size`、`metrics`、`order` |
| [各バケットの代表的な結果を表示](./search-aggregation#show-representative-results-from-each-bucket) | 各バケットから限られた数のエンティティを返し、それらのエンティティをスカラーフィールドまたはベクトルスコアで個別に並べ替えます。 | `top_hits`、`TopHits.size`、`TopHits.sort` |
| [複数レベルでの結果のグループ化](./search-aggregation#group-results-at-multiple-levels) | 結果を親バケットと子バケットの階層に整理し、複数の次元を順に分析します。 | `sub_aggregation` |

以下の例では、brand、category、color、price、rating フィールドを持つ商品コレクションを使用します。すべてのブランド名、商品名、価格、評価、検索結果は合成されたサンプルデータです。次のセクションを展開して、コレクションを作成し、共通の検索変数を定義してください。

<details>

<summary>サンプルコレクションのセットアップ</summary>

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

上記のセットアップでは、ベクトルインデックスと検索パラメーターの両方に `COSINE` を設定しています。そのため、以降の例では `{"_score": "desc"}` を使用して、コサイン類似度が高い順に並べます。`L2` などの距離メトリクスの場合は、`{"_score": "asc"}` を使用してください。

### バケットの比較とソート\{#compare-and-sort-buckets}

取得したエンティティのグループを計算済みの統計量で比較し、バケットの返却順序を制御したい場合にこのパターンを使用します。この例では、Zilliz Cloud が取得した製品を `brand` でグループ化し、各ブランドバケットの価格指標を計算して、平均価格でバケットをソートします。

フィールド値ごとに1つ以上のエンティティを返すことで結果の多様性を高めることだけが目的であれば、代わりに [Grouping Search](./grouping-search) を使用してください。

次の設定は、最大3つのブランドバケットを作成し、各バケットの指標を計算して、平均価格でバケットをソートします。

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

オブジェクトを `MilvusClient.search()` の `search_aggregation` パラメーターに渡します。

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

`search_aggregation` が設定されている場合、PyMilvus は `result[0]` に通常のエンティティヒットを返しません。代わりに、`result.agg_buckets[0]` からバケットレスポンスを読み取ります。`output_fields` パラメーターは、返される各 `AggregationHit.fields` マッピングに含まれるスカラーフィールドを制御します。なお、Zilliz Cloud は `output_fields` にリストされていない指標ソースやソート用フィールドも引き続き使用できます。

<details>

<summary>バケット出力例を表示する</summary>

以下の出力は上記のリクエストから取得したものであり、可読性のためにJSON形式にシリアライズしています。PyMilvus はJSONではなく `AggregationBucket` オブジェクトを返します。`key` の値は、`fields` に単一フィールドしか含まれていない場合でも、常にキーコンポーネントの順序付きリストとなります。これにより、複合キーにおけるフィールド順序が保持されます。

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

本ガイドの単一クエリベクトルの場合、返されたトップレベルのバケットを `result.agg_buckets[0]` から読み取ります。各バケットには、順序付きキーコンポーネント、保持候補の `count`、計算済みの `metrics`、代表的な `hits`、および `sub_groups` 内のネストされたバケットが含まれます。

設定内容は以下の通りです。

| 設定項目 | 制御内容 | この例での動作 |
| --- | --- | --- |
| `fields` | Zilliz Cloud によるバケットキーの生成方法 | 一意の `brand` 値ごとにバケットを1つ作成します。 |
| `size` | 返されるバケットの最大数 | 最大3つのブランドバケットを返します。 |
| `metrics` | 各バケットで計算される統計量 | 製品数、平均価格、最低価格を計算します。 |
| `order` | Zilliz Cloud によるバケットのソート方法 | 平均価格でソートし、同値の場合はバケットキーで順位を決定します。 |

`search_aggregation` が設定されている場合、Zilliz Cloud は `limit` を無視します。トップレベルのバケット数を制御するには、ルートの `SearchAggregation.size` 値を使用してください。

この設定により、Zilliz Cloud は Brand B、Brand A、Brand C のバケットを `avg_price` の降順で返します。`_key` 基準が適用されるのは、バケットの平均価格が同じ場合のみです。この設定では `top_hits` が定義されていないため、各バケットの `hits` リストは空となり、キーごとの候補バジェットは `1` となります。したがって、表示されるカウントと指標は、ブランドごとに保持された1つの候補を表しています。集計時にキーごとにより広い指標ウィンドウが必要な場合は、`top_hits` に大きな `TopHits.size` を設定してください。

<details>

<summary>指標と並べ替えルール</summary>

各 `SearchAggregation.metrics` エントリは、ユーザー定義のエイリアスを操作とそのソースにマッピングします。

| ソース | サポートされる操作 | 動作 |
| --- | --- | --- |
| `JSON` および動的フィールド以外のフィールド | `count` | ソースフィールドが `NULL` でない保持候補をカウントします。 |
| 整数または浮動小数点フィールド | `sum`、`avg`、`min`、`max` | null以外の保持値に対して計算を実行します。 |
| 文字列または `TIMESTAMPTZ` フィールド | `min`、`max` | null以外の保持値から最小値または最大値を選択します。 |
| `"*"` | `count` | バケット内のすべての保持候補をカウントします。結果は `bucket.count` と一致します。 |
| `_score` | `sum`、`avg`、`min`、`max` | 保持候補のANN類似度または距離値を集計します。 |

`SearchAggregation.order` では以下のキーを使用できます。

| 順序キー | 説明 |
| --- | --- |
| 指標エイリアス | 同じ集計レベルの `metrics` で計算された値（`avg_price` など）に基づいてソートします。 |
| `_count` | 各バケット内の保持候補数に基づいてソートします。 |
| `_key` | `_key` という名前のコレクションフィールドではなく、バケットキーに基づいてソートします。 |

各 `order` エントリは、キーを `"asc"` または `"desc"` にマッピングします。Zilliz Cloud は複数のエントリを先頭から順に評価します。`order` を省略した場合、Zilliz Cloud は保持候補セットからのバケット検出順序を維持します。

ベクトルのマッチ品質に基づいてバケットをソートするには、まず `_score` からバケットレベルの指標を計算し、その指標エイリアスを `order` で使用します。各バケットには複数のエンティティスコアが含まれ得るため、`_score` をバケットの順序キーとして直接使用することはできません。たとえば、`COSINE` や `IP` を使用する場合：

```python
aggregation = SearchAggregation(
    fields=["brand"],
    size=3,
    metrics={"max_score": {"max": "_score"}},
    order=[{"max_score": "desc"}],
)
```

`L2` の場合、`_score` の最小値を計算し、距離が最も短いバケットが先頭に来るように指標エイリアスを昇順でソートします。

</details>

<details>

<summary>複合バケットキーの作成</summary>

複合バケットキーを作成するには、同一リスト内に複数のフィールド名を渡します。

```python
aggregation = SearchAggregation(
    # highlight-start
    # Combine brand and color to form a composite bucket key.
    fields=["brand", "color"],
    # highlight-end
    size=6,
)
```

この設定により、`(Brand A, black)`、`(Brand A, blue)`、`(Brand B, white)` などのキーが生成される可能性があります。2つのエンティティが同じバケットに属するのは、両方の値が一致する場合のみです。Zilliz Cloud はリストの順序を保持するため、`brand` が第1キーコンポーネント、`color` が第2キーコンポーネントとなります。`order` で `_key` が使用された場合、Zilliz Cloud は複合キーのコンポーネントを同じ順序で比較します。複数の文字列は1つのフラットなリストで渡してください。ネストされたリストはサポートされていません。

`size=6` は、この集計レベルで返される複合バケットの最大数です。サンプルデータには5通りの異なるブランドと色の組み合わせが含まれているため、最大5つすべてを返すことができます。[returned-entry limit](./search-aggregation#limits) の観点では、このリクエストは `1 query vector × 6 buckets × 1 = 6` 個の設定済み結果エントリとしてカウントされます。

1つの `SearchAggregation.fields` リストに複数のフィールドを指定すると、その集計レベルで複合バケットキーが作成されます。親子関係にあるバケット階層を作成するには、[nested aggregation](./search-aggregation#group-results-at-multiple-levels) を使用してください。

</details>

以降の例では `aggregation` を再定義します。更新したオブジェクトを同じ `search_aggregation` パラメーターに渡し、検索を再実行してください。

### 各バケットから代表的な結果を表示する\{#show-representative-results-from-each-bucket}

アプリケーションで各バケットの実際の商品を表示する必要がある場合は、代表的なエンティティを含めます。この例では、Zilliz Cloud が各ブランドバケットから最大2件の商品を返し、評価、ベクトルスコアの順に並べ替えます。

`TopHits` を次のように設定します。

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

<summary>代表的なヒットを含むバケットを表示する</summary>

以下の Brand A バケットは上記のリクエストから取得したものであり、可読性のために JSON 形式にシリアライズしています。

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

| パラメーター | 目的 |
| --- | --- |
| `top_hits` | 任意。この集計レベルにおける代表的なエンティティを設定します。省略した場合、`bucket.hits` は空になり、キーごとの候補バジェットはデフォルトの 1 になります。 |
| `TopHits.size` | 選択された各バケットから最大2件の代表的なエンティティを返し、集計ツリー全体でキーごとの候補バジェットを 2 に設定します。 |
| `TopHits.sort` | 指定された条件に従って、各バケット内のエンティティを並べ替えます。 |

アプリケーションで代表的なエンティティが必要な場合や、カウントおよびメトリクスに対してより広いキーごとの候補ウィンドウが必要な場合は、`top_hits` を設定します。`TopHits.size` を大きくすると、候補バジェットと [Limits](./search-aggregation#limits) における最大返却エントリ数の計算値の両方が増加します。

`SearchAggregation.order` はバケットを並べ替え、`TopHits.sort` は各バケット内に保持されたエンティティを並べ替えます。並べ替え順序は、`count` やメトリクスのために保持される候補には影響しません。`TopHits.sort` には、比較可能なスカラーフィールド名と、ANN の類似度または距離を表す組み込みの `_score` フィールドを指定できます。Zilliz Cloud は `sort` エントリを先頭から順に評価します。この例では、商品を `rating` の降順で並べ替え、評価が同じ場合にのみ `_score` を使用します。設定で `COSINE` を使用しているため、`_score` の降順により、より類似度の高い商品が上位に表示されます。

`metrics` または `TopHits.sort` で使用するフィールドを `output_fields` に含める必要はありません。Zilliz Cloud がこれらのフィールドを内部的に取得しますが、返される各ヒットの `fields` マッピングに含まれるのは、`output_fields` に明示的に指定されたフィールドのみです。プライマリキーとベクトルスコアは、それぞれ `AggregationHit.pk` と `AggregationHit.score` から引き続き取得できます。

返される各 `AggregationHit` には、プライマリキーが `pk` に、ベクトルスコアが `score` に、要求された出力フィールドが `fields` に格納されます。

### 複数レベルでの結果のグループ化\{#group-results-at-multiple-levels}

バケット内にさらに別のレベルのバケットを作成したい場合は、ネストされた集計を使用します。この例では、Zilliz Cloud がまずカテゴリバケットを作成し、その中にブランドバケットを作成します。

子集計の対象となるのは、親バケットに割り当てられたエンティティのみです。`fields` が各集計レベルのバケットキーを制御し、`sub_aggregation` が親子階層を形成します。

以下の設定では、キーが `(running_shoes)` のカテゴリバケットが作成されます。この親バケット内で、子集計により `(Brand A)`、`(Brand B)`、`(Brand C)` などのキーを持つ個別のブランドバケットが作成されます。

```plaintext
Parent bucket key:
(running_shoes)

Child bucket keys:
├── (Brand A)
├── (Brand B)
└── (Brand C)
```

各レベルで独立して複数のフィールドを使用できます。たとえば、子集計で `fields=["brand", "color"]` を使用すると、`(Brand A, black)` のような複合子キーが生成されます。

次の設定により、この階層構造を実装します。

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

<summary>ネストされたバケットの結果を表示する</summary>

以下のシリアライズされた抜粋は、`running_shoes` 親バケットとその子である Brand B バケットを示しています。なお、簡潔にするため Brand A および Brand C の子バケットは省略しています。

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

表示されている結果は、単一の複合バケットキー `(running_shoes, Brand B)` ではなく、バケットパス `(running_shoes) → (Brand B)` を表しています。

Zilliz Cloud はまず、`product_count` に基づいて最大2つのカテゴリバケットを選択します。次に、選択された各カテゴリ内で独立して `sub_aggregation` を実行し、`avg_rating` に基づいて最大3つのブランドバケットを返します。

上記の出力の内容は以下の通りです。

- ルートの `running_shoes` バケットには、子の複合キー全体で合計4件の候補が保持されています。また、その `metrics` には、ルートレベルの `avg_price` および `product_count` の値が含まれています。

- ルートバケットの `sub_groups` リストには、子のブランドバケットが含まれています。表示されている Brand B バケットには1件の候補が保持されており、独自の `avg_rating` および `brand_count` の値を持っています。

- ルート集計では `top_hits` が設定されていないため、ルートバケットの `hits` リストは空です。一方、Brand B の子バケットには代表的なヒットが含まれていますが、これは `sub_aggregation` 内で `top_hits` が設定されているためです。

## FAQ\{#faq}

### バケットのカウントとメトリクスの精度について\{#how-accurate-are-bucket-counts-and-metrics}

Search Aggregation は保持された ANN 候補を集約するものであり、コレクション全体の集計を行うものではありません。

候補の保持には2段階の近似処理があります。まず、ANN 検索の段階で関連するコレクションエンティティの一部が対象外となる可能性があります。次に、グループ化の段階では、各完全な複合キーに対して最大 `TopHits.size` 件の候補のみが保持されます。どのレベルでも `top_hits` が設定されていない場合、このキーごとの上限は 1 となります。

たとえば、コレクションに 5,000 件の Brand A 商品があり、その多くがベクトルクエリに関連しているとします。集計で `TopHits(size=4)` を使用する場合、Brand A バケットに保持される候補は、完全な複合キーあたり最大4件に制限されます。したがって、その `count` やメトリクスは、関連するすべての Brand A 商品やコレクション全体の 5,000 件ではなく、保持された候補のみを表します。

近似の影響が最も大きくなるのは、`order` でメトリクスエイリアスを使用している場合です。検索のリコール率が変化するとメトリクス値も変動し、結果として `SearchAggregation.size` の範囲に含まれるバケットが変わる可能性があります。ネストされた集計では、各子レベルが親バケット内の利用可能なエンティティのみを対象に処理するため、この影響が増幅されることがあります。

一致するすべてのエンティティについて正確な統計が必要な場合は、Search Aggregation ではなく、厳密なクエリ集計ワークフローを使用してください。

### Search Aggregation と Grouping Search の違い\{#how-does-search-aggregation-differ-from-grouping-search}

アプリケーションで主に必要とする結果形式に応じて使い分けます。

| 主な要件 | 推奨機能 | レスポンスの形式 |
| --- | --- | --- |
| グループ化フィールドの重複値を抑えつつ、標準的なランキング順のエンティティリストを取得したい | [Grouping Search](./grouping-search) | 各クエリベクトルに対するフラットな検索ヒット |
| キー、件数、メトリクス、順序、代表的なヒット、子バケットなどを持つバケットとしてグループを分析・比較したい | Search Aggregation | `AggregationBucket` 内の `result.agg_buckets` オブジェクト |

Search Aggregation で `top_hits` を設定した場合でも、レスポンスの主構造はバケットツリーです。一方、Grouping Search は、アプリケーションが通常の検索ヒットをすでに処理できており、結果の多様性を確保したい場合に有効です。

これらの API は同時に使用できません。PyMilvus では、同一リクエスト内で `search_aggregation` と `group_by_field` または `group_by_fields` を組み合わせると `ParamError` が発生します。
