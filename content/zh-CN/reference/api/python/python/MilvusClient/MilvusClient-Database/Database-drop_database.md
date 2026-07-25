---
displayed_sidbar: pythonSidebar
title: "drop_database() | Python | MilvusClient"
slug: /python/python/Database-drop_database
sidebar_label: "drop_database()"
added_since: v2.5.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation drops the specified database. | Python | MilvusClient"
type: docx
token: Vjd7dE5OyoGvYaxd7OCcubBWnLd
sidebar_position: 4
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - drop_database()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_database()

This operation drops the specified database.

<Admonition type="info" icon="📘" title="Notes">

<p>This method applies only to dedicated clusters.</p>

</Admonition>

## Request Syntax

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

## Examples

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

client.drop_database("my_db")
```
