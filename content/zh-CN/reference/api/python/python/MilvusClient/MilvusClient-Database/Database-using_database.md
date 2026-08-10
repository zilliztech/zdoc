---
title: "using_database() | Python | MilvusClient"
slug: /python/python/Database-using_database
sidebar_label: "using_database()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会更改当前正在使用的 Database。 | Python | MilvusClient"
type: docx
token: OCfid8DdPo1ga1x24JZcV92xnwd
sidebar_position: 7
keywords: 
  - RAG
  - NLP
  - 神经网络
  - 深度学习
  - zilliz
  - zilliz cloud
  - 云
  - using_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# using_database()

此操作会更改当前正在使用的 Database。

<Admonition type="info" icon="📘" title="Notes">

此方法仅适用于 dedicated serving clusters 和按需计算。 

- 对于 dedicated serving clusters 中的 Database，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **免费版和 Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算的 Database，请使用项目 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
using_database(
    db_name: str, 
    **kwargs,
)
```

**参数：**

- **db_name** (*string*) -

    **[必需]**

    要使用的 Database 名称。

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

client.using_database("my_db")
```
