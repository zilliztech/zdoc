---
title: "フルテキスト検索 | BYOC"
slug: /full-text-search
sidebar_label: "フルテキスト検索"
beta: FALSE
notebook: FALSE
description: "フルテキスト検索は、テキストデータセット内の特定の用語やフレーズを含むドキュメントを取得し、関連性に基づいて結果をランク付けする機能です。この機能は、正確な用語を見落とす可能性がある意味検索の制限を克服し、最も正確で文脈に関連する結果を受け取ることを保証します。さらに、生のテキスト入力を受け入れることにより、ベクトル検索を簡素化し、手動でベクトル埋め込みを生成する必要なく、テキストデータを疎な埋め込みに自動的に変換します。 | BYOC"
type: origin
token: RQTRwhOVPiwnwokqr4scAtyfnBf
sidebar_position: 9
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - filter
  - filtering expressions
  - filtering
  - full-text search
  - data in data out
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# フルテキスト検索

フルテキスト検索は、テキストデータセット内の特定の用語やフレーズを含むドキュメントを取得し、関連性に基づいて結果をランク付けする機能です。この機能は、正確な用語を見落とす可能性がある意味検索の制限を克服し、最も正確で文脈に関連する結果を受け取ることを保証します。さらに、生のテキスト入力を受け入れることにより、ベクトル検索を簡素化し、手動でベクトル埋め込みを生成する必要なく、テキストデータを疎な埋め込みに自動的に変換します。

BM 25アルゴリズムを使用して関連性スコアリングを行うと、この機能は、特定の検索用語に密接に一致するドキュメントを優先する検索拡張生成（RAG）シナリオで特に価値があります。

<Admonition type="info" icon="📘" title="ノート">

<p>フルテキスト検索とセマンティックベースの高密度ベクトル検索を統合することで、検索結果の精度と関連性を高めることができます。詳細については、<a href="./hybrid-search">ハイブリッド検索</a>を参照してください。</p>

</Admonition>

Zilliz Cloudは、プログラムまたはWebコンソールを介して全文検索を有効にすることをサポートしています。このページでは、プログラムで全文検索を有効にする方法について説明します。Webコンソールでの操作の詳細については、[コレクションの管理(コンソール)](./manage-collections-console#full-text-search)を参照してください。

</include>

## 概要について{#overview}

全文検索は、手動での埋め込みの必要性を排除することで、テキストベースの検索過程を簡素化します。この機能は、以下のワークフローを通じて動作します

1. **テキスト入力**:手動の埋め込みが必要なく、生のテキストドキュメントを挿入したり、クエリテキストを提供したりできます。

1. **テキスト分析**:Zillizクラウド[アナライザ](./analyzer-overview)を使用して、入力テキストを個々の検索可能な用語にトークン化します。

1. **関数処理**:組み込み関数はトークン化された用語を受け取り、それらを疎ベクトル表現に変換します。

1. **コレクションストア**:Zillizクラウド効率的な検索のために、これらの疎な埋め込みをコレクションに格納します。

1. **BM 25スコアリング**:検索中に、ZillizクラウドBM 25アルゴリズムを適用して、保存されたドキュメントのスコアを計算し、クエリテキストとの関連性に基づいて一致した結果をランク付けします。

![DfPMwP6ZahhHlLbIN0gcG9d7nQM](/img/DfPMwP6ZahhHlLbIN0gcG9d7nQM.png)

全文検索を使用するには、以下の主な手順に従ってください:

1. [コレクションを作成する](./full-text-search#create-a-collection-for-full-text-search):必要なフィールドを持つコレクションを設定し、生のテキストを疎な埋め込みに変換する関数を定義します。

1. [データの挿入](./full-text-search#insert-text-data):生のテキストドキュメントをコレクションに取り込みます。

1. [検索を実行](./full-text-search#perform-full-text-search):クエリテキストを使用してコレクションを検索し、関連する結果を取得します。

## 全文検索用のコレクションを作成する{#create-a-collection-for-full-text-search}

全文検索を有効にするには、特定のスキーマを持つコレクションを作成します。このスキーマには、3つの必須フィールドが含まれている必要があります。

- コレクション内の各エンティティを一意に識別するプライマリフィールド。

- `enable_analyzer`属性が`True`に設定された生のテキストドキュメントを格納する`VARCHAR`フィールド。これにより、Zillizクラウド関数処理のためにテキストを特定の用語にトークン化する。

- スパースな埋め込みを保存するために予約された`SPARSE_FLOAT_VECTOR`フィールドZillizクラウド`VARCHAR`フィールドに対して自動的に生成されます。

### コレクションスキーマを定義する{#define-the-collection-schema}

まず、スキーマを作成し、必要なフィールドを追加してください

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType, Function, FunctionType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

schema = client.create_schema()

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, auto_id=True)
schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=1000, enable_analyzer=True)
schema.add_field(field_name="sparse", datatype=DataType.SPARSE_FLOAT_VECTOR)
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
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
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
</Tabs>

この構成では、

- `id`:主キーとして機能し、`auto_id=True`で自動的に生成されます。

- `text`:全文検索操作のための生のテキストデータを保存します。データ型は`VARCHAR`でなければなりません。`VARCHAR`と同様です。Zillizクラウドテキストストレージのための文字列データ型。`enable_analyzer=True`を設定してくださいZillizクラウドテキストをトークン化します。デフォルトでは、Zillizクラウド`standard` [ アナライザ](./standard-analyzer)をテキスト解析に使用します。別のアナライザを設定するには、[アナライザの概要](./analyzer-overview)を参照してください。

- `sparse`:全文検索操作のために内部で生成された疎な埋め込みを保存するために予約されたベクトルフィールドです。データ型は`SPARSE_FLOAT_VECTOR`でなければなりません。

今、テキストを疎なベクトル表現に変換する関数を定義し、スキーマに追加してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
bm25_function = Function(
    name="text_bm25_emb", # Function name
    input_field_names=["text"], # Name of the VARCHAR field containing raw text data
    output_field_names=["sparse"], # Name of the SPARSE_FLOAT_VECTOR field reserved to store generated embeddings
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
</Tabs>

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>関数の名前です。この関数は、<code>text</code>フィールドの生のテキストを検索可能なベクトルに変換し、<code>sparse</code>フィールドに格納します。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p><code>VARCHAR</code>フィールドの名前をtext-to-sparse-vector変換する必要があります。<code>FunctionType.BM25</code>の場合、このパラメータは1つのフィールド名のみを受け入れます。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>内部で生成された疎ベクトルが格納されるフィールドの名前です。<code>FunctionType.BM25</code>の場合、このパラメータは1つのフィールド名のみを受け入れます。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>使用する関数の種類を指定します。値は<code>FunctionType.BM25</code>に設定してください。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="ノート">

<p>複数の<code>VARCHAR</code>フィールドを持つコレクションでtext-to-sparse-vector変換が必要な場合は、コレクションスキーマに個別の関数を追加し、各関数に一意の名前と<code>output_field_names</code>値を割り当てます。</p>

</Admonition>

### インデックスを設定する{#configure-the-index}

必要なフィールドと組み込み関数を使用してスキーマを定義した後、コレクションのインデックスを設定します。この過程を簡単にするために、`AUTOINDEX`を`index_type`として使用します。Zillizクラウドデータの構造に基づいて最適なインデックスタイプを選択して設定する。

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
fvParams.put("inverted_index_algo", "DAAT_MAXSCORE");
fvParams.put("bm25_k1", 1.2);
fvParams.put("bm25_b", 0.75);

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

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>インデックスを作成するベクトルフィールドの名前です。全文検索を行う場合は、生成されたスパースベクトルを格納するフィールドとします。この例では、<code>sparse</code>に設定します。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>作成するインデックスの種類。<code>AUTOINDEX</code>は許可しますZillizクラウドインデックス設定を自動的に最適化します。インデックス設定をより細かく制御する必要がある場合は、スパースベクトルに使用できるさまざまなインデックスタイプから選択できます。Zillizクラウドこれが私の人生です。これが私の人生です。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>このパラメーターの値は、全文検索機能のために<code>BM25</code>に設定する必要があります。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>インデックスに固有の追加パラメーターのディクショナリ。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>インデックスの構築とクエリに使用されるアルゴリズム。有効な値:</p><ul><li><p><code>"DAAT_MAXSCORE"</code>(デフォルト): MaxScoreアルゴリズムを使用した最適化されたDocument-at-a-Time(DAAT)クエリ処理。MaxScoreは、最小限の影響を与える可能性がある用語やドキュメントをスキップすることにより、高い<em>k</em>値または多数の用語を持つクエリに対してより良いパフォーマンスを提供します。これは、最大の影響スコアに基づいて用語を必須および非必須グループに分割し、トップkの結果に貢献できる用語に焦点を当てることによって実現されます。</p></li><li><p><code>"DAAT_WAND"</code>: WANDアルゴリズムを使用した最適化されたDAATクエリ処理。WANDは、競合しないドキュメントをスキップするために最大の影響スコアを活用して、より少ないヒットドキュメントを評価しますが、ヒットあたりのオーバーヘッドが高くなります。これにより、小さな<em>k</em>値を持つクエリやスキップがより実現可能な短いクエリに対して、WANDはより効率的になります。</p></li><li><p><code>"TAAT_NAIVE"</code>:基本的なTerm-at-a-Time(TAAT)クエリ処理。<code>DAAT_MAXSCORE</code>および<code>DAAT_WAND</code>と比較して遅いですが、<code>TAAT_NAIVE</code>は独自の利点を提供します。グローバルコレクションパラメータ(avgdl)の変更に関係なく静的なキャッシュされた最大影響スコアを使用するDAATアルゴリズムとは異なり、<code>TAAT_NAIVE</code>はそのような変更に動的に適応します。</p></li></ul></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>用語頻度飽和を制御します。値が高いほど、文書ランキングにおける用語頻度の重要性が高まります。値の範囲:[1.2、2.0]。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>ドキュメントの長さを正規化する範囲を制御します。通常、0から1の値が使用され、一般的なデフォルト値は0.75です。1の値は長さの正規化がないことを意味し、0の値は完全な正規化を意味します。</p></td>
   </tr>
</table>

### コレクションを作成する{#create-the-collection}

今、定義されたスキーマとインデックスパラメータを使用してコレクションを作成してください。

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
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## テキストデータを挿入{#insert-text-data}

コレクションとインデックスを設定したら、テキストデータを挿入する準備ができました。この過程では、生のテキストを提供するだけで済みます。前に定義した組み込み関数は、各テキストエントリに対応する疎ベクトルを自動的に生成します。

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

## 全文検索を実行する{#perform-full-text-search}

コレクションにデータを挿入したら、生のテキストクエリを使用して全文検索を実行できます。Zillizクラウドクエリをスパースベクトルに自動的に変換し、BM 25アルゴリズムを使用して一致した検索結果をランク付けし、TOPK（`limit`）の結果を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
search_params = {
    'params': {'level': 10},
}

client.search(
    collection_name='my_collection', 
    # highlight-start
    data=['whats the focus of information retrieval?'],
    anns_field='sparse',
    output_fields=['text'], # Fields to return in search results; sparse field cannot be output
    # highlight-end
    limit=3,
    search_params=search_params
)
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
annSearchParams.WithExtraParam("drop_ratio_search", 0.2)
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
        "params":{
            "level":10
        }
    }
}'
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>検索パラメーターを含むディクショナリ。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p><p></include></p></td>
     <td><p>検索時に無視する重要度の低い用語の割合。詳細については、<a href="./use-sparse-vector">疎ベクトル</a>を参照してください。</p><p></include></p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p><p></include></p></td>
     <td><p>シンプルな検索最適化で検索精度を制御します。詳細は<a href="./single-vector-search">使用レベル</a>を参照してください。</p><p></include></p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>自然言語の生のクエリテキスト。Milvusは、BM 25関数を使用してテキストクエリをスパースベクトルに自動的に変換します。事前に計算されたベクトルは提供しないでください。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>内部生成された疎ベクトルを含むフィールドの名前。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>検索結果で返されるフィールド名のリスト。BM 25で生成された埋め込みを含む疎ベクトルフィールドを除くすべてのフィールドをサポートします。一般的な出力フィールドには、主キーフィールド(例: <code>id</code>)と元のテキストフィールド(例:<code>text</code>)が含まれます。詳細については、<a href="./full-text-search#can-i-output-or-access-the-sparse-vectors-generated-by-the-bm25-function-in-full-text-search">よくある質問(FAQ)</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>返すトップマッチの最大数。</p></td>
   </tr>
</table>

## よくある質問(FAQ){#faq}

### 全文検索でBM 25関数によって生成された疎ベクトルを出力またはアクセスできますか?{#can-i-output-or-access-the-sparse-vectors-generated-by-the-bm25-function-in-full-text-search}

いいえ、BM 25関数によって生成された疎ベクトルは、全文検索で直接アクセスまたは出力できません。詳細は以下の通りです:

- BM 25関数は、ランキングと検索のために内部で疎ベクトルを生成します

- これらのベクトルはスパースフィールドに保存されますが、`output_fields`に含めることはできません

- 元のテキストフィールドとメタデータ（`id`、`text`など）のみを出力できます。

例えば:

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

### アクセスできない場合、疎ベクトル場を定義する必要があるのはなぜですか?{#why-do-i-need-to-define-a-sparse-vector-field-if-i-cant-access-it}

疎ベクトルフィールドは、ユーザーが直接操作しないデータベースインデックスに似た内部検索インデックスとして機能します。

**デザイン理論**:

- 関心事の分離:テキスト(入力/出力)で作業し、Milvusはベクトル(内部処理)を処理します

- パフォーマンス:事前計算された疎ベクトルにより、クエリ中に高速なBM 25ランキングが可能になります

- ユーザーエクスペリエンス:シンプルなテキストインターフェイスの背後に複雑なベクトル操作を抽象化します

**ベクトルアクセスが必要な場合**:

- 全文検索の代わりに手動の疎ベクトル演算を使用してください

- カスタムスパースベクトルワークフロー用に別々のコレクションを作成する

詳細については、[疎ベクトル](./use-sparse-vector)を参照してください。