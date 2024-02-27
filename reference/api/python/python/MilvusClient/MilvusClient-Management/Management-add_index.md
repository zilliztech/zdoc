---
displayed_sidbar: pythonSidebar
slug: /python/Management-add_index
beta: false
notebook: false
type: docx
token: ZplAdphtooqHJkxo8GCcOFecngd
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# add_index()

This operation adds index parameters for a specific field in a collection.

## Request syntax{#request-syntax}

```python
IndexParams.add_index(
    field_name: str,
    index_type: str,
    index_name: str
) -> None
```

__PARAMETERS:__

- __field_name__ (_str_) -

    The name of the target file to apply this object applies.

- __index_name__ (_str_) -

    The name of the index file generated after this object has been applied.

- __index_type__ (_str_) -

    The name of the algorithm used to arrange data in the specific field. 

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

__EXCEPTIONS:__

- __MilvusException__

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
    index_type="STL_SORT"
)

# - For a vector field
index_params.add_index(
    field_name="my_vector", 
    index_type="IVF_FLAT",
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

