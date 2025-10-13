---
title: "FAQ: Collection | CLOUD"
slug: /faq-collection
sidebar_label: "FAQ: Collection"
beta: FALSE
notebook: FALSE
description: "This topic lists the possible issues that you may encounter while you use Zilliz Cloud collections and the corresponding solution. | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 3

---

# FAQ: Collection

This topic lists the possible issues that you may encounter while you use Zilliz Cloud collections and the corresponding solution.

## Contents

- [How many collections are allowed in a single cluster?](#how-many-collections-are-allowed-in-a-single-cluster)
- [If dynamic field was disabled when the collection was created, can I enable it later?](#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later)
- [What are the indexing metric types supported by Zilliz Cloud?](#what-are-the-indexing-metric-types-supported-by-zilliz-cloud)
- [How to set the TTL (time to live) property of a created collection?](#how-to-set-the-ttl-time-to-live-property-of-a-created-collection)
- [What is the concurrency for collection loading requests? How can I increase the number of concurrent requests?](#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests)
- [Why do I fail to load collections? What can I do?](#why-do-i-fail-to-load-collections-what-can-i-do)
- [Is there any limit to the number of fields I can add in a collection?](#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection)
- [What's the difference between partitions and partition keys?](#whats-the-difference-between-partitions-and-partition-keys)
- [Can I modify the number of shards in a collection?](#can-i-modify-the-number-of-shards-in-a-collection)
- [Is there any rules for partition names?](#is-there-any-rules-for-partition-names)

## FAQs




### How many collections are allowed in a single cluster?{#how-many-collections-are-allowed-in-a-single-cluster}

A free cluster can have up to 5 collections.  If you have reached the upper limit and need to create more collections, please [upgrade](./manage-cluster) the cluster plan.

A Serverless cluster can have up to 100 collections.

The number of collections allowed in a Dedicated cluster varies with the cluster CU size. For more information, please refer to [Zilliz Cloud Limits](./limits#collections).

If you have reached the maximum number of collections allowed in a cluster, you can:

1. [Scale](./manage-cluster) your cluster to larger CU sizes.

1. [Drop](./drop-collection) unused collections.

1. Try creating [partitions](./manage-partitions) instead of collections.

### If dynamic field was disabled when the collection was created, can I enable it later?{#if-dynamic-field-was-disabled-when-the-collection-was-created-can-i-enable-it-later}

Yes. You can still enable dynamic field after a collection is created.  For more details, see[Modify Collection](./modify-collections).

### What are the indexing metric types supported by Zilliz Cloud?{#what-are-the-indexing-metric-types-supported-by-zilliz-cloud}

Zilliz Cloud supports the following types of metrics.

1. **Euclidean (L2)** measures the distance between two vectors in a plane. The smaller the result, the more similar the two vectors are.

1. **Inner Product (IP)** multiplies two vectors. The more positive the result, the more similar the two vectors are.

1. **Cosine** measures the cosine value of the angle between two vectors.

1. **Jaccard** measures the dissimilarity between data sets and is obtained by subtracting the JACCARD similarity coefficient from 1.

1. **Hamming** measures binary data strings. The distance between two strings of equal length is the number of bit positions at which the bits are different.

### How to set the TTL (time to live) property of a created collection?{#how-to-set-the-ttl-time-to-live-property-of-a-created-collection}

You can set the TTL of a collection with our SDKs by providing the value of the parameter **collection.ttl.seconds**. For details, refer to [Set Collection TTL](./set-collection-ttl).

The following example sets the TTL to 1800 seconds.

```python
collection.set_properties(properties={"collection.ttl.seconds": 1800})
```

### What is the concurrency for collection loading requests? How can I increase the number of concurrent requests?{#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests}

Currently, the rate limit for loading collection requests on Zilliz Cloud is 1 per second. This is the recommended value for a 1 CU cluster. If you need to increase the number of concurrent requests, please[ submit a request](https://support.zilliz.com/hc/en-us).

### Why do I fail to load collections? What can I do?{#why-do-i-fail-to-load-collections-what-can-i-do}

The failure is caused due to insufficient memory in your cluster. Please try [scaling up](./scale-cluster) your cluster to larger CU sizes.

### Is there any limit to the number of fields I can add in a collection?{#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection}

Yes. You can have a maximum of 64 fields in 1 collection.

### What's the difference between partitions and partition keys?{#whats-the-difference-between-partitions-and-partition-keys}

A partition is a subset of a collection. Each partition shares the same data structure with its parent collection but contains only a subset of the data in the collection. Partitions are used to organize data based on certain criteria.

The Partition Key is a search optimization solution based on partitions. By designating a specific scalar field as the Partition Key and specifying filtering conditions based on the Partition Key during the search, the search scope can be narrowed down to several partitions, thereby improving search efficiency. 

The difference is that data are physically isolated in partitions while partition keys group data logically. In addition, partitions need to be manually created and managed, but if you enable partition key, 16 partitions will be created automatically and data with the same partition key values will be routed to the same partition.

For details, refer to [Manage Partitions](./manage-partitions) and [Use Partition Key](./use-partition-key).

### Can I modify the number of shards in a collection?{#can-i-modify-the-number-of-shards-in-a-collection}

Yes. To change the number of shards, use the "[clone collection](./manage-collections-console#create-collection)" feature:

1. Go to the **Overview** page of the target collection.

1. In the **Actions** dropdown, select **Clone**.

1. In the dialog,

    - Enter a collection name

    - Set **Clone scope** to **Collection schema and data**.

    - Expand **Settings** and specify the desired number of shards.

    - Click **Clone**.

1. After the cloned collection is created, update your application code to use the newly cloned collection.

### Is there any rules for partition names?{#is-there-any-rules-for-partition-names}

Yes. Partition name can contain only letters, numbers, underscores (“_”), and hyphens(“-”), and cannot start with a number or a hyphen.
