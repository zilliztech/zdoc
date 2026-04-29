---
title: "RTREE | BYOC"
slug: /rtree-index-type
sidebar_key: rtree-index-type
sidebar_label: "RTREE"
beta: FALSE
notebook: FALSE
description: "`RTREE` インデックスは、Zilliz Cloud において `GEOMETRY` フィールドに対するクエリを高速化するツリーベースのデータ構造です。コレクションに Well-known text (WKT) 形式のポイント、ライン、ポリゴンなどの幾何オブジェクトが格納されており、空間フィルタリングを高速化したい場合、`RTREE` が最適な選択肢となります。 | BYOC"
type: origin
token: RlY2wylVQiZswikT0G2cBHVznTf
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - スカラーフィールド
  - geometry
  - rtree

---

import Admonition from '@theme/Admonition';


# RTREE

`RTREE` インデックスは、Zilliz Cloud において `GEOMETRY` フィールドに対するクエリの高速化を実現するツリーベースのデータ構造です。コレクションに [Well-known text (WKT)](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry) 形式のポイント、ライン、ポリゴンなどの幾何オブジェクトが格納されており、空間フィルタリングを高速化したい場合、`RTREE` は理想的な選択肢です。

## 仕組み\{#how-it-works}

Zilliz Cloud では、`RTREE` インデックスを使用して幾何データを効率的に整理およびフィルタリングします。このプロセスは以下の 2 つの段階で構成されます。

### フェーズ 1: インデックスの構築\{#phase-1-build-the-index}

1. **リーフノードの作成:** 各幾何オブジェクトについて、そのオブジェクトを完全に包含する最小の矩形である [Minimum Bounding Rectangle](https://en.wikipedia.org/wiki/Minimum_bounding_rectangle) (MBR) を計算し、それをリーフノードとして保存します。

1. **より大きなボックスへのグループ化:** 近接するリーフノードをクラスタリングし、各グループを新しい MBR で囲んで内部ノードを形成します。例えば、グループ **B** には **D** と **E** が含まれ、グループ **C** には **F** と **G** が含まれます。

1. **ルートノードの追加:** すべての内部グループをカバーする MBR を持つルートノードを追加し、高さ平衡の木構造を作成します。

![Asy8w0umqh9jJ1biNUHcialonfd](https://zdoc-images.s3.us-west-2.amazonaws.com/Asy8w0umqh9jJ1biNUHcialonfd.png)

### フェーズ 2: クエリの高速化\{#phase-2-accelerate-queries}

1. **クエリ MBR の作成:** クエリ幾何オブジェクトの MBR を計算します。

1. **ブランチの剪定:** ルートから開始し、クエリ MBR と各内部ノードを比較します。クエリ MBR と交差しない MBR を持つブランチはスキップします。

1. **候補の収集:** 交差するブランチ descend して、候補となるリーフノードを集めます。

1. **完全一致:** 各候補に対して、正確な空間述語を実行して真の一致を判定します。

## RTREE インデックスの作成\{#create-an-rtree-index}

コレクションスキーマで定義された `GEOMETRY` フィールドに対して `RTREE` インデックスを作成できます。

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

## Query with RTREE\{#query-with-rtree}

`filter` 式でジオメトリ演算子を使用してフィルタリングできます。対象の `GEOMETRY` フィールドに `RTREE` が存在する場合、Zilliz Cloud はそれを自動的に使用して候補を絞り込みます。インデックスがない場合、フィルタはフルスキャンにフォールバックします。

利用可能なジオメトリ固有の演算子の完全なリストについては、[ジオメトリ Operators](./geometry-operators) を参照してください。

### Example 1: Filter only\{#example-1-filter-only}

指定されたポリゴン内のすべてのジオメトリオブジェクトを検索します：

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

### 例 2: ベクトル検索 + 空間フィルタ\{#example-2-vector-search-spatial-filter}

線と交差する最も近いベクトルを検索します：

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

`GEOMETRY` フィールドの使用方法の詳細については、[ジオメトリフィールド](./use-geometry-field) を参照してください。

## インデックスの削除\{#drop-an-index}

`drop_index()` メソッドを使用して、コレクションから既存のインデックスを削除します。

<Admonition type="info" icon="📘" title="Notes">

<p><strong>Milvus v2.6.x</strong> と互換性のあるクラスターでは、不要になったスカラーインデックスを、コレクションを最初にリリースすることなく直接削除できます。</p>

</Admonition>

```python
client.drop_index(
    collection_name="geo_demo",   # Name of the collection
    index_name="rtree_geo" # Name of the index to drop
)
```
