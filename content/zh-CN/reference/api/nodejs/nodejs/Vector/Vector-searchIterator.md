---
title: "searchIterator() | Node.js"
slug: /node/node/Vector-searchIterator
sidebar_label: "searchIterator()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作以迭代方式执行标量过滤查询，并分批返回结果。当您需要逐步处理大型结果集，或总结果数超出单次 query() 调用可返回的数量时，请使用此操作，而不是单次 query() 调用。 | Node.js"
type: docx
token: K5APdBqphoQG7vxU4P2ccr5Wnig
sidebar_position: 9
keywords: 
  - 音频相似性搜索
  - 弹性向量 Database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - searchIterator()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# searchIterator()

此操作以迭代方式执行标量过滤查询，并分批返回结果。当您需要逐步处理大型结果集，或总结果数超出单次 query() 调用可返回的数量时，请使用此操作，而不是单次 query() 调用。

```javascript
await milvusClient.queryIterator(data: QueryIteratorReq)
```

## 请求语法\{#request-syntax}

```javascript
await milvusClient.queryIterator({
    collection_name: string,
    batchSize: number,
    filter?: string,
    limit?: number,
    output_fields?: string[],
    partition_names?: string[],
    consistency_level?: ConsistencyLevelEnum,
    db_name?: string,
    timeout?: number,
})
```

**参数：**

- **collection_name** (*string*) -

    **[必填]**

    现有 Collection 的名称。

- **batchSize** (*number*) -

    **[必填]**

    每次迭代返回的 Entity 数量。不得超过 16,384。

- **filter** (*string*) -

    用于筛选匹配 Entity 的标量过滤条件。将其设置为空字符串可返回所有 Entity。要构建标量过滤条件，请参阅 Boolean Expression Rules。

- **limit** (*number*) -

    所有迭代中返回的 Entity 总数上限。默认为匹配 Entity 的总数（不限制）。

- **output_fields** (*string[]*) -

    要包含在每个返回 Entity 中的字段名称列表。默认返回所有字段。

- **partition_names** (*string[]*) -

    要查询的 Partition 名称。

- **consistency_level** (*ConsistencyLevelEnum*) -

    此操作的一致性级别。可选值：Strong (0)、Bounded (1)、Session (2)、Eventually (3)。默认为创建 Collection 时设置的一致性级别。

- **db_name** (*string*) -

    包含该 Collection 的 Database 名称。

- **timeout** (*number*) -

    此操作的超时时长，以毫秒为单位。

- **order_by_fields** (*OrderByFields*) -

    用于对搜索结果排序的字段。可选。

**返回：**

*Promise\<AsyncIterable\<object[]\>\>*

返回一个异步可迭代对象。每次迭代会生成该批次的 Entity 数组。当总结果数达到 `limit` 或所有匹配 Entity 均已返回时，迭代结束。

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

const iterator = await milvusClient.queryIterator({
    collection_name: 'my_collection',
    filter: 'age > 30',
    batchSize: 100,
    limit: 500,
    output_fields: ['id', 'age', 'text'],
});

for await (const batch of iterator) {
    console.log(`Batch of ${batch.length} entities:`, batch);
}
```
