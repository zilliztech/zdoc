---
displayed_sidbar: pythonSidebar
slug: /python/Partitions-create_partition
beta: false
notebook: false
token: I6hvdlYUuoUaw3xWqSnce4Fin9g
sidebar_position: 7
---

import Admonition from '@theme/Admonition';


# create_partition()

This operation creates a partition in the target collection.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.create_partition(
    collection_name: str,
    partition_name: str,
    timeout: Optional[float] = None
) -> None
```

**PARAMETERS:**

- **collection_name **(*str*) -

    **[REQUIRED]**

    The name of an existing collection.

- **partition_name** (*string*)

    **[REQUIRED]**

    The name of the partition to create.

- **timeout** (*float *|* None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

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
```
