---
title: "verify() | Python | ORM"
slug: /python/python/CollectionSchema-verify
sidebar_label: "verify()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation performs final validation checks on the CollectionSchema to detect any obvious problems. | Python | ORM"
type: docx
token: KSECdBDcUoIkL7xI4KOc29Ukn1g
sidebar_position: 5
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - verify()
  - pymilvus26
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# verify()

This operation performs final validation checks on the CollectionSchema to detect any obvious problems.

## Request Syntax\{#request-syntax}

```python
verify()
```

**PARAMETERS:**

None

**RETURN TYPE:**

None

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType  

# Create field schemas
primary_key = FieldSchema(
    name="id",
    dtype=DataType.INT64,
    is_primary=True,
)

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768,
)

# Create a CollectionSchema with field schemas

schema = CollectionSchema(
    fields = [primary_key, vector]
)

# Call verify() to validate the schema 
schema.verify()
```

