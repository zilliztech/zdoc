---
displayed_sidbar: pythonSidebar
slug: /python/Collection-drop_index
beta: false
notebook: false
token: AtkDdtMAWodFzExARxnco5xLnsg
sidebar_position: 9
---

import Admonition from '@theme/Admonition';


# drop_index()

This operation deletes index from the current collection.

```python
pymilvus.Collection.drop_index(timeout: float | None)
```

The following operations are related to `drop_index()`:

- create_index()

- has_index()

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

# drop the index of the collection
collection.drop_index()
```

__PARAMETERS:__

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_None_

__RETURNS:__

_NoneType_

__EXCEPTIONS:__

- __MilvusException__

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

