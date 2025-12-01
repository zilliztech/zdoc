---
title: "ARRAY 演算子 | Cloud"
slug: /array-filtering-operators
sidebar_label: "ARRAY 演算子"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は配列フィールドをクエリするための強力な演算子を提供し、配列の内容に基づいてエンティティをフィルタリングおよび取得できます。| Cloud"
type: origin
token: MaWywRYCniq6vwkJsT7c2wAyn0f
sidebar_position: 5
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - フィルター
  - フィルタリング式
  - フィルタリング
  - 配列演算子
  - Agentic RAG
  - rag llm アーキテクチャ
  - プライベート llms
  - nn 検索

---

import Admonition from '@theme/Admonition';


# ARRAY 演算子

Zilliz Cloud は配列フィールドをクエリするための強力な演算子を提供し、配列の内容に基づいてエンティティをフィルタリングおよび取得できます。

<Admonition type="info" icon="📘" title="ノート">

<p>配列内のすべての要素は同じ型でなければならず、配列内のネストされた構造はプレーンな文字列として扱われます。したがって、ARRAY フィールドを操作する際には、過度に深いネストを避け、最適なパフォーマンスを得るためにデータ構造をできるだけフラットにしておくことをお勧めします。</p>

</Admonition>

## 利用可能な ARRAY 演算子\{#available-array-operators}

ARRAY 演算子を使用すると、Zilliz Cloud クラスター内の配列フィールドを細かくクエリできます。これらの演算子は以下の通りです：

- [`ARRAY_CONTAINS(identifier, expr)`](./array-filtering-operators#arraycontains)：配列フィールド内に特定の要素が存在するかどうかをチェックします。

- [`ARRAY_CONTAINS_ALL(identifier, expr)`](./array-filtering-operators#arraycontainsall)：指定されたリストのすべての要素が配列フィールド内に存在することを確認します。

- [`ARRAY_CONTAINS_ANY(identifier, expr)`](./array-filtering-operators#arraycontainsany)：指定されたリストの要素のいずれかが配列フィールド内に存在するかどうかをチェックします。

- [`ARRAY_LENGTH(identifier, expr)`](./array-filtering-operators#arraylength)：配列フィールド内の要素数に基づいてエンティティをフィルタリングできます。

## ARRAY_CONTAINS\{#arraycontains}

`ARRAY_CONTAINS` 演算子は、配列フィールド内に特定の要素が存在するかどうかをチェックします。配列内に特定の要素が存在するエンティティを検索したいときに便利です。

**例**

`history_temperatures` という配列フィールドがあり、これは異なる年における記録された最低気温を含んでいるとします。配列に値 `23` が含まれるすべてのエンティティを検索するには、以下のフィルター式を使用できます：

```python
filter = 'ARRAY_CONTAINS(history_temperatures, 23)'
```

これにより、`history_temperatures` 配列に値 `23` が含まれているすべてのエンティティが返されます。

## ARRAY_CONTAINS_ALL\{#arraycontainsall}

`ARRAY_CONTAINS_ALL` 演算子は、指定されたリストのすべての要素が配列フィールド内に存在することを確認します。この演算子は、配列内に複数の値が含まれているエンティティを一致させたい場合に便利です。

**例**

`history_temperatures` 配列に `23` と `24` の両方が含まれているすべてのエンティティを検索する場合は、以下を使用できます：

```python
filter = 'ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])'
```

これにより、`history_temperatures` 配列に指定された両方の値が含まれているすべてのエンティティが返されます。

## ARRAY_CONTAINS_ANY\{#arraycontainsany}

`ARRAY_CONTAINS_ANY` 演算子は、指定されたリストの要素のいずれかが配列フィールド内に存在するかどうかをチェックします。これは、配列内に指定された値の少なくとも1つが含まれているエンティティを一致させたい場合に便利です。

**例**

`history_temperatures` 配列に `23` または `24` のいずれかが含まれているすべてのエンティティを検索するには、以下を使用します：

```python
filter = 'ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])'
```

これにより、`history_temperatures` 配列に `23` または `24` の少なくともいずれかの値が含まれているすべてのエンティティが返されます。

## ARRAY_LENGTH\{#arraylength}

`ARRAY_LENGTH` 演算子を使用すると、配列フィールド内の要素数に基づいてエンティティをフィルタリングできます。これは、特定の長さの配列を持つエンティティを検索する必要がある場合に便利です。

**例**

`history_temperatures` 配列の要素数が10未満であるすべてのエンティティを検索する場合は、以下を使用できます：

```python
filter = 'ARRAY_LENGTH(history_temperatures) < 10'
```

これにより、`history_temperatures` 配列の要素数が10未満であるすべてのエンティティが返されます。