---
title: "CollectionSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "CollectionSchema インスタンスは、コレクションのスキーマを表します。スキーマはコレクションの構造の概略を示します。 | Python | MilvusClient"
type: docx
token: SSiodq10FoH26hx2HlccfcAgnje
sidebar_position: 2
keywords: 
  - Chroma ベクトルデータベース
  - NLP 検索
  - LLM のハルシネーション
  - マルチモーダル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - CollectionSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# CollectionSchema

**CollectionSchema** インスタンスは、コレクションのスキーマを表します。スキーマはコレクションの構造の概略を示します。

```python
class pymilvus.CollectionSchema
```

## コンストラクター\{#constructor}

フィールド、データ型、その他のパラメーターを定義することで、コレクションのスキーマを構築します。

```python
CollectionSchema(
    fields: list,
    description: str
)
```

**パラメーター:**

- **fields** (*list*) -

    **[REQUIRED]**

    コレクションスキーマのフィールドを定義する **[FieldSchema](./MilvusClient-FieldSchema)** オブジェクトのリストです。

    <Admonition type="info" title="Note">

    フィールドスキーマとは何ですか？
    
        フィールドスキーマは 1 つのフィールドのメタデータを表し、保持します。一方、**CollectionSchema** は FieldSchema オブジェクトのリストをまとめて、スキーマ全体を定義します。

    </Admonition>

- **description** (*string*) -

    スキーマの説明です。

    説明を指定しない場合は、空の文字列に設定されます。

- **external_source** (*str*) -

    外部ソース URI です。アクセス可能な外部ボリュームを指す `volume://` URI を指定します。たとえば、`volume://<volume-name>/path/to/folder/` です。

- **external_spec** (*str*) -

    外部ソースの仕様です。これは一連の補助的なパラメーターです。

    - **format** (*str*) - 

        ターゲットのソースデータファイルの形式です。

        指定できる値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

    - **snapshot_id** (*str*) -

        Iceberg テーブルの ID です。これは `format` が `iceberg-table` の場合にのみ適用されます。

- **kwargs** -

    - **auto_id** (*bool*) -

        プライマリーフィールドを自動的にインクリメントすることを許可するかどうかを指定します。

        これを **True** に設定すると、プライマリーフィールドが自動的にインクリメントされます。この場合、エラーを避けるために、挿入するデータにプライマリーフィールドを含めないでください。

        このパラメーターは外部コレクションには適用されません。

    - **enable_dynamic_field** (*bool*) -

        ターゲットコレクションに挿入するデータに、コレクションのスキーマで定義されていないフィールドが含まれている場合に、Zilliz Cloud が未定義フィールドの値を動的フィールドに保存することを許可するかどうかを指定します。

        これを **True** に設定すると、Zilliz Cloud は、挿入されるデータに含まれる未定義のフィールドとその値を保存するための **&#36;meta** というフィールドを作成します。

        このパラメーターは外部コレクションには適用されません。

        <Admonition type="info" title="Note">

        動的フィールドとは何ですか？
        
                ターゲットコレクションに挿入するデータに、コレクションのスキーマで定義されていないフィールドが含まれている場合、それらのフィールドはキーと値のペアとして動的フィールドに保存されます。

        </Admonition>

    - **primary_field** (*str*) -

        プライマリーフィールドの名前です。

        値には、**fields** にリストされているフィールドの名前を指定します。

        別の方法として、**[FieldSchema](./MilvusClient-FieldSchema)** オブジェクトを作成するときに **is_primary** を設定することもできます。

        このパラメーターは外部コレクションには適用されません。

    - **partition_key_field** (*str*) -

        パーティションキーとして機能するフィールドの名前です。

        値には、**fields** にリストされているフィールドの名前を指定します。

        これを設定すると、Zilliz Cloud が現在のコレクション内のすべてのパーティションを管理します。

        別の方法として、**[FieldSchema](./MilvusClient-FieldSchema)** オブジェクトを作成するときに **is_partition_key** を設定することもできます。

        このパラメーターは外部コレクションには適用されません。

        <Admonition type="info" title="Note">

        パーティションキーとは何ですか？
        
                フィールドがパーティションキーとして指定されると、Zilliz Cloud はこのフィールド内の一意の値ごとにパーティションを自動的に作成し、それに応じてこれらのパーティションにエンティティを保存します。
        
                これは、パーティション指向のマルチテナンシーなど、特定のキーに基づいてデータを分離する場合に特に役立ちます。
        
                別の方法として、**CollectionSchema** オブジェクトを作成するときに **partition_key_field** を設定することもできます。

        </Admonition>

    - **partition_key_isolation** (*bool*) -

        パーティションキーに対するスカラーフィルタリングの検索パフォーマンスをさらに向上させるために、パーティションキー分離を有効にするかどうかを指定します。詳細については、[Use Partition Key Isolation](/docs/use-partition-key#use-partition-key-isolation) を参照してください。

        このパラメーターは外部コレクションには適用されません。

**戻り値の型:**

*CollectionSchema*

**戻り値:**

**CollectionSchema** オブジェクトです。

**例外:**

- **FieldsTypeException**: 

    この例外は、**fields** パラメーターがリストでない場合に発生します。

- **FieldTypeException**: 

    この例外は、**fields** リスト内のフィールドが **[FieldSchema](./MilvusClient-FieldSchema)** オブジェクトでない場合に発生します。

- **PrimaryKeyException:**

    この例外は、次の場合に発生します。

    - **primary_field** パラメーターが設定されているものの、その値が文字列でない場合。

    - **primary_field** パラメーターが設定されているものの、その値がリストされているどのフィールドの名前でもない場合。

- **PartitionKeyException:**

    この例外は、次の場合に発生します。 

    - **partition_key_field** パラメーターが設定されているものの、その値が文字列でない場合。

    - **partition_key_field** パラメーターが設定されているものの、その値がリストされているどのフィールドの名前でもない場合。

- **AutoIDException:**

    - **auto_id** パラメーターが設定されているものの、その値がブール値でない場合、この例外が発生します。

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

