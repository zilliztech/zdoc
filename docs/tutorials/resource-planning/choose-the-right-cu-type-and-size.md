---
slug: /choose-the-right-cu-type-and-size
beta: FALSE
notebook: FALSE
sidebar_position: 2
---



# Select the Right CU

Selecting the right Compute Unit (CU) is a crucial step when creating a cluster in Zilliz Cloud. A CU is the basic unit of compute resources used for parallel processing of data, and different CU types comprise varying combinations of CPU, memory, and storage.

## Available CU types{#available-cu-types}

Zilliz Cloud offers three CU types: [Performance-optimized](./choose-the-right-cu-type-and-size#performance-optimized-cu), [Capacity-optimized](./choose-the-right-cu-type-and-size#capacity-optimized-cu), and [Cost-optimized](./choose-the-right-cu-type-and-size#cost-optimized-cu).

|  CU Type               |  Latency |  Throughput |  Capacity |  Cost                 |
| ---------------------- | -------- | ----------- | --------- | --------------------- |
|  Performance-optimized |  Low     |  High       |  Low      |  Start from $99/month |
|  Capacity-optimized    |  Medium  |  Medium     |  High     |  Start from $99/month |
|  Cost-optimized        |  High    |  Low        |  High     |  Start from $65/month |

### Performance-optimized CU{#performance-optimized-cu}

- Ideal for similarity search scenarios requiring low latency and high throughput.

- Well-suited for real-time responses in applications like generative AI, recommendation systems, chatbots, and more.

### Capacity-optimized CU{#capacity-optimized-cu}

- Designed for applications handling a large dataset, offering **five times more** data capacity than **Performance-optimized** CU with a trade-off of lower search performance.

- Suitable for large-scale unstructured data search, copyright detection, and identity verification.

### Cost-optimized CU{#cost-optimized-cu}

- A budget-friendly option for applications not sensitive to response time.

- Offers the **same data capacity** as **Capacity-optimized** CU but with higher search latency.

- Ideal for offline tasks such as data labeling and deduplication.

## Determine the optimal CU type{#determine-the-optimal-cu-type}

Consider the data volume, performance requirements, and budget while choosing the CU type. The amount of vector data, including the number of vectors and their dimensions, significantly impacts the resources of a cluster.

### Capacity assessment{#capacity-assessment}

The table below illustrates the load capacity per CU based on CU types, vector dimensions, and the number of vectors.

|  <br/> <br/>  Vector Dimensions<br/> <br/>   |  <br/> <br/>  Number of Vectors per CU (Million)<br/> <br/>   |                        |                    |
| ---------------------------------------- | --------------------------------------------------------- | ---------------------- | ------------------ |
|                                          |  Performance-optimized CU                                 |  Capacity-optimized CU |  Cost-optimized CU |
|  128                                     |  5                                                        |  25                    |  25                |
|  256                                     |  2.96                                                     |  14.87                 |  14.87             |
|  512                                     |  1.63                                                     |  8.22                  |  8.22              |
|  768                                     |  1.2                                                      |  5.6                   |  5.6               |
|  1024                                    |  0.86                                                     |  4.34                  |  4.34              |

:::info Notes

In testing, only the primary key and vectors are considered. If your data has additional scalar fields (e.g., id, label, keywords), the actual capacity may vary, so personal testing is recommended for accurate assessment.

:::

### Performance evaulation{#performance-evaulation}

Performance metrics such as latency and queries per second (QPS) are crucial. The performance-optimized CU significantly surpasses the other two CU types in terms of latency and throughput, especially with typical `top-k` values (from 10-250).

|  `top_k`             |                           |            |  10  |  100 |  250 |  1000 |
| -------------------- | ------------------------- | ---------- | ---- | ---- | ---- | ----- |
|  QPS (ms)<br/> <br/>   |  Performance-optimized CU |  1M 768dim |  520 |  440 |  270 |  150  |
|                      |  Capacity-optimized CU    |  5M 768dim |  100 |  80  |  60  |  40   |
|                      |  Cost-optimized CU        |  5M 768dim |  30  |  25  |  20  |  10   |

## Example scenario{#example-scenario}

Imagine you have an image recommendation application with a library of 10 million images. Each image has a 768-dimensional embedding vector. The goal is to handle 1,000 recommendation requests per second, delivering the top 100 recommendations within 30 milliseconds.

- **Latency**: Only the performance-optimized CU meets the latency requirement.

- **Capacity**: A single performance-optimized CU holds 1.2 million 768-dimensional vectors, so to accommodate 10 million vectors, you need at least nine CUs.

- **Throughput**: With the `top-k` set at `100`, the performance-optimized CU achieves a peak QPS of 440. To maintain 1,000 QPS, three replicas are required.

In summary, the performance-optimized CU is the best fit for this scenario, requiring three replicas, each with nine CUs.

## Related topics{#related-topics}

- [Select Cluster Plans](./select-zilliz-cloud-service-plans)

- [Pricing Calculator](./pricing-calculator)

- [Subscribe by Adding Credit Card](./subscribe-by-adding-credit-card) 

- [Subscribe on AWS Marketplace](./subscribe-on-aws-marketplace) 

- [Register with Zilliz Cloud](./register-with-zilliz-cloud)
