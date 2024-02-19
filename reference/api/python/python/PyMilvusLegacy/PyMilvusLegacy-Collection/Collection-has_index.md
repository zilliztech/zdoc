---
displayed_sidbar: pythonSidebar
slug: /python/Collection-has_index
beta: false
notebook: false
token: WDk4dXY8IoV3SJxp9e7c3aq1nBh
sidebar_position: 9
---

import Admonition from '@theme/Admonition';


# has_index()

This operation checks whether the current collection has a built index.

```python
pymilvus.Collection.has_index(timeout: float | None)
```

The following operations are related to `has_index()`:

- create_index()

- drop_index()

- index()

- utility.index_building_progress()

- utility.wait_for_index_building_complete()

- utility.list_indexes()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Collection

# Get an existing collection
collection = Collection(name="string")

# check whether the current collection has a built index
collection.has_index() # False
```

**PARAMETERS:**

- **timeout** (*float *|* None*)  

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

