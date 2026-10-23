---
title: "use_database() | Python | MilvusClient"
slug: /python/python/Database-use_database
sidebar_label: "use_database()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation switches the client to use a different database. Future operations will use the specified database. The method validates that the database exists before switching. | Python | MilvusClient"
type: docx
token: Y78mdDHzuoSOXoxMkUTcxF0nnWh
sidebar_position: 8
keywords: 
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - zilliz
  - zilliz cloud
  - cloud
  - use_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# use_database()

This operation switches the client to use a different database. Future operations will use the specified database. The method validates that the database exists before switching.

<Admonition type="info" title="Notes">

This is an alias method for `using_database()`.

</Admonition>

## Request Syntax\{#request-syntax}

```python
client.use_database(
    db_name: str
)
```

**PARAMETERS:**

- **db_name** (*str*) -

    **[REQUIRED]**

    The name of the database to switch to.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when the database does not exist (error code 800). This exception will be raised when the database does not exist (error code 800).

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Switch to a different database
client.use_database(db_name="my_database")

# Subsequent operations will use "my_database"
collections = client.list_collections()
```
