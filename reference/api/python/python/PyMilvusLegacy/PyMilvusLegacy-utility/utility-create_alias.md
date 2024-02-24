---
displayed_sidbar: pythonSidebar
slug: /python/utility-create_alias
beta: false
notebook: false
token: DthMdlg8Lozw89xNz4TcBv1LnOe
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# create_alias()

This operation creates an alias for an existing collection.

## Request Syntax{#request-syntax}

```python
create_alias(
    collection_name: str,
    alias: str,
    using: str,
    timeout: float | None
)
```

__PARAMETERS:__

- __collection_name __(_str_) -

    __[REQUIRED]__

    The name of the collection to create an alias for.

- __alias __(_str_) -

    __[REQUIRED]__

    The alias of the collection. Before this operation, ensure that the alias does not already exist. If it does, exceptions will occur.

    <Admonition type="info" icon="📘" title="What is a collection alias?">

    <p>A collection alias is an additional name for a collection. Collection aliases are useful when you want to switch your application to a new collection without any changes to your code. </p>
    <p>In , a collection alias is a globally unique identifier. One alias can only be assigned to exactly one collection. Conversely, a collection can have multiple aliases.</p>
    <p>Suppose there is one collection: <code>collection_1</code>. You can assign two different aliases (<code>bob</code> and <code>tom</code>) to this collection by calling <code>create_alias("collection_1", "bob")</code> and <code>create_alias("collection_1", "tom")</code>.</p>

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

    This exception will be raised when any error occurs during this operation, especially when you set `alias` to an existing alias.

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
```

## Related operations{#related-operations}

The following operations are related to `create_alias()`:

- [alter_alias()](./utility-alter_alias)

- [drop_alias()](./utility-drop_alias)

- [list_aliases()](./utility-list_aliases)

