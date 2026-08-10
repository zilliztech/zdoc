---
title: "create_database() | Python | MilvusClient"
slug: /python/python/Database-create_database
sidebar_label: "create_database()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作创建一个 Database。 | Python | MilvusClient"
type: docx
token: S278drWUVoRZ5fx8XkfcWaZfnwh
sidebar_position: 2
keywords: 
  - 神经网络
  - 深度学习
  - 知识库
  - 自然语言处理
  - zilliz
  - zilliz cloud
  - 云
  - create_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_database()

此操作创建一个 Database。

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
create_database(
    db_name: str, 
    properties: Optional[dict] = None,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**参数：**

- **db_name** (*string*) -

    **[必需]**

    要创建的 Database 名称。

- **properties** (*dict* | *None*) -

    <Admonition type="info" icon="📘" title="Note">

    这不适用于按需计算的 Database。

    </Admonition>

    要创建的 Database 的属性。可用的 Database 属性如下：

    - **database.replica.number** (*int*) -

        Database 的副本数。

    - **database.resource_groups** (*[]str*) -

        专用于该 Database 的资源组。

    - **database.diskQuota.mb** (*int*) -

        分配给该 Database 的磁盘配额，以兆字节（**MB**）为单位。

    - **database.max.collections** (*int*) -

        该 Database 中允许的最大 Collection 数量。

    - **database.force.deny.writing** (*bool*) -

        是否拒绝该 Database 中的所有写入操作。

    - **database.force.deny.reading** (*bool*) -

        是否拒绝该 Database 中的所有读取操作。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 *None* 表示在收到响应或发生错误时才超时。

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

client.create_database(
    db_name="my_db"
)
```

