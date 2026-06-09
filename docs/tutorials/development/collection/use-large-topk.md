---
title: "Use Large TopK | Cloud"
slug: /use-large-topk
sidebar_label: "Large TopK"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A Zilliz Cloud collection allows you to retrieve up to 16,384 entities in a search or query result. To retrieve more entities beyond the topK limit, you can set the query mode to allow Zilliz Cloud to include millions of entities in a single search or query result, instead of using complex and time-consuming iterators. | Cloud"
type: origin
token: RH6MwFlaCig6LRkR6Qec206OnUc
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Use Large TopK

A Zilliz Cloud collection allows you to retrieve up to 16,384 entities in a search or query result. To retrieve more entities beyond the topK limit, you can set the query mode to allow Zilliz Cloud to include millions of entities in a single search or query result, instead of using complex and time-consuming iterators.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available for Zilliz Cloud clusters that are compatible with Milvus v2.6.x. If you would like to try this feature, please <a href="https://support.zilliz.com/hc/en-us">get in touch with us</a>.</p>

</Admonition>

## Overview\{#overview}

By default, a Zilliz Cloud collection supports a maximum topK of **16,384** in search or query operations. When you need to retrieve more entities in a single request, such as batch similarity search or data mining scenarios, you can enable the **Large TopK** mode by setting the `query_mode` property to `large_topk` on your collection. This raises the topK limit to **1,000,000** (one million) entities.

Enabling Large TopK changes the underlying index strategy from the default Auto Index to **IVF (Inverted File Index)** with **RaBitQ** deep compression, which is optimized for high-recall, large-range retrieval at the cost of small-K query performance.

## When to use Large TopK\{#when-to-use-large-topk}

Large TopK is designed for scenarios where you need to retrieve a very large number of similar entities in a single search, such as:

- **Batch similarity search**: Find the top 100,000 or 1,000,000 most similar items for a given query vector.

- **Data mining and analysis**: Extract large candidate sets for downstream processing, filtering, or model training.

- **Regression testing preparation**: Retrieve large result sets to build test corpora for simulation teams.

For interactive, latency-sensitive online queries with small topK (e.g., top 10 or top 100), the default query mode is recommended.

## Prerequisites and trade-offs\{#prerequisites-and-trade-offs}

Before enabling Large TopK, be aware of the following trade-offs:

- **Small-K performance degradation**: After switching to `large_topk`, small-K queries (K < 16,384) will experience increased latency and reduced recall compared to the default mode.

- **Query latency**: Large TopK queries have significantly higher latency than standard queries. A topK of 100,000 may take several seconds, and a topK of 1,000,000 may take minutes.

- **Resource usage**: A single large TopK query can consume several gigabytes of memory for result sorting. On Perf clusters, this may affect other queries running on the same cluster.

- **Offline preference**: For batch workloads, consider using an On-demand Compute database. Databases use on-demand CUs and do not affect online services.

- **Index rebuild required**: If your collection already has a vector index, you must release and drop the existing index before enabling Large TopK. Search will be unavailable during the rebuild.

## Enable Large TopK\{#enable-large-topk}

### During collection creation (recommended)\{#during-collection-creation-recommended}

If you know your collection will require Large TopK, specify it at creation time to avoid the cost of switching later:

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="your_uri", token="your_token")

client.create_collection(
    collection_name="scenarios_corpus",
    schema=schema,
    index_params=index_params,
    properties={"query_mode": "large_topk"}
)

```

### On an existing collection\{#on-an-existing-collection}

For an existing collection without a vector index, you can enable Large TopK directly:

```python
client.alter_collection_properties(
    collection_name="scenarios_corpus",
    properties={"query_mode": "large_topk"}
)

```

For an existing collection **with** a vector index, you must first drop the index, then enable the mode, and finally recreate the index:

```python
# 1. Release and drop the existing index
client.release_collection(collection_name="scenarios_corpus")
client.drop_index(collection_name="scenarios_corpus", index_name="vector_idx")

# 2. Enable Large TopK
client.alter_collection_properties(
    collection_name="scenarios_corpus",
    properties={"query_mode": "large_topk"}
)

# 3. Recreate the index (will use IVF + RaBitQ automatically)
client.create_index(
    collection_name="scenarios_corpus",
    index_params=index_params
)
client.load_collection(collection_name="scenarios_corpus")

```

### Check current query mode\{#check-current-query-mode}

```python
info = client.describe_collection(collection_name="scenarios_corpus")
query_mode = info["properties"].get("query_mode")  # None means default mode

```

### Disable Large TopK\{#disable-large-topk}

To return to the default query mode, drop the `query_mode` property. Note that this also requires releasing and dropping the existing index first:

```python
client.drop_collection_properties(
    collection_name="scenarios_corpus",
    property_keys=["query_mode"]
)

```

## Perform a Large TopK search\{#perform-a-large-topk-search}

Once Large TopK is enabled, use the standard `search` method with a large `limit` value:

### Online search (Serving Cluster)\{#online-search-serving-cluster}

```python
results = client.search(
    collection_name="scenarios_serving",
    data=[query_vector],
    limit=500000
)

```

### Offline search (On-demand Compute)\{#offline-search-on-demand-compute}

```python
results = client.search(
    collection_name="scenarios_corpus",
    data=[query_vector],
    limit=500000
)

```

## Export search results\{#export-search-results}

There is no dedicated export API for Large TopK results. You can compose existing capabilities to write results to a Managed Volume:

```python
import pyarrow as pa
import pyarrow.parquet as pq

writer = None
try:
    for i, qvec in enumerate(query_vectors):
        results = client.search(
            collection_name="corpus",
            data=[qvec],
            limit=100000,
            output_fields=["scenario_id", "title"]
        )

        table = pa.Table.from_pylist([
            {"query_id": i, "rank": j, **r}
            for j, r in enumerate(results)
        ])

        if writer is None:
            writer = pq.ParquetWriter("/tmp/results.parquet", table.schema)
        writer.write_table(table)
finally:
    if writer is not None:
        writer.close()

volume_file_manager.upload_file_to_volume(
    source_file_path="/tmp/results.parquet",
    target_volume_path="results/batch.parquet"
)

```

## Performance expectations\{#performance-expectations}

The following table summarizes the performance characteristics of Large TopK queries:

<table>
   <tr>
     <th><p>Metric</p></th>
     <th><p>Default mode</p></th>
     <th><p>Large TopK mode</p></th>
   </tr>
   <tr>
     <td><p>TopK limit</p></td>
     <td><p>16,384</p></td>
     <td><p>1,000,000</p></td>
   </tr>
   <tr>
     <td><p>Small-K latency</p></td>
     <td><p>Milliseconds</p></td>
     <td><p>Higher (degraded)</p></td>
   </tr>
   <tr>
     <td><p>Large-K latency</p></td>
     <td><p>Not supported</p></td>
     <td><p>Seconds to minutes</p></td>
   </tr>
   <tr>
     <td><p>Memory per query</p></td>
     <td><p>Low</p></td>
     <td><p>Up to several GB</p></td>
   </tr>
   <tr>
     <td><p>Concurrency</p></td>
     <td><p>High</p></td>
     <td><p>Limited (queued)</p></td>
   </tr>
   <tr>
     <td><p>Best for</p></td>
     <td><p>Online interaction</p></td>
     <td><p>Batch, data mining</p></td>
   </tr>
</table>

Zilliz Cloud applies concurrency control to Large TopK queries to prevent resource exhaustion. Requests that exceed the concurrency limit are queued and processed when resources become available.

## Limitations\{#limitations}

- Switching query modes requires rebuilding the vector index. During the rebuild, search is unavailable for the collection.

- Large TopK is a collection-level setting. All indexes on the collection are affected.

- Three cluster types (Performance-optimized, Capacity-optimized, and Tiered Storage) all support Large TopK.

## FAQ\{#faq}

**Q: Can I switch back and forth frequently?**

Technically, yes, but it is not recommended. Each switch requires releasing, dropping, and recreating the index, during which search is unavailable. In an on-demand cluster, each rebuild also incurs Index Build CU charges.