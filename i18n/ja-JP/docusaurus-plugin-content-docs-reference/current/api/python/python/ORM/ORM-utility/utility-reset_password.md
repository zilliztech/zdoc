---
title: "reset_password() | Python | ORM"
slug: /python/python/utility-reset_password
sidebar_label: "reset_password()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のユーザーのパスワードをリセットします。 | Python | ORM"
type: docx
token: K1Npdj5Ddod6UWxRN2ecf6K4nxf
sidebar_position: 38
keywords: 
  - ベクトルデータベースとは
  - ベクトルデータベースの比較
  - Faiss
  - 動画検索
  - zilliz
  - zilliz cloud
  - クラウド
  - reset_password()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# reset_password()

この操作は、特定のユーザーのパスワードをリセットします。 

<Admonition type="info" icon="📘" title="注意">

この操作は **update_password()** と異なり、新しく設定された認証情報を使用して現在の接続もリセットします。

</Admonition>

## Request Syntax\{#request-syntax}

```python
reset_password(
    user: str,
    old_password: str,
    new_password: str,
    using: str,
    timeout: float | None
)
```

**PARAMETERS:**

- **user** (*str*) - 

    **[REQUIRED]**

    パスワードをリセットする対象の特定のユーザーです。

- **old_password** (*str*) - 

    **[REQUIRED]**

    指定されたユーザーの元のパスワードです。

    これに誤ったパスワードを設定すると、**MilvusException** が発生します。

- **new_password** (*str*) - 

    **[REQUIRED]**

    指定されたユーザーの新しいパスワードです。 

    パスワードは 8 ～ 64 文字の文字列であり、次の文字種のうち少なくとも 3 種類を含む必要があります: 大文字、小文字、数字、特殊文字。

- **using** (*string*) - 

    使用する接続のエイリアスです。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが返るか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import connections, utility

# Connection to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a user
user = utility.create_user(user="admin", password="123456")

# Reset the password for the user.
reset_password(
    user="admin",
    old_password="123456",
    new_password="123456Abc*",
    using="default"
)
```

## Related operations\{#related-operations}

以下の操作は `reset_password()` に関連しています

- [Role](./ORM-Role)

- [create_user()](./utility-create_user)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [update_password()](./utility-update_password)

