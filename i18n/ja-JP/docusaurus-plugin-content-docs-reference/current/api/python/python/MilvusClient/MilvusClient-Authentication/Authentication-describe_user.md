---
title: "describe_user() | Python | MilvusClient"
slug: /python/python/Authentication-describe_user
sidebar_label: "describe_user()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ユーザーに割り当てられたロールとユーザーの説明を返します。 | Python | MilvusClient"
type: docx
token: TwTnduPOioywHDx8hPQc80tRnKg
sidebar_position: 6
keywords: 
  - Milvus とは
  - Milvus database
  - Milvus lite
  - Milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - describe_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_user()

この操作は、ユーザーに割り当てられたロールとユーザーの説明を返します。

## リクエスト構文\{#request-syntax}

```python
describe_user(
    user_name: str,
    timeout: Optional[float] = None
) -> dict
```

**パラメータ:**

- **user_name** (*str*) -

    **[REQUIRED]**

    説明を取得するユーザーの名前。

- **timeout** (*float*) -

    この操作のタイムアウト時間。

**戻り値の型:**

*dict*

`user_name`、`roles`、`description` を含む辞書。

**例外:**

- **MilvusException**

    この操作中にエラーが発生した場合に送出される例外です。

- **ParamError**

    パラメータの値が無効な場合に送出される例外です。

## 例\{#examples}

```python
user_info = client.describe_user(user_name="analyst_user")
print(user_info["roles"])
print(user_info["description"])
```
