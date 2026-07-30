---
title: "drop_partition() | Python | MilvusClient"
slug: /python/python/Partitions-drop_partition
sidebar_label: "drop_partition()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation drops a specified partition from the current collection. | Python | MilvusClient"
type: docx
token: HkOFdhgbOoz1wlxJIgWcU7EonWc
sidebar_position: 2
keywords: 
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - zilliz
  - zilliz cloud
  - cloud
  - drop_partition()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_partition()

This operation drops a specified partition from the current collection.

<Admonition type="info" icon="📘" title="Notes">

Before dropping a partition, you must first release it.

</Admonition>

<Admonition type="info" icon="📘" title="Notes">

This only applies to managed collections.

</Admonition>

## Request syntax\{#request-syntax}

```python
drop_partition(
    collection_name: str,
    partition_name: str,
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of an existing collection.

- **partition_name** (*str*) -

    **[REQUIRED]**

    The name of the partition to drop.

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# Create a partition
client.create_partition(
    collection_name="test_collection",
    partition_name="partition_A"
)

# Release partition before dropping
client.release_partitions(
    collection_name="test_collection",
    partition_names=["partition_A"]
)

# Drop the partition
client.drop_partition(
    collection_name="test_collection",
    partition_name="partition_A"
)
```
