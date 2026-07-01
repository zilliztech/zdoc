---
title: "StructFieldSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-StructFieldSchema
sidebar_key: python/MilvusClient-StructFieldSchema
sidebar_label: "StructFieldSchema"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "A StructFieldSchema instance represents the schema of a struct element in an array of structs field. A schema sketches the structure of a struct element. | Python | MilvusClient"
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

---

import Admonition from '@theme/Admonition';


# StructFieldSchema

A StructFieldSchema instance represents the schema of a struct element in an array of structs field. A schema sketches the structure of a struct element.

```python
class pymilvus.StructFieldSchema
```

## Constructor\{#constructor}

Constructs the schema of a struct element in an array of structs field by defining fields, data types, and other parameters.

```python
CollectionSchema(
    fields: list,
    description: str
)
```

**PARAMETERS:**

- **name** (*str*) -

    **[REQUIRED]**

    The name of the schema. 

- **fields** (*list*) -

    **[REQUIRED]**

    A list of **[FieldSchema](./ORM-FieldSchema)** objects that define the fields in the schema of a struct in an array of structs field.

    <Admonition type="info" icon="📘" title="What is a field schema?">

    A field schema represents and contains metadata for a single field, while **StructFieldSchema** ties together a list of **[FieldSchema](./ORM-FieldSchema)** objects to define the schema of a struct in an array of structs field.

    </Admonition>

- **description** (*string*) -

    The description of the schema.

    If a description is not provided, it will be set to an empty string.

**RETURN TYPE:**

*StructFieldSchema*

**RETURNS:**

A **StructFieldSchema** object.

**EXCEPTIONS:**

- **FieldsTypeException**: 

    This exception will be raised when the **fields** parameter is not a list.

- **FieldTypeException**: 

    This exception will be raised when a field in the **fields** list is not a **[FieldSchema](./ORM-FieldSchema)** object.

```python
from pymilvus import StructFieldSchema, FieldSchema, DataType

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768
)

varchar = FieldSchema(
    name="varchar",
    dtype=DataType.VARCHAR,
    max_length=512
)

# Construct a schema with the predefined fields
schema = StructFieldSchema(
    name="struct_schema",
    fields=[vector, varchar],
    description="example_schema"
)
```

## Properties\{#properties}

- **fields** (*list*) -

    A list of **[FieldSchema](./ORM-FieldSchema)** objects that define the fields in the schema of a struct in an array of structs field.

- **description** (*string*) -

    The description of the schema.

    If a description is not provided, it will be an empty string.

## Methods\{#methods}

The following are the methods of the `StructFieldSchema` class:

