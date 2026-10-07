---
title: "get_replicate_info() | Python | MilvusClient"
slug: /python/python/Management-get_replicate_info
sidebar_label: "get_replicate_info()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets the replication checkpoint state for a source cluster and source pchannel. | Python | MilvusClient"
type: docx
token: C5UqdwH46o2mt1xleeRcx51knJA
sidebar_position: 22
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - get_replicate_info()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_replicate_info()

This operation gets the replication checkpoint state for a source cluster and source pchannel.

## Request Syntax\{#request-syntax}

```python
get_replicate_info(
    source_cluster_id: str,
    target_pchannel: str,
    timeout: Optional[float] = None,
    **kwargs
)
```

**PARAMETERS:**

- **source_cluster_id** (*str*) -

    **[REQUIRED]**

    The ID of the source cluster.

- **target_pchannel** (*str*) -

    **[REQUIRED]**

    The name of the physical channel in the source cluster.

- **timeout** (*Optional[float]*) -

    The maximum time, in seconds, to wait for the RPC to complete.

- **kwargs** (*Any*) -

    Additional request context options.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
info = client.get_replicate_info(
    source_cluster_id="source-1",
    target_pchannel="by-dev-rootcoord-dml_0",
)
```
