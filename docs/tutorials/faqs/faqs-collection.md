---
slug: /faqs-collection
beta: null
notebook: null
sidebar_position: 3
---

# Collection

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
- [Can I migrate data from a serverless cluster to a dedicated cluster?](#can-i-migrate-data-from-a-serverless-cluster-to-a-dedicated-cluster)

## FAQs




### How many collections are allowed in a single cluster?{#how-many-collections-are-allowed-in-a-single-cluster}

A serverless cluster can have 2 collections at most. However, the maximum number of collections allowed in a dedicated cluster depends on the cluster CU size. Clusters of 12 CUs and above can have up to 256 collections. Clusters of less than 12 CUs can have up to 32 collections.

### How can I know if dynamic schema is enabled for my collection?{#how-can-i-know-if-dynamic-schema-is-enabled-for-my-collection}

You can view the status of dynamic schema via Zilliz Cloud web console. Choose the collection and navigate to the **Schema** tab. You can see if dynamic schema is enabled or not in the upper right corner. For more details, see [Enable Dynamic Schema](https://zilliverse.feishu.cn/wiki/IXavwmXcdivihCkUfmccGytAnif).

![faq_dynamic_schema_enabled](/img/faq_dynamic_schema_enabled.png)

### If dynamic schema was disabled when the collection was created, can I enable it later?{#if-dynamic-schema-was-disabled-when-the-collection-was-created-can-i-enable-it-later}

No. Once you have enabled/disabled dynamic schema when creating a collection, you cannot modify the status of dynamic schema later. For more details, see [Enable Dynamic Schema](./enable-dynamic-schema).

### What are the indexing metric types supported by Zilliz Cloud?{#what-are-the-indexing-metric-types-supported-by-zilliz-cloud}

Zilliz Cloud supports 3 types of metrics.

1. **Euclidean (L2)** measures the distance between two vectors in a plane. The smaller the result, the more similar the two vectors are.

1. **Inner Product (IP)** multiplies two vectors. The more positive the result, the more similar the two vectors are.

1. *[Beta]* **Cosine** measures the cosine value of the angle between two vectors. 

Note that the cosine metric type is still in Beta version. If you need to choose this metric type, you need to upgrade your cluster to Beta version first.

### How to set the TTL (time to live) property of a created collection?{#how-to-set-the-ttl-time-to-live-property-of-a-created-collection}

You can set the TTL of a collection with our PyMilvus SDK by providing the value of the parameter **collection.ttl.seconds**.

The following example sets the TTL to 1800 seconds.

```python
collection.set_properties(properties={"collection.ttl.seconds": 1800})
```

### What is the concurrency for collection loading requests? How can I increase the number of concurrent requests?{#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests}

Currently, the rate limit for loading collection requests on Zilliz Cloud is 1 per second. This is the recommended value for a 1 CU cluster. If you need to increase the number of concurrent requests, please[ submit a request](https://support.zilliz.com/hc/en-us).

### Why do I fail to load collections? What can I do?{#why-do-i-fail-to-load-collections-what-can-i-do}

The failure is caused due to insufficient memory in your cluster. Please try scaling up your cluster to larger CU sizes.

### Is there any limit to the number of fields I can add in a collection?{#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection}

Yes. You can have a maximum of 64 fields in 1 collection.

### Can I migrate data from a serverless cluster to a dedicated cluster?{#can-i-migrate-data-from-a-serverless-cluster-to-a-dedicated-cluster}

Yes. Zilliz Cloud supports migrating data from a serverless cluster to a dedicated cluster. For more information about how to migrate data, please refer to [Migrate Between Clusters](./migrate-beween-clusters).
