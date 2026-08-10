---
title: "alter_database_properties() | Python | MilvusClient"
slug: /python/python/Database-alter_database_properties
sidebar_label: "alter_database_properties()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作修改指定 Database 的属性。 | Python | MilvusClient"
type: docx
token: HCWBdorQdoONw2xaawacJWQkn1e
sidebar_position: 1
keywords: 
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - 私有 LLM
  - zilliz
  - zilliz cloud
  - 云
  - alter_database_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_database_properties()

此操作修改指定 Database 的属性。

<Admonition type="info" icon="📘" title="Notes">

此方法仅适用于 Dedicated 集群。

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

    要修改其属性的 Database 名称。

- **properties** (*dict* | *None*) -

    要修改的属性及修改后的值。可用的 Database 属性如下：

    - **database.replica.number** (*int*) -

        Database 的副本数。

    - **database.resource_groups** (*[]str*) -

        专用于该 Database 的资源组。

    - **database.diskQuota.mb** (*int*) -

        分配给该 Database 的磁盘配额，单位为兆字节（**MB**）。

    - **database.max.collections** (*int*) -

        该 Database 中允许的最大 Collection 数量。

    - **database.force.deny.writing** (*bool*) -

        是否拒绝该 Database 中的所有写入操作。

    - **database.force.deny.reading** (*bool*) -

        是否拒绝该 Database 中的所有读取操作。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 *None* 表示当发生任何响应或错误时，此操作将超时。

**返回类型：**

*NoneType*

**返回值：**

*None*

**异常：**

- `MilvusException` - 如果此操作期间发生任何错误，则会引发异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

client.alter_database_properties(
    db_name="my_db",
    properties={"a": "f", "b": "g"}
)
```
