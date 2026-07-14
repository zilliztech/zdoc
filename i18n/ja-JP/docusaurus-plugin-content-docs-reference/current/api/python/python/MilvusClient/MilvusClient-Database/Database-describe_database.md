---
title: "describe_database() | Python | MilvusClient"
slug: /python/python/Database-describe_database
sidebar_label: "describe_database()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定したデータベースの詳細情報を一覧表示します。 | Python | MilvusClient"
type: docx
token: LEaYdk179oZn0vxqa0lcn4mnnrg
sidebar_position: 3
keywords: 
  - セマンティック検索とは
  - Embedding model
  - 画像類似検索
  - Context Window
  - zilliz
  - zilliz cloud
  - cloud
  - describe_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_database()

この操作は、指定したデータベースの詳細情報を一覧表示します。

<Admonition type="info" icon="📘" title="注記">

このメソッドは、Dedicated serving cluster とオンデマンドコンピュートにのみ適用されます。 

- Dedicated serving cluster 内のデータベースについては、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュート用のデータベースについては、プロジェクトエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
describe_database(
    db_name: str, 
    timeout: Optional[float] = None,
    **kwargs,
) -> Dict
```

**パラメータ:**

- **db_name** (*string*) -

    **[必須]**

    説明するデータベースの名前。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを *None* に設定すると、レスポンスが返されるかエラーが発生した時点でタイムアウトします。

**戻り値の型:**

*Dict*

**戻り値:**

指定したデータベースの詳細情報を含む辞書。

**例外:**

- `MilvusException` - この操作中に何らかのエラーが発生した場合に送出されます。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

client.describe_database(
    db_name="my_db"
)

# {
#   "name": "my_db",
#   "a": "b",
#.  "c": "d",
# }
```
