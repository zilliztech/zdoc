---
title: "基本演算子 | BYOC"
slug: /basic-filtering-operators
sidebar_label: "基本演算子"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、データを効率的にフィルタリングおよびクエリするための豊富な基本演算子セットを提供します。これらの演算子により、スカラーフィールド、数値計算、論理条件などに基づいて検索条件を絞り込むことができます。これらの演算子の使用方法を理解することは、正確なクエリを構築し、検索の効率を最大化するために重要です。 | BYOC"
type: origin
token: CGHQwa6bkiXAXnkTh6acH9w9nWb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - filter
  - filtering expressions
  - filtering
  - basic operators
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb

---

import Admonition from '@theme/Admonition';


# 基本演算子

Zilliz Cloudは、データを効率的にフィルタリングおよびクエリするための豊富な基本演算子セットを提供します。これらの演算子により、スカラーフィールド、数値計算、論理条件などに基づいて検索条件を絞り込むことができます。これらの演算子の使用方法を理解することは、正確なクエリを構築し、検索の効率を最大化するために重要です。

## 比較演算子{#comparison-operators}

比較演算子は、等号、不等号、体格に基づいてデータをフィルタリングするために使用されます。数値フィールドとテキストフィールドに適用されます。

### サポートされる比較演算子:{#supported-comparison-operators}

- `==`(等しい)

- `!=`(等しくない)

- `>`（より大きい）

- `<`(より少ない)

- `>=`(以上または等しい)

- `<=`(以下または等しい)

### 例1: Equal To(`==`)でフィルタリングする{#example-1-filtering-with-equal-to}

ステータスという名前のフィールドがあり、`ステータス`が「アクティブ」であるすべてのエンティティを検索したいとします。等号演算子`==を使用することができます。`

```python
filter = 'status == "active"'
```

### 例2: Not Equal To(`!=`)でフィルタリングする{#example-2-filtering-with-not-equal-to}

「非アクティブ」でない`状態`のエンティティを検索するには:

```python
filter = 'status != "inactive"'
```

### 例3:より大きい値(`>)`でフィルタリングする{#example-3-filtering-with-greater-than-greater}

大なり30の`年齢`を持つすべてのエンティティを見つけたい場合:

```python
filter = 'age > 30'
```

### 例4: Less Thanでのフィルタリング{#example-4-filtering-with-less-than}

価格が100未満のエンティティ`を`検索するには:

```python
filter = 'price < 100'
```

### 例5:「より大きい」または「等しい」（`>=`）でフィルタリングする{#example-5-filtering-with-greater-than-or-equal-to-greater}

4以上の`レーティング`を持つすべてのエンティティを見つけたい場合:

```python
filter = 'rating >= 4'
```

### 例6: Less ThanまたはEqual Toでフィルタリングする{#example-6-filtering-with-less-than-or-equal-to}

10%以下の`ディスカウント`を持つエンティティを検索するには:

```python
filter = 'discount <= 10'
```

## レンジ演算子{#range-operators}

範囲演算子は、特定のセットまたは値の範囲に基づいてデータをフィルタリングするのに役立ちます。

### 対応する範囲演算子:{#supported-range-operators}

- `IN`:特定のセットまたは範囲内の値を一致させるために使用されます。

- `LIKE`:パターンに一致するために使用されます(主にテキストフィールド用)。

### 例1:`IN`を使用して複数の値を一致させる{#example-1-using-in-to-match-multiple-values}

「赤」、「緑」、「青」のいずれかの`色`を持つすべての図形を検索したい場合:

```python
filter = 'color in ["red", "green", "blue"]'
```

これは、値のリストのメンバーシップを確認する場合に便利です。

### 例2:パターンマッチングに`LIKE`を使用する{#example-2-using-like-for-pattern-matching}

文字列フィールドでのパターンマッチングには、`LIKE`演算子が使用されます。テキスト内の異なる位置にある部分文字列を**接頭辞**、**中置**き、または**接尾辞**として一致させることができます。`LIKE`演算子は、`%`記号をワイルドカードとして使用し、ゼロを含む任意の数の文字に一致させることができます。

### プレフィックスマッチ(始まり){#prefix-match-starts-with}

与えられたパターンで始まる文字列の**プレフィックス**マッチを実行するには、パターンを先頭に置き、`%`を使用してそれに続く任意の文字に一致させることができます。例えば、`名前`が「Prod」で始まるすべての製品を検索するには:

```python
filter = 'name LIKE "Prod%"'
```

これは、「Product A」、「Product B」など、名前が「Prod」で始まる製品に一致します。

### 接尾辞一致(で終わる){#suffix-match-ends-with}

与えられたパターンで終わる文字列の**接尾辞**が一致する場合、パターンの先頭に`%`記号を配置します。例えば、`名前`が「XYZ」で終わるすべての製品を検索するには:

```python
filter = 'name LIKE "%XYZ"'
```

これは、「ProductXYZ」、「SampleXYZ」など、名前が「XYZ」で終わる製品に一致します。

### 中置一致（含む）{#infix-match-contains}

パターンが文字列のどこにでも現れる**中置**一致を行うには、パターンの先頭と末尾の両方に`%`記号を置くことができます。例えば、`名前`に「Pro」という単語が含まれるすべての製品を検索するには:

```python
filter = 'name LIKE "%Pro%"'
```

これは、"Product"、"ProLine"、"SuperPro"など、名前に部分文字列"Pro"が含まれる製品に一致します。

## 算術演算子{#arithmetic-operators}

算術演算子を使用すると、数値フィールドを含む計算に基づいて条件を作成できます。

### サポートされる演算子:{#supported-arithmetic-operators}

- `+`(加算)

- `-`(引き算)

- `*`（掛け算）

- `/`（ディビジョン）

- `%`(モジュラス)

- `**`（エキスポンシエーション）

### 例1:モジュラス（`%`）を使用する{#example-1-using-modulus-percent}

2で割り切れる`ID`を持つエンティティを見つけるには:

```python
filter = 'id % 2 == 0'
```

### 例2: Exponentiation`(**)`を使用する{#example-2-using-exponentiation}

2の累乗の`価格`が大なり1000であるエンティティを見つけるには:

```python
filter = 'price ** 2 > 1000'
```

## 論理演算子{#logical-operators}

論理演算子は、複数の条件をより複雑なフィルター式に結合するために使用されます。これらには、`AND`、`OR`、`NOT`が含まれます。

### サポートされる論理演算子:{#supported-logical-operators}

- `AND`:すべてtrueである必要がある複数の条件を組み合わせます。

- `OR`:少なくとも1つがtrueでなければならない条件を組み合わせます。

- `NOT`:条件を否定します。

### 例1:`AND`を使用して条件を結合する{#example-1-using-and-to-combine-conditions}

以下のように、`価格`が100で`在庫`が50である商品を検索します。

```python
filter = 'price > 100 AND stock > 50'
```

### 例2:`OR`を使用して条件を結合する{#example-2-using-or-to-combine-conditions}

「赤」または「青」のいずれかの`色`のすべての製品を検索するには:

```python
filter = 'color == "red" OR color == "blue"'
```

### 例3:`NOT`を使用して条件を除外する{#example-3-using-not-to-exclude-a-condition}

「緑」以外の`色`のすべての製品を検索するには:

```python
filter = 'NOT color == "green"'
```

## IS NULL演算子とIS NOT NULL演算子{#is-null-and-is-not-null-operators}

`IS NULL`および`IS NOT NULL`演算子は、NULL値(データの欠如)が含まれているかどうかに基づいてフィールドをフィルタリングするために使用されます。

- `IS NULL`:特定のフィールドにnull値が含まれているエンティティを識別します。

- `IS NOT NULL`:特定のフィールドにnull以外の値が含まれているエンティティを識別します。

<Admonition type="info" icon="📘" title="ノート">

<p>演算子は大文字と小文字を区別しないため、<code>IS NULL</code>または<code>is null</code>、<code>IS NOT NULL</code>または<code>is not null</code>を使用できます。</p>

</Admonition>

### Null値を持つ正規スカラーフィールド{#regular-scalar-fields-with-null-values}

Zilliz Cloudnull値を持つ文字列や数値などの通常のスカラーフィールドでフィルタリングを許可します。

<Admonition type="info" icon="📘" title="ノート">

<p><code>VARCHAR</code>フィールドでは、空の文字列<code>""</code>はnull値として扱われません。</p>

</Admonition>

`description`フィールドがnullのエンティティを取得するには:

```python
filter = 'description IS NULL'
```

`description`フィールドがnullでないエンティティを取得するには:

```python
filter = 'description IS NOT NULL'
```

`description`フィールドがnullでなく、`price`フィールドが10より大きいエンティティを取得するには:

```python
filter = 'description IS NOT NULL AND price > 10'
```

### Null値を持つJSONフィールド{#json-fields-with-null-values}

Zilliz Cloudnull値を含むJSONフィールドをフィルタリングすることができます。JSONフィールドは、以下の方法でnullとして扱われます。

- JSONオブジェクト全体が明示的にNone(null)に設定されています。例えば、`{"metadata": None}`。

- JSONフィールド自体がエンティティから完全に欠落しています。

<Admonition type="info" icon="📘" title="ノート">

<p>JSONオブジェクト内のいくつかの要素がnullである場合（例えば、個別のキー）、そのフィールドはnullではないと見なされます。例えば、<code>\{"metadata":\{"category": None,"price": 99.99}}</code>は、<code>category</code>キーがnullであってもnullとして扱われません。</p>

</Admonition>

その方法をさらに説明するためにZilliz Cloudnull値を持つJSONフィールドを処理する場合、JSONフィールドの`metadata`を持つ次のサンプルデータを検討してください。

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

**例1:メタデータがnullのエンティティを取得する**

`metadata`フィールドが欠落しているか、明示的にNoneに設定されているエンティティを検索するには:

```python
filter = 'metadata IS NULL'

# Example output:
# data: [
#     "{'metadata': None, 'pk': 2}",
#     "{'metadata': None, 'pk': 3}"
# ]
```

**例2:メタデータがnullでないエンティティを取得する**

`metadata`フィールドがnullでないエンティティを検索するには:

```python
filter = 'metadata IS NOT NULL'

# Example output:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

### NULL値を持つARRAYフィールド{#array-fields-with-null-values}

Zilliz Cloudnull値を含むARRAYフィールドのフィルタリングを許可します。ARRAYフィールドは、次の方法でnullとして扱われます。

- ARRAYフィールド全体が明示的にNone(null)に設定されています。例えば、`"tags": None`。

- エンティティからARRAYフィールドが完全に欠落しています。

<Admonition type="info" icon="📘" title="ノート">

<p>ARRAYフィールドには、すべての要素が同じデータ型である必要があるため、部分的なNULL値を含めることはできません。詳細については、<a href="./use-array-fields">配列フィールド</a>を参照してください。</p>

</Admonition>

その方法をさらに説明するためにZilliz Cloudnull値を持つARRAYフィールドを処理する場合、ARRAYフィールド`tags`を持つ次のサンプルデータを考慮してください。

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

**例1:`tags`がnullのエンティティを取得する**

`tags`フィールドが欠落しているか、明示的に`None`に設定されているエンティティを取得するには:

```python
filter = 'tags IS NULL'

# Example output:
# data: [
#     "{'tags': None, 'ratings': [4, 5], 'embedding': [0.78, 0.91, 0.23], 'pk': 2}",
#     "{'tags': None, 'ratings': [9, 5], 'embedding': [0.18, 0.11, 0.23], 'pk': 3}"
# ]
```

**例2:`tags`がnullでないエンティティを取得する**

`tags`フィールドがnullでないエンティティを取得するには:

```python
filter = 'tags IS NOT NULL'

# Example output:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

## JSONとARRAYフィールドで基本演算子を使用するためのヒント{#tips-on-using-basic-operators-with-json-and-array-fields}

Zilliz Cloudクラスタの基本演算子は汎用性があり、スカラーフィールドに適用できますが、JSONフィールドとARRAYフィールドのキーとインデックスでも効果的に使用できます。

たとえば、`product`フィールドに`price`、`model`、`tags`などの複数のキーが含まれている場合は、常にキーを直接参照します。

```python
filter = 'product["price"] > 1000'
```

記録された温度の配列の最初の温度が特定の値を超えるレコードを検索するには、次のようにします。

```python
filter = 'history_temperatures[0] > 30'
```

## 結論として{#conclusion}

Zilliz Cloudは、データのフィルタリングとクエリに柔軟性を与える基本演算子の範囲を提供しています。比較、範囲、算術、論理演算子を組み合わせることで、強力なフィルタ式を作成して、検索結果を絞り込み、必要なデータを効率的に取得できます。