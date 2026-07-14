---
title: "update_password() | Python | MilvusClient"
slug: /python/python/Authentication-update_password
sidebar_label: "update_password()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は特定のユーザーのパスワードを更新します。 | Python | MilvusClient"
type: docx
token: B4MWdXervo5cC0xBUaVcSiTgnMg
sidebar_position: 20
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
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

この操作は特定のユーザーのパスワードを更新します。

## リクエスト構文\{#request-syntax}

```python
update_password(
    user_name: str,
    old_password: str,
    new_password: str,
    reset_connection: Optional[bool] = False,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**パラメータ:**

- **user_name** (*str*) -

    **[必須]**

    既存ユーザーの名前です。

- **old_password** (*str*) -

    **[必須]**

    ユーザーの元のパスワードです。

- **new_password** (*str*) -

    **[必須]**

    ユーザーの新しいパスワードです。

- **reset_connection** (*bool*) -

    新しい認証情報を使用して接続をリセットするかどうかです。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、応答が到着するか何らかのエラーが発生した時点で、この操作はタイムアウトします。

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

# 3. Change the password
client.update_password(
    user_name="user_1",
    old_password="P@ssw0rd",
    new_password="NewP@ssw0rd"
)
```

## 関連メソッド\{#related-methods}

- [create_user()](./Authentication-create_user)

- [describe_user()](./Authentication-describe_user)

- [drop_user()](./Authentication-drop_user)

- [list_users()](./Authentication-list_users)

