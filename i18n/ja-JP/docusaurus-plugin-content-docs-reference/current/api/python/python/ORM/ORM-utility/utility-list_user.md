---
title: "list_user() | Python | ORM"
slug: /python/python/utility-list_user
sidebar_label: "list_user()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のユーザーの情報を一覧表示します。 | Python | ORM"
type: docx
token: JeG6d5Sg2oPmXPxEhnyciq4snNd
sidebar_position: 28
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - list_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_user()

この操作は、特定のユーザーの情報を一覧表示します。

## リクエスト構文\{#request-syntax}

```python
list_user(
    username: str,
    include_role_info: bool,
    using: str,
    timeout: float | None
)
```

**パラメーター**

- **username** (*string*) - 

    **[REQUIRED]**

    一覧表示するユーザーの名前。

- **include_role_info** (*bool*) - 

    **[REQUIRED]**

    Zilliz Cloud が指定されたユーザーに付与されているロールを一覧表示するかどうか。

- **using** (*string*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、レスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*UserInfo*

**戻り値:**

ユーザー情報を含む **UserInfo** オブジェクト。

```python
├── UserInfo
│   └── groups  
│       └── UserItem
│           ├── username
│           ├── roles
```

**UserItem** オブジェクトには、以下のフィールドが含まれます。

- **username** (*str*)

    ユーザーの名前。

- **roles** (*str*)

    ユーザーに割り当てられたロール。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生すると、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import connections, Role, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# List the information of a specific user
users = utility.list_user(
    username="admin", 
    include_role_info=True,
    using="default"
)

# UserInfo groups:
# - UserItem: <username:admin>, <roles:('admin',)>
```

## 関連操作\{#related-operations}

以下の操作は `list_user()` に関連しています。

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

