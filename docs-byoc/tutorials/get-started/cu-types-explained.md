---
title: "Select the Right Cluster Type | BYOC"
slug: /cu-types-explained
sidebar_label: "Cluster Types"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Selecting the right Compute Unit (CU) is a crucial step when creating a cluster in Zilliz Cloud. A CU is the basic unit of compute resources used for parallel processing of data, and different cluster types comprise varying combinations of CPU, memory, and storage. | BYOC"
type: origin
token: UgqvwKh2QiKE1kkYNLJcaHt0nkg
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Select the Right Cluster Type

Selecting the right Compute Unit (CU) is a crucial step when creating a cluster in Zilliz Cloud. A CU is the basic unit of compute resources used for parallel processing of data, and different cluster types comprise varying combinations of CPU, memory, and storage.

## Understand cluster types\{#understand-cluster-types}

Zilliz Cloud offers these cluster types: **Performance-optimized, Capacity-optimized**, and **Tiered-storage.**

The following table offers a quick comparison of the three cluster types in different aspects. For a detailed comparison in terms of the capacity and performance among the cluster types, please proceed to [Select an optimal cluster type](./cu-types-explained#select-an-optimal-cluster-type).

| Cluster Type | Search QPS | Search Latency | Per Query CU Capacity |
| --- | --- | --- | --- |
| **Performance-optimized** | 500-1500 | 10 ms | 2 million 768-dim vectors |
| **Capacity-optimized** | 100-300 | 50-100 ms | 8 million 768-dim vectors |
| **Tiered-storage** | 10-50 | 100-1000 ms | 40 million 768-dim vectors |

### Performance-optimized cluster\{#performance-optimized-cluster}

- Tailored for scenarios emphasizing low latency and high throughput.

- Ideal for real-time applications like generative AI, recommendation systems, chatbots, and more.

### Capacity-optimized cluster\{#capacity-optimized-cluster}

- Crafted for handling vast datasets, boasting five times the data capacity of its Performance-optimized counterpart, albeit with subdued search performance.

- Ideal for large-scale unstructured data search, copyright detection, and identity verification.

### Tiered-storage cluster\{#tiered-storage-cluster}

- Best for ultra-large-scale, cost-sensitive workloads.

- Ideal for applications that need to store massive volumes of data at a low cost. The capacity of a Tiered-storage cluster is 4 times that of a Capacity-optimized cluster.

## Select an optimal cluster type\{#select-an-optimal-cluster-type}

Factor in data volume, performance expectations, and budgets while selecting the cluster type. Your vector data's magnitude, both in terms of vector count and dimensions, plays a pivotal role in determining cluster resource allocation.

### Assess capacity\{#assess-capacity}

The number of entities a cluster can accommodate depends on the query CU capacity of a cluster.

For an estimation of the number of query CU needed for your data volume, please use [our calculator](https://zilliz.com/pricing#calculator).

### Evaluate performance\{#evaluate-performance}

Performance metrics, notably latency and queries per second (QPS), are vital. 

The Performance-optimized cluster distinctly outperforms Capacity-optimized cluster in latency and throughput, particularly for standard `top-k` values ranging from 10 to 250.

The following table shows the test result of how performance-optimized cluster and capacity-optimized cluster perform in terms of QPS.

| top_k | QPS for Performance-optimized cluster (768-dim 1M vectors) | QPS for Capacity-optimized cluster (768-dim 5M vectors) |
| --- | --- | --- |
| 10 | 520 | 100 |
| 100 | 440 | 80 |
| 250 | 270 | 60 |
| 1000 | 150 | 40 |

The following table shows the test result of how each cluster type performs in terms of latency.

| top_k | Latency of Performance-optimized cluster (768-dim 1M vectors) | Latency of Capacity-optimized cluster (768-dim 5M vectors) |
| --- | --- | --- |
| 10 | < 10 ms | < 50 ms |
| 100 | < 10 ms | < 50 ms |
| 250 | < 10 ms | < 50 ms |
| 1000 | 10 - 20 ms | 50 - 100 ms |

## Scenario breakdown\{#scenario-breakdown}

Suppose you are building an image recommendation application with a library of 8 million images. Each image in your library is represented by a 768-dimensional embedding vector. Your goal is to swiftly handle a QPS of 1,000 recommendation requests and deliver the top 100 image recommendations in under 30 milliseconds.

To select the right cluster type and query CU for this requirement, follow these steps:

1. **Evaluate Latency**: The Performance-optimized cluster is the only type that meets the 30-millisecond latency requirement.

1. **Assess Capacity**: A single Performance-optimized cluster with 1 query CU accommodates 2 million 768-dimensional vectors. To store all 8 million vectors, you would need at least 4 query CUs.

1. **Check Throughput**: With a `top-k` setting of 100, the Performance-optimized cluster can achieve a QPS of 440. To sustain a consistent 1,000 QPS, you would need to triple the number of replicas.

In conclusion, for this scenario, the Performance-optimized cluster is your best bet. A configuration of 3 replicas, with each replica consisting of 4 query CUs, should serve you perfectly.

