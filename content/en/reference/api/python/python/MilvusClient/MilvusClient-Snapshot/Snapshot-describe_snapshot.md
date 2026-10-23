---
title: "describe_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-describe_snapshot
sidebar_label: "describe_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation retrieves detailed metadata about a specific snapshot, including the source collection, partition names, creation timestamp, and storage location. | Python | MilvusClient"
type: docx
token: GF0yd9S4RoImivxbIlPcicEynQb
sidebar_position: 2
keywords: 
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search
  - zilliz
  - zilliz cloud
  - cloud
  - describe_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_snapshot()

This operation retrieves detailed metadata about a specific snapshot, including the source collection, partition names, creation timestamp, and storage location.

## Request Syntax\{#request-syntax}

```python
describe_snapshot(
```

**PARAMETERS:**

- **snapshot_name** (*str*) -

    **[REQUIRED]**

    The name of the snapshot to describe.

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of the collection the snapshot belongs to.

- **db_name** (*str*) -

    The name of the database that holds the collection. If this parameter is left empty, the default database is used.

- **timeout** (*Optional[float]*) -

    An optional duration of time in seconds to allow for the RPC.

**RETURN TYPE:**

*SnapshotInfo*

**RETURNS:**

A dataclass containing snapshot metadata with the following fields:.

**EXCEPTIONS:**

- **MilvusException**

    If the snapshot does not exist or the operation fails. If the snapshot does not exist or the operation fails.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

info = client.describe_snapshot(
    snapshot_name="backup_20260418",
    collection_name="my_collection",
)
print(f"Snapshot: {info.name}")
print(f"Collection: {info.collection_name}")
print(f"Partitions: {info.partition_names}")
print(f"Created at: {info.create_ts}")
print(f"S3 location: {info.s3_location}")
```
