---
title: "query_iterator() | Python | MilvusClient"
slug: /python/python/Vector-query_iterator
sidebar_label: "query_iterator()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作以迭代方式使用指定的布尔表达式执行标量过滤。 | Python | MilvusClient"
type: docx
token: L6i8dmvsBogcmIxtORsc1Mu0nhg
sidebar_position: 5
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - query_iterator()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# query_iterator()

此操作以迭代方式使用指定的布尔表达式执行标量过滤。

<Admonition type="info" icon="📘" title="说明">

外部集合不支持此操作。

</Admonition>

## 请求语法\{#request-syntax}

```python
query_iterator(
    collection_name: str,
    batch_size: Optional[int] = 1000,
    limit: Optional[int] = UNLIMITED,
    filter: str,
    output_fields: Optional[List[str]] = None,
    timeout: Optional[float] = None,
    partition_names: Optional[List[str]] = None,
    **kwargs,
) -> List[dict]
```

**参数：**

- **collection_name** (*str*) -

    **[必填]**

    现有 collection 的名称。

- **batch_size** (*int*) -

    每次迭代返回的实体数量。默认值为 1000。

- **limit** (*int*) -

    要返回的实体总数。该参数值应小于 16,384。 

- **filter** (*str*) -

    **[必填]**

    用于筛选匹配实体的标量过滤条件。 

    您可以将此参数设置为空字符串以跳过标量过滤。有关构建标量过滤条件的更多信息，请参见[过滤概述](/docs/filtering-overview)。 

- **output_fields** (*list[str]* | *None*) -

    返回的每个实体中要包含的字段名列表。

    默认值为 **None**。

    <Admonition type="info" icon="📘" title="说明">

    - 将其设置为 `output_fields=["\*"]` 会输出所有字段。
    
    - 将其设置为 `output_fields=["count(\*)"]` 会输出与 **filter** 参数中指定条件匹配的已加载实体数量。 

    </Admonition>

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

- **partition_names** (*list[str]* | *None*) -

    分区名称列表。

    默认值为 **None**。如果指定，则仅在指定分区中执行查询。

- **kwargs** -

    - **consistency_level** (*str* | *int*) -

        目标 collection 的一致性级别。

        其值默认与创建当前 collection 时指定的值相同，可选值为 **Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**) 和 **Eventually** (**3**)。

        <Admonition type="info" icon="📘" title="说明">

        什么是一致性级别？
        
                在分布式数据库中，一致性特指这样一种属性：在给定时间写入或读取数据时，确保每个节点或副本对数据具有相同的视图。
        
                Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认设置为 **Bounded Staleness**。
        
                您可以在执行向量相似性搜索或查询时轻松调整一致性级别，使其最适合您的应用程序。

        </Admonition>

    - **guarantee_timestamp** (*int*) -

        一个有效的时间戳。 

        如果设置了此参数，只有在该时间戳之前插入的所有实体对查询节点可见时，才会执行查询。 

        <Admonition type="info" icon="📘" title="说明">

        当应用默认一致性级别时，此参数有效。

        </Admonition>

    - **graceful_time** (*int*) -

        一个以秒为单位的时间段。

        默认值为 **5**。如果设置了此参数，则会通过从当前时间戳中减去该值来计算保证时间戳。

        <Admonition type="info" icon="📘" title="说明">

        当应用的不是默认一致性级别时，此参数有效。

        </Admonition>

    - **offset** (*int*) -

        查询结果中要跳过的记录数。 

        您可以将此参数与 `limit` 结合使用以启用分页。

        此值与 `limit` 的总和应小于 16,384。 

    - **limit** (*int*) -

        查询结果中要返回的记录数。

        您可以将此参数与 `offset` 结合使用以启用分页。

        此值与 `offset` 的总和应小于 16,384。 

**返回类型：**

*QueryIterator*

**返回：**

一个 **QueryIterator** 实例，提供以下方法：

- `next()`

    此方法会以迭代方式返回一批实体。每次调用时，都会返回一组新的实体，直到取回最后一个实体为止。

- `close()`

    此方法会关闭当前 **QueryIterator** 实例。

<Admonition type="info" icon="📘" title="说明">

如果返回的实体数量少于预期，您的 collection 中可能存在重复实体。

</Admonition>

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

- **DataTypeNotMatchException**

    当参数值与所需数据类型不匹配时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection and a partition
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

client.create_partition(
    collection_name="test_collection",
    partition_name="partitionA"
)

# 3. Insert data
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

# 4. Conduct queries

# Query with query iterator
iterator = client.query_iterator(
    collection_name="test_collection",
    batch_size=1000,
    filter="id in [6,7,8]",
)

results = []

while True:
    result = iterator.next()
    if not result:
        iterator.close()
        break
        
    for hit in result:
        results.append(hit.to_dict())
```

