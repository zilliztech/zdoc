---
displayed_sidbar: javaSidebar
slug: /java/CollectionSchema-addField
beta: false
notebook: false
type: docx
token: ZqxddbCEzoxibpx4KqdcuTd8nLf
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# addField()

This operation adds a vector field to the schema of a collection.

```java
public void addField(AddFieldReq addFieldReq)
```

## Request Syntax{#request-syntax}

```java
CollectionSchema.addField(AddFieldReq.builder()
    .fieldName(String fieldName)
    .description(String description)
    .dataType(DataType dataType)
    .maxLength(Integer maxLength)
    .isPrimaryKey(Boolean isPrimaryKey)
    .isPartitionKey(Boolean isPartitionKey)
    .autoID(Boolean autoID)
    .dimension(int dimension)

    .build()
)
```

__BUILDER METHODS__

- `fieldName(String fieldName)`

    The name of the field.

- `description(String description)`

    The description of the field.

- `dataType(DataType dataType)`

    The data type of the field.

    You can choose from the following options when selecting a data type for different fields:

    - Primary key field: Use __DataType.Int64__ or __DataType.VarChar__.

    - Scalar fields: Choose from a variety of options, including __DataType.Bool__, __DataType.Int8__, __DataType.Int16__, __DataType.Int32__, __DataType.Int64__, __DataType.Float__, __DataType.Double__, __DataType.VarChar__, __DataType.JSON__.

    - Vector fields: Select __DataType.FloatVector__.

- `maxLength(Integer maxLength)`

    The maximum number of characters a value should contain.

    This is required if __dataType__ of this field is set to __DataType.VarChar.__

- `isPrimaryKey(Boolean isPrimaryKey)`

    Whether the current field is the primary field.

    Setting this to __True__ makes the current field the primary field.

- `isPartitionKey(Boolean isPartitionKey)`

    Whether the current field is the partitionKey field.

    Setting this to __True__ makes the current field the partition key.

- `autoID(Boolean autoID)`

    Whether allows the primary field to automatically increment.

    Setting this to __True__ makes the primary field automatically increment. In this case, the primary field should not be included in the data to insert to avoid errors.

    Set this parameter in the field with __isPrimaryKey__ set to __True__.

- `dimension(int dimension)`

    The number of dimensions a value should have.

    This is required if __dataType__ of this field is set to __DataType.FloatVector__.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema();
// add two field, id and vector
collectionSchema.addField(AddFieldReq._builder_().fieldName("id").dataType(DataType._Int64_).isPrimaryKey(Boolean._TRUE_).autoID(Boolean._FALSE_).description("id").build());
collectionSchema.addField(AddFieldReq._builder_().fieldName("vector").dataType(DataType._FloatVector_).dimension(dim).build());
```

