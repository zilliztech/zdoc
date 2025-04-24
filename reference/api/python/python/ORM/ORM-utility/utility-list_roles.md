---
displayed_sidbar: pythonSidebar
title: "list_roles() | Python | ORM"
slug: /python/python/utility-list_roles
sidebar_label: "list_roles()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation lists the information about all existing roles. | Python | ORM"
type: docx
token: ClLXdDs64oixJBxlIrCcEB2dngb
sidebar_position: 27
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - list_roles()
  - pymilvus25
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_roles()

This operation lists the information about all existing roles.

## Request Syntax{#request-syntax}

```python
list_roles(
    include_user_info: bool,
    using: str,
    timeout: float | None
)
```

**PARAMETERS:**

- **include_user_info** (*bool*) - 

    **[REQUIRED]**

    Whether Zilliz Cloud lists users associated with the listed roles.

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float* | *None*)  

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

# Connection to YOUR_CLUSTER_ENDPOINT
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

## Related operations{#related-operations}

The following operations are related to `list_roles()`

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

