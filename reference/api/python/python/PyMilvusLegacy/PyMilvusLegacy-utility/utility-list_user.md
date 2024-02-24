---
displayed_sidbar: pythonSidebar
slug: /python/utility-list_user
beta: false
notebook: false
token: JeG6d5Sg2oPmXPxEhnyciq4snNd
sidebar_position: 28
---

import Admonition from '@theme/Admonition';


# list_user()

This operation lists the information of a specific user.

## Request Syntax{#request-syntax}

```python
list_user(
    username: str,
    include_role_info: bool,
    using: str,
    timeout: float | None
)
```

__PARAMETERS__

- __username__ (_string_) - 

    __[REQUIRED]__

    The name of the user to list.

- __include_role_info__ (_bool_) - 

    __[REQUIRED]__

    Whether Zilliz Cloud lists the roles granted to the specified user.

- __using__ (_string_) - 

    The alias of the employed connection.

    The default value is __default__, indicating that this operation employs the default connection.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_UserInfo_

__RETURNS:__

A __UserInfo__ object that contains contains the user information.

```python
├── UserInfo
│   └── groups  
│       └── UserItem
│           ├── username
│           ├── roles
```

A __UserItem__ object contains the following fields:

- __username__ (_str_)

    The name of the user.

- __roles__ (_str_)

    The roles assigned to the user.

__EXCEPTIONS:__

- __MilvusException__

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

## Related operations{#related-operations}

The following operations are related to `list_user()`:

- [Role](./PyMilvusLegacy-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

