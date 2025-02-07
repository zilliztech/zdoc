---
title: "フィルタリングの説明 | Cloud"
slug: /filtering-overview
sidebar_label: "フィルタリングの説明"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、データの正確なクエリを可能にする強力なフィルタリング機能を提供します。フィルター式を使用すると、特定のスカラーフィールドをターゲットにし、さまざまな条件で検索結果を絞り込むことができます。このガイドでは、Zilliz Cloudクラスターでフィルター式を使用する方法について説明し、クエリ操作に焦点を当てた例を示します。これらのフィルターを検索および削除リクエストにも適用できます。 | Cloud"
type: origin
token: TsVNwbmMviDqjyk5XDycU9hmnMf
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
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval

---

import Admonition from '@theme/Admonition';


# フィルタリングの説明

Zilliz Cloudは、データの正確なクエリを可能にする強力なフィルタリング機能を提供します。フィルター式を使用すると、特定のスカラーフィールドをターゲットにし、さまざまな条件で検索結果を絞り込むことができます。このガイドでは、Zilliz Cloudクラスターでフィルター式を使用する方法について説明し、クエリ操作に焦点を当てた例を示します。これらのフィルターを検索および削除リクエストにも適用できます。

## 基本的な演算子{#}

Zilliz Cloudは、データをフィルタリングするためのいくつかの基本的な演算子をサポートしています。

- **比較演算子**:`==`、`!=`、`>`、`\<`、`>=`、および`<=`は、数値フィールドまたはテキストフィールドに基づくフィルタリングを可能にします。

- **範囲フィルター**:`IN`と`LIKE`は、特定の値範囲またはセットを一致させるのに役立ちます。

- **算術演算子**:`+`、`-`、`*`、`/`、`%`、および`**`は、数値フィールドを含む計算に使用されます。

- **論理演算子**:`AND`、`OR`、および`NOT`は、複数の条件を複雑な式に結合します。

### 例:色でフィルタリングする{#}

スカラーフィールドの色でプライマリカラー(赤、緑、または青)を持つ図形を検索するには、次の`フィルター`式を使用します。

```python
filter='color in ["red", "green", "blue"]'
```

### 例: JSONフィールドのフィルタリング{#json}

Zilliz Cloudでは、JSONフィールドのキーを参照することができます。例えば、キーの`価格とモデル`を持つJSONフィールド製品があり、特定のモデルと価格が1,850未満の製品を検索したい場合は、次のフィルタ式を使用してください:

```python
filter='product["model"] == "JSN-087" AND product["price"] < 1850'
```

### 例:配列フィールドのフィルタリング{#}

2000年以降の観測所によって報告された平均気温の記録を含む配列フィールド`history_温度`があり、2009年（記録された10番目）の気温が23°Cを超える観測所を見つけたい場合は、次の式を使用します。

```python
filter='history_temperatures[10] > 23'
```

これらの基本演算子の詳細については、Basic Operatorsを参照してください。

## データ型固有の演算子{#}

Zilliz Cloudは、JSON、ARRAY、VARCHARフィールドなどの特定のデータタイプに対して高度なフィルタリング演算子を提供します。

### JSONフィールド固有の演算子{#json}

Zilliz Cloudは、JSONフィールドをクエリするための高度な演算子を提供し、複雑なJSON構造内で正確なフィルタリングを可能にします。

`JSON_CONTAINS（識別子、jsonExpr）`:フィールドにJSON式が存在するかどうかをチェックします。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains(tags, "sale")'
```

`JSON_CONTAINS_ALL(identifier, jsonExpr)`:JSON式のすべての要素が存在することを保証します。

```python
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter='json_contains_all(tags, ["electronics", "sale", "new"])'
```

`JSON_CONTAINS_ANY(identifier, jsonExpr)`:JSON式内に少なくとも1つの要素が存在するエンティティをフィルタリングします。

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains_any(tags, ["electronics", "new", "clearance"])'
```

JSON演算子の詳細については、JSON Operatorsを参照してください。

### ARRAYフィールド固有の演算子{#array}

Zilliz Cloudは、配列フィールドに対して高度なフィルタリング演算子を提供します。`ARRAY_CONTAINS`、`ARRAY_CONTAINS_ALL`、`ARRAY_CONTAINS_ANY`、`ARRAY_LENGTH`など、配列データを細かく制御できます。

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

配列演算子の詳細については、ARRAY Operatorsを参照してください。

