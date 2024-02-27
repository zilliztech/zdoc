---
displayed_sidbar: pythonSidebar
slug: /python/Management-load_collection
beta: false
notebook: false
type: docx
token: FLmWdFP9Zo3JcixOEgucU8JMnLc
sidebar_position: 7
---

import Admonition from '@theme/Admonition';


# load_collection()

This operation loads the data of a specific collection into memory.

<Admonition type="info" icon="📘" title="Notes">

<p>This operation is required only if the target collection is not loaded. A collection is in the <strong>NotLoad</strong> state only if you have released the collection or you have created the collection without any index parameters.</p>

</Admonition>

## Request syntax{#request-syntax}

```python
load_collection(
    collection_name: str, 
    timeout: Optional[float] = None
) -> None
```

__PARAMETERS:__

- __collection_name__ (_str_) -

    __[REQUIRED]__

    The name of a collection.

- __timeout__ (_float_ | _None_) -

    The timeout duration for this operation. 

    Setting this to __None__ indicates that this operation timeouts when any response returns or error occurs.

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
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

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
    field_name="my_id"
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

## Related methods{#related-methods}

- [get_load_state()](./Management-get_load_state)

- [refresh_load()](./Management-refresh_load)

- [release_collection()](./Management-release_collection)

