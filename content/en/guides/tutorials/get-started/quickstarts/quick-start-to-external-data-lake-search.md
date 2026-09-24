---
title: "Quickstart to External Data Lake Search | Cloud"
slug: /quick-start-to-external-data-lake-search
sidebar_label: "Quickstart to External Data Lake Search"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "External data lake search lets you search massive datasets with zero-copy access to data in external storage or imported into Zilliz Cloud, without keeping compute resources running continuously. You can create collections from external volumes or imported files, build indexes and refresh metadata via the project data plane endpoint, and start an on-demand cluster only when you need to run search or query workloads. | Cloud"
type: origin
token: KdwFwQnDNisT4skHH6Hc16uInji
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quickstart to External Data Lake Search

External data lake search lets you search massive datasets with zero-copy access to data in external storage or imported into Zilliz Cloud, without keeping compute resources running continuously. You can create collections from external volumes or imported files, build indexes and refresh metadata via the project data plane endpoint, and start an on-demand cluster only when you need to run search or query workloads.

To do so, the procedure is as follows:

## Before you start\{#before-you-start}

- **Create storage integration.**

    A storage integration is a profile that records your data location with access credentials. To set up storage integration, follow the steps to create an [AWS S3](./integrate-with-aws-s3), [Google GCS](./integrate-with-gcp), or [Azure](./integrate-with-azure-blob-storage) storage integration and obtain the storage integration ID.

- **Create an external volume.**

    An external volume is a path within storage integration. Ensure that your raw data is on that path. You can create multiple external volumes from the same storage integration. To create an external volume, refer to [External Volumes](./external-volume#create-an-external-volume).

## Step 1: Connect to a project endpoint.\{#step-1-connect-to-a-project-endpoint}

Before working on a database, connect to the project endpoint. You can obtain the project endpoint on the quickstart page after enabling on-demand compute on the Zilliz Cloud console.

<Admonition type="info" title="Notes">

External collection operations require an **API key** for authentication. This flow does not support `username:password` authentication.

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# connect to database
client = MilvusClient(
    # a project-specific on-demand compute endpoint
    uri="https://{project-id}.{region}.api.zillizcloud.com",
    token="YOUR_API_KEY"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("https://{project-id}.{region}.api.zillizcloud.com")
        .token("YOUR_API_KEY")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "https://{project-id}.{region}.api.zillizcloud.com",
    APIKey:  "YOUR_API_KEY",
})
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam(
    "https://{project-id}.{region}.api.zillizcloud.com", "YOUR_API_KEY"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
    address: "https://{project-id}.{region}.api.zillizcloud.com",
    token: "YOUR_API_KEY",
});
```

</TabItem>

<TabItem value='bash'>

```bash
export PROJECT_ENDPOINT="https://{project-id}.{region}.api.zillizcloud.com"
```

</TabItem>
</Tabs>

## Step 2: (Optional) Create a database.\{#step-2-optional-create-a-database}

Zilliz Cloud ships with a default database. If you choose that, skip this step. You can also create a database as follows.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_database(
    db_name="my_database"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.database.request.CreateDatabaseReq;

client.createDatabase(CreateDatabaseReq.builder()
        .databaseName("my_database")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateDatabase(ctx, milvusclient.NewCreateDatabaseOption("my_database"))
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->CreateDatabase(milvus::CreateDatabaseRequest().WithDatabaseName("my_database"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createDatabase({ db_name: "my_database" });
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/databases/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database"
}'
```

</TabItem>
</Tabs>

## Step 3: Create an external collection.\{#step-3-create-an-external-collection}

Once the database is ready, you can create external collections in it. An external collection maps its columns to the data files you specify and attaches on-demand compute resources for the searches in that collection.

Unlike managed collections that require you to import your raw data into the collection, external collections generate metadata from your raw data via sub-second refresh operations.

The following example demonstrates how to set up the mapping relationship between collection fields and your data files. When creating the schema, specify the volume path and data format. This quickstart uses an Iceberg table. For the complete list of supported data sources and formats, see [Supported data sources and formats](./create-external-collection#support-data-sources).

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema(
    external_source='volume://my_volume/iceberg/metadata/00001-xxx.metadata.json',
    external_spec='{"format": "iceberg-table", "snapshot_id": "1234567890123456789"}'
)

schema.add_field(
    field_name="vector",
    datatype=DataType.FLOAT_VECTOR,
    dim=1536,
    # highlight-next
    external_field="embedding" # field name in the external data file
)

schema.add_field(
    field_name="product_id",
    datatype=DataType.VARCHAR,
    max_length=32,
    nullable=True,
    # highlight-next
    external_field="product_id"
)

schema.add_field(
    field_name="title",
    datatype=DataType.VARCHAR,
    max_length=512,
    nullable=True,
    # highlight-next
    external_field="title"
)

schema.add_field(
    field_name="main_category",
    datatype=DataType.VARCHAR,
    max_length=64,
    nullable=True,
    # highlight-next
    external_field="main_category"
)

schema.add_field(
    field_name="price",
    datatype=DataType.DOUBLE,
    nullable=True,
    # highlight-next
    external_field="price"
)

schema.add_field(
    field_name="average_rating",
    datatype=DataType.DOUBLE,
    nullable=True,
    # highlight-next
    external_field="average_rating"
)

schema.add_field(
    field_name="rating_number",
    datatype=DataType.INT64,
    nullable=True,
    # highlight-next
    external_field="rating_number"
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.JsonObject;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

JsonObject externalSpec = new JsonObject();
externalSpec.addProperty("format", "iceberg-table");
externalSpec.addProperty("snapshot_id", "1234567890123456789");

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .externalSource("volume://my_volume/iceberg/metadata/00001-xxx.metadata.json")
        .externalSpec(externalSpec)
        .build();

schema.addField(AddFieldReq.builder()
        .fieldName("vector")
        .dataType(DataType.FloatVector)
        .dimension(1536)
        .externalField("embedding")
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("product_id")
        .dataType(DataType.VarChar)
        .maxLength(32)
        .isNullable(true)
        .externalField("product_id")
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("title")
        .dataType(DataType.VarChar)
        .maxLength(512)
        .isNullable(true)
        .externalField("title")
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("main_category")
        .dataType(DataType.VarChar)
        .maxLength(64)
        .isNullable(true)
        .externalField("main_category")
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("price")
        .dataType(DataType.Double)
        .isNullable(true)
        .externalField("price")
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("average_rating")
        .dataType(DataType.Double)
        .isNullable(true)
        .externalField("average_rating")
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("rating_number")
        .dataType(DataType.Int64)
        .isNullable(true)
        .externalField("rating_number")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"
)

schema := entity.NewSchema().
    WithExternalSource("volume://my_volume/iceberg/metadata/00001-xxx.metadata.json").
    WithExternalSpec(`{"format": "iceberg-table", "snapshot_id": "1234567890123456789"}`).
    WithField(entity.NewField().
        WithName("vector").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(1536).
        WithExternalField("embedding")).
    WithField(entity.NewField().
        WithName("product_id").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(32).
        WithNullable(true).
        WithExternalField("product_id")).
    WithField(entity.NewField().
        WithName("title").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(512).
        WithNullable(true).
        WithExternalField("title")).
    WithField(entity.NewField().
        WithName("main_category").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(64).
        WithNullable(true).
        WithExternalField("main_category")).
    WithField(entity.NewField().
        WithName("price").
        WithDataType(entity.FieldTypeDouble).
        WithNullable(true).
        WithExternalField("price")).
    WithField(entity.NewField().
        WithName("average_rating").
        WithDataType(entity.FieldTypeDouble).
        WithNullable(true).
        WithExternalField("average_rating")).
    WithField(entity.NewField().
        WithName("rating_number").
        WithDataType(entity.FieldTypeInt64).
        WithNullable(true).
        WithExternalField("rating_number"))
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

milvus::CollectionSchemaPtr schema = std::make_shared<milvus::CollectionSchema>();
schema->WithExternalSource("volume://my_volume/iceberg/metadata/00001-xxx.metadata.json");
schema->WithExternalSpec({
    {"format", "iceberg-table"},
    {"snapshot_id", "1234567890123456789"},
});

schema->AddField(milvus::FieldSchema()
    .WithName("vector")
    .WithDataType(milvus::DataType::FLOAT_VECTOR)
    .WithDimension(1536)
    .WithExternalField("embedding"));
schema->AddField(milvus::FieldSchema()
    .WithName("product_id")
    .WithDataType(milvus::DataType::VARCHAR)
    .WithMaxLength(32)
    .WithNullable(true)
    .WithExternalField("product_id"));
schema->AddField(milvus::FieldSchema()
    .WithName("title")
    .WithDataType(milvus::DataType::VARCHAR)
    .WithMaxLength(512)
    .WithNullable(true)
    .WithExternalField("title"));
schema->AddField(milvus::FieldSchema()
    .WithName("main_category")
    .WithDataType(milvus::DataType::VARCHAR)
    .WithMaxLength(64)
    .WithNullable(true)
    .WithExternalField("main_category"));
schema->AddField(milvus::FieldSchema()
    .WithName("price")
    .WithDataType(milvus::DataType::DOUBLE)
    .WithNullable(true)
    .WithExternalField("price"));
schema->AddField(milvus::FieldSchema()
    .WithName("average_rating")
    .WithDataType(milvus::DataType::DOUBLE)
    .WithNullable(true)
    .WithExternalField("average_rating"));
schema->AddField(milvus::FieldSchema()
    .WithName("rating_number")
    .WithDataType(milvus::DataType::INT64)
    .WithNullable(true)
    .WithExternalField("rating_number"));
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { DataType } from "@zilliz/milvus2-sdk-node";

const schema = [
    {
        name: "vector",
        data_type: DataType.FloatVector,
        type_params: { dim: "1536" },
        external_field: "embedding",
    },
    {
        name: "product_id",
        data_type: DataType.VarChar,
        type_params: { max_length: "32" },
        nullable: true,
        external_field: "product_id",
    },
    {
        name: "title",
        data_type: DataType.VarChar,
        type_params: { max_length: "512" },
        nullable: true,
        external_field: "title",
    },
    {
        name: "main_category",
        data_type: DataType.VarChar,
        type_params: { max_length: "64" },
        nullable: true,
        external_field: "main_category",
    },
    {
        name: "price",
        data_type: DataType.Double,
        nullable: true,
        external_field: "price",
    },
    {
        name: "average_rating",
        data_type: DataType.Double,
        nullable: true,
        external_field: "average_rating",
    },
    {
        name: "rating_number",
        data_type: DataType.Int64,
        nullable: true,
        external_field: "rating_number",
    },
];
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
    "externalSource": "volume://my_volume/iceberg/metadata/00001-xxx.metadata.json",
    "externalSpec": "{\"format\": \"iceberg-table\", \"snapshot_id\": \"1234567890123456789\"}",
    "fields": [
        {
            "fieldName": "vector",
            "dataType": "FloatVector",
            "elementTypeParams": {
                "dim": "1536"
            },
            "externalField": "embedding"
        },
        {
            "fieldName": "product_id",
            "dataType": "VarChar",
            "elementTypeParams": {
                "max_length": "32"
            },
            "nullable": true,
            "externalField": "product_id"
        },
        {
            "fieldName": "title",
            "dataType": "VarChar",
            "elementTypeParams": {
                "max_length": "512"
            },
            "nullable": true,
            "externalField": "title"
        },
        {
            "fieldName": "main_category",
            "dataType": "VarChar",
            "elementTypeParams": {
                "max_length": "64"
            },
            "nullable": true,
            "externalField": "main_category"
        },
        {
            "fieldName": "price",
            "dataType": "Double",
            "nullable": true,
            "externalField": "price"
        },
        {
            "fieldName": "average_rating",
            "dataType": "Double",
            "nullable": true,
            "externalField": "average_rating"
        },
        {
            "fieldName": "rating_number",
            "dataType": "Int64",
            "nullable": true,
            "externalField": "rating_number"
        }
    ]
}'
```

</TabItem>
</Tabs>

Then you can create a collection with the above schema. If you decide to use the default database, you can safely skip the `db_name` parameter.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.use_database(
    db_name="my_database"
)

# create the collection
client.create_collection(
    collection_name="my_collection",
    schema=schema
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

client.useDatabase("my_database");

CreateCollectionReq createReq = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        .build();
client.createCollection(createReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.UseDatabase(ctx, milvusclient.NewUseDatabaseOption("my_database"))
if err != nil {
    // handle error
}

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("my_collection", schema))
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->UseDatabase("my_database");
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateCollection(milvus::CreateCollectionRequest()
    .WithCollectionName("my_collection")
    .WithCollectionSchema(schema));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.useDatabase({ db_name: "my_database" });

await client.createCollection({
    collection_name: "my_collection",
    fields: schema,
    external_source: "volume://my_volume/iceberg/metadata/00001-xxx.metadata.json",
    external_spec: JSON.stringify({
        format: "iceberg-table",
        snapshot_id: "1234567890123456789",
    }),
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"dbName\": \"my_database\",
    \"collectionName\": \"my_collection\",
    \"schema\": $schema
}"
```

</TabItem>
</Tabs>

## Step 4: Create indexes and refresh the collection.\{#step-4-create-indexes-and-refresh-the-collection}

You can create indexes in an external database as you do in managed collections. All vector fields should be indexed, and you can select to index some scalar fields for fast metadata filtering. However, you need to call refresh to build the index.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

# Add indexes
index_params.add_index(
    field_name="vector",
    index_type="AUTOINDEX",
    metric_type="COSINE"
)

index_params.add_index(
    field_name="main_category", 
    index_type="AUTOINDEX"
)

client.create_index(
    db_name="my_database",
    collection_name="my_collection",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.*;

IndexParam vectorIndex = IndexParam.builder()
        .fieldName("vector")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build();
IndexParam categoryIndex = IndexParam.builder()
        .fieldName("main_category")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build();

client.createIndex(CreateIndexReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .indexParams(Arrays.asList(vectorIndex, categoryIndex))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

vectorIndex := index.NewAutoIndex(entity.COSINE)
categoryIndex := index.NewGenericIndex("main_category", map[string]string{
    index.IndexTypeKey: string(index.AUTOINDEX),
})

vectorTask, err := client.CreateIndex(ctx, milvusclient.NewCreateIndexOption("my_collection", "vector", vectorIndex))
if err != nil {
    // handle error
}
err = vectorTask.Await(ctx)
if err != nil {
    // handle error
}

categoryTask, err := client.CreateIndex(ctx, milvusclient.NewCreateIndexOption("my_collection", "main_category", categoryIndex))
if err != nil {
    // handle error
}
err = categoryTask.Await(ctx)
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->CreateIndex(milvus::CreateIndexRequest()
    .WithCollectionName("my_collection")
    .AddIndex(milvus::IndexDesc("vector", "vector", milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE))
    .AddIndex(milvus::IndexDesc("main_category", "main_category", milvus::IndexType::AUTOINDEX)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex([
    {
        db_name: "my_database",
        collection_name: "my_collection",
        field_name: "vector",
        index_type: "AUTOINDEX",
        metric_type: "COSINE",
    },
    {
        db_name: "my_database",
        collection_name: "my_collection",
        field_name: "main_category",
        index_type: "AUTOINDEX",
    },
]);
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
    {
        "fieldName": "vector",
        "metricType": "COSINE",
        "indexName": "vector",
        "indexType": "AUTOINDEX"
    },
    {
        "fieldName": "main_category",
        "indexName": "main_category",
        "indexType": "AUTOINDEX"
    }
]'

curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"dbName\": \"my_database\",
    \"collectionName\": \"my_collection\",
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

Then refresh the external collection. You can omit `externalSource` and `externalSpec` to reuse the collection schema, or provide both to refresh the collection schema from a new source.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# refresh the external database
job_id = client.refresh_external_collection(
    collection_name="my_collection"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.RefreshExternalCollectionReq;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionResp;

RefreshExternalCollectionResp refreshResp = client.refreshExternalCollection(
        RefreshExternalCollectionReq.builder()
                .collectionName("my_collection")
                .build());
long jobId = refreshResp.getJobId();
```

</TabItem>

<TabItem value='go'>

```go
refreshResult, err := client.RefreshExternalCollection(ctx,
    milvusclient.NewRefreshExternalCollectionOption("my_collection"))
if err != nil {
    // handle error
}
jobID := refreshResult.JobID
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::RefreshExternalCollectionResponse refresh_response;
status = client->RefreshExternalCollection(
    milvus::RefreshExternalCollectionRequest().WithCollectionName("my_collection"),
    refresh_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
int64_t jobId = refresh_response.JobID();
```

</TabItem>

<TabItem value='javascript'>

```javascript
const resp = await client.refreshExternalCollection({ collection_name: "my_collection" });
const jobId = resp.job_id;
```

</TabItem>

<TabItem value='bash'>

```bash
# Refresh the external collection
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/jobs/external_collection/refresh" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "my_collection"
}'

# job-xxxxxxxxxxxxxxxxxxx
```

</TabItem>
</Tabs>

Then you can create a loop to wrap the progress-monitoring calls and track the refresh operation's progress.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
progress = client.get_refresh_external_collection_progress(job_id=job_id)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.GetRefreshExternalCollectionProgressReq;
import io.milvus.v2.service.utility.response.GetRefreshExternalCollectionProgressResp;

GetRefreshExternalCollectionProgressResp progressResp = client.getRefreshExternalCollectionProgress(
        GetRefreshExternalCollectionProgressReq.builder()
                .jobId(jobId)
                .build());
```

</TabItem>

<TabItem value='go'>

```go
progress, err := client.GetRefreshExternalCollectionProgress(ctx,
    milvusclient.NewGetRefreshExternalCollectionProgressOption(jobID))
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::GetRefreshExternalCollectionProgressResponse progress_response;
status = client->GetRefreshExternalCollectionProgress(
    milvus::GetRefreshExternalCollectionProgressRequest().WithJobID(jobId),
    progress_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const progress = await client.getRefreshExternalCollectionProgress({ job_id: jobId });
```

</TabItem>

<TabItem value='bash'>

```bash
curl -s --request POST \
    --url "${PROJECT_ENDPOINT}/v2/vectordb/jobs/external_collection/describe" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "jobId": "job-xxxxxxxxxxxxxxxxxxx"
    }'
```

</TabItem>
</Tabs>

## Step 5: Create an on-demand cluster\{#step-5-create-an-on-demand-cluster}

Once your external collection is ready, you need to attach it to an on-demand cluster for on-demand searches. The following command creates a cluster and returns its ID.

```bash
export CONTROL_PLANE_ENDPOINT="https://api.cloud.zilliz.com"

curl --request POST \
--url "${CONTROL_PLANE_ENDPOINT}/v2/clusters/createOnDemandCluster" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "projectId": "proj-xxxxxxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-2",
    "clusterName": "my-on-demand",
    "cuSize": 8,
    "autoSuspend": 60
}'

# inxx-xxxxxxxxxxxxx
```

By default, the cluster automatically suspends for 60 seconds after the last request, and you can set it to a value that suits your use cases. 

## Step 6: Conduct searches.\{#step-6-conduct-searches}

When you need to conduct searches, queries, or hybrid searches, you can attach to the on-demand cluster created in the previous step through a session.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# highlight-start
session = client.session(
    cluster_id="inxx-xxxxxxxxxxxxx"
)
# highlight-end

# 1536-dimensional vector
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, ..., 0.9029438446296592]
res = session.search(
    db_name="my_database",
    collection_name="my_collection",
    anns_field="vector",
    data=[query_vector],
    limit=3,
    output_fields=["product_id", "title", "main_category", "price", "average_rating", "rating_number"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2Session;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.*;

MilvusClientV2Session session = client.session("inxx-xxxxxxxxxxxxx");

FloatVec queryVector = new FloatVec(Arrays.asList(
        0.3580376395471989f,
        -0.6023495712049978f,
        0.18414012509913835f,
        -0.26286205330961354f,
        0.9029438446296592f /* ...remaining dims */));

SearchResp searchResp = session.search(SearchReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .annsField("vector")
        .data(Collections.singletonList(queryVector))
        .limit(3)
        .outputFields(Arrays.asList("product_id", "title", "main_category", "price", "average_rating", "rating_number"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
// Note: session-based search (client.session + cluster-scoped search) is not
// supported in the Go SDK as of client/v3.0.0-beta.
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::MilvusClientV2SessionPtr session;
status = client->Session("inxx-xxxxxxxxxxxxx", session);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::SearchResponse search_response;
milvus::SearchRequest search_request;
search_request.WithDatabaseName("my_database")
    .WithCollectionName("my_collection")
    .WithAnnsField("vector")
    .WithMetricType(milvus::MetricType::COSINE)
    .WithLimit(3)
    .WithOutputFields({"product_id", "title", "main_category", "price", "average_rating", "rating_number"})
    .AddFloatVector({0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f /* ...remaining dims */});
status = session->Search(search_request, search_response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const session = client.session("inxx-xxxxxxxxxxxxx");

const queryVector = [
    0.3580376395471989,
    -0.6023495712049978,
    0.18414012509913835,
    -0.26286205330961354,
    0.9029438446296592 /* ...remaining dims */,
];

const res = await session.search({
    collection_name: "my_collection",
    data: [queryVector],
    anns_field: "vector",
    limit: 3,
    output_fields: ["product_id", "title", "main_category", "price", "average_rating", "rating_number"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/entities/search?cluster_id=inxx-xxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "my_collection",
    "data": [
        [
            0.3580376395471989,
            -0.6023495712049978,
            0.18414012509913835,
            -0.26286205330961354,
            0.9029438446296592
        ]
    ],
    "annsField": "vector",
    "limit": 3,
    "outputFields": [
        "product_id",
        "title",
        "main_category",
        "price",
        "average_rating",
        "rating_number"
    ]
}'
```

</TabItem>
</Tabs>

Then, you can explore your data and find the most valuable subset. Then you can connect to a serving cluster, import the data into it, and serve it for production.