---
title: "has_collection() | Python | ORM"
slug: /python/python/utility-has_collection
sidebar_label: "has_collection()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation checks whether a collection exists. | Python | ORM"
type: docx
token: TWOxdwDYRo4CCHxDdZbc7IOznCg
sidebar_position: 17
keywords: 
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - has_collection()
  - pymilvus26
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# has_collection()

This operation checks whether a collection exists.

## Request Syntax\{#request-syntax}

```python
has_collection(
    collection_name: str,
    using: str = "default",
    timeout: float | None,
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**
    The name of an existing collection.

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

# Check whether a partition exists
collection.has_collection(
    collection_name="test_collection",
) # True
```

## Related operations\{#related-operations}

- [drop_collection()](./utility-drop_collection)

- [flush_all()](./utility-flush_all)

- [has_partition()](./utility-has_partition)

- [list_collections()](./utility-list_collections)

- [rename_collection()](./utility-rename_collection)

