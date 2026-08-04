---
title: "queryIterator() | Node.js"
slug: /node/node/Vector-queryIterator
sidebar_label: "queryIterator()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作以迭代方式执行向量相似性搜索，并按批返回结果。当您需要增量处理大型结果集，或总结果数超过单次查询可返回的数量时，请使用此操作代替单次 `search()` 调用。 | Node.js"
type: docx
token: YZ3GdmklAolLnux8LRhcw7hxnvd
sidebar_position: 11
keywords: 
  - LLMs
  - Machine Learning
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

此操作以迭代方式执行向量相似性搜索，并按批返回结果。当您需要增量处理大型结果集，或总结果数超过单次查询可返回的数量时，请使用此操作代替单次 `search()` 调用。

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

    **[必需]**

    要搜索的集合名称。

- **data** (*SearchData | SearchData[]*) -

    **[必需]**

    查询向量。支持的类型包括 FloatVector (`number[]`)、BFloat16Vector (`Uint8Array`)、Float16Vector (`Uint8Array`)、BinaryVector (`number[]`) 和 SparseFloatVector。

- **batchSize** (*number*) -

    **[必需]**

    每次迭代返回的结果数量。不能超过 16,384。

- **limit** (*number*) -

    所有迭代中返回结果的最大总数。默认为匹配实体的总数（即不设限制）。

- **filter** (*string*) -

    标量过滤条件，用于在搜索前筛选匹配实体。默认为空字符串（即不过滤）。

- **anns_field** (*string*) -

    目标向量字段的名称。当集合包含多个向量字段时，此参数为必需。

- **output_fields** (*string[]*) -

    要包含在每个返回实体中的字段名称列表。默认仅包含主字段。

- **partition_names** (*string[]*) -

    要搜索的分区名称。

- **params** (*keyValueObj*) -

    以键值对形式提供的附加搜索参数，例如范围搜索中的 `radius` 和 `range_filter`。

- **metric_type** (*string*) -

    用于衡量向量间相似度的度量类型。默认为已建立索引字段的度量类型。

- **consistency_level** (*ConsistencyLevelEnum*) -

    此操作的一致性级别。可选值：Strong (0)、Bounded (1)、Session (2)、Eventually (3)。默认为 Bounded。

- **ignore_growing** (*boolean*) -

    搜索时是否跳过 growing segments。

- **group_by_field** (*string*) -

    按指定字段对搜索结果分组，以确保结果多样性。

- **exprValues** (*keyValueObj*) -

    模板化过滤表达式的占位符值。

- **rerank** (*RerankerObj | FunctionObject | FunctionScore*) -

    重排序策略及其参数。有关支持的 reranker 类型的详细信息，请参见 `search()`。

- **transformers** (*OutputTransformers*) -

    用于 BFloat16Vector 和 Float16Vector 等特殊向量数据类型的自定义转换器。

- **external_filter_fn** (*(row: SearchResultData) => boolean*) -

    可选的客户端过滤函数，将应用于每一批结果。对于此函数返回 `false` 的实体，将不会包含在产出的批次中。

- **db_name** (*string*) -

    包含该集合的数据库名称。

- **element_indices** (*ElementIndices[]*) -

    查询迭代器的元素索引。可选。

**返回：**

*Promise\<AsyncIterable\<SearchResultData[]\>\>*

返回一个异步可迭代对象。每次迭代会产出一个包含该批次匹配实体的数组。当结果总数达到 `limit`，或所有匹配实体都已返回时，迭代结束。

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
