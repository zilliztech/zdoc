---
title: "hybrid_search() | Python | MilvusClient"
slug: /python/python/Vector-hybrid_search
sidebar_label: "hybrid_search()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作跨多个向量字段执行混合向量搜索，并合并和重新排序多个 ANN 搜索的结果。 | Python | MilvusClient"
type: docx
token: Iv1PdIVxYoDOMax47xDcLnbEnXb
sidebar_position: 9
keywords: 
  - HNSW
  - 什么是非结构化数据
  - 向量嵌入
  - 向量存储
  - zilliz
  - zilliz cloud
  - 云
  - hybrid_search()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# hybrid_search()

此操作跨多个向量字段执行混合向量搜索，并合并和重新排序多个 ANN 搜索的结果。

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
    **kwargs,
) -> SearchResult
```

**参数：**

- **collection_name** (*str*) -<br/>
  **[必需]**<br/>
  要搜索的 Collection 名称。

- **reqs** (*List[AnnSearchRequest]*) -<br/>
  **[必需]**<br/>
  混合搜索所组合的 ANN 搜索请求。请使用 `AnnSearchRequest(data, anns_field, param, limit, expr=None, expr_params=None, filter=None)` 构造每个请求。

    - **data** (*Union[List, SparseMatrixInputType]*) -

**[必需]**
此 ANN 搜索请求所使用的查询向量或稀疏矩阵。

```plaintext
- **anns_field** (*str*) -
```

**[必需]**
要搜索的向量字段的名称。

```plaintext
- **param** (*Dict*) -
```

**[必需]**
ANN 搜索参数，例如度量类型和搜索专属设置。

```plaintext
- **limit** (*int*) -
```

**[必需]**
此 ANN 搜索请求返回的最大匹配数。

```plaintext
- **expr** (*Optional[str]*) -
```

默认值：`None`
在 ANN 搜索前应用的布尔过滤表达式。请勿同时提供 `expr` 和 `filter`。

```plaintext
- **expr_params** (*Optional[dict]*) -
```

默认值：`None`
代入表达式模板占位符的值。

```plaintext
- **filter** (*Optional[str]*) -
```

默认值：`None`
`expr` 的别名。请勿同时提供这两个值。解析后的表达式可通过只读 `filter` 属性以 `request.filter` 的形式获取。

- **ranker** (*Union[BaseRanker, Function]*) -<br/>
  **[必需]**<br/>
  用于合并各搜索请求的结果并对其进行排序的 Ranker。

- **limit** (*int*) -<br/>
  默认值：`10`<br/>
  要返回的最大记录数，也称为 `topk`。

- **output_fields** (*Optional[List[str]]*) -<br/>
  默认值：`None`<br/>
  要包含在每个搜索结果中的标量字段。

- **timeout** (*Optional[float]*) -<br/>
  默认值：`None`<br/>
  等待 RPC 的最长时间（秒）。如果省略此参数，客户端将一直等待，直到服务器响应或发生错误。

- **partition_names** (*Optional[List[str]]*) -<br/>
  默认值：`None`<br/>
  要搜索的 Partition 名称。

- **kwargs** (*Any*) -<br/>
  附加搜索选项，包括用于分页的顶层 `offset` 和用于搜索的 `consistency_level`。

    顶层 `offset` 会在候选结果融合和重新排序后应用于最终结果。请注意，混合搜索不支持 **AnnSearchRequest** 的 `param` 中的 `offset`，Milvus 会忽略它。

    要使分页按预期工作，**reqs** 中每个 **AnnSearchRequest** 的 `limit` 应覆盖分页窗口，即顶层 `offset` 与 `limit` 之和。这两个值之和应小于或等于 16,384。

**返回类型：**

*SearchResult*

**返回值：**

在应用各请求的表达式或过滤器后，返回组合 ANN 请求的搜索结果。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时引发。请查看服务器错误消息，以获取确切的失败详情。

## 示例\{#examples}

此示例运行带分页的混合搜索。顶层 `offset` 会在候选结果融合和重新排序后应用于最终结果，因此每个 `AnnSearchRequest.limit` 都会覆盖分页窗口（`offset + limit`）。

```python
from pymilvus import AnnSearchRequest, MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

# Create a collection, insert data, and load it
schema = client.create_schema(auto_id=False)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="text_vector", datatype=DataType.FLOAT_VECTOR, dim=3)
schema.add_field(field_name="image_vector", datatype=DataType.FLOAT_VECTOR, dim=3)
client.create_collection(collection_name="book_chunks", schema=schema)
index_params = client.prepare_index_params()
index_params.add_index(field_name="text_vector", index_type="AUTOINDEX", metric_type="IP")
index_params.add_index(field_name="image_vector", index_type="AUTOINDEX", metric_type="IP")
client.create_index(collection_name="book_chunks", index_params=index_params)
client.insert(collection_name="book_chunks", data=[
    {"id": i, "text_vector": [0.1, 0.2, 0.3], "image_vector": [0.3, 0.2, 0.1]}
    for i in range(30)
])
client.load_collection(collection_name="book_chunks")

requests = [
    AnnSearchRequest(
        data=[[0.1, 0.2, 0.3]],
        anns_field="text_vector",
        param={"metric_type": "IP"},
        limit=30,  # cover the pagination window (offset 20 + limit 10)
    ),
    AnnSearchRequest(
        data=[[0.3, 0.2, 0.1]],
        anns_field="image_vector",
        param={"metric_type": "IP"},
        limit=30,
    ),
]

# NOTE: Set the consistency level to Strong so that the entities inserted above
# are immediately visible and the example returns results. In production,
# choose a consistency level (for example, Bounded) that fits your scenario.
results = client.hybrid_search(
    collection_name="book_chunks",
    reqs=requests,
    ranker=None,
    limit=10,
    offset=20,  # return the third page of the fused and reranked results
    consistency_level="Strong",
)
print(results)
```
