---
title: "ジオメトリ演算子 | BYOC"
slug: /geometry-operators
sidebar_label: "ジオメトリ演算子"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、`GEOMETRY`フィールドでの空間フィルタリングのための演算子セットをサポートしており、ジオメトリデータの管理と分析に不可欠です。これらの演算子を使用すると、オブジェクト間のジオメトリ関係に基づいてエンティティを取得できます。 | BYOC"
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
  - hnswアルゴリズム
  - ベクトル類似検索
  - 近似最近傍検索
  - DiskANN

---

import Admonition from '@theme/Admonition';


# ジオメトリ演算子

Zilliz Cloudは、`GEOMETRY`フィールドでの空間フィルタリングのための演算子セットをサポートしており、ジオメトリデータの管理と分析に不可欠です。これらの演算子を使用すると、オブジェクト間のジオメトリ関係に基づいてエンティティを取得できます。

すべてのジオメトリ演算子は、2つのジオメトリ引数を受け取ることで機能します。これは、コレクションスキーマで定義された`GEOMETRY`フィールドの名前と、[Well-Known Text](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry)（WKT）形式で表されるターゲットジオメトリオブジェクトです。

## 使用構文\{#use-syntax}

`GEOMETRY`フィールドでフィルタリングを行うには、式内でジオメトリ演算子を使用します。

- 一般: `{operator}(geo_field, '{wkt}')`

- 距離ベース: `ST_DWITHIN(geo_field, '{wkt}', distance)`

ここで：

- `operator`はサポートされているジオメトリ演算子のいずれかです（例：`ST_CONTAINS`, `ST_INTERSECTS`）。演算子名はすべて大文字またはすべて小文字である必要があります。サポートされている演算子のリストについては、[サポートされているジオメトリ演算子](./geometry-operators#supported-geometry-operators)を参照してください。

- `geo_field`は`GEOMETRY`フィールドの名前です。

- `'{wkt}'`はクエリするジオメトリのWKT表現です。

- `distance`は`ST_DWITHIN`に特化したしきい値です。

Zilliz Cloudの`GEOMETRY`フィールドの詳細については、[ジオメトリフィールド](./use-geometry-field)を参照してください。

## サポートされているジオメトリ演算子\{#supported-geometry-operators}

以下の表は、Zilliz Cloudで利用可能なジオメトリ演算子をリストアップしています。

<Admonition type="info" icon="📘" title="注釈">

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
     <td><p>2つのジオメトリが空間的に同一である場合にTRUEを返します。つまり、同じ点の集合と次元を持ちます。</p></td>
     <td><p>2つのジオメトリ（AとB）が空間的に完全に同じですか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_CONTAINS(A, B)</code> / <code>st_contains(A, B)</code></p></td>
     <td><p>ジオメトリAがジオメトリBを完全に包含し、 interiorsが少なくとも1つの点を共有している場合にTRUEを返します。</p></td>
     <td><p>都市境界（A）が特定の公園（B）を包含していますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_CROSSES(A, B)</code> / <code>st_crosses(A, B)</code></p></td>
     <td><p>ジオメトリAとBが部分的に交差しているが、お互いを完全には包含していない場合にTRUEを返します。</p></td>
     <td><p>2つの道路（AとB）が交差点で交差していますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_INTERSECTS(A, B)</code> / <code>st_intersects(A, B)</code></p></td>
     <td><p>ジオメトリAとBが少なくとも1つの共通点を持つ場合にTRUEを返します。これは最も一般的で広く使われている空間クエリです。</p></td>
     <td><p>検索エリア（A）が店舗の場所（B）と交差していますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_OVERLAPS(A, B)</code> / <code>st_overlaps(A, B)</code></p></td>
     <td><p>ジオメトリAとBが同じ次元を持ち、部分的に重複しており、どちらも完全に他方を包含していない場合にTRUEを返します。</p></td>
     <td><p>2つの土地（AとB）が重複していますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_TOUCHES(A, B)</code> / <code>st_touches(A, B)</code></p></td>
     <td><p>ジオメトリAとBが共通の境界を共有しているが、その内部が交差していない場合にTRUEを返します。</p></td>
     <td><p>2つの隣接する敷地（AとB）が境界線を共有していますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_WITHIN(A, B)</code> / <code>st_within(A, B)</code></p></td>
     <td><p>ジオメトリAがジオメトリB内に完全に包含されており、その内部が少なくとも1つの共通点を持つ場合にTRUEを返します。<code>ST_Contains(B, A)</code>の逆です。</p></td>
     <td><p>特定の地点（A）が定義された検索範囲（B）内にありますか？</p></td>
   </tr>
   <tr>
     <td><p><code>ST_DWITHIN(A, B, distance)</code> / <code>st_dwithin(A, B, distance)</code></p></td>
     <td><p>ジオメトリAとジオメトリBの間の距離が指定された距離以下である場合にTRUEを返します。</p><p><strong>注釈</strong>: ジオメトリBは現在ポイントのみをサポートしています。距離の単位はメートルです。</p></td>
     <td><p>特定のポイント（B）から5000メートル以内のすべてのポイントを検索します。</p></td>
   </tr>
</table>

## ST_EQUALS / st_equals\{#stequals-stequals}

`ST_EQUALS`演算子は、2つのジオメトリが空間的に同一である場合にTRUEを返します。つまり、同じ点の集合と次元を持ちます。これは、2つの保存されたジオメトリオブジェクトが正確に同じ場所と形状を表しているかどうかを確認するのに便利です。

**例**

保存されたジオメトリ（ポイントやポリゴンなど）がターゲットジオメトリと正確に同じであるかどうかを確認するとします。たとえば、保存されたポイントを特定の関心ポイントと比較できます。

```python
# 特定のポイントと一致するジオメトリをチェックするためのフィルター式
filter = "ST_EQUALS(geo_field, 'POINT(10 20)')"
```

## ST_CONTAINS / st_contains\{#stcontains-stcontains}

`ST_CONTAINS`演算子は、最初のジオメトリが2番目のジオメトリを完全に包含している場合にTRUEを返します。これは、ポリゴン内にポイントがあるか、より小さなポリゴンがより大きなポリゴン内にあるかを調べるのに便利です。

**例**

都市地区のコレクションがあり、特定のレストランなどの関心のある地点が与えられた地区の境界内にあるかどうかを知りたいとします。

```python
# 特定のポリゴン内に完全に含まれるジオメトリを検索するためのフィルター式。
filter = "ST_CONTAINS(geo_field, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')"
```

## ST_CROSSES / st_crosses\{#stcrosses-stcrosses}

`ST_CROSSES`演算子は、2つのジオメトリの交差が元のジオメトリよりも低い次元のジオメトリを形成する場合に`TRUE`を返します。これは通常、ラインがポリゴンまたは別のラインを交差する場合に適用されます。

**例**

特定の境界線（別のラインストリング）を横切るまたは保護区域内（ポリゴン）に入るすべてのハイキングトレイル（ラインストリング）を検索したいとします。

```python
# ラインストリングを横切るジオメトリを検索するためのフィルター式。
filter = "ST_CROSSES(geo_field, 'LINESTRING(5 0, 5 10)')"
```

## ST_INTERSECTS / st_intersects\{#stintersects-stintersects}

`ST_INTERSECTS`演算子は、2つのジオメトリが境界または内部のいずれかに共通点を持つ場合に`TRUE`を返します。これは空間的な重複を検出するための汎用演算子です。

**例**

道路のコレクションがあり、提案された新しい道路を表す特定のラインストリングと交差または接触するすべての道路を検索したい場合は、`ST_INTERSECTS`を使用できます。

```python
# 特定のラインストリングと交差するジオメトリを検索するためのフィルター式。
filter = "ST_INTERSECTS(geo_field, 'LINESTRING (1 1, 2 2)')"
```

## ST_OVERLAPS / st_overlaps\{#stoverlaps-stoverlaps}

`ST_OVERLAPS`演算子は、同じ次元の2つのジオメトリが部分的に交差し、交差が元のジオメトリと同じ次元を持つがそれらのいずれにも等しくならない場合に`TRUE`を返します。

**例**

重複するセールス地域のセットがあり、新しい提案されたセールスゾーンと部分的に重複するすべての地域を検索したいとします。

```python
# ポリゴンと部分的に重複するジオメトリを検索するためのフィルター式。
filter = "ST_OVERLAPS(geo_field, 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))')"
```

## ST_TOUCHES / st_touches\{#sttouches-sttouches}

`ST_TOUCHES`演算子は、2つのジオメトリの境界が接触しているが、内部が交差していない場合に`TRUE`を返します。これは隣接性を検出するのに便利です。

**例**

敷地の地図があり、公園との重複なしに公共の公園に直接隣接するすべての敷地を検索したいとします。

```python
# 境界でラインストリングと接触するジオメトリを検索するためのフィルター式。
filter = "ST_TOUCHES(geo_field, 'LINESTRING(0 0, 1 1)')"
```

## ST_WITHIN / st_within\{#stwithin-stwithin}

`ST_WITHIN`演算子は、最初のジオメトリが2番目のジオメトリの内部または境界に完全に含まれている場合に`TRUE`を返します。これは`ST_CONTAINS`の逆です。

**例**

大きな指定された公園区域内に完全に位置するすべての小さな住宅地を検索したいとします。

```python
# 大きなポリゴン内に完全に含まれるジオメトリを検索するためのフィルター式。
filter = "ST_WITHIN(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')"
```

`GEOMETRY`フィールドの使用方法の詳細については、[ジオメトリフィールド](./use-geometry-field)を参照してください。

## ST_DWITHIN / st_dwithin\{#stdwithin-stdwithin}

`ST_DWITHIN`演算子は、ジオメトリAとジオメトリBの間の距離が指定された値（メートル単位）以下である場合に`TRUE`を返します。現在、ジオメトリBはポイントである必要があります。

**例**

店舗の場所のコレクションがあり、特定の顧客の位置から5,000メートル以内のすべての店舗を検索したいとします。

```python
# ポイント（120 30）から5000メートル以内のすべての店舗を検索
filter = "ST_DWITHIN(geo_field, 'POINT(120 30)', 5000)"
```