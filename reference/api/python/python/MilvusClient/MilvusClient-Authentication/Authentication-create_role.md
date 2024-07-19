---
displayed_sidbar: pythonSidebar
slug: /python/python/Authentication-create_role
beta: false
notebook: false
type: docx
token: OUz3drncZo1Er8xyITZcYz66nWE
sidebar_position: 1
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# create_role()

This operation creates a custom role.

## Request syntax{#request-syntax}

```python
create_role(
    role_name: str,
    timeout: Optional[float] = None
) -> None
```

**PARAMETERS:**

- **role_name** (*str*) -

    **[REQUIRED]**

    The name of the role to create.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

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
```

## Related methods{#related-methods}

- [describe_role()](./Authentication-describe_role)

- [drop_role()](./Authentication-drop_role)

- [grant_privilege()](./Authentication-grant_privilege)

- [grant_role()](./Authentication-grant_role)

- [list_roles()](./Authentication-list_roles)

- [revoke_privileges()](./Authentication-revoke_privileges)

- [revoke_role()](./Authentication-revoke_role)

