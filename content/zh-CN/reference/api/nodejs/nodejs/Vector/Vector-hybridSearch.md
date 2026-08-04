---
title: "hybridSearch() | Node.js"
slug: /node/node/Vector-hybridSearch
sidebar_label: "hybridSearch()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作可在多个向量字段上执行混合搜索，并可选择使用标量过滤表达式，返回合并并重排后的结果。 | Node.js"
type: docx
token: Ph9ldBswooKwebxKI9EcqSu4nlc
sidebar_position: 4
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - hybridSearch()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# hybridSearch()

此操作可在多个向量字段上执行混合搜索，并可选择使用标量过滤表达式，返回合并并重排后的结果。

```typescript
await milvusClient.hybridSearch(data: HybridSearchReq)
```

## 请求语法\{#request-syntax}

```typescript
await milvusClient.hybridSearch({
    collection_name: string,
    data: HybridSearchSingleReq[],
    limit?: number,
    offset?: number,
    output_fields?: string[],
    filter?: string,
    rerank?: RerankerObj | FunctionObject | FunctionScore,
    partition_names?: string[],
    consistency_level?: ConsistencyLevelEnum,
    ignore_growing?: boolean,
    group_by_field?: string,
    group_size?: number,
    strict_group_size?: boolean,
    hints?: string,
    round_decimal?: number,
    transformers?: OutputTransformers,
    db_name?: string,
    timeout?: number,
})
```

**参数：**

- **collection_name** (*string*) -

    **[必填]**

    要搜索的 collection 名称。

- **data** (*HybridSearchSingleReq[]*) -

    **[必填]**

    子搜索请求列表，每个向量字段对应一个请求。每个元素定义单向量子搜索的查询向量和目标字段。完整字段说明请参见下方的 HybridSearchSingleReq 部分。

- **limit** (*number*) -

    返回实体的总数量。该值与 `offset` 的总和必须小于 16,384。

- **offset** (*number*) -

    搜索结果中要跳过的记录数。该值与 `limit` 的总和必须小于 16,384。

- **output_fields** (*string[]*) -

    每个返回实体中要包含的字段名称列表。默认仅包含主字段。

- **filter** (*string*) -

    在混合搜索结果合并后应用的顶层标量过滤条件。默认为空字符串。

- **rerank** (*RerankerObj \| FunctionObject \| FunctionScore*) -

    用于组合多个子搜索结果的重排策略。完整的 `rerank` 参数结构请参见 `search()`。

- **partition_names** (*string[]*) -

    要搜索的 partition 名称列表。

- **consistency_level** (*ConsistencyLevelEnum*) -

    目标 collection 的一致性级别。可选值：`Strong` (0)、`Bounded` (1)、`Session` (2)、`Eventually` (3)。默认为 `Bounded`。

- **ignore_growing** (*boolean*) -

    搜索时是否跳过 growing segments。

- **group_by_field** (*string*) -

    按指定字段对搜索结果进行分组，以确保多样性并避免返回同一组中的多个结果。

- **group_size** (*number*) -

    分组搜索中每组目标返回的实体数量。

- **strict_group_size** (*boolean*) -

    是否严格执行 `group_size`。当为 `true` 时，系统会尝试让每组恰好填充 `group_size` 个结果。

- **hints** (*string*) -

    用于提升搜索性能的 hints 字符串。

- **round_decimal** (*number*) -

    最终分数保留的小数位数。

- **transformers** (*OutputTransformers*) -

    用于 BFloat16Vector 和 Float16Vector 等特殊向量数据类型的自定义转换器。

- **db_name** (*string*) -

    包含该 collection 的数据库名称。

- **timeout** (*number*) -

    此操作的超时时长，单位为毫秒。

- **order_by_fields** (*OrderByFields*) -

    用于对搜索结果排序的字段。可选。

**返回值：**

*Promise\<SearchResults\>*

此方法返回一个 promise，解析为 `SearchResults` 对象。

**异常：**

- **MilvusError**

    当此操作期间发生任何错误时，将抛出此异常。

## HybridSearchSingleReq\{#hybridsearchsinglereq}

`data` 数组中的每个元素都是一个 **HybridSearchSingleReq** 对象，用于定义单向量子搜索请求。

**参数：**

- **data** (*SearchData*) -

    **[必填]**

    此子搜索的查询向量。可以是稠密向量（`number[]`）、稀疏向量（`SparseVectorDic`），或用于基于文本搜索的文本字符串。

- **anns_field** (*string*) -

    **[必填]**

    此子请求中要搜索的向量字段名称。

- **filter** (*string*) -

    仅应用于此子搜索的标量过滤条件。

- **exprValues** (*keyValueObj*) -

    过滤表达式中使用的模板值，以键值对形式提供。

- **params** (*keyValueObj*) -

    以键值对形式提供的索引特定搜索参数。

- **ignore_growing** (*boolean*) -

    此子搜索期间是否跳过 growing segments。

- **group_by_field** (*string*) -

    按指定字段对结果进行分组，以确保此子搜索内的多样性。

- **transformers** (*OutputTransformers*) -

    用于 BFloat16Vector 和 Float16Vector 等特殊向量类型的自定义转换器。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const results = await milvusClient.hybridSearch({
    collection_name: 'my_collection',
    data: [
        {
            anns_field: 'dense_vector',
            data: [0.1, 0.2, 0.3, 0.4, 0.5],
        },
        {
            anns_field: 'sparse_vector',
            data: { 1: 0.5, 42: 0.8, 100: 0.3 },
        },
    ],
    limit: 10,
    rerank: { strategy: 'rrf', params: { k: 60 } },
    output_fields: ['id', 'text'],
});

console.log(results.results);
```

