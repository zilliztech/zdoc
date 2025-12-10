---
title: "revoke_privilege_v2() | Python | MilvusClient"
slug: /python/python/Authentication-revoke_privilege_v2
sidebar_label: "revoke_privilege_v2()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation revokes the specified privilege or privilege group from the specified role. | Python | MilvusClient"
type: docx
token: WazKdTlcOoYoBWxIJEEc7gFMnfC
sidebar_position: 18
keywords: 
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - zilliz
  - zilliz cloud
  - cloud
  - revoke_privilege_v2()
  - pymilvus26
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# revoke_privilege_v2()

This operation revokes the specified privilege or privilege group from the specified role.

## Request Syntax\{#request-syntax}

```python
revoke_privilege_v2(
    self,
    role_name: str,
    privilege: str,
    collection_name: str,
    db_name: Optional[str] = None,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **role_name** (*str*) -

    **[REQUIRED]**

    The name of the role to revoke privileges from.

- **privilege** (*str*) -

    **[REQUIRED]**

    The name of the privilege to revoke. 

    For details, refer to the **Privilege name** column in the table on page [Users and Roles](https://milvus.io/docs/users_and_roles.md).

- **collection_name** (*str*) - 

    **[REQUIRED]**

    The name of a collection. To revoke privileges regarding all collections in the current database, set this parameter to `*`. 

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

## Example\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 1. Prepare a privilege group
client.create_privilege_group(
    group_name="my_privilege_group"
)

client.add_privileges_to_group(
    group_name="my_privilege_group",
    privileges=["ListDatabases", "DescribeDatabase"]
) 

# 2. Create a role
client.create_role(role_name="read_only")

# 3. Grant privileges
client.grant_privilege_v2(
    role_name="db_read_only",
    privilege="my_privilege_group",
    collection_name="*"
)

# 4. Revoke privileges
client.rovke_privilege_v2(
    role_name="db_read_only",
    privilege="my_privilege_group",
    collection_name="*"
)
```

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 1. Prepare a privilege group
client.create_privilege_group(
    group_name="my_privilege_group"
)

client.add_privileges_to_group(
    group_name="my_privilege_group",
    privileges=["ListDatabases", "DescribeDatabase"]
) 

# 2. Create a role
client.create_role(role_name="read_only")

# 3. Grant privileges
client.grant_privilege_v2(
    role_name="db_read_only",
    privilege="my_privilege_group",
    collection_name="*"
)

# 4. Revoke privileges
client.rovke_privilege_v2(
    role_name="db_read_only",
    privilege="my_privilege_group",
    collection_name="*"
)
```

