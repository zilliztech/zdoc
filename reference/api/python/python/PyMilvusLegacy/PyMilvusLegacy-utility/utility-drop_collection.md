---
displayed_sidbar: pythonSidebar
slug: /python/utility-drop_collection
beta: false
notebook: false
token: FHcYdN4apoI5TIx0LxScISvtn0f
sidebar_position: 10
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

__PARAMETERS:__

- __collection_name__ (_str_) -

    __[REQUIRED]__

    The name of a collection to delete.

- __timeout__ (_float_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

- __using__ (_str_) - 

    The alias of the employed connection.

    The default value is __default__, indicating that this operation employs the default connection.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

__EXCEPTIONS:__

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

