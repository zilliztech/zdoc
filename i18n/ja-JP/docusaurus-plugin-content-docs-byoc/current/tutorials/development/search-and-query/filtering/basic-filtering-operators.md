---
title: "基本演算子 | BYOC"
slug: /basic-filtering-operators
sidebar_label: "基本"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、データを効率的にフィルタリングおよびクエリするための豊富な基本演算子セットを提供します。これらの演算子を使用すると、スカラーフィールド、数値計算、論理条件などに基づいて検索条件を絞り込むことができます。これらの演算子の使い方を理解することは、正確なクエリを構築し、検索の効率を最大化するうえで重要です。 | BYOC"
type: origin
token: LBbUwOGcwi1UMak3eE2cM1gvnUe
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 基本演算子

Zilliz Cloud は、データを効率的にフィルタリングおよびクエリするための豊富な基本演算子セットを提供します。これらの演算子を使用すると、スカラーフィールド、数値計算、論理条件などに基づいて検索条件を絞り込むことができます。これらの演算子の使い方を理解することは、正確なクエリを構築し、検索の効率を最大化するうえで重要です。

<Admonition type="info" title="Notes">

フィルタリング式の左辺にあるリテラルには、以下の例で使用されている `status` や `color` などのコレクションフィールド名、または `filter = 'struct[0][subfield] > 10'` のように特定の要素インデックスにある StructArray サブフィールドの名前を指定できます。 

StructArray フィールドにおけるスカラーフィルタリングの詳細については、[StructArray Operators](./struct-array-filtering) を参照してください。

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

### 例 1: Equal To（`==`）によるフィルタリング\{#example-1-filtering-with-equal-to}

`status` という名前のフィールドがあり、`status` が "active" であるすべてのエンティティを検索したいとします。等価演算子 `==` を使用できます。

```python
filter = 'status == "active"'
```

### 例 2: Not Equal To（`!=`）によるフィルタリング\{#example-2-filtering-with-not-equal-to}

`status` が "inactive" ではないエンティティを検索するには、次のようにします。

```python
filter = 'status != "inactive"'
```

### 例 3: Greater Than（`>`）によるフィルタリング\{#example-3-filtering-with-greater-than-greater}

`age` が 30 より大きいすべてのエンティティを検索するには、次のようにします。

```python
filter = 'age > 30'
```

### 例 4: Less Than によるフィルタリング\{#example-4-filtering-with-less-than}

`price` が 100 より小さいエンティティを検索するには、次のようにします。

```python
filter = 'price < 100'
```

### 例 5: Greater Than or Equal To（`>=`）によるフィルタリング\{#example-5-filtering-with-greater-than-or-equal-to-greater}

`rating` が 4 以上であるすべてのエンティティを検索するには、次のようにします。

```python
filter = 'rating >= 4'
```

### 例 6: Less Than or Equal To によるフィルタリング\{#example-6-filtering-with-less-than-or-equal-to}

`discount` が 10% 以下であるエンティティを検索するには、次のようにします。

```python
filter = 'discount <= 10'
```

## 範囲演算子\{#range-operators}

範囲演算子は、特定の値のセットに基づいてデータをフィルタリングするのに役立ちます。Zilliz Cloud は、集合のメンバーシップチェックのために `IN` をサポートしています。

`color` が "red"、"green"、"blue" のいずれかであるすべてのエンティティを検索するには、次のようにします。

```python
filter = 'color in ["red", "green", "blue"]'
```

これは、値のリストに含まれているかどうかを確認したい場合に便利です。

## パターンマッチング演算子\{#pattern-matching-operators}

パターンマッチング演算子は、ワイルドカードパターンまたは正規表現に基づいて文字列値をフィルタリングするのに役立ちます。

- `LIKE`: 文字列値に対して単純なワイルドカードパターンを照合するために使用します。たとえば、`name LIKE "Prod%"` は `Prod` で始まる値に一致します。

- `=~`: 文字列値を RE2 正規表現と照合するために使用します。たとえば、`code =~ "E[0-9]{4}"` は `E1001` のようなエラーコードを含む値に一致します。

- `!~`: RE2 正規表現に一致する文字列値を除外するために使用します。これは `NOT (field =~ "pattern")` と同等です。

`name` が `Prod` で始まるエンティティを検索するには、次のようにします。

```python
filter = 'name LIKE "Prod%"'
```

`code` に `E1001` のようなエラーコードが含まれるエンティティを検索するには、次のようにします。

```python
filter = 'code =~ "E[0-9]{4}"'
```

`message` が `DEBUG` で始まるエンティティを除外するには、次のようにします。

```python
filter = 'message !~ "^DEBUG"'
```

`LIKE` と regex の使い分け、サポートされるフィールド型、regex 構文、エスケープルール、およびパフォーマンスの詳細については、[Pattern Matching](./pattern-match) を参照してください。Zilliz Cloud では、条件を満たすパターンマッチングフィルターを高速化するために、`VARCHAR` フィールドまたは JSON 文字列パスに `NGRAM` インデックスを構築することもできます。詳細については、[NGRAM](./ngram-index-type) を参照してください。

## 算術演算子\{#arithmetic-operators}

算術演算子を使用すると、数値フィールドを含む計算に基づいて条件を作成できます。

### サポートされる算術演算子:\{#supported-arithmetic-operators}

- `+`（加算）

- `-`（減算）

- `*`（乗算）

- `/`（除算）

- `%`（剰余）

- `**`（べき乗）

### 例 1: Modulus（`%`）の使用\{#example-1-using-modulus-percent}

`id` が偶数（つまり、2 で割り切れる）であるエンティティを検索するには、次のようにします。

```python
filter = 'id % 2 == 0'
```

### 例 2: Exponentiation（`**`）の使用\{#example-2-using-exponentiation}

`price` を 2 乗した値が 1000 より大きいエンティティを検索するには、次のようにします。

```python
filter = 'price ** 2 > 1000'
```

## ビット演算子\{#bitwise-operators}

ビット演算子は、整数フィールドが権限、フィーチャーフラグ、ステータスビットなどの複数のフラグをエンコードしている場合に便利です。これらの演算子をフィルター式で使用すると、整数値内の個々のビットを確認、結合、または比較できます。

スカラーフィールドの場合、ビット演算子は `INT8`、`INT16`、`INT32`、`INT64` などの整数フィールド型に適用されます。

### サポートされるビット演算子\{#supported-bitwise-operators}

| **演算子** | **名前** | **一般的な用途** |
| --- | --- | --- |
| `&` | ビット単位 AND | 特定のビットがセットされているかどうかを確認します。 |
| `\|` | ビット単位 OR | 比較する前にビットを結合します。 |
| `^` | ビット単位 XOR | 2 つの値のビット差を比較します。 |

### 例: 権限ビットによるフィルタリング\{#example-filtering-by-permission-bits}

`permissions` という名前の整数フィールドがあり、その整数内の各ビットが権限フラグを表しているとします。

| **権限フラグ** | **ビット値** |
| --- | --- |
| `READ` | `1` |
| `WRITE` | `2` |
| `SHARE` | `4` |
| `ADMIN` | `8` |

たとえば、`permissions = 5` は `READ` ビットと `SHARE` ビットがセットされていることを意味します。これは `5 = 1 + 4` であるためです。

`SHARE` ビットがセットされているエンティティを検索するには、ビット単位 AND（`&`）を使用します。

```python
filter = "(permissions & 4) == 4"
```

`WRITE` ビットをセットした結果が `READ + WRITE + SHARE` の権限セットになるエンティティを検索するには、ビット単位 OR（`|`）を使用します。

```python
filter = "(permissions | 2) == 7"
```

権限ビットが `READ + WRITE + SHARE` と `WRITE` ビットだけ異なるエンティティを検索するには、ビット単位 XOR（`^`）を使用します。

```python
filter = "(permissions ^ 7) == 2"
```

注意: `(permissions & 4) == 4` のように、結果を比較する前に必ずビット演算を括弧で囲んでください。 

## 論理演算子\{#logical-operators}

論理演算子は、複数の条件を組み合わせてより複雑なフィルター式を作成するために使用されます。これには `AND`、`OR`、`NOT` があります。

### サポートされる論理演算子:\{#supported-logical-operators}

- `AND`: すべてが true でなければならない複数の条件を結合します。

- `OR`: 少なくとも 1 つが true でなければならない条件を結合します。

- `NOT`: 条件を否定します。

### 例 1: `AND` を使用した条件の結合\{#example-1-using-and-to-combine-conditions}

`price` が 100 より大きく、`stock` が 50 より大きいすべての製品を検索するには、次のようにします。

```python
filter = 'price > 100 AND stock > 50'
```

### 例 2: `OR` を使用した条件の結合\{#example-2-using-or-to-combine-conditions}

`color` が "red" または "blue" のいずれかであるすべての製品を検索するには、次のようにします。

```python
filter = 'color == "red" OR color == "blue"'
```

### 例 3: `NOT` を使用した条件の除外\{#example-3-using-not-to-exclude-a-condition}

`color` が "green" ではないすべての製品を検索するには、次のようにします。

```python
filter = 'NOT color == "green"'
```

## IS NULL および IS NOT NULL 演算子\{#is-null-and-is-not-null-operators}

`IS NULL` および `IS NOT NULL` 演算子は、フィールドに null 値（データが存在しないこと）が含まれているかどうかに基づいてフィールドをフィルタリングするために使用されます。

- `IS NULL`: 特定のフィールドに null 値が含まれている、つまり値が存在しないか未定義であるエンティティを識別します。

- `IS NOT NULL`: 特定のフィールドに null 以外の値が含まれている、つまりフィールドに有効で定義済みの値があるエンティティを識別します。

<Admonition type="info" title="Notes">

これらの演算子は大文字と小文字を区別しないため、`IS NULL` または `is null`、`IS NOT NULL` または `is not null` を使用できます。

</Admonition>

### null 値を含む通常のスカラーフィールド\{#regular-scalar-fields-with-null-values}

Zilliz Cloud では、文字列や数値など、null 値を含む通常のスカラーフィールドに対してフィルタリングできます。

<Admonition type="info" title="Notes">

空の文字列 `""` は、`VARCHAR` フィールドでは null 値として扱われません。

</Admonition>

`description` フィールドが null であるエンティティを取得するには、次のようにします。

```python
filter = 'description IS NULL'
```

`description` フィールドが null ではないエンティティを取得するには、次のようにします。

```python
filter = 'description IS NOT NULL'
```

`description` フィールドが null ではなく、`price` フィールドが 10 より大きいエンティティを取得するには、次のようにします。

```python
filter = 'description IS NOT NULL AND price > 10'
```

### null 値を含む JSON フィールド\{#json-fields-with-null-values}

Zilliz Cloud では、null 値を含む JSON フィールドに対してフィルタリングできます。JSON フィールドは、次の場合に null として扱われます。

- JSON オブジェクト全体が明示的に None（null）に設定されている場合（たとえば `{"metadata": None}`）。

- JSON フィールド自体がエンティティから完全に欠落している場合。

<Admonition type="info" title="Notes">

JSON オブジェクト内の一部の要素（たとえば個々のキー）が null であっても、そのフィールドは null ではないと見なされます。たとえば `\{"metadata": \{"category": None, "price": 99.99}}` は、`category` キーが null であっても null として扱われません。

</Admonition>

Zilliz Cloud が null 値を含む JSON フィールドをどのように処理するかをさらに説明するために、JSON フィールド `metadata` を持つ次のサンプルデータを考えてみます。

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

**例 1: `metadata` が null であるエンティティを取得する**

`metadata` フィールドが欠落しているか、明示的に None に設定されているエンティティを検索するには、次のようにします。

```python
filter = 'metadata IS NULL'

# Example output:
# data: [
#     "{'metadata': None, 'pk': 2}",
#     "{'metadata': None, 'pk': 3}"
# ]
```

**例 2: `metadata` が null ではないエンティティを取得する**

`metadata` フィールドが null ではないエンティティを検索するには、次のようにします。

```python
filter = 'metadata IS NOT NULL'

# Example output:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

### null 値を含む ARRAY フィールド\{#array-fields-with-null-values}

Zilliz Cloud では、null 値を含む ARRAY フィールドに対してフィルタリングできます。ARRAY フィールドは、次の場合に null として扱われます。

- ARRAY フィールド全体が明示的に None（null）に設定されている場合（たとえば `"tags": None`）。

- ARRAY フィールドがエンティティから完全に欠落している場合。

<Admonition type="info" title="Notes">

ARRAY フィールド内のすべての要素は同じデータ型でなければならないため、ARRAY フィールドに部分的な null 値を含めることはできません。詳細については、[Array Field](./use-array-fields) を参照してください。

</Admonition>

Zilliz Cloud が null 値を含む ARRAY フィールドをどのように処理するかをさらに説明するために、ARRAY フィールド `tags` を持つ次のサンプルデータを考えてみます。

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

**例 1: `tags` が null であるエンティティを取得する**

`tags` フィールドが欠落しているか、明示的に `None` に設定されているエンティティを取得するには、次のようにします。

```python
filter = 'tags IS NULL'

# Example output:
# data: [
#     "{'tags': None, 'ratings': [4, 5], 'embedding': [0.78, 0.91, 0.23], 'pk': 2}",
#     "{'tags': None, 'ratings': [9, 5], 'embedding': [0.18, 0.11, 0.23], 'pk': 3}"
# ]
```

**例 2: `tags` が null ではないエンティティを取得する**

`tags` フィールドが null ではないエンティティを取得するには、次のようにします。

```python
filter = 'tags IS NOT NULL'

# Example output:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

## JSON フィールドおよび ARRAY フィールドで基本演算子を使用する際のヒント\{#tips-on-using-basic-operators-with-json-and-array-fields}

Zilliz Cloud クラスターの基本演算子は汎用性が高く、スカラーフィールドに適用できるだけでなく、JSON フィールドおよび ARRAY フィールド内のキーやインデックスに対しても効果的に使用できます。

たとえば、`product` フィールドに `price`、`model`、`tags` などの複数のキーが含まれている場合は、常にキーを直接参照してください。

```python
filter = 'product["price"] > 1000'
```

記録された温度の配列において、最初の温度が特定の値を超えるレコードを検索するには、次の式を使用します。

```python
filter = 'history_temperatures[0] > 30'
```

## まとめ\{#conclusion}

Zilliz Cloud は、データのフィルタリングとクエリに柔軟性をもたらすさまざまな基本演算子を提供しています。比較演算子、範囲演算子、算術演算子、および論理演算子を組み合わせることで、検索結果を絞り込み、必要なデータを効率的に取得するための強力なフィルター式を作成できます。

## FAQ\{#faq}

**フィルター条件内の一致値リストの長さに制限はありますか（例: `filter='color in ["red", "green", "blue"]'`）？ リストが長すぎる場合はどうすればよいですか？**

Zilliz Cloud では、フィルター条件内の一致値リストの長さに制限はありません。ただし、リストが過度に長いと、クエリのパフォーマンスに大きく影響する可能性があります。
フィルター条件に長い一致値リスト、または多数の要素を含む複雑な式が含まれる場合は、クエリのパフォーマンスを向上させるために [Filter Templating](./filtering-templating) を使用することを推奨します。
