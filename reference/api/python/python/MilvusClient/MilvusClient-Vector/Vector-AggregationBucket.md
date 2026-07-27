---
title: "AggregationBucket | Python | MilvusClient"
slug: /python/python/Vector-AggregationBucket
sidebar_label: "AggregationBucket"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`AggregationBucket` represents one bucket returned by Search Aggregation. PyMilvus creates these objects from the server response; applications do not construct them directly. | Python | MilvusClient"
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

`AggregationBucket` represents one bucket returned by Search Aggregation. PyMilvus creates these objects from the server response; applications do not construct them directly.

```python
class pymilvus.AggregationBucket
```

## Properties\{#properties}

- **key** (*list[dict[str, Any]]*) -

    The bucket key components. Each item contains `field_name`, `field_id`, and `value`.

- **count** (*int*) -

    The number of ANN-retrieved entities assigned to the bucket.

- **metrics** (*dict[str, Any]*) -

    Metric values keyed by the aliases defined in `SearchAggregation.metrics`.

- **hits** (*list[AggregationHit]*) -

    Representative entities selected by `TopHits`. The list is empty when `top_hits` is not configured at this level.

- **sub_groups** (*list[AggregationBucket]*) -

    Nested buckets produced by `sub_aggregation`. The list is empty at a leaf level.

The collection-valued properties return copies, so changing a returned list or dictionary does not mutate the bucket object.

## Example\{#example}

```python
result = client.search(
    collection_name="products",
    data=[query_vector],
    anns_field="embedding",
    search_aggregation=aggregation,
)

for bucket in result.agg_buckets[0]:
    print(bucket.key, bucket.count, bucket.metrics)
    for hit in bucket.hits:
        print(hit.pk, hit.score, hit.fields)
```
