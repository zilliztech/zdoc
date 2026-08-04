---
title: "searchIterator() | Node.js"
slug: /node/node/Vector-searchIterator
sidebar_label: "searchIterator()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作以迭代方式执行标量过滤查询，并按批返回结果。当您需要增量处理大型结果集，或总结果数超过单次 query() 调用可返回的数量时，请使用此操作而不是单次 query() 调用。 | Node.js"
type: docx
token: K5APdBqphoQG7vxU4P2ccr5Wnig
sidebar_position: 9
keywords: 
  - Audio similarity search
  - Elastic vector database
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

此操作以迭代方式执行标量过滤查询，并按批返回结果。当您需要增量处理大型结果集，或总结果数超过单次 query() 调用可返回的数量时，请使用此操作而不是单次 query() 调用。

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

    **[必需]**

    现有集合的名称。

- **batchSize** (*number*) -

    **[必需]**

    每次迭代返回的实体数量。不能超过 16,384。

- **filter** (*string*) -

    用于筛选匹配实体的标量过滤条件。将其设置为空字符串可返回所有实体。有关如何构建标量过滤条件，请参阅布尔表达式规则。

- **limit** (*number*) -

    所有迭代中可返回的实体总数上限。默认为匹配实体的总数（不设限制）。

- **output_fields** (*string[]*) -

    每个返回实体中要包含的字段名称列表。默认返回所有字段。

- **partition_names** (*string[]*) -

    要查询的分区名称。

- **consistency_level** (*ConsistencyLevelEnum*) -

    此操作的一致性级别。可选值：Strong (0)、Bounded (1)、Session (2)、Eventually (3)。默认使用创建集合时设置的一致性级别。

- **db_name** (*string*) -

    包含该集合的数据库名称。

- **timeout** (*number*) -

    此操作的超时时长，单位为毫秒。

- **order_by_fields** (*OrderByFields*) -

    用于对搜索结果排序的字段。可选。

**返回：**

*Promise\<AsyncIterable\<object[]\>\>*

返回一个异步可迭代对象。每次迭代会产出该批次的实体数组。当总结果数达到 `limit` 或所有匹配实体都已返回时，迭代结束。

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
