---
title: "array_remove() | Python | MilvusClient"
slug: /python/python/FieldOp-array_remove
sidebar_label: "array_remove()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Creates an operation that removes matching array elements from the existing field value during an upsert. | Python | MilvusClient"
type: docx
token: Ki33dZaE6oZq0fxDSHcc9cKzn5d
sidebar_position: 2
keywords: 
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - array_remove()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# array_remove()

Creates an operation that removes matching array elements from the existing field value during an upsert.

## Request Syntax\{#request-syntax}

```python
FieldOp.array_remove() -> FieldPartialUpdateOp
```

**RETURN TYPE:**

*FieldPartialUpdateOp*

**RETURNS:**

Operation message that selects ARRAY_REMOVE behavior.

## Examples\{#examples}

Applies ARRAY_REMOVE to the tags field.

```python
from pymilvus import FieldOp, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.upsert(
    collection_name="book_chunks",
    data=[
        {
            "id": 1,
            "vector": [0.1, 0.2, 0.3, 0.4],
            "tags": ["obsolete"],
        }
    ],
    field_ops={"tags": FieldOp.array_remove()},
)
```
