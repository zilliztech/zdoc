---
displayed_sidbar: pythonSidebar
slug: /python/Role-remove_user
beta: false
notebook: false
type: docx
token: SlmSdaD7rocMJsxThNHcOtEknVd
sidebar_position: 9
---

# remove_user()

This operation removes a user from the current role. Once removed, the user will lose the permissions allowed for the current role.

## Request Syntax{#request-syntax}

```python
remove_user(
    username: str
)
```

__PARAMETERS:__

- __username__ (_str_) -

    __[REQUIRED]__

    The name of the user to remove from a role.

__RETURN TYPE:__

_NoneType_

__RETURNS:__

_None_

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(name=role_name)

# Remove the specified user from the current role
role.remove_user(username)

# List all users of the current role
users = role.get_users()
```

## Related operations{#related-operations}

The following operations are related to `add_user()`:

- [add_user()](./Role-add_user)

- [create()](./Role-create)

- [drop()](./Role-drop)

- [get_users()](./Role-get_users)

- [grant()](./Role-grant)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [list_grants()](./Role-list_grants)

- [revoke()](./Role-revoke)

