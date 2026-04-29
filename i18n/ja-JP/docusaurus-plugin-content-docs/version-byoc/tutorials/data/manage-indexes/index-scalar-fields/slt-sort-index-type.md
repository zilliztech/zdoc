---
title: "STL_SORT | BYOC"
slug: /slt-sort-index-type
sidebar_key: slt-sort-index-type
sidebar_label: "STL_SORT"
beta: FALSE
notebook: FALSE
description: "`STLSORT` インデックスは、データをソートされた順序で整理することで、Zilliz Cloud 内の数値フィールド（INT8、INT16 など）、`VARCHAR` フィールド、または `TIMESTAMPTZ` フィールドに対するクエリパフォーマンスを向上させるために特別に設計されたインデックスタイプです。| BYOC"
type: origin
token: YBYmwvx68iMKFRknytJccwk0nPf
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - スカラーフィールド
  - timestamptz
  - slt_sort
  - sltsort
  - int8
  - int16
  - int32
  - int64

---

import Admonition from '@theme/Admonition';


# STL_SORT

`STL_SORT` インデックスは、Zilliz Cloud 内の数値フィールド（INT8、INT16 など）、`VARCHAR` フィールド、または `TIMESTAMPTZ` フィールドのクエリパフォーマンスを向上させるために特別に設計されたインデックスタイプであり、データをソートされた順序で整理します。

以下の条件でクエリを頻繁に実行する場合は、`STL_SORT` インデックスを使用してください：

- `==`、`!=`、`>`、`<`、`>=`、および `<=` 演算子を使用した比較フィルタリング

- `IN` および `LIKE` 演算子を使用した範囲フィルタリング

## Supported data types\{#supported-data-types}

- 数値フィールド（例：`INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、`DOUBLE`）。詳細については、[Boolean & Number](./use-number-field) を参照してください。

- `VARCHAR` フィールド。詳細については、[String Field](./use-string-field) を参照してください。

- `TIMESTAMPTZ` フィールド。詳細については、[TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。

## How it works\{#how-it-works}

Zilliz Cloud は `STL_SORT` を 2 つのフェーズで実装します：

1. **インデックスの構築**

    - データ取り込み中に、Zilliz Cloud はインデックス対象フィールドのすべての値を収集します。

    - 値は C++ STL の [std::sort](https://en.cppreference.com/w/cpp/algorithm/sort.html) を使用して昇順にソートされます。

    - 各値はそのエンティティ ID とペアになり、ソートされた配列がインデックスとして永続化されます。

1. **クエリの高速化**

    - クエリ実行時、Zilliz Cloud はソートされた配列に対して**二分探索**（[std::lower_bound](https://en.cppreference.com/w/cpp/algorithm/lower_bound.html) および [std::upper_bound](https://en.cppreference.com/w/cpp/algorithm/upper_bound.html)）を使用します。

    - 等価検索の場合、Zilliz Cloud は一致するすべての値を迅速に見つけます。

    - 範囲検索の場合、Zilliz Cloud は開始位置と終了位置を特定し、その間のすべての値を返します。

    - 一致したエンティティ ID は、最終的な結果を組み立てるためにクエリ実行エンジンに渡されます。

これにより、クエリの計算量が **O(n)**（フルスキャン）から **O(log n + m)** に削減されます。ここで、*m* は一致件数です。

## Create an STL_SORT index\{#create-an-stlsort-index}

数値、`VARCHAR`、または `TIMESTAMPTZ` フィールドに対して `STL_SORT` インデックスを作成できます。追加のパラメータは不要です。

以下の例では、`TIMESTAMPTZ` フィールドに `STL_SORT` インデックスを作成する方法を示しています：

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # Replace with your server address

# Assume you have defined a TIMESTAMPTZ field named "tsz" in your collection schema

# Prepare index parameters
index_params = client.prepare_index_params()

# Add RTREE index on the "tsz" field
# highlight-start
index_params.add_index(
    field_name="tsz",
    index_type="STL_SORT",   # Index for TIMESTAMPTZ
    index_name="tsz_index",  # Optional, name your index
    params={}                # No extra params needed
)
# highlight-end

# Create the index on the collection
client.create_index(
    collection_name="tsz_demo",
    index_params=index_params
)
```

## インデックスの削除\{#drop-an-index}

`drop_index()` メソッドを使用して、コレクションから既存のインデックスを削除します。

<Admonition type="info" icon="📘" title="Notes">

<p><strong>Milvus v2.6.x</strong> と互換性のあるクラスターでは、不要になったスカラーインデックスを、コレクションを最初にリリースすることなく直接削除できます。</p>

</Admonition>

```python
client.drop_index(
    collection_name="tsz_demo",   # Name of the collection
    index_name="tsz_index" # Name of the index to drop
)
```

## Usage notes\{#usage-notes}

- **フィールド型:** 数値、`VARCHAR`、および `TIMESTAMPTZ` フィールドで動作します。データ型の詳細については、[Boolean & Number](./use-number-field) および [TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。

- **Parameters:** インデックスパラメータは不要です。

- **Mmap サポートされていません:** メモリマップドモードは `STL_SORT` ではサポートされていません。

