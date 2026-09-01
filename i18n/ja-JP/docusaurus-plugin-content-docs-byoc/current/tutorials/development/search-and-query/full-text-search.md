---
title: "全文検索 | BYOC"
slug: /full-text-search
sidebar_label: "全文検索"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "全文検索は、テキストデータセットから特定の用語やフレーズを含むドキュメントを取得し、関連性に基づいて結果をランキングする機能です。この機能により、正確な用語を見逃しがちなセマンティック検索の限界を補い、より精度高く文脈に即した結果を得られます。さらに、生のテキスト入力をそのまま受け付けて自動的にスパース埋め込みに変換するため、ベクトル埋め込みを手動で生成することなくベクトル検索を実行できます。 | BYOC"
type: origin
token: RQTRwhOVPiwnwokqr4scAtyfnBf
sidebar_position: 12
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 全文検索

全文検索は、テキストデータセットから特定の用語やフレーズを含むドキュメントを取得し、関連性に基づいて結果をランキングする機能です。この機能により、正確な用語を見逃しがちなセマンティック検索の限界を補い、より精度高く文脈に即した結果を得られます。さらに、生のテキスト入力をそのまま受け付けて自動的にスパース埋め込みに変換するため、ベクトル埋め込みを手動で生成することなくベクトル検索を実行できます。

関連性スコアリングにBM25アルゴリズムを使用するこの機能は、特定の検索語句に厳密に一致するドキュメントを優先できるため、検索拡張生成（RAG）のシナリオで特に有効です。

<Admonition type="info" icon="📘" title="Notes">

全文検索をセマンティックベースの高密度ベクトル検索と組み合わせることで、検索結果の精度と関連性をさらに高められます。詳細については、[ハイブリッド検索](./hybrid-search)を参照してください。

</Admonition>

Zilliz Cloud では、プログラムまたはWebコンソールから全文検索を有効にできます。このページでは、プログラムで全文検索を有効にする方法を説明します。Webコンソールでの操作の詳細については、[コレクションの管理（コンソール）](./manage-collections-console#full-text-search)を参照してください。

## BM25の実装\{#bm25-implementation}

Zilliz Cloud は、情報検索システムで広く採用されているBM25関連性アルゴリズムに基づく全文検索を提供しており、Zilliz Cloud はこれを検索ワークフローに統合して、関連性に応じてランク付けされた正確なテキスト検索結果を返します。

Zilliz Cloud における全文検索は、以下のワークフローに従います。

1. **生テキスト入力**: プレーンテキストを用いてドキュメントを挿入したりクエリを指定したりでき、埋め込みモデルは不要です。

1. **テキスト解析**: Zilliz Cloud が[アナライザー](./analyzer-overview)を使用してテキストを処理し、インデックス化や検索に適した意味のある語句に分解します。

1. **BM25関数による処理**: 組み込み関数がこれらの語句を、BM25スコアリングに最適化されたスパースベクトル表現に変換します。

1. **コレクションへの保存**: Zilliz Cloud は、高速な取得とランキングのため、生成されたスパース埋め込みをコレクションに保存します。

1. **BM25による関連性スコアリング**: 検索時に Zilliz Cloud がBM25スコアリング関数を適用してドキュメントの関連性を算出し、クエリの語句に最も適合する結果をランキングして返します。

![DfPMwP6ZahhHlLbIN0gcG9d7nQM](https://zdoc-images.s3.us-west-2.amazonaws.com/DfPMwP6ZahhHlLbIN0gcG9d7nQM.png)

全文検索を利用するには、主に以下の手順を実行します。

1. [コレクションの作成](./full-text-search#create-a-collection-for-bm25-full-text-search): 必要なフィールドを設定し、生テキストをスパース埋め込みに変換するBM25関数を定義します。

1. [データの挿入](./full-text-search#insert-text-data): 生テキストドキュメントをコレクションに取り込みます。

1. [検索の実行](./full-text-search#perform-full-text-search): 自然言語のクエリテキストを使用して、BM25の関連性に基づきランキングされた結果を取得します。

## BM25全文検索用コレクションの作成\{#create-a-collection-for-bm25-full-text-search}

BM25を活用した全文検索を有効にするには、必要なフィールドを備えたコレクションを準備し、スパースベクトルを生成するBM25関数を定義し、インデックスを設定した上で、コレクションを作成する必要があります。

### スキーマフィールドの定義\{#define-schema-fields}

コレクションのスキーマには、少なくとも以下の3つの必須フィールドを含める必要があります。

- **プライマリフィールド**: コレクション内の各エンティティを一意に識別します。

- **文字列フィールド**（`VARCHAR` または `TEXT`）: 生テキストドキュメントを保存します。Zilliz Cloud がBM25の関連性ランキング用にテキストを処理できるよう、`enable_analyzer=True` を設定する必要があります。デフォルトでは、Zilliz Cloud はテキスト解析に [`standard`](./standard-analyzer)[ アナライザー](./standard-analyzer) を使用します。別のアナライザーを設定する場合は、[アナライザーの概要](./analyzer-overview)を参照してください。このページの例では `VARCHAR` を使用していますが、長いテキストを扱う場合は入力フィールドを `TEXT` として定義し、`max_length` を省略できます。完全な例については、[テキストフィールド](./use-text-field)を参照してください。

- **スパースベクトルフィールド**（`SPARSE_FLOAT_VECTOR`）: BM25関数によって自動生成されたスパース埋め込みを保存します。

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

上記の設定において、各項目は以下の通りです。

- `id`: 主キーとして機能し、`auto_id=True` により自動生成されます。

- `text`: 全文検索用の生テキストデータを保存します。データ型は `VARCHAR` である必要があります。これは、`VARCHAR` が Zilliz Cloud におけるテキスト保存用の文字列データ型であるためです。

- `sparse`: 全文検索用に内部で生成されるスパース埋め込みを保存するためのベクトルフィールドです。データ型は `SPARSE_FLOAT_VECTOR` である必要があります。

### BM25 関数の定義\{#define-the-bm25-function}

BM25 関数は、トークン化されたテキストを BM25 スコアリングに対応するスパースベクトルに変換します。

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

| パラメーター | 説明 |
| --- | --- |
| `name` | 関数の名前です。この関数は、`text` フィールドの生テキストを BM25 対応のスパースベクトルに変換し、`sparse` フィールドに格納します。 |
| `input_field_names` | テキストからスパースベクトルへの変換対象となる `VARCHAR` フィールドの名前です。`FunctionType.BM25` では、このパラメーターに指定できるフィールド名は 1 つだけです。 |
| `output_field_names` | 内部で生成されたスパースベクトルの格納先フィールドの名前です。`FunctionType.BM25` では、このパラメーターに指定できるフィールド名は 1 つだけです。 |
| `function_type` | 使用する関数のタイプです。`FunctionType.BM25` を指定する必要があります。 |

<Admonition type="info" icon="📘" title="Notes">

BM25 処理が必要な `VARCHAR` フィールドが複数ある場合は、**フィールドごとに 1 つの BM25 関数**を定義し、それぞれに一意の名前と出力フィールドを設定してください。

</Admonition>

### インデックスの設定\{#configure-the-index}

必要なフィールドと組み込み関数を含むスキーマを定義したら、コレクションのインデックスを設定します。手順を簡略化するには、`AUTOINDEX` を `index_type` として使用します。これにより、Zilliz Cloud がデータ構造に基づいて最適なインデックスタイプを自動的に選択・設定できます。

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

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>field_name</code></p></td>
     <td><p>インデックスを作成するベクトルフィールドの名前です。全文検索では、生成されたスパースベクトルを格納するフィールドを指定します。この例では、値を <code>sparse</code> に設定します。</p></td>
   </tr>
   <tr>
     <td><p><code>index_type</code></p></td>
     <td><p>作成するインデックスのタイプです。<code>AUTOINDEX</code> を指定すると、Zilliz Cloud がインデックス設定を自動的に最適化します。インデックス設定を細かく制御したい場合は、Zilliz Cloud で利用可能なスパースベクトル用の各種インデックスタイプから選択できます。</p></td>
   </tr>
   <tr>
     <td><p><code>metric_type</code></p></td>
     <td><p>全文検索機能を使用する場合、このパラメーターの値は必ず <code>BM25</code> に設定する必要があります。</p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>インデックス固有の追加パラメーターを含む辞書です。</p></td>
   </tr>
   <tr>
     <td><p><code>params.inverted_index_algo</code></p></td>
     <td><p>インデックスの構築およびクエリ実行に使用されるアルゴリズムです。有効な値は以下のとおりです。</p><ul><li><p><code>&quot;DAAT_MAXSCORE&quot;</code>（デフォルト）: MaxScore アルゴリズムを用いた最適化済みの Document-at-a-Time (DAAT) クエリ処理です。MaxScore は、影響度が低いと考えられる用語やドキュメントをスキップすることで、大きな <em>k</em> 値や多数の用語を含むクエリにおいて高いパフォーマンスを実現します。これは、最大影響スコアに基づいて用語を必須グループと非必須グループに分割し、top-k の結果に寄与する可能性のある用語に処理を集中させることで達成されます。</p></li><li><p><code>&quot;DAAT_WAND&quot;</code>: WAND アルゴリズムを用いた最適化済みの DAAT クエリ処理です。WAND は、最大影響スコアを利用して競合しないドキュメントをスキップすることで評価対象のヒット数を削減しますが、ヒットごとのオーバーヘッドが高くなります。そのため、スキップの効果が高い小さな <em>k</em> 値や短いクエリに対してより効率的です。</p></li><li><p><code>&quot;TAAT_NAIVE&quot;</code>: 基本的な Term-at-a-Time (TAAT) クエリ処理です。<code>DAAT_MAXSCORE</code> や <code>DAAT_WAND</code> に比べて低速ですが、<code>TAAT_NAIVE</code> には独自の利点があります。グローバルコレクションパラメーター（avgdl）の変更に関わらずキャッシュされた静的な最大影響スコアを使用する DAAT アルゴリズムとは異なり、<code>TAAT_NAIVE</code> はそのような変更に対して動的に適応します。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.bm25_k1</code></p></td>
     <td><p>用語頻度の飽和度を制御します。値が大きいほど、ドキュメントランキングにおける用語頻度の重要度が高くなります。値の範囲は [1.2, 2.0] です。</p></td>
   </tr>
   <tr>
     <td><p><code>params.bm25_b</code></p></td>
     <td><p>ドキュメント長の正規化の度合いを制御します。通常は 0 から 1 の値を使用し、デフォルト値は 0.75 です。0 は長さの正規化なし、1 は完全な長さの正規化を意味します。</p></td>
   </tr>
</table>

### コレクションの作成\{#create-the-collection}

定義したスキーマとインデックスパラメーターを使用して、コレクションを作成します。

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

## テキストデータの挿入\{#insert-text-data}

コレクションとインデックスの準備ができたら、テキストデータを挿入できます。この際、指定が必要なのは生のテキストのみです。前述の組み込み関数により、各テキストに対応するスパースベクトルが自動的に生成されます。

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

## 全文検索の実行\{#perform-full-text-search}

コレクションにデータを挿入すると、生のテキストクエリを使って全文検索を実行できます。Zilliz Cloud がクエリをスパースベクトルに自動変換し、BM25 アルゴリズムに基づいて検索結果をランキングした上で、topK（`limit`）件の結果を返します。

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

| パラメーター | 説明 |
| --- | --- |
| `search_params` | 検索パラメーターを含む辞書です。 |
| `params.level` | 簡易的な検索最適化により検索精度を制御します。詳細は「[再現率の調整](./tune-recall-rate)」を参照してください。 |
| `data` | 自然言語による生のクエリテキストです。Zilliz Cloud が BM25 関数を用いてテキストクエリをスパースベクトルに自動変換するため、事前計算済みのベクトルは指定しないでください。 |
| `anns_field` | 内部で生成されたスパースベクトルを格納するフィールドの名前です。 |
| `output_fields` | 検索結果として返すフィールド名のリストです。BM25 で生成された埋め込みを含む**スパースベクトルフィールドを除く**すべてのフィールドを指定できます。一般的には、プライマリキーフィールド（例: `id`）や元のテキストフィールド（例: `text`）を出力フィールドとして指定します。詳細は「[FAQ](./full-text-search#can-i-output-or-access-the-sparse-vectors-generated-by-the-bm25-function-in-full-text-search)」を参照してください。 |
| `limit` | 返される上位一致結果の最大件数です。 |

## FAQ\{#faq}

### 全文検索で BM25 関数によって生成されるスパースベクトルを出力または参照できますか？\{#can-i-output-or-access-the-sparse-vectors-generated-by-the-bm25-function-in-full-text-search}

いいえ、全文検索において BM25 関数が生成するスパースベクトルに直接アクセスしたり、それを出力したりすることはできません。詳細は以下のとおりです。

- BM25 関数は、ランキングや検索のためにスパースベクトルを内部的に生成します。

- これらのベクトルはスパースフィールドに保存されますが、`output_fields` に含めることはできません。

- 出力できるのは元のテキストフィールドとメタデータ（`id`、`text` など）のみです。

例:

```python
# ❌ This throws an error - you cannot output the sparse field
client.search(
    collection_name='my_collection',
    data=['query text'],
    anns_field='sparse',
    # highlight-next-line
    output_fields=['text', 'sparse']  # 'sparse' causes an error
    limit=3,
    search_params=search_params
)

# ✅ This works - output text fields only
client.search(
    collection_name='my_collection',
    data=['query text'],
    anns_field='sparse',
    # highlight-next-line
    output_fields=['text']
    limit=3,
    search_params=search_params
)
```

### アクセスできないにもかかわらず、スパースベクトルフィールドを定義する必要があるのはなぜですか？\{#why-do-i-need-to-define-a-sparse-vector-field-if-i-cant-access-it}

スパースベクトルフィールドは、ユーザーが直接操作することのないデータベースのインデックスと同様に、内部検索インデックスとして機能します。

**設計上の理由**:

- 関心の分離: ユーザーはテキスト（入力/output), Milvus）を扱い、システムはベクトル（内部処理）を処理します。

- パフォーマンス: 事前に計算されたスパースベクトルにより、クエリ実行時の高速な BM25 ランキングが可能になります。

- ユーザーエクスペリエンス: 複雑なベクトル操作をシンプルなテキストインターフェースの背後に抽象化します。

**ベクトルへのアクセスが必要な場合**:

- 全文検索の代わりに、手動でのスパースベクトル操作を利用してください。

- カスタムスパースベクトルワークフローには、専用のコレクションを作成してください。

詳細については、[スパースベクトル](./use-sparse-vector) を参照してください。
