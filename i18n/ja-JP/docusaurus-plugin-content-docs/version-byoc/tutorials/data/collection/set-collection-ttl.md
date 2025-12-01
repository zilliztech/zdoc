---
title: "コレクションTTLの設定 | BYOC"
slug: /set-collection-ttl
sidebar_label: "コレクションTTLの設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データがコレクションに挿入されると、デフォルトではそこに残り続けます。ただし、一定期間後にデータを削除またはクリーンアップしたい場合があります。このような場合、コレクションのTTL（Time-to-Live）プロパティを設定し、TTLが期限切れになったときにZilliz Cloudがデータを自動的に削除するようにできます。 | BYOC"
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
  - Faiss
  - ビデオ検索
  - AIの幻覚
  - AIエージェント

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションTTLの設定

データがコレクションに挿入されると、デフォルトではそこに残り続けます。ただし、一定期間後にデータを削除またはクリーンアップしたい場合があります。このような場合、コレクションのTTL（Time-to-Live）プロパティを設定し、TTLが期限切れになったときにZilliz Cloudがデータを自動的に削除するようにできます。

## 概要\{#overview}

TTL（Time-to-Live）は、データベースで一般的に使用される概念であり、挿入または変更後の一定期間のみデータの有効性またはアクセシビリティを維持すべきケースに使用されます。その後、データは自動的に削除されます。

例えば、毎日データをインジェストするが、過去14日間のレコードのみを保存する必要がある場合、コレクションのTTLを**14 × 24 × 3600 = 1209600**秒に設定することで、Zilliz Cloudがそれより古いすべてのデータを自動的に削除するように構成できます。これにより、コレクション内には直近14日分のデータのみが保持されることが保証されます。

<Admonition type="info" icon="📘" title="注意">

<p>期限切れのエンティティは検索またはクエリ結果には表示されません。ただし、データは後続のデータコンパクションが行われるまで（24時間以内に行われる予定）ストレージに残ることがあります。</p>

</Admonition>

Zilliz CloudコレクションのTTLプロパティは、秒単位の整数で指定されます。設定後、TTLを超えたデータはコレクションから自動的に削除されます。

削除プロセスは非同期であるため、指定されたTTLの経過後に検索結果からデータが正確に削除されるとは限りません。代わりに、ごみ集め（GC）およびコンパクションプロセスが不定期に行われるため、削除には遅延が生じることがあります。

## TTLの設定\{#set-ttl}

TTLプロパティは以下のタイミングで設定できます：

- [コレクション作成時](./set-collection-ttl#set-ttl-when-creating-a-collection)

- [既存コレクションのTTLプロパティの変更時](./set-collection-ttl#set-ttl-for-an-existing-collection)

### コレクション作成時のTTL設定\{#set-ttl-when-creating-a-collection}

以下のコードスニペットは、コレクション作成時にTTLプロパティを設定する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# TTL付き
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

// TTL付き
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
    // handle error
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

### 既存コレクションのTTL設定\{#set-ttl-for-an-existing-collection}

以下のコードスニペットは、既存のコレクションでTTLプロパティを変更する方法を示しています。

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
    // handle error
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

コレクション内のデータを無期限に保持することにした場合、そのコレクションからTTL設定を削除できます。

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
    // handle error
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
        \"collection.ttl.seconds\": 60
    }
}"
```

</TabItem>
</Tabs>