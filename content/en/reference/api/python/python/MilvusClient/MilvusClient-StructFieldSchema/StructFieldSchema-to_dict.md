---
title: "to_dict() | Python | MilvusClient"
slug: /python/python/StructFieldSchema-to_dict
sidebar_label: "to_dict()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation converts a StructFieldSchema object to a dictionary representation. | Python | MilvusClient"
type: docx
token: Mq7idUip3ofMQmxj55XcB98nn0b
sidebar_position: 4
keywords: 
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
  - zilliz
  - zilliz cloud
  - cloud
  - to_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# to_dict()

This operation converts a **[StructFieldSchema](./MilvusClient-StructFieldSchema)** object to a dictionary representation.

## Request Syntax\{#request-syntax}

```python
to_dict()
```

**PARAMETERS:**

None

**RETURN TYPE:**

*dict*

**RETURNS:**

The dictionary representation of the collection schema.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import StructFieldSchema, FieldSchema, DataType  

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768,
)

varchar = FieldSchema(
    name="varchar",
    dtype=DataType.VARCHAR,
    max_length=512
)

# Create a StructFieldSchema with field schemas

schema = StructFieldSchema(
    name="struct_schema",
    fields = [vector, varchar]
)

# Call to_dict() to get a dictionary representation of the schema 

schema_dict = schema.to_dict()  
```
