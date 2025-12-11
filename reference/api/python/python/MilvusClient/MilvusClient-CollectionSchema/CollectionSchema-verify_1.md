---
title: "verify() | Python | MilvusClient"
slug: /python/python/CollectionSchema-verify_1
sidebar_label: "verify()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation performs final validation checks on the CollectionSchema to detect any obvious problems. | Python | MilvusClient"
type: docx
token: TfV3dOYPyoKVSMxShrTc9SZ2nqh
sidebar_position: 5
keywords: 
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - verify()
  - pymilvus26
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
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

