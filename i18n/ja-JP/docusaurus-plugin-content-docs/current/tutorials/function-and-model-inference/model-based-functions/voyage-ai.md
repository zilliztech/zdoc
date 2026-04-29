---
title: "Voyage AI | Cloud"
slug: /voyage-ai
sidebar_key: voyage-ai
sidebar_label: "Voyage AI"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Milvus で Voyage AI 埋め込み関数を設定し使用する方法について説明します。 | Cloud"
type: origin
token: P4KNwDdqaivEZFk7RpOcYeyhn2N
sidebar_position: 7
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - function
  - model
  - inference
  - text
  - embedding
  - voyage
  - ai

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Voyage AI

このトピックでは、Milvus で Voyage AI の埋め込み関数を設定および使用する方法について説明します。

## モデルの選択\{#model-choices}

Milvus は Voyage AI が提供する埋め込みモデルをサポートしています。以下は現在利用可能な埋め込みモデルの一覧です（参考用）：

<table>
   <tr>
     <th><p>モデル名</p></th>
     <th><p>次元数</p></th>
     <th><p>最大トークン数</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>voyage-4-large</code></p></td>
     <td><p>1024 (デフォルト), 256, 512, 2048</p></td>
     <td><p>32,000</p></td>
     <td><p>汎用的かつ多言語対応の検索品質に最適化されています。4 シリーズで作成されたすべての埋め込みは相互互換性があります。詳細については、<a href="https://blog.voyageai.com/2026/01/15/voyage-4/">ブログ記事</a>をご参照ください。</p></td>
   </tr>
   <tr>
     <td><p><code>voyage-4</code></p></td>
     <td><p>1024 (デフォルト), 256, 512, 2048</p></td>
     <td><p>32,000</p></td>
     <td><p>汎用的かつ多言語対応の検索品質に最適化されています。4 シリーズで作成されたすべての埋め込みは相互互換性があります。詳細については、<a href="https://blog.voyageai.com/2026/01/15/voyage-4/">ブログ記事</a>をご参照ください。</p></td>
   </tr>
   <tr>
     <td><p><code>voyage-4-lite</code></p></td>
     <td><p>1024 (デフォルト), 256, 512, 2048</p></td>
     <td><p>32,000</p></td>
     <td><p>レイテンシとコストを最適化しています。4 シリーズで作成されたすべての埋め込みは相互互換性があります。詳細については、<a href="https://blog.voyageai.com/2026/01/15/voyage-4/">ブログ記事</a>をご参照ください。</p></td>
   </tr>
   <tr>
     <td><p>voyage-3-large</p></td>
     <td><p>1,024 (デフォルト), 256, 512, 2,048</p></td>
     <td><p>32,000</p></td>
     <td><p>汎用的かつ多言語対応の検索品質に最適化されています。</p></td>
   </tr>
   <tr>
     <td><p>voyage-3</p></td>
     <td><p>1,024</p></td>
     <td><p>32,000</p></td>
     <td><p>汎用的かつ多言語対応の検索品質に最適化されています。詳細については、<a href="https://blog.voyageai.com/2024/09/18/voyage-3/">ブログ記事</a>をご参照ください。</p></td>
   </tr>
   <tr>
     <td><p>voyage-3-lite</p></td>
     <td><p>512</p></td>
     <td><p>32,000</p></td>
     <td><p>レイテンシとコストを最適化しています。詳細については、<a href="https://blog.voyageai.com/2024/09/18/voyage-3/">ブログ記事</a>をご参照ください。</p></td>
   </tr>
   <tr>
     <td><p>voyage-code-3</p></td>
     <td><p>1,024 (デフォルト), 256, 512, 2,048</p></td>
     <td><p>32,000</p></td>
     <td><p>コード検索に最適化されています。詳細については、<a href="https://blog.voyageai.com/2024/12/04/voyage-code-3/">ブログ記事</a>をご参照ください。</p></td>
   </tr>
   <tr>
     <td><p>voyage-finance-2</p></td>
     <td><p>1,024</p></td>
     <td><p>32,000</p></td>
     <td><p>金融分野の検索および RAG に最適化されています。詳細については、<a href="https://blog.voyageai.com/2024/06/03/domain-specific-embeddings-finance-edition-voyage-finance-2/">ブログ記事</a>をご参照ください。</p></td>
   </tr>
   <tr>
     <td><p>voyage-law-2</p></td>
     <td><p>1,024</p></td>
     <td><p>16,000</p></td>
     <td><p>法務分野の検索および RAG に最適化されています。また、全ドメインでのパフォーマンスも向上しています。詳細については、<a href="https://blog.voyageai.com/2024/04/15/domain-specific-embeddings-and-retrieval-legal-edition-voyage-law-2/">ブログ記事</a>をご参照ください。</p></td>
   </tr>
   <tr>
     <td><p>voyage-code-2</p></td>
     <td><p>1,536</p></td>
     <td><p>16,000</p></td>
     <td><p>コード検索に最適化されています（他社製品比で 17% 向上）／前世代のコード埋め込みモデルです。詳細については、<a href="https://blog.voyageai.com/2024/01/23/voyage-code-2-elevate-your-code-retrieval/">ブログ記事</a>をご参照ください。</p></td>
   </tr>
</table>

詳細については、[Text embedding models](https://docs.voyageai.com/reference/embeddings-api) を参照してください。

## 始める前に\{#before-you-start}

テキスト埋め込み関数を使用する前に、以下の前提条件を満たしていることを確認してください。

- **埋め込みモデルを選択**

    使用する埋め込みモデルを決定してください。この選択により、埋め込みの動作と出力形式が決まります。詳細については、[埋め込みモデルを選択](./voyage-ai#model-choices) を参照してください。

- **Voyage AI との連携と統合IDの取得**

    Voyage AI の埋め込みモデルを使用するには、事前に Voyage AI とのモデルプロバイダー連携を作成し、統合IDを取得する必要があります。詳細については、[モデルプロバイダーとの連携](./integrate-with-model-providers) を参照してください。

- **互換性のあるコレクションスキーマの設計**

    コレクションスキーマには以下のフィールドを含めるように計画してください：

    - 生の入力テキストを格納するテキストフィールド（`VARCHAR`）

    - 選択した埋め込みモデルのデータ型および次元数に一致する密ベクトルフィールド

- **挿入時および検索時に生テキストを扱う準備**

    テキスト埋め込み関数を有効にすると、生テキストを直接挿入およびクエリできます。埋め込みはシステムによって自動的に生成されます。

## ステップ 1: テキスト埋め込み関数付きのコレクションを作成\{#step-1-create-a-collection-with-a-text-embedding-function}

### スキーマフィールドの定義\{#define-schema-fields}

埋め込み関数を使用するには、特定のスキーマを持つコレクションを作成する必要があります。このスキーマには、少なくとも以下の 3 つの必須フィールドを含める必要があります：

- コレクション内の各エンティティを一意に識別する主キーとなるフィールド

- 埋め込み対象の生データを格納する `VARCHAR` フィールド

- テキスト埋め込み関数が `VARCHAR` フィールドに対して生成する密ベクトル埋め込みを格納するためのベクトルフィールド

以下の例では、テキストデータを格納する `VARCHAR` フィールド `"document"` と、テキスト埋め込み関数によって生成される密ベクトル埋め込みを格納するベクトルフィールド `"dense"` を持つスキーマを定義しています。選択した埋め込みモデルの出力に合わせて、ベクトルの次元数（`dim`）を正しく設定することを忘れないでください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

### テキスト埋め込み関数を定義する\{#define-the-text-embedding-function}

テキスト埋め込み関数は、`VARCHAR` フィールドに格納された生データを自動的に埋め込みに変換し、明示的に定義されたベクトルフィールドに格納します。

以下の例では、スカラーフィールド `"document"` を埋め込みに変換し、その結果のベクトルを前述の `"dense"` ベクトルフィールドに格納する Function モジュール（`voya`）を追加しています。

埋め込み関数を定義したら、それをコレクションスキーマに追加します。これにより、Milvus は指定された埋め込み関数を使用してテキストデータから埋め込みを処理・格納するよう指示されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

### インデックスの設定\{#configure-the-index}

必要なフィールドとビルトイン関数を使用してスキーマを定義した後、コレクション用のインデックスを設定します。このプロセスを簡略化するために、`index_type` として `AUTOINDEX` を使用してください。このオプションにより、Zilliz Cloud がデータの構造に基づいて最も適切なインデックスタイプを自動的に選択・設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

### コレクションの作成\{#create-the-collection}

定義済みのスキーマとインデックスパラメータを使用して、コレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

## ステップ 2: データの挿入\{#step-2-insert-data}

コレクションとインデックスの設定が完了したら、生データを挿入できます。このプロセスでは、生のテキストを提供するだけで済みます。先ほど定義した Function モジュールが、各テキストエントリに対応するスパースベクトルを自動的に生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

## Step 3: Search with text\{#step-3-search-with-text}

データの挿入後、生のクエリテキストを使用してセマンティック検索を実行します。Milvusは自動的にクエリを埋め込みベクトルに変換し、類似性に基づいて関連ドキュメントを取得し、最も一致する結果を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

