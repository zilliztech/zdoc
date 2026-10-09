---
title: "array_append() | Python | MilvusClient"
slug: /python/python/FieldOp-array_append
sidebar_label: "array_append()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Creates an operation that appends incoming array elements to the existing field value during an upsert. | Python | MilvusClient"
type: docx
token: S7Otdiukfo0a4GxNUWpcQca3nSb
sidebar_position: 1
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - array_append()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# array_append()

Creates an operation that appends incoming array elements to the existing field value during an upsert.

## Request Syntax\{#request-syntax}

```python
FieldOp.array_append() -> FieldPartialUpdateOp
```

**RETURN TYPE:**

*FieldPartialUpdateOp*

**RETURNS:**

Operation message that selects ARRAY_APPEND behavior.

## Examples\{#examples}

Applies ARRAY_APPEND to the tags field.

```python
from pymilvus import FieldOp, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.upsert(
    collection_name="book_chunks",
    data=[
        {
            "id": 1,
            "vector": [0.1, 0.2, 0.3, 0.4],
            "tags": ["science"],
        }
    ],
    field_ops={"tags": FieldOp.array_append()},
)
```
