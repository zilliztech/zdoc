---
title: "describe_role() | Python | MilvusClient"
slug: /python/python/Authentication-describe_role
sidebar_label: "describe_role()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のロールの説明と権限を返します。 | Python | MilvusClient"
type: docx
token: TYczdPuSNoV9lExR8iCcNIg9nGe
sidebar_position: 5
keywords: 
  - Dense ベクトル
  - Hierarchical Navigable Small Worlds
  - Dense 埋め込み
  - Faiss ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - describe_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_role()

この操作は、特定のロールの説明と権限を返します。

## リクエスト構文\{#request-syntax}

```python
describe_role(
    role_name: str,
    timeout: Optional[float] = None,
    **kwargs,
) -> dict
```

**パラメーター:**

- **role_name** (*str*) -<br/>
  **[必須]**<br/>
  説明するロールの名前です。

- **timeout** (*Optional[float]*) -<br/>
  デフォルト: `None`<br/>
  RPC の完了を待機する最大時間（秒）です。

- **kwargs** (*Any*) -<br/>
  追加のリクエストコンテキストオプションです。

**戻り値の型:**

*dict*

**戻り値:**

ロール、説明、権限を含む辞書です。

**例外:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

describe_role の使用例を示します。

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
