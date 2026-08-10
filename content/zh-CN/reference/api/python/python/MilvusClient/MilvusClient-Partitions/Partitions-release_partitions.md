---
title: "release_partitions() | Python | MilvusClient"
slug: /python/python/Partitions-release_partitions
sidebar_label: "release_partitions()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将指定 Collection 中的 Partition 从内存中释放。 | Python | MilvusClient"
type: docx
token: VblKdUEU4o4t31xcFiicIGtjn9g
sidebar_position: 7
keywords: 
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - vectordb
  - zilliz
  - Zilliz Cloud
  - 云
  - release_partitions()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# release_partitions()

此操作会将指定 Collection 中的 Partition 从内存中释放。

<Admonition type="info" icon="📘" title="Notes">

这仅适用于托管 Collection。

</Admonition>

## 请求语法\{#request-syntax}

```python
release_partitions(
    collection_name: str,
    partition_names: str | List[str],
    timeout: Optional[float] = None
) -> None
```

**参数：**

- **collection_name** (*str*) -

    **[必填]**

    现有 Collection 的名称。

- **partition_names** (*str | list[str]*) -

    **[必填]**

    要释放的 Partition 名称列表。

- **timeout** (*float* | *None*)  

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回值：**

None

<Admonition type="info" icon="📘" title="Notes">

仅当其任意一个或全部 Partition 已加载时，Collection 才处于已加载状态。

</Admonition>

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection and get its load status
client.create_collection(collection_name="test_collection", dimension=5)

res = client.get_load_state(
    collection_name="test_collection"
)

print(res)

# {'state': <LoadState: Loaded>}

# 3. Create a partition
client.create_partition(
    collection_name="test_collection", 
    partition_name="partition_A"
)

# 4. Check the load status of the partition
res = client.get_load_state(
    collection_name="test_collection",
    partition_name="partition_A",
)

print(res)

# {'state': <LoadState: Loaded>}

# 5. Release the partition
client.release_partitions(
    collection_name="test_collection",
    partition_names=["partition_A"]
)

# 6. Check the load status
res = client.get_load_state(
    collection_name="test_collection",
    partition_name="partition_A"
)

print(res)

# {'state': <LoadState: NotLoad>}

res = client.get_load_state(
    collection_name="test_collection"
)

# {'state': <LoadState: Loaded>}
```

## 相关方法\{#related-methods}

- [create_partition()](./Partitions-create_partition)

- [drop_partition()](./Partitions-drop_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [has_partition()](./Partitions-has_partition)

- [list_partitions()](./Partitions-list_partitions)

- [load_partitions()](./Partitions-load_partitions)

