---
title: "既存のコレクションにフィールドを追加 | Cloud"
slug: /add-fields-to-an-existing-collection
sidebar_label: "既存のコレクションにフィールドを追加"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Milvusでは、既存のコレクションに新しいフィールドを動的に追加することができ、アプリケーションのニーズに応じてデータスキーマを容易に変更できます。このガイドでは、実際の例を使用してさまざまなシナリオでフィールドを追加する方法を説明します。 | Cloud"
type: origin
token: UR9SwucAIiQ2TYkc9EucsgvSnng
sidebar_position: 17
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - field properties
  - add collection fields
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 既存のコレクションにフィールドを追加

Milvusでは、既存のコレクションに新しいフィールドを動的に追加することができ、アプリケーションのニーズに応じてデータスキーマを容易に変更できます。このガイドでは、実際の例を使用してさまざまなシナリオでフィールドを追加する方法を説明します。

## 考慮事項\{#considerations}

コレクションにフィールドを追加する前に、以下の重要な点を考慮してください：

- スカラーフィールド（`INT64`、`VARCHAR`、`FLOAT`、`DOUBLE`など）を追加できます。ベクトルフィールドは既存のコレクションに追加することはできません。

- 新しいフィールドには新しいフィールドの値を持っていない既存のエンティティに対応するため、nullable（nullable=True）である必要があります。

- 読み込まれたコレクションにフィールドを追加すると、メモリ使用量が増加します。

- 1つのコレクションあたりのフィールド数には最大制限があります。詳細は[Milvus Limits](https://milvus.io/docs/limitations.md#Number-of-resources-in-a-collection)を参照してください。

- フィールド名は静的フィールド内で一意である必要があります。

- 元から`enable_dynamic_field=True`で作成されていないコレクションに、動的フィールド機能を有効にするために`$meta`フィールドを追加することはできません。

## 前提条件\{#prerequisites}

このガイドでは、以下があることを前提としています：

- 実行中のMilvusインスタンス

- Milvus SDKがインストールされている

- 既存のコレクション

<Admonition type="info" icon="📘" title="**セットアップが必要ですか？**">

<p>コレクションの作成と基本操作については、<a href="./manage-collections-sdks">Create Collection</a>を参照してください。</p>

</Admonition>

## 基本的な使用方法\{#basic-usage}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# Milvusサーバーに接続
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT"  # MilvusサーバーURIに置き換えてください
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

## シナリオ1：nullableフィールドを素早く追加\{#scenario-1-quickly-add-nullable-fields}

コレクションを拡張する最も簡単な方法は、nullableフィールドを追加することです。これはデータに新しい属性を素早く追加する必要がある場合に最適です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 既存のコレクションにnullableフィールドを追加
# この操作：
# - 即座に返る（非ブロッキング）
# - 最小限の遅延でフィールドを使用可能にする
# - 既存のすべてのエンティティにNULLを設定
client.add_collection_field(
    collection_name="product_catalog",
    field_name="created_timestamp",  # 追加する新しいフィールドの名前
    data_type=DataType.INT64,        # データ型はスカラー型である必要があります
    nullable=True                    # 追加されたフィールドに対してTrueでなければなりません
    # 既存のエンティティにNULL値を許可
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

- **既存のエンティティ**は新しいフィールドにNULLを持つ

- **新しいエンティティ**はNULLまたは実際の値を持つことができる

- **フィールドの使用可能**性は内部スキーマ同期による最小限の遅延でほぼ即座に発生する

- **クエリ可能**なのは短い同期期間の後ですぐに

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# クエリ結果の例
{
    'id': 1,
    'created_timestamp': None  # 既存のエンティティの新しいフィールドにNULLを表示
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
    'created_timestamp': None  # 既存のエンティティの新しいフィールドにNULLを表示
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

## シナリオ2：デフォルト値を持つフィールドを追加\{#scenario-2-add-fields-with-default-values}

既存のエンティティにNULLではなく意味のある初期値を設定したい場合は、デフォルト値を指定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# デフォルト値を持つフィールドを追加
# この操作：
# - 既存のすべてのエンティティにデフォルト値を設定
# - 最小限の遅延でフィールドを使用可能にする
# - デフォルト値によるデータ整合性を維持
client.add_collection_field(
    collection_name="product_catalog",
    field_name="priority_level",     # 新しいフィールドの名前
    data_type=DataType.VARCHAR,      # 文字列型フィールド
    max_length=20,                   # 最大文字列長
    nullable=True,                   # 追加されたフィールドに必須
    default_value="standard"         # 既存のエンティティに割り当てられる値
    # 値が提供されない場合の新しいエンティティにも使用
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

- **既存のエンティティ**は新しく追加されたフィールドにデフォルト値（`"standard"`）を持つ

- **新しいエンティティ**はデフォルト値を上書きするか、値が提供されない場合はそれを使用できます

- **フィールドの使用可能**性は内部スキーマ同期による最小限の遅延でほぼ即座に発生する

- **クエリ可能**なのは短い同期期間の後ですぐに

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# クエリ結果の例
{
    'id': 1,
    'priority_level': 'standard'  # 既存のエンティティにデフォルト値を表示
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
    'priority_level': 'standard'  # 既存のエンティティにデフォルト値を表示
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
    'priority_level': 'standard'  # 既存のエンティティにデフォルト値を表示
}
```

</TabItem>
</Tabs>

## FAQ\{#faq}

### `$meta`フィールドを追加して動的スキーマ機能を有効にすることはできますか？\{#can-i-enable-dynamic-schema-functionality-by-adding-a-dollarmeta-field}

いいえ、`add_collection_field`を使用して`$meta`フィールドを追加して動的フィールド機能を有効にすることはできません。たとえば、以下のコードは機能しません。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# ❌ サポートされていません
client.add_collection_field(
    collection_name="existing_collection",
    field_name="$meta",
    data_type=DataType.JSON  # この操作は失敗します
)
```

</TabItem>

<TabItem value='java'>

```java
// ❌ サポートされていません
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("existing_collection")
        .fieldName("$meta")
        .dataType(DataType.JSON)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
// ❌ サポートされていません
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
# ❌ サポートされていません
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

- **新しいコレクション**：コレクション作成時に`enable_dynamic_field`をTrueに設定します。詳細については[Create Collection](./manage-collections-sdks#create-schema)を参照してください。

- **既存のコレクション**：コレクションレベルのプロパティ`dynamicfield.enabled`をTrueに設定します。詳細については[Modify Collection](./modify-collections#example-4-enable-dynamic-field)を参照してください。

### 同じ名前の動的フィールドキーを持つフィールドを追加するとどうなりますか？\{#what-happens-when-i-add-a-field-with-the-same-name-as-a-dynamic-field-key}

コレクションに動的フィールドが有効（`$meta`が存在）になっている場合、既存の動的フィールドキーと同じ名前の静的フィールドを追加できます。新しい静的フィールドは動的フィールドキーをマスクしますが、元の動的データは保持されます。

フィールド名での競合を回避するには、実際に追加する前に既存のフィールドと動的フィールドキーを参照してフィールド名を検討してください。

**例のシナリオ：**

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 動的フィールドが有効な元のコレクション
# 動的フィールドキーでデータを挿入
data = [{
    "id": 1,
    "my_vector": [0.1, 0.2, ...],
    "extra_info": "this is a dynamic field key",  # 文字列としての動的フィールドキー
    "score": 99.5                                 # 別の動的フィールドキー
}]
client.insert(collection_name="product_catalog", data=data)

# 既存の動的フィールドキーと同じ名前の静的フィールドを追加
client.add_collection_field(
    collection_name="product_catalog",
    field_name="extra_info",         # 動的フィールドキーと同じ名前
    data_type=DataType.INT64,        # データ型は動的フィールドキーと異なる可能性あり
    nullable=True                    # 追加されたフィールドに対してTrueでなければなりません
)

# 静的フィールド追加後の新しいデータを挿入
new_data = [{
    "id": 2,
    "my_vector": [0.3, 0.4, ...],
    "extra_info": 100,               # 今やINT64型を使用する必要があります（静的フィールド）
    "score": 88.0                    # 依然として動的フィールドキー
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

<TabItem value='javascript'>

```javascript
// 動的フィールドが有効な元のコレクション
// 動的フィールドキーでデータを挿入
const data = [{
    "id": 1,
    "my_vector": [0.1, 0.2, ...],
    "extra_info": "this is a dynamic field key",  // 文字列としての動的フィールドキー
    "score": 99.5                                 // 別の動的フィールドキー
}]
await client.insert({
    collection_name: "product_catalog",
    data: data
});

// 既存の動的フィールドキーと同じ名前の静的フィールドを追加
await client.add_collection_field({
    collection_name: "product_catalog",
    field_name: "extra_info",         // 動的フィールドキーと同じ名前
    data_type: DataType.INT64,        // データ型は動的フィールドキーと異なる可能性あり
    nullable: true                   // 追加されたフィールドに対してTrueでなければなりません
});

// 静的フィールド追加後の新しいデータを挿入
const new_data = [{
    "id": 2,
    "my_vector": [0.3, 0.4, ...],
    "extra_info": 100,               # 今やINT64型を使用する必要があります（静的フィールド）
    "score": 88.0                    # 依然として動的フィールドキー
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

echo "Step 1: 動的フィールドで初期データを挿入..."
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

echo -e "\n\nStep 2: 動的フィールドと同じ名前の静的フィールドを追加..."
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

echo -e "\n\nStep 3: 静的フィールド追加後の新しいデータを挿入..."
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

- **既存のエンティティ**は新しい静的フィールド`extra_info`にNULLを持つ

- **新しいエンティティ**は静的フィールドのデータ型（`INT64`）を使用しなければならない

- **元の動的フィールドキー値**は保持され、`$meta`構文でアクセス可能

- **静的フィールドは通常のクエリで動的フィールドキーをマスク**

**静的および動的値の両方へのアクセス：**

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 1. 静的フィールドのみをクエリ（動的フィールドキーはマスクされる）
results = client.query(
    collection_name="product_catalog",
    filter="id == 1",
    output_fields=["extra_info"]
)
# 返り値: {"id": 1, "extra_info": None}  # 既存エンティティのNULL

# 2. 静的および元の動的値の両方をクエリ
results = client.query(
    collection_name="product_catalog",
    filter="id == 1",
    output_fields=["extra_info", "$meta['extra_info']"]
)
# 返り値: {
#     "id": 1,
#     "extra_info": None,                           # 静的フィールド値（NULL）
#     "$meta['extra_info']": "this is a dynamic field key"  # 元の動的値
# }

# 3. 静的フィールド値を持つ新しいエンティティをクエリ
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
// 1. 静的フィールドのみをクエリ（動的フィールドキーはマスクされる）
let results = client.query({
    collection_name: "product_catalog",
    filter: "id == 1",
    output_fields: ["extra_info"]
})
// 返り値: {"id": 1, "extra_info": None}  # 既存エンティティのNULL

// 2. 静的および元の動的値の両方をクエリ
results = client.query({
    collection_name:"product_catalog",
    filter: "id == 1",
    output_fields: ["extra_info", "$meta['extra_info']"]
});
// 返り値: {
//     "id": 1,
//     "extra_info": None,                           # 静的フィールド値（NULL）
//     "$meta['extra_info']": "this is a dynamic field key"  # 元の動的値
// }

// 3. 静的フィールド値を持つ新しいエンティティをクエリ
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

echo "Query 1: 静的フィールドのみ（動的フィールドはマスク）..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"filter\": \"id == 1\",
    \"outputFields\": [\"extra_info\"]
  }"

echo -e "\n\nQuery 2: 静的および元の動的値の両方..."
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d "{
    \"collectionName\": \"${COLLECTION_NAME}\",
    \"filter\": \"id == 1\",
    \"outputFields\": [\"extra_info\", \"\$meta['extra_info']\"]
  }"

echo -e "\n\nQuery 3: 静的フィールド値を持つ新しいエンティティ..."
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

### 新しいフィールドが使用可能になるまでどれくらいかかりますか？\{#how-long-does-it-take-for-a-new-field-to-become-available}

追加されたフィールドはほぼ即座に使用可能になりますが、Milvusクラスター全体にわたる内部スキーマ変更のブロードキャストによる短い遅延が発生する可能性があります。この同期により、新しいフィールドを含むクエリを処理する前にすべてのノードがスキーマ更新を認識していることを確実にします。