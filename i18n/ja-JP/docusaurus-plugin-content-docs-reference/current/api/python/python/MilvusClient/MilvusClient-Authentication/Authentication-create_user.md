---
title: "create_user() | Python | MilvusClient"
slug: /python/python/Authentication-create_user
sidebar_label: "create_user()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作はユーザーを作成します。 | Python | MilvusClient"
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

この操作はユーザーを作成します。

## リクエスト構文\{#request-syntax}

```python
create_user(
    user_name: str,
    password: str,
    timeout: Optional[float] = None,
    description: Optional[str] = None,
    **kwargs
)
```

**パラメーター:**

- **user_name** (*str*) -

    **[必須]**

    作成するユーザーの名前です。

- **password** (*str*) -

    **[必須]**

    作成するユーザーのパスワードです。

- **description** (*Optional[str]*) -

    作成するユーザーの説明です。

- **timeout** (*float | None*) -

    この操作のタイムアウト期間です。これを None に設定すると、応答が到着した場合またはエラーが発生した場合に、この操作がタイムアウトすることを示します。

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合にスローされます。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)
client.create_user(
    user_name="alice",
    password="P@ssw0rd",
    description="Analytics team",
)
```
