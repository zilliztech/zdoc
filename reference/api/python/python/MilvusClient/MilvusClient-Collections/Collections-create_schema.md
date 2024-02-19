---
displayed_sidbar: pythonSidebar
slug: /python/Collections-create_schema
beta: false
notebook: false
token: RxU7dBjGlop0e1xZShYcZ4qCnnh
sidebar_position: 9
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

**PARAMETERS:**

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

- **MilvusException**

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

