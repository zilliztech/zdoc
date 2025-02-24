---
displayed_sidbar: pythonSidebar
title: "create_index() | Python | ORM"
slug: /python/python/Collection-create_index
sidebar_label: "create_index()"
beta: NEAR DEPRECATE
notebook: false
description: "This creates a named index for a target field, which can either be a vector field or a scalar field. | Python | ORM"
type: docx
token: J76vdPHNgoyp2wxAiTcceIVJnOe
sidebar_position: 4
keywords: 
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - zilliz
  - zilliz cloud
  - cloud
  - create_index()
  - pymilvus25
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# create_index()

This creates a named index for a target field, which can either be a vector field or a scalar field.

<Admonition type="info" icon="📘" title="Notes">

<p>This operation is non-blocking. You can call <code>utility.wait_for_index_building_complete()</code> to block the current process.</p>

</Admonition>

## Request Syntax{#request-syntax}

```python
create_index(
    field_name: str, 
    index_params: dict | None, 
    timeout: float | None
)
```

**PARAMETERS:**

- **field_name** (*string*) -

    The name of the field for which an index is to be created.

- **index_params** (*dict*) - 

    The parameters that apply to the index-building process.

    - **index_type** (string) -

        The algorithm used to build the index.

        You should always use **AUTOINDEX** as the index type. Read [AUTOINDEX Explained](/docs/autoindex-explained) to get more.

    - **metric_type** (*string*) - 

        The similarity metric type used to build the index.

        Possible values are **L2**, **IP**, and **COSINE**. Read [Similarity Metrics Explained](/docs/search-metrics-explained) to get more.

    - **params** (*dict*) -

        Index-building parameters corresponding to the selected index type.

        For details on applicable index-building parameters, refer to [AUTOINDEX Explained](/docs/autoindex-explained).

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*Status*

**RETURNS:**

A **Status** object indicating whether this operation succeeds.

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

## Related operations{#related-operations}

The following operations are related to `create_index()`

- [drop_index()](./Collection-drop_index)

- [has_index()](./Collection-has_index)

- [index()](./Collection-index)

- [index_building_progress()](./utility-index_building_progress)

- [wait_for_index_building_complete()](./utility-wait_for_index_building_complete)

- [list_indexes()](./utility-list_indexes)

