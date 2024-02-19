---
displayed_sidbar: pythonSidebar
slug: /python/Partitions-release_partitions
beta: false
notebook: false
token: VblKdUEU4o4t31xcFiicIGtjn9g
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# release_partitions()

This operation releases the partitions in a specified collection from memory.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.release_partitions(
    collection_name: str,
    partition_names: str | List[str],
    timeout: Optional[float] = None
) -> None
```

**PARAMETERS:**

- **collection_name **(*str*) -

    **[REQUIRED]**

    The name of an existing collection.

- **partition_names** (*str | list[str]*) -

    **[REQUIRED]**

    A list of the names of the partitions to release.

- **timeout** (*float *|* None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

<Admonition type="info" icon="📘" title="Notes">

<p>A collection is in the loaded state only if all its partitions are loaded.</p>

</Admonition>

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
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
    partition_names=["partition_A"]
)

# {'state': <LoadState: NotLoad>}

client.get_load_state(
    collection_name="test_collection"
)

# {'state': <LoadState: NotLoad>}
```

