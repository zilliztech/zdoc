---
displayed_sidbar: pythonSidebar
slug: /python/utility-list_user
beta: false
notebook: false
token: JeG6d5Sg2oPmXPxEhnyciq4snNd
sidebar_position: 10
---

import Admonition from '@theme/Admonition';


# list_user()

This operation lists the information of a specific user.

```python
pymilvus.utility.list_user(
    username: str,
    include_role_info: bool,
    using: str,
    timeout: float | None
)
```

The following operations are related to `list_user()`:

- update_password()

- reset_password()

- create_user()

- list_users()

- list_usernames()

- delete_user()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import utility

# List the information of a specific user
user=utility.list_user(
    username="string",
    include_role_info=bool,
    using="default"
)
```

**PARAMETERS**

- **username** (*string*) - 

    **[REQUIRED]**

    The name of the user to list.

- **include_role_info** (*bool*) - 

    **[REQUIRED]**

    Whether Zilliz Cloud lists the roles granted to the specified user.

- **using** (*string*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float *|* None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*UserInfo*

**RETURNS:**

A **UserInfo** object that contains contains the user information.

```python
├── UserInfo
│   └── groups  
│       └── UserItem
│           ├── username
│           ├── roles
```

A **UserItem** object contains the following fields:

- **username** (*str*)

    The name of the user.

- **roles** (*str*)

    The roles assigned to the user.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import connections, Role, utility

# Connection to localhost:19530
connections.connect()

# List the information of a specific user
users = utility.list_user(
    username="admin", 
    include_role_info=True,
    using="default"
)

# UserInfo groups:
# - UserItem: <username:admin>, <roles:('admin',)>
```

