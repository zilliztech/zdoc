---
title: "マルチベクトルハイブリッド検索 | Cloud"
slug: /hybrid-search
sidebar_label: "ハイブリッド検索"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "多くのアプリケーションでは、タイトルや説明文などの豊富な情報を使用してオブジェクトを検索したり、テキスト、画像、音声などの複数のモダリティで検索したりできます。たとえば、テキストと画像が含まれるツイートは、テキストまたは画像が検索クエリのセマンティクスに一致する場合に検索する必要があります。ハイブリッド検索は、これらの多様なフィールドにわたる検索を組み合わせて検索体験を向上させます。Zilliz Cloudは、複数のベクトルフィールドでの検索を許可し、複数の近似最近傍（ANN）検索を同時に実行することでこれをサポートしています。マルチベクトルハイブリッド検索は、テキストと画像の両方を検索したい場合、同じオブジェクトを記述する複数のテキストフィールドを検索したい場合、または検索品質を向上させるために密ベクトルと疎ベクトルを組み合わせたい場合に特に有効です。 | Cloud"
type: origin
token: WTsmwWdgOiKnwpkdZdScp093njh
sidebar_position: 6
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - hybrid search
  - combine sparse and dense vectors
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# マルチベクトルハイブリッド検索

多くのアプリケーションでは、タイトルや説明文などの豊富な情報を使用してオブジェクトを検索したり、テキスト、画像、音声などの複数のモダリティで検索したりできます。たとえば、テキストと画像が含まれるツイートは、テキストまたは画像が検索クエリのセマンティクスに一致する場合に検索する必要があります。ハイブリッド検索は、これらの多様なフィールドにわたる検索を組み合わせて検索体験を向上させます。Zilliz Cloudは、複数のベクトルフィールドでの検索を許可し、複数の近似最近傍（ANN）検索を同時に実行することでこれをサポートしています。マルチベクトルハイブリッド検索は、テキストと画像の両方を検索したい場合、同じオブジェクトを記述する複数のテキストフィールドを検索したい場合、または検索品質を向上させるために密ベクトルと疎ベクトルを組み合わせたい場合に特に有効です。

![Qx7UwgI6jhrku8bAxZqcYxZMnSe](/img/Qx7UwgI6jhrku8bAxZqcYxZMnSe.png)

マルチベクトルハイブリッド検索は、異なる検索方法またはさまざまなモダリティからの埋め込みを統合します。

- **疎密ベクトル検索**：[密ベクトル](./use-dense-vector)はセマンティックな関係を捉えるのに優れている一方、[疎ベクトル](./use-sparse-vector)は正確なキーワードマッチングに非常に効果的です。ハイブリッド検索はこれらのアプローチを組み合わせて、広範な概念的理解と正確な用語の関連性の両方を提供し、検索結果を改善します。各方法の強みを活かすことで、ハイブリッド検索は個々のアプローチの限界を克服し、複雑なクエリに優れたパフォーマンスを提供します。セマンティック検索と全文検索を組み合わせたハイブリッド検索の詳細な[ガイド](https://milvus.io/docs/full_text_search_with_milvus.md)はこちらです。

- **マルチモーダルベクトル検索**：マルチモーダルベクトル検索は、テキスト、画像、音声などさまざまなデータ型を横断して検索できる強力な技術です。このアプローチの主な利点は、異なるモダリティをシームレスで統合された検索体験に統合できる能力です。たとえば、商品検索では、ユーザーはテキストと画像の両方で記述された商品を見つけるためにテキストクエリを入力できます。ハイブリッド検索方法でこれらのモダリティを組み合わせることで、検索の精度を高めたり、検索結果を豊かにしたりできます。

## 例\{#example}

各製品にテキスト説明と画像が含まれる現実のユースケースを考えてみましょう。利用可能なデータに基づいて、3種類の検索を実施できます。

- **セマンティックテキスト検索**：これは、密ベクトルを使用して製品のテキスト説明をクエリします。[BERT](https://zilliz.com/learn/explore-colbert-token-level-embedding-and-ranking-model-for-similarity-search?_gl=1*d243m9*_gcl_au*MjcyNTAwMzUyLjE3NDMxMzE1MjY.*_ga*MTQ3OTI4MDc5My4xNzQzMTMxNTI2*_ga_KKMVYG8YF2*MTc0NTkwODU0Mi45NC4xLjE3NDU5MDg4MzcuMC4wLjA.#A-Quick-Recap-of-BERT)や[Transformers](https://zilliz.com/learn/NLP-essentials-understanding-transformers-in-AI?_gl=1*d243m9*_gcl_au*MjcyNTAwMzUyLjE3NDMxMzE1MjY.*_ga*MTQ3OTI4MDc5My4xNzQzMTMxNTI2*_ga_KKMVYG8YF2*MTc0NTkwODU0Mi45NC4xLjE3NDU5MDg4MzcuMC4wLjA.)などのモデルや[OpenAI](https://zilliz.com/learn/guide-to-using-openai-text-embedding-models)などのサービスを使用してテキスト埋め込みを生成できます。

- **全文検索**：ここでは、疎ベクトルを使用してキーワードマッチで製品のテキスト説明をクエリします。[BM25](https://zilliz.com/learn/mastering-bm25-a-deep-dive-into-the-algorithm-and-application-in-milvus)や[BGE-M3](https://zilliz.com/learn/bge-m3-and-splade-two-machine-learning-models-for-generating-sparse-embeddings?_gl=1*1cde1oq*_gcl_au*MjcyNTAwMzUyLjE3NDMxMzE1MjY.*_ga*MTQ3OTI4MDc5My4xNzQzMTMxNTI2*_ga_KKMVYG8YF2*MTc0NTkwODU0Mi45NC4xLjE3NDU5MDg4MzcuMC4wLjA.#BGE-M3)や[SPLADE](https://zilliz.com/learn/bge-m3-and-splade-two-machine-learning-models-for-generating-sparse-embeddings?_gl=1*ov2die*_gcl_au*MjcyNTAwMzUyLjE3NDMxMzE1MjY.*_ga*MTQ3OTI4MDc5My4xNzQzMTMxNTI2*_ga_KKMVYG8YF2*MTc0NTkwODU0Mi45NC4xLjE3NDU5MDg4MzcuMC4wLjA.#SPLADE)などの疎埋め込みモデルをこの目的に使用できます。

- **マルチモーダル画像検索**：この方法は、密ベクトルを使用してテキストクエリで画像をクエリします。[CLIP](https://zilliz.com/learn/exploring-openai-clip-the-future-of-multimodal-ai-learning)などのモデルで画像埋め込みを生成できます。

このガイドでは、上記の検索方法を組み合わせたマルチモーダルハイブリッド検索の例を説明します。商品の生テキスト説明と画像埋め込みを前提に、マルチベクトルデータを保存し、リランキング戦略でハイブリッド検索を実行する方法を示します。

## 複数のベクトルフィールドを持つコレクションを作成する\{#create-a-collection-with-multiple-vector-fields}

コレクションの作成プロセスには、コレクションスキーマの定義、インデックスパラメータの構成、コレクションの作成の3つの主要なステップがあります。

### スキーマの定義\{#define-schema}

マルチベクトルハイブリッド検索では、コレクションスキーマ内に複数のベクトルフィールドを定義する必要があります。コレクションで許可されるベクトルフィールドの数に関する制限の詳細については、[Zilliz Cloudの制限](./limits#fields)を参照してください。

この例では、スキーマに以下のフィールドを組み込みます。

- `id`：テキストIDを格納するための主キーとして機能します。このフィールドは`INT64`データ型です。

- `text`：テキストコンテンツを格納するために使用されます。このフィールドは`VARCHAR`データ型で、最大長は1000バイトです。`enable_analyzer`オプションは`True`に設定して、全文検索を容易にします。

- `text_dense`：テキストの密ベクトルを格納するために使用されます。このフィールドは768次元の`FLOAT_VECTOR`データ型です。

- `text_sparse`：テキストの疎ベクトルを格納するために使用されます。このフィールドは`SPARSE_FLOAT_VECTOR`データ型です。

- `image_dense`：製品画像の密ベクトルを格納するために使用されます。このフィールドは512次元の`FLOAT_VECTOR`データ型です。

テキストフィールドで全文検索を実行するために組み込みBM25アルゴリズムを使用するため、スキーマにMilvusの`Function`を追加する必要があります。詳細については、[全文検索](./full-text-search)を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient, DataType, Function, FunctionType
)

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# auto_idを無効にしてスキーマを初期化
schema = client.create_schema(auto_id=False)

# スキーマにフィールドを追加
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, description="product id")
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=1000, enable_analyzer=True, description="raw text of product description")
schema.add_field(field_name="text_dense", datatype=DataType.FLOAT_VECTOR, dim=768, description="text dense embedding")
schema.add_field(field_name="text_sparse", datatype=DataType.SPARSE_FLOAT_VECTOR, description="text sparse embedding auto-generated by the built-in BM25 function")
schema.add_field(field_name="image_dense", datatype=DataType.FLOAT_VECTOR, dim=512, description="image dense embedding")

# スキーマに関数を追加
bm25_function = Function(
    name="text_bm25_emb",
    input_field_names=["text"],
    output_field_names=["text_sparse"],
    function_type=FunctionType.BM25,
)
schema.add_function(bm25_function)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;

import java.util.*;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

CreateCollectionReq.CollectionSchema schema = client.createSchema();

schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(false)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .enableAnalyzer(true)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("text_dense")
        .dataType(DataType.FloatVector)
        .dimension(768)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("text_sparse")
        .dataType(DataType.SparseFloatVector)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("image_dense")
        .dataType(DataType.FloatVector)
        .dimension(512)
        .build());

schema.addFunction(Function.builder()
        .functionType(FunctionType.BM25)
        .name("text_bm25_emb")
        .inputFieldNames(Collections.singletonList("text"))
        .outputFieldNames(Collections.singletonList("text_sparse"))
        .build());
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

function := entity.NewFunction().
    WithName("text_bm25_emb").
    WithInputFields("text").
    WithOutputFields("text_sparse").
    WithType(entity.FunctionTypeBM25)

schema := entity.NewSchema()

schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("text").
    WithDataType(entity.FieldTypeVarChar).
    WithEnableAnalyzer(true).
    WithMaxLength(1000),
).WithField(entity.NewField().
    WithName("text_dense").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(768),
).WithField(entity.NewField().
    WithName("text_sparse").
    WithDataType(entity.FieldTypeSparseVector),
).WithField(entity.NewField().
    WithName("image_dense").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(512),
).WithFunction(function)
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// フィールドを定義
const fields = [
    {
        name: "id",
        data_type: DataType.Int64,
        is_primary_key: true,
        auto_id: false
    },
    {
        name: "text",
        data_type: DataType.VarChar,
        max_length: 1000,
        enable_match: true
    },
    {
        name: "text_dense",
        data_type: DataType.FloatVector,
        dim: 768
    },
    {
        name: "text_sparse",
        data_type: DataType.SPARSE_FLOAT_VECTOR
    },
    {
        name: "image_dense",
        data_type: DataType.FloatVector,
        dim: 512
    }
];

// 関数を定義
const functions = [
    {
      name: "text_bm25_emb",
      description: "text bm25 function",
      type: FunctionType.BM25,
      input_field_names: ["text"],
      output_field_names: ["text_sparse"],
      params: {},
    },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export bm25Function='{
    "name": "text_bm25_emb",
    "type": "BM25",
    "inputFieldNames": ["text"],
    "outputFieldNames": ["text_sparse"],
    "params": {}
}'

export schema='{
        "autoId": false,
        "functions": [$bm25Function],
        "fields": [
            {
                "fieldName": "id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "text",
                "dataType": "VarChar",
                "elementTypeParams": {
                    "max_length": 1000,
                    "enable_analyzer": true
                }
            },
            {
                "fieldName": "text_dense",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "768"
                }
            },
            {
                "fieldName": "text_sparse",
                "dataType": "SparseFloatVector"
            },
            {
                "fieldName": "image_dense",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "512"
                }
            }
        ]
    }'
```

</TabItem>
</Tabs>

### インデックスの作成\{#create-index}

コレクションスキーマを定義した後、次のステップはベクトルインデックスを構成し、類似性メトリックを指定することです。この例では：

- `text_dense_index`：テキスト密ベクトルフィールドに対して、`IP`メトリックタイプを持つ`AUTOINDEX`タイプのインデックスが作成されます。

- `text_sparse_index`：テキスト疎ベクトルフィールドに対して、`BM25`メトリックタイプを持つ`SPARSE_INVERTED_INDEX`タイプのインデックスが使用されます。

- `image_dense_index`：画像密ベクトルフィールドに対して、`IP`メトリックタイプを持つ`AUTOINDEX`タイプのインデックスが作成されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# インデックスパラメータを準備
index_params = client.prepare_index_params()

# インデックスを追加
index_params.add_index(
    field_name="text_dense",
    index_name="text_dense_index",
    index_type="AUTOINDEX",
    metric_type="IP"
)

index_params.add_index(
    field_name="text_sparse",
    index_name="text_sparse_index",
    index_type="AUTOINDEX",
    metric_type="BM25"
)

index_params.add_index(
    field_name="image_dense",
    index_name="image_dense_index",
    index_type="AUTOINDEX",
    metric_type="IP"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.*;

Map<String, Object> denseParams = new HashMap<>();

IndexParam indexParamForTextDense = IndexParam.builder()
        .fieldName("text_dense")
        .indexName("text_dense_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.IP)
        .build();

Map<String, Object> sparseParams = new HashMap<>();
sparseParams.put("inverted_index_algo": "DAAT_MAXSCORE");
IndexParam indexParamForTextSparse = IndexParam.builder()
        .fieldName("text_sparse")
        .indexName("text_sparse_index")
        .indexType(IndexParam.IndexType.SPARSE_INVERTED_INDEX)
        .metricType(IndexParam.MetricType.BM25)
        .extraParams(sparseParams)
        .build();

IndexParam indexParamForImageDense = IndexParam.builder()
        .fieldName("image_dense")
        .indexName("image_dense_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.IP)
        .build();

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(indexParamForTextDense);
indexParams.add(indexParamForTextSparse);
indexParams.add(indexParamForImageDense);
```

</TabItem>

<TabItem value='go'>

```go
indexOption1 := milvusclient.NewCreateIndexOption("my_collection", "text_dense",
    index.NewAutoIndex(index.MetricType(entity.IP)))
indexOption2 := milvusclient.NewCreateIndexOption("my_collection", "text_sparse",
    index.NewSparseInvertedIndex(entity.BM25, 0.2))
indexOption3 := milvusclient.NewCreateIndexOption("my_collection", "image_dense",
    index.NewAutoIndex(index.MetricType(entity.IP)))
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const index_params = [{
    field_name: "text_dense",
    index_name: "text_dense_index",
    index_type: "AUTOINDEX",
    metric_type: "IP"
},{
    field_name: "text_sparse",
    index_name: "text_sparse_index",
    index_type: "IndexType.SPARSE_INVERTED_INDEX",
    metric_type: "BM25",
    params: {
      inverted_index_algo: "DAAT_MAXSCORE",
    }
},{
    field_name: "image_dense",
    index_name: "image_dense_index",
    index_type: "AUTOINDEX",
    metric_type: "IP"
}]
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "text_dense",
            "metricType": "IP",
            "indexName": "text_dense_index",
            "indexType":"AUTOINDEX"
        },
        {
            "fieldName": "text_sparse",
            "metricType": "BM25",
            "indexName": "text_sparse_index",
            "indexType": "SPARSE_INVERTED_INDEX",
            "params":{"inverted_index_algo": "DAAT_MAXSCORE"}
        },
        {
            "fieldName": "image_dense",
            "metricType": "IP",
            "indexName": "image_dense_index",
            "indexType":"AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

### コレクションの作成\{#create-collection}

前回の2つのステップで設定したコレクションスキーマとインデックスを使用して、`demo`という名前のコレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexParams)
        .build();
client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOption1, indexOption2))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.createCollection({
    collection_name: "my_collection",
    fields: fields,
    index_params: index_params,
})
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
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## データの挿入\{#insert-data}

このセクションでは、以前に定義したスキーマに基づいて`my_collection`コレクションにデータを挿入します。挿入時には、自動生成される値を持つフィールドを除き、すべてのフィールドに正しい形式でデータを提供してください。この例では：

- `id`：製品IDを表す整数

- `text`：製品説明を含む文字列

- `text_dense`：テキスト説明の密埋め込みを表す768個の浮動小数点値のリスト

- `image_dense`：製品画像の密埋め込みを表す512個の浮動小数点値のリスト

各フィールドの密埋め込みを生成するために同じまたは異なるモデルを使用できます。この例では、2つの密埋め込みに異なる次元があり、異なるモデルによって生成されたことを示しています。後の各検索を定義する際には、対応するモデルを使用して適切なクエリ埋め込みを生成してください。

この例では、テキストフィールドから疎埋め込みを生成するために組み込みBM25関数を使用しているため、手動で疎ベクトルを提供する必要はありません。ただし、BM25を使用しない場合は、疎埋め込みを事前に計算して自分で提供する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
import random

# 例のベクトルを生成
def generate_dense_vector(dim):
    return [random.random() for _ in range(dim)]

data=[
    {
        "id": 0,
        "text": "ラウンドネックの赤いコットンTシャツ",
        "text_dense": generate_dense_vector(768),
        "image_dense": generate_dense_vector(512)
    },
    {
        "id": 1,
        "text": "ワイヤレスノイズキャンセリングオーバーヘッドヘッドフォン",
        "text_dense": generate_dense_vector(768),
        "image_dense": generate_dense_vector(512)
    },
    {
        "id": 2,
        "text": "ステンレススチール製水筒、500ml",
        "text_dense": generate_dense_vector(768),
        "image_dense": generate_dense_vector(512)
    }
]

res = client.insert(
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

Gson gson = new Gson();
JsonObject row1 = new JsonObject();
row1.addProperty("id", 0);
row1.addProperty("text", "ラウンドネックの赤いコットンTシャツ");
row1.add("text_dense", gson.toJsonTree(text_dense1));
row1.add("image_dense", gson.toJsonTree(image_dense));

JsonObject row2 = new JsonObject();
row2.addProperty("id", 1);
row2.addProperty("text", "ワイヤレスノイズキャンセリングオーバーヘッドヘッドフォン");
row2.add("text_dense", gson.toJsonTree(text_dense2));
row2.add("image_dense", gson.toJsonTree(image_dense2));

JsonObject row3 = new JsonObject();
row3.addProperty("id", 2);
row3.addProperty("text", "ステンレススチール製水筒、500ml");
row3.add("text_dense", gson.toJsonTree(dense3));
row3.add("image_dense", gson.toJsonTree(sparse3));

List<JsonObject> data = Arrays.asList(row1, row2, row3);
InsertReq insertReq = InsertReq.builder()
        .collectionName("my_collection")
        .data(data)
        .build();

InsertResp insertResp = client.insert(insertReq);
```

</TabItem>

<TabItem value='go'>

```go
_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithInt64Column("id", []int64{0, 1, 2}).
    WithVarcharColumn("text", []string{
        "ラウンドネックの赤いコットンTシャツ",
        "ワイヤレスノイズキャンセリングオーバーヘッドヘッドフォン",
        "ステンレススチール製水筒、500ml",
    }).
    WithFloatVectorColumn("text_dense", 768, [][]float32{
        {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, ...},
        {0.19886812562848388, 0.06023560599112088, 0.6976963061752597, ...},
        {0.43742130801983836, -0.5597502546264526, 0.6457887650909682, ...},
    }).
    WithFloatVectorColumn("image_dense", 512, [][]float32{
        {0.6366019600530924, -0.09323198122475052, ...},
        {0.6414180010301553, 0.8976979978567611, ...},
        {-0.6901259768402174, 0.6100500332193755, ...},
    }).
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

var data = [
    {id: 0, text: "ラウンドネックの赤いコットンTシャツ" , text_dense: [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, ...], image_dense: [0.6366019600530924, -0.09323198122475052, ...]},
    {id: 1, text: "ワイヤレスノイズキャンセリングオーバーヘッドヘッドフォン" , text_dense: [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, ...], image_dense: [0.6414180010301553, 0.8976979978567611, ...]},
    {id: 2, text: "ステンレススチール製水筒、500ml" , text_dense: [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, ...], image_dense: [-0.6901259768402174, 0.6100500332193755, ...]}
]

var res = await client.insert({
    collection_name: "my_collection",
    data: data,
})
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "data": [
        {"id": 0, "text": "ラウンドネックの赤いコットンTシャツ" , "text_dense": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, ...], "image_dense": [0.6366019600530924, -0.09323198122475052, ...]},
        {"id": 1, "text": "ワイヤレスノイズキャンセリングオーバーヘッドヘッドフォン" , "text_dense": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, ...], "image_dense": [0.6414180010301553, 0.8976979978567611, ...]},
        {"id": 2, "text": "ステンレススチール製水筒、500ml" , "text_dense": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, ...], "image_dense": [-0.6901259768402174, 0.6100500332193755, ...]}
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## ハイブリッド検索の実行\{#perform-hybrid-search}

### ステップ1：複数のAnnSearchRequestインスタンスを作成\{#step-1-create-multiple-annsearchrequest-instances}

ハイブリッド検索は、`hybrid_search()`関数で複数の`AnnSearchRequest`を作成することによって実装されます。各`AnnSearchRequest`は、特定のベクトルフィールド用の基本的なANN検索リクエストを表します。したがって、ハイブリッド検索を実施する前に、各ベクトルフィールド用の`AnnSearchRequest`を作成する必要があります。

さらに、`AnnSearchRequest`で`expr`パラメータを構成することにより、ハイブリッド検索のフィルタリング条件を設定できます。[フィルター検索](./filtered-search)および[フィルタリングの説明](./filtering-overview)を参照してください。

<Admonition type="info" icon="📘" title="ノート">

<p>ハイブリッド検索では、各<code>AnnSearchRequest</code>は1つのクエリデータのみをサポートします。</p>

</Admonition>

さまざまな検索ベクトルフィールドの機能を示すために、サンプルクエリを使用して3つの`AnnSearchRequest`検索リクエストを作成します。このプロセスで事前に計算された密ベクトルも使用します。検索リクエストは、以下のベクトルフィールドを対象とします。

- `text_dense`はセマンティックなテキスト検索用で、直接のキーワード一致ではなく意味に基づいた文脈的理解と取得を可能にします。

- `text_sparse`は全文検索またはキーワード一致用で、テキスト内の正確な単語または語句の一致に焦点を当てます。

- `image_dense`はマルチモーダルなテキストから画像への検索用で、クエリのセマンティックなコンテンツに基づいて関連する製品画像を取得します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import AnnSearchRequest

query_text = "white headphones, quiet and comfortable"
query_dense_vector = generate_dense_vector(768)
query_multimodal_vector = generate_dense_vector(512)

# テキストセマンティック検索（密）
search_param_1 = {
    "data": [query_dense_vector],
    "anns_field": "text_dense",
    "param": {"nprobe": 10},
    "limit": 2
}
request_1 = AnnSearchRequest(**search_param_1)

# 全文検索（疎）
search_param_2 = {
    "data": [query_text],
    "anns_field": "text_sparse",
    "param": {"drop_ratio_search": 0.2},
    "limit": 2
}
request_2 = AnnSearchRequest(**search_param_2)

# テキストから画像への検索（マルチモーダル）
search_param_3 = {
    "data": [query_multimodal_vector],
    "anns_field": "image_dense",
    "param": {"nprobe": 10},
    "limit": 2
}
request_3 = AnnSearchRequest(**search_param_3)

reqs = [request_1, request_2, request_3]

```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.request.data.BaseVector;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.request.data.SparseFloatVec;
import io.milvus.v2.service.vector.request.data.EmbeddedText;

float[] queryDense = new float[]{-0.0475336798f,  0.0521207601f,  0.0904406682f, ...};
float[] queryMultimodal = new float[]{0.0158298651f, 0.5264158340f, ...}

List<BaseVector> queryTexts = Collections.singletonList(new EmbeddedText("white headphones, quiet and comfortable");)
List<BaseVector> queryDenseVectors = Collections.singletonList(new FloatVec(queryDense));
List<BaseVector> queryMultimodalVectors = Collections.singletonList(new FloatVec(queryMultimodal));

List<AnnSearchReq> searchRequests = new ArrayList<>();
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("text_dense")
        .vectors(queryDenseVectors)
        .params("{\"nprobe\": 10}")
        .topK(2)
        .build());
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("text_sparse")
        .vectors(queryTexts)
        .params("{\"drop_ratio_search\": 0.2}")
        .topK(2)
        .build());
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("image_dense")
        .vectors(queryMultimodalVectors)
        .params("{\"nprobe\": 10}")
        .topK(2)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
queryText := entity.Text({"white headphones, quiet and comfortable"})
queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, ...}
queryMultimodalVector := []float32{0.015829865178701663, 0.5264158340734488, ...}

request1 := milvusclient.NewAnnRequest("text_dense", 2, entity.FloatVector(queryVector)).
    WithAnnParam(index.NewIvfAnnParam(10))

annParam := index.NewSparseAnnParam()
annParam.WithDropRatio(0.2)
request2 := milvusclient.NewAnnRequest("text_sparse", 2, queryText).
    WithAnnParam(annParam)

request3 := milvusclient.NewAnnRequest("image_dense", 2, entity.FloatVector(queryMultimodalVector)).
    WithAnnParam(index.NewIvfAnnParam(10))
```

</TabItem>

<TabItem value='javascript'>

```javascript
const query_text = "white headphones, quiet and comfortable"
const query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, ...]
const query_multimodal_vector = [0.015829865178701663, 0.5264158340734488, ...]

const search_param_1 = {
    "data": query_vector,
    "anns_field": "text_dense",
    "param": {"nprobe": 10},
    "limit": 2
}

const search_param_2 = {
    "data": query_text,
    "anns_field": "text_sparse",
    "param": {"drop_ratio_search": 0.2},
    "limit": 2
}

const search_param_3 = {
    "data": query_multimodal_vector,
    "anns_field": "image_dense",
    "param": {"nprobe": 10},
    "limit": 2
}
```

</TabItem>

<TabItem value='bash'>

```bash
export req='[
    {
        "data": [[0.3580376395471989, -0.6023495712049978, 0.18414012509913835, ...]],
        "annsField": "text_dense",
        "params": {"nprobe": 10},
        "limit": 2
    },
    {
        "data": ["white headphones, quiet and comfortable"],
        "annsField": "text_sparse",
        "params": {"drop_ratio_search": 0.2},
        "limit": 2
    },
    {
        "data": [[0.015829865178701663, 0.5264158340734488, ...]],
        "annsField": "image_dense",
        "params": {"nprobe": 10},
        "limit": 2
    }
 ]'
```

</TabItem>
</Tabs>

`limit`パラメータが2に設定されているため、各`AnnSearchRequest`は2つの検索結果を返します。この例では3つの`AnnSearchRequest`インスタンスが作成され、合計で6つの検索結果が得られます。

### ステップ2：リランキング戦略の構成\{#step-2-configure-a-reranking-strategy}

ANN検索結果のセットを統合・リランキングし、適切なリランキング戦略を選択するには、選択が不可欠です。Zilliz Cloudは複数のタイプのリランキング戦略を提供しています。これらのリランキングメカニズムの詳細については、[重み付きランカー](./reranking-weighted-reranker)または[RRFランカー](./reranking-rrf)を参照してください。

この例では、特定の検索クエリに特に重点を置くことはないため、RRFRanker戦略を進めます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
ranker = Function(
    name="rrf",
    input_field_names=[], # 空のリストでなければならない
    function_type=FunctionType.RERANK,
    params={
        "reranker": "rrf",
        "k": 100  # オプショナル
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;

Function ranker = Function.builder()
        .name("rrf")
        .functionType(FunctionType.RERANK)
        .param("reranker", "rrf")
        .param("k", "100")
        .build()
```

</TabItem>

<TabItem value='javascript'>

```javascript
const rerank = {
  name: 'rrf',
  description: 'bm25 function',
  type: FunctionType.RERANK,
  input_field_names: [],
  params: {
      "reranker": "rrf",
      "k": 100
  },
};
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
)

ranker := entity.NewFunction().
    WithName("rrf").
    WithType(entity.FunctionTypeRerank).
    WithParam("reranker", "rrf").
    WithParam("k", "100")
```

</TabItem>

<TabItem value='bash'>

```bash
# Restful
export functionScore='{
    "functions": [
        {
            "name": "rrf",
            "type": "Rerank",
            "inputFieldNames": [],
            "params": {
                "reranker": "rrf",
                "k": 100
            }
        }
    ]
}'

```

</TabItem>
</Tabs>

### ステップ3：ハイブリッド検索の実行\{#step-3-perform-a-hybrid-search}

ハイブリッド検索を開始する前に、コレクションがロードされていることを確認してください。コレクション内のベクトルフィールドにインデックスがない場合、またはメモリにロードされていない場合は、ハイブリッド検索メソッドの実行時にエラーが発生します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.hybrid_search(
    collection_name="my_collection",
    reqs=reqs,
    ranker=ranker,
    limit=2
)
for hits in res:
    print("TopK results:")
    for hit in hits:
        print(hit)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

HybridSearchReq hybridSearchReq = HybridSearchReq.builder()
        .collectionName("my_collection")
        .searchRequests(searchRequests)
        .ranker(reranker)
        .topK(2)
        .build();

SearchResp searchResp = client.hybridSearch(hybridSearchReq);
```

</TabItem>

<TabItem value='go'>

```go
resultSets, err := client.HybridSearch(ctx, milvusclient.NewHybridSearchOption(
    "my_collection",
    2,
    request1,
    request2,
    request3,
).WithReranker(reranker))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

res = await client.loadCollection({
    collection_name: "my_collection"
})

import { MilvusClient, RRFRanker, WeightedRanker } from '@zilliz/milvus2-sdk-node';

const search = await client.search({
  collection_name: "my_collection",
  data: [search_param_1, search_param_2, search_param_3],
  limit: 2,
  rerank: rerank
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/hybrid_search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_collection\",
    \"search\": ${req},
    \"rerank\": {
        \"strategy\":\"rrf\",
        \"params\": ${rerank}
    },
    \"limit\": 2
}"
```

</TabItem>
</Tabs>

以下は出力です。

```python
["['id: 1, distance: 0.006047376897186041, entity: {}', 'id: 2, distance: 0.006422005593776703, entity: {}']"]
```

`limit=2`パラメータがハイブリッド検索に対して指定されているため、Zilliz Cloudは3つの検索から得られた6つの結果をリランキングします。最終的に、最も類似した上位2つの結果のみが返されます。