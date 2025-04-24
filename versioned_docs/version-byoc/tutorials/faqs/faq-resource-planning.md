---
title: "FAQ: Resource Planning | BYOC"
slug: /faq-resource-planning
sidebar_label: "FAQ: Resource Planning"
beta: FALSE
notebook: FALSE
description: "This topic lists the possible issues that you may encounter while planning your resources on Zilliz Cloud and the corresponding solution. | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 6

---

# FAQ: Resource Planning

This topic lists the possible issues that you may encounter while planning your resources on Zilliz Cloud and the corresponding solution.

## Contents

- [What is a Compute Unit (CU)?](#what-is-a-compute-unit-cu)
- [How can I avoid expenses on unused clusters?](#how-can-i-avoid-expenses-on-unused-clusters)
- [How many CUs do I need for a given collection?](#how-many-cus-do-i-need-for-a-given-collection)
- [Which type of CU should I pick?](#which-type-of-cu-should-i-pick)
- [What's the difference between Performance-optimized CU and Capacity-optimized CU?](#whats-the-difference-between-performance-optimized-cu-and-capacity-optimized-cu)

## FAQs




### What is a Compute Unit (CU)?{#what-is-a-compute-unit-cu}

A compute unit (CU) is a group of hardware resources for serving your indexes and search requests. You can simply consider a CU as a fully-managed physical node for deploying search service.

For more details, see [Select the Right CU](./cu-types-explained).

### How can I avoid expenses on unused clusters?{#how-can-i-avoid-expenses-on-unused-clusters}

We recommend suspending unused clusters to save computing costs. You can resume them later when necessary.

### How many CUs do I need for a given collection?{#how-many-cus-do-i-need-for-a-given-collection}

- Performance-optimized CU: Supports up to 1.5 million 768-dimensional vectors.

- Capacity-optimized CU: Supports up to 5 million 768-dimensional vectors.

- Extended-capacity CU: Supports up to 20 million 768-dimensional vectors.

These estimates are based on vectors with primary keys only. Additional scalar fields like IDs or labels may reduce capacity. We recommend conducting your own tests for accurate assessment.

### Which type of CU should I pick?{#which-type-of-cu-should-i-pick}

Select the Performance-optimized CU if you instant search results and high concurrent traffic for real-time applications.
Choose the Capacity-optimized CU if you need to handle large vector datasets while maintaining reliable search speeds.
Opt for the Extended-capacity CU if you need to manage massive-scale datasets where optimizing total cost is prioritized over latency. Please [contact sales](https://zilliz.com/contact-sales) if you need Extended-capacity CU.

### What's the difference between Performance-optimized CU and Capacity-optimized CU?{#whats-the-difference-between-performance-optimized-cu-and-capacity-optimized-cu}

The "Performance-optimized CU" suits low latency or high throughput similarity searches. This option works best for high-search performance scenarios.

The "Capacity-optimized CU" suits data volumes that are five times larger than the performance-optimized CU option. This option works best for increased storage capacity scenarios.

For more details, see [Select the Right CU](./cu-types-explained).
