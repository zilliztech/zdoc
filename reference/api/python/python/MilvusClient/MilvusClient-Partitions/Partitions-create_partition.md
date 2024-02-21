---
displayed_sidbar: pythonSidebar
slug: /python/Partitions-create_partition
beta: false
notebook: false
token: I6hvdlYUuoUaw3xWqSnce4Fin9g
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# create_partition()

This operation creates a partition in the target collection.

## Request syntax{#request-syntax}

```python
create_partition(
    collection_name: str,
    partition_name: str,
    timeout: Optional[float] = None
) -> None
```

__PARAMETERS:__

- __collection_name __(_str_) -

    __[REQUIRED]__

    The name of an existing collection.

- __partition_name__ (_string_)

    __[REQUIRED]__

    The name of the partition to create.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. 

    Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_Partition_

__RETURNS:__

A partition object.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Create a partition
client.create_partition(
    collection_name="test_collection", 
    partition_name="partition_A"
)
```

## Related methods{#related-methods}

- [drop_partition()](./Partitions-drop_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [has_partition()](./Partitions-has_partition)

- [list_partitions()](./Partitions-list_partitions)

- [load_partitions()](./Partitions-load_partitions)

- [release_partitions()](./Partitions-release_partitions)

