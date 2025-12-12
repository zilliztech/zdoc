---
title: "Tune Index Build Level | BYOC"
slug: /tune-index-build-level
sidebar_label: "Tune Index Build Level"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud introduces a parameter called `buildlevel`, which allows users to balance storage capacity and search recall rate for the target collection. For collections that are infrequently used or need more storage space, you can sacrifice a small recall rate degradation in exchange for a huge increase in storage capacity, and vice versa. This guide explains the available options and how to use them to build indexes for collections. | BYOC"
type: origin
token: WQvUw9c9lifskGkgz0fcmUWvnFb
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - vector field
  - index
  - index build level
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Tune Index Build Level

Zilliz Cloud introduces a parameter called `build_level`, which allows users to balance storage capacity and search recall rate for the target collection. For collections that are infrequently used or need more storage space, you can sacrifice a small recall rate degradation in exchange for a huge increase in storage capacity, and vice versa. This guide explains the available options and how to use them to build indexes for collections. 

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is currently in <strong>PUBLIC REVIEW</strong> and applies to dedicated clusters only if:</p>
<ul>
<li><p>The clusters are of the <strong>Performance-optimized</strong> or <strong>Capacity-optimized</strong> type, and</p></li>
<li><p>The clusters are compatible with <strong>Milvus v2.6.x</strong>.</p></li>
</ul>
<p>You can upgrade your clusters to test this feature and <a href="https://support.zilliz.com/hc/en-us/requests/new">contact us</a> if you have encountered anything that needs further clarification.</p>

</Admonition>

## Overview\{#overview}

Zilliz Cloud clusters of different types vary significantly in their claimed storage capacities. If a collection in a performance-optimized cluster is meant for infrequent use or requires additional storage, consider setting `build_level` to the capacity-first option when creating indexes for vector fields of the floating vector types, such as **FLOAT_VECTOR**, **FLOAT16_VECTOR**, and **BFLOAT16_VECTOR** in the collection. Although this may slightly reduce recall, it can boost storage capacity by **30%** to **40%**.

The `build_level` parameter has three options: **Precision-first** (2), **Balanced** (1), and **Capacity-first** (0).

- **Balanced** (1)

    This is the default option, balancing search precision and storage capacity for most scenarios.

- **Precision-first** (2)

    This option prioritizes search performance and high recall, suitable for collections that require high accuracy.

- **Capacity-first** (0)

    This option emphasizes storage capacity, ideal for collections that require additional storage space.

As shown in an internal benchmark test, the default option increases the storage capacity of all clusters regardless of their types. For performance-optimized clusters, the default option even yields a **60%** boost in storage capacity and a **17%** improvement in performance (QPS). 

### Performance-optimized clusters\{#performance-optimized-clusters}

The following table compares the capacity, QPS, and recall rate of a performance-optimized cluster before and after introducing `build_level`. You can see that the default option maintains the recall rate and increases both QPS and storage capacity.

<table>
   <tr>
     <th><p>Build Level Option</p></th>
     <th><p>Capacity</p></th>
     <th><p>QPS</p></th>
     <th><p>Recall</p></th>
   </tr>
   <tr>
     <td><p>Before <code>build_level</code> (Baseline)</p></td>
     <td><p>1.5 million 768-dim vectors</p></td>
     <td><p>~ 3,000</p></td>
     <td><p>91% - 97%</p></td>
   </tr>
   <tr>
     <td><p>Capacity-first (0)</p></td>
     <td><p><strong>5.25 million 768-dim vectors (↑ 250%)</strong></p></td>
     <td><p>~ 2,850 (↓ ~5%)</p></td>
     <td><p>90% - 95%</p></td>
   </tr>
   <tr>
     <td><p><strong>Balanced (1)</strong></p></td>
     <td><p><strong>2.4 million 768-dim vectors (↑ 60%)</strong></p></td>
     <td><p><strong>~ 3,500 (↑ 17%)</strong></p></td>
     <td><p>91% - 97%</p></td>
   </tr>
   <tr>
     <td><p>Precison-first (2)</p></td>
     <td><p>1.5 million 768-dim vectors</p></td>
     <td><p>~ 3,000</p></td>
     <td><p><strong>92% - 98% (↑)</strong></p></td>
   </tr>
</table>

### Capacity-optimized clusters\{#capacity-optimized-clusters}

The following table compares the capacity, QPS, and recall rate of a capacity-optimized cluster before and after introducing `build_level`. You can see that the default option maintains the recall rate and increases both QPS and storage capacity.

<table>
   <tr>
     <th><p>Build Level Option</p></th>
     <th><p>Capacity</p></th>
     <th><p>QPS</p></th>
     <th><p>Recall</p></th>
   </tr>
   <tr>
     <td><p>Before <code>build_level</code> (Baseline)</p></td>
     <td><p>5 million 768-dim vectors</p></td>
     <td><p>~ 340</p></td>
     <td><p>93% - 98%</p></td>
   </tr>
   <tr>
     <td><p>Capacity-first (0)</p></td>
     <td><p><strong>10 million 768-dim vectors (↑ 100%)</strong></p></td>
     <td><p>~ 300</p></td>
     <td><p>89% - 97%</p></td>
   </tr>
   <tr>
     <td><p><strong>Balanced (1)</strong></p></td>
     <td><p><strong>7.5 million 768-dim vectors (↑ 50%)</strong></p></td>
     <td><p><strong>~ 350 (↑ 3%)</strong></p></td>
     <td><p>92% - 97%</p></td>
   </tr>
   <tr>
     <td><p>Precision-first (2)</p></td>
     <td><p>5 million 768-dim vectors</p></td>
     <td><p>~ 345</p></td>
     <td><p><strong>94% - 98% (↑)</strong></p></td>
   </tr>
</table>

## Limits\{#limits}

Before starting the operations, familiarize yourself with the following limits:

- Only Milvus 2.6.x-compatible dedicated clusters of the performance-optimized or capacity-optimized type permit this setting.

- You need to set this parameter on a vector field of the floating vector types, including **FLOAT_VECTOR**, **FLOAT16_VECTOR**, and **BFLOAT16_VECTOR**, when indexing a collection.

- Once set, this parameter cannot be modified. However, you can drop the index and create another with the desired settings if necessary.

- A migration or backup will remove the `build_level` settings. After the migration or restoration is complete, you can drop the index and create another with the desired settings if necessary.

## Procedure\{#procedure}

In most cases, you do not need to set `build_level`. The default setting helps you strike a balance between search performance, precision, and storage capacity. 

Zilliz Cloud allows you to set `build_level` either programmatically or on the Zilliz Cloud console.

### Set build_level programmatically\{#set-buildlevel-programmatically}

To set `build_level`, you need to do it when you [index a vector field](./index-vector-fields#index-a-collection) of floating types, such as **FLOAT_VECTOR**, **FLOAT16_VECTOR**, and **BFLOAT16_VECTOR**.

The following example assumes that you have finished the steps in [Preparations](./index-vector-fields#preparations). Setting `build_level` to `1` indicates that the **Balanced** option applies.

```python
# 4. Set up index
# 4.1. Set up the index parameters
index_params = MilvusClient.prepare_index_params()

# 4.2. Add an index on the vector field.
index_params.add_index(
    field_name="vector",
    metric_type="COSINE",
    index_type="AUTOINDEX",
    index_name="vector_index",
    # highlight-next-line
    build_level=1
)

# 4.4. Create an index file
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 5. Describe index
res = client.list_indexes(
    collection_name="customized_setup"
)
```

### Set build_level on the Zilliz Cloud console\{#set-buildlevel-on-the-zilliz-cloud-console}

Instead of setting `build_level` programmatically, you can also set it on the Zilliz Cloud console when you create a collection.

<Supademo id="cmfkua8whed1839ozdau9fzqp?utm_source=link" title=""  />

1. Click **+ Create Collection** on the Collection tab in the target cluster.

1. On the **Create Collection** page, set up the schema.

    Ensure that the data type of the vector field is one of the valid options: **FLOAT_VECTOR**, **FLOAT16_VECTOR**, and **BFLOAT16_VECTOR**.

1. In the **Create Index** section, click **Edit Index**.

1. In the prompted Edit Vector Index field, you can set **Metric Type** and **Index Build Level**.

