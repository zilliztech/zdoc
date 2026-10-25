---
title: "describe_user() | Python | MilvusClient"
slug: /python/python/Authentication-describe_user
sidebar_label: "describe_user()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定のユーザーに関する情報を取得します。 | Python | MilvusClient"
type: docx
token: M1KhdfoEDokSUIxwB8fcKBeMn2b
sidebar_position: 6
keywords: 
  - Milvus とは
  - Milvus データベース
  - Milvus lite
  - Milvus ベンチマーク
  - zilliz
  - Zilliz Cloud
  - クラウド
  - describe_user()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# describe_user()

この操作は、特定のユーザーに関する情報を取得します。

## リクエスト構文\{#request-syntax}

```python
describe_user(
    user_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> dict
```

**パラメーター:**

- **user_name** (*str*) -

    **[必須]**

    説明対象のユーザーの名前です。

- **timeout** (*float | None*) -

    この操作のタイムアウト時間です。これを None に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**戻り値の型:**

*dict*

**戻り値:**

ユーザー名、割り当てられたロール、および説明を含む辞書です。ユーザーが見つからない場合は、空の辞書を返します。

**パラメーター:**

- **user_name** (*str*) -

    説明対象のユーザーアカウントの名前です。

- **roles** (*list[str]*) -

    ユーザーアカウントに割り当てられたロールです。

- **description** (*str*) -

    ユーザーアカウントに保存されている説明です。

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
users = client.describe_user(user_name="alice")
for item in users:
    print(
        item.user_name,
        item.roles,
        item.description,
    )
```
