---
title: "use_database() | Python | MilvusClient"
slug: /python/python/Database-use_database
sidebar_label: "use_database()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クライアントが別の database を使用するように切り替えます。以降の操作では指定した database が使用されます。このメソッドは切り替える前に database が存在することを検証します。 | Python | MilvusClient"
type: docx
token: AglQd68yqoEn8Ixkn9ociyqKnMx
sidebar_position: 8
keywords: 
  - Faiss ベクターデータベース
  - Chroma ベクターデータベース
  - nlp 検索
  - hallucinations llm
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

この操作は、クライアントが別の database を使用するように切り替えます。以降の操作では指定した database が使用されます。このメソッドは切り替える前に database が存在することを検証します。

<Admonition type="info" icon="📘" title="注意">

これは [`using_database()`](./Database-using_database) のエイリアスメソッドです。

</Admonition>

<Admonition type="info" icon="📘" title="注意">

このメソッドは dedicated serving cluster と on-demand compute にのみ適用されます。 

- dedicated serving cluster 内の database の場合、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 用の database の場合、プロジェクトエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request syntax\{#request-syntax}

```python
client.use_database(
    db_name: str
)
```

**PARAMETERS:**

- **db_name** (*str*) -

    **[REQUIRED]**

    切り替え先の database 名。

**RETURN TYPE:**

*NoneType*

**EXCEPTIONS:**

- **MilvusException**

    database が存在しない場合、この例外が発生します（エラーコード 800）。

## Example\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Switch to a different database
client.use_database(db_name="my_database")

# Subsequent operations will use "my_database"
collections = client.list_collections()
```
