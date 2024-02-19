---
displayed_sidbar: pythonSidebar
slug: /python/utility-drop_resource_group
beta: false
notebook: false
token: EofGdftYjoQ9E6x8mxLcpbG1nhc
sidebar_position: 23
---

import Admonition from '@theme/Admonition';


# drop_resource_group()

This operation drops a resource group. 

```python
pymilvus.utility.drop_resource_group(
    name: str,
    using: str,
    timeout: float | None
)
```

The following operations are related to `drop_resource_group()`:

- create_resource_group()

- describe_resource_group()

- list_resource_groups()

- transfer_node()

- transfer_replica()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import utility

# Drop a resource group
utility.drop_resource_group(
    name="string",
    using="default"
)
```

**PARAMETERS:**

- **name **(*str*) -

    **[REQUIRED]**

    The name of the resource group to drop.

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float *|* None*)  

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

# Connect to localhost:19530
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

