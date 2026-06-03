---
title: "既存のコレクションにフィールドを追加 | BYOC"
slug: /add-fields-to-an-existing-collection
sidebar_key: add-fields-to-an-existing-collection
sidebar_label: "フィールドを追加"
beta: FALSE
notebook: FALSE
description: "Milvus を使用すると、既存のコレクションに新しいフィールドを動的に追加できます。これにより、アプリケーションのニーズの変化に応じてデータスキーマを簡単に進化させることができます。このガイドでは、実用的な例を使用して、さまざまなシナリオでフィールドを追加する方法を説明します。 | BYOC"
type: origin
token: UR9SwucAIiQ2TYkc9EucsgvSnng
sidebar_position: 18
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - コレクション
  - スキーマ
  - フィールドプロパティ
  - add collection fields

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 既存コレクションへのフィールド追加

Milvus では、既存のコレクションに新しいフィールドを動的に追加できます。これにより、アプリケーションのニーズの変化に応じてデータスキーマを簡単に進化させることができます。このガイドでは、実用的な例を使用して、さまざまなシナリオでフィールドを追加する方法を説明します。

## 考慮事項\{#considerations}

コレクションにフィールドを追加する前に、以下の重要なポイントを確認してください。

- 新しいフィールドは null 許容（nullable=True）である必要があります。これにより、新しいフィールドの値を持たない既存のエンティティに対応できます。

- ロード済みのコレクションにフィールドを追加すると、メモリ使用量が増加します。

- コレクションあたりのフィールド総数には最大制限があります。詳細については、[Milvus 制限s](https://milvus.io/docs/limitations.md#Number-of-resources-in-a-collection) を参照してください。

- フィールド名は、静的フィールド間で一意である必要があります。

- 元々 `enable_dynamic_field=True` で作成されていないコレクションに対して、動的フィールド機能を有効にするための `$meta` フィールドを追加することはできません。

## 前提条件\{#prerequisites}

このガイドでは、以下を前提としています。

- 実行中の Milvus インスタンス

- Milvus SDK のインストール

- 既存のコレクション

<Admonition type="info" icon="📘" title="**Need help setting up?**">

<p>コレクションの作成と基本操作については、<a href="./manage-collections-sdks">コレクションの作成</a> を参照してください。</p>

</Admonition>

## 基本的な使い方\{#basic-usage}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# Connect to your Milvus server
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT"  # Replace with your Milvus server URI
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);
```

</TabItem>

<TabItem value='java'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT'
});
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
```

</TabItem>
</Tabs>

## シナリオ 1: Null 許容フィールドを迅速に追加する\{#scenario-1-quickly-add-nullable-fields}

コレクションを拡張する最も簡単な方法は、Null 許容フィールドを追加することです。これは、データに新しい属性を素早く追加したい場合に最適です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Add a nullable field to an existing collection
# This operation:
# - Returns almost immediately (non-blocking)
# - Makes the field available for use with minimal delay
# - Sets NULL for all existing entities
client.add_collection_field(
    collection_name="product_catalog",
    field_name="created_timestamp",  # Name of the new field to add
    data_type=DataType.INT64,        # Data type must be a scalar type
    nullable=True                    # Must be True for added fields
    # Allows NULL values for existing entities
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.AddCollectionFieldReq;

client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("product_catalog")
        .fieldName("created_timestamp")
        .dataType(DataType.Int64)
        .isNullable(true)
        .build());
```

</TabItem>

<TabItem value='java'>

```javascript
await client.addCollectionField({
    collection_name: 'product_catalog',
    field: {
        name: 'created_timestamp',
        dataType: 'Int64',
        nullable: true
     }
});
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "product_catalog",
    "schema": {
      "fieldName": "created_timestamp",
      "dataType": "Int64",
      "nullable": true
    }
  }'
```

</TabItem>
</Tabs>

期待される動作:

- **既存のエンティティ**は、新しいフィールドに対して NULL を持つ

- **新しいエンティティ**は、NULL または実際の値のいずれかを持つことができる

- **フィールドの可用性**は、内部スキーマ同期により、ほぼ即座に（最小限の遅延で）発生する

- 同期期間が短時間経過した後、**即時クエリ可能**となる

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Example query result
{
    'id': 1, 
    'created_timestamp': None  # New field shows NULL for existing entities
}
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='java'>

```javascript
// nodejs
{
    'id': 1, 
    'created_timestamp': None  # New field shows NULL for existing entities
}
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
{
  "code": 0,
  "data": {},
  "cost": 0
}
```

</TabItem>
</Tabs>

## シナリオ 2: デフォルト値を持つフィールドを追加する\{#scenario-2-add-fields-with-default-values}

既存のエンティティに NULL ではなく意味のある初期値を持たせたい場合は、デフォルト値を指定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Add a field with default value
# This operation:
# - Sets the default value for all existing entities
# - Makes the field available with minimal delay
# - Maintains data consistency with the default value
client.add_collection_field(
    collection_name="product_catalog",
    field_name="priority_level",     # Name of the new field
    data_type=DataType.VARCHAR,      # String type field
    max_length=20,                   # Maximum string length
    nullable=True,                   # Required for added fields
    default_value="standard"         # Value assigned to existing entities
    # Also used for new entities if no value provided
)
```

</TabItem>

<TabItem value='java'>

```java
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("product_catalog")
        .fieldName("priority_level")
        .dataType(DataType.VarChar)
        .maxLength(20)
        .isNullable(true)
        .build());
```

</TabItem>

<TabItem value='java'>

```javascript
await client.addCollectionField({
    collection_name: 'product_catalog',
    field: {
        name: 'priority_level',
        dataType: 'VarChar',
        nullable: true,
        default_value: 'standard',
     }
});
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "product_catalog",
    "schema": {
      "fieldName": "priority_level",
      "dataType": "VarChar",
      "nullable": true,
      "defaultValue": "standard",
      "elementTypeParams": {
        "max_length": "20"
      }
    }
  }'
```

</TabItem>
</Tabs>

期待される動作:

- **既存のエンティティ**は、新しく追加されたフィールドに対してデフォルト値（`"standard"`）を持つことになります。

- **新しいエンティティ**は、デフォルト値を上書きすることも、値が指定されない場合はそのデフォルト値を使用することもできます。

- **フィールドの可用性**は、ごくわずかな遅延でほぼ即座に発生します。

- 短い同期期間の後、すぐに**即時クエリ可能**になります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Example query result
{
    'id': 1,
    'priority_level': 'standard'  # Shows default value for existing entities
}
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='java'>

```javascript
{
    'id': 1,
    'priority_level': 'standard'  # Shows default value for existing entities
}
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
{
    'id': 1,
    'priority_level': 'standard'  # Shows default value for existing entities
}
```

</TabItem>
</Tabs>

## FAQ\{#faq}

### `$meta` フィールドを追加することで動的スキーマ機能を有効にできますか？\{#can-i-enable-dynamic-schema-functionality-by-adding-a-dollarmeta-field}

いいえ、`add_collection_field` を使用して `$meta` フィールドを追加し、動的フィールド機能を有効にすることはできません。たとえば、以下のコードは動作しません：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# ❌ This is NOT supported
client.add_collection_field(
    collection_name="existing_collection",
    field_name="$meta",
    data_type=DataType.JSON  # This operation will fail
)
```

</TabItem>

<TabItem value='java'>

```java
// ❌ This is NOT supported
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("existing_collection")
        .fieldName("$meta")
        .dataType(DataType.JSON)
        .build());
```

</TabItem>

<TabItem value='java'>

```javascript
// ❌ This is NOT supported
await client.addCollectionField({
    collection_name: 'product_catalog',
    field: {
        name: '$meta',
        dataType: 'JSON',
     }
});
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
# ❌ This is NOT supported
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/fields/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "existing_collection",
    "schema": {
      "fieldName": "$meta",
      "dataType": "JSON",
      "nullable": true
    }
  }'
```

</TabItem>
</Tabs>

ダイナミックスキーマ機能を有効にするには:

- **新しいコレクション**: コレクション作成時に `enable_dynamic_field` を True に設定します。詳細については、[コレクションの作成](./manage-collections-sdks#create-schema) を参照してください。

- **既存のコレクション**: コレクションレベルのプロパティ `dynamicfield.enabled` を True に設定します。詳細については、[コレクションの変更](./modify-collections#example-5-enable-dynamic-field) を参照してください。

### ダイナミックフィールドのキーと同じ名前のフィールドを追加するとどうなりますか？\{#what-happens-when-i-add-a-field-with-the-same-name-as-a-dynamic-field-key}

コレクションでダイナミックフィールドが有効になっている場合（`$meta` が存在する場合）、既存のダイナミックフィールドのキーと同じ名前を持つ静的フィールドを追加できます。新しい静的フィールドはダイナミックフィールドのキーをマスクしますが、元のダイナミックデータは保持されます。

フィールド名の競合を避けるため、実際に追加する前に既存のフィールドとダイナミックフィールドのキーを参照して、追加するフィールドの名前を検討してください。

**例:**

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Original collection with dynamic field enabled
# Insert data with dynamic field keys
data = [{
    "id": 1,
    "my_vector": [0.1, 0.2, ...],
    "extra_info": "this is a dynamic field key",  # Dynamic field key as string
    "score": 99.5                                 # Another dynamic field key
}]
client.insert(collection_name="product_catalog", data=data)

# Add static field with same name as existing dynamic field key
client.add_collection_field(
    collection_name="product_catalog",
    field_name="extra_info",         # Same name as dynamic field key
    data_type=DataType.INT64,        # Data type can differ from dynamic field key
    nullable=True                    # Must be True for added fields
)

# Insert new data after adding static field
new_data = [{
    "id": 2,
    "my_vector": [0.3, 0.4, ...],
    "extra_info": 100,               # Now must use INT64 type (static field)
    "score": 88.0                    # Still a dynamic field key
}]
client.insert(collection_name="product_catalog", data=new_data)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.*;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

Gson gson = new Gson();
JsonObject row = new JsonObject();
row.addProperty("id", 1);
row.add("my_vector", gson.toJsonTree(new float[]{0.1f, 0.2f, ...}));
row.addProperty("extra_info", "this is a dynamic field key");
row.addProperty("score", 99.5);

InsertResp insertR = client.insert(InsertReq.builder()
        .collectionName("product_catalog")
        .data(Collections.singletonList(row))
        .build());
        
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("product_catalog")
        .fieldName("extra_info")
        .dataType(DataType.Int64)
        .isNullable(true)
        .build());
        
JsonObject newRow = new JsonObject();
newRow.addProperty("id", 2);
newRow.add("my_vector", gson.toJsonTree(new float[]{0.3f, 0.4f, ...}));
newRow.addProperty("extra_info", 100);
newRow.addProperty("score", 88.0);

insertR = client.insert(InsertReq.builder()
        .collectionName("product_catalog")
        .data(Collections.singletonList(newRow))
        .build());
```

</TabItem>

<TabItem value='java'>

```javascript
// Original collection with dynamic field enabled
// Insert data with dynamic field keys
const data = [{
    "id": 1,
    "my_vector": [0.1, 0.2, ...],
    "extra_info": "this is a dynamic field key",  // Dynamic field key as string
    "score": 99.5                                 // Another dynamic field key
}]
await client.insert({
    collection_name: "product_catalog", 
    data: data
});

// Add static field with same name as existing dynamic field key
await client.add_collection_field({
    collection_name: "product_catalog",
    field_name: "extra_info",         // Same name as dynamic field key
    data_type: DataType.INT64,        // Data type can differ from dynamic field key
    nullable: true                   // Must be True for added fields
});

// Insert new data after adding static field
const new_data = [{
    "id": 2,
    "my_vector": [0.3, 0.4, ...],
    "extra_info": 100,               # Now must use INT64 type (static field)
    "score": 88.0                    # Still a dynamic field key
}];

await client.insert({
    collection_name:"product_catalog", 
    data: new_data
});
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
#!/bin/bash

export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export AUTH_TOKEN="your_token_here"
export COLLECTION_NAME="product_catalog"

echo "Step 1: Insert initial data with dynamic fields..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/insert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"data\": [{
      \"id\": 1,
      \"my_vector\": [0.1, 0.2, 0.3, 0.4, 0.5],
      \"extra_info\": \"this is a dynamic field key\",
      \"score\": 99.5
    }]
  }"

echo -e "\n\nStep 2: Add static field with same name as dynamic field..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/collections/fields/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"schema\": {
      \"fieldName\": \"extra_info\",
      \"dataType\": \"Int64\",
      \"nullable\": true
    }
  }"

echo -e "\n\nStep 3: Insert new data after adding static field..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/insert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"data\": [{
      \"id\": 2,
      \"my_vector\": [0.3, 0.4, 0.5, 0.6, 0.7],
      \"extra_info\": 100,
      \"score\": 88.0
    }]
  }"
```

</TabItem>
</Tabs>

期待される動作:

- **既存のエンティティ**は、新しい静的フィールド `extra_info` に対して NULL を持つ

- **新しいエンティティ**は、静的フィールドのデータ型（`INT64`）を使用する必要がある

- **元の動的フィールドのキー値**は保持され、`$meta` 構文を介してアクセス可能

- **静的フィールドは通常のクエリにおいて動的フィールドのキーをマスクする**

**静的フィールドと動的フィールドの両方の値にアクセスする方法:**

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 1. Query static field only (dynamic field key is masked)
results = client.query(
    collection_name="product_catalog",
    filter="id == 1",
    output_fields=["extra_info"]
)
# Returns: {"id": 1, "extra_info": None}  # NULL for existing entity

# 2. Query both static and original dynamic values
results = client.query(
    collection_name="product_catalog", 
    filter="id == 1",
    output_fields=["extra_info", "$meta['extra_info']"]
)
# Returns: {
#     "id": 1,
#     "extra_info": None,                           # Static field value (NULL)
#     "$meta['extra_info']": "this is a dynamic field key"  # Original dynamic value
# }

# 3. Query new entity with static field value
results = client.query(
    collection_name="product_catalog",
    filter="id == 2", 
    output_fields=["extra_info"]
)
# Returns: {"id": 2, "extra_info": 100}  # Static field value
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='java'>

```javascript
// 1. Query static field only (dynamic field key is masked)
let results = client.query({
    collection_name: "product_catalog",
    filter: "id == 1",
    output_fields: ["extra_info"]
})
// Returns: {"id": 1, "extra_info": None}  # NULL for existing entity

// 2. Query both static and original dynamic values
results = client.query({
    collection_name:"product_catalog", 
    filter: "id == 1",
    output_fields: ["extra_info", "$meta['extra_info']"]
});
// Returns: {
//     "id": 1,
//     "extra_info": None,                           # Static field value (NULL)
//     "$meta['extra_info']": "this is a dynamic field key"  # Original dynamic value
// }

// 3. Query new entity with static field value
results = client.query({
    collection_name: "product_catalog",
    filter: "id == 2", 
    output_fields: ["extra_info"]
})
// Returns: {"id": 2, "extra_info": 100}  # Static field value
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
#!/bin/bash

export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export AUTH_TOKEN="your_token_here"
export COLLECTION_NAME="product_catalog"

echo "Query 1: Static field only (dynamic field masked)..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"filter\": \"id == 1\",
    \"outputFields\": [\"extra_info\"]
  }"

echo -e "\n\nQuery 2: Both static and original dynamic values..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"filter\": \"id == 1\",
    \"outputFields\": [\"extra_info\", \"\$meta['extra_info']\"]
  }"

echo -e "\n\nQuery 3: New entity with static field value..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"filter\": \"id == 2\",
    \"outputFields\": [\"extra_info\"]
  }"
```

</TabItem>
</Tabs>

### 新しいフィールドが利用可能になるまでどのくらい時間がかかりますか？\{#how-long-does-it-take-for-a-new-field-to-become-available}

追加されたフィールドはほぼ即座に利用可能になりますが、Milvusクラスター全体で内部スキーマ変更をブロードキャストする際に、ごく短い遅延が発生する可能性があります。この同期処理により、すべてのノードが新しいフィールドを含むスキーマ更新を認識し、そのフィールドを含むクエリを処理できるようになります。
