---
title: "RTREE | BYOC"
slug: /rtree-index-type
sidebar_label: "RTREE"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`RTREE` インデックスは、Zilliz Cloud における `GEOMETRY` フィールドのクエリを高速化するツリーベースのデータ構造です。collection にポイント、ライン、またはポリゴンなどの幾何オブジェクトが Well-known text (WKT) 形式で保存されており、空間フィルタリングを高速化したい場合、`RTREE` は理想的な選択です。 | BYOC"
type: origin
token: RlY2wylVQiZswikT0G2cBHVznTf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# RTREE

`RTREE` インデックスは、Zilliz Cloud における `GEOMETRY` フィールドのクエリを高速化するツリーベースのデータ構造です。collection にポイント、ライン、またはポリゴンなどの幾何オブジェクトが [Well-known text (WKT)](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry) 形式で保存されており、空間フィルタリングを高速化したい場合、`RTREE` は理想的な選択です。

## 仕組み\{#how-it-works}

Zilliz Cloud は `RTREE` インデックスを使用して geometry データを効率的に整理・フィルタリングし、次の 2 段階のプロセスに従います。

### フェーズ 1: インデックスの構築\{#phase-1-build-the-index}

1. **リーフノードを作成:** 各 geometry オブジェクトについて、そのオブジェクトを完全に含む最小の矩形である [Minimum Bounding Rectangle](https://en.wikipedia.org/wiki/Minimum_bounding_rectangle) (MBR) を計算し、リーフノードとして保存します。

1. **より大きなボックスにグループ化:** 近接するリーフノードをまとめてクラスタ化し、各グループを新しい MBR で包んで内部ノードを形成します。たとえば、グループ **B** には **D** と **E** が含まれ、グループ **C** には **F** と **G** が含まれます。

1. **ルートノードを追加:** すべての内部グループを覆う MBR を持つルートノードを追加し、高さが平衡なツリー構造を作成します。

![Asy8w0umqh9jJ1biNUHcialonfd](https://zdoc-images.s3.us-west-2.amazonaws.com/Asy8w0umqh9jJ1biNUHcialonfd.png)

### フェーズ 2: クエリの高速化\{#phase-2-accelerate-queries}

1. **クエリ MBR を形成:** クエリ geometry の MBR を計算します。

1. **ブランチを枝刈り:** ルートから開始し、クエリ MBR を各内部ノードと比較します。MBR がクエリ MBR と交差しないブランチはスキップします。

1. **候補を収集:** 交差するブランチへ下って、候補となるリーフノードを収集します。

1. **完全一致:** 各候補に対して厳密な空間述語を実行し、真の一致を判定します。

## RTREE インデックスを作成する\{#create-an-rtree-index}

collection schema で定義された `GEOMETRY` フィールドに `RTREE` インデックスを作成できます。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # Replace with your server address

# Assume you have defined a GEOMETRY field named "geo" in your collection schema

# Prepare index parameters
index_params = client.prepare_index_params()

# Add RTREE index on the "geo" field
# highlight-start
index_params.add_index(
    field_name="geo",
    index_type="RTREE",      # Spatial index for GEOMETRY
    index_name="rtree_geo",  # Optional, name your index
    params={}                # No extra params needed
)
# highlight-end

# Create the index on the collection
client.create_index(
    collection_name="geo_demo",
    index_params=index_params
)
```

## RTREE を使用してクエリする\{#query-with-rtree}

`filter` 式で geometry 演算子を使用してフィルタリングします。対象の `GEOMETRY` フィールドに `RTREE` が存在する場合、Zilliz Cloud は自動的にそれを使用して候補を枝刈りします。インデックスがない場合、フィルターはフルスキャンにフォールバックします。

利用可能な geometry 専用演算子の完全な一覧については、[Geometry Operators](./geometry-operators) を参照してください。

### 例 1: フィルタのみ\{#example-1-filter-only}

指定されたポリゴン内にあるすべての幾何オブジェクトを検索します。

```python
filter_expr = "ST_CONTAINS(geo, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')"

res = client.query(
    collection_name="geo_demo",
    filter=filter_expr,
    output_fields=["id", "geo"],
    limit=10
)
print(res)   # Expected: a list of rows where geo is entirely inside the polygon
```

### 例 2: vector 検索 + 空間フィルター\{#example-2-vector-search-spatial-filter}

ラインと交差する最も近い vector を検索します。

```python
# Assume you've also created an index on "vec" and loaded the collection.
query_vec = [[0.1, 0.2, 0.3, 0.4, 0.5]]
filter_expr = "ST_INTERSECTS(geo, 'LINESTRING (1 1, 2 2)')"

hits = client.search(
    collection_name="geo_demo",
    data=query_vec,
    limit=5,
    filter=filter_expr,
    output_fields=["id", "geo"]
)
print(hits)  # Expected: top-k by vector similarity among rows whose geo intersects the line
```

`GEOMETRY` フィールドの使用方法の詳細については、[Geometry Field](./use-geometry-field) を参照してください。

## インデックスを削除する\{#drop-an-index}

`drop_index()` メソッドを使用して、collection から既存のインデックスを削除します。

<Admonition type="info" icon="📘" title="注意">

**Milvus v2.6.x** と互換性のある cluster では、不要になった scalar index を直接削除できます。事前に collection を release する必要はありません。

</Admonition>

```python
client.drop_index(
    collection_name="geo_demo",   # Name of the collection
    index_name="rtree_geo" # Name of the index to drop
)
```
