---
title: "get() | Python | MilvusClient"
slug: /python/python/Vector-get
sidebar_label: "get()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作按其 ID 获取特定实体。 | Python | MilvusClient"
type: docx
token: TEUDde2xbo0JT7xtVvtcF53Nnub
sidebar_position: 2
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - get()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get()

此操作按其 ID 获取特定实体。

<Admonition type="info" icon="📘" title="说明">

此方法仅适用于专用服务集群和按需计算。 

- 对于服务集群中的集合上的此操作，请使用集群端点创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的集合上的此操作，请使用项目端点创建 **[MilvusClient](./Client-MilvusClient)**，然后创建一个会话以附加到按需集群进行搜索。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
get(
    collection_name: str,
    ids: Union[list, str, int],
    output_fields: Optional[List[str]] = None,
    timeout: Optional[float] = None,
    partition_names: Optional[List[str]] = None,
    **kwargs,
) -> List[dict]
```

**参数：**

- **collection_name** (*str*) -

    **[必填]**

    现有集合的名称。

- **ids** (*list* | *str* | *int*) -

    **[必填]**

    特定实体 ID 或实体 ID 列表。

- **output_fields** (*list[str]* | *None*) -

    返回的每个实体中要包含的字段名称列表。

    默认值为 **None**。如果未指定，则选择所有字段作为输出字段。

- **timeout** (*float* | *None*) -

    此操作的超时时长。 

    将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

- **partition_names** (*list[str]* | *None*) -

    分区名称列表。

    默认值为 **None**。如果指定，则仅在指定的分区中进行查询。

**返回类型：**

*list[dict]*

**返回：**

由字典组成的列表，其中每个字典表示一个已查询到的实体。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

- **DataTypeNotMatchException**

    当参数值与所需的数据类型不匹配时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(collection_name="test_collection", dimension=5)

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

# 4. Get entities

# Get an entity by its ID
res = client.get(
    collection_name="test_collection",
    ids=1
)

# [
#     {
#        'id': 1,
#        'vector': [0.19886813, 0.060235605, 0.6976963, 0.26144746, 0.8387295],
#        'color': 'red_7025'
#    }
# ]

# Get a list of entities by their IDs
res = client.get(
    collection_name="test_collection",
    ids=[2, 5, 8]
)

# [
#     {
#         'id': 2, 
#         'vector': [0.43742132, -0.55975026, 0.6457888, 0.7894059, 0.20785794], 
#         'color': 'orange_6781'
#     }, 
#     {
#         'id': 5, 
#         'vector': [0.9858251, -0.81446517, 0.6299267, 0.12069069, -0.14462778], 
#         'color': 'yellow_4222'
#     }, 
#     {
#        'id': 8, 
#        'vector': [0.3952472, 0.40002573, -0.5890507, -0.86505026, -0.6140361], 
#        'color': 'white_9381'
#     }
# ]
```

