---
title: "CollectionSchema | Java | v2"
slug: /java/java/v2-Collections-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "A CollectionSchema instance represents the schema of a collection. A schema sketches the structure of a collection. | Java | v2"
type: docx
token: FxUxdWGz2oUh1ixyquZcAndBnAf
sidebar_position: 2
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - CollectionSchema
  - javaV226
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# CollectionSchema

A **CollectionSchema** instance represents the schema of a collection. A schema sketches the structure of a collection.

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.CollectionSchema
```

## Constructor\{#constructor}

Constructs the schema of a collection by defining fields, data types, and other parameters.

```java
CreateCollectionReq.CollectionSchema.builder()
    .fieldSchemaList(List<CreateCollectionReq.FieldSchema>)
    .build();
```

**BUILDER METHODS:**

- `fieldSchemaList(List<CreateCollectionReq.FieldSchema>)`

    A list of **FieldSchema** objects that define the fields in the collection schema.

    <Admonition type="info" icon="📘" title="What is a field schema?">

    <p>A field schema represents and contains metadata for a single field, while <strong>CollectionSchema</strong> ties together a list of FieldSchema objects to define the full schema.</p>

    </Admonition>

**RETURN TYPE:**

*CollectionSchema*

**RETURNS:**

A **CollectionSchema** object.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// define a Collection Schema
CreateCollectionReq.CollectionSchema collectionSchema = client.CreateSchema();
// add two fileds, id and vector
collectionSchema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(Boolean.TRUE).autoID(Boolean.FALSE).description("id").build());
collectionSchema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector).dimension(dim).build());
```

## Methods\{#methods}

The following are the methods of the `CollectionSchema` class:

