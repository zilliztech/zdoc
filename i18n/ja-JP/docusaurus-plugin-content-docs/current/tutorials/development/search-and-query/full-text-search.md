---
title: "フルテキスト検索 | Cloud"
slug: /full-text-search
sidebar_label: "フルテキスト検索"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "フルテキスト検索は、テキストデータセット内で特定の用語やフレーズを含むドキュメントを取得し、その後、関連性に基づいて結果をランク付けする機能です。この機能は、正確な用語を見落とす可能性があるセマンティック検索の制限を克服し、最も正確で文脈に即した結果を確実に得られるようにします。さらに、生のテキスト入力を受け入れ、手動でベクトル埋め込みを生成することなくテキストデータを自動的にスパース埋め込みに変換することで、ベクトル検索を簡素化します。 | Cloud"
type: origin
token: RQTRwhOVPiwnwokqr4scAtyfnBf
sidebar_position: 12
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# フルテキスト検索

フルテキスト検索は、テキストデータセット内で特定の用語やフレーズを含むドキュメントを取得し、その後、関連性に基づいて結果をランク付けする機能です。この機能は、正確な用語を見落とす可能性があるセマンティック検索の制限を克服し、最も正確で文脈に即した結果を確実に得られるようにします。さらに、生のテキスト入力を受け入れ、手動でベクトル埋め込みを生成することなくテキストデータを自動的にスパース埋め込みに変換することで、ベクトル検索を簡素化します。

関連性スコアリングに BM25 アルゴリズムを使用するこの機能は、retrieval-augmented generation（RAG）のシナリオで特に有用であり、特定の検索語句に密接に一致するドキュメントを優先します。

<Admonition type="info" title="Notes">

フルテキスト検索をセマンティックベースの密ベクトル検索と統合することで、検索結果の精度と関連性を高めることができます。詳細については、[ハイブリッド検索](./hybrid-search) を参照してください。

</Admonition>

Zilliz Cloud は、フルテキスト検索をプログラムから、または Web コンソール経由で有効にすることをサポートしています。このページでは、フルテキスト検索をプログラムから有効にする方法について説明します。Web コンソールでの操作の詳細については、[コレクションの管理（コンソール）](./manage-collections-console#full-text-search) を参照してください。

## BM25 実装\{#bm25-implementation}

Zilliz Cloud は、情報検索システムで広く採用されているスコアリング関数である BM25 関連性アルゴリズムを活用したフルテキスト検索を提供しており、Zilliz Cloud はそれを検索ワークフローに統合することで、正確で関連性に基づいてランク付けされたテキスト結果を提供します。

Zilliz Cloud のフルテキスト検索は、次のワークフローに従います。

1. **生のテキスト入力**: テキストドキュメントを挿入するか、プレーンテキストでクエリを指定します。埋め込みモデルは必要ありません。

1. **テキスト解析**: Zilliz Cloud は [analyzer](./analyzer-overview) を使用して、テキストをインデックス化および検索可能な意味のある用語に処理します。

1. **BM25 関数処理**: 組み込み関数がこれらの用語を、BM25 スコアリングに最適化されたスパースベクトル表現に変換します。

1. **コレクションストア**: Zilliz Cloud は、生成されたスパース埋め込みをコレクションに格納し、高速な取得とランク付けを可能にします。

1. **BM25 関連性スコアリング**: 検索時に、Zilliz Cloud は BM25 スコアリング関数を適用してドキュメントの関連性を計算し、クエリ語句に最も一致するランク付けされた結果を返します。

![DfPMwP6ZahhHlLbIN0gcG9d7nQM](https://zdoc-images.s3.us-west-2.amazonaws.com/DfPMwP6ZahhHlLbIN0gcG9d7nQM.png)

フルテキスト検索を使用するには、次の主な手順に従います。

1. [コレクションを作成する](./full-text-search#create-a-collection-for-bm25-full-text-search): 必要なフィールドを設定し、生のテキストをスパース埋め込みに変換する BM25 関数を定義します。

1. [データを挿入する](./full-text-search#insert-text-data): 生のテキストドキュメントをコレクションに取り込みます。

1. [検索を実行する](./full-text-search#perform-full-text-search): 自然言語のクエリテキストを使用して、BM25 の関連性に基づくランク付けされた結果を取得します。

## BM25 フルテキスト検索用のコレクションを作成する\{#create-a-collection-for-bm25-full-text-search}

BM25 を利用したフルテキスト検索を有効にするには、必要なフィールドを備えたコレクションを準備し、スパースベクトルを生成する BM25 関数を定義し、インデックスを構成してから、コレクションを作成する必要があります。

### スキーマフィールドを定義する\{#define-schema-fields}

コレクションのスキーマには、少なくとも 3 つの必須フィールドを含める必要があります。

- **プライマリフィールド**: コレクション内の各エンティティを一意に識別します。

- **文字列フィールド** (`VARCHAR` または `TEXT`): 生のテキストドキュメントを格納します。Zilliz Cloud が BM25 関連性ランキングのためにテキストを処理できるよう、`enable_analyzer=True` を設定する必要があります。デフォルトでは、Zilliz Cloud はテキスト解析に [`standard`](./standard-analyzer)[ analyzer](./standard-analyzer) を使用します。別の analyzer を設定するには、[Analyzer の概要](./analyzer-overview) を参照してください。このページの例では `VARCHAR` を使用しています。長いテキストの場合は、入力フィールドを `TEXT` として定義し、`max_length` を省略できます。完全な例については、[Text フィールド](./use-text-field) を参照してください。

- **スパースベクトルフィールド** (`SPARSE_FLOAT_VECTOR`): BM25 関数によって自動的に生成されるスパース埋め込みを格納します。

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
</Tabs>

```plaintext
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

```shell
# Zilliz CLI
```

前述の設定は以下のとおりです。

- `id`: 主キーとして機能し、`auto_id=True` によって自動生成されます。

- `text`: フルテキスト検索操作用の生のテキストデータを格納します。データ型は `VARCHAR` である必要があります。`VARCHAR` は Zilliz Cloud でテキストを格納するための文字列データ型です。

- `sparse`: フルテキスト検索操作用に内部的に生成されたスパース埋め込みを格納するために予約されたベクトルフィールドです。データ型は `SPARSE_FLOAT_VECTOR` である必要があります。

### BM25 関数を定義する\{#define-the-bm25-function}

BM25 関数は、トークン化されたテキストを BM25 スコアリングをサポートするスパースベクトルに変換します。

関数を定義し、スキーマに追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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

<TabItem value='c++'>

```c++
milvus::FunctionPtr function = std::make_shared<milvus::Function>("text_bm25_emb", milvus::FunctionType::BM25);
function->AddInputFieldName("text");
function->AddOutputFieldName("sparse");
schema->AddFunction(function);
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI
```

</TabItem>
</Tabs>

| パラメーター | 説明 |
| --- | --- |
| `name` | 関数の名前です。この関数は、`text` フィールドの生のテキストを BM25 互換のスパースベクトルに変換し、それらを `sparse` フィールドに格納します。 |
| `input_field_names` | テキストからスパースベクトルへの変換が必要な `VARCHAR` フィールドの名前です。`FunctionType.BM25` の場合、このパラメーターは 1 つのフィールド名のみを受け付けます。 |
| `output_field_names` | 内部的に生成されたスパースベクトルを格納するフィールドの名前です。`FunctionType.BM25` の場合、このパラメーターは 1 つのフィールド名のみを受け付けます。 |
| `function_type` | 使用する関数のタイプです。`FunctionType.BM25` を指定する必要があります。 |

<Admonition type="info" title="Notes">

複数の `VARCHAR` フィールドで BM25 処理が必要な場合は、**フィールドごとに 1 つの BM25 関数**を定義し、それぞれに一意の名前と出力フィールドを設定してください。

</Admonition>

### インデックスを設定する\{#configure-the-index}

必要なフィールドと組み込み関数を含むスキーマを定義したら、コレクションのインデックスを設定します。このプロセスを簡素化するには、`index_type` として `AUTOINDEX` を使用します。これは、データの構造に基づいて最適なインデックスタイプを Zilliz Cloud が選択して構成できるようにするオプションです。

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
</Tabs>

```plaintext
auto index_params = milvus::IndexDesc("sparse", "", milvus::IndexType::SPARSE_INVERTED_INDEX, milvus::MetricType::BM25);
index_params.AddExtraParam("inverted_index_algo", "DAAT_MAXSCORE");
index_params.AddExtraParam("bm25_k1", "1.2");
index_params.AddExtraParam("bm25_b", "0.75");
```

```shell
# Zilliz CLI
```

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>field_name</code></p></td>
     <td><p>インデックスを作成するベクトルフィールドの名前です。フルテキスト検索では、生成されたスパースベクトルを格納するフィールドを指定します。この例では、値を <code>sparse</code> に設定します。</p></td>
   </tr>
   <tr>
     <td><p><code>index_type</code></p></td>
     <td><p>作成するインデックスのタイプです。<code>AUTOINDEX</code> を使用すると、Zilliz Cloud がインデックス設定を自動的に最適化できます。インデックス設定をより細かく制御する必要がある場合は、Zilliz Cloud でスパースベクトルに使用できるさまざまなインデックスタイプから選択できます。</p></td>
   </tr>
   <tr>
     <td><p><code>metric_type</code></p></td>
     <td><p>このパラメーターの値は、特にフルテキスト検索機能で使用する場合、<code>BM25</code> に設定する必要があります。</p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>インデックスに固有の追加パラメーターの辞書です。</p></td>
   </tr>
   <tr>
     <td><p><code>params.inverted_index_algo</code></p></td>
     <td><p>インデックスの構築とクエリに使用されるアルゴリズムです。有効な値は次のとおりです。</p><ul><li><p><code>&quot;DAAT_MAXSCORE&quot;</code>（デフォルト）: MaxScore アルゴリズムを使用した最適化された Document-at-a-Time（DAAT）クエリ処理です。MaxScore は、影響が最小限である可能性が高い用語やドキュメントをスキップすることで、大きい <em>k</em> 値や多くの用語を含むクエリに対して優れたパフォーマンスを提供します。これは、最大影響スコアに基づいて用語を必須グループと非必須グループに分割し、top-k の結果に寄与できる用語に焦点を当てることで実現します。</p></li><li><p><code>&quot;DAAT_WAND&quot;</code>: WAND アルゴリズムを使用した最適化された DAAT クエリ処理です。WAND は、最大影響スコアを活用して競合しないドキュメントをスキップすることで評価するヒットドキュメント数を減らしますが、ヒットあたりのオーバーヘッドは大きくなります。このため WAND は、スキップがより実行しやすい、小さい <em>k</em> 値のクエリや短いクエリでより効率的です。</p></li><li><p><code>&quot;TAAT_NAIVE&quot;</code>: 基本的な Term-at-a-Time（TAAT）クエリ処理です。<code>DAAT_MAXSCORE</code> や <code>DAAT_WAND</code> と比較して低速ですが、<code>TAAT_NAIVE</code> には独自の利点があります。グローバルなコレクションパラメーター（avgdl）の変更に関係なく静的なままであるキャッシュされた最大影響スコアを使用する DAAT アルゴリズムとは異なり、<code>TAAT_NAIVE</code> はそのような変更に動的に適応します。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.bm25_k1</code></p></td>
     <td><p>用語頻度の飽和を制御します。値を大きくすると、ドキュメントのランキングにおける用語頻度の重要度が高まります。値の範囲: [1.2, 2.0]。</p></td>
   </tr>
   <tr>
     <td><p><code>params.bm25_b</code></p></td>
     <td><p>ドキュメントの長さが正規化される程度を制御します。通常は 0 ～ 1 の値が使用され、デフォルト値は 0.75 です。値 0 は長さの正規化を行わないことを意味し、値 1 は完全な長さの正規化を意味します。</p></td>
   </tr>
</table>

### コレクションを作成する\{#create-the-collection}

次に、定義したスキーマとインデックスパラメーターを使用してコレクションを作成します。

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
await client.create_collection({
    collection_name: 'my_collection',
    schema: schema,
    index_params: index_params,
    functions: functions
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

```plaintext
auto status = client->CreateCollection(milvus::CreateCollectionRequest()
                                    .WithCollectionName("my_collection")
                                    .WithCollectionSchema(schema)
                                    .AddIndex(std::move(index_params)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

```shell
# Zilliz CLI
```

## テキストデータを挿入する\{#insert-text-data}

コレクションとインデックスを設定したら、テキストデータを挿入する準備が整います。このプロセスでは、生のテキストを指定するだけで済みます。先ほど定義した組み込み関数が、各テキストエントリに対応するスパースベクトルを自動的に生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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

<TabItem value='shell'>

```shell
# Zilliz CLI
```

</TabItem>
</Tabs>

## フルテキスト検索を実行する\{#perform-full-text-search}

コレクションにデータを挿入したら、生のテキストクエリを使用してフルテキスト検索を実行できます。Zilliz Cloud はクエリを自動的にスパースベクトルに変換し、BM25 アルゴリズムを使用して一致した検索結果をランク付けしてから、上位 topK（`limit`）件の結果を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
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
await client.search({
    collection_name: 'my_collection',
    data: ['whats the focus of information retrieval?'],
    anns_field: 'sparse',
    output_fields: ['text'],
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

<TabItem value='shell'>

```shell
# Zilliz CLI
```

</TabItem>
</Tabs>

| パラメーター | 説明 |
| --- | --- |
| `search_params` | 検索パラメーターを含む辞書です。 |
| `params.level` | 簡素化された検索最適化によって検索精度を制御します。詳細については、[再現率の調整](./tune-recall-rate) を参照してください。 |
| `data` | 自然言語による生のクエリテキストです。Zilliz Cloud は BM25 関数を使用してテキストクエリを自動的にスパースベクトルに変換します。事前に計算されたベクトルは指定しないでください。 |
| `anns_field` | 内部的に生成されたスパースベクトルを含むフィールドの名前です。 |
| `output_fields` | 検索結果で返すフィールド名のリストです。BM25 で生成された埋め込みを含む **スパースベクトルフィールドを除く** すべてのフィールドをサポートします。一般的な出力フィールドには、主キーフィールド（例: `id`）や元のテキストフィールド（例: `text`）があります。詳細については、[FAQ](./full-text-search#can-i-output-or-access-the-sparse-vectors-generated-by-the-bm25-function-in-full-text-search) を参照してください。 |
| `limit` | 返す上位一致の最大数です。 |

## FAQ\{#faq}

### フルテキスト検索で BM25 関数が生成したスパースベクトルを出力またはアクセスできますか？\{#can-i-output-or-access-the-sparse-vectors-generated-by-the-bm25-function-in-full-text-search}

いいえ、BM25 関数によって生成されたスパースベクトルは、フルテキスト検索で直接アクセスしたり出力したりすることはできません。詳細は次のとおりです。

- BM25 関数は、ランキングと取得のために内部的にスパースベクトルを生成します

- これらのベクトルはスパースフィールドに格納されますが、`output_fields` に含めることはできません

- 出力できるのは、元のテキストフィールドとメタデータ（`id`、`text` など）のみです

例:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# ❌ This throws an error - you cannot output the sparse field
client.search(
    collection_name='my_collection',
    data=['query text'],
    anns_field='sparse',
    # highlight-next-line
    output_fields=['text', 'sparse'],  # 'sparse' causes an error
    limit=3,
    search_params=search_params
)

# ✅ This works - output text fields only
client.search(
    collection_name='my_collection',
    data=['query text'],
    anns_field='sparse',
    # highlight-next-line
    output_fields=['text'],
    limit=3,
    search_params=search_params
)
```

</TabItem>

<TabItem value='java'>

```java
// Searching with the sparse field in outputFields throws an error.
// Only output the original text and metadata fields.
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new EmbeddedText("query text")))
        .annsField("sparse")
        .topK(3)
        .outputFields(Collections.singletonList("text"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// Searching with the sparse field in output_fields throws an error.
// Only output the original text and metadata fields.
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection",
    3,
    []entity.Vector{entity.Text("query text")},
).WithConsistencyLevel(entity.ClStrong).
    WithANNSField("sparse").
    WithAnnParam(index.NewCustomAnnParam()).
    WithOutputFields("text"))
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Searching with the sparse field in output_fields throws an error.
// Only output the original text and metadata fields.
await client.search({
    collection_name: 'my_collection',
    data: ['query text'],
    anns_field: 'sparse',
    output_fields: ['text'],
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
    "data": ["query text"],
    "annsField": "sparse",
    "limit": 3,
    "outputFields": ["text"]
}'
```

</TabItem>
</Tabs>

```plaintext
// Searching with the sparse field in output_fields throws an error.
// Only output the original text and metadata fields.
milvus::SearchRequest request = milvus::SearchRequest()
    .WithCollectionName("my_collection")
    .AddEmbeddedText("query text")
    .WithLimit(3)
    .WithAnnsField("sparse")
    .AddOutputField("text");
```

```shell
# Zilliz CLI
```

### アクセスできないのに、なぜスパースベクトルフィールドを定義する必要があるのですか？\{#why-do-i-need-to-define-a-sparse-vector-field-if-i-cant-access-it}

スパースベクトルフィールドは、ユーザーが直接操作しないデータベースのインデックスと同様に、内部的な検索インデックスとして機能します。

**設計の根拠**:

- 関心の分離: テキスト (input/output), Milvus がベクトル（内部処理）を扱います

- パフォーマンス: 事前に計算されたスパースベクトルにより、クエリ時の高速な BM25 ランキングが可能になります

- ユーザーエクスペリエンス: 複雑なベクトル操作をシンプルなテキストインターフェースの背後に抽象化します

**ベクトルにアクセスする必要がある場合**:

- フルテキスト検索の代わりに、手動のスパースベクトル操作を使用します

- カスタムのスパースベクトルワークフロー用に別のコレクションを作成します

詳細については、[スパースベクトル](./use-sparse-vector) を参照してください。
