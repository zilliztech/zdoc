---
displayed_sidbar: pythonSidebar
slug: /python/Collections-create_schema
beta: false
notebook: false
token: RxU7dBjGlop0e1xZShYcZ4qCnnh
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# create_schema()

This operation creates a collection schema.

## Request syntax{#request-syntax}

```python
MilvusClient.create_schema(**kwargs) -> CollectionSchema
```

<Admonition type="info" icon="📘" title="Notes">

<p>This is a class method. You should call this method like this: <code>MilvusClient.create_schema()</code>.</p>

</Admonition>

__PARAMETERS:__

- __kwargs__ -

    - __auto_id__ (_bool_)

        Whether allows the primary field to automatically increment.

        Setting this to __True__ makes the primary field automatically increment. In this case, the primary field should not be included in the data to insert to avoid errors.

    - __enable_dynamic_field__ (_bool_)

        Whether allows Zilliz Cloud saves the values of undefined fields in a dynamic field if the data being inserted into the target collection includes fields that are not defined in the collection's schema.

        When you set this to __True__,  and Zilliz Cloud will create a field called __$meta__ to store any undefined fields and their values from the data that is inserted.

        <Admonition type="info" icon="📘" title="What is a dynamic field?">

        <p>If the data being inserted into the target collection includes fields that are not defined in the collection's schema, those fields will be saved in a reserved dynamic field named <strong>$meta</strong> as key-value pairs.</p>

        </Admonition>

    - __primary_field__ (_str_)

        The name of the primary field.

    - __partition_key_field__ (_str_)

        The name of the field that serves as the partition key.

        Setting this makes Zilliz Cloud manage all partitions in the current collection.

        <Admonition type="info" icon="📘" title="What is a partition key?">

        <p>Once a field is designated as the partition key, Zilliz Cloud automatically creates a partition for each unique value in this field and saves entities in these partitions accordingly.</p>
        <p>This is particularly useful when implementing data separation based on a specific key, such as partition-oriented multi-tenancy.</p>

        </Admonition>

__RETURN TYPE:__

_CollectionSchema_[](./PyMilvusLegacy-CollectionSchema)_

__RETURNS:__

A __CollectionSchema__[](./PyMilvusLegacy-CollectionSchema)__ object.

__EXCEPTIONS:__

- __MilvusException__

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import MilvusClient, DataType

# 1. Create a schema
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=False,
)

# 2. Add fields to schema
schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)
```

## Related methods{#related-methods}

- [create_collection()](./Collections-create_collection)

- [describe_collection()](./Collections-describe_collection)

- [drop_collection()](./Collections-drop_collection)

- [get_collection_stats()](./Collections-get_collection_stats)

- [has_collection()](./Collections-has_collection)

- [list_collections()](./Collections-list_collections)

- [rename_collection()](./Collections-rename_collection)

- [DataType](./Collections-DataType)

