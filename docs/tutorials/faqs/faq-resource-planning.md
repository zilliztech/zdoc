---
title: "FAQ: Resource Planning | CLOUD"
slug: /faq-resource-planning
sidebar_label: "FAQ: Resource Planning"
beta: FALSE
notebook: FALSE
description: "This topic lists the possible issues that you may encounter while planning your resources on Zilliz Cloud and the corresponding solution. | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 6

---

# FAQ: Resource Planning

This topic lists the possible issues that you may encounter while planning your resources on Zilliz Cloud and the corresponding solution.

## Contents

- [What is a Compute Unit (CU)?](#what-is-a-compute-unit-cu)
- [What is a vCU? How does it get calculated?](#what-is-a-vcu-how-does-it-get-calculated)
- [How can I avoid expenses on unused clusters?](#how-can-i-avoid-expenses-on-unused-clusters)
- [How can I estimate the cost of using Zilliz Cloud?](#how-can-i-estimate-the-cost-of-using-zilliz-cloud)
- [Does Zilliz Cloud support deployment on Azure?](#does-zilliz-cloud-support-deployment-on-azure)
- [How can I request a new cloud region?](#how-can-i-request-a-new-cloud-region)
- [How can I know which plan I am on?](#how-can-i-know-which-plan-i-am-on)
- [How many query CUs do I need for a given collection?](#how-many-query-cus-do-i-need-for-a-given-collection)
- [Which type of cluster should I pick?](#which-type-of-cluster-should-i-pick)
- [What's the difference between Performance-optimized CU and Capacity-optimized CU?](#whats-the-difference-between-performance-optimized-cu-and-capacity-optimized-cu)

## FAQs




### What is a Compute Unit (CU)?{#what-is-a-compute-unit-cu}

A compute unit (CU) is a group of hardware resources for serving your indexes and search requests. You can simply consider a CU as a fully-managed physical node for deploying search service.

For more details, see [Select the Right CU](./cu-types-explained).

### What is a vCU? How does it get calculated?{#what-is-a-vcu-how-does-it-get-calculated}

A vCU is a virtual compute unit used to measure the resources consumed by read operations (such as search and query) and write operations (such as insert, upsert, bulk insert, and delete). The data volume written or read will be converted from GB to vCUs. For details, refer to [Serverless Cluster Cost](./serverless-cluster-cost).

### How can I avoid expenses on unused clusters?{#how-can-i-avoid-expenses-on-unused-clusters}

We recommend suspending unused clusters to save computing costs. You can resume them later when necessary.

### How can I estimate the cost of using Zilliz Cloud?{#how-can-i-estimate-the-cost-of-using-zilliz-cloud}

You can use our [calculator](https://zilliz.com/pricing) to get a cost estimate or refer to [Understand Cost](./understand-cost) for details.

### Does Zilliz Cloud support deployment on Azure?{#does-zilliz-cloud-support-deployment-on-azure}

Yes. Zilliz Cloud now supports deployment on Azure. See [Cloud Providers & Regions](./cloud-providers-and-regions)

### How can I request a new cloud region?{#how-can-i-request-a-new-cloud-region}

To request a new cloud service provider region for Zilliz Cloud, please [fill out the form](https://zilliz.com/cloud-region-request).

### How can I know which plan I am on?{#how-can-i-know-which-plan-i-am-on}

To view your plan, go to the project list. You will see the plan of each project.

![XMRtb3eYsoWUnsxQM0ecyjj2nqf](/img/xmrtb3eysowunsxqm0ecyjj2nqf.png "XMRtb3eYsoWUnsxQM0ecyjj2nqf")

### How many query CUs do I need for a given collection?{#how-many-query-cus-do-i-need-for-a-given-collection}

- Performance-optimized: Supports up to 1.5 million 768-dimensional vectors.

- Capacity-optimized: Supports up to 5 million 768-dimensional vectors.

- Tiered-storage: Supports up to 20 million 768-dimensional vectors.

These estimates are based on vectors with primary keys only. Additional scalar fields like IDs or labels may reduce capacity. We recommend conducting your own tests for accurate assessment.

### Which type of cluster should I pick?{#which-type-of-cluster-should-i-pick}

Select the Performance-optimized if you instant search results and high concurrent traffic for real-time applications.
Choose the Capacity-optimized if you need to handle large vector datasets while maintaining reliable search speeds.
Opt for the Tiered-storage cluster if you need to handle ultra-large-scale, cost-sensitive workloads with clear hot and cold data patterns. To select a Tiered-storage cluster, your cluster must have at least 8 query CUs.

### What's the difference between Performance-optimized CU and Capacity-optimized CU?{#whats-the-difference-between-performance-optimized-cu-and-capacity-optimized-cu}

The "Performance-optimized CU" suits low latency or high throughput similarity searches. This option works best for high-search performance scenarios.

The "Capacity-optimized CU" suits data volumes that are five times larger than the performance-optimized CU option. This option works best for increased storage capacity scenarios.

For more details, see [Select the Right CU](./cu-types-explained).
