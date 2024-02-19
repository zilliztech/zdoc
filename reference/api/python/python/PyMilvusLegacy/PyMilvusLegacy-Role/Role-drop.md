---
displayed_sidbar: pythonSidebar
slug: /python/Role-drop
beta: false
notebook: false
token: KEzNdJPoDoHOjlx2FC8cNcHqngg
sidebar_position: 9
---

import Admonition from '@theme/Admonition';


# drop()

This operation drops an existing role. The operation will succeed if the specified role exists. Otherwise, this operation will fail.

```python
pymilvus.Role.drop()
```

The following operations are related to `drop()`:

- Role

- create()

- grant()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Role

# Specify the name of the role
role = Role(role_name="string")

# Drop the specified role
role.drop()
```

**PARAMETERS:**

N/A

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

