---
title: "drop_collection() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection
sidebar_label: "drop_collection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は collection を削除します。 | Python | MilvusClient"
type: docx
token: HZByd7LqQoiorTxCgyrcu3VUnof
sidebar_position: 11
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - drop_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_collection()

この操作は collection を削除します。

<Admonition type="info" icon="📘" title="注意">

このメソッドは dedicated serving cluster と on-demand compute に適用されます。 

- serving cluster 内の collection に対しては、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 内の collection に対しては、project endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
drop_collection(
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    既存の collection の名前。

- **timeout** (*Optional[float]*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するかエラーが発生した時点で、この操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が送出されます。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

# List collections
res = client.list_collections()
# ['test_collection']

# Drop the collection
client.drop_collection(collection_name="test_collection")

# Verify
res = client.list_collections()
# []
```
