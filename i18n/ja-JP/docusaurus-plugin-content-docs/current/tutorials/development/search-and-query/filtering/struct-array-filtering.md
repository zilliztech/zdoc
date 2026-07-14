---
title: "StructArray Operators | Cloud"
slug: /struct-array-filtering
sidebar_label: "StructArray"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray フィールドでの scalar フィルタリングは、StructArray フィールド内の scalar サブフィールドに対する述語を評価します。このページは、StructArray フィールドでの scalar フィルタリング、および `elementfilter` と `MATCH` 演算子ファミリーの構文リファレンスとして使用できます。 | Cloud"
type: origin
token: VmGMwsTliiGZdFkzzeBckRNlnCh
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# StructArray Operators

StructArray フィールドでの scalar フィルタリングは、StructArray フィールド内の scalar サブフィールドに対する述語を評価します。このページは、StructArray フィールドでの scalar フィルタリング、および `element_filter` と `MATCH_*` 演算子ファミリーの構文リファレンスとして使用できます。

StructArray は、次の scalar フィルタリングパターンをサポートします。

| Scalar filtering pattern | Main purpose | Result behavior |
| --- | --- | --- |
| StructArray subfield access | 指定したインデックス（添字）にある指定サブフィールドの値が scalar 述語を満たすかどうかに基づいて entity を選択します。 | entity レベルのフィルタリング。 |
| `ARRAY_CONTAINS` | 指定した値がサブフィールド内に存在するかどうかに基づいて entity を選択します。 | entity レベルのフィルタリング。 |
| `ARRAY_LENGTH` | 指定したサブフィールド内の要素数が式に一致するかどうかに基づいて entity を選択します。 | entity レベルのフィルタリング。 |
| `element_filter` | scalar 述語を満たす Struct 要素をマッチさせます。 | 要素レベルの検索では、一致したヒットに要素オフセットを含めることができます。行レベルのクエリまたはフィルタ付き検索では、結果の形状は API と出力フィールドに依存します。 |
| `MATCH_*` | scalar 述語を満たす Struct 要素の数に基づいて entity を選択します。 | entity レベルのフィルタリング。これらの演算子自体は要素オフセットを返しません。 |

StructArray 演算子では scalar サブフィールドを使用します。vector サブフィールドは vector 検索パスで使用され、scalar 述語の入力にはなりません。

## どの演算子を使うべきか\{#when-to-use-which-operator}

| Goal | Use |
| --- | --- |
| scalar 条件に一致する要素だけに要素レベルの vector 検索を制約する。 | `element_filter` |
| 同じ Struct 要素内で複数の scalar 条件をマッチさせる。 | `element_filter` |
| struct サブフィールドに指定した値が含まれる entity のみを返す。 | `ARRAY_CONTAINS` |
| struct サブフィールドが指定した数の要素を持つ entity のみを返す。 | `ARRAY_LENGTH` |
| 特定の Struct 要素が述語を満たす entity のみを返す。 | StructArray インデックス（添字）アクセス |
| 少なくとも 1 つの Struct 要素が述語を満たす entity のみを返す。 | `MATCH_ANY` |
| すべての Struct 要素が述語を満たす entity のみを返す。 | `MATCH_ALL`,<br/>StructArray サブフィールドアクセス, |
| 少なくとも、最大で、またはちょうど `N` 個の Struct 要素が述語を満たす entity のみを返す。 | `MATCH_LEAST`、`MATCH_MOST`、または `MATCH_EXACT` |

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

## サブフィールドアクセス\{#subfield-access}

scalar フィルタリング式では StructArray サブフィールドを使用して、配列内のすべての struct または特定の struct 内のサブフィールド値に基づいて entity を選択できます。

次のフィルタリング式を考えてみましょう。

```python
chunks[0][quality_score] > 0.8
```

このフィルタ式は、entity 内の StructArray フィールドの**最初の要素**にある `quality_score` サブフィールドの値が 0.8 を超える場合に、その entity がマッチすることを示します。

[例のデータ](./struct-array-filtering#example-data)の 2 つの entity では、この式にマッチするのは **Entity B** のみです。

scalar フィルタリングでサブフィールドアクセスを使用する場合、サブフィールドの要素自体にはアクセスできない点に注意してください。

```python
❌ chunks[quality_score][0] > 0.8
```

## ARRAY 演算子\{#array-operators}

Array フィールドのサブタイプとして、StructArray は `ARRAY_CONTAIN` や `ARRAY_LENGTH` などの ARRAY 演算子もサポートします。

次の式を考えてみましょう。

```python
ARRAY_CONTAINS(chunks[quality_score], 0.74)
```

上記の式は、entity のすべての要素にまたがるいずれかの `quality_score` サブフィールドの値が `0.74` である場合に、その entity がマッチすることを示します。[例のデータ](./struct-array-filtering#example-data)の 2 つの entity では、この式にマッチするのは **Entity A** のみです。

```python
ARRAY_LENGTH(chunks[quality_score], 3)
```

上記の式は、`quality_score` サブフィールドが 3 つの値を含む場合に、その entity がマッチすることを示します。[例のデータ](./struct-array-filtering#example-data)の 2 つの entity では、この式にマッチするのは **Entity B** のみです。

## Element filter\{#element-filter}

`element_filter(structArrayField, predicate)` を使用して、StructArray フィールド内の Struct 要素をマッチさせます。

述語の内部では、現在の Struct 要素の scalar サブフィールドを参照するために `$[subfield]` を使用します。

```plaintext
element_filter(chunks, $[section] == "index")
```

[例のデータ](./struct-array-filtering#example-data)の 2 つの entity では、この式は両方の entity にマッチします。

述語内で複数の条件を使用する場合、すべての `$[subfield]` 参照は同じ Struct 要素に適用されます。

```plaintext
element_filter(chunks, $[section] == "index" && $[quality_score] > 0.9)
```

[例のデータ](./struct-array-filtering#example-data)の 2 つの entity では、この式にマッチするのは **Entity B** のみです。

entity レベルの述語と `element_filter` を組み合わせる場合は、式の末尾に `element_filter` を配置してください。

```plaintext
# Correct
category == "index" && element_filter(chunks, $[quality_score] > 0.9)

# Incorrect
element_filter(chunks, $[quality_score] > 0.9) && category == "index"
```

`element_filter` はフィルタ式内に 1 回しか現れません。別の `element_filter` の中に `element_filter` や `MATCH_*` をネストしないでください。

## Match ファミリー演算子\{#match-family-operators}

entity を、述語を満たす Struct 要素の数に基づいて選択する必要がある場合は `MATCH_*` 演算子を使用します。

| Operator | Meaning |
| --- | --- |
| `MATCH_ANY(field, predicate)` | 少なくとも 1 つの Struct 要素が述語を満たします。 |
| `MATCH_ALL(field, predicate)` | すべての Struct 要素が述語を満たします。 |
| `MATCH_LEAST(field, predicate, threshold=N)` | 少なくとも `N` 個の Struct 要素が述語を満たします。 |
| `MATCH_MOST(field, predicate, threshold=N)` | 高々 `N` 個の Struct 要素が述語を満たします。 |
| `MATCH_EXACT(field, predicate, threshold=N)` | ちょうど `N` 個の Struct 要素が述語を満たします。 |

`MATCH_ANY` と `element_filter` は、どちらも「少なくとも 1 つの Struct 要素が述語を満たす」ことを表現できます。行レベルのフィルタリングだけが必要な場合は `MATCH_ANY` を使用してください。要素レベルの vector 検索にどの Struct 要素が参加するかをフィルタリングするような、要素レベルの制約が必要な場合は `element_filter` を使用してください。

### MATCH_ANY\{#matchany}

`MATCH_ANY` は、StructArray 内の少なくとも 1 つの要素が述語を満たす場合に `true` と評価されます。

```plaintext
MATCH_ANY(chunks, $[section] == "index")
```

空の StructArray に対しては、`MATCH_ANY` は `false` を返します。

[例のデータ](./struct-array-filtering#example-data)の 2 つの entity では、この式は両方の entity にマッチします。

### MATCH_ALL\{#matchall}

`MATCH_ALL` は、StructArray 内のすべての要素が述語を満たす場合に `true` と評価されます。

```plaintext
MATCH_ALL(chunks, $[has_code] == true)
```

空の StructArray に対しては、`MATCH_ALL` は `true` を返します。

[例のデータ](./struct-array-filtering#example-data)の 2 つの entity では、この式は両方の entity にマッチします。

### MATCH_LEAST\{#matchleast}

`MATCH_LEAST` は、述語を満たす要素数が `threshold` 以上である場合に `true` と評価されます。

```plaintext
MATCH_LEAST(chunks, $[quality_score] > 0.9, threshold=2)
```

`MATCH_LEAST` では、`threshold` は正の整数である必要があります。

[例のデータ](./struct-array-filtering#example-data)の 2 つの entity では、この式にマッチするのは **Entity B** のみです。

### MATCH_MOST\{#matchmost}

`MATCH_MOST` は、述語を満たす要素数が `threshold` 以下である場合に `true` と評価されます。

```plaintext
MATCH_MOST(chunks, $[has_code] == true, threshold=1)
```

`MATCH_MOST` では、`threshold` は 0 または正の整数にできます。

[例のデータ](./struct-array-filtering#example-data)の 2 つの entity では、この式にはどれもマッチしません。

### MATCH_EXACT\{#matchexact}

`MATCH_EXACT` は、述語を満たす要素数が `threshold` とちょうど等しい場合に `true` と評価されます。

```plaintext
MATCH_EXACT(chunks, $[section] == "filter", threshold=1)
```

`MATCH_EXACT` では、`threshold` は 0 または正の整数にできます。

[例のデータ](./struct-array-filtering#example-data)の 2 つの entity では、この式にはどれもマッチしません。

## サポートされる述語\{#supported-predicates}

`$[...]` 構文は、現在の Struct 要素の scalar 値を表します。述語のサポートは scalar サブフィールドの型に依存します。

| Subfield type | Element-level predicate support |
| --- | --- |
| `BOOL` | `$[has_code] == true` や `!($[has_code] == true)` のような scalar 述語。`$[has_code]` のような裸の boolean 式は避けてください。 |
| `INT8`, `INT16`, `INT32`, `INT64` | 比較、連鎖範囲、`in`、`not in`、`+`、`-`、`*`、`/`、`%` を使った算術式の後に比較を続ける形式、および論理結合。 |
| `FLOAT`, `DOUBLE` | 比較、連鎖範囲、`in`、`not in`、`+`、`-`、`*`、`/` を使った算術式の後に比較を続ける形式、および論理結合。浮動小数点サブフィールドでは `%` 演算子はサポートされません。 |
| `VARCHAR` | 文字列比較、連鎖範囲、`in`、`not in`、`like`、`=&#126;`、`!&#126;`、および論理結合。 |
| Vector subfields | `$[...]` の scalar 述語入力としてはサポートされません。代わりに、vector サブフィールドは EmbeddingList 検索または要素レベルの vector 検索を通じて使用してください。 |

`&&`、`||`、`!` などの論理演算子は述語式に適用されます。たとえば、`!$[has_code]` ではなく `!($[has_code] == true)` と記述してください。

## サポートされない述語\{#unsupported-predicates}

要素レベルの `$[...]` 述語では、以下はサポートされません。

- `text_match(field, "...")` や `phrase_match(field, "...")` などのテキストマッチ関数。

- JSON path 構文、JSON path に対する `exists`、または `json_contains`、`json_contains_all`、`json_contains_any` などの JSON 関数。

- `array_contains`、`array_contains_all`、`array_contains_any`、`array_length` などの Array コンテナ関数。

- `$[subfield] is null` または `$[subfield] is not null`。

- Geometry / GIS 関数。

- Timestamptz 式。

- `random_sample(...)`。

- フィールドレベルの vector 述語。

- 特定の関数シグネチャと実行パスが StructArray の要素レベル述語を明示的にサポートしている場合を除き、汎用的なフィルタ関数呼び出し。

## 構文ルール\{#syntax-rules}

- `MATCH_*` 演算子名は大文字小文字を区別しません。

- `$[subfield]` は `element_filter` または `MATCH_*` 述語の内部でのみ使用してください。

- `$[subfield]` を JSON path、Array コンテナ、または vector フィールド参照として使用しないでください。

- 別の StructArray 演算子の中に `element_filter` や `MATCH_*` をネストしないでください。

- `MATCH_LEAST`、`MATCH_MOST`、`MATCH_EXACT` では名前付きの `threshold=N` を使用してください。

- 空の StructArray に対する `MATCH_ANY` は `false` を返します。

- 空の StructArray に対する `MATCH_ALL` は `true` を返します。

## 関連情報\{#see-also}

- [StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays)

- [StructArray を使った基本的な vector 検索](./search-with-struct-array)

- [StructArray フィールドのインデックス作成](./index-struct-array)

- [StructArray の制限](./struct-array-limits)

