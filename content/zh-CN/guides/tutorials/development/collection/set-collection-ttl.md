---
title: "设置 Collection 生存时间 | Cloud"
slug: /set-collection-ttl
sidebar_label: "设置 Collection 生存时间"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 可以通过 Time-to-Live (TTL) 策略自动让 Entity 过期。过期的 Entity 会立刻停止出现在查询和搜索结果中，并会在下一次 Compaction 周期从存储中被物理删除——通常在 24 小时内完成。 | Cloud"
type: origin
token: NYFIwLbc7iFeMbkP7T4cFfXJnLT
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 设置 Collection 生存时间

Zilliz Cloud 可以通过 **Time-to-Live (TTL)** 策略自动让 Entity 过期。过期的 Entity 会立刻停止出现在查询和搜索结果中，并会在下一次 Compaction 周期从存储中被物理删除——通常在 24 小时内完成。

TTL 有两种模式：

- **Collection 级 TTL**——整个 Collection 中的所有 Entity 共用一个保留窗口，通过 `collection.ttl.seconds` 属性设置。

- **Entity 级 TTL**——每个 Entity 在专用的 `TIMESTAMPTZ` 字段中携带自己的绝对过期时间，并通过 `ttl_field` 属性将该字段标记为 TTL 字段。

## 限制\{#limits}

- 两种 TTL 模式互斥。一个 Collection 不能同时设置 `collection.ttl.seconds` 和 `ttl_field`。如需切换，请参见[在两种模式之间迁移](./set-collection-ttl#migrate-between-the-two-modes)。

- Collection 级 TTL 为整个 Collection 应用同一个保留窗口。如果某一行需要不同的生命周期，请使用 Entity 级 TTL。

- 用于 Entity 级 TTL 的字段必须是 `TIMESTAMPTZ` 类型。其他类型会被拒绝。

- 每个 Collection 只能有一个 TTL 字段。Schema 中可以包含多个 `TIMESTAMPTZ` 字段，但只能将其中一个指定为 `ttl_field`。

- 删除 `ttl_field` 不会让已过期的 Entity 重新出现。要恢复一个已过期的 Entity，需要使用 `NULL` 或未来的过期时间戳对其执行 Upsert。

## 概述\{#overview}

<details>

<summary>展开</summary>

### 何时使用 TTL\{#when-to-use-ttl}

当数据保留是一项**策略**时，TTL 是合适的工具——也就是说，您预先知道某些 Entity 最终应该被移除，并希望由集群自动执行这一策略，而不是由您编写定时任务。

典型场景包括：

- **时间窗口数据集。** 仅保留最近 N 天的日志、指标、事件或短期特征缓存。

- **多租户 Collection。** 同一个 Collection 中不同租户具有不同的保留窗口。

- **逐条数据保留策略。** IoT 流水线、文档存储或 MLOps 特征存储中的单文档生命周期。

- **冷热数据混合。** 短期 Entity 与长期 Entity 共存于同一个 Collection 中。

- **合规驱动的过期。** 类似 GDPR 的数据最小化场景，每条数据都携带自己的"删除截止时间"。

- **业务时间过期。** Entity 表示只在某个绝对时间点之前有效的数据，例如活动结束或会话过期。

<Admonition type="info" title="说明">

过期数据不会出现在搜索和查询结果中，并会在下一次数据压缩时删除。数据压缩间隔通常不会超过 24 小时。

</Admonition>

### TTL 模式\{#ttl-modes}

两种模式回答的是不同的数据保留问题：

- **Collection 级 TTL** 对每个 Entity 应用同一个保留时长。每个 Entity 会在 `insert_ts + ttl_seconds` 时过期。

- **Entity 级 TTL** 允许每个 Entity 在 `TIMESTAMPTZ` 字段中存储自己的绝对过期时间。该字段中的 `NULL` 表示该 Entity 永不过期。

一个 Collection 一次只能使用**一种**模式——两种模式互斥。在两种模式之间切换是一个多步骤操作；请参见[在两种模式之间迁移](https://file+.vscode-resource.vscode-cdn.net/Users/liyun/zilliz-docs-writer/milvus-3-0/entity-ttl/docs/set-collection-ttl.zh.md#Migrate-between-the-two-modes)。

您可以使用下表选择模式：

| **如果您的场景是……** | **使用** |
| --- | --- |
| Collection 中的每个 Entity 都应遵循相同的保留窗口 | Collection 级 TTL |
| 保留策略是"从插入时刻开始保留 N 秒" | Collection 级 TTL |
| 同一个 Collection 中不同 Entity 需要不同生命周期（按租户、冷热数据或逐文档控制） | Entity 级 TTL |
| 保留策略是绝对墙钟时间（例如 2027-01-01T00:00:00Z） | Entity 级 TTL |
| 保留策略由业务时间戳驱动，而不是由插入时间戳驱动 | Entity 级 TTL |
| 您希望在插入后刷新或延长 Entity 的生命周期 | Entity 级 TTL |
| 部分 Entity 应永不过期，而其他 Entity 应过期 | Entity 级 TTL（对永不过期的 Entity 使用 NULL） |

</details>

## 设置 Collection 级TTL\{#set-collection-ttl}

当 Collection 中的每个 Entity 都应遵循相同的保留窗口时，使用 Collection 级 TTL。

### 在新 Collection 上启用\{#enable-collection-ttl-on-a-new-collection}

在创建 Collection 时，通过 `properties` map 传入 `collection.ttl.seconds`（整数，单位为秒）。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/common"
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema().WithDynamicFieldEnabled(false).
        WithField(entity.NewField().WithName("id").WithIsAutoID(false).WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
        WithField(entity.NewField().WithName("vector").WithDataType(entity.FieldTypeFloatVector).WithDim(128))

indexOptions := []milvusclient.CreateIndexOption{
    milvusclient.NewCreateIndexOption("my_collection", "vector", index.NewAutoIndex(entity.COSINE)),
}

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("my_collection", schema).
    WithIndexOptions(indexOptions...).
    WithProperty(common.CollectionTTLConfigKey, 1209600)) // TTL in seconds
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

let schema = CollectionSchema::new()
    .enable_dynamic_field(false)
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(false))
    .add_field(FieldSchema::new().name("vector").data_type(DataType::FloatVector).dimension(128));

let index_params = vec![
    IndexParam::new().field_name("vector").index_type(IndexType::AutoIndex).metric_type(MetricType::Cosine),
];

client.create_collection(CreateCollectionRequest::builder()
    .collection_name("my_collection")
    .schema(schema)
    .index_params(index_params)
    .properties(std::collections::HashMap::from([("collection.ttl.seconds".to_string(), "1209600".to_string())]))
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField(milvus::FieldSchema("id", milvus::DataType::INT64, "", true, false));
schema->AddField(milvus::FieldSchema("vector", milvus::DataType::FLOAT_VECTOR).WithDimension(128));

std::vector<milvus::IndexDesc> indexes = {
    milvus::IndexDesc("vector", "vector", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)};

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                      .WithCollectionName("my_collection")
                                      .WithCollectionSchema(schema)
                                      .WithIndexes(std::move(indexes))
                                      .AddProperty(milvus::COLLECTION_TTL_SECONDS, "1209600"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
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
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

### 在已有 Collection 上启用\{#enable-collection-ttl-on-an-existing-collection}

调用 `alter_collection_properties` 并在 `properties` map 中传入 `collection.ttl.seconds`，即可为已在使用中的 Collection 启用 TTL。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.HasCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

// Assumes "my_collection" was created earlier without TTL.
if (!client.hasCollection(HasCollectionReq.builder().collectionName("my_collection").build())) {
    CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder().build();
    schema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64)
            .isPrimaryKey(true).autoID(false).build());
    schema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector)
            .dimension(128).build());
    IndexParam indexParam = IndexParam.builder().fieldName("vector")
            .indexType(IndexParam.IndexType.AUTOINDEX)
            .metricType(IndexParam.MetricType.COSINE).build();
    client.createCollection(CreateCollectionReq.builder()
            .collectionName("my_collection")
            .collectionSchema(schema)
            .indexParams(Collections.singletonList(indexParam))
            .build());
}

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

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/common"
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

// Assumes "my_collection" was created earlier without TTL.
exists, err := client.HasCollection(ctx, milvusclient.NewHasCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
if !exists {
    schema := entity.NewSchema().WithDynamicFieldEnabled(false).
            WithField(entity.NewField().WithName("id").WithIsAutoID(false).WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
            WithField(entity.NewField().WithName("vector").WithDataType(entity.FieldTypeFloatVector).WithDim(128))
    indexOptions := []milvusclient.CreateIndexOption{
        milvusclient.NewCreateIndexOption("my_collection", "vector", index.NewAutoIndex(entity.COSINE)),
    }
    err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithIndexOptions(indexOptions...))
    if err != nil {
        fmt.Println(err.Error())
        // handle error
    }
}

err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").
    WithProperty(common.CollectionTTLConfigKey, 1209600))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

let has = client.has_collection(HasCollectionRequest::builder()
    .collection_name("my_collection")
    .build()?).await?;
if !has.exists() {
    let schema = CollectionSchema::new()
        .enable_dynamic_field(false)
        .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(false))
        .add_field(FieldSchema::new().name("vector").data_type(DataType::FloatVector).dimension(128));
    let index_params = vec![
        IndexParam::new().field_name("vector").index_type(IndexType::AutoIndex).metric_type(MetricType::Cosine),
    ];
    client.create_collection(CreateCollectionRequest::builder()
        .collection_name("my_collection")
        .schema(schema)
        .index_params(index_params)
        .build()?).await?;
}

client.alter_collection_properties(AlterCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .properties(std::collections::HashMap::from([("collection.ttl.seconds".to_string(), "1209600".to_string())]))
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

milvus::HasCollectionResponse has_response;
status = client->HasCollection(milvus::HasCollectionRequest()
                                   .WithCollectionName("my_collection"),
                               has_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
if (!has_response.Has()) {
    milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
    schema->AddField(milvus::FieldSchema("id", milvus::DataType::INT64, "", true, false));
    schema->AddField(milvus::FieldSchema("vector", milvus::DataType::FLOAT_VECTOR).WithDimension(128));
    std::vector<milvus::IndexDesc> indexes = {
        milvus::IndexDesc("vector", "vector", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)};
    status = client->CreateCollection(milvus::CreateCollectionRequest()
                                          .WithCollectionName("my_collection")
                                          .WithCollectionSchema(schema)
                                          .WithIndexes(std::move(indexes)));
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
    }
}

status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                               .WithCollectionName("my_collection")
                                               .AddProperty(milvus::COLLECTION_TTL_SECONDS, "1209600"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

// Assumes "my_collection" was created earlier without TTL.
if (!(await client.hasCollection({ collection_name: "my_collection" })).value) {
  await client.createCollection({
    collection_name: "my_collection",
    fields: [
      { name: "id", data_type: DataType.Int64, is_primary_key: true, autoID: false },
      { name: "vector", data_type: DataType.FloatVector, dim: 128 },
    ],
    index_params: [
      { field_name: "vector", index_type: "AUTOINDEX", metric_type: "COSINE" },
    ],
  });
}

// highlight-start
await client.alterCollectionProperties({
  collection_name: "my_collection",
  properties: { "collection.ttl.seconds": 1209600 },
});
// highlight-end
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
        "autoId": false,
        "enableDynamicField": false,
        "fields": [
            {
                "fieldName": "id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "vector",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "128"
                }
            }
        ]
    }'

export indexParams='[
        {
            "fieldName": "vector",
            "metricType": "COSINE",
            "indexName": "vector",
            "indexType": "AUTOINDEX"
        }
    ]'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# Assumes "my_collection" was created earlier without TTL.
if ! curl --silent --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/has" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_collection\"
}" | grep -q '"has":true'; then
    curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    --header "Request-Timeout: 10" \
    -d "{
        \"collectionName\": \"my_collection\",
        \"schema\": $schema,
        \"indexParams\": $indexParams
    }"
fi

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"properties\": {
        \"collection.ttl.seconds\": 1209600
    }
}"
```

</TabItem>
</Tabs>

### 删除 TTL 设置\{#drop-the-collection-ttl-setting}

如果您决定无限期保留某个 Collection 中的数据，只需删除该 Collection 上的 TTL 设置即可。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/common"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

err = client.DropCollectionProperties(ctx, milvusclient.NewDropCollectionPropertiesOption("my_collection", common.CollectionTTLConfigKey))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

client.drop_collection_properties(DropCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .property_key("collection.ttl.seconds")
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

status = client->DropCollectionProperties(milvus::DropCollectionPropertiesRequest()
                                              .WithCollectionName("my_collection")
                                              .AddPropertyKey(milvus::COLLECTION_TTL_SECONDS));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
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

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"propertyKeys\": [
        \"collection.ttl.seconds\"
    ]
}"
```

</TabItem>
</Tabs>

## 设置 Entity 级 TTL\{#set-entity-ttl}

Entity 级 TTL 允许每个 Entity 携带自己的绝对过期时间。过期时间存储在您在 Schema 中声明的专用 `TIMESTAMPTZ` 字段中，并通过 `ttl_field` Collection 属性将该字段标记为 TTL 字段。

### 在新 Collection 上启用 | PRIVATE\{#enable-entity-ttl-on-a-new-collection}

在创建时启用 Entity 级 TTL，需要在同一个 `create_collection` 调用中完成两处新增：在 Schema 中加入一个 `TIMESTAMPTZ` 字段，并通过 `ttl_field` 属性指向该字段。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

schema = client.create_schema(enable_dynamic_field=False)
schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
# highlight-next-line
schema.add_field("expire_at", DataType.TIMESTAMPTZ, nullable=True)
schema.add_field("vector", DataType.FLOAT_VECTOR, dim=128)

index_params = client.prepare_index_params()
index_params.add_index(field_name="vector", index_type="AUTOINDEX",
                       metric_type="COSINE")

client.create_collection(
    collection_name="my_collection",
    schema=schema,
    index_params=index_params,
    # highlight-next-line
    properties={"ttl_field": "expire_at"},
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
// highlight-next-line
schema.addField(AddFieldReq.builder().fieldName("expire_at").dataType(DataType.Timestamptz)
        .isNullable(true).build());
schema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector)
        .dimension(128).build());

IndexParam indexParam = IndexParam.builder().fieldName("vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE).build();

// highlight-next-line
Map<String, String> properties = new HashMap<>();
// highlight-next-line
properties.put("ttl_field", "expire_at");

client.createCollection(CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .indexParams(Collections.singletonList(indexParam))
        .properties(properties)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

schema := entity.NewSchema().WithDynamicFieldEnabled(false).
        WithField(entity.NewField().WithName("id").WithIsAutoID(false).WithDataType(entity.FieldTypeInt64).WithIsPrimaryKey(true)).
        WithField(entity.NewField().WithName("expire_at").WithDataType(entity.FieldTypeTimestamptz).WithNullable(true)).
        WithField(entity.NewField().WithName("vector").WithDataType(entity.FieldTypeFloatVector).WithDim(128))

indexOptions := []milvusclient.CreateIndexOption{
    milvusclient.NewCreateIndexOption("my_collection", "vector", index.NewAutoIndex(entity.COSINE)),
}

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("my_collection", schema).
    WithIndexOptions(indexOptions...).
    WithProperty("ttl_field", "expire_at"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

let schema = CollectionSchema::new()
    .enable_dynamic_field(false)
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(false))
    .add_field(FieldSchema::new().name("expire_at").data_type(DataType::Timestamptz).nullable(true))
    .add_field(FieldSchema::new().name("vector").data_type(DataType::FloatVector).dimension(128));

let index_params = vec![
    IndexParam::new().field_name("vector").index_type(IndexType::AutoIndex).metric_type(MetricType::Cosine),
];

client.create_collection(CreateCollectionRequest::builder()
    .collection_name("my_collection")
    .schema(schema)
    .index_params(index_params)
    .properties(std::collections::HashMap::from([("ttl_field".to_string(), "expire_at".to_string())]))
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->AddField(milvus::FieldSchema("id", milvus::DataType::INT64, "", true, false));
schema->AddField(milvus::FieldSchema("expire_at", milvus::DataType::TIMESTAMPTZ).WithNullable(true));
schema->AddField(milvus::FieldSchema("vector", milvus::DataType::FLOAT_VECTOR).WithDimension(128));

std::vector<milvus::IndexDesc> indexes = {
    milvus::IndexDesc("vector", "vector", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE)};

status = client->CreateCollection(milvus::CreateCollectionRequest()
                                      .WithCollectionName("my_collection")
                                      .WithCollectionSchema(schema)
                                      .WithIndexes(std::move(indexes))
                                      .AddProperty("ttl_field", "expire_at"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
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
    // highlight-next-line
    { name: "expire_at", data_type: DataType.Timestamptz, nullable: true },
    { name: "vector", data_type: DataType.FloatVector, dim: 128 },
  ],
  index_params: [
    { field_name: "vector", index_type: "AUTOINDEX", metric_type: "COSINE" },
  ],
  // highlight-next-line
  properties: { ttl_field: "expire_at" },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
        "autoId": false,
        "enableDynamicField": false,
        "fields": [
            {
                "fieldName": "id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "expire_at",
                "dataType": "Timestamptz",
                "nullable": true
            },
            {
                "fieldName": "vector",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "128"
                }
            }
        ]
    }'

export indexParams='[
        {
            "fieldName": "vector",
            "metricType": "COSINE",
            "indexName": "vector",
            "indexType": "AUTOINDEX"
        }
    ]'

export params='{
    "ttlField": "expire_at"
}'

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"indexParams\": $indexParams,
    \"params\": $params
}"
```

</TabItem>
</Tabs>

Collection 创建完成后，写入 Entity 时使用 [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) 格式的时间戳字符串。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
import random
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Assumes "my_collection" was created earlier with `ttl_field`: "expire_at"
# highlight-start
rows = [
    # Never expires
    {"id": 1, "expire_at": None,
     "vector": [random.random() for _ in range(128)]},
    # Expires at 2026-12-31 UTC midnight
    {"id": 2, "expire_at": "2026-12-31T00:00:00Z",
     "vector": [random.random() for _ in range(128)]},
    # Shanghai local time — normalized to UTC internally
    {"id": 3, "expire_at": "2027-01-01T00:00:00+08:00",
     "vector": [random.random() for _ in range(128)]},
]

client.insert("my_collection", rows)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import com.google.gson.Gson;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.InsertReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

// Assumes "my_collection" was created earlier with `ttl_field`: "expire_at".
Gson gson = new Gson();
Random rng = new Random();

List<Float> vector = new ArrayList<>();
for (int i = 0; i < 128; i++) vector.add(rng.nextFloat());

// highlight-start
List<JsonObject> rows = new ArrayList<>();

// Never expires
JsonObject r1 = new JsonObject();
r1.addProperty("id", 1);
r1.add("expire_at", JsonNull.INSTANCE);
r1.add("vector", gson.toJsonTree(vector));
rows.add(r1);

// Expires at 2026-12-31 UTC midnight
JsonObject r2 = new JsonObject();
r2.addProperty("id", 2);
r2.addProperty("expire_at", "2026-12-31T00:00:00Z");
r2.add("vector", gson.toJsonTree(vector));
rows.add(r2);

// Shanghai local time — normalized to UTC internally
JsonObject r3 = new JsonObject();
r3.addProperty("id", 3);
r3.addProperty("expire_at", "2027-01-01T00:00:00+08:00");
r3.add("vector", gson.toJsonTree(vector));
rows.add(r3);

client.insert(InsertReq.builder()
        .collectionName("my_collection")
        .data(rows)
        .build());
// highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "math/rand"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

// Assumes "my_collection" was created earlier with `ttl_field`: "expire_at".
vector1 := make([]float32, 128)
vector2 := make([]float32, 128)
vector3 := make([]float32, 128)
for i := range vector1 {
    vector1[i] = rand.Float32()
    vector2[i] = rand.Float32()
    vector3[i] = rand.Float32()
}

expireAt, err := column.NewNullableColumnTimestamptzIsoString("expire_at",
    []string{"2026-12-31T00:00:00Z", "2027-01-01T00:00:00+08:00"},
    []bool{false, true, true})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection",
    column.NewColumnInt64("id", []int64{1, 2, 3}),
    expireAt,
    column.NewColumnFloatVector("vector", 128, [][]float32{vector1, vector2, vector3}),
))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

let vector: Vec<f32> = (0..128).map(|_| rand::random::<f32>()).collect();
client.insert(InsertRequest::builder()
    .collection_name("my_collection")
    .rows(vec![
        serde_json::json!({"id": 1, "expire_at": serde_json::Value::Null, "vector": vector.clone()}),
        serde_json::json!({"id": 2, "expire_at": "2026-12-31T00:00:00Z", "vector": vector.clone()}),
        serde_json::json!({"id": 3, "expire_at": "2027-01-01T00:00:00+08:00", "vector": vector.clone()}),
    ])
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <cstdlib>
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

std::vector<float> vector(128);
for (auto& v : vector) {
    v = static_cast<float>(rand()) / RAND_MAX;
}
milvus::EntityRows rows;
rows.push_back({{"id", 1}, {"expire_at", nullptr}, {"vector", vector}});
rows.push_back({{"id", 2}, {"expire_at", "2026-12-31T00:00:00Z"}, {"vector", vector}});
rows.push_back({{"id", 3}, {"expire_at", "2027-01-01T00:00:00+08:00"}, {"vector", vector}});

milvus::InsertResponse response;
status = client->Insert(milvus::InsertRequest()
                            .WithCollectionName("my_collection")
                            .WithRowsData(std::move(rows)),
                        response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

const vector = Array.from({ length: 128 }, () => Math.random());

// Assumes "my_collection" was created earlier with `ttl_field`: "expire_at".
// highlight-start
await client.insert({
  collection_name: "my_collection",
  data: [
    // Never expires
    { id: 1, expire_at: null, vector },
    // Expires at 2026-12-31 UTC midnight
    { id: 2, expire_at: "2026-12-31T00:00:00Z", vector },
    // Shanghai local time — normalized to UTC internally
    { id: 3, expire_at: "2027-01-01T00:00:00+08:00", vector },
  ],
});
// highlight-end
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"data\": [
        {\"id\": 1, \"expire_at\": null, \"vector\": [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]},
        {\"id\": 2, \"expire_at\": \"2026-12-31T00:00:00Z\", \"vector\": [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6]},
        {\"id\": 3, \"expire_at\": \"2027-01-01T00:00:00+08:00\", \"vector\": [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7]}
    ]
}"
```

</TabItem>
</Tabs>

在每次查询和向量搜索时，服务器都会自动注入 TTL 过滤条件——您无需自己编写，过期 Entity 也永远不会出现在结果中：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

client.load_collection("my_collection")

# highlight-start
# Expired rows are filtered out automatically
results = client.query(
    collection_name="my_collection",
    filter="id >= 0",
    output_fields=["id", "expire_at"],
    limit=10,
)
print(results)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Arrays;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.LoadCollectionReq;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

client.loadCollection(LoadCollectionReq.builder()
        .collectionName("my_collection")
        .build());

// highlight-start
// Expired rows are filtered out automatically
QueryResp results = client.query(QueryReq.builder()
        .collectionName("my_collection")
        .filter("id >= 0")
        .outputFields(Arrays.asList("id", "expire_at"))
        .limit(10L)
        .build());
System.out.println(results.getQueryResults());
// highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

_, err = client.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

// Expired rows are filtered out automatically
resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("id >= 0").
    WithOutputFields("id", "expire_at").
    WithLimit(10))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(resultSet.GetColumn("id"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

client.load_collection(LoadCollectionRequest::builder()
    .collection_name("my_collection")
    .build()?).await?;

let results = client.query(QueryRequest::builder()
    .collection_name("my_collection")
    .filter("id >= 0")
    .output_fields(["id", "expire_at"])
    .limit(10)
    .build()?).await?;
println!("{:?}", results);
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

status = client->LoadCollection(milvus::LoadCollectionRequest()
                                    .WithCollectionName("my_collection"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::QueryResponse response;
status = client->Query(milvus::QueryRequest()
                           .WithCollectionName("my_collection")
                           .WithFilter("id >= 0")
                           .WithOutputFields({"id", "expire_at"})
                           .WithLimit(10),
                       response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
milvus::EntityRows rows;
response.Results().OutputRows(rows);
std::cout << rows.size() << " rows" << std::endl;
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

await client.loadCollection({ collection_name: "my_collection" });

// highlight-start
// Expired rows are filtered out automatically
const results = await client.query({
  collection_name: "my_collection",
  filter: "id >= 0",
  output_fields: ["id", "expire_at"],
  limit: 10,
});
console.log(results.data);
// highlight-end
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\"
}"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"filter\": \"id >= 0\",
    \"outputFields\": [\"id\", \"expire_at\"],
    \"limit\": 10
}"
```

</TabItem>
</Tabs>

同样的自动过滤也适用于 `client.search()`。

要在 Compaction 物理删除某个 Entity 之前延长其生命周期，可以使用更晚的过期时间戳（或 `None`）执行 Upsert，使该 Entity 重新回到可查询 Collection 中。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
import random
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.upsert("my_collection", [
    {"id": 2,
     "vector": [random.random() for _ in range(128)],
     "expire_at": "2028-01-01T00:00:00Z"},
])
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.UpsertReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

Gson gson = new Gson();
Random rng = new Random();
List<Float> vector = new ArrayList<>();
for (int i = 0; i < 128; i++) vector.add(rng.nextFloat());

// highlight-start
JsonObject row = new JsonObject();
row.addProperty("id", 2);
row.add("vector", gson.toJsonTree(vector));
row.addProperty("expire_at", "2028-01-01T00:00:00Z");

client.upsert(UpsertReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(row))
        .build());
// highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "math/rand"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

vector := make([]float32, 128)
for i := range vector {
    vector[i] = rand.Float32()
}

_, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection",
    column.NewColumnInt64("id", []int64{2}),
    column.NewColumnFloatVector("vector", 128, [][]float32{vector}),
    column.NewColumnTimestamptzIsoString("expire_at", []string{"2028-01-01T00:00:00Z"}),
))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

let vector: Vec<f32> = (0..128).map(|_| rand::random::<f32>()).collect();
client.upsert(UpsertRequest::builder()
    .insert(InsertRequest::builder()
        .collection_name("my_collection")
        .rows(vec![
            serde_json::json!({"id": 2, "vector": vector, "expire_at": "2028-01-01T00:00:00Z"}),
        ])
        .build()?)
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <cstdlib>
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

std::vector<float> vector(128);
for (auto& v : vector) {
    v = static_cast<float>(rand()) / RAND_MAX;
}
milvus::EntityRows rows;
rows.push_back({{"id", 2}, {"vector", vector}, {"expire_at", "2028-01-01T00:00:00Z"}});

milvus::UpsertResponse response;
status = client->Upsert(milvus::UpsertRequest()
                            .WithCollectionName("my_collection")
                            .WithRowsData(std::move(rows)),
                        response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

const vector = Array.from({ length: 128 }, () => Math.random());

// highlight-start
await client.upsert({
  collection_name: "my_collection",
  data: [
    { id: 2, vector, expire_at: "2028-01-01T00:00:00Z" },
  ],
});
// highlight-end
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/upsert" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"data\": [
        {\"id\": 2, \"vector\": [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8], \"expire_at\": \"2028-01-01T00:00:00Z\"}
    ]
}"
```

</TabItem>
</Tabs>

### 在已有 Collection 上启用\{#enable-entity-ttl-on-an-existing-collection}

如果 Collection 已存在且未设置 `collection.ttl.seconds`，可使用 `add_collection_field` 新增一个 `TIMESTAMPTZ` 字段，然后通过 `alter_collection_properties` 将其标记为 TTL 字段。可选地，对历史数据执行 Upsert 来回填过期时间戳——未回填的行保持为 `NULL`，将永不过期。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
import random
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
# Step 1 — add a TIMESTAMPTZ column to the schema
client.add_collection_field(
    collection_name="my_collection",
    field_name="expire_at",
    data_type=DataType.TIMESTAMPTZ,
    nullable=True,
)

# Step 2 — mark the new column as the TTL field
client.alter_collection_properties(
    collection_name="my_collection",
    properties={"ttl_field": "expire_at"},
)

# Step 3 (optional) — backfill expiration timestamps for historical rows
client.upsert("my_collection", [
    {"id": 1,
     "vector": [random.random() for _ in range(128)],
     "expire_at": "2026-12-31T00:00:00Z"},
])
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionFieldReq;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;
import io.milvus.v2.service.vector.request.UpsertReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

// highlight-start
// Step 1 — add a TIMESTAMPTZ column to the schema
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("expire_at")
        .dataType(DataType.Timestamptz)
        .isNullable(true)
        .build());

// Step 2 — mark the new column as the TTL field
Map<String, String> properties = new HashMap<>();
properties.put("ttl_field", "expire_at");
client.alterCollectionProperties(AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .properties(properties)
        .build());

// Step 3 (optional) — backfill expiration timestamps for historical rows
Gson gson = new Gson();
Random rng = new Random();
List<Float> vector = new ArrayList<>();
for (int i = 0; i < 128; i++) vector.add(rng.nextFloat());

JsonObject row = new JsonObject();
row.addProperty("id", 1);
row.add("vector", gson.toJsonTree(vector));
row.addProperty("expire_at", "2026-12-31T00:00:00Z");

client.upsert(UpsertReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(row))
        .build());
// highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "math/rand"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

// Step 1 — add a TIMESTAMPTZ column to the schema
err = client.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("my_collection",
    entity.NewField().WithName("expire_at").WithDataType(entity.FieldTypeTimestamptz).WithNullable(true)))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

// Step 2 — mark the new column as the TTL field
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").
    WithProperty("ttl_field", "expire_at"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

// Step 3 (optional) — backfill expiration timestamps for historical rows
vector := make([]float32, 128)
for i := range vector {
    vector[i] = rand.Float32()
}
_, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection",
    column.NewColumnInt64("id", []int64{1}),
    column.NewColumnFloatVector("vector", 128, [][]float32{vector}),
    column.NewColumnTimestamptzIsoString("expire_at", []string{"2026-12-31T00:00:00Z"}),
))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

// Step 1 — add a TIMESTAMPTZ column to the schema
client.add_collection_field(AddCollectionFieldRequest::builder()
    .collection_name("my_collection")
    .field(FieldSchema::new().name("expire_at").data_type(DataType::Timestamptz).nullable(true))
    .build()?).await?;

// Step 2 — mark the new column as the TTL field
client.alter_collection_properties(AlterCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .properties(std::collections::HashMap::from([("ttl_field".to_string(), "expire_at".to_string())]))
    .build()?).await?;

// Step 3 (optional) — backfill expiration timestamps for historical rows
let vector: Vec<f32> = (0..128).map(|_| rand::random::<f32>()).collect();
client.upsert(UpsertRequest::builder()
    .insert(InsertRequest::builder()
        .collection_name("my_collection")
        .rows(vec![
            serde_json::json!({"id": 1, "vector": vector, "expire_at": "2026-12-31T00:00:00Z"}),
        ])
        .build()?)
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <cstdlib>
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

// Step 1 — add a TIMESTAMPTZ column to the schema
status = client->AddCollectionField(milvus::AddCollectionFieldRequest()
                                        .WithCollectionName("my_collection")
                                        .WithField(std::move(milvus::FieldSchema("expire_at", milvus::DataType::TIMESTAMPTZ).WithNullable(true))));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Step 2 — mark the new column as the TTL field
status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                               .WithCollectionName("my_collection")
                                               .AddProperty("ttl_field", "expire_at"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Step 3 (optional) — backfill expiration timestamps for historical rows
std::vector<float> vector(128);
for (auto& v : vector) {
    v = static_cast<float>(rand()) / RAND_MAX;
}
milvus::EntityRows rows;
rows.push_back({{"id", 1}, {"vector", vector}, {"expire_at", "2026-12-31T00:00:00Z"}});
milvus::UpsertResponse response;
status = client->Upsert(milvus::UpsertRequest()
                            .WithCollectionName("my_collection")
                            .WithRowsData(std::move(rows)),
                        response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

const vector = Array.from({ length: 128 }, () => Math.random());

// highlight-start
// Step 1 — add a TIMESTAMPTZ column to the schema
await client.addCollectionField({
  collection_name: "my_collection",
  field: { name: "expire_at", data_type: DataType.Timestamptz, nullable: true },
});

// Step 2 — mark the new column as the TTL field
await client.alterCollectionProperties({
  collection_name: "my_collection",
  properties: { ttl_field: "expire_at" },
});

// Step 3 (optional) — backfill expiration timestamps for historical rows
await client.upsert({
  collection_name: "my_collection",
  data: [
    { id: 1, vector, expire_at: "2026-12-31T00:00:00Z" },
  ],
});
// highlight-end
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# Step 1 — add a TIMESTAMPTZ column to the schema
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/fields/add" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"fieldName\": \"expire_at\",
    \"dataType\": \"Timestamptz\",
    \"nullable\": true
}"

# Step 2 — mark the new column as the TTL field
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"properties\": {
        \"ttl_field\": \"expire_at\"
    }
}"
# Step 3 (optional) — backfill expiration timestamps for historical rows
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/upsert" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"data\": [
        {\"id\": 1, \"vector\": [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9], \"expire_at\": \"2026-12-31T00:00:00Z\"}
    ]
}"
```

</TabItem>
</Tabs>

### 删除 TTL 设置\{#drop-the-entity-ttl-setting}

调用 `drop_collection_properties` 并在 `property_keys` 中传入 `ttl_field`，即可停用逐条 Entity 过期。`TIMESTAMPTZ` 字段本身仍保留在 Schema 中——您仍然可以将其作为普通字段进行查询。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# highlight-start
client.drop_collection_properties(
    collection_name="my_collection",
    property_keys=["ttl_field"],
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
        .propertyKeys(Collections.singletonList("ttl_field"))
        .build());
// highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

err = client.DropCollectionProperties(ctx, milvusclient.NewDropCollectionPropertiesOption("my_collection", "ttl_field"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

client.drop_collection_properties(DropCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .property_key("ttl_field")
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

status = client->DropCollectionProperties(milvus::DropCollectionPropertiesRequest()
                                              .WithCollectionName("my_collection")
                                              .AddPropertyKey("ttl_field"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

// highlight-start
await client.dropCollectionProperties({
  collection_name: "my_collection",
  properties: ["ttl_field"],
});
// highlight-end
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop_properties" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d "{
    \"collectionName\": \"my_collection\",
    \"propertyKeys\": [
        \"ttl_field\"
    ]
}"
```

</TabItem>
</Tabs>

删除 `ttl_field` 会使后续查询不再自动应用 TTL 过滤，但已经过期的 Entity 不会自动重新出现。要让一个已过期的 Entity 重新可见，需要使用 `None` 或未来的过期时间戳对其执行 Upsert——这是在同一次 load 会话中恢复对已过期数据访问的唯一方式。

## 在两种模式之间迁移 | PRIVATE \{#migrate-between-the-two-modes}

### 从 Collection 级切换到 Entity 级 TTL\{#switch-from-collection-to entity-ttl}

如果您的 Collection 是使用 `collection.ttl.seconds` 创建的，希望切换为逐条 Entity 过期，请按以下四步执行。跳过 Step 1 会导致 Step 3 报错 `collection TTL is already set, cannot be set ttl field`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
import random
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Assumes "my_collection" already exists with `collection.ttl.seconds` set.
# highlight-start
# Step 1 — disable collection-level TTL (mandatory; the two modes are mutually exclusive)
client.drop_collection_properties(
    collection_name="my_collection",
    property_keys=["collection.ttl.seconds"],
)

# Step 2 — add a TIMESTAMPTZ column to the schema
client.add_collection_field(
    collection_name="my_collection",
    field_name="expire_at",
    data_type=DataType.TIMESTAMPTZ,
    nullable=True,
)

# Step 3 — set the ttl_field property on the column you just added
client.alter_collection_properties(
    collection_name="my_collection",
    properties={"ttl_field": "expire_at"},
)

# Step 4 (optional) — backfill expiration timestamps for historical entities
client.upsert("my_collection", [
    {"id": 1,
     "vector": [random.random() for _ in range(128)],
     "expire_at": "2026-12-31T00:00:00Z"},
])
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionFieldReq;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;
import io.milvus.v2.service.collection.request.DropCollectionPropertiesReq;
import io.milvus.v2.service.vector.request.UpsertReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

// Assumes "my_collection" already exists with `collection.ttl.seconds` set.
// highlight-start
// Step 1 — disable collection-level TTL (mandatory; the two modes are mutually exclusive)
client.dropCollectionProperties(DropCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .propertyKeys(Collections.singletonList("collection.ttl.seconds"))
        .build());

// Step 2 — add a TIMESTAMPTZ column to the schema
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("expire_at")
        .dataType(DataType.Timestamptz)
        .isNullable(true)
        .build());

// Step 3 — set the ttl_field property on the column you just added
Map<String, String> ttlField = new HashMap<>();
ttlField.put("ttl_field", "expire_at");
client.alterCollectionProperties(AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .properties(ttlField)
        .build());

// Step 4 (optional) — backfill expiration timestamps for historical entities
Gson gson = new Gson();
Random rng = new Random();
List<Float> vector = new ArrayList<>();
for (int i = 0; i < 128; i++) vector.add(rng.nextFloat());

JsonObject row = new JsonObject();
row.addProperty("id", 1);
row.add("vector", gson.toJsonTree(vector));
row.addProperty("expire_at", "2026-12-31T00:00:00Z");

client.upsert(UpsertReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(row))
        .build());
// highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "math/rand"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

// Step 1 — disable collection-level TTL (mandatory; the two modes are mutually exclusive)
err = client.DropCollectionProperties(ctx, milvusclient.NewDropCollectionPropertiesOption("my_collection", "collection.ttl.seconds"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

// Step 2 — add a TIMESTAMPTZ column to the schema
err = client.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("my_collection",
    entity.NewField().WithName("expire_at").WithDataType(entity.FieldTypeTimestamptz).WithNullable(true)))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

// Step 3 — set the ttl_field property on the column you just added
err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").
    WithProperty("ttl_field", "expire_at"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

// Step 4 (optional) — backfill expiration timestamps for historical entities
vector := make([]float32, 128)
for i := range vector {
    vector[i] = rand.Float32()
}
_, err = client.Upsert(ctx, milvusclient.NewColumnBasedInsertOption("my_collection",
    column.NewColumnInt64("id", []int64{1}),
    column.NewColumnFloatVector("vector", 128, [][]float32{vector}),
    column.NewColumnTimestamptzIsoString("expire_at", []string{"2026-12-31T00:00:00Z"}),
))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

// Step 1 — disable collection-level TTL (mandatory; the two modes are mutually exclusive)
client.drop_collection_properties(DropCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .property_key("collection.ttl.seconds")
    .build()?).await?;

// Step 2 — add a TIMESTAMPTZ column to the schema
client.add_collection_field(AddCollectionFieldRequest::builder()
    .collection_name("my_collection")
    .field(FieldSchema::new().name("expire_at").data_type(DataType::Timestamptz).nullable(true))
    .build()?).await?;

// Step 3 — set the ttl_field property on the column you just added
client.alter_collection_properties(AlterCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .properties(std::collections::HashMap::from([("ttl_field".to_string(), "expire_at".to_string())]))
    .build()?).await?;

// Step 4 (optional) — backfill expiration timestamps for historical entities
let vector: Vec<f32> = (0..128).map(|_| rand::random::<f32>()).collect();
client.upsert(UpsertRequest::builder()
    .insert(InsertRequest::builder()
        .collection_name("my_collection")
        .rows(vec![
            serde_json::json!({"id": 1, "vector": vector, "expire_at": "2026-12-31T00:00:00Z"}),
        ])
        .build()?)
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <cstdlib>
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

// Step 1 — disable collection-level TTL (mandatory; the two modes are mutually exclusive)
status = client->DropCollectionProperties(milvus::DropCollectionPropertiesRequest()
                                              .WithCollectionName("my_collection")
                                              .AddPropertyKey("collection.ttl.seconds"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Step 2 — add a TIMESTAMPTZ column to the schema
status = client->AddCollectionField(milvus::AddCollectionFieldRequest()
                                        .WithCollectionName("my_collection")
                                        .WithField(std::move(milvus::FieldSchema("expire_at", milvus::DataType::TIMESTAMPTZ).WithNullable(true))));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Step 3 — set the ttl_field property on the column you just added
status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                               .WithCollectionName("my_collection")
                                               .AddProperty("ttl_field", "expire_at"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Step 4 (optional) — backfill expiration timestamps for historical entities
std::vector<float> vector(128);
for (auto& v : vector) {
    v = static_cast<float>(rand()) / RAND_MAX;
}
milvus::EntityRows rows;
rows.push_back({{"id", 1}, {"vector", vector}, {"expire_at", "2026-12-31T00:00:00Z"}});
milvus::UpsertResponse response;
status = client->Upsert(milvus::UpsertRequest()
                            .WithCollectionName("my_collection")
                            .WithRowsData(std::move(rows)),
                        response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

// Assumes "my_collection" already exists with `collection.ttl.seconds` set.
// Step 1 — disable collection-level TTL (mandatory; the two modes are mutually exclusive)
await client.dropCollectionProperties({
  collection_name: "my_collection",
  properties: ["collection.ttl.seconds"],
});

// Step 2 — add a TIMESTAMPTZ column to the schema
await client.addCollectionField({
  collection_name: "my_collection",
  field: { name: "expire_at", data_type: DataType.Timestamptz, nullable: true },
});

// Step 3 — set the ttl_field property on the column you just added
await client.alterCollectionProperties({
  collection_name: "my_collection",
  properties: { ttl_field: "expire_at" },
});

// Step 4 (optional) — backfill expiration timestamps for historical entities
const vector = Array.from({ length: 128 }, () => Math.random());
await client.upsert({
  collection_name: "my_collection",
  data: [
    { id: 1, vector, expire_at: "2026-12-31T00:00:00Z" },
  ],
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/upsert" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"data\": [
        {\"id\": 2, \"vector\": [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8], \"expire_at\": \"2028-01-01T00:00:00Z\"}
    ]
}"
```

</TabItem>
</Tabs>

未回填 `expire_at` 的历史 Entity 在该字段中保持 `NULL`，即永不过期。只为应当具备有限生命周期的行回填即可。

### 从 Entity 级切换到 Collection 级 TTL\{#switch-from-entity-to-collection-ttl}

要反向迁移，删除 `ttl_field` 并设置 `collection.ttl.seconds`：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Assumes "my_collection" already exists with `ttl_field` set.
# highlight-start
client.drop_collection_properties(
    collection_name="my_collection",
    property_keys=["ttl_field"],
)
client.alter_collection_properties(
    collection_name="my_collection",
    properties={"collection.ttl.seconds": 1209600},  # 14 days
)
# highlight-end
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.AlterCollectionPropertiesReq;
import io.milvus.v2.service.collection.request.DropCollectionPropertiesReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

// Assumes "my_collection" already exists with `ttl_field` set.
// highlight-start
client.dropCollectionProperties(DropCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .propertyKeys(Collections.singletonList("ttl_field"))
        .build());

Map<String, String> properties = new HashMap<>();
properties.put("collection.ttl.seconds", "1209600"); // 14 days
client.alterCollectionProperties(AlterCollectionPropertiesReq.builder()
        .collectionName("my_collection")
        .properties(properties)
        .build());
// highlight-end
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/common"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

err = client.DropCollectionProperties(ctx, milvusclient.NewDropCollectionPropertiesOption("my_collection", "ttl_field"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = client.AlterCollectionProperties(ctx, milvusclient.NewAlterCollectionPropertiesOption("my_collection").
    WithProperty(common.CollectionTTLConfigKey, 1209600)) // 14 days
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")).await?;

client.drop_collection_properties(DropCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .property_key("ttl_field")
    .build()?).await?;

client.alter_collection_properties(AlterCollectionPropertiesRequest::builder()
    .collection_name("my_collection")
    .properties(std::collections::HashMap::from([("collection.ttl.seconds".to_string(), "1209600".to_string())]))
    .build()?).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

status = client->DropCollectionProperties(milvus::DropCollectionPropertiesRequest()
                                              .WithCollectionName("my_collection")
                                              .AddPropertyKey("ttl_field"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->AlterCollectionProperties(milvus::AlterCollectionPropertiesRequest()
                                               .WithCollectionName("my_collection")
                                               .AddProperty(milvus::COLLECTION_TTL_SECONDS, "1209600")); // 14 days
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

// Assumes "my_collection" already exists with `ttl_field` set.
await client.dropCollectionProperties({
  collection_name: "my_collection",
  properties: ["ttl_field"],
});

await client.alterCollectionProperties({
  collection_name: "my_collection",
  properties: { "collection.ttl.seconds": 1209600 }, // 14 days
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# Step 1 — disable collection-level TTL (mandatory; the two modes are mutually exclusive)
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop_properties" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"propertyKeys\": [
        \"collection.ttl.seconds\"
    ]
}"

# Step 2 — add a TIMESTAMPTZ column to the schema
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/fields/add" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"fieldName\": \"expire_at\",
    \"dataType\": \"Timestamptz\",
    \"nullable\": true
}"

# Step 3 — set the ttl_field property on the column you just added
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"properties\": {
        \"ttl_field\": \"expire_at\"
    }
}"
# Step 3 (optional) — backfill expiration timestamps for historical rows
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/upsert" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"data\": [
        {\"id\": 1, \"vector\": [0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55], \"expire_at\": \"2026-12-31T00:00:00Z\"}
    ]
}"
```

</TabItem>
</Tabs>

## 常见问题\{#faqs}

### 插入 Collection 中的数据到底何时会根据 TTL 设置失效？\{#when-does-data-expire-due-to-ttl-settings}

Zilliz Cloud 会根据TTL 设置及数据的插入或更新时间来确定其失效时间。失效的数据将不会出现在任何搜索结果中。具体可参考[相关示例](./set-collection-ttl)。

### 失效数据何时会删除？\{#when-will-the-expired-data-be-physically-deleted}

当数据失效后，这些数据将不会出现在任何搜索结果中，但是，只有在 Zilliz Cloud 根据集群的数据压缩策略执行下一次压缩时，这些数据才会被删除。

如果您希望在数据失效后的较短时间内删除这些数据，请联系 [Zilliz Cloud 技术支持](https://support.zilliz.com.cn/hc/zh-cn/requests/new)。

### Zilliz Cloud 集群的 CU 容量何时会开始降低？\{#when-will-the-cu-capacity-decrease}

集群的 CU 容量会取内存使用量和存储使用量中的最大值。如果 CU 容量当前取的是存储使用量，您可以在失效数据被删除后，在 Zilliz Cloud 控制台中观察到 CU 容量的减少。

