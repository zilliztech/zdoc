---
title: "Voyage AI | Cloud"
slug: /voyage-ai
sidebar_label: "Voyage AI"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Milvus で Voyage AI の埋め込み関数を設定して使用する方法について説明します。 | Cloud"
type: origin
token: P4KNwDdqaivEZFk7RpOcYeyhn2N
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Voyage AI

このトピックでは、Milvus で Voyage AI の埋め込み関数を設定して使用する方法について説明します。

## Model choices\{#model-choices}

Milvus は Voyage AI が提供する埋め込みモデルをサポートしています。以下は、現在利用可能な埋め込みモデルの一覧です。

| モデル名 | 次元数 | 最大トークン数 | 説明 |
| --- | --- | --- | --- |
| `voyage-4-large` | 1024 (default), 256, 512, 2048 | 32,000 | 汎用および多言語検索品質において最高性能を提供します。4 シリーズで作成されたすべての埋め込みは相互互換性があります。詳細は [blog post](https://blog.voyageai.com/2026/01/15/voyage-4/) を参照してください。 |
| `voyage-4` | 1024 (default), 256, 512, 2048 | 32,000 | 汎用および多言語検索品質向けに最適化されています。4 シリーズで作成されたすべての埋め込みは相互互換性があります。詳細は [blog post](https://blog.voyageai.com/2026/01/15/voyage-4/) を参照してください。 |
| `voyage-4-lite` | 1024 (default), 256, 512, 2048 | 32,000 | レイテンシとコスト向けに最適化されています。4 シリーズで作成されたすべての埋め込みは相互互換性があります。詳細は [blog post](https://blog.voyageai.com/2026/01/15/voyage-4/) を参照してください。 |
| voyage-3-large | 1,024 (default), 256, 512, 2,048 | 32,000 | 汎用および多言語検索品質において最高性能を提供します。 |
| voyage-3 | 1,024 | 32,000 | 汎用および多言語検索品質向けに最適化されています。詳細は [blog post](https://blog.voyageai.com/2024/09/18/voyage-3/) を参照してください。 |
| voyage-3-lite | 512 | 32,000 | レイテンシとコスト向けに最適化されています。詳細は [blog post](https://blog.voyageai.com/2024/09/18/voyage-3/) を参照してください。 |
| voyage-code-3 | 1,024 (default), 256, 512, 2,048 | 32,000 | コード検索向けに最適化されています。詳細は [blog post](https://blog.voyageai.com/2024/12/04/voyage-code-3/) を参照してください。 |
| voyage-finance-2 | 1,024 | 32,000 | 金融分野の検索と RAG 向けに最適化されています。詳細は [blog post](https://blog.voyageai.com/2024/06/03/domain-specific-embeddings-finance-edition-voyage-finance-2/) を参照してください。 |
| voyage-law-2 | 1,024 | 16,000 | 法務分野の検索と RAG 向けに最適化されています。さらに、すべての分野で性能が向上しています。詳細は [blog post](https://blog.voyageai.com/2024/04/15/domain-specific-embeddings-and-retrieval-legal-edition-voyage-law-2/) を参照してください。 |
| voyage-code-2 | 1,536 | 16,000 | コード検索向けに最適化されています（代替手段より 17% 優れています） / コード埋め込みの前世代モデルです。詳細は [blog post](https://blog.voyageai.com/2024/01/23/voyage-code-2-elevate-your-code-retrieval/) を参照してください。 |

詳細については、[Text embedding models](https://docs.voyageai.com/reference/embeddings-api) を参照してください。

## Before you start\{#before-you-start}

テキスト埋め込み関数を使用する前に、以下の前提条件を満たしていることを確認してください。

- **埋め込みモデルを選択する**

    使用する埋め込みモデルを決定してください。この選択によって、埋め込みの動作と出力形式が決まります。詳細は [埋め込みモデルを選択する](./voyage-ai#model-choices) を参照してください。

- **Voyage AI と統合し、integration ID を取得する**

    Voyage AI が提供する埋め込みモデルを使用する前に、Voyage AI とのモデルプロバイダー統合を作成し、integration ID を取得する必要があります。詳細は [Integrate with Model Providers](./integrate-with-model-providers) を参照してください。

- **互換性のある collection スキーマを設計する**

    collection スキーマには、以下を含めるように計画してください。

    - 生の入力テキスト用のテキストフィールド（`VARCHAR`）

    - 選択した埋め込みモデルに一致するデータ型と次元数を持つ dense vector フィールド

- **挿入時および検索時に生テキストを扱う準備をする**

    テキスト埋め込み関数を有効にすると、生テキストを直接挿入およびクエリできます。埋め込みはシステムによって自動的に生成されます。

## Step 1: Create a collection with a text embedding function\{#step-1-create-a-collection-with-a-text-embedding-function}

### Define schema fields\{#define-schema-fields}

埋め込み関数を使用するには、特定のスキーマを持つ collection を作成します。このスキーマには、少なくとも次の 3 つの必須フィールドを含める必要があります。

- collection 内の各エンティティを一意に識別する primary フィールド。

- 埋め込み対象の生データを保存する `VARCHAR` フィールド。

- テキスト埋め込み関数が `VARCHAR` フィールドに対して生成する dense vector 埋め込みを保存するための vector フィールド。

以下の例では、テキストデータを保存するための `VARCHAR` フィールド `"document"` と、テキスト埋め込み関数によって生成される dense 埋め込みを保存するための vector フィールド `"dense"` を含むスキーマを定義しています。vector の次元数（`dim`）は、選択した埋め込みモデルの出力に一致するように設定してください。

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

### Define the text embedding function\{#define-the-text-embedding-function}

テキスト埋め込み関数は、`VARCHAR` フィールドに保存された生データを自動的に埋め込みへ変換し、明示的に定義された vector フィールドに保存します。

以下の例では、スカラー フィールド `"document"` を埋め込みへ変換し、その結果の vector を先ほど定義した `"dense"` vector フィールドに保存する Function モジュール（`voya`）を追加しています。

埋め込み関数を定義したら、それを collection スキーマに追加します。これにより、Milvus は指定された埋め込み関数を使用してテキストデータから埋め込みを処理し、保存するようになります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

        "integration_id": "YOUR_INTEGRATION_ID",    # Integration ID generated in the Zilliz Cloud console for the selected model provider

        # "url": "https://api.voyageai.com/v1/embeddings",     # Defaults to the official endpoint if omitted
        # "dim": "1024"                           # Output dimension of the vector embeddings after truncation
        # "truncation": "true"                    # Whether to truncate the input texts to fit within the context length. Defaults to true.
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
        .name("voya")
        .inputFieldNames(Collections.singletonList("document"))
        .outputFieldNames(Collections.singletonList("dense"))
        .param("provider", "voyageai")
        .param("model_name", "voyage-3-large")

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
milvus::FunctionPtr function = std::make_shared<milvus::Function>("voya", milvus::FunctionType::TEXTEMBEDDING);
function->AddInputFieldName("document");
function->AddOutputFieldName("dense");
function->AddParam("provider", "voyageai");
function->AddParam("model_name", "voyage-3-large");

function->AddParam("integration_id", "YOUR_INTEGRATION_ID");

collection_schema->AddFunction(function);
```

</TabItem>
</Tabs>

### Configure the index\{#configure-the-index}

必要なフィールドと組み込み関数を含むスキーマを定義したら、collection の index を設定します。このプロセスを簡素化するために、`index_type` として `AUTOINDEX` を使用してください。これは、データ構造に基づいて Zilliz Cloud が最適な index タイプを選択し、設定するオプションです。

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

### Create the collection\{#create-the-collection}

ここで、定義したスキーマと index パラメータを使って collection を作成します。

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

## Step 2: Insert data\{#step-2-insert-data}

collection と index の設定が完了したら、生データを挿入する準備が整います。このプロセスでは、生テキストのみを提供すれば十分です。前に定義した Function モジュールが、各テキストエントリに対応する sparse vector を自動的に生成します。

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

## Step 3: Search with text\{#step-3-search-with-text}

データの挿入後は、生のクエリテキストを使ってセマンティック検索を実行します。Milvus はクエリを自動的に埋め込み vector に変換し、類似度に基づいて関連ドキュメントを取得し、最も一致する結果を返します。

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
