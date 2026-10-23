---
title: "StructFieldSchema | Java | v2"
slug: /java/java/v2-Collections-StructFieldSchema
sidebar_label: "StructFieldSchema"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "StructFieldSchema 实例表示 Array of Structs 字段中 Struct 元素的 Schema。Schema 概述了其 Struct 元素的结构。 | Java | v2"
type: docx
token: E48jdYsExowaeux0GV5cfKZTnPp
sidebar_position: 34
keywords: 
  - 稀疏 vs 稠密
  - 稠密向量
  - 分层可导航小世界
  - 稠密嵌入
  - Zilliz
  - Zilliz Cloud
  - 云
  - StructFieldSchema
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# StructFieldSchema

StructFieldSchema 实例表示 Array of Structs 字段中 Struct 元素的 Schema。Schema 概述了其 Struct 元素的结构。

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.StructFieldSchema
```

<Admonition type="info" title="Notes">

此类无法显式实例化。您需要描述一个包含 Array of Structs 字段的 Collection，才能查看其实例。

</Admonition>

## 示例\{#example}

以下示例演示如何创建 Array of Structs 字段，并向其 Struct 元素中添加字段。

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

String STRUCT_FIELD = "clips";
String FRAME_FIELD = "frame_id";
String CLIP_VECTOR_FIELD = "clip_embedding";
String DESC_FIELD = "description";
String DESC_VECTOR_FIELD = "desc_embedding";
int VECTOR_DIM = 768;

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

## 方法\{#methods}

以下是 `StructFieldSchema` 类的方法：
