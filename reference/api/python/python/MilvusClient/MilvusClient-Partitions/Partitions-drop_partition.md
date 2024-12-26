---
displayed_sidbar: pythonSidebar
title: "drop_partition() | Python | MilvusClient"
slug: /python/python/Partitions-drop_partition
sidebar_label: "drop_partition()"
beta: false
notebook: false
description: "This operation drops a specified partition from the current collection. | Python | MilvusClient"
type: docx
token: EMI8dM8uooIAFPxVfffcoqRwnZf
sidebar_position: 2
keywords: 
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - drop_partition()
  - python
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_partition()

This operation drops a specified partition from the current collection.

<Admonition type="info" icon="📘" title="Notes">

<p>Before dropping a partition, you must first release it.</p>

</Admonition>

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

- **partition_names** (*str*)

    **[REQUIRED]**

    The name of the partition to drop.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

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

# 4. Release partition
client.release_partitions(
    collection_name="test_collection",
    partition_names=["partition_A"]
)

# 4. Drop the partition
client.drop_partition(
    collection_name="test_collection", 
    partition_name="partition_A"
)
```

## Related methods{#related-methods}

- [create_partition()](./Partitions-create_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [has_partition()](./Partitions-has_partition)

- [list_partitions()](./Partitions-list_partitions)

- [load_partitions()](./Partitions-load_partitions)

- [release_partitions()](./Partitions-release_partitions)

