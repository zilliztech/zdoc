---
title: "StructArray 演算子 | BYOC"
slug: /struct-array-filtering
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray 演算子は、StructArray フィールド内のスカラーサブフィールドに対する述語を評価することにより、エンティティをフィルタリングします。このページは、element_filter、MATCH_* 演算子ファミリー、および StructArray パスに対する行レベル述語の構文リファレンスとして使用してください。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-struct-array-filtering
sidebar_label: "StructArray"
sidebar_position: 7
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/search-query-get/boolean/struct-array-operators.md"

---

# StructArray 演算子

StructArray 演算子は、StructArray フィールド内のスカラーサブフィールドに対する述語を評価することにより、エンティティをフィルタリングします。このページは、`element_filter`、`MATCH_*` 演算子ファミリー、および StructArray パスに対する行レベル述語の構文リファレンスとして使用してください。

StructArray フィルタリングには、2つの演算子ファミリーと一連の行レベルパス述語があります。

| フィルター形式 | 主な目的 | 結果の動作 |
| --- | --- | --- |
| `element_filter` | スカラー述語を満たす Struct 要素を一致させます。 | 要素レベル検索では、一致したヒットに要素オフセットが含まれる場合があります。行レベルクエリまたはフィルター付き検索では、結果の形式は API と出力フィールドによって異なります。 |
| `MATCH_*` | スカラー述語を満たす Struct 要素の数に基づいてエンティティを選択します。 | 行レベルフィルタリングです。これらの演算子自体は要素オフセットを返しません。 |
| 行レベルパス述語 | 1つの要素位置をテストしたり、Struct 要素をカウントしたり、`$[...]` 述語を使用せずに要素間でサブフィールド値をテストしたりします。 | 行レベルフィルタリングです。これらの述語は要素オフセットを返しません。 |

StructArray 演算子ではスカラーサブフィールドを使用してください。ベクトルサブフィールドはベクトル検索パスで使用され、スカラー述語の入力にはなりません。

## どの演算子を使うべきか\{#when-to-use-which-operator}

フィルタリングの目的に応じて、適切な演算子を選択してください。

| 目的 | 使用するもの |
| --- | --- |
| スカラー条件に一致する要素に要素レベルベクトル検索を制限する。 | `element_filter` |
| 同じ Struct 要素内で複数のスカラー条件を一致させる。 | `element_filter` |
| 少なくとも 1 つの Struct 要素が述語を満たすエンティティのみを返す。 | `MATCH_ANY` |
| すべての Struct 要素が述語を満たすエンティティのみを返す。 | `MATCH_ALL` |
| 少なくとも、最大で、またはちょうど `N` 個の Struct 要素が述語を満たすエンティティのみを返す。 | `MATCH_LEAST`, `MATCH_MOST`, または `MATCH_EXACT` |
| 特定の位置（最初のチャンクなど）にある Struct 要素を確認します。 | `chunks[0][section]` などの位置指定パス |
| エンティティ内の Struct 要素数でフィルタリングします。 | `array_length(chunks)` |
| 同じ要素に対する条件を組み合わせずに、いずれかの Struct 要素がサブフィールド値を持つかどうかを確認します。 | `chunks[section]` などのサブフィールドパスに対する `array_contains`、`array_contains_any`、または `array_contains_all` |

## サンプルデータ\{#example-data}

以下の部分的なエンティティ例は、**エンティティ A** と **エンティティ B** の `chunks` フィールドのみを示しています。これらは完全な挿入ペイロードではありません。

**エンティティ A**:

```json
{
    "chunks": [
        {
            "section": "index",
            "quality_score": 0.74,
            "has_code": true
        },
        {
            "section": "index",
            "quality_score": 0.72,
            "has_code": true
        },
        {
            "section": "index",
            "quality_score": 0.83,
            "has_code": true
        },
        {
            "section": "index",
            "quality_score": 0.87,
            "has_code": true
        }
    ]
}
```

**エンティティ B**:

```json
{
    "chunks": [
        {
            "section": "index",
            "quality_score": 0.95,
            "has_code": true
        },
        {
            "section": "index",
            "quality_score": 0.92,
            "has_code": true
        },
        {
            "section": "index",
            "quality_score": 0.97,
            "has_code": true
        }
    ]
}
```

## 要素フィルター\{#element-filter}

`element_filter(structArrayField, predicate)` を使用して、StructArray フィールド内の Struct 要素を一致させます。

述語の内部では、現在の Struct 要素のスカラーサブフィールドを参照するために `$[subfield]` を使用します。

```text
element_filter(chunks, $[section] == "index")
```

エンティティ A とエンティティ B の両方が一致します。示されている 7つの要素はすべて `section` が `"index"` に設定されています。

述語の内部で複数の条件を使用する場合、すべての `$[subfield]` 参照は同じ Struct 要素に適用されます。

```text
element_filter(chunks, $[section] == "index" && $[quality_score] > 0.9)
```

エンティティ B のみが一致します。その 3つの要素はすべて両方の条件を満たしています。

エンティティレベルの述語と `element_filter` を組み合わせる場合は、式の末尾に `element_filter` を配置してください。

```text
# Correct
category == "index" && element_filter(chunks, $[quality_score] > 0.9)

# Incorrect
element_filter(chunks, $[quality_score] > 0.9) && category == "index"
```

`category` の例は、`category` を定義していないサンプルデータとは関係なく、式の順序を説明するものです。

`element_filter` はフィルター式内に 1 回しか出現できません。別の `element_filter` の中に `element_filter` や `MATCH_*` をネストしないでください。

## MATCH ファミリー演算子\{#match-family-operators}

エンティティを選択する基準が、述語を満たす Struct 要素の数である場合は、`MATCH_*` 演算子を使用します。各演算子の意味は次の通りです。

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

```text
MATCH_ANY(chunks, $[section] == "index")
```

エンティティ A とエンティティ B はどちらも、`section` が `"index"` に設定された要素が少なくとも 1つあるため一致します。

空の StructArray に対しては、`MATCH_ANY` は `false` を返します。

### MATCH_ALL\{#matchall}

`MATCH_ALL` は、StructArray 内のすべての要素が述語を満たす場合に `true` と評価されます。

```text
MATCH_ALL(chunks, $[has_code] == true)
```

示されているすべての要素で `has_code` が `true` に設定されているため、エンティティ A とエンティティ B の両方が一致します。

空の StructArray に対しては、`MATCH_ALL` は `true` を返します。

### MATCH_LEAST\{#matchleast}

`MATCH_LEAST` は、述語を満たす要素数が `threshold` 以上である場合に `true` と評価されます。

```text
MATCH_LEAST(chunks, $[quality_score] > 0.9, threshold=2)
```

エンティティ B のみが一致します。エンティティ A には条件を満たす要素が 0 個、エンティティ B には 3 個あります。

`MATCH_LEAST` では、`threshold` は正の整数である必要があります。

### MATCH_MOST\{#matchmost}

`MATCH_MOST` は、述語を満たす要素数が `threshold` 以下である場合に `true` と評価されます。

```text
MATCH_MOST(chunks, $[has_code] == true, threshold=1)
```

どちらのエンティティも一致しません。エンティティ A には条件を満たす要素が 4 個、エンティティ B には 3 個あります。

`MATCH_MOST` では、`threshold` は 0 または正の整数にできます。

### MATCH_EXACT\{#matchexact}

`MATCH_EXACT` は、述語を満たす要素数が `threshold` と正確に等しい場合に `true` と評価されます。

```text
MATCH_EXACT(chunks, $[section] == "filter", threshold=1)
```

どちらのエンティティにも `section` が `"filter"` に設定された要素がないため、一致しません。

`MATCH_EXACT` では、`threshold` は 0 または正の整数にできます。

## StructArray パスに対する行レベル述語\{#row-level-predicates-on-structarray-paths}

`element_filter` と `MATCH_*` に加えて、通常のフィルター式から StructArray フィールドまたはそのスカラーサブフィールドの 1つを直接参照できます。これらの述語はエンティティレベルで評価され、要素オフセットを返しません。

### サブフィールドアクセス\{#subfield-access}

#### 位置による Struct 要素へのアクセス\{#access-a-struct-element-by-position}

`structArrayField[index][subfield]` を使用して、0 から始まる位置にある Struct 要素の 1つのスカラーサブフィールドを参照します。位置を先に書き、その後にサブフィールド名を記述します。逆順のパス `chunks[quality_score][0] > 0.8` は無効です。

たとえば、最初の要素の品質スコアをテストします。

```text
chunks[0][quality_score] > 0.8
```

この式に一致するのはエンティティ B のみです。

```text
# The first chunk belongs to the "index" section.
chunks[0][section] == "index"

# The second chunk has a high quality score.
chunks[1][quality_score] > 0.9

# The first chunk is on page 1, 2, or 3.
chunks[0][page] in [1, 2, 3]

# Chained range on a positional path.
0.8 < chunks[0][quality_score] < 0.95
```

エンティティ A とエンティティ B では、最初の section 述語は両方のエンティティに一致し、2 番目のスコア述語はエンティティ B のみに一致し、厳密なスコア範囲はどちらにも一致しません。`page` 述語は一般的な例であり、サンプルデータには `page` が定義されていません。

位置指定パスでは、スカラーサブフィールドに対する比較、`in`、`not in`、および連鎖範囲述語がサポートされます。エンティティの StructArray フィールドにその位置の要素がない場合、そのエンティティは一致しません。

### ARRAY 演算子\{#array-operators}

#### Struct 要素をカウントする\{#count-struct-elements}

`array_length(structArrayField)` を使用して、エンティティ内の Struct 要素数でフィルタリングします。`array_length(chunks[section])` など、サブフィールドパスに対する `array_length` は、各サブフィールドが Struct 要素ごとに 1つの値を保持するため、同じ数を返します。

```text
# Articles with at least three chunks.
array_length(chunks) >= 3

# Articles with exactly one chunk.
array_length(chunks) == 1
```

親フィールドのカウント述語では、`>= 3` の場合は両方のエンティティが一致し、`== 1` の場合はどちらも一致しません。サブフィールドパスで値をカウントすることもできます。

```text
ARRAY_LENGTH(chunks[quality_score]) == 3
```

`quality_score` サブフィールドに 3つの値があるため、エンティティ B のみが一致します。

#### 要素間でのサブフィールド値のテスト\{#test-subfield-values-across-elements}

たとえば、いずれかの品質スコアが `0.74` に等しいかどうかをテストします。

```text
ARRAY_CONTAINS(chunks[quality_score], 0.74)
```

一致するのはエンティティ A のみです。

スカラーサブフィールドパスで `array_contains`、`array_contains_any`、または `array_contains_all` を使用して、エンティティ内のすべての Struct 要素にわたってそのサブフィールドの値をテストします。各サブフィールドパスは個別に評価されるため、異なるサブフィールドに対する条件は、異なる Struct 要素によって満たされる可能性があります。

```text
# At least one chunk belongs to the "index" section.
array_contains(chunks[section], "index")

# At least one chunk belongs to the "index" or the "search" section.
array_contains_any(chunks[section], ["index", "search"])

# The chunks cover both the "index" and the "search" sections,
# not necessarily in the same chunk.
array_contains_all(chunks[section], ["index", "search"])
```

サンプルデータでは、`array_contains` 式と `array_contains_any` 式は両方のエンティティに一致します。`array_contains_all` 式は、どちらのエンティティにも `"search"` セクションがないため、どちらにも一致しません。これらの例は、異なるサブフィールド上の条件が異なる要素によって満たされることを示すものではありません。

`array_contains(chunks[section], "index")` は、`MATCH_ANY(chunks, $[section] == "index")` と同じエンティティを選択します。複数の条件を同じ Struct 要素に対して満たす必要がある場合は、`MATCH_*` または `element_filter` を使用してください。`$[...]` 述語は要素ごとに評価されるためです。

### null 許容の StructArray フィールドが null かどうかのテスト\{#test-whether-a-nullable-structarray-field-is-null}

null 許容の StructArray フィールドで `IS NULL` または `IS NOT NULL` を使用して、フィールド値全体をテストします。NULL は StructArray フィールド全体に適用されるため、これらの述語はフィールド名のみを受け入れ、サブフィールドパスは受け入れません。

```text
# Entities that have no chunks value.
chunks is null

# Entities that have a chunks value.
chunks is not null
```

適用可能性については、[null 許容と動的スキーマの制限](./struct-array-limits#nullable-and-dynamic-schema-limits) を参照してください。エンティティ A とエンティティ B はどちらも NULL 以外の StructArray 値を持っています。

## サポートされる述語\{#supported-predicates}

`$[...]` 構文は、現在の Struct 要素のスカラー値を表します。述語のサポートは、スカラーサブフィールドの型によって異なります。

| サブフィールド型 | 要素レベル述語のサポート |
| --- | --- |
| `BOOL` | `$[has_code] == true` や `!($[has_code] == true)` のようなスカラー述語。`$[has_code]` のような裸の boolean 式は避けてください。 |
| `INT8`, `INT16`, `INT32`, `INT64` | 比較、連鎖範囲、`in`、`not in`、`+`、`-`、`*`、`/`、`%` を使った算術式の後に比較を続ける形式、および論理結合。 |
| `FLOAT`, `DOUBLE` | 比較、連鎖範囲、`in`、`not in`、`+`、`-`、`*`、`/` を使った算術式の後に比較を続ける形式、および論理結合。浮動小数点サブフィールドでは `%` 演算子はサポートされません。 |
| `VARCHAR` | 文字列比較、連鎖範囲、`in`、`not in`、`like`、`=~`、`!~`、および論理結合。 |
| ベクトルサブフィールド | `$[...]` スカラー述語の入力としてはサポートされません。代わりに、EmbeddingList 検索または要素レベルベクトル検索を通じてベクトルサブフィールドを使用してください。 |

`&&`、`||`、`!` などの論理演算子は述語式に適用されます。たとえば、`!$[has_code]` ではなく `!($[has_code] == true)` と記述してください。

## サポートされない述語\{#unsupported-predicates}

要素レベルの `$[...]` 述語は次をサポートしません。

- `text_match(field, "...")` や `phrase_match(field, "...")` などのテキスト一致関数。

- JSON path 構文、JSON path に対する `exists`、または `json_contains`、`json_contains_all`、`json_contains_any` などの JSON 関数。

- `$[subfield]` に対する `array_contains`、`array_contains_all`、`array_contains_any`、`array_length` などの配列コンテナ関数。代わりに、行レベル述語では `chunks[section]` などのサブフィールドパスでこれらの関数を使用してください。

- `$[subfield] is null` または `$[subfield] is not null`。

- Geometry / GIS 関数。

- Timestamptz 式。

- `random_sample(...)`。

- フィールドレベルベクトル述語。

- 特定の関数シグネチャと実行パスが StructArray 要素レベル述語を明示的にサポートしている場合を除き、汎用フィルター関数呼び出し。

## 構文ルール\{#syntax-rules}

次の構文ルールに従ってください。

- `MATCH_*` 演算子名は大文字小文字を区別しません。

- `$[subfield]` は `element_filter` または `MATCH_*` 述語の内部でのみ使用してください。たとえば、`array_length($[section])` は拒否されます。

- `$[subfield]` を JSON path、配列コンテナ、またはベクトルフィールド参照として使用しないでください。

- 別の StructArray 演算子の内部に `element_filter` や `MATCH_*` をネストしないでください。

- `MATCH_LEAST`、`MATCH_MOST`、`MATCH_EXACT` では名前付きの `threshold=N` を使用してください。

- 位置指定パスでは、サブフィールド名の前に要素位置を記述します。`chunks[0][section]` と記述し、`chunks[section][0]` とは記述しません。

- `IS NULL` と `IS NOT NULL` は、`chunks is null` など StructArray フィールド全体にのみ使用してください。`chunks[section]` などのサブフィールドパスや `$[subfield]` には使用しないでください。

- 空の StructArray に対する `MATCH_ANY` は `false` を返します。

- 空の StructArray に対する `MATCH_ALL` は `true` を返します。

## 参考情報\{#see-also}

関連するガイダンスについては、次を参照してください。

- [StructArray を使用したフィルター付き検索](./filtered-search-with-struct-arrays)

- [StructArray を使用した基本ベクトル検索](./search-with-struct-array)

- [StructArray フィールドのインデックス作成](./index-struct-array)

- [StructArray の制限](./struct-array-limits)
