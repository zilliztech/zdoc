---
title: "add_collection_struct_field() | Python | MilvusClient"
slug: /python/python/Collections-add_collection_struct_field
sidebar_label: "add_collection_struct_field()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds a struct (array-of-structs) field to an existing collection, declaring its element fields and maximum capacity. | Python | MilvusClient"
type: docx
token: M97RdhP3Co4QadxrDFGcpV8EnYe
sidebar_position: 26
keywords: 
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index
  - zilliz
  - zilliz cloud
  - cloud
  - add_collection_struct_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_collection_struct_field()

This operation adds a struct (array-of-structs) field to an existing collection, declaring its element fields and maximum capacity.

## Request Syntax\{#request-syntax}

```python
add_collection_struct_field(
    collection_name: str,
    field_name: str,
    struct_schema: StructFieldSchema,
    max_capacity: int,
    desc: Optional[str] = None,
    timeout: Optional[float] = None,
    **kwargs
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection.

- **field_name** (*str*) -

    The name of the struct field to add.

- **struct_schema** ([StructFieldSchema](./MilvusClient-StructFieldSchema)) -

    The schema of the struct field, defining its element fields.

- **max_capacity** (*int*) -

    The maximum number of struct elements per entity.

- **desc** (*str | None*) -

    Default: `None`

    A description of the struct field.

- **timeout** (*float | None*) -

    Default: `None`

    The timeout in seconds for this operation.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
struct = client.create_struct_field_schema(
    fields=[...],
)
client.add_collection_struct_field(
    collection_name="docs",
    field_name="authors",
    struct_schema=struct,
    max_capacity=10,
)
```
