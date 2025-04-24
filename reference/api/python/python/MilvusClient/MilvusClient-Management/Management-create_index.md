---
displayed_sidbar: pythonSidebar
title: "create_index() | Python | MilvusClient"
slug: /python/python/Management-create_index
sidebar_label: "create_index()"
beta: false
notebook: false
description: "This operation creates an index for a specific collection. | Python | MilvusClient"
type: docx
token: B3n3db0idoia02xXxJfcONK8nRh
sidebar_position: 3
keywords: 
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window
  - zilliz
  - zilliz cloud
  - cloud
  - create_index()
  - pymilvus25
  - knn
  - Image Search
  - LLMs
  - Machine Learning
displayed_sidebar: pythonSidebar

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

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of an existing collection.

- **index_params** (*IndexParams*) -

    **[REQUIRED]**

    An **IndexParams** object containing a list of **IndexParam** objects.

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

- **kwargs** -

    - **sync** (*bool*)

        Controls how the index is built in relation to the client’s request. Valid values:

        - `True` (default): The client waits until the index is fully built before it returns. This means you will not get a response until the process is complete.

        - `False`: The client returns immediately after the request is received and the index is being built in the background. To find out if index creation has been completed, use the `describe_index()` method.

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
schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# 3. Create index parameters
index_params = client.prepare_index_params()

# 4. Add indexes
# - For a scalar field
index_params.add_index(
    field_name="my_id"
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
```

## Related methods{#related-methods}

- [add_index()](./Management-add_index)

- [describe_index()](./Management-describe_index)

- [drop_index()](./Management-drop_index)

- [list_indexes()](./Management-list_indexes)

- [prepare_index_params()](./Management-prepare_index_params)

