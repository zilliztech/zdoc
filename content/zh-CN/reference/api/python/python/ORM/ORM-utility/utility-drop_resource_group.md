---
title: "drop_resource_group() | Python | ORM"
slug: /python/python/utility-drop_resource_group
sidebar_label: "drop_resource_group()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除一个资源组。 | Python | ORM"
type: docx
token: EofGdftYjoQ9E6x8mxLcpbG1nhc
sidebar_position: 11
keywords: 
  - IVF
  - knn
  - 图像搜索
  - LLMs
  - zilliz
  - zilliz cloud
  - 云
  - drop_resource_group()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_resource_group()

此操作会删除一个资源组。

## 请求语法\{#request-syntax}

```python
drop_resource_group(
    name: str,
    using: str,
    timeout: float | None
)
```

**参数：**

- **name** (*str*) -

    **[必需]**

    要删除的资源组名称。

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作才会超时。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a new resource group
utility.create_resource_group(
    name="rg_01",
    using="default"
)

# Drop the created resource group
utility.drop_resource_group(
    name="rg_01",
    using="default"
)
```

## 相关操作\{#related-operations}

以下操作与 `drop_resource_group()` 相关：

- [create_resource_group()](./utility-create_resource_group)

- [describe_resource_group()](./utility-describe_resource_group)

- [list_resource_groups()](./utility-list_resource_groups)

- [transfer_node()](./utility-transfer_node)

- [transfer_replica()](./utility-transfer_replica)

