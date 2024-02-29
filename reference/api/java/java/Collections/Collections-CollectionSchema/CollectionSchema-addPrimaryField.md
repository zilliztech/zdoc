---
displayed_sidbar: javaSidebar
slug: /java/CollectionSchema-addPrimaryField
beta: false
notebook: false
type: docx
token: Ld6Qdvc5doyc4tx4R6ocWNBinUb
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# addPrimaryField()

This operation adds the primary field to the schema of a collection.

```java
public void addPrimaryField(String fieldName,
                            DataType dataType,
                            Integer maxLength,
                            Boolean isPrimaryKey,
                            Boolean autoID)
```

## Request Syntax{#request-syntax}

```java
CollectionSchema.addPrimaryField(String fieldName,
                                 DataType dataType,
                                 Integer maxLength,
                                 Boolean isPrimaryKey,
                                 Boolean autoID)
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

    The maximum number of characters a value should contain.

    This is required if __dataType__ of this field is set to __DataType.VarChar.__

- `isPrimaryKey` (_Boolean_)

    Whether the current field is the primary field.

    Setting this to __True__ makes the current field the primary field.

- `autoID` (_Boolean_)

    Whether allows the primary field to automatically increment.

    Setting this to __True__ makes the primary field automatically increment. In this case, the primary field should not be included in the data to insert to avoid errors.

    Set this parameter in the field with __isPrimaryKey__ set to __True__.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema(Boolean._TRUE_, "")
collectionSchema.addPrimaryField("id", DataType._Int64_, Boolean._TRUE_, Boolean._FALSE_);
```
