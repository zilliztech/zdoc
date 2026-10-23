---
title: "search() | Node.js"
slug: /node/node/Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会在 Collection 中执行向量相似性搜索。 | Node.js"
type: docx
token: HYv3d0NiRoc09Bx4rz0cIhqknb5
sidebar_position: 7
keywords: 
  - 多模态 RAG
  - LLM 幻觉
  - 混合搜索
  - 词法搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - search()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# search()

此操作会在 Collection 中执行向量相似性搜索。

## 请求语法\{#request-syntax}

```typescript
milvusClient.search({ collection_name, data, ... })
```

**参数：**

- **collection_name**（*string*） -

    Collection 的名称。

- **db_name**（*string*） -

    Database 的名称（可选）。

- **data**（*SearchData | SearchData[]*） -

    要搜索的向量或文本。提供 ids 时无需设置此参数。

- **vector**（*SearchData | SearchData[]*） -

    data 的别名（可选）。

- **ids**（*number[] | string[]*） -

    用于按主键搜索的主键 ID。提供此参数后，无需提供向量数据。

- **partition_names**（*string[]*） -

    Partition 名称数组（可选）。

- **anns_field**（*string*） -

    向量字段名称；对于多向量 Collection，此参数为必需项（可选）。

- **output_fields**（*string[]*） -

    要返回的字段（可选）。

- **limit**（*number*） -

    要返回的结果数量（可选）。

- **topk**（*number*） -

    limit 的别名（可选）。

- **offset**（*number*） -

    要跳过的结果数量（可选）。

- **filter**（*string*） -

    过滤表达式（可选）。

- **expr**（*string*） -

    filter 的别名（可选）。

- **exprValues**（*keyValueObj*） -

    过滤表达式的模板值（可选）。

- **params**（*keyValueObj*） -

    额外的搜索参数（可选）。

- **metric_type**（*string*） -

    距离度量类型（可选）。

- **consistency_level**（*ConsistencyLevelEnum*） -

    一致性级别（可选）。

- **ignore_growing**（*boolean*） -

    是否忽略正在增长的 Segment（可选）。

- **group_by_field**（*string*） -

    用于对结果分组的字段（可选）。

- **group_size**（*number*） -

    每个分组的大小（可选）。

- **strict_group_size**（*boolean*） -

    是否强制实施严格的分组大小（可选）。

- **order_by_fields**（*OrderByFields*） -

    用于对搜索结果排序的字段，例如 `price:asc` 或 `[{ field: "price", order: "asc" }]`（可选）。

- **hints**（*string*） -

    用于提升搜索性能的提示（可选）。

- **round_decimal**（*number*） -

    分数舍入后的小数位数（可选）。

- **transformers**（*OutputTransformers*） -

    用于 bf16/f16 向量的自定义数据转换器（可选）。

- **rerank**（*RerankerObj | FunctionObject*） -

    重排器配置（可选）。

- **nq**（*number*） -

    查询向量的数量（可选）。

- **timeout**（*number*） -

    允许 RPC 执行的时长，单位为毫秒，此参数为可选项。该值默认为 undefined。

**返回类型：**

*SearchResults&lt;T&gt;*

**返回：**

搜索结果，包含 status、recalls、session_ts、collection_name 和结果条目。

**参数：**

- **status**（*ResStatus*） -

    响应状态：`{error_code, reason}`。

- **recalls**（*number[]*） -

    搜索操作的召回结果。

- **session_ts**（*number*） -

    搜索会话的时间戳。

- **collection_name**（*string*） -

    被搜索的 Collection 名称。

- **results**（*DetermineResultsType&lt;T&gt;*） -

    搜索结果数组；其结构取决于输入参数。

- **all_search_count**（*number*） -

    搜索操作的总数（可选）。

- **search_iterator_v2_results**（*Record&lt;string, any&gt;*） -

    搜索迭代器 v2 的结果（可选）。

**异常：**

- **MilvusError**

    当服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息以获取确切的失败原因。

## 示例\{#example}

```javascript
const milvusClient = new MilvusClient(MILVUS_ADDRESS);
const searchResults = await milvusClient.search({
  collection_name: 'my_collection',
  data: [1, 2, 3, 4],
  limit: 10,
});
```
