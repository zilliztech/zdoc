---
title: "drop_collection() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection
sidebar_label: "drop_collection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会删除一个 collection。 | Python | MilvusClient"
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

此操作会删除一个 collection。

<Admonition type="info" icon="📘" title="说明">

此方法适用于专用服务集群和按需计算。

- 对于服务集群中的 collection，请使用集群端点创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的 collection，请使用项目端点创建 **[MilvusClient](./Client-MilvusClient)**。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
drop_collection(
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    现有 collection 的名称。

- **timeout** (*Optional[float]*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时结束。

**返回类型：**

*NoneType*

**返回：**

None

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

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
