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
  - Milvus lite
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

## Request Syntax\{#request-syntax}

```python
describe_user(
    user_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> dict
```

**PARAMETERS:**

- **user_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  説明対象のユーザーアカウント名。

- **timeout** (*Optional[float]*) -<br/>
  デフォルト: `None`<br/>
  RPC の完了を待機する最大時間（秒）。

- **kwargs** (*Any*) -<br/>
  追加のリクエストコンテキストオプション。

**RETURN TYPE:**

*dict*

**RETURNS:**

`user_name`、`roles`、`description` を含む辞書。ユーザーが見つからない場合は空の辞書を返します。

- **user_name** (*str*) -<br/>
  説明されたユーザーアカウントの名前。

- **roles** (*list[str]*) -<br/>
  ユーザーアカウントに割り当てられたロール。

- **description** (*str*) -<br/>
  ユーザーアカウントに保存されている説明。

**EXCEPTIONS:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## Examples\{#examples}

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
