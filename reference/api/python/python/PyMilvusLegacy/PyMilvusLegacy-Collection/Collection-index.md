---
displayed_sidbar: pythonSidebar
slug: /python/Collection-index
beta: false
notebook: false
type: docx
token: RkQ8dnWDHo3DiDxiCVRcP1xPnob
sidebar_position: 17
---

import Admonition from '@theme/Admonition';


# index()

This operation gets the specified index of the current collection.

## Request Syntax{#request-syntax}

```python
index(
    **kwargs
)
```

__PARAMETERS:__

- __kwargs - __

    Additional keyword arguments.

    - __index_name__ (_str_) -

        The name of the index. If no index is specified, the default index name is used.

        A default index name is in the following format: `_default_idx_{field_id}`.

__RETURN TYPE:__

_Index_

__RETURNS:__

An Index object of the current collection.

__EXCEPTIONS:__

- __IndexNotExistException__

    This exception will be raised when the specified index does not exist.

- __AmbiguousIndexName__

    This exception will be raised when multiple indexes exist but no index name has been specified. 

## Examples{#examples}

<include target="milvus">

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

# Create an index on a scalar field
collection.create_index(
    field_name="id"
)

# Set the index parameters
index_params = {
    "index_type": "IVF_FLAT",
    "metric_type": "COSINE",
    "params": {
        "nlist": 128
    }
}

# Create an index on the vector field
collection.create_index(
    field_name="vector", 
    index_params=index_params, 
    timeout=None
)

# Check the index
collection.has_index() # True

# list all index names
collection.indexes

# [<pymilvus.orm.index.Index at 0x12045f910>,
# <pymilvus.orm.index.Index at 0x12045d0d0>]

# Get a specific index object
collection.index(index_name="_default_idex_101")

# <pymilvus.orm.index.Index at 0x1205b8690>
```

</include>

<include target="zilliz">

```python
from pymilvus import Collection

# Get an existing collection
collection = Collection(name="test_collection")

# Create an index on a scalar field
collection.create_index(
    field_name="id"
)

# Set the index parameters
index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "COSINE",
    "params": {
        "nprobe": 10
    }
}

# Create an index on the vector field
collection.create_index(
    field_name="vector", 
    index_params=index_params, 
    timeout=None
)

# Check the index
collection.has_index() # True

# list all index names
collection.indexes

# [<pymilvus.orm.index.Index at 0x12045f910>,
# <pymilvus.orm.index.Index at 0x12045d0d0>]

# Get a specific index object
collection.index(index_name="_default_idex_101")

# <pymilvus.orm.index.Index at 0x1205b8690>
```

</include>

## Related operations{#related-operations}

The following operations are related to `index()`

- [create_index()](./Collection-create_index)

- [drop_index()](./Collection-drop_index)

- [has_index()](./Collection-has_index)

- [index_building_progress()](./utility-index_building_progress)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

- [list_indexes()](./utility-list_indexes)

