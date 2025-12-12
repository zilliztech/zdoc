---
title: "flush() | Python | ORM"
slug: /python/python/Partition-flush
sidebar_label: "flush()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation seals all segments in the partition. Any insertions after this operation will generate a new segment. | Python | ORM"
type: docx
token: VRGwdg75Ao7ZXQx7uANc9wzXnVb
sidebar_position: 3
keywords: 
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - flush()
  - pymilvus26
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# flush()

This operation seals all segments in the partition. Any insertions after this operation will generate a new segment.

## Request Syntax\{#request-syntax}

```python
flush(
    timeout: float | None
)   
```

<Admonition type="info" icon="📘" title="Can I call `flush()` after every data insertion?">

<p>When new data is inserted, it is written into growing segments. Once the size of a growing segment reaches its upper limit, Zilliz Cloud automatically seals the segment. </p>
<p>Continuously calling this operation results in many sealed segments of small sizes, which can gradually degrade search performance. </p>
<p>It is recommended that you wait for Zilliz Cloud to seal all segments before conducting any searches.</p>

</Admonition>

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

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
partition = Partition(
    collection=collection,
    name="test_partition"
)

# Insert a list of columns
partition.insert(
    data=[
        [0,1,2,3,4],                         # id
        [                                    # vector
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
        ],
    ]
)

# Flush the data 
partition.flush()

# Check the number of flushed entities in the partition 
partition.num_entities # 5
```

## Related operations\{#related-operations}

The following operations are related to `flush()`:

- [delete()](./Partition-delete)

- [insert()](./Partition-insert)

- [query()](./Partition-query)

- [search()](./Partition-search)

- [upsert()](./Partition-upsert)

