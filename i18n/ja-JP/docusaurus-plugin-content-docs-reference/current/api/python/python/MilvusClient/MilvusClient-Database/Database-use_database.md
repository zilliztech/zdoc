---
title: "use_database() | Python | MilvusClient"
slug: /python/python/Database-use_database
sidebar_label: "use_database()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クライアントが使用するデータベースを別のデータベースに切り替えます。以降の操作では指定したデータベースが使用されます。このメソッドは、切り替える前にデータベースが存在することを検証します。 | Python | MilvusClient"
type: docx
token: AglQd68yqoEn8Ixkn9ociyqKnMx
sidebar_position: 8
keywords: 
  - Faiss ベクトルデータベース
  - Chroma ベクトルデータベース
  - nlp 検索
  - llm ハルシネーション
  - zilliz
  - zilliz cloud
  - cloud
  - use_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# use_database()

この操作は、クライアントが使用するデータベースを別のデータベースに切り替えます。以降の操作では指定したデータベースが使用されます。このメソッドは、切り替える前にデータベースが存在することを検証します。

<Admonition type="info" title="Notes">

これは [`using_database()`](./Database-using_database) のエイリアスメソッドです。

</Admonition>

<Admonition type="info" title="Notes">

このメソッドは、Dedicated serving クラスターとオンデマンドコンピュートにのみ適用されます。

- Dedicated serving クラスター内のデータベースの場合は、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュート用のデータベースの場合は、プロジェクトエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
client.use_database(
    db_name: str
)
```

**パラメータ:**

- **db_name** (*str*) -

    **[必須]**

    切り替え先のデータベースの名前。

**戻り値の型:**

*NoneType*

**例外:**

- **MilvusException**

    データベースが存在しない場合（エラーコード 800）に、この例外が発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Switch to a different database
client.use_database(db_name="my_database")

# Subsequent operations will use "my_database"
collections = client.list_collections()
```
