---
slug: /faqs-resource-planning
beta: null
notebook: null
sidebar_position: 6
---

# Resource planning

This topic lists the possible issues that you may encounter while planning your resources on Zilliz Cloud and the corresponding solution.

## Contents

- [How can I avoid expenses on unused clusters?](#how-can-i-avoid-expenses-on-unused-clusters)
- [How can I estimate the cost of using Zilliz Cloud?](#how-can-i-estimate-the-cost-of-using-zilliz-cloud)
- [Does Zilliz Cloud support deployment on Azure?](#does-zilliz-cloud-support-deployment-on-azure)
- [How can I know which plan I am on?](#how-can-i-know-which-plan-i-am-on)
- [How many CUs do I need for a given collection?](#how-many-cus-do-i-need-for-a-given-collection)
- [What's the difference between Performance-optimized CU, Capacity-optimized CU, and Cost-optimized CU?](#whats-the-difference-between-performance-optimized-cu-capacity-optimized-cu-and-cost-optimized-cu)
- [How can I downgrade from Enterprise plan to Standard plan?](#how-can-i-downgrade-from-enterprise-plan-to-standard-plan)
- [How can I save costs on using Zilliz Cloud if I have a limited budget?](#how-can-i-save-costs-on-using-zilliz-cloud-if-i-have-a-limited-budget)

## FAQs


This topic lists the possible issues that you may encounter while planning your resources on Zilliz Cloud and the corresponding solution.

### How can I avoid expenses on unused clusters?{#how-can-i-avoid-expenses-on-unused-clusters}

We recommend suspending unused clusters to save computing costs. You can resume them later when necessary.

### How can I estimate the cost of using Zilliz Cloud?{#how-can-i-estimate-the-cost-of-using-zilliz-cloud}

You can use our [calculator](https://zilliz.com/pricing) to get a cost estimate.

### Does Zilliz Cloud support deployment on Azure?{#does-zilliz-cloud-support-deployment-on-azure}

Yes. Zilliz Cloud now supports deployment on Azure. This feature is in beta version now.

### How can I know which plan I am on?{#how-can-i-know-which-plan-i-am-on}

To view your plan, choose a specific cluster under a project. Navigate to the **Cluster Details** tab, and you can find the plan detail under the **Summary** section.

![cluster_plan](/img/cluster_plan.png)

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

### How can I downgrade from Enterprise plan to Standard plan?{#how-can-i-downgrade-from-enterprise-plan-to-standard-plan}

You can downgrade your plan by deleting your enterprise plan clusters and creating new clusters in the standard plan.

If you want to ensure a smooth transition between plans with data retained, you can[ submit a request](https://support.zilliz.com/hc/en-us). We can downgrade the plan for you as well.

### How can I save costs on using Zilliz Cloud if I have a limited budget?{#how-can-i-save-costs-on-using-zilliz-cloud-if-i-have-a-limited-budget}

To reduce cost, we suggest trying our cost-optimized CU type. This type of CU provides the same large capacity as the "Capacity-optimized" option, but at a lower cost with slightly reduced search performance. Refer to [Select the Right CU](./choose-the-right-cu-type-and-size) for more details.
