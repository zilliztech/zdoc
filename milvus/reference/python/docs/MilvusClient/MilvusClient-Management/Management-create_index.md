---
displayed_sidbar: pythonSidebar
slug: /python/Management-create_index
beta: false
notebook: false
type: docx
token: B3n3db0idoia02xXxJfcONK8nRh
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# create_index()

This operation creates an index for a specific collection.

## Request syntax{#request-syntax}

```python
create_index(
    collection_name: str,
    index_params: IndexParams,
    timeout: Optional[float] = None,
    **kwargs,    
)
```

__PARAMETERS:__

- __collection_name__ (_str_) -

    __[REQUIRED]__

    The name of an existing collection.

- __index_params__ (_IndexParams_) -

    __[REQUIRED]__

    An __IndexParams__ object containing a list of __IndexParam__ objects.

- __timeout__ (_float_ | _None_) -

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

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

client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)

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

# 5. Create a collection
client.create_collection(
    collection_name="customized_setup",
    schema=schema
)

# 6. Create indexes
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 6. List indexes
client.list_indexes(collection_name="customized_setup")

# ['my_id', 'my_vector']
```

## Related methods{#related-methods}

- [add_index()](./Management-add_index)

- [describe_index()](./Management-describe_index)

- [drop_index()](./Management-drop_index)

- [list_indexes()](./Management-list_indexes)

- [prepare_index_params()](./Management-prepare_index_params)

