---
title: "セットコレクションTTL | BYOC"
slug: /set-collection-ttl
sidebar_label: "セットコレクションTTL"
beta: FALSE
notebook: FALSE
description: "データがコレクションに挿入されると、デフォルトではそのまま残ります。ただし、特定のシナリオでは、一定期間後にデータを削除またはクリーンアップする必要がある場合があります。そのような場合は、コレクションのTime-to-Live(TTL)プロパティを設定して、ZillizクラウドTTLが期限切れになると、データが自動的に削除されます。 | BYOC"
type: origin
token: GthGwnrpEiGpClkV5JXcgWUgn8c
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - collection ttl
  - time-to-live
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# セットコレクションTTL

データがコレクションに挿入されると、デフォルトではそのまま残ります。ただし、特定のシナリオでは、一定期間後にデータを削除またはクリーンアップする必要がある場合があります。そのような場合は、コレクションのTime-to-Live(TTL)プロパティを設定して、ZillizクラウドTTLが期限切れになると、データが自動的に削除されます。

## 概要について{#overview}

Time-to-Live(TTL)は、データが挿入または変更された後、一定期間のみ有効またはアクセス可能である必要がある場合に、データベースで一般的に使用されます。その後、データは自動的に削除されます。 

たとえば、毎日データを取り込むが、レコードを14日間だけ保持する必要がある場合は、設定できます。ZillizクラウドコレクションのTTLを**14×24×3600=1209600**秒に設定することで、それより古いデータを自動的に削除します。これにより、最新の14日間分のデータのみがコレクションに残ります。

<Admonition type="info" icon="📘" title="ノート">

<p>期限切れのエンティティは、検索またはクエリの結果に表示されません。ただし、次のデータ圧縮が24時間以内に実行されるまで、ストレージに残る可能性があります。</p>
<p>Milvus設定ファイルの<code>dataCoord.compaction.expiry.tolerance</code>設定項目を設定することで、データ圧縮をトリガーするタイミングを制御できます。</p>
<p>この設定項目のデフォルトは<code>-1</code>であり、既存のデータ圧縮間隔が適用されることを示しています。ただし、<code>12</code>のように値を正の整数に変更すると、エンティティが期限切れになってから指定された時間数後にデータ圧縮がトリガーされます。</p>
<p></include></p>

</Admonition>

TTLプロパティZillizクラウドcollectionは秒単位の整数で指定されます。設定されると、TTLを超えるデータは自動的にコレクションから削除されます。

削除過程が非同期であるため、指定されたTTLが経過した後にデータが検索結果から正確に削除されない場合があります。代わりに、非決定的な間隔で発生するガベージコレクション(GC)および圧縮プロセスに依存するため、遅延が発生する可能性があります。

## TTLを設定{#set-ttl}

TTLプロパティを設定できます

- [コレクションを作成します。](./set-collection-ttl#set-ttl-when-creating-a-collection)

- [既存のコレクションのTTLプロパティを変更します。](./set-collection-ttl#set-ttl-for-an-existing-collection)

### コレクション作成時にTTLを設定する{#set-ttl-when-creating-a-collection}

次のコードスニペットは、コレクションを作成するときにTTLプロパティを設定する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# With TTL
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

// With TTL
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

### 既存のコレクションにTTLを設定する{#set-ttl-for-an-existing-collection}

次のコードスニペットは、既存のコレクションのTTLプロパティを変更する方法を示しています。

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

## ドロップTTL設定{#drop-ttl-setting}

コレクション内のデータを無期限に保持する場合は、そのコレクションからTTL設定を削除することができます。

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
    \"collectionName\": \""my_collection"\",
    \"properties\": {
        \"collection.ttl.seconds\": 60
    }
}"
```

</TabItem>
</Tabs>

