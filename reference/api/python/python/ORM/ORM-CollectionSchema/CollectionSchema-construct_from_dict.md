---
title: "construct_from_dict() | Python | ORM"
slug: /python/python/CollectionSchema-construct_from_dict
sidebar_label: "construct_from_dict()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation constructs a CollectionSchema object from a dictionary representation. | Python | ORM"
type: docx
token: DYuUdc503o1TANxuGozcXhCmnRN
sidebar_position: 3
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - construct_from_dict()
  - pymilvus26
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# construct_from_dict()

This operation constructs a **CollectionSchema** object from a dictionary representation.

## Request Syntax\{#request-syntax}

```python
construct_from_dict(
    raw: dict
)
```

**PARAMETERS:**

- **raw** (*dict*)

    A dictionary containing the raw data to construct the collection schema.

**RETURN TYPE:**

*CollectionSchema*

**RETURNS:**

A **CollectionSchema** object.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import DataType, FieldSchema, CollectionSchema

# Define fields and create a schema
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

# Create dictionary representation 
schema_dict = {
    "fields": [     
        primary_key.to_dict(),
        vector.to_dict()                
    ]
}  

# Reconstruct schema from dictionary 
schema = CollectionSchema.construct_from_dict(schema_dict)  
# schema is now a CollectionSchema instance reconstructed from the dictionary 
print(schema)

# Output
# {'auto_id': False, 'description': '', 'fields': [{'name': 'id', 'description': '', 'type': <DataType.INT64: 5>, 'is_primary': True, 'auto_id': False}, {'name': 'vector', 'description': '', 'type': <DataType.FLOAT_VECTOR: 101>, 'params': {'dim': 768}}]}
```

