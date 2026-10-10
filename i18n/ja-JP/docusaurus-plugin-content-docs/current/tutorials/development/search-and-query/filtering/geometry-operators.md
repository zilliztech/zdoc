---
title: "ジオメトリ演算子 | Cloud"
slug: /geometry-operators
sidebar_label: "ジオメトリ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、`GEOMETRY` フィールドでの空間フィルタリングに使用する一連の演算子をサポートしています。これらは、幾何データの管理と分析に欠かせないものです。これらの演算子を使用すると、オブジェクト間の幾何学的な関係に基づいてエンティティを取得できます。 | Cloud"
type: origin
token: SOgiwzPxpisy8MkhtuecZqFbnaf
sidebar_position: 9
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ジオメトリ演算子

Zilliz Cloud は、`GEOMETRY` フィールドでの空間フィルタリングに使用する一連の演算子をサポートしています。これらは、幾何データの管理と分析に欠かせないものです。これらの演算子を使用すると、オブジェクト間の幾何学的な関係に基づいてエンティティを取得できます。

すべてのジオメトリ演算子は、コレクションスキーマで定義された `GEOMETRY` フィールドの名前と、[Well-Known Text](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry)（WKT）形式で表された対象のジオメトリオブジェクトという 2つのジオメトリ引数を取ります。

## 構文の使用方法\{#use-syntax}

`GEOMETRY` フィールドでフィルタリングするには、式の中でジオメトリ演算子を使用します。

- 汎用: `{operator}(geo_field, '{wkt}')`

- 距離ベース: `ST_DWITHIN(geo_field, '{wkt}', distance)`

各項目の意味は次のとおりです。

- `operator` は、サポートされているジオメトリ演算子（例: `ST_CONTAINS`、`ST_INTERSECTS`）のいずれかです。演算子名はすべて大文字またはすべて小文字にする必要があります。サポートされている演算子の一覧については、[サポートされているジオメトリ演算子](./geometry-operators#supported-geometry-operators) を参照してください。

- `geo_field` は `GEOMETRY` フィールドの名前です。

- `'{wkt}'` は、クエリ対象のジオメトリの WKT 表現です。

- `distance` は、`ST_DWITHIN` 専用のしきい値です。

Zilliz Cloud の `GEOMETRY` フィールドについて詳しくは、[ジオメトリフィールド](./use-geometry-field) を参照してください。

## サポートされているジオメトリ演算子\{#supported-geometry-operators}

次の表に、Zilliz Cloud で使用可能なジオメトリ演算子を示します。

<Admonition type="info" title="Notes">

演算子名は**すべて大文字**または**すべて小文字**にする必要があります。同じ演算子名内で大文字と小文字を混在させないでください。

</Admonition>

| 演算子 | 説明 | 例 |
| --- | --- | --- |
| `ST_EQUALS(A, B)` / `st_equals(A, B)` | 2つのジオメトリが空間的に同一、つまり同じ点の集合と次元を持つ場合に TRUE を返します。 | 2つのジオメトリ（A と B）は空間内で完全に同じですか？ |
| `ST_CONTAINS(A, B)` / `st_contains(A, B)` | ジオメトリ A がジオメトリ B を完全に含み、かつ両者の内部に少なくとも 1つの共通する点がある場合に TRUE を返します。 | 市の境界（A）は特定の公園（B）を含んでいますか？ |
| `ST_CROSSES(A, B)` / `st_crosses(A, B)` | ジオメトリ A と B が部分的に交差しているが、互いに完全には含んでいない場合に TRUE を返します。 | 2 本の道路（A と B）は交差点で交わっていますか？ |
| `ST_INTERSECTS(A, B)` / `st_intersects(A, B)` | ジオメトリ A と B に少なくとも 1つの共通する点がある場合に TRUE を返します。これは最も汎用的で広く使用されている空間クエリです。 | 検索エリア（A）は、いずれかの店舗の位置（B）と交差しますか？ |
| `ST_OVERLAPS(A, B)` / `st_overlaps(A, B)` | ジオメトリ A と B が同じ次元で、部分的に重なり合っており、どちらも他方を完全には含んでいない場合に TRUE を返します。 | 2つの区画（A と B）は重なり合っていますか？ |
| `ST_TOUCHES(A, B)` / `st_touches(A, B)` | ジオメトリ A と B が共通の境界を共有しているが、両者の内部は交差していない場合に TRUE を返します。 | 隣接する 2つの物件（A と B）は境界を共有していますか？ |
| `ST_WITHIN(A, B)` / `st_within(A, B)` | ジオメトリ A がジオメトリ B 内に完全に含まれ、かつ両者の内部に少なくとも 1つの共通する点がある場合に TRUE を返します。これは `ST_Contains(B, A)` の逆です。 | 特定の関心地点（A）は、定義された検索半径（B）内にありますか？ |
| `ST_DWITHIN(A, B, distance)` / `st_dwithin(A, B, distance)` | ジオメトリ A とジオメトリ B の間の距離が、指定された距離以下である場合に TRUE を返します。<br/>**注記**: ジオメトリ B は現在、点のみをサポートしています。距離の単位はメートルです。 | 特定の点（B）から 5000 メートル以内にあるすべての点を検索します。 |

## ST_EQUALS / st_equals\{#stequals-stequals}

`ST_EQUALS` 演算子は、2つのジオメトリが空間的に同一、つまり同じ点の集合と次元を持つ場合に TRUE を返します。これは、2つの保存されたジオメトリオブジェクトがまったく同じ位置と形状を表しているかどうかを確認するのに役立ちます。

**例**

保存されたジオメトリ（点やポリゴンなど）が対象のジオメトリと完全に同じかどうかを確認したいとします。たとえば、保存された点を特定の関心地点と比較できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# The filter expression to check if a geometry matches a specific point
filter = "ST_EQUALS(geo_field, 'POINT(10 20)')"
```

</TabItem>

<TabItem value='java'>

```java
// The filter expression to check if a geometry matches a specific point
String filter = "ST_EQUALS(geo_field, 'POINT(10 20)')";
```

</TabItem>

<TabItem value='go'>

```go
// The filter expression to check if a geometry matches a specific point
filter := "ST_EQUALS(geo_field, 'POINT(10 20)')"
```

</TabItem>

<TabItem value='rust'>

```rust
// The filter expression to check if a geometry matches a specific point
let filter = "ST_EQUALS(geo_field, 'POINT(10 20)')";
```

</TabItem>

<TabItem value='c++'>

```c++
// The filter expression to check if a geometry matches a specific point
std::string filter = "ST_EQUALS(geo_field, 'POINT(10 20)')";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// The filter expression to check if a geometry matches a specific point
const filter = "ST_EQUALS(geo_field, 'POINT(10 20)')";
```

</TabItem>

<TabItem value='bash'>

```bash
# The filter expression to check if a geometry matches a specific point
filter="ST_EQUALS(geo_field, 'POINT(10 20)')"
```

</TabItem>
</Tabs>

## ST_CONTAINS / st_contains\{#stcontains-stcontains}

`ST_CONTAINS` 演算子は、最初のジオメトリが 2 番目のジオメトリを完全に含む場合に TRUE を返します。これは、ポリゴン内の点や、より大きなポリゴン内の小さなポリゴンを見つけるのに役立ちます。

**例**

市街区画のコレクションがあり、特定の地区の境界内にあるレストランなどの特定の関心地点を見つけたいとします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# The filter expression to find geometries completely within a specific polygon.
filter = "ST_WITHIN(geo_field, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')"
```

</TabItem>

<TabItem value='java'>

```java
// The filter expression to find geometries completely within a specific polygon.
String filter = "ST_WITHIN(geo_field, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')";
```

</TabItem>

<TabItem value='go'>

```go
// The filter expression to find geometries completely within a specific polygon.
filter := "ST_WITHIN(geo_field, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')"
```

</TabItem>

<TabItem value='rust'>

```rust
// The filter expression to find geometries completely within a specific polygon.
let filter = "ST_WITHIN(geo_field, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')";
```

</TabItem>

<TabItem value='c++'>

```c++
// The filter expression to find geometries completely within a specific polygon.
std::string filter = "ST_WITHIN(geo_field, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// The filter expression to find geometries completely within a specific polygon.
const filter = "ST_WITHIN(geo_field, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')";
```

</TabItem>

<TabItem value='bash'>

```bash
# The filter expression to find geometries completely within a specific polygon.
filter="ST_WITHIN(geo_field, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')"
```

</TabItem>
</Tabs>

## ST_CROSSES / st_crosses\{#stcrosses-stcrosses}

`ST_CROSSES` 演算子は、2つのジオメトリの交差部分が、元のジオメトリよりも低い次元のジオメトリを形成する場合に `TRUE` を返します。これは通常、線がポリゴンまたは別の線と交差する場合に該当します。

**例**

特定の境界線（別のラインストリング）と交差する、または保護区域（ポリゴン）に入るすべてのハイキングコース（ラインストリング）を検索したいとします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# The filter expression to find geometries that cross a line string.
filter = "ST_CROSSES(geo_field, 'LINESTRING(5 0, 5 10)')"
```

</TabItem>

<TabItem value='java'>

```java
// The filter expression to find geometries that cross a line string.
String filter = "ST_CROSSES(geo_field, 'LINESTRING(5 0, 5 10)')";
```

</TabItem>

<TabItem value='go'>

```go
// The filter expression to find geometries that cross a line string.
filter := "ST_CROSSES(geo_field, 'LINESTRING(5 0, 5 10)')"
```

</TabItem>

<TabItem value='rust'>

```rust
// The filter expression to find geometries that cross a line string.
let filter = "ST_CROSSES(geo_field, 'LINESTRING(5 0, 5 10)')";
```

</TabItem>

<TabItem value='c++'>

```c++
// The filter expression to find geometries that cross a line string.
std::string filter = "ST_CROSSES(geo_field, 'LINESTRING(5 0, 5 10)')";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// The filter expression to find geometries that cross a line string.
const filter = "ST_CROSSES(geo_field, 'LINESTRING(5 0, 5 10)')";
```

</TabItem>

<TabItem value='bash'>

```bash
# The filter expression to find geometries that cross a line string.
filter="ST_CROSSES(geo_field, 'LINESTRING(5 0, 5 10)')"
```

</TabItem>
</Tabs>

## ST_INTERSECTS / st_intersects\{#stintersects-stintersects}

`ST_INTERSECTS` 演算子は、2つのジオメトリが境界または内部のいずれかの点を共有している場合に `TRUE` を返します。これは、あらゆる形式の空間的な重なりを検出するための汎用演算子です。

**例**

道路のコレクションがあり、提案された新しい道路を表す特定のラインストリングと交差または接触するすべての道路を検索したい場合は、`ST_INTERSECTS` を使用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# The filter expression to find geometries that intersect with a specific line string.
filter = "ST_INTERSECTS(geo_field, 'LINESTRING (1 1, 2 2)')"
```

</TabItem>

<TabItem value='java'>

```java
// The filter expression to find geometries that intersect with a specific line string.
String filter = "ST_INTERSECTS(geo_field, 'LINESTRING (1 1, 2 2)')";
```

</TabItem>

<TabItem value='go'>

```go
// The filter expression to find geometries that intersect with a specific line string.
filter := "ST_INTERSECTS(geo_field, 'LINESTRING (1 1, 2 2)')"
```

</TabItem>

<TabItem value='rust'>

```rust
// The filter expression to find geometries that intersect with a specific line string.
let filter = "ST_INTERSECTS(geo_field, 'LINESTRING (1 1, 2 2)')";
```

</TabItem>

<TabItem value='c++'>

```c++
// The filter expression to find geometries that intersect with a specific line string.
std::string filter = "ST_INTERSECTS(geo_field, 'LINESTRING (1 1, 2 2)')";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// The filter expression to find geometries that intersect with a specific line string.
const filter = "ST_INTERSECTS(geo_field, 'LINESTRING (1 1, 2 2)')";
```

</TabItem>

<TabItem value='bash'>

```bash
# The filter expression to find geometries that intersect with a specific line string.
filter="ST_INTERSECTS(geo_field, 'LINESTRING (1 1, 2 2)')"
```

</TabItem>
</Tabs>

## ST_OVERLAPS / st_overlaps\{#stoverlaps-stoverlaps}

`ST_OVERLAPS` 演算子は、同じ次元の 2つのジオメトリが部分的に交差し、その交差部分自体が元のジオメトリと同じ次元を持ち、かつどちらとも等しくない場合に `TRUE` を返します。

**例**

重なり合う営業地域のセットがあり、提案された新しい営業ゾーンと部分的に重なるすべての地域を検索したいとします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# The filter expression to find geometries that partially overlap with a polygon.
filter = "ST_OVERLAPS(geo_field, 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))')"
```

</TabItem>

<TabItem value='java'>

```java
// The filter expression to find geometries that partially overlap with a polygon.
String filter = "ST_OVERLAPS(geo_field, 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))')";
```

</TabItem>

<TabItem value='go'>

```go
// The filter expression to find geometries that partially overlap with a polygon.
filter := "ST_OVERLAPS(geo_field, 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))')"
```

</TabItem>

<TabItem value='rust'>

```rust
// The filter expression to find geometries that partially overlap with a polygon.
let filter = "ST_OVERLAPS(geo_field, 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))')";
```

</TabItem>

<TabItem value='c++'>

```c++
// The filter expression to find geometries that partially overlap with a polygon.
std::string filter = "ST_OVERLAPS(geo_field, 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))')";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// The filter expression to find geometries that partially overlap with a polygon.
const filter = "ST_OVERLAPS(geo_field, 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))')";
```

</TabItem>

<TabItem value='bash'>

```bash
# The filter expression to find geometries that partially overlap with a polygon.
filter="ST_OVERLAPS(geo_field, 'POLYGON((0 0, 0 10, 10 10, 10 0, 0 0))')"
```

</TabItem>
</Tabs>

## ST_TOUCHES / st_touches\{#sttouches-sttouches}

`ST_TOUCHES` 演算子は、2つのジオメトリの境界が接触しているが、内部は交差していない場合に `TRUE` を返します。これは、隣接関係を検出するのに役立ちます。

**例**

地番区画のマップがあり、公共の公園に直接隣接し、かつ重なりがないすべての区画を検索したいとします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# The filter expression to find geometries that only touch a line string at their boundaries.
filter = "ST_TOUCHES(geo_field, 'LINESTRING(0 0, 1 1)')"
```

</TabItem>

<TabItem value='java'>

```java
// The filter expression to find geometries that only touch a line string at their boundaries.
String filter = "ST_TOUCHES(geo_field, 'LINESTRING(0 0, 1 1)')";
```

</TabItem>

<TabItem value='go'>

```go
// The filter expression to find geometries that only touch a line string at their boundaries.
filter := "ST_TOUCHES(geo_field, 'LINESTRING(0 0, 1 1)')"
```

</TabItem>

<TabItem value='rust'>

```rust
// The filter expression to find geometries that only touch a line string at their boundaries.
let filter = "ST_TOUCHES(geo_field, 'LINESTRING(0 0, 1 1)')";
```

</TabItem>

<TabItem value='c++'>

```c++
// The filter expression to find geometries that only touch a line string at their boundaries.
std::string filter = "ST_TOUCHES(geo_field, 'LINESTRING(0 0, 1 1)')";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// The filter expression to find geometries that only touch a line string at their boundaries.
const filter = "ST_TOUCHES(geo_field, 'LINESTRING(0 0, 1 1)')";
```

</TabItem>

<TabItem value='bash'>

```bash
# The filter expression to find geometries that only touch a line string at their boundaries.
filter="ST_TOUCHES(geo_field, 'LINESTRING(0 0, 1 1)')"
```

</TabItem>
</Tabs>

## ST_WITHIN / st_within\{#stwithin-stwithin}

`ST_WITHIN` 演算子は、最初のジオメトリが 2 番目のジオメトリの内部または境界上に完全に含まれている場合に `TRUE` を返します。これは `ST_CONTAINS` の逆です。

**例**

より大きな指定公園区域内に完全に位置するすべての小さな住宅地を検索したいとします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# The filter expression to find geometries that are completely within a larger polygon.
filter = "ST_WITHIN(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')"
```

</TabItem>

<TabItem value='java'>

```java
// The filter expression to find geometries that are completely within a larger polygon.
String filter = "ST_WITHIN(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')";
```

</TabItem>

<TabItem value='go'>

```go
// The filter expression to find geometries that are completely within a larger polygon.
filter := "ST_WITHIN(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')"
```

</TabItem>

<TabItem value='rust'>

```rust
// The filter expression to find geometries that are completely within a larger polygon.
let filter = "ST_WITHIN(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')";
```

</TabItem>

<TabItem value='c++'>

```c++
// The filter expression to find geometries that are completely within a larger polygon.
std::string filter = "ST_WITHIN(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// The filter expression to find geometries that are completely within a larger polygon.
const filter = "ST_WITHIN(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')";
```

</TabItem>

<TabItem value='bash'>

```bash
# The filter expression to find geometries that are completely within a larger polygon.
filter="ST_WITHIN(geo_field, 'POLYGON((110 38, 115 38, 115 42, 110 42, 110 38))')"
```

</TabItem>
</Tabs>

`GEOMETRY` フィールドの使用方法について詳しくは、[ジオメトリフィールド](./use-geometry-field) を参照してください。

## ST_DWITHIN / st_dwithin\{#stdwithin-stdwithin}

`ST_DWITHIN` 演算子は、ジオメトリ A とジオメトリ B の間の距離が、指定された値（メートル単位）以下である場合に `TRUE` を返します。現在、ジオメトリ B は点でなければなりません。

**例**

店舗の位置のコレクションがあり、特定のお客様の位置から 5,000 メートル以内にあるすべての店舗を検索したいとします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Find all stores within 5000 meters of the point (120 30)
filter = "ST_DWITHIN(geo_field, 'POINT(120 30)', 5000)"
```

</TabItem>

<TabItem value='java'>

```java
// Find all stores within 5000 meters of the point (120 30)
String filter = "ST_DWITHIN(geo_field, 'POINT(120 30)', 5000)";
```

</TabItem>

<TabItem value='go'>

```go
// Find all stores within 5000 meters of the point (120 30)
filter := "ST_DWITHIN(geo_field, 'POINT(120 30)', 5000)"
```

</TabItem>

<TabItem value='rust'>

```rust
// Find all stores within 5000 meters of the point (120 30)
let filter = "ST_DWITHIN(geo_field, 'POINT(120 30)', 5000)";
```

</TabItem>

<TabItem value='c++'>

```c++
// Find all stores within 5000 meters of the point (120 30)
std::string filter = "ST_DWITHIN(geo_field, 'POINT(120 30)', 5000)";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Find all stores within 5000 meters of the point (120 30)
const filter = "ST_DWITHIN(geo_field, 'POINT(120 30)', 5000)";
```

</TabItem>

<TabItem value='bash'>

```bash
# Find all stores within 5000 meters of the point (120 30)
filter="ST_DWITHIN(geo_field, 'POINT(120 30)', 5000)"
```

</TabItem>
</Tabs>
