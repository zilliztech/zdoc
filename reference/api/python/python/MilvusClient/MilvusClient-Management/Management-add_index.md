---
displayed_sidbar: pythonSidebar
slug: /python/python/Management-add_index
beta: FALSE
notebook: FALSE
type: docx
token: ZplAdphtooqHJkxo8GCcOFecngd
sidebar_position: 1
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# add_index()

This operation adds index parameters for a specific field in a collection.

## Request syntax{#request-syntax}

```python
IndexParams.add_index(
    field_name: str,
    index_type: str,
    index_name: str,
    metric_type: str,
    params: dict
) -> None
```

**PARAMETERS:**

- **field_name** (*str*) -

    The name of the target file to apply this object applies.

- **index_name** (*str*) -

    The name of the index file generated after this object has been applied.

- **index_type** (*str*) -

    The name of the algorithm used to arrange data in the specific field. 

- **metric_type** (*str*) -

    The algorithm that is used to measure similarity between vectors. Possible values are **IP**, **L2**, and **COSINE**.

    This is available only when the specified field is a vector field. 

- **params** (*dict*) -

    The fine-tuning parameters for the specified index type. For details on possible keys and value ranges, refer to  [In-memory Index](https://milvus.io/docs/index.md).

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

# {
#     'auto_id': False, 
#     'description': '', 
#     'fields': [
#         {
#             'name': 'my_id', 
#             'description': '', 
#             'type': <DataType.INT64: 5>, 
#             'is_primary': True, 
#             'auto_id': False
#         }
#     ]
# }

schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# {
#     'auto_id': False, 
#     'description': '', 
#     'fields': [
#         {
#             'name': 'my_id', 
#             'description': '', 
#             'type': <DataType.INT64: 5>, 
#             'is_primary': True, 
#             'auto_id': False
#         }, 
#         {
#             'name': 'my_vector', 
#             'description': '', 
#             'type': <DataType.FLOAT_VECTOR: 101>, 
#             'params': {
#                 'dim': 5
#             }
#         }        
#     ]
# }

# 3. Create index parameters
index_params = client.prepare_index_params()

# 4. Add indexes
# - For a scalar field
index_params.add_index(
    field_name="my_id",
    index_type="STL_SORT"
)

# - For a vector field
index_params.add_index(
    field_name="my_vector", 
    index_type="AUTOINDEX",
    metric_type="L2",
    params={"nlist": 1024}
)
```

## Related methods{#related-methods}

- [create_index()](./Management-create_index)

- [describe_index()](./Management-describe_index)

- [drop_index()](./Management-drop_index)

- [list_indexes()](./Management-list_indexes)

- [prepare_index_params()](./Management-prepare_index_params)

