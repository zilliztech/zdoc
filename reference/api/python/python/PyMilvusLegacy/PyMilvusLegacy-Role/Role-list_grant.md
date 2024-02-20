---
displayed_sidbar: pythonSidebar
slug: /python/Role-list_grant
beta: false
notebook: false
token: JXNXdQuwhoYmZQxSohNcdxtwnzh
sidebar_position: 7
---

import Admonition from '@theme/Admonition';


# list_grant()

This operation lists the relationship between the current role and the specified object.

```python
pymilvus.Role.list_grant(
    object: str,
    object_name: str,
    db_name: str
)
```

The following operations are related to `get_replicas()`:

- Role

- grant()

- list_grants()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Role

# Get an existing role
role=Role(name="string")

# List the relationship between the current role and the specified object.
res=list_grant(
    object="string",
    object_name="string",
    db_name="str"
)
```

__PARAMETERS:__

- __object__ (_str_)

    __[REQUIRED]__

    The type of the object to grant the privilege.

    The value is case-sensitive. For details, refer to Users & Roles.

- __object_name__ (_str_)

    __[REQUIRED]__

    The name of a target object of the type specified in __object__.

    It can be a collection name, a user name, or a wild card (*).

- __db_name__ (_str_)

    The name of a database the object belongs to. If left unspecified, the default database applies.

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

A __GrantItem__ object contains the following fields:

- __object__ (_str_)

    The type of the object to which the privilege belongs.

- __object_name__ (_str_)

    The name of the object to which the role is granted the specified privilege.

- __role_name__ (_str_)

    The name of the role to check.

- __grantor_name__ (_str_）

    The name of the user who granted a specific role to a user.

- __privilege__ (_str_)

    The privilege that is granted to the role.

- __db_name__ (str)

    The name of the database in which this operation has been executed.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import Role

# Get an existing role
role = Role(name="root")

# List the relationship between the current role and the specified object.
res = list_grant(
    object="Collection",
    object_name="test_collection",
    db_name="test_db"
)
```

