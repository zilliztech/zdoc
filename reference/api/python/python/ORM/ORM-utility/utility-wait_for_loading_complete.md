---
title: "wait_for_loading_complete() | Python | ORM"
slug: /python/python/utility-wait_for_loading_complete
sidebar_label: "wait_for_loading_complete()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation blocks the current process until the specified collection has been loaded. | Python | ORM"
type: docx
token: PLKXdUB1EoNX8gxKHruc9GcEnsg
sidebar_position: 44
keywords: 
  - Unstructured Data
  - vector database
  - IVF
  - knn
  - zilliz
  - zilliz cloud
  - cloud
  - wait_for_loading_complete()
  - pymilvus26
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# wait_for_loading_complete()

This operation blocks the current process until the specified collection has been loaded.

## Request Syntax\{#request-syntax}

```python
wait_for_loading_complete(
    collection_name: str,
    partition_names: list[str] | None,
    timeout: float | None,
    using: str = "default",
)
```

**PARAMETERS:**
**collection_name** (*str*) -

- **partition_names** (*list[str]*) -

    A list of partition names.

    If any partition names are specified, this operation blocks the current progress until the specified partitions have been loaded.

- **using** (*string*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Get an existing collection
collection = Collection("test_collection")

# Load the collection data
collection.load()

# Wait until the load process completes
utility.wait_for_loading_complete(
    collection_name="test_collection",
    partition_names=["test_partition"],
    timeout=None,
    using="default",
)
```

## Related operations\{#related-operations}

The following operations are related to `wait_for_loading_complete()`:

- [Partition](./ORM-Partition)

- [load()](./Collection-load)

- [release()](./Collection-release)

- [load_state()](./utility-load_state)

- [loading_progress()](./utility-loading_progress)

