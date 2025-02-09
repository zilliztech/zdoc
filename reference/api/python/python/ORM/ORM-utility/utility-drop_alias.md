---
displayed_sidbar: pythonSidebar
title: "drop_alias() | Python | ORM"
slug: /python/python/utility-drop_alias
sidebar_label: "drop_alias()"
beta: false
notebook: false
description: "This operation drops a specified collection alias. | Python | ORM"
type: docx
token: V7BWdrC39oPAauxoWBzcaldwnVc
sidebar_position: 9
keywords: 
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - zilliz
  - zilliz cloud
  - cloud
  - drop_alias()
  - python
  - Unstructured Data
  - vector database
  - IVF
  - knn
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_alias()

This operation drops a specified collection alias. 

## Request Syntax{#request-syntax}

```python
drop_alias(
    collection_name: str,
    alias: str,
    using: str,
    timeout: float | None
)
```

**PARAMETERS:**

- **alias** (*str*) -

    **[REQUIRED]**

    The alias to drop.

    <Admonition type="info" icon="📘" title="Notes">

    <p>When dropping an alias, you do not need to provide the collection name because one alias can only be assigned to exactly one collection. Therefore, the server knows which collection the specified alias belongs to.</p>

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

# Drop the alias bob
utility.drop_alise(alias="bob")

# List aliases for the collection
utility.list_aliases(collection_name="collection_1") # ['tom']
```

## Related operations{#related-operations}

The following operations are related to `drop_alias()`:

- [alter_alias()](./utility-alter_alias)

- [create_alias()](./utility-create_alias)

- [list_aliases()](./utility-list_aliases)

