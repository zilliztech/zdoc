---
title: "Cohere | Cloud"
slug: /cohere
sidebar_label: "Cohere"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Milvus で Cohere の埋め込み関数を設定して使用する方法について説明します。 | Cloud"
type: origin
token: WVaVw8J7UiYZ52kaqVUcktqAnAf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Cohere

このトピックでは、Milvus で Cohere の埋め込み関数を設定して使用する方法について説明します。

## モデルの選択\{#model-choices}

Milvus は Cohere が提供する埋め込みモデルをサポートしています。以下は、現在利用可能な埋め込みモデルの一覧です。

| モデル名 | 次元数 | 最大トークン数 | 説明 |
| --- | --- | --- | --- |
| embed-english-v3.0 | 1,024 | 512 | テキストを分類したり埋め込みに変換したりできるモデルです。英語のみ。 |
| embed-multilingual-v3.0 | 1,024 | 512 | 多言語の分類と埋め込みをサポートします。[サポートされている言語はこちら](https://docs.cohere.com/docs/supported-languages)。 |
| embed-english-light-v3.0 | 384 | 512 | `embed-english-v3.0` のより小型で高速なバージョンです。性能はほぼ同等ですが、はるかに高速です。英語のみ。 |
| embed-multilingual-light-v3.0 | 384 | 512 | `embed-multilingual-v3.0` のより小型で高速なバージョンです。性能はほぼ同等ですが、はるかに高速です。複数言語をサポートします。 |
| embed-english-v2.0 | 4,096 | 512 | テキストを分類したり埋め込みに変換したりできる旧世代の埋め込みモデルです。英語のみ。 |
| embed-english-light-v2.0 | 1,024 | 512 | embed-english-v2.0 のより小型で高速なバージョンです。性能はほぼ同等ですが、はるかに高速です。英語のみ。 |
| embed-multilingual-v2.0 | 768 | 256 | 多言語の分類と埋め込みをサポートします。[サポートされている言語はこちら](https://docs.cohere.com/docs/supported-languages)。 |

詳細については、[Cohere's Embed Models](https://docs.cohere.com/docs/cohere-embed) を参照してください。

## 始める前に\{#before-you-start}

テキスト埋め込み関数を使用する前に、次の前提条件を満たしていることを確認してください。

- **埋め込みモデルを選択する**

    使用する埋め込みモデルを決定してください。この選択によって、埋め込みの動作と出力形式が決まります。詳細は [埋め込みモデルを選択する](./cohere#model-choices) を参照してください。

- **Cohere と統合し、integration ID を取得する**

    Cohere を使用したモデルプロバイダー統合を作成し、その埋め込みモデルを使用する前に integration ID を取得する必要があります。詳細は [Integrate with Model Providers](./integrate-with-model-providers) を参照してください。

- **互換性のあるコレクションスキーマを設計する**

    コレクションスキーマには、次の項目を含めるように計画してください。

    - 生の入力テキスト用のテキストフィールド（`VARCHAR`）

    - 選択した埋め込みモデルに一致するデータ型と次元を持つ密ベクトルフィールド

- **挿入時と検索時に生テキストを扱う準備をする**

    テキスト埋め込み関数を有効にすると、生テキストを直接挿入およびクエリできます。埋め込みはシステムによって自動的に生成されます。

## ステップ 1: テキスト埋め込み関数を使用してコレクションを作成する\{#step-1-create-a-collection-with-a-text-embedding-function}

### スキーマフィールドを定義する\{#define-schema-fields}

埋め込み関数を使用するには、特定のスキーマを持つコレクションを作成します。このスキーマには、少なくとも次の 3 つの必須フィールドを含める必要があります。

- コレクション内の各エンティティを一意に識別する主フィールド。

- 埋め込み対象の生データを格納する `VARCHAR` フィールド。

- テキスト埋め込み関数が `VARCHAR` フィールドに対して生成する密ベクトル埋め込みを格納するために予約されたベクトルフィールド。

次の例では、テキストデータを格納するための 1 つのスカラーフィールド `"document"` と、Function モジュールによって生成される埋め込みを格納するための 1 つのベクトルフィールド `"dense"` を持つスキーマを定義しています。ベクトルの次元（`dim`）は、選択した埋め込みモデルの出力に一致するように設定してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='javascript'>

```javascript
// nodejs
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
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

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
</Tabs>

### テキスト埋め込み関数を定義する\{#define-the-text-embedding-function}

Milvus の Function モジュールは、スカラーフィールドに格納された生データを自動的に埋め込みへ変換し、明示的に定義されたベクトルフィールドに保存します。

以下の例では、スカラーフィールド `"document"` を埋め込みに変換し、結果のベクトルを先ほど定義した `"dense"` ベクトルフィールドに保存する Function モジュール（`cohere_func`）を追加しています。

埋め込み関数を定義したら、それをコレクションスキーマに追加します。これにより、Milvus は指定された埋め込み関数を使用して、テキストデータから埋め込みを処理・保存するようになります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Define embedding function specifically for embedding model provider
text_embedding_function = Function(
    name="cohere_func",                                 # Unique identifier for this embedding function
    function_type=FunctionType.TEXTEMBEDDING,           # Indicates a text embedding function
    input_field_names=["document"],                     # Scalar field(s) containing text data to embed
    output_field_names=["dense"],                       # Vector field(s) for storing embeddings
    params={                                            # Provider-specific embedding parameters (function-level)
        "provider": "cohere",                           # Must be set to "cohere"
        "model_name": "embed-english-v3.0",             # Specifies the embedding model to use
        "integration_id": "YOUR_INTEGRATION_ID",    # Integration ID generated in the Zilliz Cloud console for the selected model provider
        # "url": "https://api.cohere.com/v2/embed",     # Defaults to the official endpoint if omitted
        # "truncate": "NONE",                           # Specifies how the API will handle inputs longer than the maximum token length.
    }
)

# Add the configured embedding function to your existing collection schema
schema.add_function(text_embedding_function)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;

Function function = Function.builder()
        .functionType(FunctionType.TEXTEMBEDDING)
        .name("cohere_func")
        .inputFieldNames(Collections.singletonList("document"))
        .outputFieldNames(Collections.singletonList("dense"))
        .param("provider", "cohere")
        .param("model_name", "embed-english-v3.0")
        .param("integration_id", "YOUR_INTEGRATION_ID")
        .build();
schema.addFunction(function);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
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
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::FunctionPtr function = std::make_shared<milvus::Function>("cohere_func", milvus::FunctionType::TEXTEMBEDDING);
function->AddInputFieldName("document");
function->AddOutputFieldName("dense");
function->AddParam("provider", "cohere");
function->AddParam("model_name", "embed-english-v3.0");
function->AddParam("integration_id", "YOUR_INTEGRATION_ID");
collection_schema->AddFunction(function);
```

</TabItem>
</Tabs>

### インデックスを設定する\{#configure-the-index}

必要なフィールドと組み込み関数を含むスキーマを定義したら、コレクションのインデックスを設定します。このプロセスを簡素化するために、`index_type` として `AUTOINDEX` を使用してください。これは、データ構造に基づいて Zilliz Cloud が最適なインデックスタイプを選択して設定できるオプションです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("dense")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
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
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<milvus::IndexDesc> indexes = {
    milvus::IndexDesc("dense", "", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)
}
```

</TabItem>
</Tabs>

### コレクションを作成する\{#create-the-collection}

次に、定義したスキーマとインデックスパラメーターを使用してコレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='javascript'>

```javascript
// nodejs
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
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                    .WithCollectionName("demo")
                                    .WithIndexes(std::move(indexes))
                                    .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## ステップ 2: データを挿入する\{#step-2-insert-data}

コレクションとインデックスの設定が完了したら、生データを挿入する準備は完了です。この処理では、生テキストを提供するだけで済みます。先ほど定義した Function モジュールが、各テキストエントリに対応するスパースベクトルを自動的に生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

Gson gson = new Gson();
List<JsonObject> rows = Arrays.asList(
        gson.fromJson("{\"id\": 0, \"document\": \"Milvus simplifies semantic search through embeddings.\"}", JsonObject.class),
        gson.fromJson("{\"id\": 1, \"document\": \"Vector embeddings convert text into searchable numeric data.\"}", JsonObject.class),
        gson.fromJson("{\"id\": 2, \"document\": \"Semantic search helps users find relevant information quickly.\"}", JsonObject.class),
);

client.insert(InsertReq.builder()
        .collectionName("demo")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
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
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::EntityRows data = {
    {{"id", 1}, {"document", "Milvus simplifies semantic search through embeddings."}},
    {{"id", 2}, {"document", "Vector embeddings convert text into searchable numeric data."}},
    {{"id", 3}, {"document", "Semantic search helps users find relevant information quickly."}}
};

milvus::InsertResponse response;
auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName("demo")
                                .WithRowsData(std::move(data))
                                , response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## ステップ 3: テキストで検索する\{#step-3-search-with-text}

データを挿入したら、生のクエリテキストを使用してセマンティック検索を実行します。Milvus はクエリを自動的に埋め込みベクトルに変換し、類似度に基づいて関連ドキュメントを取得して、最も一致する結果を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='javascript'>

```javascript
// nodejs
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

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>
