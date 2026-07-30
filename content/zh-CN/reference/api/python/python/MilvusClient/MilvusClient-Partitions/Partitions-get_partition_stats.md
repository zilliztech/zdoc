---
title: "get_partition_stats() | Python | MilvusClient"
slug: /python/python/Partitions-get_partition_stats
sidebar_label: "get_partition_stats()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作显示在特定分区上收集的统计信息。 | Python | MilvusClient"
type: docx
token: Jjbsd2I8doQ9pBxBp57ckRdZnZd
sidebar_position: 3
keywords: 
  - 什么是向量数据库
  - vectordb
  - 多模态向量数据库检索
  - 检索增强生成
  - zilliz
  - zilliz cloud
  - cloud
  - get_partition_stats()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_partition_stats()

此操作显示在特定分区上收集的统计信息。

<Admonition type="info" icon="📘" title="注意">

这仅适用于托管集合。

</Admonition>

## 请求语法\{#request-syntax}

```python
get_partition_stats(
    collection_name: str,
    partition_name: str,
    timeout: Optional[float] = None
)
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    现有集合的名称。

- **partition_name** (*str*) -

    **[必需]**

    现有分区的名称。

- **timeout** (*float* | *None*)  

    此操作的超时时长。 

    将其设置为 **None** 表示此操作会在收到任意响应或发生任意错误时超时。

**返回类型：**

*dict*

**返回：**

一个包含指定分区中行数的字典。

```python
{
    'row_count': 0
}
```

<Admonition type="info" icon="📘" title="**为什么行数与插入的实体数量不一致？**">

你插入的数据在最终保存之前会经历一个处理过程。最初，它会以数据流的形式流入。然后，它会作为实体存储在 segments 中。Milvus 会选择一个合适的 growing segment 来以流的形式存储这些数据，直到该 segment 达到上限并变为 sealed。

不过，需要注意的是，显示的行数可能与插入的记录数不一致，因为流式数据不会被计算在内。

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

client.get_load_state(
    collection_name="test_collection"
)

# {'state': <LoadState: Loaded>}

# 4. Insert some data
client.insert(
    collection_name="test_collection",
    data=[
         {"id": 0, "vector": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], "color": "pink_8682"},
         {"id": 1, "vector": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], "color": "red_7025"},
         {"id": 2, "vector": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], "color": "orange_6781"},
         {"id": 3, "vector": [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], "color": "pink_9298"},
         {"id": 4, "vector": [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], "color": "red_4794"},
         {"id": 5, "vector": [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], "color": "yellow_4222"},
         {"id": 6, "vector": [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], "color": "red_9392"},
         {"id": 7, "vector": [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], "color": "grey_8510"},
         {"id": 8, "vector": [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], "color": "white_9381"},
         {"id": 9, "vector": [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], "color": "purple_4976"}
     ],
)

# {'insert_count': 10}

# 5. Get the statistics in the default partition
client.get_partition_stats(
    collection_name="test_collection",
    partition_name="_default"
)

# { 'row_count': 0 }
```

## 相关方法\{#related-methods}

- [create_partition()](./Partitions-create_partition)

- [drop_partition()](./Partitions-drop_partition)

- [has_partition()](./Partitions-has_partition)

- [list_partitions()](./Partitions-list_partitions)

- [load_partitions()](./Partitions-load_partitions)

- [release_partitions()](./Partitions-release_partitions)

