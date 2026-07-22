---
title: "StructFieldSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-StructFieldSchema
sidebar_label: "StructFieldSchema"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "Constructor behavior changed. New nullable property documented on the existing class page. | Python | MilvusClient"
type: docx
token: ZnKKd2PsyoRc1MxtC1BcJQjgnBh
sidebar_position: 3
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - StructFieldSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# StructFieldSchema

Constructor behavior changed. New nullable property documented on the existing class page.

## Request Syntax\{#request-syntax}

```python
StructFieldSchema(
    nullable: bool = False,
    description: str = "",
)
```

**PARAMETERS:**

- **nullable** (*bool*) -
Default: `False`
The flag that allows the struct field to contain null values.

- **description** (*str*) -
Default: `""`
The description of the struct field.

**RETURN TYPE:**

*StructFieldSchema*

**RETURNS:**

Struct field schema instance containing nested fields and nullable/default metadata.

**EXCEPTIONS:**

- **MilvusException**
Raised when the server rejects the request or the RPC fails. Inspect the server error message for exact failure details.

## Examples\{#examples}

Demonstrates StructFieldSchema usage.

```python
from pymilvus import CollectionSchema, DataType, FieldSchema, StructFieldSchema

chunk = StructFieldSchema(nullable=True, description="Optional chunk metadata")
chunk.add_field("source", DataType.VARCHAR, max_length=128)

schema = CollectionSchema(fields=[
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=3),
])
print(schema)
```
