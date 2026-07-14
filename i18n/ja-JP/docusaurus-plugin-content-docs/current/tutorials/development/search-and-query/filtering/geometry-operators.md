---
title: "Geometry Operators | Cloud"
slug: /geometry-operators
sidebar_label: "Geometry"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、幾何データの管理と分析に不可欠な `GEOMETRY` フィールドに対する空間フィルタリング用の演算子セットをサポートしています。これらの演算子により、オブジェクト間の幾何学的関係に基づいてエンティティを取得できます。 | Cloud"
type: origin
token: SOgiwzPxpisy8MkhtuecZqFbnaf
sidebar_position: 9
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Geometry Operators

Zilliz Cloud は、幾何データの管理と分析に不可欠な `GEOMETRY` フィールドに対する空間フィルタリング用の演算子セットをサポートしています。これらの演算子により、オブジェクト間の幾何学的関係に基づいてエンティティを取得できます。

すべての geometry 演算子は、2 つの幾何引数を取って動作します。1 つは collection スキーマで定義された `GEOMETRY` フィールドの名前、もう 1 つは [Well-Known Text](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry)（WKT）形式で表現された対象の geometry オブジェクトです。

## Use syntax\{#use-syntax}

`GEOMETRY` フィールドに対してフィルタリングするには、式の中で geometry 演算子を使用します。

- 一般: `{operator}(geo_field, '{wkt}')`

- 距離ベース: `ST_DWITHIN(geo_field, '{wkt}', distance)`

ここで:

- `operator` はサポートされている geometry 演算子の 1 つです（例: `ST_CONTAINS`, `ST_INTERSECTS`）。演算子名はすべて大文字またはすべて小文字である必要があります。サポートされている演算子の一覧については、[Supported geometry operators](./geometry-operators#supported-geometry-operators) を参照してください。

- `geo_field` は `GEOMETRY` フィールドの名前です。

- `'{wkt}'` はクエリ対象の geometry の WKT 表現です。

- `distance` は `ST_DWITHIN` 専用のしきい値です。

Zilliz Cloud の `GEOMETRY` フィールドの詳細については、[Geometry Field](./use-geometry-field) を参照してください。

## Supported geometry operators\{#supported-geometry-operators}

次の表は、Zilliz Cloud で利用可能な geometry 演算子を示しています。

<Admonition type="info" icon="📘" title="Notes">

演算子名は **すべて大文字** または **すべて小文字** である必要があります。同じ演算子名の中で大文字と小文字を混在させないでください。

</Admonition>

| Operator | Description | Example |
| --- | --- | --- |
| `ST_EQUALS(A, B)` / `st_equals(A, B)` | 2 つの geometry が空間的に同一、つまり同じ点集合と次元を持つ場合に TRUE を返します。 | 2 つの geometry（A と B）は空間上で完全に同じですか？ |
| `ST_CONTAINS(A, B)` / `st_contains(A, B)` | geometry A が geometry B を完全に含み、それらの内部が少なくとも 1 点を共有する場合に TRUE を返します。 | 都市の境界（A）は特定の公園（B）を含んでいますか？ |
| `ST_CROSSES(A, B)` / `st_crosses(A, B)` | geometry A と B が部分的に交差するが、互いを完全には含まない場合に TRUE を返します。 | 2 本の道路（A と B）は交差点で交わっていますか？ |
| `ST_INTERSECTS(A, B)` / `st_intersects(A, B)` | geometry A と B が少なくとも 1 つの共通点を持つ場合に TRUE を返します。これは最も一般的で広く使用される空間クエリです。 | 検索エリア（A）はいずれかの店舗位置（B）と交差していますか？ |
| `ST_OVERLAPS(A, B)` / `st_overlaps(A, B)` | geometry A と B が同じ次元を持ち、部分的に重なり、どちらも相手を完全には含まない場合に TRUE を返します。 | 2 つの土地区画（A と B）は重なっていますか？ |
| `ST_TOUCHES(A, B)` / `st_touches(A, B)` | geometry A と B が共通の境界を共有するが、その内部は交差しない場合に TRUE を返します。 | 隣接する 2 つの不動産（A と B）は境界を共有していますか？ |
| `ST_WITHIN(A, B)` / `st_within(A, B)` | geometry A が geometry B の内部に完全に含まれ、それらの内部が少なくとも 1 点を共有する場合に TRUE を返します。これは `ST_Contains(B, A)` の逆です。 | 特定の関心地点（A）は定義された検索半径（B）の内側にありますか？ |
| `ST_DWITHIN(A, B, distance)` / `st_dwithin(A, B, distance)` | geometry A と geometry B の距離が指定された距離以下である場合に TRUE を返します。<br/>**Note**: 現在、geometry B は points のみをサポートしています。距離の単位はメートルです。 | 特定の point（B）から 5000 メートル以内にあるすべての points を検索します。 |

## ST_EQUALS / st_equals\{#stequals-stequals}

`ST_EQUALS` 演算子は、2 つの geometry が空間的に同一、つまり同じ点集合と次元を持つ場合に TRUE を返します。これは、保存された 2 つの geometry オブジェクトがまったく同じ位置と形状を表しているかを確認するのに役立ちます。

**Example**

保存された geometry（point や polygon など）が対象の geometry と完全に同じかどうかを確認したいとします。たとえば、保存された point を特定の関心地点と比較できます。

```python
# The filter expression to check if a geometry matches a specific point
filter = "ST_EQUALS(geo_field, 'POINT(10 20)')"
```

## ST_CONTAINS / st_contains\{#stcontains-stcontains}

`ST_CONTAINS` 演算子は、最初の geometry が 2 番目の geometry を完全に含む場合に TRUE を返します。これは、polygon 内の points や、大きな polygon 内のより小さな polygon を見つけるのに役立ちます。

**Example**

都市区画の collection があり、特定の区画の境界内にあるレストランのような特定の関心地点を見つけたいとします。

```python
# The filter expression to find geometries completely within a specific polygon.
filter = "ST_CONTAINS(geo_field, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')"
```

## ST_CROSSES / st_crosses\{#stcrosses-stcrosses}

`ST_CROSSES` 演算子は、2 つの geometry の交差部分が元の geometry より低い次元の geometry を形成する場合に `TRUE` を返します。これは通常、線が polygon や別の線を横切る場合に適用されます。

**Example**

特定の境界線（別の line string）を横切る、または保護区域（polygon）に入るすべてのハイキングコース（line strings）を見つけたいとします。

```python
# The filter expression to find geometries that cross a line string.
filter = "ST_CROSSES(geo_field, 'LINESTRING(5 0, 5 10)')"
```

## ST_INTERSECTS / st_intersects\{#stintersects-stintersects}

`ST_INTERSECTS` 演算子は、2 つの geometry の境界または内部に共通する点がある場合に `TRUE` を返します。これは、あらゆる形式の空間的な重なりを検出するための汎用演算子です。

**Example**

道路の collection があり、新たに提案された道路を表す特定の line string と交差または接触するすべての道路を見つけたい場合は、`ST_INTERSECTS` を使用できます。

```python
# The filter expression to find geometries that intersect with a specific line string.
filter = "ST_INTERSECTS(geo_field, 'LINESTRING (1 1, 2 2)')"
```

## ST_OVERLAPS / st_overlaps\{#stoverlaps-stoverlaps}

`ST_OVERLAPS` 演算子は、同じ次元を持つ 2 つの geometry が部分的に交差し、その交差部分自体も元の geometry と同じ次元を持つが、どちらとも等しくない場合に `TRUE` を返します。

**Example**

重なり合う販売エリアのセットがあり、新たに提案された販売ゾーンと部分的に重なるすべてのエリアを見つけたいとします。

```python
# The filter expression to find geometries that partially overlap with a polygon.
filter = "ST_OVERLAPS(geo_field, 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))')"
```

## ST_TOUCHES / st_touches\{#sttouches-sttouches}

`ST_TOUCHES` 演算子は、2 つの geometry の境界が接しているが、内部は交差しない場合に `TRUE` を返します。これは隣接関係の検出に役立ちます。

**Example**

不動産区画の地図があり、公共の公園に重なりなしで直接隣接しているすべての区画を見つけたい場合です。

```python
# The filter expression to find geometries that only touch a line string at their boundaries.
filter = "ST_TOUCHES(geo_field, 'LINESTRING(0 0, 1 1)')"
```

## ST_WITHIN / st_within\{#stwithin-stwithin}

`ST_WITHIN` 演算子は、最初の geometry が 2 番目の geometry の内部または境界上に完全に含まれている場合に `TRUE` を返します。これは `ST_CONTAINS` の逆です。

**Example**

より大きな指定公園エリア内に完全に位置する小規模な住宅地をすべて見つけたいとします。

```python
# The filter expression to find geometries that are completely within a larger polygon.
filter = "ST_WITHIN(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')"
```

`GEOMETRY` フィールドの使用方法の詳細については、[Geometry Field](./use-geometry-field) を参照してください。

## ST_DWITHIN / st_dwithin\{#stdwithin-stdwithin}

`ST_DWITHIN` 演算子は、geometry A と geometry B の距離が指定された値（メートル単位）以下である場合に `TRUE` を返します。現在、geometry B は point である必要があります。

**Example**

店舗位置の collection があり、特定の顧客の位置から 5,000 メートル以内にあるすべての店舗を見つけたいとします。

```python
# Find all stores within 5000 meters of the point (120 30)
filter = "ST_DWITHIN(geo_field, 'POINT(120 30)', 5000)"
```
