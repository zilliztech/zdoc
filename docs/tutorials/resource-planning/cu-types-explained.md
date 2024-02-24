---
slug: /cu-types-explained
sidebar_label: CU Types
beta: FALSE
notebook: FALSE
token: UgqvwKh2QiKE1kkYNLJcaHt0nkg
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# Select the Right CU

Selecting the right Compute Unit (CU) is a crucial step when creating a cluster in Zilliz Cloud. A CU is the basic unit of compute resources used for parallel processing of data, and different CU types comprise varying combinations of CPU, memory, and storage.

## Understand CU types{#understand-cu-types}

Zilliz Cloud offers these CU types: __Performance-optimized__, __Capacity-optimized__, and __Cost-optimized__.

|  CU Type                                             |  Latency                                        |  Throughput                                    |  Capacity                              |
| ---------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------- | -------------------------------------- |
|  __Performance-optimized__                           |  Low                                            |  High                                          |  Low                                   |
|  __Capacity-optimized__                              |  Medium                                         |  Medium                                        |  High                                  |
|  __Cost-optimized__ |  High<br/>  |  Low<br/>  |  High |

### Performance-optimized CU{#performance-optimized-cu}

- Tailored for scenarios emphasizing low latency and high throughput.

- Ideal for real-time applications like generative AI, recommendation systems, chatbots, and more.

### Capacity-optimized CU{#capacity-optimized-cu}

- Crafted for handling vast datasets, boasting five times the data capacity of its Performance-optimized counterpart, albeit with subdued search performance.

- Ideal for large-scale unstructured data search, copyright detection, and identity verification.

### Cost-optimized CU{#cost-optimized-cu}

- A budget-friendly option, best for tasks where response time is not paramount.

- Provides the same data capacity as the Capacity-optimized CU, but expects higher search latencies.

- Ideal for offline operations such as data labeling and deduplication.

## Select an optimal CU type{#select-an-optimal-cu-type}

Factor in data volume, performance expectations, and budgets while selecting the CU type. Your vector data's magnitude, both in terms of vector count and dimensions, plays a pivotal role in determining cluster resource allocation.

### Assess capacity{#assess-capacity}

The table below illustrates the load capacity for each CU type, taking into account the vector dimensions and the total vector count.

|  Vector Dimensions |  Performance-optimized (Max. Vectors per CU) |  Capacity-optimized (Max. Vectors per CU) |  Cost-optimized (Max. Vectors per CU) |
| ------------------ | -------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------- |
|  128               |  5 million                                   |  25 million                               |  25 million                           |
|  256               |  3 million                                   |  15 million                               |  15 million                           |
|  512               |  1.5 million                                 |  7.5 million                              |  7.5 million                          |
|  768               |  1 million                                   |  5 million                                |  5 million                            |
|  1024              |  0.75 million                                |  3.75 million                             |  3.75 million                         |

<Admonition type="info" icon="📘" title="Notes">

<p>The above metrics are based on tests considering only primary keys and vectors. If your dataset has extra scalar fields (e.g., id, label, keywords), the actual capacity may deviate. It's prudent to conduct personal tests for a precise evaluation.</p>

</Admonition>

### Evaluate performance{#evaluate-performance}

Performance metrics, notably latency and queries per second (QPS), are vital. The Performance-optimized CU distinctly outperforms its counterparts in latency and throughput, particularly for standard `top-k` values ranging from 10 to 250.

The following table shows the test result of how each CU type performs in terms of QPS.

|  top_k |  QPS for Performance-optimized CU (768-dim 1M vectors)<br/>  |  QPS for Capacity-optimized CU (768-dim 5M vectors) |  QPS for Cost-optimized CU (768-dim 5M vectors) |
| ------ | --------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------- |
|  10    |  520                                                            |  100                                                |  30                                             |
|  100   |  440                                                            |  80                                                 |  25                                             |
|  250   |  270                                                            |  60                                                 |  20                                             |
|  1000  |  150                                                            |  40                                                 |  10                                             |

The following table shows the test result of how each CU type performs in terms of latency.

|  top_k<br/>  |  Latency of Performance-optimized CU (768-dim 1M vectors)<br/>  |  Latency of Capacity-optimized CU (768-dim 5M vectors)<br/>  |  Latency of Cost-optimized CU (768-dim 5M vectors) |
| --------------- | ------------------------------------------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
|  10             |  < 10 ms                                                           |  < 50 ms<br/>                                                |  < 100 ms                                          |
|  100            |  < 10 ms                                                           |  < 50 ms                                                        |  < 100 ms                                          |
|  250            |  < 10 ms                                                           |  < 50 ms                                                        |  < 100 ms                                          |
|  1000           |  10 - 20 ms                                                        |  50 - 100 ms                                                    |  100 - 200 ms                                      |

## Scenario breakdown{#scenario-breakdown}

Suppose you are building an image recommendation application with a library of 10 million images. Each image in your library is represented by a 768-dimensional embedding vector. Your goal is to swiftly handle a QPS of 1,000 recommendation requests and deliver the top 100 image recommendations in under 30 milliseconds.

To select the right CU for this requirement, follow these steps:

1. __Evaluate Latency__: The Performance-optimized CU is the only type that meets the 30-millisecond latency requirement.

1. __Assess Capacity__: A single Performance-optimized CU accommodates 1.2 million 768-dimensional vectors. To store all 10 million vectors, you would need at least nine CUs.

1. __Check Throughput__: With a `top-k` setting of 100, the Performance-optimized CU can achieve a QPS of 440. To sustain a consistent 1,000 QPS, you would need to triple the number of replicas.

In conclusion, for this scenario, the Performance-optimized CU is your best bet. A configuration of three replicas, with each replica consisting of nine CUs, should serve you perfectly.

## Related topics{#related-topics}

- [Select Cluster Plans](./select-zilliz-cloud-service-plans)

- [Pricing Calculator](./pricing-calculator)

- [Subscribe by Adding Credit Card](./subscribe-by-adding-credit-card)

- [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace)

- [Register with Zilliz Cloud](./register-with-zilliz-cloud)

