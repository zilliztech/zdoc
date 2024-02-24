---
slug: /faq-get-started
beta: null
notebook: null
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 1
---

# FAQ: Get Started

This topic lists the possible issues that you may encounter while you get started with Zilliz Cloud and the corresponding solution.

## Contents



## FAQs




__Is there any performance comparison between Zilliz Cloud and other vector search solutions?__

Yes. You can use [VectorDBBench](https://zilliz.com/vector-database-benchmark-tool), a vector database benchmark tool to compare the performance of Zilliz Cloud and other mainstream vector databases and cloud services.

__Which type of index is supported by Zilliz Cloud?__

Currently, Zilliz Cloud only supports AUTOINDEX, a customized version of HNSW (for performance-optimized clusters) and DiskANN (for capacity-optimized clusters). AUTOINDEX is designed to enhance search performance. For a performance-optimized cluster with 1 million 768-dimensional vectors, the QPS can reach several hundred and the latency is below 100 milliseconds. For a Capacity-optimized cluster with the same data volume, the QPS can reach 50 and the latency is over 200 milliseconds. For more details, see [AUTOINDEX Explained](./autoindex-explained).

However, please[ submit a request](https://support.zilliz.com/hc/en-us) if you are familiar with using certain types of index listed [here](https://milvus.io/docs/index.md). We can enable these options for you.

__What is the search latency of Zilliz Cloud?__

The search latency depends on the CU type and data volume. 

![ObhQbbImLoKHdexbeD0cBMSWngh](/byoc/ObhQbbImLoKHdexbeD0cBMSWngh.png)

For more details about the test result, see [Select the Right CU](./cu-types-explained).

__How can I get further technical support?__

Please submit at request at the Zilliz cloud [support portal](https://support.zilliz.com/hc/en-us).
