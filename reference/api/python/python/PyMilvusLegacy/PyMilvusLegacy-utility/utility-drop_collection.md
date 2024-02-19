---
displayed_sidbar: pythonSidebar
slug: /python/utility-drop_collection
beta: false
notebook: false
token: FHcYdN4apoI5TIx0LxScISvtn0f
sidebar_position: 30
---

import Admonition from '@theme/Admonition';


# drop_collection()

This operation drops a specific collection.

```python
pymilvus.utility.drop_collection(
    collection_name: str,
    timeout: float | None,
    using: str = "default",
)
```

## Request Syntax{#request-syntax}

```python
from pymilvus import utility

utility.drop_collection(
    collection_name="string",
    timeout=None,
    using="default"
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

