---
title: "list_roles() | Python | ORM"
slug: /python/python/utility-list_roles
sidebar_label: "list_roles()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のすべてのロールに関する情報を一覧表示します。 | Python | ORM"
type: docx
token: ClLXdDs64oixJBxlIrCcEB2dngb
sidebar_position: 27
keywords: 
  - managed milvus
  - Serverless vector database
  - milvus open source
  - Milvus はどのように動作するか
  - zilliz
  - zilliz cloud
  - cloud
  - list_roles()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_roles()

この操作は、既存のすべてのロールに関する情報を一覧表示します。

## リクエスト構文\{#request-syntax}

```python
list_roles(
    include_user_info: bool,
    using: str,
    timeout: float | None
)
```

**パラメータ:**

- **include_user_info** (*bool*) - 

    **[必須]**

    一覧表示されるロールに関連付けられたユーザーを Zilliz Cloud が一覧表示するかどうかを指定します。

- **using** (*str*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかの応答が到着したとき、または何らかのエラーが発生したときにこの操作がタイムアウトすることを示します。

**戻り値の型:**

*RoleInfo*

**戻り値:**

**RoleItem** オブジェクトのリストを含む **RoleInfo** オブジェクト。

```python
├── RoleInfo
│   └── groups  
│       └── RoleItem
│           ├── role_name
│           ├── users
```

**RoleItem** オブジェクトには、次のフィールドが含まれます。

- **role_name** (*str*)

    ロールの名前です。

- **users** (*str*)

    ロールが付与されているユーザーです。

**例外:**

- **MilvusException**

    この操作の実行中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import connections, Role, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a user
user = utility.create_user(user="admin", password="123456")

# Create a role
role=Role(
    name="admin",
)

role.create()

# Add the user to the role
role.add_user(username="admin")

# List role information
utility.list_roles(include_user_info=True)

# RoleInfo groups:
# - RoleItem: <role_name:admin>, <users:('admin',)>
# - RoleItem: <role_name:public>, <users:()>
```

## 関連する操作\{#related-operations}

以下の操作は `list_roles()` に関連しています

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

