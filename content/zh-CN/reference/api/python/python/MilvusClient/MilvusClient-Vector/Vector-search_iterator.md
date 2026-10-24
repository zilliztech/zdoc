---
title: "search_iterator() | Python | MilvusClient"
slug: /python/python/Vector-search_iterator
sidebar_label: "search_iterator()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作以迭代方式执行向量相似性搜索，并可使用可选的标量过滤表达式。 | Python | MilvusClient"
type: docx
token: Z8WId53zDonHYuxckCDccOEcnjb
sidebar_position: 7
keywords: 
  - 向量 Database 如何工作
  - 向量数据库对比
  - OpenAI 向量数据库
  - 自然语言处理 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - search_iterator()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# search_iterator()

此操作以迭代方式执行向量相似性搜索，并可使用可选的标量过滤表达式。

## 请求语法\{#request-syntax}

```python
search_iterator(
    self,
    collection_name: str,
    data: Union[List[list], list],
    batch_size: Optional[int] = 1000,
    filter: str = "",
    limit: int = 10,
    output_fields: Optional[List[str]] = None,
    search_params: Optional[dict] = None,
    timeout: Optional[float] = None,
    partition_names: Optional[List[str]] = None,
    anns_field: Optional[str] = None,
    round_decimal: int = -1,
    *,
    external_filter_func: Optional[Callable[[Hits], Union[Hits, List[Hit]]]] = None,
    **kwargs,
) -> List[List[dict]]
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    现有 Collection 的名称。

- **data** (*List[list], list]*) -

    **[必需]**

    向量嵌入列表。Milvus 会搜索与指定向量嵌入最相似的向量嵌入。

- **batch_size** (*int*) -

    每次迭代返回的 Entity 数量。该值默认为 1000。

- **filter** (*str*) -

    用于筛选匹配 Entity 的标量过滤条件。该值默认为空字符串，表示不应用任何条件。您可以将此参数设置为空字符串以跳过标量过滤。要构建标量过滤条件，请参见布尔表达式规则。

- **limit** (*int*) -

    要返回的 Entity 总数。此操作不支持 offset 参数。

- **output_fields** (*list[str]*) -

    返回的每个 Entity 中要包含的字段名称列表。该值默认为 None。如果未指定，则仅包含主字段。

- **search_params** (*dict*) -

    此操作专用的参数设置。params (dict)：附加参数 radius (float)：确定最低相似度阈值。当 Collection 的度量类型设置为 L2 时，请确保此值大于 range_filter 的值。否则，此值应小于 range_filter 的值。range_filter (float)：将搜索细化为特定相似度范围内的向量。当 Collection 的度量类型为 IP 或 COSINE 时，请确保此值大于 radius 的值。否则，此值应小于 radius 的值。max_empty_result_buckets (int)：此参数仅用于 IVF 系列索引的范围搜索，包括 BIN_IVF_FLAT、IVF_FLAT、IVF_SQ8、IVF_PQ 和 SCANN。该值默认为 1，范围为 1 到 65536。在范围搜索期间，如果无有效范围搜索结果的桶数量达到指定值，搜索过程会提前终止。增大此参数可提高范围搜索召回率。ignore_growing (str)：设置此选项后，搜索将排除 growing Segment 中的数据。利用此设置仅关注已索引且已完全处理的数据，可能有助于提升搜索性能。有关其他适用搜索参数的详细信息，请参见 In-memory Index 和 On-disk Index。

- **group_by_field** (*str*) -

    此选项按指定字段对搜索结果进行分组，以确保结果多样性，并避免从同一分组中返回多个结果。

- **timeout** (*float | None*) -

    此操作的超时时长。将此参数设置为 None 表示当收到任意响应或发生任何错误时，此操作即超时。

- **partition_names** (*list*) -

    Partition 名称列表。该值默认为 None。如果已指定，则只有指定的 Partition 会参与查询。此参数不适用于 Milvus Lite。有关 Milvus Lite 限制的更多信息，请参见 Run Milvus Lite。

- **anns_field** (*string*) -

    目标向量字段的名称。如果目标 Collection 中只有一个向量字段，则此参数为可选参数。

- **round_decimal** (*int*) -

    距离值的小数位数。默认值为 -1，表示不进行舍入。

- **external_filter_func** (*Callable*) -

    用于筛选每一页搜索命中的客户端回调。该回调接收一页的 Hits 对象，并返回筛选后的 Hits 对象或 Hit 对象列表。此参数仅限关键字参数，并且受 Search Iterator V2 支持。

- **kwargs** (*Any*) -

    要传递给搜索操作的其他参数。

**返回类型：**

*SearchIterator*

**返回：**

一个 SearchIterator 实例，提供以下方法： - next() 此方法以迭代方式返回一批 Entity。每次调用时，都会返回一组新的 Entity，直到检索到最后一个 Entity。 - close() 此方法关闭当前 SearchIterator 实例。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 2. Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5
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

# 4. Conduct a search
search_params = {
    "params": {}
}

# Search with output fields
iterator = client.search_iterator(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    batch_size=1000,
    output_fields=["vector", "color"],
    search_params=search_params
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

<Admonition type="info" title="Notes">

外部 Collection 不支持此操作。

</Admonition>
