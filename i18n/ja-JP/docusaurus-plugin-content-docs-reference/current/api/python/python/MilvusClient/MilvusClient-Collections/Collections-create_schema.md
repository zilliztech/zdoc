---
title: "create_schema() | Python | MilvusClient"
slug: /python/python/Collections-create_schema
sidebar_label: "create_schema()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、コレクションスキーマを作成します。 | Python | MilvusClient"
type: docx
token: Er8vdVepxoqhPFxVyZUcxSHMnqe
sidebar_position: 6
keywords: 
  - ベクトルデータベースの例
  - RAG ベクトルデータベース
  - ベクトル DB とは
  - ベクトルデータベースとは
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - create_schema()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# create_schema()

この操作では、コレクションスキーマを作成します。

<Admonition type="info" title="Note">

これはクラスメソッドです。次のように呼び出してください：MilvusClient.create_schema()。

</Admonition>

<Admonition type="info" title="Note">

これはクラスメソッドです。次のように呼び出してください：MilvusClient.create_schema()。

</Admonition>

<Admonition type="info" title="Note">

これはクラスメソッドです。次のように呼び出してください：MilvusClient.create_schema()。

</Admonition>

<Admonition type="info" title="Note">

これはクラスメソッドです。次のように呼び出してください：MilvusClient.create_schema()。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
MilvusClient.create_schema(**kwargs) -> CollectionSchema
```

<Admonition type="info" title="Notes">

これはクラスメソッドです。次のように呼び出してください：`MilvusClient.create_schema()`。

</Admonition>

**パラメーター:**

- **kwargs** (*Any*) -

    次のオプションがあります。auto_id (bool): プライマリフィールドの自動インクリメントを許可するかどうか。True に設定すると、プライマリフィールドが自動的にインクリメントされます。この場合、エラーを避けるため、挿入するデータにプライマリフィールドを含めないでください。enable_dynamic_field (bool): 挿入対象のコレクションのデータに、コレクションのスキーマで定義されていないフィールドが含まれている場合に、Milvus が未定義フィールドの値を動的フィールドに保存することを許可するかどうか。True に設定すると、Milvus は &#36;meta というフィールドを作成し、挿入されるデータの未定義フィールドとその値を保存します。挿入対象のコレクションのデータに、コレクションのスキーマで定義されていないフィールドが含まれている場合、それらのフィールドは予約済みの動的フィールド &#36;meta にキーと値のペアとして保存されます。primary_field (str): プライマリフィールドの名前。partition_key_field (str): パーティションキーとして機能するフィールドの名前。これを設定すると、Milvus は現在のコレクション内のすべてのパーティションを管理します。このパラメーターは Milvus Lite には適用されません。Milvus Lite の制限の詳細については、Run Milvus Lite を参照してください。フィールドがパーティションキーとして指定されると、Milvus は挿入された各エンティティのパーティションキー値に基づいてハッシュを計算し、それに応じて対象コレクションのパーティションにエンティティを保存します。これは、パーティション指向のマルチテナンシーなど、特定のキーに基づいてデータを分離する場合に特に便利です。

- **external_source** (*str*) -

    AWS S3 オブジェクトパスに似た外部ソース URI です。

- **external_spec** (*str*) -

    外部ソースの仕様です。これは一連の副パラメーターです。format (str): 対象のソースデータファイルの形式です。指定可能な値は parquet、vortex、lance-table、iceberg-table です。snapshot_id (str): Iceberg テーブルの ID です。これは format が iceberg-table の場合にのみ適用されます。extfs (string): 文字列化された JSON 構造の外部ファイルシステム設定です。指定可能なオプションは次のとおりです。access_key_id (string): オブジェクトストレージサービスのアクセスキー ID です。access_key_val (string): オブジェクトストレージサービスのアクセスキーの値です。cloud_provider (string): オブジェクトストレージサービスのクラウドプロバイダーです。region (string): オブジェクトストレージサービスのリージョンです。use_iam (string): バケットアクセス認証に AWS IAM を使用するかどうか。指定可能な値は "true" または "false" です。iam_endpoint (string): AWS IAM STS エンドポイントです。use_ssl (string): オブジェクトストレージバケットへのアクセスに SSL を使用するかどうか。指定可能な値は "true" または "false" です。use_virtual_host (string): バケットアクセスに仮想ホスティングを使用するかどうか。詳細については、この記事を参照してください。storage_type (string): ストレージの種類です。指定可能な値は remote です。role_arn (string): バケット所有者から取得する AWS IAM ロール ARN です。external_id (string): バケット所有者から取得する外部 ID です。load_frequency (string): Milvus が一時認証情報を取得する間隔（秒）です。

- **external_source** (*str*) -

    外部ソース URI です。アクセス可能な外部ボリュームを指す `volume://` URI を指定する必要があります。たとえば、`volume://<volume-name>/path/to/folder/` です。

- **external_spec** (*str*) -

    外部ソースの仕様です。これは一連の副パラメーターです。

    - **format** (*str*) - 

        対象のソースデータファイルの形式です。

        指定可能な値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

    - **snapshot_id** (*str*) -

        Iceberg テーブルの ID です。これは `format` が `iceberg-table` の場合にのみ適用されます。

**戻り値の型:**

*CollectionSchema*

**戻り値:**

CollectionSchema オブジェクトです。

**例外:**

- **MilvusException**

    この操作中にエラーが発生すると、この例外がスローされます。この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#examples}

- マネージドコレクションのスキーマ

```python
from pymilvus import MilvusClient, DataType
    
    # 1. Create a schema
    schema = MilvusClient.create_schema(
        auto_id=False,
        enable_dynamic_field=False,
    )
    
    # 2. Add fields to schema
    schema.add_field(
        field_name="my_id",
        datatype=DataType.INT64,
        is_primary=True,
    )
    
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
    
    schema.add_field(
        field_name="my_vector",
        datatype=DataType.FLOAT_VECTOR,
        dim=5,
    )
    
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
        external_source='s3://my_bucket/path/to/a/folder/',
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
