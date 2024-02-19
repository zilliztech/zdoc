---
displayed_sidbar: pythonSidebar
slug: /python/utility-list_aliases
beta: false
notebook: false
token: XBwxdP96Go8ITyx7UuNcL7EonPd
sidebar_position: 6
---

import Admonition from '@theme/Admonition';


# list_aliases()

This operation lists all existing aliases for a specific collection.

```python
pymilvus.utility.list_aliases(
    collection_name: str,
    using: str,
    timeout: float | None
)
```

The following operations are related to `drop_alias()`:

- create_alias()

- alter_alias()

- drop_alias()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import utility

# List all existing aliases for a specific collection

list_aliases(
    collection_name="string",
    using="default"
)
```

**PARAMETERS:**

- **collection_name **(*str*) -

    **[REQUIRED]**

    The name of the collection whose aliases are to be listed.

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float *|* None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation times out when any response arrives or any error occurs.

**RETURN TYPE:**

*list*

**RETURNS:**

A list of aliases for the specified collection. If the collection has no aliases, an empty list will be returned.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

- **BaseException**

    This exception will be raised when this operation fails.

## Examples{#examples}

```python
from pymilvus import connections, Collection, utility

# Connection to localhost:19530
connections.connect()

# Get an existing collection
collection_1 = Collection("collection_1")

# Create an alias for collection_1
utility.create_alias(collection_name="collection_1", alias="bob")

# List aliases for the collection
utility.list_aliases(collection_name="collection_1") # ['bob']

# Create another alias for collection_1
utility.create_alias(collection_name="collection_1", alias="tom")

# List aliases for the collection
utility.list_aliases(collection_name="collection_1") # ['bob', 'tom']
```
