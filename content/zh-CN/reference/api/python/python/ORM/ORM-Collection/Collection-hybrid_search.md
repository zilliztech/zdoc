---
title: "hybrid_search() | Python | ORM"
slug: /python/python/Collection-hybrid_search
sidebar_label: "hybrid_search()"
beta: NEAR DEPRECATE
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作在 Collection 上执行多向量搜索，并在重排序后返回搜索结果。 | Python | ORM"
type: docx
token: QqOSdTDaLoOKGRxiKEtcuuiAnrf
sidebar_position: 17
keywords: 
  - milvus 向量数据库
  - Zilliz Cloud
  - 什么是 Milvus
  - milvus Database
  - zilliz
  - zilliz cloud
  - 云
  - hybrid_search()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# hybrid_search()

此操作在 Collection 上执行多向量搜索，并在重排序后返回搜索结果。

## 请求语法\{#request-syntax}

```python
hybrid_search(
    reqs: List,
    rerank: BaseRanker,
    limit: int,
    partition_names: Optional[List[str]] = None,
    output_fields: Optional[List[str]] = None,
    timeout: Optional[float] = None,
    round_decimal: int = -1,
)
```

**参数：**

- **reqs** (*List[AnnSearchRequest]*) -

    搜索请求列表，其中每个请求都是一个 **ANNSearchRequest** 对象。每个请求对应不同的向量字段和不同的一组搜索参数。

    - **ANNSearchRequest**：表示 ANN 搜索请求的类。

        ```python
        ├── AnnSearchRequest
        │   └── data  
        │   └── anns_field
        │   └── param 
        │   └── limit 
        │   └── expr
        ```

        - **data** (*List*)：要在请求中搜索的查询向量。此参数接受一个仅包含单个元素的列表。

        - **anns_field** (*str*)：请求中使用的向量字段。

        - **param** (*dict*)：请求的搜索参数字典。更多信息，请参见 [搜索参数](https://milvus.io/docs/single-vector-search#search-parameters)。

        - **limit** (*int*)：请求中返回结果的最大数量。在使用多个 ANN 搜索请求执行混合搜索时，每个请求中由 **limit** 定义的顶部结果会先合并并重新排序，然后再返回最终搜索结果。

        - **expr** (*str*)：（可选）用于过滤结果的表达式。

- **rerank** (*BaseRanker*) -

    用于混合搜索的重排序策略。有效值：`WeightedRanker` 和 `RRFRanker`。

    - `WeightedRanker`：Average Weighted Scoring 重排序策略，根据相关性对向量进行优先级排序，并对其重要性取平均。

    - `RRFRanker`：RRF 重排序策略，合并多个搜索的结果，并优先保留持续出现的项。

- **limit** (*int*) -

    要返回的 Entity 总数。

    您可以将此参数与 **param** 中的 `offset` 结合使用，以启用分页。

    此值与 **param** 中的 `offset` 之和应小于 16,384。

- **partition_names** (*List[str]*) -

    Partition 名称列表。

    该值默认为 **None**。如果指定，则仅指定的 Partition 会参与查询。

- **output_fields** (*List[str]*) -

    返回结果中每个 Entity 要包含的字段名称列表。

    该值默认为 **None**。如果未指定，则仅包含主字段。

- **timeout** (*float*) -

    此操作的超时时长。将其设置为 **None** 表示当任意响应到达或发生任意错误时，此操作即超时。

- **round_decimal** (int) -

    Milvus 对计算出的距离进行四舍五入时保留的小数位数。

    该值默认为 **-1**，表示 Milvus 跳过对计算距离的四舍五入，并返回原始值。

- **group_by_field** (*str*)

    按指定字段对搜索结果进行分组，以确保多样性并避免返回来自同一组的多个结果。更多信息，请参见 [Grouping Search](https://milvus.io/docs/grouping-search.md#Grouping-Search)。

- **group_size** (*int*)

    在分组搜索中，每组要返回的目标 Entity 数量。更多信息，请参见 [Grouping Search](https://milvus.io/docs/grouping-search.md#Grouping-Search)。

- **strict_group_size** (*bool*)

    控制是否严格执行 **group_size**。更多信息，请参见 [Grouping Search](https://milvus.io/docs/grouping-search.md#Grouping-Search)。

**返回类型：**

*SearchResult*

**返回值：**

包含 **Hits** 对象列表的 **SearchResult** 对象。 

- 响应结构

    <Admonition type="info" icon="📘" title="Notes">

    **SearchResult** 对象包含一个 **Hits** 对象列表，其中每个对象对应搜索请求中的一个查询向量。 
    
    **Hits** 对象包含一个 **Hit** 对象列表，其中每个对象对应一个被搜索命中的 Entity。

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

    - **Hits** 对象包含以下字段：

        - **ids** (*list[int]* | *list[str]*)

            包含命中 Entity ID 的列表。

        - **distances** (list[float]) 

            命中 Entity 的向量字段到查询向量的距离列表。

    - **Hit** 对象包含以下字段：

        - **id** (*int* | *str*)

            命中 Entity 的 ID。

        - **distance** (*float*)

            命中 Entity 的向量字段到查询向量的距离。

        - **score** (*float*)

            **distance** 的别名。

        - **vector** (*list[float]*)   

            命中 Entity 的向量字段。

        - **get(*field_name: str*)**

            用于获取命中 Entity 中指定字段值的函数。 

**异常：**

- **MilvusException**

    在此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
collection = Collection(name='{your_collection_name}') # Replace with the actual name of your collection

res = collection.hybrid_search(
    reqs=[
        AnnSearchRequest(
            data=[['{your_text_query_vector}']],  # Replace with your text vector data
            anns_field='{text_vector_field_name}',  # Textual data vector field
            param={"metric_type": "IP", "params": {"nprobe": 10}}, # Search parameters
            limit=2
        ),
        AnnSearchRequest(
            data=[['{your_image_query_vector}']],  # Replace with your image vector data
            anns_field='{image_vector_field_name}',  # Image data vector field
            param={"metric_type": "IP", "params": {"nprobe": 10}}, # Search parameters
            limit=2
        )
    ],
    # Use WeightedRanker to combine results with specified weights
    rerank=WeightedRanker(0.8, 0.2), # Assign weights of 0.8 to text search and 0.2 to image search
    # Alternatively, use RRFRanker for reciprocal rank fusion reranking
    # rerank=RRFRanker(),
    limit=2
)
```
