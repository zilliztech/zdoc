---
displayed_sidbar: pythonSidebar
slug: /python/Role-create
beta: false
notebook: false
type: docx
token: G3h4d3jx6oXFHBxFZlyc9jLKnTO
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# create()

This operation creates the current role. 

## Request Syntax{#request-syntax}

```python
create()
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

# Get an existing role
role = Role(name="test")

# Create a new role
role.create()

# List all roles
roles = utility.list_roles(include_user_info=True)

# Output
# RoleInfo groups:
# - RoleItem: <role_name:admin>, <users:('admin',)>
# - RoleItem: <role_name:public>, <users:()>
# - RoleItem: <role_name:test>, <users:()>
```

## Related operations{#related-operations}

The following operations are related to `create()`:

- [add_user()](./Role-add_user)

- [drop()](./Role-drop)

- [get_users()](./Role-get_users)

- [grant()](./Role-grant)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

- [revoke()](./Role-revoke)

