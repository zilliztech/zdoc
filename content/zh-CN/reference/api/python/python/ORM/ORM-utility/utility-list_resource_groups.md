---
title: "list_resource_groups() | Python | ORM"
slug: /python/python/utility-list_resource_groups
sidebar_label: "list_resource_groups()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出当前已连接的 Zilliz Cloud 集群中的所有资源组。 | Python | ORM"
type: docx
token: FXTZd5FgNo9ta0xvjaIclEM1nPf
sidebar_position: 26
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - zilliz
  - zilliz cloud
  - 云
  - list_resource_groups()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_resource_groups()

此操作会列出当前已连接的 Zilliz Cloud 集群中的所有资源组。

## 请求语法\{#request-syntax}

```python
list_resource_groups(
    using: str,
    timeout: float | None,
)
```

**参数：**

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作才会超时。

**返回类型：**

*list*

**返回：**
所有资源组名称的列表。

**示例：**

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a new resource group
utility.create_resource_group(
    name="rg_01",
    using="default"
)

# Create another resource group
utility.create_resource_group(
    name="rg_02",
    using="default"
)

# List all resource groups
utility.list_resource_groups(
    using="default"
) # ["__default_resource_group", "rg_01", "rg_02"]
```

## 相关操作\{#related-operations}

以下操作与 `list_resource_groups()` 相关：

- [create_resource_group()](./utility-create_resource_group)

- [describe_resource_group()](./utility-describe_resource_group)

- [drop_resource_group()](./utility-drop_resource_group)

- [transfer_node()](./utility-transfer_node)

- [transfer_replica()](./utility-transfer_replica)

