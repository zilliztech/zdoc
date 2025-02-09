---
displayed_sidbar: pythonSidebar
title: "list_resource_groups() | Python | ORM"
slug: /python/python/utility-list_resource_groups
sidebar_label: "list_resource_groups()"
beta: false
notebook: false
description: "This operation lists all resource groups in the currently connected Zilliz Cloud cluster. | Python | ORM"
type: docx
token: FXTZd5FgNo9ta0xvjaIclEM1nPf
sidebar_position: 26
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - list_resource_groups()
  - python
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_resource_groups()

This operation lists all resource groups in the currently connected Zilliz Cloud cluster.

## Request Syntax{#request-syntax}

```python
list_resource_groups(
    using: str,
    timeout: float | None,
)
```

**PARAMETERS:**

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*list*

**RETURNS:**
A list of all resource group names.

**EXAMPLE:**

```python
from pymilvus import connections, utility

# Connect to localhost:19530
connections.connect()

# Create a new resource group
utility.create_resource_group(
    name="rg_01",
    using="default"
)

# Create another resource group
utility.create_resource_group(
    name="rg_02",
    using="default"
)

# List all resource groups
utility.list_resource_groups(
    using="default"
) # ["__default_resource_group", "rg_01", "rg_02"]
```

## Related operations{#related-operations}

The following operations are related to `list_resource_groups()`:

- [create_resource_group()](./utility-create_resource_group)

- [describe_resource_group()](./utility-describe_resource_group)

- [drop_resource_group()](./utility-drop_resource_group)

- [transfer_node()](./utility-transfer_node)

- [transfer_replica()](./utility-transfer_replica)

