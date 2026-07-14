---
title: "JSON 演算子 | BYOC"
slug: /json-filtering-operators
sidebar_label: "JSON"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、JSON フィールドのクエリとフィルタリングのための高度な演算子をサポートしており、複雑で構造化されたデータの管理に最適です。これらの演算子により、JSON ドキュメントに対して非常に効果的なクエリを実行でき、JSON フィールド内の特定の要素、値、または条件に基づいてエンティティを取得できます。このセクションでは、Zilliz Cloud における JSON 専用演算子の使用方法を、実用的な例を交えて説明します。 | BYOC"
type: origin
token: Py6zwu6r4iPMqVkKAYXcUYLEnXg
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# JSON 演算子

Zilliz Cloud は、JSON フィールドのクエリとフィルタリングのための高度な演算子をサポートしており、複雑で構造化されたデータの管理に最適です。これらの演算子により、JSON ドキュメントに対して非常に効果的なクエリを実行でき、JSON フィールド内の特定の要素、値、または条件に基づいてエンティティを取得できます。このセクションでは、Zilliz Cloud における JSON 専用演算子の使用方法を、実用的な例を交えて説明します。

<Admonition type="info" icon="📘" title="注意">

JSON フィールドは複雑なネスト構造を扱うことができず、すべてのネスト構造を単なる文字列として扱います。そのため、JSON フィールドを扱う際は、過度に深いネストを避け、最適なパフォーマンスのためにできるだけフラットなデータ構造にすることを推奨します。

</Admonition>

## 利用可能な JSON 演算子\{#available-json-operators}

Zilliz Cloud には、JSON データのフィルタリングやクエリに役立つ強力な JSON 演算子がいくつか用意されており、次のとおりです。

- [`JSON_CONTAINS(identifier, expr)`](./json-filtering-operators#jsoncontains): 指定した JSON 式がフィールド内に見つかるエンティティをフィルタリングします。

- [`JSON_CONTAINS_ALL(identifier, expr)`](./json-filtering-operators#jsoncontainsall): 指定した JSON 式のすべての要素がフィールド内に存在することを保証します。

- [`JSON_CONTAINS_ANY(identifier, expr)`](./json-filtering-operators#jsoncontainsany): JSON 式の少なくとも 1 つのメンバーがフィールド内に存在するエンティティをフィルタリングします。

これらの演算子が実際のシナリオでどのように適用できるかを、例を使って見ていきましょう。

## JSON_CONTAINS\{#jsoncontains}

`json_contains` 演算子は、JSON フィールド内に特定の要素またはサブ配列が存在するかどうかを確認します。JSON 配列またはオブジェクトに特定の値が含まれていることを確認したい場合に便利です。

**例**

各 product に `tags` フィールドがあり、`["electronics", "sale", "new"]` のような文字列の JSON 配列を含む collection があるとします。タグ `"sale"` を持つ product をフィルタリングしたい場合を考えます。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains(product["tags"], "sale")'
```

この例では、Zilliz Cloud は `tags` フィールドに要素 `"sale"` を含むすべての product を返します。

## JSON_CONTAINS_ALL\{#jsoncontainsall}

`json_contains_all` 演算子は、指定した JSON 式のすべての要素が対象フィールド内に存在することを保証します。JSON 配列内の複数の値を一致させる必要がある場合に特に便利です。

**例**

product の tags のシナリオを続けると、タグ `"electronics"`、`"sale"`、`"new"` を持つすべての product を見つけたい場合は、`json_contains_all` 演算子を使用できます。

```python
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter = 'json_contains_all(product["tags"], ["electronics", "sale", "new"])'
```

このクエリは、`tags` 配列に指定された 3 つの要素 `"electronics"`、`"sale"`、`"new"` がすべて含まれているすべての product を返します。

## JSON_CONTAINS_ANY\{#jsoncontainsany}

`json_contains_any` 演算子は、JSON 式の少なくとも 1 つのメンバーがフィールド内に存在するエンティティをフィルタリングします。これは、いくつかの候補値のうちいずれか 1 つに基づいてエンティティを一致させたい場合に便利です。

**例**

少なくとも 1 つのタグ `"electronics"`、`"sale"`、または `"new"` を持つ product をフィルタリングしたいとします。これを実現するには、`json_contains_any` 演算子を使用できます。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains_any(tags, ["electronics", "new", "clearance"])'
```

この場合、Zilliz Cloud はリスト `["electronics", "new", "clearance"]` 内のタグのうち少なくとも 1 つを持つすべての product を返します。product がこれらのタグのうち 1 つしか持っていない場合でも、結果に含まれます。
