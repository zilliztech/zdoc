---
displayed_sidbar: pythonSidebar
slug: /python/Collections-load_collection
beta: false
notebook: false
token: FLmWdFP9Zo3JcixOEgucU8JMnLc
sidebar_position: 15
---

import Admonition from '@theme/Admonition';


# load_collection()

This operation loads the data of a specific collection into memory.

<Admonition type="info" icon="📘" title="Notes">

<p>This operation is not required if you have created a collection in a quick-setup manner or a customized-setup manner with index parameters specified in the collection creation request.</p>

</Admonition>

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.load_collection(
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

# 7. Load indexes
client.load_collection(
    collection_name="customized_setup"
)
```
