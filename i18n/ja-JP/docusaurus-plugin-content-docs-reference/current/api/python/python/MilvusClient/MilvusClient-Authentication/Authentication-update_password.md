---
title: "update_password() | Python | MilvusClient"
slug: /python/python/Authentication-update_password
sidebar_label: "update_password()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定のユーザーのパスワードを更新します。 | Python | MilvusClient"
type: docx
token: ZbGcdPeOZoyFpPxfKwnclTv5ncf
sidebar_position: 20
keywords: 
  - Agentic RAG
  - RAG LLM アーキテクチャ
  - プライベート LLM
  - 最近傍探索
  - zilliz
  - zilliz cloud
  - クラウド
  - update_password()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# update_password()

この操作は、特定のユーザーのパスワードを更新します。

## リクエスト構文\{#request-syntax}

```python
update_password(
    user_name: str,
    old_password: str,
    new_password: str,
    timeout: Optional[float] = None,
    description: Optional[str] = None,
    **kwargs
)
```

**パラメーター:**

- **user_name** (*str*) -

    **[必須]**

    既存のユーザーの名前です。

- **old_password** (*str*) -

    **[必須]**

    ユーザーの元のパスワードです。

- **new_password** (*str*) -

    **[必須]**

    ユーザーの新しいパスワードです。

- **reset_connection** (*bool*) -

    ユーザーにバインドされている接続をリセットし、新しい認証情報で再認証させるフラグです。

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)
client.update_password(
    user_name="alice",
    old_password="OldP@ss",
    new_password="NewP@ss",
    reset_connection=True,
)
```
