---
title: "add_field() | Python | ORM"
slug: /python/python/CollectionSchema-add_field
sidebar_label: "add_field()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds a field to the schema of a collection. | Python | ORM"
type: docx
token: H9IFdpWWUouzXOxKlx9cImP8nnd
sidebar_position: 1
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - add_field()
  - pymilvus26
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_field()

This operation adds a field to the schema of a collection.

## Request Syntax\{#request-syntax}

```python
add_field(
    field_name: str,
    datatype: DataType,
    **kwargs
)
```

**PARAMETERS:**

- **field_name** (*string*) - 

    **[REQUIRED]**

    The name of the field.

- **datatype** (*[DataType](./Collections-DataType)*) - 

    **[REQUIRED]**

    The data type of the field.

    You can choose from the following options when selecting a data type for different fields:

    - Primary key field: Use **DataType.INT64** or **DataType.VARCHAR**.

    - Scalar fields: Choose from a variety of options, including 

        - **DataType.BOOL**,

        - **DataType.INT8**,

        - **DataType.INT16**,

        - **DataType.INT32**,

        - **DataType.INT64**,

        - **DataType.FLOAT**,

        - **DataType.DOUBLE**,

        - **DataType.BINARY_VECTOR**,

        - **DataType.FLOAT_VECTOR**,

        - **DataType.FLOAT16_VECTOR**,

        - **DataType.BFLOAT16_VECTOR**,

        - **DataType.VARCHAR**,

        - **DataType.JSON**, and

        - **DataType.ARRAY**

    - Vector fields: Select **DataType.FLOAT_VECTOR**, **DataType.BINARY_VECTOR** <sup>(Beta)</sup>, **DataType.FLOAT16_VECTOR** <sup>(Beta)</sup>, **DataType.BFLOAT16_VECTOR** <sup>(Beta)</sup>, or **DataType.SPARSE_FLOAT_VECTOR** <sup>(Beta)</sup>.

- **is_primary** (*bool*) -

    Whether the current field is the primary field in a collection.

    <Admonition type="info" icon="📘" title="Notes">

    <ul>
    <li><p>Each collection has only one primary field.</p></li>
    <li><p>A primary field should be of either the <strong>DataType.INT64</strong> type or the <strong>DataType.VARCHAR</strong> type.</p></li>
    </ul>

    </Admonition>

- **max_length** (*int*) -

    The maximum byte length for strings allowed to be inserted. Note that multibyte characters (e.g., Unicode characters) may occupy more than one byte each, so ensure the byte length of inserted strings does not exceed the specified limit. Value range: [1, 65,535].

    This is mandatory for a **DataType.VARCHAR** field.

- **element_type** (*str*) -

    The data type of the elements in the field value.

    This is mandatory for a **DataType.ARRAY** field.

- **max_capacity** (*int*) -

    The number of elements in an Array field value.

    This is mandatory for a **DataType.ARRAY** field.

- **dim** (*int*) -

    The dimension of the vector embeddings. The value should be an integer greater than 1.

    This is mandatory for a field of the **DataType.FLOAT_VECTOR**, **DataType.BINARY_VECTOR**, **DataType.FLOAT16_VECTOR**, or **DataType.BFLOAT16_VECTOR** type. If you use **DataType.SPARSE_FLOAT_VECTOR**, omit this parameter.

- **is_partition_key** (*bool*) -

    Whether the current field serves as the partition key. Each collection can have one partition key.

    <Admonition type="info" icon="📘" title="What is the partition key?">

    <p>To facilitate partition-oriented multi-tenancy, you can set a field as the partition key field so that Zilliz Cloud hashes the field values and distributes entities among the specified number of partitions accordingly.</p>
    <p>When retrieving entities, ensure that the partition key field is used in the boolean expression to filter out entities of a specific field value.</p>
    <p>For details, refer to <a href="/docs/use-partition-key">Use Partition Key</a> and <a href="https://milvus.io/docs/multi_tenancy.md">Multi-tenancy</a>.</p>

    </Admonition>

**RETURN TYPE:**

*[CollectionSchema](./ORM-CollectionSchema)*

**RETURNS:**

A **CollectionSchema** object contains the fields that have been added to the schema.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import DataType, FieldSchema, CollectionSchema

schema = CollectionSchema(
    fields = [primary_key, vector]
)

# Add the primary key field
schema.add_field(
    field_name="id",
    datatype=DataType.INT64,
    is_primary=True
)

# Add the vector field
schema.add_field(
    field_name="vector",
    datatype=FLOAT_VECTOR,
    dim=768
)

# Add a scalar field to the schema
schema.add_field(
    field_name="scalar_01",
    datatype=DataType.INT32
)

# {
#     'auto_id': False, 
#     'description': '', 
#     'fields': [
#         {
#             'name': 'id', 
#             'description': '', 
#             'type': <DataType.INT64: 5>, 
#             'is_primary': True, 
#             'auto_id': False
#         }, 
#         {
#             'name': 'vector', 
#             'description': '', 
#             'type': <DataType.FLOAT_VECTOR: 101>, 
#             'params': {'dim': 768}
#        }, 
#        {
#             'name': 'scalar_01', 
#             'description': '', 
#             'type': <DataType.INT32: 4>
#        }
#     ]
# }
```
