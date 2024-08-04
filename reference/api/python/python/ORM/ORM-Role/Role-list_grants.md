---
displayed_sidbar: pythonSidebar
title: "list_grants() | Python | ORM"
slug: /python/python/Role-list_grants
sidebar_label: "list_grants()"
beta: false
notebook: false
description: "This operation lists all privileges granted to the current role. | Python | ORM"
type: docx
token: YRoGdgQmWoIEaJx84ICcHTILnMe
sidebar_position: 8
displayed_sidebar: pythonSidebar

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

**PARAMETERS:**

- **db_name** (*str*)

    The name of a database in which Zilliz Cloud carries out this operation.

    If the specified database does not exist, an empty result returns.

**RETURN TYPE:**

*GrantInfo*

**RETURNS:**

A **GrantInfo** object that contains a list of **GrantItem** objects.

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

The **GrantItem** objects contains the following fields:

**EXCEPTIONS:**

- **MilvusException**

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

- [get_users()](./Role-get_users)

- [is_exist()](./Role-is_exist)

- [list_grant()](./Role-list_grant)

- [remove_user()](./Role-remove_user)

