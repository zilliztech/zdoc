---
title: "StructFieldSchema | Java | v2"
slug: /java/java/v2-Collections-StructFieldSchema
sidebar_label: "StructFieldSchema"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "A StructFieldSchema instance represents the schema of the Struct elements in an Array of Structs field. A schema sketches the structure of its Struct elements. | Java | v2"
type: docx
token: DCszdG9rCoZxhfxfAuOcNsXRnOc
sidebar_position: 7
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - StructFieldSchema
  - javaV226
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# StructFieldSchema

A **StructFieldSchema** instance represents the schema of the Struct elements in an Array of Structs field. A schema sketches the structure of its Struct elements.

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.StructFieldSchema
```

<Admonition type="info" icon="📘" title="Notes">

<p>This class cannot be explicitly instantiated. You need to describe a collection with an Array of Structs field to view its instances.</p>

</Admonition>

## Example\{#example}

The following example illustrates how to create an Array of Structs field and add fields to its Struct elements. 

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.CollectionSchema collectionSchema = CreateCollectionReq.CollectionSchema.builder()
        .build();
        
collectionSchema.addField(AddFieldReq.builder()
        .fieldName(STRUCT_FIELD)
        .description("clips of a film")
        .dataType(DataType.Array)
        .elementType(DataType.Struct)
        .maxCapacity(100)
        .addStructField(AddFieldReq.builder()
                .fieldName(FRAME_FIELD)
                .description("from which frame this clip begin")
                .dataType(DataType.Int32)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName(CLIP_VECTOR_FIELD)
                .description("embedding of a clip")
                .dataType(DataType.FloatVector)
                .dimension(VECTOR_DIM)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName(DESC_FIELD)
                .description("description of a clip")
                .dataType(DataType.VarChar)
                .maxLength(1024)
                .build())
        .addStructField(AddFieldReq.builder()
                .fieldName(DESC_VECTOR_FIELD)
                .description("embedding of description")
                .dataType(DataType.FloatVector)
                .dimension(VECTOR_DIM)
                .build())
        .build());
```

## Methods\{#methods}

The following are the methods of the `StructFieldSchema` class: