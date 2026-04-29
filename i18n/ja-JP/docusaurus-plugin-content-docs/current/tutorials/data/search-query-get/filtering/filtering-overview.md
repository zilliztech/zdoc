---
title: "フィルタリングの解説 | Cloud"
slug: /filtering-overview
sidebar_key: filtering-overview
sidebar_label: "概要"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は強力なフィルタリング機能を提供し、データの精密なクエリを可能にします。フィルタ式を使用することで、特定のスカラフィールドを対象とし、さまざまな条件で検索結果を絞り込むことができます。このガイドでは、Zilliz Cloud クラスターでのフィルタ式の使用方法を、クエリ操作に焦点を当てた例とともに説明します。これらのフィルタは、検索および削除リクエストにも適用できます。 | Cloud"
type: origin
token: AIb1wNAE3iiKVSk8MHAcVA4QnJb
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - コレクション
  - データ
  - フィルタ
  - フィルタリング式
  - フィルタリング

---

import Admonition from '@theme/Admonition';


# フィルターの仕組み

Zilliz Cloud は強力なフィルター機能を提供しており、データを正確にクエリできます。フィルター式を使用すると、特定のスカラーフィールドを対象として、さまざまな条件で検索結果を絞り込むことができます。このガイドでは、Zilliz Cloud クラスターにおけるフィルター式の使用方法を説明し、クエリ操作に焦点を当てた例を示します。これらのフィルターは、検索および削除リクエストにも適用できます。

## 基本演算子\{#basic-operators}

Zilliz Cloud では、データをフィルターするために以下の基本演算子がサポートされています。

- **比較演算子**: `==`、`!=`、`>`、`<`、`>=`、`<=` を使用して、数値フィールドまたはテキストフィールドに基づくフィルターを適用できます。

- **範囲フィルター**: `IN` および `LIKE` は、特定の値の範囲やセットに一致させるために使用されます。

- **算術演算子**: `+`、`-`、`*`、`/`、`%`、`**` は、数値フィールドを含む計算に使用されます。

- **論理演算子**: `AND`、`OR`、`NOT` は、複数の条件を組み合わせて複雑な式を作成するために使用されます。

- **IS NULL および IS NOT NULL 演算子**: `IS NULL` および `IS NOT NULL` 演算子は、フィールドに null 値（データの欠落）が含まれているかどうかに基づいてフィルターを適用するために使用されます。詳細については、[基本演算子](./basic-filtering-operators#is-null-and-is-not-null-operators) を参照してください。

### 例: 色によるフィルター\{#example-filtering-by-color}

スカラーフィールド `color` に原色（赤、緑、青）を持つエンティティを検索するには、次のフィルター式を使用します。

```python
filter='color in ["red", "green", "blue"]'
```

### 例: JSONフィールドのフィルタリング\{#example-filtering-json-fields}

Zilliz Cloudでは、JSONフィールド内のキーを参照できます。たとえば、`price`および`model`というキーを持つJSONフィールド`product`があり、特定のモデルかつ価格が1,850未満の製品を検索したい場合、次のフィルター式を使用します：

```python
filter='product["model"] == "JSN-087" AND product["price"] < 1850'
```

### 例: 配列フィールドのフィルタリング\{#example-filtering-array-fields}

`history_temperatures` という配列フィールドに、2000年以降の観測所が報告した平均気温の記録が含まれており、2009年（10番目に記録された値）の気温が23°Cを超える観測所を見つけたい場合、次の式を使用します:

```python
filter='history_temperatures[10] > 23'
```

これらの基本演算子の詳細については、[基本演算子](./basic-filtering-operators)を参照してください。

## フィルター式テンプレート\{#filter-expression-templates}

CJK文字（中国語・日本語・韓国語）を使用してフィルタリングを行う場合、文字セットが大きくエンコーディングも異なるため、処理がより複雑になることがあります。特に `IN` 演算子を使用する場合、パフォーマンスが低下することがあります。

Zilliz Cloud では、CJK文字を扱う際のパフォーマンスを最適化するために、フィルター式テンプレート機能を導入しています。動的な値をフィルター式から分離することで、クエリエンジンがパラメータの挿入をより効率的に処理できるようになります。

### 例\{#example}

年齢が25歳を超え、かつ居住地が「北京」または「上海」である人物を検索するには、以下のテンプレート式を使用します：

```python
filter = "age > 25 AND city IN ['北京', '上海']"
```

パフォーマンスを向上させるには、このパラメータ付きのバリエーションを使用してください:

```python
filter = "age > {age} AND city in {city}",
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

このアプローチにより、パースのオーバーヘッドが削減され、クエリ速度が向上します。詳細については、[Filter Templating](./filtering-templating) を参照してください。

## データ type-specific operators\{#data-type-specific-operators}

Zilliz Cloud は、JSON、ARRAY、VARCHAR フィールドなど、特定のデータ型向けの高度なフィルタリング演算子を提供しています。

### JSON field-specific operators\{#json-field-specific-operators}

Zilliz Cloud は JSON フィールドをクエリするための高度な演算子を提供しており、複雑な JSON 構造内での正確なフィルタリングを可能にします。

**JSON_CONTAINS(identifier, jsonExpr)**: フィールド内に JSON 式が存在するかどうかをチェックします。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains(tags, "sale")'
```

**JSON_CONTAINS_ALL(identifier, jsonExpr)**: JSON 式のすべての要素が存在することを保証します。

```python
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter='json_contains_all(tags, ["electronics", "sale", "new"])'
```

**JSON_CONTAINS_ANY(identifier, jsonExpr)**: JSON 式に少なくとも 1 つの要素が存在するエンティティをフィルターします。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains_any(tags, ["electronics", "new", "clearance"])'
```

JSON 演算子の詳細については、[JSON 演算子](./json-filtering-operators)を参照してください。

### ARRAY フィールド固有の演算子\{#array-field-specific-operators}

Zilliz Cloud は、`ARRAY_CONTAINS`、`ARRAY_CONTAINS_ALL`、`ARRAY_CONTAINS_ANY`、および `ARRAY_LENGTH` などの ARRAY フィールド向け高度なフィルター演算子を提供しており、配列データをきめ細かく制御できます。

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

配列演算子の詳細については、[ARRAY 演算子](./array-filtering-operators)を参照してください。

### VARCHAR フィールド固有の演算子\{#varchar-field-specific-operators}

Zilliz Cloud は、VARCHAR フィールドに対して正確なテキストベース検索を行うための専用演算子を提供します。

#### `TEXT_MATCH` 演算子\{#textmatch-operator}

`TEXT_MATCH` 演算子を使用すると、特定のクエリ用語に基づいて正確にドキュメントを取得できます。この演算子は、スカラー条件とベクトル類似度検索を組み合わせたフィルタリング検索に特に有用です。セマンティック検索とは異なり、Text Match は完全一致の用語出現に焦点を当てます。

Zilliz Cloud では、転置インデックスと用語ベースのテキスト検索をサポートするために Tantivy を使用しています。その処理は以下の通りです。

1. **Analyzer**: 入力テキストをトークン化し、処理します。

1. **インデックス作成**: 固有のトークンからドキュメントへのマッピングを持つ転置インデックスを作成します。

詳細については、[Text Match](./text-match) を参照してください。

