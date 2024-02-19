---
displayed_sidbar: pythonSidebar
slug: /python/utility-list_roles
beta: false
notebook: false
token: ClLXdDs64oixJBxlIrCcEB2dngb
sidebar_position: 12
---

import Admonition from '@theme/Admonition';


# list_roles()

This operation lists the information about all existing roles.

```python
pymilvus.utility.list_roles(
    include_user_info: bool,
    using: str,
    timeout: float | None
)
```

The following operations are related to `list_roles()`

- list_user()

- list_users()

- Role.create()

- Role.drop()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import utility

# List all existing roles
utility.list_roles(
    include_user_info=bool,
    using="default"
)
```

**PARAMETERS:**

- **include_user_info** (*bool*) - 

    **[REQUIRED]**

    Whether Zilliz Cloud lists users associated with the listed roles.

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float *|* None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*RoleInfo*

**RETURNS:**

A **RoleInfo** object that contains a list of **RoleItem** objects.

```python
├── RoleInfo
│   └── groups  
│       └── RoleItem
│           ├── role_name
│           ├── users
```

A **RoleItem** object contains the following fields:

- **role_name** (*str*)

    The name of the role.

- **users** (*str*)

    The users to whom the role is granted to.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import connections, Role, utility

# Connection to localhost:19530
connections.connect()

# Create a user
user = utility.create_user(user="admin", password="123456")

# Create a role
role=Role(
    name="admin",
)

role.create()

# Add the user to the role
role.add_user(username="admin")

# List role information
utility.list_roles(include_user_info=True)

# RoleInfo groups:
# - RoleItem: <role_name:admin>, <users:('admin',)>
# - RoleItem: <role_name:public>, <users:()>
```

