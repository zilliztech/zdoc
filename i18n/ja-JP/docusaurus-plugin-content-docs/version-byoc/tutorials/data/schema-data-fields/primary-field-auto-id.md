---
title: "プライマリフィールド & AutoID | BYOC"
slug: /primary-field-auto-id
sidebar_label: "プライマリフィールド & AutoID"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudのすべてのコレクションには、各エンティティを一意に識別するためのプライマリフィールドが必要です。このフィールドにより、すべてのエンティティが曖昧性なく挿入、更新、クエリ、削除できます。 | BYOC"
type: origin
token: D2ctwKZhNilLY0ke1vpcHL62n5G
sidebar_position: 2
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - primary field
  - autoId
  - autoid
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# プライマリフィールド & AutoID

Zilliz Cloudのすべてのコレクションには、各エンティティを一意に識別するためのプライマリフィールドが必要です。このフィールドにより、すべてのエンティティが曖昧性なく挿入、更新、クエリ、削除できます。

使用ケースに応じて、Zilliz CloudがIDを自動生成する（AutoID）か、自分でIDを手動で割り当てるかを選択できます。

## プライマリフィールドとは？\{#what-is-a-primary-field}

プライマリフィールドは、コレクション内の各エンティティの一意のキーとして機能し、従来のデータベースのプライマリキーに似ています。Zilliz Cloudは、挿入、アップサート、削除、クエリ操作中にエンティティを管理するためにプライマリフィールドを使用します。

主要な要件:

- 各コレクションには**正確に1つの**プライマリフィールドが必要です。

- プライマリフィールドの値はnullにできません。

- データ型は作成時に指定され、後で変更することはできません。

## サポートされているデータ型\{#supported-data-types}

プライマリフィールドは、エンティティを一意に識別できるサポートされているスカラーデータ型を使用する必要があります。

<table>
   <tr>
     <th><p>データ型</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>INT64</code></p></td>
     <td><p>64ビット整数型。通常AutoIDで使用されます。これはほとんどの使用ケースにおすすめのオプションです。</p></td>
   </tr>
   <tr>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>可変長文字列型。エンティティ識別子が外部システム（たとえば、商品コードやユーザーID）から来る場合に使用します。<code>max_length</code>プロパティが必要で、値ごとに許可される最大バイト数を定義します。</p></td>
   </tr>
</table>

## AutoIDと手動IDの選択\{#choose-between-autoid-and-manual-ids}

Zilliz Cloudは、プライマリキー値の割り当てに2つのモードをサポートしています。

<table>
   <tr>
     <th><p>モード</p></th>
     <th><p>説明</p></th>
     <th><p>推奨対象</p></th>
   </tr>
   <tr>
     <td><p>AutoID</p></td>
     <td><p>Zilliz Cloudが挿入またはインポートされたエンティティに一意の識別子を自動生成します。</p></td>
     <td><p>IDを手動で管理する必要がないほとんどのシナリオ。</p></td>
   </tr>
   <tr>
     <td><p>手動ID</p></td>
     <td><p>データを挿入またはインポートする際に自分で一意のIDを提供します。</p></td>
     <td><p>外部システムや既存のデータセットとIDを合わせる必要がある場合。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="注釈">

<p>どのモードを選択するかわからない場合は、<a href="./primary-field-auto-id#quickstart-use-autoid">AutoIDで始めることをおすすめします</a>。これにより、より簡単なデータインジェストと一意性の保証を実現できます。</p>

</Admonition>

## クイックスタート: AutoIDの使用\{#quickstart-use-autoid}

Zilliz CloudにID生成を自動で任せることができます。

### ステップ1: AutoID付きコレクションの作成\{#step-1-create-a-collection-with-autoid}

プライマリフィールド定義で`auto_id=True`を有効にします。Zilliz CloudがID生成を自動で処理します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema()

# AutoID有効化されたプライマリフィールドを定義
# highlight-start
schema.add_field(
    field_name="id", # プライマリフィールド名
    is_primary=True,
    auto_id=True,  # MilvusがIDを自動生成; デフォルトはFalse
    datatype=DataType.INT64
)
# highlight-end

# 他のフィールドを定義
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=4) # ベクトルフィールド
schema.add_field(field_name="category", datatype=DataType.VARCHAR, max_length=1000) # VARCHAR型のスカラーフィールド

# コレクションを作成
if client.has_collection("demo_autoid"):
    client.drop_collection("demo_autoid")
client.create_collection(collection_name="demo_autoid", schema=schema)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

CreateCollectionReq.CollectionSchema collectionSchema = CreateCollectionReq.CollectionSchema.builder()
        .build();
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(4)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("category")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .build());

client.dropCollection(DropCollectionReq.builder()
        .collectionName("demo_autoid")
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("demo_autoid")
        .collectionSchema(collectionSchema)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
});

// スキーマフィールドを定義
const schema = [
  {
    name: "id",
    description: "プライマリフィールド",
    data_type: DataType.Int64,
    is_primary_key: true,
    autoID: true, // MilvusがIDを自動生成
  },
  {
    name: "embedding",
    description: "ベクトルフィールド",
    data_type: DataType.FloatVector,
    dim: 4,
  },
  {
    name: "category",
    description: "スカラーフィールド",
    data_type: DataType.VarChar,
    max_length: 1000,
  },
];

// コレクションを作成
await client.createCollection({
  collection_name: "demo_autoid",
  fields: schema,
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
export SCHEMA='{
    "autoID": true,
    "fields": [
        {
            "fieldName": "id",
            "dataType": "Int64",
            "isPrimary": true,
            "elementTypeParams": {}
        },
        {
            "fieldName": "embedding",
            "dataType": "FloatVector",
            "isPrimary": false,
            "elementTypeParams": {
                "dim": "4"
            }
        },
        {
            "fieldName": "category",
            "dataType": "VarChar",
            "isPrimary": false,
            "elementTypeParams": {
                "max_length": "1000"
            }
        }
    ]
}'

curl -X POST 'YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create' \
-H 'Content-Type: application/json' \
-d "{
    \"collectionName\": \"demo_autoid\",
    \"schema\": $SCHEMA
}"
```

</TabItem>
</Tabs>

### ステップ2: データ挿入\{#step-2-insert-data}

**重要:** プライマリフィールド列をデータに含めないでください。Zilliz CloudがIDを自動生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {"embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
]

res = client.insert(collection_name="demo_autoid", data=data)
print("生成されたID:", res.get("ids"))

# 出力例:
# 生成されたID: [461526052788333649, 461526052788333650]
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.*;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

List<JsonObject> rows = new ArrayList<>();
Gson gson = new Gson();
JsonObject row1 = new JsonObject();
row1.add("embedding", gson.toJsonTree(new float[]{0.1f, 0.2f, 0.3f, 0.4f}));
row1.addProperty("category", "book");
rows.add(row1);

JsonObject row2 = new JsonObject();
row2.add("embedding", gson.toJsonTree(new float[]{0.2f, 0.3f, 0.4f, 0.5f}));
row2.addProperty("category", "toy");
rows.add(row2);

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("demo_autoid")
        .data(rows)
        .build());
System.out.printf("生成されたID: %s\n", insertR.getPrimaryKeys());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const data = [
    {"embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
];

const res = await client.insert({
    collection_name: "demo_autoid",
    fields_data: data,
});

console.log(res);
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
export INSERT_DATA='[
    {
        "embedding": [0.1, 0.2, 0.3, 0.4],
        "category": "book"
    },
    {
        "embedding": [0.2, 0.3, 0.4, 0.5],
        "category": "toy"
    }
]'

curl -X POST 'YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/insert' \
-H 'Content-Type: application/json' \
-d "{
    \"collectionName\": \"demo_autoid\",
    \"data\": $INSERT_DATA
}"
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="注釈">

<p>既存のエンティティで作業する際は、重複IDエラーを避けるために<code>insert()</code>の代わりに<code>upsert()</code>を使用してください。</p>

</Admonition>

## 手動IDの使用\{#use-manual-ids}

IDを手動で制御する必要がある場合は、AutoIDを無効にして、自分で値を提供します。

### ステップ1: AutoIDなしコレクションの作成\{#step-1-create-a-collection-without-autoid}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema()

# AutoIDなしでプライマリフィールドを定義
# highlight-start
schema.add_field(
    field_name="product_id",
    is_primary=True,
    auto_id=False,  # データインジェスト時にIDを手動で提供
    datatype=DataType.VARCHAR,
    max_length=100 # datatypeがVARCHARの場合に必要
)
# highlight-end

# 他のフィールドを定義
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=4) # ベクトルフィールド
schema.add_field(field_name="category", datatype=DataType.VARCHAR, max_length=1000) # VARCHAR型のスカラーフィールド

# コレクションを作成
if client.has_collection("demo_manual_ids"):
    client.drop_collection("demo_manual_ids")
client.create_collection(collection_name="demo_manual_ids", schema=schema)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.DropCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

CreateCollectionReq.CollectionSchema collectionSchema = CreateCollectionReq.CollectionSchema.builder()
        .build();
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("product_id")
        .dataType(DataType.VarChar)
        .isPrimaryKey(true)
        .autoID(false)
        .maxLength(100)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(4)
        .build());
collectionSchema.addField(AddFieldReq.builder()
        .fieldName("category")
        .dataType(DataType.VarChar)
        .maxLength(1000)
        .build());

client.dropCollection(DropCollectionReq.builder()
        .collectionName("demo_manual_ids")
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("demo_manual_ids")
        .collectionSchema(collectionSchema)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript

import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  username: "username",
  password: "Aa12345!!",
});

const schema = [
  {
    name: "product_id",
    data_type: DataType.VARCHAR,
    is_primary_key: true,
    autoID: false,
  },
  {
    name: "embedding",
    data_type: DataType.FLOAT_VECTOR,
    dim: 4,
  },
  {
    name: "category",
    data_type: DataType.VARCHAR,
    max_length: 1000,
  },
];

const res = await client.createCollection({
  collection_name: "demo_autoid",
  schema: schema,
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
export SCHEMA='{
    "autoID": false,
    "fields": [
        {
            "fieldName": "product_id",
            "dataType": "VarChar",
            "isPrimary": true,
            "elementTypeParams": {
                "max_length": "100"
            }
        },
        {
            "fieldName": "embedding",
            "dataType": "FloatVector",
            "isPrimary": false,
            "elementTypeParams": {
                "dim": "4"
            }
        },
        {
            "fieldName": "category",
            "dataType": "VarChar",
            "isPrimary": false,
            "elementTypeParams": {
                "max_length": "1000"
            }
        }
    ]
}'

curl -X POST 'YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/create' \
-H 'Content-Type: application/json' \
-d "{
    \"collectionName\": \"demo_manual_ids\",
    \"schema\": $SCHEMA
}"
```

</TabItem>
</Tabs>

### ステップ2: ID付きデータの挿入\{#step-2-insert-data-with-your-ids}

すべての挿入操作でプライマリフィールド列を含める必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 各エンティティはプライマリフィールド`product_id`を含む必要があります
data = [
    {"product_id": "PROD-001", "embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"product_id": "PROD-002", "embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
]

res = client.insert(collection_name="demo_manual_ids", data=data)
print("生成されたID:", res.get("ids"))

# 出力例:
# 生成されたID: ['PROD-001', 'PROD-002']
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.*;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

List<JsonObject> rows = new ArrayList<>();
Gson gson = new Gson();
JsonObject row1 = new JsonObject();
row1.addProperty("product_id", "PROD-001");
row1.add("embedding", gson.toJsonTree(new float[]{0.1f, 0.2f, 0.3f, 0.4f}));
row1.addProperty("category", "book");
rows.add(row1);

JsonObject row2 = new JsonObject();
row2.addProperty("product_id", "PROD-002");
row2.add("embedding", gson.toJsonTree(new float[]{0.2f, 0.3f, 0.4f, 0.5f}));
row2.addProperty("category", "toy");
rows.add(row2);

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("demo_manual_ids")
        .data(rows)
        .build());
System.out.printf("生成されたID: %s\n", insertR.getPrimaryKeys());
```

</TabItem>

<TabItem value='javascript'>

```javascript

const data = [
    {"product_id": "PROD-001", "embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"product_id": "PROD-002", "embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
];

const insert = await client.insert({
    collection_name: "demo_autoid",
    fields_data: data,
});

console.log(insert);
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
export INSERT_DATA='[
    {
        "product_id": "PROD-001",
        "embedding": [0.1, 0.2, 0.3, 0.4],
        "category": "book"
    },
    {
        "product_id": "PROD-002",
        "embedding": [0.2, 0.3, 0.4, 0.5],
        "category": "toy"
    }
]'

# データ挿入
curl -X POST 'YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/insert' \
-H 'Content-Type: application/json' \
-d "{
    \"collectionName\": \"demo_manual_ids\",
    \"data\": $INSERT_DATA
}"
```

</TabItem>
</Tabs>

あなたの責任:

- すべてのIDがすべてのエンティティ間で一意であることを保証すること

- すべての挿入/インポート操作にプライマリフィールドを含めること

- IDの競合と重複検出を自分で処理すること

