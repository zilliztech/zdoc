---
title: "RTREE | Cloud"
slug: /rtree-index-type
sidebar_label: "RTREE"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`RTREE` index はツリーベースのデータ構造で、Zilliz Cloud の `GEOMETRY` フィールドに対するクエリを高速化します。collection に points、lines、polygans などの幾何オブジェクトが Well-known text (WKT) 形式で格納されており、空間フィルタリングを高速化したい場合、`RTREE` は理想的な選択肢です。 | Cloud"
type: origin
token: RlY2wylVQiZswikT0G2cBHVznTf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# RTREE

`RTREE` index はツリーベースのデータ構造で、Zilliz Cloud の `GEOMETRY` フィールドに対するクエリを高速化します。collection に points、lines、polygans などの幾何オブジェクトが [Well-known text (WKT)](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry) 形式で格納されており、空間フィルタリングを高速化したい場合、`RTREE` は理想的な選択肢です。

## 仕組み\{#how-it-works}

Zilliz Cloud は `RTREE` index を使用して geometry データを効率的に整理およびフィルタリングし、2 段階のプロセスに従って動作します。

### フェーズ 1: index の構築\{#phase-1-build-the-index}

1. **リーフノードを作成する:** 各 geometry オブジェクトについて、そのオブジェクトを完全に含む最小の矩形である [Minimum Bounding Rectangle](https://en.wikipedia.org/wiki/Minimum_bounding_rectangle) (MBR) を計算し、リーフノードとして保存します。

1. **より大きなボックスにグループ化する:** 近接するリーフノードをまとめてクラスタ化し、各グループを新しい MBR で囲んで内部ノードを形成します。たとえば、グループ **B** には **D** と **E** が含まれ、グループ **C** には **F** と **G** が含まれます。

1. **ルートノードを追加する:** すべての内部グループを覆う MBR を持つルートノードを追加し、高さバランスの取れたツリー構造を作成します。

![Asy8w0umqh9jJ1biNUHcialonfd](https://zdoc-images.s3.us-west-2.amazonaws.com/Asy8w0umqh9jJ1biNUHcialonfd.png)

### フェーズ 2: クエリの高速化\{#phase-2-accelerate-queries}

1. **クエリ MBR を形成する:** クエリ geometry の MBR を計算します。

1. **ブランチを枝刈りする:** ルートから開始し、クエリ MBR を各内部ノードと比較します。MBR がクエリ MBR と交差しないブランチはスキップします。

1. **候補を収集する:** 交差するブランチへ降下し、候補となるリーフノードを集めます。

1. **完全一致:** 各候補に対して正確な空間述語を実行し、真の一致を判定します。

## RTREE index を作成する\{#create-an-rtree-index}

collection schema で定義された `GEOMETRY` フィールドに `RTREE` index を作成できます。

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

## RTREE を使ってクエリする\{#query-with-rtree}

`filter` 式で geometry 演算子を使用してフィルタリングします。対象の `GEOMETRY` フィールドに `RTREE` が存在する場合、Zilliz Cloud はこれを使用して候補を自動的に枝刈りします。index がない場合、フィルタはフルスキャンにフォールバックします。

利用可能な geometry 専用演算子の完全な一覧については、[Geometry Operators](./geometry-operators) を参照してください。

### 例 1: フィルタのみ\{#example-1-filter-only}

指定した polygon 内にあるすべての幾何オブジェクトを検索します。

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

### 例 2: vector search + 空間フィルタ\{#example-2-vector-search-spatial-filter}

線と交差する最近傍 vector を検索します。

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

## index を削除する\{#drop-an-index}

`drop_index()` メソッドを使用して、collection から既存の index を削除します。

<Admonition type="info" icon="📘" title="注意">

**Milvus v2.6.x** と互換性のある cluster では、不要になった scalar index を直接削除できます。事前に collection を release する必要はありません。

</Admonition>

```python
client.drop_index(
    collection_name="geo_demo",   # Name of the collection
    index_name="rtree_geo" # Name of the index to drop
)
```
