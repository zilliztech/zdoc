---
title: "AUTOINDEX Explained | Cloud"
slug: /autoindex-explained
sidebar_label: "AUTOINDEX Explained"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud offers Performance-optimized and Capacity-optimized clusters. Because of their different purposes, building indexes on these clusters requires different approaches. To save users the trouble of tuning and tweaking index parameters, AUTOINDEX comes into play. | Cloud"
type: origin
token: EA2twSf5oiERMDkriKScU9GInc4
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - autoindex
  - milvus
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database

---

import Admonition from '@theme/Admonition';


# AUTOINDEX Explained

Zilliz Cloud offers Performance-optimized and Capacity-optimized clusters. Because of their different purposes, building indexes on these clusters requires different approaches. To save users the trouble of tuning and tweaking index parameters, **AUTOINDEX** comes into play.

**AUTOINDEX** is a proprietary index type available on Zilliz Cloud that can help you achieve better search performance. Whenever you want to index a vector field in your collection on Zilliz Cloud, **AUTOINDEX** applies.

## Features and benefits\{#features-and-benefits}

**AUTOINDEX** offers a significant performance advantage over open-source Milvus, achieving up to 3x QPS on specific datasets. You can use AUTOINDEX to create indexes on all field types that Zilliz Cloud clusters support, including [Dense Vector](./use-dense-vector), [Binary Vector](./use-binary-vector), and [Binary Vector](./use-binary-vector).

**AUTOINDEX** delivers high performance in these aspects:

- Leverage Single Instruction, Multiple Data (SIMD) to speed up queries and storage, squeezing every possible bit of performance out of machines.

- Optimize data graphing and cropping strategies to significantly reduce the number of data points accessed when searching.

- Implement a dynamic quantization strategy to reduce distance calculation costs.

### Cost efficiency\{#cost-efficiency}

**AUTOINDEX** supports pure in-memory, hybrid disk, and memory-mapped (MMAP) modes to meet users' varying needs for capacity and performance. In in-memory mode, **AUTOINDEX** uses dynamic quantization to significantly reduce memory usage. In hybrid disk mode, **AUTOINDEX** can dynamically cache data and use algorithms to minimize I/O operations and maintain high performance.

### Autonomous tuning\{#autonomous-tuning}

Approximate nearest neighbor (ANN) algorithms require a trade-off between recall and performance. Query parameters have a significant impact on the results. If the query parameter size is too small, the recall will be extremely low and may not meet business requirements. Conversely, if the query parameter size is excessively large, the performance will be severely degraded.

Choosing query parameters requires a lot of domain-specific knowledge, which greatly increases the learning curve for users. To address this issue, **AUTOINDEX** has developed an intelligent algorithm that facilitates the selection of query parameters. By analyzing the distribution of users' datasets during index building, **AUTOINDEX** achieves a trade-off between recall and performance, powered by a machine learning model for query parameter recommendation. This way, users no longer need to manually set query parameters.

<Admonition type="info" icon="📘" title="Notes">

<p>When migrating your Milvus codebase to Zilliz Cloud, you do not need to change the index type used manually. Zilliz Cloud automatically applies AUTOINDEX when creating indexes.</p>

</Admonition>

## Index building and search settings\{#index-building-and-search-settings}

The process of building an index involves sorting out the entities in a collection in a specific order so that results can be retrieved more quickly.

Indexing a floating vector on Zilliz Cloud is not an obstacle. Simply set the index type to **AUTOINDEX** and choose the metric type for Zilliz Cloud to determine the most suitable configurations for the index-building and search processes. The metric type determines how the distances between vectors are measured and is the only thing you need to consider.

The differences between the index-building settings on Milvus and Zilliz Cloud are shown below:

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
    "metric_type": "L2"
}
```

The differences between the search parameter settings are as follows:

```python
# For searches
# On Milvus
search_params = {
    # Applicable tuning parameters vary with the index type
    "params": {
        "nprobe": 10
    }
}

# On Zilliz Cloud
search_params = {
    # highlight-next-line
    "params": { 
        "level": 1 # The default value applies when left unspecified
    }
}
```

### About the `level` parameter\{#about-the-level-parameter}

Tunning search performance requires adjusting different sets of parameters that vary with index types. For instance, when using HNSW, the parameter you should tune is `ef`, whereas when using IVF, the parameter to adjust is `nprobe`. To reach a balance between an optimal recall rate and search performance, it is necessary to fine-tune these parameters specific to the type of index being used.

Zilliz Cloud uses a unified parameter `level` to simplify search parameter tuning instead of leaving you to work with the above-mentioned complex parameter sets. 

Increasing the `level` parameter will result in a higher recall rate, but may also lead to degraded search performance. The value defaults to `1` and ranges from `1` to `10`. The default value results in a recall rate of 90%, which is typically sufficient for most use cases. However, if you require a higher recall rate, increase this value.

You can also set `enable_recall_calculation` to `true`when you tweek the `level` parameter so that you can evaluate the precisions of your search with different `level` values.

<Admonition type="info" icon="📘" title="Notes">

<p>The <code>level</code> and <code>enable_recall_calculation</code> parameters are still in <strong>Public Preview</strong>, and you might not be able to fully use them due to compatibility issues. For any assistance, please contact us at support@zilliz.com.</p>

</Admonition>

## Conclusion\{#conclusion}

We hope this article has helped you better understand AUTOINDEX, a powerful tool that simplifies the process of building and optimizing indexes for vector fields in collections on Zilliz Cloud. By automatically determining the most suitable configurations for your searches and indexes, AUTOINDEX saves users time and effort when compared to traditional methods. Whether you are using a Performance-optimized or Capacity-optimized cluster, AUTOINDEX can help you achieve faster and more efficient searches with optimized indexes tailored to your needs. If you have any questions about AUTOINDEX or any other feature of Zilliz Cloud, don't hesitate to reach out to our team. We are always happy to help!