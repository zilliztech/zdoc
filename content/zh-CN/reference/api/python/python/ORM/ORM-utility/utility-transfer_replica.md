---
title: "transfer_replica() | Python | ORM"
slug: /python/python/utility-transfer_replica
sidebar_label: "transfer_replica()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于在资源组之间转移指定数量的副本。 | Python | ORM"
type: docx
token: SuePdciB0o4du5xtpIhcMVyYnPb
sidebar_position: 40
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - transfer_replica()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# transfer_replica()

此操作用于在资源组之间转移指定数量的副本。

## 请求语法\{#request-syntax}

```python
transfer_replica(
    source_group: str,
    target_group: str,
    collection_name: str,
    num_replicas: int,
    using: str = "default",
    timeout: float | None,
)
```

**参数：**

- **source_group** (*str*) -

    **[必填]**

    要从中移动查询节点的源资源组名称。

    如果将此参数设置为不存在的资源组，将导致 **MilvusException**。

- **target_group** (*str*) -

    **[必填]**

    要将查询节点移动到的源资源组名称。

    如果将此参数设置为不存在的资源组，将导致 **MilvusException**。

- **num_replicas** (*int*) -

    **[必填]**

    要在源资源组和目标资源组之间移动的副本数量。

    <Admonition type="info" icon="📘" title="说明">

    什么是副本？
    
        借助副本，Zilliz Cloud 可以在多个查询节点上加载相同的 segment。如果某个查询节点发生故障，或者当新的搜索请求到达时该节点正忙于处理当前搜索请求，系统就可以将新请求发送到另一个空闲的、具有相同 segment 副本的查询节点。 
    
        副本按副本组进行组织。每个副本组都包含 [shard](https://milvus.io/docs/v2.1.x/glossary.md#Sharding) 副本。每个 shard 副本都有一个流式副本和一个历史副本，分别对应 shard 中正在增长的和已封存的 [segments](https://milvus.io/docs/v2.1.x/glossary.md#Segment)。
    
        Shard 可被视为分布式数据写入操作中的 DML 通道，用于在多个节点之间充分利用 Zilliz Cloud 集群的并行计算能力。

    </Admonition>

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回值：**

None。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

**示例：**

```python
from pymilvus import (
    connections, 
    Collection, 
    CollectionSchema, 
    FieldSchema, 
    DataType, 
    utility,
)

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Create a collection
collection = Collection(
    name="test_collection",
    schema=CollectionSchema([
        FieldSchema("id", DataType.INT64, is_primary=True),
        FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
    ])
)

# Get the currently loaded replicas
collection.get_replicas()

# Create a new resource group
utility.create_resource_group(
    name="rg_01",
    using="default"
)

# Transfer replicas between resource groups
utility.transfer_node(
    source_group="__default_resource_group",
    target_group="rg_01",
    num_nodes=1
)
```

## 相关操作\{#related-operations}

以下操作与 `transfer_replica()` 相关：

- [create_resource_group()](./utility-create_resource_group)

- [describe_resource_group()](./utility-describe_resource_group)

- [drop_resource_group()](./utility-drop_resource_group)

- [list_resource_groups()](./utility-list_resource_groups)

- [transfer_node()](./utility-transfer_node)

