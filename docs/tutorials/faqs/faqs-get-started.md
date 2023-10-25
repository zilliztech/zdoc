---
slug: /faqs-get-started
beta: null
notebook: null
sidebar_position: 1
---

# Get started

This topic lists the possible issues that you may encounter while you get started with Zilliz Cloud and corresponding solutions.

## Contents

- [Is there any performance comparison between Zilliz Cloud and other competitors?](#is-there-any-performance-comparison-between-zilliz-cloud-and-other-competitors)
- [Can I change the cloud region of my cluster after it is created?](#can-i-change-the-cloud-region-of-my-cluster-after-it-is-created)
- [How many collections are allowed in a single cluster?](#how-many-collections-are-allowed-in-a-single-cluster)
- [How can I know which plan I am on?](#how-can-i-know-which-plan-i-am-on)
- [How can I know if dynamic schema is enabled for my collection?](#how-can-i-know-if-dynamic-schema-is-enabled-for-my-collection)
- [Can I change the CU type after my dedicated cluster is created?](#can-i-change-the-cu-type-after-my-dedicated-cluster-is-created)
- [If dynamic schema was disabled when the collection was created, can I enable it later?](#if-dynamic-schema-was-disabled-when-the-collection-was-created-can-i-enable-it-later)
- [How can I scale down my cluster CU size?](#how-can-i-scale-down-my-cluster-cu-size)
- [How to set the TTL (time to live) property of a created collection?](#how-to-set-the-ttl-time-to-live-property-of-a-created-collection)
- [Which type of index is supported by Zilliz Cloud?](#which-type-of-index-is-supported-by-zilliz-cloud)
- [Does Zilliz Cloud support deployment on Azure?](#does-zilliz-cloud-support-deployment-on-azure)
- [What is the search latency of Zilliz Cloud?](#what-is-the-search-latency-of-zilliz-cloud)
- [What is the concurrency for collection loading requests? How can I increase the number of concurrent requests?](#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests)
- [Why do I fail to load collections? What can I do?](#why-do-i-fail-to-load-collections-what-can-i-do)
- [What are the indexing metric types supported by Zilliz Cloud?](#what-are-the-indexing-metric-types-supported-by-zilliz-cloud)
- [What happens after the free trial?](#what-happens-after-the-free-trial)
- [How can I get further technical support?](#how-can-i-get-further-technical-support)
- [How many CUs do I need for a given collection?](#how-many-cus-do-i-need-for-a-given-collection)
- [What's the difference between Performance-optimized CU, Capacity-optimized CU, and Cost-optimized CU?](#whats-the-difference-between-performance-optimized-cu-capacity-optimized-cu-and-cost-optimized-cu)
- [Can I deploy a serverless cluster on AWS?](#can-i-deploy-a-serverless-cluster-on-aws)
- [What is a Compute Unit (CU)?](#what-is-a-compute-unit-cu)
- [Is there any limit to the number of fields I can add in a collection?](#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection)
- [Do serverless clusters in the starter plan support customized schema?](#do-serverless-clusters-in-the-starter-plan-support-customized-schema)

## FAQs


This topic lists the possible issues that you may encounter while you get started with Zilliz Cloud and corresponding solutions.

### Is there any performance comparison between Zilliz Cloud and other competitors?{#is-there-any-performance-comparison-between-zilliz-cloud-and-other-competitors}

Yes. You can use [VectorDBBench](https://zilliz.com/vector-database-benchmark-tool), a vector database benchmark tool to compare the performance of Zilliz Cloud and other mainstream vector databases and cloud services.

### Can I change the cloud region of my cluster after it is created?{#can-i-change-the-cloud-region-of-my-cluster-after-it-is-created}

No. Currently, you cannot change the cloud region of the cluster once it is created. However, you can create a new cluster with the desired cloud region and[ submit a request](https://support.zilliz.com/hc/en-us) to manually migrate the data to the new cluster for you.

### How many collections are allowed in a single cluster?{#how-many-collections-are-allowed-in-a-single-cluster}

A serverless cluster can have 2 collections at most. However, the maximum number of collections allowed in a dedicated cluster depends on the cluster CU size. For example, a cluster with 1 CU can have up to 32 collections.

### How can I know which plan I am on?{#how-can-i-know-which-plan-i-am-on}

To view your plan, choose a specific cluster under a project. Navigate to the **Cluster Details** tab, and you can find the plan detail under the **Summary** section.

![cluster_plan](/img/cluster_plan.png)

### How can I know if dynamic schema is enabled for my collection?{#how-can-i-know-if-dynamic-schema-is-enabled-for-my-collection}

You can view the status of dynamic schema via Zilliz Cloud web console. Choose the collection and navigate to the **Schema** tab. You can see if dynamic schema is enabled or not in the upper right corner. For more details, see [Enable Dynamic Schema](https://zilliverse.feishu.cn/wiki/IXavwmXcdivihCkUfmccGytAnif).

![faq_dynamic_schema_enabled](/img/faq_dynamic_schema_enabled.png)

### Can I change the CU type after my dedicated cluster is created?{#can-i-change-the-cu-type-after-my-dedicated-cluster-is-created}

No. You cannot modify the CU type once the cluster is created. However, if you want to change cluster type, please try the workaround plan.

1. Create a new cluster with your desired cluster type.

1. [ Submit a request](https://support.zilliz.com/hc/en-us) so that we can handle the data migration between clusters for you. Please specify your source cluster and target cluster when reaching out to us.

### If dynamic schema was disabled when the collection was created, can I enable it later?{#if-dynamic-schema-was-disabled-when-the-collection-was-created-can-i-enable-it-later}

No. Once you have enabled/disabled dynamic schema when creating a collection, you cannot modify the status of dynamic schema later. For more details, see [Enable Dynamic Schema](https://www.notion.so/Enable-Dynamic-Schema-353bcaa305154240aa15baad91e7549f?pvs=21).

### How can I scale down my cluster CU size?{#how-can-i-scale-down-my-cluster-cu-size}

If you need to scale down your cluster CU size, please[ submit a request](https://support.zilliz.com/hc/en-us) . We will scale down the cluster for you in less than 8 hours.

### How to set the TTL (time to live) property of a created collection?{#how-to-set-the-ttl-time-to-live-property-of-a-created-collection}

You can set the TTL of a collection with our PyMilvus SDK by providing the value of the parameter **collection.ttl.seconds**.

The following example sets the TTL to 1800 seconds.

```python
collection.set_properties(properties={"collection.ttl.seconds": 1800})
```

### Which type of index is supported by Zilliz Cloud?{#which-type-of-index-is-supported-by-zilliz-cloud}

Currently, Zilliz Cloud only supports AUTOINDEX, a customized version of HNSW (for performance-optimized clusters) and DiskANN (for capacity-optimized clusters). AUTOINDEX is designed to enhance search performance. For a performance-optimized cluster with 1 million 768-dimensional vectors, the QPS can reach several hundred and the latency is below 100 milliseconds. For a Capacity-optimized cluster with the same data volume, the QPS can reach 50 and the latency is over 200 milliseconds. For more details, see [AUTOINDEX Explained](./autoindex-explained).

However, please[ submit a request](https://support.zilliz.com/hc/en-us) if you are familiar with using certain types of index listed [here](https://milvus.io/docs/index.md). We can enable these options for you.

### Does Zilliz Cloud support deployment on Azure?{#does-zilliz-cloud-support-deployment-on-azure}

No. Currently, you can only create Zilliz Cloud clusters on AWS and GCP. However, Zilliz Cloud is expected to be integrated with Azure soon. Please stay tuned!

### What is the search latency of Zilliz Cloud?{#what-is-the-search-latency-of-zilliz-cloud}

The search latency depends on the CU type and data volume. 

![Y6Kqbq6AooEGBlxgZiPcJ64nnDe](/img/Y6Kqbq6AooEGBlxgZiPcJ64nnDe.png)

For more details about the test result, see [Performance Comparisons](https://docs.zilliz.com/docs/choose-the-right-cu-type-and-size#performance-comparisons).

### What is the concurrency for collection loading requests? How can I increase the number of concurrent requests?{#what-is-the-concurrency-for-collection-loading-requests-how-can-i-increase-the-number-of-concurrent-requests}

Currently, the rate limit for loading collection requests on Zilliz Cloud is 1 per second. This is the recommended value for a 1 CU cluster. If you need to increase the number of concurrent requests, please[ submit a request](https://support.zilliz.com/hc/en-us).

### Why do I fail to load collections? What can I do?{#why-do-i-fail-to-load-collections-what-can-i-do}

The failure is caused due to insufficient memory in your cluster. Please try scaling up your cluster to larger CU sizes.

### What are the indexing metric types supported by Zilliz Cloud?{#what-are-the-indexing-metric-types-supported-by-zilliz-cloud}

Zilliz Cloud supports 2 types of metrics.

1. **Euclidean (L2)** measures the distance between two vectors in a plane. The smaller the result, the more similar the two vectors are.

1. **Inner Product (IP)** multiplies two vectors. The more positive the result, the more similar the two vectors are.

### What happens after the free trial?{#what-happens-after-the-free-trial}

Once the free trial ends, you can still access your serverless cluster data. However, all the data in your dedicated clusters will be automatically backed up and moved to the Recycle Bin. These dedicated clusters will be deleted. Data in the Recycle Bin will be retained for 30 days. To safely recover your dedicated cluster data, you can subscribe to the standard or enterprise plan by providing a payment method (eg. Add a credit card, subscribe on AWS Marketplace, etc).  If you have not completed the PoC during the trial period, you can also contact us to extend the trial period.

### How can I get further technical support?{#how-can-i-get-further-technical-support}

Please submit at request at https://support.zilliz.com/hc/en-us.

### How many CUs do I need for a given collection?{#how-many-cus-do-i-need-for-a-given-collection}

A Performance-optimized CU can serve 5 million 128-dimensional vectors.

A Capacity-optimized CU can fit 25 million 128-dimensional vectors.

A Cost-optimized CU can serve 25 million 128-dimensional vectors or 5 million 768-dimensional vectors.

Since your collection's schema may differ from the ones in the simple guide above, we highly recommend you test the actual requirements against different CU types.

### What's the difference between Performance-optimized CU, Capacity-optimized CU, and Cost-optimized CU?{#whats-the-difference-between-performance-optimized-cu-capacity-optimized-cu-and-cost-optimized-cu}

The "Performance-optimized Compute Unit" suits low latency or high throughput similarity searches. This option works best for high-search performance scenarios.

The "Capacity-optimized Compute Unit" suits data volumes that are five times larger than the performance-optimized CU option but at the cost of higher search latency. This option works best for increased storage capacity scenarios.

The "Cost-optimized Compute Unit" provides the same large capacity as the "Capacity-optimized" option, but at a lower cost with reduced search performance. This option is ideal for budget-conscious projects that need ample storage without high-performance demands.

For more details, see [Choose the Right CU Type and Size](https://docs.zilliz.com/docs/choose-the-right-cu-type-and-size). 

### Can I deploy a serverless cluster on AWS?{#can-i-deploy-a-serverless-cluster-on-aws}

No. Currently, Zilliz Cloud only supports deploying a serverless cluster on GCP. If you need to deploy a cluster on AWS, please choose the Standard or Enterprise plan.

### What is a Compute Unit (CU)?{#what-is-a-compute-unit-cu}

A compute unit (CU) is a group of hardware resources for serving your indexes and search requests. You can simply consider a CU as a fully-managed physical node for deploying search service.

For more details, see [Choose the Right CU Type and Size](https://docs.zilliz.com/docs/choose-the-right-cu-type-and-size).

### Is there any limit to the number of fields I can add in a collection?{#is-there-any-limit-to-the-number-of-fields-i-can-add-in-a-collection}

Yes. You can have a maximum of 64 fields in 1 collection.

### Do serverless clusters in the starter plan support customized schema?{#do-serverless-clusters-in-the-starter-plan-support-customized-schema}

No. The free serverless clusters do not support customized schema. However, dynamic schema is enabled by default, meaning you can always insert data with fields that are not pre-defined. Refer to this [documentation](https://docs.zilliz.com/docs/enable-dynamic-schema) for more details about dynamic schema.
