---
displayed_sidbar: pythonSidebar
slug: /python/utility-list_usernames
beta: false
notebook: false
token: RXi3dgtNYogU0cxmTsgcdT72nsc
sidebar_position: 8
---

import Admonition from '@theme/Admonition';


# list_usernames()

This operation lists the names of all existing users.

```python
pymilvus.utility.list_usernames(
    using: str,
    timeout: float | None
)
```

The following operations are related to `list_usernames()`

- update_password()

- reset_password()

- create_user()

- list_user()

- list_users()

- delete_user()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import utility

# List all existing usernames
utility.list_usernames(using="default")
```

**PARAMETERS:**

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float *|* None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*list*

**RETURNS:**

A list that contains the names of all existing users.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import connections, utility

# Connection to localhost:19530
connections.connect()

# List all existing usernames
users = utility.list_usernames()
```

