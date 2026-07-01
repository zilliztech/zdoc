---
title: "construct_from_dict() | Python | MilvusClient"
slug: /python/python/StructFieldSchema-construct_from_dict
sidebar_key: python/StructFieldSchema-construct_from_dict
sidebar_label: "construct_from_dict()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation constructs a StructFieldSchema object from a dictionary representation. | Python | MilvusClient"
type: docx
token: KeoHdMDBCo3PByxKbWncifFMn9e
sidebar_position: 2
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - construct_from_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# construct_from_dict()

This operation constructs a **[StructFieldSchema](./MilvusClient-StructFieldSchema)** object from a dictionary representation.

## Request Syntax\{#request-syntax}

```python
construct_from_dict(
    raw: dict
)
```

**PARAMETERS:**

- **raw** (*dict*)

    A dictionary containing the raw data to construct the schema of a struct element in an array of structs field

**RETURN TYPE:**

*[StructFieldSchema](./MilvusClient-StructFieldSchema)*

**RETURNS:**

A **[StructFieldSchema](./MilvusClient-StructFieldSchema)** object.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import DataType, FieldSchema, StructFieldSchema

vector = FieldSchema(
    name="vector_02",
    dtype=DataType.FLOAT_VECTOR,
    dim=768,
)

varchar = FieldSchema(
    name="varchar_02",
    dtype=DataType.VARCHAR,
    max_length=512
)

# Create dictionary representation 
schema_dict = {
    "fields": [     
        vector.to_dict(),
        varchar.to_dict()                
    ]
}  

# Reconstruct schema from dictionary 
schema = StructFieldSchema(name="struct_schema", fields=[vector]).construct_from_dict(schema_dict)  

print(schema)

# Output
# {'auto_id': False, 'description': '', 'fields': [{'name': 'id', 'description': '', 'type': <DataType.INT64: 5>, 'is_primary': True, 'auto_id': False}, {'name': 'vector', 'description': '', 'type': <DataType.FLOAT_VECTOR: 101>, 'params': {'dim': 768}}]}
```
