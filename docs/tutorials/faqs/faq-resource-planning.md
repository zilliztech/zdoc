---
title: "FAQ: Resource Planning | CLOUD"
slug: /faq-resource-planning
sidebar_label: "FAQ: Resource Planning"
beta: FALSE
notebook: FALSE
description: "This topic lists the possible issues that you may encounter while planning your resources on Zilliz Cloud and the corresponding solution. | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 7

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
- [How many CUs do I need for a given collection?](#how-many-cus-do-i-need-for-a-given-collection)
- [Which type of CU should I pick?](#which-type-of-cu-should-i-pick)
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

To view your plan, choose a specific cluster under a project. Navigate to the **Cluster Details** tab, and you can find the plan detail under the **Summary** section.

![cluster_plan](/img/cluster_plan.png)

### How many CUs do I need for a given collection?{#how-many-cus-do-i-need-for-a-given-collection}

- Performance-optimized CU: Supports up to 1.5 million 768-dimensional vectors.

- Capacity-optimized CU: Supports up to 5 million 768-dimensional vectors.

- Extended-capacity CU: Supports up to 20 million 768-dimensional vectors.

These estimates are based on vectors with primary keys only. Additional scalar fields like IDs or labels may reduce capacity. We recommend conducting your own tests for accurate assessment.

### Which type of CU should I pick?{#which-type-of-cu-should-i-pick}

Select the Performance-optimized CU if you instant search results and high concurrent traffic for real-time applications.
Choose the Capacity-optimized CU if you need to handle large vector datasets while maintaining reliable search speeds.
Opt for the Extended-capacity CU if you need to manage massive-scale datasets where optimizing total cost is prioritized over latency. To select an extended-capacity CU, your cluster must have at least 4 CUs.

### What's the difference between Performance-optimized CU and Capacity-optimized CU?{#whats-the-difference-between-performance-optimized-cu-and-capacity-optimized-cu}

The "Performance-optimized CU" suits low latency or high throughput similarity searches. This option works best for high-search performance scenarios.

The "Capacity-optimized CU" suits data volumes that are five times larger than the performance-optimized CU option. This option works best for increased storage capacity scenarios.

For more details, see [Select the Right CU](./cu-types-explained).
