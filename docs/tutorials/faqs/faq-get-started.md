---
title: "FAQ: Get Started | CLOUD"
slug: /faq-get-started
sidebar_label: "FAQ: Get Started"
beta: FALSE
notebook: FALSE
description: "This topic lists the possible issues that you may encounter while you get started with Zilliz Cloud and the corresponding solution. | CLOUD"
type: origin
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
- [What is the pricing of Zilliz Cloud on Marketplaces?](#what-is-the-pricing-of-zilliz-cloud-on-marketplaces)
- [Can I apply for more credits?](#can-i-apply-for-more-credits)
- [Can I extend my free trial?](#can-i-extend-my-free-trial)
- [How can I get further technical support?](#how-can-i-get-further-technical-support)

## FAQs




### Is there any performance comparison between Zilliz Cloud and other vector search solutions?{#is-there-any-performance-comparison-between-zilliz-cloud-and-other-vector-search-solutions}

Yes. You can use [VectorDBBench](https://zilliz.com/vector-database-benchmark-tool), a vector database benchmark tool to compare the performance of Zilliz Cloud and other mainstream vector databases and cloud services.

### Which type of index is supported by Zilliz Cloud?{#which-type-of-index-is-supported-by-zilliz-cloud}

Currently, Zilliz Cloud only supports AUTOINDEX, a proprietary index type that can help you achieve better search performance. For more details, see [AUTOINDEX Explained](./autoindex-explained).

However, please[ submit a request](https://support.zilliz.com/hc/en-us) if you are familiar with using [any of the indexes](https://milvus.io/docs/index.md) we support. We can help you evaluate your application demand and enable the indexes for you.

### What is the search latency of Zilliz Cloud?{#what-is-the-search-latency-of-zilliz-cloud}

The search latency depends on the CU type and data volume. 

<table>
   <tr>
     <th><p>top_k</p></th>
     <th><p>Latency of Performance-optimized CU (768-dim 1M vectors)</p></th>
     <th><p>Latency of Capacity-optimized CU (768-dim 5M vectors)</p></th>
   </tr>
   <tr>
     <td><p>10</p></td>
     <td><p>&lt; 10 ms</p></td>
     <td><p>&lt; 50 ms</p></td>
   </tr>
   <tr>
     <td><p>100</p></td>
     <td><p>&lt; 10 ms</p></td>
     <td><p>&lt; 50 ms</p></td>
   </tr>
   <tr>
     <td><p>250</p></td>
     <td><p>&lt; 10 ms</p></td>
     <td><p>&lt; 50 ms</p></td>
   </tr>
   <tr>
     <td><p>1000</p></td>
     <td><p>10 - 20 ms</p></td>
     <td><p>50 - 100 ms</p></td>
   </tr>
</table>

For more details about the test result, see [Select the Right CU](./cu-types-explained).

### Is pricing the same in every region?{#is-pricing-the-same-in-every-region}

In short, cloud service prices often vary across providers and regions. Several factors contribute to these differences, such as the costs of the underlying physical resources that cloud database services rely on. For more details, see [Pricing](https://zilliz.com/pricing).

### What happens after the free trial?{#what-happens-after-the-free-trial}

Once the free trial ends, you can still access your free clusters. However, all the data in your serverless and dedicated clusters will be moved to the Recycle Bin and will be retained there for 30 days. To safely recover your cluster data, you can subscribe to the Serverless or Dedicated plan by providing a payment method. For more details, refer to [Try Zilliz Cloud For Free](./free-trials#use-free-trial).

### What is the pricing of Zilliz Cloud on Marketplaces?{#what-is-the-pricing-of-zilliz-cloud-on-marketplaces}

Please refer to [Payment & Billing](./payment-billing#marketplace-pricing-terms) for more about Marketplace pricing terms.

### Can I apply for more credits?{#can-i-apply-for-more-credits}

When you register on Zilliz Cloud with a work email you’ll receive &#36;100 in free credits. You can earn an extra &#36;100 credits by subscribing to Zilliz Cloud on [Marketplaces](./subscribe-on-aws-marketplace). For extra credits and discounts, please [contact sales](https://zilliz.com/contact-sales).

### Can I extend my free trial?{#can-i-extend-my-free-trial}

Yes, you can. When you register on Zilliz Cloud, you receive &#36;100 in credits valid for 30 days. By [adding a payment method](./payment-billing), you can extend the validity of these credits to 1 year.

### How can I get further technical support?{#how-can-i-get-further-technical-support}

Please submit at request at the Zilliz cloud [support portal](https://support.zilliz.com/hc/en-us).
