---
displayed_sidbar: pythonSidebar
title: "release() | Python | ORM"
slug: /python/python/Collection-release
sidebar_label: "release()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation releases the data of the current collection from memory. | Python | ORM"
type: docx
token: CBwkdDs7MoKkVKx0kJgcPUNxn6s
sidebar_position: 24
keywords: 
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db
  - zilliz
  - zilliz cloud
  - cloud
  - release()
  - pymilvus25
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# release()

This operation releases the data of the current collection from memory.

## Request Syntax{#request-syntax}

```python
release(
    timeout=None,
)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

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

# Load the entire collection with one replica of the collection data
collection.load()

# Release the entire collection data
collection.release()
```

## Related operations{#related-operations}

The following operations are related to `release()`:

- [Partition](./ORM-Partition)

- [load()](./Collection-load)

- [load_state()](./utility-load_state)

- [loading_progress()](./utility-loading_progress)

- [wait_for_loading_complete()](./utility-wait_for_loading_complete)

