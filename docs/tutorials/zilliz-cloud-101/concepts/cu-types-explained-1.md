---
slug: /cu-types-explained-1
sidebar_position: 2
---



# CU Types Explained

When you create a Zilliz Cloud cluster, it’s critical to determine the type and size of compute unit (CU). In Zilliz Cloud, a CU refers to a basic unit of compute resources used for the parallel processing of data.

## Supported CU types{#supported-cu-types}

To meet diverse business scenarios, Zilliz Cloud offers three CU types: performance-optimized, capacity-optimized, and cost-optimized.

- **Performance-optimized**: It’s suited for similarity search scenarios that require low latency and high throughput. If your application is sensitive to latency, performance-optimized CU can be a good fit. Not only can it provide faster response, but it can also handle more requests at once.

- **Capacity-optimized**: If your application needs to handle a large amount of data, you can consider a capacity-optimized CU. This type of CU is designed to handle searches within a large volume of data on SSDs, which is five times larger than that of the performance-optimized CU.

- **Cost-optimized**: We recommend cost-optimized CUs for workloads that require optimization of cost savings, capacity, and performance. This type of CU provides the same storage capacity as the existing capacity-optimized CU, accommodating approximately 5,000,000 vectors with 768 dimensions. However, it costs about 30% less, enabling users to handle large datasets with a high-quality vector database for their applications at an affordable price. It’s most suitable for users with limited budgets who may not require demanding latency or query throughput but still seek top-tier solutions.

The table below provides an overview of the differences among these CU types.

|  **CU Type**           |  **Latency** |  **Throughput** |  **Capacity** |  **Cost** |
| ---------------------- | ------------ | --------------- | ------------- | --------- |
|  Performance-optimized |  Low         |  High           |  Low          |  High     |
|  Capacity-optimized    |  Medium      |  Medium         |  High         |  Medium   |
|  Cost-optimized        |  High        |  Low            |  High         |  Low      |

## Determine an optimal CU type{#determine-an-optimal-cu-type}

When determining the type and size of CU, you need to consider several factors, such as the data volume, performance, and costs.

### Data volume{#data-volume}

In most cases, vector data consumes most resources of a cluster. The amount of vector data includes the number of vectors and their dimensions. The following table shows the load capacity per CU based on CU types and the number of vectors and dimensions.

|  **Vector Dimension** |  **Capacity-optimized** |  **Performance-optimized** |  **Cost-optimized** |
| --------------------- | ----------------------- | -------------------------- | ------------------- |
|  128                  |  25 million             |  5 million                 |  25 million         |
|  256                  |  15 million             |  3 million                 |  15 million         |
|  512                  |  7.5 million            |  1.5 million               |  7.5 million        |
|  768                  |  5 million              |  1 million                 |  5 million          |
|  1024                 |  3.75 million           |  0.75 million              |  3.75 million       |

These results have been verified through testing. The default data type for each vector dimension is FLOAT.

Zilliz Cloud is highly scalable, with load capacity and the number of CUs having a linear relationship. This means that if you have a larger amount of data, you can calculate the required number of CUs for different CU types in a linear manner.

In certain scenarios, the amount of scalar data can also be significant. The recommended options in the table above are based on vector data. Larger scalar fields will also occupy storage space and reduce the number of vectors that each CU can load. Specific values need to be verified through testing in different use cases.

### Performance{#performance}

Metrics such as latency and queries per second (QPS) are used to measure performance, and there are several factors that can affect performance, including CU types and sizes, vector dimensions, number of entities, and `top_k` values.

To test performance, we use 1 million 768-dimensional data for performance-optimized CUs and 5 million 768-dimensional data for capacity-optimized and cost-optimized CUs, respectively.

To meet business needs in different scenarios, we test performance with different `top_k` values, from `10`, `100`, `250`, to `1000`.

The following test result shows how each CU type performs.

![IS03b3BmooHjA4xcielcWvTTnhd](/img/IS03b3BmooHjA4xcielcWvTTnhd.png)

:::info Notes

The preceding result is for reference only. There could be significant performance differences between different use cases, and the latency and QPS metrics are also closely related to factors such as network latency and stability. The actual performance should be based on specific, real-world data.

:::

