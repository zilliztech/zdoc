---
title: "StructFieldSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-StructFieldSchema
sidebar_label: "StructFieldSchema"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "StructFieldSchema インスタンスは、struct の配列フィールド内の struct 要素のスキーマを表します。スキーマは struct 要素の構造を概略化したものです。 | Python | MilvusClient"
type: docx
token: ZnKKd2PsyoRc1MxtC1BcJQjgnBh
sidebar_position: 3
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - StructFieldSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# StructFieldSchema

StructFieldSchema インスタンスは、struct の配列フィールド内の struct 要素のスキーマを表します。スキーマは struct 要素の構造を概略化したものです。

```python
class pymilvus.StructFieldSchema
```

## Constructor\{#constructor}

フィールド、データ型、その他のパラメータを定義して、struct の配列フィールド内の struct 要素のスキーマを構築します。

```python
CollectionSchema(
    fields: list,
    description: str
)
```

**PARAMETERS:**

- **name** (*str*) -

    **[REQUIRED]**

    スキーマの名前。 

- **fields** (*list*) -

    **[REQUIRED]**

    struct の配列フィールド内の struct のスキーマに含まれるフィールドを定義する **[FieldSchema](./ORM-FieldSchema)** オブジェクトのリスト。

    <Admonition type="info" icon="📘" title="Note">

    フィールドスキーマとは何ですか？
    
        フィールドスキーマは単一のフィールドのメタデータを表し、それを保持します。一方、**StructFieldSchema** は **[FieldSchema](./ORM-FieldSchema)** オブジェクトのリストをまとめて、struct の配列フィールド内の struct のスキーマを定義します。

    </Admonition>

- **description** (*string*) -

    スキーマの説明。

    説明が指定されていない場合は、空文字列に設定されます。

**RETURN TYPE:**

*StructFieldSchema*

**RETURNS:**

**StructFieldSchema** オブジェクト。

**EXCEPTIONS:**

- **FieldsTypeException**: 

    **fields** パラメータがリストではない場合に、この例外が発生します。

- **FieldTypeException**: 

    **fields** リスト内のフィールドが **[FieldSchema](./ORM-FieldSchema)** オブジェクトではない場合に、この例外が発生します。

```python
from pymilvus import StructFieldSchema, FieldSchema, DataType

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768
)

varchar = FieldSchema(
    name="varchar",
    dtype=DataType.VARCHAR,
    max_length=512
)

# Construct a schema with the predefined fields
schema = StructFieldSchema(
    name="struct_schema",
    fields=[vector, varchar],
    description="example_schema"
)
```

## Properties\{#properties}

- **fields** (*list*) -

    struct の配列フィールド内の struct のスキーマに含まれるフィールドを定義する **[FieldSchema](./ORM-FieldSchema)** オブジェクトのリスト。

- **description** (*string*) -

    スキーマの説明。

    説明が指定されていない場合は、空文字列になります。

## Methods\{#methods}

以下は、`StructFieldSchema` クラスのメソッドです:

