---
title: "load_state() | Python | ORM"
slug: /python/python/utility-load_state
sidebar_label: "load_state()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the load status of a specific collection. | Python | ORM"
type: docx
token: BJysdlj1MoksHZxNRxicHn9fnSh
sidebar_position: 33
keywords: 
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database
  - zilliz
  - zilliz cloud
  - cloud
  - load_state()
  - pymilvus26
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# load_state()

This operation returns the load status of a specific collection.

## Request syntax\{#request-syntax}

```python
load_state(
    collection_name: str,
    partition_names: list[str] | None
    using: str = "default",
    timeout: float | None
) -> LoadState
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of a collection.

- **partition_names** (*list[str]*) -

    A list of partition names.

    If any partition names are specified, releasing any of these partitions results in the return of a **NotLoad** state.

- **using** (*string*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*LoadState*

**RETURNS:**
A **LoadState** object that indicates the load status of the specified collection.

The possible states are as follows:

- **Loaded**

    Indicates that the specified collection is loaded.

- **Loading**

    Indicates that the specified collection is being loaded.

- **NotExist**

    Indicates that the specified collection does not exist. 

    Including a non-existing partition in **partition_names** results in a **MilvusException**.

- **NotLoad**

    Indicates that the specified collection is not loaded.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import (
    connections, 
    Collection, 
    CollectionSchema, 
    FieldSchema, 
    DataType, 
    utility,
)

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a collection
collection = Collection(
    name="test_collection",
    schema=CollectionSchema([
        FieldSchema("id", DataType.INT64, is_primary=True),
        FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
    ])
)

# Set the index parameters
index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "COSINE",
    "params": {
        "nprobe": 10
    }
}

# Create an index on the vector field
collection.create_index(
    field_name="vector", 
    index_params=index_params, 
    timeout=None
)

# Load the collection
collection.load()

# Create two partitions
partition1 = collection.create_partition("partition1")
partition2 = collection.create_partition("partition2")

# Check the load
utility.load_state(
    collection_name="test_collection",
    partition_names=["partition1", "partition2"],
    using=using,
    timeout=timeout,
) # <LoadState: Loaded>

# Release a partition
partition2.release()

utility.load_state(collection_name="test_collection") # <LoadState: Loaded>

utility.load_state(
    collection_name="test_collection",
    partition_names=["partition1", "partition2"],
) # <LoadState: NotLoad>
```

## Related operations\{#related-operations}

The following operations are related to `load_state()`:

- [Partition](./ORM-Partition)

- [load()](./Collection-load)

- [release()](./Collection-release)

- [loading_progress()](./utility-loading_progress)

- [wait_for_loading_complete()](./utility-wait_for_loading_complete)

