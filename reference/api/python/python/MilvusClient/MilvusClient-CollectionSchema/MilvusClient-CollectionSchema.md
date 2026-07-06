---
title: "CollectionSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A CollectionSchema instance represents the schema of a collection. A schema sketches the structure of a collection. | Python | MilvusClient"
type: docx
token: SSiodq10FoH26hx2HlccfcAgnje
sidebar_position: 2
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
  - zilliz
  - zilliz cloud
  - cloud
  - CollectionSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# CollectionSchema

A **CollectionSchema** instance represents the schema of a collection. A schema sketches the structure of a collection.

```python
class pymilvus.CollectionSchema
```

## Constructor\{#constructor}

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

    A list of **[FieldSchema](./ORM-FieldSchema)** objects that define the fields in the collection schema.

    <Admonition type="info" icon="📘" title="Note">

    What is a field schema?
    
        A field schema represents and contains metadata for a single field, while **CollectionSchema** ties together a list of FieldSchema objects to define the full schema.

    </Admonition>

- **description** (*string*) -

    The description of the schema.

    If a description is not provided, it will be set to an empty string.

- **external_source** (*str*) -

    The external source URI, which should be a `volume://` URI that points to an accessible external volume. For example, `volume://<volume-name>/path/to/folder/`..

- **external_spec** (*str*) -

    The external source specifications, which are a set of secondary parameters:

    - **format** (*str*) - 

        The format of the target source data files.

        Possible values are `parquet`, `vortex`, `lance-table`, and `iceberg-table`.

    - **snapshot_id** (*str*) -

        The ID of an Iceberg table. This applies only when `format` is `iceberg-table`.

- **kwargs** -

    - **auto_id** (*bool*) -

        Whether allows the primary field to automatically increment.

        Setting this to **True** makes the primary field automatically increment. In this case, the primary field should not be included in the data to insert to avoid errors.

        This parameter does not apply to external collections.

    - **enable_dynamic_field** (*bool*) -

        Whether allows Zilliz Cloud saves the values of undefined fields in a dynamic field if the data being inserted into the target collection includes fields that are not defined in the collection's schema.

        When you set this to **True**,  and Zilliz Cloud will create a field called **&#36;meta** to store any undefined fields and their values from the data that is inserted.

        This parameter does not apply to external collections.

        <Admonition type="info" icon="📘" title="Note">

        What is a dynamic field?
        
                If the data being inserted into the target collection includes fields that are not defined in the collection's schema, those fields will be saved in a dynamic field as key-value pairs.

        </Admonition>

    - **primary_field** (*str*) -

        The name of the primary field.

        The value should be the name of a field listed in **fields**.

        As an alternative, you can set **is_primary** when creating a **[FieldSchema](./ORM-FieldSchema)** object.

        This parameter does not apply to external collections.

    - **partition_key_field** (*str*) -

        The name of the field that serves as the partition key.

        The value should be the name of a field listed in **fields**.

        Setting this makes Zilliz Cloud manage all partitions in the current collection.

        As an alternative, you can set **is_partition_key** when creating a **[FieldSchema](./ORM-FieldSchema)** object.

        This parameter does not apply to external collections.

        <Admonition type="info" icon="📘" title="Note">

        What is a partition key?
        
                Once a field is designated as the partition key, Zilliz Cloud automatically creates a partition for each unique value in this field and saves entities in these partitions accordingly.
        
                This is particularly useful when implementing data separation based on a specific key, such as partition-oriented multi-tenancy.
        
                As an alternative, you can set **partition_key_field** when creating a **CollectionSchema** object.

        </Admonition>

    - **partition_key_isolation** (*bool*) -

        Whether to enable partition key isolation to improve further search performance in scalar filtering on the partition key. For details, refer to [Use Partition Key Isolation](/docs/use-partition-key#use-partition-key-isolation).

        This parameter does not apply to external collections.

**RETURN TYPE:**

*CollectionSchema*

**RETURNS:**

A **CollectionSchema** object.

**EXCEPTIONS:**

- **FieldsTypeException**: 

    This exception will be raised when the **fields** parameter is not a list.

- **FieldTypeException**: 

    This exception will be raised when a field in the **fields** list is not a **[FieldSchema](./ORM-FieldSchema)** object.

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

## Examples\{#examples}

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

## Methods\{#methods}

The following are the methods of the `CollectionSchema` class:

