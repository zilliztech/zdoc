---
title: "list_databases() | Python | MilvusClient"
slug: /python/python/Database-list_databases
sidebar_label: "list_databases()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のすべてのデータベースを一覧表示します。 | Python | MilvusClient"
type: docx
token: FZuddXocNopEufxRFGdcbvkRnnb
sidebar_position: 6
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - list_databases()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_databases()

この操作は、既存のすべてのデータベースを一覧表示します。

<Admonition type="info" icon="📘" title="注意">

このメソッドは、専用の serving cluster と on-demand compute にのみ適用されます。 

- 専用の serving cluster 内のデータベースの場合は、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 用のデータベースの場合は、project endpoints を使用して **[MilvusClient](./Client-MilvusClient)** を作成します。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
list_databases(
    timeout: Optional[float] = None,
    **kwargs,
) -> [] string
```

**パラメータ:**

- **db_name** (*string*) -

    **[必須]**

    削除するデータベースの名前。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。*None* に設定すると、レスポンスが返されるかエラーが発生した時点でタイムアウトします。

**戻り値の型:**

*[]string*

**戻り値:**

データベース名のリスト。

**例外:**

- `MilvusException` - この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

db_list = client.list_databases()
print(db_list)
# ["my_database", "default"]
```
