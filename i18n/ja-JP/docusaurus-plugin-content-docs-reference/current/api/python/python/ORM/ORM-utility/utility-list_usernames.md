---
title: "list_usernames() | Python | ORM"
slug: /python/python/utility-list_usernames
sidebar_label: "list_usernames()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のすべてのユーザー名を一覧表示します。 | Python | ORM"
type: docx
token: RXi3dgtNYogU0cxmTsgcdT72nsc
sidebar_position: 29
keywords: 
  - milvus とは
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - list_usernames()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_usernames()

この操作は、既存のすべてのユーザー名を一覧表示します。

## リクエスト構文\{#request-syntax}

```python
list_usernames(
    using: str,
    timeout: float | None
)
```

**パラメーター:**

- **using** (*str*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、応答が返るかエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*list*

**戻り値:**

既存のすべてのユーザー名を含むリスト。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# List all existing usernames
users = utility.list_usernames()
```

## 関連する操作\{#related-operations}

以下の操作は `list_usernames()` に関連しています。

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

