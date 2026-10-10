---
title: "Voyage AI Ranker | Cloud"
slug: /voyage-ai-model-ranker
sidebar_label: "Voyage AI Ranker"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Voyage AI Ranker は、Voyage AI のものと検索アプリケーションを活用します。 | Cloud"
type: origin
token: PpGlwYU6PiSsfVkZ7doco50vnKg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Voyage AI Ranker

Voyage AI Ranker は、[Voyage AI](https://www.voyageai.com/) の特化型 reranker を活用し、セマンティック reranking によって検索の関連性を向上させます。retrieval-augmented generation（RAG）と検索アプリケーション向けに最適化された高性能な reranking 機能を提供します。

Voyage AI Ranker は、次のようなアプリケーションで特に有用です。

- reranking タスク向けに特別にトレーニングされたモデルによる高度なセマンティック理解

- 本番ワークロード向けに最適化された推論による高性能な処理

- 多様なドキュメント長に対応する柔軟な切り捨て制御

- 異なるモデルバリアント（rerank-2、rerank-lite など）にわたる微調整された性能

## 事前準備\{#before-you-start}

Voyage AI Ranker を使用する前に、次の前提条件を満たしていることを確認してください。

- **rerank モデルを選択する**

    `rerank-2.5` など、使用する Cohere rerank モデルを決定します。選択したモデルによって、reranking 時にセマンティックな関連性をどのように評価するかが決まります。詳細については、[Voyage AI 公式ドキュメント](https://docs.voyageai.com/docs/reranker) を参照してください。

- **Voyage AI と統合し、integration ID を取得する**

    Voyage AI Ranker を使用するには、まず [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) で Voyage AI をモデルプロバイダーとして統合する必要があります。

    統合後、Zilliz Cloud は **integration ID** を生成します。これは rerank 関数を定義する際に参照するものです。詳細な手順については、[モデルプロバイダーとの統合](./integrate-with-model-providers) を参照してください。

- **rerank 可能なテキストフィールドを含むコレクションスキーマを計画する**

    コレクションに、rerank 対象のテキストを含む `VARCHAR` フィールドが 1 つ含まれていることを確認してください。

## Voyage AI Ranker を使用する\{#use-voyage-ai-ranker}

このセクションでは、検索時に Voyage AI Ranker を適用して、取得した結果を rerank する方法を説明します。

rerank 関数は検索時に定義および適用されるため、クエリごとに reranking の動作を有効化、無効化、または変更できます。

### 準備\{#preparations}

次のセットアップでは、検索および reranking に使用するコレクションとサンプルデータを準備します。

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

collection_name = "voyage_rerank_demo"

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

import java.util.ArrayList;
import java.util.List;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_ZILLIZ_CLOUD_URI")
        .token("YOUR_ZILLIZ_CLOUD_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

String collectionName = "voyage_rerank_demo";

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder().build();
schema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(true).autoID(false).build());
schema.addField(AddFieldReq.builder().fieldName("document").dataType(DataType.VarChar).maxLength(1000).build());
schema.addField(AddFieldReq.builder().fieldName("dense").dataType(DataType.FloatVector).dimension(4).build());

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("dense")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());

client.createCollection(CreateCollectionReq.builder()
        .collectionName(collectionName)
        .collectionSchema(schema)
        .indexParams(indexes)
        .build());

Gson gson = new Gson();
List<JsonObject> data = new ArrayList<>();
int[] ids = {1, 2, 3, 4};
String[] documents = {
    "Recent renewable energy developments include improved solar efficiency.",
    "Climate policy and carbon markets have evolved rapidly in recent years.",
    "New battery technology helps stabilize wind and solar power generation.",
    "Vector databases support similarity search for machine learning applications."
};
float[][] vectors = {
    {0.10f, 0.20f, 0.30f, 0.40f},
    {0.11f, 0.19f, 0.28f, 0.39f},
    {0.90f, 0.10f, 0.05f, 0.02f},
    {0.01f, 0.02f, 0.03f, 0.04f}
};
for (int i = 0; i < ids.length; i++) {
    JsonObject row = new JsonObject();
    row.addProperty("id", ids[i]);
    row.addProperty("document", documents[i]);
    List<Float> dense = new ArrayList<>();
    for (float v : vectors[i]) {
        dense.add(v);
    }
    row.add("dense", gson.toJsonTree(dense));
    data.add(row);
}

client.insert(InsertReq.builder().collectionName(collectionName).data(data).build());
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
    // handle err
}
defer cli.Close(ctx)

schema := &entity.Schema{}
schema.WithField(entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true).WithIsAutoID(false))
schema.WithField(entity.NewField().WithName("document").WithDataType(entity.FieldTypeVarChar).WithMaxLength(1000))
schema.WithField(entity.NewField().WithName("dense").WithDataType(entity.FieldTypeFloatVector).WithDim(4))

err = cli.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("voyage_rerank_demo", schema))
if err != nil {
    // handle err
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("voyage_rerank_demo", "dense", index.NewAutoIndex(entity.COSINE)))
if err != nil {
    // handle err
}

_, err = cli.Insert(ctx, milvusclient.NewColumnBasedInsertOption("voyage_rerank_demo").
    WithInt64Column("id", []int64{1, 2, 3, 4}).
    WithVarcharColumn("document", []string{
        "Recent renewable energy developments include improved solar efficiency.",
        "Climate policy and carbon markets have evolved rapidly in recent years.",
        "New battery technology helps stabilize wind and solar power generation.",
        "Vector databases support similarity search for machine learning applications.",
    }).
    WithFloatVectorColumn("dense", 4, [][]float32{
        {0.10, 0.20, 0.30, 0.40},
        {0.11, 0.19, 0.28, 0.39},
        {0.90, 0.10, 0.05, 0.02},
        {0.01, 0.02, 0.03, 0.04},
    }))
if err != nil {
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("YOUR_ZILLIZ_CLOUD_URI")
    .token("YOUR_ZILLIZ_CLOUD_TOKEN");
let client = ClientV2::new(&config).await?;

let schema = CollectionSchema::new()
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(false))
    .add_field(FieldSchema::new().name("document").data_type(DataType::VarChar).max_length(1000))
    .add_field(FieldSchema::new().name("dense").data_type(DataType::FloatVector).dimension(4));

client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name("voyage_rerank_demo")
            .schema(schema)
            .index_params(vec![IndexParam::new()
                .field_name("dense")
                .index_type(IndexType::AutoIndex)
                .metric_type(MetricType::Cosine)])
            .build()?,
    )
    .await?;

client
    .insert(
        InsertRequest::builder()
            .collection_name("voyage_rerank_demo")
            .columns(vec![
                FieldData::int64("id", vec![1, 2, 3, 4]),
                FieldData::varchar("document", vec![
                    "Recent renewable energy developments include improved solar efficiency.".to_string(),
                    "Climate policy and carbon markets have evolved rapidly in recent years.".to_string(),
                    "New battery technology helps stabilize wind and solar power generation.".to_string(),
                    "Vector databases support similarity search for machine learning applications.".to_string(),
                ]),
                FieldData::float_vector("dense", vec![
                    vec![0.10, 0.20, 0.30, 0.40],
                    vec![0.11, 0.19, 0.28, 0.39],
                    vec![0.90, 0.10, 0.05, 0.02],
                    vec![0.01, 0.02, 0.03, 0.04],
                ]),
            ])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <memory>
#include <string>
#include <vector>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_ZILLIZ_CLOUD_URI").WithToken("YOUR_ZILLIZ_CLOUD_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchema schema("voyage_rerank_demo");
schema.AddField(milvus::FieldSchema("id", milvus::DataType::INT64).WithPrimaryKey(true).WithAutoID(false));
schema.AddField(milvus::FieldSchema("document", milvus::DataType::VARCHAR).WithMaxLength(1000));
schema.AddField(milvus::FieldSchema("dense", milvus::DataType::FLOAT_VECTOR).WithDimension(4));

milvus::CreateCollectionRequest create_request;
create_request.WithCollectionName("voyage_rerank_demo");
create_request.WithCollectionSchema(std::make_shared<milvus::CollectionSchema>(schema));
std::vector<milvus::IndexDesc> indexes;
indexes.emplace_back("dense", "dense_idx", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE);
create_request.WithIndexes(std::move(indexes));

status = client->CreateCollection(create_request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::InsertRequest insert_request;
insert_request.WithCollectionName("voyage_rerank_demo")
    .AddRowData({{"id", 1}, {"document", "Recent renewable energy developments include improved solar efficiency."}, {"dense", std::vector<float>{0.10f, 0.20f, 0.30f, 0.40f}}})
    .AddRowData({{"id", 2}, {"document", "Climate policy and carbon markets have evolved rapidly in recent years."}, {"dense", std::vector<float>{0.11f, 0.19f, 0.28f, 0.39f}}})
    .AddRowData({{"id", 3}, {"document", "New battery technology helps stabilize wind and solar power generation."}, {"dense", std::vector<float>{0.90f, 0.10f, 0.05f, 0.02f}}})
    .AddRowData({{"id", 4}, {"document", "Vector databases support similarity search for machine learning applications."}, {"dense", std::vector<float>{0.01f, 0.02f, 0.03f, 0.04f}}});
milvus::InsertResponse insert_response;
status = client->Insert(insert_request, insert_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_ZILLIZ_CLOUD_URI",
  token: "YOUR_ZILLIZ_CLOUD_TOKEN",
});

const collection_name = "voyage_rerank_demo";

await client.createCollection({
  collection_name,
  fields: [
    { name: "id", data_type: DataType.Int64, is_primary_key: true, autoID: false },
    { name: "document", data_type: DataType.VarChar, max_length: 1000 },
    { name: "dense", data_type: DataType.FloatVector, dim: 4 },
  ],
});

await client.createIndex({
  collection_name,
  field_name: "dense",
  index_type: "AUTOINDEX",
  metric_type: "COSINE",
});

const data = [
  { id: 1, document: "Recent renewable energy developments include improved solar efficiency.", dense: [0.10, 0.20, 0.30, 0.40] },
  { id: 2, document: "Climate policy and carbon markets have evolved rapidly in recent years.", dense: [0.11, 0.19, 0.28, 0.39] },
  { id: 3, document: "New battery technology helps stabilize wind and solar power generation.", dense: [0.90, 0.10, 0.05, 0.02] },
  { id: 4, document: "Vector databases support similarity search for machine learning applications.", dense: [0.01, 0.02, 0.03, 0.04] },
];

await client.insert({ collection_name, data });
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "https://YOUR_ZILLIZ_CLOUD_URI/v2/vectordb/collections/create" \
  --header "Authorization: Bearer YOUR_ZILLIZ_CLOUD_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "voyage_rerank_demo",
    "schema": {
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
  --url "https://YOUR_ZILLIZ_CLOUD_URI/v2/vectordb/entities/insert" \
  --header "Authorization: Bearer YOUR_ZILLIZ_CLOUD_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "voyage_rerank_demo",
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

Voyage AI Ranker は、コレクションスキーマの一部としてではなく、**検索時**に定義されます。

rerank 関数では、次の項目を指定します。

- rerank するテキストフィールド（`VARCHAR`）

- 使用する Voyage AI モデル

- クエリとドキュメントをどのように切り捨てるか、または検証するか

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

voyage_ranker = Function(
    name="voyage_semantic_ranker",
    input_field_names=["document"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "model",
        "provider": "voyageai",
        "model_name": "rerank-2.5",
        "queries": ["renewable energy developments"],
        "truncation": True,
        "integration_id": "YOUR_INTEGRATION_ID",
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

Map<String, String> params = new HashMap<>();
params.put("reranker", "model");
params.put("provider", "voyageai");
params.put("model_name", "rerank-2.5");
params.put("queries", "[\"renewable energy developments\"]");
params.put("truncation", "true");
params.put("integration_id", "YOUR_INTEGRATION_ID");

CreateCollectionReq.Function voyage_ranker = CreateCollectionReq.Function.builder()
        .name("voyage_semantic_ranker")
        .functionType(FunctionType.RERANK)
        .inputFieldNames(Arrays.asList("document"))
        .params(params)
        .build();
```

</TabItem>

<TabItem value='go'>

```go
voyage_ranker := entity.NewFunction().
    WithName("voyage_semantic_ranker").
    WithType(entity.FunctionTypeRerank).
    WithInputFields("document").
    WithParam("reranker", "model").
    WithParam("provider", "voyageai").
    WithParam("model_name", "rerank-2.5").
    WithParam("queries", []string{"renewable energy developments"}).
    WithParam("truncation", true)
    .WithParam("integration_id", "YOUR_INTEGRATION_ID")
```

</TabItem>

<TabItem value='rust'>

```rust
let voyage_ranker = Function::new()
    .name("voyage_semantic_ranker")
    .function_type(FunctionType::Rerank)
    .input_fields(["document"])
    .param("reranker", "model")
    .param("provider", "voyageai")
    .param("model_name", "rerank-2.5")
    .param("queries", "[\"renewable energy developments\"]")
    .param("truncation", "true")
    .param("integration_id", "YOUR_INTEGRATION_ID")
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::FunctionPtr voyage_ranker = std::make_shared<milvus::Function>(
    "voyage_semantic_ranker", milvus::FunctionType::RERANK);
voyage_ranker->AddInputFieldName("document");
voyage_ranker->AddParam("reranker", "model");
voyage_ranker->AddParam("provider", "voyageai");
voyage_ranker->AddParam("model_name", "rerank-2.5");
voyage_ranker->AddParam("queries", "[\"renewable energy developments\"]");
voyage_ranker->AddParam("truncation", "true");
voyage_ranker->AddParam("integration_id", "YOUR_INTEGRATION_ID");
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { FunctionType } from "@zilliz/milvus2-sdk-node";

const voyage_ranker = {
  name: "voyage_semantic_ranker",
  type: FunctionType.RERANK,
  input_field_names: ["document"],
  params: {
    reranker: "model",
    provider: "voyageai",
    model_name: "rerank-2.5",
    queries: ["renewable energy developments"],
    truncation: true,
    integration_id: "YOUR_INTEGRATION_ID",
  },
};
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The RESTful API defines the rerank function inline in the search
# request via the "functionScore" field; there is no separate "define
# function" step for the RESTful API.
```

</TabItem>
</Tabs>

<Admonition type="info" title="Notes">

`queries` 内の文字列の数は、検索リクエストで発行されるクエリの数と一致している必要があります。

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
    ranker=voyage_ranker,
)

print(results)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.Arrays;
import java.util.Collections;

SearchReq searchReq = SearchReq.builder()
        .collectionName(collectionName)
        .data(Collections.singletonList(new FloatVec(Arrays.asList(0.12f, 0.21f, 0.29f, 0.41f))))
        .annsField("dense")
        .topK(3)
        .outputFields(Arrays.asList("document"))
        .ranker(voyage_ranker)
        .build();

SearchResp results = client.search(searchReq);
System.out.println(results.getSearchResults());
```

</TabItem>

<TabItem value='go'>

```go
results, err := cli.Search(ctx, milvusclient.NewSearchOption("voyage_rerank_demo", 3,
    []entity.Vector{entity.FloatVector{0.12, 0.21, 0.29, 0.41}}).
    WithANNSField("dense").
    WithOutputFields("document").
    WithFunctionReranker(voyage_ranker))
if err != nil {
    // handle err
}

fmt.Println(results)
```

</TabItem>

<TabItem value='rust'>

```rust
let query_vector = vec![0.12, 0.21, 0.29, 0.41];

let results = client
    .search(
        SearchRequest::builder()
            .collection_name("voyage_rerank_demo")
            .vector_field("dense")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .limit(3)
            .output_fields(["document"])
            .rerank(FunctionScore::new().add_function(voyage_ranker))
            .build()?,
    )
    .await?;

println!("{results:?}");
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::SearchRequest search_request;
search_request.WithCollectionName("voyage_rerank_demo")
    .WithLimit(3)
    .WithAnnsField("dense")
    .WithOutputFields({"document"});
search_request.AddFloatVector(std::vector<float>{0.12f, 0.21f, 0.29f, 0.41f});

milvus::FunctionScorePtr function_score = std::make_shared<milvus::FunctionScore>();
function_score->AddFunction(voyage_ranker);
search_request.WithRerank(function_score);

milvus::SearchResponse search_response;
status = client->Search(search_request, search_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const query_vector = [0.12, 0.21, 0.29, 0.41];

const results = await client.search({
  collection_name,
  vector: query_vector,
  anns_field: "dense",
  limit: 3,
  output_fields: ["document"],
  rerank: voyage_ranker,
});

console.log(results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "https://YOUR_ZILLIZ_CLOUD_URI/v2/vectordb/entities/search" \
  --header "Authorization: Bearer YOUR_ZILLIZ_CLOUD_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "voyage_rerank_demo",
    "data": [[0.12, 0.21, 0.29, 0.41]],
    "annsField": "dense",
    "limit": 3,
    "outputFields": ["document"],
    "functionScore": {
      "functions": [
        {
          "name": "voyage_semantic_ranker",
          "type": "Rerank",
          "inputFieldNames": ["document"],
          "outputFieldNames": [],
          "params": {
            "reranker": "model",
            "provider": "voyageai",
            "model_name": "rerank-2.5",
            "queries": ["renewable energy developments"],
            "truncation": true,
            "credential": "YOUR_VOYAGE_API_KEY"
          }
        }
      ],
      "params": {}
    }
  }'
```

</TabItem>
</Tabs>

この検索では、次の処理が実行されます。

1. ベクトル検索を使用して候補が取得されます。

1. Voyage AI Ranker が各候補のセマンティックな関連性を評価します。

1. 結果セットは返される前に並べ替えられます。

## 次のステップ\{#next-steps}

Voyage AI Ranker はハイブリッド検索と組み合わせて使用することもできます。

検索とハイブリッド検索では、同じ方法で ranker を適用します。

どちらの場合も、検索時に `ranker` パラメータを介して rerank 関数を渡します。

詳細については、[マルチベクトルハイブリッド検索](./hybrid-search) を参照してください。
