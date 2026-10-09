---
title: "FieldOp | Python | MilvusClient"
slug: /python/python/Vector-FieldOp
sidebar_label: "FieldOp"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Factory class for field-level partial-update operations. | Python | MilvusClient"
type: docx
token: LKTzdLal1oEAJYxzEWJcfgkgnhb
sidebar_position: 3
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - FieldOp
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FieldOp

Factory class for field-level partial-update operations.

**RETURN TYPE:**

*FieldOp*

**RETURNS:**

Factory class whose static methods create field partial-update operation messages.

**EXCEPTIONS:**

- **MilvusException**<br/>
  Raised when the server rejects the request or the RPC fails. Inspect the server error message for exact failure details.

## Examples\{#examples}

Uses FieldOp.array_append() to append values instead of replacing the existing array.

```python
from pymilvus import FieldOp, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.upsert(
    collection_name="book_chunks",
    data=[{"id": 1, "vector": [0.1, 0.2, 0.3], "tags": ["science"]}],
    field_ops={"tags": FieldOp.array_append()},
)
```
