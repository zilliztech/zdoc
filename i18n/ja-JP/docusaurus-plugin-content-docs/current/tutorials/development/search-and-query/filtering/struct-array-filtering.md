---
title: "StructArray 演算子 | Cloud"
slug: /struct-array-filtering
sidebar_label: "StructArray"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray フィールドでのスカラーフィルタリングは、StructArray フィールド内のスカラーサブフィールドに対する述語を評価します。このページは、StructArray フィールドでのスカラーフィルタリング、および `elementfilter` と `MATCH` 演算子ファミリーの構文リファレンスとして利用できます。 | Cloud"
type: origin
token: VmGMwsTliiGZdFkzzeBckRNlnCh
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray 演算子

StructArray フィールドでのスカラーフィルタリングは、StructArray フィールド内のスカラーサブフィールドに対する述語を評価します。このページは、StructArray フィールドでのスカラーフィルタリング、および `element_filter` と `MATCH_*` 演算子ファミリーの構文リファレンスとして利用できます。

StructArray は以下のスカラーフィルタリングパターンをサポートします。

| スカラーフィルタリングパターン | 主な目的 | 結果の挙動 |
| --- | --- | --- |
| StructArray サブフィールドアクセス | 指定したインデックス（添字）にある指定サブフィールドの値がスカラー述語を満たすかどうかに基づいて entity を選択します。 | entity レベルのフィルタリング。 |
| `ARRAY_CONTAINS` | 指定した値がサブフィールド内に存在するかどうかに基づいて entity を選択します。 | entity レベルのフィルタリング。 |
| `ARRAY_LENGTH` | 指定したサブフィールド内の要素数が式に一致するかどうかに基づいて entity を選択します。 | entity レベルのフィルタリング。 |
| `element_filter` | スカラー述語を満たす Struct 要素を一致させます。 | 要素レベル検索では、一致したヒットに要素オフセットを含めることができます。行レベルのクエリまたはフィルタ付き検索では、結果の形状は API と出力フィールドに依存します。 |
| `MATCH_*` | スカラー述語を満たす Struct 要素の数に基づいて entity を選択します。 | entity レベルのフィルタリング。これらの演算子自体では要素オフセットは返しません。 |

StructArray 演算子ではスカラーサブフィールドを使用してください。vector サブフィールドは vector 検索パスで使用され、スカラー述語の入力にはなりません。

## どの演算子を使うべきか\{#when-to-use-which-operator}

| 目的 | 使用するもの |
| --- | --- |
| 要素レベル vector 検索を、スカラー条件に一致する要素のみに制約する。 | `element_filter` |
| 同じ Struct 要素内で複数のスカラー条件を一致させる。 | `element_filter` |
| struct サブフィールドに指定した値が含まれる entity のみを返す。 | `ARRAY_CONTAINS` |
| struct サブフィールドが指定した数の要素を持つ entity のみを返す。 | `ARRAY_LENGTH` |
| 特定の Struct 要素が述語を満たす entity のみを返す。 | StructArray インデックス（添字）アクセス |
| 少なくとも 1 つの Struct 要素が述語を満たす entity のみを返す。 | `MATCH_ANY` |
| すべての Struct 要素が述語を満たす entity のみを返す。 | `MATCH_ALL`,<br/>StructArray サブフィールドアクセス, |
| 少なくとも、最大で、またはちょうど `N` 個の Struct 要素が述語を満たす entity のみを返す。 | `MATCH_LEAST`、`MATCH_MOST`、または `MATCH_EXACT` |

## データ例\{#example-data}

以下のセクションの例では、`chunks` フィールドが以下のように設定された entity（**Entity A** と **Entity B**）を使用します。

```json
// chunks field in an entity (Entity A)
"chunks": [
    {
        ...,
        "section": "index",
        "quality_score": 0.74,
        "has_code": true
        ...
    },
    {
        ...,
        "section": "index",
        "quality_score": 0.72,
        "has_code": true
        ...
    },
    {
        ...,
        "section": "index",
        "quality_score": 0.83,
        "has_code": true
        ...
    },
    {
        ...,
        "section": "index",
        "quality_score": 0.87,
        "has_code": true
        ...
    }
],

// chunks field in another entity (Entity B)
"chunks": [
    {
        ...,
        "section": "index",
        "quality_score": 0.95,
        "has_code": true
        ...
    },
    {
        ...,
        "section": "index",
        "quality_score": 0.92,
        "has_code": true
        ...
    },
    {
        ...,
        "section": "index",
        "quality_score": 0.97,
        "has_code": true
        ...
    }
],
```

## サブフィールドアクセス\{#subfield-access}

スカラーフィルタリング式では StructArray サブフィールドを使用して、すべての struct 内、または配列内の特定の struct 内のサブフィールド値に基づいて entity を選択できます。

以下のフィルタリング式を見てみましょう。

```python
chunks[0][quality_score] > 0.8
```

このフィルタ式は、entity 内の StructArray フィールドの**最初の要素**にある `quality_score` サブフィールドの値が 0.8 を超えている場合、その entity が一致することを示します。

[データ例](./struct-array-filtering#example-data) の 2 つの entity では、この式に一致するのは **Entity B** のみです。

スカラーフィルタリングでサブフィールドアクセスを使用する場合、サブフィールド要素自体にはアクセスできないことに注意してください。

```python
❌ chunks[quality_score][0] > 0.8
```

## ARRAY 演算子\{#array-operators}

Array フィールドのサブタイプとして、StructArray も `ARRAY_CONTAIN` や `ARRAY_LENGTH` などの ARRAY 演算子をサポートします。

以下の式を見てみましょう。

```python
ARRAY_CONTAINS(chunks[quality_score], 0.74)
```

上記の式は、entity のすべての要素にまたがる `quality_score` サブフィールドのいずれかが `0.74` の値を持つ場合、その entity が一致することを示します。[データ例](./struct-array-filtering#example-data) の 2 つの entity では、この式に一致するのは **Entity A** のみです。

```python
ARRAY_LENGTH(chunks[quality_score], 3)
```

上記の式は、`quality_score` サブフィールドが 3 つの値を含む場合、その entity が一致することを示します。[データ例](./struct-array-filtering#example-data) の 2 つの entity では、この式に一致するのは **Entity B** のみです。

## Element filter\{#element-filter}

`element_filter(structArrayField, predicate)` を使用して、StructArray フィールド内の Struct 要素を一致させます。

述語の内部では、現在の Struct 要素のスカラーサブフィールドを参照するために `$[subfield]` を使用します。

```python
element_filter(chunks, $[section] == "index")
```

[データ例](./struct-array-filtering#example-data) の 2 つの entity では、この式は両方の entity に一致します。

述語の内部で複数の条件を使用する場合、すべての `$[subfield]` 参照は同じ Struct 要素に適用されます。

```python
element_filter(chunks, $[section] == "index" && $[quality_score] > 0.9)
```

[データ例](./struct-array-filtering#example-data) の 2 つの entity では、この式に一致するのは **Entity B** のみです。

entity レベルの述語を `element_filter` と組み合わせる場合は、`element_filter` を式の末尾に配置してください。

```python
# Correct
category == "index" && element_filter(chunks, $[quality_score] > 0.9)

# Incorrect
element_filter(chunks, $[quality_score] > 0.9) && category == "index"
```

`element_filter` はフィルタ式内に 1 回しか記述できません。別の `element_filter` の中に `element_filter` や `MATCH_*` をネストしないでください。

## Match ファミリー演算子\{#match-family-operators}

`MATCH_*` 演算子は、ある entity を述語を満たす Struct 要素の数に基づいて選択する必要がある場合に使用します。

| 演算子 | 意味 |
| --- | --- |
| `MATCH_ANY(field, predicate)` | 少なくとも 1 つの Struct 要素が述語を満たします。 |
| `MATCH_ALL(field, predicate)` | すべての Struct 要素が述語を満たします。 |
| `MATCH_LEAST(field, predicate, threshold=N)` | 少なくとも `N` 個の Struct 要素が述語を満たします。 |
| `MATCH_MOST(field, predicate, threshold=N)` | 高々 `N` 個の Struct 要素が述語を満たします。 |
| `MATCH_EXACT(field, predicate, threshold=N)` | ちょうど `N` 個の Struct 要素が述語を満たします。 |

`MATCH_ANY` と `element_filter` は、どちらも少なくとも 1 つの Struct 要素が述語を満たすことを表現できます。行レベルのフィルタリングだけが必要な場合は `MATCH_ANY` を使用してください。どの Struct 要素が要素レベル vector 検索に参加するかをフィルタリングするなど、要素レベルの制約が必要な場合は `element_filter` を使用してください。

### MATCH_ANY\{#matchany}

`MATCH_ANY` は、StructArray 内の少なくとも 1 つの要素が述語を満たす場合に `true` と評価されます。

```python
MATCH_ANY(chunks, $[section] == "index")
```

空の StructArray に対しては、`MATCH_ANY` は `false` を返します。

[データ例](./struct-array-filtering#example-data) の 2 つの entity では、この式は両方の entity に一致します。

### MATCH_ALL\{#matchall}

`MATCH_ALL` は、StructArray 内のすべての要素が述語を満たす場合に `true` と評価されます。

```python
MATCH_ALL(chunks, $[has_code] == true)
```

空の StructArray に対しては、`MATCH_ALL` は `true` を返します。

[データ例](./struct-array-filtering#example-data) の 2 つの entity では、この式は両方の entity に一致します。

### MATCH_LEAST\{#matchleast}

`MATCH_LEAST` は、述語を満たす要素数が `threshold` 以上の場合に `true` と評価されます。

```python
MATCH_LEAST(chunks, $[quality_score] > 0.9, threshold=2)
```

`MATCH_LEAST` では、`threshold` は正の整数でなければなりません。

[データ例](./struct-array-filtering#example-data) の 2 つの entity では、この式に一致するのは **Entity B** のみです。

### MATCH_MOST\{#matchmost}

`MATCH_MOST` は、述語を満たす要素数が `threshold` 以下の場合に `true` と評価されます。

```python
MATCH_MOST(chunks, $[has_code] == true, threshold=1)
```

`MATCH_MOST` では、`threshold` は 0 または正の整数にできます。

[データ例](./struct-array-filtering#example-data) の 2 つの entity では、この式にはどちらも一致しません。

### MATCH_EXACT\{#matchexact}

`MATCH_EXACT` は、述語を満たす要素数が `threshold` とちょうど等しい場合に `true` と評価されます。

```python
MATCH_EXACT(chunks, $[section] == "filter", threshold=1)
```

`MATCH_EXACT` では、`threshold` は 0 または正の整数にできます。

[データ例](./struct-array-filtering#example-data) の 2 つの entity では、この式にはどちらも一致しません。

## サポートされる述語\{#supported-predicates}

`$[...]` 構文は、現在の Struct 要素のスカラー値を表します。述語のサポートは、スカラーサブフィールドの型に依存します。

| サブフィールド型 | 要素レベル述語のサポート |
| --- | --- |
| `BOOL` | `$[has_code] == true` や `!($[has_code] == true)` などのスカラー述語。`$[has_code]` のような裸の boolean 式は避けてください。 |
| `INT8`, `INT16`, `INT32`, `INT64` | 比較、連鎖範囲、`in`、`not in`、`+`、`-`、`*`、`/`、または `%` を使った算術式の後に比較を行う式、および論理結合。 |
| `FLOAT`, `DOUBLE` | 比較、連鎖範囲、`in`、`not in`、`+`、`-`、`*`、または `/` を使った算術式の後に比較を行う式、および論理結合。浮動小数点サブフィールドでは `%` 演算子はサポートされません。 |
| `VARCHAR` | 文字列比較、連鎖範囲、`in`、`not in`、`like`、`=&#126;`、`!&#126;`、および論理結合。 |
| Vector サブフィールド | `$[...]` スカラー述語入力としてはサポートされません。代わりに、EmbeddingList search または要素レベル vector 検索を通じて vector サブフィールドを使用してください。 |

`&&`、`||`、`!` などの論理演算子は述語式に適用されます。たとえば、`!$[has_code]` ではなく `!($[has_code] == true)` と記述してください。

## サポートされない述語\{#unsupported-predicates}

要素レベルの `$[...]` 述語では、以下はサポートされません。

- `text_match(field, "...")` や `phrase_match(field, "...")` などのテキスト一致関数。

- JSON パス構文、JSON パスに対する `exists`、または `json_contains`、`json_contains_all`、`json_contains_any` などの JSON 関数。

- `array_contains`、`array_contains_all`、`array_contains_any`、`array_length` などの配列コンテナ関数。

- `$[subfield] is null` または `$[subfield] is not null`。

- Geometry / GIS 関数。

- Timestamptz 式。

- `random_sample(...)`。

- フィールドレベル vector 述語。

- 特定の関数シグネチャと実行パスが StructArray 要素レベル述語を明示的にサポートしている場合を除き、汎用フィルタ関数呼び出し。

## 構文ルール\{#syntax-rules}

- `MATCH_*` 演算子名では大文字小文字は区別されません。

- `$[subfield]` は `element_filter` または `MATCH_*` 述語の内部でのみ使用してください。

- `$[subfield]` を JSON パス、配列コンテナ、または vector フィールド参照として使用しないでください。

- 別の StructArray 演算子の中に `element_filter` や `MATCH_*` をネストしないでください。

- `MATCH_LEAST`、`MATCH_MOST`、`MATCH_EXACT` では、名前付きの `threshold=N` を使用してください。

- 空の StructArray に対する `MATCH_ANY` は `false` を返します。

- 空の StructArray に対する `MATCH_ALL` は `true` を返します。

## 参考情報\{#see-also}

- [StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays)

- [StructArray を使った基本 vector 検索](./search-with-struct-array)

- [StructArray フィールドにインデックスを付与する](./index-struct-array)

- [StructArray の制限](./struct-array-limits)

