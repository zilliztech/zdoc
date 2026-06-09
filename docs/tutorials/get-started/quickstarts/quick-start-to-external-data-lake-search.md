---
title: "Quickstart to External Data Lake Search | Cloud"
slug: /quick-start-to-external-data-lake-search
sidebar_label: "Quickstart to External Data Lake Search"
beta: FALSE
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

<Admonition type="info" icon="📘" title="Notes">

<p>External collection operations require an <strong>API key</strong> for authentication. This flow does not support <code>username:password</code> authentication.</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='bash'>

```bash
export PROJECT_ENDPOINT="https://{project-id}.{region}.api.zillizcloud.com"
```

</TabItem>
</Tabs>

## Step 2: (Optional) Create a database.\{#step-2-optional-create-a-database}

Zilliz Cloud ships with a default database. If you choose that, skip this step. You can also create a database as follows.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_database(
    db_name="my_database"
)
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

The following example demonstrates how to set up the mapping relationship between collection fields and your data files. When initiating the schema, pass in the volume path and file format of your data.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema(
    external_source='volume://my_volume/iceberg/metadata/00001-xxx.metadata.json',
    external_spec='{
        "format": "iceberg-table",
        "snapshot_id": "1234567890123456789"
    }'
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

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
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

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
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

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# refresh the external database
job_id = client.refresh_external_collection(
    collection_name="my_collection"
)
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
    "dbName": "default",
    "collectionName": "my_collection"
}'

# job-xxxxxxxxxxxxxxxxxxx
```

</TabItem>
</Tabs>

Then you can create a loop to wrap the progress-monitoring calls and track the refresh operation's progress.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
progress = client.get_refresh_external_collection_progress(job_id=job_id)
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

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
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