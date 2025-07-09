---
title: "フィルタリングの説明 | Cloud"
slug: /filtering-overview
sidebar_label: "フィルタリングの説明"
beta: FALSE
notebook: FALSE
description: "Zillizクラウドデータの正確なクエリを可能にする強力なフィルタリング機能を提供します。フィルター式を使用すると、特定のスカラーフィールドをターゲットにして、さまざまな条件で検索結果を絞り込むことができます。このガイドでは、フィルター式の使用方法について説明します。Zilliz Cloudクラスタクエリ操作に焦点を当てた例があります。これらのフィルターを検索および削除リクエストに適用することもできます。 | Cloud"
type: origin
token: AIb1wNAE3iiKVSk8MHAcVA4QnJb
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - filter
  - filtering expressions
  - filtering
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm

---

import Admonition from '@theme/Admonition';


# フィルタリングの説明

Zillizクラウドデータの正確なクエリを可能にする強力なフィルタリング機能を提供します。フィルター式を使用すると、特定のスカラーフィールドをターゲットにして、さまざまな条件で検索結果を絞り込むことができます。このガイドでは、フィルター式の使用方法について説明します。Zilliz Cloudクラスタクエリ操作に焦点を当てた例があります。これらのフィルターを検索および削除リクエストに適用することもできます。

## 基本的な演算子{#basic-operators}

Zillizクラウドデータをフィルタリングするためのいくつかの基本的な演算子をサポートしています:

- 比較演算子: `==`、`!=`、`>`、`<`、`>=`、および`<=`は、数値フィールドまたはテキストフィールドに基づくフィルタリングを可能にします。

- **範囲フィルター**: `IN`と`LIKE`は、特定の値の範囲やセットを一致させるのに役立ちます。

- 算術演算子: `+`、`-`、`*`、`/`、`%`、および`**`は、数値フィールドを含む計算に使用されます。

- 論理演算子: `AND`、`OR`、および`NOT`は、複数の条件を複雑な式に結合します。

- **IS NULLおよびIS NOT NULL演算子**: `IS NULL`および`IS NOT NULL`演算子は、null値(データの欠如)を含むかどうかに基づいてフィールドをフィルタリングするために使用されます。詳細については、[基本演算子](./basic-filtering-operators#is-null-and-is-not-null-operators)を参照してください。

### 例:色でフィルタリングする{#example-filtering-by-color}

スカラーフィールド`color`で原色(赤、緑、青)の図形を検索するには、次のフィルター式を使用します。

```python
filter='color in ["red", "green", "blue"]'
```

### 例: JSONフィールドのフィルタリング{#example-filtering-json-fields}

ZillizクラウドJSONフィールド内のキーを参照することができます。例えば、キー`price`と`model`を持つJSONフィールド`product`があり、特定のモデルと価格が1,850未満の商品を検索したい場合は、次のフィルタ式を使用してください。

```python
filter='product["model"] == "JSN-087" AND product["price"] < 1850'
```

### 例:配列フィールドのフィルタリング{#example-filtering-array-fields}

`history_temperatures`という配列フィールドに、2000年以降の観測所によって報告された平均気温の記録が含まれており、2009年（10番目に記録された）の気温が23℃を超える観測所を検索したい場合は、次の式を使用してください。

```python
filter='history_temperatures[10] > 23'
```

これらの基本演算子の詳細については、[基本演算子](./basic-filtering-operators)を参照してください。

## フィルター式のテンプレート{#filter-expression-templates}

CJK文字を使用してフィルタリングする場合、文字セットが大きくエンコードの違いがあるため、処理がより複雑になる可能性があります。これにより、特に`IN`演算子を使用する場合、パフォーマンスが低下する可能性があります。

ZillizクラウドCJK文字を扱う際のパフォーマンスを最適化するために、フィルター式テンプレートを導入しました。フィルター式から動的な値を分離することで、クエリエンジンはパラメーターの挿入をより効率的に処理します。

### 例{#example}

「北京」または「上海」に住む25歳以上の個人を検索するには、次のテンプレート式を使用してください。

```python
filter = "age > 25 AND city IN ['北京', '上海']"
```

パフォーマンスを向上させるには、このバリエーションをパラメーターとともに使用します。

```python
filter = "age > {age} AND city in {city}",
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

このアプローチは、解析のオーバーヘッドを減らし、クエリの速度を向上させます。詳細については、[フィルターテンプレート](./filtering-templating)を参照してください。

## データ型固有の演算子{#data-type-specific-operators}

ZillizクラウドJSON、ARRAY、VARCHARフィールドなど、特定のデータ型に対する高度なフィルタリング演算子を提供します。

### JSONフィールド固有の演算子{#json-field-specific-operators}

ZillizクラウドJSONフィールドをクエリするための高度な演算子を提供し、複雑なJSON構造内で正確なフィルタリングを可能にします。

`JSON_CONTAINS(identifier, jsonExpr)`:フィールドにJSON式が存在するかどうかをチェックします。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains(tags, "sale")'
```

`JSON_CONTAINS_ALL(identifier, jsonExpr)`: JSON式のすべての要素が存在することを確認します。

```python
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter='json_contains_all(tags, ["electronics", "sale", "new"])'
```

`JSON_CONTAINS_ANY(identifier, jsonExpr)`: JSON式内に少なくとも1つの要素が存在するエンティティをフィルタリングします。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains_any(tags, ["electronics", "new", "clearance"])'
```

JSON演算子の詳細については、[JSON演算子](./json-filtering-operators)を参照してください。

### ARRAYフィールド固有の演算子{#array-field-specific-operators}

Zillizクラウド`ARRAY_CONTAINS`、`ARRAY_CONTAINS_ALL`、`ARRAY_CONTAINS_ANY`、および`ARRAY_LENGTH`などの配列フィールドの高度なフィルタリング演算子を提供し、配列データを細かく制御できるようにします

`ARRAY_CONTAINS`:特定の要素を含む図形をフィルタリングします。

```python
filter="ARRAY_CONTAINS(history_temperatures, 23)"
```

`ARRAY_CONTAINS_ALL`:リスト内のすべての要素が存在するエンティティをフィルタリングします。

```python
filter="ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])"
```

`ARRAY_CONTAINS_ANY`:リストから任意の要素を含むエンティティをフィルタリングします。

```python
filter="ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])"
```

`ARRAY_LENGTH`:配列の長さに基づいてフィルタリングします。

```python
filter="ARRAY_LENGTH(history_temperatures) < 10"
```

配列演算子の詳細については、[アレイ演算子](./array-filtering-operators)を参照してください。

### VARCHARフィールド固有の演算子{#varchar-field-specific-operators}

ZillizクラウドVARCHARフィールドで正確なテキストベースの検索のための専門演算子を提供します

#### `TEXT_MATCH`オペレーター{#inlinecodeplaceholder0-operator}

`TEXT_MATCH`演算子は、特定のクエリ用語に基づく正確なドキュメント検索を可能にします。これは、スカラーフィルタとベクトル類似検索を組み合わせたフィルタリングされた検索に特に役立ちます。セマンティック検索とは異なり、テキストマッチは正確な用語の出現に焦点を当てています。

ZillizクラウドTantivyを使用して、逆索引と用語ベースのテキスト検索をサポートしています。その過程には、以下が含まれます:

1. **アナライザー**:入力テキストをトークン化して処理します。

1. インデックス作成:ユニークなトークンをドキュメントにマッピングする逆インデックスを作成します。

詳細については、[テキスト一致](./text-match)を参照してください。

#### `PHRASE_MATCH`オペレーター{#inlinecodeplaceholder0-operator}

**PHRASE_MATCH**演算子は、クエリ用語の順序と隣接性の両方を考慮して、完全なフレーズ一致に基づく文書の正確な検索を可能にします。

詳細については、[フレーズマッチ](./undefined)を参照してください。

</include>