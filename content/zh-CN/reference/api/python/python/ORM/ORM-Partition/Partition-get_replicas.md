---
title: "get_replicas() | Python | ORM"
slug: /python/python/Partition-get_replicas
sidebar_label: "get_replicas()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取当前已加载副本的信息。 | Python | ORM"
type: docx
token: YKwldu59qosZBsxdRdSc0l9Hnoe
sidebar_position: 4
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - get_replicas()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_replicas()

此操作获取当前已加载副本的信息。

## 请求语法\{#request-syntax}

```python
get_replicas(
    timeout: float | None
)
```

**参数：**

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作超时。

**返回类型：**

*Replica*

**返回：**

一个 **Replica** 对象，包含以下字段：

- **groups** (*list*)

    副本组列表。每个 **Group** 对象包含以下字段：

    - **id** (*int*)

        组 ID。

    - **group_nodes** (*tuple*)

        包含相关查询节点 ID 的元组。

    - **resource_group** (*str*)

        上述查询节点所属的资源组名称。

    - **shards** (*list*)  

        **Shard** 对象列表，包含以下字段：

        - **channel_name** (*str*)

        - **shard_leader** (*int*)

        - **shard_nodes** (*set*)

<Admonition type="info" icon="📘" title="说明">

什么是副本？

借助副本，Zilliz Cloud 可以在多个查询节点上加载相同的 segment。如果某个查询节点发生故障，或者在另一个搜索请求到达时正忙于处理当前搜索请求，系统可以将新请求发送到具有相同 segment 副本的空闲查询节点。

副本按副本组进行组织。每个副本组都包含 [shard](https://milvus.io/docs/v2.1.x/glossary.md#Sharding) 副本。每个 shard 副本都有一个流式副本和一个历史副本，分别对应 shard 中正在增长的和已封存的 [segments](https://milvus.io/docs/v2.1.x/glossary.md#Segment)。

Shards 可视为 DML 通道，用于在多个节点之间执行分布式数据写入操作，从而最大限度地发挥 Zilliz Cloud 集群的并行计算能力。

</Admonition>

**异常：**

无

## 示例\{#examples}

```python
from pymilvus import Collection, Partition

collection = Collection(name="test_collection")

# Get an existing partition
partition = Partition(collection, name="test_partition")

# Get the information about the current loaded replicas
partition.get_replicas()
```

## 相关操作\{#related-operations}

以下操作与 `get_replicas()` 相关：

- [drop()](./Partition-drop)

- [load()](./Partition-load)

- [release()](./Partition-release)

