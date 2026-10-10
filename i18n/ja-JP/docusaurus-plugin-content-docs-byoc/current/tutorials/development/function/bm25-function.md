---
title: "BM25 関数 | BYOC"
slug: /bm25-function
sidebar_label: "BM25 関数"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "BM25 関数は、生のテキストをスパースベクトルに変換し、字句的な関連性に基づいてドキュメントをスコアリングすることで、フルテキスト検索を可能にします。用語ベースのマッチングと頻度を考慮した重み付けを適用し、クエリ用語に密接に一致するテキストドキュメントを効率的に取得できるようにします。 | BYOC"
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

**BM25 関数**は、生のテキストを**スパースベクトル**に変換し、字句的な関連性に基づいてドキュメントをスコアリングすることで、[フルテキスト検索](./full-text-search) を可能にします。用語ベースのマッチングと頻度を考慮した重み付けを適用し、クエリ用語に密接に一致するテキストドキュメントを効率的に取得できるようにします。

ローカルテキスト関数として、BM25 関数は Zilliz Cloud 内で実行され、モデル推論や外部統合を必要としません。テキストベースの検索シナリオに対して、決定論的で透過的な取得メカニズムを提供します。

## BM25 の仕組み\{#how-bm25-works}

[BM25](https://en.wikipedia.org/wiki/Okapi_BM25) アルゴリズムは、フルテキスト検索で広く使用されている用語ベースの関連性スコアリングアルゴリズムです。Zilliz Cloud では、BM25 はスパース検索パイプラインとして実装されており、テキストを用語の重み表現に変換し、分散スパースインデックスを使用して上位 *K* 件のドキュメントを取得します。

ワークフロー全体は、**ドキュメントの取り込み**と**クエリテキストの処理**という 2 つの対称的なパスで構成され、これらは同じテキスト解析ロジックを共有します。

### ドキュメントの取り込み: テキストからスパース表現へ\{#document-ingestion-from-text-to-sparse-representation}

ドキュメントが挿入されると、その生のテキストはまず **[analyzer](./analyzer-overview)** によって処理され、個々の用語にトークン化されます。

例えば、次のドキュメントを考えます。

```plaintext
"We are loving Milvus!"
```

これは、次の用語に解析できます。

```plaintext
["we", "love", "milvus"]
```

次に、各ドキュメントは、各用語がドキュメント内に何回出現するかを記録する用語頻度（TF）表現として表されます。例えば、次のようになります。

```plaintext
{
  "we": 1,
  "love": 1,
  "milvus": 1
}
```

同時に、Zilliz Cloud はコーパスレベルの統計情報を更新します。これには次のものが含まれます。

- 各用語のドキュメント頻度（DF）

- 平均ドキュメント長

- 各用語を、その用語を含むドキュメントに対応付けるポスティングリスト

ドキュメントの TF 表現は**スパース埋め込み**に挿入され、用語のポスティングはスケーラブルな取得のためにノード間で分割されます。

### クエリテキストの処理: IDF 重み付けの適用\{#query-text-process-apply-idf-weighting}

テキストベースのクエリが発行されると、[ドキュメントの取り込み](./bm25-function#document-ingestion-from-text-to-sparse-representation) 時と同じ **analyzer** によって処理され、一貫した用語の分割が保証されます。

例えば、次のクエリを考えます。

```plaintext
"who loves Milvus?"
```

これは、次のように解析できます。

```plaintext
["who", "love", "milvus"]
```

Zilliz Cloud は、各クエリ用語について、コーパス統計からその[逆文書頻度](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)（IDF）を参照します。IDF は、データセット全体で用語がどの程度情報量を持つかを表します。希少な用語ほど高い重みを受け取り、一般的な用語ほど低い重みを受け取ります。

概念的には、これにより次のような IDF で重み付けされたクエリ用語のセットが生成されます。

```plaintext
{
  "who": 0.1,
  "love": 0.5,
  "milvus": 1.2
}
```

### BM25 スコアリングと上位 K 件の取得\{#bm25-scoring-and-top-k-retrieval}

BM25 は、一致したクエリ用語に基づいて関連性スコアを計算することで、ドキュメントをランク付けします。スコアリングは**用語レベル**で実行され、**ドキュメントレベル**で集計されます。

**用語レベルのスコアリング**

ドキュメントに出現する各クエリ用語について、BM25 は用語レベルのスコアを計算します。

```plaintext
term_score =
  IDF(term) ×
  TF_boost(term, document, k1) ×
  length_normalization(document, b)
```

ここで、

- **IDF(term)** は、その用語がコレクション内でどれだけ希少であるかを表します。

- **TF_boost(…, k1)** は、用語頻度とともに増加しますが、頻度が高くなるにつれて飽和します。

- **length_normalization(…, b)** は、ドキュメント長に基づいてスコアを調整します。

**ドキュメントレベルのスコアリングと Top-K 取得**

最終的なドキュメントスコアは、一致したすべてのクエリ用語の用語レベルスコアの合計です。

```plaintext
document_score =
  sum of term_score over all matched query terms
```

ドキュメントは最終スコアでランク付けされ、スコアの高い上位 K 件のドキュメントが返されます。

## 事前準備\{#before-you-start}

BM25 関数を使用する前に、コレクションのスキーマが字句的なフルテキスト検索をサポートするように計画してください。

- **生のコンテンツ用のテキストフィールド**

    コレクションには、生のテキストを格納するための `VARCHAR` フィールドを含める必要があります。このフィールドは、フルテキスト検索のために処理されるテキストのソースとなります。

- **テキストフィールド用の analyzer**

    テキストフィールドでは analyzer を有効にする必要があります。analyzer は、BM25 関数によって字句的な関連性が計算される前に、テキストがどのようにトークン化および正規化されるかを定義します。

    デフォルトでは、Zilliz Cloud は空白と句読点に基づいてテキストをトークン化する組み込みの analyzer を提供します。アプリケーションでカスタムのトークン化や正規化の動作が必要な場合は、カスタム analyzer を定義できます。詳細については、[ユースケースに適した Analyzer を選ぶ](./choose-the-right-analyzer-for-your-use-case) を参照してください。

- **BM25 出力用のスパースベクトル**

    コレクションには、BM25 関数によって生成されるスパース表現を格納するための `SPARSE_FLOAT_VECTOR` フィールドを含める必要があります。このフィールドは、フルテキスト検索時のインデックス作成と取得に使用されます。

これらのスキーマレベルの検討事項を確認したら、コレクションを作成し、BM25 関数を使用します。

## ステップ 1: BM25 関数を使用してコレクションを作成する\{#step-1-create-a-collection-with-a-bm25-function}

BM25 関数を使用するには、コレクションの作成時に定義する必要があります。この関数はコレクションのスキーマの一部となり、データの挿入時と検索時に自動的に適用されます。

### SDK 経由\{#via-sdk}

#### スキーマフィールドを定義する\{#define-schema-fields}

コレクションのスキーマには、少なくとも 3 つの必須フィールドを含める必要があります。

- **プライマリフィールド**: コレクション内の各エンティティを一意に識別します。

- **テキストフィールド** (`VARCHAR`): 生のテキストドキュメントを格納します。Zilliz Cloud が BM25 関連性ランキングのためにテキストを処理できるよう、`enable_analyzer=True` を設定する必要があります。デフォルトでは、Zilliz Cloud はテキスト解析に [`standard`](./standard-analyzer)[ analyzer](./standard-analyzer) を使用します。別の analyzer を設定するには、[Analyzer の概要](./analyzer-overview) を参照してください。

- **スパースベクトルフィールド** (`SPARSE_FLOAT_VECTOR`): BM25 関数によって自動的に生成されるスパース埋め込みを格納します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
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

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey:  token,
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

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let schema = CollectionSchema::new()
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(true))
    .add_field(FieldSchema::new().name("text").data_type(DataType::VarChar).max_length(1000).enable_analyzer(true))
    .add_field(FieldSchema::new().name("sparse").data_type(DataType::SparseFloatVector));
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

console.log(schema);
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

<TabItem value='shell'>

```shell
# Zilliz CLI
```

</TabItem>
</Tabs>

#### BM25 関数を定義する\{#define-the-bm25-function}

BM25 関数は、トークン化されたテキストを、BM25 スコアリングをサポートするスパースベクトルに変換します。

関数を定義し、スキーマに追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
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

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let bm25_function = Function::new()
    .name("text_bm25_emb")
    .function_type(FunctionType::Bm25)
    .input_fields(["text"])
    .output_fields(["sparse"]);

let schema = schema.add_function(bm25_function);
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
];
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

<TabItem value='shell'>

```shell
# Zilliz CLI
```

</TabItem>
</Tabs>

#### インデックスを構成する\{#configure-the-index}

必要なフィールドと組み込み関数を含むスキーマを定義したら、コレクションのインデックスを設定します。このプロセスを簡素化するには、`index_type` として `AUTOINDEX` を使用します。これは、データの構造に基づいて Zilliz Cloud が最適なインデックスタイプを選択して構成できるようにするオプションです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
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
        .indexType(IndexParam.IndexType.SPARSE_INVERTED_INDEX)
        .metricType(IndexParam.MetricType.BM25)
        .extraParams(params)
        .build());    
```

</TabItem>

<TabItem value='go'>

```go
indexOption := milvusclient.NewCreateIndexOption("my_collection", "sparse",
    index.NewSparseInvertedIndex(entity.BM25, 0.05))
indexOption.WithExtraParam("inverted_index_algo", "DAAT_MAXSCORE")
indexOption.WithExtraParam("bm25_k1", 1.2)
indexOption.WithExtraParam("bm25_b", 0.75)
```

</TabItem>

<TabItem value='rust'>

```rust
use std::collections::HashMap;

let index_params = IndexParam::new()
    .field_name("sparse")
    .index_type(IndexType::SparseInvertedIndex)
    .metric_type(MetricType::Bm25)
    .extra_params(HashMap::from([
        ("inverted_index_algo".into(), "DAAT_MAXSCORE".into()),
        ("bm25_k1".into(), "1.2".into()),
        ("bm25_b".into(), "0.75".into()),
    ]));
```

</TabItem>

<TabItem value='c++'>

```c++
auto index_params = milvus::IndexDesc("sparse", "", milvus::IndexType::SPARSE_INVERTED_INDEX, milvus::MetricType::BM25);
index_params.AddExtraParam("inverted_index_algo", "DAAT_MAXSCORE");
index_params.AddExtraParam("bm25_k1", "1.2");
index_params.AddExtraParam("bm25_b", "0.75");
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
            "indexType": "SPARSE_INVERTED_INDEX",
            "params":{
               "inverted_index_algo": "DAAT_MAXSCORE",
               "bm25_k1": 1.2,
               "bm25_b": 0.75
            }
        }
    ]'
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI
```

</TabItem>
</Tabs>

#### コレクションを作成する\{#create-the-collection}

次に、定義したスキーマとインデックスパラメーターを使用してコレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name='my_collection', 
    schema=schema, 
    index_params=index_params
)

client.load_collection('my_collection')
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.LoadCollectionReq;

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
client.loadCollection(LoadCollectionReq.builder()
        .collectionName("my_collection")
        .build());
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

_, err = client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client.create_collection(
    CreateCollectionRequest::builder()
        .collection_name("my_collection")
        .schema(schema)
        .index_param(index_params)
        .build()?,
)
.await?;

client.load_collection(LoadCollectionRequest::builder().collection_name("my_collection").build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->CreateCollection(milvus::CreateCollectionRequest()
                                    .WithCollectionName("my_collection")
                                    .WithCollectionSchema(schema)
                                    .AddIndex(std::move(index_params)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->LoadCollection(milvus::LoadCollectionRequest()
                                    .WithCollectionName("my_collection"));
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
    index_params: index_params,
    functions: functions
});

await client.loadCollection({ collection_name: "my_collection" });
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
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "collectionName": "my_collection"
}'
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI
```

</TabItem>
</Tabs>

### Web コンソール経由\{#via-web-console}

または、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) で BM25 関数を使用してコレクションを作成することもできます。

<Supademo id="cmjl3i2jg4mkb3zz206xgz4tr" title=""  />

BM25 関数を備えたコレクションが作成されたら、テキストを挿入し、テキストクエリに基づく字句検索を実行できます。

## ステップ 2: コレクションにテキストデータを挿入する\{#step-2-insert-text-data-into-the-collection}

コレクションとインデックスを設定したら、テキストデータを挿入する準備が整います。このプロセスでは、生のテキストを指定するだけで済みます。先ほど定義した BM25 関数が、各テキストエントリのスパースベクトルを自動的に生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
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
_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection").
    WithVarcharColumn("text", []string{
        "information retrieval is a field of study.",
        "information retrieval focuses on finding relevant information in large datasets.",
        "data mining and information retrieval overlap in research.",
    }),
)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

client.insert(
    InsertRequest::builder()
        .collection_name("my_collection")
        .rows(vec![
            json!({"text": "information retrieval is a field of study."}),
            json!({"text": "information retrieval focuses on finding relevant information in large datasets."}),
            json!({"text": "data mining and information retrieval overlap in research."}),
        ])
        .build()?,
)
.await?;
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

<TabItem value='javascript'>

```javascript
await client.insert({
    collection_name: 'my_collection',
    data: [
        {'text': 'information retrieval is a field of study.'},
        {'text': 'information retrieval focuses on finding relevant information in large datasets.'},
        {'text': 'data mining and information retrieval overlap in research.'},
    ],
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
        {"text": "information retrieval is a field of study."},
        {"text": "information retrieval focuses on finding relevant information in large datasets."},
        {"text": "data mining and information retrieval overlap in research."}       
    ],
    "collectionName": "my_collection"
}'
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI
```

</TabItem>
</Tabs>

## ステップ 3: テキストクエリで検索する\{#step-3-search-with-text-query}

コレクションにデータを挿入したら、生のテキストクエリを使用してフルテキスト検索を実行できます。Zilliz Cloud はクエリを自動的にスパースベクトルに変換し、BM25 アルゴリズムを使用して一致した検索結果をランク付けしてから、上位 K 件（`limit`）の結果を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
search_params = {
    "metric_type": "BM25",  # Metric type must be BM25 for full text search
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
searchParams.put("metric_type", "BM25");
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
annSearchParams.WithExtraParam("metric_type", "BM25")
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

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let res = client.search(
    SearchRequest::builder()
        .collection_name("my_collection")
        .vector_field("sparse")
        .vectors(SearchVectors::EmbeddedText(vec!["whats the focus of information retrieval?".to_string()]))
        .metric_type(MetricType::Bm25)
        .limit(3)
        .output_fields(["text"])
        .build()?,
)
.await?;

println!("{:?}", res.results());
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::SearchRequest()
                       .WithCollectionName("my_collection")
                       .AddEmbeddedText("whats the focus of information retrieval?")
                       .WithLimit(3)
                       .WithAnnsField("sparse")
                       .AddExtraParam("metric_type", "BM25")
                       .AddOutputField("text");

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search({
    collection_name: 'my_collection',
    data: ['whats the focus of information retrieval?'],
    anns_field: 'sparse',
    output_fields: ['text'],
    params: { metric_type: "BM25" },
    limit: 3,
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
        "metric_type": "BM25",
        "params":{}
    }
}'
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI
```

</TabItem>
</Tabs>
