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
- [How can I know if dynamic schema is enabled for my collection?](#how-can-i-know-if-dynamic-schema-is-enabled-for-my-collection)
- [If dynamic schema was disabled when the collection was created, can I enable it later?](#if-dynamic-schema-was-disabled-when-the-collection-was-created-can-i-enable-it-later)
- [What are the indexing metric types supported by Zilliz Cloud?](#what-are-the-indexing-metric-types-supported-by-zilliz-cloud)
- [How to set the TTL (time to live) property of a created collection?](#how-to-set-the-ttl-time-to-live-property-of-a-created-collection)
- [What is the concurrency for collection loading requests? How can I increase the number of concurrent requests?](#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests)
- [Why do I fail to load collections? What can I do?](#why-do-i-fail-to-load-collections-what-can-i-do)
- [Is there any limit to the number of fields I can add in a collection?](#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection)
- [What's the difference between partitions and partition keys?](#whats-the-difference-between-partitions-and-partition-keys)

## FAQs




### How many collections are allowed in a single cluster?{#how-many-collections-are-allowed-in-a-single-cluster}

A free cluster can have up to 5 collections.  If you have reached the upper limit and need to create more collections, please [upgrade](./manage-cluster#upgrade-plan) the cluster plan.

A Serverless cluster can have up to 100 collections.

The number of collections allowed in a Dedicated cluster varies with the cluster CU size. For more information, please refer to [Zilliz Cloud Limits](./limits#collections).

If you have reached the maximum number of collections allowed in a cluster, you can:

1. [Scale](./manage-cluster) your cluster to larger CU sizes.

1. [Drop](./drop-collection) unused collections.

1. Try creating [partitions](./manage-partitions) instead of collections.

### How can I know if dynamic schema is enabled for my collection?{#how-can-i-know-if-dynamic-schema-is-enabled-for-my-collection}

You can view the status of dynamic schema via Zilliz Cloud web console. Choose the collection and navigate to the **Overview** tab. You can see if dynamic schema is enabled or not. For more details, see [Dynamic Field](./enable-dynamic-field).

![faq_dynamic_schema_enabled](/img/faq_dynamic_schema_enabled.png)

### If dynamic schema was disabled when the collection was created, can I enable it later?{#if-dynamic-schema-was-disabled-when-the-collection-was-created-can-i-enable-it-later}

No. Once you have enabled/disabled dynamic schema when creating a collection, you cannot modify the status of dynamic schema later. For more details, see [Dynamic Field](./enable-dynamic-field).

### What are the indexing metric types supported by Zilliz Cloud?{#what-are-the-indexing-metric-types-supported-by-zilliz-cloud}

Zilliz Cloud supports 3 types of metrics.

1. **Euclidean (L2)** measures the distance between two vectors in a plane. The smaller the result, the more similar the two vectors are.

1. **Inner Product (IP)** multiplies two vectors. The more positive the result, the more similar the two vectors are.

1. **Cosine** measures the cosine value of the angle between two vectors.

1. **Jaccard** measures the dissimilarity between data sets and is obtained by subtracting the JACCARD similarity coefficient from 1.

1. **Hamming** measures binary data strings. The distance between two strings of equal length is the number of bit positions at which the bits are different.

### How to set the TTL (time to live) property of a created collection?{#how-to-set-the-ttl-time-to-live-property-of-a-created-collection}

You can set the TTL of a collection with our PyMilvus SDK by providing the value of the parameter **collection.ttl.seconds**.

The following example sets the TTL to 1800 seconds.

```python
collection.set_properties(properties={"collection.ttl.seconds": 1800})
```

### What is the concurrency for collection loading requests? How can I increase the number of concurrent requests?{#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests}

Currently, the rate limit for loading collection requests on Zilliz Cloud is 1 per second. This is the recommended value for a 1 CU cluster. If you need to increase the number of concurrent requests, please[ submit a request](https://support.zilliz.com/hc/en-us).

### Why do I fail to load collections? What can I do?{#why-do-i-fail-to-load-collections-what-can-i-do}

The failure is caused due to insufficient memory in your cluster. Please try [scaling up](./manage-cluster) your cluster to larger CU sizes.

### Is there any limit to the number of fields I can add in a collection?{#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection}

Yes. You can have a maximum of 64 fields in 1 collection.

### What's the difference between partitions and partition keys?{#whats-the-difference-between-partitions-and-partition-keys}

Partitions are used to organize data based on certain criteria.

The partition key groups entities by the same key and speed up query performance.

The difference is that data are physically isolated in partitions while partition keys group data logically.
