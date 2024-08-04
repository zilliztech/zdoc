---
displayed_sidbar: pythonSidebar
title: "revoke_privileges() | Python | MilvusClient"
slug: /python/python/Authentication-revoke_privileges
sidebar_label: "revoke_privileges()"
beta: false
notebook: false
description: "This operation revokes a privilege already assigned to a role. | Python | MilvusClient"
type: docx
token: UP2GdfHHzoIQ56x2JvScs0sAnzh
sidebar_position: 11
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# revoke_privileges()

This operation revokes a privilege already assigned to a role.

## Request syntax{#request-syntax}

```python
revoke_privilege(
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

    The name of the role to revoke privileges from.

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

    This parameter is optional. Setting this parameter restricts the privilege revocation within the specified database.

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
    
# 4. Revoke privilege
client.revoke_privilege(
    role_name="read_only",
    object_type="Global",
    privilege="*",
    object_name="DescribeCollection"
)
```

## Related methods{#related-methods}

- [create_role()](./Authentication-create_role)

- [describe_role()](./Authentication-describe_role)

- [drop_role()](./Authentication-drop_role)

- [grant_privilege()](./Authentication-grant_privilege)

- [grant_role()](./Authentication-grant_role)

- [list_roles()](./Authentication-list_roles)

- [revoke_role()](./Authentication-revoke_role)

