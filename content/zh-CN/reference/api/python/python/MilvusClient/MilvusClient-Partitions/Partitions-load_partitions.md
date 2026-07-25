---
displayed_sidbar: pythonSidebar
title: "load_partitions() | Python | MilvusClient"
slug: /python/python/Partitions-load_partitions
sidebar_label: "load_partitions()"
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
beta: false
notebook: false
description: "This operation loads a specific set of partitions in a specified collection into memory. | Python | MilvusClient"
type: docx
token: TMq5d6wFmoT8u3xwuruc8k6wnTg
sidebar_position: 6
keywords: 
  - Unstructured Data
  - vector database
  - IVF
  - knn
  - zilliz
  - zilliz cloud
  - cloud
  - load_partitions()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# load_partitions()

This operation loads a specific set of partitions in a specified collection into memory.

## Request syntax

```python
load_partitions(
    collection_name: str,
    partition_names: str | List[str],
    timeout: Optional[float] = None
) -> None
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of an existing collection.

- **partition_names** (*str | list[str]*) -

    **[REQUIRED]**

    A list of the names of the partitions to load.

- **priority** (*string*) -

    The load priority of the current collection. The value may impact CPU usage during the load process. Possible values are `low` and `high`.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

<Admonition type="info" icon="📘" title="Notes">

<p>A collection is in the loaded state only if any or all of its partitions are loaded.</p>

</Admonition>

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Example

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.ali-cn-hangzhou.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Create a partition
client.create_partition(
    collection_name="test_collection", 
    partition_name="partition_A"
)

# 4. Release the collection
client.release_collection(collection_name="test_collection")

# 5. Load a partition
client.load_partitions(
    collection_name="test_collection",
    partition_names=["partition_A"]
)

# 6. Check the load status of the collection
client.get_load_state(collection_name="test_collection") 

# {'state': <LoadState: Loaded>}

# 7. Check the load status of the partition
client.get_load_state(
    collection_name="test_collection",
    partition_name="partition_A",
)

# {'state': <LoadState: Loaded>}
```

## Related methods

- [create_partition()](./Partitions-create_partition)

- [drop_partition()](./Partitions-drop_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [has_partition()](./Partitions-has_partition)

- [list_partitions()](./Partitions-list_partitions)

- [release_partitions()](./Partitions-release_partitions)

