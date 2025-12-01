---
title: "全文検索 | BYOC"
slug: /full-text-search
sidebar_label: "全文検索"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "全文検索は、テキストデータセット内の特定の用語または語句を含むドキュメントを検索し、関連性に基づいて結果をランク付けする機能です。この機能は、正確な用語を見逃す可能性があるセマンティック検索の限界を克服し、最も正確で文脈的に関連性のある結果を受け取ることができます。さらに、生のテキスト入力を受け入れることでベクトル検索を簡素化し、手動でベクトル埋め込みを生成する必要なく、テキストデータをスパース埋め込みに自動的に変換します。 | BYOC"
type: origin
token: RQTRwhOVPiwnwokqr4scAtyfnBf
sidebar_position: 9
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - フィルター
  - フィルター式
  - フィルタリング
  - 全文検索
  - data in data out
  - 画像検索
  - 大規模言語モデル
  - 機械学習
  - RAG

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 全文検索

全文検索は、テキストデータセット内の特定の用語または語句を含むドキュメントを検索し、関連性に基づいて結果をランク付けする機能です。この機能は、正確な用語を見逃す可能性があるセマンティック検索の限界を克服し、最も正確で文脈的に関連性のある結果を受け取ることができます。さらに、生のテキスト入力を受け入れることでベクトル検索を簡素化し、手動でベクトル埋め込みを生成する必要なく、テキストデータをスパース埋め込みに自動的に変換します。

関連性スコアリングにBM25アルゴリズムを使用することで、この機能は特に検索強化生成(RAG)シナリオで価値があり、特定の検索語句に密接に一致するドキュメントを優先します。

<Admonition type="info" icon="📘" title="注釈">

<p>全文検索をセマンティックベースの密ベクトル検索と統合することで、検索結果の精度と関連性を向上させることができます。詳細については、<a href="./hybrid-search">ハイブリッド検索</a>を参照してください。</p>

</Admonition>

Zilliz Cloudは、全文検索をプログラム的にまたはWebコンソール経由で有効にすることをサポートしています。このページでは、プログラム的に全文検索を有効にする方法に焦点を当てています。Webコンソールでの操作の詳細については、[コレクションの管理(コンソール)](./manage-collections-console#full-text-search)を参照してください。

## 概要\{#overview}

全文検索は、手動埋め込みの必要性を排除することでテキストベースの検索プロセスを簡素化します。この機能は、以下のワークフローで動作します。

1. **テキスト入力**: 手動埋め込みの必要なく、生のテキストドキュメントを挿入するかクエリテキストを提供します。

1. **テキスト分析**: Zilliz Cloudは[アナライザー](./analyzer-overview)を使用して入力テキストを個々の検索可能な用語にトークン化します。

1. **関数処理**: 組み込み関数はトークン化された用語を受け取り、スパースベクトル表現に変換します。

1. **コレクションストア**: Zilliz Cloudはこれらのスパース埋め込みをコレクションに格納し、効率的な検索を行います。

1. **BM25スコアリング**: 検索中、Zilliz CloudはBM25アルゴリズムを適用して格納されたドキュメントのスコアを計算し、クエリテキストとの関連性に基づいて一致した結果をランク付けします。

![DfPMwP6ZahhHlLbIN0gcG9d7nQM](/img/DfPMwP6ZahhHlLbIN0gcG9d7nQM.png)

全文検索を使用するには、次の主な手順に従います。

1. [コレクションの作成](./full-text-search#create-a-collection-for-full-text-search): 必要なフィールドを持つコレクションを設定し、生のテキストをスパース埋め込みに変換する関数を定義します。

1. [データの挿入](./full-text-search#insert-text-data): 生のテキストドキュメントをコレクションに取り込みます。

1. [検索の実行](./full-text-search#perform-full-text-search): クエリテキストを使用してコレクションを検索し、関連する結果を取得します。

## 全文検索のためのコレクションを作成する\{#create-a-collection-for-full-text-search}

全文検索を有効にするには、特定のスキーマを持つコレクションを作成します。このスキーマには、3つの必須フィールドが含まれている必要があります。

- コレクション内の各エンティティを一意に識別するプライマリフィールド。

- 生のテキストドキュメントを格納する`VARCHAR`フィールド。`enable_analyzer`属性が`True`に設定されています。これにより、Zilliz Cloudが関数処理のための特定の用語にテキストをトークン化できます。

- Zilliz Cloudが`VARCHAR`フィールド用に自動生成するスパース埋め込みを格納するために予約された`SPARSE_FLOAT_VECTOR`フィールド。

### コレクションスキーマの定義\{#define-the-collection-schema}

まず、スキーマを作成し、必要なフィールドを追加します。

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

この設定では、

- `id`: プライマリキーとして機能し、`auto_id=True`で自動生成されます。

- `text`: 全文検索操作のための生のテキストデータを格納します。データ型は`VARCHAR`でなければなりません。`VARCHAR`はZilliz Cloudのテキストストレージ用の文字列データ型です。`enable_analyzer=True`を設定して、Zilliz Cloudがテキストをトークン化できるようにします。デフォルトでは、Zilliz Cloudはテキスト分析に[`standard`](./standard-analyzer)[ analyzer](./standard-analyzer)を使用します。別のアナライザーを設定するには、[アナライザー概要](./analyzer-overview)を参照してください。

- `sparse`: 全文検索操作のために内部生成されたスパース埋め込みを格納するために予約されたベクトルフィールドです。データ型は`SPARSE_FLOAT_VECTOR`でなければなりません。

次に、テキストをスパースベクトル表現に変換する関数を定義し、スキーマに追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
bm25_function = Function(
    name="text_bm25_emb", # 関数名
    input_field_names=["text"], # 生のテキストデータを含むVARCHARフィールドの名前
    output_field_names=["sparse"], # 生成された埋め込みを格納するためのSPARSE_FLOAT_VECTORフィールドの名前
    function_type=FunctionType.BM25, # `BM25`に設定
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
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>関数の名前。この関数は<code>text</code>フィールドから生のテキストを取得し、<code>sparse</code>フィールドに格納される検索可能なベクトルに変換します。</p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>テキストからスパースベクトルへの変換が必要な<code>VARCHAR</code>フィールドの名前。<code>FunctionType.BM25</code>では、このパラメータは1つのフィールド名のみを受け入れます。</p></td>
   </tr>
   <tr>
     <td><p><code>output_field_names</code></p></td>
     <td><p>内部で生成されたスパースベクトルが格納されるフィールド名。<code>FunctionType.BM25</code>では、このパラメータは1つのフィールド名のみを受け入れます。</p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>使用する関数のタイプ。<code>FunctionType.BM25</code>に値を設定します。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="注釈">

<p>複数の<code>VARCHAR</code>フィールドを持つコレクションで、テキストからスパースベクトルへの変換が必要な場合は、コレクションスキーマに個別の関数を追加し、各関数に一意の名前と<code>output_field_names</code>の値を確実に設定してください。</p>

</Admonition>

### インデックスの設定\{#configure-the-index}

必要なフィールドと組み込み関数を持つスキーマを定義した後、コレクションのインデックスを設定します。このプロセスを簡素化するため、`index_type`として`AUTOINDEX`を使用します。これはZilliz Cloudがデータの構造に基づいて最も適切なインデックスタイプを選択および設定できるオプションです。

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

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>field_name</code></p></td>
     <td><p>インデックス対象のベクトルフィールド名。全文検索では、生成されたスパースベクトルを格納するフィールドである必要があります。この例では、値を<code>sparse</code>に設定します。</p></td>
   </tr>
   <tr>
     <td><p><code>index_type</code></p></td>
     <td><p>作成するインデックスタイプ。<code>AUTOINDEX</code>は、Zilliz Cloudがインデックス設定を自動的に最適化できるようにします。インデックス設定をより細かく制御する必要がある場合は、Zilliz Cloudでスパースベクトルで利用可能なさまざまなインデックスタイプから選択できます。</p></td>
   </tr>
   <tr>
     <td><p><code>metric_type</code></p></td>
     <td><p>このパラメータの値は、全文検索機能に対して<code>BM25</code>に設定する必要があります。</p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>インデックスに固有の追加パラメータの辞書です。</p></td>
   </tr>
   <tr>
     <td><p><code>params.inverted_index_algo</code></p></td>
     <td><p>インデックスの構築とクエリに使用されるアルゴリズム。有効な値:</p><ul><li><p><code>"DAAT_MAXSCORE"</code> (デフォルト): MaxScoreアルゴリズムを使用する最適化されたDocument-at-a-Time (DAAT)クエリ処理。MaxScoreは、最小限の影響しか持たないと考えられる用語とドキュメントをスキップすることで、高い<em>k</em>値や多くの用語を持つクエリでパフォーマンスを向上させます。これは、最大影響スコアに基づいて用語を必須および非必須のグループに分割し、上位kの結果に貢献できる用語に焦点を当てることで実現されます。</p></li><li><p><code>"DAAT_WAND"</code>: WANDアルゴリズムを使用する最適化されたDAATクエリ処理。WANDは、最大影響スコアを活用して非競合ドキュメントをスキップすることにより、より少ないヒットドキュメントを評価しますが、ヒットごとのオーバーヘッドが高くなります。これにより、WANDは<em>k</em>値が小さいクエリや短いクエリで効率的になり、スキッピングがより実行可能です。</p></li><li><p><code>"TAAT_NAIVE"</code>: 基本的なTerm-at-a-Time (TAAT)クエリ処理。<code>DAAT_MAXSCORE</code>および<code>DAAT_WAND</code>と比較して遅くなりますが、<code>TAAT_NAIVE</code>は独自の利点を提供します。DAATアルゴリズムとは異なり、静的なグローバルコレクションパラメータ(avgdl)の変更に関係なく、キャッシュされた最大影響スコアを使用するのではなく、<code>TAAT_NAIVE</code>はそのような変更に動的に適応します。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.bm25_k1</code></p></td>
     <td><p>用語頻度の飽和を制御します。より高い値は、ドキュメントランク付けにおける用語頻度の重要性を高めます。値の範囲: [1.2, 2.0]。</p></td>
   </tr>
   <tr>
     <td><p><code>params.bm25_b</code></p></td>
     <td><p>ドキュメント長が正規化される程度を制御します。通常、0から1の値が使用され、一般的なデフォルトは約0.75です。値が1の場合、長さの正規化は行われません。値が0の場合は完全な正規化が行われます。</p></td>
   </tr>
</table>

### コレクションの作成\{#create-the-collection}

スキーマとインデックスパラメータを使用してコレクションを作成します。

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

## テキストデータの挿入\{#insert-text-data}

コレクションとインデックスの設定が完了すると、テキストデータの挿入の準備が整います。このプロセスでは、生のテキストのみを提供する必要があります。前述で定義した組み込み関数が、各テキストエントリに対応するスパースベクトルを自動的に生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.insert('my_collection', [
    {'text': '情報検索は研究分野の一つです。'},
    {'text': '情報検索は大規模データセットから関連情報を検索することに焦点を当てています。'},
    {'text': 'データマイニングと情報検索は研究で重複しています。'},
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
        gson.fromJson("{\"text\": \"情報検索は研究分野の一つです。\"}", JsonObject.class),
        gson.fromJson("{\"text\": \"情報検索は大規模データセットから関連情報を検索することに焦点を当てています。\"}", JsonObject.class),
        gson.fromJson("{\"text\": \"データマイニングと情報検索は研究で重複しています。\"}", JsonObject.class)
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
    {'text': '情報検索は研究分野の一つです。'},
    {'text': '情報検索は大規模データセットから関連情報を検索することに焦点を当てています。'},
    {'text': 'データマイニングと情報検索は研究で重複しています。'},
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
        {"text": "情報検索は研究分野の一つです。"},
        {"text": "情報検索は大規模データセットから関連情報を検索することに焦点を当てています。"},
        {"text": "データマイニングと情報検索は研究で重複しています。"}
    ],
    "collectionName": "my_collection"
}'

```

</TabItem>
</Tabs>

## 全文検索の実行\{#perform-full-text-search}

コレクションにデータを挿入すると、生のテキストクエリを使用して全文検索を実行できます。Zilliz Cloudはクエリをスパースベクトルに自動的に変換し、BM25アルゴリズムを使用して一致した検索結果をランク付けし、topK (`limit`) の結果を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
search_params = {
    'params': {'level': 10},
}

client.search(
    collection_name='my_collection',
    # highlight-start
    data=['情報検索の焦点は何ですか？'],
    anns_field='sparse',
    output_fields=['text'], # 検索結果で返すフィールド；スパースフィールドは出力できません
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
        .data(Collections.singletonList(new EmbeddedText("情報検索の焦点は何ですか？")))
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
    []entity.Vector{entity.Text("情報検索の焦点は何ですか？")},
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
    data: ['情報検索の焦点は何ですか？'],
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
        "情報検索の焦点は何ですか？"
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
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>search_params</code></p></td>
     <td><p>検索パラメータを含む辞書。</p></td>
   </tr>
   <tr>
     <td><p><code>params.level</code></p></td>
     <td><p>簡略化された検索最適化による検索精度を制御します。詳細については、<a href="./tune-recall-rate">リコール率の調整</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>data</code></p></td>
     <td><p>自然言語での生のクエリテキスト。Zilliz CloudはBM25関数を使用してテキストクエリを自動的にスパースベクトルに変換します - 事前に計算されたベクトルは提供しないでください。</p></td>
   </tr>
   <tr>
     <td><p><code>anns_field</code></p></td>
     <td><p>内部生成されたスパースベクトルを含むフィールドの名前。</p></td>
   </tr>
   <tr>
     <td><p><code>output_fields</code></p></td>
     <td><p>検索結果で返すフィールド名のリスト。BM25生成の埋め込みを含む<strong>スパースベクトルフィールドを除く</strong>すべてのフィールドをサポートします。一般的な出力フィールドには、プライマリキー フィールド（例： <code>id</code>）や元のテキストフィールド（例： <code>text</code>）があります。詳細については、<a href="./full-text-search#can-i-output-or-access-the-sparse-vectors-generated-by-the-bm25-function-in-full-text-search">FAQ</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>limit</code></p></td>
     <td><p>返す上位マッチの最大数。</p></td>
   </tr>
</table>

## FAQ\{#faq}

### 全文検索でBM25関数が生成したスパースベクトルを出力またはアクセスできますか？\{#can-i-output-or-access-the-sparse-vectors-generated-by-the-bm25-function-in-full-text-search}

いいえ、BM25関数によって生成されたスパースベクトルは、全文検索では直接アクセスまたは出力することはできません。詳細は以下の通りです。

- BM25関数は、内部的にランキングと検索のためのスパースベクトルを生成します。

- これらのベクトルはスパースフィールドに格納されますが、`output_fields`に含めることはできません。

- 元のテキストフィールドとメタデータ（例： `id`、`text`）のみ出力できます。

例：

```python
# ❌ これはエラーになります - スパースフィールドは出力できません
client.search(
    collection_name='my_collection',
    data=['クエリテキスト'],
    anns_field='sparse',
    # highlight-next-line
    output_fields=['text', 'sparse']  # 'sparse' はエラーを引き起こします
    limit=3,
    search_params=search_params
)

# ✅ これは動作します - テキストフィールドのみ出力
client.search(
    collection_name='my_collection',
    data=['クエリテキスト'],
    anns_field='sparse',
    # highlight-next-line
    output_fields=['text']
    limit=3,
    search_params=search_params
)
```

### アクセスできないフィールドなのに、なぜスパースベクトルフィールドを定義する必要があるのですか？\{#why-do-i-need-to-define-a-sparse-vector-field-if-i-cant-access-it}

スパースベクトルフィールドは内部検索インデックスとして機能し、ユーザーが直接操作しないデータベースインデックスと同様です。

**設計理念**：

- 關注点の分離: テキストの操作と出力はユーザーが行い、Milvusはベクトルの内部処理を担当する

- パフォーマンス: 事前に計算されたスパースベクトルにより、クエリ中の高速BM25ランキングが可能になる

- ユーザーエクスペリエンス: 複雑なベクトル操作を単純なテキストインターフェースで抽象化する

**ベクトルアクセスが必要な場合**：

- 全文検索ではなく、手動スパースベクトル操作を使用する

- カスタムスパースベクトルワークフロー用に別のコレクションを作成する

詳細については、[スパースベクトル](./use-sparse-vector)を参照してください。