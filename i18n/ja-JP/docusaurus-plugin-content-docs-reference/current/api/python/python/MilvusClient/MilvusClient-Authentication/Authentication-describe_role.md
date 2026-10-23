---
title: "describe_role() | Python | MilvusClient"
slug: /python/python/Authentication-describe_role
sidebar_label: "describe_role()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、特定のロールの説明を取得します。 | Python | MilvusClient"
type: docx
token: KoC3dcgn8oiJkNx8uZNcHvE4nxe
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

この操作は、特定のロールの説明を取得します。

## リクエスト構文\{#request-syntax}

```python
describe_role(
    role_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> dict
```

**パラメーター:**

- **role_name** (*str*) -

    **[必須]**

    説明するロールの名前です。

- **timeout** (*float | None*) -

    この操作のタイムアウト時間です。これを None に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**戻り値の型:**

*dict*

**戻り値:**

ロール名、ロールの説明、およびロールに付与された権限を含む辞書です。

**パラメーター:**

- **role** (*str*) -

    説明するロールの名前です。

- **description** (*str*) -

    ロールの説明です。

- **privileges** (*list[dict]*) -

    ロールに付与された権限です。各辞書には 1 件の付与情報が含まれます。

    - **object_type** (*str*) -

        ロールに付与されたリソースオブジェクトの型です。使用可能な値は コレクション、Global、User です。

    - **object_name** (*str*) -

        ロールに付与されたリソースオブジェクトの名前です。アスタリスク（&ast;）を使用することをお勧めします。

    - **db_name** (*str*) -

        ロールがアクセスできるデータベースの名前です。

    - **role_name** (*str*) -

        指定したロールの名前です。

    - **privilege** (*str*) -

        ロールに付与された権限の名前です。

    - **grantor_name** (*str*) -

        権限を付与したユーザーの名前です。

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
roles = client.describe_role(role_name="reader")
for item in roles:
    print(
        item.role_name,
        item.description,
    )
```
