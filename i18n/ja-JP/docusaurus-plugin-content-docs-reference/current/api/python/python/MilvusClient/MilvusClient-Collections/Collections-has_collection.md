---
title: "has_collection() | Python | MilvusClient"
slug: /python/python/Collections-has_collection
sidebar_label: "has_collection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクションが存在するかどうかを確認します。 | Python | MilvusClient"
type: docx
token: SSQ6dFGdxouy7hxRwCOcatnEn0e
sidebar_position: 14
keywords: 
  - Pinecone ベクトルデータベース
  - 音声検索
  - セマンティック検索とは
  - Embedding model
  - zilliz
  - zilliz cloud
  - クラウド
  - has_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# has_collection()

この操作は、特定のコレクションが存在するかどうかを確認します。

<Admonition type="info" title="Notes">

このメソッドは、Dedicated serving クラスターと on-demand compute に適用されます。

- serving クラスター内のコレクションについては、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 内のコレクションについては、プロジェクトエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
has_collection(
    collection_name: str,
    timeout: Optional[float] = None
) -> Bool
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    コレクションの名前です。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。

    これを **None** に設定すると、何らかの応答が返されたかエラーが発生した時点で、この操作がタイムアウトすることを示します。

**戻り値の型:**

*bool*

**戻り値:**

指定されたコレクションが存在するかどうかを示すブール値です。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## 例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Check whether a collection named `test_collection` exists
client.has_collection(collection_name="test_collection") 

# True

# 4. Check whether a collection named `test_collection_2` exists
client.has_collection(collection_name="test_collection_2") 

# False
```
