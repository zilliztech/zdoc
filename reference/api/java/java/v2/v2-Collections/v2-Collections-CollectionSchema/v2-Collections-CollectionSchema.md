---
title: "CollectionSchema | Java | v2"
slug: /java/java/v2-Collections-CollectionSchema
sidebar_key: java/v2-Collections-CollectionSchema
sidebar_label: "CollectionSchema"
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
beta: false
notebook: false
description: "A CollectionSchema instance represents the schema of a collection. A schema sketches the structure of a collection. | Java | v2"
type: docx
token: IXVHdXVncoEp64xD6vdcvUJwnlH
sidebar_position: 2
keywords: 
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - zilliz
  - zilliz cloud
  - cloud
  - CollectionSchema
  - javaV230
displayed_sidebar: javaSidebar

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

    A list of **[FieldSchema](./v2-Collections-FieldSchema)** objects that define the fields in the collection schema.

    <Admonition type="info" icon="📘" title="What is a field schema?">

    A field schema represents and contains metadata for a single field, while **CollectionSchema** ties together a list of FieldSchema objects to define the full schema.

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

