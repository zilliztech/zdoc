---
title: "配列演算子 | Cloud"
slug: /array-filtering-operators
sidebar_key: array-filtering-operators
sidebar_label: "配列"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、配列フィールドをクエリするための強力な演算子を提供し、配列の内容に基づいてエンティティをフィルタリングおよび取得できます。| Cloud"
type: origin
token: MaWywRYCniq6vwkJsT7c2wAyn0f
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - コレクション
  - データ
  - フィルタ
  - フィルタリング式
  - フィルタリング
  - 配列演算子

---

import Admonition from '@theme/Admonition';


# ARRAY 演算子

Zilliz Cloud は、配列フィールドをクエリするための強力な演算子を提供しており、配列の内容に基づいてエンティティをフィルタリングおよび取得できます。

<Admonition type="info" icon="📘" title="Notes">

<p>配列内のすべての要素は同じ型である必要があり、配列内のネストされた構造はプレーンな文字列として扱われます。したがって、ARRAY フィールドを操作する際には、過度に深いネストを避け、パフォーマンスを最適化するためにデータ構造を可能な限りフラットにすることをお勧めします。</p>

</Admonition>

## 利用可能な ARRAY 演算子\{#available-array-operators}

ARRAY 演算子を使用すると、Zilliz Cloud クラスター内の配列フィールドを細かくクエリできます。これらの演算子は次のとおりです。

- [`ARRAY_CONTAINS(identifier, expr)`](./array-filtering-operators#arraycontains): 配列フィールド内に特定の要素が存在するかどうかをチェックします。

- [`ARRAY_CONTAINS_ALL(identifier, expr)`](./array-filtering-operators#arraycontainsall): 指定されたリストのすべての要素が配列フィールド内に存在することを保証します。

- [`ARRAY_CONTAINS_ANY(identifier, expr)`](./array-filtering-operators#arraycontainsany): 指定されたリストのいずれかの要素が配列フィールド内に存在するかどうかをチェックします。

- [`ARRAY_LENGTH(identifier)`](./array-filtering-operators#arraylength): 配列フィールド内の要素数を返し、比較演算子と組み合わせてフィルタリングに使用できます。

## ARRAY_CONTAINS\{#arraycontains}

`ARRAY_CONTAINS` 演算子は、配列フィールド内に特定の要素が存在するかどうかをチェックします。配列内に指定された要素が含まれるエンティティを見つけたい場合に便利です。

**例**

たとえば、`history_temperatures` という配列フィールドがあり、これは異なる年における記録された最低気温を含んでいるとします。配列に値 `23` が含まれるすべてのエンティティを検索するには、次のフィルター式を使用できます：

```python
filter = 'ARRAY_CONTAINS(history_temperatures, 23)'
```

これは、`history_temperatures` 配列に値 `23` が含まれるすべてのエンティティを返します。

## ARRAY_CONTAINS_ALL\{#arraycontainsall}

`ARRAY_CONTAINS_ALL` 演算子は、指定されたリストのすべての要素が配列フィールド内に存在することを保証します。この演算子は、配列内に複数の値を含むエンティティを検索したい場合に役立ちます。

**例**

`history_temperatures` 配列に `23` と `24` の両方が含まれるすべてのエンティティを検索したい場合は、次のように使用できます:

```python
filter = 'ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])'
```

これは、`history_temperatures` 配列に指定された両方の値が含まれるすべてのエンティティを返します。

## ARRAY_CONTAINS_ANY\{#arraycontainsany}

`ARRAY_CONTAINS_ANY` 演算子は、指定されたリスト内のいずれかの要素が配列フィールドに存在するかどうかをチェックします。この演算子は、配列内に指定された値の少なくとも1つを含むエンティティをマッチさせたい場合に役立ちます。

**例**

`history_temperatures` 配列に `23` または `24` のいずれかが含まれるすべてのエンティティを検索するには、次のように使用します:

```python
filter = 'ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])'
```

これは、`history_temperatures` 配列に値 `23` または `24` の少なくとも一方を含むすべてのエンティティを返します。

## ARRAY_LENGTH\{#arraylength}

`ARRAY_LENGTH` は、配列フィールドの長さ（要素数）を返します。この関数はちょうど1つのパラメータを受け取ります。そのパラメータは配列フィールドの識別子です。

**例**

`history_temperatures` 配列の要素数が10未満であるすべてのエンティティを検索するには：

```python
filter = 'ARRAY_LENGTH(history_temperatures) < 10'
```

これにより、`history_temperatures` 配列の要素数が 10 未満であるすべてのエンティティが返されます。