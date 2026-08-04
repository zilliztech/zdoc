---
title: "hybrid_search() | Python | MilvusClient"
slug: /python/python/Vector-hybrid_search
sidebar_label: "hybrid_search()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "更新嵌入式 AnnSearchRequest 参数文档和示例。异步变体与同步版本共享相同的参数约定。将 filter 记录为 expr 的别名以及二者互斥的校验规则。内联说明只读 filter 属性；应通过 request.filter 访问，而不是 request.filter()。 | Python | MilvusClient"
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

更新嵌入式 AnnSearchRequest 参数文档和示例。异步变体与同步版本共享相同的参数约定。将 filter 记录为 expr 的别名以及二者互斥的校验规则。内联说明只读 filter 属性；应通过 `request.filter` 访问，而不是 `request.filter()`。

<Admonition type="info" icon="📘" title="说明">

此方法仅适用于专属服务集群和按需计算。 

- 对于服务集群中集合上的此操作，请使用集群端点创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中集合上的此操作，请使用项目端点创建 **[MilvusClient](./Client-MilvusClient)**，然后创建会话并附加到按需集群以执行搜索。

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
  **[必需]**<br/>
  要搜索的集合名称。

- **reqs** (*List[AnnSearchRequest]*) -<br/>
  **[必需]**<br/>
  由混合搜索组合的 ANN 搜索请求。使用 `AnnSearchRequest(data, anns_field, param, limit, expr=None, expr_params=None, filter=None)` 构造每个请求。

    - **data** (*Union[List, SparseMatrixInputType]*) -<br/>
      **[必需]**<br/>
      用于此 ANN 搜索请求的查询向量或稀疏矩阵。

    - **anns_field** (*str*) -<br/>
      **[必需]**<br/>
      要搜索的向量字段名称。

    - **param** (*Dict*) -<br/>
      **[必需]**<br/>
      ANN 搜索参数，例如度量类型和搜索特定设置。

    - **limit** (*int*) -<br/>
      **[必需]**<br/>
      此 ANN 搜索请求返回的最大匹配数。

    - **expr** (*Optional[str]*) -<br/>
      默认值：`None`<br/>
      在 ANN 搜索之前应用的布尔过滤表达式。不要同时提供 `expr` 和 `filter`。

    - **expr_params** (*Optional[dict]*) -<br/>
      默认值：`None`<br/>
      替换表达式模板占位符的值。

    - **filter** (*Optional[str]*) -<br/>
      默认值：`None`<br/>
      `expr` 的别名。不要同时提供这两个值。解析后的表达式可通过只读 `filter` 属性以 `request.filter` 的形式获取。

- **ranker** (*Union[BaseRanker, Function]*) -<br/>
  **[必需]**<br/>
  用于组合并排序各搜索请求结果的排序器。

- **limit** (*int*) -<br/>
  默认值：`10`<br/>
  要返回的最大记录数，也称为 `topk`。

- **output_fields** (*Optional[List[str]]*) -<br/>
  默认值：`None`<br/>
  要包含在每个搜索结果中的标量字段。

- **timeout** (*Optional[float]*) -<br/>
  默认值：`None`<br/>
  等待 RPC 的最长时间，单位为秒。省略时，客户端会一直等待，直到服务器响应或发生错误。

- **partition_names** (*Optional[List[str]]*) -<br/>
  默认值：`None`<br/>
  要搜索的分区名称。

- **kwargs** (*Any*) -<br/>
  其他搜索选项，包括分页偏移量和一致性级别。

**返回类型：**

*SearchResult*

**返回：**

对每个请求应用其表达式或过滤条件后，组合 ANN 请求的搜索结果。

**异常：**

- **MilvusException**<br/>
  当服务器拒绝请求或 RPC 失败时引发。请检查服务器错误消息以获取确切的失败详情。

## 示例\{#examples}

以下示例构造一个 ANN 请求并执行混合搜索。

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
