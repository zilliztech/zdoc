---
title: "getField() | Java | v2"
slug: /java/java/v2-CollectionSchema-getField
sidebar_label: "getField()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets the details of a specific field, including schema information. | Java | v2"
type: docx
token: AXWod56QkoprlXxOXkwcPXfonHg
sidebar_position: 3
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - getField()
  - javaV226
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getField()

This operation gets the details of a specific field, including schema information.

```java
public CreateCollectionReq.FieldSchema getField(String fieldName)
```

## Request Syntax\{#request-syntax}

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

## Example\{#example}

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.FieldSchema fieldSchema = collectionSchema.getField("id");
```
