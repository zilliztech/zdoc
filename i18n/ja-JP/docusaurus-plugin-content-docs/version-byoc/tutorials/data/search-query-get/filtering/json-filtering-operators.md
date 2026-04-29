---
title: "JSON 演算子 | BYOC"
slug: /json-filtering-operators
sidebar_key: json-filtering-operators
sidebar_label: "JSON"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、JSON フィールドのクエリとフィルタリングに対応した高度な演算子をサポートしており、複雑な構造化データの管理に最適です。これらの演算子により、JSON ドキュメントを効率的にクエリでき、JSON フィールド内の特定の要素、値、または条件に基づいてエンティティを取得できます。このセクションでは、Zilliz Cloud で JSON 固有の演算子を使用する方法を、その機能を説明する実践的な例とともに解説します。 | BYOC"
type: origin
token: Py6zwu6r4iPMqVkKAYXcUYLEnXg
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - データ
  - フィルタ
  - フィルタリング式
  - フィルタリング
  - JSON 演算子

---

import Admonition from '@theme/Admonition';


# JSON 演算子

Zilliz Cloud は、JSON フィールドのクエリおよびフィルターに使用できる高度な演算子をサポートしており、複雑で構造化されたデータの管理に最適です。これらの演算子により、JSON ドキュメントを非常に効率的にクエリでき、JSON フィールド内の特定の要素、値、または条件に基づいてエンティティを取得できます。このセクションでは、Zilliz Cloud における JSON 固有の演算子の使用方法について説明し、その機能を示す実用的な例を提供します。

<Admonition type="info" icon="📘" title="Notes">

<p>JSON フィールドは複雑な入れ子構造を扱うことができず、すべての入れ子構造をプレーンな文字列として扱います。したがって、JSON フィールドを使用する際には、過度に深い入れ子を避け、パフォーマンスを最適化するためにデータ構造を可能な限りフラットにすることをお勧めします。</p>

</Admonition>

## 利用可能な JSON 演算子\{#available-json-operators}

Zilliz Cloud は、JSON データのフィルタリングおよびクエリに役立ついくつかの強力な JSON 演算子を提供しています。これらの演算子は以下のとおりです。

- [`JSON_CONTAINS(identifier, expr)`](./json-filtering-operators#jsoncontains): 指定された JSON 式がフィールド内に含まれているエンティティをフィルターします。

- [`JSON_CONTAINS_ALL(identifier, expr)`](./json-filtering-operators#jsoncontainsall): 指定された JSON 式のすべての要素がフィールド内に存在することを保証します。

- [`JSON_CONTAINS_ANY(identifier, expr)`](./json-filtering-operators#jsoncontainsany): JSON 式の少なくとも 1 つのメンバーがフィールド内に存在するエンティティをフィルターします。

次に、これらの演算子を実際のシナリオでの適用方法を示す例とともに詳しく見ていきましょう。

## JSON_CONTAINS\{#jsoncontains}

`json_contains` 演算子は、特定の要素またはサブ配列が JSON フィールド内に存在するかどうかをチェックします。JSON 配列またはオブジェクトに特定の値が含まれていることを確認したい場合に便利です。

**例**

商品のコレクションがあり、各商品に `["electronics", "sale", "new"]` のような文字列の JSON 配列を含む `tags` フィールドがあるとします。ここで `"sale"` タグを持つ商品のみをフィルターしたいとします。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains(product["tags"], "sale")'
```

この例では、Zilliz Cloud は `tags` フィールドに要素 `"sale"` を含むすべての商品を返します。

## JSON_CONTAINS_ALL\{#jsoncontainsall}

`json_contains_all` 演算子は、指定された JSON 式のすべての要素が対象フィールドに存在することを保証します。JSON 配列内で複数の値を一致させる必要がある場合に特に役立ちます。

**例**

商品タグのシナリオを引き続き使用して、タグ `"electronics"`、`"sale"`、および `"new"` をすべて持つ商品を検索したい場合は、`json_contains_all` 演算子を使用できます。

```python
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter = 'json_contains_all(product["tags"], ["electronics", "sale", "new"])'
```

このクエリは、`tags` 配列に指定された3つの要素 `"electronics"`、`"sale"`、および `"new"` がすべて含まれるすべての製品を返します。

## JSON_CONTAINS_ANY\{#jsoncontainsany}

`json_contains_any` 演算子は、JSON 式のメンバーのうち少なくとも1つがフィールド内に存在するエンティティをフィルタリングします。これは、複数の可能な値のうちいずれか1つに基づいてエンティティをマッチさせたい場合に便利です。

**例**

たとえば、タグに `"electronics"`、`"sale"`、または `"new"` のいずれか少なくとも1つを持つ製品をフィルタリングしたい場合、`json_contains_any` 演算子を使用できます。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains_any(tags, ["electronics", "new", "clearance"])'
```

この場合、Zilliz Cloud はリスト `["electronics", "new", "clearance"]` 内のタグのうち少なくとも1つを持つすべての商品を返します。商品がこれらのタグのうち1つだけを持っていても、結果に含まれます。