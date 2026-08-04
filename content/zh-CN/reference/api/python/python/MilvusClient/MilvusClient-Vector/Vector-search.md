---
title: "search() | Python | MilvusClient"
slug: /python/python/Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用可选的标量过滤表达式执行向量相似性搜索。 | Python | MilvusClient"
type: docx
token: DvaZdhYnyoo7lOxNIBwc5eKEn7d
sidebar_position: 6
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - search()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# search()

此操作使用可选的标量过滤表达式执行向量相似性搜索。

<Admonition type="info" icon="📘" title="说明">

此方法仅适用于专用服务集群和按需计算。 

- 如果要在服务集群的集合中执行此操作，请使用集群端点创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 如果要在按需计算的集合中执行此操作，请使用项目端点创建 **[MilvusClient](./Client-MilvusClient)**，然后创建一个会话并将其附加到按需集群以执行搜索。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
search(
    self,
    collection_name: str,
    data: Union[List[list], list],
    ids: Union[List[str], List[int]],
    filter: str = "",
    limit: int = 10,
    output_fields: Optional[List[str]] = None,
    search_params: Optional[dict] = None,
    timeout: Optional[float] = None,
    partition_names: Optional[List[str]] = None,
    anns_field: Optional[str] = None,
    ranker: Optional[Union[Function, FunctionScore]] = None,
    highlighter: Optional[Highlighter] = None,
    group_by: Optional[GroupBy] = None,
    order_by_fields: Optional[List[dict]] = None,
    search_aggregation: Optional[SearchAggregation] = None,
    **kwargs,
) -> List[List[dict]]
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    已存在集合的名称。

- **data** (*List[list], list]*) -

    **[必需]**

    向量嵌入列表。

    Zilliz Cloud 会搜索与指定向量嵌入最相似的向量嵌入。

    此参数与 **ids** 互斥。

- **ids** (*Union[List[str], List[int]]*) -

    主键列表。

    Zilliz Cloud 会搜索与指定实体中的向量嵌入最相似的向量嵌入。

    此参数与 **data** 互斥。

- **anns_field** (*str*) -

    当前搜索目标向量字段的名称。

- **filter** (*str*) -

    用于过滤匹配实体的标量过滤条件。 

    默认值为空字符串，表示不应用任何条件。 

    你可以将此参数设置为空字符串以跳过标量过滤。有关如何构建标量过滤条件，请参见 [Filtering Overview](/docs/filtering-overview)。 

- **filter_params** (*dict*) -

    如果你选择按照 [Filtering Templating](/docs/filtering-templating) 中所述在 `filter` 中使用占位符，则可以通过此参数的值以键值对形式为这些占位符指定实际值。

- **limit** (*int*) -

    要返回的实体总数。

    你可以将此参数与 **param** 中的 **offset** 结合使用以启用分页。

    此值与 **param** 中 **offset** 的总和应小于 16,384。 

    不过，在分组搜索中，`limit` 表示要返回的最大分组数，而不是单个实体数。每个分组都基于指定的 `group_by_field` 形成。

    <Admonition type="info" icon="📘" title="说明">

    当为搜索聚合指定 `group_by` 时，请不要显式设置 `limit`。请使用根级 `GroupBy.size` 值来控制返回的顶层 bucket 数量。

    </Admonition>

- **output_fields** (l*ist[str]*) -

    返回时每个实体中要包含的字段名称列表。

    默认值为 **None**。如果未指定，则仅包含主字段。

- **search_params** (*dict*) -

    此操作特有的参数设置。

    - **radius** (float) -

        确定最低相似度阈值。当集合的度量类型设置为 L2 时，请确保此值大于 **range_filter**。否则，此值应小于 **range_filter**。 

    - **range_filter**  (float) -  

        将搜索结果限定在特定相似度范围内的向量。当集合的度量类型设置为 `IP` 或 `COSINE` 时，请确保此值大于 **radius**。否则，此值应小于 **radius**。

    - **level** (*int*)

        Zilliz Cloud 使用统一参数来简化搜索参数调优，而不是让你面对各种索引算法特有的大量搜索参数。

        默认值为 **1**，取值范围为 **1** 到 **5**。增大该值会提高召回率，但会降低搜索性能。

    - **page_retain_order** (*bool*) -

        当提供 `offset` 时，是否保留搜索结果的顺序。 

        此参数仅在同时设置 `radius` 时适用。

    - **params** (dict) -

        附加参数。

        <Admonition type="info" icon="📘" title="说明">

        所有附加参数都已移至上层 `search_params`，`params` 参数即将弃用。

        </Admonition>

        - **radius** (float) -

            确定最低相似度阈值。当集合的度量类型设置为 `L2` 时，请确保此值大于 **range_filter**。否则，此值应小于 **range_filter**。 

        - **range_filter**  (float) -  

            将搜索结果限定在特定相似度范围内的向量。当集合的度量类型设置为 `IP` 或 `COSINE` 时，请确保此值大于 **radius**。否则，此值应小于 **radius**。

        - **level** (*int*)

            Zilliz Cloud 使用统一参数来简化搜索参数调优，而不是让你面对各种索引算法特有的大量搜索参数。

            默认值为 **1**，取值范围为 **1** 到 **5**。增大该值会提高召回率，但会降低搜索性能。

        - **page_retain_order** (*bool*) -

            当提供 `offset` 时，是否保留搜索结果的顺序。 

            此参数仅在同时设置 `radius` 时适用。

    - **ignore_growing** (*str*) -

        设置此选项后，搜索将排除 growing segments 中的数据。使用此设置可以仅关注已建立索引且已完全处理的数据，从而可能提升搜索性能。

    有关其他适用搜索参数的详细信息，请参见 [In-memory Index](https://milvus.io/docs/index.md) 和 [On-disk Index](https://milvus.io/docs/disk_index.md)。

    有关其他适用搜索参数的详细信息，请阅读 [AUTOINDEX Explained](/docs/autoindex-explained)。

- **group_by_field** (*str*)

    按指定字段对搜索结果进行分组，以确保结果多样性并避免从同一分组返回多个结果。

    此参数由 Grouping Search 使用。它与 `group_by` 互斥。

- **group_size** (*int*)

    在分组搜索中，每个分组内目标返回的实体数量。例如，设置 `group_size=2` 会指示系统在每个分组内最多返回 2 个最相似的实体（例如文档段落或向量表示）。如果未设置 `group_size`，系统默认每个分组仅返回 1 个实体。

- **strict_group_size** (*bool*)

    此布尔参数用于指定是否严格执行 `group_size`。当 `strict_group_size=True` 时，只要每个分组中有足够的数据，系统将尝试让每个分组精确返回 `group_size` 条结果。如果某个分组中的实体数量不足，则仅返回可用实体，同时确保数据充足的分组满足指定的 `group_size`。

- **group_by** (*GroupBy | None*) -

    定义搜索聚合的 `GroupBy` 对象。指定此参数后，Zilliz Cloud 会根据根 `GroupBy` 对象中的字段将 ANN 搜索结果分组到各个 bucket 中。每个 bucket 可包含每个 bucket 的指标、代表性命中结果以及嵌套子分组。`group_by` 与 `group_by_field` 互斥。对于现有的单字段 Grouping Search 工作流，请使用 `group_by_field`。当你需要每个 bucket 的指标、多字段分组、bucket 排序、命中排序或嵌套分组时，请使用 `group_by`。

    <Admonition type="info" icon="📘" title="说明">

    搜索聚合指标是基于 ANN 检索到的实体计算的，而不是基于整个集合。bucket 计数、指标以及基于指标的排序都是近似值。

    </Admonition>

- **order_by_fields** (*list[dict] | None*) -

    用于按受支持的标量字段对搜索结果进行排序的 order-by 规范列表。

    列表中的每个字典包含以下键：

    - **field** (*str*) -

        要排序的标量字段名称。

    - **order** (*str*) -

        排序方向。可选值为 `"asc"` 和 `"desc"`。如果省略此键，Milvus 将按升序对该字段排序。

    Zilliz Cloud 会按照你指定的顺序依次应用多个 order-by 字段。对于在所有指定 order-by 字段中值都相同的实体，Zilliz Cloud 会保留原始的相似度分数顺序。

    在分组搜索中，Zilliz Cloud 会根据每个分组顶层实体的指定标量字段值对分组排序。`limit` 参数仍控制分组数量，`group_size` 控制每个分组中的实体数量。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

- **partition_names** (*list*) -

    分区名称列表。

    默认值为 **None**。如果指定，则仅在指定分区中执行查询。

- **ranker** (*[Function](./MilvusClient-Function)* | *[FunctionScore](./MilvusClient-FunctionScore)*) -

    搜索使用的排序器。

    详情请参见 [Decay Ranker Overview](/docs/decay-ranker-oveview) 和 。

- **highlighter** (*Highlighter*) -

    在搜索操作中用于高亮匹配项的高亮器。详情请参见 [Lexical Highlighter](/docs/text-highlighter) 和 [Semantic Highlighter](/docs/semantic-highlighter)。

- **search_aggregation** (*Optional[SearchAggregation]*) -

    分层 bucket 聚合规范。与 **group_by_field** 互斥。设置后，将忽略 **limit**，并由根 `SearchAggregation.size` 控制顶层 bucket 数量。

- **kwargs** -

    - **offset** (int) -

        在搜索结果中要跳过的记录数。 

        你可以将此参数与 `limit` 结合使用以启用分页。

        此值与 `limit` 的总和应小于 16,384。 

    - **round_decimal** (int) -

        Zilliz Cloud 对计算出的距离进行四舍五入时保留的小数位数。

        默认值为 **-1**，表示 Zilliz Cloud 不对计算距离进行四舍五入，而是返回原始值。

    - **timezone** (*str*)

        通过设置一个 [IANA identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)（例如 **Asia/Shanghai**、**America/Chicago** 或 **UTC**），临时覆盖单次查询的集合或数据库默认时区。这仅控制该操作期间如何解释、显示和比较 `TIMESTAMPTZ` 值；不会修改已存储的数据或集合设置。

        更多信息，请参见 [TIMESTAMPZ Field](/docs/use-timestamptz-field)。

    - **time_fields** (*str*)

        在查询或搜索操作期间，从 `TIMESTAMPTZ` 字段中提取特定时间组成部分。使用逗号分隔列表指定要提取的元素。支持的元素包括：`year`、`month`、`day`、`hour`、`minute`、`second` 和 `microsecond`。

        更多信息，请参见 TIMESTAMPZ Field。

**返回类型：**

*list[dict]*

**返回值：**
包含搜索到的实体及指定输出字段的字典列表。

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
    "params": {}
}

# Search with limit
res = client.search(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=3,
    search_params=search_params
)

# [[{'id': 7, 'distance': 0.4801957309246063, 'entity': {}},
#   {'id': 2, 'distance': 0.3205878734588623, 'entity': {}},
#   {'id': 1, 'distance': 0.2993225157260895, 'entity': {}}]]

# Search with filter
res = client.search(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=3,
    filter='color like "red%"',
    search_params=search_params
)

# [[{'id': 1, 'distance': 0.2993225157260895, 'entity': {}},
#   {'id': 4, 'distance': 0.12666261196136475, 'entity': {}},
#   {'id': 6, 'distance': -0.3535143733024597, 'entity': {}}]]

# Search with an offset
res = client.search(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=3,
    offset=3,
    search_params=search_params
)

# [[{'id': 4, 'distance': 0.12666261196136475, 'entity': {}},
#   {'id': 3, 'distance': 0.11930042505264282, 'entity': {}},
#   {'id': 5, 'distance': -0.05843167006969452, 'entity': {}}]]

# Search with output fields
res = client.search(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=3,
    output_fields=["vector", "color"],
    search_params=search_params
)

# [[{'id': 7,
#    'distance': 0.4801957309246063,
#    'entity': {'color': 'grey_8510',
#     'vector': [-0.33445146679878235,
#      -0.25671350955963135,
#      0.8987540006637573,
#      0.9402995705604553,
#      0.537806510925293]}},
#   {'id': 2,
#    'distance': 0.3205878734588623,
#    'entity': {'color': 'orange_6781',
#     'vector': [0.4374213218688965,
#      -0.5597502589225769,
#      0.6457887887954712,
#      0.789405882358551,
#      0.20785793662071228]}},
#   {'id': 1,
#    'distance': 0.2993225157260895,
#    'entity': {'color': 'red_7025',
#     'vector': [0.19886812567710876,
#      0.060235604643821716,
#      0.697696328163147,
#      0.2614474594593048,
#      0.8387295007705688]}}]]

# Conduct a range search
search_params = {
    "metric_type": "IP",
    "params": {
        "radius": 0.1,
        "range_filter": 0.8
    }
}

res = client.search(
    collection_name="test_collection",
    data=[[0.05, 0.23, 0.07, 0.45, 0.13]],
    limit=3,
    search_params=search_params
)

# [[{'id': 7, 'distance': 0.4801957309246063, 'entity': {}},
#   {'id': 2, 'distance': 0.3205878734588623, 'entity': {}},
#   {'id': 1, 'distance': 0.2993225157260895, 'entity': {}}]]
```

