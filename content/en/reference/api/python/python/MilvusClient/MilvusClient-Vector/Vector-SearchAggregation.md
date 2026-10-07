---
title: "SearchAggregation | Python | MilvusClient"
slug: /python/python/Vector-SearchAggregation
sidebar_label: "SearchAggregation"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A SearchAggregation instance defines one level of bucket aggregation for a vector search. | Python | MilvusClient"
type: docx
token: Ccr8dU36Lo7Wz9xhDozcrtGenAd
sidebar_position: 14
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - SearchAggregation
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# SearchAggregation

A SearchAggregation instance defines one level of bucket aggregation for a vector search.

## Request Syntax\{#request-syntax}

```python
__init__(
    fields: List[str],
    size: int,
    metrics: Optional[Dict[str, Dict[str, str]]] = None,
    order: Optional[List[Dict[str, str]]] = None,
    top_hits: Optional[TopHits] = None,
    sub_aggregation: Optional[SearchAggregation] = None
)
```

**PARAMETERS:**

- **fields** (*list[str]*) -

    **[REQUIRED]**

    A non-empty list of scalar field names that form the bucket key. Multiple fields form a composite key in list order. JSON paths such as `meta["region"]` are not accepted.

- **size** (*int*) -

    **[REQUIRED]**

    The maximum number of buckets returned at this aggregation level. The value must be a positive integer.

- **metrics** (*dict[str, dict[str, str]] | None*) -

    The per-bucket metric definitions. Each key is a metric alias and each value is a single-key dictionary in the form \{operation: field}. Supported operations are count, sum, avg, min, and max.

- **order** (*list[dict[str, str]] | None*) -

    The bucket ordering rules, evaluated in list order. Each item must contain one metric alias, _count, or _key, mapped to "asc" or "desc".

- **top_hits** (*TopHits | None*) -

    Configures representative entities returned from each bucket.

- **sub_aggregation** (*SearchAggregation | None*) -

    The nested bucket level under each bucket at the current level.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import MilvusClient, SearchAggregation, TopHits

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
agg = SearchAggregation(
    fields=["category"],
    size=10,
    top_hits=TopHits(size=3),
)
results = client.search(
    collection_name="docs",
    data=[[0.1, 0.2]],
    limit=100,
    search_aggregation=agg,
)
```
