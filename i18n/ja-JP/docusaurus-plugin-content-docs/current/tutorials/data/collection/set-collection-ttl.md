---
title: "コレクションTTLの設定 | Cloud"
slug: /set-collection-ttl
sidebar_label: "コレクションTTLの設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データがコレクションに挿入されると、デフォルトではその場に残ります。ただし、特定の期間後にデータを削除またはクリーンアップしたい場合があります。このような場合、Zilliz CloudがTTLが期限切れになるとデータを自動的に削除するように、コレクションのTime-to-Live (TTL) プロパティを設定できます。 | Cloud"
type: origin
token: GthGwnrpEiGpClkV5JXcgWUgn8c
sidebar_position: 6
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - コレクションTTL
  - Time-to-Live
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースベクトルデータベース
  - ベクトルインデックス

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションTTLの設定

データがコレクションに挿入されると、デフォルトではその場に残ります。ただし、特定の期間後にデータを削除またはクリーンアップしたい場合があります。このような場合、Zilliz CloudがTTLが期限切れになるとデータを自動的に削除するように、コレクションのTime-to-Live (TTL) プロパティを設定できます。

## 概要\{#overview}

Time-to-Live (TTL) は、挿入または変更後に一定期間だけデータを有効またはアクセス可能にしておく必要があるシナリオで、データベースで一般的に使用されます。その後、データは自動的に削除できます。

たとえば、毎日データを取り込みますが、記録を14日間だけ保持したい場合、コレクションのTTLを**14 × 24 × 3600 = 1209600**秒に設定することで、Zilliz Cloudがそれより古いデータを自動的に削除するように設定できます。これにより、コレクション内には最も最近の14日分のデータのみが保持されます。

<Admonition type="info" icon="📘" title="備考">

<p>期限切れのエンティティは、検索またはクエリ結果には表示されません。ただし、データの圧縮が次の24時間以内に実行されるまで、ストレージ内には残る可能性があります。</p>

</Admonition>

Zilliz CloudコレクションのTTLプロパティは、秒単位の整数として指定されます。一度設定されると、TTLを超えたデータはコレクションから自動的に削除されます。

削除プロセスは非同期であるため、指定されたTTLが経過した直後にデータが検索結果から削除されない場合があります。代わりに、ガベージコレクション (GC) およびコンパクションプロセスに依存するため遅延が生じる可能性があり、これらのプロセスは非決定的な間隔で発生します。

## TTLの設定\{#set-ttl}

TTLプロパティは以下の場合に設定できます。

- [コレクションを作成する場合。](./set-collection-ttl#set-ttl-when-creating-a-collection)

- [既存のコレクションのTTLプロパティを変更する場合。](./set-collection-ttl#set-ttl-for-an-existing-collection)

### コレクション作成時にTTLを設定\{#set-ttl-when-creating-a-collection}

以下のコードスニペットは、コレクションを作成するときにTTLプロパティを設定する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# TTLの指定
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    # highlight-start
    properties={
        "collection.ttl.seconds": 1209600
    }
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.AlterCollectionReq;
import io.milvus.param.Constant;
import java.util.HashMap;
import java.util.Map;

// TTLの指定
CreateCollectionReq customizedSetupReq = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        // highlight-next-line
        .property(Constant.TTL_SECONDS, "1209600")
        .build();
client.createCollection(customizedSetupReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const createCollectionReq = {
    collection_name: "my_collection",
    schema: schema,
    // highlight-start
    properties: {
        "collection.ttl.seconds": 1209600
    }
    // highlight-end
}
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("my_collection", schema).
    WithProperty(common.CollectionTTLConfigKey, 1209600)) //  TTL in seconds
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
```

</TabItem>

<TabItem value='bash'>

```bash
export params='{
    "ttlSeconds": 1209600
}'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

### 既存のコレクションにTTLを設定\{#set-ttl-for-an-existing-collection}

以下のコードスニペットは、既存のコレクションのTTLプロパティを変更する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.alter_collection_properties(
    collection_name="my_collection",
    properties={"collection.ttl.seconds": 1209600}
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String, String> properties = new HashMap<>();
properties.put("collection.ttl.seconds", "1209600");

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
        "collection.ttl.seconds": 1209600
    }
})
```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").
    WithProperty(common.CollectionTTLConfigKey, 60))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_collection\",
    \"properties\": {
        \"collection.ttl.seconds\": 1209600
    }
}"
```

</TabItem>
</Tabs>

## TTL設定の削除\{#drop-ttl-setting}

コレクション内のデータを無期限に保持することにした場合、そのコレクションからTTL設定を単純に削除できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_collection_properties(
    collection_name="my_collection",
    property_keys=["collection.ttl.seconds"]
)
```

</TabItem>

<TabItem value='java'>

```java
propertyKeys = new String[1]
propertyKeys[0] = "collection.ttl.second"

DropCollectionReq dropCollectionReq = DropCollectionReq.builder()
        .collectionName("my_collection")
        .propertyKeys(propertyKeys)
        .build();

client.dropCollection(dropCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.dropCollectionProperties({
    collection_name: "my_collection",
    properties: ["collection.ttl.seconds"]
})
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
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \""my_collection"\",
    \"properties\": {
        \"collection.ttl.seconds\": 60
    }
}"
```

</TabItem>
</Tabs>