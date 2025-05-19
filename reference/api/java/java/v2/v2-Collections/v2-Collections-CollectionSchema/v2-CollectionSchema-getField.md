---
displayed_sidbar: javaSidebar
title: "getField() | Java | v2"
slug: /java/java/v2-CollectionSchema-getField
sidebar_label: "getField()"
beta: false
notebook: false
description: "This operation gets the details of a specific field, including schema information. | Java | v2"
type: docx
token: AXWod56QkoprlXxOXkwcPXfonHg
sidebar_position: 3
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - getField()
  - javaV225
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite
displayed_sidebar: javaSidebar

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

**PARAMETERS:**

- `fieldName` (*String*)

    The name of the field.

**RETURN TYPE:**

*CreateCollectionReq.FieldSchema*

**RETURNS:**

A [FieldSchema](./v2-FieldSchema) object containing details of the field.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.FieldSchema fieldSchema = collectionSchema.getField("id");
```
