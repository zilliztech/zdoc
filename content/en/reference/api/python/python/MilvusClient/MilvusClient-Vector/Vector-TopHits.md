---
title: "TopHits | Python | MilvusClient"
slug: /python/python/Vector-TopHits
sidebar_label: "TopHits"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "A `TopHits` instance configures the representative entities returned from each `SearchAggregation` bucket. | Python | MilvusClient"
type: docx
token: PszSdqvtRo4t96xrW0ycWlVAnfc
sidebar_position: 14
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - TopHits
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# TopHits

A `TopHits` instance configures the representative entities returned from each `SearchAggregation` bucket.

```python
class pymilvus.TopHits
```

## Constructor\{#constructor}

```python
TopHits(
    size: int,
    sort: list[dict[str, str]] | None = None,
)
```

**PARAMETERS:**

- **size** (*int*) **[REQUIRED]** -

    The maximum number of representative entities returned from each bucket. The value must be a positive integer.

- **sort** (*list[dict[str, str]] | None*) -

    Hit ordering rules evaluated in list order. Each item is a single-key dictionary mapping a scalar field name or `_score` to `"asc"` or `"desc"`. If omitted, the server uses its default hit order.

**RETURN TYPE:**

*TopHits*

**EXCEPTIONS:**

- **ParamError** - Raised when `size` is not a positive integer or `sort` is not a list of single-key dictionaries with valid directions.

## Example\{#example}

```python
from pymilvus import SearchAggregation, TopHits

aggregation = SearchAggregation(
    fields=["brand"],
    size=10,
    top_hits=TopHits(
        size=3,
        sort=[{"rating": "desc"}, {"_score": "desc"}],
    ),
)
```
