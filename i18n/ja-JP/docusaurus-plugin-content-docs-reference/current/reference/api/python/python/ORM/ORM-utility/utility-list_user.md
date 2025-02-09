---
displayed_sidbar: pythonSidebar
title: "list_user() | Python | ORM"
slug: /python/python/utility-list_user
sidebar_label: "list_user()"
beta: false
notebook: false
description: "This operation lists the information of a specific user. | Python | ORM"
type: docx
token: JeG6d5Sg2oPmXPxEhnyciq4snNd
sidebar_position: 28
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - list_user()
  - python
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
displayed_sidebar: pythonSidebar

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

- **timeout** (*float* | *None*)  

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

## Related operations{#related-operations}

The following operations are related to `list_user()`:

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

