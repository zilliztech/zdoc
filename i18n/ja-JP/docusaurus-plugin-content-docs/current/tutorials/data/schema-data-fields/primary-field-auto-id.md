---
title: "主フィールドとAutoID | Cloud"
slug: /primary-field-auto-id
sidebar_label: "主フィールドとAutoID"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudのすべてのコレクションには、各エンティティを一意に識別するための主フィールドが必要です。このフィールドにより、すべてのエンティティを曖昧さなく挿入、更新、クエリ、削除できます。 | Cloud"
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
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 主フィールドとAutoID

Zilliz Cloudのすべてのコレクションには、各エンティティを一意に識別するための主フィールドが必要です。このフィールドにより、すべてのエンティティを曖昧さなく挿入、更新、クエリ、削除できます。

使用ケースに応じて、Zilliz CloudがIDを自動生成するように設定する(AutoID)か、自分でIDを手動で割り当てるかを選択できます。

## 主フィールドとは?\{#what-is-a-primary-field}

主フィールドは、従来のデータベースの主キーと同様に、コレクション内の各エンティティの固有キーとして機能します。Zilliz Cloudは、挿入、アップサート、削除、クエリ操作中にエンティティを管理するために主フィールドを使用します。

主な要件:

- 各コレクションには**正確に1つ**の主フィールドが必要です。

- 主フィールドの値をnullにすることはできません。

- データ型は作成時に指定され、後で変更することはできません。

## サポートされているデータ型\{#supported-data-types}

主フィールドは、エンティティを一意に識別できるサポートされているスカラーデータ型を使用する必要があります。

<table>
   <tr>
     <th><p>データ型</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>INT64</code></p></td>
     <td><p>64ビット整数型。AutoIDでよく使用されます。ほとんどの使用ケースにおすすめのオプションです。</p></td>
   </tr>
   <tr>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>可変長文字列型。エンティティ識別子が外部システム(たとえば、商品コードやユーザーID)から来る場合に使用します。<code>max_length</code> プロパティが必要で、各値に許可される最大バイト数を定義します。</p></td>
   </tr>
</table>

## AutoIDと手動IDの選択\{#choose-between-autoid-and-manual-ids}

Zilliz Cloudは、主キー値を割り当てる2つのモードをサポートしています。

<table>
   <tr>
     <th><p>モード</p></th>
     <th><p>説明</p></th>
     <th><p>推奨対象</p></th>
   </tr>
   <tr>
     <td><p>AutoID</p></td>
     <td><p>Zilliz Cloudは、挿入またはインポートされたエンティティに対して一意の識別子を自動的に生成します。</p></td>
     <td><p>IDを手動で管理する必要がないほとんどのシナリオ。</p></td>
   </tr>
   <tr>
     <td><p>手動ID</p></td>
     <td><p>データの挿入またはインポート時に自分で一意のIDを提供します。</p></td>
     <td><p>IDが外部システムや既存のデータセットに合わせなければならない場合。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="ノート">

<p>どちらのモードを選択するかわからない場合は、<a href="./primary-field-auto-id#quickstart-use-autoid">AutoIDから始めることをお勧めします</a>。これにより、単純なインジェストと一意性の保証ができます。</p>

</Admonition>

## クイックスタート: AutoIDの使用\{#quickstart-use-autoid}

Zilliz CloudにID生成を自動的に処理させることができます。

### ステップ1: AutoIDでコレクションを作成する\{#step-1-create-a-collection-with-autoid}

主フィールド定義で `auto_id=True` を有効にします。Zilliz CloudがID生成を自動的に処理します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema()

# AutoIDを有効にした主フィールドを定義
# highlight-start
schema.add_field(
    field_name="id", # 主フィールド名
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
    description: "主フィールド",
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

### ステップ2: データを挿入\{#step-2-insert-data}

**重要:** データに主フィールドの列を含めないでください。Zilliz CloudがIDを自動生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {"embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
]

res = client.insert(collection_name="demo_autoid", data=data)
print("Generated IDs:", res.get("ids"))

# 出力例:
# Generated IDs: [461526052788333649, 461526052788333650]
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
System.out.printf("Generated IDs: %s\n", insertR.getPrimaryKeys());
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

<Admonition type="info" icon="📘" title="ノート">

<p>既存のエンティティを操作する際には、重複IDエラーを避けるために<code>insert()</code>の代わりに<code>upsert()</code>を使用してください。</p>

</Admonition>

## 手動IDの使用\{#use-manual-ids}

IDを手動で管理する必要がある場合は、AutoIDを無効にして独自の値を提供してください。

### ステップ1: AutoIDなしでコレクションを作成\{#step-1-create-a-collection-without-autoid}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema()

# AutoIDなしで主フィールドを定義
# highlight-start
schema.add_field(
    field_name="product_id",
    is_primary=True,
    auto_id=False,  # データインジェスト時にIDを手動で提供
    datatype=DataType.VARCHAR,
    max_length=100 # datatypeがVARCHARの場合は必須
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

### ステップ2: IDでデータを挿入\{#step-2-insert-data-with-your-ids}

すべての挿入操作で主フィールドの列を含める必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 各エンティティには主フィールド`product_id`が含まれている必要があります
data = [
    {"product_id": "PROD-001", "embedding": [0.1, 0.2, 0.3, 0.4], "category": "book"},
    {"product_id": "PROD-002", "embedding": [0.2, 0.3, 0.4, 0.5], "category": "toy"},
]

res = client.insert(collection_name="demo_manual_ids", data=data)
print("Generated IDs:", res.get("ids"))

# 出力例:
# Generated IDs: ['PROD-001', 'PROD-002']
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
System.out.printf("Generated IDs: %s\n", insertR.getPrimaryKeys());
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

# データを挿入
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

- すべてのIDがすべてのエンティティ間で一意であることを保証する

- すべての挿入/インポート操作で主フィールドを含める

- IDの競合と重複検出を自分で処理する