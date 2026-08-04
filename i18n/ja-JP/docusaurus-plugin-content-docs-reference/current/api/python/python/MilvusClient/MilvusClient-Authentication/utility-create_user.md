---
title: "create_user() | Python | MilvusClient"
slug: /python/python/utility-create_user
sidebar_label: "create_user()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、パスワード付きのユーザーを作成します。 | Python | MilvusClient"
type: docx
token: EglSdm1jkozDSlxq6SEc4CRonVe
sidebar_position: 4
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


# create_user()

この操作は、パスワード付きのユーザーを作成します。

## リクエスト構文\{#request-syntax}

```python
create_user(
    user_name: str,
    password: str,
    timeout: Optional[float] = None
) -> None
```

**パラメータ:**

- **user_name** (*str*) -

    **[REQUIRED]**

    作成するユーザーの名前。

- **password** (*str*) -

    **[REQUIRED]**

    ユーザーのパスワード。

- **timeout** (*float*) -

    この操作のタイムアウト時間。

**戻り値の型:**

*None*

この操作は値を返しません。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

- **ParamError**

    パラメータ値が無効な場合に、この例外が発生します。

## 例\{#examples}

```python
client.create_user(
    user_name="analyst_user",
    password="P@ssw0rd!",
)
```
