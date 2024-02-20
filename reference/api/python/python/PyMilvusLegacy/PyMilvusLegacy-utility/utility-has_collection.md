---
displayed_sidbar: pythonSidebar
slug: /python/utility-has_collection
beta: false
notebook: false
token: TWOxdwDYRo4CCHxDdZbc7IOznCg
sidebar_position: 17
---

import Admonition from '@theme/Admonition';


# has_collection()

This operation checks whether a collection exists.

```python
pymilvus.utility.has_collection(
    collection_name: str,
    using: str = "default",
    timeout: float | None,
)
```

The following operations are related to `has_collection()`:

- Collection

- list_collections()

- has_partition()

- rename_collection()

- flush_all()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import utility

utility.has_collection(
    collection_name="string",
    using="default",
    timeout=None
)
```

__PARAMETERS:__

- __collection_name__ (_str_) -

    __[REQUIRED]__
The name of an existing collection.

- __using__ (_str_) - 

    The alias of the employed connection.

    The default value is __default__, indicating that this operation employs the default connection.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_bool_

__RETURNS:__
A boolean value indicates whether the specified partition exists.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

## Examples{#examples}

```python
from pymilvus import connections, utility

# Connect to localhost:19530
connections.connect()

# Check whether a partition exists
collection.has_collection(
    collection_name="test_collection",
) # True
```

