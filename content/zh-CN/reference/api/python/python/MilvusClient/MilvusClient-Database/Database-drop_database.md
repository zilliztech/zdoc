---
title: "drop_database() | Python | MilvusClient"
slug: /python/python/Database-drop_database
sidebar_label: "drop_database()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除指定的 Database。 | Python | MilvusClient"
type: docx
token: Vjd7dE5OyoGvYaxd7OCcubBWnLd
sidebar_position: 4
keywords: 
  - 向量搜索
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - zilliz
  - zilliz cloud
  - 云
  - drop_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_database()

此操作会删除指定的 Database。

<Admonition type="info" icon="📘" title="Notes">

此方法仅适用于 dedicated serving cluster 和按需计算。 

- 对于 dedicated serving cluster 中的 Database，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算的 Database，请使用项目 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
drop_database(
    db_name: str, 
    timeout: Optional[float] = None,
    **kwargs,
)
```

**参数：**

- **db_name** (*string*) -

    **[必需]**

    要删除的 Database 名称。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 *None* 表示在收到响应或发生错误时才会超时。

**返回类型：**

*NoneType*

**返回值：**

*None*

**异常：**

- `MilvusException` - 如果此操作期间发生任何错误，则会引发该异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

client.drop_database("my_db")
```
