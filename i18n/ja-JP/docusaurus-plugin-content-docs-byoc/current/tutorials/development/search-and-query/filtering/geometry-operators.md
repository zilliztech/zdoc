---
title: "ジオメトリ演算子 | BYOC"
slug: /geometry-operators
sidebar_label: "Geometry"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、幾何学データの管理と分析に不可欠な `GEOMETRY` フィールドに対する空間フィルタリング用の演算子セットをサポートしています。これらの演算子を使用すると、オブジェクト間の幾何学的関係に基づいてエンティティを取得できます。 | BYOC"
type: origin
token: SOgiwzPxpisy8MkhtuecZqFbnaf
sidebar_position: 9
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# ジオメトリ演算子

Zilliz Cloud は、幾何学データの管理と分析に不可欠な `GEOMETRY` フィールドに対する空間フィルタリング用の演算子セットをサポートしています。これらの演算子を使用すると、オブジェクト間の幾何学的関係に基づいてエンティティを取得できます。

すべてのジオメトリ演算子は、2 つの幾何学引数を受け取って動作します。1 つはコレクションスキーマで定義された `GEOMETRY` フィールド名、もう 1 つは [Well-Known Text](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry)（WKT）形式で表された対象のジオメトリオブジェクトです。

## 使用構文\{#use-syntax}

`GEOMETRY` フィールドに対してフィルタリングするには、式の中でジオメトリ演算子を使用します。

- 一般: `{operator}(geo_field, '{wkt}')`

- 距離ベース: `ST_DWITHIN(geo_field, '{wkt}', distance)`

ここで:

- `operator` はサポートされているジオメトリ演算子の 1 つです（例: `ST_CONTAINS`, `ST_INTERSECTS`）。演算子名はすべて大文字またはすべて小文字である必要があります。サポートされている演算子の一覧については、[サポートされているジオメトリ演算子](./geometry-operators#supported-geometry-operators) を参照してください。

- `geo_field` は `GEOMETRY` フィールドの名前です。

- `'{wkt}'` は、クエリ対象のジオメトリの WKT 表現です。

- `distance` は `ST_DWITHIN` 専用のしきい値です。

Zilliz Cloud の `GEOMETRY` フィールドの詳細については、[ジオメトリフィールド](./use-geometry-field) を参照してください。

## サポートされているジオメトリ演算子\{#supported-geometry-operators}

次の表は、Zilliz Cloud で利用可能なジオメトリ演算子を示しています。

<Admonition type="info" icon="📘" title="注意">

演算子名は **すべて大文字** または **すべて小文字** である必要があります。同じ演算子名の中で大文字と小文字を混在させないでください。

</Admonition>

| 演算子 | 説明 | 例 |
| --- | --- | --- |
| `ST_EQUALS(A, B)` / `st_equals(A, B)` | 2 つのジオメトリが空間的に同一、つまり同じ点集合と次元を持つ場合に TRUE を返します。 | 2 つのジオメトリ（A と B）は空間上で完全に同じですか？ |
| `ST_CONTAINS(A, B)` / `st_contains(A, B)` | ジオメトリ A がジオメトリ B を完全に含み、その内部同士が少なくとも 1 つの共通点を持つ場合に TRUE を返します。 | 市の境界（A）は特定の公園（B）を含んでいますか？ |
| `ST_CROSSES(A, B)` / `st_crosses(A, B)` | ジオメトリ A と B が部分的に交差するが、互いを完全には含まない場合に TRUE を返します。 | 2 本の道路（A と B）は交差点で交わっていますか？ |
| `ST_INTERSECTS(A, B)` / `st_intersects(A, B)` | ジオメトリ A と B が少なくとも 1 つの共通点を持つ場合に TRUE を返します。これは最も一般的で広く使用される空間クエリです。 | 検索エリア（A）はいずれかの店舗位置（B）と交差していますか？ |
| `ST_OVERLAPS(A, B)` / `st_overlaps(A, B)` | ジオメトリ A と B が同じ次元を持ち、部分的に重なり、かつどちらも相手を完全には含まない場合に TRUE を返します。 | 2 つの土地区画（A と B）は重なっていますか？ |
| `ST_TOUCHES(A, B)` / `st_touches(A, B)` | ジオメトリ A と B が共通の境界を共有するが、その内部同士は交差しない場合に TRUE を返します。 | 隣接する 2 つの不動産（A と B）は境界を共有していますか？ |
| `ST_WITHIN(A, B)` / `st_within(A, B)` | ジオメトリ A がジオメトリ B の内部に完全に含まれ、その内部同士が少なくとも 1 つの共通点を持つ場合に TRUE を返します。これは `ST_Contains(B, A)` の逆です。 | 特定の関心地点（A）は定義された検索半径（B）の内側にありますか？ |
| `ST_DWITHIN(A, B, distance)` / `st_dwithin(A, B, distance)` | ジオメトリ A とジオメトリ B の距離が、指定された距離以下である場合に TRUE を返します。<br/>**注**: 現在、ジオメトリ B はポイントのみをサポートしています。距離の単位はメートルです。 | 特定のポイント（B）から 5000 メートル以内にあるすべてのポイントを検索します。 |

## ST_EQUALS / st_equals\{#stequals-stequals}

`ST_EQUALS` 演算子は、2 つのジオメトリが空間的に同一、つまり同じ点集合と次元を持つ場合に TRUE を返します。これは、保存されている 2 つのジオメトリオブジェクトが完全に同じ位置と形状を表しているかを確認するのに役立ちます。

**例**

保存されているジオメトリ（ポイントやポリゴンなど）が、対象のジオメトリと完全に同じかどうかを確認したいとします。たとえば、保存されているポイントを特定の関心地点と比較できます。

```python
# The filter expression to check if a geometry matches a specific point
filter = "ST_EQUALS(geo_field, 'POINT(10 20)')"
```

## ST_CONTAINS / st_contains\{#stcontains-stcontains}

`ST_CONTAINS` 演算子は、最初のジオメトリが 2 番目のジオメトリを完全に含む場合に TRUE を返します。これは、ポリゴン内のポイントや、大きなポリゴン内の小さなポリゴンを見つけるのに役立ちます。

**例**

市区のコレクションがあり、特定の市区の境界内にあるレストランなどの特定の関心地点を見つけたいとします。

```python
# The filter expression to find geometries completely within a specific polygon.
filter = "ST_CONTAINS(geo_field, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')"
```

## ST_CROSSES / st_crosses\{#stcrosses-stcrosses}

`ST_CROSSES` 演算子は、2 つのジオメトリの交差部分が元のジオメトリよりも低い次元のジオメトリを形成する場合に `TRUE` を返します。これは通常、線がポリゴンまたは別の線を横切る場合に適用されます。

**例**

特定の境界線（別のライン文字列）を横切る、または保護区域（ポリゴン）に入るすべてのハイキングコース（ライン文字列）を見つけたいとします。

```python
# The filter expression to find geometries that cross a line string.
filter = "ST_CROSSES(geo_field, 'LINESTRING(5 0, 5 10)')"
```

## ST_INTERSECTS / st_intersects\{#stintersects-stintersects}

`ST_INTERSECTS` 演算子は、2 つのジオメトリの境界または内部に共通のポイントがある場合に `TRUE` を返します。これは、あらゆる形式の空間的重なりを検出するための汎用演算子です。

**例**

道路のコレクションがあり、提案されている新しい道路を表す特定のライン文字列と交差または接触するすべての道路を見つけたい場合は、`ST_INTERSECTS` を使用できます。

```python
# The filter expression to find geometries that intersect with a specific line string.
filter = "ST_INTERSECTS(geo_field, 'LINESTRING (1 1, 2 2)')"
```

## ST_OVERLAPS / st_overlaps\{#stoverlaps-stoverlaps}

`ST_OVERLAPS` 演算子は、同じ次元を持つ 2 つのジオメトリが部分的に交差し、その交差部分自体も元のジオメトリと同じ次元を持つが、どちらとも等しくない場合に `TRUE` を返します。

**例**

重複する販売地域のセットがあり、新たに提案された販売ゾーンと部分的に重なるすべての地域を見つけたいとします。

```python
# The filter expression to find geometries that partially overlap with a polygon.
filter = "ST_OVERLAPS(geo_field, 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))')"
```

## ST_TOUCHES / st_touches\{#sttouches-sttouches}

`ST_TOUCHES` 演算子は、2 つのジオメトリの境界が接しているが、その内部は交差しない場合に `TRUE` を返します。これは隣接関係の検出に役立ちます。

**例**

不動産区画の地図があり、重なりなしで公共公園に直接隣接するすべての区画を見つけたい場合です。

```python
# The filter expression to find geometries that only touch a line string at their boundaries.
filter = "ST_TOUCHES(geo_field, 'LINESTRING(0 0, 1 1)')"
```

## ST_WITHIN / st_within\{#stwithin-stwithin}

`ST_WITHIN` 演算子は、最初のジオメトリが 2 番目のジオメトリの内部または境界上に完全に含まれる場合に `TRUE` を返します。これは `ST_CONTAINS` の逆です。

**例**

より大きく指定された公園区域の中に完全に位置する小さな住宅地域をすべて見つけたいとします。

```python
# The filter expression to find geometries that are completely within a larger polygon.
filter = "ST_WITHIN(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')"
```

`GEOMETRY` フィールドの使用方法の詳細については、[ジオメトリフィールド](./use-geometry-field) を参照してください。

## ST_DWITHIN / st_dwithin\{#stdwithin-stdwithin}

`ST_DWITHIN` 演算子は、ジオメトリ A とジオメトリ B の距離が指定された値（メートル単位）以下である場合に `TRUE` を返します。現在、ジオメトリ B はポイントである必要があります。

**例**

店舗位置のコレクションがあり、特定の顧客の位置から 5,000 メートル以内にあるすべての店舗を見つけたいとします。

```python
# Find all stores within 5000 meters of the point (120 30)
filter = "ST_DWITHIN(geo_field, 'POINT(120 30)', 5000)"
```
