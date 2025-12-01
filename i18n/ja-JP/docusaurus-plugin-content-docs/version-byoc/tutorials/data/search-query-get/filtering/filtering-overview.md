---
title: "フィルタリングの説明 | BYOC"
slug: /filtering-overview
sidebar_label: "フィルタリングの説明"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、データの正確なクエリを可能にする強力なフィルタリング機能を提供します。フィルター式を使用すると、特定のスカラーフィールドを対象とし、さまざまな条件で検索結果を絞り込むことができます。このガイドでは、Zilliz Cloudクラスターでフィルター式を使用する方法を説明し、クエリ操作に焦点を当てた例を紹介します。これらのフィルターは、検索および削除リクエストにも適用できます。| BYOC"
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
  - milvusオープンソース
  - milvusの仕組み
  - Zillizベクトルデータベース
  - Zillizデータベース

---

import Admonition from '@theme/Admonition';


# フィルタリングの説明

Zilliz Cloudは、データの正確なクエリを可能にする強力なフィルタリング機能を提供します。フィルター式を使用すると、特定のスカラーフィールドを対象とし、さまざまな条件で検索結果を絞り込むことができます。このガイドでは、Zilliz Cloudクラスターでフィルター式を使用する方法を説明し、クエリ操作に焦点を当てた例を紹介します。これらのフィルターは、検索および削除リクエストにも適用できます。

## 基本演算子\{#basic-operators}

Zilliz Cloudは、データをフィルタリングするためのいくつかの基本演算子をサポートしています：

- **比較演算子**: `==`, `!=`, `>`, `<`, `>=`, および `<=` は、数値またはテキストフィールドに基づいたフィルタリングを可能にします。

- **範囲フィルター**: `IN` および `LIKE` は、特定の値の範囲またはセットに一致させるのに役立ちます。

- **算術演算子**: `+`, `-`, `*`, `/`, `%`, および `**` は、数値フィールドを含む計算に使用されます。

- **論理演算子**: `AND`、`OR`、および `NOT` は、複数の条件を組み合わせて複雑な式を作成します。

- **IS NULLおよびIS NOT NULL演算子**: `IS NULL`および`IS NOT NULL`演算子は、フィールドにnull値（データの不在）が含まれているかどうかに基づいてフィールドをフィルタリングするために使用されます。詳細については、[基本演算子](./basic-filtering-operators#is-null-and-is-not-null-operators)を参照してください。

### 例: 色によるフィルタリング\{#example-filtering-by-color}

スカラーフィールド`color`で主色（赤、緑、または青）を持つエンティティを検索するには、以下のフィルター式を使用します。

```python
filter='color in ["red", "green", "blue"]'
```

### 例: JSONフィールドのフィルタリング\{#example-filtering-json-fields}

Zilliz Cloudでは、JSONフィールド内のキーを参照できます。たとえば、`price`と`model`というキーを持つJSONフィールド`product`があり、特定のモデルかつ価格が1850未満の製品を検索するには、このフィルター式を使用します。

```python
filter='product["model"] == "JSN-087" AND product["price"] < 1850'
```

### 例: 配列フィールドのフィルタリング\{#example-filtering-array-fields}

観測所から2000年以降に記録された平均気温を含む配列フィールド`history_temperatures`があり、2009年（10番目に記録された）の気温が23°Cを超える観測所を検索するには、以下の式を使用します。

```python
filter='history_temperatures[10] > 23'
```

これらの基本演算子の詳細については、[基本演算子](./basic-filtering-operators)を参照してください。

## フィルター式テンプレート\{#filter-expression-templates}

CJK文字を使用したフィルタリングでは、文字セットが大きくエンコード方式が異なるため、処理が複雑になる可能性があります。特に`IN`演算子ではパフォーマンスが低下することがあります。

Zilliz Cloudは、CJK文字を扱う際のパフォーマンスを最適化するためにフィルター式テンプレートを導入しています。フィルター式から動的値を分離することで、クエリエンジンはパラメータの挿入をより効率的に処理できます。

### 例\{#example}

年齢が25歳より大きく、居住地が「北京」（北京）または「上海」（上海）である個人を検索するには、以下のテンプレート式を使用します。

```python
filter = "age > 25 AND city IN ['北京', '上海']"
```

パフォーマンスを向上させるために、パラメータを使用した以下のバリエーションを利用してください。

```python
filter = "age > {age} AND city in {city}",
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

このアプローチにより、解析オーバーヘッドが削減され、クエリ速度が向上します。詳細については、[フィルタリングテンプレート](./filtering-templating)を参照してください。

## データ型固有の演算子\{#data-type-specific-operators}

Zilliz Cloudは、JSON、ARRAY、VARCHARフィールドなどの特定のデータ型に対して高度なフィルタリング演算子を提供します。

### JSONフィールド固有の演算子\{#json-field-specific-operators}

Zilliz CloudはJSONフィールドをクエリするための高度な演算子を提供しており、複雑なJSON構造内での正確なフィルタリングを可能にします：

**JSON_CONTAINS(identifier, jsonExpr)**: JSON式がフィールド内に存在するかどうかをチェックします。

```python
# JSONデータ: {"tags": ["electronics", "sale", "new"]}
filter='json_contains(tags, "sale")'
```

**JSON_CONTAINS_ALL(identifier, jsonExpr)**: JSON式のすべての要素が存在することを確認します。

```python
# JSONデータ: {"tags": ["electronics", "sale", "new", "discount"]}
filter='json_contains_all(tags, ["electronics", "sale", "new"])'
```

**JSON_CONTAINS_ANY(identifier, jsonExpr)**: JSON式内の少なくとも1つの要素が存在するエンティティをフィルターします。

```python
# JSONデータ: {"tags": ["electronics", "sale", "new"]}
filter='json_contains_any(tags, ["electronics", "new", "clearance"])'
```

JSON演算子の詳細については、[JSON演算子](./json-filtering-operators)を参照してください。

### 配列フィールド固有の演算子\{#array-field-specific-operators}

Zilliz Cloudは配列フィールドの高度なフィルタリング演算子（`ARRAY_CONTAINS`、`ARRAY_CONTAINS_ALL`、`ARRAY_CONTAINS_ANY`、および`ARRAY_LENGTH`など）を提供しており、配列データを詳細に制御できます。

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

Zilliz Cloudは、VARCHARフィールドでの正確なテキストベースの検索を可能にする特殊な演算子を提供します：

#### `TEXT_MATCH`演算子\{#textmatch-operator}

`TEXT_MATCH`演算子は、特定のクエリー用語に基づいてドキュメントを正確に検索できます。スカラー検索とベクトル類似度検索を組み合わせたフィルターされた検索に特に有効です。セマンティック検索とは異なり、Text Matchは正確な用語の出現に焦点を当てます。

Zilliz CloudはTantivyを使用して逆インデックスと用語ベースのテキスト検索をサポートしています。処理プロセスには以下が含まれます：

1. **アナライザー**: 入力テキストをトークン化して処理します。

1. **インデックス作成**: 一意のトークンからドキュメントへの逆インデックスを作成します。

詳細については、[テキスト一致](./text-match)を参照してください。