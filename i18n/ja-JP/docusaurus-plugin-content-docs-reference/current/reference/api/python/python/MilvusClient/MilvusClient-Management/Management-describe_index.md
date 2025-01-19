---
displayed_sidbar: pythonSidebar
title: "describe_index() | Python | MilvusClient"
slug: /python/python/Management-describe_index
sidebar_label: "describe_index()"
beta: false
notebook: false
description: "This operation describes a specific index. | Python | MilvusClient"
type: docx
token: WhsHdyIgyoFlsQxNJt9cFCTxnDe
sidebar_position: 3
keywords: 
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db
  - zilliz
  - zilliz cloud
  - cloud
  - describe_index()
  - python
  - Recommender systems
  - information retrieval
  - dimension reduction
  - hnsw algorithm
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# describe_index()

This operation describes a specific index.

## Request syntax{#request-syntax}

```python
describe_index(
    collection_name: str,
    index_name: str,
    timeout: Optional[float] = None
) -> Dict
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of an existing collection.

    Setting this to a non-existing collection results in **MilvusException**.

- **index_name** (*str*) -

    **[REQUIRED]**

    The name of the index to describe.

    Setting this to a non-existing collection results in **MilvusException**.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:** 

*Dict*

**RETURNS:**

A dictionary that contains the details of the specified index.

```python
{
    'index_type': 'AUTOINDEX',
    'metric_type': 'IP',
    'M': 32,
    'efConstruction': 360,
    'total_rows': 0,
    'indexed_rows': 0,
    'pending_index_rows': 0,
    'state': 3,
    'field_name': 'my_vector',
    'index_name': 'my_vector'
}
```

**PARAMETERS:**

- **index_type** (*str*) -

    The algorithm that is used to build the index. 

    On Zilliz Cloud, the value is always **AUTOINDEX**. For details, refer to [AUTOINDEX Explained](/docs/autoindex-explained).

- **metric_type** (*str*) -

    The algorithm that is used to measure similarity between vectors. Possible values are **IP**, **L2**, and **COSINE**.

    This is available only when the specified field is a vector field. 

- **total_rows** (*int*) -

    The number of rows in the target field of this index.

- **indexed_rows** (*int*) -

    The number of indexed rows in the target field of this index.

- **pending_index_rows** (*int*) -

    The number of rows to be indexed in the specified field.

- **state** (*int*) -

    The state of the index-building process. Possible values are as follows:

- **field_name** (*str*) -

    The name of the field on which the index has been created.

- **index_name** (*str*) -

    The name of the created index.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

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

# 7. Describe the indexes
client.describe_index(
    collection_name="customized_setup",
    index_name="my_vector"
)

# {
#     'index_type': 'AUTOINDEX',
#     'metric_type': 'L2',
#     'field_name': 'my_vector',
#     'index_name': 'my_vector'
# }

client.describe_index(
    collection_name="customized_setup",
    index_name="my_id"    
)

# {
#     'index_type': 'STL_SORT',
#     'field_name': 'my_id', 
#     'index_name': 'my_id'
# }
```

## Related methods{#related-methods}

- [add_index()](./Management-add_index)

- [create_index()](./Management-create_index)

- [drop_index()](./Management-drop_index)

- [list_indexes()](./Management-list_indexes)

- [prepare_index_params()](./Management-prepare_index_params)

