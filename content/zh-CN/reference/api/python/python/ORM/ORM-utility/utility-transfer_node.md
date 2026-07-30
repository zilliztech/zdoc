---
title: "transfer_node() | Python | ORM"
slug: /python/python/utility-transfer_node
sidebar_label: "transfer_node()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将指定数量的 query node 从源资源组移动到目标资源组。 | Python | ORM"
type: docx
token: QHcpd1aJzo5aYbxJtMXc58een4f
sidebar_position: 39
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - transfer_node()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# transfer_node()

此操作将指定数量的 query node 从源资源组移动到目标资源组。

## 请求语法\{#request-syntax}

```python
transfer_node(
    source_group: str,
    target_group: str,
    num_nodes: int,
    using: str = "default",
    timeout: Optional[float] = None,
) -> None
```

**参数：**

- **source_group** (*str*) -

    **[必填]**

    要从中移出 query node 的源资源组名称。

    如果将此参数设置为不存在的资源组，会导致 **MilvusException**。

- **target_group** (*str*) -

    **[必填]**

    要将 query node 移入其中的目标资源组名称。

    如果将此参数设置为不存在的资源组，会导致 **MilvusException**。

- **num_nodes** (*int*) -

    **[必填]**

    要在源资源组和目标资源组之间移动的 query node 数量。

    如果将此参数设置为大于当前 Zilliz Cloud 集群中 query node 实际数量的整数，会导致 **MilvusException**。

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示此操作会在收到任意响应或发生任意错误时超时。

**返回类型：**

*NoneType*

**返回：**

None。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

**示例：**

```python
from pymilvus import connections, utility

# 连接到 YOUR_CLUSTER_ENDPOINT
connections.connect()

# 获取源资源组中的 query node 数量
res = utility.describe_resource_group(name="__default_resource_group")
res.num_available_node # 1

# 创建一个新的资源组
utility.create_resource_group(
    name="rg_01",
    using="default"
)

# 获取目标资源组中的 query node 数量
res = utility.describe_resource_group(name="rg_01")
res.num_available_node # 0

# 将节点从默认资源组移动到新资源组
utility.transfer_node(
    source_group="__default_resource_group",
    target_group="rg_01",
    num_nodes=1
)

# 获取源资源组和目标资源组中的 query node 数量
res = utility.describe_resource_group(name="__default_resource_group")
res.num_available_node # 0

res = utility.describe_resource_group(name="rg_01")
res.num_available_node # 1
```

## 相关操作\{#related-operations}

以下操作与 `transfer_node()` 相关：

- [create_resource_group()](./utility-create_resource_group)

- [describe_resource_group()](./utility-describe_resource_group)

- [drop_resource_group()](./utility-drop_resource_group)

- [list_resource_groups()](./utility-list_resource_groups)

- [transfer_replica()](./utility-transfer_replica)

