---
title: "create_database() | Python | MilvusClient"
slug: /python/python/Database-create_database
sidebar_label: "create_database()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于创建数据库。 | Python | MilvusClient"
type: docx
token: S278drWUVoRZ5fx8XkfcWaZfnwh
sidebar_position: 2
keywords: 
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing
  - zilliz
  - zilliz cloud
  - cloud
  - create_database()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_database()

此操作用于创建数据库。

<Admonition type="info" icon="📘" title="说明">

此方法仅适用于专用服务集群和按需计算。 

- 对于专用服务集群中的数据库，请使用集群端点创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算的数据库，请使用项目端点创建 **[MilvusClient](./Client-MilvusClient)**。

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

    要创建的数据库名称。

- **properties** (*dict* | *None*) -

    <Admonition type="info" icon="📘" title="说明">

    这不适用于按需计算的数据库。

    </Admonition>

    要创建的数据库属性。可用的数据库属性如下：

    - **database.replica.number** (*int*) -

        数据库的副本数量。

    - **database.resource_groups** (*[]str*) -

        专用于该数据库的资源组。

    - **database.diskQuota.mb** (*int*) -

        分配给该数据库的磁盘配额，单位为 MB。

    - **database.max.collections** (*int*) -

        数据库中允许的最大 collection 数量。

    - **database.force.deny.writing** (*bool*) -

        是否禁止数据库中的所有写入操作。

    - **database.force.deny.reading** (*bool*) -

        是否禁止数据库中的所有读取操作。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 *None* 表示在收到响应或发生错误时才会超时。

**返回类型：**

*NoneType*

**返回值：**

*None*

**异常：**

- `MilvusException` - 如果此操作期间发生任何错误，则会引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

client.create_database(
    db_name="my_db"
)
```

