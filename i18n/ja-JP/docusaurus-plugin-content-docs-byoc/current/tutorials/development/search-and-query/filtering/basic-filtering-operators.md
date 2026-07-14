---
title: "基本演算子 | BYOC"
slug: /basic-filtering-operators
sidebar_label: "Basic"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、データを効率的にフィルタリングおよびクエリするための豊富な基本演算子セットを提供します。これらの演算子を使用すると、scalar フィールド、数値計算、論理条件などに基づいて検索条件を絞り込むことができます。これらの演算子の使い方を理解することは、正確なクエリを構築し、検索効率を最大化するうえで重要です。 | BYOC"
type: origin
token: LBbUwOGcwi1UMak3eE2cM1gvnUe
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 基本演算子

Zilliz Cloud は、データを効率的にフィルタリングおよびクエリするための豊富な基本演算子セットを提供します。これらの演算子を使用すると、scalar フィールド、数値計算、論理条件などに基づいて検索条件を絞り込むことができます。これらの演算子の使い方を理解することは、正確なクエリを構築し、検索効率を最大化するうえで重要です。

<Admonition type="info" icon="📘" title="注意">

フィルタリング式の左辺にあるリテラルには、以下の例で使用されている `status` や `color` などの collection フィールド名、または `filter = 'struct[0][subfield] > 10'` のような特定の要素インデックスにおける StructArray サブフィールド名のいずれかを指定できます。 

StructArray フィールド内の scalar フィルタリングの詳細については、[StructArray Operators](./struct-array-filtering) を参照してください。

</Admonition>

## 比較演算子\{#comparison-operators}

比較演算子は、等価、不等価、または大小関係に基づいてデータをフィルタリングするために使用されます。数値フィールドとテキストフィールドに適用できます。

### サポートされる比較演算子:\{#supported-comparison-operators}

- `==`（等しい）

- `!=`（等しくない）

- `>`（より大きい）

- `<`（より小さい）

- `>=`（以上）

- `<=`（以下）

### 例 1: Equal To (`==`) を使用したフィルタリング\{#example-1-filtering-with-equal-to}

`status` という名前のフィールドがあり、`status` が "active" であるすべての entity を見つけたいとします。等価演算子 `==` を使用できます。

```python
filter = 'status == "active"'
```

### 例 2: Not Equal To (`!=`) を使用したフィルタリング\{#example-2-filtering-with-not-equal-to}

`status` が "inactive" ではない entity を見つけるには、次のようにします。

```python
filter = 'status != "inactive"'
```

### 例 3: Greater Than (`>`) を使用したフィルタリング\{#example-3-filtering-with-greater-than-greater}

`age` が 30 より大きいすべての entity を見つけたい場合は、次のようにします。

```python
filter = 'age > 30'
```

### 例 4: Less Than を使用したフィルタリング\{#example-4-filtering-with-less-than}

`price` が 100 未満である entity を見つけるには、次のようにします。

```python
filter = 'price < 100'
```

### 例 5: Greater Than or Equal To (`>=`) を使用したフィルタリング\{#example-5-filtering-with-greater-than-or-equal-to-greater}

`rating` が 4 以上のすべての entity を見つけたい場合は、次のようにします。

```python
filter = 'rating >= 4'
```

### 例 6: Less Than or Equal To を使用したフィルタリング\{#example-6-filtering-with-less-than-or-equal-to}

`discount` が 10% 以下の entity を見つけるには、次のようにします。

```python
filter = 'discount <= 10'
```

## 範囲演算子\{#range-operators}

範囲演算子は、特定の値の集合に基づいてデータをフィルタリングするのに役立ちます。Zilliz Cloud は、集合への所属チェックのために `IN` をサポートしています。

`color` が "red"、"green"、または "blue" のいずれかであるすべての entity を見つけたい場合は、次のようにします。

```python
filter = 'color in ["red", "green", "blue"]'
```

これは、値のリストへの所属を確認したい場合に便利です。

## パターンマッチング演算子\{#pattern-matching-operators}

パターンマッチング演算子は、ワイルドカードパターンまたは正規表現に基づいて文字列値をフィルタリングするのに役立ちます。

- `LIKE`: 文字列値に対する単純なワイルドカードパターンの一致に使用されます。たとえば、`name LIKE "Prod%"` は `Prod` で始まる値に一致します。

- `=~`: 文字列値を RE2 正規表現と一致させるために使用されます。たとえば、`code =~ "E[0-9]{4}"` は `E1001` のようなエラーコードを含む値に一致します。

- `!~`: RE2 正規表現に一致する文字列値を除外するために使用されます。これは `NOT (field =~ "pattern")` と同等です。

`name` が `Prod` で始まる entity を見つけるには、次のようにします。

```python
filter = 'name LIKE "Prod%"'
```

`code` に `E1001` のようなエラーコードが含まれる entity を見つけるには、次のようにします。

```python
filter = 'code =~ "E[0-9]{4}"'
```

`message` が `DEBUG` で始まる entity を除外するには、次のようにします。

```python
filter = 'message !~ "^DEBUG"'
```

`LIKE` と regex の使い分け、サポートされるフィールド型、regex 構文、エスケープルール、およびパフォーマンスの詳細については、[Pattern Matching](./pattern-match) を参照してください。Zilliz Cloud では、対象となるパターンマッチングフィルターを高速化するために、`VARCHAR` フィールドまたは JSON 文字列パス上に `NGRAM` index を構築することもできます。詳細については、[NGRAM](./ngram-index-type) を参照してください。

## 算術演算子\{#arithmetic-operators}

算術演算子を使用すると、数値フィールドに関わる計算に基づいて条件を作成できます。

### サポートされる算術演算子:\{#supported-arithmetic-operators}

- `+`（加算）

- `-`（減算）

- `*`（乗算）

- `/`（除算）

- `%`（剰余）

- `**`（累乗）

### 例 1: Modulus (`%`) の使用\{#example-1-using-modulus-percent}

`id` が偶数（つまり 2 で割り切れる）である entity を見つけるには、次のようにします。

```python
filter = 'id % 2 == 0'
```

### 例 2: Exponentiation (`**`) の使用\{#example-2-using-exponentiation}

`price` の 2 乗が 1000 より大きい entity を見つけるには、次のようにします。

```python
filter = 'price ** 2 > 1000'
```

## ビット演算子\{#bitwise-operators}

ビット演算子は、整数フィールドが権限、feature flag、またはステータスビットなどの複数のフラグをエンコードしている場合に便利です。これらの演算子をフィルター式で使用して、整数値内の個々のビットを確認、結合、または比較できます。

scalar フィールドの場合、ビット演算子は `INT8`、`INT16`、`INT32`、`INT64` などの整数フィールド型に適用されます。

### サポートされるビット演算子\{#supported-bitwise-operators}

| **Operator** | **Name** | **Typical use** |
| --- | --- | --- |
| `&` | ビット AND | 特定のビットがセットされているかどうかを確認します。 |
| `\|` | ビット OR | 比較前にビットを結合します。 |
| `^` | ビット XOR | 2 つの値のビット差を比較します。 |

### 例: 権限ビットによるフィルタリング\{#example-filtering-by-permission-bits}

`permissions` という名前の整数フィールドがあり、整数内の各ビットが権限フラグを表しているとします。

| **Permission flag** | **Bit value** |
| --- | --- |
| `READ` | `1` |
| `WRITE` | `2` |
| `SHARE` | `4` |
| `ADMIN` | `8` |

たとえば、`permissions = 5` は `READ` ビットと `SHARE` ビットがセットされていることを意味します。これは `5 = 1 + 4` だからです。

`SHARE` ビットがセットされている entity を見つけるには、ビット AND (`&`) を使用します。

```python
filter = "(permissions & 4) == 4"
```

`WRITE` ビットをセットした結果が `READ + WRITE + SHARE` の権限セットになる entity を見つけるには、ビット OR (`|`) を使用します。

```python
filter = "(permissions | 2) == 7"
```

権限ビットが `READ + WRITE + SHARE` と `WRITE` ビットだけ異なる entity を見つけるには、ビット XOR (`^`) を使用します。

```python
filter = "(permissions ^ 7) == 2"
```

注意: `(permissions & 4) == 4` のように、結果を比較する前に必ずビット演算を括弧で囲んでください。 

## 論理演算子\{#logical-operators}

論理演算子は、複数の条件をより複雑なフィルター式に組み合わせるために使用されます。これには `AND`、`OR`、および `NOT` が含まれます。

### サポートされる論理演算子:\{#supported-logical-operators}

- `AND`: すべてが真でなければならない複数の条件を結合します。

- `OR`: 少なくとも 1 つが真でなければならない条件を結合します。

- `NOT`: 条件を否定します。

### 例 1: 条件の結合に `AND` を使用する\{#example-1-using-and-to-combine-conditions}

`price` が 100 より大きく、かつ `stock` が 50 より大きいすべての product を見つけるには、次のようにします。

```python
filter = 'price > 100 AND stock > 50'
```

### 例 2: 条件の結合に `OR` を使用する\{#example-2-using-or-to-combine-conditions}

`color` が "red" または "blue" のいずれかであるすべての product を見つけるには、次のようにします。

```python
filter = 'color == "red" OR color == "blue"'
```

### 例 3: 条件を除外するために `NOT` を使用する\{#example-3-using-not-to-exclude-a-condition}

`color` が "green" ではないすべての product を見つけるには、次のようにします。

```python
filter = 'NOT color == "green"'
```

## IS NULL と IS NOT NULL 演算子\{#is-null-and-is-not-null-operators}

`IS NULL` および `IS NOT NULL` 演算子は、フィールドに null 値（データの欠如）が含まれているかどうかに基づいてフィールドをフィルタリングするために使用されます。

- `IS NULL`: 特定のフィールドに null 値が含まれている entity、つまり値が存在しないか未定義である entity を識別します。

- `IS NOT NULL`: 特定のフィールドに null 以外の値が含まれている entity、つまりフィールドに有効で定義済みの値がある entity を識別します。

<Admonition type="info" icon="📘" title="注意">

これらの演算子は大文字小文字を区別しないため、`IS NULL` または `is null`、`IS NOT NULL` または `is not null` のいずれも使用できます。

</Admonition>

### null 値を持つ通常の scalar フィールド\{#regular-scalar-fields-with-null-values}

Zilliz Cloud では、文字列や数値など、null 値を持つ通常の scalar フィールドに対してフィルタリングできます。

<Admonition type="info" icon="📘" title="注意">

空文字列 `""` は、`VARCHAR` フィールドにおいて null 値として扱われません。

</Admonition>

`description` フィールドが null の entity を取得するには、次のようにします。

```python
filter = 'description IS NULL'
```

`description` フィールドが null ではない entity を取得するには、次のようにします。

```python
filter = 'description IS NOT NULL'
```

`description` フィールドが null ではなく、かつ `price` フィールドが 10 より大きい entity を取得するには、次のようにします。

```python
filter = 'description IS NOT NULL AND price > 10'
```

### null 値を持つ JSON フィールド\{#json-fields-with-null-values}

Zilliz Cloud では、null 値を含む JSON フィールドに対してフィルタリングできます。JSON フィールドは、次のいずれかの場合に null として扱われます。

- JSON オブジェクト全体が明示的に None（null）に設定されている場合。たとえば `{"metadata": None}`。

- JSON フィールド自体が entity から完全に欠落している場合。

<Admonition type="info" icon="📘" title="注意">

JSON オブジェクト内の一部の要素（たとえば個別のキー）が null であっても、そのフィールドは null ではないと見なされます。たとえば、`\{"metadata": \{"category": None, "price": 99.99}}` は、`category` キーが null であっても null としては扱われません。

</Admonition>

Zilliz Cloud が null 値を持つ JSON フィールドをどのように扱うかをさらに示すために、JSON フィールド `metadata` を持つ次のサンプルデータを考えてみましょう。

```python
data = [
  {
      "metadata": {"category": "electronics", "price": 99.99, "brand": "BrandA"},
      "pk": 1,
      "embedding": [0.12, 0.34, 0.56]
  },
  {
      "metadata": None, # Entire JSON object is null
      "pk": 2,
      "embedding": [0.56, 0.78, 0.90]
  },
  {  # JSON field `metadata` is completely missing
      "pk": 3,
      "embedding": [0.91, 0.18, 0.23]
  },
  {
      "metadata": {"category": None, "price": 99.99, "brand": "BrandA"}, # Individual key value is null
      "pk": 4,
      "embedding": [0.56, 0.38, 0.21]
  }
]
```

**例 1: metadata が null の entity を取得する**

`metadata` フィールドが欠落しているか、明示的に None に設定されている entity を見つけるには、次のようにします。

```python
filter = 'metadata IS NULL'

# Example output:
# data: [
#     "{'metadata': None, 'pk': 2}",
#     "{'metadata': None, 'pk': 3}"
# ]
```

**例 2: metadata が null ではない entity を取得する**

`metadata` フィールドが null ではない entity を見つけるには、次のようにします。

```python
filter = 'metadata IS NOT NULL'

# Example output:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

### null 値を持つ ARRAY フィールド\{#array-fields-with-null-values}

Zilliz Cloud では、null 値を含む ARRAY フィールドに対してフィルタリングできます。ARRAY フィールドは、次のいずれかの場合に null として扱われます。

- ARRAY フィールド全体が明示的に None（null）に設定されている場合。たとえば `"tags": None`。

- ARRAY フィールドが entity から完全に欠落している場合。

<Admonition type="info" icon="📘" title="注意">

ARRAY フィールドでは、すべての要素が同じデータ型でなければならないため、部分的な null 値を含めることはできません。詳細については、[Array Field](./use-array-fields) を参照してください。

</Admonition>

Zilliz Cloud が null 値を持つ ARRAY フィールドをどのように扱うかをさらに示すために、ARRAY フィールド `tags` を持つ次のサンプルデータを考えてみましょう。

```python
data = [
  {
      "tags": ["pop", "rock", "classic"],
      "ratings": [5, 4, 3],
      "pk": 1,
      "embedding": [0.12, 0.34, 0.56]
  },
  {
      "tags": None,  # Entire ARRAY is null
      "ratings": [4, 5],
      "pk": 2,
      "embedding": [0.78, 0.91, 0.23]
  },
  {  # The tags field is completely missing
      "ratings": [9, 5],
      "pk": 3,
      "embedding": [0.18, 0.11, 0.23]
  }
]
```

**例 1: tags が null の entity を取得する**

`tags` フィールドが欠落しているか、明示的に `None` に設定されている entity を取得するには、次のようにします。

```python
filter = 'tags IS NULL'

# Example output:
# data: [
#     "{'tags': None, 'ratings': [4, 5], 'embedding': [0.78, 0.91, 0.23], 'pk': 2}",
#     "{'tags': None, 'ratings': [9, 5], 'embedding': [0.18, 0.11, 0.23], 'pk': 3}"
# ]
```

**例 2: tags が null ではない entity を取得する**

`tags` フィールドが null ではない entity を取得するには、次のようにします。

```python
filter = 'tags IS NOT NULL'

# Example output:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

## JSON フィールドおよび ARRAY フィールドで基本演算子を使用する際のヒント\{#tips-on-using-basic-operators-with-json-and-array-fields}

Zilliz Cloud cluster における基本演算子は汎用性が高く、scalar フィールドに適用できるだけでなく、JSON フィールドおよび ARRAY フィールド内のキーやインデックスにも効果的に使用できます。

たとえば、`product` フィールドに `price`、`model`、`tags` など複数のキーが含まれている場合は、常にキーを直接参照してください。

```python
filter = 'product["price"] > 1000'
```

記録された温度の配列において、最初の温度が特定の値を超えるレコードを見つけるには、次のようにします。

```python
filter = 'history_temperatures[0] > 30'
```

## まとめ\{#conclusion}

Zilliz Cloud は、データのフィルタリングおよびクエリに柔軟性をもたらすさまざまな基本演算子を提供しています。比較、範囲、算術、および論理演算子を組み合わせることで、検索結果を絞り込み、必要なデータを効率的に取得するための強力なフィルター式を作成できます。

## FAQ\{#faq}

**フィルター条件内の一致値リストの長さに制限はありますか（例: filter='color in ["red", "green", "blue"]'）？ リストが長すぎる場合はどうすればよいですか？**

Zilliz Cloud では、フィルター条件内の一致値リストの長さに制限はありません。ただし、リストが過度に長いと、クエリのパフォーマンスに大きな影響を与える可能性があります。
フィルター条件に長い一致値リスト、または多くの要素を含む複雑な式が含まれる場合は、クエリパフォーマンスを向上させるために [Filter Templating](./filtering-templating) の使用を推奨します。
