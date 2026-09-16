---
title: "create_user() | Python | MilvusClient"
slug: /python/python/Authentication-create_user
sidebar_label: "create_user()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、パスワードを使用してユーザーを作成します。 | Python | MilvusClient"
type: docx
token: EglSdm1jkozDSlxq6SEc4CRonVe
sidebar_position: 4
keywords: 
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - 次元削減
  - zilliz
  - zilliz cloud
  - クラウド
  - create_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_user()

この操作は、パスワードを使用してユーザーを作成します。

## リクエスト構文\{#request-syntax}

```python
create_user(
    user_name: str,
    password: str,
    timeout: Optional[float] = None
) -> None
```

**PARAMETERS:**

- **user_name** (*str*) -

    **[REQUIRED]**

    作成するユーザーの名前。

- **password** (*str*) -

    **[REQUIRED]**

    ユーザーのパスワード。

- **timeout** (*float*) -

    この操作のタイムアウト時間。

**RETURN TYPE:**

*None*

この操作は値を返しません。

**EXCEPTIONS:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

- **ParamError**

    この例外は、パラメーター値が無効な場合にスローされます。

## 例\{#examples}

```python
client.create_user(
    user_name="analyst_user",
    password="P@ssw0rd!",
)
```
