---
displayed_sidbar: pythonSidebar
slug: /python/IndexLoadRelease-add_index
beta: false
notebook: false
token: ZplAdphtooqHJkxo8GCcOFecngd
sidebar_position: 7
---

import Admonition from '@theme/Admonition';


# add_index()

This operation adds index parameters for a specific field in a collection.

## Request Syntax{#request-syntax}

```python
pymilvus.milvus_client.index.IndexParams.add_index(
    field_name: str,
    index_type: str,
    index_name: str
) -> None
```

**PARAMETERS:**

- **field_name** (*str*) -

    The name of the target file to apply this object applies.

- **index_name** (*str*) -

    The name of the index file generated after this object has been applied.

- **index_type** (*str*) -

    The name of the algorithm used to arrange data in the specific field. 

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import MilvusClient, DataType

# 1. Create schema
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=False,
)

# 2. Add fields to schema
schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# 3. Create index parameters
index_params = client.prepare_index_params()

# 4. Add indexes
# - For a scalar field
index_params.add_index(
    field_name="my_id",
    index_type="AUTOINDEX"
)

# - For a vector field
index_params.add_index(
    field_name="my_vector", 
    index_type="AUTOINDEX",
)
```
