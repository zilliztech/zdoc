---
displayed_sidbar: javaSidebar
slug: /java/CollectionSchema-addScalarField
beta: false
notebook: false
type: docx
token: UydVdfQtroGMHaxjvEdcEe5Nnng
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# addScalarField()

This operation adds a scalar field to the schema of a collection.

```java
public void addScalarField(String fieldName,
                           DataType dataType,
                           Integer maxLength)
```

## Request Syntax{#request-syntax}

```java
CollectionSchema.addScalarField(String fieldName,
                                DataType dataType,
                                Integer maxLength)
```

__PARAMETERS:__

- `fieldName` (_String_)

    The name of the field.

- `dataType` (_[DataType](./Collections-DataType)_)

    The data type of the field.

    You can choose from the following options when selecting a data type for different fields:

    - Primary key field: Use __DataType.Int64__ or __DataType.VarChar__.

    - Scalar fields: Choose from a variety of options, including __DataType.Bool__, __DataType.Int8__, __DataType.Int16__, __DataType.Int32__, __DataType.Int64__, __DataType.Float__, __DataType.Double__, __DataType.VarChar__, __DataType.JSON__.

    - Vector fields: Select __DataType.FloatVector__.

- `maxLength` (_Integer_)

    The maximum number of characters or elements allowed for string or array fields within the collection.

    This parameter is required if __DataType__ is set to __VarChar__.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema(Boolean._TRUE_, "");
collectionSchema.addScalarField("int32", DataType._Int32_);
collectionSchema.addScalarField("varChar", DataType._VarChar_, 100);
```

