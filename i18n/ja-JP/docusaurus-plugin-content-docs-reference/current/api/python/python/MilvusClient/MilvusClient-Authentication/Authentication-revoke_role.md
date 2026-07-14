---
title: "revoke_role() | Python | MilvusClient"
slug: /python/python/Authentication-revoke_role
sidebar_label: "revoke_role()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ユーザーに割り当てられたロールを取り消します。 | Python | MilvusClient"
type: docx
token: JJOId59ePoMLefxz1ChcBZ6inOh
sidebar_position: 19
keywords: 
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - revoke_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# revoke_role()

この操作は、ユーザーに割り当てられたロールを取り消します。

## リクエスト構文\{#request-syntax}

```python
revoke_role(
    user_name: str,
    role_name: str,
    timeout: Optional[float] = None
) -> None
```

**パラメータ:**

- **user_name** (*str*) -

    **[必須]**

    既存のユーザーの名前です。

- **role_name** (*str*) -

    **[必須]**

    取り消すロールの名前です。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

- **BaseException**

    この操作が失敗した場合に、この例外が発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a user
client.create_user(user_name="user_1", password="P@ssw0rd")

# 3. Grant the role to the user
client.grant_role(user_name="user_1", role_name="db_ro")

# 4. Revoke the role from the user
client.revoke_role(user_name="user_1", role_name="db_ro")
```

