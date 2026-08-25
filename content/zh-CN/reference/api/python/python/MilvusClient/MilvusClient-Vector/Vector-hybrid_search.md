---
title: "hybrid_search() | Python | MilvusClient"
slug: /python/python/Vector-hybrid_search
sidebar_label: "hybrid_search()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作对 Collection 执行多向量搜索，并在重排序后返回搜索结果。 | Python | MilvusClient"
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

此操作对 Collection 执行多向量搜索，并在重排序后返回搜索结果。

<Admonition type="info" icon="📘" title="Notes">

此方法仅适用于 Dedicated 服务集群和按需计算。

- 若要在服务集群的 Collection 中执行此操作，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 若要在按需计算的 Collection 中执行此操作，请使用项目 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**，然后创建会话以连接到按需集群进行搜索。

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
    **kwargs,
) -> SearchResult
```

**参数：**

- **collection_name** (*str*) -<br/>
  **[必填]**<br/>
  要搜索的 Collection 名称。

- **reqs** (*List[AnnSearchRequest]*) -<br/>
  **[必填]**<br/>
  混合搜索所组合的 ANN 搜索请求。请使用 `AnnSearchRequest(data, anns_field, param, limit, expr=None, expr_params=None, filter=None)` 构造每个请求。

    - **data** (*Union[List, SparseMatrixInputType]*) -<br/>
      **[必填]**<br/>
      用于此 ANN 搜索请求的查询向量或稀疏矩阵。

    - **anns_field** (*str*) -<br/>
      **[必填]**<br/>
      要搜索的向量字段名称。

    - **param** (*Dict*) -<br/>
      **[必填]**<br/>
      ANN 搜索参数，例如度量类型及特定于搜索的设置。

    - **limit** (*int*) -<br/>
      **[必填]**<br/>
      此 ANN 搜索请求返回的最大匹配数。

    - **expr** (*Optional[str]*) -<br/>
      默认值：`None`<br/>
      在 ANN 搜索前应用的布尔过滤表达式。请勿同时提供 `expr` 和 `filter`。

    - **expr_params** (*Optional[dict]*) -<br/>
      默认值：`None`<br/>
      用于替换表达式模板占位符的值。

    - **filter** (*Optional[str]*) -<br/>
      默认值：`None`<br/>
      `expr` 的别名。请勿同时提供这两个值。解析后的表达式可通过只读属性 `filter` 获取，其值为 `request.filter`。

- **ranker** (*Union[BaseRanker, Function]*) -<br/>
  **[必填]**<br/>
  用于合并并对各搜索请求的结果进行排序的 Ranker。

- **limit** (*int*) -<br/>
  默认值：`10`<br/>
  要返回的最大记录数，也称为 `topk`。

- **output_fields** (*Optional[List[str]]*) -<br/>
  默认值：`None`<br/>
  要包含在每个搜索结果中的标量字段。

- **timeout** (*Optional[float]*) -<br/>
  默认值：`None`<br/>
  等待 RPC 响应的最长时间（秒）。如果未指定，客户端将一直等待，直到服务器响应或发生错误。

- **partition_names** (*Optional[List[str]]*) -<br/>
  默认值：`None`<br/>
  要搜索的 Partition 名称列表。

- **kwargs** (*Any*) -<br/>
  其他搜索选项，包括分页偏移量和一致性级别。

**返回类型：**

*SearchResult*

**返回值：**

在应用各请求的表达式或过滤器后，返回组合 ANN 请求的搜索结果。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以了解具体的失败原因。

## 示例\{#examples}

以下示例展示了如何构造 ANN 请求并执行混合搜索。

```python
from pymilvus import AnnSearchRequest, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
request = AnnSearchRequest(
    data=[[0.1, 0.2, 0.3]],
    anns_field="vector",
    param={"metric_type": "COSINE"},
    limit=10,
    filter='category == "paper"',
)
results = client.hybrid_search(
    collection_name="book_chunks",
    reqs=[request],
    ranker=None,
    limit=10,
)
print(request.filter)
print(results)
```
