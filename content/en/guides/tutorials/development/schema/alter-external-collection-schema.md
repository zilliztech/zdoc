---
title: "Alter External Collection Schema | Cloud"
slug: /alter-external-collection-schema
sidebar_label: "Alter Schema (External Collection)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "External data sources often evolve after you create an external collection. For example, a lakehouse table that already stores embeddings might later include a new scalar field, such as a score, category, or timestamp, that you want to return in query results or use in filters. | Cloud"
type: origin
token: A9lowWdneiCQbZkgwrocKkT2nxW
sidebar_position: 19
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Alter External Collection Schema

External data sources often evolve after you create an external collection. For example, a lakehouse table that already stores embeddings might later include a new scalar field, such as a score, category, or timestamp, that you want to return in query results or use in filters.

Instead of recreating the external collection or copying the source data into Zilliz Cloud, add a Zilliz Cloud field that maps to the existing field in the external data source. After adding the field, refresh the external collection so the new field can be used in queries and searches.

## Limits\{#limits}

- External collections currently support adding fields after creation. Other schema changes, such as dropping fields, renaming fields, changing field data types, changing vector dimensions, or remapping `external_field`, are not supported.

- You can only add a field that already exists in the external data source. This operation maps an existing external field to a Zilliz Cloud field. It does not create a new field in the external data source or backfill source data.

- Adding `SPARSE_FLOAT_VECTOR` fields to an existing external collection is not supported.

- Adding StructArray fields to an existing external collection is not supported. If your external collection needs a StructArray field, define it in the collection schema when you create the collection.

## Add a field\{#add-a-field}

Before adding a field to an external collection, verify that the field already exists in the external data source. Then call `add_collection_field()` to expose that field in Zilliz Cloud by setting `external_field` to the field name in the external data source. Set `data_type` to the Zilliz Cloud data type that matches the field in the external data source. For example, if the mapped field stores double-precision values, use `DataType.DOUBLE`.

Unlike managed collections, values for the added field are read from the external data source after you refresh the external collection.

### Add a scalar field\{#add-a-scalar-field}

Use `add_collection_field()` to add a scalar field when you want to return the field in query results or use it in filters. The following example adds a `score` field that maps to the `score` field in the external data source.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.add_collection_field(
    collection_name="product_embeddings",
    field_name="score",
    data_type=DataType.DOUBLE,
    nullable=True,
    # highlight-next-line
    external_field="score",
)
```

</TabItem>

<TabItem value='java'>

```java
// Note: milvus-sdk-java does not support adding a field to an
// external collection as of v3.0.10 (addCollectionField() routes through
// AlterCollectionSchema, which rejects external collections).
```

</TabItem>

<TabItem value='go'>

```go
// Note: The Go SDK does not support adding a field to an external
// collection as of client/v3.0.0 (AddCollectionField() routes through
// AlterCollectionSchema, which rejects external collections).
```

</TabItem>
</Tabs>

```rust
use milvus::v2 as sdk;
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    ).await?;

    client.add_collection_field(
        sdk::request::collection::AddCollectionFieldRequest::builder()
            .collection_name("product_embeddings")
            .field(
                sdk::FieldSchema::new()
                    .name("score")
                    .data_type(sdk::DataType::Double)
                    .nullable(true)
                    .external_field("score"),
            )
            .build()?,
    ).await?;
    Ok(())
}
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
// Note: milvus-sdk-cpp does not support adding a field to an external
// collection as of v3.0.3 (AddCollectionField() routes through
// AlterCollectionSchema, which rejects external collections).
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

await client.addCollectionField({
   collection_name: 'product_embeddings',
   field: {
     name: 'score',
     data_type: DataType.Double,
     nullable: true,
     external_field: 'score',
   },
 });
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The RESTful API does not support adding a field to an external
# collection (POST /v2/vectordb/collections/fields/add routes through
# AlterCollectionSchema, which rejects external collections).
```

</TabItem>
</Tabs>

In this example, `score` is the Zilliz Cloud field name and `external_field="score"` maps it to the `score` field in the external data source. Set `nullable=True` because the field is added after the collection has already been created.

### Add a vector field\{#add-a-vector-field}

You can also add a vector field if the external data source already contains the vector values. Set the vector `data_type` and `dim` to match the vector field in the external data source.

The following example adds a dense vector field named `image_embedding_v2`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.add_collection_field(
    collection_name="product_embeddings",
    field_name="image_embedding_v2",
    data_type=DataType.FLOAT_VECTOR,
    dim=768,
    nullable=True,
    # highlight-next-line
    external_field="image_embedding_v2",
)
```

</TabItem>

<TabItem value='java'>

```java
// Note: milvus-sdk-java does not support adding a field to an
// external collection as of v3.0.10 (addCollectionField() routes through
// AlterCollectionSchema, which rejects external collections).
```

</TabItem>

<TabItem value='go'>

```go
// Note: The Go SDK does not support adding a field to an external
// collection as of client/v3.0.0 (AddCollectionField() routes through
// AlterCollectionSchema, which rejects external collections).
```

</TabItem>
</Tabs>

```rust
use milvus::v2 as sdk;
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    ).await?;

    client.add_collection_field(
        sdk::request::collection::AddCollectionFieldRequest::builder()
            .collection_name("product_embeddings")
            .field(
                sdk::FieldSchema::new()
                    .name("image_embedding_v2")
                    .data_type(sdk::DataType::FloatVector)
                    .dimension(768)
                    .nullable(true)
                    .external_field("image_embedding_v2"),
            )
            .build()?,
    ).await?;
    Ok(())
}
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
// Note: milvus-sdk-cpp does not support adding a field to an external
// collection as of v3.0.3 (AddCollectionField() routes through
// AlterCollectionSchema, which rejects external collections).
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

await client.addCollectionField({
   collection_name: 'product_embeddings',
   field: {
     name: 'image_embedding_v2',
     data_type: DataType.FloatVector,
     dim: 768,
     nullable: true,
     external_field: 'image_embedding_v2',
   },
 });
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The RESTful API does not support adding a field to an external
# collection (POST /v2/vectordb/collections/fields/add routes through
# AlterCollectionSchema, which rejects external collections).
```

</TabItem>
</Tabs>

If you plan to run vector search on the added vector field, create an index for the field before refreshing the external collection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="image_embedding_v2",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_index(
    collection_name="product_embeddings",
    index_params=index_params,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.Collections;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

IndexParam indexParam = IndexParam.builder()
        .fieldName("image_embedding_v2")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build();
client.createIndex(CreateIndexReq.builder()
        .collectionName("product_embeddings")
        .indexParams(Collections.singletonList(indexParam))
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

ctx := context.Background()
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

_, err = client.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "product_embeddings", "image_embedding_v2",
    index.NewAutoIndex(index.MetricType(entity.COSINE))))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>
</Tabs>

```rust
use milvus::v2 as sdk;
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    ).await?;

    client.create_index(
        sdk::request::index::CreateIndexRequest::builder()
            .collection_name("product_embeddings")
            .index_param(
                sdk::IndexParam::new()
                    .field_name("image_embedding_v2")
                    .index_type(sdk::IndexType::AutoIndex)
                    .metric_type(sdk::MetricType::Cosine),
            )
            .build()?,
    ).await?;
    Ok(())
}
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::IndexDesc index_desc("image_embedding_v2", "", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE);
status = client->CreateIndex(milvus::CreateIndexRequest()
                                 .WithCollectionName("product_embeddings")
                                 .AddIndex(std::move(index_desc)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

await client.createIndex({
   collection_name: 'product_embeddings',
   field_name: 'image_embedding_v2',
   index_type: 'AUTOINDEX',
   metric_type: 'COSINE',
 });
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "product_embeddings",
    "indexParams": [
        {
            "fieldName": "image_embedding_v2",
            "indexType": "AUTOINDEX",
            "metricType": "COSINE"
        }
    ]
}' 
```

</TabItem>
</Tabs>

## Refresh the external collection\{#refresh-the-external-collection}

After altering an external collection schema, refresh the external collection so Zilliz Cloud updates the external collection metadata and makes the schema change effective in query, search, and filter results.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.refresh_external_collection(
    collection_name="product_embeddings"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.RefreshExternalCollectionReq;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

RefreshExternalCollectionResp resp = client.refreshExternalCollection(
        RefreshExternalCollectionReq.builder()
                .collectionName("product_embeddings")
                .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

res, err := client.RefreshExternalCollection(ctx, milvusclient.NewRefreshExternalCollectionOption("product_embeddings"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>
</Tabs>

```rust
use milvus::v2 as sdk;
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    ).await?;

    let response = client.refresh_external_collection(
        sdk::request::utility::RefreshExternalCollectionRequest::builder()
            .collection_name("product_embeddings")
            .build()?,
    ).await?;
    println!("job_id: {}", response.job_id());
    Ok(())
}
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::RefreshExternalCollectionRequest request;
request.WithCollectionName("product_embeddings");
milvus::RefreshExternalCollectionResponse response;
status = client->RefreshExternalCollection(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

await client.refreshExternalCollection({
   collection_name: 'product_embeddings',
 });
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/jobs/external_collection/refresh" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "product_embeddings"
}' 
```

</TabItem>
</Tabs>