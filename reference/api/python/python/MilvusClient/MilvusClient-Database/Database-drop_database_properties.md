---
title: "drop_database_properties() | Python | MilvusClient"
slug: /python/python/Database-drop_database_properties
sidebar_label: "drop_database_properties()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
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

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_database_properties()

This operation drops the setting of the specified properties.

## Request Syntax\{#request-syntax}

```python
drop_database_properties(
    db_name: str,
    property_keys: List[str],
    **kwargs,
)
```

**PARAMETERS:**

- **db_name** (*str*) -

    **[REQUIRED]**

    Name of the database whose properties are to be dropped.

- **property_keys** (*list[str]*) -

    **[REQUIRED]**

    Names of the properties to drop. Possible database properties are as follows:

    - **database.replica.number** (*int*) - Number of replicas for the database.

    - **database.resource_groups** (*list[str]*) - Resource groups dedicated to the database.

    - **database.diskQuota.mb** (*int*) - Disk quota allocated to the database in megabytes (**MB**).

    - **database.max.collections** (*int*) - Maximum number of collections allowed in the database.

    - **database.force.deny.writing** (*bool*) - Whether to deny all write operations in the database.

    - **database.force.deny.reading** (*bool*) - Whether to deny all read operations in the database.

    - **database.replica.number** (*int*) - Number of replicas for the database.

    - **database.resource_groups** (*list[str]*) - Resource groups dedicated to the database.

    - **database.diskQuota.mb** (*int*) - Disk quota allocated to the database in megabytes (**MB**).

    - **database.max.collections** (*int*) - Maximum number of collections allowed in the database.

    - **database.force.deny.writing** (*bool*) - Whether to deny all write operations in the database.

    - **database.force.deny.reading** (*bool*) - Whether to deny all read operations in the database.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

client.drop_database_properties(
    db_name="my_db",
    property_keys=["database.replica.number", "database.diskQuota.mb"]
)
```
