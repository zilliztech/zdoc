---
title: "構造体の配列 | BYOC"
slug: /use-array-of-structs
sidebar_label: "構造体の配列"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "エンティティ内の構造体の配列（Array of Structs）フィールドは、構造体要素の順序付きセットを格納します。配列内の各構造体は、複数のベクトルとスカラーフィールドを含む同じ事前定義されたスキーマを共有します。 | BYOC"
type: origin
token: LIMbwXk1OiS5SykUyNhc5FtSnPb
sidebar_position: 10
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - スキーマ
  - 配列フィールド
  - 構造体の配列
  - 構造体
  - サーバーレスベクトルデータベース
  - milvus オープンソース
  - milvus の動作方法
  - Zilliz ベクトルデータベース

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 構造体の配列

エンティティ内の構造体の配列（Array of Structs）フィールドは、構造体要素の順序付きセットを格納します。配列内の各構造体は、複数のベクトルとスカラーフィールドを含む同じ事前定義されたスキーマを共有します。

以下は、構造体の配列フィールドを含むコレクションから取得されたエンティティの例です。

```json
{
    'id': 0,
    'title': 'ワルデン',
    'title_vector': [0.1, 0.2, 0.3, 0.4, 0.5],
    'author': 'ヘンリー・デイビッド・ソロー',
    'year_of_publication': 1845,
    // highlight-start
    'chunks': [
        {
            'text': '私は以下のページを書いたとき、むしろそれらの大部分を...',
            'text_vector': [0.3, 0.2, 0.3, 0.2, 0.5],
            'chapter': '経済',
        },
        {
            'text': '私は中国や...に関するほど多く言いたいわけではないが...',
            'text_vector': [0.7, 0.4, 0.2, 0.7, 0.8],
            'chapter': '経済'
        }
    ]
    // hightlight-end
}
```

上記の例では、`chunks` フィールドは構造体の配列フィールドであり、各構造体要素は `text`、`text_vector`、`chapter` という独自のフィールドを含んでいます。

## 制限事項\{#limits}

- **データ型**

    コレクションを作成する際、配列フィールドの要素のデータ型として構造体型（Struct）を使用できます。ただし、既存のコレクションに構造体の配列を追加することはできず、Zilliz Cloudでは構造体型をコレクションフィールドのデータ型として使用することはサポートされていません。

    配列フィールドの構造体は同じスキーマを共有し、これは配列フィールドを作成する際に定義する必要があります。

    構造体スキーマには、以下のようなベクトルとスカラーの両方のフィールドが含まれます。

    <table>
       <tr>
         <th><p>フィールドタイプ</p></th>
         <th><p>データ型</p></th>
       </tr>
       <tr>
         <td><p>ベクトル</p></td>
         <td><p><code>FLOAT_VECTOR</code></p></td>
       </tr>
       <tr>
         <td rowspan="5"><p>スカラー</p></td>
         <td><p><code>VARCHAR</code></p></td>
       </tr>
       <tr>
         <td><p><code>INT8/16/32/64</code></p></td>
       </tr>
       <tr>
         <td><p><code>FLOAT</code></p></td>
       </tr>
       <tr>
         <td><p><code>DOUBLE</code></p></td>
       </tr>
       <tr>
         <td><p><code>BOOLEAN</code></p></td>
       </tr>
    </table>

    コレクションレベルと構造体内のベクトルフィールドの合計数をクラスターの上限を超えないようにしてください。詳細は[Zilliz Cloudの制限事項](./limits#fields)を参照してください。

- **Null許容性とデフォルト値**

    構造体の配列フィールドはNullを許容せず、デフォルト値も受け入れません。

- **関数**

    スカラー型フィールドから構造体内のベクトルフィールドを導出する関数を使用することはできません。

- **インデックスタイプとメトリックタイプ**

    すべてのベクトルフィールドをインデックス化する必要があります。構造体の配列フィールド内のベクトルフィールドをインデックス化するには、Zilliz Cloudは埋め込みリストを使用して各構造体要素内のベクトル埋め込みを整理し、埋め込みリスト全体を1つとしてインデックス化します。

    `AUTOINDEX` をインデックスタイプとして、以下のメトリックタイプのいずれかを使用して構造体の配列フィールド内の埋め込みリストにインデックスを作成できます。

    <table>
       <tr>
         <th><p>インデックスタイプ</p></th>
         <th><p>メトリックタイプ</p></th>
         <th><p>備考</p></th>
       </tr>
       <tr>
         <td rowspan="3"><p><code>AUTOINDEX</code></p></td>
         <td><p><code>MAX_SIM_COSINE</code></p></td>
         <td rowspan="3"><p>以下の型に対応する埋め込みリスト：</p><ul><li>FLOAT_VECTOR</li></ul></td>
       </tr>
       <tr>
         <td><p><code>MAX_SIM_IP</code></p></td>
       </tr>
       <tr>
         <td><p><code>MAX_SIM_L2</code></p></td>
       </tr>
    </table>

    構造体の配列フィールド内のスカラーフィールドはインデックスをサポートしません。

- **Upsertデータ**

    構造体はマージモードでのupsertをサポートしていません。ただし、上書きモードでは引き続きupsertを実行して構造体内のデータを更新できます。マージモードと上書きモードのupsertの違いについては[Upsertエンティティ](./upsert-entities#overview)を参照してください。

- **スカラーによるフィルタリング**

    構造体の配列やその構造体要素内のフィールドを検索やクエリ内のフィルター式で使用することはできません。

## 構造体の配列の追加\{#add-array-of-structs}

Zilliz Cloudクラスターで構造体の配列を使用するには、コレクションを作成する際に配列フィールドを定義し、その要素のデータ型を構造体に設定する必要があります。手順は以下の通りです。

1. フィールドを配列フィールドとしてコレクションスキーマに追加する際に、データ型を `DataType.ARRAY` に設定します。

2. フィールドの `element_type` 属性を `DataType.STRUCT` に設定して、フィールドを構造体の配列にします。

3. 構造体スキーマを作成し、必要なフィールドを含めます。その後、フィールドの `struct_schema` 属性で構造体スキーマを参照します。

4. フィールドの `max_capacity` 属性を適切な値に設定し、このフィールドが各エンティティに含めることのできる構造体の最大数を指定します。

5. (**任意**) 構造体要素内の任意のフィールドについて `mmap.enabled` を設定し、構造体内のホットデータとコールドデータのバランスをとることができます。

以下は、構造体の配列を含むコレクションスキーマを定義する方法です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema()

# コレクションに主キーフィールドを追加
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, auto_id=True)

# コレクションにいくつかのスカラーフィールドを追加
schema.add_field(field_name="title", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="author", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="year_of_publication", datatype=DataType.INT64)

# コレクションにベクトルフィールドを追加
schema.add_field(field_name="title_vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# highlight-start
# 構造体スキーマを作成
struct_schema = MilvusClient.create_struct_field_schema()

# 構造体にスカラーフィールドを追加
struct_schema.add_field("text", DataType.VARCHAR, max_length=65535)
struct_schema.add_field("chapter", DataType.VARCHAR, max_length=512)

# mmapを有効にして構造体にベクトルフィールドを追加
struct_schema.add_field("text_vector", DataType.FLOAT_VECTOR, mmap_enabled=True, dim=5)

# 構造体スキーマを要素型を `DataType.STRUCT` に設定した配列フィールドで参照
schema.add_field("chunks", datatype=DataType.ARRAY, element_type=DataType.STRUCT,
                    struct_schema=struct_schema, max_capacity=1000)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema collectionSchema = CreateCollectionReq.CollectionSchema.builder()
        .build();
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("title")
        .dataType(DataType.VarChar)
        .maxLength(512)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("author")
        .dataType(DataType.VarChar)
        .maxLength(512)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("year_of_publication")
        .dataType(DataType.Int64)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("title_vector")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());

Map<String, String> params = new HashMap<>();
params.put("mmap_enabled", "true");
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("chunks")
        .dataType(DataType.Array)
        .elementType(DataType.Struct)
        .maxCapacity(1000)
        .addStructField(AddFieldReq.builder()
                .fieldName("text")
                .dataType(DataType.VarChar)
                .maxLength(65535)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("chapter")
                .dataType(DataType.VarChar)
                .maxLength(512)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("text_vector")
                .dataType(DataType.FloatVector)
                .dimension(VECTOR_DIM)
                .typeParams(params)
                .build())
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
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const milvusClient = new MilvusClient("YOUR_CLUSTER_ENDPOINT");

const schema = [
  {
    name: "id",
    data_type: DataType.INT64,
    is_primary_key: true,
    auto_id: true,
  },
  {
    name: "title",
    data_type: DataType.VARCHAR,
    max_length: 512,
  },
  {
    name: "author",
    data_type: DataType.VARCHAR,
    max_length: 512,
  },
  {
    name: "year_of_publication",
    data_type: DataType.INT64,
  },
  {
    name: "title_vector",
    data_type: DataType.FLOAT_VECTOR,
    dim: 5,
  },
  // highlight-start
  {
    name: "chunks",
    data_type: DataType.ARRAY,
    element_type: DataType.STRUCT,
    fields: [
      {
        name: "text",
        data_type: DataType.VARCHAR,
        max_length: 65535,
      },
      {
        name: "chapter",
        data_type: DataType.VARCHAR,
        max_length: 512,
      },
      {
        name: "text_vector",
        data_type: DataType.FLOAT_VECTOR,
        dim: 5,
        mmap_enabled: true,
      },
    ],
    max_capacity: 1000,
  },
  // highlight-end
];
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
SCHEMA='{
  "autoID": "true"
  "fields": [
    {
      "fieldName": "id",
      "dataType": "Int64",
      "isPrimary": true,
    },
    {
      "fieldName": "title",
      "dataType": "VarChar",
      "elementTypeParams": {
        "max_length": "512"
      }
    },
    {
      "fieldName": "author",
      "dataType": "VarChar",
      "elementTypeParams": {
        "max_length": "512"
      }
    },
    {
      "fieldName": "year_of_publication",
      "dataType": "Int64"
    },
    {
      "fieldName": "title_vector",
      "dataType": "FloatVector",
      "elementTypeParams": {
        "dim": "5"
      }
    }
  ],
  "structArrayFields": [
    {
      "name": "chunks",
      "description": "テキストとベクトルを持つドキュメントチャンクの配列",
      "fields": [
        {
          "fieldName": "text",
          "dataType": "VarChar",
          "elementTypeParams": {
            "max_length": "65535"
          }
        },
        {
          "fieldName": "chapter",
          "dataType": "VarChar",
          "elementTypeParams": {
            "max_length": "512"
          }
        },
        {
          "fieldName": "text_vector",
          "dataType": "FloatVector",
          "elementTypeParams": {
            "dim": "5",
            "mmap_enabled": "true"
          }
        }
      ]
    }
  ]
}'
```

</TabItem>
</Tabs>

上記コード例の強調表示された行は、コレクションスキーマに構造体の配列を含める手順を示しています。

## インデックスパラメータの設定\{#set-index-params}

インデックス作成は、コレクション内のベクトルフィールドと要素構造体で定義されたベクトルフィールドの両方で必須です。

埋め込みリストをインデックス化するには、そのインデックスタイプを `AUTOINDEX` に設定し、Zilliz Cloudクラスターで埋め込みリスト間の類似性を測定するには `MAX_SIM_COSINE` をメトリックタイプとして使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# インデックスパラメータを作成
index_params = MilvusClient.prepare_index_params()

# コレクション内のベクトルフィールドにインデックスを作成
index_params.add_index(
    field_name="title_vector",
    index_type="AUTOINDEX",
    metric_type="L2",
)

# highlight-start
# 要素構造体内のベクトルフィールドにインデックスを作成
index_params.add_index(
    field_name="chunks[text_vector]",
    index_type="AUTOINDEX",
    metric_type="MAX_SIM_COSINE",
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(IndexParam.builder()
        .fieldName("title_vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.L2)
        .build());
indexParams.add(IndexParam.builder()
        .fieldName("chunks[text_vector]")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.MAX_SIM_COSINE)
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
await milvusClient.createCollection({
  collection_name: "books",
  fields: schema,
});

const indexParams = [
  {
    field_name: "title_vector",
    index_type: "AUTOINDEX",
    metric_type: "L2",
  },
  // highlight-start
  {
    field_name: "chunks[text_vector]",
    index_type: "AUTOINDEX",
    metric_type: "MAX_SIM_COSINE",
  },
  // highlight-end
];
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
INDEX_PARAMS='[
  {
    "fieldName": "title_vector",
    "indexName": "title_vector_index",
    "indexType": "AUTOINDEX",
    "metricType": "L2"
  },
  {
    "fieldName": "chunks[text_vector]",
    "indexName": "chunks_text_vector_index",
    "indexType": "AUTOINDEX",
    "metricType": "MAX_SIM_COSINE"
  }
]'
```

</TabItem>
</Tabs>

## コレクション作成\{#create-a-collection}

スキーマとインデックスの準備が完了したら、構造体の配列フィールドを含むコレクションを作成できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(collectionSchema)
        .indexParams(indexParams)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
await milvusClient.createCollection({
  collection_name: "books",
  fields: schema,
  indexes: indexParams,
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"collectionName\": \"book_collection\",
    \"description\": \"構造体配列チャンクを保存するコレクション\",
    \"schema\": $SCHEMA,
    \"indexParams\": $INDEX_PARAMS
  }"
```

</TabItem>
</Tabs>

## データ挿入\{#insert-data}

コレクションを作成した後、以下の方法で構造体の配列を含むデータを挿入できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# サンプルデータ
data = {
    'title': 'ワルデン',
    'title_vector': [0.1, 0.2, 0.3, 0.4, 0.5],
    'author': 'ヘンリー・デイビッド・ソロー',
    'year_of_publication': 1845,
    'chunks': [
        {
            'text': '私は以下のページを書いたとき、むしろそれらの大部分を...',
            'text_vector': [0.3, 0.2, 0.3, 0.2, 0.5],
            'chapter': '経済',
        },
        {
            'text': '私は中国や...に関するほど多く言いたいわけではないが...',
            'text_vector': [0.7, 0.4, 0.2, 0.7, 0.8],
            'chapter': '経済'
        }
    ]
}

# データを挿入
client.insert(
    collection_name="my_collection",
    data=[data]
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

Gson gson = new Gson();
JsonObject row = new JsonObject();
row.addProperty("title", "ワルデン");
row.add("title_vector", gson.toJsonTree(Arrays.asList(0.1f, 0.2f, 0.3f, 0.4f, 0.5f)));
row.addProperty("author", "ヘンリー・デイビッド・ソロー");
row.addProperty("year_of_publication", 1845);

JsonArray structArr = new JsonArray();
JsonObject struct1 = new JsonObject();
struct1.addProperty("text", "私は以下のページを書いたとき、むしろそれらの大部分を...");
struct1.add("text_vector", gson.toJsonTree(Arrays.asList(0.3f, 0.2f, 0.3f, 0.2f, 0.5f)));
struct1.addProperty("chapter", "経済");
structArr.add(struct1);
JsonObject struct2 = new JsonObject();
struct2.addProperty("text", "私は中国や...に関するほど多く言いたいわけではないが...");
struct2.add("text_vector", gson.toJsonTree(Arrays.asList(0.7f, 0.4f, 0.2f, 0.7f, 0.8f)));
struct2.addProperty("chapter", "経済");
structArr.add(struct2);

row.add("chunks", structArr);

InsertResp insertResp = client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(row))
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
  {
    id: 0,
    title: "ワルデン",
    title_vector: [0.1, 0.2, 0.3, 0.4, 0.5],
    author: "ヘンリー・デイビッド・ソロー",
    "year-of-publication": 1845,
    chunks: [
      {
        text: "私は以下のページを書いたとき、むしろそれらの大部分を...",
        text_vector: [0.3, 0.2, 0.3, 0.2, 0.5],
        chapter: "経済",
      },
      {
        text: "私は中国や...に関するほど多く言いたいわけではないが...",
        text_vector: [0.7, 0.4, 0.2, 0.7, 0.8],
        chapter: "経済",
      },
    ],
  },
];

await milvusClient.insert({
  collection_name: "books",
  data: data,
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

<details>

<summary>さらにデータが必要ですか？</summary>

```python
import json
import random
from typing import List, Dict, Any

# 実際の古典作品（タイトル、著者、年）
BOOKS = [
    ("高慢と偏見", "ジェーン・オースティン", 1813),
    ("白鯨", "ハーマン・メルヴィル", 1851),
    ("フランケンシュタイン", "メアリー・シェリー", 1818),
    ("ドリアン・グレイの肖像", "オスカー・ワイルド", 1890),
    ("徳拉古拉", "ブラム・ストーカー", 1897),
    "シャーロック・ホームズの冒険", "アーサー・コナン・ドイル", 1892),
    ("不思議の国のアリス", "ルイス・キャロル", 1865),
    ("タイムマシン", "H・G・ウェルズ", 1895),
    ("スカーレット・レター", "ネイサン・ホーソーン", 1850),
    ("草の葉", "ウォルト・ホイットマン", 1855),
    ("カラマーゾフの兄弟", "フェオドール・ドストエフスキー", 1880),
    ("罪と罰", "フェオドール・ドストエフスキー", 1866),
    ("アンナ・カレーニナ", "レオ・トルストイ", 1877),
    ("戦争と平和", "レオ・トルストイ", 1869),
    ("大 expectancy", "チャールズ・ディケンズ", 1861),
    オリバー・ツイスト", "チャールズ・ディケンズ", 1837),
    "嵐の丘", "エミリー・ブロンテ", 1847),
    "ジェーン・エア", "シャーロット・ブロンテ", 1847),
    "野性への呼び声", "ジャック・ロンドン", 1903),
    "ジャングルブック", "ラディアード・キップリング", 1894),
]

# 古典の一般的な章名
CHAPTERS = [
    "序文", "前書き", "第I章", "第II章", "第III章",
    "第IV章", "第V章", "第VI章", "第VII章", "第VIII章",
    "第IX章", "第X章", "エピローグ", "結論", "あとがき",
    "経済", "私が住んでいた場所", "読書", "音", "孤独",
    "訪問者", "豆畑", "村", "池", "ベーカー農場"
]

# プレースホルダーテキストスニペット（19世紀の散文を模倣）
TEXT_SNIPPETS = [
    "私は以下のページを書いたとき、むしろそれらの大部分を...",
    "私は中国や...に関するほど多く言いたいわけではないが...",
    "一人の男性が...",
    "私をイシュメールと呼んでください。何年か前 - どのくらい正確に...",
    "時代は最良のものであり、最悪のものでもありました...",
    "すべての幸福な家族は似ているが、不幸な家族はそれぞれ不幸せである。",
    "自分の人生の主人公になるかどうか...",
    "災害に伴わず、旅の開始を聞いて喜んでください...",
    "世界は私たちにとって多すぎる；遅くても早くても、獲得と支出...",
    "彼は湾流でスカイフで単独で釣りをする老人でした..."
]

def random_vector() -> List[float]:
    return [round(random.random(), 1) for _ in range(5)]

def generate_chunk() -> Dict[str, Any]:
    return {
        "text": random.choice(TEXT_SNIPPETS),
        "text_vector": random_vector(),
        "chapter": random.choice(CHAPTERS)
    }

def generate_record(record_id: int) -> Dict[str, Any]:
    title, author, year = random.choice(BOOKS)
    num_chunks = random.randint(1, 5)  # 書籍あたり1〜5個のチャンク
    chunks = [generate_chunk() for _ in range(num_chunks)]
    return {
        "title": title,
        "title_vector": random_vector(),
        "author": author,
        "year_of_publication": year,
        "chunks": chunks
    }

# 1000件のレコードを生成
data = [generate_record(i) for i in range(1000)]

# 生成されたデータを挿入
client.insert(collection_name="my_collection", data=data)
```

</details>

## 構造体の配列フィールドに対するベクトル検索\{#vector-search-against-an-array-of-structs-field}

コレクションのベクトルフィールドと構造体の配列内のベクトルフィールドの両方に対してベクトル検索を実行できます。

具体的には、検索要求の `anns_field` パラメータの値として構造体の配列フィールドの名前と構造体要素内の対象ベクトルフィールドの名前を連結し、クエリーベクトルを整頓するために `EmbeddingList` を使用します。

<Admonition type="info" icon="📘" title="注意">

<p>Zilliz Cloudは<code>EmbeddingList</code>を提供し、構造体の配列の埋め込みリストに対する検索をより整然と整理するのに役立ちます。各<code>EmbeddingList</code>には少なくとも1つのベクトル埋め込みが含まれ、上位K個のエンティティを返すことが期待されます。</p>
<p>ただし、<code>EmbeddingList</code>は範囲検索やグループ検索パラメータのない<code>search()</code>要求にのみ使用可能であり、<code>search_iterator()</code>要求には使用できません。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus.client.embedding_list import EmbeddingList

# 各クエリ埋め込みリストは単一の検索をトリガーします
embeddingList1 = EmbeddingList()
embeddingList1.add([0.2, 0.9, 0.4, -0.3, 0.2])

embeddingList2 = EmbeddingList()
embeddingList2.add([-0.2, -0.2, 0.5, 0.6, 0.9])
embeddingList2.add([-0.4, 0.3, 0.5, 0.8, 0.2])

# 単一の埋め込みリストの検索
results = client.search(
    collection_name="my_collection",
    data=[ embeddingList1 ],
    anns_field="chunks[text_vector]",
    search_params={"metric_type": "MAX_SIM_COSINE"},
    limit=3,
    output_fields=["chunks[text]"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.data.EmbeddingList;
import io.milvus.v2.service.vector.request.data.FloatVec;

EmbeddingList embeddingList1 = new EmbeddingList();
embeddingList1.add(new FloatVec(new float[]{0.2f, 0.9f, 0.4f, -0.3f, 0.2f}));

EmbeddingList embeddingList2 = new EmbeddingList();
embeddingList2.add(new FloatVec(new float[]{-0.2f, -0.2f, 0.5f, 0.6f, 0.9f}));
embeddingList2.add(new FloatVec(new float[]{-0.4f, 0.3f, 0.5f, 0.8f, 0.2f}));

Map<String, Object> params = new HashMap<>();
params.put("metric_type", "MAX_SIM_COSINE");
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("chunks[text_vector]")
        .data(Collections.singletonList(embeddingList1))
        .searchParams(params)
        .limit(3)
        .outputFields(Collections.singletonList("chunks[text]"))
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
const embeddingList1 = [[0.2, 0.9, 0.4, -0.3, 0.2]];
const embeddingList2 = [
  [-0.2, -0.2, 0.5, 0.6, 0.9],
  [-0.4, 0.3, 0.5, 0.8, 0.2],
];
const results = await milvusClient.search({
  collection_name: "books",
  data: embeddingList1,
  anns_field: "chunks[text_vector]",
  search_params: { metric_type: "MAX_SIM_COSINE" },
  limit: 3,
  output_fields: ["chunks[text]"],
});

```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

上記の検索要求は、構造体要素内の `text_vector` フィールドを参照するために `chunks[text_vector]` を使用しています。この構文を使用して `anns_field` および `output_fields` パラメータを設定できます。

出力は最も類似した3つのエンティティのリストになります。

<details>

<summary>出力</summary>

```python
# [
#     [
#         {
#             'id': 461417939772144945,
#             'distance': 0.9675756096839905,
#             'entity': {
#                 'chunks': [
#                     {'text': '世界は私たちにとって多すぎる；遅くても早くても、獲得と支出...'},
#                     {'text': 'すべての幸福な家族は似ているが、不幸な家族はそれぞれ不幸せである。'}
#                 ]
#             }
#         },
#         {
#             'id': 461417939772144965,
#             'distance': 0.9555778503417969,
#             'entity': {
#                 'chunks': [
#                     {'text': '私をイシュメールと呼んでください。何年か前 - どのくらい正確に...'},
#                     {'text': '彼は湾流でスカイフで単独で釣りをする老人でした...'},
#                     {'text': '私は以下のページを書いたとき、むしろそれらの大部分を...'},
#                     {'text': '時代は最良のものであり、最悪のものでもありました...'},
#                     {'text': '世界は私たちにとって多すぎる；遅くても早くても、獲得と支出...'}
#                 ]
#             }
#         },
#         {
#             'id': 461417939772144962,
#             'distance': 0.9469035863876343,
#             'entity': {
#                 'chunks': [
#                     {'text': '私をイシュメールと呼んでください。何年か前 - どのくらい正確に...'},
#                     {'text': '世界は私たちにとって多すぎる；遅くても早くても、獲得と支出...'},
#                     {'text': '彼は湾流でスカイフで単独で釣りをする老人でした...'},
#                     {'text': '私をイシュメールと呼んでください。何年か前 - どのくらい正確に...'},
#                     {'text': '世界は私たちにとって多すぎる；遅くても早くても、獲得と支出...'}
#                 ]
#             }
#         }
#     ]
# ]
```

</details>

`data` パラメータに複数の埋め込みリストを含めることで、これらの埋め込みリストそれぞれに対する検索結果を取得することもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 複数の埋め込みリストの検索
results = client.search(
    collection_name="my_collection",
    data=[ embeddingList1, embeddingList2 ],
    anns_field="chunks[text_vector]",
    search_params={"metric_type": "MAX_SIM_COSINE"},
    limit=3,
    output_fields=["chunks[text]"]
)

print(results)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> params = new HashMap<>();
params.put("metric_type", "MAX_SIM_COSINE");
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("chunks[text_vector]")
        .data(Arrays.asList(embeddingList1, embeddingList2))
        .searchParams(params)
        .limit(3)
        .outputFields(Collections.singletonList("chunks[text]"))
        .build());

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (int i = 0; i < searchResults.size(); i++) {
    System.out.println("No." + i + " 埋め込みリストの結果");
    List<SearchResp.SearchResult> results = searchResults.get(i);
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
const results2 = await milvusClient.search({
  collection_name: "books",
  data: [embeddingList1, embeddingList2],
  anns_field: "chunks[text_vector]",
  search_params: { metric_type: "MAX_SIM_COSINE" },
  limit: 3,
  output_fields: ["chunks[text]"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

出力は各埋め込みリストに対する最も類似した3つのエンティティのリストになります。

<details>

<summary>出力</summary>

```python
# [
#   [
#     {
#       'id': 461417939772144945,
#       'distance': 0.9675756096839905,
#       'entity': {
#         'chunks': [
#           {'text': '世界は私たちにとって多すぎる；遅くても早くても、獲得と支出...'},
#           {'text': 'すべての幸福な家族は似ているが、不幸な家族はそれぞれ不幸せである。'}
#         ]
#       }
#     },
#     {
#       'id': 461417939772144965,
#       'distance': 0.9555778503417969,
#       'entity': {
#         'chunks': [
#           {'text': '私をイシュメールと呼んでください。何年か前 - どのくらい正確に...'},
#           {'text': '彼は湾流でスカイフで単独で釣りをする老人でした...'},
#           {'text': '私は以下のページを書いたとき、むしろそれらの大部分を...'},
#           {'text': '時代は最良のものであり、最悪のものでもありました...'},
#           {'text': '世界は私たちにとって多すぎる；遅くても早くても、獲得と支出...'}
#         ]
#       }
#     },
#     {
#       'id': 461417939772144962,
#       'distance': 0.9469035863876343,
#       'entity': {
#         'chunks': [
#           {'text': '私をイシュメールと呼んでください。何年か前 - どのくらい正確に...'},
#           {'text': '世界は私たちにとって多すぎる；遅くても早くても、獲得と支出...'},
#           {'text': '彼は湾流でスカイフで単独で釣りをする老人でした...'},
#           {'text': '私をイシュメールと呼んでください。何年か前 - どのくらい正確に...'},
#           {'text': '世界は私たちにとって多すぎる；遅くても早くても、獲得と支出...'}
#         ]
#       }
#     }
#   ],
#   [
#     {
#       'id': 461417939772144663,
#       'distance': 1.9761409759521484,
#       'entity': {
#         'chunks': [
#           {'text': '時代は最良のものであり、最悪のものでもありました...'},
#           {'text': '一人の男性が...',
#           {'text': '自分の人生の主人公になるかどうか...',
#           {'text': '彼は湾流でスカイフで単独で釣りをする老人でした...'}
#         ]
#       }
#     },
#     {
#       'id': 461417939772144692,
#       'distance': 1.974656581878662,
#       'entity': {
#         'chunks': [
#           {'text': '一人の男性が...',
#           {'text': '私をイシュメールと呼んでください。何年か前 - どのくらい正確に...'}
#         ]
#       }
#     },
#     {
#       'id': 461417939772144662,
#       'distance': 1.9406685829162598,
#       'entity': {
#         'chunks': [
#           {'text': '一人の男性が...'}
#         ]
#       }
#     }
#   ]
# ]
```

</details>

上記のコード例では、`embeddingList1` は1つのベクトルの埋め込みリストであり、`embeddingList2` は2つのベクトルを含んでいます。それぞれが別々の検索要求をトリガーし、上位K個の類似エンティティのリストを期待します。

## 次のステップ\{#next-steps}

ネイティブな構造体の配列データ型の開発は、Zilliz Cloudが複雑なデータ構造を処理する能力における大きな進歩です。使用例をより理解し、この新機能を最大限に活用するには、[構造体の配列を使用したスキーマ設計](./schema-design-with-structs)を読むことをお勧めします。

