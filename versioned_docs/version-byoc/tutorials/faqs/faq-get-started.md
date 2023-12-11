---
slug: /faq-get-started
beta: null
notebook: null
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 1
---

# FAQ: Get Started

This topic lists the possible issues that you may encounter while you get started with Zilliz Cloud and the corresponding solution.

## Contents

- [Is there any performance comparison between Zilliz Cloud and other vector search solutions?](#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions)
- [Which type of index is supported by Zilliz Cloud?](#which-type-of-index-is-supported-by-zilliz-cloud)
- [What is the search latency of Zilliz Cloud?](#what-is-the-search-latency-of-zilliz-cloud)
- [Is pricing the same in every region?](#is-pricing-the-same-in-every-region)
- [What happens after the free trial?](#what-happens-after-the-free-trial)
- [What is the pricing of Zilliz Cloud on AWS marketplace?](#what-is-the-pricing-of-zilliz-cloud-on-aws-marketplace)
- [How can I get further technical support?](#how-can-i-get-further-technical-support)

## FAQs




### Is there any performance comparison between Zilliz Cloud and other vector search solutions?{#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions}

Yes. You can use [VectorDBBench](https://zilliz.com/vector-database-benchmark-tool), a vector database benchmark tool to compare the performance of Zilliz Cloud and other mainstream vector databases and cloud services.

### Which type of index is supported by Zilliz Cloud?{#which-type-of-index-is-supported-by-zilliz-cloud}

Currently, Zilliz Cloud only supports AUTOINDEX, a customized version of HNSW (for performance-optimized clusters) and DiskANN (for capacity-optimized clusters). AUTOINDEX is designed to enhance search performance. For a performance-optimized cluster with 1 million 768-dimensional vectors, the QPS can reach several hundred and the latency is below 100 milliseconds. For a Capacity-optimized cluster with the same data volume, the QPS can reach 50 and the latency is over 200 milliseconds. For more details, see [AUTOINDEX Explained](./autoindex-explained).

However, please[ submit a request](https://support.zilliz.com/hc/en-us) if you are familiar with using certain types of index listed [here](https://milvus.io/docs/index.md). We can enable these options for you.

### What is the search latency of Zilliz Cloud?{#what-is-the-search-latency-of-zilliz-cloud}

The search latency depends on the CU type and data volume. 

![ObhQbbImLoKHdexbeD0cBMSWngh](/img/ObhQbbImLoKHdexbeD0cBMSWngh.png)

For more details about the test result, see [Select the Right CU](./cu-types-explained).

### Is pricing the same in every region?{#is-pricing-the-same-in-every-region}

In short, cloud service prices often vary across providers and regions. Several factors contribute to these differences, such as the costs of the underlying physical resources that cloud database services rely on. For more details, see [Pricing](https://zilliz.com/pricing).

### What happens after the free trial?{#what-happens-after-the-free-trial}

Once the free trial ends, you can still access your serverless clusters. However, all the data in your dedicated clusters will be moved to the Recycle Bin and will be retained there for 30 days. To safely recover your dedicated cluster data, you can subscribe to the standard or enterprise plan by providing a payment method.  If you have not completed the PoC during the trial period, you can also [contact us](https://support.zilliz.com/hc/en-us) to extend the trial period.

### What is the pricing of Zilliz Cloud on AWS marketplace?{#what-is-the-pricing-of-zilliz-cloud-on-aws-marketplace}

Please refer to [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace#aws-marketplace-pricing-terms)for more about the pricing of Zilliz Cloud on AWS Marketplace.

### How can I get further technical support?{#how-can-i-get-further-technical-support}

Please submit at request at the Zilliz cloud [support portal](https://support.zilliz.com/hc/en-us).
