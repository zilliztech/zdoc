---
title: "JSON演算子 | BYOC"
slug: /json-filtering-operators
sidebar_label: "JSON演算子"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、JSONフィールドをクエリおよびフィルタリングするための高度な演算子をサポートしており、複雑な構造化データを管理するのに最適です。これらの演算子により、JSONドキュメントの非常に効果的なクエリが可能になり、JSONフィールド内の特定の要素、値、または条件に基づいてエンティティを取得できます。このセクションでは、Zilliz CloudでJSON固有の演算子を使用する方法を説明し、その機能を説明する実用的な例を提供します。 | BYOC"
type: origin
token: OOsGwMFbHiXiZOk9DMpctFeznxe
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
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus

---

import Admonition from '@theme/Admonition';


# JSON演算子

Zilliz Cloudは、JSONフィールドをクエリおよびフィルタリングするための高度な演算子をサポートしており、複雑な構造化データを管理するのに最適です。これらの演算子により、JSONドキュメントの非常に効果的なクエリが可能になり、JSONフィールド内の特定の要素、値、または条件に基づいてエンティティを取得できます。このセクションでは、Zilliz CloudでJSON固有の演算子を使用する方法を説明し、その機能を説明する実用的な例を提供します。

<Admonition type="info" icon="📘" title="ノート">

<p>JSONフィールドは複雑なネストされた構造を扱うことができず、すべてのネストされた構造をプレーンな文字列として扱います。そのため、JSONフィールドを使用する場合は、過度に深いネストを避け、データ構造が最適なパフォーマンスを得るために可能な限りフラットであることを確認することをお勧めします。</p>

</Admonition>

## 使用可能なJSON演算子{#available-json-operators}

Zilliz Cloudには、JSONデータをフィルタリングしてクエリするための強力なJSON演算子がいくつか用意されています。これらの演算子は以下の通りです:

- `JSON_CONTAINS(identifier, expr)`:指定されたJSON式がフィールド内にあるエンティティをフィルターします。

- `JSON_CONTAINS_ALL(identifier, expr)`:指定されたJSON式のすべての要素がフィールドに存在することを確認します。

- `JSON_CONTAINS_ANY(identifier, expr)`:フィールド内に少なくとも1つのJSON式のメンバーが存在するエンティティをフィルタリングします。

これらの演算子を例を使って探索し、現実世界のシナリオでどのように適用できるかを見てみましょう。

## JSON_CONTAINS{#jsoncontains}

JSONフィールド内に特定の要素またはサブ配列が存在するかどうかをチェックする`json_including`演算子は、JSON配列またはオブジェクトに特定の値が含まれていることを確認する場合に役立ちます。

**例**

商品のコレクションがあると想像してください。それぞれの`タグ`フィールドには、`["electronics","sale","new"]`のような文字列のJSON配列が含まれています。タグ`"sale"`を持つ商品をフィルタリングしたいと思います。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains(product["tags"], "sale")'
```

この例では、Zilliz Cloudは、`tag`フィールドに`"sale"`という要素が含まれるすべての商品を返します。

## JSON_CONTAINS_ALL{#jsoncontainsall}

`json_contains_all`演算子は、指定されたJSON式のすべての要素がターゲットフィールドに存在することを保証します。これは、JSON配列内の複数の値を一致させる必要がある場合に特に便利です。

**例**

商品タグのシナリオを続けると、`"electronics"`、`"sale"`、`"new"`のタグを持つすべての商品を検索する場合は、`json_contains_all`演算子を使用できます。

```python
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter = 'json_contains_all(product["tags"], ["electronics", "sale", "new"])'
```

このクエリは、`tag`配列に指定された3つの要素(`"electronics"`、`"sale"`、`"new"`)がすべて含まれるすべての製品を返します。

## JSON_CONTAINS_ANY{#jsoncontainsany}

`json_contains_any`演算子は、フィールド内にJSON式の少なくとも1つのメンバーが存在するエンティティをフィルタリングします。これは、複数の可能な値のいずれかに基づいてエンティティを一致させたい場合に便利です。

**例**

タグが`"electronics"`、`"sale"`、または"`new"`のうち少なくとも1つを持つ製品をフィルタリングしたいとします。これを実現するには、`json_contains_any`演算子を使用できます。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains_any(tags, ["electronics", "new", "clearance"])'
```

この場合、Zilliz Cloudは、リスト内のタグのうち少なくとも1つを持つすべての製品を返します`["electronics","new","クリアランス"]`。製品にこれらのタグが1つしかない場合でも、結果に含まれます。