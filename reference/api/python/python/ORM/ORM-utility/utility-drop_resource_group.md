---
displayed_sidbar: pythonSidebar
title: "drop_resource_group() | Python | ORM"
slug: /python/python/utility-drop_resource_group
sidebar_label: "drop_resource_group()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation drops a resource group. | Python | ORM"
type: docx
token: EofGdftYjoQ9E6x8mxLcpbG1nhc
sidebar_position: 11
keywords: 
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - zilliz
  - zilliz cloud
  - cloud
  - drop_resource_group()
  - pymilvus25
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_resource_group()

This operation drops a resource group. 

## Request Syntax{#request-syntax}

```python
drop_resource_group(
    name: str,
    using: str,
    timeout: float | None
)
```

**PARAMETERS:**

- **name** (*str*) -

    **[REQUIRED]**

    The name of the resource group to drop.

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

## Examples{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a new resource group
utility.create_resource_group(
    name="rg_01",
    using="default"
)

# Drop the created resource group
utility.drop_resource_group(
    name="rg_01",
    using="default"
)
```

## Related operations{#related-operations}

The following operations are related to `drop_resource_group()`:

- [create_resource_group()](./utility-create_resource_group)

- [describe_resource_group()](./utility-describe_resource_group)

- [list_resource_groups()](./utility-list_resource_groups)

- [transfer_node()](./utility-transfer_node)

- [transfer_replica()](./utility-transfer_replica)

