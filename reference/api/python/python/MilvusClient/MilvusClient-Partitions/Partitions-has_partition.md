---
displayed_sidbar: pythonSidebar
title: "has_partition() | Python | MilvusClient"
slug: /python/python/Partitions-has_partition
sidebar_label: "has_partition()"
beta: false
notebook: false
description: "This operation checks whether the specified partition exists in the specified collection. | Python | MilvusClient"
type: docx
token: MxTAd0haboKnRrxQvoOckGghn1T
sidebar_position: 4
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - has_partition()
  - pymilvus25
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# has_partition()

This operation checks whether the specified partition exists in the specified collection.

## Request syntax{#request-syntax}

```python
has_partition(
    collection_name: str,
    partition_name: str,
    timeout: Optional[float] = None
) -> bool
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of an existing collection.

- **partition_name** (*string*)

    **[REQUIRED]**

    The name of the partition to check.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*bool*

**RETURNS:**

A boolean value indicating whether the specified partition exists.

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

# 4. Check whether the partition exists
client.has_partition(
    collection_name="test_collection", 
    partition_name="partition_A"
) 

# True
```

## Related methods{#related-methods}

- [create_partition()](./Partitions-create_partition)

- [drop_partition()](./Partitions-drop_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [list_partitions()](./Partitions-list_partitions)

- [load_partitions()](./Partitions-load_partitions)

- [release_partitions()](./Partitions-release_partitions)

