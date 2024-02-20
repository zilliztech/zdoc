---
displayed_sidbar: pythonSidebar
slug: /python/Collection-release
beta: false
notebook: false
token: CBwkdDs7MoKkVKx0kJgcPUNxn6s
sidebar_position: 23
---

import Admonition from '@theme/Admonition';


# release()

This operation releases the data of the current collection from memory.

```python
pymilvus.Collection.release(
    timeout=None,
)
```

The following operations are related to `release()`:

- Collection

- Partition

- load()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Collection

# Get an existing collection
collection = Collection(name="string")

# Load the collection data
collection.load()

# Release the collection data
collection.release()
```

__PARAMETERS:__

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

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

