---
title: "delete_user() | Python | ORM"
slug: /python/python/utility-delete_user
sidebar_label: "delete_user()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は既存のユーザーを削除します。 | Python | ORM"
type: docx
token: E7zOdU2JpoqaU5xNYXvcAjgPnNh
sidebar_position: 6
keywords: 
  - Vector index
  - オープンソース vector database
  - オープンソース vector db
  - vector database の例
  - zilliz
  - zilliz cloud
  - cloud
  - delete_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# delete_user()

この操作は既存のユーザーを削除します。

## リクエスト構文\{#request-syntax}

```python
delete_user(
    user: str,
    password: str,
    using: str,
    timeout: float | None
)
```

**パラメータ:**

- **user** (*string*) - 

    **[必須]**

    削除する新しいユーザーの名前。

- **password** (*string*) - 

    **[必須]**

    作成する新しいユーザーに対応するパスワード。

    これを誤ったパスワードに設定すると、**MilvusException** が発生します。

- **using** (*string*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

なし

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Delete an existing user
user = utility.delete_user(user="admin", password="123456")
```

## 関連操作\{#related-operations}

以下の操作は `delete_user()` に関連しています

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

