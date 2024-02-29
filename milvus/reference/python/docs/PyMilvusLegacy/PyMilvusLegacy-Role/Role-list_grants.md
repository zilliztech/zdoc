---
displayed_sidbar: pythonSidebar
slug: /python/Role-list_grants
beta: false
notebook: false
type: docx
token: YRoGdgQmWoIEaJx84ICcHTILnMe
sidebar_position: 8
---

import Admonition from '@theme/Admonition';


# list_grants()

This operation lists all privileges granted to the current role.

## Request Syntax{#request-syntax}

```python
list_grants(
    db_name: str
)
```

__PARAMETERS:__

- __db_name__ (_str_)

    The name of a database in which Milvus carries out this operation.

    If the specified database does not exist, an empty result returns.

__RETURN TYPE:__

_GrantInfo_

__RETURNS:__

A __GrantInfo__ object that contains a list of __GrantItem__ objects.

```python
├── GrantInfo
│   └── groups  
│       └── GrantItem
│           ├── object
│           ├── object_name
│           ├── role_name
│           ├── grantor_name
│           ├── privilege
│           └── db_name
```

The __GrantItem__ objects contains the following fields:

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(name="root")

# List all privileges granted to the current role.
res = list_grants(
    db_name="test_db"
)
```

## Related operations{#related-operations}

The following operations are related to `get_replicas()`:

- [add_user()](./Role-add_user)

- [create()](./Role-create)

- [drop()](./Role-drop)

- [get_users()](./Role-get_users)

- [grant()](./Role-grant)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [remove_user()](./Role-remove_user)

- [revoke()](./Role-revoke)

