---
displayed_sidbar: pythonSidebar
slug: /python/PyMilvusLegacy-CollectionSchema
beta: false
notebook: false
token: SeaffVvutlNtvTdpV17cy78un5T
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# CollectionSchema

A __CollectionSchema__ instance represents the schema of a collection. A schema sketches the structure of a collection.

```python
class pymilvus.CollectionSchema
```

## Constructor{#constructor}

Constructs the schema of a collection by defining fields, data types, and other parameters.

```python
from pymilvus import CollectionSchema, FieldSchema, DataType

# Define fields in a schema
primary_key = FieldSchema(
    name="string",
    dtype=DataType.INT64,
    is_primary=True,
)

vector = FieldSchema(
    name="string",
    dtype=DataType.FLOAT_VECTOR,
    dim=int
)

# Construct a schema with the predefined fields
schema = CollectionSchema(
    fields=[primary_key, vector],
    description="string"
)
```

__PARAMETERS:__

- __fields__ (_list_) -

    __[REQUIRED]__

    A list of __FieldSchema__ objects that define the fields in the collection schema.

    <Admonition type="info" icon="📘" title="What is a field schema?">

    <p>A field schema represents and contains metadata for a single field, while <strong>CollectionSchema</strong> ties together a list of FieldSchema objects to define the full schema.</p>

    </Admonition>

- __description__ (_string_) -

    The description of the schema.

    If a description is not provided, it will be set to an empty string.

- __kwargs__ -

    - __auto_id__ (_bool_)

        Whether allows the primary field to automatically increment.

        Setting this to __True__ makes the primary field automatically increment. In this case, the primary field should not be included in the data to insert to avoid errors.

    - __enable_dynamic_field__ (_bool_)

        Whether allows Zilliz Cloud saves the values of undefined fields in a dynamic field if the data being inserted into the target collection includes fields that are not defined in the collection's schema.

        When you set this to __True__,  and Zilliz Cloud will create a field called __$meta__ to store any undefined fields and their values from the data that is inserted.

        <Admonition type="info" icon="📘" title="What is a dynamic field?">

        <p>If the data being inserted into the target collection includes fields that are not defined in the collection's schema, those fields will be saved in a dynamic field as key-value pairs.</p>

        </Admonition>

    - __primary_field__ (_str_)

        The name of the primary field.

        The value should be the name of a field listed in __fields__.

        As an alternative, you can set __is_primary__ when creating a __FieldSchema__ object.

    - __partition_key_field__ (_str_)

        The name of the field that serves as the partition key.

        The value should be the name of a field listed in __fields__.

        Setting this makes Zilliz Cloud manage all partitions in the current collection.

        As an alternative, you can set __is_partition_key__ when creating a __FieldSchema__ object.

        <Admonition type="info" icon="📘" title="What is a partition key?">

        <p>Once a field is designated as the partition key, Zilliz Cloud automatically creates a partition for each unique value in this field and saves entities in these partitions accordingly.</p>
        <p>This is particularly useful when implementing data separation based on a specific key, such as partition-oriented multi-tenancy.</p>
        <p>As an alternative, you can set <strong>partition<em>key</em>field</strong> when creating a <strong>CollectionSchema</strong> object.</p>

        </Admonition>

__RETURN TYPE:__

_CollectionSchema_

__RETURNS:__

A __CollectionSchema__ object.

__EXCEPTIONS:__

- __FieldsTypeException__: 

    This exception will be raised when the __fields__ parameter is not a list.

- __FieldTypeException__: 

    This exception will be raised when a field in the __fields__ list is not a __FieldSchema__ object.

- __PrimaryKeyException:__

    This exception will be raised if

    - The __primary_field__ parameter has been set but the value is not a string.

    - The __primary_field__ parameter has been set but the value is not the name of any listed fields.

- __PartitionKeyException:__

    This exception will be raised if 

    - The __partition_key_field__ parameter has been set but the value is not a string.

    - The __partition_key_field__ parameter has been set but the value is not the name of any listed fields.

- __AutoIDException:__

    - This exception will be raised if the __auto_id__ parameter has been set but the value is not a boolean.

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



import DocCardList from '@theme/DocCardList';

<DocCardList />