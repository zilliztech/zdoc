---
title: "get_compaction_plans() | Python | MilvusClient"
slug: /python/python/Management-get_compaction_plans
sidebar_label: "get_compaction_plans()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation returns the compaction plans for a specific compaction job, including the merge plans showing which segments will be combined. | Python | MilvusClient"
type: docx
token: XnCrdUF2MoACxExami4c5B5Hnph
sidebar_position: 18
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - get_compaction_plans()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_compaction_plans()

This operation returns the compaction plans for a specific compaction job, including the merge plans showing which segments will be combined.

## Request Syntax\{#request-syntax}

```python
__init__(
    compaction_id: int,
    state: int,
    collection_name: str = ""
) -> None
```

**PARAMETERS:**

- **job_id** (*int*) -

    **[REQUIRED]**

    The ID of the compaction job returned by `compact()`.

- **timeout** (*float | None*) -

    The timeout duration for this operation. Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
plans = client.get_compaction_plans(compaction_id="449019091")
print(
    plans.collection_name,
    plans.state,
)
for plan in plans.plans:
    print(
        plan.plan_id,
        plan.trigger_id,
    )
```
