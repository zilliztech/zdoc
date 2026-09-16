---
title: "CollectionSchema | Python | ORM"
slug: /python/python/ORM-CollectionSchema
sidebar_label: "CollectionSchema"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "CollectionSchema インスタンスはコレクションのスキーマを表します。スキーマはコレクションの構造を概説します。 | Python | ORM"
type: docx
token: CmFKd9eG2oE6xmx9dIGcVPycnth
sidebar_position: 2
keywords: 
  - DiskANN
  - スパースベクトル
  - ベクトル次元
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

**CollectionSchema** インスタンスは、コレクションのスキーマを表します。スキーマはコレクションの構造を概説します。

```python
class pymilvus.CollectionSchema
```

## コンストラクター\{#constructor}

フィールド、データ型、およびその他のパラメータを定義して、コレクションのスキーマを構築します。

```python
CollectionSchema(
    fields: list,
    description: str
)
```

**PARAMETERS:**

- **fields** (*list*) -

    **[REQUIRED]**

    コレクションスキーマ内のフィールドを定義する **FieldSchema** オブジェクトのリストです。

    <Admonition type="info" title="Note">

    フィールドスキーマとは何ですか？
    
        フィールドスキーマは 1 つのフィールドのメタデータを表現して保持し、**CollectionSchema** は FieldSchema オブジェクトのリストをまとめて完全なスキーマを定義します。

    </Admonition>

- **description** (*string*) -

    スキーマの説明です。

    説明を指定しない場合は、空の文字列に設定されます。

- **kwargs** -

    - **auto_id** (*bool*)

        プライマリフィールドの自動インクリメントを許可するかどうかを指定します。

        これを **True** に設定すると、プライマリフィールドは自動的にインクリメントされます。この場合、エラーを避けるために、挿入するデータにプライマリフィールドを含めないでください。

    - **enable_dynamic_field** (*bool*)

        ターゲットコレクションに挿入されるデータに、そのコレクションのスキーマで定義されていないフィールドが含まれている場合に、未定義フィールドの値を動的フィールドに保存することを Zilliz Cloud に許可するかどうかを指定します。

        これを **True** に設定すると、Zilliz Cloud は **&#36;meta** というフィールドを作成し、挿入されるデータに含まれる未定義のフィールドとその値を保存します。

        <Admonition type="info" title="Note">

        動的フィールドとは何ですか？
        
                ターゲットコレクションに挿入されるデータに、そのコレクションのスキーマで定義されていないフィールドが含まれている場合、それらのフィールドはキーと値のペアとして動的フィールドに保存されます。

        </Admonition>

    - **primary_field** (*str*)

        プライマリフィールドの名前です。

        値は **fields** に列挙されているフィールドの名前である必要があります。

        別の方法として、**FieldSchema** オブジェクトの作成時に **is_primary** を設定することもできます。

    - **partition_key_field** (*str*)

        パーティションキーとして機能するフィールドの名前です。

        値は **fields** に列挙されているフィールドの名前である必要があります。

        これを設定すると、Zilliz Cloud は現在のコレクション内のすべてのパーティションを管理します。

        別の方法として、**FieldSchema** オブジェクトの作成時に **is_partition_key** を設定することもできます。

        <Admonition type="info" title="Note">

        パーティションキーとは何ですか？
        
                フィールドがパーティションキーとして指定されると、Zilliz Cloud はこのフィールド内の一意の値ごとにパーティションを自動的に作成し、それに応じてエンティティをこれらのパーティションに保存します。
        
                これは、パーティション指向のマルチテナンシーなど、特定のキーに基づくデータ分離を実装する場合に特に役立ちます。
        
                別の方法として、**CollectionSchema** オブジェクトの作成時に **partition_key_field** を設定することもできます。

        </Admonition>

**RETURN TYPE:**

*CollectionSchema*

**RETURNS:**

**CollectionSchema** オブジェクト。

**EXCEPTIONS:**

- **FieldsTypeException**: 

    **fields** パラメータがリストでない場合に、この例外が発生します。

- **FieldTypeException**: 

    **fields** リスト内のフィールドが **FieldSchema** オブジェクトでない場合に、この例外が発生します。

- **PrimaryKeyException:**

    次の場合にこの例外が発生します。

    - **primary_field** パラメータが設定されているものの、その値が文字列でない場合。

    - **primary_field** パラメータが設定されているものの、その値が列挙されたどのフィールドの名前でもない場合。

- **PartitionKeyException:**

    次の場合にこの例外が発生します。 

    - **partition_key_field** パラメータが設定されているものの、その値が文字列でない場合。

    - **partition_key_field** パラメータが設定されているものの、その値が列挙されたどのフィールドの名前でもない場合。

- **AutoIDException:**

    - **auto_id** パラメータが設定されているものの、その値がブール値でない場合に、この例外が発生します。

## 例\{#examples}

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

## メソッド\{#methods}

以下は `CollectionSchema` クラスのメソッドです。
