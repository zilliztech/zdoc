---
title: "drop_database() | Python | MilvusClient"
slug: /python/python/Database-drop_database
sidebar_label: "drop_database()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops the specified database. | Python | MilvusClient"
type: docx
token: Vjd7dE5OyoGvYaxd7OCcubBWnLd
sidebar_position: 4
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - drop_database()
  - pymilvus26
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_database()

This operation drops the specified database.

<Admonition type="info" icon="📘" title="Notes">

<p>This method applies only to dedicated clusters.</p>

</Admonition>

## Request Syntax\{#request-syntax}

```python
drop_database(
    db_name: str, 
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **db_name** (*string*) -

    **[REQUIRED]**

    Name of the database to drop.

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. Setting this to *None* indicates that it timeouts when a response arrives or an error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- `MilvusException` - Raised if any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

client.drop_database("my_db")
```
