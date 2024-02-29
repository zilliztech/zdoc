---
displayed_sidbar: pythonSidebar
slug: /python/utility-rename_collection
beta: false
notebook: false
type: docx
token: M0qRdF1cLokrxvxyrXScJ64FnEe
sidebar_position: 37
---

# rename_collection()

This operation renames an existing collection and optionally moves the collection to a new database.

<div class="admonition note">

<p><b>notes</b></p>

<p>Aliases created for the target collection remain intact after this operation.</p>

</div>

## Request Syntax{#request-syntax}

```python
rename_collection(
    old_collection_name: str,
    new_collection_name: str,
    new_db_name: str = "default",
    timeout: float | None,
    using: str = "default",
)
```

__PARAMETERS:__

- __old_collection_name__ (_str_) -

    __[REQUIRED]__
The original name of the target collection.

    Setting this to a non-existing collection results in a __MilvusException__.

- __new_collection_name__ (_str_) -

    __[REQUIRED]__

    The name of the target collection after this operation.

    Setting this to the value of __old_collection_name__ results in a __MilvusException__.

- __new_db_name__ (_str_) -

    The name of the database to which the collection belongs after this operation.

    The value defaults to __default__. Setting this to a database rather than the one the collection belongs to before this operation moves this collection to the specified database.

    Setting this to a non-existing database results in a __MilvusException__.

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

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

## Examples{#examples}

```python
from pymilvus import connections, utility

# Connect to localhost:19530
connections.connect()

# Renames a collection
utility.rename_collection(
    old_collection_name="test_collection_1",
    new_collection_name="test_collection_2",
)

# Renames a collection and moves it to a new database
utility.rename_collection(
    old_collection_name="test_collection_1",
    new_collection_name="test_collection_2",
    new_db_name="new_database"
)
```

## Related operations{#related-operations}

The following operations are related to `rename_collection()`:

- [drop_collection()](./utility-drop_collection)

- [flush_all()](./utility-flush_all)

- [get_query_segment_info()](./utility-get_query_segment_info)

- [has_collection()](./utility-has_collection)

- [has_partition()](./utility-has_partition)

- [list_collections()](./utility-list_collections)

