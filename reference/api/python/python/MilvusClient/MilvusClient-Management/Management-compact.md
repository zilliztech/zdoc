---
title: "compact() | Python | MilvusClient"
slug: /python/python/Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Adds targetsize/targetsizeunit and positive-size validation. Async variant shares the sync method contract. | Python | MilvusClient"
type: docx
token: ZANCdUPeBoCis1xylRUcR90Pndb
sidebar_position: 2
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - compact()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# compact()

Adds target_size/target_size_unit and positive-size validation. Async variant shares the sync method contract.

## Request Syntax\{#request-syntax}

```python
compact(
    collection_name: str,
    is_clustering: Optional[bool] = False,
    is_l0: Optional[bool] = False,
    target_size: Optional[int] = None,
    target_size_unit: str = "mb",
    timeout: Optional[float] = None,
    **kwargs,
) -> int
```

**PARAMETERS:**

- **collection_name** (*str*) -
**[REQUIRED]**
The name of the collection to compact.

- **is_clustering** (*Optional[bool]*) -
Default: `False`
The flag that requests a clustering compaction.

- **is_l0** (*Optional[bool]*) -
Default: `False`
The flag that requests a level-zero compaction.

- **target_size** (*Optional[int]*) -
Default: `None`
The desired segment size after compaction. The value must be a positive integer; the server default is used when omitted.

- **target_size_unit** (*str*) -
Default: `"mb"`
The unit for `target_size`. Supported values are `b`, `kb`, `mb`, `gb`, `tb`, and `pb`; the default is `mb`.

- **timeout** (*Optional[float]*) -
Default: `None`
The maximum time, in seconds, to wait for the RPC. When omitted, the client waits until the server responds or an error occurs.

- **kwargs** (*Any*) -
The additional request context options.

**RETURN TYPE:**

*int*

**RETURNS:**

Compaction job identifier returned by Milvus.

**EXCEPTIONS:**

- **MilvusException**
Raised when the server rejects the request or the RPC fails. Inspect the server error message for exact failure details.

## Examples\{#examples}

Demonstrates compact usage.

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
job_id = client.compact(collection_name="book_chunks", target_size=512, target_size_unit="mb")
print(job_id)
```
