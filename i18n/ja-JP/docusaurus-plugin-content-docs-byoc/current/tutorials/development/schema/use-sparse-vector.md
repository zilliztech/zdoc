---
title: "Sparse Vector | BYOC"
slug: /use-sparse-vector
sidebar_label: "Sparse Vector"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スパースベクトルは、情報検索や自然言語処理において表層レベルの用語マッチングを捉えるための重要な手法です。dense vector が意味理解に優れている一方で、スパースベクトルは、特に特殊な用語やテキスト識別子を検索する際に、より予測しやすいマッチング結果を提供することがよくあります。 | BYOC"
type: origin
token: JbPDwHqd0iZZSuk5tYicGqKbn9c
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Sparse Vector

スパースベクトルは、情報検索や自然言語処理において表層レベルの用語マッチングを捉えるための重要な手法です。dense vector が意味理解に優れている一方で、スパースベクトルは、特に特殊な用語やテキスト識別子を検索する際に、より予測しやすいマッチング結果を提供することがよくあります。

## 概要\{#overview}

スパースベクトルは、ほとんどの要素がゼロで、ごく一部の次元だけが非ゼロ値を持つ特殊な高次元ベクトルです。以下の図に示すように、dense vector は通常、各位置に値を持つ連続配列として表されます（例: `[0.3, 0.8, 0.2, 0.3, 0.1]`）。これに対して、スパースベクトルは非ゼロ要素とその次元のインデックスのみを保存し、多くの場合 `{ index: value}` のようなキーと値のペアで表されます（例: `[{2: 0.2}, ..., {9997: 0.5}, {9999: 0.7}]`）。 

![VPhswBhHmhJrh3byaVnc3onYnPc](https://zdoc-images.s3.us-west-2.amazonaws.com/VPhswBhHmhJrh3byaVnc3onYnPc.png)

トークン化とスコアリングにより、ドキュメントは bag-of-words ベクトルとして表現できます。ここで各次元は語彙内の特定の単語に対応します。ドキュメント内に存在する単語のみが非ゼロ値を持つため、スパースベクトル表現が作成されます。スパースベクトルは、次の 2 つの方法で生成できます。

- **従来の統計的手法**。たとえば、[TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)（Term Frequency-Inverse Document Frequency）や [BM25](https://en.wikipedia.org/wiki/Okapi_BM25)（Best Matching 25）は、コーパス全体における単語の頻度と重要度に基づいて重みを割り当てます。これらの手法は、トークンを表す各次元に対するスコアとして単純な統計値を計算します。Zilliz Cloud は BM25 メソッドによる組み込みの **全文検索** を提供しており、テキストを自動的にスパースベクトルへ変換するため、手動での前処理は不要です。このアプローチは、精度と完全一致が重要なキーワードベースの検索に最適です。詳細は [Full Text Search](./full-text-search) を参照してください。

- **ニューラル sparse embedding モデル** は、大規模データセットで学習することでスパース表現を生成する学習ベースの手法です。通常は Transformer アーキテクチャを持つ深層学習モデルであり、意味的コンテキストに基づいて用語を拡張し、重み付けできます。Zilliz Cloud は、[SPLADE](https://arxiv.org/abs/2109.10086) のようなモデルによって外部生成された sparse embedding もサポートしています。詳細は [Embeddings](https://milvus.io/docs/embeddings.md#Embedding-Overview) を参照してください。

スパースベクトルと元のテキストは、効率的な検索のために Zilliz Cloud に保存できます。以下の図は全体的なプロセスを示しています。

![A7FvwnB5bhpBlKbgrzYcQijbnxg](https://zdoc-images.s3.us-west-2.amazonaws.com/A7FvwnB5bhpBlKbgrzYcQijbnxg.png)

<Admonition type="info" icon="📘" title="Notes">

Zilliz Cloud は、スパースベクトルに加えて dense vector と binary vector もサポートしています。dense vector は深い意味関係の把握に最適であり、binary vector は高速な類似性比較やコンテンツ重複排除のようなシナリオで優れています。詳細は [Dense Vector](./use-dense-vector) および [Binary Vector](./use-binary-vector) を参照してください。

</Admonition>

## データ形式\{#data-formats}

次のセクションでは、SPLADE のような学習済み sparse embedding モデルからのベクトルを保存する方法を示します。dense vector ベースの意味検索を補完するものを探している場合は、シンプルさの観点から、SPLADE よりも BM25 を使った [Full Text Search](./full-text-search) を推奨します。品質評価を実施したうえで SPLADE を使用すると決めた場合は、SPLADE でスパースベクトルを生成する方法について [Embeddings](https://milvus.io/docs/embeddings.md#Embedding-Overview) を参照してください。

Zilliz Cloud は、次の形式でのスパースベクトル入力をサポートしています。

- **辞書のリスト（** `{dimension_index: value, ...}` **形式）**

    ```python
    # Represent each sparse vector using a dictionary
    sparse_vectors = [{27: 0.5, 100: 0.3, 5369: 0.6} , {100: 0.1, 3: 0.8}]
    ```

- **スパース行列（** `scipy.sparse` **クラスを使用）**

    ```python
    from scipy.sparse import csr_matrix
    
    # First vector: indices [27, 100, 5369] with values [0.5, 0.3, 0.6]
    # Second vector: indices [3, 100] with values [0.8, 0.1]
    indices = [[27, 100, 5369], [3, 100]]
    values = [[0.5, 0.3, 0.6], [0.8, 0.1]]
    sparse_vectors = [csr_matrix((vals, ([0]*len(idx), idx)), shape=(1, 5369+1)) for idx, vals in zip(indices, values)]
    ```

- **タプル反復可能オブジェクトのリスト（例:** `[(dimension_index, value)]`**）**

    ```python
    # Represent each sparse vector using a list of iterables (e.g. tuples)
    sparse_vector = [
        [(27, 0.5), (100, 0.3), (5369, 0.6)],
        [(100, 0.1), (3, 0.8)]
        ]
    ```

## Collection スキーマを定義する\{#define-collection-schema}

collection を作成する前に、collection スキーマを指定する必要があります。これはフィールドと、必要に応じてテキストフィールドを対応するスパースベクトル表現に変換する関数を定義するものです。

### フィールドを追加する\{#add-fields}

Zilliz Cloud cluster でスパースベクトルを使用するには、次のフィールドを含むスキーマを持つ collection を作成する必要があります。

- `SPARSE_FLOAT_VECTOR` フィールド。これはスパースベクトルを保存するために予約されており、`VARCHAR` フィールドから自動生成することも、入力データ内で直接提供することもできます。

- 通常、スパースベクトルが表す元のテキストも collection に保存されます。元のテキストの保存には `VARCHAR` フィールドを使用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema(
    auto_id=True,
    enable_dynamic_fields=True,
)

schema.add_field(field_name="pk", datatype=DataType.VARCHAR, is_primary=True, max_length=100)
schema.add_field(field_name="sparse_vector", datatype=DataType.SPARSE_FLOAT_VECTOR)
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=65535, enable_analyzer=True)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());
        
CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.setEnableDynamicField(true);
schema.addField(AddFieldReq.builder()
        .fieldName("pk")
        .dataType(DataType.VarChar)
        .isPrimaryKey(true)
        .autoID(true)
        .maxLength(100)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("sparse_vector")
        .dataType(DataType.SparseFloatVector)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(65535)
        .enableAnalyzer(true)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { DataType } from "@zilliz/milvus2-sdk-node";

const schema = [
  {
    name: "metadata",
    data_type: DataType.JSON,
  },
  {
    name: "pk",
    data_type: DataType.Int64,
    is_primary_key: true,
  },
  {
    name: "sparse_vector",
    data_type: DataType.SparseFloatVector,
  },
  {
    name: "text",
    data_type: "VarChar",
    enable_analyzer: true,
    enable_match: true,
    max_length: 65535,
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

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema()
schema.WithField(entity.NewField().
    WithName("pk").
    WithDataType(entity.FieldTypeVarChar).
    WithIsAutoID(true).
    WithIsPrimaryKey(true).
    WithMaxLength(100),
).WithField(entity.NewField().
    WithName("sparse_vector").
    WithDataType(entity.FieldTypeSparseVector),
).WithField(entity.NewField().
    WithName("text").
    WithDataType(entity.FieldTypeVarChar).
    WithEnableAnalyzer(true).
    WithMaxLength(65535),
)
```

</TabItem>

<TabItem value='bash'>

```bash
export primaryField='{
    "fieldName": "pk",
    "dataType": "VarChar",
    "isPrimary": true,
    "elementTypeParams": {
        "max_length": 100
    }
}'

export vectorField='{
    "fieldName": "sparse_vector",
    "dataType": "SparseFloatVector"
}'

export textField='{
    "fieldName": "text",
    "dataType": "VarChar",
    "elementTypeParams": {
        "max_length": 65535,
        "enable_analyzer": true
    }
}'

export schema="{
    \"autoID\": true,
    \"fields\": [
        $primaryField,
        $vectorField,
        $textField
    ]
}"
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
schema->AddField(milvus::FieldSchema("pk", milvus::DataType::VARCHAR, "", true, true).WithMaxLength(100));
schema->AddField(milvus::FieldSchema("sparse_vector", milvus::DataType::SPARSE_FLOAT_VECTOR));
schema->AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR).WithMaxLength(65535).EnableAnalyzer(true));
```

</TabItem>
</Tabs>

この例では、3 つのフィールドが追加されています。

- `pk`: このフィールドは `VARCHAR` データ型を使用して主キーを保存し、最大長 100 バイトで自動生成されます。

- `sparse_vector`: このフィールドは `SPARSE_FLOAT_VECTOR` データ型を使用してスパースベクトルを保存します。

- `text`: このフィールドは `VARCHAR` データ型を使用してテキスト文字列を保存し、最大長は 65535 バイトです。

<Admonition type="info" icon="📘" title="Notes">

データ挿入時に、指定したテキストフィールドから Zilliz Cloud がスパースベクトル embedding を生成できるようにするには、関数を用いた追加の手順が必要です。詳細は [Full Text Search](./full-text-search) を参照してください。

</Admonition>

## インデックスパラメータを設定する\{#set-index-parameters}

スパースベクトルのインデックス作成プロセスは [dense vectors](./use-dense-vector) の場合と似ていますが、指定するインデックスタイプ（`index_type`）、距離メトリック（`metric_type`）、およびインデックスパラメータ（`params`）が異なります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="sparse_vector",
    index_name="sparse_auto_index",
    index_type="AUTOINDEX",
    metric_type="IP"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.*;

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("sparse_vector")
        .indexName("sparse_auto_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.IP)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = await client.createIndex({
    field_name: 'sparse_vector',
    metric_type: MetricType.IP,
    index_name: 'sparse_auto_index',
    index_type: IndexType.AUTOINDEX,
});
```

</TabItem>

<TabItem value='go'>

```go
idx := index.NewSparseInvertedIndex(entity.IP, 0.2)
indexOption := milvusclient.NewCreateIndexOption("my_collection", "sparse_vector", idx)
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "sparse_vector",
            "metricType": "IP",
            "indexName": "sparse_auto_index",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc sparse_index("sparse_vector", "sparse_auto_index", milvus::IndexType::AUTOINDEX, milvus::MetricType::IP);
```

</TabItem>
</Tabs>

この例では、メトリックとして `IP` を使用した `SPARSE_INVERTED_INDEX` インデックスタイプを使用します。詳細については、以下のリソースを参照してください。

- [Metric Types](./search-metrics-explained): 異なるフィールド型でサポートされるメトリックタイプ

- [Full Text Search](./full-text-search): 全文検索の詳細なチュートリアル

## Collection を作成する\{#create-collection}

スパースベクトルとインデックス設定が完了したら、スパースベクトルを含む collection を作成できます。以下の例では、[`create_collection`](./manage-collections-sdks) メソッドを使って `my_collection` という名前の collection を作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

await client.createCollection({
    collection_name: 'my_collection',
    schema: schema,
    index_params: indexParams
});
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                        .WithCollectionName("my_collection")
                                        .AddIndex(std::move(sparse_index))
                                        .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## データの挿入\{#insert-data}

collection の作成時に定義したすべてのフィールドに対してデータを指定する必要があります。ただし、自動生成されるフィールド（`auto_id` が有効な主キーなど）は除きます。組み込みの BM25 関数を使用して sparse vector を自動生成する場合は、データ挿入時に sparse vector フィールドも省略する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
data = [
    {
        "text": "information retrieval is a field of study.",
        "sparse_vector": {1: 0.5, 100: 0.3, 500: 0.8}
    },
    {
        "text": "information retrieval focuses on finding relevant information in large datasets.",
        "sparse_vector": {10: 0.1, 200: 0.7, 1000: 0.9}
    }
]

client.insert(
    collection_name="my_collection",
    data=data
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

import java.util.ArrayList;
import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;

Gson gson = new Gson();
List<JsonObject> rows = new ArrayList<>();

{
    JsonObject row = new JsonObject();
    row.addProperty("text", "information retrieval is a field of study.");
    
    SortedMap<Long, Float> sparse = new TreeMap<>();
    sparse.put(1L, 0.5f);
    sparse.put(100L, 0.3f);
    sparse.put(500L, 0.8f);
    row.add("sparse_vector", gson.toJsonTree(sparse));
    rows.add(row);
}
{
    JsonObject row = new JsonObject();
    row.addProperty("text", "information retrieval focuses on finding relevant information in large datasets.");
    
    SortedMap<Long, Float> sparse = new TreeMap<>();
    sparse.put(10L, 0.1f);
    sparse.put(200L, 0.7f);
    sparse.put(1000L, 0.9f);
    row.add("sparse_vector", gson.toJsonTree(sparse));
    rows.add(row);
}

InsertResp insertResp = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    {
        text: 'information retrieval is a field of study.',
        sparse_vector: {1: 0.5, 100: 0.3, 500: 0.8}
    {
        text: 'information retrieval focuses on finding relevant information in large datasets.',
        sparse_vector: {10: 0.1, 200: 0.7, 1000: 0.9}
    },
];

client.insert({
    collection_name: "my_collection",
    data: data
});
```

</TabItem>

<TabItem value='go'>

```go
texts := []string{
    "information retrieval is a field of study.",
    "information retrieval focuses on finding relevant information in large datasets.",
}
textColumn := entity.NewColumnVarChar("text", texts)

// Prepare sparse vectors
sparseVectors := make([]entity.SparseEmbedding, 0, 2)
sparseVector1, _ := entity.NewSliceSparseEmbedding([]uint32{1, 100, 500}, []float32{0.5, 0.3, 0.8})
sparseVectors = append(sparseVectors, sparseVector1)
sparseVector2, _ := entity.NewSliceSparseEmbedding([]uint32{10, 200, 1000}, []float32{0.1, 0.7, 0.9})
sparseVectors = append(sparseVectors, sparseVector2)
sparseVectorColumn := entity.NewColumnSparseVectors("sparse_vector", sparseVectors)

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithColumns(
        sparseVectorColumn,
        textColumn
        
    ))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "data": [
        {
            "text": "information retrieval is a field of study.",
            "sparse_vector": {"1": 0.5, "100": 0.3, "500": 0.8}
        },
        {
            "text": "information retrieval focuses on finding relevant information in large datasets.",
            "sparse_vector": {"10": 0.1, "200": 0.7, "1000": 0.9}
        }     
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::EntityRows data = {{"text", "information retrieval is a field of study.", {"sparse_vector", {{"1", 0.5}, {"100", 0.3}, {"500", 0.8}}}},
                           {{"text", "information retrieval focuses on finding relevant information in large datasets."}, {"sparse_vector", {{"10", 0.1}, {"200", 0.7}, {"1000", 0.9}}}}};
                           
milvus::InsertResponse response;
auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName("my_collection")
                                .WithRowsData(std::move(data)),
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## 類似検索の実行\{#perform-similarity-search}

sparse vector を使用して類似検索を実行するには、クエリデータと検索パラメータの両方を準備します。 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Prepare search parameters
search_params = {
    "params": {"drop_ratio_search": 0.2},  # A tunable drop ratio parameter with a valid range between 0 and 1
}

# Query with sparse vector
query_data = [{1: 0.2, 50: 0.4, 1000: 0.7}]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.request.data.SparseFloatVec;

// Prepare search parameters
Map<String,Object> searchParams = new HashMap<>();
searchParams.put("drop_ratio_search", 0.2);

// Query with the sparse vector
SortedMap<Long, Float> sparse = new TreeMap<>();
sparse.put(1L, 0.2f);
sparse.put(50L, 0.4f);
sparse.put(1000L, 0.7f);
SparseFloatVec queryData = new SparseFloatVec(sparse);
```

</TabItem>

<TabItem value='go'>

```go
// Prepare search parameters
annSearchParams := index.NewCustomAnnParam()
annSearchParams.WithExtraParam("drop_ratio_search", 0.2)

// Query with the sparse vector
queryData, _ := entity.NewSliceSparseEmbedding([]uint32{1, 50, 1000}, []float32{0.2, 0.4, 0.7})
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Prepare search parameters
const searchParams = {drop_ratio_search: 0.2}

// Query with the sparse vector
const queryData = [{1: 0.2, 50: 0.4, 1000: 0.7}]
```

</TabItem>

<TabItem value='bash'>

```bash
# Prepare search parameters
export queryData='["What is information retrieval?"]'

# Query with the sparse vector
export queryData='[{1: 0.2, 50: 0.4, 1000: 0.7}]'
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json query_vector = {{"1", 0.2}, {"50", 0.4}, {"1000", 0.7}};
```

</TabItem>
</Tabs>

次に、`search` メソッドを使用して類似検索を実行します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=query_data,
    limit=3,
    output_fields=["pk"],
    search_params=search_params,
    consistency_level="Strong"
)

print(res)

# Output
# data: ["[{'id': '453718927992172266', 'distance': 0.6299999952316284, 'entity': {'pk': '453718927992172266'}}, {'id': '453718927992172265', 'distance': 0.10000000149011612, 'entity': {'pk': '453718927992172265'}}]"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

SparseFloatVec queryVector = new SparseFloatVec(sparse);

SearchResp searchR = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryData))
        .annsField("sparse_vector")
        .searchParams(searchParams)
        .consistencyLevel(ConsistencyLevel.STRONG)
        .topK(3)
        .outputFields(Collections.singletonList("pk"))
        .build());
        
System.out.println(searchR.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={pk=457270974427187729}, score=0.63, id=457270974427187729), SearchResp.SearchResult(entity={pk=457270974427187728}, score=0.1, id=457270974427187728)]]
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search({
    collection_name: 'my_collection',
    data: queryData,
    limit: 3,
    output_fields: ['pk'],
    params: searchParams,
    consistency_level: "Strong"
});
```

</TabItem>

<TabItem value='go'>

```go
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection",
    3, // limit
    []entity.Vector{queryData},
).WithANNSField("sparse_vector").
    WithOutputFields("pk").
    WithAnnParam(annSearchParams))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("Pks: ", resultSet.GetColumn("pk").FieldData().GetScalars())
}

// Results:
//   IDs:  string_data:{data:"457270974427187705"  data:"457270974427187704"}
//   Scores:  [0.63 0.1]
//   Pks:  string_data:{data:"457270974427187705"  data:"457270974427187704"}
```

</TabItem>

<TabItem value='bash'>

```bash
export params='{
    "consistencyLevel": "Strong"
}'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "data": $queryData,
    "annsField": "sparse_vector",
    "limit": 3,
    "searchParams": $searchParams,
    "outputFields": ["pk"],
    "params": $params
}'

## {"code":0,"cost":0,"data":[{"distance":0.63,"id":"453577185629572535","pk":"453577185629572535"},{"distance":0.1,"id":"453577185629572534","pk":"453577185629572534"}]}
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::SearchRequest()
                   .WithCollectionName("my_collection")
                   .WithAnnsField("sparse_vector")
                   .WithLimit(3)
                   .AddExtraParam("drop_ratio_search", "0.2")
                   .AddOutputField("pk")
                   .AddSparseVector(query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
auto search_results = response.Results();
for (auto& result : search_results.Results()) {
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << "\t" << row << std::endl;
    }
}
```

</TabItem>
</Tabs>

類似検索パラメータの詳細については、[Basic Vector Search](./single-vector-search) を参照してください。

