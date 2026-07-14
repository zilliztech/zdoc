---
title: "drop_user() | Python | MilvusClient"
slug: /python/python/Authentication-drop_user
sidebar_label: "drop_user()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はユーザーを削除します。 | Python | MilvusClient"
type: docx
token: WtyZdeFKMoSv5exaYRxcPLCSndg
sidebar_position: 9
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - drop_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_user()

この操作はユーザーを削除します。

## リクエスト構文\{#request-syntax}

```python
drop_user(
    user_name: str,
    timeout: Optional[float] = None
)
```

**パラメータ:**

- **user_name** (*str*) -

    **[必須]**

    削除するユーザーの名前。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

なし

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

# 3. Drop the user
client.drop_user(user_name="user_1")
```

## 関連メソッド\{#related-methods}

- [create_user()](./Authentication-create_user)

- [describe_user()](./Authentication-describe_user)

- [list_users()](./Authentication-list_users)

- [update_password()](./Authentication-update_password)

