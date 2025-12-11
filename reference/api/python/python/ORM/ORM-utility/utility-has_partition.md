---
title: "has_partition() | Python | ORM"
slug: /python/python/utility-has_partition
sidebar_label: "has_partition()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation checks whether a partition exists. | Python | ORM"
type: docx
token: KsmadNcXRoElO2xJi5HcJO57nwb
sidebar_position: 18
keywords: 
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - has_partition()
  - pymilvus26
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# has_partition()

This operation checks whether a partition exists.

## Request Syntax\{#request-syntax}

```python
has_partition(
    collection_name: str,
    partition_name: str,
    using: str = "default",
    timeout: float | None,
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**
    The name of an existing collection.

    Setting this to a non-existing collection results in a **MilvusException**.

- **partition_name** (*str*) -

    **[REQUIRED]**
    The name of a partition.

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*bool*

**RETURNS:**
A boolean value indicates whether the specified partition exists.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

## Examples\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Get an existing collection
collection = Collection(name="test_collection")

# Check whether a partition exist
collection.has_partition(
    collection_name="test_collection",
    partition_name="test_partition",
) # True
```

## Related operations\{#related-operations}

The following operations are related to `has_partition()`:

- [drop_collection()](./utility-drop_collection)

- [flush_all()](./utility-flush_all)

- [has_collection()](./utility-has_collection)

- [list_collections()](./utility-list_collections)

- [rename_collection()](./utility-rename_collection)

