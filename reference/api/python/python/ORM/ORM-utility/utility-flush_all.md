---
displayed_sidbar: pythonSidebar
title: "flush_all() | Python | ORM"
slug: /python/python/utility-flush_all
sidebar_label: "flush_all()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation seals all segments. | Python | ORM"
type: docx
token: Uwsfd443boKKgyx2zZTcYDqKnCe
sidebar_position: 12
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - flush_all()
  - pymilvus25
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# flush_all()

This operation seals all segments.

## Request Syntax{#request-syntax}

```python
flush_all(
    using: str = "default",
    timeout: float | None,
    **kwargs,
)
```

**PARAMETERS:**

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

N/A

## Examples{#examples}

```python
from pymilvus import (
    connections, 
    Collection, 
    FieldSchema, 
    CollectionSchema, 
    DataType, 
    utility,
)

# Connect to localhost:19530
connections.connect()

# Create a collection
collection = Collection(
    name="test_collection_flush", 
    schema=CollectionSchema(fields=[
        FieldSchema("film_id", DataType.INT64, is_primary=True),
        FieldSchema("films", dtype=DataType.FLOAT_VECTOR, dim=128)
    ])
)

# Insert data
collection.insert([[1, 2], [[1.0, 2.0], [3.0, 4.0]]])

utility.flush_all(_async=False) # synchronized flush_all
# or use `future` to flush_all asynchronously

future = utility.flush_all(_async=True)
future.done() # flush_all finished
```

## Related operations{#related-operations}

The following operations are related to the `flush_all()` method:

- [drop_collection()](./utility-drop_collection)

- [has_collection()](./utility-has_collection)

- [has_partition()](./utility-has_partition)

- [list_collections()](./utility-list_collections)

- [rename_collection()](./utility-rename_collection)

