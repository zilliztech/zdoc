---
title: "统计 Entity 数量 | BYOC"
slug: /count-entities
sidebar_label: "统计 Entity 数量"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本文展示了如何统计 Collection 中的 Entity 数量，并解释了Entity 计数可能与实际数字不同的原因。 | BYOC"
type: origin
token: SabAwl5dZiOOavkPsJdcqvB3n7f
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 数据操作
  - upsert
  - 计数
  - 统计 Entity 数量

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 统计 Entity 数量

本文展示了如何统计 Collection 中的 Entity 数量，并解释了Entity 计数可能与实际数字不同的原因。

## 概述\{#overview}

Zilliz Cloud 为您提供了两种统计集合中 Entity 数量的方法。

- **查询以count(&ast;)作为输出字段**

    要获取 Collection 中 Entity 的确切数量，您应该使用此方法并确保：

    - 您已加载目标 Collection。

    - 您已在查询请求中将`consistency_level`设置为`Strong`。

    - 您已将`output_field`设置为`['count(*)']`。

    在接收到此类查询时，Zilliz Cloud会向查询节点发送请求，并统计已加载到内存中的 Entity 数量。

    您可以在查询中指定多个 Partition 名称，以获取这些 Partition 中对应的 Entity 计数。有关详细信息，请参阅[以 count(*) 作为输出字段的查询](./count-entities#query-with-count-as-the-output-field)。

- **使用get_collection_stats()**

    虽然你可以使用上述方法获取 Collection 的确切计数，但不建议在所有场合都使用它。这个过程本质上是一个查询，频繁调用可能会导致网络抖动，或者影响与你的业务相关的搜索和查询。

    如果统计结果的准确性不是主要考虑因素，您应该使用`get_collection_stats()`和`get_partition_stats()`。虽然此调用提供的是估计的 Entity 计数，但您无需加载目标集合即可运行它，而且成本小到可以忽略不计，因为它只是报告内部跟踪器记录的内容。

    需要说明的是，所有数据操作都是异步的，这就是内部跟踪器无法实时反映 Entity 数量的原因。详情请参阅[使用 get_collection_stats()](./count-entities#use-get_collection_stats)。

<Admonition type="info" icon="📘" title="注释">

<p>上述两种方法均将具有相同主键的 Entity 视为独立 Entity。</p>

</Admonition>

除了通过编程方式获取 Entity 计数外，您还可以在Zilliz Cloud控制台中查看集群、Collection 或 Partition 的相关数据。您可以阅读[Zilliz Cloud 控制台中的 Entity 计数](./count-entities#entity-counts-on-the-zilliz-cloud-console)以了解详细信息。

## 以 `count(*)` 作为输出字段的查询\{#query-with-count-as-the-output-field}

要获取准确的 Entity 计数，请加载 Collection 并运行一个查询，并将 `count(*)` 作为输出字段，且将查询的 `consistency_level` 设置为 `Strong`。

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
    partition_names=['_default']
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
        .partitionNames(Collections.singletonList("_default"))
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
    partition_names: ['_default']
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

## 使用 `get_collection_stats()`\{#use-get_collection_stats}

如上文所述，`get_collection_stats()` 返回 Collection 中 Entity 的估计数量，该数量可能与实际实体计数不同。您可以将此作为参考，而无需加载集合。

以下示例假定存在一个名为`test_collection`的集合。

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

## Zilliz Cloud 控制台中的 Entity 计数\{#entity-counts-on-the-zilliz-cloud-console}

除了通过编程方式统计 Entity 数量外，您还可以访问 Zilliz Cloud 控制台，在以下页面中查找集群、Collection 或 Partition 中的 Entity 数量。

### 指标\{#metrics}

您可以在集群的**实体计数**和**已加载实体（近似值）**的**指标**选项卡中找到它们。这两个值都是估算值。曲线中的值是通过[使用](./count-entities#use-get_collection_stats)[`get_collection_stats()`](./count-entities#use-get_collection_stats)获取的。如果没有进一步的数据插入和删除，**实体计数**曲线最终将反映当前集合中实体的实际数量。

![MCbMbZ8McoWwc3xDzBtcd7ebn4f](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/MCbMbZ8McoWwc3xDzBtcd7ebn4f.png)

### Collection 详情\{#collection-details}

您可以在集合的详情标签页中找到其实际实体计数。此值是通过使用[查询并将](./count-entities#query-with-count-as-the-output-field)[`count(*)`](./count-entities#query-with-count-as-the-output-field)[作为输出字段](./count-entities#query-with-count-as-the-output-field)获得的。

![OzLub9Ytvo7AJnxqlpWccT7nn7f](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/OzLub9Ytvo7AJnxqlpWccT7nn7f.png)

### Partitions\{#partitions}

您还可以使用集合的**分区**选项卡来查找其子分区中已加载实体的估计数量。此值通过使用`get_partition_stats()`获得。

![SQ6qbK1qhoAeo9x4G61cgU6dnDU](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/SQ6qbK1qhoAeo9x4G61cgU6dnDU.png)

## 常见问题解答\{#faqs}

- **为什么在我插入一些实体后，使用get_collection_stats()或get_partition_stats()获取的实体计数没有反映目标集合或分区中的实际实体数量？**

    这些方法仅报告内部跟踪器记录的内容，由于所有数据操作都是异步的，因此可能与实际实体计数不同。

- **在我插入或删除一些实体后，集合的指标标签页上的实体计数曲线为何没有变化？**

    在**实体计数**曲线中的值是在特定的时间点估计的，由于所有的数据操作都是异步的，所以在它们反映到曲线中之前可能会有一个延迟。

- **为什么在集合的“分区”选项卡的“实体计数（近似）”列中显示的值在我插入或删除一些实体后没有改变？**

    列出的分区所显示的值均为估算值。由于所有数据操作都是异步的，因此在它们反映到曲线中之前可能会有延迟。

- **为什么集合概述选项卡中“已加载实体”显示的值不能反映集合中实体的实际数量？**

    在**加载实体**中显示的值是准确的。如果此值与从典型查询获得的实体数量之间存在差距，则集合中的某些实体可能具有相同的主键。

    请注意，以`count(*)`作为输出字段的查询会将具有相同主键的实体视为不同实体，而其他查询会在返回最终结果之前省略具有相同主键的实体。

