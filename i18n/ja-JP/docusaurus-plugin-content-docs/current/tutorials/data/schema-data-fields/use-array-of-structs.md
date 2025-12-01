---
title: "構造体の配列 | Cloud"
slug: /use-array-of-structs
sidebar_label: "構造体の配列"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "エンティティ内の構造体の配列フィールドは、構造体要素の順序付きセットを格納します。配列内の各構造体は、複数のベクトルおよびスカラーフィールドで構成される同じ事前定義されたスキーマを共有します。 | Cloud"
type: origin
token: LIMbwXk1OiS5SykUyNhc5FtSnPb
sidebar_position: 10
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - array field
  - array of structs
  - structs
  - RAG
  - NLP
  - Neural Network
  - Deep Learning

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 構造体の配列

エンティティ内の構造体の配列フィールドは、構造体要素の順序付きセットを格納します。配列内の各構造体は、複数のベクトルおよびスカラーフィールドで構成される同じ事前定義されたスキーマを共有します。

以下は、構造体の配列フィールドを含むコレクションからのエンティティ例です。

```json
{
    'id': 0,
    'title': 'Walden',
    'title_vector': [0.1, 0.2, 0.3, 0.4, 0.5],
    'author': 'Henry David Thoreau',
    'year_of_publication': 1845,
    // highlight-start
    'chunks': [
        {
            'text': 'When I wrote the following pages, or rather the bulk of them...',
            'text_vector': [0.3, 0.2, 0.3, 0.2, 0.5],
            'chapter': 'Economy',
        },
        {
            'text': 'I would fain say something, not so much concerning the Chinese and...',
            'text_vector': [0.7, 0.4, 0.2, 0.7, 0.8],
            'chapter': 'Economy'
        }
    ]
    // hightlight-end
}
```

上記の例では、`chunks` フィールドが構造体の配列フィールドであり、各構造体要素には `text`、`text_vector`、`chapter` というフィールドが含まれています。

## 制限事項\{#limits}

- **データ型**

    コレクションを作成する際、構造体型を配列フィールド内の要素のデータ型として使用できます。ただし、既存のコレクションに構造体の配列を追加することはできず、Zilliz Cloudは構造体型をコレクションフィールドのデータ型として使用することをサポートしていません。

    配列フィールド内の構造体は同じスキーマを共有し、これは配列フィールドを作成する際に定義する必要があります。

    構造体スキーマには、以下の表に示すように、ベクトルとスカラーの両方のフィールドが含まれます：

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

    コレクションレベルと構造体内のベクトルフィールドの両方を合わせたベクトルフィールドの数は、クラスタの上限を超えないようにしてください。詳細は[Zilliz Cloud Limits](./limits#fields)を参照してください。

- **Nullable & デフォルト値**

    構造体の配列フィールドはnullableではなく、デフォルト値を受け入れません。

- **関数**

    構造体内でスカラーフィールドからベクトルフィールドを導出する関数を使用することはできません。

- **インデックスタイプ & メトリックタイプ**

    コレクション内のすべてのベクトルフィールドにはインデックスを付ける必要があります。構造体の配列フィールド内のベクトルフィールドにインデックスを付けるには、Zilliz Cloudは埋め込みリストを使用して各構造体要素内のベクトル埋め込みを整理し、埋め込みリスト全体にインデックスを付けます。

    `AUTOINDEX` をインデックスタイプとして使用し、以下のメトリックタイプのいずれかを使用して、構造体の配列フィールド内の埋め込みリストのインデックスを作成できます。

    <table>
       <tr>
         <th><p>インデックスタイプ</p></th>
         <th><p>メトリックタイプ</p></th>
         <th><p>備考</p></th>
       </tr>
       <tr>
         <td rowspan="3"><p><code>AUTOINDEX</code></p></td>
         <td><p><code>MAX_SIM_COSINE</code></p></td>
         <td rowspan="3"><p>以下のタイプの埋め込みリスト用:</p><ul><li>FLOAT_VECTOR</li></ul></td>
       </tr>
       <tr>
         <td><p><code>MAX_SIM_IP</code></p></td>
       </tr>
       <tr>
         <td><p><code>MAX_SIM_L2</code></p></td>
       </tr>
    </table>

    構造体の配列フィールド内のスカラーフィールドはインデックスをサポートしていません。

- **アップサートデータ**

    構造体はマージモードによるアップサートをサポートしていません。ただし、オーバーライドモードでアップサートを実行して、構造体のデータを更新することは可能です。マージモードとオーバーライドモードの違いについては、[Upsert Entities](./upsert-entities#overview)を参照してください。

- **スカラーによるフィルタリング**

    クエリや検索内のフィルタリング式で、構造体の配列またはその構造体要素内のフィールドを使用することはできません。

## 構造体の配列を追加\{#add-array-of-structs}

Zilliz Cloudクラスターで構造体の配列を使用するには、コレクションを作成する際に配列フィールドを定義し、要素のデータ型をStructに設定する必要があります。プロセスは以下の通りです：

1. 配列フィールドとしてフィールドをコレクションスキーマに追加する際、フィールドのデータ型を `DataType.ARRAY` に設定します。

1. フィールドの `element_type` 属性を `DataType.STRUCT` に設定して、フィールドを構造体の配列にします。

1. 構造体スキーマを作成し、必要なフィールドを含めます。次に、フィールドの `struct_schema` 属性で構造体スキーマを参照します。

1. フィールドの `max_capacity` 属性を適切な値に設定し、このフィールドに含まれる各エンティティが保持できる構造体の最大数を指定します。

1. （任意）構造体要素内の任意のフィールドについて `mmap.enabled` を設定し、構造体内のホットデータとコールドデータのバランスを調整できます。

以下は、構造体の配列を含むコレクションスキーマを定義する方法です：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema()

# コレクションにプライマリフィールドを追加
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

# mmap有効化で構造体にベクトルフィールドを追加
struct_schema.add_field("text_vector", DataType.FLOAT_VECTOR, mmap_enabled=True, dim=5)

# 構造体スキーマを要素型が `DataType.STRUCT` である配列フィールドで参照
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
      "description": "Array of document chunks with text and vectors",
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

上記のコード例のハイライトされた行は、コレクションスキーマに構造体の配列を含める手順を示しています。

## インデックスパラメータの設定\{#set-index-params}

コレクション内のベクトルフィールドと要素構造体内に定義されたベクトルフィールドの両方を含む、すべてのベクトルフィールドについてインデックス作成は必須です。

埋め込みリストにインデックスを付けるには、インデックスタイプを `AUTOINDEX` に設定し、Zilliz Cloudクラスターが埋め込みリスト間の類似性を測定するために `MAX_SIM_COSINE` をメトリックタイプとして使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# インデックスパラメータを作成
index_params = MilvusClient.prepare_index_params()

# コレクション内のベクトルフィールドのインデックスを作成
index_params.add_index(
    field_name="title_vector",
    index_type="AUTOINDEX",
    metric_type="L2",
)

# highlight-start
# 要素構造体内のベクトルフィールドのインデックスを作成
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

## コレクションを作成\{#create-a-collection}

スキーマとインデックスが準備できたら、構造体の配列フィールドを含むコレクションを作成できます。

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
    \"description\": \"A collection for storing book information with struct array chunks\",
    \"schema\": $SCHEMA,
    \"indexParams\": $INDEX_PARAMS
  }"
```

</TabItem>
</Tabs>

## データの挿入\{#insert-data}

コレクションを作成した後、構造体の配列を含むデータを以下のように挿入できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# サンプルデータ
data = {
    'title': 'Walden',
    'title_vector': [0.1, 0.2, 0.3, 0.4, 0.5],
    'author': 'Henry David Thoreau',
    'year_of_publication': 1845,
    'chunks': [
        {
            'text': 'When I wrote the following pages, or rather the bulk of them...',
            'text_vector': [0.3, 0.2, 0.3, 0.2, 0.5],
            'chapter': 'Economy',
        },
        {
            'text': 'I would fain say something, not so much concerning the Chinese and...',
            'text_vector': [0.7, 0.4, 0.2, 0.7, 0.8],
            'chapter': 'Economy'
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
row.addProperty("title", "Walden");
row.add("title_vector", gson.toJsonTree(Arrays.asList(0.1f, 0.2f, 0.3f, 0.4f, 0.5f)));
row.addProperty("author", "Henry David Thoreau");
row.addProperty("year_of_publication", 1845);

JsonArray structArr = new JsonArray();
JsonObject struct1 = new JsonObject();
struct1.addProperty("text", "When I wrote the following pages, or rather the bulk of them...");
struct1.add("text_vector", gson.toJsonTree(Arrays.asList(0.3f, 0.2f, 0.3f, 0.2f, 0.5f)));
struct1.addProperty("chapter", "Economy");
structArr.add(struct1);
JsonObject struct2 = new JsonObject();
struct2.addProperty("text", "I would fain say something, not so much concerning the Chinese and...");
struct2.add("text_vector", gson.toJsonTree(Arrays.asList(0.7f, 0.4f, 0.2f, 0.7f, 0.8f)));
struct2.addProperty("chapter", "Economy");
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
    title: "Walden",
    title_vector: [0.1, 0.2, 0.3, 0.4, 0.5],
    author: "Henry David Thoreau",
    "year-of-publication": 1845,
    chunks: [
      {
        text: "When I wrote the following pages, or rather the bulk of them...",
        text_vector: [0.3, 0.2, 0.3, 0.2, 0.5],
        chapter: "Economy",
      },
      {
        text: "I would fain say something, not so much concerning the Chinese and...",
        text_vector: [0.7, 0.4, 0.2, 0.7, 0.8],
        chapter: "Economy",
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

# 実際に存在する古典的作品（タイトル、著者、年）
BOOKS = [
    ("Pride and Prejudice", "Jane Austen", 1813),
    ("Moby Dick", "Herman Melville", 1851),
    ("Frankenstein", "Mary Shelley", 1818),
    ("The Picture of Dorian Gray", "Oscar Wilde", 1890),
    ("Dracula", "Bram Stoker", 1897),
    ("The Adventures of Sherlock Holmes", "Arthur Conan Doyle", 1892),
    ("Alice's Adventures in Wonderland", "Lewis Carroll", 1865),
    ("The Time Machine", "H.G. Wells", 1895),
    ("The Scarlet Letter", "Nathaniel Hawthorne", 1850),
    ("Leaves of Grass", "Walt Whitman", 1855),
    ("The Brothers Karamazov", "Fyodor Dostoevsky", 1880),
    ("Crime and Punishment", "Fyodor Dostoevsky", 1866),
    ("Anna Karenina", "Leo Tolstoy", 1877),
    ("War and Peace", "Leo Tolstoy", 1869),
    ("Great Expectations", "Charles Dickens", 1861),
    ("Oliver Twist", "Charles Dickens", 1837),
    ("Wuthering Heights", "Emily Brontë", 1847),
    ("Jane Eyre", "Charlotte Brontë", 1847),
    ("The Call of the Wild", "Jack London", 1903),
    ("The Jungle Book", "Rudyard Kipling", 1894),
]

# 古典作品の一般的な章名
CHAPTERS = [
    "Introduction", "Prologue", "Chapter I", "Chapter II", "Chapter III",
    "Chapter IV", "Chapter V", "Chapter VI", "Chapter VII", "Chapter VIII",
    "Chapter IX", "Chapter X", "Epilogue", "Conclusion", "Afterword",
    "Economy", "Where I Lived", "Reading", "Sounds", "Solitude",
    "Visitors", "The Bean-Field", "The Village", "The Ponds", "Baker Farm"
]

# プレースホルダーテキストスニペット（19世紀の散文を模倣）
TEXT_SNIPPETS = [
    "When I wrote the following pages, or rather the bulk of them...",
    "I would fain say something, not so much concerning the Chinese and...",
    "It is a truth universally acknowledged, that a single man in possession...",
    "Call me Ishmael. Some years ago—never mind how long precisely...",
    "It was the best of times, it was the worst of times...",
    "All happy families are alike; each unhappy family is unhappy in its own way.",
    "Whether I shall turn out to be the hero of my own life, or whether that station...",
    "You will rejoice to hear that no disaster has accompanied the commencement...",
    "The world is too much with us; late and soon, getting and spending...",
    "He was an old man who fished alone in a skiff in the Gulf Stream..."
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
    num_chunks = random.randint(1, 5)  # 1つの本に1〜5のチャンク
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

コレクションのベクトルフィールドと構造体の配列内のベクトル検索を実行できます。

具体的には、検索要求の`anns_field`パラメータの値として、構造体の配列フィールドの名前と構造体要素内のターゲットベクトルフィールドの名前を連結し、`EmbeddingList`を使用してクエリベクトルを整理します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudは<code>EmbeddingList</code>を提供しており、構造体の配列内の埋め込みリストに対する検索のためのクエリベクトルをより整理して配置できます。<code>EmbeddingList</code>には少なくとも1つのベクトル埋め込みが含まれ、返されるtopKエンティティ数が期待されます。</p>
<p>ただし、<code>EmbeddingList</code>は範囲検索またはグループ化検索のパラメータなしの<code>search()</code>要求でのみ使用でき、<code>search_iterator()</code>要求では使用できません。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus.client.embedding_list import EmbeddingList

# 各クエリ埋め込みリストは単一の検索をトリガー
embeddingList1 = EmbeddingList()
embeddingList1.add([0.2, 0.9, 0.4, -0.3, 0.2])

embeddingList2 = EmbeddingList()
embeddingList2.add([-0.2, -0.2, 0.5, 0.6, 0.9])
embeddingList2.add([-0.4, 0.3, 0.5, 0.8, 0.2])

# 単一の埋め込みリストを使用した検索
results = client.search(
    collection_name="my_collection",
    data=[ embeddingList1 ],
    anns_field="chunks[text_vector]",
    search_params={"metric_type": "MAX_SIM_COSINE"},
    limit=10
)

# 複数の埋め込みリストを使用した検索
results = client.search(
    collection_name="my_collection",
    data=[ embeddingList1, embeddingList2 ],
    anns_field="chunks[text_vector]",
    search_params={"metric_type": "MAX_SIM_COSINE"},
    limit=10
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

// 埋め込みリストの作成
List<List<Float>> queryEmbeddings1 = Arrays.asList(
    Arrays.asList(0.2f, 0.9f, 0.4f, -0.3f, 0.2f)
);

List<List<Float>> queryEmbeddings2 = Arrays.asList(
    Arrays.asList(-0.2f, -0.2f, 0.5f, 0.6f, 0.9f),
    Arrays.asList(-0.4f, 0.3f, 0.5f, 0.8f, 0.2f)
);

// 単一の埋め込みリストを使用した検索
SearchResp resp1 = client.search(SearchReq.builder()
    .collectionName("my_collection")
    .data(queryEmbeddings1)
    .annsField("chunks[text_vector]")
    .topK(10)
    .searchParams(Collections.singletonMap("metric_type", "MAX_SIM_COSINE"))
    .build());

// 複数の埋め込みリストを使用した検索
SearchResp resp2 = client.search(SearchReq.builder()
    .collectionName("my_collection")
    .data(queryEmbeddings2)
    .annsField("chunks[text_vector]")
    .topK(10)
    .searchParams(Collections.singletonMap("metric_type", "MAX_SIM_COSINE"))
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
// 単一の埋め込みリストを使用した検索
const res1 = await milvusClient.search({
  collection_name: "books",
  vectors: [[0.2, 0.9, 0.4, -0.3, 0.2]],
  search_params: {
    anns_field: "chunks[text_vector]",
    topk: "10",
    metric_type: "MAX_SIM_COSINE",
    params: JSON.stringify({ nprobe: 10 }),
  },
  output_fields: ["title", "author", "chunks"],
});

// 複数の埋め込みリストを使用した検索
const res2 = await milvusClient.search({
  collection_name: "books",
  vectors: [
    [0.2, 0.9, 0.4, -0.3, 0.2],
    [-0.2, -0.2, 0.5, 0.6, 0.9],
    [-0.4, 0.3, 0.5, 0.8, 0.2]
  ],
  search_params: {
    anns_field: "chunks[text_vector]",
    topk: "10",
    metric_type: "MAX_SIM_COSINE",
    params: JSON.stringify({ nprobe: 10 }),
  },
  output_fields: ["title", "author", "chunks"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -d "{
    \"collectionName\": \"book_collection\",
    \"data\": [
      [
        [0.2, 0.9, 0.4, -0.3, 0.2]
      ],
      [
        [-0.2, -0.2, 0.5, 0.6, 0.9],
        [-0.4, 0.3, 0.5, 0.8, 0.2]
      ]
    ],
    \"annsField\": \"chunks[text_vector]\",
    \"topK\": 10,
    \"search_params\": {
      \"metric_type\": \"MAX_SIM_COSINE\"
    },
    \"output_fields\": [\"title\", \"author\", \"chunks\"]
  }"
```

</TabItem>
</Tabs>

## 部分的な検索\{#partial-search}

ベクトル検索を実行すると、結果として、入力した埋め込みリストの各要素と最も類似した構造体のベクトルが返されます。各埋め込みリストは、入力した埋め込みリストの数と同じ数の結果を返します。

たとえば、`embeddingList1` には1つの埋め込みが含まれているため、結果には1つの構造体が返されます。一方、`embeddingList2` には2つの埋め込みが含まれているため、結果には2つの構造体が返されます。

## 検索結果の解釈\{#interpreting-search-results}

検索結果を解釈する際には、埋め込みリストが構造体の配列内の個々の構造体に対応していることを考慮する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
def interpret_search_results(results):
    for i, result in enumerate(results):
        print(f"埋め込み {i+1} の結果:")
        for entity in result:
            print(f"  ID: {entity['id']}")
            print(f"  距離: {entity['distance']}")
            print(f"  構造体: {entity['entity']}")
            print()

# 埋め込みリスト1（1つの埋め込みのみ）
embeddingList1 = EmbeddingList()
embeddingList1.add([0.2, 0.9, 0.4, -0.3, 0.2])

results = client.search(
    collection_name="my_collection",
    data=[ embeddingList1 ],
    anns_field="chunks[text_vector]",
    search_params={"metric_type": "MAX_SIM_COSINE"},
    limit=10
)

interpret_search_results(results)

# 埋め込みリスト2（2つの埋め込み）
embeddingList2 = EmbeddingList()
embeddingList2.add([-0.2, -0.2, 0.5, 0.6, 0.9])
embeddingList2.add([-0.4, 0.3, 0.5, 0.8, 0.2])

results = client.search(
    collection_name="my_collection",
    data=[ embeddingList2 ],
    anns_field="chunks[text_vector]",
    search_params={"metric_type": "MAX_SIM_COSINE"},
    limit=10
)

interpret_search_results(results)
```

</TabItem>

<TabItem value='java'>

```java
// Javaの結果解釈
for (int i = 0; i < resp.getSearchResults().size(); i++) {
    System.out.println("埋め込み " + (i+1) + " の結果:");
    for (SearchResp.SearchResult result : resp.getSearchResults().get(i)) {
        System.out.println("  ID: " + result.getId());
        System.out.println("  スコア: " + result.getScore());
        System.out.println("  構造体: " + result.getEntity());
        System.out.println();
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
// JavaScriptの結果解釈
for (let i = 0; i < res.results.length; i++) {
    console.log(`埋め込み ${i+1} の結果:`);
    for (const result of res.results[i]) {
        console.log(`  ID: ${result.id}`);
        console.log(`  距離: ${result.distance}`);
        console.log(`  構造体: ${JSON.stringify(result.entity)}`);
        console.log();
    }
}
```

</TabItem>

<TabItem value='bash'>

```bash
# bashの結果解釈
# 結果はJSONとして返されるため、jqを使用して解析できます
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -d "..." \
  | jq '.data[] | .[] | {id: .id, distance: .distance, entity: .entity}'
```

</TabItem>
</Tabs>

## クエリ\{#query}

構造体の配列フィールドを使用する際、構造体要素内のフィールドはスカラー検索で使用できません。構造体の配列内に含まれるデータを照会または検索するには、ベクトル検索を使用する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 構造体要素内のフィールドを使用したクエリは無効
# query = client.query(
#     collection_name="my_collection",
#     filter="chunks.text == 'When I wrote the following pages...",
#     output_fields=["chunks"]
# )

# 代わりに、ベクトル検索を使用
from pymilvus.client.embedding_list import EmbeddingList

query_embedding = EmbeddingList()
query_embedding.add([0.3, 0.2, 0.3, 0.2, 0.5])  # 'text_vector'の値に対応

results = client.search(
    collection_name="my_collection",
    data=[query_embedding],
    anns_field="chunks[text_vector]",
    search_params={"metric_type": "MAX_SIM_COSINE"},
    limit=10
)

for result in results:
    for entity in result:
        print(f"ID: {entity['id']}")
        print(f"距離: {entity['distance']}")
        print(f"構造体: {entity['entity']}")
        print()
```

</TabItem>

<TabItem value='java'>

```java
// 構造体要素内のフィールドを使用したクエリは無効
// List<JsonObject> results = client.query(QueryReq.builder()
//     .collectionName("my_collection")
//     .filter("chunks.text == 'When I wrote the following pages...")
//     .outputFields(Arrays.asList("chunks"))
//     .build());

// 代わりに、ベクトル検索を使用
List<List<Float>> queryEmbeddings = Arrays.asList(
    Arrays.asList(0.3f, 0.2f, 0.3f, 0.2f, 0.5f)
);

SearchResp resp = client.search(SearchReq.builder()
    .collectionName("my_collection")
    .data(queryEmbeddings)
    .annsField("chunks[text_vector]")
    .topK(10)
    .searchParams(Collections.singletonMap("metric_type", "MAX_SIM_COSINE"))
    .build());

for (SearchResp.SearchResult result : resp.getSearchResults().get(0)) {
    System.out.println("ID: " + result.getId());
    System.out.println("スコア: " + result.getScore());
    System.out.println("構造体: " + result.getEntity());
    System.out.println();
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
// 構造体要素内のフィールドを使用したクエリは無効
// const results = await milvusClient.query({
//   collection_name: "books",
//   filter: "chunks.text == 'When I wrote the following pages...",
//   output_fields: ["chunks"],
// });

// 代わりに、ベクトル検索を使用
const res = await milvusClient.search({
  collection_name: "books",
  vectors: [[0.3, 0.2, 0.3, 0.2, 0.5]], // 'text_vector'の値に対応
  search_params: {
    anns_field: "chunks[text_vector]",
    topk: "10",
    metric_type: "MAX_SIM_COSINE",
    params: JSON.stringify({ nprobe: 10 }),
  },
  output_fields: ["chunks", "title", "author"],
});

res.results.forEach((result, index) => {
  console.log(`検索結果 ${index + 1}:`);
  result.forEach(entity => {
    console.log(`  ID: ${entity.id}`);
    console.log(`  距離: ${entity.distance}`);
    console.log(`  構造体: ${JSON.stringify(entity.entity)}`);
    console.log();
  });
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
# 構造体要素内のフィールドを使用したクエリは無効

# 代わりに、ベクトル検索を使用
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -d "{
    \"collectionName\": \"book_collection\",
    \"data\": [
      [
        [0.3, 0.2, 0.3, 0.2, 0.5]
      ]
    ],
    \"annsField\": \"chunks[text_vector]\",
    \"topK\": 10,
    \"search_params\": {
      \"metric_type\": \"MAX_SIM_COSINE\"
    },
    \"output_fields\": [\"chunks\", \"title\", \"author\"]
  }"
```

</TabItem>
</Tabs>

## 使用例\{#use-cases}

構造体の配列は、特にドキュメントのチャンク化、商品の特徴、ユーザーの嗜好など、エンティティ内に複数の関連する構造化データを格納する必要がある場合に便利です。

### ドキュメントチャンク化\{#document-chunking}

構造体の配列は、ドキュメントのチャンク化やRAG（Retrieval-Augmented Generation）アプリケーションに理想的です。各構造体には、ドキュメントの一部、その埋め込みベクトル、メタデータが含まれます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# ドキュメントチャンク化のスキーマ
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

schema = MilvusClient.create_schema()
schema.add_field(field_name="doc_id", datatype=DataType.INT64, is_primary=True, auto_id=True)
schema.add_field(field_name="doc_title", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="doc_vector", datatype=DataType.FLOAT_VECTOR, dim=1536)

# チャンク構造体のスキーマ
chunk_schema = MilvusClient.create_struct_field_schema()
chunk_schema.add_field("text", DataType.VARCHAR, max_length=65535)
chunk_schema.add_field("chunk_vector", DataType.FLOAT_VECTOR, dim=1536, mmap_enabled=True)
chunk_schema.add_field("page_num", DataType.INT64)
chunk_schema.add_field("section", DataType.VARCHAR, max_length=512)

# チャンクフィールドを追加
schema.add_field("chunks", datatype=DataType.ARRAY, element_type=DataType.STRUCT,
                 struct_schema=chunk_schema, max_capacity=1000)

# インデックスを作成
index_params = MilvusClient.prepare_index_params()
index_params.add_index(
    field_name="doc_vector",
    index_type="AUTOINDEX",
    metric_type="COSINE"
)
index_params.add_index(
    field_name="chunks[chunk_vector]",
    index_type="AUTOINDEX",
    metric_type="MAX_SIM_COSINE"
)

# コレクションを作成
client.create_collection(
    collection_name="document_chunks",
    schema=schema,
    index_params=index_params
)

# データを挿入
data = {
    "doc_title": "Research Paper on Vector Databases",
    "doc_vector": [0.1, 0.2, 0.3, ...],
    "chunks": [
        {
            "text": "Vector databases are optimized for similarity search...",
            "chunk_vector": [0.4, 0.5, 0.6, ...],
            "page_num": 1,
            "section": "Introduction"
        },
        {
            "text": "Similarity search algorithms play a crucial role...",
            "chunk_vector": [0.7, 0.8, 0.9, ...],
            "page_num": 2,
            "section": "Algorithms"
        }
    ]
}

client.insert(collection_name="document_chunks", data=[data])
```

</TabItem>

<TabItem value='java'>

```java
// ドキュメントチャンク化のJava実装
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema collectionSchema = CreateCollectionReq.CollectionSchema.builder()
        .build();
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("doc_id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("doc_title")
        .dataType(DataType.VarChar)
        .maxLength(512)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("doc_vector")
        .dataType(DataType.FloatVector)
        .dimension(1536)
        .build());

Map<String, String> mmapParams = new HashMap<>();
mmapParams.put("mmap_enabled", "true");
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
                .fieldName("chunk_vector")
                .dataType(DataType.FloatVector)
                .dimension(1536)
                .typeParams(mmapParams)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("page_num")
                .dataType(DataType.Int64)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("section")
                .dataType(DataType.VarChar)
                .maxLength(512)
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
// ドキュメントチャンク化のJavaScript実装
const docSchema = [
  {
    name: "doc_id",
    data_type: DataType.INT64,
    is_primary_key: true,
    auto_id: true,
  },
  {
    name: "doc_title",
    data_type: DataType.VARCHAR,
    max_length: 512,
  },
  {
    name: "doc_vector",
    data_type: DataType.FLOAT_VECTOR,
    dim: 1536,
  },
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
        name: "chunk_vector",
        data_type: DataType.FLOAT_VECTOR,
        dim: 1536,
        mmap_enabled: true,
      },
      {
        name: "page_num",
        data_type: DataType.INT64,
      },
      {
        name: "section",
        data_type: DataType.VARCHAR,
        max_length: 512,
      },
    ],
    max_capacity: 1000,
  },
];

await milvusClient.createCollection({
  collection_name: "document_chunks",
  fields: docSchema,
  indexes: [
    {
      field_name: "doc_vector",
      index_type: "AUTOINDEX",
      metric_type: "COSINE",
    },
    {
      field_name: "chunks[chunk_vector]",
      index_type: "AUTOINDEX",
      metric_type: "MAX_SIM_COSINE",
    },
  ],
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
# ドキュメントチャンク化スキーマ
SCHEMA='{
  "autoID": true,
  "fields": [
    {
      "fieldName": "doc_id",
      "dataType": "Int64",
      "isPrimary": true
    },
    {
      "fieldName": "doc_title",
      "dataType": "VarChar",
      "elementTypeParams": {
        "max_length": "512"
      }
    },
    {
      "fieldName": "doc_vector",
      "dataType": "FloatVector",
      "elementTypeParams": {
        "dim": "1536"
      }
    }
  ],
  "structArrayFields": [
    {
      "name": "chunks",
      "description": "Document chunks with text and vectors",
      "fields": [
        {
          "fieldName": "text",
          "dataType": "VarChar",
          "elementTypeParams": {
            "max_length": "65535"
          }
        },
        {
          "fieldName": "chunk_vector",
          "dataType": "FloatVector",
          "elementTypeParams": {
            "dim": "1536",
            "mmap_enabled": "true"
          }
        },
        {
          "fieldName": "page_num",
          "dataType": "Int64"
        },
        {
          "fieldName": "section",
          "dataType": "VarChar",
          "elementTypeParams": {
            "max_length": "512"
          }
        }
      ]
    }
  ]
}'
```

</TabItem>
</Tabs>

### 製品の特徴\{#product-features}

構造体の配列は、製品の特徴を表すためにも使用できます。各構造体は、特定の製品バリアントの特徴を表します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 製品特徴スキーマ
schema = MilvusClient.create_schema()
schema.add_field(field_name="product_id", datatype=DataType.INT64, is_primary=True, auto_id=True)
schema.add_field(field_name="product_name", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="category", datatype=DataType.VARCHAR, max_length=512)

# 特徴構造体のスキーマ
feature_schema = MilvusClient.create_struct_field_schema()
feature_schema.add_field("feature_name", DataType.VARCHAR, max_length=512)
feature_schema.add_field("feature_value", DataType.VARCHAR, max_length=512)
feature_schema.add_field("feature_vector", DataType.FLOAT_VECTOR, dim=768, mmap_enabled=True)

schema.add_field("features", datatype=DataType.ARRAY, element_type=DataType.STRUCT,
                 struct_schema=feature_schema, max_capacity=100)

# コレクションを作成
client.create_collection(
    collection_name="product_features",
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
// 製品特徴スキーマ（Java）
CreateCollectionReq.CollectionSchema productSchema = CreateCollectionReq.CollectionSchema.builder()
        .build();
productSchema.addField(AddFieldReq.builder()
        .fieldName("product_id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
productSchema.addField(AddFieldReq.builder()
        .fieldName("product_name")
        .dataType(DataType.VarChar)
        .maxLength(512)
        .build());
productSchema.addField(AddFieldReq.builder()
        .fieldName("category")
        .dataType(DataType.VarChar)
        .maxLength(512)
        .build());

Map<String, String> mmapParams = new HashMap<>();
mmapParams.put("mmap_enabled", "true");
productSchema.addField(AddFieldReq.builder()
        .fieldName("features")
        .dataType(DataType.Array)
        .elementType(DataType.Struct)
        .maxCapacity(100)
        .addStructField(AddFieldReq.builder()
                .fieldName("feature_name")
                .dataType(DataType.VarChar)
                .maxLength(512)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("feature_value")
                .dataType(DataType.VarChar)
                .maxLength(512)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName("feature_vector")
                .dataType(DataType.FloatVector)
                .dimension(768)
                .typeParams(mmapParams)
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
// 製品特徴スキーマ（JavaScript）
const productSchema = [
  {
    name: "product_id",
    data_type: DataType.INT64,
    is_primary_key: true,
    auto_id: true,
  },
  {
    name: "product_name",
    data_type: DataType.VARCHAR,
    max_length: 512,
  },
  {
    name: "category",
    data_type: DataType.VARCHAR,
    max_length: 512,
  },
  {
    name: "features",
    data_type: DataType.ARRAY,
    element_type: DataType.STRUCT,
    fields: [
      {
        name: "feature_name",
        data_type: DataType.VARCHAR,
        max_length: 512,
      },
      {
        name: "feature_value",
        data_type: DataType.VARCHAR,
        max_length: 512,
      },
      {
        name: "feature_vector",
        data_type: DataType.FLOAT_VECTOR,
        dim: 768,
        mmap_enabled: true,
      },
    ],
    max_capacity: 100,
  },
];

await milvusClient.createCollection({
  collection_name: "product_features",
  fields: productSchema,
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
# 製品特徴スキーマ
SCHEMA='{
  "autoID": true,
  "fields": [
    {
      "fieldName": "product_id",
      "dataType": "Int64",
      "isPrimary": true
    },
    {
      "fieldName": "product_name",
      "dataType": "VarChar",
      "elementTypeParams": {
        "max_length": "512"
      }
    },
    {
      "fieldName": "category",
      "dataType": "VarChar",
      "elementTypeParams": {
        "max_length": "512"
      }
    }
  ],
  "structArrayFields": [
    {
      "name": "features",
      "description": "Product features with names, values, and vectors",
      "fields": [
        {
          "fieldName": "feature_name",
          "dataType": "VarChar",
          "elementTypeParams": {
            "max_length": "512"
          }
        },
        {
          "fieldName": "feature_value",
          "dataType": "VarChar",
          "elementTypeParams": {
            "max_length": "512"
          }
        },
        {
          "fieldName": "feature_vector",
          "dataType": "FloatVector",
          "elementTypeParams": {
            "dim": "768",
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