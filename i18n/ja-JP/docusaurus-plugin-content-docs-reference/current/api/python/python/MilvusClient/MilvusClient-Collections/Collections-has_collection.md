---
title: "has_collection() | Python | MilvusClient"
slug: /python/python/Collections-has_collection
sidebar_label: "has_collection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定の collection が存在するかどうかを確認します。 | Python | MilvusClient"
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

この操作は、特定の collection が存在するかどうかを確認します。

<Admonition type="info" icon="📘" title="注意">

このメソッドは、Dedicated serving cluster と on-demand compute に適用されます。 

- serving cluster 内の collection については、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 内の collection については、project endpoints を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
has_collection(
    collection_name: str,
    timeout: Optional[float] = None
) -> Bool
```

**パラメータ:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    collection の名前。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが返るかエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*bool*

**戻り値:**

指定された collection が存在するかどうかを示すブール値。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

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

