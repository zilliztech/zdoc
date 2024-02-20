---
displayed_sidbar: pythonSidebar
slug: /python/utility-drop_alias
beta: false
notebook: false
token: V7BWdrC39oPAauxoWBzcaldwnVc
sidebar_position: 9
---

import Admonition from '@theme/Admonition';


# drop_alias()

This operation drops a specified collection alias. 

```python
pymilvus.utility.drop_alias(
    collection_name: str,
    alias: str,
    using: str,
    timeout: float | None
)
```

The following operations are related to `drop_alias()`:

- create_alias()

- alter_alias()

- list_aliases()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import utility

# Drop a collection alias
drop_alias(
    alias="string",
    using="default"
)
```

__PARAMETERS:__

- __alias __(_str_) -

    __[REQUIRED]__

    The alias to drop.

    <Admonition type="info" icon="📘" title="Notes">

    <p>When dropping an alias, you do not need to provide the collection name because one alias can only be assigned to exactly one collection. Therefore, the server knows which collection the specified alias belongs to.</p>

    </Admonition>

- __using__ (_str_) - 

    The alias of the employed connection.

    The default value is __default__, indicating that this operation employs the default connection.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

- __BaseException__

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

# Drop the alias bob
utility.drop_alise(alias="bob")

# List aliases for the collection
utility.list_aliases(collection_name="collection_1") # ['tom']
```

