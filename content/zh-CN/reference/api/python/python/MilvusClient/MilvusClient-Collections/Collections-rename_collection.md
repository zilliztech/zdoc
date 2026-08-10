---
title: "rename_collection() | Python | MilvusClient"
slug: /python/python/Collections-rename_collection
sidebar_label: "rename_collection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会重命名现有 Collection。 | Python | MilvusClient"
type: docx
token: WR4qdjFUXog2JHxuJpMcWcVlnEf
sidebar_position: 18
keywords: 
  - 向量 Database 示例
  - RAG 向量 Database
  - 什么是向量数据库
  - 什么是向量 Database
  - zilliz
  - Zilliz Cloud
  - 云
  - rename_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# rename_collection()

此操作会重命名现有 Collection。

<Admonition type="info" icon="📘" title="Notes">

此方法适用于专用服务集群和按需计算。

- 对于服务集群中的 Collection，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的 Collection，请使用项目 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
rename_collection(
    old_name: str,
    new_name: str,
    target_db: Optional[str] = "",
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**参数：**

- **old_name** (*str*) -

    **[必需]**

    现有 Collection 的名称。

    如果将其设置为不存在的 Collection，将导致 **MilvusException**。

- **new_name** (*str*) -

    **[必需]**

    此操作后目标 Collection 的名称。

    如果将其设置为 **old_name** 的值，将导致 **MilvusException**。

- **target_db** (*Optional[str]*) -

    要将 Collection 移动到的目标 Database 名称。默认为空字符串，这意味着 Collection 保持在当前 Database 中。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作超时。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，都会引发此异常。

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

# Rename the collection
client.rename_collection(
    old_name="test_collection",
    new_name="test_collection_renamed"
)

# Move collection to another database
client.rename_collection(
    old_name="test_collection_renamed",
    new_name="test_collection",
    target_db="my_database"
)
```
