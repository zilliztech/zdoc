---
title: "using_database() | Python | MilvusClient"
slug: /python/python/Database-using_database
sidebar_label: "using_database()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は現在使用中のデータベースを変更します。 | Python | MilvusClient"
type: docx
token: OCfid8DdPo1ga1x24JZcV92xnwd
sidebar_position: 7
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - using_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# using_database()

この操作は現在使用中のデータベースを変更します。

<Admonition type="info" icon="📘" title="注意">

このメソッドは dedicated serving cluster と on-demand compute にのみ適用されます。 

- dedicated serving cluster 内のデータベースについては、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 用のデータベースについては、プロジェクトエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
using_database(
    db_name: str, 
    **kwargs,
)
```

**パラメータ:**

- **db_name** (*string*) -

    **[必須]**

    使用するデータベースの名前。

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

client.using_database("my_db")
```
