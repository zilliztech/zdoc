---
title: "FieldSchema | Python | ORM"
slug: /python/python/ORM-FieldSchema
sidebar_label: "FieldSchema"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "FieldSchema インスタンスは、collection 内の特定の field のデータ型と関連属性を定義します。 | Python | ORM"
type: docx
token: EVKhdy0vwoSLSux2RW2c660unjh
sidebar_position: 2
keywords: 
  - AI エージェント
  - セマンティック検索
  - 異常検知
  - sentence transformers
  - zilliz
  - zilliz cloud
  - クラウド
  - FieldSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FieldSchema

**FieldSchema** インスタンスは、collection 内の特定の field のデータ型と関連属性を定義します。

```python
class pymilvus.FieldSchema
```

## Constructor\{#constructor}

field 名、データ型、およびその他のパラメータを定義して、field のスキーマを構築します。

```python
FieldSchema(
    name: str,
    dtype: DataType,
    **kwargs,
)
```

**PARAMETERS:**

- **name** (*string*) -

    **[REQUIRED]**

    field の名前。

- **dtype** (*[DataType](./Collections-DataType)*) -

    **[REQUIRED]**

    field のデータ型。

    異なる field のデータ型を選択する際には、以下のオプションから選択できます。

    - Primary key field: **DataType.INT64** または **DataType.VARCHAR** を使用します。

    - Scalar fields: **DataType.BOOL**、**DataType.INT8**、**DataType.INT16**、**DataType.INT32**、**DataType.INT64**、**DataType.FLOAT**、**DataType.DOUBLE**、**DataType.VARCHAR**、**DataType.JSON**、および **DataType.ARRAY** など、さまざまなオプションから選択できます。

    - Vector fields: **DataType.BINARY_VECTOR** または **DataType.FLOAT_VECTOR** を選択します。

- **description** (*string*) -

    field の説明。

- **kwargs** -

    - **is_primary** (*bool*)

        現在の field が primary field であるかどうか。

        これを **True** に設定すると、現在の field が primary field になります。

        別の方法として、**[CollectionSchema](./MilvusClient-CollectionSchema)** オブジェクトの作成時に **primary_field** を設定することもできます。

    - **auto_id** (*bool*)

        primary field の自動インクリメントを許可するかどうか。

        これを **True** に設定すると、primary field が自動インクリメントされます。この場合、エラーを避けるため、挿入するデータに primary field を含めるべきではありません。

        このパラメータは、`is_primary` が `True` に設定された field で設定してください。

    - **is_partition_key** (*bool*) 

        現在の field が partition key として機能するかどうか。

        これを **True** に設定すると、現在の field が partition key として機能します。この場合、Zilliz Cloud は現在の collection 内のすべての partition を管理します。

        <Admonition type="info" icon="📘" title="Note">

        partition key とは何ですか？
        
                field が partition key として指定されると、Zilliz Cloud はこの field 内の一意な値ごとに自動的に partition を作成し、それに応じて entity をこれらの partition に保存します。
        
                これは、partition 指向のマルチテナンシーのように、特定のキーに基づくデータ分離を実装する場合に特に役立ちます。
        
                別の方法として、**[CollectionSchema](./MilvusClient-CollectionSchema)** オブジェクトの作成時に **partition_key_field** を設定することもできます。

        </Admonition>

    - **max_length** (*int*)

        値に含めることができる最大文字数。

        この field の **dtype** が **DataType.VARCHAR** の場合、これは必須です。

    - **dim** (*int*)

        値が持つべき次元数。

        この field の **dtype** が **DataType.FLOAT_VECTOR** に設定されている場合、これは必須です。

**RETURN TYPE:**

*FieldSchema*

**RETURNS:**

**FieldSchema** オブジェクト。

**Exceptions:**

- **AutoIDException**

    **auto_id** パラメータの値が boolean でない場合、この例外が発生します。

- **DataTypeNotSupportException**

    **dtype** パラメータの値がサポートされていない場合、この例外が発生します。

- **PrimaryKeyException**

    以下の場合、この例外が発生します。

    - **is_primary** パラメータの値が boolean でない場合、または

    - **auto_id** パラメータが設定されているにもかかわらず、**is_primary** パラメータが設定されていない場合。

- **PartitionKeyException**

    **is_partition_key** パラメータが boolean 以外の値に設定されている場合、この例外が発生します。

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## Methods\{#methods}

以下は、`FieldSchema` クラスのメソッドです。
