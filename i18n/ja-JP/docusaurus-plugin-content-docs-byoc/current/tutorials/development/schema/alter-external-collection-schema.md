---
title: "外部コレクションのスキーマ変更 | BYOC"
slug: /alter-external-collection-schema
sidebar_label: "スキーマの変更（外部コレクション）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "外部データソースは、外部コレクションの作成後に変更されることがよくあります。たとえば、すでに埋め込みを格納しているレイクハウステーブルに、後からスコア、カテゴリ、タイムスタンプなどの新しいスカラーフィールドが追加され、それをクエリ結果で返したりフィルターで使用したりしたい場合があります。 | BYOC"
type: origin
token: A9lowWdneiCQbZkgwrocKkT2nxW
sidebar_position: 19
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 外部コレクションのスキーマ変更

外部データソースは、外部コレクションの作成後に変更されることがよくあります。たとえば、すでに埋め込みを格納しているレイクハウステーブルに、後からスコア、カテゴリ、タイムスタンプなどの新しいスカラーフィールドが追加され、それをクエリ結果で返したりフィルターで使用したりしたい場合があります。

外部コレクションを再作成したり、ソースデータを Zilliz Cloud にコピーしたりする代わりに、外部データソースの既存フィールドにマッピングする Zilliz Cloud フィールドを追加します。フィールドを追加したら、外部コレクションをリフレッシュして、新しいフィールドをクエリや検索で使用できるようにします。

## 制限事項\{#limits}

- 現在、外部コレクションでは作成後のフィールド追加がサポートされています。フィールドの削除、フィールド名の変更、フィールドのデータ型変更、ベクトル次元の変更、`external_field` の再マッピングなど、その他のスキーマ変更はサポートされていません。

- 追加できるのは、外部データソースにすでに存在するフィールドのみです。この操作は、既存の外部フィールドを Zilliz Cloud フィールドにマッピングするものであり、外部データソースに新しいフィールドを作成したり、ソースデータをバックフィルしたりするものではありません。

- 既存の外部コレクションへの `SPARSE_FLOAT_VECTOR` フィールドの追加はサポートされていません。

- 既存の外部コレクションへの StructArray フィールドの追加はサポートされていません。外部コレクションに StructArray フィールドが必要な場合は、コレクションの作成時にコレクションスキーマで定義します。

## フィールドの追加\{#add-a-field}

外部コレクションにフィールドを追加する前に、そのフィールドが外部データソースにすでに存在することを確認してください。次に、`add_collection_field()` を呼び出し、`external_field` に外部データソースのフィールド名を設定することで、Zilliz Cloud 上でそのフィールドを利用可能にします。また、`data_type` には、外部データソースのフィールドに対応する Zilliz Cloud データ型を設定します。たとえば、マッピング先のフィールドが倍精度値を格納する場合は、`DataType.DOUBLE` を使用します。

マネージドコレクションとは異なり、追加したフィールドの値は、外部コレクションのリフレッシュ後に外部データソースから読み取られます。

### スカラーフィールドの追加\{#add-a-scalar-field}

クエリ結果でフィールドを返したり、フィルターで使用したりする場合は、`add_collection_field()` を使用してスカラーフィールドを追加します。次の例では、外部データソースの `score` フィールドにマッピングされる `score` フィールドを追加しています。

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.add_collection_field(
    collection_name="product_embeddings",
    field_name="score",
    data_type=DataType.DOUBLE,
    nullable=True,
    # highlight-next-line
    external_field="score",
)
```

この例では、`score` が Zilliz Cloud 上のフィールド名であり、`external_field="score"` によって外部データソースの `score` フィールドにマッピングされます。コレクション作成後にフィールドを追加するため、`nullable=True` を設定します。

### ベクトルフィールドの追加\{#add-a-vector-field}

外部データソースにすでにベクトル値が含まれている場合は、ベクトルフィールドを追加することもできます。ベクトルの `data_type` と `dim` を、外部データソースのベクトルフィールドに合わせて設定してください。

次の例では、`image_embedding_v2` という名前の密ベクトルフィールドを追加しています。

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.add_collection_field(
    collection_name="product_embeddings",
    field_name="image_embedding_v2",
    data_type=DataType.FLOAT_VECTOR,
    dim=768,
    nullable=True,
    # highlight-next-line
    external_field="image_embedding_v2",
)
```

追加したベクトルフィールドでベクトル検索を実行する予定がある場合は、外部コレクションをリフレッシュする前に、そのフィールドのインデックスを作成してください。

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="image_embedding_v2",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_index(
    collection_name="product_embeddings",
    index_params=index_params,
)
```

## 外部コレクションのリフレッシュ\{#refresh-the-external-collection}

外部コレクションのスキーマを変更した後は、外部コレクションをリフレッシュしてください。これにより、Zilliz Cloud が外部コレクションのメタデータを更新し、クエリ、検索、フィルター結果にスキーマの変更が反映されます。

```python
client.refresh_external_collection(
    collection_name="product_embeddings"
)
```
