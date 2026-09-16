---
title: "list_aliases() | Python | MilvusClient"
slug: /python/python/Collections-list_aliases
sidebar_label: "list_aliases()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクションに存在するすべてのエイリアスを一覧表示します。 | Python | MilvusClient"
type: docx
token: Cpynd2OFJoIXhLx3dQNct7Wgn6f
sidebar_position: 16
keywords: 
  - ベクトル類似検索
  - 近似最近傍探索
  - DiskANN
  - Sparse ベクトル
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

この操作は、特定のコレクションに存在するすべてのエイリアスを一覧表示します。

<Admonition type="info" title="Notes">

このメソッドは、Dedicated serving クラスターとオンデマンドコンピュートに適用されます。 

- serving クラスター内のコレクションの場合は、クラスターエンドポイントを指定して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュート内のコレクションの場合は、プロジェクトエンドポイントを指定して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
list_aliases(
    collection_name: str,
    timeout: Optional[float] = None
)
```

**パラメータ:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    エイリアスを一覧表示する対象のコレクションの名前。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。 

    これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点で、この操作はタイムアウトします。

**戻り値の型:**

*dict*

**戻り値:**

指定されたコレクションに割り当てられたエイリアスの一覧を含む辞書。

```python
{
    'aliases': [
        'test'
    ], 
    'collection_name': 'test_collection', 
    'db_name': 'default'
}
```

**パラメータ:**

- **aliases** (*list*) -

    指定されたコレクションに割り当てられたエイリアスの一覧。

- **collection_name** (*str*) -

    指定されたコレクション名。

- **db_name** (*str*) -

    指定されたコレクションが属するデータベースの名前。

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に発生します。

- **BaseException**

    この例外は、この操作が失敗した場合に発生します。

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

