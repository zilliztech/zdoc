---
displayed_sidebar: paasSidebar
slug: /docs/byoc/faq-resource-planning
beta: null
notebook: null
sidebar_position: 6
---

# FAQ: Resource Planning

This topic lists the possible issues that you may encounter while planning your resources on Zilliz Cloud and the corresponding solution.

## Contents

- [What is a Compute Unit (CU)?](#what-is-a-compute-unit-cu)
- [How can I avoid expenses on unused clusters?](#how-can-i-avoid-expenses-on-unused-clusters)
- [How many CUs do I need for a given collection?](#how-many-cus-do-i-need-for-a-given-collection)
- [What's the difference between Performance-optimized CU, Capacity-optimized CU, and Cost-optimized CU?](#whats-the-difference-between-performance-optimized-cu-capacity-optimized-cu-and-cost-optimized-cu)
- [How can I save costs on using Zilliz Cloud if I have a limited budget?](#how-can-i-save-costs-on-using-zilliz-cloud-if-i-have-a-limited-budget)

## FAQs




### What is a Compute Unit (CU)?{#what-is-a-compute-unit-cu}

A compute unit (CU) is a group of hardware resources for serving your indexes and search requests. You can simply consider a CU as a fully-managed physical node for deploying search service.

For more details, see [Select the Right CU](./cu-types-explained).

### How can I avoid expenses on unused clusters?{#how-can-i-avoid-expenses-on-unused-clusters}

We recommend suspending unused clusters to save computing costs. You can resume them later when necessary.

### How many CUs do I need for a given collection?{#how-many-cus-do-i-need-for-a-given-collection}

A Performance-optimized CU can serve 5 million 128-dimensional vectors.

A Capacity-optimized CU can fit 25 million 128-dimensional vectors.

A Cost-optimized CU can serve 25 million 128-dimensional vectors or 5 million 768-dimensional vectors.

Since your collection's schema may differ from the ones in the simple guide above, we highly recommend you test the actual requirements against different CU types.

### What's the difference between Performance-optimized CU, Capacity-optimized CU, and Cost-optimized CU?{#whats-the-difference-between-performance-optimized-cu-capacity-optimized-cu-and-cost-optimized-cu}

The "Performance-optimized Compute Unit" suits low latency or high throughput similarity searches. This option works best for high-search performance scenarios.

The "Capacity-optimized Compute Unit" suits data volumes that are five times larger than the performance-optimized CU option but at the cost of higher search latency. This option works best for increased storage capacity scenarios.

The "Cost-optimized Compute Unit" provides the same large capacity as the "Capacity-optimized" option, but at a lower cost with reduced search performance. This option is ideal for budget-conscious projects that need ample storage without high-performance demands.

For more details, see [Select the Right CU](./cu-types-explained). 

### How can I save costs on using Zilliz Cloud if I have a limited budget?{#how-can-i-save-costs-on-using-zilliz-cloud-if-i-have-a-limited-budget}

To reduce cost, we suggest trying our cost-optimized CU type. This type of CU provides the same large capacity as the "Capacity-optimized" option, but at a lower cost with slightly reduced search performance. Refer to [Select the Right CU](./cu-types-explained) for more details.
