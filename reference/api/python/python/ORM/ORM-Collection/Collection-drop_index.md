---
displayed_sidbar: pythonSidebar
slug: /python/python/Collection-drop_index
beta: FALSE
notebook: FALSE
type: docx
token: AtkDdtMAWodFzExARxnco5xLnsg
sidebar_position: 9
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_index()

This operation deletes index from the current collection.

## Request Syntax{#request-syntax}

```python
drop_index(timeout: float | None)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*None*

**RETURNS:**

*NoneType*

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

The following operations are related to `drop_index()`:

- [create_index()](./Collection-create_index)

- [has_index()](./Collection-has_index)

- [index()](./Collection-index)

- [index_building_progress()](./utility-index_building_progress)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

- [list_indexes()](./utility-list_indexes)

