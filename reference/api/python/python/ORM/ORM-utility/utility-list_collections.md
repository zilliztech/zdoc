---
title: "list_collections() | Python | ORM"
slug: /python/python/utility-list_collections
sidebar_label: "list_collections()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all collections in the database used in the current connection. | Python | ORM"
type: docx
token: QgxEdfBMSodYo6xCg24cH3hInr4
sidebar_position: 24
keywords: 
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - zilliz
  - zilliz cloud
  - cloud
  - list_collections()
  - pymilvus26
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_collections()

This operation lists all collections in the database used in the current connection.

## Request Syntax\{#request-syntax}

```python
list_collections(
    timeout: float | None,
    using: str = "default",
)
```

**PARAMETERS:**

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

**RETURN TYPE:**

*list*

**RETURNS:**
A list of collection names.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

## Examples\{#examples}

```python
from pymilvus import connections, utility

connections.connect()

utility.list_collections()
```

## Related operations\{#related-operations}

The following operations are related to `list_collections()`:

- [drop_collection()](./utility-drop_collection)

- [flush_all()](./utility-flush_all)

- [has_collection()](./utility-has_collection)

- [has_partition()](./utility-has_partition)

- [rename_collection()](./utility-rename_collection)

