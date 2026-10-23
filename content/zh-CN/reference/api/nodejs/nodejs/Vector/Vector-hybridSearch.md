---
title: "hybridSearch() | Node.js"
slug: /node/node/Vector-hybridSearch
sidebar_label: "hybridSearch()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作执行混合搜索，运行多个向量查询并返回聚合结果。 | Node.js"
type: docx
token: Ph9ldBswooKwebxKI9EcqSu4nlc
sidebar_position: 4
keywords: 
  - 音频相似性搜索
  - Elastic 向量 Database
  - Pinecone 与 Milvus
  - Chroma 与 Milvus
  - Zilliz
  - Zilliz Cloud
  - 云
  - hybridSearch()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# hybridSearch()

此操作执行混合搜索，运行多个向量查询并返回聚合结果。

## 请求语法\{#request-syntax}

```typescript
milvusClient.hybridSearch(params: HybridSearchReq)
```

**参数：**

- **collection_name**（*string*） -

    Collection 的名称。

- **data**（*HybridSearchSingleReq[]*） -

    搜索请求的数组。

- **output_fields**（*string[]*） -

    要返回的字段（可选）。

- **partition_names**（*string[]*） -

    Partition 名称的数组（可选）。

- **filter**（*string*） -

    过滤表达式（可选）。

- **expr**（*string*） -

    过滤条件的别名（可选）。

- **limit**（*number*） -

    要返回的结果数量（可选）。

- **offset**（*number*） -

    要跳过的结果数量（可选）。

- **rerank**（*RerankerObj | FunctionObject*） -

    重排器配置（可选）。

- **consistency_level**（*ConsistencyLevelEnum*） -

    一致性级别（可选）。

- **ignore_growing**（*boolean*） -

    是否忽略正在增长的 Segment（可选）。

- **timeout**（*number*） -

    允许 RPC 执行的可选时长，以毫秒为单位。该值默认为 undefined。

**返回类型：**

*SearchResults&lt;T&gt;*

**返回：**

包含状态、召回率和聚合结果条目的混合搜索结果。对于 HybridSearchReq 结构，hybridSearch 是 search() 的别名。

**参数：**

- **status**（*ResStatus*） -

    响应状态：`{error_code, reason}`。

- **recalls**（*number[]*） -

    混合搜索的召回率。

- **session_ts**（*number*） -

    搜索会话的时间戳。

- **collection_name**（*string*） -

    所搜索的 Collection 的名称。

- **results**（*DetermineResultsType&lt;T&gt;*） -

    聚合后的搜索结果数组；其结构取决于输入参数。

**异常：**

- **MilvusError**

    当服务器拒绝请求或 RPC 失败时会引发此异常。请查看服务器错误消息以了解确切的失败原因。

## 示例\{#example}

```javascript
const results = await milvusClient.hybridSearch({
  collection_name: 'my_collection',
  data: [
    {
      data: [1, 2, 3, 4],
      anns_field: 'float_vector',
      limit: 10,
    },
  ],
});
```
