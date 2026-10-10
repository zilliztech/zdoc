---
title: "Voyage AI | Cloud"
slug: /voyage-ai
sidebar_label: "Voyage AI"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Milvus で Voyage AI 埋め込み関数を構成して使用する方法について説明します。 | Cloud"
type: origin
token: P4KNwDdqaivEZFk7RpOcYeyhn2N
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Voyage AI

このトピックでは、Milvus で Voyage AI 埋め込み関数を構成して使用する方法について説明します。

## モデルの選択肢\{#model-choices}

Milvus は、Voyage AI が提供する埋め込みモデルをサポートしています。以下は、現在利用可能な埋め込みモデルの一覧です。

| モデル名 | 次元数 | 最大トークン数 | 説明 |
| --- | --- | --- | --- |
| `voyage-4-large` | 1024（デフォルト）、256、512、2048 | 32,000 | 汎用および多言語の検索品質が最も優れています。4 シリーズで作成されたすべての埋め込みは互いに互換性があります。詳細については、[ブログ記事](https://blog.voyageai.com/2026/01/15/voyage-4/) を参照してください。 |
| `voyage-4` | 1024（デフォルト）、256、512、2048 | 32,000 | 汎用および多言語の検索品質に最適化されています。4 シリーズで作成されたすべての埋め込みは互いに互換性があります。詳細については、[ブログ記事](https://blog.voyageai.com/2026/01/15/voyage-4/) を参照してください。 |
| `voyage-4-lite` | 1024（デフォルト）、256、512、2048 | 32,000 | レイテンシとコストに最適化されています。4 シリーズで作成されたすべての埋め込みは互いに互換性があります。詳細については、[ブログ記事](https://blog.voyageai.com/2026/01/15/voyage-4/) を参照してください。 |
| voyage-3-large | 1,024（デフォルト）、256、512、2,048 | 32,000 | 汎用および多言語の検索品質が最も優れています。 |
| voyage-3 | 1,024 | 32,000 | 汎用および多言語の検索品質に最適化されています。詳細については、[ブログ記事](https://blog.voyageai.com/2024/09/18/voyage-3/) を参照してください。 |
| voyage-3-lite | 512 | 32,000 | レイテンシとコストに最適化されています。詳細については、[ブログ記事](https://blog.voyageai.com/2024/09/18/voyage-3/) を参照してください。 |
| voyage-code-3 | 1,024（デフォルト）、256、512、2,048 | 32,000 | コード検索に最適化されています。詳細については、[ブログ記事](https://blog.voyageai.com/2024/12/04/voyage-code-3/) を参照してください。 |
| voyage-finance-2 | 1,024 | 32,000 | 金融検索および RAG に最適化されています。詳細については、[ブログ記事](https://blog.voyageai.com/2024/06/03/domain-specific-embeddings-finance-edition-voyage-finance-2/) を参照してください。 |
| voyage-law-2 | 1,024 | 16,000 | 法務検索および RAG に最適化されています。また、すべてのドメインでパフォーマンスが向上しています。詳細については、[ブログ記事](https://blog.voyageai.com/2024/04/15/domain-specific-embeddings-and-retrieval-legal-edition-voyage-law-2/) を参照してください。 |
| voyage-code-2 | 1,536 | 16,000 | コード検索に最適化されています（代替手段より 17% 優れています）。コード埋め込みの前世代です。詳細については、[ブログ記事](https://blog.voyageai.com/2024/01/23/voyage-code-2-elevate-your-code-retrieval/) を参照してください。 |

詳細については、[Text embedding models](https://docs.voyageai.com/reference/embeddings-api) を参照してください。

## 事前準備\{#before-you-start}

テキスト埋め込み関数を使用する前に、以下の前提条件を満たしていることを確認してください。

- **埋め込みモデルを選択する**

    使用する埋め込みモデルを決定します。この選択によって、埋め込みの動作と出力形式が決まります。詳細については、[埋め込みモデルを選択する](./voyage-ai#model-choices) を参照してください。

- **Voyage AI と統合して統合 ID を取得する**

    Voyage AI が提供する埋め込みモデルを使用する前に、Voyage AI とのモデルプロバイダー統合を作成し、統合 ID を取得する必要があります。詳細については、[モデルプロバイダーとの統合](./integrate-with-model-providers) を参照してください。

- **互換性のあるコレクションスキーマを設計する**

    コレクションスキーマに以下を含めるように計画します。

    - 生の入力テキスト用のテキストフィールド（`VARCHAR`）

    - データ型と次元が、選択した埋め込みモデルと一致する密ベクトルフィールド

- **挿入時と検索時に生テキストを扱う準備をする**

    テキスト埋め込み関数を有効にすると、生テキストを直接挿入およびクエリできます。埋め込みはシステムによって自動的に生成されます。

## ステップ 1: テキスト埋め込み関数を使用してコレクションを作成する\{#step-1-create-a-collection-with-a-text-embedding-function}

### スキーマフィールドを定義する\{#define-schema-fields}

埋め込み関数を使用するには、特定のスキーマを持つコレクションを作成します。このスキーマには、少なくとも次の 3 つの必須フィールドを含める必要があります。

- コレクション内の各エンティティを一意に識別する主フィールド。

- 埋め込み対象の生データを格納する `VARCHAR` フィールド。

- テキスト埋め込み関数が `VARCHAR` フィールドに対して生成する密ベクトル埋め込みを格納するために予約されたベクトルフィールド。

次の例では、テキストデータを格納するための 1 つの `VARCHAR` フィールド `"document"` と、テキスト埋め込み関数によって生成される密ベクトル埋め込みを格納するための 1 つのベクトルフィールド `"dense"` を持つスキーマを定義します。ベクトル次元（`dim`）は、選択した埋め込みモデルの出力に一致するように設定してください。

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
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=1024)
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
        .dimension(1024)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema()
schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true).
    WithIsAutoID(false),
).WithField(entity.NewField().
    WithName("document").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(9000),
).WithField(entity.NewField().
    WithName("dense").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(1024),
)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let schema = CollectionSchema::new()
        .add_field(
            FieldSchema::new()
                .name("id")
                .data_type(DataType::Int64)
                .primary_key(true),
        )
        .add_field(
            FieldSchema::new()
                .name("document")
                .data_type(DataType::VarChar)
                .max_length(9000),
        )
        .add_field(
            FieldSchema::new()
                .name("dense")
                .data_type(DataType::FloatVector)
                .dimension(1024),
        );
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <memory>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"id", milvus::DataType::INT64, "", true, false});
schema->AddField(milvus::FieldSchema("document", milvus::DataType::VARCHAR).WithMaxLength(9000));
schema->AddField(milvus::FieldSchema("dense", milvus::DataType::FLOAT_VECTOR).WithDimension(1024));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN'
});

const schema = [
  {
    name: 'id',
    data_type: DataType.Int64,
    is_primary_key: true,
    autoID: false
  },
  {
    name: 'document',
    data_type: DataType.VarChar,
    max_length: 9000
  },
  {
    name: 'dense',
    data_type: DataType.FloatVector,
    dim: 1024
  }
];
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export schema='{
  "autoID": false,
  "fields": [
    {
      "fieldName": "id",
      "dataType": "Int64",
      "isPrimary": true
    },
    {
      "fieldName": "document",
      "dataType": "VarChar",
      "elementTypeParams": {
        "max_length": 9000
      }
    },
    {
      "fieldName": "dense",
      "dataType": "FloatVector",
      "elementTypeParams": {
        "dim": 1024
      }
    }
  ]
}'
```

</TabItem>
</Tabs>

### テキスト埋め込み関数を定義する\{#define-the-text-embedding-function}

テキスト埋め込み関数は、`VARCHAR` フィールドに格納された生データを自動的に埋め込みに変換し、明示的に定義されたベクトルフィールドに格納します。

次の例では、スカラーフィールド `"document"` を埋め込みに変換し、その結果のベクトルを先に定義した `"dense"` ベクトルフィールドに格納する Function モジュール（`voya`）を追加します。

埋め込み関数を定義したら、それをコレクションスキーマに追加します。これにより、指定した埋め込み関数を使用してテキストデータから埋め込みを処理および格納するよう Milvus に指示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Define embedding function specifically for embedding model provider
text_embedding_function = Function(
    name="voya",                                  # Unique identifier for this embedding function
    function_type=FunctionType.TEXTEMBEDDING,     # Indicates a text embedding function
    input_field_names=["document"],               # Scalar field(s) containing text data to embed
    output_field_names=["dense"],                 # Vector field(s) for storing embeddings
    params={                                      # Provider-specific embedding parameters (function-level)
        "provider": "voyageai",                   # Must be set to "voyageai"
        "model_name": "voyage-3-large",                 # Specifies the embedding model to use
        # Zilliz Cloud only: "integration_id": "YOUR_INTEGRATION_ID"
        # "credential": "apikey_dev",               # Optional: Credential label specified in milvus.yaml
        # "url": "https://api.voyageai.com/v1/embeddings",     # Defaults to the official endpoint if omitted
        # "dim": "1024",                           # Output dimension of the vector embeddings after truncation
        # "truncation": "true",                    # Whether to truncate the input texts to fit within the context length. Defaults to true.
    }
)

# Add the configured embedding function to your existing collection schema
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
        .name("voya")
        .inputFieldNames(Collections.singletonList("document"))
        .outputFieldNames(Collections.singletonList("dense"))
        .param("provider", "voyageai")
        .param("model_name", "voyage-3-large")
        // Zilliz Cloud only: .param("integration_id", "YOUR_INTEGRATION_ID")
        .build();
schema.addFunction(function);
```

</TabItem>

<TabItem value='go'>

```go
// go
function := entity.NewFunction().
    WithName("voya").
    WithType(entity.FunctionTypeTextEmbedding).
    WithInputFields("document").
    WithOutputFields("dense").
    WithParam("provider", "voyageai").
    WithParam("model_name", "voyage-3-large")
// Zilliz Cloud only: function.WithParam("integration_id", "YOUR_INTEGRATION_ID")

schema.WithFunction(function)
```

</TabItem>

<TabItem value='rust'>

```rust
let function = Function::new()
    .name("voya")
    .function_type(FunctionType::TextEmbedding)
    .input_fields(["document"])
    .output_fields(["dense"])
    .param("provider", "voyageai")
    .param("model_name", "voyage-3-large");
// Zilliz Cloud only: function.param("integration_id", "YOUR_INTEGRATION_ID")

let schema = schema.add_function(function);
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::FunctionPtr function = std::make_shared<milvus::Function>("voya", milvus::FunctionType::TEXTEMBEDDING);
function->AddInputFieldName("document");
function->AddOutputFieldName("dense");
function->AddParam("provider", "voyageai");
function->AddParam("model_name", "voyage-3-large");
// Zilliz Cloud only: function->AddParam("integration_id", "YOUR_INTEGRATION_ID")

schema->AddFunction(function);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
import { FunctionType } from '@zilliz/milvus2-sdk-node';

const functions = [{
  name: 'voya',
  type: FunctionType.TEXTEMBEDDING,
  input_field_names: ['document'],
  output_field_names: ['dense'],
  params: {
    'provider': 'voyageai',
    'model_name': 'voyage-3-large'
    // Zilliz Cloud only: 'integration_id': 'YOUR_INTEGRATION_ID'
  }
}];
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export functionSchema='{
  "name": "voya",
  "type": "TextEmbedding",
  "inputFieldNames": [
    "document"
  ],
  "outputFieldNames": [
    "dense"
  ],
  "params": {
    "provider": "voyageai",
    "model_name": "voyage-3-large"
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

次に、定義したスキーマとインデックスパラメーターを使用してコレクションを作成します。

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

コレクションとインデックスを設定したら、生データを挿入する準備が整いました。このプロセスでは、生テキストを指定するだけで済みます。先に定義した Function モジュールが、各テキストエントリに対応するスパースベクトルを自動的に生成します。

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

データの挿入後、生のクエリテキストを使用してセマンティック検索を実行します。Milvus は、クエリを自動的に埋め込みベクトルに変換し、類似度に基づいて関連するドキュメントを取得して、最も一致する結果を返します。

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
