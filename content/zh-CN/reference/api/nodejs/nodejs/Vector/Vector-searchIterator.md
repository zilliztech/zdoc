---
title: "searchIterator() | Node.js"
slug: /node/node/Vector-searchIterator
sidebar_label: "searchIterator()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作以迭代方式执行标量过滤查询，并分批返回结果。当您需要增量处理大型结果集，或者结果总数超过单次 query() 调用可返回的数量时，请使用此方法，而不是单次 query() 调用。 | Node.js"
type: docx
token: K5APdBqphoQG7vxU4P2ccr5Wnig
sidebar_position: 9
keywords: 
  - 音频相似度搜索
  - Elastic 向量 Database
  - Pinecone 与 Milvus 对比
  - Chroma 与 Milvus 对比
  - zilliz
  - zilliz cloud
  - 云
  - searchIterator()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# searchIterator()

此操作以迭代方式执行向量相似度搜索，并分批返回结果。当您需要增量处理大型结果集，或者结果总数超过单次 search() 调用可返回的数量时，请使用此方法，而不是单次 search() 调用。

```javascript
await milvusClient.searchIterator(data: SearchIteratorReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.searchIterator({
    collection_name: string,
    data: SearchData | SearchData[],
    vector?: SearchData | SearchData[],
    batchSize: number,
    limit?: number,
    filter?: string,
    expr?: string,
    anns_field?: string,
    output_fields?: string[],
    partition_names?: string[],
    params?: keyValueObj,
    metric_type?: string,
    consistency_level?: ConsistencyLevelEnum,
    ignore_growing?: boolean,
    group_by_field?: string,
    group_size?: number,
    strict_group_size?: boolean,
    order_by_fields?: OrderByFields,
    hints?: string,
    round_decimal?: number,
    exprValues?: keyValueObj,
    rerank?: RerankerObj | FunctionObject | FunctionScore,
    transformers?: OutputTransformers,
    nq?: number,
    ids?: number[] | string[],
    highlighter?: Highlighter,
    external_filter_fn?: (row: SearchResultData) => boolean,
    db_name?: string,
    timeout?: number,
})
```

**参数：**

- **collection_name** （*string*） -

    **[必需]**

    要搜索的 Collection 的名称。

- **data** （*[SearchData](./Vector-SearchData) | SearchData[]*） -

    查询向量。支持的类型包括 FloatVector（number[]）、BFloat16Vector（Uint8Array）、Float16Vector（Uint8Array）、BinaryVector（number[]）和 SparseFloatVector。请提供 **data** 或 **vector**。

- **vector** （*[SearchData](./Vector-SearchData) | SearchData[]*） -

    **data** 的别名，用于表示查询向量。

- **batchSize** （*number*） -

    **[必需]**

    每次迭代返回的结果数。不能超过 16,384。

- **limit** （*number*） -

    所有迭代返回的结果总最大数量。该值默认为匹配 Entity 的总数（无限制）。

- **filter** （*string*） -

    用于在搜索前筛选匹配 Entity 的标量过滤条件。该值默认为空字符串（无筛选）。

- **expr** （*string*） -

    **filter** 的别名。请提供 **filter** 或 **expr**，但不能同时提供两者。

- **anns_field** （*string*） -

    目标向量字段的名称。当 Collection 包含多个向量字段时，此参数为必需项。

- **output_fields** （*string[]*） -

    要包含在每个返回 Entity 中的字段名列表。默认仅包含主字段。

- **partition_names** （*string[]*） -

    要搜索的 Partition 的名称。

- **params** （*keyValueObj*） -

    以键值对形式提供的其他搜索参数，例如用于范围搜索的 `radius` 和 `range_filter`。

- **metric_type** （*string*） -

    用于衡量向量之间相似度的度量类型。该值默认为索引字段的度量类型。

- **consistency_level** （*ConsistencyLevelEnum*） -

    此操作的一致性级别。可选值：Strong (0)、Session (1)、Bounded (2) 和 Eventually (3)。该值默认为 Bounded。请参见 [ConsistencyLevelEnum](./Collections-ConsistencyLevelEnum)。

- **ignore_growing** （*boolean*） -

    是否在搜索期间跳过增长中的 Segment。

- **group_by_field** （*string*） -

    按指定字段对搜索结果分组，以确保多样性。

- **group_size** （*number*） -

    分组搜索中每个组内要返回的 Entity 目标数量。

- **strict_group_size** （*boolean*） -

    分组搜索中是否严格强制执行 **group_size**。

- **order_by_fields** （*OrderByFields*） -

    用于对搜索结果排序的字段。

- **hints** （*string*） -

    用于提高搜索性能的提示字符串。

- **round_decimal** （*number*） -

    最终结果中保留的小数位数。

- **exprValues** （*keyValueObj*） -

    模板化过滤表达式的占位符值。

- **nq** （*number*） -

    查询向量的数量。

- **ids** （*number[]* | *string[]*） -

    用于按主键搜索查询的主键。

- **highlighter** （*Highlighter*） -

    用于搜索结果的高亮器。

- **rerank** （*[RerankerObj](./Vector-RerankerObj)* | *[FunctionObject](./Collections-FunctionObject)* | *[FunctionScore](./Vector-FunctionScore)*） -

    重排策略及其参数。有关支持的重排器类型，请参见 `search()`。

- **transformers** （*[OutputTransformers](./Vector-OutputTransformers)*） -

    用于 BFloat16Vector 和 Float16Vector 等特殊向量数据类型的自定义转换器。

- **external_filter_fn** （*(row: SearchResultData) => boolean*） -

    可选的客户端筛选函数，应用于每批结果。对于此函数返回 `false` 的 Entity，将从产出的批次中排除。

- **db_name** （*string*） -

    包含该 Collection 的 Database 名称。

- **timeout** （*number*） -

    此操作的超时持续时间。将其设置为 **None** 表示当收到任意响应或发生任何错误时，此操作即超时。

**返回：**

*Promise&lt;AsyncIterable&lt;SearchResultData[]&gt;&gt;*

返回一个异步可迭代对象。每次迭代会产出该批次中匹配 Entity 的数组。当结果总数达到 `limit`，或所有匹配 Entity 均已遍历完时，迭代结束。

**异常：**

- **Error**

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
