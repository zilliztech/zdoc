---
title: "Voyage AI | Cloud"
slug: /voyage-ai
sidebar_label: "Voyage AI"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Milvus で Voyage AI embedding functions を設定して使用する方法について説明します。 | Cloud"
type: origin
token: P4KNwDdqaivEZFk7RpOcYeyhn2N
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Voyage AI

このトピックでは、Milvus で Voyage AI embedding functions を設定して使用する方法について説明します。

## Model choices\{#model-choices}

Milvus は Voyage AI が提供する embedding model をサポートしています。以下は、現在利用可能な embedding model の一覧です。

| Model Name | Dimensions | Max Tokens | Description |
| --- | --- | --- | --- |
| `voyage-4-large` | 1024 (default), 256, 512, 2048 | 32,000 | 汎用および多言語検索において最高の品質を提供します。4 シリーズで作成されたすべての embedding は相互に互換性があります。詳細は [blog post](https://blog.voyageai.com/2026/01/15/voyage-4/) を参照してください。 |
| `voyage-4` | 1024 (default), 256, 512, 2048 | 32,000 | 汎用および多言語検索品質向けに最適化されています。4 シリーズで作成されたすべての embedding は相互に互換性があります。詳細は [blog post](https://blog.voyageai.com/2026/01/15/voyage-4/) を参照してください。 |
| `voyage-4-lite` | 1024 (default), 256, 512, 2048 | 32,000 | レイテンシとコスト向けに最適化されています。4 シリーズで作成されたすべての embedding は相互に互換性があります。詳細は [blog post](https://blog.voyageai.com/2026/01/15/voyage-4/) を参照してください。 |
| voyage-3-large | 1,024 (default), 256, 512, 2,048 | 32,000 | 汎用および多言語検索において最高の品質を提供します。 |
| voyage-3 | 1,024 | 32,000 | 汎用および多言語検索品質向けに最適化されています。詳細は [blog post](https://blog.voyageai.com/2024/09/18/voyage-3/) を参照してください。 |
| voyage-3-lite | 512 | 32,000 | レイテンシとコスト向けに最適化されています。詳細は [blog post](https://blog.voyageai.com/2024/09/18/voyage-3/) を参照してください。 |
| voyage-code-3 | 1,024 (default), 256, 512, 2,048 | 32,000 | コード検索向けに最適化されています。詳細は [blog post](https://blog.voyageai.com/2024/12/04/voyage-code-3/) を参照してください。 |
| voyage-finance-2 | 1,024 | 32,000 | 金融検索および RAG 向けに最適化されています。詳細は [blog post](https://blog.voyageai.com/2024/06/03/domain-specific-embeddings-finance-edition-voyage-finance-2/) を参照してください。 |
| voyage-law-2 | 1,024 | 16,000 | 法務検索および RAG 向けに最適化されています。また、すべてのドメインにわたって性能が向上しています。詳細は [blog post](https://blog.voyageai.com/2024/04/15/domain-specific-embeddings-and-retrieval-legal-edition-voyage-law-2/) を参照してください。 |
| voyage-code-2 | 1,536 | 16,000 | コード検索向けに最適化されています（代替手段より 17% 優れています） / 以前の世代のコード embedding です。詳細は [blog post](https://blog.voyageai.com/2024/01/23/voyage-code-2-elevate-your-code-retrieval/) を参照してください。 |

詳細は [Text embedding models](https://docs.voyageai.com/reference/embeddings-api) を参照してください。

## Before you start\{#before-you-start}

テキスト embedding function を使用する前に、次の前提条件を満たしていることを確認してください。

- **embedding model を選択する**

    どの embedding model を使用するかを決定してください。この選択によって embedding の動作と出力形式が決まります。詳細は [Choose an embedding model](./voyage-ai#model-choices) を参照してください。

- **Voyage AI と統合し、integration ID を取得する**

    Voyage AI が提供する embedding model を使用する前に、Voyage AI との model provider integration を作成し、integration ID を取得する必要があります。詳細は [Integrate with Model Providers](./integrate-with-model-providers) を参照してください。

- **互換性のある collection schema を設計する**

    collection schema には、以下を含めるように計画してください。

    - 生の入力テキスト用のテキスト field (`VARCHAR`)

    - 選択した embedding model に対応するデータ型と次元を持つ dense vector field

- **挿入時および検索時に生テキストを扱う準備をする**

    テキスト embedding function を有効にすると、生テキストを直接 insert および query できます。embedding はシステムによって自動生成されます。

## Step 1: Create a collection with a text embedding function\{#step-1-create-a-collection-with-a-text-embedding-function}

### Define schema fields\{#define-schema-fields}

embedding function を使用するには、特定の schema を持つ collection を作成します。この schema には、少なくとも次の 3 つの必須 field を含める必要があります。

- collection 内の各 entity を一意に識別する primary field。

- embedding される生データを保存する `VARCHAR` field。

- テキスト embedding function が `VARCHAR` field に対して生成する dense vector embedding を保存するために予約された vector field。

次の例では、テキストデータを保存するための `VARCHAR` field `"document"` と、テキスト embedding function によって生成される dense embedding を保存するための vector field `"dense"` を含む schema を定義しています。vector dimension (`dim`) は、選択した embedding model の出力に一致するよう設定してください。

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

テキスト embedding function は、`VARCHAR` field に保存された生データを自動的に embedding に変換し、明示的に定義された vector field に保存します。

以下の例では、scalar field `"document"` を embedding に変換し、その結果の vector を先ほど定義した `"dense"` vector field に保存する Function module (`voya`) を追加します。

embedding function を定義したら、それを collection schema に追加します。これにより、Milvus は指定された embedding function を使用して、テキストデータから embedding を処理および保存するようになります。

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

必要な field と組み込み function を含む schema を定義したら、collection の index を設定します。このプロセスを簡素化するために、`index_type` として `AUTOINDEX` を使用します。これは、Zilliz Cloud がデータ構造に基づいて最適な index type を選択し、設定するオプションです。

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

ここで、定義した schema と index parameters を使用して collection を作成します。

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

collection と index の設定が完了したら、生データを insert する準備が整います。このプロセスでは、生テキストのみを提供すれば十分です。先ほど定義した Function module が、各テキストエントリに対応する sparse vector を自動的に生成します。

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

## ステップ3: テキストによる検索\{#step-3-search-with-text}

データの挿入後、生のクエリテキストを使ってセマンティック検索を実行します。Milvus はクエリを自動的に embedding vector に変換し、類似性に基づいて関連ドキュメントを取得して、最も一致する上位の結果を返します。

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
