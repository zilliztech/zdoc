---
slug: /manage-partitions
beta: FALSE
notebook: FALSE
type: origin
token: LcEdwc5sWiMMzdke2UWcQ105nqd
sidebar_position: 3

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manage Partitions

This guide walks you through how to create and manage partitions in a collection. 

## Overview{#overview}

A partition on Zilliz Cloud represents a sub-division of a collection. This functionality allows the physical storage of a collection to be divided into multiple parts, contributing to improved query performance by narrowing down the focus to a smaller subset of data rather than the entire collection.

Upon the creation of a collection, at least a default partition named **_default** is automatically created. You can create a maximum of 4,096 partitions within a collection.

For a comprehensive understanding of the relationships between clusters, collections, indexes, partitions, and entities, read [Cluster, Collection & Entities](./cluster-collection-and-entities).

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud  introduces a feature called <strong>Partition Key</strong>, leveraging the underlying partitions to store entities based on the hashed values of a specific field. This feature facilitates the implementation of multi-tenancy, enhancing search performance. For details, read <a href="./use-partition-key">Use Partition Key</a>.</p>
<p>If the <strong>Partition Key</strong> feature is on in a collection, Zilliz Cloud takes care of managing all the partitions, relieving you of this responsibility.</p>

</Admonition>

## Preparations{#preparations}

The code snippet below repurposes the existing code to establish a connection to a Zilliz Cloud cluster and create a collection in a quick-setup mode, indicating that the collection is loaded upon creation.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

# 1. Set up a Milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

# 2. Create a collection
client.create_collection(
    collection_name="quick_setup",
    dimension=5,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create a collection in quick setup mode
CreateCollectionReq quickSetupReq = CreateCollectionReq.builder()
    .collectionName("quick_setup")
    .dimension(5)
    .build();

client.createCollection(quickSetupReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const address = "YOUR_CLUSTER_ENDPOINT"
const token = "YOUR_CLUSTER_TOKEN"

// 1. Set up a Milvus Client
client = new MilvusClient({address, token});

// 2. Create a collection in quick setup mode
await client.createCollection({
    collection_name: "quick_setup",
    dimension: 5,
});  
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>In the above code snippet, the index of the collection has been created along with the collection, indicating that the collection is loaded upon creation.</p>

</Admonition>

## List Partitions{#list-partitions}

Once a collection is ready, you can list its partitions.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 3. List partitions
res = client.list_partitions(collection_name="quick_setup")
print(res)

# Output
#
# ["_default"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.ListPartitionsReq;

// 3. List all partitions in the collection
ListPartitionsReq listPartitionsReq = ListPartitionsReq.builder()
    .collectionName("quick_setup")
    .build();

List<String> partitionNames = client.listPartitions(listPartitionsReq);

System.out.println(partitionNames);

// Output:
// ["_default"]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 3. List partitions
res = await client.listPartitions({
    collection_name: "quick_setup"
})

console.log(res.partition_names)

// Output
// 
// [ '_default' ]
// 
```

</TabItem>
</Tabs>

The output of the above code snippet includes the names of the partitions within the specified collection.

<Admonition type="info" icon="📘" title="Notes">

<p>If you have set a field as the partition key in a collection, Zilliz Cloud creates at least <strong>64</strong> partitions along with the collection. When listing the partitions, the results may differ from the output of the above code snippets.</p>
<p>For details, refer to <a href="./use-partition-key">Use Partition Key</a>.</p>

</Admonition>

## Create Partitions{#create-partitions}

You can add more partitions to the collection. A collection can have up to 64 partitions.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 4. Create more partitions
client.create_partition(
    collection_name="quick_setup",
    partition_name="partitionA"
)

client.create_partition(
    collection_name="quick_setup",
    partition_name="partitionB"
)

res = client.list_partitions(collection_name="quick_setup")
print(res)

# Output
#
# ["_default", "partitionA", "partitionB"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.CreatePartitionReq;

// 4. Create more partitions
CreatePartitionReq createPartitionReq = CreatePartitionReq.builder()
    .collectionName("quick_setup")
    .partitionName("partitionA")
    .build();

client.createPartition(createPartitionReq);

createPartitionReq = CreatePartitionReq.builder()
    .collectionName("quick_setup")
    .partitionName("partitionB")
    .build();

client.createPartition(createPartitionReq);

listPartitionsReq = ListPartitionsReq.builder()
    .collectionName("quick_setup")
    .build();

partitionNames = client.listPartitions(listPartitionsReq);

System.out.println(partitionNames);

// Output:
// [
//     "_default",
//     "partitionA",
//     "partitionB"
// ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. Create more partitions
await client.createPartition({
    collection_name: "quick_setup",
    partition_name: "partitionA"
})

await client.createPartition({
    collection_name: "quick_setup",
    partition_name: "partitionB"
})

res = await client.listPartitions({
    collection_name: "quick_setup"
})

console.log(res.partition_names)

// Output
// 
// [ '_default', 'partitionA', 'partitionB' ]
// 
```

</TabItem>
</Tabs>

The code snippet above creates a partition in a collection and lists the partitions of the collection.

<Admonition type="info" icon="📘" title="Notes">

<p>If you have set a field as the partition key in a collection, Zilliz Cloud takes care of managing the partitions in the collection. Therefore, you may encounter prompted errors when attempting to create partitions.</p>
<p>For details, refer to <a href="./use-partition-key">Use Partition Key</a>.</p>

</Admonition>

## Check for a Specific Partition{#check-for-a-specific-partition}

You can also check the existence of a specific partition.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 5. Check whether a partition exists
res = client.has_partition(
    collection_name="quick_setup",
    partition_name="partitionA"
)
print(res)

# Output
#
# True

res = client.has_partition(
    collection_name="quick_setup",
    partition_name="partitionC"
)
print(res)

# Output
#
# False
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.HasPartitionReq;

// 5. Check whether a partition exists
HasPartitionReq hasPartitionReq = HasPartitionReq.builder()
    .collectionName("quick_setup")
    .partitionName("partitionA")
    .build();

boolean exists = client.hasPartition(hasPartitionReq);

System.out.println(exists);

// Output:
// true

hasPartitionReq = HasPartitionReq.builder()
    .collectionName("quick_setup")
    .partitionName("partitionC")
    .build();

exists = client.hasPartition(hasPartitionReq);

System.out.println(exists);

// Output:
// false
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 5. Check whether a partition exists
res = await client.hasPartition({
    collection_name: "quick_setup",
    partition_name: "partitionA"
})

console.log(res.value)

// Output
// 
// true
// 

res = await client.hasPartition({
    collection_name: "quick_setup",
    partition_name: "partitionC"
})

console.log(res.value)

// Output
// 
// false
// 

```

</TabItem>
</Tabs>

The code snippet above checks whether the collection has a partition named `partitionA` and `partitionC`.

## Load & Release Partitions{#load-and-release-partitions}

You can load and release specific partitions to make them available or unavailable for searches and queries. 

### Get Load Status{#get-load-status}

To check the load status of a collection and its partitions, do as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 6. Load a partition independantly
client.release_collection(collection_name="quick_setup")

res = client.get_load_state(collection_name="quick_setup")
print(res)

# Output
#
# {
#     "state": "<LoadState: NotLoad>"
# }

client.load_partitions(
    collection_name="quick_setup",
    partition_names=["partitionA"]
)

res = client.get_load_state(collection_name="quick_setup")
print(res)

# Output
#
# {
#     "state": "<LoadState: Loaded>"
# }

res = client.get_load_state(collection_name="quick_setup", partition_name="partitionA")
print(res)

# Output
#
# {
#     "state": "<LoadState: Loaded>"
# }

res = client.get_load_state(collection_name="quick_setup", partition_name="partitionB")
print(res)

# Output
#
# {
#     "state": "<LoadState: NotLoad>"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.GetLoadStateReq;
import io.milvus.v2.service.collection.request.ReleaseCollectionReq;
import io.milvus.v2.service.partition.request.LoadPartitionsReq;
import io.milvus.v2.service.partition.request.ReleasePartitionsReq;

// 6. Load a partition independantly
// 6.1 Release the collection
ReleaseCollectionReq releaseCollectionReq = ReleaseCollectionReq.builder()
    .collectionName("quick_setup")
    .build();

client.releaseCollection(releaseCollectionReq);

// 6.2 Load partitionA
LoadPartitionsReq loadPartitionsReq = LoadPartitionsReq.builder()
    .collectionName("quick_setup")
    .partitionNames(List.of("partitionA"))
    .build();

client.loadPartitions(loadPartitionsReq);

Thread.sleep(3000);

// 6.3 Check the load status of the collection and its partitions
GetLoadStateReq getLoadStateReq = GetLoadStateReq.builder()
    .collectionName("quick_setup")
    .build();

boolean state = client.getLoadState(getLoadStateReq);

System.out.println(state);

// Output:
// true

getLoadStateReq = GetLoadStateReq.builder()
    .collectionName("quick_setup")
    .partitionName("partitionA")
    .build();

state = client.getLoadState(getLoadStateReq);

System.out.println(state);

// Output:
// true

getLoadStateReq = GetLoadStateReq.builder()
    .collectionName("quick_setup")
    .partitionName("partitionB")
    .build();

state = client.getLoadState(getLoadStateReq);

System.out.println(state);

// Output:
// false
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 6. Load a partition indenpendantly
await client.releaseCollection({
    collection_name: "quick_setup"
})

res = await client.getLoadState({
    collection_name: "quick_setup"
})

console.log(res.state)

// Output
// 
// LoadStateNotLoad
// 

await client.loadPartitions({
    collection_name: "quick_setup",
    partition_names: ["partitionA"]
})

await sleep(3000)

res = await client.getLoadState({
    collection_name: "quick_setup"
})

console.log(res.state)

// Output
// 
// LoadStateLoaded
// 

res = await client.getLoadState({
    collection_name: "quick_setup",
    partition_name: "partitionA"
})

console.log(res.state)

// Output
// 
// LoadStateLoaded
// 

res = await client.getLoadState({
    collection_name: "quick_setup",
    partition_name: "partitionB"
})

console.log(res.state)

// Output
// 
// LoadStateLoaded
// 
```

</TabItem>
</Tabs>

Possible load status may be either of the following

<Admonition type="info" icon="📘" title="Notes">

<p>In Java SDK, the result is a boolean value indicating whether the partition has been loaded or not.</p>

</Admonition>

- **Loaded**

    A collection is marked as `Loaded` if at least one of its partitions has been loaded.

- **Not Loaded**

    A collection is marked as `NotLoad` if none of its partitions has been loaded.

- **Loading**

    A collection is marked as `Loading` if at least one of its partitions is in the loading process.

### Load Partitions{#load-partitions}

To load all partitions of a collection, you can just call `load_collection()`. To load specific partitions of a collection, do as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
client.load_partitions(
    collection_name="quick_setup",
    partition_names=["partitionA"]
)

res = client.get_load_state(collection_name="quick_setup")
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
LoadPartitionsReq loadPartitionsReq = LoadPartitionsReq.builder()
    .collectionName("quick_setup")
    .partitionNames(List.of("partitionA"))
    .build();

client.loadPartitions(loadPartitionsReq);

getLoadStateReq = GetLoadStateReq.builder()
    .collectionName("quick_setup")
    .partitionName("partitionA")
    .build();

state = client.getLoadState(getLoadStateReq);

System.out.println(state);

// Output:
// true
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.loadPartitions({
    collection_name: "quick_setup",
    partition_names: ["partitionA"]
})

res = await client.getLoadState({
    collection_name: "quick_setup",
    partition_name: "partitionA"
})

console.log(res.state)

// Output
// 
// LoadStateLoaded
//
```

</TabItem>
</Tabs>

To load multiple partitions at a time, do as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
client.load_partitions(
    collection_name="quick_setup",
    partition_names=["partitionA", "partitionB"]
)

res = client.get_load_status(
    collection_name="quick_setup",
    partition_name="partitionA"
)

# Output
#
# {
#     "state": "<LoadState: Loaded>"
# }

res = client.get_load_status(
    collection_name="quick_setup",
    partition_name="partitionB"
)

# Output
#
# {
#     "state": "<LoadState: Loaded>"
# }
```

</TabItem>

<TabItem value='java'>

```java
LoadPartitionsReq loadPartitionsReq = LoadPartitionsReq.builder()
    .collectionName("quick_setup")
    .partitionNames(List.of("partitionA", "partitionB"))
    .build();

client.loadPartitions(loadPartitionsReq);

getLoadStateReq = GetLoadStateReq.builder()
    .collectionName("quick_setup")
    .partitionName("partitionA")
    .build();

state = client.getLoadState(getLoadStateReq);

System.out.println(state);

// Output:
// true

getLoadStateReq = GetLoadStateReq.builder()
    .collectionName("quick_setup")
    .partitionName("partitionB")
    .build();

state = client.getLoadState(getLoadStateReq);

System.out.println(state);

// Output:
// true
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.loadPartitions({
    collection_name: "quick_setup",
    partition_names: ["partitionA", "partitionB"]
})

res = await client.getLoadState({
    collection_name: "quick_setup",
    partition_name: "partitionA"
})

console.log(res)

// Output
// 
// LoadStateLoaded
// 

res = await client.getLoadState({
    collection_name: "quick_setup",
    partition_name: "partitionB"
})

console.log(res)

// Output
// 
// LoadStateLoaded
// 
```

</TabItem>
</Tabs>

### Release Partitions{#release-partitions}

To release all partitions of a collection, you can just call `release_collection`. To release specific partitions of a collection, do as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 7. Release a partition
client.release_partitions(
    collection_name="quick_setup",
    partition_names=["partitionA"]
)

res = client.get_load_state(collection_name="quick_setup", partition_name="partitionA")
print(res)

# Output
#
# {
#     "state": "<LoadState: NotLoad>"
# }

```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.ReleasePartitionsReq;

// 7. Release a partition
ReleasePartitionsReq releasePartitionsReq = ReleasePartitionsReq.builder()
    .collectionName("quick_setup")
    .partitionNames(List.of("partitionA"))
    .build();

client.releasePartitions(releasePartitionsReq);

getLoadStateReq = GetLoadStateReq.builder()
    .collectionName("quick_setup")
    .partitionName("partitionA")
    .build();

state = client.getLoadState(getLoadStateReq);

System.out.println(state);

// Output:
// false
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 7. Release a partition
await client.releasePartitions({
    collection_name: "quick_setup",
    partition_names: ["partitionA"]
})

res = await client.getLoadState({
    collection_name: "quick_setup"
})

console.log(res.state)

// Output
// 
// LoadStateNotLoad
// 
```

</TabItem>
</Tabs>

To release multiple or all partitions at a time, do as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
client.release_partitions(
    collection_name="quick_setup",
    partition_names=["_default", "partitionA", "partitionB"]
)

res = client.get_load_status(
    collection_name="quick_setup",
)

# Output
#
# {
#     "state": "<LoadState: NotLoad>"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.partition.request.ReleasePartitionsReq;

ReleasePartitionsReq releasePartitionsReq = ReleasePartitionsReq.builder()
    .collectionName("quick_setup")
    .partitionNames(List.of("_default", "partitionA", "partitionB"))
    .build();

client.releasePartitions(releasePartitionsReq);

getLoadStateReq = GetLoadStateReq.builder()
    .collectionName("quick_setup")
    .build();

state = client.getLoadState(getLoadStateReq);

System.out.println(state);

// Output:
// false
```

</TabItem>

<TabItem value='javascript'>

```javascript

await client.releasePartitions({
    collection_name: "quick_setup",
    partition_names: ["_default", "partitionA", "partitionB"]
})

res = await client.getLoadState({
    collection_name: "quick_setup"
})

console.log(res)

// Output
// 
// {
//   status: {
//     error_code: 'Success',
//     reason: '',
//     code: 0,
//     retriable: false,
//     detail: ''
//   },
//   state: 'LoadStateNotLoad'
// }
// 
```

</TabItem>
</Tabs>

## Drop Partitions{#drop-partitions}

Once you release a partition, you can drop it if it is no longer needed.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 8. Drop a partition
client.drop_partition(
    collection_name="quick_setup",
    partition_name="partitionB"
)

res = client.list_partitions(collection_name="quick_setup")
print(res)

# Output
#
# ["_default", "partitionA"]
```

</TabItem>

<TabItem value='java'>

```java
// 8. Drop a partition
DropPartitionReq dropPartitionReq = DropPartitionReq.builder()
    .collectionName("quick_setup")
    .partitionName("partitionB")
    .build();

client.dropPartition(dropPartitionReq);

listPartitionsReq = ListPartitionsReq.builder()
    .collectionName("quick_setup")
    .build();

partitionNames = client.listPartitions(listPartitionsReq);

System.out.println(partitionNames);

// Output:
// [
//     "_default",
//     "partitionA"
// ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 8 Drop a partition
await client.dropPartition({
    collection_name: "quick_setup",
    partition_name: "partitionB"
})

res = await client.listPartitions({
    collection_name: "quick_setup"
})

console.log(res.partition_names)

// Output
// 
// [ '_default', 'partitionA' ]
// 
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>Before dropping a partition, you need to release it from memory.</p>

</Admonition>

