---
title: "get_load_state() | Python | MilvusClient"
slug: /python/python/Management-get_load_state
sidebar_label: "get_load_state()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作显示指定集合或分区是否已加载。 | Python | MilvusClient"
type: docx
token: KEPYdKup1o3nHdxKbjvcQUzwnnd
sidebar_position: 8
keywords: 
  - 音频相似性搜索
  - 弹性向量数据库
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - get_load_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_load_state()

此操作显示指定集合或分区是否已加载。

<Admonition type="info" icon="📘" title="说明">

这仅适用于托管集合。

</Admonition>

## 请求语法\{#request-syntax}

```python
get_load_state(
    collection_name: str,
    partition_name: Optional[str] = "",
    timeout: Optional[float] = None
) -> Dict
```

**参数：**

- **collection_name** (*str*) -

    **[必填]**

    集合名称。

- **partition_name** (*str*) -

    分区名称。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示此操作会在任意响应返回或发生错误时超时。

**返回类型：**

*dict*

**返回：**

一个包含指定集合或分区状态的字典。 

<Admonition type="info" icon="📘" title="说明">

如果一个集合的任意一个或全部分区已加载，则该集合处于已加载状态。

</Admonition>

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="quick_setup", dimension=5)

# 3. Check the load status of the collection
client.get_load_state(collection_name="quick_setup") 

# {'state': <LoadState: Loaded>}

# 4. Release the collection
client.release_collection(collection_name="quick_setup")
client.get_load_state(collection_name="quick_setup") 

# {'state': <LoadState: NotLoad>}

# 5. Create a partition
client.create_partition(
    collection_name="quick_setup", 
    partition_name="partition_A"
)

# 6. Load a partition
client.load_partitions(
    collection_name="quick_setup",
    partition_names=["partition_A"]
)

client.get_load_state(collection_name="quick_setup") 

# {'state': <LoadState: Loaded>}

client.get_load_state(
    collection_name="quick_setup",
    partition_name="partition_A"
) 

# {'state': <LoadState: Loaded>}
```

## 相关方法\{#related-methods}

- [load_collection()](./Management-load_collection)

- [refresh_load()](./Management-refresh_load)

- [release_collection()](./Management-release_collection)

