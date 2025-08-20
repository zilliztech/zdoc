---
title: "アレイ演算子 | Cloud"
slug: /array-filtering-operators
sidebar_label: "アレイ演算子"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、配列フィールドをクエリするための強力な演算子を提供し、配列の内容に基づいてエンティティをフィルタリングして取得することができます。 | Cloud"
type: origin
token: LqSTw6JCuiMzJnkgyAccYAxenh9
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - filter
  - filtering expressions
  - filtering
  - array operators
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval

---

import Admonition from '@theme/Admonition';


# アレイ演算子

Zilliz Cloudは、配列フィールドをクエリするための強力な演算子を提供し、配列の内容に基づいてエンティティをフィルタリングして取得することができます。

<Admonition type="info" icon="📘" title="ノート">

<p>配列内のすべての要素は同じ型でなければならず、配列内のネストされた構造はプレーンな文字列として扱われます。したがって、ARRAYフィールドを使用する場合は、過度に深いネストを避け、データ構造が最適なパフォーマンスのために可能な限りフラットであることを確認することが望ましいです。</p>

</Admonition>

## 利用可能なARRAYオペレーター{#available-array-operators}

ARRAY演算子を使用すると、Zilliz Cloudクラスター内の配列フィールドを細かくクエリできます。これらの演算子は次のとおりです:

- `ARRAY_CONTAINS(identifier, expr)`:配列フィールドに特定の要素が存在するかどうかをチェックします。

- `ARRAY_CONTAINS_ALL(identifier, expr)`:指定されたリストのすべての要素が配列フィールドに存在することを保証します。

- `ARRAY_CONTAINS_ANY(identifier, expr)`:指定されたリストの要素のいずれかが配列フィールドに存在するかどうかをチェックします。

- `ARRAY_LENGTH(identifier, expr)`:配列フィールドの要素数に基づいてエンティティをフィルタリングできます。

## 配列を含む{#arraycontains}

ARRAY_`CONTAINS`演算子は、配列フィールドに特定の要素が存在するかどうかをチェックします。特定の要素が配列内に存在するエンティティを検索する場合に便利です。

**例**

異なる年の記録された最低気温を含む配列フィールド`history_`温度があるとします。配列に値`23`が含まれるすべてのエンティティを見つけるには、次のフィルタ式を使用します。

```python
filter = 'ARRAY_CONTAINS(history_temperatures, 23)'
```

これにより、`history_`温度配列に値`23`が含まれるすべてのエンティティが返されます。

## すべてを含む配列{#arraycontainsall}

ARRAY_`CONTAINS_ALL`演算子は、指定されたリストのすべての要素が配列フィールドに存在することを保証します。この演算子は、配列内に複数の値を含むエンティティを一致させたい場合に便利です。

**例**

もし`history_温度`配列に`23`と`24`の両方が含まれているすべてのエンティティを見つけたい場合は、次のようにします。

```python
filter = 'ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])'
```

これにより、`history_`温度配列に指定された両方の値が含まれるすべてのエンティティが返されます。

## 配列の内容{#arraycontainsany}

ARRAY_`CONTAINS_ANY`演算子は、指定されたリストの要素のいずれかが配列フィールドに存在するかどうかをチェックします。これは、配列内の指定された値の少なくとも1つを含むエンティティに一致させたい場合に便利です。

**例**

History_`Temperations配列`に`23`または`24`が含まれるすべてのエンティティを検索するには、次を使用します。

```python
filter = 'ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])'
```

これにより、`history_`温度配列に`23`または`24`の値が少なくとも1つ含まれているすべてのエンティティが返されます。

## 配列の長さ{#arraylength}

ARRAY`_LENGTH`演算子を使用すると、配列フィールドの要素数に基づいてエンティティをフィルタリングできます。これは、特定の長さの配列を持つエンティティを見つける必要がある場合に便利です。

**例**

History_`Temperations配列`の要素数が10未満のすべてのエンティティを検索するには、次のようにします。

```python
filter = 'ARRAY_LENGTH(history_temperatures) < 10'
```

これにより、`History_Temperations`配列の要素数が10未満のすべてのエンティティが返されます。