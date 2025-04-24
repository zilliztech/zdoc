---
displayed_sidbar: pythonSidebar
title: "CollectionSchema | Python | ORM"
slug: /python/python/ORM-CollectionSchema
sidebar_label: "CollectionSchema"
beta: NEAR DEPRECATE
notebook: false
description: "A CollectionSchema instance represents the schema of a collection. A schema sketches the structure of a collection. | Python | ORM"
type: docx
token: CmFKd9eG2oE6xmx9dIGcVPycnth
sidebar_position: 2
keywords: 
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - CollectionSchema
  - pymilvus25
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# CollectionSchema

A **CollectionSchema** instance represents the schema of a collection. A schema sketches the structure of a collection.

```python
class pymilvus.CollectionSchema
```

## Constructor{#constructor}

Constructs the schema of a collection by defining fields, data types, and other parameters.

```python
CollectionSchema(
    fields: list,
    description: str
)
```

**PARAMETERS:**

- **fields** (*list*) -

    **[REQUIRED]**

    A list of **FieldSchema** objects that define the fields in the collection schema.

    <Admonition type="info" icon="📘" title="What is a field schema?">

    <p>A field schema represents and contains metadata for a single field, while <strong>CollectionSchema</strong> ties together a list of FieldSchema objects to define the full schema.</p>

    </Admonition>

- **description** (*string*) -

    The description of the schema.

    If a description is not provided, it will be set to an empty string.

- **kwargs** -

    - **auto_id** (*bool*)

        Whether allows the primary field to automatically increment.

        Setting this to **True** makes the primary field automatically increment. In this case, the primary field should not be included in the data to insert to avoid errors.

    - **enable_dynamic_field** (*bool*)

        Whether allows Zilliz Cloud saves the values of undefined fields in a dynamic field if the data being inserted into the target collection includes fields that are not defined in the collection's schema.

        When you set this to **True**,  and Zilliz Cloud will create a field called **$meta** to store any undefined fields and their values from the data that is inserted.

        <Admonition type="info" icon="📘" title="What is a dynamic field?">

        <p>If the data being inserted into the target collection includes fields that are not defined in the collection's schema, those fields will be saved in a dynamic field as key-value pairs.</p>

        </Admonition>

    - **primary_field** (*str*)

        The name of the primary field.

        The value should be the name of a field listed in **fields**.

        As an alternative, you can set **is_primary** when creating a **FieldSchema** object.

    - **partition_key_field** (*str*)

        The name of the field that serves as the partition key.

        The value should be the name of a field listed in **fields**.

        Setting this makes Zilliz Cloud manage all partitions in the current collection.

        As an alternative, you can set **is_partition_key** when creating a **FieldSchema** object.

        <Admonition type="info" icon="📘" title="What is a partition key?">

        <p>Once a field is designated as the partition key, Zilliz Cloud automatically creates a partition for each unique value in this field and saves entities in these partitions accordingly.</p>
        <p>This is particularly useful when implementing data separation based on a specific key, such as partition-oriented multi-tenancy.</p>
        <p>As an alternative, you can set <strong>partition<em>key</em>field</strong> when creating a <strong>CollectionSchema</strong> object.</p>

        </Admonition>

**RETURN TYPE:**

*CollectionSchema*

**RETURNS:**

A **CollectionSchema** object.

**EXCEPTIONS:**

- **FieldsTypeException**: 

    This exception will be raised when the **fields** parameter is not a list.

- **FieldTypeException**: 

    This exception will be raised when a field in the **fields** list is not a **FieldSchema** object.

- **PrimaryKeyException:**

    This exception will be raised if

    - The **primary_field** parameter has been set but the value is not a string.

    - The **primary_field** parameter has been set but the value is not the name of any listed fields.

- **PartitionKeyException:**

    This exception will be raised if 

    - The **partition_key_field** parameter has been set but the value is not a string.

    - The **partition_key_field** parameter has been set but the value is not the name of any listed fields.

- **AutoIDException:**

    - This exception will be raised if the **auto_id** parameter has been set but the value is not a boolean.

## Examples{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType

# Define fields in a schema
primary_key = FieldSchema(
    name="id",
    dtype=DataType.INT64,
    is_primary=True,
)

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768
)

# Construct a schema with the predefined fields
schema = CollectionSchema(
    fields=[primary_key, vector],
    description="example_schema"
)
```

## Methods{#methods}

The following are the methods of the `CollectionSchema` class:

