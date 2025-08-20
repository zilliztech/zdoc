---
displayed_sidbar: pythonSidebar
title: "load_collection() | Python | MilvusClient"
slug: /python/python/Management-load_collection
sidebar_label: "load_collection()"
beta: false
notebook: false
description: "This operation loads the data of a specific collection into memory. | Python | MilvusClient"
type: docx
token: FLmWdFP9Zo3JcixOEgucU8JMnLc
sidebar_position: 10
keywords: 
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - load_collection()
  - pymilvus25
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# load_collection()

This operation loads the data of a specific collection into memory.

## Request syntax{#request-syntax}

```python
load_collection(
    collection_name: str, 
    timeout: Optional[float] = None
) -> None
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **&#91;REQUIRED&#93;**

    The name of a collection.

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response returns or error occurs.

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
    index_type="STL_SORT"
)

index_params.add_index(
    field_name="my_vector", 
    index_type="IVF_FLAT",
    metric_type="L2",
    params: {nlist: 1024}
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

