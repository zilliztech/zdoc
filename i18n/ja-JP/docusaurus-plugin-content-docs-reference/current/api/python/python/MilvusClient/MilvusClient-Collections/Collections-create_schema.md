---
title: "create_schema() | Python | MilvusClient"
slug: /python/python/Collections-create_schema
sidebar_label: "create_schema()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションスキーマを作成します。 | Python | MilvusClient"
type: docx
token: Er8vdVepxoqhPFxVyZUcxSHMnqe
sidebar_position: 6
keywords: 
  - ベクトルデータベースの例
  - RAG ベクトルデータベース
  - ベクトルデータベースとは
  - ベクトルデータベースとは何か
  - zilliz
  - zilliz cloud
  - cloud
  - create_schema()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_schema()

この操作は、コレクションスキーマを作成します。

## リクエスト構文\{#request-syntax}

```python
MilvusClient.create_schema(**kwargs) -> CollectionSchema
```

<Admonition type="info" title="Notes">

これはクラスメソッドです。このメソッドは、`MilvusClient.create_schema()` のように呼び出す必要があります。

</Admonition>

**パラメーター:**

- **kwargs** -

    - **auto_id** (*bool*)

        プライマリフィールドの自動インクリメントを許可するかどうか。

        これを **True** に設定すると、プライマリフィールドは自動的にインクリメントされます。この場合、エラーを避けるため、挿入するデータにプライマリフィールドを含めないでください。

    - **enable_dynamic_field** (*bool*)

        対象のコレクションに挿入されるデータに、コレクションのスキーマで定義されていないフィールドが含まれている場合に、Zilliz Cloud がそれらの未定義フィールドの値を動的フィールドに保存することを許可するかどうか。

        これを **True** に設定すると、Zilliz Cloud は、挿入されるデータに含まれる未定義のフィールドとその値を保存するために **&#36;meta** というフィールドを作成します。

        <Admonition type="info" title="Note">

        動的フィールドとは何ですか？
        
                対象のコレクションに挿入されるデータに、コレクションのスキーマで定義されていないフィールドが含まれている場合、それらのフィールドは **&#36;meta** という名前の予約済みの動的フィールドにキーと値のペアとして保存されます。

        </Admonition>

    - **primary_field** (*str*)

        プライマリフィールドの名前。

    - **partition_key_field** (*str*)

        パーティションキーとして機能するフィールドの名前。

        これを設定すると、Zilliz Cloud は現在のコレクション内のすべてのパーティションを管理します。

        <Admonition type="info" title="Note">

        パーティションキーとは何ですか？
        
                フィールドがパーティションキーとして指定されると、Zilliz Cloud は挿入された各エンティティのパーティションキー値に基づいてハッシュを計算し、それに応じて対象のコレクションのパーティションにエンティティを保存します。
        
                これは、パーティション指向のマルチテナンシーのように、特定のキーに基づくデータ分離を実装する場合に特に有用です。

        </Admonition>

- **external_source** (*str*) -

    外部ソース URI。アクセス可能な外部ボリュームを指す `volume://` URI である必要があります。たとえば、`volume://<volume-name>/path/to/folder/` です。

- **external_spec** (*str*) -

    外部ソースの仕様。これは一連の副次パラメーターです。

    - **format** (*str*) - 

        対象のソースデータファイルの形式。

        使用可能な値は、`parquet`、`vortex`、`lance-table`、`iceberg-table` です。

    - **snapshot_id** (*str*) -

        Iceberg テーブルの ID。これは `format` が `iceberg-table` の場合にのみ適用されます。

**戻り値の型:**

*[CollectionSchema](./MilvusClient-CollectionSchema)*

**戻り値:**

**[CollectionSchema](./MilvusClient-CollectionSchema)** オブジェクト。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#examples}

- 管理対象コレクションのスキーマ

    ```python
    from pymilvus import MilvusClient, DataType
    
    # 1. Create a schema
    schema = MilvusClient.create_schema(
        auto_id=False,
        enable_dynamic_field=False,
    )
    
    # 2. Add fields to schema
    schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
    
    # {
    #     'auto_id': False, 
    #     'description': '', 
    #     'fields': [
    #         {
    #             'name': 'my_id', 
    #             'description': '', 
    #             'type': <DataType.INT64: 5>, 
    #             'is_primary': True, 
    #             'auto_id': False
    #         }
    #     ]
    # }
    
    schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)
    
    # {
    #     'auto_id': False, 
    #     'description': '', 
    #     'fields': [
    #         {
    #             'name': 'my_id', 
    #             'description': '', 
    #             'type': <DataType.INT64: 5>, 
    #             'is_primary': True, 
    #             'auto_id': False
    #         }, 
    #         {
    #             'name': 'my_vector', 
    #             'description': '', 
    #             'type': <DataType.FLOAT_VECTOR: 101>, 
    #             'params': {
    #                 'dim': 5
    #             }
    #         }        
    #     ]
    # }
    ```

- 外部コレクションのスキーマ

    ```python
    schema = MilvusClient.create_schema(
        external_source='volume://my_volume/path/to/a/folder/',
        external_spec='{"format": "parquet"}'
    )
    
    schema.add_field(
        field_name="product_id",
        datatype=DataType.INT64,
        # highlight-next
        external_field="id" # field name in the external data file
    )
    schema.add_field(
        field_name="product_name",
        datatype=DataType.VARCHAR,
        max_length=512,
        # highlight-next
        external_field="name"
    )
    schema.add_field(
        field_name="embedding",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        # highlight-next
        external_field="vector"
    )
    ```

    
