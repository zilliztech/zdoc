---
displayed_sidbar: pythonSidebar
slug: /python/python/Authentication-describe_user
beta: FALSE
notebook: FALSE
type: docx
token: Wz3HdtvPCoEquvxFY7PcDHxcnEe
sidebar_position: 4
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# describe_user()

This operation describes a specific user.

## Request syntax{#request-syntax}

```python
describe_user(
    user_name: str,
    timeout: Optional[float] = None
) -> Dict
```

**PARAMETERS:**

- **user_name** (*str*) -

    **[REQUIRED]**

    The name of the user to describe.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*dict*

**RETURNS:**

A dictionary containing detailed information about the specified users.

```python
# {
#       'user_name': str, 
#       'roles': tuple
# }
```

- **user_name** (*str*) -

    The name of the specified users.

- **roles** (*tuple*) - 

    The roles granted to the specified user.

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
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a user
client.create_user(user_name="user_1", password="P@ssw0rd")

# 3. Grant the role to the user
client.grant_role(user_name="user_1", role_name="db_ro")

# 4. Describe the user
client.describe_user(user_name="user_1")

# {'user_name': 'user_1', 'roles': ('db_ro',)}
```

## Related methods{#related-methods}

- [create_user()](./Authentication-create_user)

- [drop_user()](./Authentication-drop_user)

- [list_users()](./Authentication-list_users)

- [update_password()](./Authentication-update_password)

