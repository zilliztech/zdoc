---
title: "transfer_node() | Python | ORM"
slug: /python/python/utility-transfer_node
sidebar_label: "transfer_node()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将特定数量的查询节点从源资源组移动到目标资源组。 | Python | ORM"
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

此操作会将特定数量的查询节点从源资源组移动到目标资源组。

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

    **[必需]**

    要从中移动查询节点的源资源组名称。

    如果将此参数设置为不存在的资源组，将导致 **MilvusException**。

- **target_group** (*str*) -

    **[必需]**

    要将查询节点移动到其中的源资源组名称。

    如果将此参数设置为不存在的资源组，将导致 **MilvusException**。

- **num_nodes** (*int*) -

    **[必需]**

    要在源资源组和目标资源组之间移动的查询节点数量。

    如果将此参数设置为大于当前 Zilliz Cloud 集群中实际查询节点数量的整数，将导致 **MilvusException**。

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作超时。

**返回类型：**

*NoneType*

**返回：**

无。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

**示例：**

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Get the number of query nodes in the source resource group
res = utility.describe_resource_group(name="__default_resource_group")
res.num_available_node # 1

# Create a new resource group
utility.create_resource_group(
    name="rg_01",
    using="default"
)

# Get the number of query nodes in the target resource group
res = utility.describe_resource_group(name="rg_01")
res.num_available_node # 0

# Move the node from the default resource group to the new one
utility.transfer_node(
    source_group="__default_resource_group",
    target_group="rg_01",
    num_nodes=1
)

# Get the number of query nodes in the source and target resource groups
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

