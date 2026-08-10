---
title: "describe_database() | Python | MilvusClient"
slug: /python/python/Database-describe_database
sidebar_label: "describe_database()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出指定 Database 的详细信息。 | Python | MilvusClient"
type: docx
token: LEaYdk179oZn0vxqa0lcn4mnnrg
sidebar_position: 3
keywords: 
  - 什么是语义搜索
  - Embedding model
  - 图像相似性搜索
  - Context Window
  - zilliz
  - zilliz cloud
  - 云
  - describe_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_database()

此操作会列出指定 Database 的详细信息。

<Admonition type="info" icon="📘" title="Notes">

此方法仅适用于专用服务集群和按需计算。 

- 对于专用服务集群中的 Database，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的 Database，请使用项目 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
describe_database(
    db_name: str, 
    timeout: Optional[float] = None,
    **kwargs,
) -> Dict
```

**参数：**

- **db_name** (*string*) -

    **[必填]**

    要描述的 Database 名称。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 *None* 表示在收到响应或发生错误时才超时。

**返回类型：**

*Dict*

**返回：**

一个包含指定 Database 详细信息的字典。

**异常：**

- `MilvusException` - 如果此操作期间发生任何错误，则会引发该异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

client.describe_database(
    db_name="my_db"
)

# {
#   "name": "my_db",
#   "a": "b",
#.  "c": "d",
# }
```
