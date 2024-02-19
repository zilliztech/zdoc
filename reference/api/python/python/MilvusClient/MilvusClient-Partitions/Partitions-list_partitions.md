---
displayed_sidbar: pythonSidebar
slug: /python/Partitions-list_partitions
beta: false
notebook: false
token: Dxgqdvlk5o2VScxqmL1ctc1Inqb
sidebar_position: 2
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

**PARAMETERS:**

- **collection_name **(*str*) -

    **[REQUIRED]**

    The name of an existing collection.

- **timeout** (*float *|* None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*list*

**RETURNS:**

A list of partition names.

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

# 4. List the names of all existing partitions
client.list_partitions(
    collection_name="test_collection", 
)

# ['_default', 'partition_A']
```

