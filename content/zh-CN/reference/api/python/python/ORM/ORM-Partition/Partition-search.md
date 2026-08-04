---
title: "search() | Python | ORM"
slug: /python/python/Partition-search
sidebar_label: "search()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作执行向量相似性搜索，并可选择使用标量过滤表达式。 | Python | ORM"
type: docx
token: XW72dhBuNoqNWhxUQLtcfa6Fnwd
sidebar_position: 10
keywords: 
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
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

此操作执行向量相似性搜索，并可选择使用标量过滤表达式。

## Request Syntax\{#request-syntax}

```python
search(
    data: list[list[float]],
    anns_field: str,
    param: dict,
    limit: int
    expr: str | None,
    partition_names: list[str] | None,
    output_fields: list[str] | None,
    timeout: float | None,
    round_decimal: int,
    search_aggregation: Optional[SearchAggregation] = None
)
```

**PARAMETERS：**

- **data** (*list[list[float]]*) - 

    **[REQUIRED]**

    向量嵌入的列表。

    Zilliz Cloud 会搜索与指定向量嵌入最相似的向量嵌入。

- **anns_field** (str) -

    当前搜索目标向量字段的名称。

    此参数默认为空字符串。如果未指定此参数，则会使用默认值，这表示将集合中唯一的向量字段作为搜索目标。

- **param** (dict) -

    **[REQUIRED]**

    此操作特有的参数设置。

    - **metric_type** (*str*) -

        应用于此操作的度量类型。它应与为上述指定向量字段创建索引时使用的度量类型相同。 

        可选值为 **L2**、**IP** 和 **COSINE**。

    - **params** (dict) -

        附加参数。

        - **offset** (int) -

            搜索结果中要跳过的记录数。 

            你可以将此参数与 `limit` 结合使用，以启用分页。

            此值与 `limit` 的总和应小于 16,384。 

        - **radius** (float) -

            用于确定最低相似度的阈值。当 `metric_type` 设置为 `L2` 时，请确保此值大于 **range_filter** 的值。否则，此值应小于 **range_filter** 的值。 

        - **range_filter**  (float) -  

            将搜索范围细化为特定相似度区间内的向量。当 `metric_type` 设置为 `IP` 或 `COSINE` 时，请确保此值大于 **radius** 的值。否则，此值应小于 **radius** 的值。

    有关其他适用搜索参数的详细信息，请阅读 [AUTOINDEX Explained](/docs/autoindex-explained)。

- **limit** (*int*) -

    要返回的实体总数。

    你可以将此参数与 **param** 中的 `offset` 结合使用，以启用分页。

    此值与 **param** 中 `offset` 的总和应小于 16,384。 

- **expr** (*str*) -

    用于过滤匹配实体的标量过滤条件。

    该值默认为 **None**，表示忽略标量过滤。要构建标量过滤条件，请参见 [Boolean Expression Rules](https://milvus.io/docs/boolean.md)。

- **output_fields** (*list*) -

    返回的每个实体中要包含的字段名称列表。

    该值默认为 **None**。如果未指定，则仅包含主字段。

- **timeout** (*float*)  -

    此操作的超时时长。将其设置为 **None** 表示此操作会在收到任意响应或发生任意错误时超时。

- **round_decimal** (int) -

    Zilliz Cloud 对计算出的距离进行四舍五入时保留的小数位数。

    该值默认为 **-1**，表示 Zilliz Cloud 会跳过对计算距离的舍入并返回原始值。

- **search_aggregation** (*Optional[SearchAggregation]*) -

    分层桶聚合规范。与 **group_by_field** 互斥。设置后，将忽略 **limit**，并由根级 *SearchAggregation.size* 控制顶层桶数量。

**RETURN TYPE：**

*SearchResult*

**RETURNS：**

一个 **SearchResult** 对象，其中包含 **Hits** 对象列表。 

- 响应结构

    <Admonition type="info" icon="📘" title="说明">

    **SearchResult** 对象包含一个 **Hits** 对象列表，其中每个 **Hits** 对象都对应搜索请求中的一个查询向量。 
    
    **Hits** 对象包含一个 **Hit** 对象列表，其中每个 **Hit** 对象都对应一个被搜索命中的实体。

    </Admonition>

    ```plaintext
    ├── SearchResult
    │   └── Hits  
    │       ├── ids
    │       ├── distances
    │       └── Hit
    │           ├── id
    │           ├── distance
    │           ├── score
    │           ├── vector
    │           └── get()
    ```

- 属性和方法

    - **Hits** 对象具有以下字段：

        - **ids** (*list[int]* | *list[str]*)

            包含命中实体 ID 的列表。

        - **distances** (list[float]) 

            命中实体的向量字段与查询向量之间距离的列表。

    - **Hit** 对象具有以下字段：

        - **id** (*int* | *str*)

            命中实体的 ID。

        - **distance** (*float*)

            命中实体的向量字段与查询向量之间的距离。

        - **score** (*float*)

            **distance** 的别名。

        - **vector** (*list[float]*)   

            命中实体的向量字段。

        - **get(*field_name: str*)**

            用于获取命中实体中指定字段的值的函数。 

**EXCEPTIONS：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## Examples\{#examples}

```python
from pymilvus import Collection, Partition

# Get an existing collection
collection = Collection(name="test_collection")

# Get an existing partition
partition = Partition(name="test_partition")

BATCH_SIZE = 2
LIMIT = 10

param = {
    "metric_type": "COSINE",
    "params": {
        "nprobe": 1024,
        "radius": 0.2,
        "range_filter": 1.0
    }
}

# Create a search request
res = partition.search(
    data=[[0.1,0.2,-0.3,-0.4,0.5]],
    anns_field="vector",
    param=param,
    batch_size=BATCH_SIZE,
    limit=LIMIT,
    expr="id > 3",
    output_fields=["id", "vector"]
)

for hits in res:
    # Get ids
    hits.ids
    
    # Get distances
    hits.distances
    
    for hit in hits:
        # Get id
        hit.id
        
        # Get distance
        hit.distance # hit.score
        
        # Get vector
        hit.vector
        
        # Get output field
        hit.get("vector")
        
```

## Related operations\{#related-operations}

以下操作与 `search()` 相关：

- [delete()](./Partition-delete)

- [flush()](./Partition-flush)

- [insert()](./Partition-insert)

- [query()](./Partition-query)

- [upsert()](./Partition-upsert)

