---
title: "StructFieldSchema | Java | v2"
slug: /java/java/v2-Collections-StructFieldSchema
sidebar_label: "StructFieldSchema"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "StructFieldSchema インスタンスは、Array of Structs フィールド内の Struct 要素のスキーマを表します。スキーマは、その Struct 要素の構造を概略します。 | Java | v2"
type: docx
token: E48jdYsExowaeux0GV5cfKZTnPp
sidebar_position: 34
keywords: 
  - スパースベクトルと密ベクトル
  - 密ベクトル
  - Hierarchical Navigable Small Worlds
  - 密埋め込み
  - zilliz
  - zilliz cloud
  - クラウド
  - StructFieldSchema
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# StructFieldSchema

StructFieldSchema インスタンスは、Array of Structs フィールド内の Struct 要素のスキーマを表します。スキーマは、その Struct 要素の構造を概略します。

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.StructFieldSchema
```

<Admonition type="info" title="Notes">

このクラスは明示的にインスタンス化できません。インスタンスを表示するには、Array of Structs フィールドを使用してコレクションを定義する必要があります。

</Admonition>

## 例\{#example}

次の例は、Array of Structs フィールドを作成し、その Struct 要素にフィールドを追加する方法を示します。

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

## メソッド\{#methods}

以下は `StructFieldSchema` クラスのメソッドです。
