---
displayed_sidbar: javaSidebar
slug: /java/CollectionSchema-getField
beta: false
notebook: false
type: docx
token: XK6yd5oUMoCq4Px7wAIclfdxnCd
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# getField()

This operation gets the details of a specific field, including schema information.

```java
public CreateCollectionReq.FieldSchema getField(String fieldName)
```

## Request Syntax{#request-syntax}

```java
CollectionSchema.getField(String fieldName)
```

__PARAMETERS:__

- `fieldName` (_String_)

    The name of the field.

__RETURN TYPE:__

_CreateCollectionReq.FieldSchema_

__RETURNS:__

A [FieldSchema](./FieldSchema) object containing details of the field.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
CreateCollectionReq.FieldSchema fieldSchema = collectionSchema.getField("id");
```
