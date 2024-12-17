---
title: "Query | BYOC"
slug: /get-and-scalar-query
sidebar_label: "Query"
beta: FALSE
notebook: FALSE
description: "In addition to ANN searches, Milvus also supports metadata filtering through queries. This page introduces how to use Query, Get, and QueryIterators to perform metadata filtering. | BYOC"
type: origin
token: R7F7wY8pCiJ5Q4kbntxcMsE6nLf
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - get by id
  - query with filters
  - filtering

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Query

In addition to ANN searches, Milvus also supports metadata filtering through queries. This page introduces how to use Query, Get, and QueryIterators to perform metadata filtering.

## Overview{#overview}

A Collection can store various types of scalar fields. You can have Milvus filter Entities based on one or more scalar fields. Milvus offers three types of queries: Query, Get, and QueryIterator. The table below compares these three query types.

<table>
   <tr>
     <th></th>
     <th><p>Get</p></th>
     <th><p>Query</p></th>
     <th><p>QueryIterator</p></th>
   </tr>
   <tr>
     <td><p>Applicable scenarios</p></td>
     <td><p>To find entities that hold the specified primary keys.</p></td>
     <td><p>To find all or a specified number of entities that meet the custom filtering conditions</p></td>
     <td><p>To find all entities that meet the custom filtering conditions in paginated queries.</p></td>
   </tr>
   <tr>
     <td><p>Filtering method</p></td>
     <td><p>By primary keys</p></td>
     <td><p>By filtering expressions.</p></td>
     <td><p>By filtering expressions.</p></td>
   </tr>
   <tr>
     <td><p>Mandatory parameters</p></td>
     <td><ul><li><p>Collection name</p></li><li><p>Primary keys</p></li></ul></td>
     <td><ul><li><p>Collection name</p></li><li><p>Filtering expressions</p></li></ul></td>
     <td><ul><li><p>Collection name</p></li><li><p>Filtering expressions</p></li><li><p>Number of entities to return per query</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Optional parameters</p></td>
     <td><ul><li><p>Partition name</p></li><li><p>Output fields</p></li></ul></td>
     <td><ul><li><p>Partition name</p></li><li><p>Number of entities to return</p></li><li><p>Output fields</p></li></ul></td>
     <td><ul><li><p>Partition name</p></li><li><p>Number of entities to return in total</p></li><li><p>Output fields</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Returns</p></td>
     <td><p>Returns entities that hold the specified primary keys in the specified collection or partition.</p></td>
     <td><p>Returns all or a specified number of entities that meet the custom filtering conditions in the specified collection or partition.</p></td>
     <td><p>Returns all entities that meet the custom filtering conditions in the specified collection or partition through paginated queries.</p></td>
   </tr>
</table>

For more on metadata filtering, refer to [Filtering](./filtering).

## Use Get{#use-get}

When you need to find entities by their primary keys, you can use the **Get** method. The following code examples assume that there are three fields named `id`, `vector`, and `color` in your collection and return the entities with primary keys `1`, `2`, and `3`.

[Unsupported block type]

## Use Query{#use-query}

When you need to find entities by custom filtering conditions, use the **Query** method. The following code examples assume there are three fields named `id`, `vector`, and `color` and return the specified number of entities that hold a `color` value starting with `red`.

[Unsupported block type]

## Use QueryIterator{#use-queryiterator}

When you need to find entities by custom filtering conditions through paginated queries, create a **QueryIterator** and use its **next()** method to iterate over all entities to find those meeting the filtering conditions. The following code examples assume that there are three fields named `id`, `vector`, and `color` and return all entities that hold a `color` value starting with `red`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import connections, Collection

connections.connect(
    uri="http://localhost:19530",
    token="root:Milvus"
)

collection = Collection("query_collection")

iterator = collection.query_iterator(
    batch_size=10,
    expr="color like \"red%\"",
    output_fields=["color"]
)

results = []

while True:
    result = iterator.next()
    if not result:
        iterator.close()
        break

    print(result)
    results += result
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.orm.iterator.QueryIterator;
import io.milvus.response.QueryResultsWrapper;
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.vector.request.QueryIteratorReq;

QueryIteratorReq req = QueryIteratorReq.builder()
        .collectionName("query_collection")
        .expr("color like \"red%\"")
        .batchSize(50L)
        .outputFields(Collections.singletonList("color"))
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build();
QueryIterator queryIterator = client.queryIterator(req);

while (true) {
    List<QueryResultsWrapper.RowRecord> res = queryIterator.next();
    if (res.isEmpty()) {
        queryIterator.close();
        break;
    }

    for (QueryResultsWrapper.RowRecord record : res) {
        System.out.println(record);
    }
}

// Output
// [color:red_7025, id:1]
// [color:red_4794, id:4]
// [color:red_9392, id:6]
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const iterator = await milvusClient.queryIterator({
  collection_name: 'query_collection',
  batchSize: 10,
  expr: 'color like "red%"',
  output_fields: ['color'],
});

const results = [];
for await (const value of iterator) {
  results.push(...value);
  page += 1;
}
```

</TabItem>

<TabItem value='bash'>

```bash
# 暂无此方法
```

</TabItem>
</Tabs>

## Queries in Partitions{#queries-in-partitions}

You can also perform queries within one or multiple partitions by including the partition names in the Get, Query, or QueryIterator request. The following code examples assume that there is a partition named **PartitionA** in the collection.

[Unsupported block type]

