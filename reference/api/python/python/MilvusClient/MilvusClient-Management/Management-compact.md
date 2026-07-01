---
title: "compact() | Python | MilvusClient"
slug: /python/python/Management-compact
sidebar_key: python/Management-compact
sidebar_label: "compact()"
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
beta: false
notebook: false
description: "This operation starts a compaction job that merges small segments in a collection to improve storage layout and query efficiency. | Python | MilvusClient"
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

---

import Admonition from '@theme/Admonition';


# compact()

This operation starts a compaction job that merges small segments in a collection to improve storage layout and query efficiency.

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

    Name of the collection to compact.

- **is_clustering** (*bool*) -

    Whether to trigger clustering compaction.

- **is_l0** (*bool*) -

    Whether to trigger L0 compaction.

- **target_size** (*int*) -

    Optional target segment size after compaction. Must be a positive integer.

- **target_size_unit** (*str*) -

    Unit for `target_size`. Supported values are `"b"`, `"kb"`, `"mb"`, `"gb"`, `"tb"`, and `"pb"`.

- **timeout** (*float*) -

    Optional RPC timeout in seconds.

- **kwargs** (*dict*) -

    Optional request context parameters.

**RETURN TYPE:**

*int*

Compaction job ID for follow-up status queries.

**EXCEPTIONS:**

- **ParamError**

    Raised when `target_size` is not an integer or when `target_size_unit` is invalid.

- **MilvusException**

    Raised when the server rejects the request or the compaction RPC fails.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")
job_id = client.compact(
    collection_name="book_catalog",
    is_clustering=True,
    target_size=512,
    target_size_unit="mb",
)

print(job_id)
```
