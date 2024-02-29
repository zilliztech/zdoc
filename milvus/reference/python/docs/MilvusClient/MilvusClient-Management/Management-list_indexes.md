---
displayed_sidbar: pythonSidebar
slug: /python/Management-list_indexes
beta: false
notebook: false
type: docx
token: ZqmudJWyFonUKGxAxXncYrLZn2e
sidebar_position: 6
---

import Admonition from '@theme/Admonition';


# list_indexes()

This operation lists all indexes of a specific collection.

## Request syntax{#request-syntax}

```python
list_indexes(
    collection_name: str,
    field_name: Optional[str],
    **kwargs,    
) -> List
```

__PARAMETERS:__

- __collection_name__ (_str_) -

    __[REQUIRED]__

    The name of an existing collection.

- __field_name__ (_str_) -

    The name of a field. Leaving this unspecified make this operation list all indexes.

__RETURN TYPE:__

_List_

__RETURNS:__

A list of index names.

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

- [create_index()](./Management-create_index)

- [describe_index()](./Management-describe_index)

- [drop_index()](./Management-drop_index)

- [prepare_index_params()](./Management-prepare_index_params)

