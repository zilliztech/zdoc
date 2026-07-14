---
title: "list_users() | Python | MilvusClient"
slug: /python/python/Authentication-list_users
sidebar_label: "list_users()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のすべてのユーザー名を一覧表示します。 | Python | MilvusClient"
type: docx
token: EZ2YdBHoDoRTlxx91tscffm1nSb
sidebar_position: 15
keywords: 
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - zilliz
  - zilliz cloud
  - cloud
  - list_users()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_users()

この操作は、既存のすべてのユーザー名を一覧表示します。

## リクエスト構文\{#request-syntax}

```python
list_users(
    timeout: Optional[float] = None
) -> List
```

**パラメータ:**

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、いずれかのレスポンスが到着するか、いずれかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*list*

**戻り値:**

ユーザー名のリスト。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生すると、この例外が発生します。

- **BaseException**

    この操作が失敗した場合、この例外が発生します。

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

# 3. List all users
client.list_users()

# ['db_admin', 'user_1']
```

## 関連メソッド\{#related-methods}

- [create_user()](./Authentication-create_user)

- [describe_user()](./Authentication-describe_user)

- [drop_user()](./Authentication-drop_user)

- [update_password()](./Authentication-update_password)

