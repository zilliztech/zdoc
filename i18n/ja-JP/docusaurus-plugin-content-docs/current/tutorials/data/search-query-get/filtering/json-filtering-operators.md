---
title: "JSON 演算子 | Cloud"
slug: /json-filtering-operators
sidebar_label: "JSON 演算子"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は JSON フィールドのクエリおよびフィルタリング用に高度な演算子をサポートしており、複雑で構造化されたデータを管理するのに最適です。これらの演算子を使用すると、JSON ドキュメントを効果的にクエリし、JSON フィールド内の特定の要素、値、または条件に基づいてエンティティを取得できます。このセクションでは、Zilliz Cloud で JSON 固有の演算子を使用する方法を説明し、その機能を示す実用的な例を提供します。| Cloud"
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
  - json 演算子
  - 近似最近傍検索
  - DiskANN
  - スパースベクトル
  - ベクトル次元

---

import Admonition from '@theme/Admonition';


# JSON 演算子

Zilliz Cloud は JSON フィールドのクエリおよびフィルタリング用に高度な演算子をサポートしており、複雑で構造化されたデータを管理するのに最適です。これらの演算子を使用すると、JSON ドキュメントを効果的にクエリし、JSON フィールド内の特定の要素、値、または条件に基づいてエンティティを取得できます。このセクションでは、Zilliz Cloud で JSON 固有の演算子を使用する方法を説明し、その機能を示す実用的な例を提供します。

<Admonition type="info" icon="📘" title="ノート">

<p>JSON フィールドは複雑なネスト構造を処理できず、すべてのネスト構造をプレーンな文字列として扱います。したがって、JSON フィールドを操作する際には、過度に深いネストを避け、最適なパフォーマンスのためにデータ構造をできるだけフラットにしておくことをお勧めします。</p>

</Admonition>

## 利用可能な JSON 演算子\{#available-json-operators}

Zilliz Cloud は、JSON データをフィルタリングおよびクエリするのに役立ついくつかの強力な JSON 演算子を提供しており、以下のとおりです：

- [`JSON_CONTAINS(identifier, expr)`](./json-filtering-operators#jsoncontains)：指定された JSON 式がフィールド内に見つかるエンティティをフィルタリングします。

- [`JSON_CONTAINS_ALL(identifier, expr)`](./json-filtering-operators#jsoncontainsall)：指定された JSON 式のすべての要素がフィールド内に存在することを確認します。

- [`JSON_CONTAINS_ANY(identifier, expr)`](./json-filtering-operators#jsoncontainsany)：JSON 式の少なくとも1つのメンバーがフィールド内に存在するエンティティをフィルタリングします。

これらの演算子を例とともに詳しく見て、現実世界のシナリオでどのように適用できるか確認しましょう。

## JSON_CONTAINS\{#jsoncontains}

`json_contains` 演算子は、JSON フィールド内に特定の要素またはサブ配列が存在するかどうかを確認します。JSON 配列またはオブジェクトに特定の値が含まれていることを確認したい場合に便利です。

**例**

製品のコレクションがあり、それぞれが `tags` フィールドで、`["electronics", "sale", "new"]` のような文字列の JSON 配列を含んでいるとします。`"sale"` タグを持つ製品をフィルタリングしたいとします。

```python
# JSON データ: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains(product["tags"], "sale")'
```

この例では、Zilliz Cloud は `tags` フィールドに要素 `"sale"` を含むすべての製品を返します。

## JSON_CONTAINS_ALL\{#jsoncontainsall}

`json_contains_all` 演算子は、指定された JSON 式のすべての要素がターゲットフィールド内に存在することを確認します。JSON 配列内で複数の値に一致させる必要がある場合に特に有効です。

**例**

製品タグのシナリオの続きとして、`"electronics"`、`"sale"`、および `"new"` というタグを持つすべての製品を検索したい場合、`json_contains_all` 演算子を使用できます。

```python
# JSON データ: {"tags": ["electronics", "sale", "new", "discount"]}
filter = 'json_contains_all(product["tags"], ["electronics", "sale", "new"])'
```

このクエリは、`tags` 配列にすべての3つの指定要素（`"electronics"`、`"sale"`、および `"new"`）を含むすべての製品を返します。

## JSON_CONTAINS_ANY\{#jsoncontainsany}

`json_contains_any` 演算子は、JSON 式の少なくとも1つのメンバーがフィールド内に存在するエンティティをフィルタリングします。これは、複数の可能性のある値のいずれかに基づいてエンティティに一致させたい場合に便利です。

**例**

`"electronics"`、`"sale"`、または `"new"` のいずれかのタグを持つ製品をフィルタリングするとします。`json_contains_any` 演算子を使用してこれを実現できます。

```python
# JSON データ: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains_any(tags, ["electronics", "new", "clearance"])'
```

この場合、Zilliz Cloud はリスト `["electronics", "new", "clearance"]` 内のタグの少なくとも1つを持つすべての製品を返します。製品がこれらのタグのいずれか1つしか持っていなくても、結果に含まれます。