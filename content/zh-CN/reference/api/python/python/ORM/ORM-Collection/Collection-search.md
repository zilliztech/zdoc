---
title: "search() | Python | ORM"
slug: /python/python/Collection-search
sidebar_label: "search()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作执行向量相似性搜索，并可选择使用标量过滤表达式。 | Python | ORM"
type: docx
token: OaM5dkbPjohKhNxHvKNcfnYMnVb
sidebar_position: 25
keywords: 
  - 向量检索
  - 音频相似性搜索
  - 弹性向量 Database
  - Pinecone 与 Milvus 对比
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

## 请求语法\{#request-syntax}

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

**参数：**

- **data** (*list[list[float]]*) -

    **[必需]**

    向量嵌入列表。

    Zilliz Cloud 会搜索与指定向量嵌入最相似的向量嵌入。

- **anns_field** (str) -

    **[必需]**

    当前 Collection 中向量字段的名称

- **param** (dict) -

    **[必需]**

    此操作的专用参数设置。

    - **metric_type** (*str*) -

        应用于此操作的度量类型。该值应与为上述指定向量字段创建索引时使用的度量类型相同。

        可选值包括 **L2**、**IP** 和 **COSINE**。

    - **params** (dict) -

        附加参数

        - **offset** (int) -

            搜索结果中要跳过的记录数。

            您可以将此参数与 `limit` 结合使用，以启用分页。

            此值与 `limit` 之和应小于 16,384。

        - **radius** (float) -

            确定最低相似度阈值。当将 `metric_type` 设置为 `L2` 时，请确保该值大于 **range_filter** 的值。否则，该值应小于 **range_filter** 的值。

        - **range_filter**  (float) -

            将搜索范围细化为特定相似度区间内的向量。当将 `metric_type` 设置为 `IP` 或 `COSINE` 时，请确保该值大于 **radius** 的值。否则，该值应小于 **radius** 的值。

    有关其他适用搜索参数的详细信息，请参阅 [AUTOINDEX Explained](/docs/autoindex-explained)。

- **limit** (*int*) -

    要返回的 Entity 总数。

    您可以将此参数与 **param** 中的 `offset` 结合使用，以启用分页。

    此值与 **param** 中的 `offset` 之和应小于 16,384。

- **expr** (*str*) -

    用于过滤匹配 Entity 的标量过滤条件。

    该值默认为 **None**，表示忽略标量过滤。要构建标量过滤条件，请参阅 [Boolean Expression Rules](https://milvus.io/docs/boolean.md)。

- **output_fields** (*list*) -

    返回时要包含在每个 Entity 中的字段名称列表。

    该值默认为 **None**。如果未指定，则仅包含主字段。

- **partition_names** (*list*) -

    Partition 名称列表。

    该值默认为 **None**。如果指定，则仅在指定的 Partition 中执行查询。

- **timeout** (*float*)  -

    此操作的超时时长。将其设置为 **None** 表示当收到任意响应或发生任意错误时，此操作超时。

- **round_decimal** (*int*) -

    Zilliz Cloud 对计算出的距离进行四舍五入时保留的小数位数。

    该值默认为 **-1**，表示 Zilliz Cloud 跳过对计算距离的四舍五入并返回原始值。

- **search_aggregation** (*Optional[SearchAggregation]*) -

    分层桶聚合规范。与 **group_by_field** 互斥。设置后，将忽略 **limit**，并由根 `SearchAggregation.size` 控制顶层桶数量。

- **consistency_level** (*str*) -

    Milvus 在指定 Collection 内执行搜索时使用的一致性级别。

    如果未指定此参数，将使用创建 Collection 时指定的一致性级别。指定此参数会覆盖创建 Collection 时指定的值。

    可选值包括 **Strong**、**Bounded**、**Eventually**、**Session** 和 **Customized**。

- **page_retain_order** (*bool*) -

    提供 `offset` 时，是否保留搜索结果的顺序。

- **guarantee_timestamp** (*int*) -

    Milvus 在搜索期间用作参考的时间戳。

    如果未指定此参数，Milvus 将在所有已 flush 的 Entity 中搜索。设置此值后，Milvus 将仅在指定时间戳之前已 flush 的 Entity 中搜索。

- **graceful_time** (*int*) -

    搜索的宽限时间（以秒为单位）。

    设置此值后，Milvus 将在指定秒数之前已 flush 的 Entity 中搜索。

**返回类型：**

*SearchResult*

**返回值：**

包含 **Hits** 对象列表的 **SearchResult** 对象。

- 响应结构

    <Admonition type="info" icon="📘" title="Notes">

    **SearchResult** 对象包含一个 **Hits** 对象列表，其中每个对象对应搜索请求中的一个查询向量。
    
    **Hits** 对象包含一个 **Hit** 对象列表，其中每个对象对应搜索命中的一个 Entity。

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

            包含命中 Entity ID 的列表。

        - **distances** (list[float])

            命中 Entity 的向量字段与查询向量之间距离的列表。

    - **Hit** 对象具有以下字段：

        - **id** (*int* | *str*)

            命中 Entity 的 ID。

        - **distance** (*float*)

            命中 Entity 的向量字段与查询向量之间的距离。

        - **score** (*float*)

            **distance** 的别名。

        - **vector** (*list[float]*)

            命中 Entity 的向量字段。

        - **get(*field_name: str*)**

            用于获取命中 Entity 中指定字段值的函数。

**异常：**

- **MilvusException**

    此操作期间发生任何错误时，都会引发此异常。

## 示例\{#examples}

```python
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType

schema = CollectionSchema([
    FieldSchema("id", DataType.INT64, is_primary=True),
    FieldSchema("vector", DataType.FLOAT_VECTOR, dim=5)
])

# Create a collection
collection = Collection(
    name="test_collection",
    schema=schema
)

# Insert a list of columns
res = collection.insert(
    data=[
        [0,1,2,3,4,5,6,7,8,9],               # id
        [                                    # vector
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
        ],
    ]
)

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
res = collection.search(
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

## 相关操作\{#related-operations}

- [delete()](./Collection-delete)

- [insert()](./Collection-insert)

- [search_iterator()](./Collection-search_iterator)

- [query()](./Collection-query)

- [query_iterator()](./Collection-query_iterator)

- [upsert()](./Collection-upsert)

