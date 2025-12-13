---
title: "release() | Python | ORM"
slug: /python/python/Partition-release
sidebar_label: "release()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation releases the data of the current partition from memory. | Python | ORM"
type: docx
token: ZQ2RdE2AOoH9bfx4k3Sc3Ny0ngb
sidebar_position: 9
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - release()
  - pymilvus26
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - openai vector db
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# release()

This operation releases the data of the current partition from memory.

## Request Syntax\{#request-syntax}

```python
release(
    timeout: float | None
)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    This arises when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
])

# Create a collection
collection = Collection(
    name="test_collection",
    schema=schema
)

# Create a partition
partition = Partition(collection, name="comedy", description="comedy films")

# Load the partition data
partition.load()

# Release the partition data
partition.release()
```

## Related operations\{#related-operations}

The following operations are related to `release()`:

- [drop()](./Partition-drop)

- [get_replicas()](./Partition-get_replicas)

- [load()](./Partition-load)

