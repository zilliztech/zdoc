---
title: "フレーズマッチ | Cloud"
slug: /phrase-match
sidebar_label: "フレーズマッチ"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "フレーズマッチを使用すると、クエリ用語を正確なフレーズとして含むドキュメントを検索できます。デフォルトでは、単語は同じ順序で互いに直接隣接して表示される必要があります。たとえば、**「robotics machine learning」**のクエリは、**「robotics」**、**「machine」**、および**「learning」**の単語が間に他の単語なしで連続して表示される**「…typical robotics machine learning models…」**のようなテキストに一致します。 | Cloud"
type: origin
token: O2YiwLai5iSjT1k1WEsc06E8nEe
sidebar_position: 11
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - filter
  - filtering expressions
  - filtering
  - phrase-match
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# フレーズマッチ

フレーズマッチを使用すると、クエリ用語を正確なフレーズとして含むドキュメントを検索できます。デフォルトでは、単語は同じ順序で互いに直接隣接して表示される必要があります。たとえば、**「robotics machine learning」**のクエリは、**「robotics」**、**「machine」**、および**「learning」**の単語が間に他の単語なしで連続して表示される**「…typical robotics machine learning models…」**のようなテキストに一致します。

ただし、実際のシナリオでは、厳密なフレーズマッチは柔軟性に欠けることがあります。**「…machine learning models widely adopted in robotics…」**のようなテキストに一致させたい場合があります。ここでは同じキーワードが存在しますが、並び順が同じでも隣接していないか、元の順序とは異なります。これを処理するために、フレーズマッチは`スロップ`パラメータをサポートしており、フレックス性を導入します。`スロップ`値は、フレーズ内の語間で許容される位置シフトの数を定義します。たとえば、`スロップ`が1の場合、**「machine learning」**のクエリは**「...machine deep learning...」**のようなテキストに一致し、元の語間に1つの単語（**「deep」**）が含まれます。

## 概要\{#overview}

[Tantivy](https://github.com/quickwit-oss/tantivy)検索エンジンライブラリによって駆動されるフレーズマッチは、ドキュメント内の単語の位置情報を分析することによって機能します。以下の図はそのプロセスを示しています：

![AFrdwVT8ChT11ibs9lpcuN7onZc](/img/AFrdwVT8ChT11ibs9lpcuN7onZc.png)

1. **ドキュメントのトークン化**：ドキュメントをZilliz Cloudに挿入すると、テキストはアナライザーを使用してトークン（個別の単語または用語）に分割され、各トークンの位置情報が記録されます。たとえば、**doc_1**は**["machine" (pos=0), "learning" (pos=1), "boosts" (pos=2), "efficiency" (pos=3)]**にトークン化されます。アナライザーの詳細については、[アナライザーの概要](./analyzer-overview)を参照してください。

1. **逆インデックスの作成**：Zilliz Cloudは逆インデックスを構築し、各トークンをそれが出現するドキュメントとそのドキュメント内のトークン位置にマッピングします。

1. **フレーズマッチング**：フレーズクエリが実行されると、Zilliz Cloudは逆インデックスで各トークンを検索し、正しい順序で近接して表示されているかどうかを判断するためにその位置をチェックします。`スロップ`パラメータは、一致するトークン間で許容される最大位置数を制御します：

    - **スロップ = 0** は、トークンが**正確な順序で直ちに隣接している**必要があることを意味します（つまり、間に余分な単語がありません）。

        - 例では、**doc_1**（**"machine"** が **pos=0**、**"learning"**が **pos=1**）のみが正確に一致します。

    - **スロップ = 2** は、一致するトークン間に最大2つの位置の柔軟性または並べ替えを許可します。

        - これにより、逆順（**"learning machine"**）またはトークン間に小さなギャップがある場合が可能になります。

        - 結果として、**doc_1**、**doc_2**（**"learning"** が **pos=0**、**"machine"**が **pos=1**）、および **doc_3**（**"learning"** が **pos=1**、**"machine"**が **pos=2**）がすべて一致します。

## フレーズマッチの有効化\{#enable-phrase-match}

フレーズマッチはZilliz Cloudの文字列データ型である`VARCHAR`フィールドで動作します。

フレーズマッチを有効にするには、`enable_analyzer`および`enable_match`パラメータの両方を`True`に設定してコレクションスキーマを構成します。この構成により、テキストがトークン化され、位置情報を含む逆インデックスが作成され、効率的なフレーズ検索が可能になります。

### スキーマフィールドの定義\{#define-schema-fields}

特定の`VARCHAR`フィールドでフレーズマッチを有効にするには、フィールドスキーマを定義する際に`enable_analyzer`および`enable_match`の両方を`True`に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# MilvusClientをセットアップ
CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN
)

# 新しいコレクションのスキーマを作成
schema = client.create_schema(enable_dynamic_field=False)

# 主キーフィールドを追加
schema.add_field(
    field_name="id",
    datatype=DataType.INT64,
    is_primary=True,
    auto_id=True
)

# フレーズマッチ用に設定されたVARCHARフィールドを追加
schema.add_field(
    field_name="text",                  # フィールド名
    # highlight-next-line
    datatype=DataType.VARCHAR,          # フィールドデータ型をVARCHAR（文字列）に設定
    max_length=1000,                    # 最大文字列長
    # highlight-start
    enable_analyzer=True,               # 必須。テキスト分析を有効にします
    enable_match=True,                  # 必須。フレーズマッチング用の逆インデックス作成を有効にします
    # highlight-end
    # 任意：特定の言語でフレーズマッチングを改善するためにカスタムアナライザーを使用します。
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
        // 任意：特定の言語でのフレーズマッチングを改善するためにカスタムアナライザーを使用します。
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
// MilvusClientをセットアップ
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
      description: "フレーズマッチング用のテキストフィールド",
      data_type: DataType.VarChar,
      max_length: 1000,
      enable_analyzer: true, // テキスト分析を有効にします
      enable_match: true,    // 逆インデックス作成を有効にします
    },
    {
      name: "embeddings",
      description: "ベクトルフィールド",
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

デフォルトでは、Zilliz Cloudは[標準](./standard-analyzer) [アナライザー](./standard-analyzer)を使用します。これは、空白と句読点でテキストをトークン化し、テキストを小文字に変換します。

テキストデータが特定の言語または形式の場合は、`analyzer_params`パラメータを使用してカスタムアナライザーを構成できます（例：`{ "type": "english" }`または`{ "type": "jieba" }`）。

詳細は[アナライザーの概要](./analyzer-overview)を参照してください。

### コレクションの作成\{#create-the-collection}

必要なフィールドが定義されたら、以下のコードを使用してコレクションを作成します：

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
# コレクションの存在を確認
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

コレクションが作成された後、[フレーズマッチの使用](./phrase-match#use-phrase-match)の前に以下の必要な手順を確実に実行してください：

- エンティティをコレクションに挿入します。

- 各ベクトルフィールドにインデックスを作成します。

- コレクションをメモリにロードします。

<details>

<summary>サンプルコードを表示</summary>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# "machine learning"フレーズを含むサンプルデータを挿入
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

# ベクトルフィールドにインデックスを作成し、コレクションをロード
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
// "machine learning"フレーズを含むサンプルデータを挿入
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

// ベクトルフィールドにインデックスを作成し、コレクションをロード
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
// "machine learning"フレーズマッチング用にサンプルデータをフォーマットおよび挿入
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

// コレクションにデータを挿入
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

## フレーズマッチの使用\{#use-phrase-match}

コレクションスキーマで`VARCHAR`フィールドのマッチを有効にすると、`PHRASE_MATCH`式を使用してフレーズマッチを実行できます。

<Admonition type="info" icon="📘" title="ノート">

<p><code>PHRASE_MATCH</code>式は大文字小文字を区別しません。<code>PHRASE_MATCH</code>または<code>phrase_match</code>を使用できます。</p>

</Admonition>

### PHRASE_MATCH式の構文\{#phrasematch-expression-syntax}

`PHRASE_MATCH`式を使用して、検索時のフィールド、フレーズ、およびオプショナルな柔軟性（`スロップ`）を指定します。構文は以下の通りです：

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

- `field_name`**：** フレーズマッチを実行する`VARCHAR`フィールドの名前。

- `phrase`**：** 検索する正確なフレーズ。

- `slop`（オプショナル）**：** 一致するトークン間に許容される最大位置数を指定する整数。

    - `0`（デフォルト）：正確なフレーズのみに一致します。例：**"machine learning"**のフィルターは**"machine learning"**に正確に一致しますが、**"machine boosts learning"**または**"learning machine"**には一致しません。

    - `1`：余分な用語または位置の微小なシフトなどの軽微な変動を許可します。例：**"machine learning"**のフィルターは**"machine boosts learning"**（**"machine"**と**"learning"**の間に1つのトークン）には一致しますが、**"learning machine"**（用語が逆）には一致しません。

    - `2`：逆順の用語順序または間に最大2つのトークンがある場合など、より柔軟性を許可します。例：**"machine learning"**のフィルターは**"learning machine"**（用語が逆）または**"machine quickly boosts learning"**（**"machine"**と**"learning"**の間に2つのトークン）に一致します。

### フレーズマッチでのクエリ\{#query-with-phrase-match}

`query()`メソッドを使用する場合、**PHRASE_MATCH**はスカラーフィルターとして機能します。指定されたフレーズ（許容されるスロップを含む）を含むドキュメントのみが返されます。

#### 例：スロップ = 0（正確一致）\{#example-slop-0-exact-match}

この例では、間に余分なトークンがない正確なフレーズ**"machine learning"**を含むドキュメントを返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# "machine learning"を正確に含むドキュメントに一致
filter = "PHRASE_MATCH(text, 'machine learning')"

result = client.query(
    collection_name=COLLECTION_NAME,
    # highlight-next-line
    filter=filter,
    output_fields=["id", "text"]
)

print("クエリ結果: ", result)

# 期待される出力:
# クエリ結果:  data: ["{'id': 461366973343948097, 'text': 'Machine learning is a subset of artificial intelligence that focuses on algorithms.'}", "{'id': 461366973343948099, 'text': 'The machine learning model showed excellent performance on the test set.'}", "{'id': 461366973343948100, 'text': 'Natural language processing and machine learning go hand in hand.'}"]
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

### フレーズマッチでの検索\{#search-with-phrase-match}

検索操作では、**PHRASE_MATCH**を使用してベクトル類似度ランキングを適用する前にドキュメントを事前フィルタリングします。この2段階アプローチは、まずテキストマッチングで候補セットを絞り込み、その後ベクトル埋め込みに基づいてそれらの候補を再ランク付けします。

#### 例：スロップ = 1\{#example-slop-1}

ここでは、スロップ1を許可します。フィルターは、少しの柔軟性があるフレーズ**"learning machine"**を含むドキュメントに適用されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 例: スロップ1で"learning machine"を含むドキュメントをフィルター
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

print("スロップ1の結果: ", result_slop1)

# 期待される出力:
# スロップ1の結果:  data: [[{'id': 461366973343948097, 'distance': 0.9999999403953552, 'entity': {'text': 'Machine learning is a subset of artificial intelligence that focuses on algorithms.', 'id': 461366973343948097}}, {'id': 461366973343948098, 'distance': 0.9949367046356201, 'entity': {'text': 'Deep learning machine algorithms require large datasets for training.', 'id': 461366973343948098}}, {'id': 461366973343948099, 'distance': 0.9864400029182434, 'entity': {'text': 'The machine learning model showed excellent performance on the test set.', 'id': 461366973343948099}}, {'id': 461366973343948100, 'distance': 0.9782319068908691, 'entity': {'text': 'Natural language processing and machine learning go hand in hand.', 'id': 461366973343948100}}, {'id': 461366973343948101, 'distance': 0.9710607528686523, 'entity': {'text': 'This article discusses various learning machine techniques and applications.', 'id': 461366973343948101}}]]
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

System.out.println("スロップ1の結果: " + resultSlop1);
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
echo "PHRASE_MATCHフィルター（slop=1）で検索しています..."
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

#### 例：スロップ = 2\{#example-slop-2}

この例では、スロップ2を許可しており、**"machine"**と**"learning"**の単語間で最大2つの余分なトークン（または逆の用語）が許可されていることを意味します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 例: スロップ2で"machine learning"を含むドキュメントをフィルター
filter_slop2 = "PHRASE_MATCH(text, 'machine learning', 2)"

result_slop2 = client.search(
    collection_name=COLLECTION_NAME,
    anns_field="embeddings",             # ベクトルフィールド名
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],                 # クエリベクトル
    # highlight-next-line
    filter=filter_slop2,                 # フィルター式
    search_params={},
    limit=10,                            # 返される最大結果数
    output_fields=["id", "text"]
)

print("スロップ2の結果: ", result_slop2)

# 期待される出力:
# スロップ2の結果:  data: [[{'id': 461366973343948097, 'distance': 0.9999999403953552, 'entity': {'text': 'Machine learning is a subset of artificial intelligence that focuses on algorithms.', 'id': 461366973343948097}}, {'id': 461366973343948098, 'distance': 0.9949367046356201, 'entity': {'text': 'Deep learning machine algorithms require large datasets for training.', 'id': 461366973343948098}}, {'id': 461366973343948099, 'distance': 0.9864400029182434, 'entity': {'text': 'The machine learning model showed excellent performance on the test set.', 'id': 461366973343948099}}, {'id': 461366973343948100, 'distance': 0.9782319068908691, 'entity': {'text': 'Natural language processing and machine learning go hand in hand.', 'id': 461366973343948100}}, {'id': 461366973343948101, 'distance': 0.9710607528686523, 'entity': {'text': 'This article discusses various learning machine techniques and applications.', 'id': 461366973343948101}}]]
```

</TabItem>

<TabItem value='java'>

```java
// 例: スロップ2で"machine learning"を含むドキュメントをフィルター
String filterSlop2 = "PHRASE_MATCH(text, 'machine learning', 2)";

SearchReq searchReqSlop2 = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .annsField("embeddings")             // ベクトルフィールド名
        .data(queryVector)                   // クエリベクトル
        // highlight-next-line
        .filter(filterSlop2)                 // フィルター式
        .searchParams(new HashMap<>())
        .topK(10)                            // 返される最大結果数
        .outputFields(Arrays.asList("id", "text"))
        .build();

SearchResp resultSlop2 = client.search(searchReqSlop2);

System.out.println("スロップ2の結果: " + resultSlop2);
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

#### 例：スロップ = 3\{#example-slop-3}

この例では、スロップ3により柔軟性がさらに高まります。フィルターは、単語間に最大3つのトークン位置が許容される**"machine learning"**を検索します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 例: スロップ3で"machine learning"を含むドキュメントをフィルター
filter_slop3 = "PHRASE_MATCH(text, 'machine learning', 3)"

result_slop3 = client.search(
    collection_name=COLLECTION_NAME,
    anns_field="embeddings",             # ベクトルフィールド名
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],                 # クエリベクトル
    # highlight-next-line
    filter=filter_slop3,                 # フィルター式
    search_params={},
    limit=10,                            # 返される最大結果数
    output_fields=["id", "text"]
)

print("スロップ3の結果: ", result_slop3)

# 期待される出力:
# スロップ3の結果:  data: [[{'id': 461366973343948097, 'distance': 0.9999999403953552, 'entity': {'text': 'Machine learning is a subset of artificial intelligence that focuses on algorithms.', 'id': 461366973343948097}}, {'id': 461366973343948098, 'distance': 0.9949367046356201, 'entity': {'text': 'Deep learning machine algorithms require large datasets for training.', 'id': 461366973343948098}}, {'id': 461366973343948099, 'distance': 0.9864400029182434, 'entity': {'text': 'The machine learning model showed excellent performance on the test set.', 'id': 461366973343948099}}, {'id': 461366973343948100, 'distance': 0.9782319068908691, 'entity': {'text': 'Natural language processing and machine learning go hand in hand.', 'id': 461366973343948100}}, {'id': 461366973343948101, 'distance': 0.9710607528686523, 'entity': {'text': 'This article discusses various learning machine techniques and applications.', 'id': 461366973343948101}}]]
```

</TabItem>

<TabItem value='java'>

```java
// 例：スロップ3で"machine learning"を含むドキュメントをフィルター
String filterSlop3 = String.format("PHRASE_MATCH(text, '%s', %d)", "machine learning", 3);

SearchResp resultSlop3 = client.search(
    SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .annsField("embeddings") // ベクトルフィールド名
        .data(queryVector)       // クエリベクトル
        .filter(filterSlop3)     // フィルター式
        .searchParams(new HashMap<>())
        .topK(10)                // 返される最大結果数
        .outputFields(Arrays.asList("id", "text"))
        .build()
);

System.out.printf("スロップ3の結果: %s%n", resultSlop3);
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

- フィールドのフレーズマッチを有効にすると、逆インデックスの作成がトリガーされ、ストレージリソースが消費されます。この機能を有効にする際には、テキストサイズ、一意のトークン、および使用されるアナライザーに基づいてストレージへの影響を考慮してください。

- スキーマでアナライザーを定義すると、その設定はそのコレクションでは永久になります。異なるアナライザーがニーズにより適していると判断した場合は、既存のコレクションを削除し、目的のアナライザー構成で新しいものを作成することを検討してください。

- フレーズマッチのパフォーマンスは、テキストがどのようにトークン化されるかに依存します。アナライザーをコレクション全体に適用する前に、`run_analyzer`メソッドを使用してトークン化出力を確認してください。詳細については、[アナライザーの概要](./analyzer-overview)を参照してください。

- `filter`式のエスケープルール：

    - 式内で二重引用符または単一引用符で囲まれた文字は文字列定数として解釈されます。文字列定数にエスケープ文字が含まれている場合、エスケープ文字はエスケープシーケンスで表す必要があります。たとえば、`\`を表すには`\\`、タブ`\t`を表すには`\\t`、改行を表すには`\\n`を使用します。

    - 文字列定数が単一引用符で囲まれている場合、定数内の単一引用符は`\\'`として表されなければならず、二重引用符は`"`または`\\"`のいずれかとして表すことができます。例：`'It\\'s milvus'`。

    - 文字列定数が二重引用符で囲まれている場合、定数内の二重引用符は`\\"`として表されなければならず、単一引用符は`'`または`\\'`のいずれかとして表すことができます。例：`"He said \\"Hi\\""`。