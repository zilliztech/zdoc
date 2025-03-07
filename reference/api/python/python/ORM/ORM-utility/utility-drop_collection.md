---
displayed_sidbar: pythonSidebar
title: "drop_collection() | Python | ORM"
slug: /python/python/utility-drop_collection
sidebar_label: "drop_collection()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation drops a specific collection. | Python | ORM"
type: docx
token: FHcYdN4apoI5TIx0LxScISvtn0f
sidebar_position: 10
keywords: 
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
  - zilliz
  - zilliz cloud
  - cloud
  - drop_collection()
  - pymilvus25
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_collection()

This operation drops a specific collection.

## Request Syntax{#request-syntax}

```python
drop_collection(
    collection_name: str,
    timeout: float | None,
    using: str = "default",
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of a collection to delete.

- **timeout** (*float*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

N/A

### Examples{#examples}

```python
from pymilvus import connections, utility

# Connect to localhost:19530
connections.connect()

# Drop a specific collection
utility.drop_collection(
    collection_name="test_collection",
)
```

## Related operations{#related-operations}

The following operations are related to the `drop_collection()` method:

- [flush_all()](./utility-flush_all)

- [has_collection()](./utility-has_collection)

- [has_partition()](./utility-has_partition)

- [list_collections()](./utility-list_collections)

- [rename_collection()](./utility-rename_collection)

