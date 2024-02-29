---
displayed_sidbar: pythonSidebar
slug: /python/Collections-list_collections
beta: false
notebook: false
type: docx
token: BHyidrVcyoPwxexHLrnceOSAnRe
sidebar_position: 14
---

import Admonition from '@theme/Admonition';


# list_collections()

This operation lists all existing collections.

## Request syntax{#request-syntax}

```python
list_collections(**kwargs) -> Name
```

__PARAMETERS:__

- __kwargs__ -

    - __timeout__ (_float_ | _None_) -

        The timeout duration for this operation. 

        Setting this to __None__ indicates that this operation timeouts when any response returns or error occurs.

__RETURN TYPE:__

_list_

__RETURNS:__

A list of collection names.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. List collections
client.list_collections() # ['test_collection']
```

## Related methods{#related-methods}

- [create_collection()](./Collections-create_collection)

- [create_schema()](./Collections-create_schema)

- [describe_collection()](./Collections-describe_collection)

- [drop_collection()](./Collections-drop_collection)

- [get_collection_stats()](./Collections-get_collection_stats)

- [has_collection()](./Collections-has_collection)

- [rename_collection()](./Collections-rename_collection)

- [IndexType](./Collections-IndexType)

- [DataType](./Collections-DataType)

