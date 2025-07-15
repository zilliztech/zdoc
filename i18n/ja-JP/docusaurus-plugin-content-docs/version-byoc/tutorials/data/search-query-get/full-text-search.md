---
title: "フルテキスト検索 | BYOC"
slug: /full-text-search
sidebar_label: "フルテキスト検索"
beta: FALSE
notebook: FALSE
description: "フルテキスト検索は、テキストデータセット内の特定の用語やフレーズを含むドキュメントを取得し、関連性に基づいて結果をランク付けする機能です。この機能は、正確な用語を見落とす可能性がある意味検索の制限を克服し、最も正確で文脈に関連する結果を受け取ることを保証します。さらに、生のテキスト入力を受け入れることにより、ベクトル検索を簡素化し、手動でベクトル埋め込みを生成する必要なく、テキストデータを疎な埋め込みに自動的に変換します。 | BYOC"
type: origin
token: GnT3wO9gdiY8z4k254QchrR0nvg
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
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# フルテキスト検索

フルテキスト検索は、テキストデータセット内の特定の用語やフレーズを含むドキュメントを取得し、関連性に基づいて結果をランク付けする機能です。この機能は、正確な用語を見落とす可能性がある意味検索の制限を克服し、最も正確で文脈に関連する結果を受け取ることを保証します。さらに、生のテキスト入力を受け入れることにより、ベクトル検索を簡素化し、手動でベクトル埋め込みを生成する必要なく、テキストデータを疎な埋め込みに自動的に変換します。

BM 25アルゴリズムを使用して関連性スコアリングを行うと、この機能は、特定の検索用語に密接に一致するドキュメントを優先する検索拡張生成（RAG）シナリオで特に価値があります。

<Admonition type="info" icon="📘" title="ノート">

<p>フルテキスト検索とセマンティックベースの高密度ベクトル検索を統合することで、検索結果の精度と関連性を高めることができます。詳細については、「<a href="./hybrid-search">ハイブリッド検索</a>」を参照してください。</p>

</Admonition>

## 概要について{#overview}

全文検索は、手動での埋め込みの必要性を排除することで、テキストベースの検索過程を簡素化します。この機能は、以下のワークフローを通じて動作します

1. **テキスト入力**:手動の埋め込みを必要とせずに、生のテキストドキュメントを挿入したり、クエリテキストを提供したりできます。

1. **テキスト分析**:Zilliz Cloudは、[アナライザー](./analyzer)を使用して入力テキストを個々の検索可能な用語にトークン化します。

1. **関数処理**:組み込み関数は、トークン化された用語を受け取り、スパースベクトル表現に変換します。

1. **コレクションストア**:Zilliz Cloudは、効率的な検索のためにこれらの疎な埋め込みをコレクションに保存します。

1. **BM 25スコアリング**:検索中、Zilliz CloudはBM 25アルゴリズムを適用して保存されたドキュメントのスコアを計算し、クエリテキストとの関連性に基づいて一致した結果をランク付けします。

![LNSEwUCiXhQs8ubUcfdcQyqTnff](/img/LNSEwUCiXhQs8ubUcfdcQyqTnff.png)

全文検索を使用するには、以下の主な手順に従ってください:

1. [コレクションを作成](./full-text-search#create-a-collection-for-full-text-search)する:必要なフィールドを持つコレクションを設定し、生のテキストを疎な埋め込みに変換する関数を定義します。

1. [データ挿入](./full-text-search#insert-text-data):未加工のテキストドキュメントをコレクションに挿入します。

1. [検索を実行](./full-text-search#perform-full-text-search):クエリテキストを使用してコレクションを検索し、関連する結果を取得します。

## 全文検索用のコレクションを作成する{#create-a-collection-for-full-text-search}

全文検索を有効にするには、特定のスキーマを持つコレクションを作成します。このスキーマには、3つの必須フィールドが含まれている必要があります。

- コレクション内の各エンティティを一意に識別するプライマリフィールド。

- テキストドキュメントを保存する`VARCHAR`フィールドで、`enable_analysis`属性が`True`に設定されています。これにより、Zilliz Cloudは、関数処理のためにテキストを特定の用語にトークン化できます。

- スパース埋め込みを保存するために予約された`SPARSE_FLOAT_VECTOR`フィールドは、Zilliz Cloudが`VARCHAR`フィールドに対して自動的に生成します。

### コレクションスキーマを定義する{#define-the-collection-schema}

まず、スキーマを作成し、必要なフィールドを追加してください

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType, Function, FunctionType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

schema = MilvusClient.create_schema()

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

- `text`:全文検索操作のための生のテキストデータを保存します。データ型は`VARCHAR`でなければなりません。なぜなら、`VARCHAR`はZilliz Cloud'文字列データ型をテキストストレージに使用するからです。Set`enable_analysis=True`to allowZilliz Cloudテキストをトークン化します。デフォルトでは、Zilliz Cloudはテキスト解析に[標準アナライザ](./standard-analyzer)を使用します。別のアナライザを設定するには、「[アナライザの概要](./analyzer-overview)」を参照してください。

- `sparse`:全文検索操作のために内部で生成された疎な埋め込みを格納するために予約されたベクトルフィールドです。データ型は`SPARSE_FLOAT_VECTOR`でなければなりません。

今、テキストを疎なベクトル表現に変換する関数を定義し、スキーマに追加してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
bm25_function = Function(
    name="text_bm25_emb", # Function name
    input_field_names=["text"], # Name of the VARCHAR field containing raw text data
    output_field_names=["sparse"], # Name of the SPARSE_FLOAT_VECTOR field reserved to store generated embeddings
    function_type=FunctionType.BM25,
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
        .outputFieldNames(Collections.singletonList("vector"))
        .build());
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
      output_field_names: ['vector'],
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
     <td><p><code>お名前</code></p></td>
     <td><p>関数の名前です。この関数は、テキストフィールドの生の<code>テキスト</code>を検索可能なベクトルに変換し、<code>スパース</code>フィールドに保存します。</p></td>
   </tr>
   <tr>
     <td><p><code>入力フィールド名</code></p></td>
     <td><p>変換が必要な<code>VARCHAR</code>フィールドの名前。FunctionType. BM 25の<code>場合</code>、このパラメータは1つのフィールド名のみを受け入れます。</p></td>
   </tr>
   <tr>
     <td><p><code>出力フィールド名</code></p></td>
     <td><p>内部で生成された疎ベクトルが格納されるフィールドの名前。FunctionType. BM 25の<code>場合</code>、このパラメータは1つのフィールド名のみを受け入れます。</p></td>
   </tr>
   <tr>
     <td><p><code>関数タイプ</code></p></td>
     <td><p>使用する関数の型。値をFunctionType. BM 25に設定してくださ<code>い</code>。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="ノート">

<p>複数の<code>VARCHAR</code>フィールドを持つコレクションでtext-to-sparse-vector変換が必要な場合は、コレクションスキーマに個別の関数を追加し、各関数に一意の名前と<code>output_field_names</code>値を割り当てます。</p>

</Admonition>

### インデックスを設定する{#configure-the-index}

必要なフィールドと組み込み関数を使用してスキーマを定義した後、コレクションのインデックスを設定します。この過程を簡素化するために、`AUTOINDEX`を`index_type`として使用します。これは、Zilliz Cloudを使用して、データの構造に基づいて最適なインデックスタイプを選択して設定できるオプションです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = MilvusClient.prepare_index_params()

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

List<IndexParam> indexes = new ArrayList<>();
indexes.add(IndexParam.builder()
        .fieldName("sparse")
        .indexType(IndexParam.IndexType.SPARSE_INVERTED_INDEX)
        .metricType(IndexParam.MetricType.BM25)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const index_params = [
  {
    field_name: "sparse",
    metric_type: "BM25",
    index_type: "AUTOINDEX",
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
            "indexType": "AUTOINDEX"
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
     <td><p><code>フィールド名</code></p></td>
     <td><p>インデックスを作成するベクトルフィールドの名前です。全文検索を行う場合は、生成された疎ベクトルを格納するフィールドである必要があります。この例では、値を<code>疎</code>に設定します。</p></td>
   </tr>
   <tr>
     <td><p><code>インデックスの種類</code></p></td>
     <td><p>作成するインデックスの種類です。<code>AUTOINDEX</code>allowsZilliz Cloudインデックス設定を自動的に最適化します。インデックス設定をより細かく制御する必要がある場合は、スパースベクトル用に利用可能なさまざまなインデックスタイプから選択できます。Zilliz Cloud.を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>メトリックタイプ</code></p></td>
     <td><p>このパラメータの値は、全文検索機能のために<code>BM 25</code>に設定する必要があります。</p></td>
   </tr>
</table>

### コレクションを作成する{#create-the-collection}

今、定義されたスキーマとインデックスパラメータを使用してコレクションを作成してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name='demo', 
    schema=schema, 
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("demo")
        .collectionSchema(schema)
        .indexParams(indexes)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.create_collection(
    collection_name: 'demo', 
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
    \"collectionName\": \"demo\",
    \"schema\": $schema,
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## テキストデータを挿入{#insert-text-data}

コレクションとインデックスを設定したら、テキストデータを挿入する準備ができました。この過程では、生のテキストを提供するだけで済みます。前に定義した組み込み関数は、各テキストエントリに対応する疎ベクトルを自動的に生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.insert('demo', [
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
        .collectionName("demo")
        .data(rows)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.insert({
collection_name: 'demo', 
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
    "collectionName": "demo"
}'

```

</TabItem>
</Tabs>

## 全文検索を実行する{#perform-full-text-search}

コレクションにデータを挿入したら、生のテキストクエリを使用して全文検索を実行できます。Zilliz Cloudは、クエリをスパースベクトルに自動的に変換し、BM 25アルゴリズムを使用して一致した検索結果をランク付けし、上位K(`limit`)の結果を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
search_params = {
    'params': {'drop_ratio_search': 0.2},
}

client.search(
    collection_name='demo', 
    data=['whats the focus of information retrieval?'],
    anns_field='sparse',
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
searchParams.put("drop_ratio_search", 0.2);
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("demo")
        .data(Collections.singletonList(new EmbeddedText("whats the focus of information retrieval?")))
        .annsField("sparse")
        .topK(3)
        .searchParams(searchParams)
        .outputFields(Collections.singletonList("text"))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.search(
    collection_name: 'demo', 
    data: ['whats the focus of information retrieval?'],
    anns_field: 'sparse',
    limit: 3,
    params: {'drop_ratio_search': 0.2},
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
    "collectionName": "demo",
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
            "drop_ratio_search":0.2
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
     <td><p><code>検索パラメータ</code></p></td>
     <td><p>検索パラメーターを含むディクショナリ。</p></td>
   </tr>
   <tr>
     <td><p><code>ドロップ比率検索</code></p></td>
     <td><p>検索中に無視するBM 25スコアリングへの寄与が少ない用語の割合。詳細については、「<a href="./use-sparse-vector">疎ベクトル</a>」を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>データ</code></p></td>
     <td><p>生のクエリテキスト。</p></td>
   </tr>
   <tr>
     <td><p><code>アンズフィールド</code></p></td>
     <td><p>内部生成された疎ベクトルを含むフィールドの名前。</p></td>
   </tr>
   <tr>
     <td><p><code>限界</code></p></td>
     <td><p>返すトップマッチの最大数。</p></td>
   </tr>
</table>

