---
title: "StructArray 演算子 | BYOC"
slug: /struct-array-filtering
sidebar_label: "StructArray"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray フィールドでのスカラーフィルタリングは、StructArray フィールド内のスカラーサブフィールドに対する述語を評価します。このページは、StructArray フィールドでのスカラーフィルタリング、および `elementfilter` と `MATCH` 演算子ファミリーの構文リファレンスとして使用できます。 | BYOC"
type: origin
token: VmGMwsTliiGZdFkzzeBckRNlnCh
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray 演算子

StructArray フィールドでのスカラーフィルタリングは、StructArray フィールド内のスカラーサブフィールドに対する述語を評価します。このページは、StructArray フィールドでのスカラーフィルタリング、および `element_filter` と `MATCH_*` 演算子ファミリーの構文リファレンスとして使用できます。

StructArray は、次のスカラーフィルタリングパターンをサポートします。

| スカラーフィルタリングパターン | 主な目的 | 結果の動作 |
| --- | --- | --- |
| StructArray サブフィールドアクセス | 指定されたインデックス（添字）の指定されたサブフィールドの値がスカラー述語を満たすかどうかに基づいてエンティティを選択します。 | エンティティレベルのフィルタリング。 |
| `ARRAY_CONTAINS` | 指定された値がサブフィールド内に存在するかどうかに基づいてエンティティを選択します。 | エンティティレベルのフィルタリング。 |
| `ARRAY_LENGTH` | 指定されたサブフィールド内の要素数が式に一致するかどうかに基づいてエンティティを選択します。 | エンティティレベルのフィルタリング。 |
| `element_filter` | スカラー述語を満たす Struct 要素を一致させます。 | 要素レベル検索では、一致したヒットに要素オフセットを含めることができます。行レベルクエリまたはフィルター付き検索では、結果の形状は API と出力フィールドに依存します。 |
| `MATCH_*` | スカラー述語を満たす Struct 要素の数に基づいてエンティティを選択します。 | エンティティレベルのフィルタリング。これらの演算子自体は要素オフセットを返しません。 |

StructArray 演算子ではスカラーサブフィールドを使用してください。ベクトルサブフィールドはベクトル検索パスで使用され、スカラー述語の入力にはなりません。

## どの演算子を使うべきか\{#when-to-use-which-operator}

| 目的 | 使用するもの |
| --- | --- |
| スカラー条件に一致する要素に要素レベルベクトル検索を制限する。 | `element_filter` |
| 同じ Struct 要素内で複数のスカラー条件を一致させる。 | `element_filter` |
| struct サブフィールドに指定値を含むエンティティのみを返す。 | `ARRAY_CONTAINS` |
| struct サブフィールドが指定された数の要素を持つエンティティのみを返す。 | `ARRAY_LENGTH` |
| 特定の Struct 要素が述語を満たすエンティティのみを返す。 | StructArray インデックス（添字）アクセス |
| 少なくとも 1 つの Struct 要素が述語を満たすエンティティのみを返す。 | `MATCH_ANY` |
| すべての Struct 要素が述語を満たすエンティティのみを返す。 | `MATCH_ALL`,<br/>StructArray サブフィールドアクセス, |
| 少なくとも、最大で、またはちょうど `N` 個の Struct 要素が述語を満たすエンティティのみを返す。 | `MATCH_LEAST`, `MATCH_MOST`, または `MATCH_EXACT` |

## サンプルデータ\{#example-data}

以下のセクションの例では、`chunks` フィールドが次のように設定されたエンティティ（**Entity A** と **Entity B**）を使用します。

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

スカラーフィルタリング式では StructArray サブフィールドを使用して、すべての struct 内、または配列内の特定の struct 内のサブフィールドの値に基づいてエンティティを選択できます。

次のフィルタリング式を考えてみましょう。

```python
chunks[0][quality_score] > 0.8
```

このフィルター式は、エンティティ内の StructArray フィールドの**最初の要素**にある `quality_score` サブフィールドの値が 0.8 を超える場合、そのエンティティが一致することを示します。 

[サンプルデータ](./struct-array-filtering#example-data) の 2 つのエンティティでは、この式に一致するのは **Entity B** のみです。

スカラーフィルタリングでサブフィールドアクセスを使用する場合、サブフィールドの要素自体にはアクセスできない点に注意してください。

```python
❌ chunks[quality_score][0] > 0.8
```

## ARRAY 演算子\{#array-operators}

Array フィールドのサブタイプとして、StructArray は `ARRAY_CONTAIN` や `ARRAY_LENGTH` などの ARRAY 演算子もサポートしています。

次の式を考えてみましょう。

```python
ARRAY_CONTAINS(chunks[quality_score], 0.74)
```

上記の式は、エンティティ内のすべての要素にまたがるいずれかの `quality_score` サブフィールドの値が `0.74` である場合、そのエンティティが一致することを示します。[サンプルデータ](./struct-array-filtering#example-data) の 2 つのエンティティでは、この式に一致するのは **Entity A** のみです。

```python
ARRAY_LENGTH(chunks[quality_score], 3)
```

上記の式は、`quality_score` サブフィールドが 3 つの値を含む場合、そのエンティティが一致することを示します。[サンプルデータ](./struct-array-filtering#example-data) の 2 つのエンティティでは、この式に一致するのは **Entity B** のみです。

## Element filter\{#element-filter}

`element_filter(structArrayField, predicate)` を使用して、StructArray フィールド内の Struct 要素を一致させます。

述語の内部では、現在の Struct 要素のスカラーサブフィールドを参照するために `$[subfield]` を使用します。

```python
element_filter(chunks, $[section] == "index")
```

[サンプルデータ](./struct-array-filtering#example-data) の 2 つのエンティティでは、この式は両方のエンティティに一致します。

述語の内部で複数の条件を使用する場合、すべての `$[subfield]` 参照は同じ Struct 要素に適用されます。

```python
element_filter(chunks, $[section] == "index" && $[quality_score] > 0.9)
```

[サンプルデータ](./struct-array-filtering#example-data) の 2 つのエンティティでは、この式に一致するのは **Entity B** のみです。

エンティティレベルの述語と `element_filter` を組み合わせる場合は、式の末尾に `element_filter` を配置してください。

```python
# Correct
category == "index" && element_filter(chunks, $[quality_score] > 0.9)

# Incorrect
element_filter(chunks, $[quality_score] > 0.9) && category == "index"
```

`element_filter` はフィルター式内に 1 回しか出現できません。別の `element_filter` の中に `element_filter` や `MATCH_*` をネストしないでください。

## Match ファミリー演算子\{#match-family-operators}

エンティティを、述語を満たす Struct 要素の数に基づいて選択する必要がある場合は、`MATCH_*` 演算子を使用します。

| 演算子 | 意味 |
| --- | --- |
| `MATCH_ANY(field, predicate)` | 少なくとも 1 つの Struct 要素が述語を満たします。 |
| `MATCH_ALL(field, predicate)` | すべての Struct 要素が述語を満たします。 |
| `MATCH_LEAST(field, predicate, threshold=N)` | 少なくとも `N` 個の Struct 要素が述語を満たします。 |
| `MATCH_MOST(field, predicate, threshold=N)` | 高々 `N` 個の Struct 要素が述語を満たします。 |
| `MATCH_EXACT(field, predicate, threshold=N)` | ちょうど `N` 個の Struct 要素が述語を満たします。 |

`MATCH_ANY` と `element_filter` はどちらも、少なくとも 1 つの Struct 要素が述語を満たすことを表現できます。行レベルフィルタリングのみが必要な場合は `MATCH_ANY` を使用してください。要素レベルベクトル検索に参加する Struct 要素をフィルタリングするなど、要素レベルの制約が必要な場合は `element_filter` を使用してください。

### MATCH_ANY\{#matchany}

`MATCH_ANY` は、StructArray 内の少なくとも 1 つの要素が述語を満たす場合に `true` と評価されます。

```python
MATCH_ANY(chunks, $[section] == "index")
```

空の StructArray に対しては、`MATCH_ANY` は `false` を返します。

[サンプルデータ](./struct-array-filtering#example-data) の 2 つのエンティティでは、この式は両方のエンティティに一致します。

### MATCH_ALL\{#matchall}

`MATCH_ALL` は、StructArray 内のすべての要素が述語を満たす場合に `true` と評価されます。

```python
MATCH_ALL(chunks, $[has_code] == true)
```

空の StructArray に対しては、`MATCH_ALL` は `true` を返します。

[サンプルデータ](./struct-array-filtering#example-data) の 2 つのエンティティでは、この式は両方のエンティティに一致します。

### MATCH_LEAST\{#matchleast}

`MATCH_LEAST` は、述語を満たす要素数が `threshold` 以上である場合に `true` と評価されます。

```python
MATCH_LEAST(chunks, $[quality_score] > 0.9, threshold=2)
```

`MATCH_LEAST` では、`threshold` は正の整数である必要があります。

[サンプルデータ](./struct-array-filtering#example-data) の 2 つのエンティティでは、この式に一致するのは **Entity B** のみです。

### MATCH_MOST\{#matchmost}

`MATCH_MOST` は、述語を満たす要素数が `threshold` 以下である場合に `true` と評価されます。

```python
MATCH_MOST(chunks, $[has_code] == true, threshold=1)
```

`MATCH_MOST` では、`threshold` は 0 または正の整数にできます。

[サンプルデータ](./struct-array-filtering#example-data) の 2 つのエンティティでは、この式にはどちらも一致しません。

### MATCH_EXACT\{#matchexact}

`MATCH_EXACT` は、述語を満たす要素数が `threshold` と正確に等しい場合に `true` と評価されます。

```python
MATCH_EXACT(chunks, $[section] == "filter", threshold=1)
```

`MATCH_EXACT` では、`threshold` は 0 または正の整数にできます。

[サンプルデータ](./struct-array-filtering#example-data) の 2 つのエンティティでは、この式にはどちらも一致しません。

## サポートされる述語\{#supported-predicates}

`$[...]` 構文は、現在の Struct 要素のスカラー値を表します。述語のサポートはスカラーサブフィールドの型によって異なります。

| サブフィールド型 | 要素レベル述語のサポート |
| --- | --- |
| `BOOL` | `$[has_code] == true` や `!($[has_code] == true)` のようなスカラー述語。`$[has_code]` のような裸の boolean 式は避けてください。 |
| `INT8`, `INT16`, `INT32`, `INT64` | 比較、連鎖範囲、`in`、`not in`、`+`、`-`、`*`、`/`、`%` を使った算術式の後に比較を続ける形式、および論理結合。 |
| `FLOAT`, `DOUBLE` | 比較、連鎖範囲、`in`、`not in`、`+`、`-`、`*`、`/` を使った算術式の後に比較を続ける形式、および論理結合。浮動小数点サブフィールドでは `%` 演算子はサポートされません。 |
| `VARCHAR` | 文字列比較、連鎖範囲、`in`、`not in`、`like`、`=&#126;`、`!&#126;`、および論理結合。 |
| ベクトルサブフィールド | `$[...]` スカラー述語の入力としてはサポートされません。代わりに、EmbeddingList 検索または要素レベルベクトル検索を通じてベクトルサブフィールドを使用してください。 |

`&&`、`||`、`!` などの論理演算子は述語式に適用されます。たとえば、`!$[has_code]` ではなく `!($[has_code] == true)` と記述してください。

## サポートされない述語\{#unsupported-predicates}

要素レベルの `$[...]` 述語は次をサポートしません。

- `text_match(field, "...")` や `phrase_match(field, "...")` などのテキスト一致関数。

- JSON path 構文、JSON path に対する `exists`、または `json_contains`、`json_contains_all`、`json_contains_any` などの JSON 関数。

- `array_contains`、`array_contains_all`、`array_contains_any`、`array_length` などの配列コンテナ関数。

- `$[subfield] is null` または `$[subfield] is not null`。

- Geometry / GIS 関数。

- Timestamptz 式。

- `random_sample(...)`。

- フィールドレベルベクトル述語。

- 特定の関数シグネチャと実行パスが StructArray 要素レベル述語を明示的にサポートしている場合を除き、汎用フィルター関数呼び出し。

## 構文ルール\{#syntax-rules}

- `MATCH_*` 演算子名は大文字小文字を区別しません。

- `$[subfield]` は `element_filter` または `MATCH_*` 述語の内部でのみ使用してください。

- `$[subfield]` を JSON path、配列コンテナ、またはベクトルフィールド参照として使用しないでください。

- 別の StructArray 演算子の内部に `element_filter` や `MATCH_*` をネストしないでください。

- `MATCH_LEAST`、`MATCH_MOST`、`MATCH_EXACT` では名前付きの `threshold=N` を使用してください。

- 空の StructArray に対する `MATCH_ANY` は `false` を返します。

- 空の StructArray に対する `MATCH_ALL` は `true` を返します。

## 参考情報\{#see-also}

- [StructArray を使用したフィルター付き検索](./filtered-search-with-struct-arrays)

- [StructArray を使用した基本ベクトル検索](./search-with-struct-array)

- [StructArray フィールドのインデックス作成](./index-struct-array)

- [StructArray の制限](./struct-array-limits)

