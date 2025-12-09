---
title: "list_users() | Python | ORM"
slug: /python/python/utility-list_users
sidebar_label: "list_users()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists the information of all existing users. | Python | ORM"
type: docx
token: MtF2dkZcso4XduxM194cUaiinqb
sidebar_position: 30
keywords: 
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - zilliz
  - zilliz cloud
  - cloud
  - list_users()
  - pymilvus26
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_users()

This operation lists the information of all existing users.

## Request Syntax\{#request-syntax}

```python
list_users(
    include_role_info: bool,
    using: str,
    timeout: float | None
)
```

**PARAMETERS**

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

## Examples\{#examples}

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
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

## Related operations\{#related-operations}

The following operations are related to `list_users()`:

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

