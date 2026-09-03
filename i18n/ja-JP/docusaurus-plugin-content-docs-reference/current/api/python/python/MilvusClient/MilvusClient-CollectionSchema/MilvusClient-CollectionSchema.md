---
title: "CollectionSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A CollectionSchema instance represents the schema of a collection. A schema sketches the structure of a collection. | Python | MilvusClient"
type: docx
token: SSiodq10FoH26hx2HlccfcAgnje
sidebar_position: 2
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
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

**CollectionSchema** インスタンスは、コレクションのスキーマを表します。スキーマは、コレクションの構造を概略的に示します。

```python
class pymilvus.CollectionSchema
```

## コンストラクタ\{#constructor}

フィールド、データ型、その他のパラメータを定義して、コレクションのスキーマを構築します。

```python
CollectionSchema(
    fields: list,
    description: str
)
```

**パラメータ:**

- **fields** (*list*) -

    **[必須]**

    コレクションスキーマ内のフィールドを定義する **[FieldSchema](./MilvusClient-FieldSchema)** オブジェクトのリスト。

    <Admonition type="info" icon="📘" title="注意">

    フィールドスキーマとは?
    
        フィールドスキーマは単一のフィールドのメタデータを表し、含みます。一方、**CollectionSchema** は FieldSchema オブジェクトのリストを結び付けて、完全なスキーマを定義します。

    </Admonition>

- **description** (*string*) -

    スキーマの説明。

    説明が指定されていない場合は、空の文字列に設定されます。

- **external_source** (*str*) -

    外部ソース URI。アクセス可能な外部ボリュームを指す `volume://` URI である必要があります。例: `volume://<volume-name>/path/to/folder/`

- **external_spec** (*str*) -

    外部ソース仕様。次の二次パラメータのセットです:

    - **format** (*str*) - 

        ターゲットソースデータファイルの形式。

        可能な値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

    - **snapshot_id** (*str*) -

        Iceberg テーブルの ID。これは `format` が `iceberg-table` の場合にのみ適用されます。

- **kwargs** -

    - **auto_id** (*bool*) -

        プライマリフィールドの自動インクリメントを許可するかどうか。

        これを **True** に設定すると、プライマリフィールドが自動的にインクリメントされます。この場合、エラーを避けるため、挿入するデータにプライマリフィールドを含めないでください。

        このパラメータは外部コレクションには適用されません。

    - **enable_dynamic_field** (*bool*) -

        ターゲットコレクションに挿入されるデータに、コレクションのスキーマで定義されていないフィールドが含まれている場合、Zilliz Cloud が未定義フィールドの値を動的フィールドに保存することを許可するかどうか。

        これを **True** に設定すると、Zilliz Cloud は **&#36;meta** というフィールドを作成し、挿入されるデータからの未定義フィールドとその値を保存します。

        このパラメータは外部コレクションには適用されません。

        <Admonition type="info" icon="📘" title="注意">

        動的フィールドとは?
        
                ターゲットコレクションに挿入されるデータに、コレクションのスキーマで定義されていないフィールドが含まれている場合、それらのフィールドはキーと値のペアとして動的フィールドに保存されます。

        </Admonition>

    - **primary_field** (*str*) -

        プライマリフィールドの名前。

        値は **fields** にリストされているフィールドの名前である必要があります。

        代わりに、**[FieldSchema](./MilvusClient-FieldSchema)** オブジェクトを作成するときに **is_primary** を設定することもできます。

        このパラメータは外部コレクションには適用されません。

    - **partition_key_field** (*str*) -

        パーティションキーとして機能するフィールドの名前。

        値は **fields** にリストされているフィールドの名前である必要があります。

        これを設定すると、Zilliz Cloud が現在のコレクション内のすべてのパーティションを管理します。

        代わりに、**[FieldSchema](./MilvusClient-FieldSchema)** オブジェクトを作成するときに **is_partition_key** を設定することもできます。

        このパラメータは外部コレクションには適用されません。

        <Admonition type="info" icon="📘" title="注意">

        パーティションキーとは?
        
                フィールドがパーティションキーとして指定されると、Zilliz Cloud はこのフィールドの一意の値ごとにパーティションを自動的に作成し、エンティティをそれに応じてこれらのパーティションに保存します。
        
                これは、特定のキーに基づいてデータ分離を実装する場合に特に便利です。例えば、パーティション指向のマルチテナンシーなどです。
        
                代わりに、**CollectionSchema** オブジェクトを作成するときに **partition_key_field** を設定することもできます。

        </Admonition>

    - **partition_key_isolation** (*bool*) -

        パーティションキーでのスカラーフィルタリングにおける検索パフォーマンスをさらに向上させるために、パーティションキー分離を有効にするかどうか。詳細については、[Use Partition Key Isolation](/docs/use-partition-key#use-partition-key-isolation) を参照してください。

        このパラメータは外部コレクションには適用されません。

**戻り値の型:**

*CollectionSchema*

**戻り値:**

**CollectionSchema** オブジェクト。

**例外:**

- **FieldsTypeException**: 

    **fields** パラメータがリストでない場合、この例外が発生します。

- **FieldTypeException**: 

    **fields** リスト内のフィールドが **[FieldSchema](./MilvusClient-FieldSchema)** オブジェクトでない場合、この例外が発生します。

- **PrimaryKeyException:**

    次の場合にこの例外が発生します

    - **primary_field** パラメータが設定されているが、値が文字列でない。

    - **primary_field** パラメータが設定されているが、値がリストされているフィールドの名前でない。

- **PartitionKeyException:**

    次の場合にこの例外が発生します

    - **partition_key_field** パラメータが設定されているが、値が文字列でない。

    - **partition_key_field** パラメータが設定されているが、値がリストされているフィールドの名前でない。

- **AutoIDException:**

    - **auto_id** パラメータが設定されているが、値がブール値でない場合、この例外が発生します。

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

以下は `CollectionSchema` クラスのメソッドです:
