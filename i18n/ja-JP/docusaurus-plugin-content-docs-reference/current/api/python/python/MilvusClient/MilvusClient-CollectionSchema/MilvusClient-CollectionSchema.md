---
title: "CollectionSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "CollectionSchema インスタンスはコレクションのスキーマを表します。スキーマはコレクションの構造を概説します。 | Python | MilvusClient"
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

**CollectionSchema** インスタンスは、コレクションのスキーマを表します。スキーマはコレクションの構造を概説します。

## リクエスト構文\{#request-syntax}

```python
class pymilvus.CollectionSchema
```

**パラメーター:**

- **fields** (*list*) -

    **[REQUIRED]**

    コレクションスキーマ内のフィールドを定義する FieldSchema オブジェクトのリストです。フィールドスキーマは 1 つのフィールドのメタデータを表現して保持し、CollectionSchema は FieldSchema オブジェクトのリストをまとめて完全なスキーマを定義します。

- **description** (*string*) -

    スキーマの説明です。説明を指定しない場合は、空の文字列に設定されます。

- **external_source** (*str*) -

    外部ソース URI です。これは AWS S3 オブジェクトパスに類似しています。

- **external_spec** (*str*) -

    外部ソースの仕様です。これは一連の補助的なパラメーターです。format（str）: ターゲットのソースデータファイルの形式です。指定できる値は parquet、vortex、lance-table、iceberg-table です。snapshot_id（str）: Iceberg テーブルの ID です。これは format が iceberg-table の場合にのみ適用されます。extfs（string）: 文字列化された JSON 構造の外部ファイルシステム設定です。指定できるオプションは以下の通りです。access_key_id（string）: オブジェクトストレージサービスのアクセスキー ID です。access_key_val（string）: オブジェクトストレージサービスのアクセスキー値です。cloud_provider（string）: オブジェクトストレージサービスのクラウドプロバイダーです。region（string）: オブジェクトストレージサービスのリージョンです。use_iam（string）: バケットアクセス認証に AWS IAM を使用するかどうかです。指定できる値は "true" または "false" です。iam_endpoint（string）: AWS IAM STS エンドポイントです。use_ssl（string）: オブジェクトストレージバケットへのアクセスに SSL を使用するかどうかです。指定できる値は "true" または "false" です。use_virtual_host（string）: バケットアクセスに仮想ホスティングを使用するかどうかです。詳細については、この記事を参照してください。storage_type（string）: ストレージタイプです。指定できる値は remote です。role_arn（string）: バケット所有者から取得した AWS IAM ロール ARN です。external_id（string）: バケット所有者から取得した外部 ID です。load_frequency（string）: Milvus が一時認証情報を取得する間隔（秒）です。

- **kwargs** (*Any*) -

    auto_id（bool）: プライマリフィールドを自動インクリメントできるかどうかです。これを True に設定すると、プライマリフィールドが自動的にインクリメントされます。この場合、エラーを避けるため、挿入するデータにプライマリフィールドを含めないでください。このパラメーターは外部コレクションには適用されません。enable_dynamic_field（bool）: ターゲットコレクションに挿入するデータにコレクションのスキーマで定義されていないフィールドが含まれている場合に、未定義フィールドの値を動的フィールドに保存することを Milvus に許可するかどうかです。これを True に設定すると、Milvus は &#36;meta というフィールドを作成し、挿入されるデータに含まれる未定義フィールドとその値を保存します。このパラメーターは外部コレクションには適用されません。ターゲットコレクションに挿入するデータにコレクションのスキーマで定義されていないフィールドが含まれている場合、それらのフィールドはキーと値のペアとして動的フィールドに保存されます。primary_field（str）: プライマリフィールドの名前です。値は fields に列挙されているフィールドの名前である必要があります。別の方法として、FieldSchema オブジェクトの作成時に is_primary を設定できます。このパラメーターは外部コレクションには適用されません。partition_key_field（str）: パーティションキーとして機能するフィールドの名前です。値は fields に列挙されているフィールドの名前である必要があります。これを設定すると、Milvus は現在のコレクション内のすべてのパーティションを管理します。別の方法として、FieldSchema オブジェクトの作成時に is_partition_key を設定できます。このパラメーターは外部コレクションには適用されません。フィールドがパーティションキーとして指定されると、Milvus はこのフィールド内の一意の値ごとにパーティションを自動的に作成し、それに応じてエンティティをこれらのパーティションに保存します。これは、パーティション指向のマルチテナンシーなど、特定のキーに基づくデータ分離を実装する場合に特に役立ちます。別の方法として、CollectionSchema オブジェクトの作成時に partition_key_field を設定できます。partition_key_isolation（bool）: パーティションキーに対するスカラーフィルタリングでの検索パフォーマンスをさらに向上させるために、パーティションキー分離を有効にするかどうかです。詳細については、Use Partition Key Isolation を参照してください。このパラメーターは外部コレクションには適用されません。

**戻り値の型:**

*CollectionSchema*

**戻り値:**

CollectionSchema オブジェクトです。

**例外:**

- **FieldsTypeException**

    **fields** パラメーターがリストでない場合に、この例外が発生します。**fields** パラメーターがリストでない場合に、この例外が発生します。

- **FieldTypeException**

    **fields** リスト内のフィールドが **FieldSchema** オブジェクトでない場合に、この例外が発生します。**fields** リスト内のフィールドが **FieldSchema** オブジェクトでない場合に、この例外が発生します。

- **PrimaryKeyException:**

    次の場合にこの例外が発生します。次の場合にこの例外が発生します。

- **PartitionKeyException:**

    次の場合にこの例外が発生します。次の場合にこの例外が発生します。

- **AutoIDException:**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。失敗の正確な原因については、サーバーのエラーメッセージを確認してください。

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

- **external_source** (*str*) -

    外部ソース URI です。アクセス可能な外部ボリュームを指す `volume://` URI を指定します。たとえば、`volume://<volume-name>/path/to/folder/` です。

- **external_spec** (*str*) -

    外部ソースの仕様です。これは一連の補助的なパラメーターです。

    - **format** (*str*) - 

        ターゲットのソースデータファイルの形式です。

        指定できる値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

    - **snapshot_id** (*str*) -

        Iceberg テーブルの ID です。これは `format` が `iceberg-table` の場合にのみ適用されます。

    
