---
title: "ARRAY演算子 | BYOC"
slug: /array-filtering-operators
sidebar_label: "ARRAY演算子"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは配列フィールドをクエリするための強力な演算子を提供しており、配列の内容に基づいてエンティティをフィルターおよび取得できます。| BYOC"
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
  - milvus lite
  - milvus ベンチマーク
  - 管理型milvus
  - サーバーレスベクトルデータベース

---

import Admonition from '@theme/Admonition';


# ARRAY演算子

Zilliz Cloudは配列フィールドをクエリするための強力な演算子を提供しており、配列の内容に基づいてエンティティをフィルターおよび取得できます。

<Admonition type="info" icon="📘" title="注釈">

<p>配列内のすべての要素は同じ型である必要があり、配列内のネストされた構造はプレーンな文字列として扱われます。したがって、ARRAYフィールドを操作する際には、過度に深いネストを避けて、パフォーマンスを最適化するためにできるだけデータ構造をフラットにすることをお勧めします。</p>

</Admonition>

## 利用可能なARRAY演算子\{#available-array-operators}

ARRAY演算子を使用すると、Zilliz Cloudクラスター内の配列フィールドを細かくクエリできます。これらの演算子は以下の通りです。

- [`ARRAY_CONTAINS(identifier, expr)`](./array-filtering-operators#arraycontains): 配列フィールドに特定の要素が存在するかどうかをチェックします。

- [`ARRAY_CONTAINS_ALL(identifier, expr)`](./array-filtering-operators#arraycontainsall): 指定されたリストのすべての要素が配列フィールド内に存在することを確認します。

- [`ARRAY_CONTAINS_ANY(identifier, expr)`](./array-filtering-operators#arraycontainsany): 指定されたリストの要素のいずれかが配列フィールド内に存在するかどうかをチェックします。

- [`ARRAY_LENGTH(identifier, expr)`](./array-filtering-operators#arraylength): 配列フィールド内の要素数に基づいてエンティティをフィルターできます。

## ARRAY_CONTAINS\{#arraycontains}

`ARRAY_CONTAINS`演算子は、配列フィールド内に特定の要素が存在するかどうかをチェックします。これは、配列に指定された要素が存在するエンティティを検索したい場合に便利です。

**例**

`history_temperatures`という配列フィールドがあり、異なる年の記録された最低気温が含まれているとします。配列に値`23`が含まれるすべてのエンティティを検索するには、以下のフィルター式を使用できます。

```python
filter = 'ARRAY_CONTAINS(history_temperatures, 23)'
```

これにより、`history_temperatures`配列に値`23`が含まれるすべてのエンティティが返されます。

## ARRAY_CONTAINS_ALL\{#arraycontainsall}

`ARRAY_CONTAINS_ALL`演算子は、指定されたリストのすべての要素が配列フィールド内に存在することを確認します。この演算子は、配列内に複数の値が含まれるエンティティを一致させたい場合に便利です。

**例**

`history_temperatures`配列に`23`と`24`の両方が含まれるすべてのエンティティを検索したい場合は、以下を使用できます。

```python
filter = 'ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])'
```

これにより、`history_temperatures`配列に指定された値の両方が含まれるすべてのエンティティが返されます。

## ARRAY_CONTAINS_ANY\{#arraycontainsany}

`ARRAY_CONTAINS_ANY`演算子は、指定されたリストの要素のいずれかが配列フィールド内に存在するかどうかをチェックします。これは、配列内に指定された値の少なくとも1つが含まれるエンティティを一致させたい場合に便利です。

**例**

`history_temperatures`配列に`23`または`24`のいずれかが含まれるすべてのエンティティを検索するには、以下を使用できます。

```python
filter = 'ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])'
```

これにより、`history_temperatures`配列に値`23`または`24`の少なくとも1つが含まれるすべてのエンティティが返されます。

## ARRAY_LENGTH\{#arraylength}

`ARRAY_LENGTH`演算子を使用すると、配列フィールド内の要素数に基づいてエンティティをフィルターできます。これは、特定の長さを持つ配列を含むエンティティを検索する必要がある場合に便利です。

**例**

`history_temperatures`配列の要素数が10未満のすべてのエンティティを検索したい場合は、以下を使用できます。

```python
filter = 'ARRAY_LENGTH(history_temperatures) < 10'
```

これにより、`history_temperatures`配列の要素数が10未満のすべてのエンティティが返されます。