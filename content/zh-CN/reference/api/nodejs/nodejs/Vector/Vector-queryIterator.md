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

---

# queryIterator()

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
    expr?: string,
    exprValues?: keyValueObj,
    params?: keyValueObj,
    group_by_fields?: string[],
    order_by_fields?: OrderByFields,
    order_by?: OrderByFields,
    transformers?: OutputTransformers,
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

    每次迭代返回的 Entity 数量。不能超过 16,384。

- **filter** (*string*) -

    用于筛选匹配 Entity 的标量过滤条件。将其设置为空字符串可返回所有 Entity。要构建标量过滤条件，请参见布尔表达式规则。

- **expr** (*string*) -

    **filter** 的别名。请提供 **filter** 或 **expr**，不要同时提供两者。

- **exprValues** (*keyValueObj*) -

    如果在过滤表达式中使用占位符，您可以将这些占位符的实际值指定为键值对。

- **params** (*keyValueObj*) -

    以键值对形式提供的其他查询参数。

- **group_by_fields** (*string[]*) -

    用于对聚合结果进行分组的标量字段。

- **order_by_fields** (*OrderByFields*) -

    用于对查询结果排序的字段。

- **order_by** (*OrderByFields*) -

    **order_by_fields** 的别名。

- **transformers** (*OutputTransformers*) -

    用于针对特定数据类型转换数据的自定义函数。

- **limit** (*number*) -

    所有迭代中返回的 Entity 最大总数。该值默认为匹配 Entity 的总数（无限制）。

- **output_fields** (*string[]*) -

    每个返回的 Entity 中要包含的字段名列表。默认返回所有字段。

- **partition_names** (*string[]*) -

    要查询的 Partition 名称。

- **consistency_level** (*ConsistencyLevelEnum*) -

    此操作的一致性级别。可选值包括 Strong (0)、Session (1)、Bounded (2) 和 Eventually (3)。该值默认为创建 Collection 时设置的一致性级别。请参见 [ConsistencyLevelEnum](./Collections-ConsistencyLevelEnum)。

- **db_name** (*string*) -

    包含该 Collection 的 Database 名称。

- **timeout** (*number*) -

    此操作的超时时间，单位为毫秒。

**返回：**

*Promise&lt;AsyncIterable&lt;object[]&gt;&gt;*

返回一个异步可迭代对象。每次迭代都会生成该批次对应的 Entity 数组。当总结果数达到 `limit` 或所有匹配的 Entity 均已耗尽时，迭代结束。

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
