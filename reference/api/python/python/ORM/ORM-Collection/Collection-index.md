---
title: "index() | Python | ORM"
slug: /python/python/Collection-index
sidebar_label: "index()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets the specified index of the current collection. | Python | ORM"
type: docx
token: RkQ8dnWDHo3DiDxiCVRcP1xPnob
sidebar_position: 18
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - index()
  - pymilvus26
  - Unstructured Data
  - vector database
  - IVF
  - knn
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# index()

This operation gets the specified index of the current collection.

## Request Syntax\{#request-syntax}

```python
index(
    **kwargs
)
```

**PARAMETERS:**

- **kwargs -** 

    Additional keyword arguments.

    - **index_name** (*str*) -

        The name of the index. If no index is specified, the default index name is used.

        A default index name is in the following format: `_default_idx_{field_id}`.

**RETURN TYPE:**

*Index*

**RETURNS:**

An Index object of the current collection.

**EXCEPTIONS:**

- **IndexNotExistException**

    This exception will be raised when the specified index does not exist.

- **AmbiguousIndexName**

    This exception will be raised when multiple indexes exist but no index name has been specified. 

## Examples\{#examples}

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

## Related operations\{#related-operations}

The following operations are related to `index()`

- [create_index()](./Collection-create_index)

- [drop_index()](./Collection-drop_index)

- [has_index()](./Collection-has_index)

- [index_building_progress()](./utility-index_building_progress)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

- [list_indexes()](./utility-list_indexes)

