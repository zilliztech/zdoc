---
slug: /autoindex-explained
beta: FALSE
notebook: FALSE
token: EA2twSf5oiERMDkriKScU9GInc4
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# AUTOINDEX Explained

Zilliz Cloud offers Performance-optimized and Capacity-optimized clusters. Because of their different purposes, building indexes on these clusters requires different approaches. To save users the trouble of tuning and tweaking index parameters, **AUTOINDEX** comes into play.

**AUTOINDEX** is a proprietary index type available on Zilliz Cloud that can help you achieve better search performance. Whenever you want to index a vector field in your collection on Zilliz Cloud, **AUTOINDEX** applies.

## Features and benefits{#features-and-benefits}

**AUTOINDEX** offers a significant performance advantage over open-source Milvus, achieving up to 3x QPS on specific datasets.

**AUTOINDEX** delivers high performance in these aspects:

- Leverage Single Instruction, Multiple Data (SIMD) to speed up queries and storage, squeezing every possible bit of performance out of machines.

- Optimize data graphing and cropping strategies to significantly reduce the number of data points accessed when searching.

- Implement a dynamic quantization strategy to reduce distance calculation costs.

### Cost efficiency{#cost-efficiency}

**AUTOINDEX** supports pure in-memory, hybrid disk, and memory-mapped (MMAP) modes to meet users' varying needs for capacity and performance. In in-memory mode, **AUTOINDEX** uses dynamic quantization to significantly reduce memory usage. In hybrid disk mode, **AUTOINDEX** can dynamically cache data and use algorithms to minimize I/O operations and maintain high performance.

### Autonomous tuning{#autonomous-tuning}

Approximate nearest neighbor (ANN) algorithms require a trade-off between recall and performance. Query parameters have a significant impact on the results. If the query parameter size is too small, the recall will be extremely low and may not meet business requirements. Conversely, if the query parameter size is excessively large, the performance will be severely degraded.

Choosing query parameters requires a lot of domain-specific knowledge, which greatly increases the learning curve for users. To address this issue, **AUTOINDEX** has developed an intelligent algorithm that facilitates the selection of query parameters. By analyzing the distribution of users' datasets during index building, **AUTOINDEX** achieves a trade-off between recall and performance, powered by a machine learning model for query parameter recommendation. This way, users no longer need to manually set query parameters.

## Index building and search settings{#index-building-and-search-settings}

The process of building an index involves sorting out the entities in a collection in a specific order so that results can be retrieved more quickly.

Indexing a floating vector on Zilliz Cloud is not an obstacle. Simply set the index type to `AUTOINDEX` and choose the metric type for Zilliz Cloud to determine the most suitable configurations for the index-building and search processes. The metric type determines how the distances between vectors are measured and is the only thing you need to consider.

The difference between the index-building and search settings on Milvus and Zilliz Cloud are shown below:

```python
# For index-building
# On Milvus
index_params = {
    # Another option is IP.
    "metric_type": "L2", 
    # There are six more options available there.
    "index_type": "IVF_FLAT",
    # This varies with the specified index type.
    "params": {
        # This is the parameter required for IVF_FLAT to work.
        "nlist": 1024
    }
}

# On Zilliz Cloud
index_params = {
    # Always set this to AUTOINDEX
    "index_type": "AUTOINDEX", 
    # This is the only parameter you should think about.
    "metric_type": "L2",
    # Leave this empty for AUTOINDEX to work 
    "params": {} 
}

# For searches
# On Milvus
search_params = {
    # Set this to the metric type used to build the index
    "metric_type": "L2", 
    # Applicable tuning parameters vary with the index type
    "params": {
        "nprobe": 10
    }
}

# On Zilliz Cloud
search_params = {
    # The value remains the same as the metric type specified during index building.
    "metric_type": "L2" 
}
```

## Conclusion{#conclusion}

We hope this article has helped you better understand AUTOINDEX, a powerful tool that simplifies the process of building and optimizing indexes for vector fields in collections on Zilliz Cloud. By automatically determining the most suitable configurations for your searches and indexes, AUTOINDEX saves users time and effort when compared to traditional methods. Whether you are using a Performance-optimized or Capacity-optimized cluster, AUTOINDEX can help you achieve faster and more efficient searches with optimized indexes tailored to your needs. If you have any questions about AUTOINDEX or any other feature of Zilliz Cloud, don't hesitate to reach out to our team. We are always happy to help!