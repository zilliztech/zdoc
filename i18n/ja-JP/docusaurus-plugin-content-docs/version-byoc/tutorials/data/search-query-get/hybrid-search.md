---
title: "マルチベクトルハイブリッド検索 | BYOC"
slug: /hybrid-search
sidebar_label: "Hybrid Search"
beta: FALSE
notebook: FALSE
description: "多くのアプリケーションでは、タイトルや説明などの豊富な情報セット、またはテキスト、画像、音声などの複数のモダリティでオブジェクトを検索できます。たとえば、テキストと画像の両方が検索クエリの意味に一致する場合、ツイートを検索する必要があります。ハイブリッド検索は、これらの多様な分野での検索を組み合わせることで、検索体験を向上させます。Zillizクラウド複数のベクトル場での検索を可能にし、複数の近似最近傍探索(ANN)検索を同時に実行することで、これをサポートします。マルチベクトルハイブリッド検索は、テキストと画像の両方を検索したい場合、同じオブジェクトを説明する複数のテキストフィールド、または検索品質を向上させるために密集ベクトルと疎ベクトルを検索したい場合に特に役立ちます。 | BYOC"
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
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# マルチベクトルハイブリッド検索

多くのアプリケーションでは、タイトルや説明などの豊富な情報セット、またはテキスト、画像、音声などの複数のモダリティでオブジェクトを検索できます。たとえば、テキストと画像の両方が検索クエリの意味に一致する場合、ツイートを検索する必要があります。ハイブリッド検索は、これらの多様な分野での検索を組み合わせることで、検索体験を向上させます。Zillizクラウド複数のベクトル場での検索を可能にし、複数の近似最近傍探索(ANN)検索を同時に実行することで、これをサポートします。マルチベクトルハイブリッド検索は、テキストと画像の両方を検索したい場合、同じオブジェクトを説明する複数のテキストフィールド、または検索品質を向上させるために密集ベクトルと疎ベクトルを検索したい場合に特に役立ちます。 

![Qx7UwgI6jhrku8bAxZqcYxZMnSe](/img/Qx7UwgI6jhrku8bAxZqcYxZMnSe.png)

マルチベクトルハイブリッド検索は、さまざまな検索方法を統合するか、さまざまなモダリティからの埋め込みをスパンします

- 疎密度ベクトル検索: [密ベクトル](./use-dense-vector)は意味関係を捉えるのに優れており、[疎ベクトル](./use-sparse-vector)は正確なキーワードマッチングに非常に効果的です。ハイブリッド検索は、これらのアプローチを組み合わせて、広範な概念的理解と正確な用語の関連性を提供し、検索結果を改善します。各方法の強みを活用することで、ハイブリッド検索は個別のアプローチの制限を克服し、複雑なクエリに対してより良いパフォーマンスを提供します。以下は、意味検索と全文検索を組み合わせたハイブリッド検索に関するより詳細な[ガイド](https://milvus.io/docs/full_text_search_with_milvus.md)です。

- マルチモーダルベクトル検索:マルチモーダルベクトル検索は、テキスト、画像、音声など、さまざまなデータタイプを横断して検索できる強力な技術です。このアプローチの主な利点は、異なるモダリティを滑らかで一貫性のある検索体験に統一できることです。たとえば、製品検索では、ユーザーはテキストクエリを入力して、テキストと画像の両方で説明された製品を検索することができます。これらのモダリティをハイブリッド検索方法で組み合わせることで、検索精度を向上させたり、検索結果を充実させたりすることができます。

## 例{#example}

各製品にテキストの説明と画像が含まれる実際のユースケースを考えてみましょう。利用可能なデータに基づいて、3種類の検索を行うことができます。

- セマンティックテキスト検索:これには、密なベクトルを使用して製品のテキスト説明をクエリすることが含まれます。テキスト埋め込みは、[BERT](https://zilliz.com/learn/explore-colbert-token-level-embedding-and-ranking-model-for-similarity-search?_gl=1*d243m9*_gcl_au*MjcyNTAwMzUyLjE3NDMxMzE1MjY.*_ga*MTQ3OTI4MDc5My4xNzQzMTMxNTI2*_ga_KKMVYG8YF2*MTc0NTkwODU0Mi45NC4xLjE3NDU5MDg4MzcuMC4wLjA.#A-Quick-Recap-of-BERT)や[トランスフォーマー](https://zilliz.com/learn/NLP-essentials-understanding-transformers-in-AI?_gl=1*d243m9*_gcl_au*MjcyNTAwMzUyLjE3NDMxMzE1MjY.*_ga*MTQ3OTI4MDc5My4xNzQzMTMxNTI2*_ga_KKMVYG8YF2*MTc0NTkwODU0Mi45NC4xLjE3NDU5MDg4MzcuMC4wLjA.)などのモデルや[Open AI](https://zilliz.com/learn/guide-to-using-openai-text-embedding-models)などのサービスを使用して生成できます。

- フルテキスト検索:ここでは、疎ベクトルとキーワードマッチを使用して製品のテキスト説明をクエリします。この目的には、[BM 25](https://zilliz.com/learn/mastering-bm25-a-deep-dive-into-the-algorithm-and-application-in-milvus)のようなアルゴリズムや、[BGE-M 3](https://zilliz.com/learn/bge-m3-and-splade-two-machine-learning-models-for-generating-sparse-embeddings?_gl=1*1cde1oq*_gcl_au*MjcyNTAwMzUyLjE3NDMxMzE1MjY.*_ga*MTQ3OTI4MDc5My4xNzQzMTMxNTI2*_ga_KKMVYG8YF2*MTc0NTkwODU0Mi45NC4xLjE3NDU5MDg4MzcuMC4wLjA.#BGE-M3)や[スプレード](https://zilliz.com/learn/bge-m3-and-splade-two-machine-learning-models-for-generating-sparse-embeddings?_gl=1*ov2die*_gcl_au*MjcyNTAwMzUyLjE3NDMxMzE1MjY.*_ga*MTQ3OTI4MDc5My4xNzQzMTMxNTI2*_ga_KKMVYG8YF2*MTc0NTkwODU0Mi45NC4xLjE3NDU5MDg4MzcuMC4wLjA.#SPLADE)のような疎埋め込みモデルが利用できます。

- **マルチモーダル画像検索:**この方法は、密集ベクトルを使用したテキストクエリを使用して画像をクエリします。画像の埋め込みは、[クリップ](https://zilliz.com/learn/exploring-openai-clip-the-future-of-multimodal-ai-learning)のようなモデルで生成できます。

このガイドでは、商品の生のテキスト説明と画像埋め込みを考慮して、上記の検索方法を組み合わせたマルチモーダルハイブリッド検索の例を説明します。マルチベクトルデータを保存し、リランキング戦略を使用してハイブリッド検索を実行する方法を示します。

## 複数のベクトルフィールドを持つコレクションを作成する{#create-a-collection-with-multiple-vector-fields}

コレクションを作成する過程には、コレクションスキーマの定義、インデックスパラメーターの構成、コレクションの作成の3つの重要なステップがあります。

### スキーマの定義{#define-schema}

マルチベクトルハイブリッド検索では、コレクションスキーマ内に複数のベクトルフィールドを定義する必要があります。デフォルトでは、各コレクションは最大4つのベクトルフィールドを収容できます。ただし、必要に応じて、[お問い合わせ](https://zilliz.com/contact-sales)を使用して、コレクションに最大10個のベクトルフィールドを含めることができます。

この例では、次のフィールドがスキーマに組み込まれています

- `id`:テキストIDを格納するための主キーとして機能します。このフィールドは`INT64`のデータ型です。

- `text`:テキストコンテンツを格納するために使用されます。このフィールドは`VARCHAR`のデータ型で、最大長は1000バイトです。`enable_analyzer`オプションは`True`に設定され、全文検索を容易にします。

- `text_dense`:テキストの高密度ベクトルを格納するために使用されます。このフィールドは、ベクトル次元が768のデータ型`FLOAT_VECTOR`です。

- `text_sparse`:テキストの疎ベクトルを格納するために使用されます。このフィールドは`SPARSE_FLOAT_VECTOR`のデータ型です。

- `image_dense`:商品画像の高密度ベクトルを格納するために使用されます。このフィールドは、ベクトル次元が512のデータ型`FLOAT_VETOR`です。

テキストフィールドの全文検索には、組み込みのBM 25アルゴリズムを使用するため、スキーマにMilvus `Function`を追加する必要があります。詳細については、[フルテキスト検索](./full-text-search)を参照してください。

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

# Init schema with auto_id disabled
schema = MilvusClient.create_schema(auto_id=False)

# Add fields to schema
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, description="product id")
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=1000, enable_analyzer=True, description="raw text of product description")
schema.add_field(field_name="text_dense", datatype=DataType.FLOAT_VECTOR, dim=768, description="text dense embedding")
schema.add_field(field_name="text_sparse", datatype=DataType.SPARSE_FLOAT_VECTOR, description="text sparse embedding auto-generated by the built-in BM25 function")
schema.add_field(field_name="image_dense", datatype=DataType.FLOAT_VECTOR, dim=512, description="image dense embedding")

# Add function to schema
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

// Define fields
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

// define function
const functions = [
    {
      name: "text_bm25_emb",
      description: "text bm25 function",
      type: FunctionType.BM25,
      input_field_names: ["text"],
      output_field_names: ["text_sparse"],
      params: {},
    },
]；
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

### インデックス作成{#create-index}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Prepare index parameters
index_params = client.prepare_index_params()

# Add indexes
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

### コレクションを作成{#create-collection}

前の2つの手順で構成したコレクションスキーマとインデックスを使用して、`demo`という名前のコレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

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

## データの挿入{#insert-data}

このセクションでは、前に定義されたスキーマに基づいて`my_collection`コレクションにデータを挿入します。挿入時には、自動生成された値を持つフィールド以外のすべてのフィールドに正しい形式のデータが提供されるようにしてください。この例では:

- `id`:プロダクトIDを表す整数

- `text`:製品の説明を含む文字列

- `text_dense`:テキスト説明の密集した埋め込みを表す768個の浮動小数点値のリスト

- `image_dense`:商品画像の密な埋め込みを表す512個の浮動小数点値のリスト

各フィールドに対して密集埋め込みを生成するために、同じモデルまたは異なるモデルを使用することができます。この例では、2つの密集埋め込みの次元が異なるため、異なるモデルによって生成されたことを示唆しています。後で各検索を定義する際には、適切なクエリ埋め込みを生成するために対応するモデルを使用するようにしてください。

この例では、組み込みのBM 25関数を使用してテキストフィールドから疎な埋め込みを生成するため、疎なベクトルを手動で提供する必要はありません。ただし、BM 25を使用しない場合は、事前に計算して疎な埋め込みを自分で提供する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

data=[
    {
        "id": 0,
        "text": "Red cotton t-shirt with round neck",
        "text_dense": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, ...],
        "image_dense": [0.6366019600530924, -0.09323198122475052, ...]
    }，
    {
        "id": 1,
        "text": "Wireless noise-cancelling over-ear headphones",
        "text_dense": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, ...],
        "image_dense": [0.6414180010301553, 0.8976979978567611, ...]
    },
    {
        "id": 2,
        "text": "Stainless steel water bottle, 500ml",
        "dense": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, ...],
        "image_dense": [-0.6901259768402174, 0.6100500332193755, ...]
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
row1.addProperty("text", "Red cotton t-shirt with round neck");
row1.add("text_dense", gson.toJsonTree(text_dense1));
row1.add("image_dense", gson.toJsonTree(image_dense));

JsonObject row2 = new JsonObject();
row2.addProperty("id", 1);
row2.addProperty("text", "Wireless noise-cancelling over-ear headphones");
row2.add("text_dense", gson.toJsonTree(text_dense2));
row2.add("image_dense", gson.toJsonTree(image_dense2));

JsonObject row3 = new JsonObject();
row3.addProperty("id", 2);
row3.addProperty("text", "Stainless steel water bottle, 500ml");
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
        "Red cotton t-shirt with round neck",
        "Wireless noise-cancelling over-ear headphones",
        "Stainless steel water bottle, 500ml",
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
    {id: 0, text: "Red cotton t-shirt with round neck" , text_dense: [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, ...], image_dense: [0.6366019600530924, -0.09323198122475052, ...]},
    {id: 1, text: "Wireless noise-cancelling over-ear headphones" , text_dense: [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, ...], image_dense: [0.6414180010301553, 0.8976979978567611, ...]},
    {id: 2, text: "Stainless steel water bottle, 500ml" , text_dense: [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, ...], image_dense: [-0.6901259768402174, 0.6100500332193755, ...]}
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
        {"id": 0, "text": "Red cotton t-shirt with round neck" , "text_dense": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, ...], "image_dense": [0.6366019600530924, -0.09323198122475052, ...]},
        {"id": 1, "text": "Wireless noise-cancelling over-ear headphones" , "text_dense": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, ...], "image_dense": [0.6414180010301553, 0.8976979978567611, ...]},
        {"id": 2, "text": "Stainless steel water bottle, 500ml" , "text_dense": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, ...], "image_dense": [-0.6901259768402174, 0.6100500332193755, ...]}
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>
</Tabs>

## ハイブリッド検索を実行{#perform-hybrid-search}

### 複数のAnn SearchRequestインスタンスを作成{#create-multiple-annsearchrequest-instances}

ハイブリッド検索は、`hybrid_search()`関数で複数の`AnnSearchRequest`を作成することによって実装されます。各`AnnSearchRequest`は、特定のベクトル場に対する基本的なANN検索要求を表します。したがって、ハイブリッド検索を実行する前に、各ベクトル場に対して`AnnSearchRequest`を作成する必要があります。

`AnnSearchRequest`に`expr`パラメータを設定することで、ハイブリッド検索のフィルタリング条件を設定できます。[フィルター検索](./filtered-search)と[フィルタリング](./filtering)を参照してください。

<Admonition type="info" icon="📘" title="ノート">

<p>ハイブリッド検索では、各<code>AnnSearchRequest</code>は1つのクエリデータのみをサポートしています。</p>

</Admonition>

様々な検索ベクトルフィールドの機能を示すために、サンプルクエリを使用して3つの`AnnSearchRequest`検索リクエストを構築します。この過程では、事前に計算された密集ベクトルも使用します。検索リクエストは、以下のベクトルフィールドをターゲットにします

- `text_dense`は、直接的なキーワードの一致ではなく、意味に基づく文脈理解と検索を可能にするセマンティックテキスト検索のためのものです。

- `text_sparse`全文検索またはキーワードの一致に焦点を当て、テキスト内の正確な単語またはフレーズの一致に焦点を当てます。

- `image_dense`は、クエリの意味内容に基づいて関連する商品画像を取得するためのマルチモーダルテキスト画像検索のためのものです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import AnnSearchRequest

query_text = "white headphones, quiet and comfortable"
query_dense_vector = [0.3580376395471989, -0.6023495712049978, 0.5142999509918703, ...]
query_multimodal_vector = [0.015829865178701663, 0.5264158340734488, ...]

# text semantic search (dense)
search_param_1 = {
    "data": [query_dense_vector],
    "anns_field": "text_dense",
    "param": {"nprobe": 10},
    "limit": 2
}
request_1 = AnnSearchRequest(**search_param_1)

# full-text search (sparse)
search_param_2 = {
    "data": [query_text],
    "anns_field": "text_sparse",
    "param": {"drop_ratio_search": 0.2},
    "limit": 2
}
request_2 = AnnSearchRequest(**search_param_2)

# text-to-image search (multimodal)
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

パラメータ`limit`が2に設定されている場合、各`AnnSearchRequest`は2つの検索結果を返します。この例では、3つの`AnnSearchRequest`インスタンスが作成され、合計6つの検索結果が得られます。

### リランキング戦略を設定する{#configure-a-reranking-strategy}

ANN検索結果のセットをマージして再ランキングするには、適切な再ランキング戦略を選択することが不可欠です。Zillizクラウド2種類の再ランキング戦略を提供します。 

- WeightedRanker:特定のベクトル場を強調する必要がある場合は、この戦略を使用してください。WeightedRankerを使用すると、特定のベクトル場により大きな重みを割り当て、それらをより目立たせることができます。

- RRFRanker(相互ランクフュージョンランカー):特定の強調が必要ない場合にこの戦略を選択してください。RRFRankerは、各ベクトル場の重要性を効果的にバランスさせます。

これらの再ランキングメカニズムの詳細については、[リランキング](./reranking)を参照してください。 

この例では、特定の検索クエリに特に重点を置いていないため、RRFRanker戦略を進めます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import RRFRanker

ranker = RRFRanker(100)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.BaseRanker;
import io.milvus.v2.service.vector.request.ranker.RRFRanker;

BaseRanker reranker = new RRFRanker(100);
```

</TabItem>

<TabItem value='go'>

```go
reranker := milvusclient.NewRRFReranker().WithK(100)
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { RRFRanker } from "@zilliz/milvus2-sdk-node";

const rerank = RRFRanker("100");
```

</TabItem>

<TabItem value='bash'>

```bash
export rerank='{
        "strategy": "rrf",
        "params": { "k": 100}
    }'
```

</TabItem>
</Tabs>

</include>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

ranker = Function(
    name="rrf",
    input_field_names=[], # Must be an empty list
    function_type=FunctionType.RERANK,
    params={
        "reranker": "rrf", 
        "k": 100  # Optional
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

</include>

### ハイブリッド検索を実行する{#perform-a-hybrid-search}

Hybrid Searchを開始する前に、コレクションがロードされていることを確認してください。コレクション内のベクトルフィールドにインデックスがない場合やメモリにロードされていない場合、Hybrid Searchメソッドを実行するとエラーが発生します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

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
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/advanced_search" \
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

以下が出力です:

```python
["['id: 1, distance: 0.006047376897186041, entity: {}', 'id: 2, distance: 0.006422005593776703, entity: {}']"]
```

ハイブリッド検索に指定された`limit=2`パラメータで、Zillizクラウド3つの検索から得られた6つの結果を再ランク付けします。最終的に、最も類似した上位2つの結果のみを返します。