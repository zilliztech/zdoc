---
displayed_sidbar: pythonSidebar
slug: /python/Management-refresh_load
beta: false
notebook: false
type: docx
token: X3NXdtC2koiAxyxhcUBcv38Wnsh
sidebar_position: 9
---

import Admonition from '@theme/Admonition';


# refresh_load()

This operation refreshes the load status of an already loaded collection.

## Request syntax{#request-syntax}

```python
refresh_load(
    collection_name: str,
    timeout: Optional[str] = None
)
```

__PARAMETERS:__

- __collection_name__ (_str_) -

    __[REQUIRED]__

    The name of the target collection of this operation.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. 

    Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

 None

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

# 3. Refresh the load status of the collection
client.refresh_load(
    collection_name="test_collection"
)
```

## Related methods{#related-methods}

- [get_load_state()](./Management-get_load_state)

- [load_collection()](./Management-load_collection)

- [release_collection()](./Management-release_collection)

