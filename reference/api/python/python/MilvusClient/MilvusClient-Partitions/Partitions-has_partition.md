---
displayed_sidbar: pythonSidebar
slug: /python/Partitions-has_partition
beta: false
notebook: false
token: MxTAd0haboKnRrxQvoOckGghn1T
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# has_partition()

This operation checks whether the specified partition exists in the specified collection.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.create_partition(
    collection_name: str,
    partition_name: str,
    timeout: Optional[float] = None
) -> bool
```

__PARAMETERS:__

- __collection_name __(_str_) -

    __[REQUIRED]__

    The name of an existing collection.

- __partition_name__ (_string_)

    __[REQUIRED]__

    The name of the partition to create.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_bool_

__RETURNS:__

A boolean value indicating whether the specified partition exists.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

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

# 3. Create a partition
client.create_partition(
    collection_name="test_collection", 
    partition_name="partition_A"
)

# 4. Check whether the partition exists
client.has_partition(
    collection_name="test_collection", 
    partition_name="partition_A"
) # True
```

