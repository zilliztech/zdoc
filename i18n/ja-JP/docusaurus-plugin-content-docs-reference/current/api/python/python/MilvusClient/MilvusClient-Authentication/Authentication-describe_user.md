---
title: "describe_user() | Python | MilvusClient"
slug: /python/python/Authentication-describe_user
sidebar_label: "describe_user()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "ユーザーアカウントに関連付けられた `roles` と `description` を返します。ユーザーが存在しない場合は空の辞書を返します。 | Python | MilvusClient"
type: docx
token: TwTnduPOioywHDx8hPQc80tRnKg
sidebar_position: 6
keywords: 
  - Milvus とは
  - Milvus データベース
  - Milvus Lite
  - Milvus ベンチマーク
  - zilliz
  - zilliz cloud
  - クラウド
  - describe_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_user()

ユーザーアカウントに関連付けられた `roles` と `description` を返します。ユーザーが存在しない場合は空の辞書を返します。

## リクエスト構文\{#request-syntax}

```python
describe_user(
    user_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> dict
```

**パラメータ:**

- **user_name** (*str*) -
**[REQUIRED]**
説明するユーザーアカウントの名前。

- **timeout** (*Optional[float]*) -
デフォルト: `None`
RPC の完了を待機する最大時間（秒単位）。

- **kwargs** (*Any*) -
追加のリクエストコンテキストオプション。

**戻り値の型:**

*dict*

**戻り値:**

`user_name`、`roles`、および `description` を含む辞書。ユーザーが見つからない場合は空の辞書を返します。

- **user_name** (*str*) -
説明対象のユーザーアカウントの名前。

- **roles** (*list[str]*) -
ユーザーアカウントに割り当てられたロール。

- **description** (*str*) -
ユーザーアカウントに保存されている説明。

**例外:**

- **MilvusException**
サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")
user = client.describe_user("analyst")
print(user)
# {
#     "user_name": "analyst",
#     "roles": ["read_only"],
#     "description": "Analytics account",
# }
```
