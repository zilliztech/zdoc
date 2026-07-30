---
title: "alter_database_properties() | Python | MilvusClient"
slug: /python/python/Database-alter_database_properties
sidebar_label: "alter_database_properties()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作用于修改指定数据库的属性。 | Python | MilvusClient"
type: docx
token: HCWBdorQdoONw2xaawacJWQkn1e
sidebar_position: 1
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - alter_database_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_database_properties()

此操作用于修改指定数据库的属性。

<Admonition type="info" icon="📘" title="说明">

此方法仅适用于专用集群。

</Admonition>

## 请求语法\{#request-syntax}

```python
alter_database_properties(
    db_name: str, 
    properties: Dict,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**参数：**

- **db_name** (*string*) -

    **[必需]**

    要修改其属性的数据库名称。

- **properties** (*dict* | *None*) -

    要修改的属性及其修改后的值。可用的数据库属性如下：

    - **database.replica.number** (*int*) -

        数据库的副本数量。

    - **database.resource_groups** (*[]str*) -

        专用于该数据库的资源组。

    - **database.diskQuota.mb** (*int*) -

        分配给数据库的磁盘配额，单位为兆字节（**MB**）。

    - **database.max.collections** (*int*) -

        数据库中允许的最大集合数量。

    - **database.force.deny.writing** (*bool*) -

        是否拒绝数据库中的所有写入操作。

    - **database.force.deny.reading** (*bool*) -

        是否拒绝数据库中的所有读取操作。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 *None* 表示当收到任何响应或错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回：**

*None*

**异常：**

- `MilvusException` - 如果此操作期间发生任何错误，则会引发该异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

client.alter_database_properties(
    db_name="my_db",
    properties={"a": "f", "b": "g"}
)
```
