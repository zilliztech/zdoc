---
title: "基本演算子 | Cloud"
slug: /basic-filtering-operators
sidebar_label: "基本演算子"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、データを効率的にフィルタリングおよびクエリするための豊富な基本演算子を提供します。これらの演算子を使用すると、スカラー型フィールド、数値計算、論理条件などを基に検索条件を絞り込むことができます。これらの演算子の使用方法を理解することは、正確なクエリを構築し、検索の効率を最大限に引き出すために不可欠です。| Cloud"
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
  - ディープラーニング
  - 知識ベース
  - 自然言語処理
  - AIチャットボット

---

import Admonition from '@theme/Admonition';


# 基本演算子

Zilliz Cloudは、データを効率的にフィルタリングおよびクエリするための豊富な基本演算子を提供します。これらの演算子を使用すると、スカラー型フィールド、数値計算、論理条件などを基に検索条件を絞り込むことができます。これらの演算子の使用方法を理解することは、正確なクエリを構築し、検索の効率を最大限に引き出すために不可欠です。

## 比較演算子\{#comparison-operators}

比較演算子は、等価性、不等価性、またはサイズに基づいてデータをフィルタリングするために使用されます。数値フィールドとテキストフィールドに適用できます。

### サポートされている比較演算子:\{#supported-comparison-operators}

- `==`（等しい）

- `!=`（等しくない）

- `>`（より大きい）

- `<`（より小さい）

- `>=`（以上）

- `<=`（以下）

### 例1: 等価演算子（`==`）によるフィルタリング\{#example-1-filtering-with-equal-to}

`status`という名前のフィールドがあり、`status`が"active"であるすべてのエンティティを検索したいとします。等価演算子`==`を使用できます：

```python
filter = 'status == "active"'
```

### 例2: 不等価演算子（`!=`）によるフィルタリング\{#example-2-filtering-with-not-equal-to}

`status`が"inactive"でないエンティティを検索するには：

```python
filter = 'status != "inactive"'
```

### 例3: より大きい（`>`）演算子によるフィルタリング\{#example-3-filtering-with-greater-than-greater}

`age`が30より大きいすべてのエンティティを検索するには：

```python
filter = 'age > 30'
```

### 例4: より小さい演算子によるフィルタリング\{#example-4-filtering-with-less-than}

`price`が100より小さいエンティティを検索するには：

```python
filter = 'price < 100'
```

### 例5: 以上（`>=`）演算子によるフィルタリング\{#example-5-filtering-with-greater-than-or-equal-to-greater}

`rating`が4以上であるすべてのエンティティを検索するには：

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

- `IN`：特定のセットまたは範囲内の値にマッチさせるために使用されます。

- `LIKE`：パターンにマッチさせるために使用されます（主にテキストフィールド用）。

### 例1: `IN`を使用して複数の値にマッチさせる\{#example-1-using-in-to-match-multiple-values}

`color`が"red"、"green"、または"blue"のいずれかであるすべてのエンティティを検索するには：

```python
filter = 'color in ["red", "green", "blue"]'
```

これは、値のリスト内での所属を確認したい場合に便利です。

### 例2: `LIKE`を使用したパターンマッチング\{#example-2-using-like-for-pattern-matching}

`LIKE`演算子は、文字列フィールド内のパターンマッチングに使用されます。テキスト内で**接頭辞**、**中置**、または**接尾辞**として異なる位置にサブストリングにマッチさせることができます。`LIKE`演算子は`%`記号をワイルドカードとして使用し、任意の数（0を含む）の文字にマッチさせることができます。

<Admonition type="info" icon="📘" title="ノート">

<p>多くの場合、<strong>中置</strong>または<strong>接尾辞</strong>マッチングは接頭辞マッチングより大幅に遅くなります。パフォーマンスが重要な場合は注意して使用してください。</p>

</Admonition>

### 接頭辞マッチ（で始まる）\{#prefix-match-starts-with}

文字列が与えられたパターンで始まる**接頭辞**マッチを実行するには、パターンを先頭に配置し、その後に続く任意の文字にマッチさせるために`%`を使用します。たとえば、`name`が"Prod"で始まるすべての製品を検索する場合：

```python
filter = 'name LIKE "Prod%"'
```

これにより、"Product A"、"Product B"など、"Prod"で始まるすべての製品にマッチします。

### 接尾辞マッチ（で終わる）\{#suffix-match-ends-with}

**接尾辞**マッチでは、文字列が与えられたパターンで終わることを確認します。パターンの先頭に`%`記号を配置します。たとえば、`name`が"XYZ"で終わるすべての製品を検索する場合：

```python
filter = 'name LIKE "%XYZ"'
```

これにより、"ProductXYZ"、"SampleXYZ"など、"XYZ"で終わるすべての製品にマッチします。

### 中置マッチ（含む）\{#infix-match-contains}

**中置**マッチを実行するには、パターンの前後両方に`%`記号を配置します。たとえば、`name`に"Pro"という語が含まれるすべての製品を検索する場合：

```python
filter = 'name LIKE "%Pro%"'
```

これにより、"Product"、"ProLine"、"SuperPro"など、"Pro"という部分文字列を含むすべての製品にマッチします。

## 算術演算子\{#arithmetic-operators}

算術演算子を使用すると、数値フィールドを含む計算に基づいた条件を作成できます。

### サポートされている算術演算子:\{#supported-arithmetic-operators}

- `+`（加算）

- `-`（減算）

- `*`（乗算）

- `/`（除算）

- `%`（剰余算）

- `**`（べき乗）

### 例1: 剰余算（`%`）の使用\{#example-1-using-modulus-percent}

`id`が偶数（つまり2で割り切れる）であるエンティティを検索するには：

```python
filter = 'id % 2 == 0'
```

### 例2: べき乗（`**`）の使用\{#example-2-using-exponentiation}

`price`の2乗が1000より大きいかつあるエンティティを検索するには：

```python
filter = 'price ** 2 > 1000'
```

## 論理演算子\{#logical-operators}

論理演算子は、複数の条件を組み合わせてより複雑なフィルター式を作成するために使用されます。これには`AND`、`OR`、`NOT`が含まれます。

### サポートされている論理演算子:\{#supported-logical-operators}

- `AND`：すべてがTrueでなければならない複数の条件を組み合わせます。

- `OR`：少なくとも1つがTrueである条件を組み合わせます。

- `NOT`：条件を否定します。

### 例1: `AND`を使用して条件を組み合わせる\{#example-1-using-and-to-combine-conditions}

`price`が100より大きく、かつ`stock`が50より大きいすべての製品を検索するには：

```python
filter = 'price > 100 AND stock > 50'
```

### 例2: `OR`を使用して条件を組み合わせる\{#example-2-using-or-to-combine-conditions}

`color`が"red"または"blue"であるすべての製品を検索するには：

```python
filter = 'color == "red" OR color == "blue"'
```

### 例3: `NOT`を使用して条件を除外する\{#example-3-using-not-to-exclude-a-condition}

`color`が"green"でないすべての製品を検索するには：

```python
filter = 'NOT color == "green"'
```

## IS NULLおよびIS NOT NULL演算子\{#is-null-and-is-not-null-operators}

`IS NULL`および`IS NOT NULL`演算子は、フィールドにnull値（データの不在）が含まれているかどうかに基づいてフィールドをフィルタリングするために使用されます。

- `IS NULL`：特定のフィールドにnull値が含まれている（つまり値が存在しないまたは未定義である）エンティティを識別します。

- `IS NOT NULL`：特定のフィールドにnull以外の値が含まれている（つまりフィールドに有効で定義された値がある）エンティティを識別します。

<Admonition type="info" icon="📘" title="ノート">

<p>これらの演算子は大文字小文字を区別しませんので、<code>IS NULL</code>または<code>is null</code>、<code>IS NOT NULL</code>または<code>is not null</code>を使用できます。</p>

</Admonition>

### null値を持つ通常のスカラー型フィールド\{#regular-scalar-fields-with-null-values}

Zilliz Cloudでは、文字列や数値などの通常のスカラー型フィールドにおいてnull値を持つフィールドをフィルタリングできます。

<Admonition type="info" icon="📘" title="ノート">

<p>空文字列<code>""</code>は<code>VARCHAR</code>フィールドのnull値としては扱われません。</p>

</Admonition>

`description`フィールドがnullであるエンティティを取得するには：

```python
filter = 'description IS NULL'
```

`description`フィールドがnullでないエンティティを取得するには：

```python
filter = 'description IS NOT NULL'
```

`description`フィールドがnullでなく、かつ`price`フィールドが10より大きいエンティティを取得するには：

```python
filter = 'description IS NOT NULL AND price > 10'
```

### null値を持つJSONフィールド\{#json-fields-with-null-values}

Zilliz Cloudでは、null値を含むJSONフィールドをフィルタリングできます。JSONフィールドは以下の方法でnullであると見なされます：

- 全体のJSONオブジェクトが明示的にNone（null）に設定されている、例：`{"metadata": None}`。

- JSONフィールド自体がエンティティから完全に欠落している。

<Admonition type="info" icon="📘" title="ノート">

<p>JSONオブジェクト内のいくつかの要素がnullである場合（例えば個々のキー）、フィールドは依然としてnullではないと見なされます。たとえば、<code>\{"metadata": \{"category": None, "price": 99.99}}</code>は<code>category</code>キーがnullでもnullとしては扱われません。</p>

</Admonition>

Zilliz Cloudがnull値を持つJSONフィールドをどのように処理するかをさらに説明するために、JSONフィールド`metadata`を持つ以下のサンプルデータを検討してください：

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
  {  # JSONフィールド`metadata`が完全に欠落
      "pk": 3,
      "embedding": [0.91, 0.18, 0.23]
  },
  {
      "metadata": {"category": None, "price": 99.99, "brand": "BrandA"}, # 個々のキー値がnull
      "pk": 4,
      "embedding": [0.56, 0.38, 0.21]
  }
]
```

**例1: metadataがnullであるエンティティを取得する**

`metadata`フィールドが欠落しているか明示的にNoneに設定されているエンティティを検索するには：

```python
filter = 'metadata IS NULL'

# 例の出力:
# data: [
#     "{'metadata': None, 'pk': 2}",
#     "{'metadata': None, 'pk': 3}"
# ]
```

**例2: metadataがnullでないエンティティを取得する**

`metadata`フィールドがnullでないエンティティを検索するには：

```python
filter = 'metadata IS NOT NULL'

# 例の出力:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

### null値を持つARRAYフィールド\{#array-fields-with-null-values}

Zilliz Cloudでは、null値を含むARRAYフィールドをフィルタリングできます。ARRAYフィールドは以下の方法でnullであると見なされます：

- 全体のARRAYフィールドが明示的にNone（null）に設定されている、例："tags": None。

- ARRAYフィールドがエンティティから完全に欠落している。

<Admonition type="info" icon="📘" title="ノート">

<p>ARRAYフィールドには部分的なnull値を含めることができません。ARRAYフィールド内のすべての要素は同じデータ型でなければなりません。詳細については、[Arrayフィールド](./use-array-fields)を参照してください。</p>

</Admonition>

Zilliz Cloudがnull値を持つARRAYフィールドをどのように処理するかをさらに説明するために、ARRAYフィールド`tags`を持つ以下のサンプルデータを検討してください：

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
  {  # tagsフィールドが完全に欠落
      "ratings": [9, 5],
      "pk": 3,
      "embedding": [0.18, 0.11, 0.23]
  }
]
```

**例1: tagsがnullであるエンティティを取得する**

`tags`フィールドが欠落しているか明示的に`None`に設定されているエンティティを取得するには：

```python
filter = 'tags IS NULL'

# 例の出力:
# data: [
#     "{'tags': None, 'ratings': [4, 5], 'embedding': [0.78, 0.91, 0.23], 'pk': 2}",
#     "{'tags': None, 'ratings': [9, 5], 'embedding': [0.18, 0.11, 0.23], 'pk': 3}"
# ]
```

**例2: tagsがnullでないエンティティを取得する**

`tags`フィールドがnullでないエンティティを取得するには：

```python
filter = 'tags IS NOT NULL'

# 例の出力:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

## JSONフィールドおよびARRAYフィールドで基本演算子を使用する際のヒント\{#tips-on-using-basic-operators-with-json-and-array-fields}

Zilliz Cloudクラスターの基本演算子はスカラー型フィールドに適用できるだけでなく、JSONおよびARRAYフィールド内のキーおよびインデックスに対しても効果的に使用できます。

たとえば、`price`、`model`、および`tags`などの複数のキーを含む`product`フィールドがある場合、常にキーを直接参照してください：

```python
filter = 'product["price"] > 1000'
```

記録された気温の配列内で最初の気温が特定の値を超えるレコードを検索するには：

```python
filter = 'history_temperatures[0] > 30'
```

## 結論\{#conclusion}

Zilliz Cloudは、データをフィルタリングおよびクエリするための柔軟性を提供する一連の基本演算子を提供します。比較、範囲、算術、および論理演算子を組み合わせることで、強力なフィルター式を作成し、検索結果を絞り込み、必要なデータを効率的に取得できます。

## FAQ\{#faq}

**フィルター条件内のマッチ値リストの長さに制限はありますか（例：filter='color in ["red", "green", "blue"]'）？リストが長すぎる場合どうすればよいですか？**

Zilliz Cloudでは、フィルター条件内のマッチ値リストの長さに制限は設けていません。ただし、非常に長いリストはクエリ性能に大幅な影響を与える可能性があります。
フィルター条件に多くのマッチ値のリストや多くの要素を含む複雑な式を含む場合は、クエリ性能を向上させるために[フィルター テンプレート](./filtering-templating)の使用を推奨します。