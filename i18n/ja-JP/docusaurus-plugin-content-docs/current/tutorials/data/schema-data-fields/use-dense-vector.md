---
title: "密ベクトル | Cloud"
slug: /use-dense-vector
sidebar_key: use-dense-vector
sidebar_label: "密ベクトル"
beta: FALSE
notebook: FALSE
description: "密ベクトルは、機械学習やデータ分析で広く利用される数値データ表現です。実数の配列で構成され、ほとんどの要素、あるいはすべての要素が非ゼロとなります。疎ベクトルと比較して、密ベクトルは同じ次元レベルにおいてより多くの情報を含んでおり、各次元が意味のある値を保持しています。この表現により、複雑なパターンや関係性を効果的に捉えることができ、高次元空間におけるデータの分析と処理を容易にします。密ベクトルは通常、特定のアプリケーションや要件に応じて、数十から数百、場合によっては数千に及ぶ固定された次元数を持ちます。 | Cloud"
type: origin
token: ARalwpaVDiCwDZkoSHtcPNgXnRg
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - schema
  - 密ベクトル

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Dense Vector

密ベクトル（Dense Vector）は、機械学習やデータ分析で広く使われる数値データの表現形式です。これは実数からなる配列であり、その要素のほとんどまたはすべてが非ゼロ値を持ちます。疎ベクトルと比べて、密ベクトルは同じ次元数においてより多くの情報を含んでおり、各次元が意味のある値を保持しています。この表現形式は複雑なパターンや関係性を効果的に捉えることができ、高次元空間におけるデータの分析や処理を容易にします。密ベクトルの次元数は通常固定されており、具体的な用途や要件に応じて、数十次元から数百、さらには数千次元に及ぶこともあります。

密ベクトルは主に、データのセマンティクス（意味）を理解する必要があるシナリオで使用されます。たとえば、セマンティック検索やレコメンデーションシステムなどが該当します。セマンティック検索では、密ベクトルがクエリとドキュメント間の潜在的な関連性を捉え、検索結果の関連性を向上させます。レコメンデーションシステムでは、ユーザーとアイテム間の類似性を特定し、よりパーソナライズされた提案を可能にします。

## 概要\{#overview}

密ベクトルは通常、固定長の浮動小数点数の配列として表現され、たとえば `[0.2, 0.7, 0.1, 0.8, 0.3, ..., 0.5]` のような形式を取ります。これらのベクトルの次元数は一般的に数百から数千（例：128、256、768、1024）の範囲に及びます。各次元はオブジェクトの特定のセマンティック特徴を捉えており、類似度計算を通じてさまざまなシナリオに応用可能です。

![QOgMwbrhLhvvtbbk5TxcarhEn8i](https://zdoc-images.s3.us-west-2.amazonaws.com/QOgMwbrhLhvvtbbk5TxcarhEn8i.png)

上記の画像は、2次元空間における密ベクトルの表現を示しています。実際のアプリケーションで使われる密ベクトルは通常、これよりもはるかに高い次元を持ちますが、この2次元の図は以下の重要な概念を効果的に伝えています。

- **多次元表現:** 各点は概念的なオブジェクト（**Milvus**、**ベクトルデータベース**、**検索システム** など）を表しており、その位置は各次元の値によって決定されます。

- **セマンティックな関係性:** 点同士の距離は概念間のセマンティックな類似性を反映しています。近接している点ほど、よりセマンティックに関連性が高いことを示します。

- **クラスタリング効果:** 関連する概念（たとえば **Milvus**、**ベクトルデータベース**、**検索システム**）は空間上で互いに近くに配置され、セマンティッククラスタを形成します。

以下は、テキスト `"Milvus is an efficient ベクトルデータベース"` を表す実際の密ベクトルの例です：

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
    // ... more dimensions
]

```

密ベクトルは、さまざまな[埋め込み](https://en.wikipedia.org/wiki/Embedding)モデル（画像向けのCNNモデル（[ResNet](https://pytorch.org/hub/pytorch_vision_resnet/)や[VGG](https://pytorch.org/vision/stable/models/vgg.html)など）やテキスト向けの言語モデル（[BERT](https://en.wikipedia.org/wiki/BERT_(language_model))や[Word2Vec](https://en.wikipedia.org/wiki/Word2vec)など））を用いて生成できます。これらのモデルは生データを高次元空間上の点に変換し、データの意味的特徴を捉えます。さらに、Zilliz Cloudではユーザーが密ベクトルを生成・処理するための便利な方法も提供しており、詳細は「Embeddings」をご参照ください。

データがベクトル化された後は、Zilliz Cloudクラスターに保存して管理およびベクトル検索を行うことができます。以下の図はその基本的なプロセスを示しています。

![No8KwR6wPhTIP6bKEqGcbBDWngc](https://zdoc-images.s3.us-west-2.amazonaws.com/No8KwR6wPhTIP6bKEqGcbBDWngc.png)

<Admonition type="info" icon="📘" title="Notes">

<p>密ベクトルに加えて、Zilliz Cloudは疎ベクトルおよびバイナリベクトルもサポートしています。疎ベクトルはキーワード検索や用語マッチングなどの特定の用語に基づく正確な一致に適しており、一方でバイナリベクトルは画像パターンマッチングや特定のハッシュ用途など、二値化されたデータを効率的に扱う場合に一般的に使用されます。詳細については、「<a href="./use-binary-vector">Binary Vector</a>」および「<a href="./use-sparse-vector">Sparse Vector</a>」をご参照ください。</p>

</Admonition>

## 密ベクトルの使用\{#use-dense-vectors}

### ベクトルフィールドの追加\{#add-vector-field}

Zilliz Cloudクラスターで密ベクトルを使用するには、コレクション作成時に密ベクトルを格納するためのベクトルフィールドを定義します。この手順には以下が含まれます。

1. `datatype` をサポートされている密ベクトルのデータ型に設定します。サポートされている密ベクトルのデータ型については、「データ Types」をご参照ください。

1. `dim` パラメータを使用して密ベクトルの次元数を指定します。

以下の例では、`dense_vector` という名前のベクトルフィールドを追加し、密ベクトルを格納します。このフィールドのデータ型は `FLOAT_VECTOR` で、次元数は `4` です。

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

<TabItem value='java'>

```javascript
import { DataType } from "@zilliz/milvus2-sdk-node";

schema.push({
  name: "dense_vector",
  data_type: DataType.FloatVector,
  dim: 4,
});

```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

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
     <td><p>32ビット浮動小数点数を格納します。科学計算や機械学習において実数を表現するのに一般的に使用されます。類似したベクトルを区別するなど、高い精度が求められるシナリオに最適です。</p></td>
   </tr>
   <tr>
     <td><p><code>FLOAT16_VECTOR</code></p></td>
     <td><p>16ビット半精度浮動小数点数を格納します。ディープラーニングやGPU計算で使用されます。精度があまり重要でないシナリオ（例：レコメンデーションシステムの低精度リコールフェーズ）においてストレージ容量を節約できます。</p></td>
   </tr>
   <tr>
     <td><p><code>BFLOAT16_VECTOR</code></p></td>
     <td><p>16ビットBrain Floating Point (bfloat16) 数値を格納します。Float32と同じ指数範囲を持ちながら精度を犠牲にしています。大規模な画像検索など、大量のベクトルを高速に処理する必要があるシナリオに適しています。</p></td>
   </tr>
   <tr>
     <td><p><code>INT8_VECTOR</code></p></td>
     <td><p>各次元の要素が8ビット整数（int8）であるベクトルを格納します。各要素の範囲は–128から127です。量子化されたディープラーニングモデル（例：ResNet、EfficientNet）向けに設計されており、INT8_VECTORはモデルサイズを削減し、精度の損失を最小限に抑えながら推論を高速化します。</p></td>
   </tr>
</table>

### ベクトルフィールドのインデックスパラメータを設定する\{#set-index-params-for-vector-field}

セマンティック検索を高速化するには、ベクトルフィールドに対してインデックスを作成する必要があります。インデックス作成により、大規模なベクトルデータの検索効率を大幅に向上させることができます。

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

<TabItem value='java'>

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

<TabItem value='java'>

```go
idx := index.NewAutoIndex(index.MetricType(entity.IP))
indexOption := milvusclient.NewCreateIndexOption("my_collection", "dense_vector", idx)
```

</TabItem>

<TabItem value='java'>

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

上記の例では、`dense_vector` フィールドに対して `AUTOINDEX` インデックスタイプを使用して `dense_vector_index` という名前のインデックスが作成されています。`metric_type` は `IP` に設定されており、距離メトリックとして内積（内積）が使用されることを示しています。

Zilliz Cloud は他のメトリックタイプもサポートしています。詳細については、[メトリックタイプs](./search-metrics-explained) を参照してください。

### Create collection\{#create-collection}

密ベクトルとインデックスパラメータの設定が完了したら、密ベクトルを含むコレクションを作成できます。以下の例では、`create_collection` メソッドを使用して `my_collection` という名前のコレクションを作成しています。

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
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='java'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

await client.createCollection({
    collection_name: 'my_collection',
    schema: schema,
    index_params: indexParams
});

```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

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

コレクションを作成した後、`insert` メソッドを使用して密ベクトルを含むデータを追加します。挿入する密ベクトルの次元数が、密ベクトルフィールドを追加する際に定義した `dim` 値と一致していることを確認してください。

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

<TabItem value='java'>

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

<TabItem value='java'>

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

<TabItem value='java'>

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

密ベクトルに基づくセマンティック検索は、Zilliz Cloud クラスターの中核機能の一つであり、ベクトル間の距離に基づいてクエリベクトルに最も類似したデータを高速に検索できます。類似性検索を実行するには、クエリベクトルと検索パラメータを準備し、`search` メソッドを呼び出します。

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

<TabItem value='java'>

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

<TabItem value='java'>

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

<TabItem value='java'>

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

類似度検索パラメータの詳細については、[基本的なANN検索](./single-vector-search)を参照してください。