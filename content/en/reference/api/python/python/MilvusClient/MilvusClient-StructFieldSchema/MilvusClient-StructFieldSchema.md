---
title: "StructFieldSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-StructFieldSchema
sidebar_label: "StructFieldSchema"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A StructFieldSchema instance defines a struct (array-of-structs) field. | Python | MilvusClient"
type: docx
token: R4vxd8dReoaZ85xZ23qctjfLnDh
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

A StructFieldSchema instance defines a struct (array-of-structs) field.

## Request Syntax\{#request-syntax}

```python
__init__(
    nullable: bool = False,
    description: str = ""
)
```

**PARAMETERS:**

- **nullable** (*bool*) -

    The flag that allows the struct field to contain null values.

- **description** (*str*) -

    The description of the struct field.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import StructFieldSchema, FieldSchema, DataType

author = StructFieldSchema(
    fields=[
        FieldSchema(
            name="name",
            dtype=DataType.VARCHAR,
            max_length=256,
        ),
    ],
)
author.nullable = True
```
