---
displayed_sidbar: pythonSidebar
slug: /python/Authentication-describe_user
beta: false
notebook: false
token: Wz3HdtvPCoEquvxFY7PcDHxcnEe
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# describe_user()

This operation describes a specific user.

## Request Syntax{#request-syntax}

```python
pymilvus.describe_user(
    user_name: str,
    timeout: Optional[float] = None
) -> Dict
```

__PARAMETERS:__

- __user_name__ (_str_) -

    __[REQUIRED]__

    The name of the user to describe.

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

# 5. Describe the user
client.describe_user(user_name="user_1")

# {'user_name': 'user_1', 'roles': ('read_only',)}
```

