---
displayed_sidbar: pythonSidebar
slug: /python/Authentication-describe_role
beta: false
notebook: false
type: docx
token: JJz3dFrE2oJP3AxySWYcJlf4nMh
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# describe_role()

This operation describes a specific role.

## Request syntax{#request-syntax}

```python
describe_role(
    role_name: str,
    timeout: Optional[float] = None
) -> List[Dict]
```

__PARAMETERS:__

- __role_name__ (_str_) -

    __[REQUIRED]__

    The name of the role to describe.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. 

    Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_list_

__RETURNS:__

A list of dictionaries containing the permissions assigned to the role. The structure of each dictionary reassembles the following:

```python
#  {
#      'object_type': str, 
#      'object_name': str, 
#      'db_name': str, 
#      'role_name': str, 
#      'privilege': str, 
#      'grantor_name': str
#  }
```

__PARAMETERS:__

- __object_type__ (_str_) -

    The type of the resource object granted to the role. 

    Possible values are __Collection__, __Global__, and __User__.

- __object_name__ (_str_) -

    The name of the resource object granted to the role. You are advised to use an asterisk (*).

- __db_name__ (_str_) -

    The name of the database to which the role has access.

- __role_name__ (_str_) -

    The name of the specified role.

- __privilege__ (_str_) -

    The name of a privilege granted to the role. For details, refer to [Users & Roles](https://milvus.io/docs/users_and_roles.md) for more.

- __grantor_name__ (_str_) - 

    The name of the user who has granted the above permission to the specified role.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

- __BaseException__

    This exception will be raised when this operation fails.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Describe the role
client.describe_role(role_name="db_ro")

# [
#     {
#         "object_type": "Collection",
#         "object_name": "*",
#         "db_name": "default",
#         "role_name": "db_ro",
#         "privilege": "GetLoadState",
#         "grantor_name": "zcloud_root"
#     },
#     {
#         "object_type": "Collection",
#         "object_name": "*",
#         "db_name": "default",
#         "role_name": "db_ro",
#         "privilege": "GetLoadingProgress",
#         "grantor_name": "zcloud_root"
#     },
#     {
#         "object_type": "Collection",
#         "object_name": "*",
#         "db_name": "default",
#         "role_name": "db_ro",
#         "privilege": "IndexDetail",
#         "grantor_name": "zcloud_root"
#     },
#     ...
#     {
#         "object_type": "Global",
#         "object_name": "*",
#         "db_name": "default",
#         "role_name": "db_ro",
#         "privilege": "ListDatabases",
#         "grantor_name": "zcloud_root"
#     },
#     {
#         "object_type": "Global",
#         "object_name": "*",
#         "db_name": "default",
#         "role_name": "db_ro",
#         "privilege": "ShowCollections",
#         "grantor_name": "zcloud_root"
#     }
# ]
```

<Admonition type="info" icon="📘" title="Notes">

<p>Each Zilliz Cloud cluster has three built-in roles, namely, <strong>db_ro</strong>, <strong>db_rw</strong>, and <strong>db_admin</strong>. For details, refer to <a href="/docs/user-roles#cluster-built-in-roles">Cluster Built-in Roles</a>.</p>

</Admonition>

## Related methods{#related-methods}

- [grant_role()](./Authentication-grant_role)

- [list_roles()](./Authentication-list_roles)

- [revoke_role()](./Authentication-revoke_role)

