---
displayed_sidbar: pythonSidebar
title: "list_collections() | Python | MilvusClient"
slug: /python/python/Collections-list_collections
sidebar_label: "list_collections()"
beta: false
notebook: false
description: "This operation lists all existing collections. | Python | MilvusClient"
type: docx
token: BHyidrVcyoPwxexHLrnceOSAnRe
sidebar_position: 14
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_collections()

This operation lists all existing collections.

## Request syntax{#request-syntax}

```python
list_collections(**kwargs) -> Name
```

**PARAMETERS:**

- **kwargs** -

    - **timeout** (*float* | *None*) -

        The timeout duration for this operation. 

        Setting this to **None** indicates that this operation timeouts when any response returns or error occurs.

**RETURN TYPE:**

*list*

**RETURNS:**

A list of collection names.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. List collections
client.list_collections() 

# ['test_collection']
```

## Related methods{#related-methods}

- [create_collection()](./Collections-create_collection)

- [create_schema()](./Collections-create_schema)

- [describe_collection()](./Collections-describe_collection)

- [drop_collection()](./Collections-drop_collection)

- [get_collection_stats()](./Collections-get_collection_stats)

- [has_collection()](./Collections-has_collection)

- [rename_collection()](./Collections-rename_collection)

- [DataType](./Collections-DataType)

