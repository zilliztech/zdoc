---
title: "多言語 Analyzer | Cloud"
slug: /multi-language-analyzers
sidebar_label: "多言語 Analyzer"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud がテキスト分析を実行する際、通常は collection 内のテキストフィールド全体に対して単一の analyzer を適用します。その analyzer が英語向けに最適化されている場合、中国語、スペイン語、フランス語などの他言語で必要となる大きく異なるトークン化やステミングのルールには対応しづらくなり、結果として再現率が低下します。たとえば、スペイン語の単語 \"teléfono\"（\"phone\" を意味する）を検索すると、英語重視の analyzer では正しく処理できないことがあります。アクセントが除去され、スペイン語固有のステミングも適用されないため、関連する結果が見落とされる可能性があります。 | Cloud"
type: origin
token: BnYLwepruiGNpwkJfBHcdrrOnOh
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 多言語 Analyzer

Zilliz Cloud がテキスト分析を実行する際、通常は collection 内のテキストフィールド全体に対して単一の analyzer を適用します。その analyzer が英語向けに最適化されている場合、中国語、スペイン語、フランス語などの他言語で必要となる大きく異なるトークン化やステミングのルールには対応しづらくなり、結果として再現率が低下します。たとえば、スペイン語の単語 *"teléfono"*（*"phone"* を意味する）を検索すると、英語重視の analyzer では正しく処理できないことがあります。アクセントが除去され、スペイン語固有のステミングも適用されないため、関連する結果が見落とされる可能性があります。

多言語 analyzer は、この問題を解決するために、1 つの collection 内のテキストフィールドに対して複数の analyzer を設定できるようにします。これにより、多言語ドキュメントを 1 つのテキストフィールドに保存でき、Zilliz Cloud は各ドキュメントに対して適切な言語ルールに従ってテキストを分析します。

## Limits\{#limits}

- この機能は、BM25 ベースのテキスト検索と疎ベクトルでのみ動作します。詳細については、[Full Text Search](./full-text-search) を参照してください。

- 1 つの collection 内の各ドキュメントで使用できる analyzer は 1 つだけであり、その選択は言語識別子フィールドの値によって決まります。

- パフォーマンスは、analyzer の複雑さやテキストデータのサイズによって異なる場合があります。

## Overview\{#overview}

次の図は、Zilliz Cloud における多言語 analyzer の設定と使用のワークフローを示しています。

![ZDYIwC1HwhTrdlbfOgNcOZ4OnWg](https://zdoc-images.s3.us-west-2.amazonaws.com/ZDYIwC1HwhTrdlbfOgNcOZ4OnWg.png)

1. **多言語 Analyzer を設定する**: 

    - `<analyzer_name>: <analyzer_config>` 形式を使用して複数の言語固有 analyzer を設定します。各 `analyzer_config` は、[Analyzer Overview](./analyzer-overview#analyzer-types) で説明されている標準の `analyzer_params` 設定に従います。

    - 各ドキュメントの analyzer 選択を決定する特別な識別子フィールドを定義します。

    - 不明な言語を処理するための `default` analyzer を設定します。

1. **Collection を作成する**: 

    - 必須フィールドを含む schema を定義します。 

        - **primary_key**: 一意のドキュメント識別子。

        - **text_field**: 元のテキストコンテンツを保存します。

        - **identifier_field**: 各ドキュメントでどの analyzer を使用するかを示します。

        - **vector_field**: BM25 関数によって生成される疎埋め込みを保存します。

    - BM25 関数とインデックスパラメータを設定します。

1. **言語識別子付きでデータを挿入する**:

    - さまざまな言語のテキストを含むドキュメントを追加します。各ドキュメントには、どの analyzer を使用するかを指定する識別子の値を含めます。

    - Zilliz Cloud は識別子フィールドに基づいて適切な analyzer を選択し、不明な識別子を持つドキュメントには `default` analyzer を使用します。

1. **言語固有 Analyzer で検索する**:

    - analyzer 名を指定したクエリテキストを提供すると、Zilliz Cloud は指定された analyzer を使ってクエリを処理します。

    - トークン化は言語固有のルールに従って行われ、検索では類似性に基づいてその言語に適した結果が返されます。

## Step 1: multi_analyzer_params を設定する\{#step-1-configure-multianalyzerparams}

`multi_analyzer_params` は、Zilliz Cloud が各 entity に対して適切な analyzer をどのように選択するかを決定する単一の JSON オブジェクトです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
multi_analyzer_params = {
  # Define language-specific analyzers
  # Each analyzer follows this format: <analyzer_name>: <analyzer_params>
  "analyzers": {
    "english": {"type": "english"},          # English-optimized analyzer
    "chinese": {"type": "chinese"},          # Chinese-optimized analyzer
    "default": {"tokenizer": "icu"}          # Required fallback analyzer
  },
  "by_field": "language",                    # Field determining analyzer selection
  "alias": {
    "cn": "chinese",                         # Use "cn" as shorthand for Chinese
    "en": "english"                          # Use "en" as shorthand for English
  }
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("analyzers", new HashMap<String, Object>() {{
    put("english", new HashMap<String, Object>() {{
        put("type", "english");
    }});
    put("chinese", new HashMap<String, Object>() {{
        put("type", "chinese");
    }});
    put("default", new HashMap<String, Object>() {{
        put("tokenizer", "icu");
    }});
}});
analyzerParams.put("by_field", "language");
analyzerParams.put("alias", new HashMap<String, Object>() {{
    put("cn", "chinese");
    put("en", "english");
}});
```

</TabItem>

<TabItem value='javascript'>

```javascript
const multi_analyzer_params = {
  // Define language-specific analyzers
  // Each analyzer follows this format: <analyzer_name>: <analyzer_params>
  "analyzers": {
    "english": {"type": "english"},          # English-optimized analyzer
    "chinese": {"type": "chinese"},          # Chinese-optimized analyzer
    "default": {"tokenizer": "icu"}          # Required fallback analyzer
  },
  "by_field": "language",                    # Field determining analyzer selection
  "alias": {
    "cn": "chinese",                         # Use "cn" as shorthand for Chinese
    "en": "english"                          # Use "en" as shorthand for English
  }
}
```

</TabItem>

<TabItem value='go'>

```go
multiAnalyzerParams := map[string]any{
    "analyzers": map[string]any{
        "english": map[string]string{"type": "english"},
        "chinese": map[string]string{"type": "chinese"},
        "default": map[string]string{"tokenizer": "icu"},
    },
    "by_field": "language",
    "alias": map[string]string{
        "cn": "chinese",
        "en": "english",
    },
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export multi_analyzer_params='{
  "analyzers": {
    "english": {
      "type": "english"
    },
    "chinese": {
      "type": "chinese"
    },
    "default": {
      "tokenizer": "icu"
    }
  },
  "by_field": "language",
  "alias": {
    "cn": "chinese",
    "en": "english"
  }
}'
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json multi_analyzer_params = {
    {"analyzers", {
        {"english", {{"type", "english"}}},
        {"chinese", {{"type", "chinese"}}},
        {"default", {{"tokenizer", "icu"}}}
    }},
    {"by_field", "language"},
    {"alias", {{"cn", "chinese"}, {"en", "english"}}}
};
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>必須?</p></th>
     <th><p>説明</p></th>
     <th><p>ルール</p></th>
   </tr>
   <tr>
     <td><p><code>analyzers</code></p></td>
     <td><p>はい</p></td>
     <td><p>Zilliz Cloud がテキスト処理に使用できる、各言語固有 analyzer をすべて列挙します。</p><p><code>analyzers</code> 内の各 analyzer は、<code>&lt;analyzer_name&gt;: &lt;analyzer_params&gt;</code> 形式に従います。</p></td>
     <td><ul><li><p>標準の <code>analyzer_params</code> 構文を使って各 analyzer を定義してください（<a href="./analyzer-overview#analyzer-types">Analyzer Overview</a> を参照）。</p></li><li><p>キーが <code>default</code> のエントリを追加してください。<code>by_field</code> に格納された値が他の analyzer 名と一致しない場合、Zilliz Cloud はこの analyzer をフォールバックとして使用します。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>by_field</code></p></td>
     <td><p>はい</p></td>
     <td><p>各ドキュメントについて、Zilliz Cloud が適用すべき言語（つまり analyzer 名）を保存するフィールド名です。</p></td>
     <td><ul><li><p>collection 内で定義された <code>VARCHAR</code> フィールドである必要があります。</p></li><li><p>各行の値は、<code>analyzers</code> に列挙された analyzer 名（または alias）のいずれかと完全に一致している必要があります。</p></li><li><p>行の値が存在しない、または見つからない場合、Zilliz Cloud は自動的に <code>default</code> analyzer を適用します。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>alias</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>analyzer のショートカットや別名を作成し、コード内で参照しやすくします。各 analyzer には 1 つ以上の alias を設定できます。</p></td>
     <td><p>各 alias は、既存の analyzer キーにマッピングされている必要があります。</p></td>
   </tr>
</table>

## Step 2: Collection を作成する\{#step-2-create-collection}

多言語サポート付きの collection を作成するには、特定のフィールドとインデックスを設定する必要があります。

### Step 1: フィールドを追加する\{#step-1-add-fields}

このステップでは、4 つの必須フィールドを持つ collection schema を定義します。

- **Primary Key Field** (`id`): collection 内の各 entity の一意な識別子です。`auto_id=True` を設定すると、Zilliz Cloud がこれらの ID を自動生成します。

- **Language Indicator Field** (`language`): この VARCHAR フィールドは、`multi_analyzer_params` で指定した `by_field` に対応します。各 entity の言語識別子を保存し、Zilliz Cloud にどの analyzer を使用するかを指示します。

- **Text Content Field** (`text`): この VARCHAR フィールドには、分析および検索したい実際のテキストデータを保存します。`enable_analyzer=True` の設定は重要で、このフィールドのテキスト分析機能を有効にします。`multi_analyzer_params` 設定はこのフィールドに直接関連付けられ、テキストデータと言語固有 analyzer の接続を確立します。

- **Vector Field** (`sparse`): このフィールドには、BM25 関数によって生成された疎ベクトルが保存されます。これらのベクトルは、テキストデータの分析可能な形式を表し、Zilliz Cloud が実際に検索する対象です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Import required modules
from pymilvus import MilvusClient, DataType, Function, FunctionType

# Initialize client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
)

# Initialize a new schema
schema = client.create_schema()

# Step 2.1: Add a primary key field for unique document identification
schema.add_field(
    field_name="id",                  # Field name
    datatype=DataType.INT64,          # Integer data type
    is_primary=True,                  # Designate as primary key
    auto_id=True                      # Auto-generate IDs (recommended)
)

# Step 2.2: Add language identifier field
# This MUST match the "by_field" value in language_analyzer_config
schema.add_field(
    field_name="language",       # Field name
    datatype=DataType.VARCHAR,   # String data type
    max_length=255               # Maximum length (adjust as needed)
)

# Step 2.3: Add text content field with multi-language analysis capability
schema.add_field(
    field_name="text",                           # Field name
    datatype=DataType.VARCHAR,                   # String data type
    max_length=8192,                             # Maximum length (adjust based on expected text size)
    enable_analyzer=True,                        # Enable text analysis
    multi_analyzer_params=multi_analyzer_params  # Connect with our language analyzers
)

# Step 2.4: Add sparse vector field to store the BM25 output
schema.add_field(
    field_name="sparse",                   # Field name
    datatype=DataType.SPARSE_FLOAT_VECTOR  # Sparse vector data type
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.JsonObject;
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionReq;
import io.milvus.v2.service.utility.request.FlushReq;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());
        
CreateCollectionReq.CollectionSchema collectionSchema = CreateCollectionReq.CollectionSchema.builder()
        .build();
        
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
        
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("language")
        .dataType(DataType.VarChar)
        .maxLength(255)
        .build());

collectionSchema.addField(AddFieldReq.builder()
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(8192)
        .enableAnalyzer(true)
        .multiAnalyzerParams(analyzerParams)
        .build());
        
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("sparse")
        .dataType(DataType.SparseFloatVector)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType, FunctionType } from "@zilliz/milvus2-sdk-node";

// Initialize client
const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
});

// Initialize schema array
const schema = [
  {
    name: "id",
    data_type: DataType.Int64,
    is_primary_key: true,
    auto_id: true,
  },
  {
    name: "language",
    data_type: DataType.VarChar,
    max_length: 255,
  },
  {
    name: "text",
    data_type: DataType.VarChar,
    max_length: 8192,
    enable_analyzer: true,
    analyzer_params: multi_analyzer_params,
  },
  {
    name: "sparse",
    data_type: DataType.SparseFloatVector,
  },
];

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

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

schema := entity.NewSchema()

schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true).
    WithIsAutoID(true),
).WithField(entity.NewField().
    WithName("language").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(255),
).WithField(entity.NewField().
    WithName("text").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(8192).
    WithEnableAnalyzer(true).
    WithMultiAnalyzerParams(multiAnalyzerParams),
).WithField(entity.NewField().
    WithName("sparse").
    WithDataType(entity.FieldTypeSparseVector),
)
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export idField='{
  "fieldName": "id",
  "dataType": "Int64",
  "isPrimary": true,
  "autoID": true
}'

export languageField='{
  "fieldName": "language",
  "dataType": "VarChar",
  "elementTypeParams": {
    "max_length": 255
  }
}'

export textField='{
  "fieldName": "text",
  "dataType": "VarChar",
  "elementTypeParams": {
    "max_length": 8192,
    "enable_analyzer": true，
    "multiAnalyzerParam": '"$multi_analyzer_params"'
  },
}'

export sparseField='{
  "fieldName": "sparse",
  "dataType": "SparseFloatVector"
}'
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField({"id", milvus::DataType::INT64, "", true, true});
schema->AddField(milvus::FieldSchema("language", milvus::DataType::VARCHAR)
                    .WithMaxLength(255))
                    .EnableAnalyzer(true)
                    .WithMultiAnalyzerParams(multi_analyzer_params));
schema->AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR).WithMaxLength(255));
schema->AddField(milvus::FieldSchema("sparse", milvus::DataType::SPARSE_FLOAT_VECTOR));
```

</TabItem>
</Tabs>

### ステップ 2: BM25 関数を定義する\{#step-2-define-bm25-function}

生のテキストデータから疎ベクトル表現を生成するために、BM25 関数を定義します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Create the BM25 function
bm25_function = Function(
    name="text_to_vector",            # Descriptive function name
    function_type=FunctionType.BM25,  # Use BM25 algorithm
    input_field_names=["text"],       # Process text from this field
    output_field_names=["sparse"]     # Store vectors in this field
)

# Add the function to our schema
schema.add_function(bm25_function)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq.Function function = CreateCollectionReq.Function.builder()
        .functionType(FunctionType.BM25)
        .name("text_to_vector")
        .inputFieldNames(Collections.singletonList("text"))
        .outputFieldNames(Collections.singletonList("sparse"))
        .build();
collectionSchema.addFunction(function);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const functions = [
  {
    name: "text_bm25_emb",
    description: "bm25 function",
    type: FunctionType.BM25,
    input_field_names: ["text"],
    output_field_names: ["sparse"],
    params: {},
  },
];
```

</TabItem>

<TabItem value='go'>

```go
function := entity.NewFunction()
schema.WithFunction(function.WithName("text_to_vector").
    WithType(entity.FunctionTypeBM25).
    WithInputFields("text").
    WithOutputFields("sparse"))
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export function='{
  "name": "text_to_vector",
  "type": "BM25",
  "inputFieldNames": ["text"],
  "outputFieldNames": ["sparse"]
}'

export schema="{
  \"autoID\": true,
  \"fields\": [
    $idField,
    $languageField,
    $textField,
    $sparseField
  ],
  \"functions\": [
    $function
  ]
}"
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::FunctionPtr function = std::make_shared<milvus::Function>("text_to_vector", milvus::FunctionType::BM25);
function->AddInputFieldName("text");
function->AddOutputFieldName("sparse");
schema->AddFunction(function);
```

</TabItem>
</Tabs>

この関数は、言語識別子に基づいて各テキストエントリに適切な analyzer を自動的に適用します。BM25 ベースのテキスト検索の詳細については、[全文検索](./full-text-search) を参照してください。

### ステップ 3: インデックスパラメータを設定する\{#step-3-configure-index-params}

効率的な検索を可能にするため、疎ベクトルフィールドにインデックスを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Configure index parameters
index_params = client.prepare_index_params()

# Add index for sparse vector field
index_params.add_index(
    field_name="sparse",        # Field to index (our vector field)
    index_type="AUTOINDEX",     # Let Milvus choose optimal index type
    metric_type="BM25"          # Must be BM25 for this feature
)
```

</TabItem>

<TabItem value='java'>

```java
List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("sparse")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.BM25)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const index_params = [{
    field_name: "sparse",
    index_type: "AUTOINDEX",
    metric_type: "BM25"
}];
```

</TabItem>

<TabItem value='go'>

```go
idx := index.NewAutoIndex(index.MetricType(entity.BM25))
indexOption := milvusclient.NewCreateIndexOption("multilingual_documents", "sparse", idx)
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export IndexParams='[
  {
    "fieldName": "sparse",
    "indexType": "AUTOINDEX",
    "metricType": "BM25",
    "params": {}
  }
]'
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc index_vector("sparse", "", milvus::IndexType::AUTOINDEX, milvus::MetricType::BM25);
```

</TabItem>
</Tabs>

このインデックスは、BM25 類似度計算を効率的に行えるように疎ベクトルを整理し、検索パフォーマンスを向上させます。

### ステップ 4: collection を作成する\{#step-4-create-the-collection}

この最後の作成ステップでは、これまでのすべての設定をまとめます。

- `collection_name="multilang_demo"` は、今後参照するための collection 名を指定します。

- `schema=schema` は、定義したフィールド構造と関数を適用します。

- `index_params=index_params` は、効率的な検索のためのインデックス戦略を実装します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Create collection
COLLECTION_NAME = "multilingual_documents"

# Check if collection already exists
if client.has_collection(COLLECTION_NAME):
    client.drop_collection(COLLECTION_NAME)  # Remove it for this example
    print(f"Dropped existing collection: {COLLECTION_NAME}")

# Create the collection
client.create_collection(
    collection_name=COLLECTION_NAME,       # Collection name
    schema=schema,                         # Our multilingual schema
    index_params=index_params              # Our search index configuration
)
```

</TabItem>

<TabItem value='java'>

```java
client.dropCollection(DropCollectionReq.builder()
        .collectionName("multilingual_documents")
        .build());
        
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("multilingual_documents")
        .collectionSchema(collectionSchema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const COLLECTION_NAME = "multilingual_documents";

// Create the collection
await client.createCollection({
  collection_name: COLLECTION_NAME,
  schema: schema,
  index_params: index_params,
  functions: functions
});
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("multilingual_documents", schema).
        WithIndexOptions(indexOption))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"multilingual_documents\",
  \"schema\": $schema,
  \"indexParams\": $IndexParams
}"
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                        .WithCollectionName("multilingual_documents")
                                        .AddIndex(std::move(index_vector))
                                        .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

この時点で、Zilliz Cloud は多言語 analyzer をサポートする空の collection を作成し、データを受け入れる準備が整います。

## ステップ 3: サンプルデータを挿入する\{#step-3-insert-example-data}

多言語 collection にドキュメントを追加する際は、各ドキュメントにテキスト内容と言語識別子の両方を含める必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Prepare multilingual documents
documents = [
    # English documents
    {
        "text": "Artificial intelligence is transforming technology",
        "language": "english",  # Using full language name
    },
    {
        "text": "Machine learning models require large datasets",
        "language": "en",  # Using our defined alias
    },
    # Chinese documents
    {
        "text": "人工智能正在改变技术领域",
        "language": "chinese",  # Using full language name
    },
    {
        "text": "机器学习模型需要大型数据集",
        "language": "cn",  # Using our defined alias
    },
]

# Insert the documents
result = client.insert(COLLECTION_NAME, documents)

# Print results
inserted = result["insert_count"]            
print(f"Successfully inserted {inserted} documents")
print("Documents by language: 2 English, 2 Chinese")

# Expected output:
# Successfully inserted 4 documents
# Documents by language: 2 English, 2 Chinese
```

</TabItem>

<TabItem value='java'>

```java
List<String> texts = Arrays.asList(
        "Artificial intelligence is transforming technology",
        "Machine learning models require large datasets",
        "人工智能正在改变技术领域",
        "机器学习模型需要大型数据集"
);
List<String> languages = Arrays.asList(
        "english", "en", "chinese", "cn"
);

List<JsonObject> rows = new ArrayList<>();
for (int i = 0; i < texts.size(); i++) {
    JsonObject row = new JsonObject();
    row.addProperty("text", texts.get(i));
    row.addProperty("language", languages.get(i));
    rows.add(row);
}
client.insert(InsertReq.builder()
        .collectionName("multilingual_documents")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Prepare multilingual documents
const documents = [
  // English documents
  {
    text: "Artificial intelligence is transforming technology",
    language: "english",
  },
  {
    text: "Machine learning models require large datasets",
    language: "en",
  },
  // Chinese documents
  {
    text: "人工智能正在改变技术领域",
    language: "chinese",
  },
  {
    text: "机器学习模型需要大型数据集",
    language: "cn",
  },
];

// Insert the documents
const result = await client.insert({
  collection_name: COLLECTION_NAME,
  data: documents,
});

// Print results
const inserted = result.insert_count;
console.log(`Successfully inserted ${inserted} documents`);
console.log("Documents by language: 2 English, 2 Chinese");

// Expected output:
// Successfully inserted 4 documents
// Documents by language: 2 English, 2 Chinese
```

</TabItem>

<TabItem value='go'>

```go
column1 := column.NewColumnVarChar("text",
    []string{
        "Artificial intelligence is transforming technology",
        "Machine learning models require large datasets",
        "人工智能正在改变技术领域",
        "机器学习模型需要大型数据集",
    })
column2 := column.NewColumnVarChar("language",
    []string{"english", "en", "chinese", "cn"})

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("multilingual_documents").
    WithColumns(column1, column2),
)
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "collectionName": "multilingual_documents",
  "data": [
    {
      "text": "Artificial intelligence is transforming technology",
      "language": "english"
    },
    {
      "text": "Machine learning models require large datasets",
      "language": "en"
    },
    {
      "text": "人工智能正在改变技术领域",
      "language": "chinese"
    },
    {
      "text": "机器学习模型需要大型数据集",
      "language": "cn"
    }
  ]
}'
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<milvus::EntityRow> documents = {
    {{"text", "Artificial intelligence is transforming technology"}, {"language", "english"}},
    {{"text", "Machine learning models require large datasets"}, {"language", "en"}},
    {{"text", "人工智能正在改变技术领域"}, {"language", "chinese"}},
    {{"text", "机器学习模型需要大型数据集"}, {"language", "cn"}}
};

milvus::InsertResponse resp_insert;
auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName("multilingual_documents")
                                .WithRowsData(std::move(documents)),
                            resp_insert);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

挿入時に、Zilliz Cloud は次の処理を行います。

1. 各ドキュメントの `language` フィールドを読み取る

1. `text` フィールドに対応する analyzer を適用する

1. BM25 関数を通じて疎ベクトル表現を生成する

1. 元のテキストと生成された疎ベクトルの両方を保存する

<Admonition type="info" icon="📘" title="注意">

疎ベクトルを直接指定する必要はありません。BM25 関数が、テキストと指定された analyzer に基づいて自動的に生成します。

</Admonition>

## ステップ 4: 検索操作を実行する\{#step-4-perform-search-operations}

### English analyzer を使用する\{#use-english-analyzer}

多言語 analyzer を使って検索する場合、`search_params` には重要な設定が含まれます。 

- `metric_type="BM25"` はインデックス設定と一致している必要があります。

- `analyzer_name="english"` は、クエリテキストに適用する analyzer を指定します。これは保存済みドキュメントで使われた analyzer とは独立しています。

- `params={"drop_ratio_search": "0"}` は BM25 固有の動作を制御します。ここでは検索時にすべての用語を保持します。詳細については、[疎ベクトル](./use-sparse-vector) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
search_params = {
    "metric_type": "BM25",            # Must match index configuration
    "analyzer_name": "english",  # Analyzer that matches the query language
    "drop_ratio_search": "0",     # Keep all terms in search (tweak as needed)
}

# Execute the search
english_results = client.search(
    collection_name=COLLECTION_NAME,  # Collection to search
    data=["artificial intelligence"],                # Query text
    anns_field="sparse",              # Field to search against
    search_params=search_params,      # Search configuration
    limit=3,                      # Max results to return
    output_fields=["text", "language"],  # Fields to include in the output
    consistency_level="Bounded",       # Data‑consistency guarantee
)

# Display English search results
print("\n=== English Search Results ===")
for i, hit in enumerate(english_results[0]):
    print(f"{i+1}. [{hit.score:.4f}] {hit.entity.get('text')} "
          f"(Language: {hit.entity.get('language')})")

# Expected output (English Search Results):
# 1. [2.7881] Artificial intelligence is transforming technology (Language: english)
```

</TabItem>

<TabItem value='java'>

```java
Map<String,Object> searchParams = new HashMap<>();
searchParams.put("metric_type", "BM25");
searchParams.put("analyzer_name", "english");
searchParams.put("drop_ratio_search", 0);
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("multilingual_documents")
        .data(Collections.singletonList(new EmbeddedText("artificial intelligence")))
        .annsField("sparse")
        .topK(3)
        .searchParams(searchParams)
        .outputFields(Arrays.asList("text", "language"))
        .build());

System.out.println("\n=== English Search Results ===");
List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    for (SearchResp.SearchResult result : results) {
        System.out.printf("Score: %f, %s\n", result.getScore(), result.getEntity().toString());
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Execute the search
const english_results = await client.search({
  collection_name: COLLECTION_NAME,
  data: ["artificial intelligence"],
  anns_field: "sparse",
  params: {
    metric_type: "BM25",
    analyzer_name: "english",
    drop_ratio_search: "0",
  },
  limit: 3,
  output_fields: ["text", "language"],
  consistency_level: "Bounded",
});

// Display English search results
console.log("\n=== English Search Results ===");
english_results.results.forEach((hit, i) => {
  console.log(
    `${i + 1}. [${hit.score.toFixed(4)}] ${hit.entity.text} ` +
      `(Language: ${hit.entity.language})`
  );
});
```

</TabItem>

<TabItem value='go'>

```go
annSearchParams := index.NewCustomAnnParam()
annSearchParams.WithExtraParam("metric_type", "BM25")
annSearchParams.WithExtraParam("analyzer_name", "english")
annSearchParams.WithExtraParam("drop_ratio_search", 0)

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "multilingual_documents", // collectionName
    3,                        // limit
    []entity.Vector{entity.Text("artificial intelligence")},
).WithANNSField("sparse").
    WithAnnParam(annSearchParams).
    WithOutputFields("text", "language"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    for i := 0; i < len(resultSet.Scores); i++ {
        text, _ := resultSet.GetColumn("text").GetAsString(i)
        lang, _ := resultSet.GetColumn("language").GetAsString(i)
        fmt.Println("Score: ", resultSet.Scores[i], "Text: ", text, "Language:", lang)
    }
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "collectionName": "multilingual_documents",
  "data": ["artificial intelligence"],
  "annsField": "sparse",
  "limit": 3,
  "searchParams": {
    "metric_type": "BM25",
    "analyzer_name": "english",
    "drop_ratio_search": "0"  
  },
  "outputFields": ["text", "language"],
  "consistencyLevel": "Strong"
}'
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::SearchRequest()
                   .WithCollectionName("multilingual_documents")
                   .AddEmbeddedText("artificial intelligence");
                   .WithAnnsField("sparse")
                   .WithLimit(3)
                   .AddExtraParam("metric_type", "BM25")
                   .AddExtraParam("analyzer_name", "english")
                   .AddExtraParam("drop_ratio_search", "9")
                   .AddOutputField("text")
                   .AddOutputField("language")
                   .WithConsistencyLevel(milvus::ConsistencyLevel::STRONG);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### 中国語アナライザーを使用する\{#use-chinese-analyzer}

この例では、異なるクエリテキストに対して中国語アナライザー（エイリアス `"cn"` を使用）に切り替える方法を示します。その他のすべてのパラメータは同じままですが、クエリテキストは中国語固有のトークン化ルールを使用して処理されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
search_params["analyzer_name"] = "cn"

chinese_results = client.search(
    collection_name=COLLECTION_NAME,  # Collection to search
    data=["人工智能"],                # Query text
    anns_field="sparse",              # Field to search against
    search_params=search_params,      # Search configuration
    limit=3,                      # Max results to return
    output_fields=["text", "language"],  # Fields to include in the output
    consistency_level="Bounded",       # Data‑consistency guarantee
)

# Display Chinese search results
print("\n=== Chinese Search Results ===")
for i, hit in enumerate(chinese_results[0]):
    print(f"{i+1}. [{hit.score:.4f}] {hit.entity.get('text')} "
          f"(Language: {hit.entity.get('language')})")

# Expected output (Chinese Search Results):
# 1. [3.3814] 人工智能正在改变技术领域 (Language: chinese)
```

</TabItem>

<TabItem value='java'>

```java
searchParams.put("analyzer_name", "cn");
searchResp = client.search(SearchReq.builder()
        .collectionName("multilingual_documents")
        .data(Collections.singletonList(new EmbeddedText("人工智能")))
        .annsField("sparse")
        .topK(3)
        .searchParams(searchParams)
        .outputFields(Arrays.asList("text", "language"))
        .build());

System.out.println("\n=== Chinese Search Results ===");
searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    for (SearchResp.SearchResult result : results) {
        System.out.printf("Score: %f, %s\n", result.getScore(), result.getEntity().toString());
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Execute the search
const cn_results = await client.search({
  collection_name: COLLECTION_NAME,
  data: ["人工智能"],
  anns_field: "sparse",
  params: {
    metric_type: "BM25",
    analyzer_name: "cn",
    drop_ratio_search: "0",
  },
  limit: 3,
  output_fields: ["text", "language"],
  consistency_level: "Bounded",
});

// Display Chinese search results
console.log("\n=== Chinese Search Results ===");
cn_results.results.forEach((hit, i) => {
  console.log(
    `${i + 1}. [${hit.score.toFixed(4)}] ${hit.entity.text} ` +
      `(Language: ${hit.entity.language})`
  );
});
```

</TabItem>

<TabItem value='go'>

```go
annSearchParams.WithExtraParam("analyzer_name", "cn")

resultSets, err = client.Search(ctx, milvusclient.NewSearchOption(
    "multilingual_documents", // collectionName
    3,                        // limit
    []entity.Vector{entity.Text("人工智能")},
).WithANNSField("sparse").
    WithAnnParam(annSearchParams).
    WithOutputFields("text", "language"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    for i := 0; i < len(resultSet.Scores); i++ {
        text, _ := resultSet.GetColumn("text").GetAsString(i)
        lang, _ := resultSet.GetColumn("language").GetAsString(i)
        fmt.Println("Score: ", resultSet.Scores[i], "Text: ", text, "Language:", lang)
    }
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "collectionName": "multilingual_documents",
  "data": ["人工智能"],
  "annsField": "sparse",
  "limit": 3,
  "searchParams": {
    "analyzer_name": "cn"
  },
  "outputFields": ["text", "language"],
  "consistencyLevel": "Strong"
}'
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::SearchRequest()
                   .WithCollectionName("multilingual_documents")
                   .AddEmbeddedText("人工智能");
                   .WithAnnsField("sparse")
                   .WithLimit(3)
                   .AddExtraParam("metric_type", "BM25")
                   .AddExtraParam("analyzer_name", "cn")
                   .AddExtraParam("drop_ratio_search", "0")
                   .AddOutputField("text")
                   .AddOutputField("language")
                   .WithConsistencyLevel(milvus::ConsistencyLevel::STRONG);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>
