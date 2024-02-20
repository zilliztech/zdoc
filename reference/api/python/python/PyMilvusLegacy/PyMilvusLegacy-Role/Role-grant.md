---
displayed_sidbar: pythonSidebar
slug: /python/Role-grant
beta: false
notebook: false
token: BapSdVXjQoQXnbxnRYScCagAn1f
sidebar_position: 5
---

import Admonition from '@theme/Admonition';


# grant()

This operation grants a privilege to the current role.

```python
pymilvus.Role.grant(
    object: str,
    object_name: str,
    privilege: str,
    db_name: str
) 
```

The following operations are related to `grant()`:

- Role

- list_grant()

- list_grants()

- revoke()

See also the Python SDK Reference.

## Request Syntax{#request-syntax}

```python
from pymilvus import Role

# Specify the role name
role = Role(
    role_name="string"
)

# Grant privilege to the current role
role.grant(
    object="string",
    object_name="string",
    privilege="string",
    db_name="string"
)
```

__PARAMETERS:__

- __object__ (_string_)

    __[REQUIRED]__

    The type of the object to grant the privilege.

    The value is case-sensitive. For details, refer to Users & Roles.

- __object_name__ (_string_)

    __[REQUIRED]__

    The name of a target object of the type specified in __object__.

    It can be a collection name, a user name, or a wild card (*).

- __privilege__ (_string_)

    __[REQUIRED]__

    The name of the privilege to grant.

    For details, refer to Users & Roles.

    <Admonition type="info" icon="📘" title="Notes">

    <ul>
    <li><p>To grant all privileges to a kind of object, like <strong>Collection</strong>, <strong>Global</strong>, <strong>User</strong>, use <code>*</code> for privilege name.</p></li>
    <li><p>When <code>object</code> is set to <code>Global</code>, setting <code>privilege</code> to <code>*</code> is not equivalent to setting it to <code>All</code>. The <code>All</code> privilege includes all permissions, including any collection and user object.</p></li>
    </ul>

    </Admonition>

- __db_name__ (_string_)

    The name of a database the object belongs to. If left unspecified, the default database applies.

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
role = Role(role_name)

# Grant a privilege to the current role 
role.grant("Collection", collection_name, "Insert")
```

