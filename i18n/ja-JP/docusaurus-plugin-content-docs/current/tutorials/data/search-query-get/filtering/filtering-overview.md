---
title: "フィルタリングの説明 | Cloud"
slug: /filtering-overview
sidebar_label: "フィルタリングの説明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、データの正確なクエリを可能にする強力なフィルタリング機能を提供します。フィルター式を使用すると、特定のスカラー型フィールドを対象にし、異なる条件で検索結果を絞り込むことができます。このガイドでは、Zilliz Cloudクラスターにおけるフィルター式の使用方法を説明し、クエリ操作に焦点を当てた例を紹介します。これらのフィルターは、検索や削除リクエストにも適用できます。| Cloud"
type: origin
token: AIb1wNAE3iiKVSk8MHAcVA4QnJb
sidebar_position: 1
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - フィルター
  - フィルタリング式
  - フィルタリング
  - ベクトルデータベース比較
  - openai ベクターデータベース
  - 自然言語処理データベース
  - 安価なベクトルデータベース

---

import Admonition from '@theme/Admonition';


# フィルタリングの説明

Zilliz Cloudは、データの正確なクエリを可能にする強力なフィルタリング機能を提供します。フィルター式を使用すると、特定のスカラー型フィールドを対象にし、異なる条件で検索結果を絞り込むことができます。このガイドでは、Zilliz Cloudクラスターにおけるフィルター式の使用方法を説明し、クエリ操作に焦点を当てた例を紹介します。これらのフィルターは、検索や削除リクエストにも適用できます。

## 基本演算子\{#basic-operators}

Zilliz Cloudはデータのフィルタリングのためのいくつかの基本演算子をサポートしています：

- **比較演算子**: `==`, `!=`, `>`, `<`, `>=`, `<=` は、数値またはテキストフィールドに基づくフィルタリングを可能にします。

- **範囲フィルター**: `IN` および `LIKE` は、特定の値の範囲やセットに一致させるのに役立ちます。

- **算術演算子**: `+`, `-`, `*`, `/`, `%`, `**` は、数値フィールドを含む計算に使用されます。

- **論理演算子**: `AND`, `OR`, `NOT` は、複数の条件を組み合わせて複雑な式を作成します。

- **IS NULLおよびIS NOT NULL演算子**: `IS NULL`および`IS NOT NULL`演算子は、フィールドがnull値（データの不在）を含むかどうかに基づいてフィールドをフィルタリングするために使用されます。詳細は[基本演算子](./basic-filtering-operators#is-null-and-is-not-null-operators)を参照してください。

### 例: 色によるフィルタリング\{#example-filtering-by-color}

スカラー型フィールド`color`内にある主色（赤、緑、青）を持つエンティティを検索するには、以下のフィルター式を使用します：

```python
filter='color in ["red", "green", "blue"]'
```

### 例: JSONフィールドのフィルタリング\{#example-filtering-json-fields}

Zilliz Cloudでは、JSONフィールド内のキーを参照できます。たとえば、`price` および `model` というキーを持つJSONフィールド`product`があり、特定のモデルで1,850より低い価格の製品を検索する場合、以下のフィルター式を使用します：

```python
filter='product["model"] == "JSN-087" AND product["price"] < 1850'
```

### 例: 配列フィールドのフィルタリング\{#example-filtering-array-fields}

観測所から2000年以降に報告された平均気温の記録を含む配列フィールド`history_temperatures`があり、2009年（10番目に記録された）の気温が23°Cを超える観測所を検索するには、以下の式を使用します：

```python
filter='history_temperatures[10] > 23'
```

これらの基本演算子の詳細については、[基本演算子](./basic-filtering-operators)を参照してください。

## フィルター式テンプレート\{#filter-expression-templates}

CJK文字を使用したフィルタリングでは、文字セットが大きくエンコードの違いがあるため、処理がより複雑になる可能性があります。これにより、特に`IN`演算子ではパフォーマンスが低下することがあります。

Zilliz Cloudは、CJK文字を処理する際のパフォーマンスを最適化するためにフィルター式テンプレートを導入しています。フィルター式から動的値を分離することにより、クエリエンジンがパラメータ挿入をより効率的に処理できます。

### 例\{#example}

25歳より年上の北京（Beijing）または上海（Shanghai）に住む人を検索するには、以下のテンプレート式を使用します：

```python
filter = "age > 25 AND city IN ['北京', '上海']"
```

パフォーマンスを向上させるには、パラメータを使用した以下の変形を使用します：

```python
filter = "age > {age} AND city in {city}",
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

このアプローチにより解析のオーバーヘッドを削減し、クエリ速度を向上させます。詳細については、[フィルター テンプレート](./filtering-templating)を参照してください。

## データ型固有の演算子\{#data-type-specific-operators}

Zilliz Cloudは、JSON、ARRAY、VARCHARフィールドなどの特定のデータ型に応じた高度なフィルタリング演算子を提供します。

### JSONフィールド固有の演算子\{#json-field-specific-operators}

Zilliz Cloudは、JSONフィールドをクエリするための高度な演算子を提供し、複雑なJSON構造内での正確なフィルタリングを可能にします：

**JSON_CONTAINS(identifier, jsonExpr)**: JSON式がフィールド内に存在するかどうかを確認します。

```python
# JSONデータ: {"tags": ["electronics", "sale", "new"]}
filter='json_contains(tags, "sale")'
```

**JSON_CONTAINS_ALL(identifier, jsonExpr)**: JSON式のすべての要素が存在することを確認します。

```python
# JSONデータ: {"tags": ["electronics", "sale", "new", "discount"]}
filter='json_contains_all(tags, ["electronics", "sale", "new"])'
```

**JSON_CONTAINS_ANY(identifier, jsonExpr)**: JSON式に少なくとも1つの要素が存在するエンティティをフィルターします。

```python
# JSONデータ: {"tags": ["electronics", "sale", "new"]}
filter='json_contains_any(tags, ["electronics", "new", "clearance"])'
```

JSON演算子の詳細については、[JSON 演算子](./json-filtering-operators)を参照してください。

### ARRAYフィールド固有の演算子\{#array-field-specific-operators}

Zilliz Cloudは、`ARRAY_CONTAINS`、`ARRAY_CONTAINS_ALL`、`ARRAY_CONTAINS_ANY`、および`ARRAY_LENGTH`などの配列フィールド用の高度なフィルタリング演算子を提供し、配列データを細かく制御できます：

**ARRAY_CONTAINS**: 特定の要素を含むエンティティをフィルターします。

```python
filter="ARRAY_CONTAINS(history_temperatures, 23)"
```

**ARRAY_CONTAINS_ALL**: リスト内のすべての要素が存在するエンティティをフィルターします。

```python
filter="ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])"
```

**ARRAY_CONTAINS_ANY**: リスト内のいずれかの要素を含むエンティティをフィルターします。

```python
filter="ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])"
```

**ARRAY_LENGTH**: 配列の長さに基づいてフィルターします。

```python
filter="ARRAY_LENGTH(history_temperatures) < 10"
```

配列演算子の詳細については、[ARRAY演算子](./array-filtering-operators)を参照してください。

### VARCHARフィールド固有の演算子\{#varchar-field-specific-operators}

Zilliz Cloudは、VARCHARフィールドでの正確なテキストベース検索用に特化した演算子を提供します：

#### `TEXT_MATCH`演算子\{#textmatch-operator}

`TEXT_MATCH`演算子は、特定のクエリ語に基づく正確なドキュメント取得を可能にします。これは、スカラー型フィルターとベクトル類似性検索を組み合わせたフィルターサーチに特に有効です。意味検索とは異なり、Text Matchは正確な語の出現に重点を置いています。

Zilliz CloudはTantivyを使用して逆インデックスと語ベースのテキスト検索をサポートしています。プロセスには以下が含まれます：

1. **Analyzer**: 入力テキストをトークン化し処理します。

1. **インデックス作成**: 一意のトークンをドキュメントにマッピングする逆インデックスを作成します。

詳細については、[テキストマッチ](./text-match)を参照してください。