---
title: "search_iterator() | Python | MilvusClient"
slug: /python/python/Vector-search_iterator
sidebar_label: "search_iterator()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "该操作以迭代方式执行向量相似度搜索，并可选择附加标量过滤表达式。 | Python | MilvusClient"
type: docx
token: T9KhdDJQColJEuxZ7YOcV2zdnlb
sidebar_position: 7
keywords: 
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database
  - zilliz
  - zilliz cloud
  - cloud
  - search_iterator()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# search_iterator()

该操作以迭代方式执行向量相似度搜索，并可选择附加标量过滤表达式。

<Admonition type="info" icon="📘" title="说明">

外部 Collection 不支持此操作。

</Admonition>

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
    round_decimal: int = -1
    **kwargs,
) -> List[List[dict]]
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    已存在的 collection 名称。

- **data** (*List[list], list]*) -

    **[必需]**

    向量嵌入列表。

    Zilliz Cloud 会搜索与指定向量嵌入最相似的向量嵌入。

- **batch_size** (*int*) -

    每次迭代返回的实体数量。默认值为 1000。

- **anns_field** (*str*) -

    当前搜索的目标向量字段名称。

- **filter** (*str*) -

    用于过滤匹配实体的标量过滤条件。 

    默认值为空字符串，表示不应用任何条件。

    你可以将此参数设置为空字符串以跳过标量过滤。关于如何构建标量过滤条件，请参见 [Filtering Overview](/docs/filtering-overview)。 

- **limit** (*int*) -

    要返回的实体总数。

    你可以将此参数与 **param** 中的 **offset** 结合使用，以启用分页。

    此值与 **param** 中 **offset** 的总和应小于 16,384。 

- **output_fields** (l*ist[str]*) -

    返回结果中每个实体要包含的字段名称列表。

    默认值为 **None**。如果未指定，则仅包含主字段。

- **search_params** (*dict*) -

    此操作特有的参数设置。

    - **params** (dict) -

        附加参数

        - **radius** (float) -

            确定最低相似度阈值。当 collection 的 metric type 设置为 `L2` 时，请确保该值大于 **range_filter** 的值。否则，该值应小于 **range_filter** 的值。 

        - **range_filter**  (float) -  

            将搜索限定在特定相似度范围内的向量上。当 collection 的 metric type 为 `IP` 或 `COSINE` 时，请确保该值大于 **radius** 的值。否则，该值应小于 **radius** 的值。

        - **level** (*int*)

            Zilliz Cloud 使用统一参数来简化搜索参数调优，而不是让你处理各种索引算法特有的大量搜索参数。

            默认值为 **1**，取值范围为 **1** 到 **10**。增大该值会提高召回率，但会降低搜索性能。详情请参见 [Tune Recall Rate](/docs/tune-recall-rate)。

        - **page_retain_order** (*bool*) -

            在提供 `offset` 时，是否保留搜索结果的顺序。 

            此参数仅在你同时设置了 `radius` 时适用。

    有关其他适用搜索参数的详细信息，请阅读 [AUTOINDEX Explained](/docs/autoindex-explained)。

- **group_by_field** (*str*)

    按指定字段对搜索结果进行分组，以确保结果多样性并避免返回同一组中的多个结果。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作即超时。

- **partition_names** (*list*) -

    分区名称列表。

    默认值为 **None**。如果指定，则仅在指定分区中执行查询。

- **anns_field** (*string*) -

    目标向量字段的名称。如果目标 collection 中只有一个向量字段，则此参数为可选。

- **round_decimal** (*int*) -

    距离值保留的小数位数。默认值为 -1，表示不进行四舍五入。

- **kwargs** -

    - **offset** (int) -

        在搜索结果中要跳过的记录数。 

        你可以将此参数与 `limit` 结合使用，以启用分页。

        此值与 `limit` 的总和应小于 16,384。 

    - **round_decimal** (int) -

        Zilliz Cloud 对计算出的距离值进行四舍五入时保留的小数位数。

        默认值为 **-1**，表示 Zilliz Cloud 不对计算出的距离值进行四舍五入，而是返回原始值。

**返回类型：**

*SearchIterator*

**返回值：**
一个 **SearchIterator** 实例，提供以下方法：

- `next()`

    此方法以迭代方式返回一批实体。每次调用时，都会返回一组新的实体，直到检索到最后一个实体为止。

- `close()`

    此方法关闭当前的 **SearchIterator** 实例。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
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
    "metric_type": "IP",
    "params": {}
}

# Search with search iterator
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

