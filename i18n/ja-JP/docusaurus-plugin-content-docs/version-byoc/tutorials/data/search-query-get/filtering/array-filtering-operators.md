---
title: "アレイ演算子 | BYOC"
slug: /array-filtering-operators
sidebar_label: "アレイ演算子"
beta: FALSE
notebook: FALSE
description: "Zillizクラウド配列フィールドをクエリするための強力な演算子を提供し、配列の内容に基づいてエンティティをフィルタリングおよび取得できるようにします。 | BYOC"
type: origin
token: MaWywRYCniq6vwkJsT7c2wAyn0f
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
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db

---

import Admonition from '@theme/Admonition';


# アレイ演算子

Zillizクラウド配列フィールドをクエリするための強力な演算子を提供し、配列の内容に基づいてエンティティをフィルタリングおよび取得できるようにします。 

<Admonition type="info" icon="📘" title="ノート">

<p>配列内のすべての要素は同じ型でなければならず、配列内のネストされた構造はプレーンな文字列として扱われます。したがって、ARRAYフィールドを使用する場合は、過度に深いネストを避け、データ構造が最適なパフォーマンスのために可能な限りフラットであることを確認することが望ましいです。</p>

</Admonition>

## 利用可能なARRAYオペレーター{#available-array-operators}

ARRAY演算子は、配列フィールドの細かいクエリを可能にしますZilliz Cloudクラスタこれらの演算子は:

- `ARRAY_CONTAINS(identifier, expr)`:配列フィールドに特定の要素が存在するかどうかをチェックします。

- `ARRAY_CONTAINS_ALL(identifier, expr)`:指定されたリストのすべての要素が配列フィールドに存在することを確認します。

- `ARRAY_CONTAINS_ANY(identifier, expr)`:指定されたリストの要素が配列フィールドに存在するかどうかをチェックします。

- `ARRAY_LENGTH(identifier, expr)`:配列フィールドの要素数に基づいてエンティティをフィルタリングできます。

## 配列を含む{#arraycontains}

`ARRAY_CONTAINS`演算子は、配列のフィールドに特定の要素が存在するかどうかをチェックします。特定の要素が配列内に存在するエンティティを検索する場合に便利です。

**の例**

`history_temperatures`という配列フィールドがあるとします。このフィールドには、異なる年の記録された最低気温が含まれています。配列に値`23`が含まれるすべてのエンティティを見つけるには、次のフィルタ式を使用できます。

```python
filter = 'ARRAY_CONTAINS(history_temperatures, 23)'
```

これにより、`history_temperatures`配列に値`23`が含まれるすべてのエンティティが返されます。

## すべてを含む配列{#arraycontainsall}

`ARRAY_CONTAINS_ALL`演算子は、指定されたリストのすべての要素が配列フィールドに存在することを保証します。この演算子は、配列内に複数の値を含むエンティティを一致させたい場合に便利です。

**の例**

`history_temperatures`配列に`23`と`24`の両方が含まれるすべてのエンティティを検索する場合は、次のようにします。

```python
filter = 'ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])'
```

`history_temperatures`配列に指定された両方の値が含まれるすべてのエンティティが返されます。

## 配列の内容{#arraycontainsany}

`ARRAY_CONTAINS_ANY`演算子は、指定されたリストの要素のいずれかが配列フィールドに存在するかどうかをチェックします。これは、配列内の指定された値の少なくとも1つを含むエンティティを一致させたい場合に便利です。

**の例**

`history_temperatures`配列に`23`または`24`のいずれかが含まれるすべてのエンティティを検索するには、次を使用できます。

```python
filter = 'ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])'
```

これにより、`history_temperatures`配列に`23`または`24`のいずれかの値が含まれているすべてのエンティティが返されます。

## 配列の長さ{#arraylength}

`ARRAY_LENGTH`演算子を使用すると、配列フィールドの要素数に基づいてエンティティをフィルタリングできます。これは、特定の長さの配列を持つエンティティを検索する必要がある場合に便利です。

**の例**

`history_temperatures`配列の要素数が10未満のすべてのエンティティを検索する場合は、次のようにします。

```python
filter = 'ARRAY_LENGTH(history_temperatures) < 10'
```

これにより、`history_temperatures`配列の要素数が10未満のすべてのエンティティが返されます。