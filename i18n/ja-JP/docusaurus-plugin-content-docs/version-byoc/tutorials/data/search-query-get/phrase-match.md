---
title: "フレーズ一致 | BYOC"
slug: /phrase-match
sidebar_label: "フレーズ一致"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "フレーズ一致を使用すると、クエリ語句を正確なフレーズとして含むドキュメントを検索できます。デフォルトでは、単語は同じ順序で隣接して出現する必要があります。たとえば、「robotics machine learning」というクエリは、「...typical robotics machine learning models...」のようなテキストに一致します。この場合、「robotics」、「machine」、および「learning」の単語は間に他の単語がない状態で連続して出現します。 | BYOC"
type: origin
token: O2YiwLai5iSjT1k1WEsc06E8nEe
sidebar_position: 11
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - フィルター
  - フィルター式
  - フィルタリング
  - フレーズ一致
  - Zillizベクトルデータベース
  - Zillizデータベース
  - 非構造化データ
  - ベクトルデータベース

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# フレーズ一致

フレーズ一致を使用すると、クエリ語句を正確なフレーズとして含むドキュメントを検索できます。デフォルトでは、単語は同じ順序で隣接して出現する必要があります。たとえば、**"robotics machine learning"** というクエリは、*"…typical robotics machine learning models…"* のようなテキストに一致します。この場合、**"robotics"**、**"machine"**、および**"learning"** の単語は間に他の単語がない状態で連続して出現します。

しかし、現実のシナリオでは、厳密なフレーズ一致は硬すぎる場合があります。*"…machine learning models widely adopted in robotics…"* のようなテキストに一致させたい場合もあります。ここでは同じキーワードが存在しますが、並んでいたり元の順序で出現していたりしていません。これを処理するために、フレーズ一致は `slop` パラメータをサポートしており、これにより柔軟性がもたらされます。`slop` 値は、フレーズ内の各語間で許容される位置のシフト数を定義します。たとえば、`slop` が 1 の場合、**"machine learning"** というクエリは *"...machine deep learning..."* というテキストにも一致します。この例では、1つの単語（**"deep"**）が元の語を分離しています。

## 概要\{#overview}

[Tantivy](https://github.com/quickwit-oss/tantivy)検索エンジンライブラリによって駆動されるフレーズ一致は、ドキュメント内の単語の位置情報を分析することで機能します。以下の図はそのプロセスを示しています。

![AFrdwVT8ChT11ibs9lpcuN7onZc](/img/AFrdwVT8ChT11ibs9lpcuN7onZc.png)

1. **ドキュメントのトークン化**: Zilliz Cloudにドキュメントを挿入する際、テキストはアナライザーを使用してトークン（個々の単語または語句）に分割され、各トークンの位置情報が記録されます。たとえば、**doc_1** は **["machine" (pos=0), "learning" (pos=1), "boosts" (pos=2), "efficiency" (pos=3)]** にトークン化されます。アナライザーの詳細については、[アナライザー概要](./analyzer-overview)を参照してください。

1. **逆インデックスの作成**: Zilliz Cloudは、各トークンが出現するドキュメントとそのドキュメント内での位置情報をマッピングする逆インデックスを構築します。

1. **フレーズ一致**: フレーズクエリが実行されると、Zilliz Cloudは逆インデックスで各トークンを検索し、それらの位置をチェックして正しい順序と近接性で出現しているかどうかを判断します。`slop` パラメータは、一致するトークン間で許容される最大位置数を制御します。

    - **slop = 0** は、トークンが**正確な順序で直ちに隣接して**出現しなければならないことを意味します（つまり、間に余分な単語は存在できません）。

        - 例では、**doc_1**（**"machine"** が **pos=0**、**"learning"** が **pos=1**）のみが正確に一致します。

    - **slop = 2** は、一致するトークン間で最大2つの位置の柔軟性または再配置を許可します。

        - これにより、逆順（**"learning machine"**）やトークン間に小さなギャップがある場合にも一致できます。

        - 結果として、**doc_1**、**doc_2**（**"learning"** が **pos=0**、**"machine"** が **pos=1**）、および **doc_3**（**"learning"** が **pos=1**、**"machine"** が **pos=2**）がすべて一致します。

## フレーズ一致の有効化\{#enable-phrase-match}

フレーズ一致は、Zilliz Cloudの文字列データ型である `VARCHAR` フィールドで動作します。

フレーズ一致を有効にするには、`enable_analyzer` と `enable_match` の両方のパラメータを `True` に設定してコレクションスキーマを構成します。この設定では、テキストをトークン化し、位置情報を含む逆インデックスを構築して、効率的なフレーズ検索を可能にします。

### スキーマフィールドの定義\{#define-schema-fields}

特定の `VARCHAR` フィールドでフレーズ一致を有効にするには、フィールドスキーマを定義する際に `enable_analyzer` と `enable_match` の両方を `True` に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# MilvusClientを設定
CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN
)

# 新しいコレクションのスキーマを作成
schema = client.create_schema(enable_dynamic_field=False)

# プライマリキーのフィールドを追加
schema.add_field(
    field_name="id",
    datatype=DataType.INT64,
    is_primary=True,
    auto_id=True
)

# フレーズ一致用に構成されたVARCHARフィールドを追加
schema.add_field(
    field_name="text",                  # フィールド名
    # highlight-next-line
    datatype=DataType.VARCHAR,          # フィールドデータ型はVARCHAR（文字列）に設定
    max_length=1000,                    # 最大文字列長
    # highlight-start
    enable_analyzer=True,               # 必須。テキスト分析を有効化
    enable_match=True,                  # 必須。フレーズ一致のための逆インデックスを有効化
    # highlight-end
    # オプション: 特定言語でフレーズ一致を改善するためにカスタムアナライザーを使用。
    # analyzer_params = {"type": "english"}     # 例：英語アナライザー；コメントを解除してカスタムアナライザーを適用
)

# 埋め込み用のベクトルフィールドを追加
schema.add_field(
    field_name="embeddings",
    datatype=DataType.FLOAT_VECTOR,
    dim=5
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

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
        .enableMatch(true)
        // オプション: 特定言語でフレーズ一致を改善するためにカスタムアナライザーを使用。
        // .analyzerParams(Map.of("type", "english"))     // 例：英語アナライザー；コメントを解除してカスタムアナライザーを適用
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("embeddings")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// MilvusClientを設定
const address = "YOUR_CLUSTER_ENDPOINT"
const token = "YOUR_CLUSTER_TOKEN"

const client = new MilvusClient({address, token})

const schema = {
  collection_name: 'tech_articles',
  fields: [
    {
      name: "id",
      description: "primary id",
      data_type: DataType.Int64,
      is_primary_key: true,
      autoID: true,
    },
    {
      name: "text",
      description: "text field for phrase matching",
      data_type: DataType.VarChar,
      max_length: 1000,
      enable_analyzer: true, // テキスト分析を有効化
      enable_match: true,    // 
    },
    {
      name: "embeddings",
      description: "vector field",
      data_type: DataType.FloatVector,
      dim: 5,
    },
  ],
};

await client.createCollection(schema);
```

</TabItem>

<TabItem value='go'>

```go
import (
     "github.com/milvus-io/milvus/client/v2/entity"
)

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
APIKey := "YOUR_API_KEY"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey: APIKey
})

schema := entity.NewSchema().WithName(collectionName).
        WithField(entity.NewField().WithName("id").WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
        WithField(entity.NewField().WithName("text").WithDataType(entity.FieldTypeVarChar).WithMaxLength(1000).WithEnableMatch(true).WithEnableAnalyzer(true)).
        WithField(entity.NewField().WithName("embeddings").WithDataType(entity.FieldTypeFloatVector).WithDim(5))
```

</TabItem>

<TabItem value='bash'>

```bash
export idField='{
  "fieldName": "id",
  "dataType": "Int64",
  "isPrimary": true,
  "autoID": true
}'

export textField='{
  "fieldName": "text",
  "dataType": "VarChar",
  "elementTypeParams": {
    "max_length": 1000,
    "enable_analyzer": true,
    "enable_match": true
  }
}'

export vectorField='{
  "fieldName": "embeddings",
  "dataType": "FloatVector",
  "elementTypeParams": {
    "dim": 5
  }
}'

export schema="{
  \"autoID\": false,
  \"enableDynamicField\": true,
  \"fields\": [
    $idField,
    $textField,
    $vectorField
  ]
}"
```

</TabItem>
</Tabs>

デフォルトで、Zilliz Cloudは[standard](./standard-analyzer) [analyzer](./standard-analyzer)を使用し、これは空白文字や句読点でテキストをトークン化し、小文字に変換します。

テキストデータが特定の言語や形式の場合には、`analyzer_params` パラメータを使用してカスタムアナライザーを構成できます（例えば、`{ "type": "english" }`または`{ "type": "jieba" }`）。

詳細については、[アナライザー概要](./analyzer-overview)を参照してください。

### コレクションの作成\{#create-the-collection}

必要なフィールドが定義されたら、以下のコードを使用してコレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# コレクションを作成
COLLECTION_NAME = "tech_articles" # コレクションに名前を付ける

if client.has_collection(COLLECTION_NAME):
    client.drop_collection(COLLECTION_NAME)

client.create_collection(
    collection_name=COLLECTION_NAME,
    schema=schema
)
```

</TabItem>

<TabItem value='java'>

```java
String COLLECTION_NAME = "tech_articles"; // コレクションに名前を付ける

if (client.hasCollection(
        HasCollectionReq.builder()
            .collectionName(COLLECTION_NAME)
            .build()
    )) {
    client.dropCollection(
        DropCollectionReq.builder()
            .collectionName(COLLECTION_NAME)
            .build()
    );
}

client.createCollection(
    CreateCollectionReq.builder()
        .collectionName(COLLECTION_NAME)
        .collectionSchema(schema)
        .build()
);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 既存の場合はコレクションを作成または再作成
const COLLECTION_NAME = "tech_articles"; // コレクションに名前を付ける

const hasCollection = await client.hasCollection({ collection_name: COLLECTION_NAME });

if (hasCollection.value) {
    await client.dropCollection({ collection_name: COLLECTION_NAME });
}

await client.createCollection(schema);
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
# コレクションが存在するか確認
export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export COLLECTION_NAME="tech_articles"
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/has" \
  -H "Content-Type: application/json" \
  -d "{
    \"collectionName\": \"$COLLECTION_NAME\"
  }"

# 既存のコレクションを削除
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/collections/drop" \
  -H "Content-Type: application/json" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\"
  }"

# 新しいコレクションを作成
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Content-Type: application/json" \
--data "{
    \"collectionName\": \"$COLLECTION_NAME\",
    \"schema\": $schema
}"
```

</TabItem>
</Tabs>

コレクションが作成された後、[フレーズ一致の使用](./phrase-match#use-phrase-match)の前に以下の必要な手順が実行されていることを確認してください。

- エンティティがコレクションに挿入されていること。

- 各ベクトルフィールドにインデックスが作成されていること。

- コレクションがメモリにロードされていること。

<details>

<summary>サンプルコードを表示</summary>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# "machine learning" フレーズを含むサンプルデータを挿入
sample_data = [
    {
        "text": "Machine learning is a subset of artificial intelligence that focuses on algorithms.",
        "embeddings": [0.1, 0.2, 0.3, 0.4, 0.5]
    },
    {
        "text": "Deep learning machine algorithms require large datasets for training.",
        "embeddings": [0.2, 0.3, 0.4, 0.5, 0.6]
    },
    {
        "text": "The machine learning model showed excellent performance on the test set.",
        "embeddings": [0.3, 0.4, 0.5, 0.6, 0.7]
    },
    {
        "text": "Natural language processing and machine learning go hand in hand.",
        "embeddings": [0.4, 0.5, 0.6, 0.7, 0.8]
    },
    {
        "text": "This article discusses various learning machine techniques and applications.",
        "embeddings": [0.5, 0.6, 0.7, 0.8, 0.9]
    }
]

# データを挿入
client.insert(
    collection_name=COLLECTION_NAME,
    data=sample_data
)

# ベクトルフィールドにインデックスを貼り、コレクションをロード
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="embeddings",
    index_type="AUTOINDEX",
    index_name="embeddings_index",
    metric_type="COSINE"
)

client.create_index(collection_name=COLLECTION_NAME, index_params=index_params)

client.load_collection(collection_name=COLLECTION_NAME)
```

</TabItem>

<TabItem value='java'>

```java
// "machine learning" フレーズを含むサンプルデータを挿入
List<JsonObject> sampleData = Arrays.asList(
    createSample("Machine learning is a subset of artificial intelligence that focuses on algorithms.", new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f}),
    createSample("Deep learning machine algorithms require large datasets for training.", new float[]{0.2f, 0.3f, 0.4f, 0.5f, 0.6f}),
    createSample("The machine learning model showed excellent performance on the test set.", new float[]{0.3f, 0.4f, 0.5f, 0.6f, 0.7f}),
    createSample("Natural language processing and machine learning go hand in hand.", new float[]{0.4f, 0.5f, 0.6f, 0.7f, 0.8f}),
    createSample("This article discusses various learning machine techniques and applications.", new float[]{0.5f, 0.6f, 0.7f, 0.8f, 0.9f})
);

client.insert(InsertReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(sampleData)
        .build());

// ベクトルフィールドにインデックスを貼り、コレクションをロード
IndexParam indexParam = IndexParam.builder()
        .fieldName("embeddings")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .indexName("embeddings_index")
        .metricType(IndexParam.MetricType.COSINE)
        .build();

client.createIndex(CreateIndexReq.builder()
        .collectionName(COLLECTION_NAME)
        .indexParams(Collections.singletonList(indexParam))
        .build());

client.loadCollection(LoadCollectionReq.builder()
        .collectionName(COLLECTION_NAME)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// "machine learning" フレーズ一致用のサンプルデータをフォーマットおよび挿入
const sampleData = [
    {
        text: "Machine learning is a subset of artificial intelligence that focuses on algorithms.",
        embeddings: [0.1, 0.2, 0.3, 0.4, 0.5],
    },
    {
        text: "Deep learning machine algorithms require large datasets for training.",
        embeddings: [0.2, 0.3, 0.4, 0.5, 0.6],
    },
    {
        text: "The machine learning model showed excellent performance on the test set.",
        embeddings: [0.3, 0.4, 0.5, 0.6, 0.7],
    },
    {
        text: "Natural language processing and machine learning go hand in hand.",
        embeddings: [0.4, 0.5, 0.6, 0.7, 0.8],
    },
    {
        text: "This article discusses various learning machine techniques and applications.",
        embeddings: [0.5, 0.6, 0.7, 0.8, 0.9],
    },
];

// データをコレクションに挿入
await client.insert({
    collection_name: COLLECTION_NAME,
    data: sampleData,
});

// ベクトルフィールドにインデックスを作成し、コレクションをロード
await client.createIndex({
    collection_name: COLLECTION_NAME,
    field_name: "embeddings",
    index_type: "AUTOINDEX",
    index_name: "embeddings_index",
    metric_type: "COSINE",
});

await client.loadCollection({
    collection_name: COLLECTION_NAME,
});
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
# データをコレクションに挿入
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/insert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "tech_articles",
    "data": [
      {
        "text": "Machine learning is a subset of artificial intelligence that focuses on algorithms.",
        "embeddings": [0.1, 0.2, 0.3, 0.4, 0.5]
      },
      {
        "text": "Deep learning machine algorithms require large datasets for training.",
        "embeddings": [0.2, 0.3, 0.4, 0.5, 0.6]
      },
      {
        "text": "The machine learning model showed excellent performance on the test set.",
        "embeddings": [0.3, 0.4, 0.5, 0.6, 0.7]
      },
      {
        "text": "Natural language processing and machine learning go hand in hand.",
        "embeddings": [0.4, 0.5, 0.6, 0.7, 0.8]
      },
      {
        "text": "This article discusses various learning machine techniques and applications.",
        "embeddings": [0.5, 0.6, 0.7, 0.8, 0.9]
      }
    ]
  }'
# ベクトルフィールドにインデックスを作成し、コレクションをロード
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/indexes/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "tech_articles",
    "indexParams": [
      {
        "fieldName": "embeddings",
        "indexName": "embeddings_index",
        "metricType": "COSINE",
        "indexType": "AUTOINDEX"
      }
    ]
  }'

curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/load" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "tech_articles"
  }'
```

</TabItem>
</Tabs>

</details>

## フレーズ一致の使用\{#use-phrase-match}

コレクションスキーマで `VARCHAR` フィールドの一致を有効にすると、`PHRASE_MATCH` 式を使用してフレーズ一致を実行できます。

<Admonition type="info" icon="📘" title="注釈">

<p><code>PHRASE_MATCH</code>式は大文字小文字を区別しません。<code>PHRASE_MATCH</code>または<code>phrase_match</code>のいずれかを使用できます。</p>

</Admonition>

### PHRASE_MATCH式構文\{#phrasematch-expression-syntax}

`PHRASE_MATCH`式を使用して、検索時のフィールド、フレーズ、およびオプションの柔軟性（`slop`）を指定します。構文は以下の通りです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
PHRASE_MATCH(field_name, phrase, slop)
```

</TabItem>

<TabItem value='java'>

```java
PHRASE_MATCH(field_name, phrase, slop)
```

</TabItem>

<TabItem value='javascript'>

```javascript
PHRASE_MATCH(field_name, phrase, slop)
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export filter = "PHRASE_MATCH(field_name, phrase, slop)"
```

</TabItem>
</Tabs>

- `field_name`**:** フレーズ一致を実行する`VARCHAR`フィールドの名前。

- `phrase`**:** 検索する正確なフレーズ。

- `slop`（オプション）**:** 一致するトークンで許容される最大位置数を示す整数。

    - `0`（デフォルト）: 完全一致のみを検索します。例：**"machine learning"** というフィルターは **"machine learning"** にのみ一致し、**"machine boosts learning"** や **"learning machine"** には一致しません。

    - `1`: 1つの余分な語句または位置のわずかなずれを許容します。例：**"machine learning"** というフィルターは **"machine boosts learning"**（**"machine"** と **"learning"** の間に1つのトークンが挟まる）に一致しますが、**"learning machine"**（語が反転）には一致しません。

    - `2`: 逆順の語や最大2つのトークンが間に挟まる場合など、より大きな柔軟性を許容します。例：**"machine learning"** というフィルターは **"learning machine"**（語が反転）または **"machine quickly boosts learning"**（**"machine"** と **"learning"** の間に2つのトークンが挟まる）に一致します。

### フレーズ一致でのクエリ\{#query-with-phrase-match}

`query()` メソッドを使用する際、**PHRASE_MATCH** はスカラー絞り込みとして機能します。指定されたフレーズ（許容されたslop以内）を含むドキュメントのみが返されます。

#### 例：slop = 0（完全一致）\{#example-slop-0-exact-match}

この例では、間に余分なトークンがない **"machine learning"** という正確なフレーズを含むドキュメントを返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 完全一致 "machine learning" を含むドキュメントを一致
filter = "PHRASE_MATCH(text, 'machine learning')"

result = client.query(
    collection_name=COLLECTION_NAME,
    # highlight-next-line
    filter=filter,
    output_fields=["id", "text"]
)

print("Query result: ", result)

# 期待される出力:
# Query result:  data: ["{'id': 461366973343948097, 'text': 'Machine learning is a subset of artificial intelligence that focuses on algorithms.'}", "{'id': 461366973343948099, 'text': 'The machine learning model showed excellent performance on the test set.'}", "{'id': 461366973343948100, 'text': 'Natural language processing and machine learning go hand in hand.'}"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

String filter = "PHRASE_MATCH(text, 'machine learning')";
QueryResp result = client.query(QueryReq.builder()
        .collectionName(COLLECTION_NAME)
        .filter(filter)
        .outputFields(Arrays.asList("id", "text"))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = "PHRASE_MATCH(text, 'machine learning')";

const result = await client.query({
    collection_name: COLLECTION_NAME,
    filter: filter,
    output_fields: ["id", "text"]
});
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "tech_articles",
    "filter": "PHRASE_MATCH(text, '\''machine learning'\'')",
    "outputFields": ["id", "text"],
    "limit": 100
  }'
```

</TabItem>
</Tabs>

### フレーズ一致での検索\{#search-with-phrase-match}

検索操作では、**PHRASE_MATCH** はベクトル類似度ランキングを適用する前にドキュメントを事前フィルタリングするために使用されます。この2段階アプローチは、まずテキスト一致によって候補セットを絞り込み、それからベクトル埋め込みに基づいてそれらの候補を再ランキングします。

#### 例：slop = 1\{#example-slop-1}

ここでは、slop の値を 1 に設定しています。フィルターは、フレーズ **"learning machine"** を少しの柔軟性で含むドキュメントに適用されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 例：slop=1 で "learning machine" を含むドキュメントをフィルター
filter_slop1 = "PHRASE_MATCH(text, 'learning machine', 1)"

result_slop1 = client.search(
    collection_name=COLLECTION_NAME,
    anns_field="embeddings",
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],
    # highlight-next-line
    filter=filter_slop1,
    search_params={},
    limit=10,
    output_fields=["id", "text"]
)

print("Slop 1 result: ", result_slop1)

# 期待される出力:
# Slop 1 r... 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

String filterSlop1 = "PHRASE_MATCH(text, 'learning machine', 1)";
List<Float> queryVector = Arrays.asList(0.1f, 0.2f, 0.3f, 0.4f, 0.5f);

SearchResp resultSlop1 = client.search(SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .annsField("embeddings")
        .data(Collections.singletonList(queryVector))
        .filter(filterSlop1)
        .searchParams(Collections.emptyMap())
        .topK(10)
        .outputFields(Arrays.asList("id", "text"))
        .build());

System.out.println("Slop 1 result: " + resultSlop1);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter_slop1 = "PHRASE_MATCH(text, 'learning machine', 1)";

const result_slop1 = await client.search({
  collection_name: COLLECTION_NAME,
  anns_field: "embeddings",
  data: [0.1, 0.2, 0.3, 0.4, 0.5],
  filter: filter_slop1,
  limit: 10,
  output_fields: ["id", "text"],
});

```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export COLLECTION_NAME="tech_articles"
export AUTH_TOKEN="your_token_here"

# データを検索
echo "Searching with PHRASE_MATCH filter (slop=1)..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"annsField\": \"embeddings\",
    \"data\": [[0.1, 0.2, 0.3, 0.4, 0.5]],
    \"filter\": \"PHRASE_MATCH(text, 'learning machine', 1)\",
    \"searchParams\": {},
    \"limit\": 10,
    \"outputFields\": [\"id\", \"text\"]
  }"
```

</TabItem>
</Tabs>

#### 例：slop = 2\{#example-slop-2}

この例では、slop の値を 2 に設定しています。つまり、**"machine"** と **"learning"** の間にある高々 2 つの余分なトークン（または逆順の語）が許容されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 例：slop=2 で "machine learning" を含むドキュメントをフィルター
filter_slop2 = "PHRASE_MATCH(text, 'machine learning', 2)"

result_slop2 = client.search(
    collection_name=COLLECTION_NAME,
    anns_field="embeddings",             # ベクトルフィールド名
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],                 # クエリベクトル
    # highlight-next-line
    filter=filter_slop2,                 # フィルター式
    search_params={},
    limit=10,                            # 最大結果数
    output_fields=["id", "text"]
)

print("Slop 2 result: ", result_slop2)

# 期待される出力:
# Slop 2 result:  data: [[{'id': 461366973343948097, 'distance': 0.9999999403953552, 'entity': {'text': 'Machine learning is a subset of artificial intelligence that focuses on algorithms.', 'id': 461366973343948097}}, {'id': 461366973343948098, 'distance': 0.9949367046356201, 'entity': {'text': 'Deep learning machine algorithms require large datasets for training.', 'id': 461366973343948098}}, {'id': 461366973343948099, 'distance': 0.9864400029182434, 'entity': {'text': 'The machine learning model showed excellent performance on the test set.', 'id': 461366973343948099}}, {'id': 461366973343948100, 'distance': 0.9782319068908691, 'entity': {'text': 'Natural language processing and machine learning go hand in hand.', 'id': 461366973343948100}}, {'id': 461366973343948101, 'distance': 0.9710607528686523, 'entity': {'text': 'This article discusses various learning machine techniques and applications.', 'id': 461366973343948101}}]]
```

</TabItem>

<TabItem value='java'>

```java
// 例：slop=2 で "machine learning" を含むドキュメントをフィルター
String filterSlop2 = "PHRASE_MATCH(text, 'machine learning', 2)";

SearchReq searchReqSlop2 = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .annsField("embeddings")             // ベクトルフィールド名
        .data(queryVector)                   // クエリベクトル
        // highlight-next-line
        .filter(filterSlop2)                 // フィルター式
        .searchParams(new HashMap<>())
        .topK(10)                            // 最大結果数
        .outputFields(Arrays.asList("id", "text"))
        .build();

SearchResp resultSlop2 = client.search(searchReqSlop2);

System.out.println("Slop 2 result: " + resultSlop2);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter_slop2 = "PHRASE_MATCH(text, 'learning machine', 2)";

const result_slop2 = await client.search({
  collection_name: COLLECTION_NAME,
  anns_field: "embeddings",
  data: [0.1, 0.2, 0.3, 0.4, 0.5],
  filter: filter_slop2,
  limit: 10,
  output_fields: ["id", "text"],
});

```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
#restful
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"annsField\": \"embeddings\",
    \"data\": [[0.1, 0.2, 0.3, 0.4, 0.5]],
    \"filter\": \"PHRASE_MATCH(text, 'machine learning', 2)\",
    \"searchParams\": {},
    \"limit\": 10,
    \"outputFields\": [\"id\", \"text\"]
  }"
```

</TabItem>
</Tabs>

#### 例：slop = 3\{#example-slop-3}

この例では、slop の値を 3 に設定しています。これにより、さらに柔軟性が高まります。フィルターは、**"machine learning"** の間に最大 3 つのトークン位置が許容される状態で検索します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 例：slop=3 で "machine learning" を含むドキュメントをフィルター
filter_slop3 = "PHRASE_MATCH(text, 'machine learning', 3)"

result_slop3 = client.search(
    collection_name=COLLECTION_NAME,
    anns_field="embeddings",             # ベクトルフィールド名
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],                 # クエリベクトル
    # highlight-next-line
    filter=filter_slop3,                 # フィルター式
    search_params={},
    limit=10,                            # 最大結果数
    output_fields=["id", "text"]
)

print("Slop 3 result: ", result_slop3)

# 期待される出力:
# Slop 3 result:  data: [[{'id': 461366973343948097, 'distance': 0.9999999403953552, 'entity': {'text': 'Machine learning is a subset of artificial intelligence that focuses on algorithms.', 'id': 461366973343948097}}, {'id': 461366973343948098, 'distance': 0.9949367046356201, 'entity': {'text': 'Deep learning machine algorithms require large datasets for training.', 'id': 461366973343948098}}, {'id': 461366973343948099, 'distance': 0.9864400029182434, 'entity': {'text': 'The machine learning model showed excellent performance on the test set.', 'id': 461366973343948099}}, {'id': 461366973343948100, 'distance': 0.9782319068908691, 'entity': {'text': 'Natural language processing and machine learning go hand in hand.', 'id': 461366973343948100}}, {'id': 461366973343948101, 'distance': 0.9710607528686523, 'entity': {'text': 'This article discusses various learning machine techniques and applications.', 'id': 461366973343948101}}]]
```

</TabItem>

<TabItem value='java'>

```java
// 例：slop=3 で "machine learning" を含むドキュメントをフィルター
String filterSlop3 = String.format("PHRASE_MATCH(text, '%s', %d)", "machine learning", 3);

SearchResp resultSlop3 = client.search(
    SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .annsField("embeddings") // ベクトルフィールド名
        .data(queryVector)       // クエリベクトル
        .filter(filterSlop3)     // フィルター式
        .searchParams(new HashMap<>())
        .topK(10)                // 最大結果数
        .outputFields(Arrays.asList("id", "text"))
        .build()
);

System.out.printf("Slop 3 result: %s%n", resultSlop3);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter_slop3 = "PHRASE_MATCH(text, 'learning machine', 3)";

const result_slop3 = await client.search({
  collection_name: COLLECTION_NAME,
  anns_field: "embeddings",
  data: [0.1, 0.2, 0.3, 0.4, 0.5],
  filter: filter_slop3,
  limit: 10,
  output_fields: ["id", "text"],
});
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"annsField\": \"embeddings\",
    \"data\": [[0.1, 0.2, 0.3, 0.4, 0.5]],
    \"filter\": \"PHRASE_MATCH(text, 'machine learning', 3)\",
    \"searchParams\": {},
    \"limit\": 10,
    \"outputFields\": [\"id\", \"text\"]
  }"
```

</TabItem>
</Tabs>

## 考慮事項\{#considerations}

- フィールドでフレーズ一致を有効にすると、逆インデックスの作成がトリガーされ、ストレージリソースを消費します。テキストサイズ、一意のトークン、および使用されるアナライザーに基づいて、ストレージへの影響を考慮する必要があります。

- アナライザーをスキーマで定義すると、その設定はそのコレクションに対して永続化されます。別のアナライザーがニーズにより適していると判断した場合、既存のコレクションを削除し、目的のアナライザー構成を持つ新しいコレクションを作成することを検討できます。

- フレーズ一致のパフォーマンスは、テキストがどのようにトークン化されるかに依存します。アナライザーをコレクション全体に適用する前に、`run_analyzer` メソッドを使用してトークン化出力を確認してください。詳細については、[アナライザー概要](./analyzer-overview)を参照してください。

- `filter` 式内のエスケープルール：

    - 式内で二重引用符または一重引用符で囲まれた文字は、文字列定数として解釈されます。文字列定数にエスケープ文字が含まれている場合、エスケープ文字はエスケープシーケンスで表す必要があります。たとえば、`\` を表すには `\\`、タブ `\t` を表すには `\\t`、改行を表すには `\\n` を使用します。

    - 文字列定数が一重引用符で囲まれている場合、定数内の一重引用符は `\\'` で表される必要があります。一方、二重引用符は `"` または `\\"` のいずれかで表すことができます。例：`'It\\'s milvus'`。

    - 文字列定数が二重引用符で囲まれている場合、定数内の二重引用符は `\\"` で表される必要があります。一方、一重引用符は `'` または `\\'` のいずれかで表すことができます。例：`"He said \\"Hi\\"" `。