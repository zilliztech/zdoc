---
title: "TopHits | Python | MilvusClient"
slug: /python/python/Vector-TopHits
sidebar_label: "TopHits"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A TopHits instance configures the representative entities returned from each SearchAggregation bucket. | Python | MilvusClient"
type: docx
token: PszSdqvtRo4t96xrW0ycWlVAnfc
sidebar_position: 15
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

A TopHits instance configures the representative entities returned from each SearchAggregation bucket.

## Request Syntax\{#request-syntax}

```python
__init__(
    size: int,
    sort: Optional[List[Dict[str, str]]] = None
)
```

**PARAMETERS:**

- **size** (*int*) -

    **[REQUIRED]**

    The maximum number of representative entities returned from each bucket. The value must be a positive integer.

- **sort** (*list[dict[str, str]] | None*) -

    The hit ordering rules, evaluated in list order. Each item is a single-key dictionary mapping a field name or _score to "asc" or "desc".

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import TopHits

top = TopHits(
    size=3,
    sort=[{"_score": "desc"}],
)
```
