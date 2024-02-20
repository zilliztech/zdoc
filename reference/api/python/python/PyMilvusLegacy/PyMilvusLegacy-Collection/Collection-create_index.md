---
displayed_sidbar: pythonSidebar
slug: /python/Collection-create_index
beta: false
notebook: false
token: J76vdPHNgoyp2wxAiTcceIVJnOe
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# create_index()

This creates a named index for a target field, which can either be a vector field or a scalar field.

<Admonition type="info" icon="📘" title="Notes">

<p>This operation is non-blocking. You can call <code>utility.wait_for_index_building_complete</code> to block the current process.</p>

</Admonition>

```python
pymilvus.Collection.create_index(
    field_name: str, 
    index_params: dict | None, 
    timeout: float | None
)
```

The following operations are related to `create_index()`

- drop_index()

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
    field_name="string", 
    index_params=index_params, 
    timeout=None
)
```

__PARAMETERS:__

- __field_name__ (_string_) -

    The name of the field for which an index is to be created.

- __index_params__ (_dict_) - 

    The parameters that apply to the index-building process.

    - __index_type__ (string) -

        The algorithm used to build the index.

        You should always use __AUTOINDEX__ as the index type. Read [AUTOINDEX Explained](./autoindex-explained) to get more.

    - __metric_type__ (_string_) - 

        The similarity metric type used to build the index.

        Possible values are __L2__, __IP__, and __COSINE__. Read [Similarity Metrics Explained](./search-metrics-explained) to get more.

    - __params__ (_dict_) -

        Index-building parameters corresponding to the selected index type.

        For details on applicable index-building parameters, refer to [AUTOINDEX Explained](./autoindex-explained).

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_Status_

__RETURNS:__

A __Status__ object indicating whether this operation succeeds.

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
```

