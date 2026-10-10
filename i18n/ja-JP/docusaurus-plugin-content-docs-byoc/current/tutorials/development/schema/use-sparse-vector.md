---
title: "スパースベクトル | BYOC"
slug: /use-sparse-vector
sidebar_label: "スパースベクトル"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "スパースベクトルは、情報検索や自然言語処理において、表層的な用語一致を捉えるための重要な手法です。密ベクトルは意味理解に優れていますが、スパースベクトルは、特に特殊な用語やテキスト識別子を検索する際に、より予測可能な一致結果を提供することがよくあります。 | BYOC"
type: origin
token: JbPDwHqd0iZZSuk5tYicGqKbn9c
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# スパースベクトル

スパースベクトルは、情報検索や自然言語処理において、表層的な用語一致を捉えるための重要な手法です。密ベクトルは意味理解に優れていますが、スパースベクトルは、特に特殊な用語やテキスト識別子を検索する際に、より予測可能な一致結果を提供することがよくあります。

## 概要\{#overview}

スパースベクトルは、ほとんどの要素がゼロで、一部の次元のみが非ゼロ値を持つ特殊な高次元ベクトルです。以下の図に示すように、密ベクトルは通常、各位置が値を持つ連続的な配列として表現されます（例: `[0.3, 0.8, 0.2, 0.3, 0.1]`）。一方、スパースベクトルは非ゼロ要素とその次元のインデックスのみを格納し、多くの場合 `{ index: value}` のキーと値のペアとして表現されます（例: `[{2: 0.2}, ..., {9997: 0.5}, {9999: 0.7}]`）。

![VPhswBhHmhJrh3byaVnc3onYnPc](https://zdoc-images.s3.us-west-2.amazonaws.com/VPhswBhHmhJrh3byaVnc3onYnPc.png)

トークン化とスコアリングにより、ドキュメントは bag-of-words ベクトルとして表現でき、各次元は語彙内の特定の単語に対応します。ドキュメントに含まれる単語のみが非ゼロ値を持ち、スパースベクトル表現が生成されます。スパースベクトルは、次の2つのアプローチで生成できます。

- **従来の統計手法**は、[TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)（Term Frequency-Inverse Document Frequency）や [BM25](https://en.wikipedia.org/wiki/Okapi_BM25)（Best Matching 25）などの手法で、コーパス全体における単語の頻度と重要度に基づいて単語に重みを割り当てます。これらの手法は、トークンを表す各次元のスコアとして単純な統計量を計算します。Zilliz Cloud は、BM25 方式によるビルトインの**全文検索**を提供しており、テキストを自動的にスパースベクトルに変換するため、手動での前処理が不要になります。このアプローチは、精度と完全一致が重要となるキーワードベースの検索に最適です。詳細については、[全文検索](./full-text-search) を参照してください。

- **ニューラルスパース埋め込みモデル**は、大規模なデータセットでトレーニングすることによりスパース表現を生成する学習ベースの手法です。これらは通常、Transformer アーキテクチャを採用した深層学習モデルであり、意味的なコンテキストに基づいて用語を拡張し重み付けできます。Zilliz Cloud は、[SPLADE](https://arxiv.org/abs/2109.10086) などのモデルによって外部で生成されたスパース埋め込みもサポートしています。詳細については、[Embeddings](https://milvus.io/docs/embeddings.md#Embedding-Overview) を参照してください。

スパースベクトルと元のテキストは、効率的な取得のために Zilliz Cloud に保存できます。以下の図は、全体的なプロセスを示しています。

![A7FvwnB5bhpBlKbgrzYcQijbnxg](https://zdoc-images.s3.us-west-2.amazonaws.com/A7FvwnB5bhpBlKbgrzYcQijbnxg.png)

<Admonition type="info" title="Notes">

スパースベクトルに加えて、Zilliz Cloud は密ベクトルとバイナリベクトルもサポートしています。密ベクトルは深い意味的関係を捉えるのに最適であり、バイナリベクトルは高速な類似度比較やコンテンツの重複排除といったシナリオに優れています。詳細については、[密ベクトル](./use-dense-vector) と [バイナリベクトル](./use-binary-vector) を参照してください。

</Admonition>

## データ形式\{#data-formats}

以降のセクションでは、SPLADE のような学習済みスパース埋め込みモデルのベクトルを保存する方法を説明します。密ベクトルベースのセマンティック検索を補完するものをお探しの場合は、簡便さの観点から SPLADE よりも [全文検索](./full-text-search) と BM25 の組み合わせをおすすめします。品質評価を実施したうえで SPLADE を使用することを決定した場合は、SPLADE でスパースベクトルを生成する方法について [Embeddings](https://milvus.io/docs/embeddings.md#Embedding-Overview) を参照してください。

Zilliz Cloud は、次の形式のスパースベクトル入力をサポートしています。

- **辞書のリスト（形式は** `{dimension_index: value, ...}`**）**

    ```python
    # Represent each sparse vector using a dictionary
    sparse_vectors = [{27: 0.5, 100: 0.3, 5369: 0.6} , {100: 0.1, 3: 0.8}]
    ```

- **スパース行列（**`scipy.sparse` **クラスを使用）**

    ```python
    from scipy.sparse import csr_matrix
    
    # First vector: indices [27, 100, 5369] with values [0.5, 0.3, 0.6]
    # Second vector: indices [3, 100] with values [0.8, 0.1]
    indices = [[27, 100, 5369], [3, 100]]
    values = [[0.5, 0.3, 0.6], [0.8, 0.1]]
    sparse_vectors = [csr_matrix((vals, ([0]*len(idx), idx)), shape=(1, 5369+1)) for idx, vals in zip(indices, values)]
    ```

- **タプルの反復可能オブジェクトのリスト（例:** `[(dimension_index, value)]`**）**

    ```python
    # Represent each sparse vector using a list of iterables (e.g. tuples)
    sparse_vector = [
        [(27, 0.5), (100, 0.3), (5369, 0.6)],
        [(100, 0.1), (3, 0.8)]
        ]
    ```

## コレクションスキーマを定義する\{#define-collection-schema}

コレクションを作成する前に、コレクションスキーマを指定する必要があります。スキーマではフィールドを定義し、オプションでテキストフィールドを対応するスパースベクトル表現に変換する関数を指定します。

### フィールドを追加する\{#add-fields}

Zilliz Cloud クラスターでスパースベクトルを使用するには、以下のフィールドを含むスキーマを持つコレクションを作成する必要があります。

- スパースベクトルを格納するために予約された `SPARSE_FLOAT_VECTOR` フィールドで、`VARCHAR` フィールドから自動生成されるか、入力データ内で直接指定されます。

- 通常、スパースベクトルが表す生のテキストもコレクションに格納されます。生のテキストの格納には `VARCHAR` フィールドを使用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

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

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;

let client = ClientV2::new(
    &ConnectConfig::new()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN"),
)
.await?;

let schema = CollectionSchema::new()
    .add_field(
        FieldSchema::new()
            .name("pk")
            .data_type(DataType::VarChar)
            .primary_key(true)
            .auto_id(true)
            .max_length(100),
    )
    .add_field(
        FieldSchema::new()
            .name("sparse_vector")
            .data_type(DataType::SparseFloatVector),
    )
    .add_field(
        FieldSchema::new()
            .name("text")
            .data_type(DataType::VarChar)
            .enable_analyzer(true)
            .max_length(65535),
    );
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
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

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType, MetricType, IndexType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

const schema = [
  {
    name: "pk",
    data_type: DataType.VarChar,
    is_primary_key: true,
    autoID: true,
    max_length: 100,
  },
  {
    name: "sparse_vector",
    data_type: DataType.SparseFloatVector,
  },
  {
    name: "text",
    data_type: DataType.VarChar,
    enable_analyzer: true,
    max_length: 65535,
  },
];
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
</Tabs>

この例では、3つのフィールドを追加します。

- `pk`: このフィールドは、`VARCHAR` データ型を使用して主キーを格納します。主キーは最大長 100 バイトで自動生成されます。

- `sparse_vector`: このフィールドは、`SPARSE_FLOAT_VECTOR` データ型を使用してスパースベクトルを格納します。

- `text`: このフィールドは、`VARCHAR` データ型を使用してテキスト文字列を格納します。最大長は 65535 バイトです。

<Admonition type="info" title="Notes">

データ挿入時に、指定されたテキストフィールドからスパースベクトル埋め込みを Zilliz Cloud が生成できるようにするには、関数を含む追加の手順を実行する必要があります。詳細については、[全文検索](./full-text-search) を参照してください。

</Admonition>

## インデックスパラメーターを設定する\{#set-index-parameters}

スパースベクトルのインデックスを作成するプロセスは、[密ベクトル](./use-dense-vector) のプロセスと似ていますが、指定するインデックスタイプ（`index_type`）、距離メトリック（`metric_type`）、インデックスパラメーター（`params`）が異なります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
idx := index.NewSparseInvertedIndex(entity.IP, 0.2)
indexOption := milvusclient.NewCreateIndexOption("my_collection", "sparse_vector", idx)
```

</TabItem>

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let index_param = IndexParam::new()
    .field_name("sparse_vector")
    .index_name("sparse_inverted_index")
    .index_type(IndexType::SparseInvertedIndex)
    .metric_type(MetricType::Ip)
    .extra_params(HashMap::from([(
        "inverted_index_algo".to_string(),
        "DAAT_MAXSCORE".to_string(),
    )]));
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::IndexDesc sparse_index("sparse_vector", "sparse_auto_index", milvus::IndexType::AUTOINDEX, milvus::MetricType::IP);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = {
    field_name: 'sparse_vector',
    metric_type: MetricType.IP,
    index_name: 'sparse_auto_index',
    index_type: IndexType.AUTOINDEX,
};
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
</Tabs>

この例では、メトリックに `IP` を指定した `SPARSE_INVERTED_INDEX` インデックスタイプを使用します。詳細については、以下のリソースを参照してください。

- [メトリクスタイプ](./search-metrics-explained): さまざまなフィールドタイプでサポートされるメトリクスタイプ

- [全文検索](./full-text-search): 全文検索に関する詳細なチュートリアル

## コレクションを作成する\{#create-collection}

スパースベクトルとインデックスの設定が完了したら、スパースベクトルを含むコレクションを作成できます。以下の例では、[`create_collection`](./manage-collections-sdks) メソッドを使用して `my_collection` という名前のコレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

loadTask, err := client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
err = loadTask.Await(ctx)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;

client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name("my_collection")
            .schema(schema)
            .index_params(vec![index_param])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>

auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                        .WithCollectionName("my_collection")
                                        .AddIndex(std::move(sparse_index))
                                        .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createCollection({
    collection_name: 'my_collection',
    schema: schema,
});

await client.createIndex({
    collection_name: 'my_collection',
    ...indexParams,
});

await client.loadCollection({
    collection_name: 'my_collection',
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

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
</Tabs>

## データを挿入する\{#insert-data}

コレクション作成時に定義されたすべてのフィールドのデータを指定する必要があります。ただし、自動生成されるフィールド（`auto_id` が有効な主キーなど）は除きます。ビルトインの BM25 関数を使用してスパースベクトルを自動生成する場合は、データを挿入する際にスパースベクトルフィールドも省略する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
texts := []string{
    "information retrieval is a field of study.",
    "information retrieval focuses on finding relevant information in large datasets.",
}
textColumn := column.NewColumnVarChar("text", texts)

// Prepare sparse vectors
sparseVectors := make([]entity.SparseEmbedding, 0, 2)
sparseVector1, _ := entity.NewSliceSparseEmbedding([]uint32{1, 100, 500}, []float32{0.5, 0.3, 0.8})
sparseVectors = append(sparseVectors, sparseVector1)
sparseVector2, _ := entity.NewSliceSparseEmbedding([]uint32{10, 200, 1000}, []float32{0.1, 0.7, 0.9})
sparseVectors = append(sparseVectors, sparseVector2)
sparseVectorColumn := column.NewColumnSparseVectors("sparse_vector", sparseVectors)

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithColumns(
        sparseVectorColumn,
        textColumn,
    ))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;

client
    .insert(
        InsertRequest::builder()
            .collection_name("my_collection")
            .rows([
                serde_json::json!({"text": "information retrieval is a field of study.", "sparse_vector": {"1": 0.5, "100": 0.3, "500": 0.8}}),
                serde_json::json!({"text": "information retrieval focuses on finding relevant information in large datasets.", "sparse_vector": {"10": 0.1, "200": 0.7, "1000": 0.9}}),
            ])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>

milvus::EntityRows data = {{{"text", "information retrieval is a field of study."}, {"sparse_vector", {{"1", 0.5}, {"100", 0.3}, {"500", 0.8}}}},
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

<TabItem value='javascript'>

```javascript
const data = [
    {
        text: 'information retrieval is a field of study.',
        sparse_vector: {1: 0.5, 100: 0.3, 500: 0.8},
    },
    {
        text: 'information retrieval focuses on finding relevant information in large datasets.',
        sparse_vector: {10: 0.1, 200: 0.7, 1000: 0.9},
    },
];

await client.insert({
    collection_name: "my_collection",
    data: data
});
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
</Tabs>

## 類似検索を実行する\{#perform-similarity-search}

スパースベクトルを使用して類似検索を実行するには、クエリデータと検索パラメーターの両方を準備します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.service.vector.request.data.SparseFloatVec;

import java.util.HashMap;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

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

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

// Prepare search parameters
let search_params = HashMap::from([("drop_ratio_search".to_string(), "0.2".to_string())]);

// Query with the sparse vector
let sparse: SparseVector = [(1, 0.2f32), (50, 0.4f32), (1000, 0.7f32)].into_iter().collect();
```

</TabItem>

<TabItem value='c++'>

```c++
// Prepare search parameters
const std::string drop_ratio_search = "0.2";  // A tunable drop ratio parameter with a valid range between 0 and 1

// Query with the sparse vector
nlohmann::json query_vector = {{"1", 0.2}, {"50", 0.4}, {"1000", 0.7}};
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
export searchParams='{"drop_ratio_search": 0.2}'

# Query with the sparse vector
export queryData='[{"1": 0.2, "50": 0.4, "1000": 0.7}]'
```

</TabItem>
</Tabs>

次に、`search` メソッドを使用して類似検索を実行します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.Collections;

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

<TabItem value='rust'>

```rust
// rust
use milvus::v2::prelude::*;

let results = client
    .search(
        SearchRequest::builder()
            .collection_name("my_collection")
            .vector_field("sparse_vector")
            .vectors(SearchVectors::SparseFloat(vec![sparse]))
            .limit(3)
            .output_fields(["pk"])
            .extra_params(search_params)
            .build()?,
    )
    .await?;

println!("{:?}", results);
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>

auto request = milvus::SearchRequest()
                   .WithCollectionName("my_collection")
                   .WithAnnsField("sparse_vector")
                   .WithLimit(3)
                   .AddExtraParam("drop_ratio_search", drop_ratio_search)
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

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"data\": $queryData,
    \"annsField\": \"sparse_vector\",
    \"limit\": 3,
    \"searchParams\": $searchParams,
    \"outputFields\": [\"pk\"],
    \"consistencyLevel\": \"Strong\"
}"
```

</TabItem>
</Tabs>

類似検索パラメーターの詳細については、[基本的なベクトル検索](./single-vector-search) を参照してください。

