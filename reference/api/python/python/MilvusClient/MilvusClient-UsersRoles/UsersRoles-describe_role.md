---
displayed_sidbar: pythonSidebar
slug: /python/UsersRoles-describe_role
beta: false
notebook: false
token: JJz3dFrE2oJP3AxySWYcJlf4nMh
sidebar_position: 12
---

import Admonition from '@theme/Admonition';


# describe_role()

This operation describes a specific role.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.describe_role(
    role_name: str,
    timeout: Optional[float] = None
) -> List[Dict]
```

**PARAMETERS:**

- **role_name** (*str*) -

    **[REQUIRED]**

    The name of the role to describe.

- **timeout** (*float *|* None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*list*

**RETURNS:**

A list of dictionaries containing the permissions assigned to the role.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

- **BaseException**

    This exception will be raised when this operation fails.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)

# 2. Create a role
client.create_role(role_name="read_only")

# 3. Describe the role
client.describe_role(role_name="read_only")
```

