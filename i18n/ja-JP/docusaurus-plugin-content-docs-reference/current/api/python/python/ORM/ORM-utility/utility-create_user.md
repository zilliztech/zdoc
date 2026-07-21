---
title: "create_user() | Python | ORM"
slug: /python/python/ORM-utility/utility-create_user
sidebar_label: "create_user()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、対応するパスワードを持つ新しいユーザーを作成します。 | Python | ORM"
type: docx
token: N44ndTSrgoEBx7xCID5cXRS7n1c
sidebar_position: 5
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - create_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# create_user()

この操作は、対応するパスワードを持つ新しいユーザーを作成します。

## Request Syntax\{#request-syntax}

```python
create_user(
    user: str,
    password: str,
    using: str,
    timeout: float | None
)
```

```python
from pymilvus import utility

# Create a new user
utility.create_user(
    user="string",
    password="string",
    using="default"
)
```

**PARAMETERS:**

- **user** (*string*) - 

    **[REQUIRED]**

    作成する新しいユーザーの名前。値は英字で始まる必要があり、アンダースコア、文字、数字のみを含めることができます。

- **password** (*string*) - 

    **[REQUIRED]**

    作成する新しいユーザーに対応するパスワード。 

    パスワードは 8 ～ 64 文字の文字列である必要があり、次の文字種のうち少なくとも 3 種類を含める必要があります: 大文字、小文字、数字、特殊文字。

- **using** (*string*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

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
```

## Related operations\{#related-operations}

以下の操作は `create_user()` に関連しています

- [Role](./ORM-Role)

- [delete_user()](./utility-delete_user)

- [list_roles()](./utility-list_roles)

- [list_user()](./utility-list_user)

- [list_users()](./utility-list_users)

- [list_usernames()](./utility-list_usernames)

- [reset_password()](./utility-reset_password)

- [update_password()](./utility-update_password)

