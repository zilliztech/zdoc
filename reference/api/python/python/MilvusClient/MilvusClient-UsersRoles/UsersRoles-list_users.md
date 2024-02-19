---
displayed_sidbar: pythonSidebar
slug: /python/UsersRoles-list_users
beta: false
notebook: false
token: EZ2YdBHoDoRTlxx91tscffm1nSb
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# list_users()

This operation lists the names of all existing users.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.list_users(
    timeout: Optional[float] = None
) -> List
```

**PARAMETERS:**

- **timeout** (*float *|* None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*list*

**RETURNS:**

A list of user names.

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

# 2. Create a user
client.create_user(user_name="user_1", password="P@ssw0rd")

# 3. List all users
client.list_users()

# ['admin', 'root', 'user_1']
```

