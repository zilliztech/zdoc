---
title: "既存コレクションへのフィールド追加 | BYOC"
slug: /add-fields-to-an-existing-collection
sidebar_label: "既存コレクションへのフィールド追加"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Milvusでは、既存のコレクションに新しいフィールドを動的に追加でき、アプリケーションのニーズに応じてデータスキーマを容易に変更できます。このガイドでは、実際の例を使用してさまざまなシナリオでフィールドを追加する方法を示します。 | BYOC"
type: origin
token: UR9SwucAIiQ2TYkc9EucsgvSnng
sidebar_position: 17
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - スキーマ
  - フィールドプロパティ
  - コレクションフィールド追加
  - オープンソースベクトルDB
  - ベクトルデータベース例
  - RAGベクトルデータベース
  - ベクトルDBとは

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 既存コレクションへのフィールド追加

Milvusでは、既存のコレクションに新しいフィールドを動的に追加でき、アプリケーションのニーズに応じてデータスキーマを容易に変更できます。このガイドでは、実際の例を使用してさまざまなシナリオでフィールドを追加する方法を示します。

## 考慮事項\{#considerations}

コレクションにフィールドを追加する前に、以下の重要な点を考慮してください。

- スカラー型フィールド（`INT64`、`VARCHAR`、`FLOAT`、`DOUBLE`など）を追加できます。ベクトル型フィールドは既存のコレクションに追加することはできません。

- 新しいフィールドには、新しいフィールドの値を持たない既存のエンティティに対応できるように、nullable（nullable=True）にする必要があります。

- ロード済みコレクションにフィールドを追加すると、メモリ使用量が増加します。

- コレクションあたりのフィールド総数には最大制限があります。詳細は[Milvusの制限事項](https://milvus.io/docs/limitations.md#Number-of-resources-in-a-collection)を参照してください。

- フィールド名は静的フィールド間で一意である必要があります。

- 元々 `enable_dynamic_field=True` で作成されていないコレクションに対して、動的フィールド機能を有効にするために `#meta` フィールドを追加することはできません。

## 前提条件\{#prerequisites}

このガイドでは、以下があることを前提としています。

- 実行中のMilvusインスタンス

- インストール済みのMilvus SDK

- 既存のコレクション

<Admonition type="info" icon="📘" title="**セットアップに助けが必要ですか？**">

<p>コレクション作成と基本操作については、<a href="./manage-collections-sdks">コレクションの管理</a>を参照してください。</p>

</Admonition>

## 基本的な使用方法\{#basic-usage}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# Milvusサーバーに接続
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT"  # お使いのMilvusサーバーURIに置き換えてください
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

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT'
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
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
```

</TabItem>
</Tabs>

## シナリオ1: null許容フィールドを迅速に追加する\{#scenario-1-quickly-add-nullable-fields}

コレクションを拡張する最も簡単な方法は、null許容フィールドを追加することです。これは、データに新しい属性を迅速に追加する必要がある場合に最適です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 既存コレクションにnull許容フィールドを追加
# この操作：
# - 即座に完了する（非同期）
# - 最小限の遅延でフィールドを利用可能にする
# - 既存のエンティティにはNULLを設定
client.add_collection_field(
    collection_name="product_catalog",
    field_name="created_timestamp",  # 追加する新しいフィールドの名前
    data_type=DataType.INT64,        # データ型はスカラー型でなければならない
    nullable=True                    # 追加されたフィールドではTrueでなければならない
    # 既存エンティティにNULL値を許可
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

<TabItem value='javascript'>

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

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

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

期待される動作：

- **既存エンティティ**には新しいフィールドにNULLが設定されます

- **新規エンティティ**にはNULLまたは実際の値を設定できます

- **フィールド利用可能**には内部スキーマ同期による最小限の遅延で可能になります

- **クエリ可能**には短い同期期間の後で即座に可能になります

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# クエリ結果の例
{
    'id': 1,
    'created_timestamp': None  # 既存エンティティでは新しいフィールドにNULLが表示されます
}
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
{
    'id': 1,
    'created_timestamp': None  # 既存エンティティでは新しいフィールドにNULLが表示されます
}
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
{
  "code": 0,
  "data": {},
  "cost": 0
}
```

</TabItem>
</Tabs>

## シナリオ2: デフォルト値付きフィールドを追加する\{#scenario-2-add-fields-with-default-values}

既存のエンティティにNULLの代わりに意味のある初期値を持たせたい場合は、デフォルト値を指定してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# デフォルト値付きフィールドを追加
# この操作：
# - 既存エンティティにデフォルト値を設定
# - 最小限の遅延でフィールドを利用可能にする
# - デフォルト値によるデータの整合性を維持
client.add_collection_field(
    collection_name="product_catalog",
    field_name="priority_level",     # 新しいフィールドの名前
    data_type=DataType.VARCHAR,      # 文字列型フィールド
    max_length=20,                   # 最大文字列長
    nullable=True,                   # 追加フィールドではTrueが必要
    default_value="standard"         # 既存エンティティに割り当てられる値
    # 値が提供されない場合に新規エンティティにも使用
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

<TabItem value='javascript'>

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

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

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

期待される動作：

- **既存エンティティ**には新しく追加されたフィールドにデフォルト値（`"standard"`）が設定されます

- **新規エンティティ**にはデフォルト値を上書きするか、値が提供されない場合は利用できます

- **フィールド利用可能**には内部スキーマ同期による最小限の遅延で可能になります

- **クエリ可能**には短い同期期間の後で即座に可能になります

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# クエリ結果の例
{
    'id': 1,
    'priority_level': 'standard'  # 既存エンティティではデフォルト値が表示されます
}
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
{
    'id': 1,
    'priority_level': 'standard'  # 既存エンティティではデフォルト値が表示されます
}
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
{
    'id': 1,
    'priority_level': 'standard'  # 既存エンティティではデフォルト値が表示されます
}
```

</TabItem>
</Tabs>

## FAQ\{#faq}

### `#meta` フィールドを追加して動的スキーマ機能を有効にできますか？\{#can-i-enable-dynamic-schema-functionality-by-adding-a-meta-field}

いいえ、`add_collection_field` を使用して `#meta` フィールドを追加し、動的フィールド機能を有効にすることはできません。たとえば、以下のコードは機能しません。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# ❌ これはサポートされていません
client.add_collection_field(
    collection_name="existing_collection",
    field_name="$meta",
    data_type=DataType.JSON  # この操作は失敗します
)
```

</TabItem>

<TabItem value='java'>

```java
// ❌ これはサポートされていません
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("existing_collection")
        .fieldName("$meta")
        .dataType(DataType.JSON)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// ❌ これはサポートされていません
await client.addCollectionField({
    collection_name: 'product_catalog',
    field: {
        name: '$meta',
        dataType: 'JSON',
     }
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
# ❌ これはサポートされていません
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

動的スキーマ機能を有効にするには：

- **新規コレクション**：コレクション作成時に `enable_dynamic_field` を True に設定してください。詳細は[コレクション作成](./manage-collections-sdks#create-schema)を参照してください。

- **既存コレクション**：コレクションレベルのプロパティ `dynamicfield.enabled` を True に設定してください。詳細は[コレクションの変更](./modify-collections#example-4-enable-dynamic-field)を参照してください。

### 動的フィールドキーと同じ名前のフィールドを追加するとどうなりますか？\{#what-happens-when-i-add-a-field-with-the-same-name-as-a-dynamic-field-key}

コレクションで動的フィールドが有効になっている（`#meta` が存在する）場合、既存の動的フィールドキーと同じ名前の静的フィールドを追加できます。新しい静的フィールドは動的フィールドキーをマスクしますが、元の動的データは保持されます。

フィールド名の競合を避けるために、実際に追加する前に既存のフィールドや動的フィールドキーを参照してフィールド名を検討してください。

**例のシナリオ：**

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 動的フィールドが有効な元のコレクション
# 動的フィールドキーでデータを挿入
data = [{
    "id": 1,
    "my_vector": [0.1, 0.2, ...],
    "extra_info": "これは動的フィールドキーです",  # 文字列としての動的フィールドキー
    "score": 99.5                                 # 他の動的フィールドキー
}]
client.insert(collection_name="product_catalog", data=data)

# 既存動的フィールドキーと同じ名前の静的フィールドを追加
client.add_collection_field(
    collection_name="product_catalog",
    field_name="extra_info",         # 動的フィールドキーと同じ名前
    data_type=DataType.INT64,        # データ型は動的フィールドキーとは異なってもよい
    nullable=True                    # 追加フィールドではTrueにする必要があります
)

# 静的フィールド追加後の新規データを挿入
new_data = [{
    "id": 2,
    "my_vector": [0.3, 0.4, ...],
    "extra_info": 100,               # 今度はINT64型で使用（静的フィールド）
    "score": 88.0                    # まだ動的フィールドキー
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
row.addProperty("extra_info", "これは動的フィールドキーです");
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

<TabItem value='javascript'>

```javascript
// 動的フィールドが有効な元のコレクション
// 動的フィールドキーでデータを挿入
const data = [{
    "id": 1,
    "my_vector": [0.1, 0.2, ...],
    "extra_info": "これは動的フィールドキーです",  // 文字列としての動的フィールドキー
    "score": 99.5                                 // 他の動的フィールドキー
}]
await client.insert({
    collection_name: "product_catalog",
    data: data
});

// 既存動的フィールドキーと同じ名前の静的フィールドを追加
await client.add_collection_field({
    collection_name: "product_catalog",
    field_name: "extra_info",         // 動的フィールドキーと同じ名前
    data_type: DataType.INT64,        // データ型は動的フィールドキーとは異なってもよい
    nullable: true                   // 追加フィールドではTrueにする必要があります
});

// 静的フィールド追加後の新規データを挿入
const new_data = [{
    "id": 2,
    "my_vector": [0.3, 0.4, ...],
    "extra_info": 100,               # 今度はINT64型で使用（静的フィールド）
    "score": 88.0                    # まだ動的フィールドキー
}];

await client.insert({
    collection_name:"product_catalog",
    data: new_data
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
#!/bin/bash

export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export AUTH_TOKEN="your_token_here"
export COLLECTION_NAME="product_catalog"

echo "ステップ1: 動的フィールドを持つ初期データを挿入..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/insert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"data\": [{
      \"id\": 1,
      \"my_vector\": [0.1, 0.2, 0.3, 0.4, 0.5],
      \"extra_info\": \"これは動的フィールドキーです\",
      \"score\": 99.5
    }]
  }"

echo -e "\n\nステップ2: 動的フィールドと同じ名前の静的フィールドを追加..."
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

echo -e "\n\nステップ3: 静的フィールド追加後の新規データを挿入..."
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

期待される動作：

- **既存エンティティ**には新しい静的フィールド `extra_info` にNULLが設定されます

- **新規エンティティ**は静的フィールドのデータ型（`INT64`）を使用する必要があります

- **元の動的フィールドキー値**は保持され、`#meta` 構文でアクセス可能です

- **静的フィールドは通常のクエリで動的フィールドキーをマスクします**

**静的値と動的値の両方へのアクセス：**

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 1. 静的フィールドのみをクエリ（動的フィールドキーはマスクされます）
results = client.query(
    collection_name="product_catalog",
    filter="id == 1",
    output_fields=["extra_info"]
)
# 返り値: {"id": 1, "extra_info": None}  # 既存エンティティではNULL

# 2. 静的および元の動的値の両方をクエリ
results = client.query(
    collection_name="product_catalog",
    filter="id == 1",
    output_fields=["extra_info", "$meta['extra_info']"]
)
# 返り値: {
#     "id": 1,
#     "extra_info": None,                           # 静的フィールド値（NULL）
#     "$meta['extra_info']": "これは動的フィールドキーです"  # 元の動的値
# }

# 3. 静的フィールド値を持つ新規エンティティをクエリ
results = client.query(
    collection_name="product_catalog",
    filter="id == 2",
    output_fields=["extra_info"]
)
# 返り値: {"id": 2, "extra_info": 100}  # 静的フィールド値
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 1. 静的フィールドのみをクエリ（動的フィールドキーはマスクされます）
let results = client.query({
    collection_name: "product_catalog",
    filter: "id == 1",
    output_fields: ["extra_info"]
})
# 返り値: {"id": 1, "extra_info": None}  # 既存エンティティではNULL

// 2. 静的および元の動的値の両方をクエリ
results = client.query({
    collection_name:"product_catalog",
    filter: "id == 1",
    output_fields: ["extra_info", "$meta['extra_info']"]
});
# 返り値: {
#     "id": 1,
#     "extra_info": None,                           # 静的フィールド値（NULL）
#     "$meta['extra_info']": "これは動的フィールドキーです"  # 元の動的値
# }

// 3. 静的フィールド値を持つ新規エンティティをクエリ
results = client.query({
    collection_name: "product_catalog",
    filter: "id == 2",
    output_fields: ["extra_info"]
})
# 返り値: {"id": 2, "extra_info": 100}  # 静的フィールド値
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
#!/bin/bash

export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export AUTH_TOKEN="your_token_here"
export COLLECTION_NAME="product_catalog"

echo "クエリ1: 静的フィールドのみ（動的フィールドはマスク済み）..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"filter\": \"id == 1\",
    \"outputFields\": [\"extra_info\"]
  }"

echo -e "\n\nクエリ2: 静的および元の動的値の両方..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"filter\": \"id == 1\",
    \"outputFields\": [\"extra_info\", \"\$meta['extra_info']\"]
  }"

echo -e "\n\nクエリ3: 静的フィールド値を持つ新規エンティティ..."
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

### 新しいフィールドが利用可能になるまでどれくらいかかりますか？\{#how-long-does-it-take-for-a-new-field-to-become-available}

追加されたフィールドは即座に利用可能になりますが、Milvusクラスター全体でスキーマ変更をブロードキャストする内部処理のため、短い遅延が発生する場合があります。この同期処理により、新しいフィールドを含むクエリを処理する前にすべてのノードがスキーマの更新を認識していることを保証します。

