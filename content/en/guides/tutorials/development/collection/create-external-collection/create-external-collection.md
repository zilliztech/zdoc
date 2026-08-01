---
title: "Create an External Collection | Cloud"
slug: /create-external-collection
sidebar_label: "External Collection"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "An external collection is a type of data collection in Zilliz Cloud that accesses data from external storage systems or database tables such as AWS S3 and Iceberg without copying it into Zilliz Cloud. It acts as a query layer over data lakes while maintaining compatibility with Zilliz Cloud query interfaces. | Cloud"
type: origin
token: RsGAwmgAYiE6fgkOiokcijsBnEg
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create an External Collection

An external collection is a type of data collection in Zilliz Cloud that accesses data from external storage systems or database tables such as AWS S3 and Iceberg without copying it into Zilliz Cloud. It acts as a query layer over data lakes while maintaining compatibility with Zilliz Cloud query interfaces.

## Overview\{#overview}

In a typical AI data pipeline, users may already have stored their data in Parquet or other formats on their storage system, such as AWS S3. To make Zilliz Cloud consume this externally stored data, users usually need to import it into Zilliz Cloud's own storage using Extract-Transform-Load (ETL) pipelines. 

This bring-your-data-to-Zilliz Cloud workflow creates redundant data that is hard to synchronize and adds to the engineering maintenance burden to ensure data consistency.

![YQXWwPQ3vheYa4b8398cWoPNnyN](https://zdoc-images.s3.us-west-2.amazonaws.com/YQXWwPQ3vheYa4b8398cWoPNnyN.png)

To resolve these issues, Zilliz Cloud delivers external collections that let you access your externally stored data from Zilliz Cloud without worrying about data synchronization and ETL pipelines.

![Q6F4wtcd2h3PnKbnMxncw3urn3f](https://zdoc-images.s3.us-west-2.amazonaws.com/Q6F4wtcd2h3PnKbnMxncw3urn3f.png)

Once created, an external collection can access your data directly and keep it in the same place where you store it. In the background, Zilliz Cloud creates manifest files to record the mappings between the Zilliz Cloud metadata and the rows in external data files. After the manifest files are ready, you can create indexes in the external collection as you would in any managed collection. 

When your data changes, manually triggering a sub-second refresh updates the metadata, keeping Zilliz Cloud always up to date.

External collections are available in the databases for on-demand computing.

## Step 1: Create schema\{#step-1-create-schema}

As with creating a managed collection, you also need to create a schema before creating an external collection. However, the schema is slightly different from that of a managed collection.

### Preparation\{#preparation}

- You have obtained an API key with sufficient permissions to create an external collection in a database for on-demand computing.

    For details, refer to [API Keys](./manage-api-keys).

- You have integrated your object storage bucket with Zilliz Cloud.

    For details, refer to [AWS](./integrate-with-aws-s3), [GCP](./integrate-with-gcp), and [Azure](./integrate-with-azure-blob-storage) docs.

- You have created an external volume out of the bucket integration. Ensure that the volume contains the target data files.

    For details, refer to [External Volumes](./external-volume).

### Support data sources\{#support-data-sources}

Zilliz Cloud supports the following data sources, and you should provide the corresponding external sources in the format you choose.

- `parquet`

    Set `external_source` to the folder containing the target Parquet files.

- `vortex`,

    Set `external_source` to the folder containing the Vortex columnar files for version 0.56.

- `lance-table`

    Set `external_source` to a folder path that contains sub-folders, such as **_transactions**, **_versions**, and **data**.

- `iceberg-table`

    Set `external_source` to the `metadata.json` file of the Iceberg table, and pass in the snapshot ID, as in

    ```python
    external_spec={
        "format": "iceberg-table",
        "snapshot_id": "473984310232959286"
    }
    ```

- `milvus-table`

    Set `external_source` to the concrete Milvus snapshot metadata JSON file. For details, refer to [Use Snapshot as Data Source](./use-milvus-snapshot-as-data-source).

### Set up schema\{#set-up-schema}

Once you have an external volume containing the target data files, create the schema to map collection columns to Parquet files (`parquet`), a lance table (`lance-table`), an Iceberg table (`iceberg-table`), or Vortex files of the 0.56.0 format (`vortex`).

<Admonition type="info" icon="📘" title="Notes">

The external source should end with a forward slash (/) to indicate this is a folder.

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema(
    external_source='volume://my_volume/path/to/a/folder/',
    external_spec='{"format": "parquet"}'
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.JsonObject;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

JsonObject externalSpec = new JsonObject();
externalSpec.addProperty("format", "parquet");
CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .externalSource("volume://my_volume/path/to/a/folder/")
        .externalSpec(externalSpec)
        .build();
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
    client "github.com/milvus-io/milvus/client/v2/milvusclient"
)

schema := entity.NewSchema().
    WithName("product_embeddings").
    WithExternalSource("volume://my_volume/path/to/a/folder/"). 
    WithExternalSpec(\`{"format": "parquet"}\`)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
export fields='[
    {
        "fieldName": "product_id",
        "dataType": "Int64",
        "isPrimary": true
    },
    {
        "fieldName": "embedding",
        "dataType": "FloatVector",
        "elementTypeParams": {
            "dim": "768"
        }
    },
    {
        "fieldName": "product_name",
        "dataType": "VarChar",
        "elementTypeParams": {
            "max_length": 512
        }
    }
]'
```

</TabItem>
</Tabs>

## Step 2: Add fields\{#step-2-add-fields}

Once the schema is ready, you can add fields as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema.add_field(
    field_name="product_id",
    datatype=DataType.INT64,
    # highlight-next
    external_field="id" # field name in the external data file
)
schema.add_field(
    field_name="product_name",
    datatype=DataType.VARCHAR,
    max_length=512,
    # highlight-next
    external_field="name"
)
schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=768,
    # highlight-next
    external_field="vector"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;

schema.addField(AddFieldReq.builder()
        .fieldName("product_id")
        .dataType(DataType.Int64)
        .externalField("id")
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("product_name")
        .dataType(DataType.VarChar)
        .maxLength(512)
        .externalField("name")
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("embedding")
        .dataType(DataType.FloatVector)
        .dimension(768)
        .externalField("vector")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
    client "github.com/milvus-io/milvus/client/v2/milvusclient"
)

schema = schema.
    WithField(
        entity.NewField().
            WithName("product_id").
            WithDataType(entity.FieldTypeInt64).
            WithExternalField("id"), 
    ).
    WithField(
        entity.NewField().
            WithName("product_name").
            WithDataType(entity.FieldTypeVarChar).
            WithMaxLength(512).
            WithExternalField("name"),
    ).
    WithField(
        entity.NewField().
            WithName("embedding").
            WithDataType(entity.FieldTypeFloatVector).
            WithDim(768).
            WithExternalField("vector"),
    )
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
export schema="{
    \"externalSource\": \"volume://my_volume/path/to/a/folder\",
    \"externalSpec\": \"{\\\"format\\\": \\\"parquet\\\"}\",
    \"fields\": $fields
}"
```

</TabItem>
</Tabs>

## Step 3: Create a collection\{#step-3-create-a-collection}

After adding all the fields to the schema, you can create the external collection.

<Admonition type="info" icon="📘" title="Notes">

You can create external collections in a database at the project level, which is usually associated with an on-demand cluster.

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# connect the database
client = MilvusClient(
    uri="https://{project-id}.{region}.vectordb.zillizcloud.com",
    token="YOUR_API_KEY"
)

client.use_database(
    db_name="my_database"
)
# create the collection
client.create_collection(
    collection_name="test_collection",
    schema=schema
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("https://{project-id}.{region}.vectordb.zillizcloud.com")
        .token("YOUR_API_KEY")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);
CreateCollectionReq createReq = CreateCollectionReq.builder()
        .dbName("my_database")
        .collectionName("test_collection")
        .collectionSchema(schema)
        .build();
client.createCollection(createReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
    client "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()
milvusAddr := "https://{project-id}.{region}.vectordb.zillizcloud.com"
token := "YOUR_API_KEY"
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey: token
})
err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("test_collection", schema).
    WithDBName("my_database").
    WithIndexOptions(indexOptions...))
    
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
export PROJECT_ENDPOINT='https://{project-id}.{region}.vectordb.zillizcloud.com'
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"dbName\": \"my_database\",
    \"collectionName\": \"test_collection\",
    \"schema\": $schema
}"
```

</TabItem>
</Tabs>

## Step 4: Create indexes\{#step-4-create-indexes}

You can create indexes for external collection columns as you do in managed collections.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()
# Add indexes
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",
    metric_type="COSINE"
)
index_params.add_index(
    field_name="product_name",
    index_type="AUTOINDEX"
)
client.create_index(
    db_name="my_database",
    collection_name="test_collection",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.*;

IndexParam indexParamForIdField = IndexParam.builder()
        .fieldName("product_name")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build();
IndexParam indexParamForVectorField = IndexParam.builder()
        .fieldName("embedding")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .metricType(IndexParam.MetricType.COSINE)
        .build();
List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(indexParamForIdField);
indexParams.add(indexParamForVectorField);
CreateIndexReq createIndexReq = CreateIndexReq.builder()
        .dbName("my_database")
        .collectionName("test_collection")
        .indexParams(indexParams)
        .build();
client.createIndex(createIndexReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

collectionName := "test_collection"
indexOptions := []milvusclient.CreateIndexOption{
    milvusclient.NewCreateIndexOption(collectionName, "embedding", index.NewAutoIndex(entity.COSINE)),
    milvusclient.NewCreateIndexOption(collectionName, "product_name", index.NewAutoIndex(index.AUTOINDEX)),
}
indexTask, err := client.CreateIndex(ctx, indexOptions)
if err != nil {
    // handler err
}
err = indexTask.Await(ctx)
if err != nil {
    // handler err
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.createIndex({
    db_name: "my_database",
    collection_name: "test_collection",
    field_name: "product_name",
    index_type: "AUTOINDEX"
})
client.createIndex({
    db_name: "my_database",
    collection_name: "test_collection",
    field_name: "embedding",
    index_type: "AUTOINDEX",
    metric_type: "COSINE"
})
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
        {
            "fieldName": "embedding",
            "indexName": "my_vector",
            "indexType": "AUTOINDEX"
        },
        {
            "fieldName": "product_name",
            "indexName": "my_id",
            "indexType": "AUTOINDEX"
        }
    ]'
    
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"dbName\": \"my_database\",
    \"collectionName\": \"test_collection\",
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## Step 5: Refresh data\{#step-5-refresh-data}

Once the collection is ready, refresh it to create the metadata and indexes for your data.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
job_id = client.refresh_external_collection(
    db_name="my_database",
    collection_name="test_collection"
)
while True:
    progress = client.get_refresh_external_collection_progress(job_id=job_id)
    print(f"  {progress.state}: {progress.progress}%")
    if progress.state == "RefreshCompleted":
        elapsed = progress.end_time - progress.start_time
        print(f"  Completed in {elapsed}ms")
        break
    elif progress.state == "RefreshFailed":
        print(f"  Failed: {progress.reason}")
        break
    time.sleep(2)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.GetRefreshExternalCollectionProgressReq;
import io.milvus.v2.service.utility.request.ListRefreshExternalCollectionJobsReq;
import io.milvus.v2.service.utility.request.RefreshExternalCollectionReq;
import io.milvus.v2.service.utility.response.GetRefreshExternalCollectionProgressResp;
import io.milvus.v2.service.utility.response.ListRefreshExternalCollectionJobsResp;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionJobInfo;
import io.milvus.v2.service.utility.response.RefreshExternalCollectionResp;

while (true) {
    GetRefreshExternalCollectionProgressResp resp = client.getRefreshExternalCollectionProgress(
            GetRefreshExternalCollectionProgressReq.builder()
                    .jobId(jobId)
                    .build());
    RefreshExternalCollectionJobInfo jobInfo = resp.getJobInfo();
    if ("RefreshCompleted".equals(jobInfo.getState())) {
        long elapsed = jobInfo.getEndTime() - jobInfo.getStartTime();
        System.out.printf("  Refresh completed in %dms%n", elapsed);
        break;
    } else if ("RefreshFailed".equals(jobInfo.getState())) {
        System.out.printf("  Refresh failed: %s%n", jobInfo.getReason());
    }
    TimeUnit.SECONDS.sleep(2);
}
```

</TabItem>

<TabItem value='go'>

```go
refreshResult, err := client.RefreshExternalCollection(ctx,
    client.NewRefreshExternalCollectionOption("test_collection"))
jobID := refreshResult.JobID
for {
    progress, _ := client.GetRefreshExternalCollectionProgress(ctx,
        client.NewGetRefreshExternalCollectionProgressOption(jobID))
    fmt.Printf("State: %s\n", progress.State)
    if progress.State == entity.RefreshStateCompleted {
        fmt.Println("Refresh completed!")
        break
    }
    if progress.State == entity.RefreshStateFailed {
        fmt.Printf("Refresh failed: %s\n", progress.Reason)
        break
    }
    time.Sleep(2 * time.Second)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/jobs/external_collection/refresh" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"dbName\": \"my_database\",
    \"collectionName\": \"test_collection\",
    \"externalSource\": \"volume://my_volume/path/to/a/folder\",
    \"externalSpec\": \"{\\\"format\\\": \\\"parquet\\\"}\"
}"
```

</TabItem>
</Tabs>

The refresh operation is asynchronous, so you need to set up an iteration to monitor its progress.

<Admonition type="info" icon="📘" title="Notes">

- The refresh operation scans the metadata of the data files and generates the manifest files accordingly. It usually takes 150-250 ms.

- The manifest files record the mapping between the metadata in Milvus and the rows in external files.

- If there is an update to your source data, you need to manually call refresh again to keep Zilliz Cloud up to date.

- A refresh that requires removing all active metadata without any insertions results in a denial.

- For external collections in a database for on-demand computing, you do not need to load and release them manually.

</Admonition>

## Follow-ups\{#follow-ups}

Once you have refreshed the external collection, you can  perform similarity searches and queries in the external collection as you would in any managed collection, except that collections in a database for on-demand computing must be attached to an on-demand cluster for searches and queries. For details, refer to [Create On-Demand Cluster](./on-demand-cluster) and its sibling pages.

Before conducting DQL operations, such as search, query, get, and hybrid search, you need to create a session to attach the compute resources of an on-demand cluster. For details, refer to [On-Demand DQL Operations](./dql-sessions-external-collection).



import DocCardList from '@theme/DocCardList';

<DocCardList />