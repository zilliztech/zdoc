---
displayed_sidbar: pythonSidebar
title: "drop() | Python | ORM"
slug: /python/python/Partition-drop
sidebar_label: "drop()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation drops the current partition. | Python | ORM"
type: docx
token: D3sndK8DgoqDkUxaNGcctwcSnuE
sidebar_position: 2
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - drop()
  - pymilvus25
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop()

This operation drops the current partition. 

## Request Syntax{#request-syntax}

```python
drop(
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

## Examples{#examples}

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
partition = Partition(
    collection=collection,
    name="test_partition"
)

# Drop the partition
partition.drop()
```

## Related operations{#related-operations}

The following operations are related to `drop()`:

- [get_replicas()](./Partition-get_replicas)

- [load()](./Partition-load)

- [release()](./Partition-release)

