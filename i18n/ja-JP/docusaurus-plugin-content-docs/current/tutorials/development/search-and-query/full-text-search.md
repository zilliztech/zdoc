---
title: "全文検索 | Cloud"
slug: /full-text-search
sidebar_label: "全文検索"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "全文検索は、テキストデータセット内の特定の用語やフレーズを含むドキュメントを取得し、その後、関連性に基づいて結果をランク付けする機能です。この機能は、正確な用語を見落とす可能性があるセマンティック検索の制限を克服し、最も正確でコンテキストに関連する結果を確実に受け取れるようにします。さらに、生のテキスト入力を受け取り、手動で vector embedding を生成することなく、テキストデータを自動的に sparse embedding に変換することで、vector 検索を簡素化します。 | Cloud"
type: origin
token: RQTRwhOVPiwnwokqr4scAtyfnBf
sidebar_position: 11
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 全文検索

全文検索は、テキストデータセット内の特定の用語やフレーズを含むドキュメントを取得し、その後、関連性に基づいて結果をランク付けする機能です。この機能は、正確な用語を見落とす可能性があるセマンティック検索の制限を克服し、最も正確でコンテキストに関連する結果を確実に受け取れるようにします。さらに、生のテキスト入力を受け取り、手動で vector embedding を生成することなく、テキストデータを自動的に sparse embedding に変換することで、vector 検索を簡素化します。

関連性スコアリングに BM25 アルゴリズムを使用するこの機能は、retrieval-augmented generation（RAG）のシナリオで特に有用であり、特定の検索語に密接に一致するドキュメントを優先します。

<Admonition type="info" icon="📘" title="注意">

全文検索をセマンティックベースの dense vector 検索と統合することで、検索結果の精度と関連性を向上させることができます。詳細については、[Hybrid Search](./hybrid-search) を参照してください。

</Admonition>

Zilliz Cloud は、プログラムから、または Web コンソール経由で全文検索を有効にすることをサポートしています。このページでは、プログラムから全文検索を有効にする方法に焦点を当てています。Web コンソールでの操作の詳細については、[Manage Collections (Console)](./manage-collections-console#full-text-search) を参照してください。

## BM25 の実装\{#bm25-implementation}

Zilliz Cloud は、情報検索システムで広く採用されているスコアリング関数である BM25 関連性アルゴリズムを利用した全文検索を提供しており、Zilliz Cloud はこれを検索ワークフローに統合して、正確で関連性順にランク付けされたテキスト結果を提供します。

Zilliz Cloud の全文検索は、以下のワークフローに従います。

1. **生テキスト入力**: テキストドキュメントを挿入するか、プレーンテキストでクエリを提供します。embedding モデルは不要です。

1. **テキスト解析**: Zilliz Cloud は [analyzer](./analyzer-overview) を使用して、インデックス化および検索可能な意味のある用語にテキストを処理します。

1. **BM25 function 処理**: 組み込み function が、これらの用語を BM25 スコアリング用に最適化された sparse vector 表現に変換します。

1. **Collection ストア**: Zilliz Cloud は、結果として得られた sparse embedding を collection に保存し、高速な取得とランキングを可能にします。

1. **BM25 関連性スコアリング**: 検索時に、Zilliz Cloud は BM25 スコアリング関数を適用してドキュメントの関連性を計算し、クエリ語に最もよく一致するランク付けされた結果を返します。

![DfPMwP6ZahhHlLbIN0gcG9d7nQM](https://zdoc-images.s3.us-west-2.amazonaws.com/DfPMwP6ZahhHlLbIN0gcG9d7nQM.png)

全文検索を使用するには、以下の主な手順に従ってください。

1. [collection を作成](./full-text-search#create-a-collection-for-bm25-full-text-search): 必要な field を設定し、生テキストを sparse embedding に変換する BM25 function を定義します。

1. [データを挿入](./full-text-search#insert-text-data): 生のテキストドキュメントを collection に取り込みます。

1. [検索を実行](./full-text-search#perform-full-text-search): 自然言語のクエリテキストを使用して、BM25 の関連性に基づくランク付け結果を取得します。

## BM25 全文検索用の collection を作成する\{#create-a-collection-for-bm25-full-text-search}

BM25 を利用した全文検索を有効にするには、必要な field を備えた collection を準備し、sparse vector を生成する BM25 function を定義し、index を設定してから、collection を作成する必要があります。

### schema field を定義する\{#define-schema-fields}

collection schema には、少なくとも以下の 3 つの必須 field を含める必要があります。

- **Primary field**: collection 内の各 entity を一意に識別します。

- **文字列 field** (`VARCHAR` または `TEXT`): 生のテキストドキュメントを保存します。Zilliz Cloud が BM25 の関連性ランキングのためにテキストを処理できるよう、`enable_analyzer=True` を設定する必要があります。デフォルトでは、Zilliz Cloud はテキスト解析に [`standard`](./standard-analyzer)[ analyzer](./standard-analyzer) を使用します。別の analyzer を設定するには、[Analyzer Overview](./analyzer-overview) を参照してください。このページの例では `VARCHAR` を使用しています。長いテキストの場合は、入力 field を `TEXT` として定義し、`max_length` を省略できます。完全な例については、[Text Field](./use-text-field) を参照してください。

- **Sparse vector field** (`SPARSE_FLOAT_VECTOR`): BM25 function によって自動生成される sparse embedding を保存します。

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

上記の設定では、以下のようになります。

- `id`: primary key として機能し、`auto_id=True` によって自動生成されます。

- `text`: 全文検索操作用の生テキストデータを保存します。データ型は `VARCHAR` でなければなりません。`VARCHAR` は、テキスト保存用の Zilliz Cloud の文字列データ型であるためです。

- `sparse`: 全文検索操作用に内部生成される sparse embedding を保存するために予約された vector field です。データ型は `SPARSE_FLOAT_VECTOR` でなければなりません。

### BM25 function を定義する\{#define-the-bm25-function}

BM25 function は、トークン化されたテキストを BM25 スコアリングをサポートする sparse vector に変換します。

function を定義し、schema に追加します。

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

| Parameter | 説明 |
| --- | --- |
| `name` | function の名前です。この function は、`text` field の生テキストを `sparse` field に保存される BM25 対応の sparse vector に変換します。 |
| `input_field_names` | テキストから sparse vector への変換が必要な `VARCHAR` field の名前です。`FunctionType.BM25` の場合、このパラメータは 1 つの field 名のみを受け入れます。 |
| `output_field_names` | 内部生成された sparse vector が保存される field の名前です。`FunctionType.BM25` の場合、このパラメータは 1 つの field 名のみを受け入れます。 |
| `function_type` | 使用する function のタイプです。`FunctionType.BM25` である必要があります。 |

<Admonition type="info" icon="📘" title="注意">

複数の `VARCHAR` field で BM25 処理が必要な場合は、**field ごとに 1 つの BM25 function** を定義し、それぞれに一意の名前と出力 field を設定してください。

</Admonition>

### index を設定する\{#configure-the-index}

必要な field と組み込み function を含む schema を定義した後、collection の index を設定します。このプロセスを簡素化するには、`index_type` として `AUTOINDEX` を使用します。これは、データ構造に基づいて Zilliz Cloud が最適な index タイプを選択し、設定できるオプションです。

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
     <th><p>Parameter</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>field_name</code></p></td>
     <td><p>index を作成する vector field の名前です。全文検索では、生成された sparse vector を保存する field にする必要があります。この例では、値を <code>sparse</code> に設定します。</p></td>
   </tr>
   <tr>
     <td><p><code>index_type</code></p></td>
     <td><p>作成する index のタイプです。<code>AUTOINDEX</code> を使用すると、Zilliz Cloud が index 設定を自動的に最適化できます。index 設定をより細かく制御する必要がある場合は、Zilliz Cloud で sparse vector に利用可能なさまざまな index タイプから選択できます。.</p></td>
   </tr>
   <tr>
     <td><p><code>metric_type</code></p></td>
     <td><p>全文検索機能では、このパラメータの値を必ず <code>BM25</code> に設定する必要があります。</p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>index 固有の追加パラメータを含む辞書です。</p></td>
   </tr>
   <tr>
     <td><p><code>params.inverted_index_algo</code></p></td>
     <td><p>index の構築およびクエリに使用されるアルゴリズムです。有効な値:</p><ul><li><p><code>"DAAT_MAXSCORE"</code>（デフォルト）: MaxScore アルゴリズムを使用した最適化済み Document-at-a-Time（DAAT）クエリ処理です。MaxScore は、影響の小さい用語やドキュメントをスキップすることで、<em>k</em> 値が大きい場合や多数の用語を含むクエリでより良いパフォーマンスを提供します。最大影響スコアに基づいて用語を必須グループと非必須グループに分割し、top-k の結果に寄与する可能性がある用語に集中することで、これを実現します。</p></li><li><p><code>"DAAT_WAND"</code>: WAND アルゴリズムを使用した最適化済み DAAT クエリ処理です。WAND は最大影響スコアを利用して競争力のないドキュメントをスキップすることで、ヒットしたドキュメントの評価数を減らしますが、ヒットごとのオーバーヘッドは高くなります。このため、スキップがより実行しやすい、小さな <em>k</em> 値のクエリや短いクエリでは WAND のほうが効率的です。</p></li><li><p><code>"TAAT_NAIVE"</code>: 基本的な Term-at-a-Time（TAAT）クエリ処理です。<code>DAAT_MAXSCORE</code> や <code>DAAT_WAND</code> と比べると低速ですが、<code>TAAT_NAIVE</code> には独自の利点があります。グローバルな collection パラメータ（avgdl）の変更に関係なく静的なままであるキャッシュ済み最大影響スコアを使用する DAAT アルゴリズムとは異なり、<code>TAAT_NAIVE</code> はそのような変更に動的に適応します。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.bm25_k1</code></p></td>
     <td><p>用語頻度の飽和を制御します。値が高いほど、ドキュメントランキングにおける用語頻度の重要性が増します。値の範囲: [1.2, 2.0]。</p></td>
   </tr>
   <tr>
     <td><p><code>params.bm25_b</code></p></td>
     <td><p>ドキュメント長をどの程度正規化するかを制御します。通常は 0 から 1 の値が使用され、デフォルト値は 0.75 です。値 0 は長さの正規化を行わないことを意味し、値 1 は完全な長さ正規化を意味します。</p></td>
   </tr>
</table>

### collection を作成する\{#create-the-collection}

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

## テキストデータを挿入する\{#insert-text-data}

collection と index のセットアップが完了したら、テキストデータを挿入できます。このプロセスでは、生のテキストのみを指定すれば十分です。先ほど定義した組み込み関数が、各テキストエントリに対応する sparse vector を自動的に生成します。

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

## 全文検索を実行する\{#perform-full-text-search}

collection にデータを挿入したら、生のテキストクエリを使って全文検索を実行できます。Zilliz Cloud はクエリを自動的に sparse vector に変換し、BM25 アルゴリズムを使用して一致した検索結果をランク付けし、その後 topK（`limit`）件の結果を返します。

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

| Parameter | 説明 |
| --- | --- |
| `search_params` | 検索パラメータを含む辞書です。 |
| `params.level` | 簡略化された検索最適化によって検索精度を制御します。詳細は [Tune Recall Rate](./tune-recall-rate) を参照してください。 |
| `data` | 自然言語による生のクエリテキストです。Zilliz Cloud は BM25 関数を使用してテキストクエリを自動的に sparse vector に変換するため、事前計算済みの vector を指定しないでください。 |
| `anns_field` | 内部生成された sparse vector を含む field の名前です。 |
| `output_fields` | 検索結果で返す field 名のリストです。BM25 によって生成された埋め込みを含む **sparse vector field を除く** すべての field をサポートします。一般的な出力 field には、主キー field（例: `id`）や元のテキスト field（例: `text`）があります。詳細は [FAQ](./full-text-search#can-i-output-or-access-the-sparse-vectors-generated-by-the-bm25-function-in-full-text-search) を参照してください。 |
| `limit` | 返される上位一致結果の最大数です。 |

## FAQ\{#faq}

### 全文検索で BM25 関数によって生成された sparse vector を出力またはアクセスできますか？\{#can-i-output-or-access-the-sparse-vectors-generated-by-the-bm25-function-in-full-text-search}

いいえ、BM25 関数によって生成された sparse vector は、全文検索では直接アクセスしたり出力したりできません。詳細は次のとおりです。

- BM25 関数は、ランキングと検索のために内部で sparse vector を生成します

- これらの vector は sparse field に保存されますが、`output_fields` に含めることはできません

- 出力できるのは元のテキスト field とメタデータ（`id`、`text` など）のみです

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

### アクセスできないのに、なぜ sparse vector field を定義する必要があるのですか？\{#why-do-i-need-to-define-a-sparse-vector-field-if-i-cant-access-it}

sparse vector field は、ユーザーが直接操作しないデータベース index と同様に、内部検索 index として機能します。

**設計上の理由**:

- 関心の分離: あなたはテキスト（入力/出力）を扱い、Milvus は vector（内部処理）を扱います

- パフォーマンス: 事前計算された sparse vector により、クエリ時の高速な BM25 ランキングが可能になります

- ユーザーエクスペリエンス: シンプルなテキストインターフェースの背後に複雑な vector 操作を抽象化します

**vector へのアクセスが必要な場合**:

- 全文検索の代わりに手動の sparse vector 操作を使用してください

- カスタム sparse vector ワークフロー用に別の collection を作成してください

詳細は [Sparse Vector](./use-sparse-vector) を参照してください。
