---
title: "ハイブリッド検索 | Cloud"
slug: /hybrid-search
sidebar_label: "ハイブリッド検索"
beta: FALSE
notebook: FALSE
description: "ハイブリッド検索とは、複数のANN検索を同時に実行し、それらのANN検索から複数の結果セットを再ランク付けし、最終的に単一の結果セットを返す検索方法を指します。ハイブリッド検索を使用することで、検索精度を向上させることができます。Zilliz Cloudは、複数のベクトルフィールドを持つコレクションでハイブリッド検索を実行することをサポートしています。 | Cloud"
type: origin
token: TPwUw1z9XiJalhkJAFdcyq5ZnCc
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - hybrid search
  - combine sparse and dense vectors
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ハイブリッド検索

ハイブリッド検索とは、複数のANN検索を同時に実行し、それらのANN検索から複数の結果セットを再ランク付けし、最終的に単一の結果セットを返す検索方法を指します。ハイブリッド検索を使用することで、検索精度を向上させることができます。Zilliz Cloudは、複数のベクトルフィールドを持つコレクションでハイブリッド検索を実行することをサポートしています。

ハイブリッド検索は、疎密度ベクトル検索やマルチモーダル検索などのシナリオで最も一般的に使用されます。このガイドでは、特定の例を使用して、Zilliz Cloudでハイブリッド検索を実行する方法を示します。

## シナリオ{#scenarios}

ハイブリッド検索は、次の2つのシナリオに適しています:

### 疎密度ベクトル検索{#sparse-dense-vector-search}

異なる種類のベクトルは異なる情報を表すことができ、様々な埋め込みモデルを使用することで、データの異なる特徴や側面をより包括的に表現することができます。例えば、同じ文に対して異なる埋め込みモデルを使用することで、意味的な意味を表す密なベクトルと、文中の単語の頻度を表す疎なベクトルを生成することができます。

- **疎ベクトル:**疎ベクトルは、高いベクトル次元と非ゼロ値の存在が特徴です。この構造により、従来の情報検索アプリケーションに特に適しています。ほとんどの場合、疎ベクトルで使用される次元数は、1つ以上の言語で異なるトークンに対応しています。各次元には、ドキュメント内でそのトークンの相対的な重要性を示す値が割り当てられます。このレイアウトは、キーワードマッチングを必要とするタスクに有利です。

- **密集ベクトル:**密集ベクトルは、ニューラルネットワークから派生した埋め込みです。順序付けられた配列に配置されると、これらのベクトルは入力テキストの意味論的本質を捉えます。密集ベクトルはテキスト処理に限定されず、視覚データの意味論を表現するためにコンピュータビジョンでも広く使用されています。これらの密集ベクトルは、通常、テキスト埋め込みモデルによって生成され、ほとんどまたはすべての要素が非ゼロであることを特徴としています。したがって、密集ベクトルは、正確なキーワード一致がなくてもベクトル距離に基づいて最も類似した結果を返すことができるため、意味論的検索アプリケーションに特に効果的です。この機能により、キーワードベースのアプローチでは見逃される可能性がある概念間の関係を捉えることができ、より微妙で文脈に応じた検索結果が得られます。

詳細については、「[疎ベクトル](./use-sparse-vector)」と「[密集ベクトル](./use-dense-vector)」を参照してください。

### マルチモーダル検索{#multimodal-search}

マルチモーダル検索とは、複数のモダリティ(画像、動画、音声、テキストなど)にわたる非構造化データの類似性検索を指します。例えば、指紋、声紋、顔の特徴など、様々なモダリティのデータを使用して人物を表現することができます。ハイブリッド検索は、複数の検索を同時にサポートしています。例えば、類似した指紋と声紋を持つ人物を検索することができます。

## ワークフロー{#workflow}

ハイブリッド検索を実行するための主なワークフローは次のとおりです:

1. [BERT](https://zilliz.com/learn/explore-colbert-token-level-embedding-and-ranking-model-for-similarity-search#A-Quick-Recap-of-BERT)や[Transformers](https://zilliz.com/learn/NLP-essentials-understanding-transformers-in-AI)などの埋め込みモデルを使用して、密集したベクトルを生成します。

1. [BM25](https://zilliz.com/learn/mastering-bm25-a-deep-dive-into-the-algorithm-and-application-in-milvus)、[BGE](https://zilliz.com/learn/bge-m3-and-splade-two-machine-learning-models-for-generating-sparse-embeddings#BGE-M3)[-M3](https://zilliz.com/learn/bge-m3-and-splade-two-machine-learning-models-for-generating-sparse-embeddings#BGE-M3)、[SPLADE](https://zilliz.com/learn/bge-m3-and-splade-two-machine-learning-models-for-generating-sparse-embeddings#SPLADE)などの埋め込みモデルを使用して疎ベクトルを生成[し](https://zilliz.com/learn/bge-m3-and-splade-two-machine-learning-models-for-generating-sparse-embeddings#SPLADE)ます。

1. Zilliz Cloudにコレクションを作成し、密集ベクトルフィールドと疎ベクトルフィールドの両方を含むコレクションスキーマを定義します。

1. 前のステップで作成したコレクションに疎密度ベクトルを挿入します。

1. ハイブリッド検索の実行:密なベクトルに対するANN検索は、上位K件の最も類似した結果のセットを返し、疎なベクトルに対するテキストマッチも上位K件の結果のセットを返します。

1. 正規化:上位Kの2つの結果のスコアを正規化し、[0,1]の範囲に変換します。

1. 適切な再ランキング戦略を選択して、2つのトップKの結果セットをマージして再ランキングし、最終的にトップKの結果セットを返します。

![SLTxwACw6hp4Dhb0d3DcmCTLnfd](/img/ja-JP/SLTxwACw6hp4Dhb0d3DcmCTLnfd.png)

## 例{#examples}

このセクションでは、テキスト検索の精度を高めるために疎密度ベクトルでハイブリッド検索を実行する方法を説明するために、具体的な例を使用します。

### 複数のベクトルフィールドを持つコレクションを作成する{#create-a-collection-with-multiple-vector-fields}

コレクションを作成する過程には、コレクションスキーマの定義、インデックスパラメーターの構成、コレクションの作成の3つの部分があります。

#### スキーマの定義{#define-schema}

この例では、コレクションスキーマ内で複数のベクトルフィールドを定義する必要があります。現在、各コレクションはデフォルトで最大4つのベクトルフィールドを含めることができます。ただし、必要に応じて`proxy.maxVectorFieldNum`の値を変更して、コレクションに最大10個のベクトルフィールドを含めることもできます。

次の例では、`dense`と`sparse`が2つのベクトルフィールドであるコレクションスキーマを定義します。

- `id`:このフィールドは、テキストIDを格納するためのプライマリキーとして機能します。このフィールドのデータ型はINT64です。

- `text`:このフィールドは、テキストコンテンツを格納するために使用されます。このフィールドのデータ型はVARCHARで、最大長は1000文字です。

- `dense`:このフィールドは、テキストの密度ベクトルを格納するために使用されます。このフィールドのデータ型はFLOAT_VECTORで、ベクトルの次元は768です。

- `sparse`:このフィールドは、テキストの疎なベクトルを格納するために使用されます。このフィールドのデータ型はSPARSE_FLOAT_VECTORです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Create a collection in customized setup mode
from pymilvus import (
    MilvusClient, DataType
)

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create schema
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=True,
)
# Add fields to schema
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=1000)
schema.add_field(field_name="sparse", datatype=DataType.SPARSE_FLOAT_VECTOR)
schema.add_field(field_name="dense", datatype=DataType.FLOAT_VECTOR, dim=5)
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
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("dense")
        .dataType(DataType.FloatVector)
        .dimension(768)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("sparse")
        .dataType(DataType.SparseFloatVector)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// WIP
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// Create a collection in customized setup mode
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
        max_length: 1000
    },
    {
        name: "sparse",
        data_type: DataType.SPARSE_FLOAT_VECTOR
    },
    {
        name: "dense",
        data_type: DataType.FloatVector,
        dim: 768
    }
]
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
        "autoId": false,
        "enabledDynamicField": true,
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
                    "max_length": 1000
                }
            },
            {
                "fieldName": "sparse",
                "dataType": "SparseFloatVector"
            },
            {
                "fieldName": "dense",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "768"
                }
            }
        ]
    }'
```

</TabItem>
</Tabs>

スパースベクトル検索では、全文検索機能を利用してスパース埋め込みベクトルを生成する過程を簡素化できます。詳細については、「[フルテキスト検索](./full-text-search)」を参照してください。

#### インデックス作成{#create-index}

コレクションスキーマを定義した後、ベクトルインデックスと類似度メトリックを設定する必要があります。この例では、AUTOINDEX**型** のインデックスが、密度の高いベクトルフィールドの両方、`dense`ベクトルフィールドと`sparse`ベクトルフィールド、疎なベクトルフィールドの両方に対して作成されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Prepare index parameters
index_params = client.prepare_index_params()

# Add indexes
index_params.add_index(
    field_name="dense",
    index_name="dense_index",
    index_type="AUTOINDEX",
    metric_type="IP",
    params={"nlist": 128},
)

index_params.add_index(
    field_name="sparse",
    index_name="sparse_index",
    index_type="AUTOINDEX",  # Index type for sparse vectors
    metric_type="IP",  # Currently, only IP (Inner Product) is supported for sparse vectors
    params={"drop_ratio_build": 0.2},  # The ratio of small vector values to be dropped during indexing
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import java.util.*;

Map<String, Object> denseParams = new HashMap<>();
denseParams.put("nlist", 128);
IndexParam indexParamForDenseField = IndexParam.builder()
        .fieldName("dense")
        .indexName("dense_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.IP)
        .extraParams(denseParams)
        .build();

Map<String, Object> sparseParams = new HashMap<>();
sparseParams.put("drop_ratio_build", 0.2);
IndexParam indexParamForSparseField = IndexParam.builder()
        .fieldName("sparse")
        .indexName("sparse_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.IP)
        .extraParams(sparseParams)
        .build();

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(indexParamForDenseField);
indexParams.add(indexParamForSparseField);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const index_params = [{
    field_name: "dense",
    index_type: "AUTOINDEX",
    metric_type: "IP"
},{
    field_name: "sparse",
    index_type: "AUTOINDEX",
    metric_type: "IP"
}]
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "dense",
            "metricType": "IP",
            "indexName": "dense_index",
            "indexType":"AUTOINDEX",
            "params":{"nlist":128}
        },
        {
            "fieldName": "sparse",
            "metricType": "IP",
            "indexName": "sparse_index",
            "indexType": "AUTOINDEX"
        }
    ]'
```

</TabItem>
</Tabs>

#### コレクションを作成{#create-collection}

前の2つの手順で構成したコレクションスキーマとインデックスを使用して、`demo`という名前のコレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.create_collection(
    collection_name="hybrid_search_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
        .collectionName("hybrid_search_collection")
        .collectionSchema(schema)
        .indexParams(indexParams)
        .build();
client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.createCollection({
    collection_name: "hybrid_search_collection",
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
    \"collectionName\": \"hybrid_search_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

### データの挿入{#insert-data}

疎密度ベクトルをコレクションの`demo`に挿入します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

data=[
    {"id": 0, "text": "Artificial intelligence was founded as an academic discipline in 1956.", "sparse":{9637: 0.30856525997853057, 4399: 0.19771651149001523, ...}, "dense": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, ...]},
    {"id": 1, "text": "Alan Turing was the first person to conduct substantial research in AI.", "sparse":{6959: 0.31025067641541815, 1729: 0.8265339135915016, ...}, "dense": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, ...]},
    {"id": 2, "text": "Born in Maida Vale, London, Turing was raised in southern England.", "sparse":{1220: 0.15303302147479103, 7335: 0.9436728846033107, ...}, "dense": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, ...]}

res = client.insert(
    collection_name="hybrid_search_collection",
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
row1.addProperty("id", 1);
row1.addProperty("text", "Artificial intelligence was founded as an academic discipline in 1956.");
row1.add("dense", gson.toJsonTree(dense1));
row1.add("sparse", gson.toJsonTree(sparse1));

JsonObject row2 = new JsonObject();
row2.addProperty("id", 2);
row2.addProperty("text", "Alan Turing was the first person to conduct substantial research in AI.");
row2.add("dense", gson.toJsonTree(dense2));
row2.add("sparse", gson.toJsonTree(sparse2));

JsonObject row3 = new JsonObject();
row3.addProperty("id", 3);
row3.addProperty("text", "Born in Maida Vale, London, Turing was raised in southern England.");
row3.add("dense", gson.toJsonTree(dense3));
row3.add("sparse", gson.toJsonTree(sparse3));

List<JsonObject> data = Arrays.asList(row1, row2, row3);
InsertReq insertReq = InsertReq.builder()
        .collectionName("hybrid_search_collection")
        .data(data)
        .build();

InsertResp insertResp = client.insert(insertReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

var data = [
    {id: 0, text: "Artificial intelligence was founded as an academic discipline in 1956.", sparse:[9637: 0.30856525997853057, 4399: 0.19771651149001523, ...] , dense: [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]},
    {id: 1, text: "Alan Turing was the first person to conduct substantial research in AI.", sparse:[6959: 0.31025067641541815, 1729: 0.8265339135915016, ...] , dense: [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104]},
    {id: 2, text: "Born in Maida Vale, London, Turing was raised in southern England." , sparse:[1220: 0.15303302147479103, 7335: 0.9436728846033107, ...] , dense: [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592]}       
]

var res = await client.insert({
    collection_name: "hybrid_search_collection",
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
        {"id": 0, "text": "Artificial intelligence was founded as an academic discipline in 1956.", "sparse":{"9637": 0.30856525997853057, "4399": 0.19771651149001523}, "dense": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, ...]},
        {"id": 1, "text": "Alan Turing was the first person to conduct substantial research in AI.", "sparse":{"6959": 0.31025067641541815, "1729": 0.8265339135915016}, "dense": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, ...]},
        {"id": 2, "text": "Born in Maida Vale, London, Turing was raised in southern England.", "sparse":{"1220": 0.15303302147479103, "7335": 0.9436728846033107}, "dense": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, ...]}
    ],
    "collectionName": "hybrid_search_collection"
}'
```

</TabItem>
</Tabs>

### 複数のAnn SearchRequestインスタンスを作成{#create-multiple-annsearchrequest-instances}

ハイブリッド検索は、複数の`AnnSearchRequest`を`hybrid_search()`関数で作成することによって実装されます。各`AnnSearchRequest`は、特定のベクトル場に対する基本的なANN検索要求を表します。したがって、ハイブリッド検索を実行する前に、各ベクトル場に対して`AnnSearchRequest`を作成する必要があります。

An SearchRequestで**expr**パラメータを設定することで、ハイブリッド検索のフィルタリング条件を設定できます。詳しくは、[フィルター検索](./filtered-search)と[フィルタリング](./filtering)を参照してください。

<Admonition type="info" icon="📘" title="ノート">

<p>ハイブリッド検索では、各An SearchRequestは<code>1</code>つのクエリベクトルのみをサポートします。</p>

</Admonition>

クエリテキスト「AI研究を始めたのは誰ですか?」がすでに疎ベクトルと密ベクトルに変換されているとします。これに基づいて、次の例に示すように、2つの`Ann SearchRequest`検索リクエストがそれぞれ`疎`ベクトルフィールドと`密`ベクトルフィールドに対して作成されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import AnnSearchRequest

query_dense_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

search_param_1 = {
    "data": [query_dense_vector],
    "anns_field": "dense",
    "param": {
        "metric_type": "IP",
        "params": {"nprobe": 10}
    },
    "limit": 2
}
request_1 = AnnSearchRequest(**search_param_1)

query_sparse_vector = {3573: 0.34701499565746674}, {5263: 0.2639375518635271}
search_param_2 = {
    "data": [query_sparse_vector],
    "anns_field": "sparse",
    "param": {
        "metric_type": "IP",
        "params": {"drop_ratio_build": 0.2}
    },
    "limit": 2
}
request_2 = AnnSearchRequest(**search_param_2)

reqs = [request_1, request_2]

```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.request.data.BaseVector;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.request.data.SparseFloatVec;

float[] dense = new float[]{-0.0475336798f,  0.0521207601f,  0.0904406682f, ...};
SortedMap<Long, Float> sparse = new TreeMap<Long, Float>() {{
    put(3573L, 0.34701499f);
    put(5263L, 0.263937551f);
    ...
}};

List<BaseVector> queryDenseVectors = Collections.singletonList(new FloatVec(dense));
List<BaseVector> querySparseVectors = Collections.singletonList(new SparseFloatVec(sparse));

List<AnnSearchReq> searchRequests = new ArrayList<>();
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("dense")
        .vectors(queryDenseVectors)
        .metricType(IndexParam.MetricType.IP)
        .params("{\"nprobe\": 10}")
        .topK(2)
        .build());
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("sparse")
        .vectors(querySparseVectors)
        .metricType(IndexParam.MetricType.IP)
        .params("{\"drop_ratio_build\": 0.2}")
        .topK(2)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const search_param_1 = {
    "data": query_vector, 
    "anns_field": "dense", 
    "param": {
        "metric_type": "IP", // 参数值需要与 Collection Schema 中定义的保持一致
        "params": {"nprobe": 10}
    },
    "limit": 2 // AnnSearchRequest 返还的搜索结果数量
}

const search_param_2 = {
    "data": query_sparse_vector, 
    "anns_field": "sparse", 
    "param": {
        "metric_type": "IP", // 参数值需要与 Collection Schema 中定义的保持一致
        "params": {"drop_ratio_build": 0.2}
    },
    "limit": 2 // AnnSearchRequest 返还的搜索结果数量
}
```

</TabItem>

<TabItem value='bash'>

```bash
export req='[
    {
        "data": [[0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592,....]],
        "annsField": "dense",
        "params": {
            "params": {
                "nprobe": 10
             }
        },
        "limit": 2
    },
    {
        "data": [{"3573": 0.34701499565746674}, {"5263": 0.2639375518635271}],
        "annsField": "sparse",
        "params": {
            "params": {
                "drop_ratio_build": 0.2
             }
        },
        "limit": 2
    }
 ]'
```

</TabItem>
</Tabs>

パラメータの`制限`が2に設定されているため、各`An SearchRequest`は2つの検索結果を返します。この例では、2つの`An SearchRequest`が作成されるため、合計4つの検索結果が返されます。

### リランキング戦略を設定する{#configure-a-reranking-strategy}

2つのANN検索結果をマージして再ランキングするには、適切な再ランキング戦略を選択する必要があります。Zilliz Cloudは、**WeightedRanker**と**RRFRanker**の2種類の再ランキング戦略をサポートしています。再ランキング戦略を選択する際に考慮すべきことは、ベクトル場に対して1つ以上の基本的なANN検索に重点が置かれているかどうかです。

- **WeightedRanker**:この戦略は、特定のベクトルフィールドを強調する必要がある場合に推奨されます。WeightedRankerを使用すると、特定のベクトルフィールドにより高い重みを割り当て、それらをより強調することができます。たとえば、マルチモーダル検索では、画像のテキストの説明が、この画像の色よりも重要と考えられる場合があります。

- **RRFRanker(Reciprocal Rank Fusion Ranker)**:この戦略は、特定の強調がない場合に推奨されます。RRFは、各ベクトル場の重要性を効果的にバランスさせることができます。

これら2つのリランキング戦略のメカニズムの詳細については、「[リランキング](./reranking)」を参照してください。

次の2つの例は、WeightedRankerとRRFRankerの再ランキング戦略の使用方法を示しています。

1. **例1: WeightedRankerの使用**

    WeightedRanker戦略を使用する場合、`WeightedRanker`関数に重み値を入力する必要があります。ハイブリッド検索の基本ANN検索の数は、入力する必要がある値の数に対応します。入力値は[0,1]の範囲内であり、1に近い値ほど重要度が高いことを示します。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus import WeightedRanker
    
    rerank= WeightedRanker(0.8, 0.3) 
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.v2.service.vector.request.ranker.BaseRanker;
    import io.milvus.v2.service.vector.request.ranker.WeightedRanker;
    
    BaseRanker reranker = new WeightedRanker(Arrays.asList(0.8f, 0.3f));
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";
    
    const rerank = WeightedRanker(0.8, 0.3);
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export rerank='{
            "strategy": "ws",
            "params": {"weights": [0.8,0.3]}
        }'
    ```

    </TabItem>
    </Tabs>

1. **例2: RRFRankerを使用する**

    RRFRanker戦略を使用する場合、RRFRankerにパラメータ値`k`を入力する必要があります。`k`のデフォルト値は60です。このパラメータは、異なるANN検索からランクがどのように結合されるかを決定し、すべての検索で重要度をバランス良くブレンドするのに役立ちます。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

    <TabItem value='javascript'>

    ```javascript
    import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";
    
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

### ハイブリッド検索を実行する{#perform-a-hybrid-search}

Hybrid Searchを実行する前に、コレクションをメモリにロードする必要があります。コレクション内のベクトル場にインデックスがない場合やロードされていない場合、Hybrid Searchメソッドを呼び出すとエラーが発生します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

res = client.hybrid_search(
    collection_name="hybrid_search_collection",
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
        .collectionName("hybrid_search_collection")
        .searchRequests(searchRequests)
        .ranker(reranker)
        .topK(2)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build();

SearchResp searchResp = client.hybridSearch(hybridSearchReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

res = await client.loadCollection({
    collection_name: "hybrid_search_collection"
})

import { MilvusClient, RRFRanker, WeightedRanker } from '@zilliz/milvus2-sdk-node';

const search = await client.search({
  collection_name: "hybrid_search_collection",
  data: [search_param_1, search_param_2],
  limit: 2,
  rerank: RRFRanker(100)
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
    \"collectionName\": \"hybrid_search_collection\",
    \"search\": ${req},
    \"rerank\": {
        \"strategy\":\"rrf\",
        \"params\": {
            \"k\": 10
        }
    },
    \"limit\": 3,
    \"outputFields\": [
        \"user_id\",
        \"word_count\",
        \"book_describe\"
    ]
}"
```

</TabItem>
</Tabs>

以下が出力です:

```python
["['id: 844, distance: 0.006047376897186041, entity: {}', 'id: 876, distance: 0.006422005593776703, entity: {}']"]
```

ハイブリッド検索で`limit=2`が指定されているため、Zilliz Cloudはステップ3の4つの検索結果を再ランク付けし、最終的に最も類似した上位2つの検索結果のみを返します。