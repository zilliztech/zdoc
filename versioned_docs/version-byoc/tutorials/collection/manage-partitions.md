---
slug: /manage-partitions
beta: FALSE
notebook: FALSE
token: LcEdwc5sWiMMzdke2UWcQ105nqd
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Manage Partitions

This guide walks you through how to create and manage partitions in a collection. 

## Overview{#overview}

A partition in Zilliz Cloud represents a sub-division of a collection. This functionality allows the physical storage of a collection to be divided into multiple parts, contributing to improved query performance by narrowing down the focus to a smaller subset of data rather than the entire collection.

Upon the creation of a collection, a default partition named ___default__ is automatically created. It's worth noting that you can create a maximum of 4,096 partitions within a collection.

For a comprehensive understanding of the relationships between clusters, collections, indexes, partitions, and entities, read [Cluster, Collection & Entities](./cluster-collection-and-entities).

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud introduces a feature called <strong>Partition Key</strong>, leveraging the underlying partitions to store entities based on the values of a specific field. This feature facilitates the implementation of multi-tenancy, enhancing search performance. For details, read <a href="./use-partition-key">Use Partition Key</a>.</p>
<p>It's important to note that when the <strong>Partition Key</strong> feature is on in a collection, Zilliz Cloud takes care of managing all the partitions, relieving you of this responsibility.</p>

</Admonition>

## Preparations{#preparations}

The code snippet below repurposes the existing code to establish a connection to a Zilliz Cloud cluster and create a collection and its index separately. Consequently, the collection remains unloaded.

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

<Admonition type="info" icon="📘" title="Notes">

<p>In the above code snippet, the index of the collection has been created along with the collection, indicating that the collection is loaded upon creation.</p>

</Admonition>

## List Partitions{#list-partitions}

Once a collection is ready, you can list its partitions.

```python
# 3. List partitions
res = client.list_partitions(collection_name="quick_setup")
print(res)

# Output
#
# ["_default"]
```

The output of the above code snippet is a list of strings, stating the names of the partitions within the specified collection.

## Create Partitions{#create-partitions}

You can add more partitions to the collection. A collection can have up to 64 partitions.

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

The code snippet above creates a partition in a collection and lists the partitions of the collection.

## Check for a Specific Partition{#check-for-a-specific-partition}

You can also check the existence of a specific partition.

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

The code snippet above checks whether the collection has a partition named `partitionA` and `partitionC`.

## Load & Release Partitions{#load-and-release-partitions}

You can load and release specific partitions to make them available or unavailable for searches and queries. 

### Get Load Status{#get-load-status}

To check the load status of a collection and its partitions, do as follows:

```python
# Release the collection
client.release_collection(collection_name="quick_setup")

# Check the load status
res = client.get_load_state(collection_name="quick_setup")
print(res)

# Output
#
# {
#     "state": "<LoadState: NotLoad>"
# }

```

<Admonition type="info" icon="📘" title="Notes">

<p>Possible outputs are as follows:</p>
<ul>
<li><strong>Loaded</strong></li>
</ul>
<p>A collection is marked as <code>Loaded</code> if at least one of its partitions has been loaded.</p>
<ul>
<li><strong>Not Loaded</strong></li>
</ul>
<p>A collection is marked as <code>Not Loaded</code> if none of its partitions has been loaded.</p>
<ul>
<li><strong>Loading</strong></li>
</ul>
<p>A collection is marked as <code>Loading</code> if at least one of its partitions is in the loading process.</p>

</Admonition>

### Load Partitions{#load-partitions}

To load all partitions of a collection, you can just call `load_collection()`. To load specific partitions of a collection, do as follows:

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

To load multiple partitions at a time, do as follows:

```python
client.load_partitions(
    collection_name="medium_articles_2020",
    partition_names=["_default", "partitionA"]
)

res = client.get_load_status(
    collection_name="quick_setup",
)

# Output
#
# {
#     "state": "<LoadState: NotLoad>"
# }

res = client.get_load_status(
    collection_name="medium_articles_2020",
    partition_name="_default"
)

# Output
#
# {
#     "state": "<LoadState: Loaded>"
# }
```

### Release Partitions{#release-partitions}

To release all partitions of a collection, you can just call `release_collection`. To release specific partitions of a collection, do as follows:

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

To release multiple partitions at a time, do as follows:

```python
client.release_partitions(
    collection_name="medium_articles_2020",
    partition_names=["_default", "partitionA", "partitionB"]
)

res = client.get_load_status(
    collection_name="medium_articles_2020",
)

# Output
#
# {
#     "state": "<LoadState: NotLoad>"
# }
```

