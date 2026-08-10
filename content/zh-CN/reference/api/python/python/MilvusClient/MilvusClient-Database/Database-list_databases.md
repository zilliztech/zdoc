---
title: "list_databases() | Python | MilvusClient"
slug: /python/python/Database-list_databases
sidebar_label: "list_databases()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出所有现有 Database。 | Python | MilvusClient"
type: docx
token: FZuddXocNopEufxRFGdcbvkRnnb
sidebar_position: 6
keywords: 
  - DiskANN
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - zilliz
  - zilliz cloud
  - cloud
  - list_databases()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_databases()

此操作列出所有现有 Database。

<Admonition type="info" icon="📘" title="Notes">

此方法仅适用于 dedicated serving 集群和按需计算。

- 对于 dedicated serving 集群中的 Database，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算的 Database，请使用项目 Endpoints 创建 **[MilvusClient](./Client-MilvusClient)**。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
list_databases(
    timeout: Optional[float] = None,
    **kwargs,
) -> [] string
```

**参数：**

- **db_name** (*string*) -

    **[必需]**

    要删除的 Database 名称。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 *None* 表示当收到响应或发生错误时才超时。

**返回类型：**

*[]string*

**返回值：**

Database 名称列表。

**异常：**

- `MilvusException` - 如果此操作期间发生任何错误，则会引发该异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

db_list = client.list_databases()
print(db_list)
# ["my_database", "default"]
```
