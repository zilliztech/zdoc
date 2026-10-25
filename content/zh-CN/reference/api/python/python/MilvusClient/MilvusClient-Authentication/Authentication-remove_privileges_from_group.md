---
title: "remove_privileges_from_group() | Python | MilvusClient"
slug: /python/python/Authentication-remove_privileges_from_group
sidebar_label: "remove_privileges_from_group()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从组中移除指定的权限。 | Python | MilvusClient"
type: docx
token: Vm7vddGfYo6dYsxJi1Ycjuycnad
sidebar_position: 16
keywords: 
  - 什么是 Milvus
  - Milvus Database
  - Milvus Lite
  - Milvus 基准测试
  - Zilliz
  - Zilliz Cloud
  - 云
  - remove_privileges_from_group()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# remove_privileges_from_group()

此操作会从组中移除指定的权限。

## 请求语法\{#request-syntax}

```python
remove_privileges_from_group(
```

**参数：**

- **group_name**（*str*） -

    目标权限组的名称。

- **privileges**（*List[str]*） -

    要移除的权限列表。

- **timeout**（*Optional[float]*） -

    此操作的超时时长。将其设置为 None 表示当收到任意响应或发生错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回：**

*None*。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常，尤其是在指定的别名不存在时。当此操作期间发生任何错误时，将引发此异常，尤其是在指定的别名不存在时。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.remove_privileges_from_group(
    group_name="my_privilege_group",
    privileges=["ListDatabases", "DescribeDatabase"]
)
```
