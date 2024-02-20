---
displayed_sidbar: pythonSidebar
slug: /python/Partitions-list_partitions
beta: false
notebook: false
token: Dxgqdvlk5o2VScxqmL1ctc1Inqb
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# list_partitions()

This operation lists the partitions in a specified collection.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.list_partitions(
    collection_name: str,
    timeout: Optional[float] = None
) -> list
```

__PARAMETERS:__

- __collection_name __(_str_) -

    __[REQUIRED]__

    The name of an existing collection.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_list_

__RETURNS:__

A list of partition names.

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

# 4. List the names of all existing partitions
client.list_partitions(
    collection_name="test_collection", 
)

# ['_default', 'partition_A']
```

