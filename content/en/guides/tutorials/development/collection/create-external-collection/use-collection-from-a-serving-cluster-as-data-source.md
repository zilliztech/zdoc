---
title: "Use a Collection from a Serving Cluster as Data Source | Cloud"
slug: /use-collection-from-a-serving-cluster-as-data-source
sidebar_label: "Collection as Source"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
channel: next
sidebar_custom_props:
  channel: next
description: "You can use a collection on another Zilliz Cloud serving cluster as the data source of an external collection. | Cloud"
type: origin
token: AzxFwQpn4iRElfkDrbVcorGqnYd
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Use a Collection from a Serving Cluster as Data Source

You can use a collection on another Zilliz Cloud serving cluster as the data source of an external collection.

On Zilliz Cloud, `external_source` accepts two schemes: `volume://<volume_name>/<path>` and `milvus://<instance_id>/<db_name>/<collection_name>`. The `milvus://` scheme points to a collection on another serving cluster compatible with Milvus v3.0.x in the same project and region. The scheme must be lowercase, all three segments are required (including `default` as the database name), and a single trailing slash is tolerated.

## Before you start\{#before-you-start}

- You have obtained an **API key** with sufficient permissions (read/write on the target and read on the source for cross-cluster sources). Username:password tokens are not accepted.

- For a collection from another serving cluster, the source is a regular collection (not another external collection) on **a serving cluster compatible with Milvus v3.0.x** in the **same project and region** as the target, and the target is a database for on-demand search accessed through the project endpoint with a query cluster.

- Cross-cluster sources (`milvus://`) are available through SDKs and the RESTful API only in the current release — the console does not support this source type. Note that the `milvus://` scheme is supported only in **AWS and Azure regions.**

## Create the collection\{#create-the-collection}

Create a schema with `external_source` set to the `milvus://` URI of the source collection. For each field, set `external_field` to the name of the corresponding field in the source collection; this example keeps the source field names. You can omit `external_spec`, because the format of a `milvus://` source defaults to `milvus-table`.

<Admonition type="info" title="Notes">

In Python, connect to the project endpoint with an API key and `option={"cluster_id": "<query cluster id>"}`, where `<query cluster id>` is the ID of the on-demand cluster that provides compute for the target database. For details about project endpoints, see [Connect for On-Demand Search](./connect-for-on-demand-search).

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# Connect to the project endpoint with an API key and the query cluster ID
client = MilvusClient(
    uri="https://{project-id}.{region}.api.zillizcloud.com",
    token="YOUR_API_KEY",
    db_name="my_database",
    option={"cluster_id": "<query cluster id>"},
)

# Point the schema to the source collection; external_spec is omitted
schema = MilvusClient.create_schema(
    external_source="milvus://in01-xxxxxxxxxxxxxxx/default/products",
)

# Map each field to the field with the same name in the source collection
schema.add_field(
    field_name="product_id",
    datatype=DataType.INT64,
    external_field="product_id",
)
schema.add_field(
    field_name="product_name",
    datatype=DataType.VARCHAR,
    max_length=512,
    external_field="product_name",
)
schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=768,
    external_field="embedding",
)

client.create_collection(
    collection_name="products_external",
    schema=schema,
)
```

</TabItem>

<TabItem value='bash'>

```bash
export PROJECT_ENDPOINT="https://{project-id}.{region}.api.zillizcloud.com"
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "products_external",
    "schema": {
        "externalSource": "milvus://in01-xxxxxxxxxxxxxxx/default/products",
        "fields": [
            {
                "fieldName": "product_id",
                "dataType": "Int64",
                "externalField": "product_id"
            },
            {
                "fieldName": "product_name",
                "dataType": "VarChar",
                "elementTypeParams": {
                    "max_length": "512"
                },
                "externalField": "product_name"
            },
            {
                "fieldName": "embedding",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "768"
                },
                "externalField": "embedding"
            }
        ]
    }
}'
```

</TabItem>
</Tabs>

## Verify with describe\{#verify-with-describe}

After the collection is created, describe it to confirm that it is bound to the source collection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.describe_collection(
    collection_name="products_external",
)

print(res)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/collections/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "products_external"
}'
```

</TabItem>
</Tabs>

`describe_collection` returns the `external_source` URI exactly as you passed it. The `external_spec` contains `format` (`milvus-table`) and the source binding — the source instance, database, and collection. Field IDs are preserved from the source collection (`preserve_field_ids=true`). No credentials are returned.

## Refresh data\{#refresh-data}

A refresh re-binds the external collection to the `external_source` passed in the request and syncs the latest data. You must pass `external_source` in every refresh request; omitting it leaves the collection serving the previously synced data.

A refresh job transitions from `RefreshInProgress` to `RefreshCompleted` or `RefreshFailed`. A second refresh submitted while one is in progress is rejected. Refresh waits for index building to finish, so its duration scales with data size — from seconds to hours for large collections.

For how to submit a refresh request and track its progress, see [Step 5: Refresh data](./create-external-collection#step-5-refresh-data) in Create an External Collection.

## Troubleshooting\{#troubleshooting}

The following table lists the errors that you may encounter and how to resolve them.

| Scenario | Error message | Resolution |
| --- | --- | --- |
| Malformed URI or missing segment | `invalid external_source: external_source must be milvus://<instance_id>/<db_name>/<collection_name>` | Correct the URI to the three-segment format. |
| Source instance does not exist or is not readable | `Source cluster <id> does not exist or you do not have permission to read it.` | Check the instance ID and the permissions of your API key. |
| Source collection does not exist | `Source collection <name> on cluster <id> is unavailable: ... collection not found ...` | Check the database name and the collection name. |
| Format conflict | `external_spec.format must be "milvus-table" (or omitted) for a milvus:// source, got "parquet"` | Omit `external_spec`, or set its format to `milvus-table`. |
| Concurrent refresh | `Refresh job <id> is already in progress for collection <name>; wait for it to complete before refreshing again.` | Wait for the current refresh job to complete. |
