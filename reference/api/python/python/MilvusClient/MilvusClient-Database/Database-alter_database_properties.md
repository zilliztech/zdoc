---
title: "alter_database_properties() | Python | MilvusClient"
slug: /python/python/Database-alter_database_properties
sidebar_label: "alter_database_properties()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation modifies the properties of the specified database. | Python | MilvusClient"
type: docx
token: HCWBdorQdoONw2xaawacJWQkn1e
sidebar_position: 1
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - alter_database_properties()
  - pymilvus26
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_database_properties()

This operation modifies the properties of the specified database.

<Admonition type="info" icon="📘" title="Notes">

<p>This method applies only to dedicated clusters.</p>

</Admonition>

## Request Syntax\{#request-syntax}

```python
alter_database_properties(
    db_name: str, 
    properties: Dict,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **db_name** (*string*) -

    **[REQUIRED]**

    Name of the database whose properties are to be modified.

- **properties** (*dict* | *None*) -

    Properties to modify and their values after the modification. Possible database properties are as follows:

    - **database.replica.number** (*int*) -

        Number of replicas for the database.

    - **database.resource_groups** (*[]str*) -

        Resource groups dedicated to the database.

    - **database.diskQuota.mb** (*int*) -

        Disk quota allocated to the database in megabytes (**MB**).

    - **database.max.collections** (*int*) -

        Maximum number of collections allowed in the database.

    - **database.force.deny.writing** (*bool*) -

        Whether to deny all write operations in the database.

    - **database.force.deny.reading** (*bool*) -

        Whether to deny all read operations in the database.

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. Setting this to *None* indicates that this operation timeouts when any response or error occurs.

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

client.alter_database_properties(
    db_name="my_db",
    properties={"a": "f", "b": "g"}
)
```
