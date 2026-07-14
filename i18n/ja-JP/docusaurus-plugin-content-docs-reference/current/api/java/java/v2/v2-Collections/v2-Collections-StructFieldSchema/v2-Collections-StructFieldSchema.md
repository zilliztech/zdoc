---
title: "StructFieldSchema | Java | v2"
slug: /java/java/v2-Collections-StructFieldSchema
sidebar_label: "StructFieldSchema"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "StructFieldSchema インスタンスは、Array of Structs フィールド内の Struct 要素のスキーマを表します。スキーマは、その Struct 要素の構造を概略化したものです。 | Java | v2"
type: docx
token: DCszdG9rCoZxhfxfAuOcNsXRnOc
sidebar_position: 8
keywords: 
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - StructFieldSchema
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# StructFieldSchema

**StructFieldSchema** インスタンスは、Array of Structs フィールド内の Struct 要素のスキーマを表します。スキーマは、その Struct 要素の構造を概略化したものです。

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.StructFieldSchema
```

<Admonition type="info" icon="📘" title="注意">

このクラスを明示的にインスタンス化することはできません。そのインスタンスを確認するには、Array of Structs フィールドを含む collection を記述する必要があります。

</Admonition>

## Example\{#example}

次の例は、Array of Structs フィールドを作成し、その Struct 要素にフィールドを追加する方法を示しています。

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

以下は、`StructFieldSchema` クラスのメソッドです。
