---
displayed_sidbar: pythonSidebar
slug: /python/Role-drop
beta: false
notebook: false
type: docx
token: KEzNdJPoDoHOjlx2FC8cNcHqngg
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# drop()

This operation drops an existing role. The operation will succeed if the specified role exists. Otherwise, this operation will fail.

## Request Syntax{#request-syntax}

```python
drop()
```

__PARAMETERS:__

N/A

__RETURN TYPE:__

_NoneType_

__RETURNS:__

_None_

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import Role, utility

# Create a new role
role = Role(name="test")

role.create()

# List all roles
roles = utility.list_roles(include_user_info=True)

# Output
# RoleInfo groups:
# - RoleItem: <role_name:public>, <users:()>
# - RoleItem: <role_name:test>, <users:()>

# Drop the role
role.drop()

# List all roles
roles = utility.list_roles(include_user_info=True)

# Output
# RoleInfo groups:
# - RoleItem: <role_name:public>, <users:()>
```

## Related operations{#related-operations}

The following operations are related to `drop()`:

- [add_user()](./Role-add_user)

- [create()](./Role-create)

- [get_users()](./Role-get_users)

- [grant()](./Role-grant)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

- [revoke()](./Role-revoke)

