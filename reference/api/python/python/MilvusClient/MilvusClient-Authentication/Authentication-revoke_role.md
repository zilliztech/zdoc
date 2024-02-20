---
displayed_sidbar: pythonSidebar
slug: /python/Authentication-revoke_role
beta: false
notebook: false
token: JJOId59ePoMLefxz1ChcBZ6inOh
sidebar_position: 12
---

import Admonition from '@theme/Admonition';


# revoke_role()

This operation revokes the role assigned to a user.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.revoke_role(
    user_name: str,
    role_name: str,
    timeout: Optional[float] = None
) -> None
```

__PARAMETERS:__

- __user_name__ (_str_) -

    __[REQUIRED]__

    The name of an existing user.

- __role_name__ (_str_) -

    __[REQUIRED]__

    The name of the role to revoke.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

None

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

- __BaseException__

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

# 3. Create a user
client.create_user(user_name="user_1", password="P@ssw0rd")

# 4. Grant the role to the user
client.grant_role(user_name="user_1", role_name="read_only")

# 5. Revoke the role from the user
client.revoke_role(user_name="user_1", role_name="read_only")
```

