---
title: "Manage Partitions | Cloud"
slug: /manage-partitions
sidebar_label: "Manage Partitions"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A partition is a subset of a collection. Each partition shares the same data structure with its parent collection but contains only a subset of the data in the collection. This page helps you understand how to manage partitions. | Cloud"
type: origin
token: JCMPwIyVciCT4Hk4O20c96MEnch
sidebar_position: 8
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - partition
  - partitions
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manage Partitions

A partition is a subset of a collection. Each partition shares the same data structure with its parent collection but contains only a subset of the data in the collection. This page helps you understand how to manage partitions.

## Overview\{#overview}

When creating a collection, Zilliz Cloud also creates a partition named **_default** in the collection. If you are not going to add any other partitions, all entities inserted into the collection go into the default partition, and all searches and queries are also carried out within the default partition.

You can add more partitions and insert entities into them based on certain criteria. Then you can restrict your searches and queries within certain partitions, improving search performance.

A collection can have a maximum of 1,024 partitions.

<Admonition type="info" icon="📘" title="Notes">

<p>The <strong>Partition Key</strong> feature is a search optimization based on partitions and allows Zilliz Cloud to distribute entities into different partitions based on the values in a specific scalar field. This feature helps implement partition-oriented multi-tenancy and improves search performance.</p>
<p>This feature will not be discussed on this page. To find more, refer to <a href="./use-partition-key">Use Partition Key</a>.</p>

</Admonition>

## List Partitions\{#list-partitions}

When creating a collection, Zilliz Cloud also creates a partition named **_default** in the collection. You can list the partitions in a collection as follows.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

res = client.list_partitions(
    collection_name="my_collection"
)

print(res)

# Output
#
# ["_default"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.ListPartitionsReq;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

import java.util.*;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

ListPartitionsReq listPartitionsReq = ListPartitionsReq.builder()
        .collectionName("my_collection")
        .build();

List<String> partitionNames = client.listPartitions(listPartitionsReq);
System.out.println(partitionNames);

// Output:
// [_default]
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

let res = await client.listPartitions({
    collection_name: "my_collection"
})

console.log(res);

// Output
// ["_default"]
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

partitionNames, err := client.ListPartitions(ctx, milvusclient.NewListPartitionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println(partitionNames)
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection"
}'

# {
#     "code": 0,
#     "data": [
#         "_default"
#     ]
# }
```

</TabItem>
</Tabs>

## Create Partition\{#create-partition}

You can add more partitions to the collection and insert entities into these partitions based on certain criteria.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_partition(
    collection_name="my_collection",
    partition_name="partitionA"
)

res = client.list_partitions(
    collection_name="my_collection"
)

print(res)

# Output
#
# ["_default", "partitionA"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.CreatePartitionReq;

CreatePartitionReq createPartitionReq = CreatePartitionReq.builder()
        .collectionName("my_collection")
        .partitionName("partitionA")
        .build();

client.createPartition(createPartitionReq);

ListPartitionsReq listPartitionsReq = ListPartitionsReq.builder()
        .collectionName("my_collection")
        .build();

List<String> partitionNames = client.listPartitions(listPartitionsReq);
System.out.println(partitionNames);

// Output:
// [_default, partitionA]
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createPartition({
    collection_name: "my_collection",
    partition_name: "partitionA"
})

res = await client.listPartitions({
    collection_name: "my_collection"
})

console.log(res)

// Output
// ["_default", "partitionA"]
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"
    
    client "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

err = client.CreatePartition(ctx, milvusclient.NewCreatePartitionOption("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

partitionNames, err := client.ListPartitions(ctx, milvusclient.NewListPartitionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println(partitionNames)
// Output
// ["_default", "partitionA"]
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionName": "partitionA"
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection"
}'

# {
#     "code": 0,
#     "data": [
#         "_default",
#         "partitionA"
#     ]
# }
```

</TabItem>
</Tabs>

## Check for a Specific Partition\{#check-for-a-specific-partition}

The following code snippets demonstrate how to check whether a partition exists in a specific collection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.has_partition(
    collection_name="my_collection",
    partition_name="partitionA"
)

print(res)

# Output
#
# True
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.HasPartitionReq;

HasPartitionReq hasPartitionReq = HasPartitionReq.builder()
        .collectionName("my_collection")
        .partitionName("partitionA")
        .build();

Boolean hasPartitionRes = client.hasPartition(hasPartitionReq);
System.out.println(hasPartitionRes);

// Output:
// true
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.hasPartition({
    collection_name: "my_collection",
    partition_name: "partitionA"
})

console.log(res.value)

// Output
// true
```

</TabItem>

<TabItem value='go'>

```go
result, err := client.HasPartition(ctx, milvusclient.NewHasPartitionOption("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println(result)

// Output:
// true
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/has" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionName": "partitionA"
}'

# {
#     "code": 0,
#     "data": {
#        "has": true
#     }
# }
```

</TabItem>
</Tabs>

## Load and Release Partitions\{#load-and-release-partitions}

You can separately load or release one or certain partitions.

### Load Partitions\{#load-partitions}

You can separately load specific partitions in a collection. It is worth noting that the load status of a collection stays unloaded if there is an unloaded partition in the collection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.load_partitions(
    collection_name="my_collection",
    partition_names=["partitionA"]
)

res = client.get_load_state(
    collection_name="my_collection",
    partition_name="partitionA"
)

print(res)
# Output
#
# {
#     "state": "<LoadState: Loaded>"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.LoadPartitionsReq;
import io.milvus.v2.service.collection.request.GetLoadStateReq;

LoadPartitionsReq loadPartitionsReq = LoadPartitionsReq.builder()
        .collectionName("my_collection")
        .partitionNames(Collections.singletonList("partitionA"))
        .build();

client.loadPartitions(loadPartitionsReq);

GetLoadStateReq getLoadStateReq = GetLoadStateReq.builder()
        .collectionName("my_collection")
        .partitionName("partitionA")
        .build();

Boolean getLoadStateRes = client.getLoadState(getLoadStateReq);
System.out.println(getLoadStateRes);

// True
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.loadPartitions({
    collection_name: "my_collection",
    partition_names: ["partitionA"]
})

res = await client.getLoadState({
    collection_name: "my_collection",
    partition_name: "partitionA"
})

console.log(res)

// Output
// 
// LoadStateLoaded
// 
```

</TabItem>

<TabItem value='go'>

```go
task, err := client.LoadPartitions(ctx, milvusclient.NewLoadPartitionsOption("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

// sync wait collection to be loaded
err = task.Await(ctx)
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

state, err := client.GetLoadState(ctx, milvusclient.NewGetLoadStateOption("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(state)
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/load" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionNames": ["partitionA"]
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/get_load_state" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionNames": ["partitionA"]
}'

# {
#     "code": 0,
#     "data": {
#         "loadProgress": 100,
#         "loadState": "LoadStateLoaded",
#         "message": ""
#     }
# }
```

</TabItem>
</Tabs>

### Release Partitions\{#release-partitions}

You can also release specific partitions.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.release_partitions(
    collection_name="my_collection",
    partition_names=["partitionA"]
)

res = client.get_load_state(
    collection_name="my_collection",
    partition_name="partitionA"
)

print(res)

# Output
#
# {
#     "state": "<LoadState: NotLoaded>"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.ReleasePartitionsReq;

ReleasePartitionsReq releasePartitionsReq = ReleasePartitionsReq.builder()
        .collectionName("my_collection")
        .partitionNames(Collections.singletonList("partitionA"))
        .build();

client.releasePartitions(releasePartitionsReq);

GetLoadStateReq getLoadStateReq = GetLoadStateReq.builder()
        .collectionName("my_collection")
        .partitionName("partitionA")
        .build();

Boolean getLoadStateRes = client.getLoadState(getLoadStateReq);
System.out.println(getLoadStateRes);

// False
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.releasePartitions({
    collection_name: "my_collection",
    partition_names: ["partitionA"]
})

res = await client.getLoadState({
    collection_name: "my_collection",
    partition_name: "partitionA"
})

console.log(res)

// Output
// 
// LoadStateNotLoaded
// 
```

</TabItem>

<TabItem value='go'>

```go
err = client.ReleasePartitions(ctx, milvusclient.NewReleasePartitionsOptions("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

state, err := client.GetLoadState(ctx, milvusclient.NewGetLoadStateOption("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(state)
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/release" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionNames": ["partitionA"]
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/get_load_state" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionNames": ["partitionA"]
}'

# {
#     "code": 0,
#     "data": {
#         "loadProgress": 0,
#         "loadState": "LoadStateNotLoaded",
#         "message": ""
#     }
# }
```

</TabItem>
</Tabs>

## Data Operations Within Partitions\{#data-operations-within-partitions}

### Insert and Delete Entities\{#insert-and-delete-entities}

You can perform insert, upsert, and delete operations in specific operations. For details, refer to

- [Insert Entities into Partition](./insert-entities#insert-entities-into-a-partition)

- [Upsert Entities into Partition](./upsert-entities#upsert-entities-in-a-partition)

- [Delete Entities from Partition](./delete-entities#delete-entities-from-partitions)

### Search and Query\{#search-and-query}

You can conduct searches and queries within specific partitions. For details, refer to 

- [Conduct ANN Searches within Partitions](./single-vector-search#ann-search-in-partition)

- [Conduct Metadata Filtering within Partitions](./get-and-scalar-query#queries-in-partitions)

## Drop Partition\{#drop-partition}

You can drop partitions that are no longer needed. Before dropping a partition, ensure that the partition has been released.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.release_partitions(
    collection_name="my_collection",
    partition_names=["partitionA"]
)

client.drop_partition(
    collection_name="my_collection",
    partition_name="partitionA"
)

res = client.list_partitions(
    collection_name="my_collection"
)

print(res)

# ["_default"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.DropPartitionReq;
import io.milvus.v2.service.partition.request.ReleasePartitionsReq;
import io.milvus.v2.service.partition.request.ListPartitionsReq;

ReleasePartitionsReq releasePartitionsReq = ReleasePartitionsReq.builder()
        .collectionName("my_collection")
        .partitionNames(Collections.singletonList("partitionA"))
        .build();

client.releasePartitions(releasePartitionsReq);

DropPartitionReq dropPartitionReq = DropPartitionReq.builder()
        .collectionName("my_collection")
        .partitionName("partitionA")
        .build();

client.dropPartition(dropPartitionReq);

ListPartitionsReq listPartitionsReq = ListPartitionsReq.builder()
        .collectionName("my_collection")
        .build();

List<String> partitionNames = client.listPartitions(listPartitionsReq);
System.out.println(partitionNames);

// Output:
// [_default]
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.releasePartitions({
    collection_name: "my_collection",
    partition_names: ["partitionA"]
})

await client.dropPartition({
    collection_name: "my_collection",
    partition_name: "partitionA"
})

res = await client.listPartitions({
    collection_name: "my_collection"
})

console.log(res)

// Output
// ["_default"]
```

</TabItem>

<TabItem value='go'>

```go
err = client.ReleasePartitions(ctx, milvusclient.NewReleasePartitionsOptions("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = client.DropPartition(ctx, milvusclient.NewDropPartitionOption("my_collection", "partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

partitionNames, err := client.ListPartitions(ctx, milvusclient.NewListPartitionOption("my_collection"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(partitionNames)
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/release" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionNames": ["partitionA"]
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionName": "partitionA"
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/partitions/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection"
}'

# {
#     "code": 0,
#     "data": [
#         "_default"
#     ]
# }
```

</TabItem>
</Tabs>

