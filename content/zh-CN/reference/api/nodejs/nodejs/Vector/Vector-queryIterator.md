---
title: "queryIterator() | Node.js"
slug: /node/node/Vector-queryIterator
sidebar_label: "queryIterator()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作以迭代方式执行向量相似性搜索，并分批返回结果。当您需要逐步处理大型结果集，或总结果数超出单次 query 可返回的数量时，请使用此操作，而不是单次 search() 调用。 | Node.js"
type: docx
token: YZ3GdmklAolLnux8LRhcw7hxnvd
sidebar_position: 11
keywords: 
  - LLMs
  - 机器学习
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - queryIterator()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# queryIterator()

此操作以迭代方式执行向量相似性搜索，并分批返回结果。当您需要逐步处理大型结果集，或总结果数超出单次 query 可返回的数量时，请使用此操作，而不是单次 search() 调用。

```javascript
await milvusClient.searchIterator(data: SearchIteratorReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.searchIterator({
    collection_name: string,
    data: SearchData | SearchData[],
    batchSize: number,
    limit?: number,
    filter?: string,
    anns_field?: string,
    output_fields?: string[],
    partition_names?: string[],
    params?: keyValueObj,
    metric_type?: string,
    consistency_level?: ConsistencyLevelEnum,
    ignore_growing?: boolean,
    group_by_field?: string,
    exprValues?: keyValueObj,
    rerank?: RerankerObj | FunctionObject | FunctionScore,
    transformers?: OutputTransformers,
    external_filter_fn?: (row: SearchResultData) => boolean,
    db_name?: string,
})
```

**参数：**

- **collection_name** (*string*) -

    **[必填]**

    要搜索的 Collection 名称。

- **data** (*SearchData | SearchData[]*) -

    **[必填]**

    查询向量。支持的类型包括 FloatVector (number[])、BFloat16Vector (Uint8Array)、Float16Vector (Uint8Array)、BinaryVector (number[]) 和 SparseFloatVector。

- **batchSize** (*number*) -

    **[必填]**

    每次迭代返回的结果数量。不得超过 16,384。

- **limit** (*number*) -

    所有迭代中的结果总数上限。默认为匹配 Entity 的总数（即不设限制）。

- **filter** (*string*) -

    在搜索前用于筛选匹配 Entity 的标量过滤条件。默认为空字符串（不筛选）。

- **anns_field** (*string*) -

    目标向量字段的名称。当 Collection 包含多个向量字段时为必填。

- **output_fields** (*string[]*) -

    要包含在每个返回 Entity 中的字段名称列表。默认仅包含主字段。

- **partition_names** (*string[]*) -

    要搜索的 Partition 名称。

- **params** (*keyValueObj*) -

    附加搜索参数，以键值对形式提供，例如用于范围搜索的 `radius` 和 `range_filter`。

- **metric_type** (*string*) -

    用于衡量向量之间相似度的度量类型。默认使用已建立索引字段的度量类型。

- **consistency_level** (*ConsistencyLevelEnum*) -

    此操作的一致性级别。可选值：Strong (0)、Bounded (1)、Session (2)、Eventually (3)。默认为 Bounded。

- **ignore_growing** (*boolean*) -

    是否在搜索期间跳过 growing Segment。

- **group_by_field** (*string*) -

    按指定字段对搜索结果进行分组，以确保结果多样性。

- **exprValues** (*keyValueObj*) -

    模板化过滤表达式的占位符值。

- **rerank** (*RerankerObj | FunctionObject | FunctionScore*) -

    重排序策略及其参数。有关支持的 reranker 类型的详细信息，请参见 `search()`。

- **transformers** (*OutputTransformers*) -

    适用于 BFloat16Vector 和 Float16Vector 等特殊向量数据类型的自定义转换器。

- **external_filter_fn** (*(row: SearchResultData) => boolean*) -

    可选的客户端过滤函数，会应用于每一批结果。对于该函数返回 `false` 的 Entity，将从产出的批次中排除。

- **db_name** (*string*) -

    包含该 Collection 的 Database 名称。

- **element_indices** (*ElementIndices[]*) -

    查询迭代器的元素索引。可选。

**返回：**

*Promise\<AsyncIterable\<SearchResultData[]\>\>*

返回一个异步可迭代对象。每次迭代都会产出该批次匹配 Entity 的数组。当结果总数达到 `limit` 或所有匹配 Entity 均已耗尽时，迭代结束。

**异常：**

- **MilvusError**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const iterator = await milvusClient.searchIterator({
    collection_name: 'my_collection',
    data: [0.1, 0.2, 0.3, 0.4, 0.5],
    batchSize: 100,
    limit: 500,
    output_fields: ['id', 'text'],
    filter: 'age > 18',
});

for await (const batch of iterator) {
    console.log(`Batch of ${batch.length} results:`, batch);
}
```
