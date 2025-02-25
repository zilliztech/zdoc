---
displayed_sidbar: pythonSidebar
title: "transfer_node() | Python | ORM"
slug: /python/python/utility-transfer_node
sidebar_label: "transfer_node()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation moves a specific number of query nodes from the source resource group to the target resource group. | Python | ORM"
type: docx
token: QHcpd1aJzo5aYbxJtMXc58een4f
sidebar_position: 39
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - transfer_node()
  - pymilvus25
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# transfer_node()

This operation moves a specific number of query nodes from the source resource group to the target resource group.

## Request Syntax{#request-syntax}

```python
transfer_node(
    source_group: str,
    target_group: str,
    num_nodes: int,
    using: str = "default",
    timeout: Optional[float] = None,
) -> None
```

**PARAMETERS:**

- **source_group** (*str*) -

    **[REQUIRED]**

    The name of the source resource group from which the query nodes are moved.

    Setting this to a resource group that does not exist results in a **MilvusException**.

- **target_group** (*str*) -

    **[REQUIRED]**

    The name of the source resource group to which the query nodes are moved.

    Setting this to a resource group that does not exist results in a **MilvusException**.

- **num_nodes** (*int*) -

    **[REQUIRED]**

    The number of query nodes to move between the source and target resource groups.

    Setting this to an integer greater than the actual number of query nodes in the current Zilliz Cloud cluster results in a **MilvusException**.

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

**EXAMPLE:**

```python
from pymilvus import connections, utility

# Connect to localhost:19530
connections.connect()

# Get the number of query nodes in the source resource group
res = utility.describe_resource_group(name="__default_resource_group")
res.num_available_node # 1

# Create a new resource group
utility.create_resource_group(
    name="rg_01",
    using="default"
)

# Get the number of query nodes in the target resource group
res = utility.describe_resource_group(name="rg_01")
res.num_available_node # 0

# Move the node from the default resource group to the new one
utility.transfer_node(
    source_group="__default_resource_group",
    target_group="rg_01",
    num_nodes=1
)

# Get the number of query nodes in the source and target resource groups
res = utility.describe_resource_group(name="__default_resource_group")
res.num_available_node # 0

res = utility.describe_resource_group(name="rg_01")
res.num_available_node # 1
```

## Related operations{#related-operations}

The following operations are related to `transfer_node()`:

- [create_resource_group()](./utility-create_resource_group)

- [describe_resource_group()](./utility-describe_resource_group)

- [drop_resource_group()](./utility-drop_resource_group)

- [list_resource_groups()](./utility-list_resource_groups)

- [transfer_replica()](./utility-transfer_replica)

