---
title: "Count Entities | Cloud"
slug: /count-entities
sidebar_label: "Count Entities"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This article demonstrates how to count entities in a collection and explains why the entity count might differ from the actual figure. | Cloud"
type: origin
token: OfUIwNWVuimZgFk3gBVc61GnnKW
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - upsert
  - update
  - count
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Count Entities

This article demonstrates how to count entities in a collection and explains why the entity count might differ from the actual figure.

## Overview\{#overview}

Zilliz Cloud provides two ways for you to count entities in a collection. 

- **Query with count(*) as the output field**

    To get the precise entity count in a collection, you should use this method and ensure that:

    - You have loaded the target collection.

    - You have set `consistency_level` to `Strong` in the query request.

    - You have set `output_field` to `['count(*)']`.

    When receiving such queries, Zilliz Cloud sends requests to the query node and counts the entities already loaded into memory.

    You can specify multiple partition names in the query to obtain corresponding entity counts in these partitions. For details, see [Query with count(*) as the output field](./count-entities).

- **Use get_collection_stats()**

    Although you can get the exact count of a collection using the method above, it is not recommended to use it everywhere. The process is basically a query, and frequent calls can cause network jitters or affect searches and queries related to your business. 

    If precision is not the main concern, you should use `get_collection_stats()` and `get_partition_stats()` instead. Although this call provides an estimated entity count, you do not need to load the target collection to run it, and the cost is small enough to ignore because it only reports what an internal tracker records. 

    For your information, all data manipulation operations are asynchronous, which is why the internal tracker cannot reflect the entity count in real time. For details, see [Use get_collection_stats()](./count-entities#use-getcollectionstats).

<Admonition type="info" icon="📘" title="Notes">

<p>Both methods mentioned above count entities with the same primary key as separate entities. </p>

</Admonition>

Instead of obtaining the entity count programmatically, you can also access the figure for a cluster, a collection, or a partition on the Zilliz Cloud console. You can read [Entity counts on the Zilliz Cloud console](./count-entities) for details.

## Query with `count(*)` as the output field\{#query-with-count-as-the-output-field}

To get the precise entity count, load the collection and run a query with `count(*)` as the output field and set the consistency level for the query to `Strong`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Count without the entities in growing segments
res = client.query(
    collection_name="test_collection",
    # highlight-next-line
    output_fields=['count(*)']
)

# Count with the entities in growing segments
res = client.query(
    collection_name="test_collection",
    # highlight-start
    output_fields=['count(*)'],
    consistency_level="Strong"
    # highlight-end
)

# Count the entities in a specific partition
res = client.query(
    collection_name="test_collection",
    # highlight-start
    output_fields=['count(*)'],
    partition_names=['default']
    # highlight-end
)

# Get the entity count
print(res[0]['count(*)'])
# Output
# 20
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq
import io.milvus.v2.service.vector.request.QueryResp

// Count without the entities in growing segments
QueryResp count = client.query(QueryReq.builder()
        .collectionName("test_collection")
        .filter("")
        // highlight-next-line
        .outputFields(Collections.singletonList("count(*)"))
        .build());

// Count with the entities in growing segments
count = client.query(QueryReq.builder()
        .collectionName("test_collection")
        .filter("")
        // highlight-start
        .outputFields(Collections.singletonList("count(*)"))
        .consistencyLevel(ConsistencyLevel.STRONG)
        // highlight-end
        .build());

// Count the entities in a specific partition
countR = client.query(QueryReq.builder()
        .collectionName("test_collection")
        .filter("")
        // highlight-start
        .outputFields(Collections.singletonList("count(*)"))
        .partitionNames(Collections.singletonList("default"))
        // highlight-end
        .build());

System.out.print(count.getQueryResults().get(0).getEntity().get("count(*)"));

// Output
// 20
```

</TabItem>

<TabItem value='go'>

```go
resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("test_collection").
    WithFilter("").
    WithOutputFields("count(*)").
    WithConsistencyLevel(entity.ClStrong))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println("count: ", resultSet.GetColumn("count").FieldData().GetScalars())

```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// Count with the entities in growing segments
let res = await client.query({
    collection_name: "test_collection",
    output_fields: ["count(*)"],
    consistency_level: 'Strong'
});

// Count the entities in a specific partition
res = await client.query({
    collection_name: "test_collection",
    output_fields: ["count(*)"],
    partition_names: ['default']
});

// Get the entity count
console.log(res.data[0]['count(*)'])
// Output
// 20

```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "test_collection",
    "filter": "",
    "outputFields": ["count(*)"]
}'
#{"code":0,"cost":0,"data":[{count: 20}]}
```

</TabItem>
</Tabs>

## Use `get_collection_stats()`\{#use-getcollectionstats}

As described above, the `get_collection_stats()` returns an estimated number of entities in a collection, which may differ from the actual entity count. You can use this as a reference without loading a collection. 

The following example assumes that a collection named `test_collection` exists.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 2. Get the entity count of a collection
client.get_collection_stats(collection_name="test_collection") 

# Output
# 
# {
#     'row_count': 1000
# }

# 3. Get the entity count of a partition
client.get_partition_stats(
    collection_name="test_collection",
    partition_name="_default"
) 

# Output
# 
# {
#     'row_count': 1000
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.GetCollectionStatsReq;
import io.milvus.v2.service.collection.response.GetCollectionStatsResp;
import io.milvus.v2.service.partition.request.GetPartitionStatsReq;
import io.milvus.v2.service.partition.response.GetPartitionStatsResp;

// 1. Set up a milvus client
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

// 2. Get the entity count of a collection
GetCollectionStatsResp stats = client.getCollectionStats(GetCollectionStatsReq.builder()
        .collectionName("test_collection")
        .build());
System.out.print(stats.getNumOfEntities());

// 3. Get the entity count of a partition
GetPartitionStatsResp partitionStats = client.getPartitionStats(GetPartitionStatsReq.builder()
        .collectionName("test_collection")
        .partitionName("_default")
        .build());
System.out.print(partitionStats.getNumOfEntities());
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

// 1. Set up a milvus client
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN'
});

// 2. Get the entity count
milvusClient.getCollectionStats({
 collection_name: 'test_collection',
 partition_name: '_default'
});

// Output
//
// {
//      data: {'row_count': 1000 }
// }
```

</TabItem>

<TabItem value='bash'>

```bash
# curl
```

</TabItem>
</Tabs>

## Entity counts on the Zilliz Cloud console\{#entity-counts-on-the-zilliz-cloud-console}

Instead of counting the entities programmatically, you can also access the Zilliz Cloud console to find the entity count for a cluster, a collection, or a partition on the following pages.

### Metrics\{#metrics}

You can find **Entity Count** and **Loaded Entities (Approx.)** of a cluster on its **Metrics** tab. Both values are estimates. Values in the curve are obtained [using ](./count-entities#use-getcollectionstats)[`get_collection_stats()`](./count-entities#use-getcollectionstats). If there are no further data insertions and deletions, the **Entity Count** curve will eventually reflect the actual number of entities in the current collection.

![UGT3bXxnjordXpxhTZUcMYK6nQg](https://zdoc-images.s3.us-west-2.amazonaws.com/ugt3bxxnjordxpxhtzucmyk6nqg.png "UGT3bXxnjordXpxhTZUcMYK6nQg")

### Collection Details\{#collection-details}

You can find the actual entity count of a collection on its details tab. This value is obtained by using [queries with ](./count-entities)[`count(*)`](./count-entities)[ as the output field](./count-entities).

![L8ImbqFLIonMTxx47WBcF5IbnTf](https://zdoc-images.s3.us-west-2.amazonaws.com/l8imbqflionmtxx47wbcf5ibntf.png "L8ImbqFLIonMTxx47WBcF5IbnTf")

### Partitions\{#partitions}

You can also use the **Partitions** tab of a collection to find the estimated number of loaded entities in its child partitions. This value is obtained by using `get_partition_stats()`.

![Y4Etb0AITotVQNxvzs4cZCHsn9d](https://zdoc-images.s3.us-west-2.amazonaws.com/y4etb0aitotvqnxvzs4czchsn9d.png "Y4Etb0AITotVQNxvzs4cZCHsn9d")

## FAQs\{#faqs}

- **Why does the entity count obtained using get_collection_stats() or get_partition_stats() not reflect the actual number of entities in the target collection or partition after I have inserted some entities?** 

    These methods only report what an internal tracker records, which may differ from the actual entity counts because all data operations are asynchronous.

- **Why does the Entity Count curve on the Metrics tab of a collection not change after I insert or delete some entities?**

    Values in the **Entity Count** curve are estimated at specific time points. Since all data operations are asynchronous, there may be a delay before they are reflected in the curve.

- **Why does the value displayed in the Entity Count (Approx.) column on the Partitions tab of a collection not change after I insert or delete some entities?**

    The values displayed for the listed partitions are all estimates. Since all data operations are asynchronous, there may be a delay before they are reflected in the curve.

- **Why does the value displayed in Loaded Entities on the Overview tab of a collection not reflect the actual number of entities in the collection?**

    The value displayed in **Loaded Entities** is accurate. If there is a gap between this value and the number of entities obtained from a typical query, some entities in the collection may have identical primary keys. 

    Note that queries with `count(*)` as the output field treat entities with identical primary keys as separate entities, while other queries will omit entities with the same primary keys before returning the final results.

