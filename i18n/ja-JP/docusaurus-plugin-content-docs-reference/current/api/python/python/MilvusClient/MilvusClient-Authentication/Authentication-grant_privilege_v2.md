---
title: "grant_privilege_v2() | Python | MilvusClient"
slug: /python/python/Authentication-grant_privilege_v2
sidebar_label: "grant_privilege_v2()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された権限または権限グループを指定されたロールに付与します。 | Python | MilvusClient"
type: docx
token: EiTMdIbTgoc9vVxDHUQc1zPpnch
sidebar_position: 11
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - grant_privilege_v2()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# grant_privilege_v2()

この操作は、指定された権限または権限グループを指定されたロールに付与します。

## リクエスト構文\{#request-syntax}

```python
grant_privilege_v2(
    self,
    role_name: str,
    privilege: str,
    collection_name: str,
    db_name: Optional[str] = None,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**パラメータ:**

- **role_name** (*str*) -

    **[REQUIRED]**

    権限を割り当てるロールの名前。

- **privilege** (*str*) -

    **[REQUIRED]**

    割り当てる権限の名前。 

    詳細については、[Users and Roles](https://milvus.io/docs/users_and_roles.md) ページの表にある **Privilege name** 列を参照してください。

- **collection_name** (*str*) - 

    **[REQUIRED]**

    コレクションの名前。現在のデータベース内のすべてのコレクションに関する権限を付与するには、このパラメータを `*` に設定します。 

- **db_name** (*str*) -

    データベースの名前。 

    このパラメータは任意です。このパラメータを設定すると、権限の割り当ては指定されたデータベース内に制限されます。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着した時点、または何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生すると、この例外が発生します。

- **BaseException**

    この操作が失敗すると、この例外が発生します。

## 例\{#example}

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
```

