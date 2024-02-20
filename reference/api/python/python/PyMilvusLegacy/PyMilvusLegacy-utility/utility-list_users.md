---
displayed_sidbar: pythonSidebar
slug: /python/utility-list_users
beta: false
notebook: false
token: MtF2dkZcso4XduxM194cUaiinqb
sidebar_position: 30
---

import Admonition from '@theme/Admonition';


# list_users()

This operation lists the information of all existing users.

```python
pymilvus.utility.list_users(
    include_role_info: bool,
    using: str,
    timeout: float | None
)
```

The following operations are related to `list_users()`:

- update_password()

- reset_password()

- create_user()

- list_user()

- list_usernames()

- delete_user()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import utility

# List all existing users
user=utility.list_users(
    include_role_info=bool,
    using="default"
)
```

__PARAMETERS__

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
from pymilvus import connections, utility

# Connection to localhost:19530
connections.connect()

# List the information of all existing users
user = utility.list_users(
    include_role_info=True,
    using="default"
)

# UserInfo groups:
# - UserItem: <username:admin>, <roles:('admin',)>
# - UserItem: <username:root>, <roles:()>
```

