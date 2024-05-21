---
displayed_sidbar: pythonSidebar
slug: /python/python/Collections-list_aliases
beta: FALSE
notebook: FALSE
type: docx
token: Cpynd2OFJoIXhLx3dQNct7Wgn6f
sidebar_position: 13
displayed_sidebar: pythonSidebar

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

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of the collection whose aliases are to be listed.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation times out when any response arrives or any error occurs.

**RETURN TYPE:**

*dict*

**RETURNS:**

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

**PARAMETERS:**

- **aliases** (*list*) -

    A list of aliases assigned to the specified collection.

- **collection_name** (*str*) -

    The specified collection name.

- **db_name** (*str*) -

    The name of the database to which the specified collection belongs to.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Currently, the database APIs are not available on Zilliz Cloud.</p>

    </Admonition>

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

- **BaseException**

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

