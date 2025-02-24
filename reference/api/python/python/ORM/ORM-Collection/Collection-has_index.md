---
displayed_sidbar: pythonSidebar
title: "has_index() | Python | ORM"
slug: /python/python/Collection-has_index
sidebar_label: "has_index()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation checks whether the current collection has a built index. | Python | ORM"
type: docx
token: WDk4dXY8IoV3SJxp9e7c3aq1nBh
sidebar_position: 15
keywords: 
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - has_index()
  - pymilvus25
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# has_index()

This operation checks whether the current collection has a built index.

## Request Syntax{#request-syntax}

```python
has_index(timeout: float | None)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*bool*

**RETURNS:**

A boolean value indicating whether the current collection has a built index or not.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

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

# Create an index
collection.create_index(
    field_name="test_collection", 
    index_params=index_params, 
    timeout=None
)

# Check the index
collection.has_index() # True

# Drop the index
collection.drop_index()

# Check the index
collection.has_index() # False
```

## Related operations{#related-operations}

The following operations are related to `has_index()`:

- [create_index()](./Collection-create_index)

- [drop_index()](./Collection-drop_index)

- [index()](./Collection-index)

- [index_building_progress()](./utility-index_building_progress)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

- [list_indexes()](./utility-list_indexes)

