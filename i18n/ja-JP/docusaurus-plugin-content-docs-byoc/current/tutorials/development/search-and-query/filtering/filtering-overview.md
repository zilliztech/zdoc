---
title: "フィルタリングの解説 | BYOC"
slug: /filtering-overview
sidebar_label: "概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、データを精密にクエリするための強力なフィルタリング機能を提供します。フィルター式を使うことで、特定のスカラーフィールドを対象に、さまざまな条件で検索結果を絞り込めます。このガイドでは、Zilliz Cloud クラスターでのフィルター式の使い方を、クエリ操作の例を中心に説明します。これらのフィルターは、検索リクエストや削除リクエストにも適用できます。 | BYOC"
type: origin
token: AIb1wNAE3iiKVSk8MHAcVA4QnJb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# フィルタリングの解説

Zilliz Cloud は、データを精密にクエリするための強力なフィルタリング機能を提供します。フィルター式を使うことで、特定のスカラーフィールドを対象に、さまざまな条件で検索結果を絞り込めます。このガイドでは、Zilliz Cloud クラスターでのフィルター式の使い方を、クエリ操作の例を中心に説明します。これらのフィルターは、検索リクエストや削除リクエストにも適用できます。

## 基本演算子\{#basic-operators}

Zilliz Cloud は、データのフィルタリングに使用できる複数の基本演算子をサポートしています。

- **比較演算子**: `==`、`!=`、`>`、`<`、`>=`、`<=` を使用すると、数値フィールドやテキストフィールドに基づいてフィルタリングできます。

- **範囲・パターンフィルター**: `IN`、`LIKE`、`=~`、`!~` は、値、ワイルドカードパターン、正規表現パターンとの一致判定を行います。文字列パターンの詳細については、[Pattern Matching](https://milvus.io/docs/pattern-matching.md) を参照してください。

- **算術演算子**: `+`、`-`、`*`、`/`、`%`、`**` は、数値フィールドを含む計算に使用されます。

- **ビット演算子**: 以降のバージョンでは、`&`、`|`、`^` を使用して、権限やステータスビットなど複数のフラグをエンコードした整数フィールドをフィルタリングできます。詳細については、[Basic Operators](https://milvus.io/docs/basic-operators.md#Bitwise-operators) を参照してください。

- **論理演算子**: `AND`、`OR`、`NOT` を使用すると、複数の条件を組み合わせて複雑な式を作成できます。

- **IS NULL および IS NOT NULL 演算子**: `IS NULL` 演算子と `IS NOT NULL` 演算子は、フィールドが null 値（データなし）かどうかを基準にフィルタリングするために使用されます。詳細については、[Basic Operators](https://milvus.io/docs/basic-operators.md#IS-NULL-and-IS-NOT-NULL-operators) を参照してください。

### 例: 色によるフィルタリング\{#example-filtering-by-color}

スカラーフィールド `color` で原色（赤、緑、青）を持つエンティティを検索するには、次のフィルター式を使用します。

```python
filter='color in ["red", "green", "blue"]'
```

### 例: 権限ビットによるフィルタリング\{#example-filtering-by-permission-bits}

整数型の `permissions` フィールドで `SHARE` ビットが立っているエンティティを検索するには、ビット単位の AND 演算子（`&`）を使用します。

```python
filter='(permissions & 4) == 4'
```

### 例: 正規表現パターンによるフィルタリング\{#example-filtering-by-regex-pattern}

`message` フィールドに `E1001` などのエラーコードが含まれるエンティティを検索するには、正規表現マッチ演算子 `=~` を使用します。

```python
filter='message =~ "E[0-9]{4}"'
```

正規表現フィルターは部分文字列マッチを使用します。フィールド値全体がパターンに一致する必要がある場合は、`^` アンカーと `$` アンカーを追加します。詳細については、[Pattern Matching](https://milvus.io/docs/pattern-matching.md) を参照してください。

### 例: JSON フィールドのフィルタリング\{#example-filtering-json-fields}

Zilliz Cloud では、JSON フィールド内のキーを参照できます。たとえば、キー `price` と `model` を持つ JSON フィールド `product` があり、特定のモデルで価格が 1,850 未満の製品を検索したい場合は、次のフィルター式を使用します。

```python
filter='product["model"] == "JSN-087" AND product["price"] < 1850'
```

### 例: 配列フィールドのフィルタリング\{#example-filtering-array-fields}

2000 年以降に観測所で記録された平均気温のレコードを含む配列フィールド `history_temperatures` があり、2009 年（10 番目のレコード）の気温が 23°C を超える観測所を検索する場合は、次の式を使用します。

```python
filter='history_temperatures[10] > 23'
```

これらの基本演算子の詳細については、[Basic Operators](https://milvus.io/docs/basic-operators.md) を参照してください。

## フィルター式テンプレート\{#filter-expression-templates}

CJK 文字でフィルタリングを行う場合、文字セットが大きくエンコーディングも異なるため、処理が複雑になることがあります。その結果、特に `IN` 演算子を使用する際にパフォーマンスが低下する可能性があります。

Zilliz Cloud は、CJK 文字を扱う際のパフォーマンスを最適化するため、フィルター式テンプレートを導入しています。動的な値をフィルター式から分離することで、クエリエンジンがパラメーターの挿入をより効率的に処理できるようになります。

`25` 歳以上で、`"北京"`（北京）または `"上海"`（上海）に住んでいる人を検索するには、次のテンプレート式を使用します。

```python
filter = "age > 25 AND city IN ['北京', '上海']"
```

パフォーマンスを向上させるには、パラメーターを使用した次のバリエーションを利用します。

```python
filter = "age > {age} AND city in {city}",
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

この方法により、解析のオーバーヘッドが削減され、クエリ速度が向上します。詳細については、[Filter Templating](./filtering-templating) を参照してください。

## データ型固有の演算子\{#data-type-specific-operators}

Zilliz Cloud は、JSON、ARRAY、VARCHAR フィールドなど、特定のデータ型向けの高度なフィルタリング演算子を提供します。

### JSON フィールド固有の演算子\{#json-field-specific-operators}

Zilliz Cloud は、JSON フィールドをクエリするための高度な演算子を提供し、複雑な JSON 構造内でも精密なフィルタリングを可能にします。

**JSON_CONTAINS(identifier, jsonExpr)**: JSON 式がフィールド内に存在するかどうかを確認します。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains(tags, "sale")'
```

**JSON_CONTAINS_ALL(identifier, jsonExpr)**: JSON 式のすべての要素が存在することを確認します。

```python
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter='json_contains_all(tags, ["electronics", "sale", "new"])'
```

**JSON_CONTAINS_ANY(identifier, jsonExpr)**: JSON 式に含まれる要素のうち少なくとも 1 つが存在するエンティティをフィルタリングします。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains_any(tags, ["electronics", "new", "clearance"])'
```

JSON 演算子の詳細については、[JSON Operators](./json-filtering-operators) を参照してください。

### ARRAY フィールド固有の演算子\{#array-field-specific-operators}

Zilliz Cloud は、配列フィールド向けの高度なフィルタリング演算子として `ARRAY_CONTAINS`、`ARRAY_CONTAINS_ALL`、`ARRAY_CONTAINS_ANY`、`ARRAY_LENGTH` を提供しており、配列データをきめ細かく制御できます。

**ARRAY_CONTAINS**: 特定の要素を含むエンティティをフィルタリングします。

```python
filter="ARRAY_CONTAINS(history_temperatures, 23)"
```

**ARRAY_CONTAINS_ALL**: リスト内のすべての要素が含まれるエンティティをフィルタリングします。

```python
filter="ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])"
```

**ARRAY_CONTAINS_ANY**: リスト内のいずれかの要素を含むエンティティをフィルタリングします。

```python
filter="ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])"
```

**ARRAY_LENGTH**: 配列の長さに基づいてフィルタリングします。

```python
filter="ARRAY_LENGTH(history_temperatures) < 10"
```

配列演算子の詳細については、[ARRAY Operators](./array-filtering-operators) を参照してください。

### VARCHAR フィールド固有の演算子\{#varchar-field-specific-operators}

Zilliz Cloud は、VARCHAR フィールドで精密なテキスト検索を行うための専用演算子を提供します。

#### パターンマッチング演算子\{#pattern-matching-operators}

`LIKE`、`=~`、`!~` 演算子は、`VARCHAR` フィールド、JSON の文字列パス、および特定の `ARRAY<VARCHAR>` 要素に対して文字列パターンのマッチングを行います。単純なワイルドカードパターンには `LIKE` を、RE2 正規表現には `=~` や `!~` を使用します。

詳細については、[Pattern Matching](./pattern-match) を参照してください。

#### `TEXT_MATCH` 演算子\{#textmatch-operator}

`TEXT_MATCH` 演算子を使用すると、特定のクエリ語句に基づいてドキュメントを正確に取得できます。これは、スカラーフィルターとベクトル類似度検索を組み合わせたフィルタリング検索に特に有効です。セマンティック検索とは異なり、Text Match は語句の完全一致に焦点を当てます。

Zilliz Cloud は Tantivy を使用して転置インデックスと語句ベースのテキスト検索をサポートしています。処理の流れは以下の通りです。

1. **Analyzer**: 入力テキストをトークン化して処理します。

1. **Indexing**: ユニークなトークンをドキュメントに対応付ける転置インデックスを作成します。

詳細については、Text Match を参照してください。

#### `PHRASE_MATCH` 演算子\{#phrasematch-operator}

**PHRASE_MATCH** 演算子を使用すると、クエリ語句の順序と隣接性を考慮した完全一致フレーズに基づき、ドキュメントを正確に取得できます。

詳細については、[Phrase Match](./phrase-match) を参照してください。
