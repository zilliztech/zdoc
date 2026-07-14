---
title: "CollectionSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "CollectionSchema インスタンスは、collection のスキーマを表します。スキーマは collection の構造を概説します。 | Python | MilvusClient"
type: docx
token: SSiodq10FoH26hx2HlccfcAgnje
sidebar_position: 2
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - マルチモーダル検索
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

フィールド、データ型、およびその他のパラメータを定義して、collection のスキーマを構築します。

```python
CollectionSchema(
    fields: list,
    description: str
)
```

**PARAMETERS:**

- **fields** (*list*) -

    **[REQUIRED]**

    collection スキーマ内のフィールドを定義する **[FieldSchema](./ORM-FieldSchema)** オブジェクトのリストです。

    <Admonition type="info" icon="📘" title="Note">

    フィールドスキーマとは何ですか？
    
        フィールドスキーマは単一のフィールドのメタデータを表現および保持する一方、**CollectionSchema** は FieldSchema オブジェクトのリストをまとめて完全なスキーマを定義します。

    </Admonition>

- **description** (*string*) -

    スキーマの説明です。

    説明が指定されていない場合は、空文字列に設定されます。

- **external_source** (*str*) -

    外部ソース URI です。アクセス可能な外部 volume を指す `volume://` URI である必要があります。たとえば、`volume://<volume-name>/path/to/folder/` です。.

- **external_spec** (*str*) -

    外部ソースの仕様であり、以下のセカンダリパラメータのセットです。

    - **format** (*str*) - 

        対象ソースデータファイルの形式です。

        指定可能な値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

    - **snapshot_id** (*str*) -

        Iceberg table の ID です。これは `format` が `iceberg-table` の場合にのみ適用されます。

- **kwargs** -

    - **auto_id** (*bool*) -

        primary field の自動インクリメントを許可するかどうかです。

        これを **True** に設定すると、primary field は自動的にインクリメントされます。この場合、エラーを避けるため、挿入するデータに primary field を含めないでください。

        このパラメータは外部 collection には適用されません。

    - **enable_dynamic_field** (*bool*) -

        ターゲット collection に挿入されるデータに collection のスキーマで定義されていないフィールドが含まれている場合に、未定義フィールドの値を Zilliz Cloud が dynamic field に保存することを許可するかどうかです。

        これを **True** に設定すると、Zilliz Cloud は **&#36;meta** というフィールドを作成し、挿入されるデータ内の未定義フィールドとその値を保存します。

        このパラメータは外部 collection には適用されません。

        <Admonition type="info" icon="📘" title="Note">

        dynamic field とは何ですか？
        
                ターゲット collection に挿入されるデータに collection のスキーマで定義されていないフィールドが含まれている場合、それらのフィールドはキーと値のペアとして dynamic field に保存されます。

        </Admonition>

    - **primary_field** (*str*) -

        primary field の名前です。

        値は **fields** に列挙されたフィールドのいずれかの名前である必要があります。

        別の方法として、**[FieldSchema](./ORM-FieldSchema)** オブジェクトの作成時に **is_primary** を設定できます。

        このパラメータは外部 collection には適用されません。

    - **partition_key_field** (*str*) -

        partition key として機能するフィールドの名前です。

        値は **fields** に列挙されたフィールドのいずれかの名前である必要があります。

        これを設定すると、Zilliz Cloud は現在の collection 内のすべての partition を管理します。

        別の方法として、**[FieldSchema](./ORM-FieldSchema)** オブジェクトの作成時に **is_partition_key** を設定できます。

        このパラメータは外部 collection には適用されません。

        <Admonition type="info" icon="📘" title="Note">

        partition key とは何ですか？
        
                フィールドが partition key として指定されると、そのフィールド内の一意の値ごとに Zilliz Cloud が自動的に partition を作成し、それに応じて entity をこれらの partition に保存します。
        
                これは、partition 指向のマルチテナンシーなど、特定のキーに基づくデータ分離を実装する場合に特に有用です。
        
                別の方法として、**CollectionSchema** オブジェクトの作成時に **partition_key_field** を設定できます。

        </Admonition>

    - **partition_key_isolation** (*bool*) -

        partition key に対する scalar filtering における検索パフォーマンスをさらに向上させるために、partition key isolation を有効にするかどうかです。詳細については、[Use Partition Key Isolation](/docs/use-partition-key#use-partition-key-isolation) を参照してください。

        このパラメータは外部 collection には適用されません。

**RETURN TYPE:**

*CollectionSchema*

**RETURNS:**

**CollectionSchema** オブジェクト。

**EXCEPTIONS:**

- **FieldsTypeException**: 

    **fields** パラメータがリストでない場合に、この例外が発生します。

- **FieldTypeException**: 

    **fields** リスト内のフィールドが **[FieldSchema](./ORM-FieldSchema)** オブジェクトでない場合に、この例外が発生します。

- **PrimaryKeyException:**

    この例外は、以下の場合に発生します。

    - **primary_field** パラメータが設定されているが、その値が文字列ではない場合。

    - **primary_field** パラメータが設定されているが、その値が列挙されたフィールドのいずれの名前でもない場合。

- **PartitionKeyException:**

    この例外は、以下の場合に発生します。 

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

