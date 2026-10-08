---
title: "Schema Evolution | Cloud"
slug: /schema-evolution
sidebar_label: "Schema Evolution"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Schema evolution lets you add fields to an existing collection without rebuilding it or taking production traffic offline. However, adding a field changes only the collection schema. Existing entities do not automatically receive values for the new field, while new and updated entities may continue to arrive during the migration. | Cloud"
type: origin
token: P5q7wCCk5i3rlEkceyjcQMi0nSc
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Schema Evolution

Schema evolution lets you add fields to an existing collection without rebuilding it or taking production traffic offline. However, adding a field changes only the collection schema. Existing entities do not automatically receive values for the new field, while new and updated entities may continue to arrive during the migration.

This article illustrates the common procedure for schema evolution

## Understand the workflow\{#understand-the-workflow}

To evolve the schema of a live collection safely, follow a coordinated sequence:

![OQbQwegIUhOoBXbDgfAcMfw0n5e](https://zdoc-images.s3.us-west-2.amazonaws.com/OQbQwegIUhOoBXbDgfAcMfw0n5e.png)

As illustrated in the sequence above, the entire migration flow is as follows:

1. **[Prepare readers and writers](./schema-evolution#step-1-prepare-readers-and-writers).** 

    Ensure that your application is ready to write and read the new fields.

1. **[Add the new fields](./schema-evolution#step-2-add-the-new-fields).** 

    Extend the collection schema with the required fields. 

1. **[Switch writes](./schema-evolution#step-3-switch-writes).** 

    Make all new and updated entities populate the new fields. 

1. **[Backfill existing entities](./schema-evolution#step-4-backfill-existing-entities).** 

    Populate the new fields for historical data. 

1. **[Validate migration](./schema-evolution#step-5-validate-migration).** 

    Verify that both historical and newly written entities contain the expected values. 

1. **[Switch reads](./schema-evolution#step-6-switch-reads).** 

    Start using the new fields for production reads.

The order matters: Switch application writes before starting the backfill so that entities created or updated during the migration already contain values for the new fields. After the backfill completes, validate both historical and newly written data before switching reads to the new fields.

## Before you start\{#before-you-start}

Before evolving the schema of a live collection, ensure that:

- Your application can be updated to read from and write to the new fields.

- The source data required to populate the new fields for existing entities is available.

- Each source record can be matched to an existing entity by primary key.

- The existing fields remain available until the migration is validated.

## Step 1: Prepare readers and writers\{#step-1-prepare-readers-and-writers}

Before changing the collection schema, prepare your application to read from and write to the new fields. Deploy these changes behind configuration or feature flags, but keep them disabled until the new fields have been added to the collection.

For example, suppose you plan to add a `category` field. You can prepare the writer to include the field when the new schema is enabled:

```python
# Pseudocode
def build_entity(document, use_new_schema=False):
    entity = {
        "id": document["id"],
        "text": document["text"],
        "embedding": document["embedding"],
    }

    if use_new_schema:
        entity["category"] = document["category"]

    return entity
```

Prepare readers in the same way so that they can consume the new field after the migration is validated:

```python
# Pseudocode
def get_output_fields(use_new_schema=False):
    fields = ["id", "text"]

    if use_new_schema:
        fields.append("category")

    return fields
```

At this stage, keep both switches disabled. Production reads and writes should continue to use the existing schema until the new fields are added.

## Step 2: Add the new fields\{#step-2-add-the-new-fields}

After the updated readers and writers are ready, add the required fields to the existing collection schema. At this point, keep the new application paths disabled.

For example, the following code adds a nullable `category` field:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType

client.add_collection_field(
    collection_name="documents",
    field_name="category",
    data_type=DataType.VARCHAR,
    max_length=64,
    nullable=True,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionFieldReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("documents")
        .fieldName("category")
        .dataType(DataType.VarChar)
        .maxLength(64)
        .isNullable(true)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

err = client.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("documents",
    entity.NewField().
        WithName("category").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(64).
        WithNullable(true)))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

client
    .add_collection_field(
        AddCollectionFieldRequest::builder()
            .collection_name("documents")
            .field(
                FieldSchema::new()
                    .name("category")
                    .data_type(DataType::VarChar)
                    .max_length(64)
                    .nullable(true),
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <utility>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->AddCollectionField(milvus::AddCollectionFieldRequest()
    .WithCollectionName("documents")
    .WithField(std::move(milvus::FieldSchema("category", milvus::DataType::VARCHAR).WithMaxLength(64).WithNullable(true))));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

await client.addCollectionField({
    collection_name: "documents",
    field: {
        name: "category",
        data_type: DataType.VarChar,
        max_length: 64,
        nullable: true,
    },
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/fields/add" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "documents",
    "schema": {
        "fieldName": "category",
        "dataType": "VarChar",
        "elementTypeParams": {
            "max_length": 64
        },
        "nullable": true
    }
}'
```

</TabItem>
</Tabs>

Adding a field changes only the collection schema. Existing entities are not rewritten and have `NULL` in the new field until the field is populated later in the migration.

Once the schema change succeeds, proceed to switch application writes so that all newly inserted or updated entities populate the new field.

## Step 3: Switch writes\{#step-3-switch-writes}

After the new fields are available in the collection schema, enable the updated writer so that all new inserts and full-row upserts populate them.

For example, enable the writer path prepared earlier:

```python
USE_NEW_SCHEMA = True

entity = build_entity(document, use_new_schema=USE_NEW_SCHEMA)

client.insert(
    collection_name="documents",
    data=[entity],
)
```

For a full-row upsert, include the new field in the payload as well:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.upsert(
    collection_name="documents",
    data=[{
        "id": document["id"],
        "text": document["text"],
        "embedding": document["embedding"],
        "category": document["category"],
    }],
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.UpsertReq;
import java.util.Collections;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

JsonObject entity = new JsonObject();
entity.addProperty("id", 1001);
entity.addProperty("text", "example text");
entity.add("embedding", new Gson().toJsonTree(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f}));
entity.addProperty("category", "electronics");

client.upsert(UpsertReq.builder()
        .collectionName("documents")
        .data(Collections.singletonList(entity))
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

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

_, err = client.Upsert(ctx, milvusclient.NewRowBasedInsertOption("documents",
    map[string]any{
        "id":        int64(1001),
        "text":      "example text",
        "embedding": []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592},
        "category":  "electronics",
    }))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

client
    .upsert(
        UpsertRequest::builder()
            .insert(
                InsertRequest::builder()
                    .collection_name("documents")
                    .rows(vec![
                        json!({
                            "id": 1001,
                            "text": "example text",
                            "embedding": [0.3580376395471989_f32, -0.6023495712049978_f32, 0.18414012509913835_f32, -0.26286205330961354_f32, 0.9029438446296592_f32],
                            "category": "electronics",
                        }),
                    ])
                    .build()?,
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <vector>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::UpsertResponse upsertResponse;
status = client->Upsert(milvus::UpsertRequest()
    .WithCollectionName("documents")
    .AddRowData({{"id", 1001}, {"text", "example text"}, {"embedding", std::vector<float>{0.35803764F, -0.60234958F, 0.18414013F, -0.26286206F, 0.90294385F}}, {"category", "electronics"}}), upsertResponse);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

await client.upsert({
    collection_name: "documents",
    data: [{
        id: 1001,
        text: "example text",
        embedding: [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],
        category: "electronics",
    }],
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/upsert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "documents",
    "data": [
        {
            "id": 1001,
            "text": "example text",
            "embedding": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],
            "category": "electronics"
        }
    ]
}'
```

</TabItem>
</Tabs>

Complete the writer switch before starting the backfill. From this point on, newly inserted or updated entities already contain values for the new fields, while existing entities are populated by the backfill. This ordering prevents a gap where writes made during the migration are missed by both paths.

Keep production reads on the existing fields until the backfill is complete and the migration is validated.

## Step 4: Backfill existing entities\{#step-4-backfill-existing-entities}

After all application writers have switched to the new schema, backfill the new fields for entities that existed before the switch.

Prepare the data files that contain the primary key and the values to write to the new fields. For an online migration, use `coalesce` to preserve values already written by the application while populating missing values in historical entities.

In Zilliz Cloud, submit a data backfill job. Zilliz Cloud manages the collection snapshot, Spark execution, and backfill commit as part of the job.

Before submitting the backfill, you can optionally run a precheck to validate the input data and field mappings.

The following snippet demonstrates how to submit a data backfill job. For details on preparing the input, running a precheck against your data, choosing a backfill mode, submitting a backfill job, and monitoring the job, see [Data Backfill ](./data-backfill).

```bash
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request POST \
    --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/backfill" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "Idempotency-Key: schema-evolution-backfill-001" \
    --header "Content-Type: application/json" \
    --data '{
      "description": "Backfill category for existing documents",
      "clusterId": "in-xxxxxxxx",
      "dbName": "default",
      "collectionName": "documents",
      "fields": ["category"],
      "input": {
        "type": "volume",
        "volumeName": "migration-data",
        "path": "schema-evolution/category-backfill.parquet",
        "format": "parquet"
      },
      "columnMapping": {
        "source_id": "id",
        "source_category": "category"
      },
      "mode": "coalesce",
      "resourceSize": "SMALL",
      "timeoutSeconds": 3600
    }'
```

## Step 5: Validate migration\{#step-5-validate-migration}

After the backfill completes, verify that the new fields are populated correctly before switching production reads to them.

Start by querying a representative set of entities, including both historical entities processed by the backfill and entities inserted or updated after the writer switch:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
results = client.query(
    collection_name="documents",
    filter="id in [1001, 1002, 1003]",
    output_fields=["id", "category"],
)

for result in results:
    print(result)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.Arrays;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

QueryResp queryResp = client.query(QueryReq.builder()
        .collectionName("documents")
        .filter("id in [1001, 1002, 1003]")
        .outputFields(Arrays.asList("id", "category"))
        .build());

for (QueryResp.QueryResult result : queryResp.getQueryResults()) {
    System.out.println(result.getEntity());
}
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
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

results, err := client.Query(ctx, milvusclient.NewQueryOption("documents").
    WithFilter("id in [1001, 1002, 1003]").
    WithOutputFields("id", "category"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let results = client
    .query(
        QueryRequest::builder()
            .collection_name("documents")
            .filter("id in [1001, 1002, 1003]")
            .output_fields(["id", "category"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::QueryResponse queryResponse;
status = client->Query(milvus::QueryRequest()
    .WithCollectionName("documents")
    .WithFilter("id in [1001, 1002, 1003]")
    .WithOutputFields({"id", "category"}), queryResponse);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const results = await client.query({
    collection_name: "documents",
    filter: "id in [1001, 1002, 1003]",
    output_fields: ["id", "category"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "documents",
    "filter": "id in [1001, 1002, 1003]",
    "outputFields": ["id", "category"]
}'
```

</TabItem>
</Tabs>

Check that:

- Historical entities contain the expected values in the new fields.

- Entities written after the writer switch also contain valid values.

- No unexpected `NULL` values or mismatches remain in the population you plan to serve.

For large collections, validate both overall coverage and representative data segments or application cohorts rather than relying only on a few sampled entities.

Proceed to switch production reads only after the new fields meet your application requirements.

## Step 6: Switch reads\{#step-6-switch-reads}

After the migration has been validated, update your application readers to use the new fields.

For example, enable the reader path prepared earlier:

```python
USE_NEW_SCHEMA = True

results = client.query(
    collection_name="documents",
    filter="id in [1001, 1002, 1003]",
    output_fields=get_output_fields(use_new_schema=USE_NEW_SCHEMA),
)
```

If the new field changes search behavior, such as when a new vector field is used with a different embedding model, switch the entire read path together, including the query model, target field, and related search configuration.

Roll out the change gradually when possible, and keep the previous read path available until the rollback window has closed.

## Failure handling and rollback\{#failure-handling-and-rollback}

Keep the existing fields and read path available until the migration has been validated and the rollback window has closed. If a problem occurs, stop advancing the migration and recover from the current stage.

| **Stage** | **Recommended action** |
| --- | --- |
| Writer switch fails | Keep production reads on the existing fields and complete the writer rollout before starting the backfill. |
| Precheck fails | Do not start the backfill. Fix the staged data or configuration, then run the precheck again. |
| Backfill fails | Keep production reads on the existing fields, fix the issue, and retry the backfill. |
| Validation fails | Do not switch reads. Repair missing, stale, or incorrect values, then validate again. |
| New read path regresses | Route production reads back to the existing fields while keeping the new fields and backfilled data intact. |
| Migration succeeds | Keep the existing fields through an agreed rollback window. Remove old fields, indexes, or application logic only after the new path remains stable. |

For migrations that change retrieval behavior, such as moving to a new embedding model or search representation, use a gradual read rollout when possible.

A backfill failure usually does not require a data rollback because production reads still use the existing fields. The main rollback point is after switching reads, where the safest recovery is typically to route traffic back to the old fields rather than remove the new data.

## Next steps\{#next-steps}

Use this workflow as the foundation for more specific schema evolution scenarios. The following runbooks apply the same migration sequence to common changes in vector search applications:



import DocCardList from '@theme/DocCardList';

<DocCardList />