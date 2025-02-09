---
title: "Use mmap | Cloud"
slug: /use-mmap
sidebar_label: "Use mmap"
beta: PUBLIC
notebook: FALSE
description: "Memory mapping (Mmap) enables direct memory access to large files on disk, allowing Zilliz Cloud to store indexes and data in both memory and hard drives. This approach helps optimize data placement policy based on access frequency, expanding storage capacity for collections without impacting search performance. This page helps you understand how Zilliz Cloud uses mmap to enable fast and efficient data storage and retrieval. | Cloud"
type: origin
token: P3wrwSMNNihy8Vkf9p6cTsWYnTb
sidebar_position: 14
keywords: 
  - zilliz
  - vector database
  - cloud
  - mmap
  - search optimization
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture

---

import Admonition from '@theme/Admonition';


# Use mmap

Memory mapping (Mmap) enables direct memory access to large files on disk, allowing Zilliz Cloud to store indexes and data in both memory and hard drives. This approach helps optimize data placement policy based on access frequency, expanding storage capacity for collections without impacting search performance. This page helps you understand how Zilliz Cloud uses mmap to enable fast and efficient data storage and retrieval.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>This feature is still in <strong>Public Preview</strong>. If you have encountered any issues regarding this feature, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud support</a>.</p></li>
<li><p>When migrating or restoring data between source and target clusters that have different plans, the Mmap settings of the source collection will not be migrated to the target cluster. Please manually reconfigure the MMAP settings on the target cluster.</p></li>
</ul>

</Admonition>

## Overview{#overview}

Zilliz Cloud uses collections to organize vector embeddings and their metadata, and each row in the collection represents an entity. As shown in the left figure below, the vector field stores vector embeddings, and the scalar fields store their metadata. When you have created indexes on certain fields and loaded the collection, Zilliz Cloud loads the created indexes and raw data from all fields into memory.

![EPNvwAI7hhCppbbKmuxcW5VRnUh](/img/EPNvwAI7hhCppbbKmuxcW5VRnUh.png)

Zilliz Cloud clusters are memory-intensive database systems, and the memory size available determines the capacity of a collection. Loading fields containing a large volume of data into memory is impossible if the data size exceeds the memory capacity, which is the usual case for AI-driven applications. 

To resolve such issues, Zilliz Cloud introduces mmap to balance the loading of hot and cold data in collections. As shown in the right figure above, Zilliz Cloud loads only the vector indexes into memory and memory-maps the raw data of all fields and scalar indexes when you load a collection if you are using a Zilliz Cloud cluster with capacity-optimized CUs.

By comparing the data placement procedures in the left and right figures, you can figure out that the memory usage is much higher in the left figure than in the right one. With mmap enabled, the data that should have been loaded into memory is offloaded into the hard drive and cached in the page cache of the operating system, reducing memory footprint. However, cache hit failures may result in performance degradation. For details, refer to [this article](https://en.wikipedia.org/wiki/Mmap).

## Global mmap strategy{#global-mmap-strategy}

The following table lists the global mmap strategy for clusters from different tiers.

<table>
   <tr>
     <th rowspan="2"><p>Mmap Target</p></th>
     <th colspan="2"><p>Dedicated Clusters</p></th>
     <th rowspan="2"><p>Free &amp; Serverless Clusters</p></th>
   </tr>
   <tr>
     <td><p>Performance-optimized</p></td>
     <td><p>Capacity-optimized</p></td>
   </tr>
   <tr>
     <td><p>Scalar field raw data</p></td>
     <td><p>Disabled &amp; Changeable</p></td>
     <td><p>Enabled &amp; Changeable</p></td>
     <td><p>Enabled &amp; Unchangeable</p></td>
   </tr>
   <tr>
     <td><p>Scalar field index</p></td>
     <td><p>Disabled &amp; Changeable</p></td>
     <td><p>Enabled &amp; Changeable</p></td>
     <td><p>Enabled &amp; Unchangeable</p></td>
   </tr>
   <tr>
     <td><p>Vector field raw data</p></td>
     <td><p>Enabled &amp; Changeable</p></td>
     <td><p>Enabled &amp; Changeable</p></td>
     <td><p>Enabled &amp; Unchangeable</p></td>
   </tr>
   <tr>
     <td><p>Vector field index</p></td>
     <td><p>Disabled &amp; Unchangeable</p></td>
     <td><p>Disabled &amp; Unchangeable</p></td>
     <td><p>Enabled &amp; Unchangeable</p></td>
   </tr>
</table>

In dedicated clusters using the **Performance-optimized** CUs, Zilliz Cloud enables mmap only for the raw data in vector fields and loads the raw data in scalar fields and all field indexes into memory. You are advised to keep the global settings to ensure the performance of metadata filtering and retrieval during searches and queries. However, you can still enable mmap for those fields that are not involved in metadata filtering or used as output fields.

In dedicated clusters using the **Capacity-optimized** CUs, Zilliz Cloud disables mmap for the vector field indexes for the sake of auto-indexing and memory-maps the indexes of scalar fields and all field raw data, ensuring the maximum storage capacity. If the raw data of some fields used in metadata filtering conditions or listed in the output fields is too large and leaving them on the hard drive causes slow response or network jitters, you can consider disabling mmap for these fields to improve search performance. 

In **Free** and **Serverless** clusters, Zilliz Cloud enables mmap for the raw data and indexes of all fields to fully utilize the system cache, improve the performance of hot data, and reduce the cost of cold data.

## Collection-specific mmap settings{#collection-specific-mmap-settings}

You need to release a collection to make changes to the mmap settings and load it again to make the changes to the mmap settings take effect. You can configure mmap for a specific field, a field index, or a collection.

<Admonition type="info" icon="📘" title="Notes">

<p>Exercise with caution when changing mmap settings. Improper mmap settings may cause the following issues:</p>
<ul>
<li><p>For performance-optimized dedicated clusters, the raw data of all scalar fields and the vector indexes are loaded into memory by default to ensure fast retrieval of scalar fields during searches and queries. Changing the default mmap settings may cause performance degradation.</p></li>
<li><p>For capacity-optimized dedicated clusters, only the vector indexes are loaded into memory by default to ensure maximum storage capacity. Changing the default mmap settings may cause load failures due to out-of-memory (OOM) issues.</p></li>
</ul>

</Admonition>

### Configure mmap for specific fields{#configure-mmap-for-specific-fields}

If you are using a dedicated cluster with small performance-optimized CUs and the raw data of a field in your dataset is large, consider adding the field to a collection with mmap enabled.

The following example assumes connecting to a performance-optimized dedicated cluster and demonstrates how to enable mmap on a VarChar field named **doc_chunk** while adding the field.

```python
from pymilvus import MilvusClient

CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
TOKEN="YOUR_TOKEN"

client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN
)

schema = MilvusClient.create_schema()

# Disable mmap on a field upon creating the schema for a collection
schema.add_field(
    field_name="doc_chunk",
    datatype=DataType.INT64,
    max_length=512,
    # highlight-next-line
    mmap_enabled=False,
)

# Disable mmap on an existing field
# The following assumes that you have a collection named `my_collection`
client.alter_collection_field(
    collection="my_collection",
    field_name="doc_chunk",
    properties={"mmap.enable": True}
)
```

When loading the collection created using the above schema, Zilliz Cloud memory-maps the raw data of the **doc_chunk** field. Note that you need to release the collection to make changes to the mmap settings of a field and load the collection again after the change.

### Configure mmap for scalar indexes{#configure-mmap-for-scalar-indexes}

For scalar fields involved in metadata filtering or used as output fields, consider loading them into memory while keeping other scalar fields on the hard drive. 

The following example assumes connecting to a capacity-optimized dedicated cluster and demonstrates how to disable mmap on the index of a VarChar field named **title** for quick retrieval. 

```python
# Add a varchar field
schema.add_field(
    field_name="title",
    datatype=DataType.VARCHAR,
    max_length=512   
)

index_params = MilvusClient.prepare_index_params()

# Create index on the varchar field with mmap settings
index_params.add_index(
    field_name="title", 
    index_type="AUTOINDEX"
    # highlight-next-line
    params={ "mmap.enabled": "false" }
)

# Change mmap settings for an index
# The following assumes that you have a collection named `my_collection`
client.alter_index_properties(
    collection_name="my_collection",
    index_name="title",
    properties={"mmap.enabled": True}
)
```

When loading the collection created using the above index parameters, Zilliz Cloud loads the index of the **title** field into memory. Note that you need to release the collection to make changes to the mmap settings of a field and load the collection again after the change.

