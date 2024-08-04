---
title: "Select the Right CU | Cloud"
slug: /cu-types-explained
sidebar_label: "CU Types"
beta: FALSE
notebook: FALSE
description: "Selecting the right Compute Unit (CU) is a crucial step when creating a cluster in Zilliz Cloud. A CU is the basic unit of compute resources used for parallel processing of data, and different CU types comprise varying combinations of CPU, memory, and storage. | Cloud"
type: origin
token: UgqvwKh2QiKE1kkYNLJcaHt0nkg
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - cu
  - select

---

import Admonition from '@theme/Admonition';


# Select the Right CU

Selecting the right Compute Unit (CU) is a crucial step when creating a cluster in Zilliz Cloud. A CU is the basic unit of compute resources used for parallel processing of data, and different CU types comprise varying combinations of CPU, memory, and storage.

## Understand CU types{#understand-cu-types}

Zilliz Cloud offers these CU types: **Performance-optimized** and **Capacity-optimized**.

<table>
   <tr>
     <th><p>CU Type</p></th>
     <th><p>Latency</p></th>
     <th><p>Throughput</p></th>
     <th><p>Capacity</p></th>
   </tr>
   <tr>
     <td><p><strong>Performance-optimized</strong></p></td>
     <td><p>Low</p></td>
     <td><p>High</p></td>
     <td><p>Low</p></td>
   </tr>
   <tr>
     <td><p><strong>Capacity-optimized</strong></p></td>
     <td><p>Medium</p></td>
     <td><p>Medium</p></td>
     <td><p>High</p></td>
   </tr>
</table>

### Performance-optimized CU{#performance-optimized-cu}

- Tailored for scenarios emphasizing low latency and high throughput.

- Ideal for real-time applications like generative AI, recommendation systems, chatbots, and more.

### Capacity-optimized CU{#capacity-optimized-cu}

- Crafted for handling vast datasets, boasting five times the data capacity of its Performance-optimized counterpart, albeit with subdued search performance.

- Ideal for large-scale unstructured data search, copyright detection, and identity verification.

## Select an optimal CU type{#select-an-optimal-cu-type}

Factor in data volume, performance expectations, and budgets while selecting the CU type. Your vector data's magnitude, both in terms of vector count and dimensions, plays a pivotal role in determining cluster resource allocation.

### Assess capacity{#assess-capacity}

The number of entities a cluster can accommodate depends on the CU capacity of a cluster.

The reference table below illustrates the capacity of a cluster with 1 performance-optimized CU and 1 capacity-optimized CU, taking into account the vector dimensions and the total vector count. For an estimation of the CU sizes needed for your data volume, please use [our calculator](https://zilliz.com/pricing#calculator).

<table>
   <tr>
     <th><p>Vector Dimensions</p></th>
     <th><p>Performance-optimized (Max. Vectors per CU)</p></th>
     <th><p>Capacity-optimized (Max. Vectors per CU)</p></th>
   </tr>
   <tr>
     <td><p>128</p></td>
     <td><p>7.5 million</p></td>
     <td><p>25 million</p></td>
   </tr>
   <tr>
     <td><p>256</p></td>
     <td><p>4.5 million</p></td>
     <td><p>15 million</p></td>
   </tr>
   <tr>
     <td><p>512</p></td>
     <td><p>2.25 million</p></td>
     <td><p>7.5 million</p></td>
   </tr>
   <tr>
     <td><p>768</p></td>
     <td><p>1.5 million</p></td>
     <td><p>5 million</p></td>
   </tr>
   <tr>
     <td><p>1024</p></td>
     <td><p>1.125 million</p></td>
     <td><p>3.75 million</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>The above metrics are based on tests considering only primary keys and vectors. If your dataset has extra scalar fields (e.g., id, label, keywords), the actual capacity may deviate. It's prudent to conduct personal tests for a precise evaluation.</p>

</Admonition>

### Evaluate performance{#evaluate-performance}

Performance metrics, notably latency and queries per second (QPS), are vital. The Performance-optimized CU distinctly outperforms Capacity-optimized CU in latency and throughput, particularly for standard `top-k` values ranging from 10 to 250.

The following table shows the test result of how each CU type performs in terms of QPS.

<table>
   <tr>
     <th><p>top_k</p></th>
     <th><p>QPS for Performance-optimized CU (768-dim 1M vectors)</p></th>
     <th><p>QPS for Capacity-optimized CU (768-dim 5M vectors)</p></th>
   </tr>
   <tr>
     <td><p>10</p></td>
     <td><p>520</p></td>
     <td><p>100</p></td>
   </tr>
   <tr>
     <td><p>100</p></td>
     <td><p>440</p></td>
     <td><p>80</p></td>
   </tr>
   <tr>
     <td><p>250</p></td>
     <td><p>270</p></td>
     <td><p>60</p></td>
   </tr>
   <tr>
     <td><p>1000</p></td>
     <td><p>150</p></td>
     <td><p>40</p></td>
   </tr>
</table>

The following table shows the test result of how each CU type performs in terms of latency.

<table>
   <tr>
     <th><p>top_k</p></th>
     <th><p>Latency of Performance-optimized CU (768-dim 1M vectors)</p></th>
     <th><p>Latency of Capacity-optimized CU (768-dim 5M vectors)</p></th>
   </tr>
   <tr>
     <td><p>10</p></td>
     <td><p>&lt; 10 ms</p></td>
     <td><p>&lt; 50 ms</p></td>
   </tr>
   <tr>
     <td><p>100</p></td>
     <td><p>&lt; 10 ms</p></td>
     <td><p>&lt; 50 ms</p></td>
   </tr>
   <tr>
     <td><p>250</p></td>
     <td><p>&lt; 10 ms</p></td>
     <td><p>&lt; 50 ms</p></td>
   </tr>
   <tr>
     <td><p>1000</p></td>
     <td><p>10 - 20 ms</p></td>
     <td><p>50 - 100 ms</p></td>
   </tr>
</table>

## Scenario breakdown{#scenario-breakdown}

Suppose you are building an image recommendation application with a library of 8 million images. Each image in your library is represented by a 768-dimensional embedding vector. Your goal is to swiftly handle a QPS of 1,000 recommendation requests and deliver the top 100 image recommendations in under 30 milliseconds.

To select the right CU for this requirement, follow these steps:

1. **Evaluate Latency**: The Performance-optimized CU is the only type that meets the 30-millisecond latency requirement.

1. **Assess Capacity**: A single Performance-optimized CU accommodates 1.5 million 768-dimensional vectors. To store all 8 million vectors, you would need at least 6 CUs.

1. **Check Throughput**: With a `top-k` setting of 100, the Performance-optimized CU can achieve a QPS of 440. To sustain a consistent 1,000 QPS, you would need to triple the number of replicas.

In conclusion, for this scenario, the Performance-optimized CU is your best bet. A configuration of 3 replicas, with each replica consisting of 6 CUs, should serve you perfectly.

## Related topics{#related-topics}

- [Select Cluster Plans](./select-zilliz-cloud-service-plans)

- [Pricing Calculator](./pricing-calculator)

- [Subscribe by Adding Credit Card](./subscribe-by-adding-credit-card)

- [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace)

- [Register with Zilliz Cloud](./register-with-zilliz-cloud)

