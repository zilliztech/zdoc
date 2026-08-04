---
title: "update_password() | Python | MilvusClient"
slug: /python/python/Authentication-update_password
sidebar_label: "update_password()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "ユーザー認証情報/説明に関連するシグネチャの動作を更新します。Async バリアントは sync メソッドのパラメータおよびレスポンス仕様を共有します。 | Python | MilvusClient"
type: docx
token: Q8QIdA1DioRRL9xUtlgcCPLHnPc
sidebar_position: 20
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
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

ユーザー認証情報/説明に関連するシグネチャの動作を更新します。Async バリアントは sync メソッドのパラメータおよびレスポンス仕様を共有します。

## Request Syntax\{#request-syntax}

```python
update_password(
    user_name: str,
    old_password: str,
    new_password: str,
    reset_connection: Optional[bool] = False,
    timeout: Optional[float] = None,
    description: Optional[str] = None,
    **kwargs,
) -> None
```

**PARAMETERS:**

- **user_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  パスワードを変更するユーザーの名前。

- **old_password** (*str*) -<br/>
  **[REQUIRED]**<br/>
  ユーザーの現在のパスワード。

- **new_password** (*str*) -<br/>
  **[REQUIRED]**<br/>
  ユーザーの新しいパスワード。

- **reset_connection** (*Optional[bool]*) -<br/>
  Default: `False`<br/>
  更新後に新しいパスワードでクライアントを再接続するフラグ。

- **timeout** (*Optional[float]*) -<br/>
  Default: `None`<br/>
  RPC の完了を待機する最大時間（秒）。

- **description** (*Optional[str]*) -<br/>
  Default: `None`<br/>
  ユーザーアカウントの更新後の説明（省略可能）。

- **kwargs** (*Any*) -<br/>
  追加のリクエストコンテキストオプション。

**RETURN TYPE:**

*None*

**RETURNS:**

パスワードが正常に更新されると、値は返されません。

**EXCEPTIONS:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーエラーメッセージを確認してください。

## Examples\{#examples}

パスワード更新の使用方法を示します。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")
client.create_user("analyst", "Milvus123", description="Analytics account")
client.update_user("analyst", description="Updated analytics account")
client.create_role("read_only", description="Read-only role")
client.alter_role("read_only", description="Updated read-only role")
print(client.describe_user("analyst"))
print(client.describe_role("read_only"))
```
