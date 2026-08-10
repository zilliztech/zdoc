---
title: "load_partitions() | Python | MilvusClient"
slug: /python/python/Partitions-load_partitions
sidebar_label: "load_partitions()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会将指定 Collection 中的一组特定 Partition 加载到内存中。 | Python | MilvusClient"
type: docx
token: TMq5d6wFmoT8u3xwuruc8k6wnTg
sidebar_position: 6
keywords: 
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - 私有 LLM
  - zilliz
  - zilliz cloud
  - 云
  - load_partitions()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# load_partitions()

此操作会将指定 Collection 中的一组特定 Partition 加载到内存中。

<Admonition type="info" icon="📘" title="Notes">

这仅适用于托管 Collection。

</Admonition>

## 请求语法\{#request-syntax}

```python
load_partitions(
    collection_name: str,
    partition_names: str | List[str],
    timeout: Optional[float] = None
) -> None
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    现有 Collection 的名称。

- **partition_names** (*str | list[str]*) -

    **[必需]**

    要加载的 Partition 名称列表。

- **priority** (*string*) -

    当前 Collection 的加载优先级。该值可能会影响加载过程中的 CPU 使用率。可能的值为 `low` 和 `high`。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

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

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# 3. Create a partition
client.create_partition(
    collection_name="test_collection", 
    partition_name="partition_A"
)

# 4. Release the collection
client.release_collection(collection_name="test_collection")

# 5. Load a partition
client.load_partitions(
    collection_name="test_collection",
    partition_names=["partition_A"]
)

# 6. Check the load status of the collection
client.get_load_state(collection_name="test_collection") 

# {'state': <LoadState: Loaded>}

# 7. Check the load status of the partition
client.get_load_state(
    collection_name="test_collection",
    partition_name="partition_A",
)

# {'state': <LoadState: Loaded>}
```

## 相关方法\{#related-methods}

- [create_partition()](./Partitions-create_partition)

- [drop_partition()](./Partitions-drop_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [has_partition()](./Partitions-has_partition)

- [list_partitions()](./Partitions-list_partitions)

- [release_partitions()](./Partitions-release_partitions)

