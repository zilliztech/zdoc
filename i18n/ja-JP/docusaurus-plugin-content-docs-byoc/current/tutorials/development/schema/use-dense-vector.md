---
title: "Dense Vector | BYOC"
slug: /use-dense-vector
sidebar_label: "Dense Vector"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Dense vector は、機械学習やデータ分析で広く使用される数値データ表現です。実数の配列で構成され、そのほとんどまたはすべての要素が非ゼロです。sparse vector と比較すると、dense vector は各次元に意味のある値を持つため、同じ次元レベルでより多くの情報を含みます。この表現は複雑なパターンや関係性を効果的に捉えることができ、高次元空間でデータを分析および処理しやすくします。Dense vector は通常、固定された次元数を持ち、具体的なアプリケーションや要件に応じて、数十次元から数百次元、さらには数千次元に及ぶことがあります。 | BYOC"
type: origin
token: ARalwpaVDiCwDZkoSHtcPNgXnRg
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Dense Vector

Dense vector は、機械学習やデータ分析で広く使用される数値データ表現です。実数の配列で構成され、そのほとんどまたはすべての要素が非ゼロです。sparse vector と比較すると、dense vector は各次元に意味のある値を持つため、同じ次元レベルでより多くの情報を含みます。この表現は複雑なパターンや関係性を効果的に捉えることができ、高次元空間でデータを分析および処理しやすくします。Dense vector は通常、固定された次元数を持ち、具体的なアプリケーションや要件に応じて、数十次元から数百次元、さらには数千次元に及ぶことがあります。

Dense vector は主に、セマンティック検索やレコメンデーションシステムなど、データの意味を理解する必要があるシナリオで使用されます。セマンティック検索では、dense vector はクエリとドキュメントの間にある基礎的な関連性を捉え、検索結果の関連性を向上させるのに役立ちます。レコメンデーションシステムでは、ユーザーとアイテムの類似性を識別し、よりパーソナライズされた提案を提供するのに役立ちます。

## Overview\{#overview}

Dense vector は通常、`[0.2, 0.7, 0.1, 0.8, 0.3, ..., 0.5]` のような固定長の浮動小数点数配列として表現されます。これらの vector の次元数は通常、128、256、768、1024 など、数百から数千の範囲です。各次元はオブジェクトの特定の意味的特徴を捉え、類似度計算を通じてさまざまなシナリオに適用できます。

![QOgMwbrhLhvvtbbk5TxcarhEn8i](https://zdoc-images.s3.us-west-2.amazonaws.com/QOgMwbrhLhvvtbbk5TxcarhEn8i.png)

上の画像は、2D 空間における dense vector の表現を示しています。実際のアプリケーションで使われる dense vector は多くの場合はるかに高次元ですが、この 2D の図は、いくつかの重要な概念を効果的に伝えています。

- **多次元表現:** 各点は概念的なオブジェクト（**Milvus**、**vector database**、**retrieval system** など）を表し、その位置は各次元の値によって決まります。

- **意味的関係:** 点間の距離は、概念間の意味的な類似性を反映します。近い点ほど、より意味的に関連した概念を示します。

- **クラスタリング効果:** 関連する概念（**Milvus**、**vector database**、**retrieval system** など）は空間内で互いに近くに配置され、意味的なクラスターを形成します。

以下は、テキスト `"Milvus is an efficient vector database"` を表す実際の dense vector の例です。

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

Dense vector は、画像向けの CNN モデル（[ResNet](https://pytorch.org/hub/pytorch_vision_resnet/)、[VGG](https://pytorch.org/vision/stable/models/vgg.html) など）や、テキスト向けの言語モデル（[BERT](https://en.wikipedia.org/wiki/BERT_(language_model))、[Word2Vec](https://en.wikipedia.org/wiki/Word2vec) など）といった、さまざまな [embedding](https://en.wikipedia.org/wiki/Embedding) モデルを使用して生成できます。これらのモデルは、生データを高次元空間内の点へと変換し、データの意味的特徴を捉えます。さらに、Zilliz Cloud は、Embeddings で詳述されているように、ユーザーが dense vector を生成および処理するのに役立つ便利な方法を提供します。

データが vector 化されると、管理および vector 検索のために Zilliz Cloud cluster に保存できます。以下の図は基本的なプロセスを示しています。

![No8KwR6wPhTIP6bKEqGcbBDWngc](https://zdoc-images.s3.us-west-2.amazonaws.com/No8KwR6wPhTIP6bKEqGcbBDWngc.png)

<Admonition type="info" icon="📘" title="注意">

dense vector に加えて、Zilliz Cloud は sparse vector と binary vector もサポートしています。sparse vector は、キーワード検索や用語マッチングなど、特定の用語に基づく正確な一致に適しています。一方、binary vector は、画像パターンマッチングや一部のハッシュアプリケーションなど、2 値化されたデータを効率的に扱うためによく使用されます。詳細については、[Binary Vector](./use-binary-vector) および [Sparse Vector](./use-sparse-vector) を参照してください。

</Admonition>

## Use dense vectors\{#use-dense-vectors}

### Add vector field\{#add-vector-field}

Zilliz Cloud cluster で dense vector を使用するには、まず collection の作成時に dense vector を保存するための vector field を定義します。このプロセスには以下が含まれます。

1. `datatype` を、サポートされている dense vector データ型に設定します。サポートされている dense vector データ型については、Data Types を参照してください。

1. `dim` パラメータを使用して dense vector の次元数を指定します。

以下の例では、dense vector を保存するために `dense_vector` という名前の vector field を追加しています。この field のデータ型は `FLOAT_VECTOR` で、次元数は `4` です。

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

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->SetEnableDynamicField(true);
schema->AddField(milvus::FieldSchema("pk", milvus::DataType::VARCHAR, "", true, true).WithMaxLength(100));
schema->AddField(milvus::FieldSchema("dense_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(4));
```

**dense vector field でサポートされるデータ型**:

| Data Type | Description |
| --- | --- |
| `FLOAT_VECTOR` | 32 ビット浮動小数点数を格納し、科学計算や機械学習で実数を表現するために一般的に使用されます。類似した vector の識別など、高精度が求められるシナリオに最適です。 |
| `FLOAT16_VECTOR` | 16 ビット半精度浮動小数点数を格納し、深層学習や GPU 計算で使用されます。レコメンデーションシステムの低精度リコール段階など、精度がそれほど重要でないシナリオでストレージ容量を節約できます。 |
| `BFLOAT16_VECTOR` | 16 ビット Brain Floating Point（bfloat16）数を格納し、Float32 と同じ指数範囲を持ちながら精度は低くなります。大規模画像検索のように、大量の vector を迅速に処理する必要があるシナリオに適しています。 |
| `INT8_VECTOR` | 各次元の個々の要素が 8 ビット整数（int8）である vector を格納し、各要素の範囲は –128 から 127 です。量子化された深層学習モデル（例: ResNet、EfficientNet）向けに設計されており、INT8_VECTOR はわずかな精度損失でモデルサイズを削減し、推論を高速化します。 |

### Set index params for vector field\{#set-index-params-for-vector-field}

セマンティック検索を高速化するには、vector field に対して index を作成する必要があります。index 作成により、大規模な vector データの検索効率を大幅に向上できます。

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

```c++
std::vector<milvus::IndexDesc> indexes = {
    milvus::IndexDesc("dense_vector", "dense_vector_index", milvus::IndexType::AUTOINDEX, milvus::MetricType::IP)
}
```

上の例では、`AUTOINDEX` index type を使用して、`dense_vector` field に対して `dense_vector_index` という名前の index を作成しています。`metric_type` は `IP` に設定されており、距離メトリックとして inner product を使用することを示しています。

Zilliz Cloud は他の metric type もサポートしています。詳細については、[Metric Types](./search-metrics-explained) を参照してください。

### Create collection\{#create-collection}

dense vector と index param の設定が完了したら、dense vector を含む collection を作成できます。以下の例では、`create_collection` メソッドを使用して `my_collection` という名前の collection を作成します。

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

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

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
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                            .WithCollectionName("my_collection")
                                            .WithIndexes(std::move(indexes))
                                            .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

### Insert data\{#insert-data}

collection を作成した後、`insert` メソッドを使用して dense vector を含むデータを追加します。挿入する dense vector の次元数が、dense vector field の追加時に定義した `dim` の値と一致していることを確認してください。

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
--header "Request-Timeout: 10" \
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

```c++
milvus::EntityRows data = {{{"dense_vector", std::vector<float>{0.1, 0.2, 0.3, 0.4}}},
                           {{"dense_vector", std::vector<float>{0.2, 0.3, 0.4, 0.5}}}};

milvus::InsertResponse response;
auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName("my_collection")
                                .WithRowsData(std::move(data)),
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

### Perform similarity search\{#perform-similarity-search}

Dense vector に基づくセマンティック検索は、Zilliz Cloud cluster の中核機能の 1 つです。これにより、vector 間の距離に基づいて、クエリ vector に最も類似したデータをすばやく見つけることができます。類似度検索を実行するには、クエリ vector と検索パラメータを準備し、その後 `search` メソッドを呼び出します。

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
--header "Request-Timeout: 10" \
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

```c++
std::vector<float> query_vector = {0.1, 0.2, 0.3, 0.7};
auto request = milvus::SearchRequest()
                   .WithCollectionName("my_collection")
                   .WithAnnsField("dense_vector")
                   .WithLimit(5)
                   .AddExtraParam("nprobe", "10")
                   .AddOutputField("pk")
                   .AddFloatVector(query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
auto search_results = response.Results();
for (auto& result : search_results.Results()) {
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << "\t" << row << std::endl;
    }
}
```

類似度検索パラメータの詳細については、[Basic ANN Search](./single-vector-search) を参照してください。
