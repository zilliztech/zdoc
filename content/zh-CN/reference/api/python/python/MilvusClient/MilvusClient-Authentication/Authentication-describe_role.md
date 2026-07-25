---
title: "describe_role() | Python | MilvusClient"
slug: /python/python/Authentication-describe_role
sidebar_key: python/Authentication-describe_role
sidebar_label: "describe_role()"
added_since: v2.3.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation describes a specific role. | Python | MilvusClient"
type: docx
token: JJz3dFrE2oJP3AxySWYcJlf4nMh
sidebar_position: 5
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - describe_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# describe_role()

This operation describes a specific role.

## Request syntax\{#request-syntax}

```python
describe_role(
    role_name: str,
    timeout: Optional[float] = None
) -> List[Dict]
```

**PARAMETERS:**

- **role_name** (*str*) -

    **[REQUIRED]**

    The name of the role to describe.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*list*

**RETURNS:**

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

**PARAMETERS:**

- **object_type** (*str*) -

    The type of the resource object granted to the role. 

    Possible values are **[Collection](./ORM-Collection)**, **Global**, and **User**.

- **object_name** (*str*) -

    The name of the resource object granted to the role. You are advised to use an asterisk (*).

- **db_name** (*str*) -

    The name of the database to which the role has access.

- **role_name** (*str*) -

    The name of the specified role.

- **privilege** (*str*) -

    The name of a privilege granted to the role. For details, refer to [Users & Roles](https://milvus.io/docs/users_and_roles.md) for more.

- **grantor_name** (*str*) - 

    The name of the user who has granted the above permission to the specified role.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

- **BaseException**

    This exception will be raised when this operation fails.

## Example\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.ali-cn-hangzhou.zillizcloud.com:19530",
    token="user:password"
)

# 2. Describe the role
client.describe_role(role_name="db_ro")

# Output
#
# {
#     "role": "db_ro",
#     "privileges": [
#         {
#             "object_type": "Collection",
#             "object_name": "*",
#             "db_name": "default",
#             "role_name": "db_ro",
#             "privilege": "GetLoadState",
#             "grantor_name": "*"
#         },
#         {
#             "object_type": "Collection",
#             "object_name": "*",
#             "db_name": "default",
#             "role_name": "db_ro",
#             "privilege": "GetLoadingProgress",
#             "grantor_name": "*"
#         },
#         {
#             "object_type": "Collection",
#             "object_name": "*",
#             "db_name": "default",
#             "role_name": "db_ro",
#             "privilege": "IndexDetail",
#             "grantor_name": "*"
#         },
#         {
#             "object_type": "Collection",
#             "object_name": "*",
#             "db_name": "default",
#             "role_name": "db_ro",
#             "privilege": "Load",
#             "grantor_name": "*"
#         },
#         {
#             "object_type": "Collection",
#             "object_name": "*",
#             "db_name": "default",
#             "role_name": "db_ro",
#             "privilege": "Query",
#             "grantor_name": "*"
#         },
#         {
#             "object_type": "Collection",
#             "object_name": "*",
#             "db_name": "default",
#             "role_name": "db_ro",
#             "privilege": "Search",
#             "grantor_name": "*"
#         },
#         {
#             "object_type": "Global",
#             "object_name": "*",
#             "db_name": "default",
#             "role_name": "db_ro",
#             "privilege": "DescribeCollection",
#             "grantor_name": "*"
#         },
#         {
#             "object_type": "Global",
#             "object_name": "*",
#             "db_name": "default",
#             "role_name": "db_ro",
#             "privilege": "ListDatabases",
#             "grantor_name": "*"
#         },
#         {
#             "object_type": "Global",
#             "object_name": "*",
#             "db_name": "default",
#             "role_name": "db_ro",
#             "privilege": "ShowCollections",
#             "grantor_name": "*"
#         }
#     ]
# }
```

<Admonition type="info" icon="📘" title="Notes">

Each Zilliz Cloud cluster has three built-in roles, namely, **db\_ro**, **db\_rw**, and **db\_admin**. For details, refer to [Cluster Built-in Roles](/docs/cluster-roles#built-in-cluster-roles).

</Admonition>

