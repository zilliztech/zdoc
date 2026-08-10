---
title: "list_partitions() | Python | MilvusClient"
slug: /python/python/Partitions-list_partitions
sidebar_label: "list_partitions()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出指定 Collection 中的 Partition。 | Python | MilvusClient"
type: docx
token: Dxgqdvlk5o2VScxqmL1ctc1Inqb
sidebar_position: 5
keywords: 
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - vectordb
  - zilliz
  - zilliz cloud
  - 云
  - list_partitions()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_partitions()

此操作列出指定 Collection 中的 Partition。

<Admonition type="info" icon="📘" title="Notes">

这仅适用于托管 Collection。

</Admonition>

## 请求语法\{#request-syntax}

```python
list_partitions(
    collection_name: str,
    timeout: Optional[float] = None
) -> list
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    现有 Collection 的名称。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

**返回类型：**

*list*

**返回值：**

Partition 名称列表。

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

# 4. List the names of all existing partitions
client.list_partitions(
    collection_name="test_collection", 
)

# ['_default', 'partition_A']
```

## 相关方法\{#related-methods}

- [create_partition()](./Partitions-create_partition)

- [drop_partition()](./Partitions-drop_partition)

- [get_partition_stats()](./Partitions-get_partition_stats)

- [has_partition()](./Partitions-has_partition)

- [load_partitions()](./Partitions-load_partitions)

- [release_partitions()](./Partitions-release_partitions)

