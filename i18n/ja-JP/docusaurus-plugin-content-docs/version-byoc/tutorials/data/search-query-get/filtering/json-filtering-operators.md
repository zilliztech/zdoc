---
title: "JSON演算子 | BYOC"
slug: /json-filtering-operators
sidebar_label: "JSON演算子"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz CloudはJSONフィールドのクエリとフィルタリングのための高度な演算子をサポートしており、複雑な構造化データの管理に最適です。これらの演算子により、JSONドキュメントの効果的なクエリが可能になり、JSONフィールド内の特定の要素、値、または条件に基づいてエンティティを取得できます。このセクションでは、Zilliz CloudでのJSON固有の演算子の使用方法を説明し、その機能を示す実際の例を提供します。 | BYOC"
type: origin
token: Py6zwu6r4iPMqVkKAYXcUYLEnXg
sidebar_position: 4
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - フィルター
  - フィルタリング式
  - フィルタリング
  - json演算子
  - ベクトル検索
  - knnアルゴリズム
  - HNSW
  - 非構造化データとは

---

import Admonition from '@theme/Admonition';


# JSON演算子

Zilliz CloudはJSONフィールドのクエリとフィルタリングのための高度な演算子をサポートしており、複雑な構造化データの管理に最適です。これらの演算子により、JSONドキュメントの効果的なクエリが可能になり、JSONフィールド内の特定の要素、値、または条件に基づいてエンティティを取得できます。このセクションでは、Zilliz CloudでのJSON固有の演算子の使用方法を説明し、その機能を示す実際の例を提供します。

<Admonition type="info" icon="📘" title="注釈">

<p>JSONフィールドは複雑なネスト構造を処理できず、すべてのネスト構造はプレーンな文字列として扱われます。したがって、JSONフィールドを操作する際には、過度な深さのネストを避け、パフォーマンスを最適化するためにデータ構造をできるだけフラットにしておくことをお勧めします。</p>

</Admonition>

## 利用可能なJSON演算子\{#available-json-operators}

Zilliz CloudはJSONデータのフィルタリングとクエリに役立つ複数の強力なJSON演算子を提供しており、以下の通りです。

- [`JSON_CONTAINS(identifier, expr)`](./json-filtering-operators#jsoncontains): 指定されたJSON式がフィールド内に見つかるエンティティをフィルタリングします。

- [`JSON_CONTAINS_ALL(identifier, expr)`](./json-filtering-operators#jsoncontainsall): 指定されたJSON式のすべての要素がフィールド内に存在することを保証します。

- [`JSON_CONTAINS_ANY(identifier, expr)`](./json-filtering-operators#jsoncontainsany): JSON式の少なくとも1つの要素がフィールド内に存在するエンティティをフィルタリングします。

これらの演算子を例とともに詳しく見て、実際のシナリオでどのように適用できるか確認しましょう。

## JSON_CONTAINS\{#jsoncontains}

`json_contains`演算子は、JSONフィールド内に特定の要素またはサブ配列が存在するかどうかをチェックします。JSON配列またはオブジェクトが特定の値を含んでいることを確認したい場合に便利です。

**例**

各製品に`"electronics"`, `"sale"`, `"new"`のような文字列のJSON配列を含む`tags`フィールドがある製品コレクションがあると想像してください。`"sale"`というタグを持つ製品をフィルタリングしたいとします。

```python
# JSONデータ: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains(product["tags"], "sale")'
```

この例では、Zilliz Cloudは`tags`フィールドに要素`"sale"`を含むすべての製品を返します。

## JSON_CONTAINS_ALL\{#jsoncontainsall}

`json_contains_all`演算子は、指定されたJSON式のすべての要素がターゲットフィールドに存在することを保証します。JSON配列内の複数の値にマッチさせる必要がある場合に特に便利です。

**例**

製品タグのシナリオを続けるとして、`"electronics"`、`"sale"`、および`"new"`というタグを持つすべての製品を探したい場合、`json_contains_all`演算子を使用できます。

```python
# JSONデータ: {"tags": ["electronics", "sale", "new", "discount"]}
filter = 'json_contains_all(product["tags"], ["electronics", "sale", "new"])'
```

このクエリは、`tags`配列に`"electronics"`、`"sale"`、および`"new"`という3つの指定要素をすべて含むすべての製品を返します。

## JSON_CONTAINS_ANY\{#jsoncontainsany}

`json_contains_any`演算子は、JSON式の少なくとも1つの要素がフィールド内に存在するエンティティをフィルタリングします。これは、複数の可能な値のうちいずれか1つに基づいてエンティティにマッチさせたい場合に便利です。

**例**

`"electronics"`、`"sale"`、または`"new"`の少なくとも1つのタグを持つ製品をフィルタリングしたいとします。これを行うには、`json_contains_any`演算子を使用できます。

```python
# JSONデータ: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains_any(tags, ["electronics", "new", "clearance"])'
```

この場合、Zilliz Cloudはリスト`["electronics", "new", "clearance"]`内のタグを少なくとも1つ持つすべての製品を返します。製品がこれらのタグのうち1つだけを持っていても、結果に含まれます。