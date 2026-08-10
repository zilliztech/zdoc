---
title: "drop_database_properties() | Python | MilvusClient"
slug: /python/python/Database-drop_database_properties
sidebar_label: "drop_database_properties()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会删除指定属性的设置。 | Python | MilvusClient"
type: docx
token: AdSXdtNDsoTMnJx1QoGcSsnZnWd
sidebar_position: 5
keywords: 
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - llm-as-a-judge
  - Zilliz
  - Zilliz Cloud
  - 云
  - drop_database_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_database_properties()

此操作会删除指定属性的设置。

## 请求语法\{#request-syntax}

```python
drop_database_properties(
    db_name: str,
    property_keys: List[str],
    **kwargs,
)
```

**参数：**

- **db_name** (*str*) -

    **[必需]**

    要删除其属性的 Database 名称。

- **property_keys** (*list[str]*) -

    **[必需]**

    要删除的属性名称。可用的 Database 属性如下：

    - **database.replica.number** (*int*) - Database 的副本数量。

    - **database.resource_groups** (*list[str]*) - 专用于该 Database 的资源组。

    - **database.diskQuota.mb** (*int*) - 为该 Database 分配的磁盘配额，单位为兆字节（**MB**）。

    - **database.max.collections** (*int*) - 该 Database 中允许的最大 Collection 数量。

    - **database.force.deny.writing** (*bool*) - 是否拒绝该 Database 中的所有写入操作。

    - **database.force.deny.reading** (*bool*) - 是否拒绝该 Database 中的所有读取操作。

    - **database.replica.number** (*int*) - Database 的副本数量。

    - **database.resource_groups** (*list[str]*) - 专用于该 Database 的资源组。

    - **database.diskQuota.mb** (*int*) - 为该 Database 分配的磁盘配额，单位为兆字节（**MB**）。

    - **database.max.collections** (*int*) - 该 Database 中允许的最大 Collection 数量。

    - **database.force.deny.writing** (*bool*) - 是否拒绝该 Database 中的所有写入操作。

    - **database.force.deny.reading** (*bool*) - 是否拒绝该 Database 中的所有读取操作。

**返回类型：**

*NoneType*

**返回值：**

*None*

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

client.drop_database_properties(
    db_name="my_db",
    property_keys=["database.replica.number", "database.diskQuota.mb"]
)
```
