---
title: "compact() | Python | MilvusClient"
slug: /python/python/Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation starts a compaction job that merges small segments in a collection to improve storage layout and query efficiency. | Python | MilvusClient"
type: docx
token: CQawdFCJcodv5lx91kBck7rLnwh
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
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of the target collection.

- **is_clustering** (*bool*) -

    A flag that indicates whether to perform a clustering compaction. Defaults to False.

- **is_l0** (*bool*) -

    A flag that indicates whether to perform an L0 compaction, which specifically handles L0 segments by merging delete operations into existing data segments. Defaults to False.

- **target_size** (*int*) -

    An option that target segment size after compaction. Must be a positive integer. The unit is specified by target_size_unit (default MB). If not provided, the server uses its default target size.

- **target_size_unit** (*str*) -

    An option that unit for target_size. Supported values: "b", "kb", "mb" (default), "gb", "tb", "pb". The value is converted to MB before being sent to the server.

- **timeout** (*float*) -

    The timeout duration for this operation. Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

- **kwargs** (*dict*) -

    Optional request context parameters.

**RETURN TYPE:**

*int*

**RETURNS:**

Compaction job ID for follow-up status queries. A compaction job ID, which can be used to get the compaction status.

**EXCEPTIONS:**

- **ParamError**

    Raised when `target_size` is not an integer or when `target_size_unit` is invalid. Raised when `target_size` is not an integer or when `target_size_unit` is invalid.

- **MilvusException**

    This exception will be raised when any error occurs during this operation. This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)
job_id = client.compact(
    collection_name="book_catalog",
    is_clustering=True,
    target_size=512,
    target_size_unit="mb",
)

print(job_id)
```
