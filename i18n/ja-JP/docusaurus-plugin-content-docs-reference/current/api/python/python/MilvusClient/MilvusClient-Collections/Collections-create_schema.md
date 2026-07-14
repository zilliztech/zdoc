---
title: "create_schema() | Python | MilvusClient"
slug: /python/python/Collections-create_schema
sidebar_label: "create_schema()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は collection schema を作成します。 | Python | MilvusClient"
type: docx
token: Er8vdVepxoqhPFxVyZUcxSHMnqe
sidebar_position: 6
keywords: 
  - vector database の例
  - rag vector database
  - vector db とは
  - vector databases とは
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

この操作は collection schema を作成します。

## リクエスト構文\{#request-syntax}

```python
MilvusClient.create_schema(**kwargs) -> CollectionSchema
```

<Admonition type="info" icon="📘" title="Notes">

これはクラスメソッドです。このメソッドは次のように呼び出す必要があります: `MilvusClient.create_schema()`。

</Admonition>

**パラメータ:**

- **kwargs** -

    - **auto_id** (*bool*)

        primary field の自動インクリメントを許可するかどうか。

        これを **True** に設定すると、primary field は自動的にインクリメントされます。この場合、エラーを避けるため、挿入するデータに primary field を含めないでください。

    - **enable_dynamic_field** (*bool*)

        ターゲット collection に挿入されるデータに collection の schema で定義されていないフィールドが含まれている場合に、Zilliz Cloud がそれらの未定義フィールドの値を dynamic field に保存することを許可するかどうか。

        これを **True** に設定すると、Zilliz Cloud は挿入されたデータ内の未定義フィールドとその値を保存するために **&#36;meta** というフィールドを作成します。

        <Admonition type="info" icon="📘" title="Note">

        dynamic field とは何ですか？
        
                ターゲット collection に挿入されるデータに collection の schema で定義されていないフィールドが含まれている場合、それらのフィールドは予約済みの dynamic field **&#36;meta** にキーと値のペアとして保存されます。

        </Admonition>

    - **primary_field** (*str*)

        primary field の名前。

    - **partition_key_field** (*str*)

        partition key として機能するフィールドの名前。

        これを設定すると、Zilliz Cloud は現在の collection 内のすべての partition を管理します。

        <Admonition type="info" icon="📘" title="Note">

        partition key とは何ですか？
        
                フィールドが partition key として指定されると、Zilliz Cloud は挿入された各 entity の partition key 値に基づいてハッシュを計算し、それに応じてターゲット collection の partition に entity を保存します。
        
                これは、partition 指向のマルチテナンシーのように、特定のキーに基づくデータ分離を実装する場合に特に有用です。

        </Admonition>

- **external_source** (*str*) -

    外部ソース URI。アクセス可能な外部 volume を指す `volume://` URI である必要があります。たとえば、`volume://<volume-name>/path/to/folder/` です。

- **external_spec** (*str*) -

    外部ソース仕様。これは一連の副次パラメータです。

    - **format** (*str*) - 

        ターゲットソースデータファイルの形式。

        使用可能な値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

    - **snapshot_id** (*str*) -

        Iceberg table の ID。これは `format` が `iceberg-table` の場合にのみ適用されます。

**戻り値の型:**

*[CollectionSchema](./MilvusClient-CollectionSchema)*

**戻り値:**

**[CollectionSchema](./MilvusClient-CollectionSchema)** オブジェクト。

**例外:**

- **MilvusException**

    この操作中にエラーが発生した場合、この例外が発生します。

## 例\{#examples}

- 管理対象 collection 用の schema

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

- 外部 collection 用の schema

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

    
