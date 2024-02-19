---
displayed_sidbar: pythonSidebar
slug: /python/UsersRoles-drop_user
beta: false
notebook: false
token: WtyZdeFKMoSv5exaYRxcPLCSndg
sidebar_position: 6
---

import Admonition from '@theme/Admonition';


# drop_user()

This operation drops a user.

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.drop_user(
    user_name: str,
    timeout: Optional[float] = None
)
```

**PARAMETERS:**

- **user_name** (*str*) -

    **[REQUIRED]**

    The name of the user to drop.

- **timeout** (*float *|* None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

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

# 2. Create a user
client.create_user(user_name="user_1", password="P@ssw0rd")

# 3. Drop the user
client.drop_user(user_name="user_1")
```

