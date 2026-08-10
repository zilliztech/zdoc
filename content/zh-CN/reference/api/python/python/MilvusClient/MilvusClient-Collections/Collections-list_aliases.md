---
title: "list_aliases() | Python | MilvusClient"
slug: /python/python/Collections-list_aliases
sidebar_label: "list_aliases()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出特定 Collection 的所有现有别名。 | Python | MilvusClient"
type: docx
token: Cpynd2OFJoIXhLx3dQNct7Wgn6f
sidebar_position: 16
keywords: 
  - 向量相似性搜索
  - 近似最近邻搜索
  - DiskANN
  - 稀疏向量
  - zilliz
  - Zilliz Cloud
  - 云
  - list_aliases()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_aliases()

此操作列出特定 Collection 的所有现有别名。

<Admonition type="info" icon="📘" title="Notes">

此方法适用于 dedicated serving cluster 和按需计算。

- 对于 serving cluster 中的 Collection，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的 Collection，请使用项目 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
list_aliases(
    collection_name: str,
    timeout: Optional[float] = None
)
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    要列出其别名的 Collection 名称。

- **timeout** (*float* | *None*)  

    此操作的超时时长。

    将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*dict*

**返回值：**

一个字典，包含分配给指定 Collection 的别名列表。

```python
{
    'aliases': [
        'test'
    ], 
    'collection_name': 'test_collection', 
    'db_name': 'default'
}
```

**参数：**

- **aliases** (*list*) -

    分配给指定 Collection 的别名列表。

- **collection_name** (*str*) -

    指定的 Collection 名称。

- **db_name** (*str*) -

    指定 Collection 所属的 Database 名称。

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，将引发此异常。

- **BaseException**

    此操作失败时，将引发此异常。

## 示例\{#example}

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

## 相关方法\{#related-methods}

- [alter_alias()](./Collections-alter_alias)

- [create_alias()](./Collections-create_alias)

- [describe_alias()](./Collections-describe_alias)

- [drop_alias()](./Collections-drop_alias)

