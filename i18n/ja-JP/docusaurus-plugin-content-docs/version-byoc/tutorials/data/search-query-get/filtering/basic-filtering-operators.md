---
title: "基本演算子 | BYOC"
slug: /basic-filtering-operators
sidebar_label: "基本演算子"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、データのフィルタリングとクエリを効率的に行うための豊富な基本演算子を提供しています。これらの演算子を使用すると、スカラーフィールド、数値計算、論理条件などを基に検索条件を絞り込めます。これらの演算子の使用方法を理解することは、正確なクエリを構築し、検索の効率を最大化するために不可欠です。 | BYOC"
type: origin
token: LBbUwOGcwi1UMak3eE2cM1gvnUe
sidebar_position: 2
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - フィルター
  - フィルタリング式
  - フィルタリング
  - 基本演算子
  - openaiベクトルデータベース
  - 自然言語処理データベース
  - 安価なベクトルデータベース
  - 管理型ベクトルデータベース

---

import Admonition from '@theme/Admonition';


# 基本演算子

Zilliz Cloudは、データのフィルタリングとクエリを効率的に行うための豊富な基本演算子を提供しています。これらの演算子を使用すると、スカラーフィールド、数値計算、論理条件などを基に検索条件を絞り込めます。これらの演算子の使用方法を理解することは、正確なクエリを構築し、検索の効率を最大化するために不可欠です。

## 比較演算子\{#comparison-operators}

比較演算子は、等価性、不等価性、または大きさに基づいてデータをフィルタリングするために使用されます。これらは数値フィールドとテキストフィールドに適用できます。

### サポートされている比較演算子:\{#supported-comparison-operators}

- `==` (等しい)

- `!=` (等しくない)

- `>` (より大きい)

- `<` (より小さい)

- `>=` (以上)

- `<=` (以下)

### 例1: 等価演算子 (`==`) によるフィルタリング\{#example-1-filtering-with-equal-to}

`status`という名前のフィールドがあり、`status`が"active"であるすべてのエンティティを検索したいとします。等価演算子`==`を使用できます。

```python
filter = 'status == "active"'
```

### 例2: 不等価演算子 (`!=`) によるフィルタリング\{#example-2-filtering-with-not-equal-to}

`status`が"inactive"ではないエンティティを検索する場合は以下のようにします。

```python
filter = 'status != "inactive"'
```

### 例3: 大なり演算子 (`>`) によるフィルタリング\{#example-3-filtering-with-greater-than-greater}

`age`が30より大きいすべてのエンティティを検索する場合：

```python
filter = 'age > 30'
```

### 例4: 小なり演算子によるフィルタリング\{#example-4-filtering-with-less-than}

`price`が100より小さいエンティティを検索するには：

```python
filter = 'price < 100'
```

### 例5: 以上演算子 (`>=`) によるフィルタリング\{#example-5-filtering-with-greater-than-or-equal-to-greater}

`rating`が4以上であるすべてのエンティティを検索する場合：

```python
filter = 'rating >= 4'
```

### 例6: 以下演算子によるフィルタリング\{#example-6-filtering-with-less-than-or-equal-to}

`discount`が10%以下であるエンティティを検索するには：

```python
filter = 'discount <= 10'
```

## 範囲演算子\{#range-operators}

範囲演算子は、特定のセットまたは値の範囲に基づいてデータをフィルタリングするのに役立ちます。

### サポートされている範囲演算子:\{#supported-range-operators}

- `IN`: 特定のセットまたは範囲内の値に一致させるために使用されます。

- `LIKE`: パターンマッチングに使用されます（主にテキストフィールド）。

### 例1: `IN`を使用して複数の値に一致させる\{#example-1-using-in-to-match-multiple-values}

`color`が"red"、"green"、"blue"のいずれかであるすべてのエンティティを検索する場合は以下の通りです。

```python
filter = 'color in ["red", "green", "blue"]'
```

これは、値のリスト内での所属関係を確認したい場合に有用です。

### 例2: `LIKE`を使用したパターンマッチング\{#example-2-using-like-for-pattern-matching}

`LIKE`演算子は文字列フィールドでのパターンマッチングに使用されます。テキスト内の異なる位置にサブストリングが一致するかどうかを確認できます：**プレフィックス**（前方一致）、**インフィックス**（中間一致）、または**サフィックス**（後方一致）。`LIKE`演算子は`%`記号をワイルドカードとして使用し、任意の数の文字（0文字を含む）に一致させることができます。

<Admonition type="info" icon="📘" title="注釈">

<p>多くの場合、<strong>インフィックス</strong>または<strong>サフィックス</strong>の一致はプレフィックス一致よりも著しく低速です。パフォーマンスが重要である場合は注意して使用してください。</p>

</Admonition>

### プレフィックス一致（前方一致）\{#prefix-match-starts-with}

**プレフィックス**一致を実行する場合、文字列があるパターンで始まるかどうかを確認するために、パターンを先頭に置き、その後に任意の文字に一致する`%`を使用します。たとえば、`name`が"Prod"で始まるすべての製品を検索するには以下のようにします。

```python
filter = 'name LIKE "Prod%"'
```

これにより、"Product A"、"Product B"など、"Prod"で始まる名前のすべての製品と一致します。

### サフィックス一致（後方一致）\{#suffix-match-ends-with}

**サフィックス**一致の場合は、文字列があるパターンで終わるかどうかを確認するために、パターンの先頭に`%`記号を置きます。たとえば、`name`が"XYZ"で終わるすべての製品を検索するには以下のようにします。

```python
filter = 'name LIKE "%XYZ"'
```

これにより、"ProductXYZ"、"SampleXYZ"などのように名前が"XYZ"で終わるすべての製品と一致します。

### インフィックス一致（包含）\{#infix-match-contains}

**インフィックス**一致を実行し、パターンが文字列内のどこにでも出現可能な場合は、パターンの前後両方に`%`記号を置くことができます。たとえば、`name`に"Pro"という単語を含むすべての製品を検索するには以下のようにします。

```python
filter = 'name LIKE "%Pro%"'
```

これにより、"Product"、"ProLine"、"SuperPro"など、名前に"Pro"というサブストリングを含むすべての製品と一致します。

## 算術演算子\{#arithmetic-operators}

算術演算子を使用すると、数値フィールドを含む計算に基づく条件を作成できます。

### サポートされている算術演算子:\{#supported-arithmetic-operators}

- `+` (加算)

- `-` (減算)

- `*` (乗算)

- `/` (除算)

- `%` (剰余)

- `**` (累乗)

### 例1: 剰余 (`%`) の使用\{#example-1-using-modulus-percent}

`id`が偶数（つまり、2で割り切れる）であるエンティティを検索する場合：

```python
filter = 'id % 2 == 0'
```

### 例2: べき乗 (`**`) の使用\{#example-2-using-exponentiation}

`price`の2乗が1000より大きいエンティティを検索する場合：

```python
filter = 'price ** 2 > 1000'
```

## 論理演算子\{#logical-operators}

論理演算子は、複数の条件を組み合わせてより複雑なフィルター式を作成するために使用されます。これには`AND`、`OR`、および`NOT`が含まれます。

### サポートされている論理演算子:\{#supported-logical-operators}

- `AND`: すべてが真である必要がある複数の条件を組み合わせます。

- `OR`: 少なくとも1つが真である必要がある条件を組み合わせます。

- `NOT`: 条件を否定します。

### 例1: `AND`を使用して条件を組み合わせる\{#example-1-using-and-to-combine-conditions}

`price`が100より大きく、かつ`stock`が50より大きいすべての製品を検索する場合：

```python
filter = 'price > 100 AND stock > 50'
```

### 例2: `OR`を使用して条件を組み合わせる\{#example-2-using-or-to-combine-conditions}

`color`が"red"または"blue"であるすべての製品を検索する場合：

```python
filter = 'color == "red" OR color == "blue"'
```

### 例3: `NOT`を使用して条件を除外する\{#example-3-using-not-to-exclude-a-condition}

`color`が"green"ではないすべての製品を検索する場合：

```python
filter = 'NOT color == "green"'
```

## IS NULLおよびIS NOT NULL演算子\{#is-null-and-is-not-null-operators}

`IS NULL`および`IS NOT NULL`演算子は、フィールドにnull値（データの不在）が含まれているかどうかに基づいてフィルタリングするために使用されます。

- `IS NULL`: 特定のフィールドにnull値（つまり、値が存在しないまたは未定義）を含むエンティティを識別します。

- `IS NOT NULL`: 特定のフィールドにnull以外の値（つまり、有効な定義済みの値）を含むエンティティを識別します。

<Admonition type="info" icon="📘" title="注釈">

<p>これらの演算子は大文字小文字を区別しないため、<code>IS NULL</code>または<code>is null</code>、および<code>IS NOT NULL</code>または<code>is not null</code>を使用できます。</p>

</Admonition>

### null値を持つ通常のスカラーフィールド\{#regular-scalar-fields-with-null-values}

Zilliz Cloudでは、null値を持つ通常のスカラーフィールド（文字列や数値など）に対してフィルタリングが可能です。

<Admonition type="info" icon="📘" title="注釈">

<p><code>VARCHAR</code>フィールドに対して空文字列<code>""</code>はnull値として扱われません。</p>

</Admonition>

`description`フィールドがnullであるエンティティを取得するには：

```python
filter = 'description IS NULL'
```

`description`フィールドがnullでないエンティティを取得するには：

```python
filter = 'description IS NOT NULL'
```

`description`フィールドがnullでなく、`price`フィールドが10より大きいエンティティを取得するには：

```python
filter = 'description IS NOT NULL AND price > 10'
```

### null値を持つJSONフィールド\{#json-fields-with-null-values}

Zilliz Cloudでは、null値を含むJSONフィールドのフィルタリングが可能です。JSONフィールドは以下の方法でnullとして扱われます：

- 全体のJSONオブジェクトが明示的にNone（null）に設定されている場合、たとえば`{"metadata": None}`。

- JSONフィールド自体がエンティティから完全に欠落している場合。

<Admonition type="info" icon="📘" title="注釈">

<p>JSONオブジェクト内の一部の要素がnull（例えば個々のキー）であっても、そのフィールドは依然としてnullでないと見なされます。たとえば、<code>\{"metadata": \{"category": None, "price": 99.99}}</code>は、<code>category</code>キーがnullであっても、nullとして扱われません。</p>

</Admonition>

Zilliz Cloudがnull値を含むJSONフィールドをどのように処理するかをさらに説明するために、JSONフィールド`metadata`を使用した以下のサンプルデータを検討してください。

```python
data = [
  {
      "metadata": {"category": "electronics", "price": 99.99, "brand": "BrandA"},
      "pk": 1,
      "embedding": [0.12, 0.34, 0.56]
  },
  {
      "metadata": None, # 全体のJSONオブジェクトがnull
      "pk": 2,
      "embedding": [0.56, 0.78, 0.90]
  },
  {  # JSONフィールド`metadata`が完全に欠落している
      "pk": 3,
      "embedding": [0.91, 0.18, 0.23]
  },
  {
      "metadata": {"category": None, "price": 99.99, "brand": "BrandA"}, # 個別のキー値がnull
      "pk": 4,
      "embedding": [0.56, 0.38, 0.21]
  }
]
```

**例1: metadataがnullのエンティティを取得する**

`metadata`フィールドが欠落しているか、明示的にNoneに設定されているエンティティを検索するには：

```python
filter = 'metadata IS NULL'

# 例の出力：
# data: [
#     "{'metadata': None, 'pk': 2}",
#     "{'metadata': None, 'pk': 3}"
# ]
```

**例2: metadataがnullでないエンティティを取得する**

`metadata`フィールドがnullでないエンティティを検索するには：

```python
filter = 'metadata IS NOT NULL'

# 例の出力：
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

### null値を持つARRAYフィールド\{#array-fields-with-null-values}

Zilliz Cloudでは、null値を含むARRAYフィールドのフィルタリングが可能です。ARRAYフィールドは以下の方法でnullとして扱われます：

- 全体のARRAYフィールドが明示的にNone（null）に設定されている場合、たとえば、`"tags": None`。

- ARRAYフィールドがエンティティから完全に欠落している場合。

<Admonition type="info" icon="📘" title="注釈">

<p>ARRAYフィールドは、すべての要素が同じデータ型を持つ必要があるため、ARRAYフィールドは部分的にnull値を含むことはできません。詳細については、<a href="./use-array-fields">配列フィールド</a>を参照してください。</p>

</Admonition>

Zilliz Cloudがnull値を含むARRAYフィールドをどのように処理するかをさらに説明するために、ARRAYフィールド`tags`を持つ以下のサンプルデータを検討してください。

```python
data = [
  {
      "tags": ["pop", "rock", "classic"],
      "ratings": [5, 4, 3],
      "pk": 1,
      "embedding": [0.12, 0.34, 0.56]
  },
  {
      "tags": None,  # 全体のARRAYがnull
      "ratings": [4, 5],
      "pk": 2,
      "embedding": [0.78, 0.91, 0.23]
  },
  {  # tagsフィールドが完全に欠落している
      "ratings": [9, 5],
      "pk": 3,
      "embedding": [0.18, 0.11, 0.23]
  }
]
```

**例1: tagsがnullのエンティティを取得する**

`tags`フィールドが欠落しているか明示的に`None`に設定されているエンティティを取得するには：

```python
filter = 'tags IS NULL'

# 例の出力：
# data: [
#     "{'tags': None, 'ratings': [4, 5], 'embedding': [0.78, 0.91, 0.23], 'pk': 2}",
#     "{'tags': None, 'ratings': [9, 5], 'embedding': [0.18, 0.11, 0.23], 'pk': 3}"
# ]
```

**例2: tagsがnullでないエンティティを取得する**

`tags`フィールドがnullでないエンティティを取得するには：

```python
filter = 'tags IS NOT NULL'

# 例の出力：
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

## JSONおよびARRAYフィールドでの基本演算子の使用に関するヒント\{#tips-on-using-basic-operators-with-json-and-array-fields}

Zilliz Cloudクラスター内の基本演算子は多機能で、スカラーフィールドに適用できるだけでなく、JSONおよびARRAYフィールド内のキーおよびインデックスに対しても効果的に使用できます。

たとえば、`price`、`model`、および`tags`のような複数のキーを含む`product`フィールドがある場合、常にキーを直接参照してください。

```python
filter = 'product["price"] > 1000'
```

記録された温度の配列内の最初の温度が特定の値を超えるレコードを検索するには以下を使用してください。

```python
filter = 'history_temperatures[0] > 30'
```

## まとめ\{#conclusion}

Zilliz Cloudは、データのフィルタリングとクエリにおいて柔軟性を提供する一連の基本演算子を提供しています。比較、範囲、算術、および論理演算子を組み合わせることで、強力なフィルター式を作成し、検索結果を絞り込んで必要なデータを効率的に取得できます。

## FAQ\{#faq}

**フィルター条件での一致値リストの長さには制限がありますか（例：filter='color in ["red", "green", "blue"]'）？リストが長すぎる場合はどうすればよいですか？**

Zilliz Cloudは、フィルター条件内の一致値リストの長さに制限を設けていません。ただし、リストが長すぎるとクエリパフォーマンスに著しく影響を与える可能性があります。

フィルター条件に長い一致値リストまたは多数の要素を含む複雑な式が含まれている場合は、[フィルターーテンプレート](./filtering-templating)を使用してクエリパフォーマンスを向上させることをお勧めします。