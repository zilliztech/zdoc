---
title: "AggregationBucket | Python | MilvusClient"
slug: /python/python/Vector-AggregationBucket
sidebar_label: "AggregationBucket"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A Bucket instance is one aggregation bucket of a SearchAggregation result, carrying the grouping key, per-metric values, counts, hits, and nested sub-groups. | Python | MilvusClient"
type: docx
token: PK8NdNMMnonB66xrVDbcTYdZnah
sidebar_position: 11
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - AggregationBucket
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# AggregationBucket

A Bucket instance is one aggregation bucket of a SearchAggregation result, carrying the grouping key, per-metric values, counts, hits, and nested sub-groups.

**VALUES:**

- `key`

    The composite grouping key of this bucket. A list of dictionaries, where each dictionary carries the field_name, field_id, and value of one grouping field.

- `count`

    The total number of documents in the retrieval pool that fall into this bucket.

- `metrics`

    The metric values of this bucket, keyed by metric alias. Each value is an int, float, string, or boolean.

- `hits`

    The top-hits document snapshots of this bucket as [AggregationHit](./Vector-AggregationHit) objects. The list is empty when the aggregation level has no top_hits.

- `sub_groups`

    The child buckets of this bucket, nested recursively at the next aggregation level. The list is empty at the leaf level.

## Examples\{#examples}

```python
results = client.search(
    collection_name="docs",
    data=[[0.1, 0.2]],
    search_aggregation=agg,
)
for bucket in results[0][0]["aggregation"]["buckets"]:
    print(
        bucket["key"],
        bucket["count"],
    )
```
