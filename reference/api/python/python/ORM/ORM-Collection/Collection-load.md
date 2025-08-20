---
displayed_sidbar: pythonSidebar
title: "load() | Python | ORM"
slug: /python/python/Collection-load
sidebar_label: "load()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation loads the data of the current collection into memory. | Python | ORM"
type: docx
token: HQDndiGwloWKIexgPCUcEZGenOh
sidebar_position: 20
keywords: 
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window
  - zilliz
  - zilliz cloud
  - cloud
  - load()
  - pymilvus25
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# load()

This operation loads the data of the current collection into memory. 

## Request Syntax{#request-syntax}

```python
load(
    partition_names: list[str] | None, 
    replica_number: int, 
    timeout: float | None, 
)
```

<Admonition type="info" icon="📘" title="Notes">

<p>This operation is non-blocking. You can call <code>utility.wait_for_loading_complete()</code> to block the current process.</p>

</Admonition>

**PARAMETERS:**

- **partition_names** (*list(str)* | *None*) - 

    The partitions of the current collection to load. If left unspecified, all partitions are to be loaded.

- **timeout** (*float* | *None*)  -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    This exception is to be raised when any error occurs during this operation.

<Admonition type="danger" icon="🚧" title="Warning">

<p>If you try to load a collection that is not indexed, you will receive a <strong>MilvusException</strong>.</p>

</Admonition>

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

# Load the entire collection with one replica of the collection data
collection.load()

# Load the entire collection with two replicas of the collection data
collection.load(
    replica_number=2
)

# Load a specific partition with two replicas of the partition data
collection.load(
    partition_names=["partitionA"],
    replica_number=2
)
```

## Related operations{#related-operations}

The following operations are related to `load()`:

- [Partition](./ORM-Partition)

- [release()](./Collection-release)

- [load_state()](./utility-load_state)

- [loading_progress()](./utility-loading_progress)

- [wait_for_loading_complete()](./utility-wait_for_loading_complete)

