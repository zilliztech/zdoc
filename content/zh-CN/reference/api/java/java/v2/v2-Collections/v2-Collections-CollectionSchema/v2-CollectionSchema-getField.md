---
displayed_sidbar: javaSidebar
title: "getField() | Java | v2"
slug: /java/java/v2-CollectionSchema-getField
sidebar_label: "getField()"
added_since: v2.3.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation gets the details of a specific field, including schema information. | Java | v2"
type: docx
token: AXWod56QkoprlXxOXkwcPXfonHg
sidebar_position: 3
keywords: 
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - zilliz
  - zilliz cloud
  - cloud
  - getField()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getField()

This operation gets the details of a specific field, including schema information.

```java
public CreateCollectionReq.FieldSchema getField(String fieldName)
```

## Request Syntax

```java
CollectionSchema.getField(String fieldName)
```

**PARAMETERS:**

- `fieldName` (*String*)

    The name of the field.

**RETURN TYPE:**

*CreateCollectionReq.FieldSchema*

**RETURNS:**

A [FieldSchema](./v2-Collections-FieldSchema) object containing details of the field.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.FieldSchema fieldSchema = collectionSchema.getField("id");
```
