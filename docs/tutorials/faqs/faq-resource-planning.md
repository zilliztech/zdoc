---
slug: /faq-resource-planning
beta: FALSE
notebook: FALSE
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
- [How can I downgrade from Dedicated (Enterprise) plan to Dedicated (Standard) plan?](#how-can-i-downgrade-from-dedicated-enterprise-plan-to-dedicated-standard-plan)

## FAQs




### What is a Compute Unit (CU)?{#what-is-a-compute-unit-cu}

A compute unit (CU) is a group of hardware resources for serving your indexes and search requests. You can simply consider a CU as a fully-managed physical node for deploying search service.

For more details, see [Select the Right CU](./cu-types-explained).

### What is a vCU? How does it get calculated?{#what-is-a-vcu-how-does-it-get-calculated}

A vCU is a virtual compute unit used to measure the resources consumed by read operations (such as search and query) and write operations (such as insert, upsert, bulk insert, and delete). The data volume written or read will be converted from GB to vCUs.

### How can I avoid expenses on unused clusters?{#how-can-i-avoid-expenses-on-unused-clusters}

We recommend suspending unused clusters to save computing costs. You can resume them later when necessary.

### How can I estimate the cost of using Zilliz Cloud?{#how-can-i-estimate-the-cost-of-using-zilliz-cloud}

You can use our [calculator](https://zilliz.com/pricing) to get a cost estimate.

### Does Zilliz Cloud support deployment on Azure?{#does-zilliz-cloud-support-deployment-on-azure}

Yes. Zilliz Cloud now supports deployment on Azure. See [Cloud Providers & Regions](./cloud-providers-and-regions)

### How can I request a new cloud region?{#how-can-i-request-a-new-cloud-region}

To request a new cloud service provider region for Zilliz Cloud, please submit a request [here](https://z2-dev.zilliz.cc/cloud-region-request).

### How can I know which plan I am on?{#how-can-i-know-which-plan-i-am-on}

To view your plan, choose a specific cluster under a project. Navigate to the **Cluster Details** tab, and you can find the plan detail under the **Summary** section.

![cluster_plan](/img/cluster_plan.png)

### How many CUs do I need for a given collection?{#how-many-cus-do-i-need-for-a-given-collection}

A Performance-optimized CU can serve 7.5 million 128-dimensional vectors or 1.5 million 768-dimensional vectors.

A Capacity-optimized CU can serve 25 million 128-dimensional vectors or 5 million 768-dimensional vectors.

Since your collection's schema may differ from the ones in the simple guide above, we highly recommend you test the actual requirements against different CU types.

### Which type of CU should I pick?{#which-type-of-cu-should-i-pick}

Select the Performance-optimized CU if you require high throughput and low latency for demanding use cases. Alternatively, choose the Capacity-optimized CU if your priority is to host large volumes of data with less concern for throughput and latency, as it offers a better balance of performance and cost.

### What's the difference between Performance-optimized CU and Capacity-optimized CU?{#whats-the-difference-between-performance-optimized-cu-and-capacity-optimized-cu}

The "Performance-optimized Compute Unit" suits low latency or high throughput similarity searches. This option works best for high-search performance scenarios.

The "Capacity-optimized Compute Unit" suits data volumes that are five times larger than the performance-optimized CU option. This option works best for increased storage capacity scenarios.

For more details, see [Select the Right CU](./cu-types-explained).

### How can I downgrade from Dedicated (Enterprise) plan to Dedicated (Standard) plan?{#how-can-i-downgrade-from-dedicated-enterprise-plan-to-dedicated-standard-plan}

You can downgrade your plan by creating a new cluster in the Dedicated (Standard) plan and migrate the data from the Enterprise cluster to the new Standard cluster.

If you want to ensure a smooth transition between plans, you can[ submit a request](https://support.zilliz.com/hc/en-us). We can downgrade the plan for you as well.
