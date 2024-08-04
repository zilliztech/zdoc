---
displayed_sidbar: pythonSidebar
title: "grant_privilege() | Python | MilvusClient"
slug: /python/python/Authentication-grant_privilege
sidebar_label: "grant_privilege()"
beta: false
notebook: false
description: "This operation assigns a privilege to a role. | Python | MilvusClient"
type: docx
token: W39Wdr7S6ohrtfxI8r7cyTeInlb
sidebar_position: 7
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# grant_privilege()

This operation assigns a privilege to a role.

## Request syntax{#request-syntax}

```python
grant_privilege(
    role_name: str,
    object_type: str,
    privilege: str,
    object_name: str,
    db_name: Optional[str] = "",
    timeout: Optional[float] = None
) -> None
```

**PARAMETERS:**

- **role_name** (*str*) -

    **[REQUIRED]**

    The name of the role to assign privileges to.

- **object_type** (*str*) -

    **[REQUIRED]**

    The type of the privilege object to assign. 

    Possible values are **Global**, **Collection**, and **User**.

- **privilege** (*str*) -

    **[REQUIRED]**

    The name of the privilege to assign. 

    For details, refer to the **Privilege name** column in the table on page [Users and Roles](https://milvus.io/docs/users_and_roles.md).

- **object_name** (*str*) - 

    **[REQUIRED]**

    The name of the API to assign. 

    You can either use the wildcard (*) to include all applicable APIs in the specified privilege or fill in a specific API. For details, refer to the Relevant API column in the table on page [Users and Roles](https://milvus.io/docs/users_and_roles.md).

- **db_name** (*str*) -

    The name of a database. 

    This parameter is optional. Setting this parameter restricts the privilege assignment within the specified database.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

- **BaseException**

    This exception will be raised when this operation fails.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="http://localhost:19530",
    token="root:Milvus"
)

read_only_privileges = [
  {"object_type": "Global", "object_name": "*", "privilege": "DescribeCollection"},
  {"object_type": "Global", "object_name": "*", "privilege": "ShowCollections"},
  {"object_type": "Collection", "object_name": "*", "privilege": "Search"},
  {"object_type": "Collection", "object_name": "*", "privilege": "Query"},
] 

# 2. Create a role
client.create_role(role_name="read_only")

# 3. Grant privileges
for item in read_only_privileges:
    client.grant_privilege(
        role_name="read_only",
        object_type=item["object_type"],
        privilege=item["privilege"],
        object_name=item["object_name"]
    )
```

## Related methods{#related-methods}

- [create_role()](./Authentication-create_role)

- [describe_role()](./Authentication-describe_role)

- [drop_role()](./Authentication-drop_role)

- [grant_role()](./Authentication-grant_role)

- [list_roles()](./Authentication-list_roles)

- [revoke_privileges()](./Authentication-revoke_privileges)

- [revoke_role()](./Authentication-revoke_role)

