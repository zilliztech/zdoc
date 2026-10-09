---
title: "Set Collection TTL | Cloud"
slug: /set-collection-ttl
sidebar_label: "TTL"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud can automatically expire entities through a Time-to-Live (TTL) policy. Expired entities stop appearing in query and search results immediately, and are physically removed from storage on the next compaction cycle — typically within 24 hours. | Cloud"
type: origin
token: GthGwnrpEiGpClkV5JXcgWUgn8c
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Set Collection TTL

Zilliz Cloud can automatically expire entities through a **Time-to-Live (TTL)** policy. Expired entities stop appearing in query and search results immediately, and are physically removed from storage on the next compaction cycle — typically within 24 hours.

There are two TTL modes:

- **Collection-level TTL** — one retention window shared by every entity, set through the `collection.ttl.seconds` property.

- **Entity-level TTL** — each entity carries its own absolute expiration time in a dedicated `TIMESTAMPTZ` field, marked as the TTL field through the `ttl_field` property.

<Admonition type="info" title="Notes">

This feature applies only to managed collections.

</Admonition>

## Limits\{#limits}

- The two TTL modes are mutually exclusive. A collection cannot have both `collection.ttl.seconds` and `ttl_field` set at the same time. To switch, see [Migrate between the two modes](./set-collection-ttl#migrate-between-the-two-modes).

- Collection-level TTL applies one window to the whole collection. If a single row needs a different lifetime, use entity-level TTL.

- The field for entity-level TTL must be `TIMESTAMPTZ`. Other types are rejected.

- One TTL field per collection. The schema may contain multiple `TIMESTAMPTZ` fields, but only one can be named in `ttl_field`.

- Dropping `ttl_field` does not resurface expired entities. To restore an expired entity, upsert it with a `NULL` or future expiration timestamp.

## Overview\{#overview}

<details>

<summary>Expand</summary>

### When to use TTL\{#when-to-use-ttl}

TTL is the right tool when retention is a **policy** — you know ahead of time that certain entities should eventually go away, and you want the cluster to enforce it without you writing a cron job.

Typical scenarios:

- **Time-windowed datasets.** Keep only the last N days of logs, metrics, events, or short-lived feature caches.

- **Multi-tenant collections.** Different tenants have different retention windows in the same collection.

- **Per-record retention policies.** Per-document lifetime in IoT pipelines, document stores, or MLOps feature stores.

- **Hot / cold data mix.** Short-lived entities coexist with long-term ones in the same collection.

- **Compliance-driven expiration.** GDPR-style data minimization where each record carries its own "delete by" date.

- **Business-time expiration.** An entity represents a record that is only valid until some absolute moment (a campaign ending, a session expiring).

<Admonition type="info" title="Notes">

Expired entities will not appear in any search or query results. However, they may stay in the storage until the subsequent data compaction, which should be carried out within the next 24 hours.

</Admonition>

### TTL modes\{#ttl-modes}

The two modes answer different retention questions:

- **Collection-level TTL** applies a single retention duration to every entity. Each entity expires at `insert_ts + ttl_seconds`.

- **Entity-level TTL** lets every entity store its own absolute expiration time in a `TIMESTAMPTZ` field. A `NULL` in that field means the entity never expires.

A collection uses **one** mode at a time — the two are mutually exclusive. Switching between them is a multi-step operation; see Migrate between the two modes.

Use this table to pick a mode:

| **If your situation is…** | **Use** |
| --- | --- |
| Every entity in the collection should follow the same retention window | Collection-level TTL |
| Retention is "from the moment of insert, keep N seconds" | Collection-level TTL |
| Different entities need different lifetimes in the same collection (per-tenant, hot/cold, per-document) | Entity-level TTL |
| Retention is an absolute wall-clock time (for example, 2027-01-01T00:00:00Z) | Entity-level TTL |
| Retention is driven by a business timestamp, not the insert timestamp | Entity-level TTL |
| You want to refresh or extend an entity's lifetime after insert | Entity-level TTL |
| Some entities should never expire while others should | Entity-level TTL (use NULL for the immortal ones) |

</details>

## Set collection-level TTL\{#set-collection-level-ttl}

Use collection-level TTL when every entity in the collection should follow the same retention window.

### Enable on a new collection\{#enable-on-a-new-collection}

Pass `collection.ttl.seconds` (integer, in seconds) through the `properties` map at creation time.

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

export params='{
    "ttlSeconds": "1209600"
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

### Enable on an existing collection\{#enable-on-an-existing-collection}

Call `alter_collection_properties` with `collection.ttl.seconds` in the `properties` map to apply TTL to a collection that is already in use.

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
        \"collection.ttl.seconds\": \"1209600\"
    }
}"
```

</TabItem>
</Tabs>

### Drop the TTL setting\{#drop-the-ttl-setting}

If you decide to keep the data in a collection indefinitely, you can simply drop the TTL setting from that collection.

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
        \"collection.ttl.seconds\"
    ]
}"
```

</TabItem>
</Tabs>

## Set entity-level TTL | ONDEMAND\{#set-entity-level-ttl}

Entity-level TTL lets each entity carry its own absolute expiration time. The time is stored in a dedicated `TIMESTAMPTZ` column that you declare in the schema, and you mark that column as the TTL field through the `ttl_field` collection property.

### Enable on a new collection\{#enable-on-a-new-collection}

Enabling entity-level TTL at creation time takes two additions in the same `create_collection` call: a `TIMESTAMPTZ` field in the schema, and the `ttl_field` property pointing to that field.

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

Once the collection exists, insert entities with [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) timestamp strings.

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

On every query and vector search, the server auto-injects the TTL filter — you never write one yourself, and expired entities never appear in the results:

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

The same auto-filter applies to `client.search()`.

To extend an entity's lifetime before compaction physically removes it, upsert with a later expiration timestamp — or `None` — to return the entity to the queryable set.

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

### Enable on an existing collection\{#enable-on-an-existing-collection}

If the collection already exists and does not have `collection.ttl.seconds` set, add a `TIMESTAMPTZ` column with `add_collection_field`, then mark it as the TTL field with `alter_collection_properties`. Optionally upsert historical rows to backfill their expiration timestamps — rows you do not backfill keep `NULL` and never expire.

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
    \"schema\": {
        \"fieldName\": \"expire_at\",
        \"dataType\": \"Timestamptz\",
        \"nullable\": true
    }
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

### Drop the TTL setting\{#drop-the-ttl-setting}

Call `drop_collection_properties` with `ttl_field` in `property_keys` to stop per-entity expiration. The `TIMESTAMPTZ` column itself remains on the schema — you can still query on it as a regular field.

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

Dropping `ttl_field` disables the automatic filter for future queries, but entities that had already expired are not automatically surfaced again. To make a previously-expired entity visible, upsert it with a `None` or future expiration timestamp — that is the only way to restore access to expired rows within the same load session.

## Migrate between the two modes | PRIVATE\{#migrate-between-the-two-modes}

The two TTL modes are mutually exclusive, so switching between them is a multi-step operation.

### Switch from collection-level to entity-level TTL\{#switch-from-collection-level-to-entity-level-ttl}

If your collection was created with `collection.ttl.seconds` and you want to switch to per-entity expiration, follow these four steps. Skipping Step 1 causes Step 3 to fail with `collection TTL is already set, cannot be set ttl field`.

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
    \"schema\": {
        \"fieldName\": \"expire_at\",
        \"dataType\": \"Timestamptz\",
        \"nullable\": true
    }
}"

# Step 3 — set the ttl_field property on the column you just added
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"properties\": {
        \"ttl_field\": \"expire_at\"
    }
}"

# Step 4 (optional) — backfill expiration timestamps for historical entities
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/upsert" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"data\": [
        {\"id\": 1, \"vector\": [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8], \"expire_at\": \"2026-12-31T00:00:00Z\"}
    ]
}"
```

</TabItem>
</Tabs>

Historical entities for which you do not backfill `expire_at` will have `NULL` in that column, meaning they never expire. Backfill only the rows that should have a finite lifetime.

### Switch from entity-level to collection-level TTL\{#switch-from-entity-level-to-collection-level-ttl}

To move in the other direction, drop `ttl_field` and set `collection.ttl.seconds`:

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

# Step 1 — drop the ttl_field property (mandatory; the two modes are mutually exclusive)
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop_properties" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"propertyKeys\": [
        \"ttl_field\"
    ]
}"

# Step 2 — set a collection-level TTL for all entities
curl --request POST --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/alter_properties" --header "Authorization: Bearer ${TOKEN}" --header "Content-Type: application/json" --header "Request-Timeout: 10" -d "{
    \"collectionName\": \"my_collection\",
    \"properties\": {
        \"collection.ttl.seconds\": \"1209600\"
    }
}"
```

</TabItem>
</Tabs>

## FAQs\{#faqs}

### When does data expire due to TTL settings?\{#when-does-data-expire-due-to-ttl-settings}

Currently, the data expires based on the time point at which it was inserted or upserted. Expired data will not be displayed in search results. For details, refer to [Examples](./set-collection-ttl).

### When will the expired data be physically deleted?\{#when-will-the-expired-data-be-physically-deleted}

Once the data expires, it will not be included in any search results. However, it will be physically deleted only after the subsequent system compaction, according to your cluster's compaction policies.

If you need to delete the data shortly after it expires, [contact us](https://support.zilliz.com/hc/en-us/requests/new).

### When will the CU capacity decrease?\{#when-will-the-cu-capacity-decrease}

The CU capacity of a cluster is whichever is higher between memory usage and storage usage. If storage usage applies, you can view the decrease in the CU capacity on the Zilliz Cloud console after the expired data is physically deleted.

