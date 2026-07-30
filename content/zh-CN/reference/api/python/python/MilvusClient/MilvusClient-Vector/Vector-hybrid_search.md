---
title: "hybrid_search() | Python | MilvusClient"
slug: /python/python/Vector-hybrid_search
sidebar_label: "hybrid_search()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作对集合执行多向量搜索，并在重排后返回搜索结果。 | Python | MilvusClient"
type: docx
token: Iv1PdIVxYoDOMax47xDcLnbEnXb
sidebar_position: 9
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - hybrid_search()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# hybrid_search()

此操作对集合执行多向量搜索，并在重排后返回搜索结果。

<Admonition type="info" icon="📘" title="说明">

此方法仅适用于专属服务集群和按需计算。 

- 如需在服务集群的集合中执行此操作，请使用集群端点创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 如需在按需计算的集合中执行此操作，请使用项目端点创建 **[MilvusClient](./Client-MilvusClient)**，然后创建一个会话以附加到按需集群进行搜索。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
hybrid_search(
    collection_name: str,
    reqs: List[AnnSearchRequest],
    ranker: Union[BaseRanker, Function],
    limit: int = 10,   
    output_fields: Optional[List[str]] = None,
    timeout: Optional[float] = None,
    partition_names: Optional[List[str]] = None,
    **kwargs
)
```

**参数：**

- **collection_name** (*str*) -

    要创建的集合名称。

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

        - **data** (*List*)：请求中要搜索的查询向量。此参数接受一个仅包含一个元素的列表。

        - **anns_field** (*str*)：请求中要使用的向量字段。

        - **param** (*dict*)：请求的搜索参数字典。详情请参见 [search()](./Vector-search) 中的设置。

        - **limit** (*int*)：请求中要返回的最大结果数。在使用多个 ANN 搜索请求执行混合搜索时，每个请求中由 **limit** 指定的顶部结果会先合并并重新排序，然后再返回最终搜索结果。

        - **expr** (*str*)：(可选) 用于过滤结果的表达式。

        - **expr_params** (*dict*) -

            如果你选择按照 [Filtering Templating](/docs/filtering-templating) 中所述在 `expr` 中使用占位符，则可以通过此参数的值以键值对形式为这些占位符指定实际值。

- **ranker** (*Union[BaseRanker, Function]*) -

    用于混合搜索的重排策略。

    详情请参见 [Weighted Ranker](/docs/reranking-weighted-reranker)、[RRF Ranker](/docs/reranking-rrf)。

- **limit** (*int*) -

    要返回的实体总数。

    你可以将此参数与 **param** 中的 `offset` 结合使用以启用分页。

    此值与 **param** 中 `offset` 的总和应小于 16,384。

- **partition_names** (*List[str]*) -

    分区名称列表。

    默认值为 **None**。如果指定，则仅查询指定的分区。

- **output_fields** (*List[str]*) -

    返回的每个实体中要包含的字段名称列表。

    默认值为 **None**。如果未指定，则仅包含主字段。

- **timeout** (*float*) -

    此操作的超时时长。将其设置为 **None** 表示此操作会在收到任意响应或发生任意错误时超时。

- **round_decimal** (int) -

    Milvus 对计算出的距离进行四舍五入时保留的小数位数。

    默认值为 **-1**，表示 Milvus 跳过对计算距离的四舍五入并返回原始值。

- **group_by_field** (*str*)

    按指定字段对搜索结果进行分组，以确保多样性并避免从同一组返回多个结果。详情请参见 [Grouping Search](https://milvus.io/docs/grouping-search.md#Grouping-Search)。

- **group_size** (*int*)

    在分组搜索中，每组内目标返回的实体数量。详情请参见 [Grouping Search](https://milvus.io/docs/grouping-search.md#Grouping-Search)。

- **strict_group_size** (*bool*)

    控制是否严格执行 **group_size**。详情请参见 [Grouping Search](https://milvus.io/docs/grouping-search.md#Grouping-Search)。

**返回类型：**

*SearchResult*

**返回值：**

一个 **SearchResult** 对象，其中包含 **Hits** 对象列表。 

- 响应结构

    <Admonition type="info" icon="📘" title="说明">

    一个 **SearchResult** 对象包含一组 **Hits** 对象，每个对象对应搜索请求中的一个查询向量。 
    
    一个 **Hits** 对象包含一组 **Hit** 对象，每个对象对应一个被搜索命中的实体。

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

            用于获取命中实体中指定字段值的函数。 

**异常：**

- **MilvusException**

    在此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

- 在服务集群中执行混合搜索

    ```python
    from pymilvus import AnnSearchRequest, MilvusClient, WeightedRanker
    
    # Connect to Milvus server
    client = MilvusClient(
        uri="https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530",
        token="YOUR_API_KEY"
    )
    
    # Create AnnSearchRequests
    
    query_dense_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    
    search_param_1 = {
        "data": [query_dense_vector],
        "anns_field": "dense",
        "param": {
            "params": {"nprobe": 10}
        },
        "limit": 2
    }
    request_1 = AnnSearchRequest(**search_param_1)
    
    query_sparse_vector = {3573: 0.34701499565746674}, {5263: 0.2639375518635271}
    search_param_2 = {
        "data": [query_sparse_vector],
        "anns_field": "sparse",
        "param": {
            "params": {}
        },
        "limit": 2
    }
    request_2 = AnnSearchRequest(**search_param_2)
    
    reqs = [request_1, request_2]
    
    # Configure reranking strategy
    
    ranker = WeightedRanker(0.8, 0.3) 
    
    # perform hybrid search
    
    res = client.hybrid_search(
        collection_name="hybrid_search_collection",
        reqs=reqs,
        ranker=ranker,
        limit=2
    )
    for hits in res:
        print("TopK results:")
        for hit in hits:
            print(hit)
    ```

- 针对按需计算执行混合搜索

    ```python
    from pymilvus import AnnSearchRequest, MilvusClient, WeightedRanker
    
    # Connect to Milvus server
    client = MilvusClient(
        uri="https://{project-id}.{region}.api.zillizcloud.com",
        token="YOUR_API_KEY"
    )
    
    # Create a session
    session = client.session(cluster_id="inxx-xxxxxxxxxxxx")
    
    # Create AnnSearchRequests
    
    query_dense_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    
    search_param_1 = {
        "data": [query_dense_vector],
        "anns_field": "dense",
        "param": {
            "params": {"nprobe": 10}
        },
        "limit": 2
    }
    request_1 = AnnSearchRequest(**search_param_1)
    
    query_sparse_vector = {3573: 0.34701499565746674}, {5263: 0.2639375518635271}
    search_param_2 = {
        "data": [query_sparse_vector],
        "anns_field": "sparse",
        "param": {
            "params": {}
        },
        "limit": 2
    }
    request_2 = AnnSearchRequest(**search_param_2)
    
    reqs = [request_1, request_2]
    
    # Configure reranking strategy
    
    ranker = WeightedRanker(0.8, 0.3) 
    
    # perform hybrid search
    
    res = client.hybrid_search(
        collection_name="hybrid_search_collection",
        reqs=reqs,
        ranker=ranker,
        limit=2
    )
    for hits in res:
        print("TopK results:")
        for hit in hits:
            print(hit)
    ```

