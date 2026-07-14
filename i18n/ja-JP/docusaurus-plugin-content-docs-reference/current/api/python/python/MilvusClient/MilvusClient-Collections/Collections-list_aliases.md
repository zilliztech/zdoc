---
title: "list_aliases() | Python | MilvusClient"
slug: /python/python/Collections-list_aliases
sidebar_label: "list_aliases()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定の collection に存在するすべての alias を一覧表示します。 | Python | MilvusClient"
type: docx
token: Cpynd2OFJoIXhLx3dQNct7Wgn6f
sidebar_position: 16
keywords: 
  - ベクトル類似検索
  - 近似最近傍探索
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - クラウド
  - list_aliases()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_aliases()

この操作は、特定の collection に存在するすべての alias を一覧表示します。

<Admonition type="info" icon="📘" title="注記">

このメソッドは、Dedicated serving cluster と on-demand compute に適用されます。 

- serving cluster 内の collection の場合は、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 内の collection の場合は、project endpoints を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
list_aliases(
    collection_name: str,
    timeout: Optional[float] = None
)
```

**パラメーター:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    alias を一覧表示する対象の collection 名。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかの応答が返るか、何らかのエラーが発生した時点で、この操作はタイムアウトします。

**戻り値の型:**

*dict*

**戻り値:**

指定された collection に割り当てられた alias の一覧を含む辞書。

```python
{
    'aliases': [
        'test'
    ], 
    'collection_name': 'test_collection', 
    'db_name': 'default'
}
```

**パラメーター:**

- **aliases** (*list*) -

    指定された collection に割り当てられた alias の一覧。

- **collection_name** (*str*) -

    指定された collection 名。

- **db_name** (*str*) -

    指定された collection が属するデータベース名。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

- **BaseException**

    この操作が失敗した場合に、この例外が発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Create an alias for the collection
client.create_alias(collection_name="test_collection", alias="test")

# 4. List aliases of the collection
client.list_aliases(collection_name="test_collection")

# {'aliases': ['test'], 'collection_name': 'test_collection', 'db_name': 'default'}
```

## 関連メソッド\{#related-methods}

- [alter_alias()](./Collections-alter_alias)

- [create_alias()](./Collections-create_alias)

- [describe_alias()](./Collections-describe_alias)

- [drop_alias()](./Collections-drop_alias)

