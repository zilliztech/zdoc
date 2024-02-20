---
displayed_sidbar: pythonSidebar
slug: /python/Collections-list_aliases
beta: false
notebook: false
token: Cpynd2OFJoIXhLx3dQNct7Wgn6f
sidebar_position: 13
---

import Admonition from '@theme/Admonition';


# list_aliases()

This operation lists all existing aliases for a specific collection.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.list_aliases(
    collection_name: str,
    timeout: Optional[float] = None
)
```

__PARAMETERS:__

- __collection_name __(_str_) -

    __[REQUIRED]__

    The name of the collection whose aliases are to be listed.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation times out when any response arrives or any error occurs.

__RETURN TYPE:__

_list_

__RETURNS:__

A list of aliases for the specified collection. If the collection has no aliases, an empty list will be returned.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

- __BaseException__

    This exception will be raised when this operation fails.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Create an alias for the collection
client.create_alias(collection_name="test_collection", alias="test")

# 4. List aliases of the collection
client.list_aliases(collection_name="test_collection")

# ['test']
```
