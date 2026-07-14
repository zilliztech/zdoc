---
title: "フィルタリングの説明 | Cloud"
slug: /filtering-overview
sidebar_label: "概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、データを正確にクエリできる強力なフィルタリング機能を提供します。filter expression を使用すると、特定の scalar field を対象にして、さまざまな条件で検索結果を絞り込むことができます。このガイドでは、query 操作に重点を置いた例とともに、Zilliz Cloud cluster で filter expression を使用する方法を説明します。これらのフィルタは、search および delete リクエストにも適用できます。 | Cloud"
type: origin
token: AIb1wNAE3iiKVSk8MHAcVA4QnJb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# フィルタリングの説明

Zilliz Cloud は、データを正確にクエリできる強力なフィルタリング機能を提供します。filter expression を使用すると、特定の scalar field を対象にして、さまざまな条件で検索結果を絞り込むことができます。このガイドでは、query 操作に重点を置いた例とともに、Zilliz Cloud cluster で filter expression を使用する方法を説明します。これらのフィルタは、search および delete リクエストにも適用できます。

## 基本演算子\{#basic-operators}

Zilliz Cloud は、データのフィルタリングのために複数の基本演算子をサポートしています。

- **比較演算子**: `==`, `!=`, `>`, `<`, `>=`, および `<=` を使用すると、数値またはテキスト field に基づいてフィルタリングできます。

- **範囲およびパターンフィルタ**: `IN`, `LIKE`, `=~`, および `!~` は、値、ワイルドカードパターン、または正規表現パターンに一致します。文字列パターンの詳細については、[Pattern Matching](https://milvus.io/docs/pattern-matching.md) を参照してください。

- **算術演算子**: `+`, `-`, `*`, `/`, `%`, および `**` は、数値 field を含む計算に使用されます。

- **ビット演算子**:  以降では、`&`, `|`, および `^` は、権限やステータスビットなど複数のフラグをエンコードする整数 field をフィルタリングします。詳細については、[Basic Operators](https://milvus.io/docs/basic-operators.md#Bitwise-operators) を参照してください。

- **論理演算子**: `AND`, `OR`, および `NOT` は、複数の条件を組み合わせて複雑な式を構成します。

- **IS NULL および IS NOT NULL 演算子**: `IS NULL` および `IS NOT NULL` 演算子は、field に null 値（データが存在しないこと）が含まれているかどうかに基づいて field をフィルタリングするために使用されます。詳細については、[Basic Operators](https://milvus.io/docs/basic-operators.md#IS-NULL-and-IS-NOT-NULL-operators) を参照してください。

### 例: Color によるフィルタリング\{#example-filtering-by-color}

scalar field `color` に主色（赤、緑、または青）を持つ entity を見つけるには、次の filter expression を使用します。

```python
filter='color in ["red", "green", "blue"]'
```

### 例: Permission Bits によるフィルタリング\{#example-filtering-by-permission-bits}

整数 `permissions` field で `SHARE` ビットが設定されている entity を見つけるには、ビット単位 AND 演算子 (`&`) を使用します。

```python
filter='(permissions & 4) == 4'
```

### 例: Regex Pattern によるフィルタリング\{#example-filtering-by-regex-pattern}

`message` field に `E1001` のようなエラーコードが含まれる entity を見つけるには、正規表現一致演算子 `=~` を使用します。

```python
filter='message =~ "E[0-9]{4}"'
```

Regex フィルタは部分文字列一致を使用します。field 値全体をパターンに一致させるには、`^` および `$` アンカーを追加します。詳細については、[Pattern Matching](https://milvus.io/docs/pattern-matching.md) を参照してください。

### 例: JSON Fields のフィルタリング\{#example-filtering-json-fields}

Zilliz Cloud では、JSON field 内のキーを参照できます。たとえば、`price` と `model` というキーを持つ JSON field `product` があり、特定の model かつ価格が 1,850 未満の製品を見つけたい場合は、次の filter expression を使用します。

```python
filter='product["model"] == "JSN-087" AND product["price"] < 1850'
```

### 例: Array Fields のフィルタリング\{#example-filtering-array-fields}

2000 年以降に観測所から報告された平均気温の記録を含む array field `history_temperatures` があり、2009 年の気温（10 番目に記録された値）が 23°C を超える観測所を見つけたい場合は、次の式を使用します。

```python
filter='history_temperatures[10] > 23'
```

これらの基本演算子の詳細については、[Basic Operators](https://milvus.io/docs/basic-operators.md) を参照してください。

## Filter expression templates\{#filter-expression-templates}

CJK 文字を使用してフィルタリングする場合、文字セットが大きく、エンコーディングの違いがあるため、処理がより複雑になることがあります。その結果、特に `IN` 演算子でパフォーマンスが低下する可能性があります。

Zilliz Cloud では、CJK 文字を扱う際のパフォーマンスを最適化するために filter expression templating を導入しています。動的な値を filter expression から分離することで、query engine はパラメータの挿入をより効率的に処理できます。

`"北京"` (Beijing) または `"上海"` (Shanghai) に住む `25` 歳超の個人を見つけるには、次の template expression を使用します。

```python
filter = "age > 25 AND city IN ['北京', '上海']"
```

パフォーマンスを向上させるには、パラメータを使用した次のバリエーションを使用します。

```python
filter = "age > {age} AND city in {city}",
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

このアプローチにより、解析のオーバーヘッドが削減され、query speed が向上します。詳細については、[Filter Templating](./filtering-templating) を参照してください。

## データ型固有の演算子\{#data-type-specific-operators}

Zilliz Cloud は、JSON、ARRAY、VARCHAR field などの特定のデータ型向けに高度なフィルタリング演算子を提供します。

### JSON field 固有の演算子\{#json-field-specific-operators}

Zilliz Cloud は、JSON field をクエリするための高度な演算子を提供し、複雑な JSON 構造内での正確なフィルタリングを可能にします。

**JSON_CONTAINS(identifier, jsonExpr)**: field 内に JSON expression が存在するかどうかを確認します。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains(tags, "sale")'
```

**JSON_CONTAINS_ALL(identifier, jsonExpr)**: JSON expression のすべての要素が存在することを保証します。

```python
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter='json_contains_all(tags, ["electronics", "sale", "new"])'
```

**JSON_CONTAINS_ANY(identifier, jsonExpr)**: JSON expression 内の少なくとも 1 つの要素が存在する entity をフィルタリングします。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains_any(tags, ["electronics", "new", "clearance"])'
```

JSON 演算子の詳細については、[JSON Operators](./json-filtering-operators) を参照してください。

### ARRAY field 固有の演算子\{#array-field-specific-operators}

Zilliz Cloud は、`ARRAY_CONTAINS`、`ARRAY_CONTAINS_ALL`、`ARRAY_CONTAINS_ANY`、および `ARRAY_LENGTH` などの array field 向け高度なフィルタリング演算子を提供し、array データをきめ細かく制御できます。

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

**ARRAY_LENGTH**: array の長さに基づいてフィルタリングします。

```python
filter="ARRAY_LENGTH(history_temperatures) < 10"
```

array 演算子の詳細については、[ARRAY Operators](./array-filtering-operators) を参照してください。

### VARCHAR field 固有の演算子\{#varchar-field-specific-operators}

Zilliz Cloud は、VARCHAR field に対する正確なテキストベース検索のための専用演算子を提供します。

#### Pattern matching operators\{#pattern-matching-operators}

`LIKE`、`=~`、および `!~` 演算子は、`VARCHAR` field、JSON 文字列パス、および特定の `ARRAY<VARCHAR>` 要素に対して文字列パターンを一致させます。単純なワイルドカードパターンには `LIKE` を使用します。RE2 正規表現には `=~` および `!~` を使用します。

詳細については、[Pattern Matching](./pattern-match) を参照してください。

#### `TEXT_MATCH` operator\{#textmatch-operator}

`TEXT_MATCH` 演算子を使用すると、特定のクエリ語に基づいてドキュメントを正確に取得できます。これは、scalar filter と vector 類似検索を組み合わせたフィルタ付き検索で特に有用です。semantic search とは異なり、Text Match は正確な語の出現に焦点を当てます。

Zilliz Cloud は、倒立 index と語ベースのテキスト検索をサポートするために Tantivy を使用します。プロセスには以下が含まれます。

1. **Analyzer**: 入力テキストをトークン化して処理します。

1. **Indexing**: 一意のトークンをドキュメントにマッピングする倒立 index を作成します。

詳細については、Text Match を参照してください。

#### `PHRASE_MATCH` operator |\{#phrasematch-operator-or}

**PHRASE_MATCH** 演算子を使用すると、クエリ語の順序と隣接性の両方を考慮して、完全一致するフレーズに基づいてドキュメントを正確に取得できます。

詳細については、Phrase Match を参照してください。
