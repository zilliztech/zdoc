---
title: "load() | Python | ORM"
slug: /python/python/Partition-load
sidebar_label: "load()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation loads the data of the current partition into memory. | Python | ORM"
type: docx
token: TWxddf6iboyM15xK4Kzc8ASknRb
sidebar_position: 6
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - load()
  - pymilvus26
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# load()

This operation loads the data of the current partition into memory.

<Admonition type="info" icon="📘" title="Notes">

<p>Using the <strong>partition_names</strong> parameter in the <strong>load()</strong> method of a <strong>Collection</strong> object is equivalent to using the <strong>load()</strong> method of corresponding <strong>Partition</strong> objects.</p>

</Admonition>

## Request Syntax\{#request-syntax}

```python
load(
    replica_number: int,
    timeout: float | None
)
```

**PARAMETERS:**

- **replica_number** (*int*)

    The number of replicas to load in the current partition. The default value is **1**, indicating that one replica in the current partition is loaded.

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
from pymilvus import Collection, Partition, CollectionSchema, FieldSchema, DataType

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

# Load a partition with one replica of the collection data
partition.load()

# Load a partition with two replicas of the collection data
partition.load(
    replica_number=2
)
```

## Related operations\{#related-operations}

The following operations are related to `load()`:

- [drop()](./Partition-drop)

- [get_replicas()](./Partition-get_replicas)

- [release()](./Partition-release)

