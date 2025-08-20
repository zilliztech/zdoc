---
displayed_sidbar: pythonSidebar
title: "create_alias() | Python | ORM"
slug: /python/python/utility-create_alias
sidebar_label: "create_alias()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation creates an alias for an existing collection. | Python | ORM"
type: docx
token: DthMdlg8Lozw89xNz4TcBv1LnOe
sidebar_position: 3
keywords: 
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search
  - zilliz
  - zilliz cloud
  - cloud
  - create_alias()
  - pymilvus25
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
displayed_sidebar: pythonSidebar

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

**PARAMETERS:**

- **collection_name** (*str*) -

    **&#91;REQUIRED&#93;**

    The name of the collection to create an alias for.

- **alias** (*str*) -

    **&#91;REQUIRED&#93;**

    The alias of the collection. Before this operation, ensure that the alias does not already exist. If it does, exceptions will occur.

    <Admonition type="info" icon="📘" title="What is a collection alias?">

    <p>A collection alias is an additional name for a collection. Collection aliases are useful when you want to switch your application to a new collection without any changes to your code. </p>
    <p>In , a collection alias is a globally unique identifier. One alias can only be assigned to exactly one collection. Conversely, a collection can have multiple aliases.</p>
    <p>Suppose there is one collection: <code>collection_1</code>. You can assign two different aliases (<code>bob</code> and <code>tom</code>) to this collection by calling <code>create_alias("collection_1", "bob")</code> and <code>create_alias("collection_1", "tom")</code>.</p>

    </Admonition>

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float* | *None*)  

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

## Examples{#examples}

```python
from pymilvus import connections, Collection, utility

# Connection to YOUR_CLUSTER_ENDPOINT
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

