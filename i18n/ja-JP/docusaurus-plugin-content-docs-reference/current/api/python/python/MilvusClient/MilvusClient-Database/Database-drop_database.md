---
title: "drop_database() | Python | MilvusClient"
slug: /python/python/Database-drop_database
sidebar_label: "drop_database()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたデータベースを削除します。 | Python | MilvusClient"
type: docx
token: Vjd7dE5OyoGvYaxd7OCcubBWnLd
sidebar_position: 4
keywords: 
  - ベクトル検索
  - knn アルゴリズム
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - クラウド
  - drop_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_database()

この操作は、指定されたデータベースを削除します。

<Admonition type="info" title="Notes">

このメソッドは、Dedicated サービングクラスターとオンデマンドコンピュートにのみ適用されます。 

- Dedicated サービングクラスター内のデータベースの場合は、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュート用のデータベースの場合は、プロジェクトエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
drop_database(
    db_name: str, 
    timeout: Optional[float] = None,
    **kwargs,
)
```

**パラメーター:**

- **db_name** (*string*) -

    **[必須]**

    削除するデータベースの名前。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを *None* に設定すると、レスポンスが到着するかエラーが発生した時点でタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

*None*

**例外:**

- `MilvusException` - この操作中にエラーが発生した場合にスローされます。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

client.drop_database("my_db")
```
