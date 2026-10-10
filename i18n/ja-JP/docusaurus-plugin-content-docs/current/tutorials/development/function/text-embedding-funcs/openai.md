---
title: "OpenAI | Cloud"
slug: /openai
sidebar_label: "OpenAI"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "埋め込みモデルを選択し、テキスト埋め込み関数を備えたコレクションを作成することで、Zilliz Cloud で OpenAI の埋め込みモデルを使用できます。 | Cloud"
type: origin
token: IrQ2wm2oaiAWl4kqQhkc303Rnlg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OpenAI

埋め込みモデルを選択し、テキスト埋め込み関数を備えたコレクションを作成することで、Zilliz Cloud で OpenAI の埋め込みモデルを使用できます。

## モデルの選択肢\{#model-choices}

Zilliz Cloud は OpenAI が提供するすべての埋め込みモデルをサポートしています。以下は、すぐに参照できるように利用可能な OpenAI 埋め込みモデルをまとめたものです。

| モデル名 | 次元数 | 最大トークン数 | 説明 |
| --- | --- | --- | --- |
| text-embedding-3-small | デフォルト：1,536（1,536 未満の次元サイズに短縮可能） | 8,191 | コスト重視でスケーラブルなセマンティック検索に最適で、低価格でも高いパフォーマンスを発揮します。 |
| text-embedding-3-large | デフォルト：3,072（3,072 未満の次元サイズに短縮可能） | 8,191 | 検索精度の向上とより豊かなセマンティック表現を必要とするアプリケーションに最適です。 |
| text-embedding-ada-002 | 固定：1,536（短縮不可） | 8,191 | レガシーパイプラインや後方互換性が必要なシナリオに適した旧世代のモデルです。 |

第3世代の埋め込みモデル（**text-embedding-3**）は、`dim` パラメータを使用して埋め込みのサイズを縮小できます。一般に、埋め込みが大きいほど、計算、メモリ、ストレージの観点でコストが高くなります。次元数を調整できるため、全体のコストとパフォーマンスをより細かく制御できます。各モデルの詳細については、[Embedding models](https://platform.openai.com/docs/guides/embeddings#embedding-models) および [OpenAI announcement blog post](https://openai.com/blog/new-embedding-models-and-api-updates) を参照してください。

## 事前準備\{#before-you-start}

テキスト埋め込み関数を使用する前に、次の前提条件を満たしていることを確認してください。

- **埋め込みモデルを選択する**

    使用する埋め込みモデルを決定してください。この選択により、埋め込みの動作と出力形式が決まります。詳細については、[埋め込みモデルの選択](./openai#model-choices) を参照してください。

- **OpenAI と統合して統合 ID を取得する**

    OpenAI が提供する埋め込みモデルを使用する前に、OpenAI とのモデルプロバイダー統合を作成し、統合 ID を取得する必要があります。詳細については、[モデルプロバイダーとの統合](./integrate-with-model-providers) を参照してください。

- **互換性のあるコレクションスキーマを設計する**

    コレクションスキーマに次の項目を含めるよう計画してください。

    - 生の入力テキスト用のテキストフィールド（`VARCHAR`）

    - データ型と次元数が選択した埋め込みモデルと一致する高密度ベクトルフィールド

- **挿入時と検索時に生テキストを扱う準備をする**

    テキスト埋め込み関数を有効にすると、生テキストを直接挿入およびクエリできます。埋め込みはシステムによって自動的に生成されます。

## ステップ 1: テキスト埋め込み関数を使用してコレクションを作成する\{#step-1-create-a-collection-with-a-text-embedding-function}

### スキーマフィールドを定義する\{#define-schema-fields}

埋め込み関数を使用するには、特定のスキーマを持つコレクションを作成します。このスキーマには、少なくとも次の3つの必須フィールドを含める必要があります。

- コレクション内の各エンティティを一意に識別するプライマリフィールド。

- 埋め込み対象の生データを格納する `VARCHAR` フィールド。

- テキスト埋め込み関数が `VARCHAR` フィールドに対して生成する高密度ベクトル埋め込みを格納するために予約されたベクトルフィールド。

次の例では、テキストデータを格納するための `VARCHAR` フィールド `"document"` と、テキスト埋め込み関数によって生成される高密度埋め込みを格納するためのベクトルフィールド `"dense"` を持つスキーマを定義します。ベクトルの次元数（`dim`）を、選択した埋め込みモデルの出力に一致するように設定してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType, Function, FunctionType

# Initialize Milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create a new schema for the collection
schema = client.create_schema()

# Add primary field "id"
schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)

# Add scalar field "document" for storing textual data
schema.add_field("document", DataType.VARCHAR, max_length=9000)

# Add vector field "dense" for storing embeddings.
# IMPORTANT: Set dim to match the exact output dimension of the embedding model.
# For instance, OpenAI's text-embedding-3-small model outputs 1536-dimensional vectors.
# For dense vector, data type can be FLOAT_VECTOR or INT8_VECTOR
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=1536)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

CreateCollectionReq.CollectionSchema schema = client.createSchema();

schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(false)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("document")
        .dataType(DataType.VarChar)
        .maxLength(9000)
        .build());
        
schema.addField(AddFieldReq.builder()
        .fieldName("dense")
        .dataType(DataType.FloatVector)
        .dimension(1536)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
schema := entity.NewSchema().
    WithField(entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true).WithIsAutoID(false)).
    WithField(entity.NewField().WithName("document").WithDataType(entity.FieldTypeVarChar).WithMaxLength(9000)).
    WithField(entity.NewField().WithName("dense").WithDataType(entity.FieldTypeFloatVector).WithDim(1536))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let schema = CollectionSchema::new()
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(false))
    .add_field(FieldSchema::new().name("document").data_type(DataType::VarChar).max_length(9000))
    .add_field(FieldSchema::new().name("dense").data_type(DataType::FloatVector).dimension(1536));
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"id", milvus::DataType::INT64, "", true, false});
schema->AddField(milvus::FieldSchema("document", milvus::DataType::VARCHAR).WithMaxLength(9000));
schema->AddField(milvus::FieldSchema("dense", milvus::DataType::FLOAT_VECTOR).WithDimension(1536));
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
});

// Define the collection schema
const schema = {
  fields: [
    { name: 'id', data_type: DataType.Int64, is_primary_key: true, autoID: false },
    { name: 'document', data_type: DataType.VarChar, max_length: 9000 },
    { name: 'dense', data_type: DataType.FloatVector, dim: 1536 },
  ],
};
```

</TabItem>

<TabItem value='bash'>

```bash
# Define the collection schema
SCHEMA='{
  "fields": [
    { "fieldName": "id", "dataType": "Int64", "isPrimary": true },
    { "fieldName": "document", "dataType": "VarChar", "elementTypeParams": { "max_length": "9000" } },
    { "fieldName": "dense", "dataType": "FloatVector", "elementTypeParams": { "dim": "1536" } }
  ]
}' 
```

</TabItem>
</Tabs>

### テキスト埋め込み関数を定義する\{#define-the-text-embedding-function}

テキスト埋め込み関数は、`VARCHAR` フィールドに格納された生データを自動的に埋め込みに変換し、明示的に定義されたベクトルフィールドに格納します。

次の例では、スカラーフィールド `"document"` を埋め込みに変換し、得られたベクトルを先に定義した `"dense"` ベクトルフィールドに格納する Function モジュール（`openai_embedding`）を追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Define embedding function (example: OpenAI provider)
text_embedding_function = Function(
    name="openai_embedding",                  # Unique identifier for this embedding function
    function_type=FunctionType.TEXTEMBEDDING, # Type of embedding function
    input_field_names=["document"],           # Scalar field to embed
    output_field_names=["dense"],             # Vector field to store embeddings
    params={                                  # Provider-specific configuration (highest priority)
        "provider": "openai",                 # Embedding model provider
        "model_name": "text-embedding-3-small",     # Embedding model
        "integration_id": "YOUR_INTEGRATION_ID",    # Integration ID generated in the Zilliz Cloud console for the selected model provider
        # "dim": "1536",       # Optional: shorten the vector dimension
        # "user": "user123"    # Optional: identifier for API tracking
    }
)

# Add the embedding function to your schema
schema.add_function(text_embedding_function)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;

import java.util.Collections;

Function function = Function.builder()
        .functionType(FunctionType.TEXTEMBEDDING)
        .name("openai_embedding")
        .inputFieldNames(Collections.singletonList("document"))
        .outputFieldNames(Collections.singletonList("dense"))
        .param("provider", "openai")
        .param("model_name", "text-embedding-3-small")
        .param("integration_id", "YOUR_INTEGRATION_ID")
        .build();
schema.addFunction(function);
```

</TabItem>

<TabItem value='go'>

```go
function := entity.NewFunction().
    WithName("openai_embedding").
    WithType(entity.FunctionTypeTextEmbedding).
    WithInputFields("document").
    WithOutputFields("dense").
    WithParam("provider", "openai").
    WithParam("model_name", "text-embedding-3-small")
function = function.WithParam("integration_id", "YOUR_INTEGRATION_ID")

schema.WithFunction(function)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let function = Function::new()
    .name("openai_embedding")
    .function_type(FunctionType::TextEmbedding)
    .input_fields(["document"])
    .output_fields(["dense"])
    .params(HashMap::from([
        ("provider".into(), "openai".into()),
        ("model_name".into(), "text-embedding-3-small".into()),
        ("integration_id".into(), "YOUR_INTEGRATION_ID".into()),
    ]));

schema.add_function(function);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::FunctionPtr function = std::make_shared<milvus::Function>("openai_embedding", milvus::FunctionType::TEXTEMBEDDING);
function->AddInputFieldName("document");
function->AddOutputFieldName("dense");
function->AddParam("provider", "openai");
function->AddParam("model_name", "text-embedding-3-small");
function->AddParam("integration_id", "YOUR_INTEGRATION_ID");
schema->AddFunction(function);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const openaiFunc = {
  name: 'openai_embedding',
  type: 'TextEmbedding',
  input_field_names: ['document'],
  output_field_names: ['dense'],
  params: {
    provider: 'openai',
    model_name: 'text-embedding-3-small',
    integration_id: 'YOUR_INTEGRATION_ID',
  },
};
```

</TabItem>

<TabItem value='bash'>

```bash
# Define the text embedding function
FUNCTION='{
  "name": "openai_embedding",
  "type": "TextEmbedding",
  "inputFieldNames": ["document"],
  "outputFieldNames": ["dense"],
  "params": {
    "provider": "openai",
    "model_name": "text-embedding-3-small"
    ,"integration_id": "YOUR_INTEGRATION_ID"
  }
}' 
```

</TabItem>
</Tabs>

### インデックスを構成する\{#configure-the-index}

必要なフィールドと組み込み関数を含むスキーマを定義したら、コレクションのインデックスを設定します。このプロセスを簡素化するには、`index_type` として `AUTOINDEX` を使用します。これは、データの構造に基づいて Zilliz Cloud が最適なインデックスタイプを選択して構成できるようにするオプションです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Prepare index parameters
index_params = client.prepare_index_params()

# Add AUTOINDEX to automatically select optimal indexing method
index_params.add_index(
    field_name="dense",
    index_type="AUTOINDEX",
    metric_type="COSINE" 
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.ArrayList;
import java.util.List;

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("dense")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
indexOption := milvusclient.NewCreateIndexOption("demo", "dense", index.NewAutoIndex(entity.COSINE))
```

</TabItem>

<TabItem value='rust'>

```rust
let index_params = vec![
    IndexParam::new()
        .field_name("dense")
        .index_type(IndexType::AutoIndex)
        .metric_type(MetricType::Cosine),
];
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<milvus::IndexDesc> indexes = {
    milvus::IndexDesc("dense", "", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Prepare index parameters
const indexParams = {
  field_name: 'dense',
  index_type: 'AUTOINDEX',
  metric_type: 'COSINE',
};
```

</TabItem>

<TabItem value='bash'>

```bash
# Define the index parameters
indexParams='{
  "fieldName": "dense",
  "indexName": "dense_index",
  "indexType": "AUTOINDEX",
  "metricType": "COSINE"
}' 
```

</TabItem>
</Tabs>

### コレクションを作成する\{#create-the-collection}

定義したスキーマとインデックスパラメーターを使用してコレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Create collection named "demo"
client.create_collection(
    collection_name='demo', 
    schema=schema, 
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("demo")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("demo", schema).WithIndexOptions(indexOption))
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name("demo")
            .schema(schema)
            .index_params(index_params)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->CreateCollection(milvus::CreateCollectionRequest()
                                .WithCollectionName("demo")
                                .WithIndexes(std::move(indexes))
                                .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createCollection({
  collection_name: 'demo',
  fields: schema.fields,
  functions: [openaiFunc],
});

// Create the index on the dense vector field
await client.createIndex({
  collection_name: 'demo',
  ...indexParams,
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "demo",
    "schema": {
      "fields": [
        { "fieldName": "id", "dataType": "Int64", "isPrimary": true },
        { "fieldName": "document", "dataType": "VarChar", "elementTypeParams": { "max_length": "9000" } },
        { "fieldName": "dense", "dataType": "FloatVector", "elementTypeParams": { "dim": "1536" } }
      ],
      "functions": [
        {
          "name": "openai_embedding",
          "type": "TextEmbedding",
          "inputFieldNames": ["document"],
          "outputFieldNames": ["dense"],
          "params": {
            "provider": "openai",
            "model_name": "text-embedding-3-small"
          }
        }
      ]
    },
    "indexParams": [
      {
        "fieldName": "dense",
        "indexName": "dense_index",
        "indexType": "AUTOINDEX",
        "metricType": "COSINE"
      }
    ]
  }' 
```

</TabItem>
</Tabs>

## ステップ 2: データを挿入する\{#step-2-insert-data}

コレクションとインデックスを設定したら、生データを挿入する準備が整います。このプロセスでは、生テキストを指定するだけで済みます。先ほど定義した Function モジュールが、各テキストエントリに対応するスパースベクトルを自動的に生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Insert sample documents
client.insert('demo', [
    {'id': 1, 'document': 'Milvus simplifies semantic search through embeddings.'},
    {'id': 2, 'document': 'Vector embeddings convert text into searchable numeric data.'},
    {'id': 3, 'document': 'Semantic search helps users find relevant information quickly.'},
])
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;
import java.util.Arrays;
import java.util.List;

Gson gson = new Gson();
List<JsonObject> rows = Arrays.asList(
        gson.fromJson("{\"id\": 0, \"document\": \"Milvus simplifies semantic search through embeddings.\"}", JsonObject.class),
        gson.fromJson("{\"id\": 1, \"document\": \"Vector embeddings convert text into searchable numeric data.\"}", JsonObject.class),
        gson.fromJson("{\"id\": 2, \"document\": \"Semantic search helps users find relevant information quickly.\"}", JsonObject.class)
);

client.insert(InsertReq.builder()
        .collectionName("demo")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
_, err = client.Insert(ctx, milvusclient.NewRowBasedInsertOption("demo",
    map[string]any{"id": int64(1), "document": "Milvus simplifies semantic search through embeddings."},
    map[string]any{"id": int64(2), "document": "Vector embeddings convert text into searchable numeric data."},
    map[string]any{"id": int64(3), "document": "Semantic search helps users find relevant information quickly."},
))
if err != nil {
    log.Fatal(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use serde_json::json;

let rows = vec![
    json!({"id": 1, "document": "Milvus simplifies semantic search through embeddings."}),
    json!({"id": 2, "document": "Vector embeddings convert text into searchable numeric data."}),
    json!({"id": 3, "document": "Semantic search helps users find relevant information quickly."}),
];

client
    .insert(
        InsertRequest::builder()
            .collection_name("demo")
            .rows(rows)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::EntityRows data = {
    {{"id", 1}, {"document", "Milvus simplifies semantic search through embeddings."}},
    {{"id", 2}, {"document", "Vector embeddings convert text into searchable numeric data."}},
    {{"id", 3}, {"document", "Semantic search helps users find relevant information quickly."}}
};

milvus::InsertResponse insert_response;
status = client->Insert(milvus::InsertRequest()
                            .WithCollectionName("demo")
                            .WithRowsData(std::move(data)),
                        insert_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.insert({
  collection_name: 'demo',
  fields_data: [
    { id: 1, document: 'Milvus simplifies semantic search through embeddings.' },
    { id: 2, document: 'Vector embeddings convert text into searchable numeric data.' },
    { id: 3, document: 'Semantic search helps users find relevant information quickly.' },
  ],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/insert" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "demo",
    "data": [
      { "id": 1, "document": "Milvus simplifies semantic search through embeddings." },
      { "id": 2, "document": "Vector embeddings convert text into searchable numeric data." },
      { "id": 3, "document": "Semantic search helps users find relevant information quickly." }
    ]
  }' 
```

</TabItem>
</Tabs>

## ステップ 3: テキストで検索する\{#step-3-search-with-text}

データを挿入した後、生のクエリテキストを使用してセマンティック検索を実行します。Milvus はクエリを自動的に埋め込みベクトルに変換し、類似度に基づいて関連するドキュメントを取得して、最も一致する結果を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Perform semantic search
results = client.search(
    collection_name='demo', 
    data=['How does Milvus handle semantic search?'], # Use text query rather than query vector
    anns_field='dense',   # Use the vector field that stores embeddings
    limit=1,
    output_fields=['document'],
)

print(results)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Collections;
import java.util.List;

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("demo")
        .data(Collections.singletonList(new EmbeddedText("How does Milvus handle semantic search?")))
        .limit(1)
        .outputFields(Collections.singletonList("document"))
        .build());
List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```

</TabItem>

<TabItem value='go'>

```go
searchResults, err := client.Search(ctx, milvusclient.NewSearchOption(
    "demo",
    1,
    []entity.Vector{entity.Text("How does Milvus handle semantic search?")},
).
    WithANNSField("dense").
    WithOutputFields("document"))
if err != nil {
    log.Fatal(err)
}
for _, rs := range searchResults {
    fmt.Println(rs.Fields)
}
```

</TabItem>

<TabItem value='rust'>

```rust
let response = client
    .search(
        SearchRequest::builder()
            .collection_name("demo")
            .vector_field("dense")
            .vectors(SearchVectors::EmbeddedText(vec!["How does Milvus handle semantic search?".into()]))
            .limit(1)
            .output_fields(["document"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::SearchRequest()
               .WithCollectionName("demo")
               .AddEmbeddedText("How does Milvus handle semantic search?")
               .WithLimit(1)
               .WithAnnsField("dense")
               .AddOutputField("document");

milvus::SearchResponse search_response;
status = client->Search(request, search_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const results = await client.search({
  collection_name: 'demo',
  data: ['How does Milvus handle semantic search?'],
  anns_field: 'dense',
  limit: 1,
  output_fields: ['document'],
});
console.log(results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "collectionName": "demo",
    "data": ["How does Milvus handle semantic search?"],
    "annsField": "dense",
    "limit": 1,
    "outputFields": ["document"]
  }' 
```

</TabItem>
</Tabs>

検索操作およびクエリ操作の詳細については、[基本的なベクトル検索](./single-vector-search) および [クエリ](./get-and-scalar-query) を参照してください。
