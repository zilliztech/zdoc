---
slug: /faq-collection
beta: null
notebook: null
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 3
---

# FAQ: Collection

This topic lists the possible issues that you may encounter while you use Zilliz Cloud collections and the corresponding solution.

## Contents



## FAQs




__How many collections are allowed in a single cluster?__

A serverless cluster can have up to 2 collections.  If you have reached the upper limit and need to create more collections, please [migrate to a dedicated cluster](./migrate-between-clusters#from-serverless-to-dedicated-cluster).

The number of collections allowed in a dedicated cluster varies with the cluster CU size. For clusters with 8 CUs or less, you can create a maximum of 32 collections. For clusters with more than 8 CUs,  you can create a maximum of 256 collections. For more information about the limits, please see [Zilliz Cloud Limits](./limits).

If you have reached the maximum number of collections allowed in a cluster, you can:

1. Scale your cluster to larger CU sizes. See [Manage Cluster](./manage-cluster#manage-and-configure-clusters).

1. [Drop](./manage-collections-sdks#drop-a-collection) unused collections.

1. Try creating [partitions](./manage-partitions) instead of collections.

__How can I know if dynamic schema is enabled for my collection?__

You can view the status of dynamic schema via Zilliz Cloud web console. Choose the collection and navigate to the __Schema__ tab. You can see if dynamic schema is enabled or not in the upper right corner. For more details, see [Enable Dynamic Field](./enable-dynamic-field).

![faq_dynamic_schema_enabled](/img/faq_dynamic_schema_enabled.png)

__If dynamic schema was disabled when the collection was created, can I enable it later?__

No. Once you have enabled/disabled dynamic schema when creating a collection, you cannot modify the status of dynamic schema later. For more details, see [Enable Dynamic Field](./enable-dynamic-field).

__What are the indexing metric types supported by Zilliz Cloud?__

Zilliz Cloud supports 3 types of metrics.

1. __Euclidean (L2)__ measures the distance between two vectors in a plane. The smaller the result, the more similar the two vectors are.

1. __Inner Product (IP)__ multiplies two vectors. The more positive the result, the more similar the two vectors are.

1. _[Beta]_ __Cosine__ measures the cosine value of the angle between two vectors.

Note that the cosine metric type is still in Beta version. If you need to choose this metric type, you need to upgrade your cluster to Beta version first.

__How to set the TTL (time to live) property of a created collection?__

You can set the TTL of a collection with our PyMilvus SDK by providing the value of the parameter __collection.ttl.seconds__.

The following example sets the TTL to 1800 seconds.

```python
collection.set_properties(properties={"collection.ttl.seconds": 1800})
```

__What is the concurrency for collection loading requests? How can I increase the number of concurrent requests?__

Currently, the rate limit for loading collection requests on Zilliz Cloud is 1 per second. This is the recommended value for a 1 CU cluster. If you need to increase the number of concurrent requests, please[ submit a request](https://support.zilliz.com/hc/en-us).

__Why do I fail to load collections? What can I do?__

The failure is caused due to insufficient memory in your cluster. Please try scaling up your cluster to larger CU sizes.

__Is there any limit to the number of fields I can add in a collection?__

Yes. You can have a maximum of 64 fields in 1 collection.

__What's the difference between partitions and partition keys?__

Partitions are used to organize data based on certain criteria.

The partition key groups entities by the same key and speed up query performance.

The difference is that data are physically isolated in partitions while partition keys group data logically.
