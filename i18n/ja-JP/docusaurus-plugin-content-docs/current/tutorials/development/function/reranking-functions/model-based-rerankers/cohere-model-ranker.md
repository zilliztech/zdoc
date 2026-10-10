---
title: "Cohere Ranker | Cloud"
slug: /cohere-model-ranker
sidebar_label: "Cohere Ranker"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Cohere Ranker は Cohere の rerank モデルを活用し、取得した候補にセマンティック reranking を適用することで結果の並び順を改善します。 | Cloud"
type: origin
token: Mtxfwvu2fiOLwXkcURCcJxDPnLd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Cohere Ranker

Cohere Ranker は、[Cohere](https://cohere.com/) の rerank モデルを活用し、取得した候補にセマンティック reranking を適用することで結果の並び順を改善します。

取得関数や embedding 関数とは異なり、Cohere Ranker は **取得後のステップ** として実行されます。クエリとドキュメントテキストの間のセマンティックな関連性を評価し、それに応じて候補結果を並び替えます。

Cohere Ranker が特に有用なのは、次のような場合です。

- 取得した結果は関連しているものの、並び順が最適ではない場合

- ベクトル距離だけでなく、セマンティックな関連性がより重要な場合

- 多言語または長文テキストの reranking が必要な場合

## 事前準備\{#before-you-start}

Cohere Ranker を使用する前に、次の前提条件を満たしていることを確認してください。

- **rerank モデルを選択する**

    `rerank-english-v3.0` など、使用する Cohere rerank モデルを決定します。選択したモデルによって、reranking 時にセマンティックな関連性をどのように評価するかが決まります。詳細については、[Cohere 公式ドキュメント](https://docs.cohere.com/docs/models#rerank) を参照してください。

- **Cohere と統合し、integration ID を取得する**

    Cohere Ranker を使用するには、まず [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) で Cohere をモデルプロバイダーとして統合する必要があります。詳細な手順については、[モデルプロバイダーとの統合](./integrate-with-model-providers) を参照してください。

- **rerank 可能なテキストフィールドを含むコレクションスキーマを計画する**

    コレクションに、rerank 対象のテキストを含む `VARCHAR` フィールドが 1 つ含まれていることを確認してください。

## Cohere Ranker を使用する\{#use-cohere-ranker}

このセクションでは、検索時に Cohere Ranker を適用して取得した結果を reranking する方法を説明します。

Cohere Ranker は検索時に定義および適用されるため、クエリごとに reranking を有効または無効にできます。

### 準備\{#preparations}

次のセットアップでは、検索と reranking に使用するコレクションとサンプルデータを準備します。

<details>

<summary><strong>サンプルデータを含むコレクションを準備する</strong></summary>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_ZILLIZ_CLOUD_URI",
    token="YOUR_ZILLIZ_CLOUD_TOKEN",
)

collection_name = "cohere_rerank_demo"

# Define collection schema 
schema = client.create_schema()

schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("document", DataType.VARCHAR, max_length=1000)
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=4)

# Configure index
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="dense",
    index_type="AUTOINDEX",
    metric_type="COSINE"
)

# Create collection
client.create_collection(
    collection_name=collection_name,
    schema=schema,
    index_params=index_params
)

# Insert sample data
data = [
    {
        "id": 1,
        "document": "Recent renewable energy developments include improved solar efficiency.",
        "dense": [0.10, 0.20, 0.30, 0.40],
    },
    {
        "id": 2,
        "document": "Climate policy and carbon markets have evolved rapidly in recent years.",
        "dense": [0.11, 0.19, 0.28, 0.39],
    },
    {
        "id": 3,
        "document": "New battery technology helps stabilize wind and solar power generation.",
        "dense": [0.90, 0.10, 0.05, 0.02],
    },
    {
        "id": 4,
        "document": "Vector databases support similarity search for machine learning applications.",
        "dense": [0.01, 0.02, 0.03, 0.04],
    },
]

client.insert(collection_name, data)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.InsertReq;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_ZILLIZ_CLOUD_URI")
        .token("YOUR_ZILLIZ_CLOUD_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

String collectionName = "cohere_rerank_demo";

// Define collection schema
CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(true).autoID(false).build());
schema.addField(AddFieldReq.builder().fieldName("document").dataType(DataType.VarChar).maxLength(1000).build());
schema.addField(AddFieldReq.builder().fieldName("dense").dataType(DataType.FloatVector).dimension(4).build());

// Configure index
IndexParam indexParam = IndexParam.builder()
        .fieldName("dense")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build();

// Create collection
client.createCollection(CreateCollectionReq.builder()
        .collectionName(collectionName)
        .collectionSchema(schema)
        .indexParams(Collections.singletonList(indexParam))
        .build());

// Insert sample data
Gson gson = new Gson();
List<JsonObject> data = Arrays.asList(
        gson.fromJson("{\"id\": 1, \"document\": \"Recent renewable energy developments include improved solar efficiency.\", \"dense\": [0.10, 0.20, 0.30, 0.40]}", JsonObject.class),
        gson.fromJson("{\"id\": 2, \"document\": \"Climate policy and carbon markets have evolved rapidly in recent years.\", \"dense\": [0.11, 0.19, 0.28, 0.39]}", JsonObject.class),
        gson.fromJson("{\"id\": 3, \"document\": \"New battery technology helps stabilize wind and solar power generation.\", \"dense\": [0.90, 0.10, 0.05, 0.02]}", JsonObject.class),
        gson.fromJson("{\"id\": 4, \"document\": \"Vector databases support similarity search for machine learning applications.\", \"dense\": [0.01, 0.02, 0.03, 0.04]}", JsonObject.class)
);

client.insert(InsertReq.builder()
        .collectionName(collectionName)
        .data(data)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_ZILLIZ_CLOUD_URI",
    APIKey:  "YOUR_ZILLIZ_CLOUD_TOKEN",
})
if err != nil {
    panic(err)
}

collectionName := "cohere_rerank_demo"

// Define collection schema
schema := entity.NewSchema().WithName(collectionName).WithField(
    entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true).WithIsAutoID(false),
).WithField(
    entity.NewField().WithName("document").WithDataType(entity.FieldTypeVarChar).WithMaxLength(1000),
).WithField(
    entity.NewField().WithName("dense").WithDataType(entity.FieldTypeFloatVector).WithDim(4),
)

// Configure index and create collection
err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption(collectionName, schema).WithIndexOptions(
    milvusclient.NewCreateIndexOption(collectionName, "dense", index.NewAutoIndex(entity.COSINE)),
))
if err != nil {
    panic(err)
}

// Load collection
_, err = cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption(collectionName))
if err != nil {
    panic(err)
}

// Insert sample data
_, err = cli.Insert(ctx, milvusclient.NewRowBasedInsertOption(collectionName,
    map[string]any{"id": int64(1), "document": "Recent renewable energy developments include improved solar efficiency.", "dense": []float32{0.10, 0.20, 0.30, 0.40}},
    map[string]any{"id": int64(2), "document": "Climate policy and carbon markets have evolved rapidly in recent years.", "dense": []float32{0.11, 0.19, 0.28, 0.39}},
    map[string]any{"id": int64(3), "document": "New battery technology helps stabilize wind and solar power generation.", "dense": []float32{0.90, 0.10, 0.05, 0.02}},
    map[string]any{"id": int64(4), "document": "Vector databases support similarity search for machine learning applications.", "dense": []float32{0.01, 0.02, 0.03, 0.04}},
))
if err != nil {
    panic(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new().uri("YOUR_ZILLIZ_CLOUD_URI").token("YOUR_ZILLIZ_CLOUD_TOKEN")).await?;

let collection_name = "cohere_rerank_demo";

// Define collection schema
let schema = CollectionSchema::new()
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(false))
    .add_field(FieldSchema::new().name("document").data_type(DataType::VarChar).max_length(1000))
    .add_field(FieldSchema::new().name("dense").data_type(DataType::FloatVector).dimension(4));

// Configure index and create collection
let index_param = IndexParam::new()
    .field_name("dense")
    .index_type(IndexType::AutoIndex)
    .metric_type(MetricType::Cosine);

client.create_collection(
    CreateCollectionRequest::builder()
        .collection_name(collection_name)
        .schema(schema)
        .index_param(index_param)
        .build()?,
).await?;

// Insert sample data
let rows = vec![
    serde_json::json!({"id": 1, "document": "Recent renewable energy developments include improved solar efficiency.", "dense": [0.10, 0.20, 0.30, 0.40]}),
    serde_json::json!({"id": 2, "document": "Climate policy and carbon markets have evolved rapidly in recent years.", "dense": [0.11, 0.19, 0.28, 0.39]}),
    serde_json::json!({"id": 3, "document": "New battery technology helps stabilize wind and solar power generation.", "dense": [0.90, 0.10, 0.05, 0.02]}),
    serde_json::json!({"id": 4, "document": "Vector databases support similarity search for machine learning applications.", "dense": [0.01, 0.02, 0.03, 0.04]}),
];

client.insert(
    InsertRequest::builder()
        .collection_name(collection_name)
        .rows(rows)
        .build()?,
).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <string>
#include <vector>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_ZILLIZ_CLOUD_URI").WithToken("YOUR_ZILLIZ_CLOUD_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::string collection_name = "cohere_rerank_demo";

// Define collection schema
auto schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField(milvus::FieldSchema("id", milvus::DataType::INT64, "", true, false));
schema->AddField(milvus::FieldSchema("document", milvus::DataType::VARCHAR, "").WithMaxLength(1000));
schema->AddField(milvus::FieldSchema("dense", milvus::DataType::FLOAT_VECTOR, "").WithDimension(4));

// Configure index
milvus::IndexDesc index_desc("dense", "", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE);

// Create collection
status = client->CreateCollection(
    milvus::CreateCollectionRequest().WithCollectionName(collection_name).WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateIndex(
    milvus::CreateIndexRequest().WithCollectionName(collection_name).AddIndex(std::move(index_desc)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->LoadCollection(
    milvus::LoadCollectionRequest().WithCollectionName(collection_name));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Insert sample data
milvus::EntityRows rows;
rows.emplace_back(milvus::EntityRow{{"id", 1}, {"document", "Recent renewable energy developments include improved solar efficiency."}, {"dense", std::vector<float>{0.10f, 0.20f, 0.30f, 0.40f}}});
rows.emplace_back(milvus::EntityRow{{"id", 2}, {"document", "Climate policy and carbon markets have evolved rapidly in recent years."}, {"dense", std::vector<float>{0.11f, 0.19f, 0.28f, 0.39f}}});
rows.emplace_back(milvus::EntityRow{{"id", 3}, {"document", "New battery technology helps stabilize wind and solar power generation."}, {"dense", std::vector<float>{0.90f, 0.10f, 0.05f, 0.02f}}});
rows.emplace_back(milvus::EntityRow{{"id", 4}, {"document", "Vector databases support similarity search for machine learning applications."}, {"dense", std::vector<float>{0.01f, 0.02f, 0.03f, 0.04f}}});

milvus::InsertResponse resp;
status = client->Insert(
    milvus::InsertRequest().WithCollectionName(collection_name).WithRowsData(std::move(rows)), resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType, FunctionType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_ZILLIZ_CLOUD_URI", token: "YOUR_ZILLIZ_CLOUD_TOKEN" });

const collection_name = "cohere_rerank_demo";

// Define collection schema
const schema = [
    { name: "id", data_type: DataType.Int64, is_primary_key: true },
    { name: "document", data_type: DataType.VarChar, max_length: 1000 },
    { name: "dense", data_type: DataType.FloatVector, dim: 4 },
];

// Configure index
const index_params = { field_name: "dense", index_type: "AUTOINDEX", metric_type: "COSINE" };

// Create collection
await client.createCollection({
    collection_name: collection_name,
    fields: schema,
});

await client.createIndex({
    collection_name: collection_name,
    ...index_params,
});

// Insert sample data
const data = [
    { id: 1, document: "Recent renewable energy developments include improved solar efficiency.", dense: [0.10, 0.20, 0.30, 0.40] },
    { id: 2, document: "Climate policy and carbon markets have evolved rapidly in recent years.", dense: [0.11, 0.19, 0.28, 0.39] },
    { id: 3, document: "New battery technology helps stabilize wind and solar power generation.", dense: [0.90, 0.10, 0.05, 0.02] },
    { id: 4, document: "Vector databases support similarity search for machine learning applications.", dense: [0.01, 0.02, 0.03, 0.04] },
];

await client.insert({
    collection_name: collection_name,
    data: data,
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${YOUR_ZILLIZ_CLOUD_URI}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${YOUR_ZILLIZ_CLOUD_TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "cohere_rerank_demo",
    "schema": {
        "autoId": false,
        "fields": [
            {"fieldName": "id", "dataType": "Int64", "isPrimary": true},
            {"fieldName": "document", "dataType": "VarChar", "elementTypeParams": {"max_length": 1000}},
            {"fieldName": "dense", "dataType": "FloatVector", "elementTypeParams": {"dim": 4}}
        ]
    },
    "indexParams": [
        {"fieldName": "dense", "indexType": "AUTOINDEX", "metricType": "COSINE"}
    ]
}'

curl --request POST \
--url "${YOUR_ZILLIZ_CLOUD_URI}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${YOUR_ZILLIZ_CLOUD_TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "cohere_rerank_demo",
    "data": [
        {"id": 1, "document": "Recent renewable energy developments include improved solar efficiency.", "dense": [0.10, 0.20, 0.30, 0.40]},
        {"id": 2, "document": "Climate policy and carbon markets have evolved rapidly in recent years.", "dense": [0.11, 0.19, 0.28, 0.39]},
        {"id": 3, "document": "New battery technology helps stabilize wind and solar power generation.", "dense": [0.90, 0.10, 0.05, 0.02]},
        {"id": 4, "document": "Vector databases support similarity search for machine learning applications.", "dense": [0.01, 0.02, 0.03, 0.04]}
    ]
}'
```

</TabItem>
</Tabs>

</details>

### rerank 関数を定義する\{#define-the-rerank-function}

Cohere Ranker は、コレクションスキーマの一部としてではなく、**検索時に** 定義されます。

rerank 関数では、次の項目を指定します。

- reranking の対象となるテキストフィールド（`VARCHAR`）

- 使用する Cohere rerank モデル

- 関連性評価の対象となるクエリテキスト

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

cohere_ranker = Function(
    name="cohere_semantic_ranker",
    input_field_names=["document"],
    # highlight-next-line
    function_type=FunctionType.RERANK,
    params={
        "reranker": "model",
        "provider": "cohere",
        "model_name": "rerank-english-v3.0",
        "queries": ["renewable energy developments"],
        "integration_id": "YOUR_INTEGRATION_ID",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import java.util.Collections;

CreateCollectionReq.Function cohere_ranker = CreateCollectionReq.Function.builder()
        .name("cohere_semantic_ranker")
        .functionType(FunctionType.RERANK)
        .inputFieldNames(Collections.singletonList("document"))
        .param("reranker", "model")
        .param("provider", "cohere")
        .param("model_name", "rerank-english-v3.0")
        .param("queries", "[\"renewable energy developments\"]")
        .param("integration_id", "YOUR_INTEGRATION_ID")
        .build();
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"
)

cohere_ranker := entity.NewFunction().
    WithName("cohere_semantic_ranker").
    WithType(entity.FunctionTypeRerank).
    WithInputFields("document").
    WithParam("reranker", "model").
    WithParam("provider", "cohere").
    WithParam("model_name", "rerank-english-v3.0").
    WithParam("queries", []string{"renewable energy developments"})
cohere_ranker.WithParam("integration_id", "YOUR_INTEGRATION_ID")
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let cohere_ranker = FunctionScore::new().add_function(
    Function::new()
        .name("cohere_semantic_ranker")
        .function_type(FunctionType::Rerank)
        .input_fields(["document"])
        .param("reranker", "model")
        .param("provider", "cohere")
        .param("model_name", "rerank-english-v3.0")
        .param("queries", "[\"renewable energy developments\"]")
        .param("integration_id", "YOUR_INTEGRATION_ID")
);
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto cohere_ranker = std::make_shared<milvus::FunctionScore>();
auto cohere_function = std::make_shared<milvus::Function>("cohere_semantic_ranker", milvus::FunctionType::RERANK);
cohere_function->AddInputFieldName("document");
cohere_function->AddParam("reranker", "model");
cohere_function->AddParam("provider", "cohere");
cohere_function->AddParam("model_name", "rerank-english-v3.0");
cohere_function->AddParam("queries", "[\"renewable energy developments\"]");
cohere_function->AddParam("integration_id", "YOUR_INTEGRATION_ID");
cohere_ranker->AddFunction(cohere_function);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType, FunctionType } from "@zilliz/milvus2-sdk-node";

const cohere_ranker = {
    name: "cohere_semantic_ranker",
    type: FunctionType.RERANK,
    input_field_names: ["document"],
    params: {
        reranker: "model",
        provider: "cohere",
        model_name: "rerank-english-v3.0",
        queries: ["renewable energy developments"],
        integration_id: "YOUR_INTEGRATION_ID",
    },
};
```

</TabItem>

<TabItem value='bash'>

```bash
# The rerank function is defined at search time in the RESTful API.
# Pass it inline as the "functionScore" parameter of the /v2/vectordb/entities/search request (see the next section).
```

</TabItem>
</Tabs>

<Admonition type="info" title="Notes">

`queries` 内の文字列数は、検索リクエストで発行されるクエリ数と一致している必要があります。

</Admonition>

### rerank 関数を使用して検索する\{#search-with-the-rerank-function}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
query_vector = [0.12, 0.21, 0.29, 0.41]

results = client.search(
    collection_name=collection_name,
    data=[query_vector],
    anns_field="dense",
    limit=3,
    output_fields=["document"],
    # highlight-next-line
    ranker=cohere_ranker,
)

print(results)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

String collectionName = "cohere_rerank_demo";

CreateCollectionReq.Function cohere_ranker = CreateCollectionReq.Function.builder()
        .name("cohere_semantic_ranker")
        .functionType(FunctionType.RERANK)
        .inputFieldNames(Collections.singletonList("document"))
        .param("reranker", "model")
        .param("provider", "cohere")
        .param("model_name", "rerank-english-v3.0")
        .param("queries", "[\"renewable energy developments\"]")
        .param("integration_id", "YOUR_INTEGRATION_ID")
        .build();

List<Float> queryVector = Arrays.asList(0.12f, 0.21f, 0.29f, 0.41f);

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName(collectionName)
        .data(Collections.singletonList(new FloatVec(queryVector)))
        .annsField("dense")
        .topK(3)
        .outputFields(Collections.singletonList("document"))
        // highlight-next-line
        .ranker(cohere_ranker)
        .build());

System.out.println(searchResp.getSearchResults());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

collectionName := "cohere_rerank_demo"

cohere_ranker := entity.NewFunction().
    WithName("cohere_semantic_ranker").
    WithType(entity.FunctionTypeRerank).
    WithInputFields("document").
    WithParam("reranker", "model").
    WithParam("provider", "cohere").
    WithParam("model_name", "rerank-english-v3.0").
    WithParam("queries", []string{"renewable energy developments"})
cohere_ranker.WithParam("integration_id", "YOUR_INTEGRATION_ID")

results, err := cli.Search(ctx, milvusclient.NewSearchOption(collectionName, 3, []entity.Vector{entity.FloatVector{0.12, 0.21, 0.29, 0.41}}).
    WithANNSField("dense").
    WithOutputFields("document").
    // highlight-next-line
    WithFunctionReranker(cohere_ranker))
if err != nil {
    panic(err)
}

for _, result := range results {
    fmt.Println(result)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let collection_name = "cohere_rerank_demo";

let cohere_ranker = FunctionScore::new().add_function(
    Function::new()
        .name("cohere_semantic_ranker")
        .function_type(FunctionType::Rerank)
        .input_fields(["document"])
        .param("reranker", "model")
        .param("provider", "cohere")
        .param("model_name", "rerank-english-v3.0")
        .param("queries", "[\"renewable energy developments\"]")
        .param("integration_id", "YOUR_INTEGRATION_ID")
);

let query_vector = vec![0.12f32, 0.21, 0.29, 0.41];

let response = client.search(
    SearchRequest::builder()
        .collection_name(collection_name)
        .vector_field("dense")
        .vectors(SearchVectors::Float(vec![query_vector]))
        .limit(3)
        .output_fields(["document"])
        // highlight-next-line
        .rerank(cohere_ranker)
        .build()?,
).await?;

println!("{:?}", response);
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <vector>
#include "milvus/MilvusClientV2.h"

std::string collection_name = "cohere_rerank_demo";

auto cohere_ranker = std::make_shared<milvus::FunctionScore>();
auto cohere_function = std::make_shared<milvus::Function>("cohere_semantic_ranker", milvus::FunctionType::RERANK);
cohere_function->AddInputFieldName("document");
cohere_function->AddParam("reranker", "model");
cohere_function->AddParam("provider", "cohere");
cohere_function->AddParam("model_name", "rerank-english-v3.0");
cohere_function->AddParam("queries", "[\"renewable energy developments\"]");
cohere_function->AddParam("integration_id", "YOUR_INTEGRATION_ID");
cohere_ranker->AddFunction(cohere_function);

milvus::SearchRequest request = milvus::SearchRequest()
    .WithCollectionName(collection_name)
    .WithRerank(cohere_ranker)
    .WithLimit(3)
    .WithAnnsField("dense")
    .AddOutputField("document")
    .AddFloatVector(std::vector<float>{0.12f, 0.21f, 0.29f, 0.41f});

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::EntityRows output_rows;
status = response.Results().Results().at(0).OutputRows(output_rows);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
for (const auto& row : output_rows) {
    std::cout << row << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType, FunctionType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_ZILLIZ_CLOUD_URI", token: "YOUR_ZILLIZ_CLOUD_TOKEN" });

const collection_name = "cohere_rerank_demo";

const cohere_ranker = {
    name: "cohere_semantic_ranker",
    type: FunctionType.RERANK,
    input_field_names: ["document"],
    params: {
        reranker: "model",
        provider: "cohere",
        model_name: "rerank-english-v3.0",
        queries: ["renewable energy developments"],
        integration_id: "YOUR_INTEGRATION_ID",
    },
};

const query_vector = [0.12, 0.21, 0.29, 0.41];

const results = await client.search({
    collection_name: collection_name,
    data: [query_vector],
    anns_field: "dense",
    limit: 3,
    output_fields: ["document"],
    // highlight-next-line
    rerank: cohere_ranker,
});

console.log(results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${YOUR_ZILLIZ_CLOUD_URI}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${YOUR_ZILLIZ_CLOUD_TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "cohere_rerank_demo",
    "data": [[0.12, 0.21, 0.29, 0.41]],
    "annsField": "dense",
    "limit": 3,
    "outputFields": ["document"],
    "functionScore": {
        "functions": [
            {
                "name": "cohere_semantic_ranker",
                "type": "Rerank",
                "inputFieldNames": ["document"],
                "params": {
                    "reranker": "model",
                    "provider": "cohere",
                    "model_name": "rerank-english-v3.0",
                    "queries": ["renewable energy developments"],
                    "integration_id": "YOUR_INTEGRATION_ID"
                }
            }
        ]
    }
}'
```

</TabItem>
</Tabs>

この検索では、次の処理が実行されます。

1. Zilliz Cloud がベクトル検索を使用して候補を取得します。

1. Cohere Ranker が各候補のセマンティックな関連性を評価します。

1. 結果セットが返される前に並び替えられます。

## 次のステップ\{#next-steps}

Cohere Ranker はハイブリッド検索でも使用できます。

検索とハイブリッド検索は、同じ方法で ranker を適用します。

どちらの場合も、検索時に `ranker` パラメータを介して rerank 関数を渡します。

詳細については、[Multi-ベクトル Hybrid Search](./hybrid-search) を参照してください。

