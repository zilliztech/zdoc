---
title: "list_users() | Python | ORM"
slug: /python/python/utility-list_users
sidebar_label: "list_users()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のすべてのユーザーの情報を一覧表示します。 | Python | ORM"
type: docx
token: MtF2dkZcso4XduxM194cUaiinqb
sidebar_position: 30
keywords: 
  - ベクトル検索
  - 音声類似検索
  - Elastic ベクトルデータベース
  - Pinecone と Milvus の比較
  - zilliz
  - zilliz cloud
  - クラウド
  - list_users()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_users()

この操作は、既存のすべてのユーザーの情報を一覧表示します。

## Request Syntax\{#request-syntax}

```python
list_users(
    include_role_info: bool,
    using: str,
    timeout: float | None
)
```

**PARAMETERS**

- **include_role_info** (*bool*) - 

    **[REQUIRED]**

    Zilliz Cloud が指定されたユーザーに付与されたロールを一覧表示するかどうか。

- **using** (*string*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*UserInfo*

**RETURNS:**

ユーザー情報を含む **UserInfo** オブジェクト。

```python
├── UserInfo
│   └── groups  
│       └── UserItem
│           ├── username
│           ├── roles
```

**UserItem** オブジェクトには以下のフィールドが含まれます。

- **username** (*str*)

    ユーザー名。

- **roles** (*str*)

    ユーザーに割り当てられたロール。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生すると、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# List the information of all existing users
user = utility.list_users(
    include_role_info=True,
    using="default"
)

# UserInfo groups:
# - UserItem: <username:admin>, <roles:('admin',)>
# - UserItem: <username:root>, <roles:()>
```

## Related operations\{#related-operations}

以下の操作は `list_users()` に関連しています。

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

