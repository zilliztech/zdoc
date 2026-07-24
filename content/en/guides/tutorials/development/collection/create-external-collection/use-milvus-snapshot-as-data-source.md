---
title: "Use Snapshot as Data Source | Cloud"
slug: /use-milvus-snapshot-as-data-source
sidebar_label: "Snapshot as Source"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "You can create an external collection from a Milvus snapshot by using the snapshot metadata JSON path as `externalsource` and setting `externalspec.format` to `\"milvus-table\"`. | Cloud"
type: origin
token: JfJvwdGz0iD9LpkrCMccZ2ypn0g
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Use Snapshot as Data Source

You can create an external collection from a Milvus snapshot by using the snapshot metadata JSON path as `external_source` and setting `external_spec.format` to `"milvus-table"`. 

After you refresh the external collection, Milvus maps the source segment manifests into target external segments. The main column data remains referenced from the snapshot source, while target-owned data such as generated function outputs and converted delete logs is written under the target collection.

## Before you start\{#before-you-start}

Before you create the external collection, make sure that

- the source snapshot was created from a collection in a Zilliz Cloud cluster compatible with Milvus v3.0.x server;

- the source collection is not itself an external collection;

- `external_source` points to the concrete snapshot metadata JSON file, for example `s3://bucket/snapshots/{source_collection_id}/metadata/{snapshot_id}.json`;

- each target data field sets `external_field` to the matching source field name; and

- the target schema matches the source snapshot schema for mapped data fields.

If the source snapshot is not from a collection created on a Zilliz Cloud cluster compatible with Milvus instance of the v3.0.x release, the source schema does not match the target schema, the snapshot metadata JSON is missing manifest information, or the source is another external collection, creation or refresh fails.

## Create an external collection from a Milvus snapshot\{#create-an-external-collection-from-a-milvus-snapshot}

In the following example, you will create a `milvus-table` external collection from an existing snapshot and refreshes it.

### Step 1: Get the snapshot metadata path\{#step-1-get-the-snapshot-metadata-path}

Create or choose a snapshot from a normal Milvus collection, and then describe it to get its object-storage location.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

snapshot_info = client.describe_snapshot(
    snapshot_name="analytics_snapshot_20260321",
    include_collection_info=True
)

external_source = f"s3://bucket/{snapshot_info.s3_location}"
```

</TabItem>

<TabItem value='java'>

```java
//java
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
# rest
```

</TabItem>
</Tabs>

### Step 2: Create and refresh a `milvus-table` external collection\{#step-2-create-and-refresh-a-milvus-table-external-collection}

Create an external collection whose schema matches the snapshot source collection. Set `external_spec.format` to `"milvus-table"`, and set each target data field's `external_field` to the corresponding source field name.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
schema = client.create_schema(
    external_source=external_source,
    external_spec="""{
        "format": "milvus-table",
        "extfs": {
            "cloud_provider": "aws",
            "region": "us-west-2",
            "access_key_id": "YOUR_ACCESS_KEY",
            "access_key_value": "YOUR_SECRET_KEY"
        }
    }""",
)

schema.add_field(
    field_name="id",
    datatype=DataType.INT64,
    is_primary=True,
    external_field="id",
)
schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=768,
    external_field="embedding",
)

client.create_collection(
    collection_name="snapshot_external_collection",
    schema=schema,
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "time"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    Token:   "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    panic(err)
}

snapshot, err := client.DescribeSnapshot(
    ctx,
    milvusclient.NewDescribeSnapshotOption("analytics_snapshot_20260321", "source_collection"),
)
if err != nil {
    panic(err)
}

externalSource := fmt.Sprintf("s3://bucket/%s", snapshot.GetS3Location())
externalSpec := `{
  "format": "milvus-table",
  "extfs": {
    "cloud_provider": "aws",
    "region": "us-west-2",
    "access_key_id": "YOUR_ACCESS_KEY",
    "access_key_value": "YOUR_SECRET_KEY"
  }
}`

schema := entity.NewSchema().
    WithName("snapshot_external_collection").
    WithExternalSource(externalSource).
    WithExternalSpec(externalSpec).
    WithField(entity.NewField().
        WithName("id").
        WithDataType(entity.FieldTypeInt64).
        WithIsPrimaryKey(true).
        WithExternalField("id")).
    WithField(entity.NewField().
        WithName("embedding").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(768).
        WithExternalField("embedding"))

err = client.CreateCollection(
    ctx,
    milvusclient.NewCreateCollectionOption("snapshot_external_collection", schema),
)
if err != nil {
    panic(err)
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
# rest
```

</TabItem>
</Tabs>

## Refresh data\{#refresh-data}

Once the collection is ready, refresh it to create the metadata and indexes for your data. For details, refer to [Create an External Collection](./create-external-collection#step-5-refresh-data).

