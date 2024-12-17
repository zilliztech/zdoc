---
title: "Use Partition Key | BYOC"
slug: /use-partition-key
sidebar_label: "Use Partition Key"
beta: FALSE
notebook: FALSE
description: "The Partition Key is a search optimization solution based on partitions. By designating a specific scalar field as the Partition Key and specifying filtering conditions based on the Partition Key during the search, the search scope can be narrowed down to several partitions, thereby improving search efficiency. This article will introduce how to use the Partition Key and related considerations. | BYOC"
type: origin
token: QWqiwrgJViA5AJkv64VcgQX2nKd
sidebar_position: 12
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search optimization
  - partition key

---

import Admonition from '@theme/Admonition';


# Use Partition Key

The Partition Key is a search optimization solution based on partitions. By designating a specific scalar field as the Partition Key and specifying filtering conditions based on the Partition Key during the search, the search scope can be narrowed down to several partitions, thereby improving search efficiency. This article will introduce how to use the Partition Key and related considerations.

## Overview{#overview}

In Milvus, you can use partitions to implement data segregation and improve search performance by restricting the search scope to specific partitions. If you choose to manage partitions manually, you can create a maximum of 1,024 partitions in a collection, and insert entities into these partitions based on a specific rule so that you can narrow the search scope by restricting searches within a specific number of partitions.

Milvus introduces the Partition Key for you to reuse partitions in data segregation to overcome the limit on the number of partitions you can create in a collection. When creating a collection, you can use a scalar field as the Partition Key. Once the collection is ready, Milvus creates the specified number of partitions inside the collection with each partition corresponding to a range of the values in the Partition Key. Upon receiving inserted entities, Milvus stores them into different partitions based on their Partition Key values.

![IXXIwZdOYhRFXmbTMdwcaN6fnPe](/byoc/IXXIwZdOYhRFXmbTMdwcaN6fnPe.png)

The following figure illustrates how Milvus processes the search requests in a collection with or without the Partition Key feature enabled. 

- If the Partition Key is disabled, Milvus searches for entities that are the most similar to the query vector within the collection. You can narrow the search scope if you know which partition contains the most relevant results.

- If the Partition Key is enabled, Milvus determines the search scope based on the Partition Key value specified in a search filter and scans only the entities within the partitions that match.

![RTaqwdaWXhRWPTb4uJTc9Uknn5c](/byoc/RTaqwdaWXhRWPTb4uJTc9Uknn5c.png)

## Use Partition Key{#use-partition-key}

To use the Partition Key, you need to

- Set the Partition Key,

- Set the number of partitions to create (Optional), and

- Create a filtering condition based on the Partition Key.

### Set Partition Key{#set-partition-key}

To designate a scalar field as the Partition Key, you need to set its `is_partition_key` attribute to `true` when you add the scalar field.

[Unsupported block type]

### Set Partition Numbers{#set-partition-numbers}

When you designate a scalar field in a collection as the Partition Key, Milvus automatically creates 16 partitions in the collection. Upon receiving an entity, Milvus chooses a partition based on the Partition Key value of this entity and stores the entity in the partition, resulting in some or all partitions holding entities with different Partition Key values. 

You can also determine the number of partitions to create along with the collection. This is valid only if you have a scalar field designated as the Partition Key.

[Unsupported block type]

### Create Filtering Condition{#create-filtering-condition}

When conducting ANN searches in a collection with the Partition Key feature enabled, you need to include a filtering expression involving the Partition Key in the search request. In the filtering expression, you can restrict the Partition Key value within a specific range so that Milvus restricts the search scope within the corresponding partitions.

The following examples demonstrate Partition-Key-based filtering based on a specific Partition Key value and a set of Partition Key values.

[Unsupported block type]

## Use Partition Key Isolation{#use-partition-key-isolation}

In the multi-tenancy scenario, you can designate the scalar field related to tenant identities as the partition key and create a filter based on a specific value in this scalar field. To further improve search performance in similar scenarios, Milvus introduces the Partition Key Isolation feature.

![BVotwv5BvhBWXXbvotUccowZnng](/byoc/BVotwv5BvhBWXXbvotUccowZnng.png)

As shown in the above figure, Milvus groups entities based on the Partition Key value and creates a separate index for each of these groups. Upon receiving a search request, Milvus locates the index based on the Partition Key value specified in the filtering condition and restricts the search scope within the entities included in the index, thus avoiding scanning irrelevant entities during the search and greatly enhancing the search performance.

Once you have enabled Partition Key Isolation, you can include only a specific value in the Partition-key-based filter so that Milvus can restrict the search scope within the entities included in the index that match.

### Enable Partition Key Isolation{#enable-partition-key-isolation}

The following code examples demonstrate how to enable Partition Key Isolation.

[Unsupported block type]

Once you have enabled Partition Key Isolation, you can still set the Partition Key and number of partitions as described in [Use Partition Key](./use-partition-key#use-partition-key). Note that the Partition-Key-based filter should include only a specific Partition Key value.

