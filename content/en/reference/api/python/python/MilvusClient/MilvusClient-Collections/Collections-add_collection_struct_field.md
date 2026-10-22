---
title: "add_collection_struct_field() | Python | MilvusClient"
slug: /python/python/Collections-add_collection_struct_field
sidebar_label: "add_collection_struct_field()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation adds a new nullable struct field to an existing collection. | Python | MilvusClient"
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

This operation adds a new nullable struct field to an existing collection.

<Admonition type="info" title="Note">

Adding a struct field to an existing collection requires nullable to be set to True, because existing entities do not have values for the new field.

</Admonition>

<Admonition type="info" title="Note">

Adding a struct field to an existing collection requires nullable to be set to True, because existing entities do not have values for the new field.

</Admonition>

## Request Syntax\{#request-syntax}

```python
client.add_collection_struct_field(
    collection_name: str,
    field_name: str,
    struct_schema: StructFieldSchema,
    max_capacity: int,
    desc: Optional[str] = None,
    timeout: Optional[float] = None
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of the collection.

- **field_name** (*str*) -

    **[REQUIRED]**

    The name of the new struct field.

- **struct_schema** (*[StructFieldSchema](StructFieldSchema/StructFieldSchema.md*) -

    **[REQUIRED]**

    An option that &ast;) - The schema of the struct field to add. Its name is overridden by field_name.

- **max_capacity** (*int*) -

    **[REQUIRED]**

    The maximum number of elements that the struct field can hold.

- **desc** (*Optional[str]*) -

    A short description of the field.

- **timeout** (*float | None*) -

    The timeout duration for this operation. Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None.

**EXCEPTIONS:**

- **ParamError**

    Raised when **struct_schema** is not a `StructFieldSchema` instance or when **nullable** is not set to **True**. Raised when **struct_schema** is not a `StructFieldSchema` instance or when **nullable** is not set to **True**.

- **MilvusException**

    This exception will be raised when any error occurs during this operation. This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import MilvusClient, DataType, StructFieldSchema

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# The target collection must exist first
client.create_collection(
    collection_name="my_collection",
    dimension=5,
)

# Build the struct field schema
struct_schema = StructFieldSchema(nullable=True)
struct_schema.add_field(
    "name",
    DataType.VARCHAR,
    max_length=64,
)
struct_schema.add_field("age", DataType.INT32)

client.add_collection_struct_field(
    collection_name="my_collection",
    field_name="profile",
    struct_schema=struct_schema,
    max_capacity=10,
)
```
