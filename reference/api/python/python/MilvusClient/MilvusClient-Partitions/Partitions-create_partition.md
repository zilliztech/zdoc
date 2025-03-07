---
displayed_sidbar: pythonSidebar
title: "create_partition() | Python | MilvusClient"
slug: /python/python/Partitions-create_partition
sidebar_label: "create_partition()"
beta: false
notebook: false
description: "This operation creates a partition in the target collection. | Python | MilvusClient"
type: docx
token: I6hvdlYUuoUaw3xWqSnce4Fin9g
sidebar_position: 1
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - create_partition()
  - pymilvus25
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
displayed_sidebar: pythonSidebar

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

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of an existing collection.

- **partition_name** (*string*)

    **[REQUIRED]**

    The name of the partition to create.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*Partition*

**RETURNS:**

A partition object.

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
```

## Related methods{#related-methods}

- [drop_partition()](./Partitions-drop_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [has_partition()](./Partitions-has_partition)

- [list_partitions()](./Partitions-list_partitions)

- [load_partitions()](./Partitions-load_partitions)

- [release_partitions()](./Partitions-release_partitions)

