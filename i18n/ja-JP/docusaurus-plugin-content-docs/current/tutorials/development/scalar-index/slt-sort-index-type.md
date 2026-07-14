---
title: "STL_SORT | Cloud"
slug: /slt-sort-index-type
sidebar_label: "STL_SORT"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`STLSORT` インデックスは、データをソート順に整理することで、Zilliz Cloud 内の数値フィールド（INT8、INT16 など）、`VARCHAR` フィールド、または `TIMESTAMPTZ` フィールドに対するクエリ性能を向上させるために特別に設計されたインデックスタイプです。 | Cloud"
type: origin
token: YBYmwvx68iMKFRknytJccwk0nPf
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# STL_SORT

`STL_SORT` インデックスは、データをソート順に整理することで、Zilliz Cloud 内の数値フィールド（INT8、INT16 など）、`VARCHAR` フィールド、または `TIMESTAMPTZ` フィールドに対するクエリ性能を向上させるために特別に設計されたインデックスタイプです。

次のようなクエリを頻繁に実行する場合は、`STL_SORT` インデックスを使用してください。

- `==`、`!=`、`>`、`<`、`>=`、`<=` 演算子を使用する比較フィルタリング

- `IN` および `LIKE` 演算子を使用する範囲フィルタリング

## サポートされるデータ型\{#supported-data-types}

- 数値フィールド（例: `INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、`DOUBLE`）。詳細は、[Boolean & Number](./use-number-field) を参照してください。

- `VARCHAR` フィールド。詳細は、[String Field](./use-string-field) を参照してください。

- `TIMESTAMPTZ` フィールド。詳細は、[TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。

## 仕組み\{#how-it-works}

Zilliz Cloud は `STL_SORT` を 2 つのフェーズで実装します。

1. **インデックスの構築**

    - 取り込み中に、Zilliz Cloud はインデックス対象フィールドのすべての値を収集します。

    - 値は C++ STL の [std::sort](https://en.cppreference.com/w/cpp/algorithm/sort.html) を使用して昇順にソートされます。

    - 各値はそのエンティティ ID とペアになり、ソート済み配列がインデックスとして永続化されます。

1. **クエリの高速化**

    - クエリ時に、Zilliz Cloud はソート済み配列に対して **二分探索**（[std::lower_bound](https://en.cppreference.com/w/cpp/algorithm/lower_bound.html) および [std::upper_bound](https://en.cppreference.com/w/cpp/algorithm/upper_bound.html)）を使用します。

    - 等価比較では、Zilliz Cloud は一致するすべての値をすばやく見つけます。

    - 範囲指定では、Zilliz Cloud は開始位置と終了位置を特定し、その間にあるすべての値を返します。

    - 一致したエンティティ ID は、最終結果を組み立てるためにクエリエグゼキューターに渡されます。

これにより、クエリの計算量は **O(n)**（フルスキャン）から **O(log n + m)** に削減されます。ここで *m* は一致件数です。

## STL_SORT インデックスを作成する\{#create-an-stlsort-index}

数値、`VARCHAR`、または `TIMESTAMPTZ` フィールドに `STL_SORT` インデックスを作成できます。追加のパラメータは不要です。

以下の例は、`TIMESTAMPTZ` フィールドに `STL_SORT` インデックスを作成する方法を示しています。

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

## インデックスを削除する\{#drop-an-index}

既存のインデックスをコレクションから削除するには、`drop_index()` メソッドを使用します。

<Admonition type="info" icon="📘" title="注意">

**Milvus v2.6.x** と互換性のあるクラスターでは、不要になったスカラーインデックスを直接削除できます。事前にコレクションをリリースする必要はありません。

</Admonition>

```python
client.drop_index(
    collection_name="tsz_demo",   # Name of the collection
    index_name="tsz_index" # Name of the index to drop
)
```

## 使用上の注意\{#usage-notes}

- **フィールド型:** 数値、`VARCHAR`、および `TIMESTAMPTZ` フィールドで動作します。データ型の詳細については、[Boolean & Number](./use-number-field) および [TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。

- **パラメータ:** インデックスパラメータは不要です。

- **Mmap は非対応:** `STL_SORT` ではメモリマップモードは利用できません。

