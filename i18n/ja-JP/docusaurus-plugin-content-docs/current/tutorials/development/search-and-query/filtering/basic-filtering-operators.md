---
title: "基本演算子 | Cloud"
slug: /basic-filtering-operators
sidebar_label: "基本"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、データを効率的にフィルタリングおよびクエリするために役立つ豊富な基本演算子セットを提供します。これらの演算子を使用すると、スカラーフィールド、数値計算、論理条件などに基づいて検索条件を絞り込めます。これらの演算子の使い方を理解することは、正確なクエリを構築し、検索の効率を最大化するうえで重要です。 | Cloud"
type: origin
token: LBbUwOGcwi1UMak3eE2cM1gvnUe
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 基本演算子

Zilliz Cloud は、データを効率的にフィルタリングおよびクエリするために役立つ豊富な基本演算子セットを提供します。これらの演算子を使用すると、スカラーフィールド、数値計算、論理条件などに基づいて検索条件を絞り込めます。これらの演算子の使い方を理解することは、正確なクエリを構築し、検索の効率を最大化するうえで重要です。

<Admonition type="info" title="Notes">

フィルター式の左辺に指定するリテラルには、以下に示す例で使用されている `status` や `color` などのコレクションフィールド名、または `filter = 'struct[0][subfield] > 10'` のように特定の要素インデックスにある StructArray サブフィールド名を指定できます。

StructArray フィールドでのスカラーフィルタリングの詳細については、[StructArray 演算子](./struct-array-filtering) を参照してください。

</Admonition>

## 比較演算子\{#comparison-operators}

比較演算子は、等価、不等価、大小関係に基づいてデータをフィルタリングするために使用します。数値フィールドとテキストフィールドに適用できます。

### サポートされている比較演算子：\{#supported-comparison-operators}

- `==`（等しい）

- `!=`（等しくない）

- `>`（より大きい）

- `<`（より小さい）

- `>=`（以上）

- `<=`（以下）

### 例 1: `==`（等しい）を使用したフィルタリング\{#example-1-filtering-with-equal-to}

`status` という名前のフィールドがあり、`status` が "active" であるすべてのエンティティを検索したいとします。この場合は、等価演算子 `==` を使用できます。

```python
filter = 'status == "active"'
```

### 例 2: `!=`（等しくない）を使用したフィルタリング\{#example-2-filtering-with-not-equal-to}

`status` が "inactive" ではないエンティティを検索するには、次のようにします。

```python
filter = 'status != "inactive"'
```

### 例 3: `>`（より大きい）を使用したフィルタリング\{#example-3-filtering-with-greater-than-greater}

`age` が 30 より大きいすべてのエンティティを検索する場合は、次のようにします。

```python
filter = 'age > 30'
```

### 例 4: Less Than（より小さい）を使用したフィルタリング\{#example-4-filtering-with-less-than}

`price` が 100 未満であるエンティティを検索するには、次のようにします。

```python
filter = 'price < 100'
```

### 例 5: `>=`（以上）を使用したフィルタリング\{#example-5-filtering-with-greater-than-or-equal-to-greater}

`rating` が 4 以上であるすべてのエンティティを検索する場合は、次のようにします。

```python
filter = 'rating >= 4'
```

### 例 6: Less Than or Equal To（以下）を使用したフィルタリング\{#example-6-filtering-with-less-than-or-equal-to}

`discount` が 10% 以下であるエンティティを検索するには、次のようにします。

```python
filter = 'discount <= 10'
```

## 範囲演算子\{#range-operators}

範囲演算子は、特定の値セットに基づいてデータをフィルタリングするのに役立ちます。Zilliz Cloud は、集合への所属チェックに `IN` をサポートしています。

`color` が "red"、"green"、"blue" のいずれかであるすべてのエンティティを検索する場合は、次のようにします。

```python
filter = 'color in ["red", "green", "blue"]'
```

これは、値のリストへの所属を確認したい場合に便利です。

## パターンマッチング演算子\{#pattern-matching-operators}

パターンマッチング演算子は、ワイルドカードパターンまたは正規表現に基づいて文字列値をフィルタリングするのに役立ちます。

- `LIKE`: 文字列値に対して単純なワイルドカードパターンをマッチングするために使用します。たとえば、`name LIKE "Prod%"` は `Prod` で始まる値に一致します。

- `=~`: 文字列値を RE2 正規表現でマッチングするために使用します。たとえば、`code =~ "E[0-9]{4}"` は `E1001` のようなエラーコードを含む値に一致します。

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

`LIKE` と正規表現の使い分け、サポートされるフィールド型、正規表現の構文、エスケープ規則、パフォーマンスの詳細については、[パターンマッチング](./pattern-match) を参照してください。また、Zilliz Cloud では、対象となるパターンマッチングフィルターを高速化するために、`VARCHAR` フィールドまたは JSON 文字列パスに `NGRAM` インデックスを構築することもできます。詳細については、[NGRAM](./ngram-index-type) を参照してください。

## 算術演算子\{#arithmetic-operators}

算術演算子を使用すると、数値フィールドを含む計算に基づいて条件を作成できます。

### サポートされている算術演算子：\{#supported-arithmetic-operators}

- `+`（加算）

- `-`（減算）

- `*`（乗算）

- `/`（除算）

- `%`（剰余）

- `**`（累乗）

### 例 1: `%`（剰余）の使用\{#example-1-using-modulus-percent}

`id` が偶数（つまり 2 で割り切れる）であるエンティティを検索するには、次のようにします。

```python
filter = 'id % 2 == 0'
```

### 例 2: `**`（累乗）の使用\{#example-2-using-exponentiation}

`price` を 2 乗した値が 1000 より大きいエンティティを検索するには、次のようにします。

```python
filter = 'price ** 2 > 1000'
```

## ビット演算子\{#bitwise-operators}

ビット演算子は、権限、機能フラグ、ステータスビットなど、整数フィールドが複数のフラグをエンコードしている場合に役立ちます。これらの演算子をフィルター式で使用すると、整数値内の個々のビットを確認、結合、比較できます。

スカラーフィールドでは、ビット演算子は `INT8`、`INT16`、`INT32`、`INT64` などの整数フィールド型に適用されます。

### サポートされているビット演算子\{#supported-bitwise-operators}

| **演算子** | **名前** | **一般的な用途** |
| --- | --- | --- |
| `&` | ビット AND | 特定のビットがセットされているかどうかを確認します。 |
| `\|` | ビット OR | 比較の前にビットを結合します。 |
| `^` | ビット XOR | 2 つの値のビットの違いを比較します。 |

### 例: 権限ビットによるフィルタリング\{#example-filtering-by-permission-bits}

`permissions` という名前の整数フィールドがあり、整数内の各ビットが権限フラグを表しているとします。

| **権限フラグ** | **ビット値** |
| --- | --- |
| `READ` | `1` |
| `WRITE` | `2` |
| `SHARE` | `4` |
| `ADMIN` | `8` |

たとえば、`permissions = 5` は `READ` ビットと `SHARE` ビットがセットされていることを意味します。これは `5 = 1 + 4` であるためです。

`SHARE` ビットがセットされているエンティティを検索するには、ビット AND（`&`）を使用します。

```python
filter = "(permissions & 4) == 4"
```

`WRITE` ビットをセットした結果が `READ + WRITE + SHARE` の権限セットになるエンティティを検索するには、ビット OR（`|`）を使用します。

```python
filter = "(permissions | 2) == 7"
```

権限ビットが `READ + WRITE + SHARE` と `WRITE` ビットだけ異なるエンティティを検索するには、ビット XOR（`^`）を使用します。

```python
filter = "(permissions ^ 7) == 2"
```

注: 結果を比較する前に、`(permissions & 4) == 4` のように、ビット演算を必ず括弧で囲んでください。

## 論理演算子\{#logical-operators}

論理演算子は、複数の条件を組み合わせてより複雑なフィルター式を作成するために使用します。`AND`、`OR`、`NOT` があります。

### サポートされている論理演算子：\{#supported-logical-operators}

- `AND`: すべてが真である必要がある複数の条件を結合します。

- `OR`: 少なくとも 1 つが真である必要がある条件を結合します。

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

## IS NULL 演算子と IS NOT NULL 演算子\{#is-null-and-is-not-null-operators}

`IS NULL` 演算子と `IS NOT NULL` 演算子は、フィールドに null 値（データの欠如）が含まれているかどうかに基づいてフィールドをフィルタリングするために使用します。

- `IS NULL`: 特定のフィールドに null 値が含まれているエンティティ、つまり値が存在しないか未定義であるエンティティを識別します。

- `IS NOT NULL`: 特定のフィールドに null 以外の値が含まれているエンティティ、つまりフィールドに有効で定義済みの値があるエンティティを識別します。

<Admonition type="info" title="Notes">

これらの演算子は大文字と小文字を区別しないため、`IS NULL` または `is null`、および `IS NOT NULL` または `is not null` を使用できます。

</Admonition>

### null 値を持つ通常のスカラーフィールド\{#regular-scalar-fields-with-null-values}

Zilliz Cloud では、文字列や数値などの通常のスカラーフィールドに対して、null 値を含むフィルタリングを行うことができます。

<Admonition type="info" title="Notes">

空の文字列 `""` は、`VARCHAR` フィールドの null 値としては扱われません。

</Admonition>

`description` フィールドが null であるエンティティを取得するには、次のようにします。

```python
filter = 'description IS NULL'
```

`description` フィールドが null ではないエンティティを取得するには、次のようにします。

```python
filter = 'description IS NOT NULL'
```

`description` フィールドが null ではなく、かつ `price` フィールドが 10 より大きいエンティティを取得するには、次のようにします。

```python
filter = 'description IS NOT NULL AND price > 10'
```

### null 値を持つ JSON フィールド\{#json-fields-with-null-values}

Zilliz Cloud では、null 値を含む JSON フィールドに対してフィルタリングを行うことができます。JSON フィールドが null として扱われるのは、次の場合です。

- JSON オブジェクト全体が明示的に None（null）に設定されている場合。たとえば、`{"metadata": None}` です。

- JSON フィールド自体がエンティティにまったく存在しない場合。

<Admonition type="info" title="Notes">

JSON オブジェクト内の一部の要素（個々のキーなど）が null であっても、そのフィールドは null 以外として扱われます。たとえば、`category` キーが null であっても、`\{"metadata": \{"category": None, "price": 99.99}}` は null としては扱われません。

</Admonition>

null 値を含む JSON フィールドを Zilliz Cloud がどのように処理するかをさらに説明するために、`metadata` という JSON フィールドを持つ次のサンプルデータを考えてみます。

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

`metadata` フィールドが存在しないか、明示的に None に設定されているエンティティを検索するには、次のようにします。

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

### null 値を持つ ARRAY フィールド\{#array-fields-with-null-values}

Zilliz Cloud では、null 値を含む ARRAY フィールドに対してフィルタリングを行うことができます。ARRAY フィールドが null として扱われるのは、次の場合です。

- ARRAY フィールド全体が明示的に None（null）に設定されている場合。たとえば、`"tags": None` です。

- ARRAY フィールドがエンティティにまったく存在しない場合。

<Admonition type="info" title="Notes">

ARRAY フィールド内のすべての要素は同じデータ型である必要があるため、ARRAY フィールドに部分的な null 値を含めることはできません。詳細については、[Array フィールド](./use-array-fields) を参照してください。

</Admonition>

null 値を含む ARRAY フィールドを Zilliz Cloud がどのように処理するかをさらに説明するために、`tags` という ARRAY フィールドを持つ次のサンプルデータを考えてみます。

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

`tags` フィールドが存在しないか、明示的に `None` に設定されているエンティティを取得するには、次のようにします。

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

Zilliz Cloud クラスターの基本演算子は汎用性が高く、スカラーフィールドに適用できるだけでなく、JSON フィールドや ARRAY フィールドのキーとインデックスに対しても効果的に使用できます。

たとえば、`price`、`model`、`tags` などの複数のキーを含む `product` フィールドがある場合は、常にキーを直接参照してください。

```python
filter = 'product["price"] > 1000'
```

記録された気温の配列内で最初の気温が特定の値を超えるレコードを検索するには、次のようにします。

```python
filter = 'history_temperatures[0] > 30'
```

## まとめ\{#conclusion}

Zilliz Cloud は、データのフィルタリングとクエリに柔軟性をもたらすさまざまな基本演算子を提供しています。比較演算子、範囲演算子、算術演算子、論理演算子を組み合わせることで、検索結果を絞り込み、必要なデータを効率的に取得する強力なフィルター式を作成できます。

## FAQ\{#faq}

**フィルター条件の一致値リストの長さに制限はありますか（例: `filter='color in ["red", "green", "blue"]'`）？ リストが長すぎる場合はどうすればよいですか？**

Zilliz Cloud は、フィルター条件の一致値リストの長さに制限を設けていません。ただし、リストが長すぎるとクエリのパフォーマンスに大きな影響を与える可能性があります。
フィルター条件に長い一致値リストや、多くの要素を含む複雑な式が含まれる場合は、クエリのパフォーマンスを向上させるために [フィルタテンプレート](./filtering-templating) を使用することをお勧めします。
