---
title: "Search Aggregation | BYOC"
slug: /search-aggregation
sidebar_label: "Search Aggregation"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ユーザーが「日常トレーニング用の黒いランニングシューズ」を検索すると、近似最近傍（ANN）検索は商品をベクトル類似度に基づいてランキングし、フラットな Top-K リストを返します。結果は関連性が高いものの、重複が目立つ場合があります。例えば、以下のケースでは最初の6件中4件がブランドAの商品であり、ブランドBとブランドCはそれぞれ1件ずつしか表示されません。 | BYOC"
type: origin
token: Fighwx5zFiwaoIkV4q5cAJ1enDg
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Search Aggregation

ユーザーが「日常トレーニング用の黒いランニングシューズ」を検索すると、近似最近傍（ANN）検索は商品をベクトル類似度に基づいてランキングし、フラットな Top-K リストを返します。結果は関連性が高いものの、重複が目立つ場合があります。例えば、以下のケースでは最初の6件中4件がブランドAの商品であり、ブランドBとブランドCはそれぞれ1件ずつしか表示されません。

フラットなリストのままでは、バケット単位のサマリーを直接得ることはできません。アプリケーションによっては、保持された候補数や平均価格を使ってブランドを比較したり、各ブランドから少数の代表的な商品を確認したり、結果を複数のバケット階層に整理したりする必要があるかもしれません。

Search Aggregation は、保持された ANN 候補を選択したスカラーフィールドに基づいてバケットに整理します。この例では、各ブランドが個別のバケットとなります。Zilliz Cloud を使用すると、各バケットの統計計算、バケットの並べ替え、代表商品の付与が可能です。アプリケーションは、このバケット優先のレスポンスを `result.agg_buckets` を通じて受け取ります。

![CPHkwKQTRhuEQKbsxdacRZuCnVe](https://zdoc-images.s3.us-west-2.amazonaws.com/CPHkwKQTRhuEQKbsxdacRZuCnVe.png)

Search Aggregation は、コレクション全体に対する厳密な集約処理を行うわけではありません。バケットの有無、件数、メトリクス、並び順、および代表的なヒット結果は、ANN およびグループ化ステージで保持された候補に依存します。

## 仕組み\{#how-it-works}

![Edbbw7oulhszR2baU7BcsjiMntf](https://zdoc-images.s3.us-west-2.amazonaws.com/Edbbw7oulhszR2baU7BcsjiMntf.png)

1. **候補の取得:** Zilliz Cloud は ANN 検索を実行し、クエリベクトルに最も近いエンティティを取得します。その後、グループ化ステージで完全複合キーごとに一定数の候補を保持します。このキーごとの候補バジェットは、集約ツリー内で設定される最大の `TopHits.size` 値、あるいはどのレベルでも `top_hits` が設定されていない場合は `1` となります。

1. **バケットの構築:** `SearchAggregation.fields` パラメーターがバケットキーを定義します。フィールド値の一意の組み合わせごとに個別のキーが生成されます。図の例では、`fields=["brand"]` によって `(Brand A)`、`(Brand B)`、`(Brand C)` のバケットキーが作成されています。同じキーを持つ保持候補は同一のバケットに分類され、その `count` に寄与します。`SearchAggregation.size` は、Zilliz Cloud が返すバケット数の上限を指定します。

1. **結果の計算と返却:** 返される各バケットには、キーと保持された候補数が含まれます。Zilliz Cloud はさらに、設定されたメトリクスの計算、バケットのソート、代表エンティティの返却、子バケットの構築も実行できます。`result.agg_buckets` 内の各 `AggregationBucket` には、`key`、`count`、`metrics`、`hits`、`sub_groups` が含まれます。Search Aggregation が有効な場合、通常の検索ヒットリストは空になります。

図の例では、`TopHits.size=4` によりキーごとの候補バジェットが4に設定されているため、保持された4件のブランドA候補から `count: 4` が生成されます。なお、図を見やすくするため、ブランドAのカードには返された4件の代表ヒットのうち2件のみを表示しています。

`sub_aggregation` を使用すると、Zilliz Cloud は各親バケット内でステップ2と3を繰り返します。ANN の再現率やキーごとの候補バジェットを変更すると、バケット数、メトリクス、並び順、ヒット内容、およびネストされた結果が変化する可能性があります。

## 制限事項\{#limits}

Search Aggregation を使用する際は、以下の制限事項にご注意ください。

- **ネストされた集約:** 1つのリクエストには、ルート `SearchAggregation` を1つと、最大3階層のネストされた `sub_aggregation` を含めることができ、合計で最大4階層まで指定可能です。全階層を通じて、バケットキーの作成に使用できるフィールドは最大10個です。

- **バケットキー作成に使用するフィールド:** `SearchAggregation.fields` パラメーターには、Boolean、整数、`VARCHAR`、`TIMESTAMPTZ` フィールドを使用できます。`FLOAT`、`DOUBLE`、`ARRAY`、`JSON`、`GEOMETRY`、`TEXT`、ベクトル、および動的フィールドはサポートされていません。

- **メトリクスフィールド:** `count` 操作には、`"*"` または非 `JSON`・非動的フィールドを使用でき、フィールド指定時は `NULL` 値がスキップされます。`sum` と `avg` には整数および浮動小数点フィールドを使用できます。`min` と `max` では、さらに文字列および `TIMESTAMPTZ` フィールドも使用可能です。

- **Top Hits のソートフィールド:** `TopHits.sort` パラメーターには、比較可能な Boolean、整数、浮動小数点、文字列、`TIMESTAMPTZ` フィールドのほか、`_score` を使用できます。`ARRAY`、`JSON`、`GEOMETRY`、ベクトル、および動的フィールドはサポートされていません。

- **候補バジェット:** 集約ツリー内で設定される最大の `TopHits.size` が、完全複合キーごとに保持される候補数となります。どのレベルでも `top_hits` が設定されていない場合、Zilliz Cloud はキーごとに1件の候補のみを保持します。バケットの `count` やメトリクスはこれらの保持候補から計算されるため、`TopHits.size` を変更すると結果も変わる可能性があります。

- **Null 許容バケットフィールド:** `NULL` 値も独立したバケットキーとして扱われます。null バケットを除外したい場合は、検索リクエストに `brand is not null` などのフィルターを追加してください。

- **フィールドの重複禁止:** 同じフィールドを複数の `SearchAggregation.fields` リストに指定することはできません。たとえば、ルート集約で `fields=["category"]` を使用した場合、ネストされた `sub_aggregation` で再度 `fields=["category"]` を使うことはできません。

- **併用できない機能:** Search Aggregation は、0以外の `offset`、Search Iterators、Hybrid Search、Highlighter、Grouping Search と併用できません。トップレベルの `offset` に `0` を指定した場合は、パラメーターを省略したときと同じ動作になります。REST v2 プロトコルでは、`searchAggregation` と `ids` を同時に指定することはできません。

- **返却エントリ数:** 計算上の最大結果エントリ数は10,000以下に抑えてください。サーバーはこの最大値を `number of query vectors × product of the effective search_size at every aggregation level × largest TopHits.size at any level` として算出します。

    どのレベルでも `TopHits` が設定されていない場合、最後の係数には `1` が使われます。たとえば、クエリベクトルが1つ、ルートバケットが10個、各ルートバケットに子バケットが5個、各子バケットのヒット数が2件の場合、計算上の最大値は `1 × 10 × 5 × 2 = 100` となります。

## Search Aggregation の使い方\{#use-search-aggregation}

目的に応じて以下の例を選択してください。

| 項目 | 説明 | 主な設定 |
| --- | --- | --- |
| [バケットの比較とソート](./search-aggregation#compare-and-sort-buckets) | バケットごとの統計情報を算出して比較し、返されたバケットをメトリクス、件数、またはキーでソートします。 | `fields`, `size`, `metrics`, `order` |
| [各バケットの代表結果の表示](./search-aggregation#show-representative-results-from-each-bucket) | 各バケットから限られた数のエンティティを取得し、それらをスカラーフィールドまたはベクトルスコアで個別にソートします。 | `top_hits`, `TopHits.size`, `TopHits.sort` |
| [複数レベルでの結果グループ化](./search-aggregation#group-results-at-multiple-levels) | 結果を親・子のバケット階層に整理し、複数のディメンションを段階的に分析します。 | `sub_aggregation` |

以下の例では、brand、category、color、price、rating フィールドを持つ商品コレクションを使用します。ブランド名、商品名、価格、評価、および検索結果はすべて合成データです。次のセクションを展開してコレクションを作成し、共通の検索変数を定義してください。

<details>

<summary>サンプルコレクションをセットアップする</summary>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.InsertReq;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN").build());
String collectionName = "product_search_aggregation";

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder().build();
schema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(true).autoID(false).build());
schema.addField(AddFieldReq.builder().fieldName("embedding").dataType(DataType.FloatVector).dimension(5).build());
schema.addField(AddFieldReq.builder().fieldName("name").dataType(DataType.VarChar).maxLength(200).build());
schema.addField(AddFieldReq.builder().fieldName("brand").dataType(DataType.VarChar).maxLength(100).build());
schema.addField(AddFieldReq.builder().fieldName("category").dataType(DataType.VarChar).maxLength(100).build());
schema.addField(AddFieldReq.builder().fieldName("color").dataType(DataType.VarChar).maxLength(50).build());
schema.addField(AddFieldReq.builder().fieldName("price").dataType(DataType.Double).build());
schema.addField(AddFieldReq.builder().fieldName("rating").dataType(DataType.Double).build());
schema.addField(AddFieldReq.builder().fieldName("in_stock").dataType(DataType.Bool).build());

client.createCollection(CreateCollectionReq.builder().collectionName(collectionName).collectionSchema(schema)
        .indexParams(Collections.singletonList(IndexParam.builder().fieldName("embedding")
                .indexType(IndexParam.IndexType.AUTOINDEX).metricType(IndexParam.MetricType.COSINE).build()))
        .build());

List<JsonObject> data = Arrays.asList(
        product(1, new float[]{0.12f, 0.42f, 0.18f, 0.66f, 0.31f}, "Runner A1", "Brand A", "running_shoes", "black", 129.99, 4.7, true),
        product(2, new float[]{0.10f, 0.39f, 0.20f, 0.61f, 0.29f}, "Trail A2", "Brand A", "running_shoes", "blue", 139.99, 4.6, true),
        product(3, new float[]{0.14f, 0.44f, 0.19f, 0.68f, 0.33f}, "Runner B1", "Brand B", "running_shoes", "white", 159.99, 4.8, true),
        product(4, new float[]{0.16f, 0.41f, 0.22f, 0.62f, 0.30f}, "Runner C1", "Brand C", "running_shoes", "red", 119.99, 4.4, false),
        product(5, new float[]{0.48f, 0.20f, 0.59f, 0.15f, 0.71f}, "Jacket A1", "Brand A", "jackets", "black", 99.99, 4.5, true),
        product(6, new float[]{0.45f, 0.18f, 0.55f, 0.17f, 0.69f}, "Jacket B1", "Brand B", "jackets", "blue", 89.99, 4.3, true),
        product(7, new float[]{0.09f, 0.38f, 0.17f, 0.60f, 0.27f}, "Runner A3", "Brand A", "running_shoes", "black", 159.99, 4.8, true),
        product(8, new float[]{0.13f, 0.43f, 0.21f, 0.65f, 0.32f}, "Runner A4", "Brand A", "running_shoes", "black", 149.99, 4.9, true));
client.insert(InsertReq.builder().collectionName(collectionName).data(data).build());

List<Float> queryVector = Arrays.asList(0.11f, 0.40f, 0.19f, 0.64f, 0.30f);

private static JsonObject product(long id, float[] embedding, String name, String brand,
                                  String category, String color, double price, double rating,
                                  boolean inStock) {
    JsonObject row = new JsonObject();
    row.addProperty("id", id);
    row.add("embedding", new Gson().toJsonTree(embedding));
    row.addProperty("name", name);
    row.addProperty("brand", brand);
    row.addProperty("category", category);
    row.addProperty("color", color);
    row.addProperty("price", price);
    row.addProperty("rating", rating);
    row.addProperty("in_stock", inStock);
    return row;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { DataType, MilvusClient } = require('@zilliz/milvus2-sdk-node');

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT', username: 'root', password: 'Milvus',
});
const collectionName = 'product_search_aggregation';

if ((await client.hasCollection({ collection_name: collectionName })).value) {
  await client.dropCollection({ collection_name: collectionName });
}
await client.createCollection({
  collection_name: collectionName,
  consistency_level: 'Session',
  fields: [
    { name: 'id', data_type: DataType.Int64, is_primary_key: true, autoID: false },
    { name: 'embedding', data_type: DataType.FloatVector, dim: 5 },
    { name: 'name', data_type: DataType.VarChar, max_length: 200 },
    { name: 'brand', data_type: DataType.VarChar, max_length: 100 },
    { name: 'category', data_type: DataType.VarChar, max_length: 100 },
    { name: 'color', data_type: DataType.VarChar, max_length: 50 },
    { name: 'price', data_type: DataType.Double },
    { name: 'rating', data_type: DataType.Double },
    { name: 'in_stock', data_type: DataType.Bool },
  ],
});

const data = [
  { id: 1, embedding: [0.12, 0.42, 0.18, 0.66, 0.31], name: 'Runner A1', brand: 'Brand A', category: 'running_shoes', color: 'black', price: 129.99, rating: 4.7, in_stock: true },
  { id: 2, embedding: [0.10, 0.39, 0.20, 0.61, 0.29], name: 'Trail A2', brand: 'Brand A', category: 'running_shoes', color: 'blue', price: 139.99, rating: 4.6, in_stock: true },
  { id: 3, embedding: [0.14, 0.44, 0.19, 0.68, 0.33], name: 'Runner B1', brand: 'Brand B', category: 'running_shoes', color: 'white', price: 159.99, rating: 4.8, in_stock: true },
  { id: 4, embedding: [0.16, 0.41, 0.22, 0.62, 0.30], name: 'Runner C1', brand: 'Brand C', category: 'running_shoes', color: 'red', price: 119.99, rating: 4.4, in_stock: false },
  { id: 5, embedding: [0.48, 0.20, 0.59, 0.15, 0.71], name: 'Jacket A1', brand: 'Brand A', category: 'jackets', color: 'black', price: 99.99, rating: 4.5, in_stock: true },
  { id: 6, embedding: [0.45, 0.18, 0.55, 0.17, 0.69], name: 'Jacket B1', brand: 'Brand B', category: 'jackets', color: 'blue', price: 89.99, rating: 4.3, in_stock: true },
  { id: 7, embedding: [0.09, 0.38, 0.17, 0.60, 0.27], name: 'Runner A3', brand: 'Brand A', category: 'running_shoes', color: 'black', price: 159.99, rating: 4.8, in_stock: true },
  { id: 8, embedding: [0.13, 0.43, 0.21, 0.65, 0.32], name: 'Runner A4', brand: 'Brand A', category: 'running_shoes', color: 'black', price: 149.99, rating: 4.9, in_stock: true },
];
await client.insert({ collection_name: collectionName, data });
await client.createIndex({ collection_name: collectionName, field_name: 'embedding', index_type: 'AUTOINDEX', metric_type: 'COSINE' });
await client.loadCollectionSync({ collection_name: collectionName });

const queryVector = [0.11, 0.40, 0.19, 0.64, 0.30];
const searchParams = { metric_type: 'COSINE', params: {} };
```

</TabItem>

<TabItem value='go'>

```go
// TBD: Search Aggregation is not yet available in the released Go SDK.
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"
export COLLECTION_NAME="product_search_aggregation"
search() {
  curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    --data "$1"
}
schema='{"autoID":false,"enableDynamicField":false,"fields":[{"fieldName":"id","dataType":"Int64","isPrimary":true},{"fieldName":"embedding","dataType":"FloatVector","elementTypeParams":{"dim":5}},{"fieldName":"name","dataType":"VarChar","elementTypeParams":{"max_length":200}},{"fieldName":"brand","dataType":"VarChar","elementTypeParams":{"max_length":100}},{"fieldName":"category","dataType":"VarChar","elementTypeParams":{"max_length":100}},{"fieldName":"color","dataType":"VarChar","elementTypeParams":{"max_length":50}},{"fieldName":"price","dataType":"Double"},{"fieldName":"rating","dataType":"Double"},{"fieldName":"in_stock","dataType":"Bool"}]}'
indexParams='[{"fieldName":"embedding","indexType":"AUTOINDEX","metricType":"COSINE"}]'
data='[{"id":1,"embedding":[0.12,0.42,0.18,0.66,0.31],"name":"Runner A1","brand":"Brand A","category":"running_shoes","color":"black","price":129.99,"rating":4.7,"in_stock":true},{"id":2,"embedding":[0.10,0.39,0.20,0.61,0.29],"name":"Trail A2","brand":"Brand A","category":"running_shoes","color":"blue","price":139.99,"rating":4.6,"in_stock":true},{"id":3,"embedding":[0.14,0.44,0.19,0.68,0.33],"name":"Runner B1","brand":"Brand B","category":"running_shoes","color":"white","price":159.99,"rating":4.8,"in_stock":true},{"id":4,"embedding":[0.16,0.41,0.22,0.62,0.30],"name":"Runner C1","brand":"Brand C","category":"running_shoes","color":"red","price":119.99,"rating":4.4,"in_stock":false},{"id":5,"embedding":[0.48,0.20,0.59,0.15,0.71],"name":"Jacket A1","brand":"Brand A","category":"jackets","color":"black","price":99.99,"rating":4.5,"in_stock":true},{"id":6,"embedding":[0.45,0.18,0.55,0.17,0.69],"name":"Jacket B1","brand":"Brand B","category":"jackets","color":"blue","price":89.99,"rating":4.3,"in_stock":true},{"id":7,"embedding":[0.09,0.38,0.17,0.60,0.27],"name":"Runner A3","brand":"Brand A","category":"running_shoes","color":"black","price":159.99,"rating":4.8,"in_stock":true},{"id":8,"embedding":[0.13,0.43,0.21,0.65,0.32],"name":"Runner A4","brand":"Brand A","category":"running_shoes","color":"black","price":149.99,"rating":4.9,"in_stock":true}]'
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --data "{\"collectionName\":\"${COLLECTION_NAME}\",\"schema\":${schema},\"indexParams\":${indexParams}}"
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --data "{\"collectionName\":\"${COLLECTION_NAME}\",\"data\":${data}}"
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --data "{\"collectionName\":\"${COLLECTION_NAME}\"}"
```

</TabItem>
</Tabs>

</details>

上記の設定では、ベクトルインデックスと検索パラメーターの両方に `COSINE` を指定しています。そのため、以降の例では `{"_score": "desc"}` を使用して、コサイン類似度が高い順に並べ替えます。`L2` のような距離メトリックの場合は、`{"_score": "asc"}` を使用してください。

### バケットの比較とソート\{#compare-and-sort-buckets}

このパターンは、取得したエンティティのグループを統計値に基づいて比較し、バケットの返却順序を制御したい場合に使用します。この例では、Zilliz Cloud が取得した製品を `brand` でグループ化し、各ブランドバケットの価格メトリックを計算した上で、平均価格でバケットをソートします。

フィールド値ごとに1つ以上のエンティティを返すことで結果の多様性を高めることだけが目的であれば、代わりに [Grouping Search](./grouping-search) を使用してください。

次の設定では、最大3つのブランドバケットを作成し、各バケットのメトリックを計算して、平均価格でバケットをソートします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.aggregation.AggDirection;
import io.milvus.v2.service.vector.request.aggregation.MetricOps;
import io.milvus.v2.service.vector.request.aggregation.MetricSpec;
import io.milvus.v2.service.vector.request.aggregation.OrderSpec;
import io.milvus.v2.service.vector.request.aggregation.SearchAggregation;
import io.milvus.v2.service.vector.request.aggregation.SortSpec;
import io.milvus.v2.service.vector.request.aggregation.TopHitsSpec;
import java.util.Collections;

SearchAggregation aggregation = SearchAggregation.builder()
        .fields(Collections.singletonList("brand"))
        .size(3)
        .addMetric("product_count", MetricSpec.builder().op(MetricOps.COUNT).fieldName("*").build())
        .addMetric("avg_price", MetricSpec.builder().op(MetricOps.AVG).fieldName("price").build())
        .addMetric("min_price", MetricSpec.builder().op(MetricOps.MIN).fieldName("price").build())
        .addOrder(OrderSpec.builder().key("avg_price").direction(AggDirection.DESC).build())
        .addOrder(OrderSpec.builder().key("_key").direction(AggDirection.ASC).build())
        .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
const aggregation = {
  fields: ['brand'],
  size: 3,
  metrics: {
    product_count: { op: 'count', field_name: '*' },
    avg_price: { op: 'avg', field_name: 'price' },
    min_price: { op: 'min', field_name: 'price' },
  },
  order: [
    { key: 'avg_price', direction: 'desc' },
    { key: '_key', direction: 'asc' },
  ],
};
```

</TabItem>

<TabItem value='go'>

```go
// TBD: Search Aggregation is not yet available in the released Go SDK.
```

</TabItem>

<TabItem value='bash'>

```bash
payload='{
  "collectionName": "product_search_aggregation",
  "data": [[0.11, 0.40, 0.19, 0.64, 0.30]],
  "annsField": "embedding", "limit": 10,
  "searchParams": {"metric_type": "COSINE", "params": {}},
  "searchAggregation": {
    "fields": ["brand"], "size": 3,
    "metrics": {"product_count": {"op": "count", "fieldName": "*"}, "avg_price": {"op": "avg", "fieldName": "price"}, "min_price": {"op": "min", "fieldName": "price"}},
    "order": [{"key": "avg_price", "direction": "desc"}, {"key": "_key", "direction": "asc"}]
  }
}'
search "$payload"
```

</TabItem>
</Tabs>

このオブジェクトを `MilvusClient.search()` の `search_aggregation` パラメーターに渡します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
SearchResp result = client.search(SearchReq.builder()
        .collectionName(collectionName)
        .data(Collections.singletonList(new FloatVec(queryVector)))
        .annsField("embedding")
        .limit(10)
        .searchParams(Collections.singletonMap("metric_type", "COSINE"))
        .outputFields(Arrays.asList("name", "brand", "category", "color", "price", "rating", "in_stock"))
        .searchAggregation(aggregation)
        .build());

List<AggregationBucket> buckets = result.getAggregationBuckets().get(0);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const result = await client.search({
  collection_name: collectionName,
  data: queryVector,
  anns_field: 'embedding',
  limit: 10,
  ...searchParams,
  output_fields: ['name', 'brand', 'category', 'color', 'price', 'rating', 'in_stock'],
  search_aggregation: aggregation,
});

const buckets = result.agg_buckets;
```

</TabItem>

<TabItem value='go'>

```go
// TBD: Search Aggregation is not yet available in the released Go SDK.
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "product_search_aggregation",
    "data": [[0.11, 0.40, 0.19, 0.64, 0.30]],
    "annsField": "embedding",
    "limit": 10,
    "outputFields": ["name", "brand", "category", "color", "price", "rating", "in_stock"],
    "searchParams": {"metric_type": "COSINE", "params": {}},
    "searchAggregation": {
      "fields": ["brand"], "size": 3,
      "metrics": {"product_count": {"op": "count", "fieldName": "*"}, "avg_price": {"op": "avg", "fieldName": "price"}, "min_price": {"op": "min", "fieldName": "price"}},
      "order": [{"key": "avg_price", "direction": "desc"}, {"key": "_key", "direction": "asc"}]
    }
  }'
```

</TabItem>
</Tabs>

`search_aggregation` を設定すると、PyMilvus は `result[0]` に通常のエンティティヒットを返しません。代わりに `result.agg_buckets[0]` からバケットのレスポンスを取得してください。`output_fields` パラメーターは、返される各 `AggregationHit.fields` マッピングに含まれるスカラーフィールドを制御します。なお、Zilliz Cloud では、`output_fields` に含まれていないメトリックソースやソート用のフィールドも引き続き使用できます。

<details>

<summary>バケット出力の例を表示</summary>

以下の出力は上記のリクエストから取得したもので、可読性のために JSON 形式にシリアライズしています。PyMilvus は JSON ではなく `AggregationBucket` オブジェクトを返します。`key` の値は、`fields` にフィールドが1つしかない場合でも、常にキー構成要素の順序付きリストとなります。これにより、複合キーにおけるフィールドの順序が維持されます。

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

このガイドで使用する単一のクエリベクトルでは、返されるトップレベルのバケットを `result.agg_buckets[0]` から取得します。各バケットには、順序付きのキー構成要素、保持された候補の `count`、計算済みの `metrics`、代表的な `hits`、およびネストされたバケットが `sub_groups` に含まれます。

設定の内容は以下のとおりです。

| 設定項目 | 制御対象 | この例での値 |
| --- | --- | --- |
| `fields` | Zilliz Cloud によるバケットキーの生成方法 | 一意の `brand` 値ごとにバケットを1つ作成します。 |
| `size` | 返されるバケットの最大数 | ブランドバケットを最大3つ返します。 |
| `metrics` | 各バケットに対して計算される統計情報 | 商品数、平均価格、最低価格を計算します。 |
| `order` | Zilliz Cloud によるバケットのソート方法 | 平均価格でソートし、同値の場合はバケットキーで順位を決定します。 |

`search_aggregation` が設定されている場合、Zilliz Cloud は `limit` を無視します。トップレベルのバケット数を制御するには、ルートの `SearchAggregation.size` 値を使用してください。

この設定により、Zilliz Cloud は Brand B、Brand A、Brand C のバケットを `avg_price` の降順で返します。`_key` によるソートは、バケットの平均価格が同じ場合にのみ適用されます。この設定では `top_hits` が定義されていないため、各バケットの `hits` リストは空となり、キーごとの候補バジェットは `1` となります。したがって、表示されるカウントとメトリクスは、各ブランドについて保持された候補が1つであることを示しています。アグリゲーションでキーごとのメトリクスウィンドウを広くする必要がある場合は、`top_hits` に大きな `TopHits.size` を設定してください。

<details>

<summary>メトリクスとソートのルール</summary>

各 `SearchAggregation.metrics` エントリは、ユーザー定義のエイリアスを演算とそのソースに対応付けます。

| ソース | サポートされる演算 | 動作 |
| --- | --- | --- |
| `JSON` および動的フィールド以外のフィールド | `count` | ソースフィールドが `NULL` でない保持候補の数をカウントします。 |
| 整数または浮動小数点フィールド | `sum`、`avg`、`min`、`max` | null でない保持値に対して計算を実行します。 |
| 文字列または `TIMESTAMPTZ` フィールド | `min`、`max` | null でない保持値の最小値または最大値を選択します。 |
| `"*"` | `count` | バケット内のすべての保持候補をカウントします。結果は `bucket.count` と一致します。 |
| `_score` | `sum`、`avg`、`min`、`max` | 保持候補の ANN 類似度または距離の値を集計します。 |

`SearchAggregation.order` では以下のキーを使用できます。

| ソートキー | 説明 |
| --- | --- |
| メトリクスのエイリアス | 同じアグリゲーションレベルの `metrics` で計算された値（`avg_price` など）に基づいてソートします。 |
| `_count` | 各バケット内の保持候補数に基づいてソートします。 |
| `_key` | `_key` という名前のコレクションフィールドではなく、バケットキーに基づいてソートします。 |

各 `order` エントリは、キーを `"asc"` または `"desc"` に対応付けます。Zilliz Cloud は複数のエントリを先頭から順に評価します。`order` を省略した場合、Zilliz Cloud は保持候補セットにおけるバケットの検出順序を維持します。

ベクトルのマッチ品質に基づいてバケットをソートするには、まず `_score` からバケットレベルのメトリクスを計算し、そのメトリクスのエイリアスを `order` で使用します。各バケットには複数のエンティティスコアが含まれる可能性があるため、`_score` をバケットのソートキーとして直接使用することはできません。たとえば、`COSINE` や `IP` を使用する場合:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
aggregation = SearchAggregation(
    fields=["brand"],
    size=3,
    metrics={"max_score": {"max": "_score"}},
    order=[{"max_score": "desc"}],
)
```

</TabItem>

<TabItem value='java'>

```java
SearchAggregation aggregation = SearchAggregation.builder()
        .fields(Collections.singletonList("brand"))
        .size(3)
        .addMetric("max_score", MetricSpec.builder().op(MetricOps.MAX).fieldName("_score").build())
        .addOrder(OrderSpec.builder().key("max_score").direction(AggDirection.DESC).build())
        .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
const aggregation = {
  fields: ['brand'],
  size: 3,
  metrics: { max_score: { op: 'max', field_name: '_score' } },
  order: [{ key: 'max_score', direction: 'desc' }],
};
```

</TabItem>

<TabItem value='go'>

```go
// TBD: Search Aggregation is not yet available in the released Go SDK.
```

</TabItem>

<TabItem value='bash'>

```bash
payload='{
  "collectionName": "product_search_aggregation",
  "data": [[0.11, 0.40, 0.19, 0.64, 0.30]], "annsField": "embedding", "limit": 10,
  "searchParams": {"metric_type": "COSINE", "params": {}},
  "searchAggregation": {"fields": ["brand"], "size": 3, "metrics": {"max_score": {"op": "max", "fieldName": "_score"}}, "order": [{"key": "max_score", "direction": "desc"}]}
}'
search "$payload"
```

</TabItem>
</Tabs>

`L2` を使用する場合、`_score` の最小値を計算し、メトリクスのエイリアスを昇順でソートすることで、距離が最も小さいバケットが先頭に来るようにします。

</details>

<details>

<summary>複合バケットキーの作成</summary>

複合バケットキーを作成するには、同じリスト内に複数のフィールド名を指定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
aggregation = SearchAggregation(
    # highlight-start
    # Combine brand and color to form a composite bucket key.
    fields=["brand", "color"],
    # highlight-end
    size=6,
)
```

</TabItem>

<TabItem value='java'>

```java
SearchAggregation aggregation = SearchAggregation.builder()
        .fields(Arrays.asList("brand", "color"))
        .size(6)
        .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
const aggregation = {
  fields: ['brand', 'color'],
  size: 6,
};
```

</TabItem>

<TabItem value='go'>

```go
// TBD: Search Aggregation is not yet available in the released Go SDK.
```

</TabItem>

<TabItem value='bash'>

```bash
payload='{
  "collectionName": "product_search_aggregation",
  "data": [[0.11, 0.40, 0.19, 0.64, 0.30]], "annsField": "embedding", "limit": 10,
  "searchParams": {"metric_type": "COSINE", "params": {}},
  "searchAggregation": {"fields": ["brand", "color"], "size": 6}
}'
search "$payload"
```

</TabItem>
</Tabs>

この設定により、`(Brand A, black)`、`(Brand A, blue)`、`(Brand B, white)` などのキーが生成される可能性があります。2つのエンティティが同じバケットに属するのは、両方の値が一致する場合のみです。Zilliz Cloud はリストの順序を保持するため、`brand` が最初のキー構成要素、`color` が2番目の構成要素となります。`order` で `_key` を使用すると、Zilliz Cloud は複合キーの構成要素を同じ順序で比較します。複数の文字列は1つのフラットなリストで渡してください。ネストされたリストはサポートされていません。

`size=6` は、このアグリゲーションレベルで返される複合バケットの最大数です。サンプルデータにはブランドと色の組み合わせが5通り含まれているため、最大5つすべてを返すことができます。[返されるエントリの制限](./search-aggregation#limits) において、このリクエストは設定された結果エントリ `1 query vector × 6 buckets × 1 = 6` 件分としてカウントされます。

1つの `SearchAggregation.fields` リストに複数のフィールドを指定すると、そのアグリゲーションレベルで複合バケットキーが作成されます。親子関係にあるバケット階層を作成するには、[ネストされたアグリゲーション](./search-aggregation#group-results-at-multiple-levels) を使用してください。

</details>

以降の例では `aggregation` を再定義します。更新したオブジェクトを同じ `search_aggregation` パラメータに渡し、検索呼び出しを再実行してください。

### 各バケットの代表結果を表示する\{#show-representative-results-from-each-bucket}

アプリケーションで各バケットの実際の商品を表示する必要がある場合は、代表エンティティを含めます。この例では、Zilliz Cloud が各ブランドバケットから最大2件の商品を、rating の順、次にベクトルスコアの順で返します。

`TopHits` を次のように設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
SearchAggregation aggregation = SearchAggregation.builder().fields(Collections.singletonList("brand")).size(3)
        .topHits(TopHitsSpec.builder().size(2)
                .addSort(SortSpec.builder().fieldName("rating").direction(AggDirection.DESC).build())
                .addSort(SortSpec.builder().fieldName("_score").direction(AggDirection.DESC).build()).build())
        .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
const aggregation = {
  fields: ['brand'],
  size: 3,
  top_hits: {
    size: 2,
    sort: [
      { field_name: 'rating', direction: 'desc' },
      { field_name: '_score', direction: 'desc' },
    ],
  },
};
```

</TabItem>

<TabItem value='go'>

```go
// TBD: Search Aggregation is not yet available in the released Go SDK.
```

</TabItem>

<TabItem value='bash'>

```bash
payload='{
  "collectionName": "product_search_aggregation",
  "data": [[0.11, 0.40, 0.19, 0.64, 0.30]], "annsField": "embedding", "limit": 10,
  "searchParams": {"metric_type": "COSINE", "params": {}},
  "searchAggregation": {"fields": ["brand"], "size": 3, "topHits": {"size": 2, "sort": [{"fieldName": "rating", "direction": "desc"}, {"fieldName": "_score", "direction": "desc"}]}}
}'
search "$payload"
```

</TabItem>
</Tabs>

<details>

<summary>代表ヒットを含むバケットを表示</summary>

以下の Brand A バケットは、上記のリクエストから取得したものを、読みやすく JSON 形式にシリアル化したものです。

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
| `top_hits` | 任意です。この集計レベルにおける代表エンティティを設定します。省略した場合、`bucket.hits` は空になり、キーごとの候補バジェットはデフォルトの 1 になります。 |
| `TopHits.size` | 選択された各バケットから最大2件の代表エンティティを返し、集計ツリー全体のキーごとの候補バジェットを 2 に設定します。 |
| `TopHits.sort` | 指定された条件に基づいて、各バケット内のエンティティを並べ替えます。 |

アプリケーションで代表エンティティが必要な場合や、カウントおよびメトリクスに対してより広いキーごとの候補ウィンドウが必要な場合は、`top_hits` を設定します。`TopHits.size` を大きくすると、候補バジェットと[制限](./search-aggregation#limits)における最大返却エントリ数の計算値の両方が増加します。

`SearchAggregation.order` はバケットを並べ替え、`TopHits.sort` は各バケット内に保持されたエンティティを並べ替えます。並べ替え順序は、`count` やメトリクス用に保持される候補に影響しません。`TopHits.sort` には、比較可能なスカラーフィールド名と、ANN の類似度または距離を表す組み込みフィールド `_score` を指定できます。Zilliz Cloud は `sort` のエントリを先頭から順に評価します。この例では、商品を `rating` の高い順に並べ、rating が等しい場合にのみ `_score` を使用します。設定で `COSINE` が使われているため、`_score` の降順により、より類似した商品が先頭に配置されます。

`metrics` や `TopHits.sort` で使用するフィールドを `output_fields` に含める必要はありません。Zilliz Cloud がこれらのフィールドを内部的に取得しますが、返される各ヒットの `fields` マッピングに含まれるのは、`output_fields` に明示的に指定されたフィールドのみです。プライマリキーとベクトルスコアは、`AggregationHit.pk` および `AggregationHit.score` から引き続き取得できます。

返される各 `AggregationHit` には、`pk` にプライマリキー、`score` にベクトルスコア、`fields` に要求された出力フィールドが含まれます。

### 複数レベルでの結果のグループ化\{#group-results-at-multiple-levels}

バケット内にさらに別のレベルのバケットが必要な場合は、ネストされた集計を使用します。この例では、Zilliz Cloud がまずカテゴリバケットを作成し、その中にブランドバケットを作成します。

子集計には、親バケットに割り当てられたエンティティのみが渡されます。`fields` が各集計レベルのバケットキーを制御し、`sub_aggregation` が親子階層を形成します。

以下の設定では、キーが `(running_shoes)` のカテゴリバケットを作成します。この親バケット内で、子集計により `(Brand A)`、`(Brand B)`、`(Brand C)` などのキーを持つ個別のブランドバケットが作成されます。

```plaintext
Parent bucket key:
(running_shoes)

Child bucket keys:
├── (Brand A)
├── (Brand B)
└── (Brand C)
```

各レベルでは複数のフィールドを独立して使用できます。たとえば、子集計で `fields=["brand", "color"]` を使用すると、`(Brand A, black)` のような複合子キーが作成されます。

以下の設定はこの階層を実装するものです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
SearchAggregation aggregation = SearchAggregation.builder().fields(Collections.singletonList("category")).size(2)
        .addMetric("product_count", MetricSpec.builder().op(MetricOps.COUNT).fieldName("*").build())
        .addMetric("avg_price", MetricSpec.builder().op(MetricOps.AVG).fieldName("price").build())
        .addOrder(OrderSpec.builder().key("product_count").direction(AggDirection.DESC).build())
        .subAggregation(SearchAggregation.builder().fields(Collections.singletonList("brand")).size(3)
                .addMetric("brand_count", MetricSpec.builder().op(MetricOps.COUNT).fieldName("*").build())
                .addMetric("avg_rating", MetricSpec.builder().op(MetricOps.AVG).fieldName("rating").build())
                .addOrder(OrderSpec.builder().key("avg_rating").direction(AggDirection.DESC).build())
                .topHits(TopHitsSpec.builder().size(2).addSort(SortSpec.builder().fieldName("rating").direction(AggDirection.DESC).build()).build()).build())
        .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
const aggregation = {
  fields: ['category'],
  size: 2,
  metrics: {
    product_count: { op: 'count', field_name: '*' },
    avg_price: { op: 'avg', field_name: 'price' },
  },
  order: [{ key: 'product_count', direction: 'desc' }],
  sub_aggregation: {
    fields: ['brand'],
    size: 3,
    metrics: {
      brand_count: { op: 'count', field_name: '*' },
      avg_rating: { op: 'avg', field_name: 'rating' },
    },
    order: [{ key: 'avg_rating', direction: 'desc' }],
    top_hits: {
      size: 2,
      sort: [{ field_name: 'rating', direction: 'desc' }],
    },
  },
};
```

</TabItem>

<TabItem value='go'>

```go
// TBD: Search Aggregation is not yet available in the released Go SDK.
```

</TabItem>

<TabItem value='bash'>

```bash
payload='{
  "collectionName": "product_search_aggregation",
  "data": [[0.11, 0.40, 0.19, 0.64, 0.30]], "annsField": "embedding", "limit": 10,
  "searchParams": {"metric_type": "COSINE", "params": {}},
  "searchAggregation": {
    "fields": ["category"], "size": 2,
    "metrics": {"product_count": {"op": "count", "fieldName": "*"}, "avg_price": {"op": "avg", "fieldName": "price"}},
    "order": [{"key": "product_count", "direction": "desc"}],
    "subAggregation": {"fields": ["brand"], "size": 3, "metrics": {"brand_count": {"op": "count", "fieldName": "*"}, "avg_rating": {"op": "avg", "fieldName": "rating"}}, "order": [{"key": "avg_rating", "direction": "desc"}], "topHits": {"size": 2, "sort": [{"fieldName": "rating", "direction": "desc"}]}}
  }
}'
search "$payload"
```

</TabItem>
</Tabs>

<details>

<summary>ネストされたバケット結果を表示</summary>

以下のシリアル化された抜粋は、`running_shoes` 親バケットとその子である Brand B バケットを示しています。Brand A および Brand C の子バケットは簡潔にするため省略しています。

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

表示されている結果は単一の複合バケットキー `(running_shoes, Brand B)` ではなく、バケットパス `(running_shoes) → (Brand B)` を表しています。

Zilliz Cloud はまず、`product_count` の順で最大2つのカテゴリバケットを選択します。次に、選択された各カテゴリ内で独立して `sub_aggregation` を実行し、`avg_rating` の順で最大3つのブランドバケットを返します。

上記の出力の内容は以下のとおりです。

- ルートの `running_shoes` バケットには、子の複合キー全体で4件の保持候補が含まれています。その `metrics` には、ルートレベルの `avg_price` と `product_count` の値が含まれます。

- ルートバケットの `sub_groups` リストには、子のブランドバケットが含まれています。表示されている Brand B バケットには1件の保持候補が含まれており、独自の `avg_rating` および `brand_count` の値を持っています。

- ルートバケットの `hits` リストは空です。これはルート集計で `top_hits` が設定されていないためです。一方、Brand B の子バケットに代表ヒットが含まれているのは、`sub_aggregation` で `top_hits` が設定されているためです。

## FAQ\{#faq}

### バケット数とメトリクスの精度はどの程度ですか？\{#how-accurate-are-bucket-counts-and-metrics}

Search Aggregation は、保持された ANN 候補を集約するものであり、コレクション全体を対象とした集約は実行しません。

候補の保持には 2 つの近似段階があります。ANN 検索では関連するコレクション内のエンティティが省略される場合があり、グループ化段階では完全複合キーごとに最大 `TopHits.size` 件の候補のみが保持されます。どのレベルでも `top_hits` が設定されていない場合、このキーごとの上限は 1 です。

たとえば、コレクションに Brand A の商品が 5,000 件含まれており、その多くがベクトルクエリに関連しているとします。集約で `TopHits(size=4)` を使用する場合、Brand A バケットは完全複合キーごとに最大 4 件の候補しか保持できません。したがって、その `count` とメトリクスは保持された候補を表すものであり、関連するすべての Brand A 商品や、コレクション内の全 5,000 エンティティを表すものではありません。

近似の影響が最も大きくなるのは、`order` でメトリクスエイリアスを使用する場合です。検索再現率の変化によってメトリクス値が変わり、結果として `SearchAggregation.size` に収まるバケットが変化する可能性があります。ネストされた集約では、各子レベルが親バケット内で利用可能なエンティティに対して動作するため、この影響が増幅されることがあります。

一致するすべてのエンティティについて正確な統計が必要な場合は、Search Aggregation ではなく厳密なクエリ集約ワークフローを使用してください。

### Search Aggregation と Grouping Search の違いは何ですか？\{#how-does-search-aggregation-differ-from-grouping-search}

アプリケーションが主に必要とする結果形式に応じて使い分けます。

| 主な要件 | 推奨 | 使用するレスポンス |
| --- | --- | --- |
| グループ化フィールドの重複値を抑えつつ、標準的なランク付け済みエンティティリストを返したい | [Grouping Search](./grouping-search) | 各クエリベクトルに対するフラットな検索ヒット |
| キー、件数、メトリクス、順序、代表ヒット、子バケットなどを持つバケットとしてグループを確認・比較したい | Search Aggregation | `result.agg_buckets` 内の `AggregationBucket` オブジェクト |

Search Aggregation で `top_hits` を設定した場合でも、レスポンスの主構造はバケットツリーです。一方、Grouping Search は、アプリケーションが通常の検索ヒットをすでに処理しており、主に結果の多様性を確保したい場合に有効です。

これらの API は相互排他です。PyMilvus では、同一リクエスト内で `search_aggregation` を `group_by_field` または `group_by_fields` と組み合わせると `ParamError` が送出されます。
