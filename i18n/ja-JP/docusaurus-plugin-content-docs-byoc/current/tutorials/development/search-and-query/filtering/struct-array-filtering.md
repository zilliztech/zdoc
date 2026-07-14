---
title: "StructArray 演算子 | BYOC"
slug: /struct-array-filtering
sidebar_label: "StructArray"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray フィールドでのスカラー filtering は、StructArray フィールド内のスカラー subfield に対する述語を評価します。このページは、StructArray フィールドでのスカラー filtering、および `elementfilter` と `MATCH` 演算子ファミリーの構文リファレンスとして使用できます。 | BYOC"
type: origin
token: VmGMwsTliiGZdFkzzeBckRNlnCh
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray 演算子

StructArray フィールドでのスカラー filtering は、StructArray フィールド内のスカラー subfield に対する述語を評価します。このページは、StructArray フィールドでのスカラー filtering、および `element_filter` と `MATCH_*` 演算子ファミリーの構文リファレンスとして使用できます。

StructArray は次のスカラー filtering パターンをサポートします。

| スカラー filtering パターン | 主な目的 | 結果の動作 |
| --- | --- | --- |
| StructArray subfield アクセス | 指定したインデックス（添字）にある指定した subfield の値がスカラー述語を満たすかどうかに基づいて entity を選択します。 | entity レベルの filtering。 |
| `ARRAY_CONTAINS` | 指定した値が subfield 内に存在するかどうかに基づいて entity を選択します。 | entity レベルの filtering。 |
| `ARRAY_LENGTH` | 指定した subfield 内の要素数が式に一致するかどうかに基づいて entity を選択します。 | entity レベルの filtering。 |
| `element_filter` | スカラー述語を満たす Struct 要素にマッチします。 | 要素レベルの検索では、マッチしたヒットに要素オフセットを含めることができます。行レベルのクエリまたは filtered search では、結果の形は API と出力フィールドによって異なります。 |
| `MATCH_*` | いくつの Struct 要素がスカラー述語を満たすかに基づいて entity を選択します。 | entity レベルの filtering。これらの演算子自体は要素オフセットを返しません。 |

StructArray 演算子ではスカラー subfield を使用します。vector subfield は vector search パスで使用され、スカラー述語の入力ではありません。

## どの演算子を使うべきか\{#when-to-use-which-operator}

| 目的 | 使用するもの |
| --- | --- |
| 要素レベルの vector search を、スカラー条件に一致する要素に制約する。 | `element_filter` |
| 同じ Struct 要素内で複数のスカラー条件にマッチさせる。 | `element_filter` |
| struct subfield に指定した値が含まれる entity のみを返す。 | `ARRAY_CONTAINS` |
| struct subfield が指定した要素数を持つ entity のみを返す。 | `ARRAY_LENGTH` |
| 特定の Struct 要素が述語を満たす entity のみを返す。 | StructArray インデックス（添字）アクセス |
| 少なくとも 1 つの Struct 要素が述語を満たす entity のみを返す。 | `MATCH_ANY` |
| すべての Struct 要素が述語を満たす entity のみを返す。 | `MATCH_ALL`,<br/>StructArray subfield access, |
| 少なくとも、最大で、またはちょうど `N` 個の Struct 要素が述語を満たす entity のみを返す。 | `MATCH_LEAST`, `MATCH_MOST`, または `MATCH_EXACT` |

## サンプルデータ\{#example-data}

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

## subfield アクセス\{#subfield-access}

スカラー filtering 式で StructArray subfield を使用して、配列内のすべての struct または配列内の特定の struct にある subfield の値に基づいて entity を選択できます。

次の filtering 式を考えてみましょう。

```python
chunks[0][quality_score] > 0.8
```

この filter 式は、entity 内の StructArray フィールドの**最初の要素**にある `quality_score` subfield の値が 0.8 を超える場合、その entity がマッチすることを示します。 

[サンプルデータ](./struct-array-filtering#example-data) 内の 2 つの entity では、この式にマッチするのは **Entity B** のみです。

スカラー filtering で subfield アクセスを使用する場合、subfield 要素自体にはアクセスできない点に注意してください。

```python
❌ chunks[quality_score][0] > 0.8
```

## ARRAY 演算子\{#array-operators}

Array フィールドのサブタイプとして、StructArray も `ARRAY_CONTAIN` や `ARRAY_LENGTH` などの ARRAY 演算子をサポートします。

次の式を考えてみましょう。

```python
ARRAY_CONTAINS(chunks[quality_score], 0.74)
```

上記の式は、entity のすべての要素にまたがるいずれかの `quality_score` subfield の値が `0.74` である場合、その entity がマッチすることを示します。[サンプルデータ](./struct-array-filtering#example-data) 内の 2 つの entity では、この式にマッチするのは **Entity A** のみです。

```python
ARRAY_LENGTH(chunks[quality_score], 3)
```

上記の式は、`quality_score` subfield に 3 つの値が含まれている場合、その entity がマッチすることを示します。[サンプルデータ](./struct-array-filtering#example-data) 内の 2 つの entity では、この式にマッチするのは **Entity B** のみです。

## Element filter\{#element-filter}

`element_filter(structArrayField, predicate)` を使用して、StructArray フィールド内の Struct 要素にマッチさせます。

述語内では、現在の Struct 要素のスカラー subfield を参照するために `$[subfield]` を使用します。

```plaintext
element_filter(chunks, $[section] == "index")
```

[サンプルデータ](./struct-array-filtering#example-data) 内の 2 つの entity では、この式は両方の entity にマッチします。

述語内で複数の条件を使用する場合、すべての `$[subfield]` 参照は同じ Struct 要素に適用されます。

```plaintext
element_filter(chunks, $[section] == "index" && $[quality_score] > 0.9)
```

[サンプルデータ](./struct-array-filtering#example-data) 内の 2 つの entity では、この式にマッチするのは **Entity B** のみです。

entity レベルの述語と `element_filter` を組み合わせる場合は、式の末尾に `element_filter` を配置してください。

```plaintext
# Correct
category == "index" && element_filter(chunks, $[quality_score] > 0.9)

# Incorrect
element_filter(chunks, $[quality_score] > 0.9) && category == "index"
```

`element_filter` は filter 式内に 1 回しか記述できません。別の `element_filter` の中に `element_filter` や `MATCH_*` をネストしないでください。

## Match ファミリー演算子\{#match-family-operators}

entity を、いくつの Struct 要素が述語を満たすかに基づいて選択する必要がある場合は、`MATCH_*` 演算子を使用します。

| 演算子 | 意味 |
| --- | --- |
| `MATCH_ANY(field, predicate)` | 少なくとも 1 つの Struct 要素が述語を満たします。 |
| `MATCH_ALL(field, predicate)` | すべての Struct 要素が述語を満たします。 |
| `MATCH_LEAST(field, predicate, threshold=N)` | 少なくとも `N` 個の Struct 要素が述語を満たします。 |
| `MATCH_MOST(field, predicate, threshold=N)` | 高々 `N` 個の Struct 要素が述語を満たします。 |
| `MATCH_EXACT(field, predicate, threshold=N)` | ちょうど `N` 個の Struct 要素が述語を満たします。 |

`MATCH_ANY` と `element_filter` はどちらも、「少なくとも 1 つの Struct 要素が述語を満たす」ことを表現できます。行レベルの filtering のみが必要な場合は `MATCH_ANY` を使用してください。要素レベルの制約、たとえばどの Struct 要素が要素レベルの vector search に参加するかを filtering する必要がある場合は `element_filter` を使用してください。

### MATCH_ANY\{#matchany}

`MATCH_ANY` は、StructArray 内の少なくとも 1 つの要素が述語を満たす場合に `true` と評価されます。

```plaintext
MATCH_ANY(chunks, $[section] == "index")
```

空の StructArray に対しては、`MATCH_ANY` は `false` を返します。

[サンプルデータ](./struct-array-filtering#example-data) 内の 2 つの entity では、この式は両方の entity にマッチします。

### MATCH_ALL\{#matchall}

`MATCH_ALL` は、StructArray 内のすべての要素が述語を満たす場合に `true` と評価されます。

```plaintext
MATCH_ALL(chunks, $[has_code] == true)
```

空の StructArray に対しては、`MATCH_ALL` は `true` を返します。

[サンプルデータ](./struct-array-filtering#example-data) 内の 2 つの entity では、この式は両方の entity にマッチします。

### MATCH_LEAST\{#matchleast}

`MATCH_LEAST` は、述語を満たす要素数が `threshold` 以上である場合に `true` と評価されます。

```plaintext
MATCH_LEAST(chunks, $[quality_score] > 0.9, threshold=2)
```

`MATCH_LEAST` では、`threshold` は正の整数である必要があります。

[サンプルデータ](./struct-array-filtering#example-data) 内の 2 つの entity では、この式にマッチするのは **Entity B** のみです。

### MATCH_MOST\{#matchmost}

`MATCH_MOST` は、述語を満たす要素数が `threshold` 以下である場合に `true` と評価されます。

```plaintext
MATCH_MOST(chunks, $[has_code] == true, threshold=1)
```

`MATCH_MOST` では、`threshold` は 0 または正の整数を指定できます。

[サンプルデータ](./struct-array-filtering#example-data) 内の 2 つの entity では、この式にはどの entity もマッチしません。

### MATCH_EXACT\{#matchexact}

`MATCH_EXACT` は、述語を満たす要素数が `threshold` とちょうど等しい場合に `true` と評価されます。

```plaintext
MATCH_EXACT(chunks, $[section] == "filter", threshold=1)
```

`MATCH_EXACT` では、`threshold` は 0 または正の整数を指定できます。

[サンプルデータ](./struct-array-filtering#example-data) 内の 2 つの entity では、この式にはどの entity もマッチしません。

## サポートされる述語\{#supported-predicates}

`$[...]` 構文は、現在の Struct 要素のスカラー値を表します。述語のサポートは、スカラー subfield の型によって異なります。

| Subfield type | 要素レベル述語のサポート |
| --- | --- |
| `BOOL` | `$[has_code] == true` や `!($[has_code] == true)` のようなスカラー述語。`$[has_code]` のような裸の boolean 式は避けてください。 |
| `INT8`, `INT16`, `INT32`, `INT64` | 比較、連鎖範囲、`in`、`not in`、`+`、`-`、`*`、`/`、`%` を使った算術式の後の比較、および論理結合。 |
| `FLOAT`, `DOUBLE` | 比較、連鎖範囲、`in`、`not in`、`+`、`-`、`*`、`/` を使った算術式の後の比較、および論理結合。浮動小数点 subfield では `%` 演算子はサポートされません。 |
| `VARCHAR` | 文字列比較、連鎖範囲、`in`、`not in`、`like`、`=&#126;`、`!&#126;`、および論理結合。 |
| Vector subfields | `$[...]` のスカラー述語入力としてはサポートされません。代わりに、EmbeddingList search または要素レベルの vector search を通じて vector subfield を使用してください。 |

`&&`、`||`、`!` などの論理演算子は述語式に適用されます。たとえば、`!$[has_code]` ではなく `!($[has_code] == true)` と記述してください。

## サポートされない述語\{#unsupported-predicates}

要素レベルの `$[...]` 述語では、次のものはサポートされません。

- `text_match(field, "...")` や `phrase_match(field, "...")` などのテキスト一致関数。

- JSON path 構文、JSON path に対する `exists`、または `json_contains`、`json_contains_all`、`json_contains_any` などの JSON 関数。

- `array_contains`、`array_contains_all`、`array_contains_any`、`array_length` などの Array コンテナ関数。

- `$[subfield] is null` または `$[subfield] is not null`。

- Geometry / GIS 関数。

- Timestamptz 式。

- `random_sample(...)`。

- フィールドレベルの vector 述語。

- 特定の関数シグネチャと実行パスが StructArray 要素レベル述語を明示的にサポートしていない限り、汎用的な filter 関数呼び出し。

## 構文ルール\{#syntax-rules}

- `MATCH_*` 演算子名は大文字小文字を区別しません。

- `$[subfield]` は `element_filter` または `MATCH_*` 述語の内部でのみ使用してください。

- `$[subfield]` を JSON path、Array コンテナ、または vector field 参照として使用しないでください。

- 別の StructArray 演算子の中に `element_filter` または `MATCH_*` をネストしないでください。

- `MATCH_LEAST`、`MATCH_MOST`、`MATCH_EXACT` では、名前付きの `threshold=N` を使用してください。

- 空の StructArray に対する `MATCH_ANY` は `false` を返します。

- 空の StructArray に対する `MATCH_ALL` は `true` を返します。

## 関連情報\{#see-also}

- [StructArray を使用した Filtered Search](./filtered-search-with-struct-arrays)

- [StructArray を使用した基本的な Vector Search](./search-with-struct-array)

- [StructArray フィールドのインデックス作成](./index-struct-array)

- [StructArray の制限](./struct-array-limits)

