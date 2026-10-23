---
title: "alter_role() | Python | MilvusClient"
slug: /python/python/Authentication-alter_role
sidebar_label: "alter_role()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のロールの説明を変更します。 | Python | MilvusClient"
type: docx
token: Nz26dTDqnoSqmhxRRK5cUNVunQd
sidebar_position: 21
keywords: 
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - AI チャットボット
  - zilliz
  - zilliz cloud
  - クラウド
  - alter_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_role()

この操作は、既存のロールの説明を変更します。

## リクエスト構文\{#request-syntax}

```python
alter_role(
    role_name: str,
    description: str,
    timeout: Optional[float] = None,
    **kwargs
)
```

**パラメーター:**

- **role_name** (*str*) -

    **[必須]**

    更新するロールの名前です。

- **description** (*str*) -

    **[必須]**

    ロールの新しい説明です。

- **timeout** (*Optional[float]*) -

    RPC の完了を待機する最大時間（秒）です。

- **kwargs** (*Any*) -

    追加のリクエストコンテキストオプションです。

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.alter_role(
    role_name="reader",
    description="Read-only access to collections",
)
```
