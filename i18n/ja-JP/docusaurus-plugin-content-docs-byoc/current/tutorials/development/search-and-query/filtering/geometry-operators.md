---
title: "ジオメトリ演算子 | BYOC"
slug: /geometry-operators
sidebar_label: "ジオメトリ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、`GEOMETRY` フィールドに対する空間フィルタリング用の演算子セットをサポートしています。これは、幾何データの管理と分析に不可欠です。これらの演算子を使用すると、オブジェクト間の幾何学的な関係に基づいてエンティティを取得できます。 | BYOC"
type: origin
token: SOgiwzPxpisy8MkhtuecZqFbnaf
sidebar_position: 9
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ジオメトリ演算子

Zilliz Cloud は、`GEOMETRY` フィールドに対する空間フィルタリング用の演算子セットをサポートしています。これは、幾何データの管理と分析に不可欠です。これらの演算子を使用すると、オブジェクト間の幾何学的な関係に基づいてエンティティを取得できます。

すべてのジオメトリ演算子は、2つのジオメトリ引数（コレクションスキーマで定義された `GEOMETRY` フィールドの名前と、[Well-Known Text](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry)（WKT）形式で表されるターゲットジオメトリオブジェクト）を受け取って機能します。

## 構文の使用方法\{#use-syntax}

`GEOMETRY` フィールドでフィルタリングするには、式の中でジオメトリ演算子を使用します。

- 一般: `{operator}(geo_field, '{wkt}')`

- 距離ベース: `ST_DWITHIN(geo_field, '{wkt}', distance)`

各項目は次のとおりです。

- `operator` は、サポートされているジオメトリ演算子のいずれかです（例: `ST_CONTAINS`、`ST_INTERSECTS`）。演算子名はすべて大文字またはすべて小文字で指定する必要があります。サポートされている演算子の一覧については、[サポートされているジオメトリ演算子](./geometry-operators#supported-geometry-operators) を参照してください。

- `geo_field` は、`GEOMETRY` フィールドの名前です。

- `'{wkt}'` は、クエリ対象のジオメトリを WKT で表したものです。

- `distance` は、`ST_DWITHIN` 専用のしきい値です。

Zilliz Cloud の `GEOMETRY` フィールドの詳細については、[ジオメトリフィールド](./use-geometry-field) を参照してください。

## サポートされているジオメトリ演算子\{#supported-geometry-operators}

次の表は、Zilliz Cloud で使用できるジオメトリ演算子の一覧です。

<Admonition type="info" title="Notes">

演算子名は**すべて大文字**または**すべて小文字**で指定する必要があります。同じ演算子名内で大文字と小文字を混在させないでください。

</Admonition>

| 演算子 | 説明 | 例 |
| --- | --- | --- |
| `ST_EQUALS(A, B)` / `st_equals(A, B)` | 2つのジオメトリが空間的に同一（同じ点の集合と次元を持つ）である場合に TRUE を返します。 | 2つのジオメトリ（A と B）は空間内で完全に同一ですか？ |
| `ST_CONTAINS(A, B)` / `st_contains(A, B)` | ジオメトリ A がジオメトリ B を完全に包含し、両者の内部に少なくとも 1つの共通点がある場合に TRUE を返します。 | 都市の境界（A）は特定の公園（B）を包含していますか？ |
| `ST_CROSSES(A, B)` / `st_crosses(A, B)` | ジオメトリ A と B が部分的に交差するが、互いを完全には包含しない場合に TRUE を返します。 | 2つの道路（A と B）は交差点で交差しますか？ |
| `ST_INTERSECTS(A, B)` / `st_intersects(A, B)` | ジオメトリ A と B に少なくとも 1つの共通点がある場合に TRUE を返します。これは最も汎用的で広く使用されている空間クエリです。 | 検索エリア（A）は、いずれかの店舗所在地（B）と交差しますか？ |
| `ST_OVERLAPS(A, B)` / `st_overlaps(A, B)` | ジオメトリ A と B が同じ次元で、部分的に重なり合い、どちらも他方を完全には包含しない場合に TRUE を返します。 | 2つの区画（A と B）は重なり合っていますか？ |
| `ST_TOUCHES(A, B)` / `st_touches(A, B)` | ジオメトリ A と B が共通の境界を共有するが、両者の内部は交差しない場合に TRUE を返します。 | 隣接する 2つの物件（A と B）は境界を共有していますか？ |
| `ST_WITHIN(A, B)` / `st_within(A, B)` | ジオメトリ A がジオメトリ B 内に完全に含まれ、両者の内部に少なくとも 1つの共通点がある場合に TRUE を返します。これは `ST_Contains(B, A)` の逆です。 | 特定の関心地点（A）は、定義された検索半径（B）内にありますか？ |
| `ST_DWITHIN(A, B, distance)` / `st_dwithin(A, B, distance)` | ジオメトリ A とジオメトリ B の距離が、指定された距離以下である場合に TRUE を返します。<br/>**注記**: ジオメトリ B は現在ポイントのみをサポートしています。距離の単位はメートルです。 | 特定のポイント（B）から 5000 メートル以内にあるすべてのポイントを検索します。 |

## ST_EQUALS / st_equals\{#stequals-stequals}

`ST_EQUALS` 演算子は、2つのジオメトリが空間的に同一（同じ点の集合と次元を持つ）である場合に TRUE を返します。これは、保存された 2つのジオメトリオブジェクトがまったく同じ位置と形状を表しているかどうかを確認するのに役立ちます。

**例**

保存されたジオメトリ（ポイントやポリゴンなど）がターゲットジオメトリとまったく同じかどうかを確認したいとします。たとえば、保存されたポイントを特定の関心地点と比較できます。

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

`ST_CONTAINS` 演算子は、最初のジオメトリが 2 番目のジオメトリを完全に包含する場合に TRUE を返します。これは、ポリゴン内のポイントや、より大きなポリゴン内の小さなポリゴンを見つけるのに役立ちます。

**例**

都市の地区のコレクションがあり、特定の地区の境界内にある特定の関心地点（レストランなど）を見つけたいとします。

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

`ST_CROSSES` 演算子は、2つのジオメトリの交差部分が元のジオメトリよりも低い次元のジオメトリを形成する場合に `TRUE` を返します。これは通常、ラインがポリゴンまたは別のラインと交差する場合に適用されます。

**例**

特定の境界線（別のラインストリング）と交差する、または保護区域（ポリゴン）に進入するすべてのハイキングコース（ラインストリング）を検索したいとします。

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

`ST_INTERSECTS` 演算子は、2つのジオメトリの境界または内部に共通する点が 1つでもある場合に `TRUE` を返します。これは、あらゆる形態の空間的な重なりを検出するための汎用演算子です。

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

`ST_OVERLAPS` 演算子は、同じ次元の 2つのジオメトリが部分的に交差し、その交差部分自体が元のジオメトリと同じ次元を持ちながら、どちらとも等しくない場合に `TRUE` を返します。

**例**

重なり合う販売地域のセットがあり、提案された新しい販売ゾーンと部分的に重なるすべての地域を検索したいとします。

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

`ST_TOUCHES` 演算子は、2つのジオメトリの境界が接触するが、両者の内部は交差しない場合に `TRUE` を返します。これは隣接関係の検出に役立ちます。

**例**

地番区画のマップがあり、公共の公園に直接隣接し、重なりがないすべての区画を検索したいとします。

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

`ST_WITHIN` 演算子は、最初のジオメトリが 2 番目のジオメトリの内部または境界上に完全に含まれる場合に `TRUE` を返します。これは `ST_CONTAINS` の逆です。

**例**

より大きな指定公園区域内に完全に位置するすべての小さな住宅地域を検索したいとします。

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

`GEOMETRY` フィールドの使用方法の詳細については、[ジオメトリフィールド](./use-geometry-field) を参照してください。

## ST_DWITHIN / st_dwithin\{#stdwithin-stdwithin}

`ST_DWITHIN` 演算子は、ジオメトリ A とジオメトリ B の距離が指定された値（メートル単位）以下である場合に `TRUE` を返します。現在、ジオメトリ B はポイントである必要があります。

**例**

店舗所在地のコレクションがあり、特定の顧客の場所から 5,000 メートル以内にあるすべての店舗を検索したいとします。

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
