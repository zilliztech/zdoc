---
title: "Filtering の説明 | BYOC"
slug: /filtering-overview
sidebar_label: "概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、データに対して高精度なクエリを可能にする強力なフィルタリング機能を提供します。フィルター式を使うことで、特定の scalar フィールドを対象にし、さまざまな条件で検索結果を絞り込めます。このガイドでは、query 操作を中心とした例を用いて、Zilliz Cloud cluster でフィルター式を使用する方法を説明します。これらのフィルターは、search および delete リクエストにも適用できます。 | BYOC"
type: origin
token: AIb1wNAE3iiKVSk8MHAcVA4QnJb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Filtering の説明

Zilliz Cloud は、データに対して高精度なクエリを可能にする強力なフィルタリング機能を提供します。フィルター式を使うことで、特定の scalar フィールドを対象にし、さまざまな条件で検索結果を絞り込めます。このガイドでは、query 操作を中心とした例を用いて、Zilliz Cloud cluster でフィルター式を使用する方法を説明します。これらのフィルターは、search および delete リクエストにも適用できます。

## 基本演算子\{#basic-operators}

Zilliz Cloud は、データをフィルタリングするためのいくつかの基本演算子をサポートしています。

- **比較演算子**: `==`, `!=`, `>`, `<`, `>=`, および `<=` は、数値またはテキストフィールドに基づいたフィルタリングを可能にします。

- **範囲およびパターンフィルター**: `IN`, `LIKE`, `=~`, および `!~` は、値、ワイルドカードパターン、または正規表現パターンに一致させます。文字列パターンの詳細については、[Pattern Matching](https://milvus.io/docs/pattern-matching.md) を参照してください。

- **算術演算子**: `+`, `-`, `*`, `/`, `%`, および `**` は、数値フィールドを含む計算に使用されます。

- **ビット演算子**: 以降では、`&`、`|`、および `^` は、権限やステータスビットなど、複数のフラグをエンコードする整数フィールドをフィルタリングします。詳細については、[Basic Operators](https://milvus.io/docs/basic-operators.md#Bitwise-operators) を参照してください。

- **論理演算子**: `AND`, `OR`, および `NOT` は、複数の条件を組み合わせて複雑な式を作成します。

- **IS NULL および IS NOT NULL 演算子**: `IS NULL` および `IS NOT NULL` 演算子は、フィールドに null 値（データが存在しない状態）が含まれているかどうかに基づいてフィールドをフィルタリングするために使用されます。詳細については、[Basic Operators](https://milvus.io/docs/basic-operators.md#IS-NULL-and-IS-NOT-NULL-operators) を参照してください。

### 例: 色によるフィルタリング\{#example-filtering-by-color}

scalar フィールド `color` において、原色（red、green、blue）を持つ entity を見つけるには、次のフィルター式を使用します。

```python
filter='color in ["red", "green", "blue"]'
```

### 例: 権限ビットによるフィルタリング\{#example-filtering-by-permission-bits}

整数 `permissions` フィールドで `SHARE` ビットが設定されている entity を見つけるには、ビット AND 演算子（`&`）を使用します。

```python
filter='(permissions & 4) == 4'
```

### 例: 正規表現パターンによるフィルタリング\{#example-filtering-by-regex-pattern}

`message` フィールドに `E1001` のようなエラーコードが含まれる entity を見つけるには、正規表現一致演算子 `=~` を使用します。

```python
filter='message =~ "E[0-9]{4}"'
```

正規表現フィルターでは部分文字列一致が使用されます。フィールド値全体をパターンに一致させるには、`^` および `$` アンカーを追加してください。詳細については、[Pattern Matching](https://milvus.io/docs/pattern-matching.md) を参照してください。

### 例: JSON フィールドのフィルタリング\{#example-filtering-json-fields}

Zilliz Cloud では、JSON フィールド内のキーを参照できます。たとえば、`price` と `model` というキーを持つ JSON フィールド `product` があり、特定のモデルで価格が 1,850 未満の製品を見つけたい場合は、次のフィルター式を使用します。

```python
filter='product["model"] == "JSN-087" AND product["price"] < 1850'
```

### 例: ARRAY フィールドのフィルタリング\{#example-filtering-array-fields}

`history_temperatures` という ARRAY フィールドに、2000 年以降に観測所から報告された平均気温の記録が含まれており、2009 年の気温（10 番目の記録）が 23°C を超える観測所を見つけたい場合は、次の式を使用します。

```python
filter='history_temperatures[10] > 23'
```

これらの基本演算子の詳細については、[Basic Operators](https://milvus.io/docs/basic-operators.md) を参照してください。

## フィルター式テンプレート\{#filter-expression-templates}

CJK 文字を使用してフィルタリングする場合、文字セットが大きく、エンコーディングの違いもあるため、処理がより複雑になることがあります。その結果、特に `IN` 演算子ではパフォーマンスが低下する場合があります。

Zilliz Cloud では、CJK 文字を扱う際のパフォーマンスを最適化するために、フィルター式テンプレート機能を導入しています。動的な値をフィルター式から分離することで、query engine はパラメーターの挿入をより効率的に処理できます。

`"北京"`（Beijing）または `"上海"`（Shanghai）に住む、年齢 `25` を超える人を見つけるには、次のテンプレート式を使用します。

```python
filter = "age > 25 AND city IN ['北京', '上海']"
```

パフォーマンスを向上させるには、パラメーターを使用した次のバリエーションを利用します。

```python
filter = "age > {age} AND city in {city}",
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

このアプローチにより、解析オーバーヘッドが削減され、query 速度が向上します。詳細については、[Filter Templating](./filtering-templating) を参照してください。

## データ型固有の演算子\{#data-type-specific-operators}

Zilliz Cloud は、JSON、ARRAY、VARCHAR フィールドなど、特定のデータ型向けの高度なフィルタリング演算子を提供します。

### JSON フィールド固有の演算子\{#json-field-specific-operators}

Zilliz Cloud は、JSON フィールドをクエリするための高度な演算子を提供しており、複雑な JSON 構造内で高精度なフィルタリングを可能にします。

**JSON_CONTAINS(identifier, jsonExpr)**: フィールド内に JSON 式が存在するかどうかを確認します。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains(tags, "sale")'
```

**JSON_CONTAINS_ALL(identifier, jsonExpr)**: JSON 式内のすべての要素が存在することを保証します。

```python
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter='json_contains_all(tags, ["electronics", "sale", "new"])'
```

**JSON_CONTAINS_ANY(identifier, jsonExpr)**: JSON 式内の少なくとも 1 つの要素が存在する entity をフィルタリングします。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains_any(tags, ["electronics", "new", "clearance"])'
```

JSON 演算子の詳細については、[JSON Operators](./json-filtering-operators) を参照してください。

### ARRAY フィールド固有の演算子\{#array-field-specific-operators}

Zilliz Cloud は、`ARRAY_CONTAINS`、`ARRAY_CONTAINS_ALL`、`ARRAY_CONTAINS_ANY`、`ARRAY_LENGTH` などの ARRAY フィールド向け高度なフィルタリング演算子を提供しており、ARRAY データをきめ細かく制御できます。

**ARRAY_CONTAINS**: 特定の要素を含む entity をフィルタリングします。

```python
filter="ARRAY_CONTAINS(history_temperatures, 23)"
```

**ARRAY_CONTAINS_ALL**: リスト内のすべての要素が存在する entity をフィルタリングします。

```python
filter="ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])"
```

**ARRAY_CONTAINS_ANY**: リスト内のいずれかの要素を含む entity をフィルタリングします。

```python
filter="ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])"
```

**ARRAY_LENGTH**: ARRAY の長さに基づいてフィルタリングします。

```python
filter="ARRAY_LENGTH(history_temperatures) < 10"
```

ARRAY 演算子の詳細については、[ARRAY Operators](./array-filtering-operators) を参照してください。

### VARCHAR フィールド固有の演算子\{#varchar-field-specific-operators}

Zilliz Cloud は、VARCHAR フィールドに対する高精度なテキストベース検索のために特化した演算子を提供します。

#### パターン一致演算子\{#pattern-matching-operators}

`LIKE`、`=~`、および `!~` 演算子は、`VARCHAR` フィールド、JSON 文字列パス、および特定の `ARRAY<VARCHAR>` 要素に対して文字列パターンを一致させます。単純なワイルドカードパターンには `LIKE` を使用してください。RE2 正規表現には `=~` および `!~` を使用してください。

詳細については、[Pattern Matching](./pattern-match) を参照してください。

#### `TEXT_MATCH` 演算子\{#textmatch-operator}

`TEXT_MATCH` 演算子は、特定のクエリ語に基づいてドキュメントを高精度に取得できるようにします。これは、scalar フィルターと vector 類似検索を組み合わせたフィルタリング検索で特に有用です。semantic search とは異なり、Text Match は語の正確な出現に焦点を当てます。

Zilliz Cloud は、inverted index と語ベースのテキスト検索をサポートするために Tantivy を使用します。このプロセスには次が含まれます。

1. **Analyzer**: 入力テキストをトークン化して処理します。

1. **Indexing**: 一意のトークンをドキュメントにマッピングする inverted index を作成します。

詳細については、Text Match を参照してください。

#### `PHRASE_MATCH` 演算子 |\{#phrasematch-operator-or}

**PHRASE_MATCH** 演算子は、クエリ語の順序と隣接性の両方を考慮し、完全一致するフレーズに基づいてドキュメントを高精度に取得できるようにします。

詳細については、Phrase Match を参照してください。
