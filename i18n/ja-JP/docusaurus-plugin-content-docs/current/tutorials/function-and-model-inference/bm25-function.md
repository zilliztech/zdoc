---
title: "BM25 関数 | Cloud"
slug: /bm25-function
sidebar_key: bm25-function
sidebar_label: "BM25 関数"
beta: FALSE
notebook: FALSE
description: "BM25 関数は、生のテキストを疎ベクトルに変換し、語彙的な関連性に基づいてドキュメントをスコアリングすることで、全文検索を可能にします。この関数は、クエリ用語と密接に一致するテキストドキュメントの効率的な検索をサポートするために、用語ベースのマッチングと頻度を考慮した重み付けを適用します。| Cloud"
type: origin
token: YbChwcPMBim5ryk1EQocEbDenDd
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - function
  - model
  - inference
  - bm25

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# BM25関数

**BM25関数**は、生のテキストを**疎ベクトル**に変換し、語彙的関連性に基づいてドキュメントをスコアリングすることで、[全文検索](./full-text-search)を実現します。この関数は、単語ベースのマッチングと出現頻度を考慮した重み付けを適用し、クエリ用語に密接に一致するテキストドキュメントを効率的に検索できるようにします。

BM25関数はローカルテキスト関数であり、Zilliz Cloud 内で実行されるため、モデル推論や外部統合は不要です。テキストベースの検索シナリオにおいて、決定論的かつ透明性の高い検索メカニズムを提供します。

## BM25 の仕組み\{#how-bm25-works}

[BM25](https://en.wikipedia.org/wiki/Okapi_BM25) アルゴリズムは、全文検索で広く使用されている単語ベースの関連性スコアリングアルゴリズムです。Zilliz Cloud では、BM25 は疎検索パイプラインとして実装されており、テキストを単語とその重みの表現に変換し、分散型の疎インデックスを使用して上位 *K* 件のドキュメントを取得します。

全体のワークフローは、**ドキュメントの取り込み**と**クエリテキストの処理**という2つの対称的なパスで構成されており、どちらも同じテキスト分析ロジックを共有します。

### ドキュメントの取り込み: テキストから疎表現へ\{#document-ingestion-from-text-to-sparse-representation}

ドキュメントが挿入されると、まずその生テキストが **[アナライザー](./analyzer-overview)** によって処理され、個々の単語（トークン）に分割されます。

たとえば、次のドキュメントの場合：

```plaintext
"We are loving Milvus!"
```

は以下の用語に分析できます:

```plaintext
["we", "love", "milvus"]
```

その後、各ドキュメントは単語頻度（TF: Term Frequency）表現として表され、これはドキュメント内に各単語が何回出現するかを記録します。例えば：

```plaintext
{
  "we": 1,
  "love": 1,
  "milvus": 1
}
```

同時に、Zilliz Cloud はコーパスレベルの統計情報を更新します。これには以下が含まれます：

- 各語彙の文書頻度（DF）

- 文書の平均長

- 各語彙を含む文書へのマッピングを行うポスティングリスト

文書の TF 表現は **スパース埋め込み** に挿入され、ここで語彙のポスティングがノード間で分割され、スケーラブルな検索が可能になります。

### クエリテキストの処理：IDF 重み付けの適用\{#query-text-process-apply-idf-weighting}

テキストベースのクエリが発行されると、[ドキュメントの取り込み](./bm25-function#document-ingestion-from-text-to-sparse-representation) 時に使用された **同じアナライザー** によって処理され、語彙のセグメンテーションが一貫性を持つようにします。

例えば、次のクエリの場合：

```plaintext
"who loves Milvus?"
```

次のように分析できます。

```plaintext
["who", "love", "milvus"]
```

各クエリ用語について、Zilliz Cloud はコーパス統計からその[逆文書頻度](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)（IDF）を参照します。IDF は、データセット全体においてその用語がどれほど情報量を持つかを反映します。つまり、出現頻度が低い用語ほど高い重みが与えられ、一般的な用語ほど低い重みが与えられます。

概念的には、これにより次のような IDF で重み付けされたクエリ用語の集合が生成されます。

```plaintext
{
  "who": 0.1,
  "love": 0.5,
  "milvus": 1.2
}
```

### BM25スコアリングとトップK検索\{#bm25-scoring-and-top-k-retrieval}

BM25は、クエリの語にマッチした文書に対して関連性スコアを計算し、そのスコアに基づいて文書をランキングします。スコアリングは**タームレベル**で行われ、**ドキュメントレベル**で集約されます。

**タームレベルスコアリング**

文書内に出現する各クエリ語に対して、BM25はタームレベルのスコアを計算します:

```plaintext
term_score =
  IDF(term) ×
  TF_boost(term, document, k1) ×
  length_normalization(document, b)
```

ここで：

- **IDF(term)** は、コレクション内でのその語の希少性を反映します。

- **TF_boost(…, k1)** は語頻度とともに増加しますが、頻度が高くなるにつれて飽和します。

- **length_normalization(…, b)** は文書の長さに基づいてスコアを調整します。

**文書レベルのスコアリングとTop-K検索**

最終的な文書スコアは、マッチしたすべてのクエリ語についての語レベルスコアの合計となります。

```plaintext
document_score =
  sum of term_score over all matched query terms
```

ドキュメントは最終スコアに基づいてランキングされ、スコアが上位 K 件のドキュメントが返されます。

## 開始前の準備\{#before-you-start}

BM25関数を使用する前に、コレクションスキーマを計画し、語彙ベースの全文検索をサポートできるようにしてください：

- **生テキスト用のテキストフィールド**

    コレクションには、生テキストを格納するための `VARCHAR` フィールドを含める必要があります。このフィールドは、全文検索のために処理されるテキストのソースとなります。

- **テキストフィールド用のアナライザー**

    テキストフィールドにはアナライザーを有効にする必要があります。アナライザーは、BM25関数によって語彙的関連性が計算される前に、テキストがどのようにトークン化および正規化されるかを定義します。

    デフォルトでは、Zilliz Cloud は空白文字や句読点に基づいてテキストをトークン化するビルトインアナライザーを提供しています。アプリケーションでカスタムのトークン化または正規化動作が必要な場合は、カスタムアナライザーを定義できます。詳細については、「[ユースケースに適したアナライザーの選択](./choose-the-right-analyzer-for-your-use-case)」を参照してください。

- **BM25出力用のスパースベクトル**

    コレクションには、BM25関数によって生成されたスパース表現を格納するための `SPARSE_FLOAT_VECTOR` フィールドを含める必要があります。このフィールドは、全文検索時のインデックス作成および検索に使用されます。

これらのスキーマレベルの考慮事項を整理した後、コレクションを作成してBM25関数を使用してください。

## ステップ 1: BM25関数付きのコレクションを作成する\{#step-1-create-a-collection-with-a-bm25-function}

BM25関数を使用するには、コレクション作成時にその関数を定義する必要があります。この関数はコレクションスキーマの一部となり、データ挿入時および検索時に自動的に適用されます。

### SDK 経由\{#via-sdk}

#### スキーマフィールドの定義\{#define-schema-fields}

コレクションスキーマには、少なくとも以下の3つの必須フィールドを含める必要があります：

- **プライマリフィールド**: コレクション内の各エンティティを一意に識別します。

- **テキストフィールド** (`VARCHAR`): 生テキストドキュメントを格納します。`enable_analyzer=True` を設定して、Zilliz Cloud がBM25による関連性ランキングのためにテキストを処理できるようにする必要があります。デフォルトでは、Zilliz Cloud はテキスト分析に [`standard`](./standard-analyzer)[アナライザー](./standard-analyzer) を使用します。別のアナライザーを設定するには、「[アナライザー概要](./analyzer-overview)」を参照してください。

- **スパースベクトルフィールド** (`SPARSE_FLOAT_VECTOR`): BM25関数によって自動生成されるスパース埋め込みを格納します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType, Function, FunctionType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

schema = client.create_schema()

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, auto_id=True) # Primary field
# highlight-start
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=1000, enable_analyzer=True) # Text field
schema.add_field(field_name="sparse", datatype=DataType.SPARSE_FLOAT_VECTOR) # Sparse vector field; no dim required for sparse vectors
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .build();
schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .enableAnalyzer(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("sparse")
        .dataType(DataType.SparseFloatVector)
        .build());
```

</TabItem>

<TabItem value='java'>

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
token := "YOUR_CLUSTER_TOKEN"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey: token
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema()
schema.WithField(entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true).
    WithIsAutoID(true),
).WithField(entity.NewField().
    WithName("text").
    WithDataType(entity.FieldTypeVarChar).
    WithEnableAnalyzer(true).
    WithMaxLength(1000),
).WithField(entity.NewField().
    WithName("sparse").
    WithDataType(entity.FieldTypeSparseVector),
)
```

</TabItem>

<TabItem value='java'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});
const schema = [
  {
    name: "id",
    data_type: DataType.Int64,
    is_primary_key: true,
  },
  {
    name: "text",
    data_type: "VarChar",
    enable_analyzer: true,
    enable_match: true,
    max_length: 1000,
  },
  {
    name: "sparse",
    data_type: DataType.SparseFloatVector,
  },
];

console.log(res.results)
```

</TabItem>

<TabItem value='java'>

```bash
export schema='{
        "autoId": true,
        "enabledDynamicField": false,
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
                "fieldName": "sparse",
                "dataType": "SparseFloatVector"
            }
        ]
    }'
```

</TabItem>
</Tabs>

#### Define the BM25関数\{#define-the-bm25-function}

BM25関数は、トークン化されたテキストをBM25スコアリングをサポートする疎ベクトルに変換します。

この関数を定義し、スキーマに追加します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
bm25_function = Function(
    name="text_bm25_emb", # Function name
    input_field_names=["text"], # Name of the VARCHAR field containing raw text data
    output_field_names=["sparse"], # Name of the SPARSE_FLOAT_VECTOR field reserved to store generated embeddings
    # highlight-next-line
    function_type=FunctionType.BM25, # Set to \`BM25\`
)

schema.add_function(bm25_function)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;

import java.util.*;

schema.addFunction(Function.builder()
        .functionType(FunctionType.BM25)
        .name("text_bm25_emb")
        .inputFieldNames(Collections.singletonList("text"))
        .outputFieldNames(Collections.singletonList("sparse"))
        .build());
```

</TabItem>

<TabItem value='java'>

```go
function := entity.NewFunction().
    WithName("text_bm25_emb").
    WithInputFields("text").
    WithOutputFields("sparse").
    WithType(entity.FunctionTypeBM25)
schema.WithFunction(function)
```

</TabItem>

<TabItem value='java'>

```javascript
const functions = [
    {
      name: 'text_bm25_emb',
      description: 'bm25 function',
      type: FunctionType.BM25,
      input_field_names: ['text'],
      output_field_names: ['sparse'],
      params: {},
    },
]；
```

</TabItem>

<TabItem value='java'>

```bash
export schema='{
        "autoId": true,
        "enabledDynamicField": false,
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
                "fieldName": "sparse",
                "dataType": "SparseFloatVector"
            }
        ],
        "functions": [
            {
                "name": "text_bm25_emb",
                "type": "BM25",
                "inputFieldNames": ["text"],
                "outputFieldNames": ["sparse"],
                "params": {}
            }
        ]
    }'
```

</TabItem>
</Tabs>

#### インデックスの設定\{#configure-the-index}

必要なフィールドと組み込み関数を使用してスキーマを定義した後、コレクション用のインデックスを設定します。このプロセスを簡略化するために、`index_type` として `AUTOINDEX` を使用してください。このオプションにより、Zilliz Cloud がデータ構造に基づいて最も適切なインデックスタイプを自動的に選択・設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="sparse",

    index_type="AUTOINDEX", 
    metric_type="BM25"

)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;

Map<String,Object> params = new HashMap<>();
params.put("inverted_index_algo", "DAAT_MAXSCORE");
params.put("bm25_k1", 1.2);
params.put("bm25_b", 0.75);

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("sparse")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.BM25)
        .extraParams(params)
        .build());    
```

</TabItem>

<TabItem value='java'>

```go
indexOption := milvusclient.NewCreateIndexOption("my_collection", "sparse",
    index.NewAutoIndex(entity.MetricType(entity.BM25)))
    .WithExtraParam("inverted_index_algo", "DAAT_MAXSCORE")
    .WithExtraParam("bm25_k1", 1.2)
    .WithExtraParam("bm25_b", 0.75)
```

</TabItem>

<TabItem value='java'>

```javascript
const index_params = [
  {
    field_name: "sparse",
    metric_type: "BM25",
    index_type: "SPARSE_INVERTED_INDEX",
    params: {
        "inverted_index_algo": "DAAT_MAXSCORE",
        "bm25_k1": 1.2,
        "bm25_b": 0.75
    }
  },
];
```

</TabItem>

<TabItem value='java'>

```bash
export indexParams='[
        {
            "fieldName": "sparse",
            "metricType": "BM25",
            "indexType": "AUTOINDEX",
            "params":{
               "inverted_index_algo": "DAAT_MAXSCORE",
               "bm25_k1": 1.2,
               "bm25_b": 0.75
            }
        }
    ]'
```

</TabItem>
</Tabs>

#### コレクションの作成\{#create-the-collection}

定義済みのスキーマとインデックスパラメータを使用して、コレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name='my_collection', 
    schema=schema, 
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```javascript
await client.create_collection(
    collection_name: 'my_collection', 
    schema: schema, 
    index_params: index_params,
    functions: functions
);
```

</TabItem>

<TabItem value='java'>

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

### ウェブコンソール経由\{#via-web-console}

または、[Zilliz Cloud console](https://cloud.zilliz.com/login)でBM25関数を含むコレクションを作成することもできます。

<Supademo id="cmjl3i2jg4mkb3zz206xgz4tr" title=""  />

BM25関数を含むコレクションが作成されると、テキストを挿入し、テキストクエリに基づく語彙検索を実行できるようになります。

## ステップ 2: テキストデータをコレクションに挿入する\{#step-2-insert-text-data-into-the-collection}

コレクションとインデックスの設定が完了したら、テキストデータの挿入準備が整います。このプロセスでは、生のテキストを提供するだけで済みます。先ほど定義したBM25関数が、各テキストエントリに対して自動的にスパースベクトルを生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.insert('my_collection', [
    {'text': 'information retrieval is a field of study.'},
    {'text': 'information retrieval focuses on finding relevant information in large datasets.'},
    {'text': 'data mining and information retrieval overlap in research.'},
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
        gson.fromJson("{\"text\": \"information retrieval is a field of study.\"}", JsonObject.class),
        gson.fromJson("{\"text\": \"information retrieval focuses on finding relevant information in large datasets.\"}", JsonObject.class),
        gson.fromJson("{\"text\": \"data mining and information retrieval overlap in research.\"}", JsonObject.class)
);

client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```javascript
await client.insert({
collection_name: 'my_collection', 
data: [
    {'text': 'information retrieval is a field of study.'},
    {'text': 'information retrieval focuses on finding relevant information in large datasets.'},
    {'text': 'data mining and information retrieval overlap in research.'},
]);
```

</TabItem>

<TabItem value='java'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "data": [
        {"text": "information retrieval is a field of study."},
        {"text": "information retrieval focuses on finding relevant information in large datasets."},
        {"text": "data mining and information retrieval overlap in research."}       
    ],
    "collectionName": "my_collection"
}'

```

</TabItem>
</Tabs>

## ステップ 3: テキストクエリによる検索\{#step-3-search-with-text-query}

コレクションにデータを挿入したら、生のテキストクエリを使用して全文検索を実行できます。Zilliz Cloud は自動的にクエリをスパースベクトルに変換し、BM25 アルゴリズムを用いてマッチした检索結果をランキングし、上位K件（`limit`で指定された件数）の結果を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
search_params = {
    'params': {'level': 10},
}

res = client.search(
    collection_name='my_collection', 
    # highlight-start
    data=['whats the focus of information retrieval?'],
    anns_field='sparse',
    output_fields=['text'], # Fields to return in search results; sparse field cannot be output
    # highlight-end
    limit=3,
    search_params=search_params
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;

Map<String,Object> searchParams = new HashMap<>();
searchParams.put("level", 10);
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new EmbeddedText("whats the focus of information retrieval?")))
        .annsField("sparse")
        .topK(3)
        .searchParams(searchParams)
        .outputFields(Collections.singletonList("text"))
        .build());
```

</TabItem>

<TabItem value='java'>

```go
annSearchParams := index.NewCustomAnnParam()
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    3,               // limit
    []entity.Vector{entity.Text("whats the focus of information retrieval?")},
).WithConsistencyLevel(entity.ClStrong).
    WithANNSField("sparse").
    WithAnnParam(annSearchParams).
    WithOutputFields("text"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("text: ", resultSet.GetColumn("text").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='java'>

```javascript
await client.search(
    collection_name: 'my_collection', 
    data: ['whats the focus of information retrieval?'],
    anns_field: 'sparse',
    output_fields: ['text'],
    limit: 3,
    params: {'level': 10},
)
```

</TabItem>

<TabItem value='java'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "my_collection",
    "data": [
        "whats the focus of information retrieval?"
    ],
    "annsField": "sparse",
    "limit": 3,
    "outputFields": [
        "text"
    ],
    "searchParams":{
        "params":{}
    }
}'
```

</TabItem>
</Tabs>

