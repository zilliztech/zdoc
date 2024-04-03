---
slug: /faq-resource-planning
beta: null
notebook: null
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 6
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

__How many CUs do I need for a given collection?__

A Performance-optimized CU can serve 8 million 128-dimensional vectors or 2 million 768-dimensional vectors.

A Capacity-optimized CU can serve 25 million 128-dimensional vectors or 5 million 768-dimensional vectors.

Since your collection's schema may differ from the ones in the simple guide above, we highly recommend you test the actual requirements against different CU types.

__What's the difference between Performance-optimized CU and Capacity-optimized CU?__

The "Performance-optimized Compute Unit" suits low latency or high throughput similarity searches. This option works best for high-search performance scenarios.

The "Capacity-optimized Compute Unit" suits data volumes that are five times larger than the performance-optimized CU option. This option works best for increased storage capacity scenarios.

For more details, see [Select the Right CU](./cu-types-explained).
