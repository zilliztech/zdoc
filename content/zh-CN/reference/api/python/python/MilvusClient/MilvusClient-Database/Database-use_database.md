---
title: "use_database() | Python | MilvusClient"
slug: /python/python/Database-use_database
sidebar_label: "use_database()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将客户端切换为使用其他 Database。后续操作将使用指定的 Database。该方法会在切换前验证 Database 是否存在。 | Python | MilvusClient"
type: docx
token: AglQd68yqoEn8Ixkn9ociyqKnMx
sidebar_position: 8
keywords: 
  - Faiss 向量 Database
  - Chroma 向量 Database
  - nlp 搜索
  - hallucinations llm
  - zilliz
  - zilliz cloud
  - 云
  - use_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# use_database()

此操作会将客户端切换为使用其他 Database。后续操作将使用指定的 Database。该方法会在切换前验证 Database 是否存在。

<Admonition type="info" icon="📘" title="Notes">

这是 [`using_database()`](./Database-using_database) 的别名方法。

</Admonition>

<Admonition type="info" icon="📘" title="Notes">

此方法仅适用于专用服务集群和按需计算。

- 对于专用服务集群中的 Database，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **免费版和 Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的 Database，请使用项目 Endpoints 创建 **[MilvusClient](./Client-MilvusClient)**。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
client.use_database(
    db_name: str
)
```

**参数：**

- **db_name** (*str*) -

    **[必需]**

    要切换到的 Database 名称。

**返回类型：**

*NoneType*

**异常：**

- **MilvusException**

    当 Database 不存在时，将引发此异常（错误代码 800）。

## 示例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Switch to a different database
client.use_database(db_name="my_database")

# Subsequent operations will use "my_database"
collections = client.list_collections()
```
