---
displayed_sidbar: pythonSidebar
title: "drop() | Python | ORM"
slug: /python/python/Collection-drop
sidebar_label: "drop()"
beta: false
notebook: false
description: "This operation drops the current collection. | Python | ORM"
type: docx
token: L8UTdDNkPoeew0x6LoDcfHx4nof
sidebar_position: 8
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - drop()
  - pymilvus25
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop()

This operation drops the current collection. 

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

None

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

# Drop the collection
collection.drop()
```

## Related operations{#related-operations}

The following operations are related to `drop()`:

- [describe()](./Collection-describe)

- [flush()](./Collection-flush)

- [get_replicas()](./Collection-get_replicas)

- [set_properties()](./Collection-set_properties)

