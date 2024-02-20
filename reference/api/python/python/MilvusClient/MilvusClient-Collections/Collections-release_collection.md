---
displayed_sidbar: pythonSidebar
slug: /python/Collections-release_collection
beta: false
notebook: false
token: PRR7dRfi8o1s61xFRovccAdRnHe
sidebar_position: 16
---

import Admonition from '@theme/Admonition';


# release_collection()

This operation releases the data of a specific collection from memory.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.release_collection(
    collection_name: str, 
    timeout: Optional[float] = None
) -> None
```

__PARAMETERS:__

- __collection_name__ (_str_) -

    __[REQUIRED]__

    The name of a collection.

- __timeout__ (_float_ | _None_) -

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response returns or error occurs.

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

# 3. Create a collection
client.create_collection(
    collection_name="customized_setup",
    schema=schema
)

# 4. Prepare index parameters
index_params = client.prepare_index_params()

# 5. Add indexes
index_params.add_index(
    field_name="my_id",
    index_type="AUTOINDEX"
)

index_params.add_index(
    field_name="my_vector", 
    index_type="AUTOINDEX",
)

# 6. Create indexes
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 7. Load the collection
client.load_collection(
    collection_name="customized_setup"
)

# 8. Get load status
client.get_load_state(
    collection_name="customized_setup",
) # Loaded

# 9. Release the collection
client.release_collection(
    collection_name="customzied_setup"
)

# 10. Get load status
client.get_load_state(
    collection_name="customized_setup"
) # Unloaded
```
