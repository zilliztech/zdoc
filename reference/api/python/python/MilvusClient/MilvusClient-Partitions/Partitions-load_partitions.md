---
displayed_sidbar: pythonSidebar
title: "load_partitions() | Python | MilvusClient"
slug: /python/python/Partitions-load_partitions
sidebar_label: "load_partitions()"
beta: false
notebook: false
description: "This operation loads a specific set of partitions in a specified collection into memory. | Python | MilvusClient"
type: docx
token: DdQ1dBNagoBa08xhEiucxZrHnzc
sidebar_position: 6
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - load_partitions()
  - pymilvus25
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# load_partitions()

This operation loads a specific set of partitions in a specified collection into memory.

## Request syntax{#request-syntax}

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

## Related methods{#related-methods}

- [create_partition()](./Partitions-create_partition)

- [drop_partition()](./Partitions-drop_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [has_partition()](./Partitions-has_partition)

- [list_partitions()](./Partitions-list_partitions)

- [release_partitions()](./Partitions-release_partitions)

