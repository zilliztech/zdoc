---
title: "BM25 関数 | Cloud"
slug: /bm25-function
sidebar_label: "BM25 関数"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "BM25 関数は、生テキストをスパースベクトルに変換し、語彙的な関連性に基づいてドキュメントをスコアリングすることで、全文検索を可能にします。用語ベースのマッチングと出現頻度を考慮した重み付けを適用し、クエリ語とよく一致するテキストドキュメントを効率的に取得できるようにします。 | Cloud"
type: origin
token: YbChwcPMBim5ryk1EQocEbDenDd
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

# BM25 関数

**BM25 関数**は、生テキストを**スパースベクトル**に変換し、語彙的な関連性に基づいてドキュメントをスコアリングすることで、[全文検索](./full-text-search)を可能にします。用語ベースのマッチングと出現頻度を考慮した重み付けを適用し、クエリ語とよく一致するテキストドキュメントを効率的に取得できるようにします。

ローカルなテキスト関数として、BM25 関数は Zilliz Cloud 内で実行され、モデル推論や外部統合を必要としません。テキストベースの検索シナリオに対して、決定論的で透明性の高い検索メカニズムを提供します。

## BM25 の仕組み\{#how-bm25-works}

[BM25](https://en.wikipedia.org/wiki/Okapi_BM25) アルゴリズムは、全文検索で広く使用されている用語ベースの関連性スコアリングアルゴリズムです。Zilliz Cloud では、BM25 はテキストを用語重み表現に変換し、分散スパースインデックスを使用して上位 *K* 件のドキュメントを取得するスパース検索パイプラインとして実装されています。

全体のワークフローは、**ドキュメントの取り込み**と**クエリテキスト処理**という 2 つの対称的な経路で構成されており、どちらも同じテキスト解析ロジックを共有します。

### ドキュメントの取り込み: テキストからスパース表現へ\{#document-ingestion-from-text-to-sparse-representation}

ドキュメントが挿入されると、その生テキストはまず **[アナライザー](./analyzer-overview)** によって処理され、テキストが個々の用語にトークン化されます。

たとえば、次のドキュメント:

```plaintext
"We are loving Milvus!"
```

は、次の用語に解析されます。

```plaintext
["we", "love", "milvus"]
```

次に、各ドキュメントは term frequency (TF) 表現として表され、ドキュメント内で各用語が何回出現するかが記録されます。たとえば:

```plaintext
{
  "we": 1,
  "love": 1,
  "milvus": 1
}
```

同時に、Zilliz Cloud はコーパスレベルの統計も更新します。これには以下が含まれます。

- 各用語の document frequency (DF)

- ドキュメントの平均長

- 各用語を、それを含むドキュメントにマッピングする posting list

ドキュメントの TF 表現は **スパース埋め込み** に挿入され、用語の posting はスケーラブルな取得のためにノード間で分割されます。

### クエリテキスト処理: IDF 重み付けを適用\{#query-text-process-apply-idf-weighting}

テキストベースのクエリが発行されると、[ドキュメントの取り込み](./bm25-function#document-ingestion-from-text-to-sparse-representation)時に使用された**同じアナライザー**で処理され、一貫した用語分割が保証されます。

たとえば、次のクエリ:

```plaintext
"who loves Milvus?"
```

は、次のように解析されます。

```plaintext
["who", "love", "milvus"]
```

各クエリ用語について、Zilliz Cloud はコーパス統計からその [inverse document frequency](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) (IDF) を参照します。IDF は、データセット全体にわたってその用語がどれほど情報量を持つかを表します。まれな用語ほど高い重みが与えられ、一般的な用語ほど低い重みが与えられます。

概念的には、これにより次のような IDF 重み付きクエリ用語のセットが生成されます。

```plaintext
{
  "who": 0.1,
  "love": 0.5,
  "milvus": 1.2
}
```

### BM25 スコアリングと上位 K 件の取得\{#bm25-scoring-and-top-k-retrieval}

BM25 は、一致したクエリ用語に基づく関連性スコアを計算してドキュメントをランク付けします。スコアリングは**用語レベル**で実行され、**ドキュメントレベル**で集約されます。

**用語レベルのスコアリング**

ドキュメント内に現れる各クエリ用語に対して、BM25 は次の用語レベルスコアを計算します。

```plaintext
term_score =
  IDF(term) ×
  TF_boost(term, document, k1) ×
  length_normalization(document, b)
```

ここで:

- **IDF(term)** は、その用語がコレクション内でどれほど希少かを表します

- **TF_boost(…, k1)** は用語頻度とともに増加しますが、頻度が大きくなるにつれて飽和します

- **length_normalization(…, b)** はドキュメント長に基づいてスコアを調整します

**ドキュメントレベルのスコアリングと Top-K 取得**

最終的なドキュメントスコアは、一致したすべてのクエリ用語に対する用語レベルスコアの合計です。

```plaintext
document_score =
  sum of term_score over all matched query terms
```

ドキュメントは最終スコアによってランク付けされ、スコアが最も高い上位 K 件のドキュメントが返されます。

## 始める前に\{#before-you-start}

BM25 関数を使用する前に、語彙ベースの全文検索をサポートできるようにコレクションスキーマを計画してください。

- **生コンテンツ用のテキストフィールド**

    コレクションには、生テキストを保存するための `VARCHAR` フィールドを含める必要があります。このフィールドは、全文検索のために処理されるテキストのソースです。

- **テキストフィールド用のアナライザー**

    テキストフィールドではアナライザーを有効にする必要があります。アナライザーは、BM25 関数によって語彙的関連性が計算される前に、テキストをどのようにトークン化および正規化するかを定義します。

    デフォルトでは、Zilliz Cloud は空白と句読点に基づいてテキストをトークン化する組み込みアナライザーを提供します。アプリケーションでカスタムのトークン化または正規化動作が必要な場合は、カスタムアナライザーを定義できます。詳細は [Choose the Right Analyzer for Your Use Case](./choose-the-right-analyzer-for-your-use-case) を参照してください。

- **BM25 出力用のスパースベクトル**

    コレクションには、BM25 関数によって生成されるスパース表現を保存するための `SPARSE_FLOAT_VECTOR` フィールドを含める必要があります。このフィールドは、全文検索中のインデックス作成と取得に使用されます。

これらのスキーマレベルの考慮事項を整理したら、コレクションを作成して BM25 関数を使用します。

## ステップ 1: BM25 関数を持つコレクションを作成する\{#step-1-create-a-collection-with-a-bm25-function}

BM25 関数を使用するには、コレクションの作成時にそれを定義する必要があります。この関数はコレクションスキーマの一部となり、データの挿入時と検索時に自動的に適用されます。

### SDK を使用する場合\{#via-sdk}

#### スキーマフィールドを定義する\{#define-schema-fields}

コレクションスキーマには、少なくとも次の 3 つの必須フィールドを含める必要があります。

- **Primary field**: コレクション内の各エンティティを一意に識別します。

- **Text field** (`VARCHAR`): 生のテキストドキュメントを保存します。Zilliz Cloud が BM25 関連性ランキングのためにテキストを処理できるように、`enable_analyzer=True` を設定する必要があります。デフォルトでは、Zilliz Cloud はテキスト解析に [`standard`](./standard-analyzer)[ analyzer](./standard-analyzer) を使用します。別のアナライザーを設定するには、[Analyzer Overview](./analyzer-overview) を参照してください。

- **Sparse vector field** (`SPARSE_FLOAT_VECTOR`): BM25 関数によって自動生成されるスパース埋め込みを保存します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='javascript'>

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

<TabItem value='bash'>

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
schema->AddField({"id", milvus::DataType::INT64, "", true, true});
schema->AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR).WithMaxLength(1000).EnableAnalyzer(true));
schema->AddField(milvus::FieldSchema("sparse", milvus::DataType::SPARSE_FLOAT_VECTOR));
```

</TabItem>
</Tabs>

#### BM25 関数を定義する\{#define-the-bm25-function}

BM25 関数は、トークン化されたテキストを BM25 スコアリングをサポートするスパースベクトルに変換します。

関数を定義し、スキーマに追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
bm25_function = Function(
    name="text_bm25_emb", # Function name
    input_field_names=["text"], # Name of the VARCHAR field containing raw text data
    output_field_names=["sparse"], # Name of the SPARSE_FLOAT_VECTOR field reserved to store generated embeddings
    # highlight-next-line
    function_type=FunctionType.BM25, # Set to `BM25`
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

<TabItem value='go'>

```go
function := entity.NewFunction().
    WithName("text_bm25_emb").
    WithInputFields("text").
    WithOutputFields("sparse").
    WithType(entity.FunctionTypeBM25)
schema.WithFunction(function)
```

</TabItem>

<TabItem value='javascript'>

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

<TabItem value='bash'>

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

<TabItem value='c++'>

```c++
milvus::FunctionPtr function = std::make_shared<milvus::Function>("text_bm25_emb", milvus::FunctionType::BM25);
function->AddInputFieldName("text");
function->AddOutputFieldName("sparse");
schema->AddFunction(function);
```

</TabItem>
</Tabs>

#### インデックスを設定する\{#configure-the-index}

必要なフィールドと組み込み関数を含むスキーマを定義したら、コレクション用のインデックスを設定します。このプロセスを簡略化するために、`index_type` として `AUTOINDEX` を使用します。これは、データの構造に基づいて Zilliz Cloud が最適なインデックスタイプを選択して設定できるオプションです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='go'>

```go
indexOption := milvusclient.NewCreateIndexOption("my_collection", "sparse",
    index.NewAutoIndex(entity.MetricType(entity.BM25)))
    .WithExtraParam("inverted_index_algo", "DAAT_MAXSCORE")
    .WithExtraParam("bm25_k1", 1.2)
    .WithExtraParam("bm25_b", 0.75)
```

</TabItem>

<TabItem value='javascript'>

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

<TabItem value='bash'>

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

<TabItem value='c++'>

```c++
auto index_params = milvus::IndexDesc("sparse", "", milvus::IndxType::SPARSE_INVERTED_INDEX, milvus::MetricType::BM25);
index_params.AddExtraParam("inverted_index_algo", "DAAT_MAXSCORE");
index_params.AddExtraParam("bm25_k1", "1.2");
index_params.AddExtraParam("bm25_b", "0.75");
```

</TabItem>
</Tabs>

#### collection を作成する\{#create-the-collection}

次に、定義した schema と index パラメータを使用して collection を作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='javascript'>

```javascript
await client.create_collection(
    collection_name: 'my_collection', 
    schema: schema, 
    index_params: index_params,
    functions: functions
);
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

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                    .WithCollectionName("my_collection")
                                    .WithCollectionSchema(schema))
                                    .AddIndex(std::move(index_params));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### Web コンソール経由\{#via-web-console}

または、[Zilliz Cloud console](https://cloud.zilliz.com/login) で BM25 関数を持つ collection を作成することもできます。

<Supademo id="cmjl3i2jg4mkb3zz206xgz4tr" title=""  />

BM25 関数を持つ collection を作成したら、テキストを挿入し、テキストクエリに基づく lexical search を実行できます。

## ステップ 2: collection にテキストデータを挿入する\{#step-2-insert-text-data-into-the-collection}

collection と index の設定が完了したら、テキストデータを挿入する準備は完了です。このプロセスでは、生のテキストを提供するだけで済みます。先ほど定義した BM25 関数が、各テキストエントリの sparse vector を自動的に生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

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

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
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

<TabItem value='c++'>

```c++
milvus::EntityRows data = {
    {{"text", "information retrieval is a field of study."}},
    {{"text", "information retrieval focuses on finding relevant information in large datasets."}},
    {{"text", "data mining and information retrieval overlap in research."}}
};

milvus::InsertResponse response;
auto status = client->Insert(milvus::InsertRequest()
                                .WithCollectionName("my_collection")
                                .WithRowsData(std::move(data))
                                , response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## ステップ 3: テキストクエリで検索する\{#step-3-search-with-text-query}

collection にデータを挿入したら、生のテキストクエリを使用して full text search を実行できます。Zilliz Cloud はクエリを自動的に sparse vector に変換し、BM25 アルゴリズムを使用して一致した検索結果をランク付けしたうえで、上位 topK (`limit`) 件の結果を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='go'>

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

<TabItem value='javascript'>

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

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
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

<TabItem value='c++'>

```c++
auto request = milvus::SearchRequest()
                       .WithCollectionName("my_collection")
                       .AddEmbeddedText("whats the focus of information retrieval?")
                       .WithLimit(3)
                       .WithAnnsField("sparse")
                       .AddOutputField("text");

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>
