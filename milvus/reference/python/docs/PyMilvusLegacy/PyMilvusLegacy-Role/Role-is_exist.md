---
displayed_sidbar: pythonSidebar
slug: /python/Role-is_exist
beta: false
notebook: false
type: docx
token: F8WOdIoz4okn5OxMEymcXNuRnkb
sidebar_position: 6
---

# is_exist()

This operation checks whether the current role exists.

## Request Syntax{#request-syntax}

```python
is_exist()
```

__PARAMETERS:__

N/A

__RETURN TYPE:__

_bool_

__RETURNS:__

A boolean value indicating whether the current role exists or not

__EXCEPTIONS:__

_None_

## Examples{#examples}

```python
from pymilvus import Role, utility

# Get a role
role = Role(name="test")

# Check whether the role exists
role.is_exist()
```

## Related operations{#related-operations}

The following operations are related to `is_exist()`:

- [add_user()](./Role-add_user)

- [create()](./Role-create)

- [drop()](./Role-drop)

- [get_users()](./Role-get_users)

- [grant()](./Role-grant)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [remove_user()](./Role-remove_user)

- [revoke()](./Role-revoke)

