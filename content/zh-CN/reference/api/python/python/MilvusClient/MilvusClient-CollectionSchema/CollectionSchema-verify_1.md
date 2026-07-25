---
displayed_sidbar: pythonSidebar
title: "verify() | Python | MilvusClient"
slug: /python/python/CollectionSchema-verify_1
sidebar_label: "verify()"
added_since: v2.3.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation performs final validation checks on the CollectionSchema to detect any obvious problems. | Python | MilvusClient"
type: docx
token: TfV3dOYPyoKVSMxShrTc9SZ2nqh
sidebar_position: 5
keywords: 
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
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

