---
title: "JSON演算子 | BYOC"
slug: /json-filtering-operators
sidebar_label: "JSON演算子"
beta: FALSE
notebook: FALSE
description: "ZillizクラウドJSONフィールドのクエリとフィルタリングのための高度な演算子をサポートし、複雑な構造化データの管理に最適です。これらの演算子により、JSONドキュメントの非常に効果的なクエリが可能になり、JSONフィールド内の特定の要素、値、または条件に基づいてエンティティを取得できます。このセクションでは、JSON固有の演算子の使用方法について説明しますZillizクラウド彼らの機能を説明するための実用的な例を提供します。 | BYOC"
type: origin
token: Py6zwu6r4iPMqVkKAYXcUYLEnXg
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - filter
  - filtering expressions
  - filtering
  - json operators
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search

---

import Admonition from '@theme/Admonition';


# JSON演算子

ZillizクラウドJSONフィールドのクエリとフィルタリングのための高度な演算子をサポートし、複雑な構造化データの管理に最適です。これらの演算子により、JSONドキュメントの非常に効果的なクエリが可能になり、JSONフィールド内の特定の要素、値、または条件に基づいてエンティティを取得できます。このセクションでは、JSON固有の演算子の使用方法について説明しますZillizクラウド彼らの機能を説明するための実用的な例を提供します。

<Admonition type="info" icon="📘" title="ノート">

<p>JSONフィールドは複雑なネストされた構造を扱うことができず、すべてのネストされた構造をプレーンな文字列として扱います。そのため、JSONフィールドを使用する場合は、過度に深いネストを避け、データ構造が最適なパフォーマンスを得るために可能な限りフラットであることを確認することをお勧めします。</p>

</Admonition>

## 使用可能なJSON演算子{#available-json-operators}

ZillizクラウドJSONデータをフィルタリングおよびクエリするのに役立ついくつかの強力なJSON演算子を提供します。これらの演算子は次のとおりです:

- `JSON_CONTAINS(identifier, expr)`:指定されたJSON式がフィールド内にあるエンティティをフィルタリングします。

- `JSON_CONTAINS_ALL(identifier, expr)`:指定されたJSON式のすべての要素がフィールドに存在することを確認します。

- `JSON_CONTAINS_ANY(identifier, expr)`:フィールド内にJSON式のメンバーが少なくとも1つ存在するエンティティをフィルタリングします。

これらの演算子を例を使って探索し、現実世界のシナリオでどのように適用できるかを見てみましょう。

## JSONの内容{#jsoncontains}

`json_contains`演算子は、JSONフィールド内に特定の要素またはサブ配列が存在するかどうかをチェックします。JSON配列またはオブジェクトに特定の値が含まれていることを確認する場合に便利です。

**の例**

`tags`フィールドを持つ製品のコレクションがあると想像してください。このフィールドには、`["electronics", "sale", "new"]`などの文字列のJSON配列が含まれています。`"sale"`タグを持つ製品をフィルタリングしたいと思います。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains(product["tags"], "sale")'
```

この例では、Zillizクラウド`tags`フィールドに要素`"sale"`が含まれるすべての製品を返します。

## JSONの内容{#jsoncontainsall}

`json_contains_all`演算子は、指定されたJSON式のすべての要素がターゲットフィールドに存在することを保証します。JSON配列内の複数の値を一致させる必要がある場合に特に役立ちます。

**の例**

商品タグのシナリオを続けると、`"electronics"`、`"sale"`、および`"new"`のタグを持つすべての商品を検索する場合は、`json_contains_all`演算子を使用できます。

```python
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter = 'json_contains_all(product["tags"], ["electronics", "sale", "new"])'
```

このクエリは、`tags`配列に`"electronics"`、`"sale"`、および`"new"`のすべての指定された要素が含まれているすべての製品を返します。

## JSON_CONTAINS_ANYの設定{#jsoncontainsany}

`json_contains_any`演算子は、フィールド内にJSON式の少なくとも1つのメンバーが存在するエンティティをフィルタリングします。これは、複数の可能な値のいずれかに基づいてエンティティを一致させたい場合に便利です。

**の例**

`"electronics"`、`"sale"`、または`"new"`のタグの少なくとも1つを持つ製品をフィルタリングしたいとします。これを実現するには、`json_contains_any`演算子を使用できます。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains_any(tags, ["electronics", "new", "clearance"])'
```

この場合、Zillizクラウドリスト`["electronics", "new", "clearance"]`のタグのうち少なくとも1つを持つすべての製品を返します。製品にこれらのタグが1つしかない場合でも、結果に含まれます。