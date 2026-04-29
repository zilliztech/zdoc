---
title: "ジオメトリ演算子 | Cloud"
slug: /geometry-operators
sidebar_key: geometry-operators
sidebar_label: "ジオメトリ"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、`GEOMETRY` フィールドに対する空間フィルタリング用の一連の演算子をサポートしており、ジオメトリデータの管理と分析に不可欠です。これらの演算子を使用すると、オブジェクト間の幾何学的関係に基づいてエンティティを取得できます。 | Cloud"
type: origin
token: SOgiwzPxpisy8MkhtuecZqFbnaf
sidebar_position: 8
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - data
  - filter
  - filtering expressions
  - filtering
  - geometry

---

import Admonition from '@theme/Admonition';


# ジオメトリ演算子

Zilliz Cloud は、`GEOMETRY` フィールドに対して空間フィルタリングを行うための一連の演算子をサポートしており、ジオメトリデータの管理と分析に不可欠です。これらの演算子を使用すると、オブジェクト間の幾何学的関係に基づいてエンティティを取得できます。

すべてのジオメトリ演算子は、2つのジオメトリ引数を取って動作します。1つはコレクションスキーマで定義された `GEOMETRY` フィールドの名前、もう1つは [Well-Known Text](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry)（WKT）形式で表現された対象ジオメトリオブジェクトです。

## 構文の使用方法\{#use-syntax}

`GEOMETRY` フィールドでフィルタリングするには、式の中でジオメトリ演算子を使用します。

- 一般: `{operator}(geo_field, '{wkt}')`

- 距離ベース: `ST_DWITHIN(geo_field, '{wkt}', distance)`

ここで:

- `operator` はサポートされているジオメトリ演算子のいずれか（例: `ST_CONTAINS`, `ST_INTERSECTS`）です。演算子名はすべて大文字またはすべて小文字で記述する必要があります。サポートされている演算子の一覧については、[サポートされているジオメトリ演算子](./geometry-operators#supported-geometry-operators) を参照してください。

- `geo_field` は `GEOMETRY` フィールドの名前です。

- `'{wkt}'` はクエリ対象ジオメトリの WKT 表現です。

- `distance` は `ST_DWITHIN` 専用の距離しきい値です。

Zilliz Cloud における `GEOMETRY` フィールドの詳細については、[ジオメトリフィールド](./use-geometry-field) を参照してください。

## サポートされているジオメトリ演算子\{#supported-geometry-operators}

次の表は、Zilliz Cloud で利用可能なジオメトリ演算子の一覧です。

<Admonition type="info" icon="📘" title="Notes">

<p>演算子名は<strong>すべて大文字</strong>または<strong>すべて小文字</strong>で記述する必要があります。同一の演算子名内で大文字と小文字を混在させないでください。</p>

</Admonition>

<table>
   <tr>
     <th><p>演算子</p></th>
     <th><p>説明</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><code>ST_EQUALS(A, B)</code> / <code>st_equals(A, B)</code></p></td>
     <td><p>2つのジオメトリが空間的に同一（同じ点集合と次元を持つ）場合に TRUE を返します。</p></td>
     <td><p>2つのジオメトリ（A と B）は空間的に完全に一致していますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_CONTAINS(A, B)</code> / <code>st_contains(A, B)</code></p></td>
     <td><p>ジオメトリ A がジオメトリ B を完全に含み、両者の内部が少なくとも1点を共有している場合に TRUE を返します。</p></td>
     <td><p>都市の境界（A）は特定の公園（B）を含んでいますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_CROSSES(A, B)</code> / <code>st_crosses(A, B)</code></p></td>
     <td><p>ジオメトリ A と B が部分的に交差し、互いに完全に包含していない場合に TRUE を返します。</p></td>
     <td><p>2つの道路（A と B）は交差点で交差していますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_INTERSECTS(A, B)</code> / <code>st_intersects(A, B)</code></p></td>
     <td><p>ジオメトリ A と B が少なくとも1点を共有している場合に TRUE を返します。これは最も一般的かつ広く使われる空間クエリです。</p></td>
     <td><p>検索範囲（A）は店舗の位置（B）と交差していますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_OVERLAPS(A, B)</code> / <code>st_overlaps(A, B)</code></p></td>
     <td><p>ジオメトリ A と B が同じ次元を持ち、部分的に重なり合い、かつ互いに完全に包含していない場合に TRUE を返します。</p></td>
     <td><p>2つの土地区画（A と B）は重なっていますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_TOUCHES(A, B)</code> / <code>st_touches(A, B)</code></p></td>
     <td><p>ジオメトリ A と B が境界を共有しているが、内部が交差していない場合に TRUE を返します。</p></td>
     <td><p>隣接する2つの不動産（A と B）は境界を共有していますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_WITHIN(A, B)</code> / <code>st_within(A, B)</code></p></td>
     <td><p>ジオメトリ A がジオメトリ B に完全に含まれ、両者の内部が少なくとも1点を共有している場合に TRUE を返します。<code>ST_Contains(B, A)</code> の逆です。</p></td>
     <td><p>特定の興味地点（A）は定義された検索半径（B）内にありますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_DWITHIN(A, B, distance)</code> / <code>st_dwithin(A, B, distance)</code></p></td>
     <td><p>ジオメトリ A と B の距離が指定された距離以下の場合に TRUE を返します。</p><p><strong>注</strong>: 現在、ジオメトリ B はポイントのみをサポートしています。距離の単位はメートルです。</p></td>
     <td><p>特定のポイント（B）から5000メートル以内にあるすべてのポイントを検索します。</p></td>
   </tr>
</table>

## ST_EQUALS / st_equals\{#stequals-stequals}

`ST_EQUALS` 演算子は、2つのジオメトリが空間的に同一（同じ点集合と次元を持つ）場合に TRUE を返します。これは、2つの保存済みジオメトリオブジェクトが正確に同じ位置と形状を表しているかどうかを検証する際に役立ちます。

**例**

保存済みのジオメトリ（ポイントやポリゴンなど）が、対象ジオメトリと完全に一致するかどうかを確認したいとします。例えば、保存済みのポイントを特定の興味地点と比較できます。

```python
# The filter expression to check if a geometry matches a specific point
filter = "ST_EQUALS(geo_field, 'POINT(10 20)')"
```

## ST_CONTAINS / st_contains\{#stcontains-stcontains}

`ST_CONTAINS` 演算子は、第1ジオメトリが第2ジオメトリを完全に含んでいる場合に TRUE を返します。これは、ポリゴン内のポイントや、より大きなポリゴン内に含まれる小さなポリゴンを検索する際に役立ちます。

**例**

都市の行政区画のコレクションがあり、特定の行政区画の境界内に位置するレストランなどの特定の興味地点（POI）を見つけたいとします。

```python
# The filter expression to find geometries completely within a specific polygon.
filter = "ST_CONTAINS(geo_field, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')"
```

## ST_CROSSES / st_crosses\{#stcrosses-stcrosses}

`ST_CROSSES` 演算子は、2つのジオメトリの交差部分が元のジオメトリよりも次元の低いジオメトリを形成する場合に `TRUE` を返します。これは通常、ラインがポリゴンまたは別のラインと交差する場合に適用されます。

**例**

特定の境界線（別のラインストリング）と交差する、または保護区域（ポリゴン）に入るすべてのハイキングトレイル（ラインストリング）を見つけたい場合を考えます。

```python
# The filter expression to find geometries that cross a line string.
filter = "ST_CROSSES(geo_field, 'LINESTRING(5 0, 5 10)')"
```

## ST_INTERSECTS / st_intersects\{#stintersects-stintersects}

`ST_INTERSECTS` 演算子は、2つのジオメトリの境界または内部に共通する点が1つでも存在する場合に `TRUE` を返します。これは、あらゆる形式の空間的重複を検出するための汎用的な演算子です。

**例**

道路のコレクションがあり、計画中の新道路を表す特定のラインストリングと交差または接触するすべての道路を見つけたい場合、`ST_INTERSECTS` を使用できます。

```python
# The filter expression to find geometries that intersect with a specific line string.
filter = "ST_INTERSECTS(geo_field, 'LINESTRING (1 1, 2 2)')"
```

## ST_OVERLAPS / st_overlaps\{#stoverlaps-stoverlaps}

`ST_OVERLAPS` 演算子は、同じ次元の2つのジオメトリが部分的に交差しており、かつその交差部分自体が元のジオメトリと同じ次元を持ちながら、いずれのジオメトリとも等しくない場合に `TRUE` を返します。

**例**

重複する販売地域のセットがあり、新しく提案された販売ゾーンと部分的に重複するすべての地域を見つけたいとします。

```python
# The filter expression to find geometries that partially overlap with a polygon.
filter = "ST_OVERLAPS(geo_field, 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))')"
```

## ST_TOUCHES / st_touches\{#sttouches-sttouches}

`ST_TOUCHES` 演算子は、2 つのジオメトリの境界が接触しているが、内部が交差していない場合に `TRUE` を返します。これは隣接関係を検出する際に役立ちます。

**例**

土地の区画図があり、公共公園と直接隣接しており、かつ重複がないすべての区画を見つけたい場合。

```python
# The filter expression to find geometries that only touch a line string at their boundaries.
filter = "ST_TOUCHES(geo_field, 'LINESTRING(0 0, 1 1)')"
```

## ST_WITHIN / st_within\{#stwithin-stwithin}

`ST_WITHIN` 演算子は、第1ジオメトリが第2ジオメトリの内部または境界上に完全に含まれている場合に `TRUE` を返します。これは `ST_CONTAINS` の逆です。

**例**

指定された大きな公園区域内に完全に含まれるすべての小規模住宅地を見つけたいとします。

```python
# The filter expression to find geometries that are completely within a larger polygon.
filter = "ST_WITHIN(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')"
```

`GEOMETRY` フィールドの使用方法の詳細については、[ジオメトリ Field](./use-geometry-field) を参照してください。

## ST_DWITHIN / st_dwithin\{#stdwithin-stdwithin}

`ST_DWITHIN` 演算子は、ジオメトリ A とジオメトリ B 間の距離が指定された値（メートル単位）以下の場合に `TRUE` を返します。現在、ジオメトリ B はポイントである必要があります。

**例**

店舗の位置情報が格納されたコレクションがあり、特定の顧客の位置から 5,000 メートル以内にあるすべての店舗を検索したいとします。

```python
# Find all stores within 5000 meters of the point (120 30)
filter = "ST_DWITHIN(geo_field, 'POINT(120 30)', 5000)"
```
