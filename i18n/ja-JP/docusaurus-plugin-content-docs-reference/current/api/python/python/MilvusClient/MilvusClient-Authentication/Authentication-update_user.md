---
title: "update_user() | Python | MilvusClient"
slug: /python/python/Authentication-update_user
sidebar_label: "update_user()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のユーザーの説明を更新します。 | Python | MilvusClient"
type: docx
token: ScbQdPbi5obs0ex85uucaO2Mnzd
sidebar_position: 23
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - zilliz
  - zilliz cloud
  - クラウド
  - update_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# update_user()

この操作は、既存のユーザーの説明を更新します。

## リクエスト構文\{#request-syntax}

```python
update_user(
    user_name: str,
    description: str,
    timeout: Optional[float] = None,
    **kwargs
)
```

**パラメーター:**

- **user_name** (*str*) -

    **[必須]**

    更新するユーザーアカウントの名前です。

- **description** (*str*) -

    **[必須]**

    ユーザーアカウントの新しい説明です。

- **timeout** (*Optional[float]*) -

    RPC が完了するまでの最大待機時間（秒）です。

- **kwargs** (*Any*) -

    追加のリクエストコンテキストオプションです。

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.update_user(
    user_name="alice",
    description="Analytics team",
)
```
