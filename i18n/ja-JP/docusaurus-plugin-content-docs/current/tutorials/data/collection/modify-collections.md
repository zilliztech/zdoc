---
title: "コレクションの変更 | Cloud"
slug: /modify-collections
sidebar_label: "コレクションの変更"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "コレクションの名前を変更したり、設定を変更できます。このページでは、コレクションを変更する方法に焦点を当てています。 | Cloud"
type: origin
token: WMh8w3tbKiBhukk3ICMc4ctznEg
sidebar_position: 5
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - コレクションの変更
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースベクトルデータベース
  - ベクトルインデックス

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションの変更

コレクションの名前を変更したり、設定を変更できます。このページでは、コレクションを変更する方法に焦点を当てています。

## コレクション名の変更\{#rename-collection}

以下のようにして、コレクションの名前を変更できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.rename_collection(
    old_name="my_collection",
    new_name="my_new_collection"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.RenameCollectionReq;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Milvusサーバーに接続
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

RenameCollectionReq renameCollectionReq = RenameCollectionReq.builder()
        .collectionName("my_collection")
        .newCollectionName("my_new_collection")
        .build();

client.renameCollection(renameCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

const res = await client.renameCollection({
    oldName: "my_collection",
    newName: "my_new_collection"
});
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey:  token,
})
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
defer client.Close(ctx)

err = client.RenameCollection(ctx, milvusclient.NewRenameCollectionOption("my_collection", "my_new_collection"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/rename" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "newCollectionName": "my_new_collection"
}'
```

</TabItem>
</Tabs>

## コレクションプロパティの設定\{#set-collection-properties}

コレクションが作成された後も、コレクションレベルのプロパティを変更できます。

### サポートされるプロパティ\{#supported-properties}

<table>
   <tr>
     <th><p>プロパティ</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>collection.ttl.seconds</code></p></td>
     <td><p>コレクションのデータを特定の期間後に削除する必要がある場合は、秒単位でのTime-To-Live（TTL）を設定することを検討してください。TTLがタイムアウトすると、Zilliz Cloudはコレクションからすべてのエンティティを削除します。</p><p>削除は非同期であるため、削除が完了する前までは検索およびクエリが可能です。</p><p>詳細については、<a href="./set-collection-ttl">コレクションTTLの設定</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>mmap.enabled</code></p></td>
     <td><p>メモリマッピング（Mmap）により、ディスク上の大きなファイルへの直接メモリアクセスが可能になり、Zilliz Cloudはインデックスとデータをメモリとハードディスクの両方に保存できます。このアプローチにより、アクセス頻度に基づいたデータ配置ポリシーを最適化し、検索パフォーマンスに影響を与えることなくコレクションのストレージ容量を拡張できます。</p><p>Zilliz Cloudはクラスター用の<a href="./use-mmap#global-mmap-strategy">グローバルmmap設定</a>を実装しています。特定のフィールドまたはそのインデックスで設定を変更できます。</p><p>詳細については、mmapの使用を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>partitionkey.isolation</code></p></td>
     <td><p>パーティションキー分離が有効な場合、Zilliz Cloudはパーティションキー値に基づいてエンティティをグループ化し、これらのグループごとに個別のインデックスを作成します。検索リクエストを受信すると、Zilliz Cloudはフィルタリング条件で指定されたパーティションキー値に基づいてインデックスを特定し、そのインデックスに含まれるエンティティのみの範囲内で検索スコープを制限し、検索中に無関係なエンティティをスキャンすることを避け、検索パフォーマンスを大幅に向上させます。</p><p>詳細については、<a href="./use-partition-key#use-partition-key-isolation">パーティションキー分離の使用</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>dynamicfield.enabled</code></p></td>
     <td><p>元から有効に設定されていなかったコレクションに対して、動的フィールドを有効にします。有効にすると、元のスキーマに定義されていないフィールドを持つエンティティを挿入できます。詳細については、<a href="./enable-dynamic-field">動的フィールド</a>を参照してください。</p></td>
   </tr>
</table>

### 例1：コレクションTTLの設定\{#example-1-set-collection-ttl}

以下のコードスニペットは、コレクションTTLを設定する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.alter_collection_properties(
    collection_name="my_collection",
    properties={"collection.ttl.seconds": 60}
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.AlterCollectionReq;
import java.util.HashMap;
import java.util.Map;

Map<String, String> properties = new HashMap<>();
properties.put("collection.ttl.seconds", "60");

AlterCollectionReq alterCollectionReq = AlterCollectionReq.builder()
        .collectionName("my_collection")
        .properties(properties)
        .build();

client.alterCollection(alterCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.alterCollection({
    collection_name: "my_collection",
    properties: {
        "collection.ttl.seconds": 60
    }
})
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty(common.CollectionTTLConfigKey, 60))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "test_collection",
    "properties": {
        "collection.ttl.seconds": 60
    }
}'
```

</TabItem>
</Tabs>

### 例2：mmapの有効化\{#example-2-enable-mmap}

以下のコードスニペットは、mmapを有効にする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.alter_collection_properties(
    collection_name="my_collection",
    properties={"mmap.enabled": True}
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, String> properties = new HashMap<>();
properties.put("mmap.enabled", "True");

AlterCollectionReq alterCollectionReq = AlterCollectionReq.builder()
        .collectionName("my_collection")
        .properties(properties)
        .build();

client.alterCollection(alterCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionProperties({
    collection_name: "my_collection",
    properties: {
        "mmap.enabled": true
    }
});
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty(common.MmapEnabledKey, true))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
```

</TabItem>

<TabItem value='bash'>

```bash
# リスト
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/alter_properties" \
  -H "Content-Type: application/json" \
  -d '{
    "collectionName": "my_collection",
    "properties": {
      "mmap.enabled": "true"
    }
  }'
```

</TabItem>
</Tabs>

### 例3：パーティションキーの有効化\{#example-3-enable-partition-key}

以下のコードスニペットは、パーティションキーを有効にする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.alter_collection_properties(
    collection_name="my_collection",
    properties={"partitionkey.isolation": True}
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, String> properties = new HashMap<>();
properties.put("partitionkey.isolation", "True");

AlterCollectionReq alterCollectionReq = AlterCollectionReq.builder()
        .collectionName("my_collection")
        .properties(properties)
        .build();

client.alterCollection(alterCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionProperties({
    collection_name: "my_collection",
    properties: {
        "partitionkey.isolation": true
    }
});
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty(common.PartitionKeyIsolationKey, true))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
```

</TabItem>

<TabItem value='bash'>

```bash
# リスト
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/alter_properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "my_collection",
    "properties": {
      "partitionkey.isolation": "true"
    }
  }'
```

</TabItem>
</Tabs>

### 例4：動的フィールドの有効化\{#example-4-enable-dynamic-field}

以下のコードスニペットは、動的フィールドを有効にする方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.alter_collection_properties(
    collection_name="my_collection",
    properties={"dynamicfield.enabled": True}
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, String> properties = new HashMap<>();
properties.put("dynamicfield.enabled", "True");

AlterCollectionReq alterCollectionReq = AlterCollectionReq.builder()
        .collectionName("my_collection")
        .properties(properties)
        .build();

client.alterCollection(alterCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.alterCollectionProperties({
    collection_name: "my_collection",
    properties: {
        "dynamicfield.enabled": true
    }
});
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").WithProperty(common.EnableDynamicSchemaKey, true))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
```

</TabItem>

<TabItem value='bash'>

```bash
# リスト
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/collections/alter_properties" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "collectionName": "my_collection",
    "properties": {
      "dynamicfield.enabled": "true"
    }
  }'
```

</TabItem>
</Tabs>

## コレクションプロパティの削除\{#drop-collection-properties}

以下のようにして、プロパティを削除することでコレクションプロパティをリセットすることもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_collection_properties(
    collection_name="my_collection",
    property_keys=[
        "collection.ttl.seconds"
    ]
)
```

</TabItem>

<TabItem value='java'>

```java
client.dropCollectionProperties(DropCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .propertyKeys(Collections.singletonList("collection.ttl.seconds"))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.dropCollectionProperties({
    collection_name:"my_collection",
    properties: ['collection.ttl.seconds'],
});
```

</TabItem>

<TabItem value='go'>

```go
err = client.DropCollectionProperties(ctx, milvusclient.NewDropCollectionPropertiesOption("my_collection", common.CollectionTTLConfigKey))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "propertyKeys": [
        "collection.ttl.seconds"
    ]
}'
```

</TabItem>
</Tabs>