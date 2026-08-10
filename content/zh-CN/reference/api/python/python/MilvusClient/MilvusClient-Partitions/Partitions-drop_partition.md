---
title: "drop_partition() | Python | MilvusClient"
slug: /python/python/Partitions-drop_partition
sidebar_label: "drop_partition()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会从当前 Collection 中删除指定的 Partition。 | Python | MilvusClient"
type: docx
token: HkOFdhgbOoz1wlxJIgWcU7EonWc
sidebar_position: 2
keywords: 
  - 多模态向量 Database 检索
  - 检索增强生成
  - 大语言模型
  - 向量化
  - zilliz
  - zilliz cloud
  - cloud
  - drop_partition()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_partition()

此操作会从当前 Collection 中删除指定的 Partition。

<Admonition type="info" icon="📘" title="Notes">

在删除 Partition 之前，您必须先释放它。

</Admonition>

<Admonition type="info" icon="📘" title="Notes">

这仅适用于托管 Collection。

</Admonition>

## 请求语法\{#request-syntax}

```python
drop_partition(
    collection_name: str,
    partition_name: str,
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    现有 Collection 的名称。

- **partition_name** (*str*) -

    **[必需]**

    要删除的 Partition 的名称。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作超时。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

# Create a partition
client.create_partition(
    collection_name="test_collection",
    partition_name="partition_A"
)

# Release partition before dropping
client.release_partitions(
    collection_name="test_collection",
    partition_names=["partition_A"]
)

# Drop the partition
client.drop_partition(
    collection_name="test_collection",
    partition_name="partition_A"
)
```
