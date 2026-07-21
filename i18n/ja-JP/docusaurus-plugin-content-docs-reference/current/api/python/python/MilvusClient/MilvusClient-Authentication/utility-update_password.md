---
title: "update_password() | Python | MilvusClient"
slug: /python/python/utility-update_password
sidebar_label: "update_password()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はユーザーパスワードを更新し、ユーザーの説明も更新できます。 | Python | MilvusClient"
type: docx
token: B4MWdXervo5cC0xBUaVcSiTgnMg
sidebar_position: 20
keywords: 
  - ANNS
  - ベクトル検索
  - knn algorithm
  - HNSW
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

この操作はユーザーパスワードを更新し、ユーザーの説明も更新できます。

## リクエスト構文\{#request-syntax}

```python
update_password(
    user_name: str,
    old_password: str,
    new_password: str,
    reset_connection: Optional[bool] = False,
    timeout: Optional[float] = None,
    description: Optional[str] = None
) -> None
```

**パラメータ:**

- **user_name** (*str*) -

    **[必須]**

    パスワードまたは説明を更新する対象ユーザーの名前です。

- **old_password** (*str*) -

    **[必須]**

    ユーザーの現在のパスワードです。パスワードを変更する際は、`new_password` と一緒に指定します。

- **new_password** (*str*) -

    **[必須]**

    ユーザーの新しいパスワードです。パスワードを変更する際は、`old_password` と一緒に指定します。

- **reset_connection** (*bool*) -

    パスワード更新後に、新しいパスワードでクライアント接続をリセットするかどうかを指定します。

- **timeout** (*float*) -

    この操作のタイムアウト時間です。

- **description** (*str*) -

    ユーザーの新しい説明のオプション値です。

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
client.update_password(
    user_name="analyst_user",
    old_password="P@ssw0rd!",
    new_password="N3wP@ssw0rd!",
    reset_connection=True,
    description="Read-only analyst account",
)
```
