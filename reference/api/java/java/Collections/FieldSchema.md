---
displayed_sidbar: javaSidebar
slug: /java/FieldSchema
beta: false
notebook: false
type: docx
token: A467dTwvJoLJClxXEZ5ctRlNnYf
sidebar_position: 12
---

import Admonition from '@theme/Admonition';


# FieldSchema

A __FieldSchema__ instance defines the data type and related attributes of a specific field in a collection.

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.FieldSchema
```

## Constructor{#constructor}

Constructs the schema of a field by defining the field name, data type, and other parameters.

```java
CreateCollectionReq.FieldSchema.builder()
    .name(String fieldName)
    .description(String description)
    .dataType(DataType dataType)
    .maxLength(int maxLength)
    .dimension(int dimension)
    .isPrimaryKey(boolean isPrimaryKey)
    .isPartitionKey(boolean isPartitionKey)
    .autoID(boolean autoID)

    .build();
```

__BUILDER METHODS:__

- `name(String fieldName)`

    The name of the field.

- `description(String description)`

    The description of the field.

- `dataType(DataType dataType)`

    The data type of the field.

    You can choose from the following options when selecting a data type for different fields:

    - Primary key field: Use __DataType.Int64__ or __DataType.VarChar__.

    - Scalar fields: Choose from a variety of options, including __DataType.Bool__, __DataType.Int8__, __DataType.Int16__, __DataType.Int32__, __DataType.Int64__, __DataType.Float__, __DataType.Double__, __DataType.VarChar__, __DataType.JSON__.

    - Vector fields: Select __DataType.FloatVector__.

- `maxLength(int maxLength)`

    The maximum number of characters a value should contain.

    This is required if __dataType__ of this field is set to __DataType.VarChar.__

- `dimension(int dimension)`

    The number of dimensions a value should have.

    This is required if __dataType__ of this field is set to __DataType.FloatVector__.

- `isPrimaryKey(boolean isPrimaryKey)`

    Whether the current field is the primary field.

    Setting this to __True__ makes the current field the primary field.

- `isPartitionKey(boolean isPartitionKey)`

    Whether the current field is the partitionKey field.

    Setting this to __True__ makes the current field the partition key.

- `autoID(boolean autoID)`

    Whether allows the primary field to automatically increment.

    Setting this to __True__ makes the primary field automatically increment. In this case, the primary field should not be included in the data to insert to avoid errors.

    Set this parameter in the field with __isPrimaryKey__ set to __True__.

__RETURN TYPE:__

_FieldSchema_

__RETURNS:__

A __FieldSchema__ object.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// define a id field with autoID set to false
CreateCollectionReq.FieldSchema fieldSchema = CreateCollectionReq.FieldSchema.builder()
        .name("id")
        .dataType(DataType._Int64_)
        .isPrimaryKey(Boolean._TRUE_)
        .autoID(Boolean._FALSE_)
        .build();
```
