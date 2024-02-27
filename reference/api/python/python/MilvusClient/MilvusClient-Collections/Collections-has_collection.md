---
displayed_sidbar: pythonSidebar
slug: /python/Collections-has_collection
beta: false
notebook: false
type: docx
token: SSQ6dFGdxouy7hxRwCOcatnEn0e
sidebar_position: 11
---

import Admonition from '@theme/Admonition';


# has_collection()

This operation checks whether a specific collection exists.

## Request Syntax{#request-syntax}

```python
has_collection(
    collection_name: str,
    timeout: Optional[float] = None
) -> Bool
```

__PARAMETERS:__

- __collection_name__ (_str_) -

    __[REQUIRED]__

    The name of a collection.

- __timeout__ (_float_ | _None_) -

    The timeout duration for this operation. 

    Setting this to __None__ indicates that this operation timeouts when any response returns or error occurs.

__RETURN TYPE:__

_bool_

__RETURNS:__

A boolean value indicating whether the specified collection exists.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Check whether a collection named `test_collection` exists
client.has_collection(collection_name="test_collection") # True

# 4. Check whether a collection named `test_collection_2` exists
client.has_collection(collection_name="test_collection_2") # False
```

## Related methods{#related-methods}

- [create_collection()](./Collections-create_collection)

- [create_schema()](./Collections-create_schema)

- [describe_collection()](./Collections-describe_collection)

- [drop_collection()](./Collections-drop_collection)

- [get_collection_stats()](./Collections-get_collection_stats)

- [list_collections()](./Collections-list_collections)

- [rename_collection()](./Collections-rename_collection)

- [DataType](./Collections-DataType)

