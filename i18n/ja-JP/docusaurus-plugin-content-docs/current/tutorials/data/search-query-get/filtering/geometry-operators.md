---
title: "ジオメトリ演算子 | Cloud"
slug: /geometry-operators
sidebar_label: "ジオメトリ演算子"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、`GEOMETRY`フィールドの空間フィルタリング用に一連の演算子をサポートしており、ジオメトリデータの管理と分析に不可欠です。これらの演算子を使用すると、オブジェクト間のジオメトリ関係に基づいてエンティティを取得できます。| Cloud"
type: origin
token: SOgiwzPxpisy8MkhtuecZqFbnaf
sidebar_position: 7
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - フィルター
  - フィルタリング式
  - フィルタリング
  - ジオメトリ
  - milvus ベクトルデータベース
  - milvus db
  - milvus ベクトル db
  - Zilliz Cloud

---

import Admonition from '@theme/Admonition';


# ジオメトリ演算子

Zilliz Cloudは、`GEOMETRY`フィールドの空間フィルタリング用に一連の演算子をサポートしており、ジオメトリデータの管理と分析に不可欠です。これらの演算子を使用すると、オブジェクト間のジオメトリ関係に基づいてエンティティを取得できます。

すべてのジオメトリ演算子は、2つのジオメトリ引数を受け取ることで機能します：コレクションのスキーマで定義された`GEOMETRY`フィールドの名前と、[Well-Known Text](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry) (WKT) 形式で表されたターゲットジオメトリオブジェクトです。

## 使用構文\{#use-syntax}

`GEOMETRY`フィールドをフィルタリングするには、式内でジオメトリ演算子を使用します：

- 一般: `{operator}(geo_field, '{wkt}')`

- 距離ベース: `ST_DWITHIN(geo_field, '{wkt}', distance)`

以下に示す通りです：

- `operator`はサポートされているジオメトリ演算子のいずれかです（例：`ST_CONTAINS`、`ST_INTERSECTS`）。演算子名はすべて大文字またはすべて小文字でなければなりません。サポートされている演算子の一覧は[サポートされているジオメトリ演算子](./geometry-operators#supported-geometry-operators)を参照してください。

- `geo_field`は`GEOMETRY`フィールドの名前です。

- `'{wkt}'`はクエリするジオメトリのWKT表現です。

- `distance`は`ST_DWITHIN`に特化したしきい値です。

Zilliz Cloudの`GEOMETRY`フィールドについて詳しくは、[ジオメトリフィールド](./use-geometry-field)を参照してください。

## サポートされているジオメトリ演算子\{#supported-geometry-operators}

以下の表は、Zilliz Cloudで利用可能なジオメトリ演算子の一覧です。

<Admonition type="info" icon="📘" title="ノート">

<p>演算子名は<strong>すべて大文字</strong>または<strong>すべて小文字</strong>でなければなりません。同じ演算子名内で大文字小文字を混在させないでください。</p>

</Admonition>

<table>
   <tr>
     <th><p>演算子</p></th>
     <th><p>説明</p></th>
     <th><p>例</p></th>
   </tr>
   <tr>
     <td><p><code>ST_EQUALS(A, B)</code> / <code>st_equals(A, B)</code></p></td>
     <td><p>2つのジオメトリが空間的に同一である（つまり、同じ点の集合と次元を持っている）場合にTRUEを返します。</p></td>
     <td><p>2つのジオメトリ（AとB）は空間的にまったく同じですか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_CONTAINS(A, B)</code> / <code>st_contains(A, B)</code></p></td>
     <td><p>ジオメトリAが完全にジオメトリBを含み、その内部に少なくとも1つの共通点を持つ場合にTRUEを返します。</p></td>
     <td><p>都市の境界（A）が特定の公園（B）を含んでいますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_CROSSES(A, B)</code> / <code>st_crosses(A, B)</code></p></td>
     <td><p>ジオメトリAとBが部分的に交差しているが、完全に互いを含んでいない場合にTRUEを返します。</p></td>
     <td><p>2つの道路（AとB）が交差点で交差していますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_INTERSECTS(A, B)</code> / <code>st_intersects(A, B)</code></p></td>
     <td><p>ジオメトリAとBが少なくとも1つの共通点を持つ場合にTRUEを返します。これは最も一般的で広く使用される空間クエリです。</p></td>
     <td><p>検索範囲（A）がストアの所在地（B）と交差していますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_OVERLAPS(A, B)</code> / <code>st_overlaps(A, B)</code></p></td>
     <td><p>ジオメトリAとBが同じ次元を持ち、部分的に重なり、かつ互いを完全に含んでいない場合にTRUEを返します。</p></td>
     <td><p>2つの土地（AとB）は重なっていますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_TOUCHES(A, B)</code> / <code>st_touches(A, B)</code></p></td>
     <td><p>ジオメトリAとBが共通の境界を共有しているが、その内部が交差していない場合にTRUEを返します。</p></td>
     <td><p>2つの隣接する不動産（AとB）が境界線を共有していますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_WITHIN(A, B)</code> / <code>st_within(A, B)</code></p></td>
     <td><p>ジオメトリAがジオメトリBに完全に含まれ、その内部に少なくとも1つの共通点を持つ場合にTRUEを返します。これは<code>ST_Contains(B, A)</code>の逆です。</p></td>
     <td><p>特定の関心点（A）が定義された検索半径（B）内にありますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_DWITHIN(A, B, distance)</code> / <code>st_dwithin(A, B, distance)</code></p></td>
     <td><p>ジオメトリAとジオメトリBの間の距離が指定された距離以下である場合にTRUEを返します。<strong>注意</strong>: 現在、ジオメトリBはポイントのみをサポートしています。距離の単位はメートルです。</p></td>
     <td><p>特定の地点（B）から5000メートル以内のすべての地点を検索します。</p></td>
   </tr>
</table>

## ST_EQUALS / st_equals\{#stequals-stequals}

`ST_EQUALS`演算子は、2つのジオメトリが空間的に同一である（つまり、同じ点の集合と次元を持っている）場合にTRUEを返します。これは、2つの格納されたジオメトリオブジェクトが完全に同じ場所と形状を表しているかどうかを確認するのに便利です。

**例**

格納されたジオメトリ（点またはポリゴンなど）がターゲットジオメトリと完全に同じであるかどうかを確認するとします。たとえば、格納された点を特定の関心点と比較できます。

```python
# ジオメトリが特定の点と一致するかどうかを確認するためのフィルター式
filter = "ST_EQUALS(geo_field, 'POINT(10 20)')"
```

## ST_CONTAINS / st_contains\{#stcontains-stcontains}

`ST_CONTAINS`演算子は、最初のジオメトリが2番目のジオメトリを完全に含んでいる場合にTRUEを返します。これは、ポリゴン内に含まれる点や、より大きなポリゴン内に含まれる小さなポリゴンを見つけるのに便利です。

**例**

都市の地区のコレクションがあり、特定の地区の境界内に含まれるレストランなどの特定の関心点を見つけるとします。

```python
# 指定されたポリゴン内に完全に含まれるジオメトリを見つけるためのフィルター式。
filter = "ST_CONTAINS(geo_field, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')"
```

## ST_CROSSES / st_crosses\{#stcrosses-stcrosses}

`ST_CROSSES`演算子は、2つのジオメトリの交差が元のジオメトリよりも低い次元のジオメトリを形成する場合に`TRUE`を返します。これは通常、線がポリゴンまたは他の線を横切る場合に適用されます。

**例**

特定の境界線（他のラインストリング）を横切るか、保護区域（ポリゴン）に入るすべてのハイキングトレイル（ラインストリング）を見つけたいとします。

```python
# ラインストリングを横切るジオメトリを見つけるためのフィルター式。
filter = "ST_CROSSES(geo_field, 'LINESTRING(5 0, 5 10)')"
```

## ST_INTERSECTS / st_intersects\{#stintersects-stintersects}

`ST_INTERSECTS`演算子は、2つのジオメトリが境界または内部のいずれかの点を共有している場合に`TRUE`を返します。これは、あらゆる形の空間的重複を検出するための汎用的な演算子です。

**例**

道路のコレクションがあり、提案された新しい道路を表す特定のラインストリングと交差または接触するすべての道路を見つけたい場合、`ST_INTERSECTS`を使用できます。

```python
# 特定のラインストリングと交差するジオメトリを見つけるためのフィルター式。
filter = "ST_INTERSECTS(geo_field, 'LINESTRING (1 1, 2 2)')"
```

## ST_OVERLAPS / st_overlaps\{#stoverlaps-stoverlaps}

`ST_OVERLAPS`演算子は、同じ次元の2つのジオメトリが部分的に交差し、その交差自体が元のジオメトリと同じ次元を持っていて、かつどちらとも等しくない場合に`TRUE`を返します。

**例**

重複する販売地域のセットがあり、新しい提案された販売地域と部分的に重なるすべての地域を見つけたいとします。

```python
# ポリゴンと部分的に重なるジオメトリを見つけるためのフィルター式。
filter = "ST_OVERLAPS(geo_field, 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))')"
```

## ST_TOUCHES / st_touches\{#sttouches-sttouches}

`ST_TOUCHES`演算子は、2つのジオメトリの境界が接触しているが、その内部が交差していない場合に`TRUE`を返します。これは、接続性を検出するのに便利です。

**例**

不動産 parcels の地図があり、重複することなく公共の公園に直接隣接するすべての parcels を見つけたい場合。

```python
# 境界でラインストリングにのみ接触するジオメトリを見つけるためのフィルター式。
filter = "ST_TOUCHES(geo_field, 'LINESTRING(0 0, 1 1)')"
```

## ST_WITHIN / st_within\{#stwithin-stwithin}

`ST_WITHIN`演算子は、最初のジオメトリが完全に2番目のジオメトリの内部または境界上にある場合に`TRUE`を返します。これは`ST_CONTAINS`の逆です。

**例**

より大きな指定された公園区域内に完全に位置するすべての小さな住宅地を見つけたいとします。

```python
# 大きなポリゴン内に完全に含まれるジオメトリを見つけるためのフィルター式。
filter = "ST_WITHIN(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')"
```

`GEOMETRY`フィールドの使用方法の詳細については、[ジオメトリフィールド](./use-geometry-field)を参照してください。

## ST_DWITHIN / st_dwithin\{#stdwithin-stdwithin}

`ST_DWITHIN`演算子は、ジオメトリAとジオメトリBの間の距離が指定された値（メートル単位）以下である場合に`TRUE`を返します。現在、ジオメトリBはポイントでなければなりません。

**例**

店舗の所在地のコレクションがあり、特定の顧客の所在地から5,000メートル以内にあるすべての店舗を見つけたいとします。

```python
# 座標 (120 30) の地点から5000メートル以内にあるすべての店舗を検索
filter = "ST_DWITHIN(geo_field, 'POINT(120 30)', 5000)"
```