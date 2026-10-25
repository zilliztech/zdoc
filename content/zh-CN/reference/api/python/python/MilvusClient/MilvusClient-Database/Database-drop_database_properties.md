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
  - LLM 作为评判者
  - zilliz
  - Zilliz Cloud
  - 云
  - drop_database_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

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

- **db_name** （*str*） -

    **[必需]**

    要删除属性设置的 Database 名称。

- **property_keys** （*list[str]*） -

    **[必需]**

    要删除的属性的名称。可能的 Database 属性如下：

    - **database.replica.number** （*int*） - 该 Database 属性指定该 Database 的副本数。

    - **database.resource_groups** （*list[str]*） - 该 Database 属性指定专用于该 Database 的资源组。

    - **database.diskQuota.mb** （*int*） - 该 Database 属性指定分配给该 Database 的磁盘配额，单位为兆字节（**MB**）。

    - **database.max.collections** （*int*） - 该 Database 属性指定该 Database 中允许的 Collection 最大数量。

    - **database.force.deny.writing** （*bool*） - 该 Database 属性指定是否拒绝该 Database 中的所有写入操作。

    - **database.force.deny.reading** （*bool*） - 该 Database 属性指定是否拒绝该 Database 中的所有读取操作。

    - **database.replica.number** （*int*） - 该 Database 属性指定该 Database 的副本数。

    - **database.resource_groups** （*list[str]*） - 该 Database 属性指定专用于该 Database 的资源组。

    - **database.diskQuota.mb** （*int*） - 该 Database 属性指定分配给该 Database 的磁盘配额，单位为兆字节（**MB**）。

    - **database.max.collections** （*int*） - 该 Database 属性指定该 Database 中允许的 Collection 最大数量。

    - **database.force.deny.writing** （*bool*） - 该 Database 属性指定是否拒绝该 Database 中的所有写入操作。

    - **database.force.deny.reading** （*bool*） - 该 Database 属性指定是否拒绝该 Database 中的所有读取操作。

**返回类型：**

*NoneType*

**返回：**

*None*

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

client.drop_database_properties(
    db_name="my_db",
    property_keys=["database.replica.number", "database.diskQuota.mb"]
)
```
