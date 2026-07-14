---
title: "External Collection スキーマの変更 | Cloud"
slug: /alter-external-collection-schema
sidebar_label: "スキーマの変更（External Collection）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "External data source は、external collection を作成した後に変更されることがよくあります。たとえば、すでに embedding を保存している lakehouse テーブルに、後から score、category、timestamp などの新しい scalar field が追加され、クエリ結果で返したりフィルターで使用したりしたい場合があります。 | Cloud"
type: origin
token: A9lowWdneiCQbZkgwrocKkT2nxW
sidebar_position: 19
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# External Collection スキーマの変更

external collection を作成した後、External data source は変更されることがよくあります。たとえば、すでに embedding を保存している lakehouse テーブルに、後から score、category、timestamp などの新しい scalar field が追加され、クエリ結果で返したりフィルターで使用したりしたい場合があります。

external collection を再作成したり、ソースデータを Zilliz Cloud にコピーしたりする代わりに、既存の External data source 内の field にマッピングする Zilliz Cloud field を追加します。field を追加した後、external collection を refresh すると、新しい field をクエリや検索で使用できるようになります。

## Limits\{#limits}

- 現在、external collection では作成後に field を追加することのみサポートされています。field の削除、field 名の変更、field のデータ型の変更、vector dimension の変更、`external_field` の再マッピングなど、その他のスキーマ変更はサポートされていません。

- 追加できるのは、External data source にすでに存在する field のみです。この操作は、既存の external field を Zilliz Cloud field にマッピングします。External data source に新しい field を作成したり、ソースデータを backfill したりするものではありません。

- 既存の external collection に `SPARSE_FLOAT_VECTOR` field を追加することはサポートされていません。

- 既存の external collection に StructArray field を追加することはサポートされていません。external collection で StructArray field が必要な場合は、collection の作成時に collection schema で定義してください。

## field の追加\{#add-a-field}

external collection に field を追加する前に、その field が External data source にすでに存在していることを確認してください。次に、`add_collection_field()` を呼び出し、`external_field` を External data source 内の field 名に設定して、その field を Zilliz Cloud で公開します。`data_type` には、External data source 内の field に一致する Zilliz Cloud のデータ型を設定します。たとえば、マッピング先の field が倍精度の値を保存している場合は、`DataType.DOUBLE` を使用します。

managed collection とは異なり、追加した field の値は、external collection を refresh した後に External data source から読み取られます。

### scalar field の追加\{#add-a-scalar-field}

クエリ結果で field を返したり、フィルターで使用したりしたい場合は、`add_collection_field()` を使用して scalar field を追加します。次の例では、External data source 内の `score` field にマッピングされる `score` field を追加します。

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

この例では、`score` が Zilliz Cloud field 名であり、`external_field="score"` によって External data source 内の `score` field にマッピングされます。collection はすでに作成済みのため、`nullable=True` を設定します。

### vector field の追加\{#add-a-vector-field}

External data source にすでに vector 値が含まれている場合は、vector field を追加することもできます。vector の `data_type` と `dim` は、External data source 内の vector field に一致するように設定してください。

次の例では、`image_embedding_v2` という名前の dense vector field を追加します。

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

追加した vector field に対して vector search を実行する予定がある場合は、external collection を refresh する前に、その field の index を作成してください。

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

## external collection の refresh\{#refresh-the-external-collection}

external collection schema を変更した後は、external collection を refresh して、Zilliz Cloud が external collection metadata を更新し、クエリ、検索、フィルター結果にスキーマ変更を反映できるようにします。

```python
client.refresh_external_collection(
    collection_name="product_embeddings"
)
```
