---
title: "StructArray 演算子 | BYOC"
slug: /struct-array-filtering
sidebar_label: "StructArray"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray フィールドでのスカラー フィルタリングでは、StructArray フィールド内のスカラー サブフィールドに対する述語を評価します。このページは、StructArray フィールドでのスカラー フィルタリング、および `elementfilter` と `MATCH` 演算子ファミリーの構文リファレンスとして利用できます。 | BYOC"
type: origin
token: VmGMwsTliiGZdFkzzeBckRNlnCh
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray 演算子

StructArray フィールドでのスカラー フィルタリングでは、StructArray フィールド内のスカラー サブフィールドに対する述語を評価します。このページは、StructArray フィールドでのスカラー フィルタリング、および `element_filter` と `MATCH_*` 演算子ファミリーの構文リファレンスとして利用できます。

StructArray は、次のスカラー フィルタリング パターンをサポートしています。

| スカラー フィルタリング パターン | 主な目的 | 結果の動作 |
| --- | --- | --- |
| StructArray サブフィールド アクセス | 指定したインデックス（添字）にある指定サブフィールドの値がスカラー述語を満たすかどうかに基づいて entity を選択します。 | entity レベルのフィルタリング。 |
| `ARRAY_CONTAINS` | 指定した値がサブフィールド内に存在するかどうかに基づいて entity を選択します。 | entity レベルのフィルタリング。 |
| `ARRAY_LENGTH` | 指定したサブフィールド内の要素数が式に一致するかどうかに基づいて entity を選択します。 | entity レベルのフィルタリング。 |
| `element_filter` | スカラー述語を満たす Struct 要素を照合します。 | 要素レベル検索では、一致したヒットに要素オフセットが含まれる場合があります。行レベルの query またはフィルタ付き検索では、結果の形状は API と出力フィールドに依存します。 |
| `MATCH_*` | 何個の Struct 要素がスカラー述語を満たすかに基づいて entity を選択します。 | entity レベルのフィルタリング。これらの演算子自体は要素オフセットを返しません。 |

StructArray 演算子ではスカラー サブフィールドを使用します。vector サブフィールドは vector 検索パスで使用され、スカラー述語の入力にはなりません。

## どの演算子を使うべきか\{#when-to-use-which-operator}

| 目的 | 使用するもの |
| --- | --- |
| スカラー条件に一致する要素に要素レベルの vector 検索を制限する。 | `element_filter` |
| 同じ Struct 要素内で複数のスカラー条件を一致させる。 | `element_filter` |
| struct サブフィールドが指定した値を含む entity のみを返す。 | `ARRAY_CONTAINS` |
| struct サブフィールドが指定した数の要素を持つ entity のみを返す。 | `ARRAY_LENGTH` |
| 特定の Struct 要素が述語を満たす entity のみを返す。 | StructArray インデックス（添字）アクセス |
| 少なくとも 1 つの Struct 要素が述語を満たす entity のみを返す。 | `MATCH_ANY` |
| すべての Struct 要素が述語を満たす entity のみを返す。 | `MATCH_ALL`,<br/>StructArray サブフィールド アクセス, |
| 少なくとも、最大で、またはちょうど `N` 個の Struct 要素が述語を満たす entity のみを返す。 | `MATCH_LEAST`, `MATCH_MOST`, または `MATCH_EXACT` |

## 例のデータ\{#example-data}

以下のセクションの例では、`chunks` フィールドが次のように設定された entity（**Entity A** と **Entity B**）を使用します。

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

## サブフィールド アクセス\{#subfield-access}

スカラー フィルタリング式で StructArray サブフィールドを使用すると、配列内のすべての struct、または配列内の特定の struct におけるサブフィールドの値に基づいて entity を選択できます。

次のフィルタリング式を考えてみましょう。

```python
chunks[0][quality_score] > 0.8
```

このフィルタ式は、entity 内の StructArray フィールドの**最初の要素**にある `quality_score` サブフィールドの値が 0.8 を超える場合に、その entity が一致することを示します。 

[例のデータ](./struct-array-filtering#example-data) の 2 つの entity では、この式に一致するのは **Entity B** のみです。

スカラー フィルタリングでサブフィールド アクセスを使用する場合、サブフィールド要素自体にはアクセスできない点に注意してください。

```python
❌ chunks[quality_score][0] > 0.8
```

## ARRAY 演算子\{#array-operators}

Array フィールドのサブタイプとして、StructArray も `ARRAY_CONTAIN` や `ARRAY_LENGTH` などの ARRAY 演算子をサポートします。

次の式を考えてみましょう。

```python
ARRAY_CONTAINS(chunks[quality_score], 0.74)
```

上記の式は、entity のすべての要素にわたるいずれかの `quality_score` サブフィールドの値が `0.74` である場合に、その entity が一致することを示します。[例のデータ](./struct-array-filtering#example-data) の 2 つの entity では、この式に一致するのは **Entity A** のみです。

```python
ARRAY_LENGTH(chunks[quality_score], 3)
```

上記の式は、`quality_score` サブフィールドに 3 つの値が含まれている場合に、その entity が一致することを示します。[例のデータ](./struct-array-filtering#example-data) の 2 つの entity では、この式に一致するのは **Entity B** のみです。

## 要素フィルタ\{#element-filter}

`element_filter(structArrayField, predicate)` を使用すると、StructArray フィールド内の Struct 要素を照合できます。

述語の内部では、現在の Struct 要素のスカラー サブフィールドを参照するために `$[subfield]` を使用します。

```python
element_filter(chunks, $[section] == "index")
```

[例のデータ](./struct-array-filtering#example-data) の 2 つの entity では、この式は両方の entity に一致します。

述語内で複数の条件を使用する場合、すべての `$[subfield]` 参照は同じ Struct 要素に適用されます。

```python
element_filter(chunks, $[section] == "index" && $[quality_score] > 0.9)
```

[例のデータ](./struct-array-filtering#example-data) の 2 つの entity では、この式に一致するのは **Entity B** のみです。

entity レベルの述語を `element_filter` と組み合わせる場合は、式の末尾に `element_filter` を配置してください。

```python
# Correct
category == "index" && element_filter(chunks, $[quality_score] > 0.9)

# Incorrect
element_filter(chunks, $[quality_score] > 0.9) && category == "index"
```

`element_filter` はフィルタ式内に 1 回だけ記述できます。別の `element_filter` の中に `element_filter` や `MATCH_*` をネストしないでください。

## Match ファミリー演算子\{#match-family-operators}

entity を、何個の Struct 要素が述語を満たすかに基づいて選択する必要がある場合は、`MATCH_*` 演算子を使用します。

| 演算子 | 意味 |
| --- | --- |
| `MATCH_ANY(field, predicate)` | 少なくとも 1 つの Struct 要素が述語を満たします。 |
| `MATCH_ALL(field, predicate)` | すべての Struct 要素が述語を満たします。 |
| `MATCH_LEAST(field, predicate, threshold=N)` | 少なくとも `N` 個の Struct 要素が述語を満たします。 |
| `MATCH_MOST(field, predicate, threshold=N)` | 最大で `N` 個の Struct 要素が述語を満たします。 |
| `MATCH_EXACT(field, predicate, threshold=N)` | ちょうど `N` 個の Struct 要素が述語を満たします。 |

`MATCH_ANY` と `element_filter` はどちらも、「少なくとも 1 つの Struct 要素が述語を満たす」ことを表現できます。行レベルのフィルタリングのみが必要な場合は `MATCH_ANY` を使用してください。どの Struct 要素が要素レベルの vector 検索に参加するかをフィルタするなど、要素レベルの制約が必要な場合は `element_filter` を使用してください。

### MATCH_ANY\{#matchany}

`MATCH_ANY` は、StructArray 内の少なくとも 1 つの要素が述語を満たす場合に `true` と評価されます。

```python
MATCH_ANY(chunks, $[section] == "index")
```

空の StructArray に対しては、`MATCH_ANY` は `false` を返します。

[例のデータ](./struct-array-filtering#example-data) の 2 つの entity では、この式は両方の entity に一致します。

### MATCH_ALL\{#matchall}

`MATCH_ALL` は、StructArray 内のすべての要素が述語を満たす場合に `true` と評価されます。

```python
MATCH_ALL(chunks, $[has_code] == true)
```

空の StructArray に対しては、`MATCH_ALL` は `true` を返します。

[例のデータ](./struct-array-filtering#example-data) の 2 つの entity では、この式は両方の entity に一致します。

### MATCH_LEAST\{#matchleast}

`MATCH_LEAST` は、述語を満たす要素数が `threshold` 以上である場合に `true` と評価されます。

```python
MATCH_LEAST(chunks, $[quality_score] > 0.9, threshold=2)
```

`MATCH_LEAST` では、`threshold` は正の整数である必要があります。

[例のデータ](./struct-array-filtering#example-data) の 2 つの entity では、この式に一致するのは **Entity B** のみです。

### MATCH_MOST\{#matchmost}

`MATCH_MOST` は、述語を満たす要素数が `threshold` 以下である場合に `true` と評価されます。

```python
MATCH_MOST(chunks, $[has_code] == true, threshold=1)
```

`MATCH_MOST` では、`threshold` は 0 または正の整数を指定できます。

[例のデータ](./struct-array-filtering#example-data) の 2 つの entity では、この式にはどれも一致しません。

### MATCH_EXACT\{#matchexact}

`MATCH_EXACT` は、述語を満たす要素数が `threshold` とちょうど等しい場合に `true` と評価されます。

```python
MATCH_EXACT(chunks, $[section] == "filter", threshold=1)
```

`MATCH_EXACT` では、`threshold` は 0 または正の整数を指定できます。

[例のデータ](./struct-array-filtering#example-data) の 2 つの entity では、この式にはどれも一致しません。

## サポートされる述語\{#supported-predicates}

`$[...]` 構文は、現在の Struct 要素のスカラー値を表します。述語のサポート内容は、スカラー サブフィールドの型によって異なります。

| サブフィールド型 | 要素レベル述語のサポート |
| --- | --- |
| `BOOL` | `$[has_code] == true` や `!($[has_code] == true)` のようなスカラー述語。`$[has_code]` のような単独の boolean 式は避けてください。 |
| `INT8`, `INT16`, `INT32`, `INT64` | 比較、連鎖範囲、`in`、`not in`、`+`、`-`、`*`、`/`、`%` を使った算術式の後に比較を続ける式、および論理結合。 |
| `FLOAT`, `DOUBLE` | 比較、連鎖範囲、`in`、`not in`、`+`、`-`、`*`、`/` を使った算術式の後に比較を続ける式、および論理結合。浮動小数点サブフィールドでは `%` 演算子はサポートされません。 |
| `VARCHAR` | 文字列比較、連鎖範囲、`in`、`not in`、`like`、`=&#126;`、`!&#126;`、および論理結合。 |
| Vector サブフィールド | `$[...]` のスカラー述語入力としてはサポートされません。代わりに、EmbeddingList 検索または要素レベルの vector 検索を通じて vector サブフィールドを使用してください。 |

`&&`、`||`、`!` などの論理演算子は述語式に適用されます。たとえば、`!$[has_code]` ではなく `!($[has_code] == true)` と記述してください。

## サポートされない述語\{#unsupported-predicates}

要素レベルの `$[...]` 述語では、以下はサポートされません。

- `text_match(field, "...")` や `phrase_match(field, "...")` などのテキスト一致関数。

- JSON path 構文、JSON path に対する `exists`、または `json_contains`、`json_contains_all`、`json_contains_any` などの JSON 関数。

- `array_contains`、`array_contains_all`、`array_contains_any`、`array_length` などの配列コンテナ関数。

- `$[subfield] is null` または `$[subfield] is not null`。

- Geometry / GIS 関数。

- Timestamptz 式。

- `random_sample(...)`。

- フィールドレベルの vector 述語。

- 特定の関数シグネチャと実行パスが StructArray 要素レベル述語を明示的にサポートしていない限り、汎用の filter 関数呼び出し。

## 構文ルール\{#syntax-rules}

- `MATCH_*` 演算子名では大文字小文字は区別されません。

- `$[subfield]` は `element_filter` または `MATCH_*` 述語の内部でのみ使用してください。

- `$[subfield]` を JSON path、配列コンテナ、または vector フィールド参照として使用しないでください。

- 別の StructArray 演算子の中に `element_filter` や `MATCH_*` をネストしないでください。

- `MATCH_LEAST`、`MATCH_MOST`、`MATCH_EXACT` では名前付きの `threshold=N` を使用してください。

- 空の StructArray に対する `MATCH_ANY` は `false` を返します。

- 空の StructArray に対する `MATCH_ALL` は `true` を返します。

## 関連情報\{#see-also}

- [StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays)

- [StructArray を使った基本 vector 検索](./search-with-struct-array)

- [StructArray フィールドのインデックス作成](./index-struct-array)

- [StructArray の制限事項](./struct-array-limits)

