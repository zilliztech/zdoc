---
displayed_sidbar: pythonSidebar
slug: /python/Collections-list_aliases
beta: false
notebook: false
type: docx
token: Cpynd2OFJoIXhLx3dQNct7Wgn6f
sidebar_position: 13
---

import Admonition from '@theme/Admonition';


# list_aliases()

This operation lists all existing aliases for a specific collection.

## Request syntax{#request-syntax}

```python
list_aliases(
    collection_name: str,
    timeout: Optional[float] = None
)
```

__PARAMETERS:__

- __collection_name __(_str_) -

    __[REQUIRED]__

    The name of the collection whose aliases are to be listed.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. 

    Setting this to __None__ indicates that this operation times out when any response arrives or any error occurs.

__RETURN TYPE:__

_dict_

__RETURNS:__

A dictionary containing the list of aliases assigned to the specified collection.

```python
{
    'aliases': [
        'test'
    ], 
    'collection_name': 'test_collection', 
    'db_name': 'default'
}
```

__PARAMETERS:__

- __aliases __(_list_) -

    A list of aliases assigned to the specified collection.

- __collection_name __(_str_) -

    The specified collection name.

- __db_name__ (_str_) -

    The name of the database to which the specified collection belongs to.

    <include target="zilliz">

    <Admonition type="info" icon="📘" title="Notes">

    <p>Currently, the database APIs are not available on Zilliz Cloud.</p>

    </Admonition>

    </include>

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

- __BaseException__

    This exception will be raised when this operation fails.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Create an alias for the collection
client.create_alias(collection_name="test_collection", alias="test")

# 4. List aliases of the collection
client.list_aliases(collection_name="test_collection")

# {'aliases': ['test'], 'collection_name': 'test_collection', 'db_name': 'default'}
```

## Related methods{#related-methods}

- [alter_alias()](./Collections-alter_alias)

- [create_alias()](./Collections-create_alias)

- [describe_alias()](./Collections-describe_alias)

- [drop_alias()](./Collections-drop_alias)

