---
title: "use_database() | Python | MilvusClient"
slug: /python/python/Database-use_database
sidebar_key: python/Database-use_database
sidebar_label: "use_database()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation switches the client to use a different database. Future operations will use the specified database. The method validates that the database exists before switching. | Python | MilvusClient"
type: docx
token: AglQd68yqoEn8Ixkn9ociyqKnMx
sidebar_position: 8
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - use_database()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# use_database()

This operation switches the client to use a different database. Future operations will use the specified database. The method validates that the database exists before switching.

<Admonition type="info" icon="📘" title="Notes">

<p>This is an alias method for <a href="./Database-using_database"><code>using_database()</code></a>.</p>

</Admonition>

## Request syntax\{#request-syntax}

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

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when the database does not exist (error code 800).

## Example\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Switch to a different database
client.use_database(db_name="my_database")

# Subsequent operations will use "my_database"
collections = client.list_collections()
```
