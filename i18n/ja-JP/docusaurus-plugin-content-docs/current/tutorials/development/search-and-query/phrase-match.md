---
title: "フレーズ一致 | Cloud"
slug: /phrase-match
sidebar_label: "フレーズ一致"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "フレーズ一致を使用すると、クエリ語を完全なフレーズとして含むドキュメントを検索できます。デフォルトでは、単語は同じ順序で、互いに隣接して出現する必要があります。たとえば、\"robotics machine learning\" というクエリは、\"…typical robotics machine learning models…\" のようなテキストに一致します。これは、\"robotics\"、\"machine\"、\"learning\" という単語が、間に他の単語を挟まずに連続して出現しているためです。 | Cloud"
type: origin
token: O2YiwLai5iSjT1k1WEsc06E8nEe
sidebar_position: 16
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# フレーズ一致

フレーズ一致を使用すると、クエリ語を完全なフレーズとして含むドキュメントを検索できます。デフォルトでは、単語は同じ順序で、互いに隣接して出現する必要があります。たとえば、**"robotics machine learning"** というクエリは、*"…typical robotics machine learning models…"* のようなテキストに一致します。これは、**"robotics"**、**"machine"**、**"learning"** という単語が、間に他の単語を挟まずに連続して出現しているためです。

ただし、実際のシナリオでは、厳密なフレーズ一致は硬直的すぎることがあります。たとえば、*"…machine learning models widely adopted in robotics…"* のようなテキストにも一致させたい場合があります。この場合、同じキーワードは存在しますが、隣接しておらず、元の順序でもありません。これに対応するため、フレーズ一致は `slop` パラメーターをサポートしており、柔軟性を導入できます。`slop` の値は、フレーズ内の語の間で許可される位置のずれの数を定義します。たとえば、`slop` が 1 の場合、**"machine learning"** というクエリは *"...machine deep learning..."* のようなテキストにも一致できます。これは、元の語の間に 1 語（**"deep"**）が入っているためです。

## Overview\{#overview}

[Tantivy](https://github.com/quickwit-oss/tantivy) 検索エンジンライブラリを基盤として、フレーズ一致はドキュメント内の単語の位置情報を解析して機能します。以下の図はこのプロセスを示しています。

![AFrdwVT8ChT11ibs9lpcuN7onZc](https://zdoc-images.s3.us-west-2.amazonaws.com/AFrdwVT8ChT11ibs9lpcuN7onZc.png)

1. **ドキュメントのトークン化**: ドキュメントを Zilliz Cloud に挿入すると、テキストは analyzer によってトークン（個々の単語または語句）に分割され、各トークンの位置情報が記録されます。たとえば、**doc_1** は **["machine" (pos=0), "learning" (pos=1), "boosts" (pos=2), "efficiency" (pos=3)]** にトークン化されます。analyzer の詳細については、[Analyzer Overview](./analyzer-overview) を参照してください。

1. **転置インデックスの作成**: Zilliz Cloud は転置インデックスを構築し、各トークンを、そのトークンが出現するドキュメントと、そのドキュメント内でのトークン位置に対応付けます。

1. **フレーズ一致**: フレーズクエリが実行されると、Zilliz Cloud は転置インデックス内で各トークンを検索し、それらの位置を確認して、正しい順序と近接性で出現しているかを判断します。`slop` パラメーターは、一致するトークン間で許可される最大位置数を制御します。

    - **slop = 0** は、トークンが **完全に同じ順序で、かつ隣接して** 出現する必要があることを意味します（つまり、間に余分な単語は入れられません）。

        - この例では、**doc_1** のみ（**"machine"** が **pos=0**、**"learning"** が **pos=1**）が完全一致します。

    - **slop = 2** は、一致するトークン間で最大 2 位置までの柔軟性または並び替えを許可します。

        - これにより、逆順（**"learning machine"**）や、トークン間の小さなギャップが許可されます。

        - その結果、**doc_1**、**doc_2**（**"learning"** が **pos=0**、**"machine"** が **pos=1**）、および **doc_3**（**"learning"** が **pos=1**、**"machine"** が **pos=2**）のすべてが一致します。

## フレーズ一致を有効にする\{#enable-phrase-match}

フレーズ一致は、Zilliz Cloud の文字列データ型である `VARCHAR` フィールド型で機能します。

フレーズ一致を有効にするには、collection スキーマで `enable_analyzer` と `enable_match` の両方のパラメーターを `True` に設定します。この設定により、テキストがトークン化され、位置情報を含む転置インデックスが構築されるため、効率的なフレーズ検索が可能になります。

### スキーマフィールドを定義する\{#define-schema-fields}

特定の `VARCHAR` フィールドでフレーズ一致を有効にするには、フィールドスキーマを定義する際に `enable_analyzer` と `enable_match` の両方を `True` に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# Set up a MilvusClient
CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN" 

client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

# Create a schema for a new collection
schema = client.create_schema(enable_dynamic_field=False)

# Add a primary key field
schema.add_field(
    field_name="id",
    datatype=DataType.INT64,
    is_primary=True,
    auto_id=True
)

# Add a VARCHAR field configured for phrase matching
schema.add_field(
    field_name="text",                  # Name of the field
    # highlight-next-line
    datatype=DataType.VARCHAR,          # Field data type set as VARCHAR (string)
    max_length=1000,                    # Maximum string length
    # highlight-start
    enable_analyzer=True,               # Required. Enables text analysis
    enable_match=True,                  # Required. Enables inverted indexing for phrase matching
    # highlight-end
    # Optional: Use a custom analyzer for better phrase matching in specific languages.
    # analyzer_params = {"type": "english"}     # Example: English analyzer; uncomment to apply custom analyzer
)

# Add a vector field for embeddings
schema.add_field(
    field_name="embeddings",
    datatype=DataType.FLOAT_VECTOR,
    dim=5
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .build();
schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .enableAnalyzer(true)
        .enableMatch(true)
        // Optional: Use a custom analyzer for better phrase matching in specific languages.
        // .analyzerParams(Map.of("type", "english"))     // Example: English analyzer; uncomment to apply custom analyzer
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("embeddings")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Set up a MilvusClient
const address = "YOUR_CLUSTER_ENDPOINT"
const token = "YOUR_CLUSTER_TOKEN"

const client = new MilvusClient({address, token})

const schema = {
  collection_name: 'tech_articles',
  fields: [
    {
      name: "id",
      description: "primary id",
      data_type: DataType.Int64,
      is_primary_key: true,
      autoID: true,
    },
    {
      name: "text",
      description: "text field for phrase matching",
      data_type: DataType.VarChar,
      max_length: 1000,
      enable_analyzer: true, // Enables text analysis
      enable_match: true,    // Enables inverted indexing for
    },
    {
      name: "embeddings",
      description: "vector field",
      data_type: DataType.FloatVector,
      dim: 5,
    },
  ],
};
```

</TabItem>

<TabItem value='go'>

```go
import (
     "github.com/milvus-io/milvus/client/v2/entity"
)

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
APIKey := "YOUR_API_KEY"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey: APIKey
})

schema := entity.NewSchema().WithName(collectionName).
        WithField(entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
        WithField(entity.NewField().WithName("text").WithDataType(entity.FieldTypeVarChar).WithMaxLength(1000).WithEnableMatch(true).WithEnableAnalyzer(true)).
        WithField(entity.NewField().WithName("embeddings").WithDataType(entity.FieldTypeFloatVector).WithDim(5))
```

</TabItem>

<TabItem value='bash'>

```bash
export idField='{
  "fieldName": "id",
  "dataType": "Int64",
  "isPrimary": true,
  "autoID": true
}'

export textField='{
  "fieldName": "text",
  "dataType": "VarChar",
  "elementTypeParams": {
    "max_length": 1000,
    "enable_analyzer": true,
    "enable_match": true
  }
}'

export vectorField='{
  "fieldName": "embeddings",
  "dataType": "FloatVector",
  "elementTypeParams": {
    "dim": 5
  }
}'

export schema="{
  \"autoID\": false,
  \"enableDynamicField\": true,
  \"fields\": [
    $idField,
    $textField,
    $vectorField
  ]
}"
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

const std::string address = "YOUR_CLUSTER_ENDPOINT";
const std::string token = "YOUR_CLUSTER_TOKEN";

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{address, token};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField(milvus::FieldSchema("id", milvus::DataType::VARCHAR, "", true, true).WithMaxLength(100));
schema->AddField(milvus::FieldSchema("dense_vector", milvus::DataType::FLOAT_VECTOR).WithDimension(4));
```

</TabItem>
</Tabs>

デフォルトでは、Zilliz Cloud は [standard](./standard-analyzer) [analyzer](./standard-analyzer) を使用します。これは、空白や句読点でテキストをトークン化し、テキストを小文字に変換します。

テキストデータが特定の言語や形式である場合は、`analyzer_params` パラメーターを使用してカスタム analyzer を設定できます（たとえば `{ "type": "english" }` や `{ "type": "jieba" }`）。

詳細については、[Analyzer Overview](./analyzer-overview) を参照してください。

### collection を作成する\{#create-the-collection}

必要なフィールドを定義したら、次のコードを使用して collection を作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Create the collection
COLLECTION_NAME = "tech_articles" # Name your collection

if client.has_collection(COLLECTION_NAME):
    client.drop_collection(COLLECTION_NAME)

client.create_collection(
    collection_name=COLLECTION_NAME,
    schema=schema
)
```

</TabItem>

<TabItem value='java'>

```java
String COLLECTION_NAME = "tech_articles"; // Name your collection

if (client.hasCollection(
        HasCollectionReq.builder()
            .collectionName(COLLECTION_NAME)
            .build()
    )) {
    client.dropCollection(
        DropCollectionReq.builder()
            .collectionName(COLLECTION_NAME)
            .build()
    );
}

client.createCollection(
    CreateCollectionReq.builder()
        .collectionName(COLLECTION_NAME)
        .collectionSchema(schema)
        .build()
);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Create or recreate the collection if it already exists
const COLLECTION_NAME = "tech_articles"; // Name your collection

const hasCollection = await client.hasCollection({ collection_name: COLLECTION_NAME });

if (hasCollection.value) {
    await client.dropCollection({ collection_name: COLLECTION_NAME });
}

await client.createCollection(schema);
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
# check collection exist
export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export COLLECTION_NAME="tech_articles"
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/has" \
  -H "Content-Type: application/json" \
  -H "Request-Timeout: 10" \
  -d "{
    \"collectionName\": \"$COLLECTION_NAME\"
  }"

# drop existing collection
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/collections/drop" \
  -H "Content-Type: application/json" \
  -H "Request-Timeout: 10" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\"
  }"
  
# create new collection
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
--data "{
    \"collectionName\": \"$COLLECTION_NAME\",
    \"schema\": $schema
}"  
```

</TabItem>

<TabItem value='c++'>

```c++
const auto collection_name = "tech_articles";

milvus::HasCollectionResponse response;
auto status = client->HasCollection(milvus::HasCollectionRequest().WithCollectionName(collection_name), response);
if (response.Has()) {
    status = client->DropCollection(milvus::DropCollectionRequest().WithCollectionName(collection_name));
}

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                    .WithCollectionName(collection_name)
                                    .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

collection を作成した後、[フレーズ一致を使用する](./phrase-match#use-phrase-match) 前に、以下の必要な手順が実行されていることを確認してください。

- エンティティが collection に挿入されていること。

- 各 vector フィールドに対して index が作成されていること。

- collection がメモリにロードされていること。

<details>

<summary>コード例を表示</summary>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Insert sample data with text containing "machine learning" phrases
sample_data = [
    {
        "text": "Machine learning is a subset of artificial intelligence that focuses on algorithms.",
        "embeddings": [0.1, 0.2, 0.3, 0.4, 0.5]
    },
    {
        "text": "Deep learning machine algorithms require large datasets for training.",
        "embeddings": [0.2, 0.3, 0.4, 0.5, 0.6]
    },
    {
        "text": "The machine learning model showed excellent performance on the test set.",
        "embeddings": [0.3, 0.4, 0.5, 0.6, 0.7]
    },
    {
        "text": "Natural language processing and machine learning go hand in hand.",
        "embeddings": [0.4, 0.5, 0.6, 0.7, 0.8]
    },
    {
        "text": "This article discusses various learning machine techniques and applications.",
        "embeddings": [0.5, 0.6, 0.7, 0.8, 0.9]
    }
]

# Insert the data
client.insert(
    collection_name=COLLECTION_NAME,
    data=sample_data
)

# Index the vector field and load the collection
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="embeddings",
    index_type="AUTOINDEX",
    index_name="embeddings_index",
    metric_type="COSINE"
)

client.create_index(collection_name=COLLECTION_NAME, index_params=index_params)

client.load_collection(collection_name=COLLECTION_NAME)
```

</TabItem>

<TabItem value='java'>

```java
// Insert sample data with text containing "machine learning" phrases
List<JsonObject> sampleData = Arrays.asList(
    createSample("Machine learning is a subset of artificial intelligence that focuses on algorithms.", new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f}),
    createSample("Deep learning machine algorithms require large datasets for training.", new float[]{0.2f, 0.3f, 0.4f, 0.5f, 0.6f}),
    createSample("The machine learning model showed excellent performance on the test set.", new float[]{0.3f, 0.4f, 0.5f, 0.6f, 0.7f}),
    createSample("Natural language processing and machine learning go hand in hand.", new float[]{0.4f, 0.5f, 0.6f, 0.7f, 0.8f}),
    createSample("This article discusses various learning machine techniques and applications.", new float[]{0.5f, 0.6f, 0.7f, 0.8f, 0.9f})
);

client.insert(InsertReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(sampleData)
        .build());

// Index the vector field and load the collection
IndexParam indexParam = IndexParam.builder()
        .fieldName("embeddings")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .indexName("embeddings_index")
        .metricType(IndexParam.MetricType.COSINE)
        .build();

client.createIndex(CreateIndexReq.builder()
        .collectionName(COLLECTION_NAME)
        .indexParams(Collections.singletonList(indexParam))
        .build());

client.loadCollection(LoadCollectionReq.builder()
        .collectionName(COLLECTION_NAME)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Format and insert sample data for "machine learning" phrase matching
const sampleData = [
    {
        text: "Machine learning is a subset of artificial intelligence that focuses on algorithms.",
        embeddings: [0.1, 0.2, 0.3, 0.4, 0.5],
    },
    {
        text: "Deep learning machine algorithms require large datasets for training.",
        embeddings: [0.2, 0.3, 0.4, 0.5, 0.6],
    },
    {
        text: "The machine learning model showed excellent performance on the test set.",
        embeddings: [0.3, 0.4, 0.5, 0.6, 0.7],
    },
    {
        text: "Natural language processing and machine learning go hand in hand.",
        embeddings: [0.4, 0.5, 0.6, 0.7, 0.8],
    },
    {
        text: "This article discusses various learning machine techniques and applications.",
        embeddings: [0.5, 0.6, 0.7, 0.8, 0.9],
    },
];

// Insert the data into the collection
await client.insert({
    collection_name: COLLECTION_NAME,
    data: sampleData,
});

// Create an index on the vector field and load the collection
await client.createIndex({
    collection_name: COLLECTION_NAME,
    field_name: "embeddings",
    index_type: "AUTOINDEX",
    index_name: "embeddings_index",
    metric_type: "COSINE",
});

await client.loadCollection({
    collection_name: COLLECTION_NAME,
});
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
# Insert the data into the collection
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/insert" \
  -H "Content-Type: application/json" \
  -H "Request-Timeout: 10" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "tech_articles",
    "data": [
      {
        "text": "Machine learning is a subset of artificial intelligence that focuses on algorithms.",
        "embeddings": [0.1, 0.2, 0.3, 0.4, 0.5]
      },
      {
        "text": "Deep learning machine algorithms require large datasets for training.",
        "embeddings": [0.2, 0.3, 0.4, 0.5, 0.6]
      },
      {
        "text": "The machine learning model showed excellent performance on the test set.",
        "embeddings": [0.3, 0.4, 0.5, 0.6, 0.7]
      },
      {
        "text": "Natural language processing and machine learning go hand in hand.",
        "embeddings": [0.4, 0.5, 0.6, 0.7, 0.8]
      },
      {
        "text": "This article discusses various learning machine techniques and applications.",
        "embeddings": [0.5, 0.6, 0.7, 0.8, 0.9]
      }
    ]
  }'
# Create an index on the vector field and load the collection
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/indexes/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "Request-Timeout: 10" \
  -d '{
    "collectionName": "tech_articles",
    "indexParams": [
      {
        "fieldName": "embeddings",
        "indexName": "embeddings_index",
        "metricType": "COSINE",
        "indexType": "AUTOINDEX"
      }
    ]
  }'
    
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/load" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "Request-Timeout: 10" \
  -d '{
    "collectionName": "tech_articles"
  }'
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::EntityRows data = {
    {{"text", "Machine learning is a subset of artificial intelligence that focuses on algorithms."}, {"embeddings", std::vector<float>{0.1, 0.2, 0.3, 0.4, 0.5}}},
    {{"text", "Deep learning machine algorithms require large datasets for training."}, {"embeddings", std::vector<float>{0.2, 0.3, 0.4, 0.5, 0.6}}},
    {{"text", "The machine learning model showed excellent performance on the test set.", std::vector<float>{0.3, 0.4, 0.5, 0.6, 0.7}}},
    {{"text", "Natural language processing and machine learning go hand in hand."}, {"embeddings", std::vector<float>{0.4, 0.5, 0.6, 0.7, 0.8}}},
    {{"text", "This article discusses various learning machine techniques and applications."}, {"embeddings", std::vector<float>{0.5, 0.6, 0.7, 0.8, 0.9}}}
};

milvus::InsertResponse response;
auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName(collection_name)
                                .WithRowsData(std::move(data))
                                , response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::IndexDesc index_vector("embeddings", "embeddings_index", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE);
status = client->CreateIndex(milvus::CreateIndexRequest()
                                    .WithCollectionName(collection_name)
                                    .AddIndex(std::move(index_vector)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->LoadCollection(milvus::LoadCollectionRequest().WithCollectionName(collection_name));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

</details>

## フレーズ一致を使用する\{#use-phrase-match}

コレクションスキーマで `VARCHAR` フィールドに対してマッチを有効にすると、`PHRASE_MATCH` 式を使用してフレーズ一致を実行できます。

<Admonition type="info" icon="📘" title="注意">

`PHRASE_MATCH` 式は大文字と小文字を区別しません。`PHRASE_MATCH` と `phrase_match` のどちらも使用できます。

</Admonition>

### PHRASE_MATCH 式の構文\{#phrasematch-expression-syntax}

`PHRASE_MATCH` 式を使用して、検索時のフィールド、フレーズ、および任意の柔軟性 (`slop`) を指定します。構文は次のとおりです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
PHRASE_MATCH(field_name, phrase, slop)
```

</TabItem>

<TabItem value='java'>

```java
String filter = "PHRASE_MATCH(text, 'machine learning')";
```

</TabItem>

<TabItem value='javascript'>

```javascript
PHRASE_MATCH(field_name, phrase, slop)
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export filter = "PHRASE_MATCH(field_name, phrase, slop)"
```

</TabItem>

<TabItem value='c++'>

```c++
const auto filter = R"(PHRASE_MATCH(text, 'machine learning'))";
```

</TabItem>
</Tabs>

- `field_name`**:** フレーズ一致を実行する `VARCHAR` フィールドの名前。

- `phrase`**:** 検索する完全一致のフレーズ。

- `slop` (optional)**:** 一致するトークン間で許可される最大位置数を指定する整数。

    - `0` (default): 完全一致のフレーズのみ一致します。例: **"machine learning"** のフィルターは **"machine learning"** には完全一致しますが、**"machine boosts learning"** や **"learning machine"** には一致しません。

    - `1`: 1つの追加語や軽微な位置のずれなど、小さな変動を許可します。例: **"machine learning"** のフィルターは **"machine boosts learning"**（**"machine"** と **"learning"** の間に1トークン）には一致しますが、**"learning machine"**（語順が逆）には一致しません。

    - `2`: 語順の逆転や、間に最大2トークンが入るケースなど、より高い柔軟性を許可します。例: **"machine learning"** のフィルターは **"learning machine"**（語順が逆）や **"machine quickly boosts learning"**（**"machine"** と **"learning"** の間に2トークン）に一致します。

### フレーズ一致でクエリを実行する\{#query-with-phrase-match}

`query()` メソッドを使用する場合、**PHRASE_MATCH** はスカラーフィルターとして機能します。指定したフレーズ（許可された slop の範囲内）を含むドキュメントのみが返されます。

#### 例: slop = 0（完全一致）\{#example-slop-0-exact-match}

この例では、間に余分なトークンを含まない完全なフレーズ **"machine learning"** を含むドキュメントを返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Match documents containing exactly "machine learning"
filter = "PHRASE_MATCH(text, 'machine learning')"

result = client.query(
    collection_name=COLLECTION_NAME,
    # highlight-next-line
    filter=filter,
    output_fields=["id", "text"]
)

print("Query result: ", result)

# Expected output:
# Query result:  data: ["{'id': 461366973343948097, 'text': 'Machine learning is a subset of artificial intelligence that focuses on algorithms.'}", "{'id': 461366973343948099, 'text': 'The machine learning model showed excellent performance on the test set.'}", "{'id': 461366973343948100, 'text': 'Natural language processing and machine learning go hand in hand.'}"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "PHRASE_MATCH(text, 'machine learning')";
QueryResp result = client.query(QueryReq.builder()
        .collectionName(COLLECTION_NAME)
        .filter(filter)
        .outputFields(Arrays.asList("id", "text"))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = "PHRASE_MATCH(text, 'machine learning')";

const result = await client.query({
    collection_name: COLLECTION_NAME,
    filter: filter,
    output_fields: ["id", "text"]
});
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "Request-Timeout: 10" \
  -d '{
    "collectionName": "tech_articles",
    "filter": "PHRASE_MATCH(text, '\''machine learning'\'')",
    "outputFields": ["id", "text"],
    "limit": 100
  }'
```

</TabItem>

<TabItem value='c++'>

```c++
const auto filter = R"(PHRASE_MATCH(text, 'machine learning'))";

auto request = milvus::QueryRequest()
                       .WithCollectionName(collection_name)
                       .WithFilter(filter)
                       .AddOutputField("id")
                       .AddOutputField("text")
                       .WithLimit(100);

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### フレーズ一致で検索する\{#search-with-phrase-match}

検索操作では、**PHRASE_MATCH** はベクトル類似度ランキングを適用する前にドキュメントを事前フィルタリングするために使用されます。この2段階アプローチでは、まずテキスト一致によって候補セットを絞り込み、その後ベクトル埋め込みに基づいて候補を再ランキングします。

#### 例: slop = 1\{#example-slop-1}

ここでは、slop を 1 に設定しています。フィルターは、わずかな柔軟性を持ってフレーズ **"learning machine"** を含むドキュメントに適用されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Example: Filter documents containing "learning machine" with slop=1
filter_slop1 = "PHRASE_MATCH(text, 'learning machine', 1)"

result_slop1 = client.search(
    collection_name=COLLECTION_NAME,
    anns_field="embeddings",
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],
    # highlight-next-line
    filter=filter_slop1,
    search_params={},
    limit=10,
    output_fields=["id", "text"]
)

print("Slop 1 result: ", result_slop1)

# Expected output:
# Slop 1 result:  data: [[{'id': 461366973343948098, 'distance': 0.9949367046356201, 'entity': {'text': 'Deep learning machine algorithms require large datasets for training.', 'id': 461366973343948098}}, {'id': 461366973343948101, 'distance': 0.9710607528686523, 'entity': {'text': 'This article discusses various learning machine techniques and applications.', 'id': 461366973343948101}}]]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

String filterSlop1 = "PHRASE_MATCH(text, 'learning machine', 1)";
List<Float> queryVector = Arrays.asList(0.1f, 0.2f, 0.3f, 0.4f, 0.5f);

SearchResp resultSlop1 = client.search(SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .annsField("embeddings")
        .data(Collections.singletonList(queryVector))
        .filter(filterSlop1)
        .searchParams(Collections.emptyMap())
        .topK(10)
        .outputFields(Arrays.asList("id", "text"))
        .build());
        
System.out.println("Slop 1 result: " + resultSlop1);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter_slop1 = "PHRASE_MATCH(text, 'learning machine', 1)";

const result_slop1 = await client.search({
  collection_name: COLLECTION_NAME,
  anns_field: "embeddings",
  data: [0.1, 0.2, 0.3, 0.4, 0.5],
  filter: filter_slop1,
  limit: 10,
  output_fields: ["id", "text"],
});
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export COLLECTION_NAME="tech_articles"
export AUTH_TOKEN="your_token_here"

# Search data
echo "Searching with PHRASE_MATCH filter (slop=1)..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Request-Timeout: 10" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"annsField\": \"embeddings\",
    \"data\": [[0.1, 0.2, 0.3, 0.4, 0.5]],
    \"filter\": \"PHRASE_MATCH(text, 'learning machine', 1)\",
    \"searchParams\": {},
    \"limit\": 10,
    \"outputFields\": [\"id\", \"text\"]
  }"
```

</TabItem>

<TabItem value='c++'>

```c++
const auto filter = R"(PHRASE_MATCH(text, 'learning machine', 1))";

std::vector<float> query_vector = {0.1, 0.2, 0.3, 0.4, 0.5};
auto request = milvus::SearchRequest()
                   .WithCollectionName(collection_name)
                   .WithAnnsField("embeddings")
                   .WithFilter(filter)
                   .WithLimit(10)
                   .AddOutputField("id")
                   .AddOutputField("text")
                   .AddFloatVector(query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

#### 例: slop = 2\{#example-slop-2}

この例では slop を 2 に設定しており、**"machine"** と **"learning"** の間に最大2つの追加トークン（または語順の逆転）が許可されることを意味します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Example: Filter documents containing "machine learning" with slop=2
filter_slop2 = "PHRASE_MATCH(text, 'machine learning', 2)"

result_slop2 = client.search(
    collection_name=COLLECTION_NAME,
    anns_field="embeddings",             # Vector field name
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],                 # Query vector
    # highlight-next-line
    filter=filter_slop2,                 # Filter expression
    search_params={},
    limit=10,                            # Maximum results to return
    output_fields=["id", "text"]
)

print("Slop 2 result: ", result_slop2)

# Expected output:
# Slop 2 result:  data: [[{'id': 461366973343948097, 'distance': 0.9999999403953552, 'entity': {'text': 'Machine learning is a subset of artificial intelligence that focuses on algorithms.', 'id': 461366973343948097}}, {'id': 461366973343948098, 'distance': 0.9949367046356201, 'entity': {'text': 'Deep learning machine algorithms require large datasets for training.', 'id': 461366973343948098}}, {'id': 461366973343948099, 'distance': 0.9864400029182434, 'entity': {'text': 'The machine learning model showed excellent performance on the test set.', 'id': 461366973343948099}}, {'id': 461366973343948100, 'distance': 0.9782319068908691, 'entity': {'text': 'Natural language processing and machine learning go hand in hand.', 'id': 461366973343948100}}, {'id': 461366973343948101, 'distance': 0.9710607528686523, 'entity': {'text': 'This article discusses various learning machine techniques and applications.', 'id': 461366973343948101}}]]
```

</TabItem>

<TabItem value='java'>

```java
// Example: Filter documents containing "machine learning" with slop=2
String filterSlop2 = "PHRASE_MATCH(text, 'machine learning', 2)";

SearchReq searchReqSlop2 = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .annsField("embeddings")             // Vector field name
        .data(queryVector)                   // Query vector
        // highlight-next-line
        .filter(filterSlop2)                 // Filter expression
        .searchParams(new HashMap<>())
        .topK(10)                            // Maximum results to return
        .outputFields(Arrays.asList("id", "text"))
        .build();

SearchResp resultSlop2 = client.search(searchReqSlop2);

System.out.println("Slop 2 result: " + resultSlop2);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter_slop2 = "PHRASE_MATCH(text, 'learning machine', 2)";

const result_slop2 = await client.search({
  collection_name: COLLECTION_NAME,
  anns_field: "embeddings",
  data: [0.1, 0.2, 0.3, 0.4, 0.5],
  filter: filter_slop2,
  limit: 10,
  output_fields: ["id", "text"],
});
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
#restful
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Request-Timeout: 10" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"annsField\": \"embeddings\",
    \"data\": [[0.1, 0.2, 0.3, 0.4, 0.5]],
    \"filter\": \"PHRASE_MATCH(text, 'machine learning', 2)\",
    \"searchParams\": {},
    \"limit\": 10,
    \"outputFields\": [\"id\", \"text\"]
  }"
```

</TabItem>

<TabItem value='c++'>

```c++
const auto filter = R"(PHRASE_MATCH(text, 'machine learning', 2))";

std::vector<float> query_vector = {0.1, 0.2, 0.3, 0.4, 0.5};
auto request = milvus::SearchRequest()
                   .WithCollectionName(collection_name)
                   .WithAnnsField("embeddings")
                   .WithFilter(filter)
                   .WithLimit(10)
                   .AddOutputField("id")
                   .AddOutputField("text")
                   .AddFloatVector(query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

#### 例: slop = 3\{#example-slop-3}

この例では、slop を 3 に設定することでさらに高い柔軟性を提供します。フィルターは、単語間に最大3つのトークン位置を許可して **"machine learning"** を検索します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Example: Filter documents containing "machine learning" with slop=3
filter_slop3 = "PHRASE_MATCH(text, 'machine learning', 3)"

result_slop3 = client.search(
    collection_name=COLLECTION_NAME,
    anns_field="embeddings",             # Vector field name
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],                 # Query vector
    # highlight-next-line
    filter=filter_slop3,                 # Filter expression
    search_params={},
    limit=10,                            # Maximum results to return
    output_fields=["id", "text"]
)

print("Slop 3 result: ", result_slop3)

# Expected output:
# Slop 3 result:  data: [[{'id': 461366973343948097, 'distance': 0.9999999403953552, 'entity': {'text': 'Machine learning is a subset of artificial intelligence that focuses on algorithms.', 'id': 461366973343948097}}, {'id': 461366973343948098, 'distance': 0.9949367046356201, 'entity': {'text': 'Deep learning machine algorithms require large datasets for training.', 'id': 461366973343948098}}, {'id': 461366973343948099, 'distance': 0.9864400029182434, 'entity': {'text': 'The machine learning model showed excellent performance on the test set.', 'id': 461366973343948099}}, {'id': 461366973343948100, 'distance': 0.9782319068908691, 'entity': {'text': 'Natural language processing and machine learning go hand in hand.', 'id': 461366973343948100}}, {'id': 461366973343948101, 'distance': 0.9710607528686523, 'entity': {'text': 'This article discusses various learning machine techniques and applications.', 'id': 461366973343948101}}]]
```

</TabItem>

<TabItem value='java'>

```java
// Example: Filter documents containing "machine learning" with slop=3
String filterSlop3 = String.format("PHRASE_MATCH(text, '%s', %d)", "machine learning", 3);

SearchResp resultSlop3 = client.search(
    SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .annsField("embeddings") // Vector field name
        .data(queryVector)       // Query vector
        .filter(filterSlop3)     // Filter expression
        .searchParams(new HashMap<>())
        .topK(10)                // Maximum results to return
        .outputFields(Arrays.asList("id", "text"))
        .build()
);

System.out.printf("Slop 3 result: %s%n", resultSlop3);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter_slop3 = "PHRASE_MATCH(text, 'learning machine', 3)";

const result_slop3 = await client.search({
  collection_name: COLLECTION_NAME,
  anns_field: "embeddings",
  data: [0.1, 0.2, 0.3, 0.4, 0.5],
  filter: filter_slop3,
  limit: 10,
  output_fields: ["id", "text"],
});
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Request-Timeout: 10" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"annsField\": \"embeddings\",
    \"data\": [[0.1, 0.2, 0.3, 0.4, 0.5]],
    \"filter\": \"PHRASE_MATCH(text, 'machine learning', 3)\",
    \"searchParams\": {},
    \"limit\": 10,
    \"outputFields\": [\"id\", \"text\"]
  }"
```

</TabItem>

<TabItem value='c++'>

```c++
const auto filter = R"(PHRASE_MATCH(text, 'machine learning', 3))";

std::vector<float> query_vector = {0.1, 0.2, 0.3, 0.4, 0.5};
auto request = milvus::SearchRequest()
                   .WithCollectionName(collection_name)
                   .WithAnnsField("embeddings")
                   .WithFilter(filter)
                   .WithLimit(10)
                   .AddOutputField("id")
                   .AddOutputField("text")
                   .AddFloatVector(query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## 考慮事項\{#considerations}

- フィールドに対してフレーズ一致を有効にすると、inverted index が作成され、ストレージリソースを消費します。この機能を有効にするかどうかを判断する際は、ストレージへの影響を考慮してください。影響は、テキストサイズ、一意のトークン数、使用する analyzer によって異なります。

- スキーマで analyzer を定義すると、その設定はその collection に対して永続的になります。別の analyzer の方が要件に適していると判断した場合は、既存の collection を削除し、必要な analyzer 設定で新しい collection を作成することを検討してください。

- フレーズ一致のパフォーマンスは、テキストがどのようにトークン化されるかに依存します。analyzer を collection 全体に適用する前に、`run_analyzer` メソッドを使用してトークン化の出力を確認してください。詳細については、[Analyzer の概要](./analyzer-overview) を参照してください。

- `filter` 式におけるエスケープ規則:

    - 式内でダブルクォートまたはシングルクォートで囲まれた文字列は、文字列定数として解釈されます。文字列定数にエスケープ文字が含まれる場合、それらのエスケープ文字はエスケープシーケンスで表現する必要があります。たとえば、`\` を表すには `\\`、タブ `\t` を表すには `\\t`、改行を表すには `\\n` を使用します。

    - 文字列定数がシングルクォートで囲まれている場合、定数内のシングルクォートは `\\'` として表現する必要があります。一方、ダブルクォートは `"` または `\\"` のいずれかで表現できます。例: `'It\\'s milvus'`。

    - 文字列定数がダブルクォートで囲まれている場合、定数内のダブルクォートは `\\"` として表現する必要があります。一方、シングルクォートは `'` または `\\'` のいずれかで表現できます。例: `"He said \\"Hi\\""`。

