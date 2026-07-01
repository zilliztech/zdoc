---
title: "drop_database_properties() | Python | MilvusClient"
slug: /python/python/Database-drop_database_properties
sidebar_key: python/Database-drop_database_properties
sidebar_label: "drop_database_properties()"
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
beta: false
notebook: false
description: "This operation drops the setting of the specified properties. | Python | MilvusClient"
type: docx
token: AdSXdtNDsoTMnJx1QoGcSsnZnWd
sidebar_position: 5
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - drop_database_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_database_properties()

This operation drops the setting of the specified properties.

<Admonition type="info" icon="📘" title="Notes">

This method applies only to dedicated clusters.

</Admonition>

## Request Syntax\{#request-syntax}

```python
drop_database_properties(
    db_name: str, 
    property_keys: List[string],
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **db_name** (*string*) -

    **[REQUIRED]**

    Name of the database whose properties are to be dropped.

- **properties** (*[]string* | *None*) -

    Names of the properties to drop. Possible database properties are as follows:

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

    The timeout duration for this operation. Setting this to *None* indicates that it timeouts when a response arrives, or an error occurs.

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

client.drop_database_properties(
    db_name="my_db",
    properties=["a", "b"]
)
```
