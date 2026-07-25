---
displayed_sidbar: pythonSidebar
title: "verify() | Python | ORM"
slug: /python/python/CollectionSchema-verify
sidebar_label: "verify()"
added_since: Inherit
last_modified: false
deprecate_since: false
beta: NEAR DEPRECATE
notebook: false
description: "This operation performs final validation checks on the CollectionSchema to detect any obvious problems. | Python | ORM"
type: docx
token: KSECdBDcUoIkL7xI4KOc29Ukn1g
sidebar_position: 5
keywords: 
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - verify()
  - pymilvus26
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# verify()

This operation performs final validation checks on the CollectionSchema to detect any obvious problems.

## Request Syntax

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

## Examples

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

