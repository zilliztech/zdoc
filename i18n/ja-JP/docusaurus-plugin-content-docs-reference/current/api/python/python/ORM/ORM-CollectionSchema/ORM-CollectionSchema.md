---
title: "CollectionSchema | Python | ORM"
slug: /python/python/ORM-CollectionSchema
sidebar_label: "CollectionSchema"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "CollectionSchema インスタンスは、collection のスキーマを表します。スキーマは collection の構造を概説します。 | Python | ORM"
type: docx
token: CmFKd9eG2oE6xmx9dIGcVPycnth
sidebar_position: 2
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - CollectionSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# CollectionSchema

**CollectionSchema** インスタンスは、collection のスキーマを表します。スキーマは collection の構造を概説します。

```python
class pymilvus.CollectionSchema
```

## Constructor\{#constructor}

フィールド、データ型、その他のパラメータを定義して、collection のスキーマを構築します。

```python
CollectionSchema(
    fields: list,
    description: str
)
```

**PARAMETERS:**

- **fields** (*list*) -

    **[REQUIRED]**

    collection スキーマ内のフィールドを定義する **FieldSchema** オブジェクトのリストです。

    <Admonition type="info" icon="📘" title="Note">

    フィールドスキーマとは何ですか？
    
        フィールドスキーマは単一フィールドのメタデータを表現して保持し、**CollectionSchema** は **FieldSchema** オブジェクトのリストをまとめて完全なスキーマを定義します。

    </Admonition>

- **description** (*string*) -

    スキーマの説明です。

    説明が指定されていない場合は、空文字列に設定されます。

- **kwargs** -

    - **auto_id** (*bool*)

        primary field の自動インクリメントを許可するかどうかを指定します。

        これを **True** に設定すると、primary field は自動的にインクリメントされます。この場合、エラーを避けるために、挿入するデータに primary field を含めるべきではありません。

    - **enable_dynamic_field** (*bool*)

        ターゲット collection に挿入されるデータに collection のスキーマで定義されていないフィールドが含まれている場合に、未定義フィールドの値を動的フィールドに保存することを Zilliz Cloud に許可するかどうかを指定します。

        これを **True** に設定すると、Zilliz Cloud は **&#36;meta** というフィールドを作成し、挿入されたデータ内の未定義フィールドとその値を保存します。

        <Admonition type="info" icon="📘" title="Note">

        動的フィールドとは何ですか？
        
                ターゲット collection に挿入されるデータに collection のスキーマで定義されていないフィールドが含まれている場合、それらのフィールドはキーと値のペアとして動的フィールドに保存されます。

        </Admonition>

    - **primary_field** (*str*)

        primary field の名前です。

        値は **fields** に列挙されているフィールド名である必要があります。

        別の方法として、**FieldSchema** オブジェクトの作成時に **is_primary** を設定することもできます。

    - **partition_key_field** (*str*)

        partition key として機能するフィールドの名前です。

        値は **fields** に列挙されているフィールド名である必要があります。

        これを設定すると、Zilliz Cloud は現在の collection 内のすべての partition を管理します。

        別の方法として、**FieldSchema** オブジェクトの作成時に **is_partition_key** を設定することもできます。

        <Admonition type="info" icon="📘" title="Note">

        partition key とは何ですか？
        
                あるフィールドが partition key として指定されると、Zilliz Cloud はこのフィールドの一意な値ごとに partition を自動的に作成し、それに応じて entity をそれらの partition に保存します。
        
                これは、partition 指向のマルチテナンシーなど、特定のキーに基づくデータ分離を実装する際に特に便利です。
        
                別の方法として、**CollectionSchema** オブジェクトの作成時に **partition_key_field** を設定することもできます。

        </Admonition>

**RETURN TYPE:**

*CollectionSchema*

**RETURNS:**

**CollectionSchema** オブジェクト。

**EXCEPTIONS:**

- **FieldsTypeException**: 

    **fields** パラメータがリストではない場合に、この例外が発生します。

- **FieldTypeException**: 

    **fields** リスト内のフィールドが **FieldSchema** オブジェクトではない場合に、この例外が発生します。

- **PrimaryKeyException:**

    次の場合にこの例外が発生します。

    - **primary_field** パラメータが設定されているが、その値が文字列ではない場合。

    - **primary_field** パラメータが設定されているが、その値が列挙されたフィールドのいずれの名前でもない場合。

- **PartitionKeyException:**

    次の場合にこの例外が発生します。 

    - **partition_key_field** パラメータが設定されているが、その値が文字列ではない場合。

    - **partition_key_field** パラメータが設定されているが、その値が列挙されたフィールドのいずれの名前でもない場合。

- **AutoIDException:**

    - **auto_id** パラメータが設定されているが、その値がブール値ではない場合に、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType

# Define fields in a schema
primary_key = FieldSchema(
    name="id",
    dtype=DataType.INT64,
    is_primary=True,
)

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768
)

# Construct a schema with the predefined fields
schema = CollectionSchema(
    fields=[primary_key, vector],
    description="example_schema"
)
```

## Methods\{#methods}

以下は `CollectionSchema` クラスのメソッドです。

