---
displayed_sidbar: this.displayedSidebar
slug: /python/python/Role-add_user
beta: FALSE
notebook: FALSE
type: docx
token: W7GJdpYrYoYhSaxW6uzcVAZinYf
sidebar_position: 1
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# add_user()

This operation adds an existing user to the current role. Once added, the user gets permissions allowed for the current role and can perform certain operations.

## Request Syntax{#request-syntax}

```python
add_user(
    username: str
)
```

**PARAMETERS:**

- **username** (*str*) -

    **[REQUIRED]**

    The name of the user to add to a role.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import Role, utility

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

The following operations are related to `add_user()`:

- [get_users()](./Role-get_users)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

