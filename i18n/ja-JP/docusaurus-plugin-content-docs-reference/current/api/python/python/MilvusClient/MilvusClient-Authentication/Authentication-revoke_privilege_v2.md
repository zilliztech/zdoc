---
title: "revoke_privilege_v2() | Python | MilvusClient"
slug: /python/python/Authentication-revoke_privilege_v2
sidebar_label: "revoke_privilege_v2()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたロールから指定された権限または権限グループを取り消します。 | Python | MilvusClient"
type: docx
token: WazKdTlcOoYoBWxIJEEc7gFMnfC
sidebar_position: 18
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - revoke_privilege_v2()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# revoke_privilege_v2()

この操作は、指定されたロールから指定された権限または権限グループを取り消します。

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

    権限を取り消す対象のロール名。

- **privilege** (*str*) -

    **[REQUIRED]**

    取り消す権限の名前。 

    詳細については、[Users and Roles](https://milvus.io/docs/users_and_roles.md) ページの表にある **Privilege name** 列を参照してください。

- **collection_name** (*str*) - 

    **[REQUIRED]**

    collection の名前。現在のデータベース内のすべての collection に関する権限を取り消すには、このパラメータを `*` に設定します。 

- **db_name** (*str*) -

    データベース名。 

    このパラメータは任意です。このパラメータを設定すると、権限の割り当ては指定されたデータベース内に制限されます。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が送出されます。

- **BaseException**

    この操作が失敗した場合、この例外が送出されます。

## Example\{#example}

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

