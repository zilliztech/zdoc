---
displayed_sidbar: pythonSidebar
title: "using_database() | Python | MilvusClient"
slug: /python/python/Database-using_database
sidebar_label: "using_database()"
added_since: v2.5.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation changes the database currently in use. | Python | MilvusClient"
type: docx
token: OCfid8DdPo1ga1x24JZcV92xnwd
sidebar_position: 7
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - using_database()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# using_database()

This operation changes the database currently in use.

<Admonition type="info" icon="📘" title="Notes">

<p>This method applies only to dedicated clusters.</p>

</Admonition>

## Request Syntax

```python
using_database(
    db_name: str, 
    **kwargs,
)
```

**PARAMETERS:**

- **db_name** (*string*) -

    **[REQUIRED]**

    Name of the database to use.

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

client.using_database("my_db")
```
