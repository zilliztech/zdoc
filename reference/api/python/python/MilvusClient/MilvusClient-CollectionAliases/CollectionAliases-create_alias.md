---
displayed_sidbar: pythonSidebar
slug: /python/CollectionAliases-create_alias
beta: false
notebook: false
token: Kqlodu0AWoefKvxczcxc1c36nlf
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# create_alias()

This operation creates an alias for an existing collection.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.create_alias(
    collection_name: str,
    alias: str,
    timeout: float | None
) -> None
```

**PARAMETERS:**

- **collection_name **(*str*) -

    **[REQUIRED]**

    The name of the collection to create an alias for.

- **alias **(*str*) -

    **[REQUIRED]**

    The alias of the collection. Before this operation, ensure that the alias does not already exist. If it does, exceptions will occur.

    <Admonition type="info" icon="📘" title="What is a collection alias?">

    <p>A collection alias is an additional name for a collection. Collection aliases are useful when you want to switch your application to a new collection without any changes to your code. </p>
    <p>In , a collection alias is a globally unique identifier. One alias can only be assigned to exactly one collection. Conversely, a collection can have multiple aliases.</p>
    <p>Suppose there is one collection: <code>collection_1</code>. You can assign two different aliases (<code>bob</code> and <code>tom</code>) to this collection by calling <code>create_alias("collection_1", "bob")</code> and <code>create_alias("collection_1", "tom")</code>.</p>

    </Admonition>

- **timeout** (*float *|* None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when you set `alias` to an existing alias.

- **BaseException**

    This exception will be raised when this operation fails.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Create an alias for the collection
client.create_alias(collection_name="test_collection", alias="test")
```
