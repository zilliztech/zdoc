---
displayed_sidbar: pythonSidebar
slug: /python/Partitions-release_partitions
beta: false
notebook: false
type: docx
token: VblKdUEU4o4t31xcFiicIGtjn9g
sidebar_position: 7
---

import Admonition from '@theme/Admonition';


# release_partitions()

This operation releases the partitions in a specified collection from memory.

## Request syntax{#request-syntax}

```python
release_partitions(
    collection_name: str,
    partition_names: str | List[str],
    timeout: Optional[float] = None
) -> None
```

__PARAMETERS:__

- __collection_name __(_str_) -

    __[REQUIRED]__

    The name of an existing collection.

- __partition_names__ (_str | list[str]_) -

    __[REQUIRED]__

    A list of the names of the partitions to release.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. 

    Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

<Admonition type="info" icon="📘" title="Notes">

<p>A collection is in the loaded state only if any or all of its partitions are loaded.</p>

</Admonition>

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

# 2. Create a collection and get its load status
client.create_collection(collection_name="test_collection", dimension=5)

client.get_load_state(
    collection_name="test_collection"
)

# {'state': <LoadState: Loaded>}

# 3. Create a partition
client.create_partition(
    collection_name="test_collection", 
    partition_name="partition_A"
)

# 4. Check the load status of the partition
client.get_load_state(
    collection_name="test_collection",
    partition_names=["partition_A"],
)

# {'state': <LoadState: Loaded>}

# 5. Release the partition
client.release_partitions(
    collection_name="test_collection",
    partition_names=["partition_A"]
)

# 6. Check the load status
client.get_load_state(
    collection_name="test_collection",
    partition_name=["partition_A"]
)

# {'state': <LoadState: NotLoad>}

client.get_load_state(
    collection_name="test_collection"
)

# {'state': <LoadState: NotLoad>}
```

## Related methods{#related-methods}

- [create_partition()](./Partitions-create_partition)

- [drop_partition()](./Partitions-drop_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [has_partition()](./Partitions-has_partition)

- [list_partitions()](./Partitions-list_partitions)

- [load_partitions()](./Partitions-load_partitions)

