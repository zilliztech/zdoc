---
title: "describe_role() | Python | MilvusClient"
slug: /python/python/Authentication-describe_role
sidebar_label: "describe_role()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "レスポンスでロールの説明が公開されるようになりました。非同期バリアントは同期メソッドのパラメータおよびレスポンス契約を共有します。中間ラッパーフィールドは公開の describe_role() レスポンス辞書に変換されました。 | Python | MilvusClient"
type: docx
token: TYczdPuSNoV9lExR8iCcNIg9nGe
sidebar_position: 5
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - describe_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_role()

レスポンスでロールの説明が公開されるようになりました。非同期バリアントは同期メソッドのパラメータおよびレスポンス契約を共有します。中間ラッパーフィールドは公開の describe_role() レスポンス辞書に変換されました。

## Request Syntax\{#request-syntax}

```python
describe_role(
    role_name: str,
    timeout: Optional[float] = None,
    **kwargs,
) -> dict
```

**PARAMETERS:**

- **role_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  説明を取得するロールの名前。

- **timeout** (*Optional[float]*) -<br/>
  デフォルト: `None`<br/>
  RPC の完了を待機する最大時間（秒単位）。

- **kwargs** (*Any*) -<br/>
  追加のリクエストコンテキストオプション。

**RETURN TYPE:**

*dict*

**RETURNS:**

ロール、説明、および権限を含む辞書。

**EXCEPTIONS:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## Examples\{#examples}

ロールの説明取得の使用方法を示します。

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
