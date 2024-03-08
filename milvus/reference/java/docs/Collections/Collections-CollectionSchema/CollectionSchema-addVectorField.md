---
displayed_sidbar: javaSidebar
slug: /java/CollectionSchema-addVectorField
beta: false
notebook: false
type: docx
token: ZqxddbCEzoxibpx4KqdcuTd8nLf
sidebar_position: 3
---

# addVectorField()

This operation adds a vector field to the schema of a collection.

```java
public void addVectorField(String fieldName,
                           DataType dataType,
                           Integer dimension)
```

## Request Syntax{#request-syntax}

```java
CollectionSchema.addVectorField(String fieldName,
                                DataType dataType,
                                Integer dimension)
```

__PARAMETERS:__

- `fieldName` (_String_)

    The name of the field.

- `dataType` (_[DataType](./Collections-DataType)_)

    The data type of the field.

    You can choose from the following options when selecting a data type for different fields:

    - Primary key field: Use __DataType.Int64__ or __DataType.VarChar__.

    - Scalar fields: Choose from a variety of options, including __DataType.Bool__, __DataType.Int8__, __DataType.Int16__, __DataType.Int32__, __DataType.Int64__, __DataType.Float__, __DataType.Double__, __DataType.VarChar__, __DataType.JSON__, and __DataType.Array__.

    - Vector fields: Select __DataType.BinaryVector__ or __DataType.FloatVector__.

- `dimension` (_Integer_)

    The dimension of the collection field to hold vector embeddings.

    The value is usually determined by the model you use to generate vector embeddings.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema(Boolean._TRUE_, "");
collectionSchema.addVectorField("vector", DataType._FloatVector_, 8);
```

