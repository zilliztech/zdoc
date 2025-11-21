---
title: "密ベクトル | Cloud"
slug: /use-dense-vector
sidebar_label: "密ベクトル"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "密ベクトルは機械学習とデータ分析で広く使われる数値データ表現です。実数値で構成される配列からなり、ほとんどの要素が非ゼロです。スパースベクトルと比較して、密ベクトルは同じ次元レベルでより多くの情報を含み、各次元に意味のある値を保持します。この表現は複雑なパターンと関係を効果的に捉え、データを高次元空間で分析・処理しやすくします。密ベクトルは通常、数十から数百、さらには数千の固定数の次元を持ち、特定のアプリケーションと要件によって異なります。 | Cloud"
type: origin
token: ARalwpaVDiCwDZkoSHtcPNgXnRg
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - dense vector
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 密ベクトル

密ベクトルは機械学習とデータ分析で広く使われる数値データ表現です。実数値で構成される配列からなり、ほとんどの要素が非ゼロです。スパースベクトルと比較して、密ベクトルは同じ次元レベルでより多くの情報を含み、各次元に意味のある値を保持します。この表現は複雑なパターンと関係を効果的に捉え、データを高次元空間で分析・処理しやすくします。密ベクトルは通常、数十から数百、さらには数千の固定数の次元を持ち、特定のアプリケーションと要件によって異なります。

密ベクトルは主にデータのセマンティクスを理解する必要があるシナリオで使用されます。セマンティック検索やレコメンデーションシステムなどです。セマンティック検索では、密ベクトルはクエリとドキュメント間の根底にある関連性を捉え、検索結果の関連性を向上させます。レコメンデーションシステムでは、ユーザーとアイテム間の類似性を特定し、よりパーソナライズされた提案を提供するのに役立ちます。

## 概要\{#overview}

密ベクトルは通常、固定長の浮動小数点数配列として表現されます。例: `[0.2, 0.7, 0.1, 0.8, 0.3, ..., 0.5]`。これらのベクトルの次元数は通常数百から数千で、128、256、768、1024などです。各次元はオブジェクトの特定のセマンティック特徴を捉え、類似性計算を通じて様々なシナリオに適用できるようにします。

![QOgMwbrhLhvvtbbk5TxcarhEn8i](/img/QOgMwbrhLhvvtbbk5TxcarhEn8i.png)

上記の画像は2次元空間における密ベクトルの表現を示しています。実際のアプリケーションでは密ベクトルはより高い次元を持つことが多いですが、この2次元の図はいくつかの重要な概念を効果的に伝えています:

- **多次元表現:** 各点は概念的なオブジェクト（例: **Milvus**、**ベクトルデータベース**、**検索システム**など）を表し、その位置は次元の値によって決まります。

- **セマンティック関係:** 点間の距離は概念間のセマンティック類似性を反映します。近い点はよりセマンティックに関連のある概念を示します。

- **クラスタリング効果:** 関連する概念（**Milvus**、**ベクトルデータベース**、**検索システム**など）は空間内で互いに近く配置され、セマンティッククラスタを形成します。

以下はテキスト `"Milvus is an efficient vector database"` を表す実際の密ベクトルの例です:

```json
[
    -0.013052909,
    0.020387933,
    -0.007869,
    -0.11111383,
    -0.030188112,
    -0.0053388323,
    0.0010654867,
    0.072027855,
    // ... 更多の次元
]

```

密ベクトルは様々な[埋め込み](https://en.wikipedia.org/wiki/Embedding)モデルを使用して生成できます。例えば、画像用のCNNモデル（[ResNet](https://pytorch.org/hub/pytorch_vision_resnet/)、[VGG](https://pytorch.org/vision/stable/models/vgg.html)など）やテキスト用の言語モデル（[BERT](https://en.wikipedia.org/wiki/BERT_(language_model))、[Word2Vec](https://en.wikipedia.org/wiki/Word2vec)など）です。これらのモデルは生データを高次元空間の点に変換し、データのセマンティック特徴を捉えます。さらに、Zilliz Cloudはユーザーが密ベクトルを生成・処理するのに役立つ便利な方法を提供します。詳細は埋め込みを参照してください。

データがベクトル化されると、Zilliz Cloudクラスタで保存され、管理とベクトル検索が可能になります。下の図は基本的なプロセスを示しています。

![No8KwR6wPhTIP6bKEqGcbBDWngc](/img/No8KwR6wPhTIP6bKEqGcbBDWngc.png)

<Admonition type="info" icon="📘" title="注記">

<p>密ベクトルに加えて、Zilliz Cloudはスパースベクトルとバイナリベクトルもサポートしています。スパースベクトルはキーワード検索や用語マッチングなど、特定の用語に基づく精密なマッチに適しています。一方、バイナリベクトルは画像パターンマッチングや特定のハッシュアプリケーションなど、2値化データを効率的に扱うためによく使われます。詳細は<a href="./use-binary-vector">バイナリベクトル</a>と<a href="./use-sparse-vector">スパースベクトル</a>を参照してください。</p>

</Admonition>

## 密ベクトルの使用\{#use-dense-vectors}

### ベクトルフィールドの追加\{#add-vector-field}

Zilliz Cloudクラスタで密ベクトルを使用するには、まずコレクション作成時に密ベクトルを保存するためのベクトルフィールドを定義します。このプロセスには以下が含まれます:

1. `datatype`をサポートされている密ベクトルデータ型に設定します。サポートされている密ベクトルデータ型については、データ型を参照してください。

1. `dim`パラメータを使用して密ベクトルの次元を指定します。

以下の例では、密ベクトルを保存するために`dense_vector`という名前のベクトルフィールドを追加します。フィールドのデータ型は`FLOAT_VECTOR`で、次元は`4`です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema(
    auto_id=True,
    enable_dynamic_fields=True,
)

schema.add_field(field_name="pk", datatype=DataType.VARCHAR, is_primary=True, max_length=100)
schema.add_field(field_name="dense_vector", datatype=DataType.FLOAT_VECTOR, dim=4)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(true);
schema.addField(AddFieldReq.builder()
        .fieldName("pk")
        .dataType(DataType.VarChar)
        .isPrimaryKey(true)
        .autoID(true)
        .maxLength(100)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("dense_vector")
        .dataType(DataType.FloatVector)
        .dimension(4)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { DataType } from "@zilliz/milvus2-sdk-node";

schema.push({
  name: "dense_vector",
  data_type: DataType.FloatVector,
  dim: 4,
});

```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema()
schema.WithField(entity.NewField().
    WithName("pk").
    WithDataType(entity.FieldTypeVarChar).
    WithIsPrimaryKey(true).
    WithIsAutoID(true).
    WithMaxLength(100),
).WithField(entity.NewField().
    WithName("dense_vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(4),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export primaryField='{
    "fieldName": "pk",
    "dataType": "VarChar",
    "isPrimary": true,
    "elementTypeParams": {
        "max_length": 100
    }
}'

export vectorField='{
    "fieldName": "dense_vector",
    "dataType": "FloatVector",
    "elementTypeParams": {
        "dim": 4
    }
}'

export schema="{
    \"autoID\": true,
    \"fields\": [
        $primaryField,
        $vectorField
    ]
}"
```

</TabItem>
</Tabs>

**密ベクトルフィールドでサポートされるデータ型**:

<table>
   <tr>
     <th><p>データ型</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>FLOAT_VECTOR</code></p></td>
     <td><p>32ビット浮動小数点数を格納し、科学計算や機械学習で実数を表現するためによく使われます。類似ベクトルを区別するなど、高い精度が必要なシナリオに適しています。</p></td>
   </tr>
   <tr>
     <td><p><code>FLOAT16_VECTOR</code></p></td>
     <td><p>16ビット半精度浮動小数点数を格納し、ディープラーニングとGPU計算に使用されます。精度がそれほど重要ではないシナリオでストレージスペースを節約します。例えば、レコメンデーションシステムの低精度リコールフェーズなどです。</p></td>
   </tr>
   <tr>
     <td><p><code>BFLOAT16_VECTOR</code></p></td>
     <td><p>16ビットBrain Floating Point（bfloat16）数を格納し、Float32と同じ指数範囲を持ちますが精度は低くなっています。大量のベクトルを迅速に処理する必要があるシナリオに適しています。例えば、大規模画像検索などです。</p></td>
   </tr>
   <tr>
     <td><p><code>INT8_VECTOR</code></p></td>
     <td><p>各次元の個々の要素が8ビット整数（int8）で、各要素が-128から127の範囲にあるベクトルを格納します。量子化されたディープラーニングモデル（例: ResNet、EfficientNet）用に設計されており、INT8_VECTORはモデルサイズを縮小し、最小限の精度損失で推論を高速化します。</p></td>
   </tr>
</table>

### ベクトルフィールドのインデックスパラメータ設定\{#set-index-params-for-vector-field}

セマンティック検索を高速化するため、ベクトルフィールドにインデックスを作成する必要があります。インデックス作成は大規模ベクトルデータの検索効率を大幅に向上させます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="dense_vector",
    index_name="dense_vector_index",
    index_type="AUTOINDEX",
    metric_type="IP"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.*;

List<IndexParam> indexes = new ArrayList<>();

indexes.add(IndexParam.builder()
        .fieldName("dense_vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.IP)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MetricType, IndexType } from "@zilliz/milvus2-sdk-node";

const indexParams = {
    index_name: 'dense_vector_index',
    field_name: 'dense_vector',
    metric_type: MetricType.IP,
    index_type: IndexType.AUTOINDEX
};
```

</TabItem>

<TabItem value='go'>

```go
idx := index.NewAutoIndex(index.MetricType(entity.IP))
indexOption := milvusclient.NewCreateIndexOption("my_collection", "dense_vector", idx)
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "dense_vector",
            "metricType": "IP",
            "indexName": "dense_vector_index",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

上記の例では、`dense_vector`フィールドに`AUTOINDEX`インデックスタイプを使用して`dense_vector_index`という名前のインデックスを作成します。`metric_type`は`IP`に設定され、内積が距離メトリックとして使用されることを示します。

Zilliz Cloudは他のメトリックタイプもサポートしています。詳細は[メトリックタイプ](./search-metrics-explained)を参照してください。

### コレクションの作成\{#create-collection}

密ベクトルとインデックスパラメータの設定が完了したら、密ベクトルを含むコレクションを作成できます。以下の例では、`create_collection`メソッドを使用して`my_collection`という名前のコレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT'
});

await client.createCollection({
    collection_name: 'my_collection',
    schema: schema,
    index_params: indexParams
});

```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

### データの挿入\{#insert-data}

コレクション作成後、`insert`メソッドを使用して密ベクトルを含むデータを追加します。挿入する密ベクトルの次元数が、密ベクトルフィールド追加時に定義した`dim`値と一致することを確認してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {"dense_vector": [0.1, 0.2, 0.3, 0.7]},
    {"dense_vector": [0.2, 0.3, 0.4, 0.8]},
]

client.insert(
    collection_name="my_collection",
    data=data
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

List<JsonObject> rows = new ArrayList<>();
Gson gson = new Gson();
rows.add(gson.fromJson("{\"dense_vector\": [0.1, 0.2, 0.3, 0.4]}", JsonObject.class));
rows.add(gson.fromJson("{\"dense_vector\": [0.2, 0.3, 0.4, 0.5]}", JsonObject.class));

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
  { dense_vector: [0.1, 0.2, 0.3, 0.7] },
  { dense_vector: [0.2, 0.3, 0.4, 0.8] },
];

client.insert({
  collection_name: "my_collection",
  data: data,
});
```

</TabItem>

<TabItem value='go'>

```go
_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithFloatVectorColumn("dense_vector", 4, [][]float32{
        {0.1, 0.2, 0.3, 0.7},
        {0.2, 0.3, 0.4, 0.8},
    }),
)
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "data": [
        {"dense_vector": [0.1, 0.2, 0.3, 0.4]},
        {"dense_vector": [0.2, 0.3, 0.4, 0.5]}        
    ],
    "collectionName": "my_collection"
}'

## {"code":0,"cost":0,"data":{"insertCount":2,"insertIds":["453577185629572531","453577185629572532"]}}
```

</TabItem>
</Tabs>

### 類似性検索の実行\{#perform-similarity-search}

密ベクトルに基づくセマンティック検索はZilliz Cloudクラスタの中核機能の一つであり、ベクトル間の距離に基づいてクエリベクトルに最も類似したデータを迅速に見つけることができます。類似性検索を実行するには、クエリベクトルと検索パラメータを準備し、`search`メソッドを呼び出します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
search_params = {
    "params": {"nprobe": 10}
}

query_vector = [0.1, 0.2, 0.3, 0.7]

res = client.search(
    collection_name="my_collection",
    data=[query_vector],
    anns_field="dense_vector",
    search_params=search_params,
    limit=5,
    output_fields=["pk"]
)

print(res)

# Output
# data: ["[{'id': '453718927992172271', 'distance': 0.7599999904632568, 'entity': {'pk': '453718927992172271'}}, {'id': '453718927992172270', 'distance': 0.6299999952316284, 'entity': {'pk': '453718927992172270'}}]"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.data.FloatVec;

Map<String,Object> searchParams = new HashMap<>();
searchParams.put("nprobe",10);

FloatVec queryVector = new FloatVec(new float[]{0.1f, 0.3f, 0.3f, 0.4f});

SearchResp searchR = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .annsField("dense_vector")
        .searchParams(searchParams)
        .topK(5)
        .outputFields(Collections.singletonList("pk"))
        .build());
        
System.out.println(searchR.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={pk=453444327741536779}, score=0.65, id=453444327741536779), SearchResp.SearchResult(entity={pk=453444327741536778}, score=0.65, id=453444327741536778)]]
```

</TabItem>

<TabItem value='javascript'>

```javascript
query_vector = [0.1, 0.2, 0.3, 0.7];

client.search({
    collection_name: 'my_collection',
    data: query_vector,
    limit: 5,
    output_fields: ['pk'],
    params: {
        nprobe: 10
    }
});
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.1, 0.2, 0.3, 0.7}

annParam := index.NewCustomAnnParam()
annParam.WithExtraParam("nprobe", 10)
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    5,                     // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("dense_vector").
    WithOutputFields("pk").
    WithAnnParam(annParam))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("Pks: ", resultSet.GetColumn("pk").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "data": [
        [0.1, 0.2, 0.3, 0.7]
    ],
    "annsField": "dense_vector",
    "limit": 5,
    "searchParams":{
        "params":{"nprobe":10}
    },
    "outputFields": ["pk"]
}'

## {"code":0,"cost":0,"data":[{"distance":0.55,"id":"453577185629572532","pk":"453577185629572532"},{"distance":0.42,"id":"453577185629572531","pk":"453577185629572531"}]}
```

</TabItem>
</Tabs>

類似性検索パラメータの詳細については、[基本的なANN検索](./single-vector-search)を参照してください。
