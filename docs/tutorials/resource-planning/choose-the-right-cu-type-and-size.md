---
slug: /choose-the-right-cu-type-and-size
beta: FALSE
notebook: FALSE
sidebar_position: 4
---



# Select the Right CU

A Compute Unit (CU) is the physical resource unit for database deployment. Different CU types comprise varying combinations of CPU, memory, and storage. When creating a cluster, selecting the appropriate type of CU is critical. To meet various business requirements, Zilliz Cloud offers these CU options: **Performance-optimized**, **Capacity-optimized**, and **Cost-optimized**.

## **Performance-optimized CU**{#performance-optimized-cu}

A performance-optimized CU is best suited for similarity search scenarios that require low latency and high throughput. It is designed for critical workloads where latency and throughput play a crucial role, especially for those who need real-time responses:

- Generative AI,

- Recommendation system,

- Search engine,

- Chatbot,

- Content moderation,

- Knowledgebase, and

- Anti-fraud.

## Capacity-optimized CU{#capacity-optimized-cu}

If your application involves a large set of data, you can consider a capacity-optimized CU. This type of CU can hold five times larger data than performance-optimized CU, with a trade-off of lower search performance. Capacity-optimized CU is suitable (but not limited to) the following scenarios:

- Large-scale unstructured data (text, image, video, molecular structure, etc.) search,

- Copyright detection, and

- Identity verification.

## Cost-optimized CU{#cost-optimized-cu}

If your application is not sensitive to response time and you want a budget-friendly solution, the cost-optimized CU must be the right choice. Each cost-optimized CU can hold the same amount of data as a capacity-optimized CU does, but the search latency is much higher. This CU type is especially suitable for offline tasks:

- Data labeling,

- Data deduplication,

- Data clustering, and

- Dataset outlier detection or class balancing.

## General **Comparisons**{#general-comparisons}

Here is a quick comparison of the three types of CUs:

|  **CU Type**           |  **Latency** |  **Throughput** |  **Capacity** |  **Cost**             |
| ---------------------- | ------------ | --------------- | ------------- | --------------------- |
|  Performance-optimized |  Low         |  High           |  Low          |  Start from $99/month |
|  Capacity-optimized    |  Medium      |  Medium         |  High         |  Start from $99/month |
|  Cost-optimized        |  High        |  Low            |  High         |  Start from $65/month |

## Performance Comparisons{#performance-comparisons}

Users often pay close attention to key performance indicators such as search latency and throughput. To illustrate this, we provide a set of test results using two datasets, one containing 1,000,000 vectors of 768-dimension, and the other containing 5,000,000 vectors of 768-dimension. In the experiment, we verified performance under different top-k values (10, 100, 250, 1000).

The performance-optimized CU significantly surpasses the other two CU types in terms of performance. With typical top-k values (from 10-250), its latency is kept under 10 milliseconds, exhibiting a speed that's five and ten times faster than that of the capacity-optimized and cost-optimized CU, respectively. When assessing thousand-scale top-k, the latency associated with each CU type diverges: performance-optimized CU ranges between 10-20 ms, capacity-optimized CU fluctuates within 50-100 ms, and the cost-optimized CU varies between 100-200 ms. It's important to note that even though the performance-optimized CU exhibits a lower speed, the search latency it offers is still suitable for a wide range of real-time applications.

![JNobbfAgKoSGSDxiMK3cOkVsnyf](/img/JNobbfAgKoSGSDxiMK3cOkVsnyf.png)

In terms of throughput, the performance-optimized CU outperforms the capacity-optimized CU by a factor of 4 to 5 and surpasses the cost-optimized CU by a factor of 15 to 18.

## Capacity Comparisons{#capacity-comparisons}

We conducted a comprehensive evaluation of the full capacities of three different CU types, utilizing a standard set of vector dimensions, namely 128, 256, 512, 768, and 1024. This assessment allowed us to derive some significant findings:

- The capacity of the capacity-optimized CU and cost-optimized CU are identical.

- The capacity-optimized CU and cost-optimized CU have five times larger capacity than performance-optimized CU.

- Within the same CU type, there exists an inverse correlation between the maximum number of vectors it can hold and the vector dimension. As an illustrative example, a CU can hold approximately double the number of 512-dimensional vectors compared to 1024-dimensional vectors.

![URSvbRCwvoKkF0x29ndc8QW9nVe](/img/URSvbRCwvoKkF0x29ndc8QW9nVe.png)

Note that in this experiment, no scalar fields are introduced; only the primary key and vectors are taken into consideration. If there are numerous scalar fields in addition to the vector field (for example, id, label, keywords, summary, URL, etc.), the actual capacity could deviate from the table above, and thus empirical measurement should be relied upon for accuracy.

## Example{#example}

Suppose your application is for recommending images, with an inventory of 10 million images. Each image is associated with a 768-dimensional embedding vector. The application needs to support 1,000 recommendation requests per second, retrieving the top 100 recommendations with an end-to-end latency not exceeding 30 milliseconds.

Starting from the latency indicators, only the performance-optimized CU can meet the requirement.

Next, in terms of capacity, a single performance-optimized CU can accommodate 1.2 million 768-dimensional vectors. Thus, to handle 10 million 768-dimensional vectors, you would need a minimum of nine CUs.

Looking at throughput, the performance-optimized CU reaches a peak QPS of 440 when the top-k is set at 100. As a result, to sustain 1,000 QPS, you would require three replicas.

Summing up, for this particular scenario, it would be best to opt for the performance-optimized CU, with three replicas, each containing nine CUs.