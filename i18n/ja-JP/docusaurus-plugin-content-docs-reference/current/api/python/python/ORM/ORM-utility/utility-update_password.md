---
title: "update_password() | Python | ORM"
slug: /python/python/utility-update_password
sidebar_label: "update_password()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のユーザーのパスワードを更新します。 | Python | ORM"
type: docx
token: SGjed7w9toewDlxmXHKc7BFancf
sidebar_position: 41
keywords: 
  - ANNS
  - ベクトル検索
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - update_password()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# update_password()

この操作は、特定のユーザーのパスワードを更新します。

## リクエスト構文\{#request-syntax}

```python
update_password(
    user: str,
    old_password: str,
    new_password: str,
    using: str,
    timeout: float | None
)
```

**パラメータ：**

- **user** (*str*) - 

    **[REQUIRED]**

    パスワードをリセットする対象の特定ユーザー。

- **old_password** (*str*) - 

    **[REQUIRED]**

    指定したユーザーの元のパスワード。

    これに誤ったパスワードを設定すると、**MilvusException** が発生します。

- **new_password** (*str*) - 

    **[REQUIRED]**

    指定したユーザーの新しいパスワード。 

    パスワードは 8 ～ 64 文字の文字列である必要があり、次の文字種のうち少なくとも 3 種類を含める必要があります: 大文字、小文字、数字、特殊文字。

- **using** (*string*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型：**

*NoneType*

**戻り値：**

None

**例外：**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が送出されます。

## 例\{#examples}

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a user
user = utility.create_user(user="admin", password="123456")

# Update the password for the user.
update_password(
    user="admin",
    old_password="123456",
    new_password="123456Abc*",
    using="default"
)
```

## 関連する操作\{#related-operations}

以下の操作は `update_password()` に関連しています

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

