---
title: "设置 Collection 生存时间 | Cloud"
slug: /set-collection-ttl
sidebar_key: set-collection-ttl
sidebar_label: "设置 Collection 生存时间"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "数据插入 Collection 后，默认情况下仍保留在该 Collection 中。但是，在某些情况下，您可能希望在一定期限后删除或清理数据。在这种情况下，您可以配置 Collection 的生存时间（TTL）属性，以便 Zilliz Cloud 在TTL到期后自动删除数据。 | Cloud"
type: origin
token: NYFIwLbc7iFeMbkP7T4cFfXJnLT
sidebar_position: 6
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 管理
  - 修改 collection
  - modify collection
  - rename collection
  - 重命名 collection
  - set collection properties
  - 设置 collection 属性
  - time-to-live
  - TTL

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 设置 Collection 生存时间

数据插入 Collection 后，默认情况下仍保留在该 Collection 中。但是，在某些情况下，您可能希望在一定期限后删除或清理数据。在这种情况下，您可以配置 Collection 的生存时间（TTL）属性，以便 Zilliz Cloud 在TTL到期后自动删除数据。

## 概述\{#overview}

生存时间（TTL）通常用于如下场景：数据库中的数据在插入或修改后只能保持有效或可访问一段时间。然后，数据需要被自动删除。 

例如，如果您希望所有插入某个 Collection 的数据仅需要保留 14 天，您就可以通过为该 Collection 配置生存时间属性来要求 Zilliz Cloud 在数据插入 **14 x 24 x 3600 = 1209600** 秒后自动删除数据。这就保证了 Collection 中只保存最多 14 天的数据。

<Admonition type="info" icon="📘" title="说明">

过期数据不会出现在搜索和查询结果中，并会在下一次数据压缩时删除。数据压缩间隔通常不会超过 24 小时。

</Admonition>

在 Zilliz Cloud 中， TTL 的值是一个单位为秒的正整数。一旦设置了该参数，所有生存时间超过该参数值的数据都会被删除。

值得注意的是，数据删除操作是异步的。这就意味着当某些数据超期后并不会马上被删除。在数据被删除和数据不可查之间有一定的延迟。这是由垃圾回收（GC）机制和数据压缩耗时决定的。Zilliz Cloud 会不定期的触发这些操作。

## 相关示例\{#examples}

总体来说，Collection 生存时间可能与 Collection 中开启 TTL 设置的时间、Entity 插入及更新时间有关。请务必阅读如下示例，以便更好地理解 Collection 生存时间的运作机制。

### 示例 1：在创建 Collection 时设置 TTL\{#example-1-set-ttl-upon-collection-creation}

在创建 Collection 时，您将 Collection 的 **TTL** 属性设置为 **2592000**（**30天**）。

在 **1 月 1 日 00:00**，您向 Collection 中插入了 **100 亿** Entity。此后，再未进行任何写操作。

那么在 **1 月 31 日 00:00 之后**，这 **100 亿** Entity 将不会再出现在任何搜索（Search）结果中。此时，您执行输出字段为 `count(*)` 的查询（Query）时，结果亦为 **0**。

### 示例 2：为既有 Collection 设置 TTL\{#example-2-set-ttl-for-an-existing-collection}

您已经创建了一个未设置 TTL 属性的 Collection。

在 **1 月 1 日 00:00**，您向 Collection 中插入了 **100 亿** Entity。

在 **1 月 31 日 00:00**，您又向该 Collection 中插入了 **200 亿** Entity。

在 **2 月 28 日 10:00**，您将该 Collection 的 TTL 属性设置为 **2592000**（**30天**）。

那么在 TTL 设置生效时，您在 1 月 1 日插入的 100 亿数据将立即变为不可查询。此时，您执行输出字段为 `count(*)` 的查询（Query）时，结果亦为 **200 亿**。

### 示例 3：Upsert entity\{#example-3-upsert-entities}

在创建 Collection 时，您将 Collection 的 **TTL** 属性设置为 **2592000**（**30天**）。

在 **1 月 1 日 00:00**，您向 Collection 中插入了 **200 亿** Entity。此后，再未进行任何写操作。

在 **1 月15 日 00:00** 至 **23:59:59** 间，您分批次的以合并的方式更新了这 **200 亿** Entity。此后，再未进行任何写操作。

在 **1 月 31 日** 到 **2 月 13 日**期间，这 **200 亿** Entity 仍旧可查询，并且在执行输出字段为 `count(*)` 的查询时，结果为 **200 亿**。

但从 **1 月 14 日 00:00** 起，Entity 数量逐渐减少，并在 **2 月 15 日 00:00** 时变为 **0**。

## 设置 TTL\{#set-ttl}

您可以在如下情况下设置 TTL

- [在创建 Collection 时](./set-collection-ttl#set-ttl-when-creating-a-collection)，或

- [需要修改指定 Collection 的 TTL 时](./set-collection-ttl#set-ttl-for-an-existing-collection)。

### 在创建 Collection 时设置 TTL\{#set-ttl-when-creating-a-collection}

如下示例演示了如何在创建 Collection 时设置 TTL。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema(auto_id=False, enable_dynamic_field=False)
schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("vector", DataType.FLOAT_VECTOR, dim=128)

index_params = client.prepare_index_params()
index_params.add_index(
    field_name="vector", index_type="AUTOINDEX", metric_type="COSINE"
)

client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params,
    # highlight-start
    properties={
        "collection.ttl.seconds": 1209600  # 14 days
    },
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder().build();
schema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64)
        .isPrimaryKey(true).autoID(false).build());
schema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector)
        .dimension(128).build());

IndexParam indexParam = IndexParam.builder().fieldName("vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE).build();

// highlight-start
Map<String, String> properties = new HashMap<>();
properties.put("collection.ttl.seconds", "1209600"); // 14 days

client.createCollection(CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(Collections.singletonList(indexParam))
        .properties(properties)
        .build());
// highlight-end
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

await client.createCollection({
  collection_name: "my_collection",
  fields: [
    { name: "id", data_type: DataType.Int64, is_primary_key: true, autoID: false },
    { name: "vector", data_type: DataType.FloatVector, dim: 128 },
  ],
  index_params: [
    { field_name: "vector", index_type: "AUTOINDEX", metric_type: "COSINE" },
  ],
  // highlight-start
  properties: {
    "collection.ttl.seconds": 1209600, // 14 days
  },
  // highlight-end
});
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

### 修改指定 Collection 的 TTL\{#set-ttl-for-an-existing-collection}

如下示例演示了如何修改指定 Collection 的 TTL。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Assumes "my_collection" was created earlier without TTL
schema = client.create_schema(auto_id=False, enable_dynamic_field=False)
schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("vector", DataType.FLOAT_VECTOR, dim=128)

index_params = client.prepare_index_params()
index_params.add_index(
    field_name="vector", index_type="AUTOINDEX", metric_type="COSINE"
)

if not client.has_collection("my_collection"):
    client.create_collection(
        collection_name="my_collection",
        schema=schema,
        index_params=index_params,
    )

# highlight-start
client.alter_collection_properties(
    collection_name="my_collection",
    properties={"collection.ttl.seconds": 1209600},
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.HashMap;
import java.util.Map;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

// Assumes "my_collection" was created earlier without TTL.

// highlight-start
Map<String, String> properties = new HashMap<>();
properties.put("collection.ttl.seconds", "1209600");

client.alterCollectionProperties(AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .properties(properties)
        .build());
// highlight-end
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

// Assumes "my_collection" was created earlier without TTL.
// highlight-start
await client.alterCollectionProperties({
  collection_name: "my_collection",
  properties: { "collection.ttl.seconds": 1209600 },
});
// highlight-end
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

## 重置 TTL\{#drop-ttl-setting}

如果您希望 Collection 中的数据能够永久保存，您可以通过重置 TTL 设置来实现这一点。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.drop_collection_properties(
    collection_name="my_collection",
    property_keys=["collection.ttl.seconds"],
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.DropCollectionPropertiesReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

// highlight-start
client.dropCollectionProperties(DropCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .propertyKeys(Collections.singletonList("collection.ttl.seconds"))
        .build());
// highlight-end
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

// highlight-start
await client.dropCollectionProperties({
  collection_name: "my_collection",
  properties: ["collection.ttl.seconds"],
});
// highlight-end
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
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_collection\",
    \"propertyKeys\": [
        \"collection.ttl.seconds\"
    ]
}"
```

</TabItem>
</Tabs>

## 常见问题\{#faqs}

### 插入 Collection 中的数据到底何时会根据 TTL 设置失效？\{#collection-ttl}

Zilliz Cloud 会根据TTL 设置及数据的插入或更新时间来确定其失效时间。失效的数据将不会出现在任何搜索结果中。具体可参考[相关示例](./set-collection-ttl#examples)。

### 失效数据何时会删除？\{#}

当数据失效后，这些数据将不会出现在任何搜索结果中，但是，只有在 Zilliz Cloud 根据集群的数据压缩策略执行下一次压缩时，这些数据才会被删除。

如果您希望在数据失效后的较短时间内删除这些数据，请联系 [Zilliz Cloud 技术支持](https://support.zilliz.com.cn/hc/zh-cn/requests/new)。

### Zilliz Cloud 集群的 CU 容量何时会开始降低？\{#zilliz-cloud-cu}

集群的 CU 容量会取内存使用量和存储使用量中的最大值。如果 CU 容量当前取的是存储使用量，您可以在失效数据被删除后，在 Zilliz Cloud 控制台中观察到 CU 容量的减少。

