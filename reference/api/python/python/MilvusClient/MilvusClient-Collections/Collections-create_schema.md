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

<Admonition type="info" icon="📘" title="Notes">

<p>This is a class method. You should call this method like this: <code>MilvusClient.create_schema()</code>.</p>

</Admonition>

## Request Syntax{#request-syntax}

```python
pymilvus.MilvusClient.create_schema(**kwargs) -> CollectionSchema
```

__PARAMETERS:__

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

- create_collection()

- fast_create_collection()

- create_schema()

