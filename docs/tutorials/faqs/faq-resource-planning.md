---
slug: /faq-resource-planning
beta: null
notebook: null
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 7
---

# FAQ: Resource Planning

This topic lists the possible issues that you may encounter while planning your resources on Zilliz Cloud and the corresponding solution.

## Contents



## FAQs




__What is a Compute Unit (CU)?__

A compute unit (CU) is a group of hardware resources for serving your indexes and search requests. You can simply consider a CU as a fully-managed physical node for deploying search service.

For more details, see [Select the Right CU](./cu-types-explained).

__How can I avoid expenses on unused clusters?__

We recommend suspending unused clusters to save computing costs. You can resume them later when necessary.

__How can I estimate the cost of using Zilliz Cloud?__

You can use our [calculator](https://zilliz.com/pricing) to get a cost estimate.

__Does Zilliz Cloud support deployment on Azure?__

Yes. Zilliz Cloud now supports deployment on Azure. This feature is in beta version now.

__How can I know which plan I am on?__

To view your plan, choose a specific cluster under a project. Navigate to the __Cluster Details__ tab, and you can find the plan detail under the __Summary__ section.

![cluster_plan](/img/cluster_plan.png)

__How many CUs do I need for a given collection?__

A Performance-optimized CU can serve 8 million 128-dimensional vectors or 2 million 768-dimensional vectors.

A Capacity-optimized CU can serve 25 million 128-dimensional vectors or 5 million 768-dimensional vectors.

A Cost-optimized CU can serve 25 million 128-dimensional vectors or 5 million 768-dimensional vectors.

Since your collection's schema may differ from the ones in the simple guide above, we highly recommend you test the actual requirements against different CU types.

__What's the difference between Performance-optimized CU, Capacity-optimized CU, and Cost-optimized CU?__

The "Performance-optimized Compute Unit" suits low latency or high throughput similarity searches. This option works best for high-search performance scenarios.

The "Capacity-optimized Compute Unit" suits data volumes that are five times larger than the performance-optimized CU option. This option works best for increased storage capacity scenarios.

The "Cost-optimized Compute Unit" provides the same large capacity as the "Capacity-optimized" option, but at a lower cost. This option is ideal for budget-conscious projects that need ample storage without high-performance demands.

For more details, see [Select the Right CU](./cu-types-explained).

__How can I downgrade from Enterprise plan to Standard plan?__

You can downgrade your plan by deleting your enterprise plan clusters and creating new clusters in the standard plan.

If you want to ensure a smooth transition between plans with data retained, you can[ submit a request](https://support.zilliz.com/hc/en-us). We can downgrade the plan for you as well.

__How can I save costs on using Zilliz Cloud if I have a limited budget?__

To reduce cost, we suggest trying our cost-optimized CU type. This type of CU provides the same large capacity as the "Capacity-optimized" option, but at a lower cost with slightly reduced search performance. Refer to [Select the Right CU](./cu-types-explained) for more details.
